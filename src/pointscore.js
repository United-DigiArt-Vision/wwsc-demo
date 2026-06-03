/**
 * WWSC M3 — Isolated Pointscore Scoring Engine.
 *
 * Per Balerion's 2026-06-03 directive + the forward-build guardrail:
 *  - This module READS already-accepted race result data (heat_lane.place /
 *    manual_place for individual races; relay_team.place for team races) and
 *    WRITES only to the `pointscore_entry` table.
 *  - It NEVER recomputes variance, net_time, is_break, place/ranking, heat
 *    generation, relay generation, or time_history. Those accepted M1/M2
 *    flows are protected.
 *  - The points-per-place rule is a WORKING ASSUMPTION derived from
 *    bryan-excel-original.xlsm (see docs/evidence/m3-pointscore/
 *    POINTSCORE-RULE-SOURCE-2026-06-03.md). It is centralized in
 *    POINTSCORE_RULES below and fully adjustable when Bryan confirms the
 *    Constitution — no accepted logic changes when the numbers change.
 *
 * Isolation switch: set WWSC_POINTSCORE_DISABLED=1 to make writeEventPointscore
 * a no-op. The isolation regression proof finalizes the same fixture with the
 * flag on and off and asserts byte-identical time_history / variance /
 * is_break / breaker / ranking output.
 */

// ── Centralized, adjustable rule config (WORKING ASSUMPTION) ─────────
// Source: Excel pointscore sheets show individual races scored 5/4/3/2 by
// place (1st/2nd/3rd/other finisher) and relay/team races scored 3/2/1.
// Change ONLY these numbers (or add race types) to adopt a confirmed
// Constitution; nothing else in the app depends on the literals.
const POINTSCORE_RULES = {
  // Working-assumption metadata surfaced in the UI/rule banner.
  source: 'bryan-excel-original.xlsm pointscore sheets (working assumption, not confirmed Constitution)',
  version: '2026-06-03-working',
  categories: {
    individual: {
      label: 'Individual race (place-based 5/4/3/2)',
      raceTypes: ['25m', '50m', '75m', 'backstroke', 'breaststroke', 'butterfly'],
      pointsByPlace: { 1: 5, 2: 4, 3: 3 },
      finisherPoints: 2,   // any other swimmer who recorded a finish time
      nonFinisherPoints: 0 // no finish time / absent → no pointscore row
    },
    relay: {
      label: 'Relay / team race (place-based 3/2/1)',
      raceTypes: ['25m_relay', 'medley_relay', '25m_brace', '50m_brace', 'pogo'],
      pointsByPlace: { 1: 3, 2: 2, 3: 1 },
      finisherPoints: 0,
      nonFinisherPoints: 0
    }
  }
};

// Resolve a race_type to its rule category. Unknown types default to
// individual (defensive; logged by callers if needed).
function categoryForRaceType(raceType) {
  for (const [key, cat] of Object.entries(POINTSCORE_RULES.categories)) {
    if (cat.raceTypes.includes(raceType)) return key;
  }
  return 'individual';
}

// Points for a place within a category. place may be null (no place → not a
// podium finisher). Callers pass finished=true when a finish time exists.
function pointsForPlace(categoryKey, place, finished) {
  const cat = POINTSCORE_RULES.categories[categoryKey];
  if (!cat) return 0;
  if (place != null && cat.pointsByPlace[place] != null) return cat.pointsByPlace[place];
  if (finished) return cat.finisherPoints;
  return cat.nonFinisherPoints;
}

// Is pointscore writing enabled? The isolation proof flips this off.
function isPointscoreEnabled() {
  return process.env.WWSC_POINTSCORE_DISABLED !== '1';
}

/**
 * Compute (but do not persist) the pointscore rows for one event.
 * Returns [{ event_race_id, member_id, points, race_type, place, basis }].
 * Reads accepted data only.
 */
function computeEventPointscoreRows(db, eventId) {
  const rows = [];
  const races = db.prepare('SELECT id, race_type FROM event_race WHERE event_id = ?').all(eventId);

  for (const race of races) {
    const categoryKey = categoryForRaceType(race.race_type);
    const cat = POINTSCORE_RULES.categories[categoryKey];

    if (cat.raceTypes.includes(race.race_type) && categoryKey === 'individual') {
      // Individual: per-heat lanes. place = COALESCE(manual_place, place).
      const lanes = db.prepare(`
        SELECT hl.member_id, hl.finish_time, hl.place, hl.manual_place
        FROM heat_lane hl
        JOIN heat h ON hl.heat_id = h.id
        WHERE h.event_race_id = ?
      `).all(race.id);
      for (const lane of lanes) {
        const finished = lane.finish_time != null;
        if (!finished) continue; // no row for non-finishers
        const place = lane.manual_place != null ? lane.manual_place : lane.place;
        const points = pointsForPlace(categoryKey, place, finished);
        if (points > 0) {
          rows.push({ event_race_id: race.id, member_id: lane.member_id, points, race_type: race.race_type, place, basis: 'individual-place' });
        }
      }
    } else {
      // Relay / team: each team's members all earn the team's place points.
      const teams = db.prepare(`
        SELECT id, place, total_time FROM relay_team WHERE event_race_id = ?
      `).all(race.id);
      for (const team of teams) {
        const finished = team.total_time != null;
        const points = pointsForPlace('relay', team.place, finished);
        if (points <= 0) continue;
        const members = db.prepare('SELECT member_id FROM relay_team_member WHERE relay_team_id = ?').all(team.id);
        for (const m of members) {
          rows.push({ event_race_id: race.id, member_id: m.member_id, points, race_type: race.race_type, place: team.place, basis: 'relay-team-place' });
        }
      }
    }
  }
  return rows;
}

/**
 * Persist the pointscore for one event. Idempotent: deletes existing rows for
 * this event's races first, then inserts. Aggregates per (event_race, member)
 * so a swimmer who appears in multiple heats/teams of the same race gets the
 * summed points in a single row (respects the UNIQUE(event_race_id, member_id)
 * constraint). Pure-additive: touches ONLY pointscore_entry.
 *
 * IMPORTANT: call this INSIDE the caller's finalize transaction, AFTER the
 * accepted time_history write, so it shares atomicity but changes nothing else.
 */
function writeEventPointscore(db, eventId) {
  if (!isPointscoreEnabled()) return { written: 0, skipped: 'WWSC_POINTSCORE_DISABLED' };

  const races = db.prepare('SELECT id FROM event_race WHERE event_id = ?').all(eventId);
  const raceIds = races.map(r => r.id);
  if (raceIds.length === 0) return { written: 0 };

  // Idempotency: clear prior pointscore for this event's races.
  const placeholders = raceIds.map(() => '?').join(',');
  db.prepare(`DELETE FROM pointscore_entry WHERE event_race_id IN (${placeholders})`).run(...raceIds);

  const computed = computeEventPointscoreRows(db, eventId);

  // Aggregate per (event_race_id, member_id) to honor the UNIQUE constraint.
  const agg = new Map();
  for (const r of computed) {
    const key = r.event_race_id + ':' + r.member_id;
    agg.set(key, (agg.get(key) || 0) + r.points);
  }

  const ins = db.prepare('INSERT INTO pointscore_entry (event_race_id, member_id, points) VALUES (?, ?, ?)');
  let written = 0;
  for (const [key, points] of agg.entries()) {
    const [erid, mid] = key.split(':').map(Number);
    ins.run(erid, mid, points);
    written++;
  }
  return { written };
}

module.exports = {
  POINTSCORE_RULES,
  categoryForRaceType,
  pointsForPlace,
  isPointscoreEnabled,
  computeEventPointscoreRows,
  writeEventPointscore
};
