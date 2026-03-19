/**
 * WWSC Swimming Event Management — Express Server
 * Single-admin local app, no auth needed.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { db, createBackup } = require('./db');

const { seedIfEmpty } = require('./seed');
seedIfEmpty();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ════════════════════════════════════════════════════════
//  MEMBERS API
// ════════════════════════════════════════════════════════

app.get('/api/members', (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM member ORDER BY name').all();
    res.json(members);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/members/:id', (req, res) => {
  try {
    const m = db.prepare('SELECT * FROM member WHERE id = ?').get(req.params.id);
    if (!m) return res.status(404).json({ error: 'Member not found' });
    res.json(m);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/members', (req, res) => {
  try {
    const { name, time_25m, time_50m, time_75m, time_backstroke, time_breaststroke, time_butterfly } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const result = db.prepare(`
      INSERT INTO member (name, joined_date, time_25m, time_50m, time_75m, time_backstroke, time_breaststroke, time_butterfly)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name.trim(), new Date().toISOString().slice(0, 10),
      time_25m ?? null, time_50m ?? null, time_75m ?? null,
      time_backstroke ?? null, time_breaststroke ?? null, time_butterfly ?? null);
    res.json({ id: result.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/members/:id', (req, res) => {
  try {
    const { name, is_active, time_25m, time_50m, time_75m, time_backstroke, time_breaststroke, time_butterfly } = req.body;
    db.prepare(`
      UPDATE member SET name=?, is_active=?, time_25m=?, time_50m=?, time_75m=?, time_backstroke=?, time_breaststroke=?, time_butterfly=?
      WHERE id=?
    `).run(name, is_active ?? 1,
      time_25m ?? null, time_50m ?? null, time_75m ?? null,
      time_backstroke ?? null, time_breaststroke ?? null, time_butterfly ?? null,
      req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fix #3: DELETE member (soft-delete)
app.delete('/api/members/:id', (req, res) => {
  try {
    const m = db.prepare('SELECT * FROM member WHERE id = ?').get(req.params.id);
    if (!m) return res.status(404).json({ error: 'Member not found' });
    db.prepare('UPDATE member SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CSV Import
app.post('/api/members/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const text = req.file.buffer.toString('utf-8');
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: 'No members found in CSV' });

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = header.indexOf('name');
    if (nameIdx < 0) return res.status(400).json({ error: 'Missing "Name" column' });

    const colMap = {
      '25m': 'time_25m', '50m': 'time_50m', '75m': 'time_75m',
      'backstroke': 'time_backstroke', 'breaststroke': 'time_breaststroke', 'butterfly': 'time_butterfly'
    };
    const cols = {};
    for (const [csv, db_col] of Object.entries(colMap)) {
      const idx = header.indexOf(csv);
      if (idx >= 0) cols[db_col] = idx;
    }

    const insert = db.prepare(`
      INSERT INTO member (name, joined_date, time_25m, time_50m, time_75m, time_backstroke, time_breaststroke, time_butterfly)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    const errors = [];
    const insertAll = db.transaction(() => {
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        const name = parts[nameIdx];
        if (!name) { errors.push(`Row ${i + 1}: empty name`); continue; }

        const times = {};
        for (const [db_col, idx] of Object.entries(cols)) {
          const val = parts[idx];
          if (val === '' || val === undefined) { times[db_col] = null; continue; }
          const num = parseInt(val, 10);
          if (isNaN(num) || num < 0) { errors.push(`Row ${i + 1}: invalid time "${val}" for ${db_col}`); return; }
          times[db_col] = num;
        }

        insert.run(name, new Date().toISOString().slice(0, 10),
          times.time_25m ?? null, times.time_50m ?? null, times.time_75m ?? null,
          times.time_backstroke ?? null, times.time_breaststroke ?? null, times.time_butterfly ?? null);
        imported++;
      }
    });

    insertAll();
    res.json({ imported, errors });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════
//  EVENTS API
// ════════════════════════════════════════════════════════

// Helper: check if event is locked
function isEventLocked(eventId) {
  const ev = db.prepare('SELECT status FROM event WHERE id = ?').get(eventId);
  return ev && ev.status === 'locked';
}

// List all events with attendance/race counts (for calendar screen)
app.get('/api/events', (req, res) => {
  try {
    const events = db.prepare(`
      SELECT e.*,
        (SELECT COUNT(*) FROM attendance a WHERE a.event_id = e.id AND a.present = 1) as present_count,
        (SELECT COUNT(*) FROM event_race er WHERE er.event_id = e.id) as race_count
      FROM event e ORDER BY e.date DESC
    `).all();
    res.json(events);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/events/current', (req, res) => {
  try {
    const ev = db.prepare("SELECT * FROM event WHERE status != 'completed' ORDER BY id DESC LIMIT 1").get();
    res.json(ev || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/events/:id', (req, res) => {
  try {
    const ev = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.id);
    res.json(ev || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/events', (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Date required' });
    const result = db.prepare(`INSERT INTO event (date, status, created_at) VALUES (?, 'setup', ?)`)
      .run(date, new Date().toISOString());
    const members = db.prepare('SELECT id FROM member WHERE is_active = 1').all();
    const ins = db.prepare('INSERT INTO attendance (event_id, member_id, present) VALUES (?, ?, 0)');
    const batch = db.transaction(() => { members.forEach(m => ins.run(result.lastInsertRowid, m.id)); });
    batch();
    res.json({ id: result.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fix #1: Lock/Unlock event
app.put('/api/events/:id/lock', (req, res) => {
  try {
    const ev = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    db.prepare("UPDATE event SET status = 'locked' WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/events/:id/unlock', (req, res) => {
  try {
    const ev = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    db.prepare("UPDATE event SET status = 'setup' WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Weekly Reset — Fix #6: auto-create new event
app.post('/api/events/reset', (req, res) => {
  try {
    const backupPath = createBackup();
    db.prepare("UPDATE event SET status = 'completed' WHERE status != 'completed'").run();
    // Auto-create new event with today's date
    const today = new Date().toISOString().slice(0, 10);
    const result = db.prepare("INSERT INTO event (date, status, created_at) VALUES (?, 'setup', ?)").run(today, new Date().toISOString());
    // Initialize attendance for all active members
    const members = db.prepare('SELECT id FROM member WHERE is_active = 1').all();
    const ins = db.prepare('INSERT INTO attendance (event_id, member_id, present) VALUES (?, ?, 0)');
    const batch = db.transaction(() => { members.forEach(m => ins.run(result.lastInsertRowid, m.id)); });
    batch();
    res.json({ ok: true, backup: backupPath, newEventId: Number(result.lastInsertRowid) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════
//  ATTENDANCE API
// ════════════════════════════════════════════════════════

app.get('/api/events/:eventId/attendance', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT a.*, m.name, m.is_active FROM attendance a
      JOIN member m ON a.member_id = m.id
      WHERE a.event_id = ? AND m.is_active = 1
      ORDER BY m.name
    `).all(req.params.eventId);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/events/:eventId/attendance', (req, res) => {
  try {
    if (isEventLocked(req.params.eventId)) return res.status(403).json({ error: 'Event is locked' });
    const { attendees } = req.body;
    if (!Array.isArray(attendees)) return res.status(400).json({ error: 'attendees array required' });
    // Fix #5: validate minimum attendees
    const presentCount = attendees.filter(a => a.present).length;
    if (presentCount < 3) return res.status(400).json({ error: 'Need at least 3 swimmers' });
    const stmt = db.prepare('UPDATE attendance SET present = ? WHERE event_id = ? AND member_id = ?');
    const batch = db.transaction(() => {
      attendees.forEach(a => stmt.run(a.present ? 1 : 0, req.params.eventId, a.member_id));
    });
    batch();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  EVENT RACES API
// ════════════════════════════════════════════════════════

app.get('/api/events/:eventId/races', (req, res) => {
  try {
    const races = db.prepare('SELECT * FROM event_race WHERE event_id = ?').all(req.params.eventId);
    res.json(races);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/events/:eventId/races', (req, res) => {
  try {
    if (isEventLocked(req.params.eventId)) return res.status(403).json({ error: 'Event is locked' });
    const { race_types } = req.body;
    if (!Array.isArray(race_types)) return res.status(400).json({ error: 'race_types array required' });
    // Fix #5: validate at least one race
    if (race_types.length === 0) return res.status(400).json({ error: 'Select at least one race type' });
    const eventId = req.params.eventId;
    // Fix #3: delete heats before races to avoid FK constraint
    const races = db.prepare('SELECT id FROM event_race WHERE event_id = ?').all(eventId);
    const delLanes = db.prepare('DELETE FROM heat_lane WHERE heat_id IN (SELECT id FROM heat WHERE event_race_id = ?)');
    const delHeats = db.prepare('DELETE FROM heat WHERE event_race_id = ?');
    const del = db.prepare('DELETE FROM event_race WHERE event_id = ?');
    const ins = db.prepare('INSERT INTO event_race (event_id, race_type) VALUES (?, ?)');
    const batch = db.transaction(() => {
      races.forEach(r => { delLanes.run(r.id); delHeats.run(r.id); });
      del.run(eventId);
      race_types.forEach(rt => ins.run(eventId, rt));
    });
    batch();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  HEAT BUILDER API
// ════════════════════════════════════════════════════════

// Map race_type to member time column
function timeColumn(raceType) {
  const map = {
    '25m': 'time_25m', '50m': 'time_50m', '75m': 'time_75m',
    'backstroke': 'time_backstroke', 'breaststroke': 'time_breaststroke', 'butterfly': 'time_butterfly'
  };
  return map[raceType] || null;
}

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Build heats from swimmers array (each has {id, name, handicap_time})
const BASE_OFFSET = 2; // Bryan's Excel: slowest swimmer starts at +2s, not 0s

function buildHeats(swimmers) {
  const MAX_PER_HEAT = 4;
  const MIN_PER_HEAT = 3;
  const MAX_HEATS = 10;

  if (swimmers.length < MIN_PER_HEAT) return [];

  shuffle(swimmers);

  // Fix #2: correct algorithm — ceil(count/4) heats, distribute evenly
  const numHeats = Math.min(Math.ceil(swimmers.length / MAX_PER_HEAT), MAX_HEATS);
  const heats = Array.from({ length: numHeats }, () => []);

  // Distribute swimmers round-robin for even distribution
  swimmers.forEach((s, i) => heats[i % numHeats].push(s));

  // Warning if any heat has < MIN_PER_HEAT (unavoidable for some counts like 5)
  const warning = heats.some(h => h.length < MIN_PER_HEAT)
    ? `Some heats have fewer than ${MIN_PER_HEAT} swimmers (unavoidable with ${swimmers.length} swimmers)`
    : null;

  // Calculate start delays per heat
  const result = heats.map((heat, i) => {
    const maxTime = Math.max(...heat.map(s => s.handicap_time));
    return {
      heat_number: i + 1,
      lanes: heat.map((s, li) => ({
        lane_number: li + 1,
        member_id: s.id,
        name: s.name,
        handicap_time: s.handicap_time,
        start_delay: (maxTime - s.handicap_time) + BASE_OFFSET
      }))
    };
  });
  return { heats: result, warning };
}

// Generate heats (preview — not saved yet)
app.get('/api/races/:raceId/generate-heats', (req, res) => {
  try {
  const race = db.prepare('SELECT * FROM event_race WHERE id = ?').get(req.params.raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  const col = timeColumn(race.race_type);
  if (!col) return res.status(400).json({ error: 'Invalid race type for heats' });

  // Get attending members with a PB for this stroke
  const swimmers = db.prepare(`
    SELECT m.id, m.name, m.${col} as handicap_time
    FROM member m
    JOIN attendance a ON a.member_id = m.id
    WHERE a.event_id = ? AND a.present = 1 AND m.${col} IS NOT NULL AND m.is_active = 1
  `).all(race.event_id);

  if (swimmers.length < 3) {
    return res.json({ heats: [], warning: 'Need at least 3 swimmers with PB times' });
  }

  const result = buildHeats(swimmers);
  res.json({ heats: result.heats, warning: result.warning });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Confirm heats (save to DB)
app.post('/api/races/:raceId/confirm-heats', (req, res) => {
  try {
  const { heats } = req.body;
  if (!Array.isArray(heats)) return res.status(400).json({ error: 'heats array required' });
  const raceId = req.params.raceId;

  // Clear existing heats for this race
  const existingHeats = db.prepare('SELECT id FROM heat WHERE event_race_id = ?').all(raceId);
  const delLanes = db.prepare('DELETE FROM heat_lane WHERE heat_id = ?');
  const delHeat = db.prepare('DELETE FROM heat WHERE event_race_id = ?');

  const insHeat = db.prepare('INSERT INTO heat (event_race_id, heat_number) VALUES (?, ?)');
  const insLane = db.prepare(`
    INSERT INTO heat_lane (heat_id, lane_number, member_id, handicap_time, start_delay)
    VALUES (?, ?, ?, ?, ?)
  `);

  const batch = db.transaction(() => {
    existingHeats.forEach(h => delLanes.run(h.id));
    delHeat.run(raceId);

    heats.forEach(heat => {
      const r = insHeat.run(raceId, heat.heat_number);
      heat.lanes.forEach(lane => {
        insLane.run(r.lastInsertRowid, lane.lane_number, lane.member_id, lane.handicap_time, lane.start_delay);
      });
    });
  });

  batch();
  db.prepare("UPDATE event_race SET status = 'heats_generated' WHERE id = ?").run(raceId);
  res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get saved heats for a race
app.get('/api/races/:raceId/heats', (req, res) => {
  try {
    const heats = db.prepare('SELECT * FROM heat WHERE event_race_id = ? ORDER BY heat_number').all(req.params.raceId);
    const getLanes = db.prepare(`
      SELECT hl.*, m.name FROM heat_lane hl
      JOIN member m ON hl.member_id = m.id
      WHERE hl.heat_id = ? ORDER BY hl.lane_number
    `);
    const result = heats.map(h => ({
      ...h,
      lanes: getLanes.all(h.id)
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ════════════════════════════════════════════════════════

app.get('/api/dashboard', (req, res) => {
  try {
    const currentEvent = db.prepare("SELECT * FROM event WHERE status != 'completed' ORDER BY id DESC LIMIT 1").get();
    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM member WHERE is_active = 1').get().count;
    let presentCount = 0;
    let racesCount = 0;
    if (currentEvent) {
      presentCount = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE event_id = ? AND present = 1').get(currentEvent.id).count;
      racesCount = db.prepare('SELECT COUNT(*) as count FROM event_race WHERE event_id = ?').get(currentEvent.id).count;
    }
    res.json({ currentEvent, totalMembers, presentCount, racesCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  RESULTS API
// ════════════════════════════════════════════════════════

// GET /api/events/:eventId/results — all races with heats and lanes
app.get('/api/events/:eventId/results', (req, res) => {
  try {
    const races = db.prepare('SELECT * FROM event_race WHERE event_id = ? ORDER BY id').all(req.params.eventId);
    const getHeats = db.prepare('SELECT * FROM heat WHERE event_race_id = ? ORDER BY heat_number');
    const getLanes = db.prepare(`
      SELECT hl.*, m.name,
        m.time_25m, m.time_50m, m.time_75m,
        m.time_backstroke, m.time_breaststroke, m.time_butterfly
      FROM heat_lane hl
      JOIN member m ON hl.member_id = m.id
      WHERE hl.heat_id = ? ORDER BY hl.lane_number
    `);

    const result = races.map(race => {
      const heats = getHeats.all(race.id);
      return {
        ...race,
        heats: heats.map(h => ({
          ...h,
          lanes: getLanes.all(h.id)
        }))
      };
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/heats/:heatId/lanes/:laneId/time — enter finish time
app.put('/api/heats/:heatId/lanes/:laneId/time', (req, res) => {
  try {
    const { finish_time } = req.body;
    if (finish_time == null || finish_time < 0) return res.status(400).json({ error: 'finish_time required (non-negative integer)' });

    const lane = db.prepare('SELECT * FROM heat_lane WHERE id = ? AND heat_id = ?').get(req.params.laneId, req.params.heatId);
    if (!lane) return res.status(404).json({ error: 'Lane not found' });

    const net_time = finish_time - lane.start_delay;
    const variance = net_time - lane.handicap_time;
    const is_break = (net_time < lane.handicap_time) ? 1 : 0;

    db.prepare(`
      UPDATE heat_lane SET finish_time = ?, net_time = ?, variance = ?, is_break = ?
      WHERE id = ?
    `).run(finish_time, net_time, variance, is_break, lane.id);

    res.json({ ok: true, finish_time, net_time, variance, is_break });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/races/:raceId/rank — rank swimmers by finish_time
app.post('/api/races/:raceId/rank', (req, res) => {
  try {
    const heats = db.prepare('SELECT id FROM heat WHERE event_race_id = ?').all(req.params.raceId);
    const getLanes = db.prepare('SELECT id, finish_time FROM heat_lane WHERE heat_id = ? ORDER BY CASE WHEN finish_time IS NULL THEN 1 ELSE 0 END, finish_time ASC');
    const setPlace = db.prepare('UPDATE heat_lane SET place = ? WHERE id = ?');

    const batch = db.transaction(() => {
      heats.forEach(h => {
        const lanes = getLanes.all(h.id);
        lanes.forEach((l, i) => setPlace.run(i + 1, l.id));
      });
    });
    batch();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/events/:eventId/finalize — finalize event, update PBs, write history
app.post('/api/events/:eventId/finalize', (req, res) => {
  try {
    const eventId = req.params.eventId;
    const ev = db.prepare('SELECT * FROM event WHERE id = ?').get(eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });

    const races = db.prepare('SELECT * FROM event_race WHERE event_id = ?').all(eventId);
    let breakersCount = 0;

    const finalize = db.transaction(() => {
      races.forEach(race => {
        const col = timeColumn(race.race_type);
        if (!col) return; // skip relay types etc.
        const stroke = race.race_type;
        const seasonCol = `season_start_${stroke}`;

        const heats = db.prepare('SELECT id FROM heat WHERE event_race_id = ?').all(race.id);
        heats.forEach(h => {
          const lanes = db.prepare(`
            SELECT hl.*, m.${col} as current_pb, m.${seasonCol} as season_start
            FROM heat_lane hl
            JOIN member m ON hl.member_id = m.id
            WHERE hl.heat_id = ?
          `).all(h.id);

          lanes.forEach(lane => {
            if (lane.finish_time == null) return; // no time entered

            const previousBest = lane.current_pb;

            // Write time_history for ALL swimmers
            db.prepare(`
              INSERT INTO time_history (member_id, event_id, stroke, time, is_break, previous_best)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(lane.member_id, eventId, stroke, lane.net_time, lane.is_break, previousBest);

            // Update PB if breaker
            if (lane.is_break && lane.net_time < (previousBest || Infinity)) {
              db.prepare(`UPDATE member SET ${col} = ? WHERE id = ?`).run(lane.net_time, lane.member_id);
              breakersCount++;
            }

            // Set season_start if not already set
            if (lane.season_start == null && previousBest != null) {
              db.prepare(`UPDATE member SET ${seasonCol} = ? WHERE id = ?`).run(previousBest, lane.member_id);
            }
          });
        });
      });

      // Set event status to finalized
      db.prepare("UPDATE event SET status = 'finalized' WHERE id = ?").run(eventId);
    });

    finalize();
    res.json({ ok: true, breakers_count: breakersCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/events/:eventId/breakers — list breakers for event
app.get('/api/events/:eventId/breakers', (req, res) => {
  try {
    const breakers = db.prepare(`
      SELECT th.*, m.name as member_name
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      WHERE th.event_id = ? AND th.is_break = 1
      ORDER BY th.stroke, m.name
    `).all(req.params.eventId);

    const result = breakers.map(b => ({
      member_name: b.member_name,
      stroke: b.stroke,
      old_pb: b.previous_best,
      new_pb: b.time,
      improvement: (b.previous_best || 0) - b.time
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/events/:eventId/complete — mark event as completed
app.post('/api/events/:eventId/complete', (req, res) => {
  try {
    const ev = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    db.prepare("UPDATE event SET status = 'completed' WHERE id = ?").run(req.params.eventId);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/events/:eventId/time-history — time history entries for event
app.get('/api/events/:eventId/time-history', (req, res) => {
  try {
    const entries = db.prepare(`
      SELECT th.*, m.name as member_name
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      WHERE th.event_id = ?
      ORDER BY th.stroke, m.name
    `).all(req.params.eventId);
    res.json(entries);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  TOGGLE ACTIVE (soft deactivation)
// ════════════════════════════════════════════════════════

app.patch('/api/members/:id/toggle-active', (req, res) => {
  try {
    const m = db.prepare('SELECT * FROM member WHERE id = ?').get(req.params.id);
    if (!m) return res.status(404).json({ error: 'Member not found' });
    const newStatus = m.is_active ? 0 : 1;
    db.prepare('UPDATE member SET is_active = ? WHERE id = ?').run(newStatus, req.params.id);
    res.json({ ok: true, is_active: newStatus });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  NEW WEEK (complete all + create fresh event)
// ════════════════════════════════════════════════════════

app.post('/api/events/new-week', (req, res) => {
  try {
    const backupPath = createBackup();
    // Complete all open events
    db.prepare("UPDATE event SET status = 'completed' WHERE status NOT IN ('completed')").run();
    // Create new event with today's date
    const today = new Date().toISOString().slice(0, 10);
    const result = db.prepare("INSERT INTO event (date, status, created_at) VALUES (?, 'setup', ?)").run(today, new Date().toISOString());
    const eventId = result.lastInsertRowid;
    // Initialize attendance for all active members
    const members = db.prepare('SELECT id FROM member WHERE is_active = 1').all();
    const ins = db.prepare('INSERT INTO attendance (event_id, member_id, present) VALUES (?, ?, 0)');
    const batch = db.transaction(() => { members.forEach(m => ins.run(eventId, m.id)); });
    batch();
    res.json({ ok: true, backup: backupPath, newEventId: Number(eventId) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  MOVE SWIMMER BETWEEN HEATS
// ════════════════════════════════════════════════════════

app.put('/api/races/:raceId/heats/move-swimmer', (req, res) => {
  try {
    const { member_id, from_heat, to_heat } = req.body;
    if (!member_id || from_heat == null || to_heat == null) {
      return res.status(400).json({ error: 'member_id, from_heat, to_heat required' });
    }
    const raceId = req.params.raceId;

    // Get heats for this race
    const heats = db.prepare('SELECT * FROM heat WHERE event_race_id = ? ORDER BY heat_number').all(raceId);
    const fromHeat = heats.find(h => h.heat_number === from_heat);
    const toHeat = heats.find(h => h.heat_number === to_heat);
    if (!fromHeat || !toHeat) return res.status(404).json({ error: 'Heat not found' });

    // Validate to_heat doesn't exceed 4 swimmers
    const toLanes = db.prepare('SELECT * FROM heat_lane WHERE heat_id = ?').all(toHeat.id);
    if (toLanes.length >= 4) return res.status(400).json({ error: 'Target heat already has 4 swimmers' });

    // Find the lane to move
    const lane = db.prepare('SELECT * FROM heat_lane WHERE heat_id = ? AND member_id = ?').get(fromHeat.id, member_id);
    if (!lane) return res.status(404).json({ error: 'Swimmer not found in source heat' });

    // Move swimmer
    const newLaneNumber = toLanes.length + 1;
    db.prepare('UPDATE heat_lane SET heat_id = ?, lane_number = ? WHERE id = ?').run(toHeat.id, newLaneNumber, lane.id);

    // Re-number lanes in source heat
    const remainingLanes = db.prepare('SELECT id FROM heat_lane WHERE heat_id = ? ORDER BY lane_number').all(fromHeat.id);
    const updateLane = db.prepare('UPDATE heat_lane SET lane_number = ? WHERE id = ?');
    const batch = db.transaction(() => {
      remainingLanes.forEach((l, i) => updateLane.run(i + 1, l.id));
    });
    batch();

    // Recalculate start_delays for both heats
    const recalcHeat = (heatId) => {
      const lanes = db.prepare('SELECT * FROM heat_lane WHERE heat_id = ?').all(heatId);
      if (lanes.length === 0) return;
      const maxTime = Math.max(...lanes.map(l => l.handicap_time));
      const upd = db.prepare('UPDATE heat_lane SET start_delay = ? WHERE id = ?');
      const t = db.transaction(() => {
        lanes.forEach(l => upd.run((maxTime - l.handicap_time) + BASE_OFFSET, l.id));
      });
      t();
    };
    recalcHeat(fromHeat.id);
    recalcHeat(toHeat.id);

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  VERSION API
// ════════════════════════════════════════════════════════

app.get('/api/version', (req, res) => {
  res.json({ version: '1.0.0', name: 'WWSC Swimming App' });
});

// ════════════════════════════════════════════════════════
//  BACKUP API
// ════════════════════════════════════════════════════════

app.post('/api/backup', (req, res) => {
  try {
    const p = createBackup();
    res.json({ ok: true, path: p });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════
//  START SERVER
// ════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`🏊 WWSC Swimming App running at http://localhost:${PORT}`);
});
