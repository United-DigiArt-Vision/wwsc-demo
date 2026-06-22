/**
 * WWSC Swimming Event Management — Express Server
 * Single-admin local app, no auth needed.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, createBackup, DB_PATH } = require('./db');

const { seedIfEmpty, migrateToWholeSeconds } = require('./seed');
// M3 isolated pointscore engine (reads accepted race data, writes only
// pointscore_entry; never touches variance/breaker/ranking/time_history).
const pointscore = require('./pointscore');
seedIfEmpty();
migrateToWholeSeconds();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;

app.use(express.json());
// v2.7.2: Prevent browser caching of JS/CSS — ensures testers always get latest code
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Version endpoint (SSOT: package.json + server start timestamp)
const pkg = require('../package.json');
const BUILD_TIME = new Date().toISOString();
app.get('/api/version', (req, res) => res.json({ version: pkg.version, build: BUILD_TIME }));

// ════════════════════════════════════════════════════════
//  MEMBERS API
// ════════════════════════════════════════════════════════

app.get('/api/members', (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    let sql = 'SELECT * FROM member';
    if (filter === 'active') sql += ' WHERE is_active = 1';
    else if (filter === 'inactive') sql += ' WHERE is_active = 0';
    sql += ' ORDER BY name';
    const members = db.prepare(sql).all();
    res.json(members);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/members/csv — member roster export (R-M3-07 optional member roster).
// Defined BEFORE /api/members/:id so the literal "csv" is not matched as an :id.
// Read-only; touches no accepted logic. PB times are whole seconds per CLAUDE.md.
app.get('/api/members/csv', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, name, is_active, joined_date, time_25m, time_50m, time_75m,
             time_backstroke, time_breaststroke, time_butterfly
      FROM member ORDER BY name ASC
    `).all();
    sendCsv(res, 'wwsc-members-v' + pkg.version + '.csv',
      ['id', 'name', 'is_active', 'joined_date', 'pb_25m_s', 'pb_50m_s', 'pb_75m_s', 'pb_backstroke_s', 'pb_breaststroke_s', 'pb_butterfly_s'],
      rows.map(r => [r.id, r.name, r.is_active, r.joined_date || '', r.time_25m, r.time_50m, r.time_75m, r.time_backstroke, r.time_breaststroke, r.time_butterfly]));
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

    // v2.12.0 (Bryan 2026-06-10 report 3): PBs are maintained manually in the
    // Members screen. Every changed stroke time is logged to pb_change_log so
    // the Breakers report can count how often a time "came down" this season.
    const before = db.prepare('SELECT * FROM member WHERE id = ?').get(req.params.id);
    if (!before) return res.status(404).json({ error: 'Member not found' });
    const incoming = {
      time_25m: time_25m ?? null, time_50m: time_50m ?? null, time_75m: time_75m ?? null,
      time_backstroke: time_backstroke ?? null, time_breaststroke: time_breaststroke ?? null,
      time_butterfly: time_butterfly ?? null
    };
    const logIns = db.prepare('INSERT INTO pb_change_log (member_id, stroke, old_value, new_value, changed_at) VALUES (?, ?, ?, ?, ?)');
    const now = new Date().toISOString();
    const update = db.transaction(() => {
      for (const [col, newVal] of Object.entries(incoming)) {
        const oldVal = before[col];
        if (oldVal !== newVal && !(oldVal == null && newVal == null)) {
          logIns.run(req.params.id, col.replace('time_', ''), oldVal, newVal, now);
        }
      }
      db.prepare(`
        UPDATE member SET name=?, is_active=?, time_25m=?, time_50m=?, time_75m=?, time_backstroke=?, time_breaststroke=?, time_butterfly=?
        WHERE id=?
      `).run(name, is_active ?? 1,
        incoming.time_25m, incoming.time_50m, incoming.time_75m,
        incoming.time_backstroke, incoming.time_breaststroke, incoming.time_butterfly,
        req.params.id);
    });
    update();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// F12: DELETE member (permanent delete)
app.delete('/api/members/:id', (req, res) => {
  try {
    const m = db.prepare('SELECT * FROM member WHERE id = ?').get(req.params.id);
    if (!m) return res.status(404).json({ error: 'Member not found' });
    // Delete related data first
    db.prepare('DELETE FROM attendance WHERE member_id = ?').run(req.params.id);
    db.prepare('DELETE FROM time_history WHERE member_id = ?').run(req.params.id);
    db.prepare('DELETE FROM heat_lane WHERE member_id = ?').run(req.params.id);
    db.prepare('DELETE FROM relay_team_member WHERE member_id = ?').run(req.params.id);
    db.prepare('DELETE FROM pb_change_log WHERE member_id = ?').run(req.params.id);
    // v2.12.0: pointscore_entry references member too — without this the
    // delete fails with a FK violation once the member has scored points.
    db.prepare('DELETE FROM pointscore_entry WHERE member_id = ?').run(req.params.id);
    db.prepare('DELETE FROM member WHERE id = ?').run(req.params.id);
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
          const num = parseFloat(val);
          if (isNaN(num) || num < 0) { errors.push(`Row ${i + 1}: invalid time "${val}" for ${db_col}`); return; }
          // v2.6.0: PBs are whole seconds. Round any decimals.
          times[db_col] = Math.round(num);
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

function getBreakThresholdCsForRaceType(raceType) {
  // v2.8.12 Bryan clarification: 25m breaks count at >= 0.5s improvement.
  // Existing non-25m threshold remains >= 1.0s improvement unless explicitly changed.
  return raceType === '25m' ? -50 : -100;
}

function isBreakForRaceType(variance, raceType) {
  return variance != null && variance <= getBreakThresholdCsForRaceType(raceType);
}

// List all events with attendance/race counts (for calendar screen)
app.get('/api/events', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const includeArchived = req.query.archived === '1';
    const events = db.prepare(`
      SELECT e.*,
        (SELECT COUNT(*) FROM attendance a WHERE a.event_id = e.id AND a.present = 1) as present_count,
        (SELECT COUNT(*) FROM event_race er WHERE er.event_id = e.id) as race_count
      FROM event e
      WHERE e.date <= ? AND (e.archived = 0 OR e.archived IS NULL ${includeArchived ? 'OR e.archived = 1' : ''})
      ORDER BY e.date DESC
    `).all(today);
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

// Update event date
app.put('/api/events/:eventId/date', (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Date required' });
    db.prepare('UPDATE event SET date = ? WHERE id = ?').run(date, req.params.eventId);
    res.json({ ok: true });
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
//  EVENT CONFIG API
// ════════════════════════════════════════════════════════

app.get('/api/events/:eventId/config', (req, res) => {
  try {
    const ev = db.prepare('SELECT standard_event, special_event FROM event WHERE id = ?').get(req.params.eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json({ standard_event: ev.standard_event || 'ordinary_swim', special_event: ev.special_event || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/events/:eventId/config', (req, res) => {
  try {
    const { standard_event, special_event } = req.body;
    db.prepare('UPDATE event SET standard_event = ?, special_event = ? WHERE id = ?')
      .run(standard_event || 'ordinary_swim', special_event || null, req.params.eventId);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  ATTENDANCE API
// ════════════════════════════════════════════════════════

app.get('/api/events/:eventId/attendance', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT a.*, m.name, m.is_active,
        m.time_25m, m.time_50m, m.time_75m,
        m.time_backstroke, m.time_breaststroke, m.time_butterfly
      FROM attendance a
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
    const stmt = db.prepare('UPDATE attendance SET present = ?, special_event_entry = ? WHERE event_id = ? AND member_id = ?');
    const batch = db.transaction(() => {
      attendees.forEach(a => stmt.run(a.present ? 1 : 0, a.special_event_entry || null, req.params.eventId, a.member_id));
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
    const races = db.prepare(`
      SELECT er.*, 
        (SELECT COUNT(*) FROM heat h WHERE h.event_race_id = er.id) as heat_count
      FROM event_race er WHERE er.event_id = ?
    `).all(req.params.eventId);
    res.json(races);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/events/:eventId/races', (req, res) => {
  try {
    if (isEventLocked(req.params.eventId)) return res.status(403).json({ error: 'Event is locked' });
    const { race_types } = req.body;
    if (!Array.isArray(race_types)) return res.status(400).json({ error: 'race_types array required' });
    if (race_types.length === 0) return res.status(400).json({ error: 'Select at least one race type' });
    
    const eventId = req.params.eventId;

    // F32: We use a more aggressive cleanup here.
    // To avoid complex FK issues with deep nesting (relay_members -> relay_teams -> races),
    // we temporarily disable FK checks for this specific reset transaction.
    db.exec('PRAGMA foreign_keys = OFF');
    
    try {
      const batch = db.transaction(() => {
        // 1. Delete all results/heats/teams related to this event's races
        const raceIds = db.prepare('SELECT id FROM event_race WHERE event_id = ?').all(eventId).map(r => r.id);
        
        if (raceIds.length > 0) {
          const placeholders = raceIds.map(() => '?').join(',');
          
          // Delete in reverse order of dependency
          db.prepare(`DELETE FROM relay_team_member WHERE relay_team_id IN (SELECT id FROM relay_team WHERE event_race_id IN (${placeholders}))`).run(...raceIds);
          db.prepare(`DELETE FROM relay_team WHERE event_race_id IN (${placeholders})`).run(...raceIds);
          db.prepare(`DELETE FROM pointscore_entry WHERE event_race_id IN (${placeholders})`).run(...raceIds);
          db.prepare(`DELETE FROM heat_lane WHERE heat_id IN (SELECT id FROM heat WHERE event_race_id IN (${placeholders}))`).run(...raceIds);
          db.prepare(`DELETE FROM heat WHERE event_race_id IN (${placeholders})`).run(...raceIds);
        }
        
        // 2. Delete the races themselves
        db.prepare('DELETE FROM event_race WHERE event_id = ?').run(eventId);
        
        // 3. Insert new race types
        const insRace = db.prepare('INSERT INTO event_race (event_id, race_type) VALUES (?, ?)');
        race_types.forEach(rt => insRace.run(eventId, rt));
      });
      batch();
    } finally {
      db.exec('PRAGMA foreign_keys = ON');
    }
    
    res.json({ ok: true });
  } catch (e) {
    console.error('Update races error:', e);
    res.status(500).json({ error: e.message });
  }
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
const BASE_OFFSET = 2; // v2.6.0: Whole seconds offset (2.00s → 2s)

function buildHeats(swimmers, options = {}) {
  const MAX_PER_HEAT = 4;
  const MIN_PER_HEAT = 3;
  const MAX_HEATS = 10;
  const doShuffle = options.shuffle !== false;

  if (swimmers.length < MIN_PER_HEAT) return { heats: [], warning: `Need at least ${MIN_PER_HEAT} swimmers with PB times` };

  if (doShuffle) shuffle(swimmers);

  // T19j fix: Optimal heat distribution (maximize full 4-lane heats)
  // Example: 23 swimmers => 6 heats => 4,4,4,4,4,3
  const numHeats = Math.ceil(swimmers.length / MAX_PER_HEAT);
  const heats = Array.from({ length: numHeats }, () => []);
  const baseSize = Math.floor(swimmers.length / numHeats);
  const remainder = swimmers.length % numHeats;

  let currentSwimmer = 0;
  for (let i = 0; i < numHeats; i++) {
    const heatSize = baseSize + (i < remainder ? 1 : 0);
    for (let j = 0; j < heatSize; j++) {
      if (currentSwimmer < swimmers.length) {
        heats[i].push(swimmers[currentSwimmer]);
        currentSwimmer++;
      }
    }
  }

  // Warning if any heat has < MIN_PER_HEAT
  const warning = heats.some(h => h.length < MIN_PER_HEAT)
    ? `Some heats have fewer than ${MIN_PER_HEAT} swimmers (unavoidable with ${swimmers.length} swimmers)`
    : null;

  // Calculate start delays per heat
  // v2.6.0: PB times are stored as WHOLE SECONDS in DB (e.g. 16 = 16s).
  // Heat calculations use whole seconds: max_time, start_delay, handicap_time all whole seconds.
  // Finish times from stopwatch are CENTISECONDS (e.g. 1345 = 13.45s).
  // When computing net_time/variance in results, we convert PB to centiseconds (*100).
  const result = heats.map((heat, i) => {
    const rawMax = Math.max(...heat.map(s => s.handicap_time));
    const maxTime = rawMax + BASE_OFFSET; // +2s buffer per Bryan's VBA formula
    return {
      heat_number: i + 1,
      max_time: maxTime,
      lanes: heat.map((s, li) => ({
        lane_number: li + 1,
        member_id: s.id,
        name: s.name,
        handicap_time: s.handicap_time,
        start_delay: maxTime - s.handicap_time,
        max_time: maxTime
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

  // Get eligible swimmers — for special events, only those who opted in (Y or stroke name)
  const isSpecialEvent = ['backstroke','breaststroke','butterfly','75m','medley_relay'].includes(race.race_type);
  const specialFilter = isSpecialEvent
    ? `AND a.special_event_entry IS NOT NULL AND a.special_event_entry != 'N'`
    : '';
  const swimmers = db.prepare(`
    SELECT m.id, m.name, m.${col} as handicap_time
    FROM member m
    JOIN attendance a ON a.member_id = m.id
    WHERE a.event_id = ? AND a.present = 1 AND m.${col} IS NOT NULL AND m.is_active = 1 ${specialFilter}
  `).all(race.event_id);

  if (swimmers.length < 3) {
    return res.json({ heats: [], warning: 'Need at least 3 swimmers with PB times' });
  }

  let orderedSwimmers = swimmers;
  let useExistingGrouping = false;

  if (race.race_type === '50m') {
    const baseRace = db.prepare('SELECT id FROM event_race WHERE event_id = ? AND race_type = ?').get(race.event_id, '25m');
    if (baseRace) {
      const baseOrder = db.prepare(`
        SELECT hl.member_id
        FROM heat h
        JOIN heat_lane hl ON hl.heat_id = h.id
        WHERE h.event_race_id = ?
        ORDER BY h.heat_number, hl.lane_number
      `).all(baseRace.id);

      if (baseOrder.length > 0) {
        const orderIndex = new Map(baseOrder.map((row, idx) => [row.member_id, idx]));
        orderedSwimmers = swimmers.slice().sort((a, b) => {
          const ai = orderIndex.has(a.id) ? orderIndex.get(a.id) : Number.MAX_SAFE_INTEGER;
          const bi = orderIndex.has(b.id) ? orderIndex.get(b.id) : Number.MAX_SAFE_INTEGER;
          if (ai !== bi) return ai - bi;
          return a.name.localeCompare(b.name);
        });
        useExistingGrouping = true;
      }
    }
  }

  const result = buildHeats(orderedSwimmers, { shuffle: !useExistingGrouping });
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
    const result = heats.map(h => {
      const lanes = getLanes.all(h.id);
      const maxTime = lanes.length > 0 ? Math.max(...lanes.map(l => l.handicap_time)) + BASE_OFFSET : 0;
      return { ...h, max_time: maxTime, lanes };
    });
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
        heats: heats.map(h => {
          const lanes = getLanes.all(h.id);
          const maxTime = lanes.length > 0 ? Math.max(...lanes.map(l => l.handicap_time)) + BASE_OFFSET : 0;
          return { ...h, max_time: maxTime, lanes };
        })
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

    const lane = db.prepare(`
      SELECT hl.*, er.race_type
      FROM heat_lane hl
      JOIN heat h ON h.id = hl.heat_id
      JOIN event_race er ON er.id = h.event_race_id
      WHERE hl.id = ? AND hl.heat_id = ?
    `).get(req.params.laneId, req.params.heatId);
    if (!lane) return res.status(404).json({ error: 'Lane not found' });

    // v2.6.0: PB (handicap_time) and start_delay are in WHOLE SECONDS.
    // finish_time from stopwatch is in CENTISECONDS.
    // Convert whole seconds to centiseconds (*100) for math.
    const delayCs = lane.start_delay * 100; // whole seconds → centiseconds
    const pbCs = lane.handicap_time * 100;  // whole seconds → centiseconds
    const net_time = finish_time - delayCs;
    const variance = net_time - pbCs;
    const is_break = isBreakForRaceType(variance, lane.race_type) ? 1 : 0;

    db.prepare(`
      UPDATE heat_lane SET finish_time = ?, net_time = ?, variance = ?, is_break = ?
      WHERE id = ?
    `).run(finish_time, net_time, variance, is_break, lane.id);

    res.json({ ok: true, finish_time, net_time, variance, is_break });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/heat-lanes/:id/place — set manual place override
app.patch('/api/heat-lanes/:id/place', (req, res) => {
  try {
    const { manual_place } = req.body;
    if (manual_place != null && (manual_place < 1 || manual_place > 4)) {
      return res.status(400).json({ error: 'manual_place must be 1-4 or null' });
    }
    const lane = db.prepare('SELECT * FROM heat_lane WHERE id = ?').get(req.params.id);
    if (!lane) return res.status(404).json({ error: 'Lane not found' });
    db.prepare('UPDATE heat_lane SET manual_place = ? WHERE id = ?').run(manual_place ?? null, req.params.id);
    res.json({ ok: true });
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
        // v2.7.1: Equal finish_time → equal place (1,1,3 not 1,2,3)
        let currentPlace = 0;
        let prevFinish = null;
        lanes.forEach((l, i) => {
          if (l.finish_time == null) {
            setPlace.run(null, l.id);
          } else {
            if (prevFinish === null || l.finish_time !== prevFinish) {
              currentPlace = i + 1;
            }
            setPlace.run(currentPlace, l.id);
            prevFinish = l.finish_time;
          }
        });
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
      // v2.7.2: Clear existing time_history for this event to prevent duplicates on re-finalize
      db.prepare('DELETE FROM time_history WHERE event_id = ?').run(eventId);
      races.forEach(race => {
        const col = timeColumn(race.race_type);
        if (!col) return; // skip relay types — no PB updates, no time_history, no breakers
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
            // SSOT: Use is_break from heat_lane (already computed correctly when time was entered).
            // Store net_time as the swimmer's actual time (finish_time - start_delay).
            const swimTime = lane.net_time != null ? lane.net_time : lane.finish_time;

            // Write time_history for ALL swimmers
            db.prepare(`
              INSERT INTO time_history (member_id, event_id, stroke, time, is_break, previous_best)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(lane.member_id, eventId, stroke, swimTime, lane.is_break, previousBest);

            if (lane.is_break) {
              breakersCount++;
            }

            // Set season_start if not already set
            if (lane.season_start == null && previousBest != null) {
              db.prepare(`UPDATE member SET ${seasonCol} = ? WHERE id = ?`).run(previousBest, lane.member_id);
            }
          });
        });
      });

      // M3 (R-M3 pointscore): additive write of event-separated pointscore.
      // Runs INSIDE the same finalize transaction, AFTER the accepted
      // time_history write above. Reads only the accepted place values and
      // writes only pointscore_entry — does not alter any M1/M2 output.
      pointscore.writeEventPointscore(db, eventId);

      // Set event status to finalized
      db.prepare("UPDATE event SET status = 'finalized' WHERE id = ?").run(eventId);
    });

    finalize();
    res.json({ ok: true, breakers_count: breakersCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/events/:eventId/breakers — list breakers for event
// BRY-20: Only include STANDARD races (25m, 50m), NOT special events (75m, backstroke, etc.)
app.get('/api/events/:eventId/breakers', (req, res) => {
  try {
    // F5-fix: SSOT — is_break in time_history is the single source of truth.
    // No extra filtering needed; finalize already validates correctly.
    const breakers = db.prepare(`
      SELECT th.*, m.name as member_name
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      WHERE th.event_id = ? AND th.is_break = 1
      ORDER BY th.stroke, m.name
    `).all(req.params.eventId);

    // v2.6.0: previous_best is whole seconds, time is centiseconds
    // Convert old_pb to centiseconds for consistent display
    const result = breakers.map(b => ({
      member_name: b.member_name,
      stroke: b.stroke,
      old_pb: b.previous_best != null ? b.previous_best * 100 : null, // whole→cs
      new_time: b.time,
      improvement: b.previous_best != null ? (b.previous_best * 100) - b.time : null
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reports/breakers — list all breakers across events
app.get('/api/reports/breakers', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT th.*, m.name as member_name, e.date as event_date
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      JOIN event e ON th.event_id = e.id
      WHERE th.is_break = 1
      ORDER BY e.date DESC, th.stroke, m.name
    `).all();

    const result = rows.map(r => {
      const oldPbCs = r.previous_best != null ? r.previous_best * 100 : null;
      const improvement = oldPbCs != null ? oldPbCs - r.time : null;
      return {
        event_id: r.event_id,
        event_date: r.event_date,
        member_id: r.member_id,
        member_name: r.member_name,
        stroke: r.stroke,
        old_pb: oldPbCs,
        new_time: r.time,
        improvement,
        variance: improvement != null ? Math.abs(improvement) : null
      };
    });
    // Sort: date DESC, then strongest variance first, then name for deterministic tie-break
    result.sort((a, b) => {
      const dateCmp = (b.event_date || '').localeCompare(a.event_date || '');
      if (dateCmp !== 0) return dateCmp;
      const varA = a.variance ?? 0;
      const varB = b.variance ?? 0;
      if (varB !== varA) return varB - varA; // largest absolute variance first
      return (a.member_name || '').localeCompare(b.member_name || '');
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

function completedEventWhere(alias = 'e') {
  return `${alias}.status IN ('finalized','completed') AND (${alias}.archived = 0 OR ${alias}.archived IS NULL)`;
}

function categoryLabel(raceType) {
  const labels = {
    '25m': '25m',
    '50m': '50m',
    '75m': '75m',
    '25m_relay': 'relay',
    'medley_relay': 'medley relay',
    '25m_brace': '25m brace',
    '50m_brace': '50m brace',
    'breaststroke': 'breast / breaststroke',
    'backstroke': 'back / backstroke',
    'butterfly': 'butterfly',
    'pogo': 'pogo'
  };
  return labels[raceType] || raceType;
}

function getCompletedResultCoverageRows() {
  const rows = db.prepare(`
    SELECT e.id AS event_id, e.date AS event_date, er.id AS event_race_id, er.race_type,
      (
        SELECT COUNT(DISTINCT hl.member_id)
        FROM heat h
        JOIN heat_lane hl ON hl.heat_id = h.id
        WHERE h.event_race_id = er.id AND hl.net_time IS NOT NULL
      ) AS individual_results,
      (
        SELECT COUNT(DISTINCT rtm.member_id)
        FROM relay_team rt
        JOIN relay_team_member rtm ON rtm.relay_team_id = rt.id
        WHERE rt.event_race_id = er.id AND rt.total_time IS NOT NULL
      ) AS relay_members,
      (
        SELECT COUNT(*)
        FROM relay_team rt2
        WHERE rt2.event_race_id = er.id AND rt2.total_time IS NOT NULL
      ) AS relay_teams
    FROM event_race er
    JOIN event e ON e.id = er.event_id
    WHERE ${completedEventWhere('e')}
    ORDER BY er.race_type ASC, e.date ASC, er.id ASC
  `).all();
  return rows.map(r => ({
    event_id: r.event_id,
    event_date: r.event_date,
    event_race_id: r.event_race_id,
    race_type: r.race_type,
    category: categoryLabel(r.race_type),
    result_count: Number(r.individual_results || 0) + Number(r.relay_members || 0),
    team_count: Number(r.relay_teams || 0)
  }));
}

function getBreakCountReport() {
  const overall = db.prepare(`
    SELECT th.member_id, m.name AS member_name, COUNT(*) AS break_count
    FROM time_history th
    JOIN member m ON m.id = th.member_id
    JOIN event e ON e.id = th.event_id
    WHERE th.is_break = 1 AND ${completedEventWhere('e')}
    GROUP BY th.member_id, m.name
    ORDER BY break_count DESC, m.name ASC
  `).all();
  const byEvent = db.prepare(`
    SELECT e.id AS event_id, e.date AS event_date, th.stroke,
           th.member_id, m.name AS member_name, COUNT(*) AS break_count
    FROM time_history th
    JOIN member m ON m.id = th.member_id
    JOIN event e ON e.id = th.event_id
    WHERE th.is_break = 1 AND ${completedEventWhere('e')}
    GROUP BY e.id, e.date, th.stroke, th.member_id, m.name
    ORDER BY e.date ASC, e.id ASC, th.stroke ASC, break_count DESC, m.name ASC
  `).all();
  return {
    source: 'time_history.is_break from finalized/completed, non-archived events only',
    overall,
    by_event: byEvent
  };
}

function getImprovementReport() {
  const where = `th.previous_best IS NOT NULL AND (th.previous_best * 100) > th.time AND ${completedEventWhere('e')}`;
  const overall = db.prepare(`
    SELECT th.member_id, m.name AS member_name,
           SUM((th.previous_best * 100) - th.time) AS total_improvement_cs,
           COUNT(*) AS improvement_count
    FROM time_history th
    JOIN member m ON m.id = th.member_id
    JOIN event e ON e.id = th.event_id
    WHERE ${where}
    GROUP BY th.member_id, m.name
    ORDER BY total_improvement_cs DESC, m.name ASC
  `).all();
  const byEvent = db.prepare(`
    SELECT e.id AS event_id, e.date AS event_date, th.stroke,
           th.member_id, m.name AS member_name,
           SUM((th.previous_best * 100) - th.time) AS total_improvement_cs,
           COUNT(*) AS improvement_count
    FROM time_history th
    JOIN member m ON m.id = th.member_id
    JOIN event e ON e.id = th.event_id
    WHERE ${where}
    GROUP BY e.id, e.date, th.stroke, th.member_id, m.name
    ORDER BY e.date ASC, e.id ASC, th.stroke ASC, total_improvement_cs DESC, m.name ASC
  `).all();
  return {
    source: 'time_history.time and time_history.previous_best; counted only when previous_best exists and current time is faster',
    unit: 'centiseconds',
    overall,
    by_event: byEvent
  };
}

// GET /api/reports/event-coverage — completed result categories Bryan asked to inspect.
app.get('/api/reports/event-coverage', (req, res) => {
  try {
    const rows = getCompletedResultCoverageRows();
    const summary = {};
    for (const r of rows) {
      if (!summary[r.race_type]) summary[r.race_type] = { race_type: r.race_type, category: r.category, completed_races: 0, result_count: 0, team_count: 0 };
      summary[r.race_type].completed_races += 1;
      summary[r.race_type].result_count += r.result_count;
      summary[r.race_type].team_count += r.team_count;
    }
    res.json({ source: 'event_race rows for finalized/completed, non-archived events with saved heat/relay results', rows, summary: Object.values(summary).sort((a, b) => a.race_type.localeCompare(b.race_type)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reports/break-counts — Bryan Slice 2 break-count report.
app.get('/api/reports/break-counts', (req, res) => {
  try { res.json(getBreakCountReport()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reports/improvements — Bryan Slice 2 total-time-improvement report.
app.get('/api/reports/improvements', (req, res) => {
  try { res.json(getImprovementReport()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// BF2.6-20: GET /api/reports/exceeded — all swimmers exceeding PB by 1s or more across all events (Bryan 2026-06-21, was >2s)
app.get('/api/reports/exceeded', (req, res) => {
  try {
    const events = db.prepare("SELECT * FROM event WHERE status IN ('finalized','completed') ORDER BY date DESC").all();
    const exceeded = [];
    events.forEach(ev => {
      const races = db.prepare('SELECT * FROM event_race WHERE event_id = ?').all(ev.id);
      races.forEach(race => {
        const heats = db.prepare('SELECT * FROM heat WHERE event_race_id = ?').all(race.id);
        heats.forEach(h => {
          const lanes = db.prepare(`
            SELECT hl.*, m.name FROM heat_lane hl
            JOIN member m ON hl.member_id = m.id
            WHERE hl.heat_id = ? AND hl.variance >= 100
          `).all(h.id);
          lanes.forEach(l => {
            exceeded.push({
              event_date: ev.date,
              name: l.name,
              member_id: l.member_id,
              race_type: race.race_type,
              pb: l.handicap_time,
              net_time: l.net_time,
              variance: l.variance
            });
          });
        });
      });
    });
    res.json(exceeded);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/events/:eventId/slow-swimmers — variance >= 100 centiseconds (1s or more slower than PB; Bryan 2026-06-21, was >2s)
app.get('/api/events/:eventId/slow-swimmers', (req, res) => {
  try {
    const races = db.prepare('SELECT * FROM event_race WHERE event_id = ?').all(req.params.eventId);
    const slowSwimmers = [];
    races.forEach(race => {
      const col = timeColumn(race.race_type);
      if (!col) return;
      const heats = db.prepare('SELECT id, heat_number FROM heat WHERE event_race_id = ?').all(race.id);
      heats.forEach(h => {
        const lanes = db.prepare(`
          SELECT hl.*, m.name FROM heat_lane hl
          JOIN member m ON hl.member_id = m.id
          WHERE hl.heat_id = ? AND hl.variance >= 100
        `).all(h.id);
        lanes.forEach(l => {
          slowSwimmers.push({
            name: l.name,
            member_id: l.member_id,
            race_type: race.race_type,
            heat_number: h.heat_number,
            pb: l.handicap_time,
            net_time: l.net_time,
            variance: l.variance
          });
        });
      });
    });
    res.json(slowSwimmers);
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

// PUT /api/events/:eventId/archive — soft-delete (move to archive)
app.put('/api/events/:eventId/archive', (req, res) => {
  try {
    const ev = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    db.prepare("UPDATE event SET archived = 1 WHERE id = ?").run(req.params.eventId);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/events/:eventId/restore — restore from archive
app.put('/api/events/:eventId/restore', (req, res) => {
  try {
    const ev = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    db.prepare("UPDATE event SET archived = 0 WHERE id = ?").run(req.params.eventId);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/events/:eventId/report — consolidated report for season calendar / handoff
app.get('/api/events/:eventId/report', (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const attendance = db.prepare(`
      SELECT a.*, m.name
      FROM attendance a
      JOIN member m ON m.id = a.member_id
      WHERE a.event_id = ? AND a.present = 1
      ORDER BY m.name
    `).all(req.params.eventId);

    const races = db.prepare('SELECT * FROM event_race WHERE event_id = ? ORDER BY id').all(req.params.eventId);
    const getHeats = db.prepare('SELECT * FROM heat WHERE event_race_id = ? ORDER BY heat_number');
    const getLanes = db.prepare(`
      SELECT hl.*, m.name
      FROM heat_lane hl
      JOIN member m ON m.id = hl.member_id
      WHERE hl.heat_id = ?
      ORDER BY hl.lane_number
    `);
    const getTeams = db.prepare('SELECT * FROM relay_team WHERE event_race_id = ? ORDER BY team_number');
    const getTeamMembers = db.prepare(`
      SELECT rtm.*, m.name, m.time_25m, m.time_50m, m.time_backstroke, m.time_breaststroke, m.time_butterfly
      FROM relay_team_member rtm
      JOIN member m ON m.id = rtm.member_id
      WHERE rtm.relay_team_id = ?
      ORDER BY rtm.leg_order
    `);

    const raceReports = races.map(race => {
      if (['25m_relay','25m_brace','50m_brace','medley_relay','pogo'].includes(race.race_type)) {
        return {
          ...race,
          teams: getTeams.all(race.id).map(team => ({
            ...team,
            members: getTeamMembers.all(team.id)
          }))
        };
      }
      return {
        ...race,
        heats: getHeats.all(race.id).map(heat => ({
          ...heat,
          lanes: getLanes.all(heat.id)
        }))
      };
    });

    const rawBreakers = db.prepare(`
      SELECT th.*, m.name as member_name
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      WHERE th.event_id = ? AND th.is_break = 1
      ORDER BY th.stroke, m.name
    `).all(req.params.eventId);
    const breakers = rawBreakers.map(b => ({
      member_name: b.member_name,
      stroke: b.stroke,
      old_pb: b.previous_best != null ? b.previous_best * 100 : null,
      new_time: b.time,
      improvement: b.previous_best != null ? (b.previous_best * 100) - b.time : null
    }));

    res.json({ event, attendance, races: raceReports, breakers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/events/:eventId/time-history — time history entries for event
// M2 (R-M2-02): include event_date so the dated view of an event's history can render the date.
app.get('/api/events/:eventId/time-history', (req, res) => {
  try {
    const entries = db.prepare(`
      SELECT th.id, th.member_id, m.name AS member_name,
             th.event_id, e.date AS event_date,
             th.stroke, th.time, th.previous_best, th.is_break
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      JOIN event  e ON th.event_id  = e.id
      WHERE th.event_id = ?
      ORDER BY th.stroke, m.name
    `).all(req.params.eventId);
    res.json(entries);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/members/:memberId/time-history — per-swimmer timeline (M2 R-M2-03)
// Sort: newest event date first, then event id desc as a stable tie-breaker, then stroke asc.
// 404 if the member does not exist.
app.get('/api/members/:memberId/time-history', (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    if (!Number.isInteger(memberId) || memberId <= 0) {
      return res.status(400).json({ error: 'Invalid member id' });
    }
    const member = db.prepare('SELECT id, name FROM member WHERE id = ?').get(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const entries = db.prepare(`
      SELECT th.id, th.member_id, m.name AS member_name,
             th.event_id, e.date AS event_date,
             th.stroke, th.time, th.previous_best, th.is_break
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      JOIN event  e ON th.event_id  = e.id
      WHERE th.member_id = ?
      ORDER BY e.date DESC, th.event_id DESC, th.stroke ASC
    `).all(memberId);
    res.json(entries);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  M3 POINTSCORE / REPORTS (read-only over pointscore_entry)
//  All endpoints below READ the additively-written pointscore data.
//  None of them recompute race results. Aggregation is "simple addition"
//  per Bryan's 2026-06-02 working assumption.
// ════════════════════════════════════════════════════════

// GET /api/pointscore/rules — surface the working-assumption rule config so
// the UI can render the rule-transparency banner (UIT-M3-021/022).
app.get('/api/pointscore/rules', (req, res) => {
  res.json({
    source: pointscore.POINTSCORE_RULES.source,
    version: pointscore.POINTSCORE_RULES.version,
    categories: pointscore.POINTSCORE_RULES.categories,
    aggregation: 'Each event keeps its own pointscore. Monthly and season overall winners are simple addition of the relevant event totals. Working assumption sent to Bryan 2026-06-02; not a confirmed Constitution rule.',
    seasonBoundaryDefault: 'calendar year (working default, adjustable)',
    monthBoundaryDefault: 'calendar month'
  });
});

// GET /api/events/:eventId/pointscore — per-event, per-swimmer points.
// Event-separated: this is one event's own pointscore only.
app.get('/api/events/:eventId/pointscore', (req, res) => {
  try {
    const ev = db.prepare('SELECT id, date, status FROM event WHERE id = ?').get(req.params.eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    const rows = db.prepare(`
      SELECT pe.member_id, m.name AS member_name, er.race_type,
             pe.points, er.id AS event_race_id
      FROM pointscore_entry pe
      JOIN event_race er ON pe.event_race_id = er.id
      JOIN member m ON pe.member_id = m.id
      WHERE er.event_id = ?
      ORDER BY m.name ASC, er.race_type ASC
    `).all(req.params.eventId);
    // Per-swimmer event total (sum across that event's races).
    const totals = {};
    for (const r of rows) {
      if (!totals[r.member_id]) totals[r.member_id] = { member_id: r.member_id, member_name: r.member_name, total: 0 };
      totals[r.member_id].total += r.points;
    }
    const totalsArr = Object.values(totals).sort((a, b) => b.total - a.total || a.member_name.localeCompare(b.member_name));
    res.json({ event: ev, rows, totals: totalsArr });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Internal helper: aggregate per-swimmer event totals across a set of events
// by simple addition (the documented working rule). archived events excluded
// by default (the calendar already hides archived events from the season).
function aggregatePointscoreForEvents(eventIds) {
  if (eventIds.length === 0) return [];
  const placeholders = eventIds.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT pe.member_id, m.name AS member_name, SUM(pe.points) AS total,
           COUNT(DISTINCT er.event_id) AS events_counted
    FROM pointscore_entry pe
    JOIN event_race er ON pe.event_race_id = er.id
    JOIN member m ON pe.member_id = m.id
    WHERE er.event_id IN (${placeholders})
    GROUP BY pe.member_id, m.name
    ORDER BY total DESC, m.name ASC
  `).all(...eventIds);
  return rows;
}

// GET /api/pointscore/month/:ym — monthly overall winners (YYYY-MM).
// Simple addition of all non-archived completed/finalized events in that month.
app.get('/api/pointscore/month/:ym', (req, res) => {
  try {
    const ym = req.params.ym; // e.g. 2026-04
    if (!/^\d{4}-\d{2}$/.test(ym)) return res.status(400).json({ error: 'month must be YYYY-MM' });
    const events = db.prepare(`
      SELECT id, date FROM event
      WHERE substr(date,1,7) = ? AND (archived = 0 OR archived IS NULL)
        AND status IN ('finalized','completed')
      ORDER BY date ASC
    `).all(ym);
    const standings = aggregatePointscoreForEvents(events.map(e => e.id));
    res.json({ period: ym, periodType: 'month', events, standings });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pointscore/season/:year — season overall winners.
// Working default season = calendar year. Adjustable via the year param.
app.get('/api/pointscore/season/:year', (req, res) => {
  try {
    const year = req.params.year;
    if (!/^\d{4}$/.test(year)) return res.status(400).json({ error: 'year must be YYYY' });
    const events = db.prepare(`
      SELECT id, date FROM event
      WHERE substr(date,1,4) = ? AND (archived = 0 OR archived IS NULL)
        AND status IN ('finalized','completed')
      ORDER BY date ASC
    `).all(year);
    const standings = aggregatePointscoreForEvents(events.map(e => e.id));
    res.json({ period: year, periodType: 'season', seasonBoundary: 'calendar year (working default)', events, standings });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/members/:memberId/pointscore — per-swimmer contribution detail.
// v2.12.0 (Bryan 2026-06-10 "25m brace does not list in any results"): the
// card lists EVERY race the swimmer took part in (individual lanes with a
// finish time, relay teams with a team time), with 0 points where the race
// awarded none (e.g. relay teams outside 1st-3rd) — not only the scored rows.
app.get('/api/members/:memberId/pointscore', (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    const member = db.prepare('SELECT id, name FROM member WHERE id = ?').get(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Participations: individual races (a finish time was recorded).
    const individual = db.prepare(`
      SELECT DISTINCT e.id AS event_id, e.date AS event_date, er.race_type
      FROM heat_lane hl
      JOIN heat h ON hl.heat_id = h.id
      JOIN event_race er ON h.event_race_id = er.id
      JOIN event e ON er.event_id = e.id
      WHERE hl.member_id = ? AND hl.finish_time IS NOT NULL AND ${completedEventWhere('e')}
    `).all(memberId);
    // Participations: relay/team races (the team recorded a total time).
    const relay = db.prepare(`
      SELECT DISTINCT e.id AS event_id, e.date AS event_date, er.race_type
      FROM relay_team_member rtm
      JOIN relay_team rt ON rtm.relay_team_id = rt.id
      JOIN event_race er ON rt.event_race_id = er.id
      JOIN event e ON er.event_id = e.id
      WHERE rtm.member_id = ? AND rt.total_time IS NOT NULL AND ${completedEventWhere('e')}
    `).all(memberId);
    // Scored points per event/race type.
    const scored = db.prepare(`
      SELECT e.id AS event_id, e.date AS event_date, er.race_type, SUM(pe.points) AS points
      FROM pointscore_entry pe
      JOIN event_race er ON pe.event_race_id = er.id
      JOIN event e ON er.event_id = e.id
      WHERE pe.member_id = ? AND ${completedEventWhere('e')}
      GROUP BY e.id, e.date, er.race_type
    `).all(memberId);

    const byKey = new Map();
    for (const p of individual.concat(relay)) {
      byKey.set(p.event_id + ':' + p.race_type, { event_id: p.event_id, event_date: p.event_date, race_type: p.race_type, points: 0 });
    }
    for (const s of scored) {
      const key = s.event_id + ':' + s.race_type;
      const row = byKey.get(key) || { event_id: s.event_id, event_date: s.event_date, race_type: s.race_type, points: 0 };
      row.points = s.points;
      byKey.set(key, row);
    }
    const contributions = [...byKey.values()].sort((a, b) =>
      b.event_date.localeCompare(a.event_date) || a.race_type.localeCompare(b.race_type));
    const total = contributions.reduce((s, c) => s + c.points, 0);
    res.json({ member, total, contributions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pointscore/months — list of YYYY-MM that have scored events (for UI pickers).
app.get('/api/pointscore/months', (req, res) => {
  try {
    const months = db.prepare(`
      SELECT DISTINCT substr(e.date,1,7) AS ym
      FROM pointscore_entry pe
      JOIN event_race er ON pe.event_race_id = er.id
      JOIN event e ON er.event_id = e.id
      WHERE (e.archived = 0 OR e.archived IS NULL)
      ORDER BY ym DESC
    `).all();
    res.json(months.map(m => m.ym));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  BRYAN'S 3 MAIN POINTSCORE REPORTS (2026-06-10, "as per the spreadsheet")
//  1. Per race type: all members × weeks, points per week + total.
//  2. Total pointscore: all members × race types, totals + grand total.
//  3. Breakers: manual PB reductions — count + amount per swimmer/stroke.
//  Read-only over pointscore_entry / member / pb_change_log.
// ════════════════════════════════════════════════════════

// Canonical column/selector order for race types.
const RACE_TYPE_ORDER = ['25m', '50m', '75m', 'backstroke', 'breaststroke', 'butterfly', '25m_relay', 'medley_relay', '25m_brace', '50m_brace', 'pogo'];
function raceTypeSortIndex(rt) {
  const i = RACE_TYPE_ORDER.indexOf(rt);
  return i === -1 ? 999 : i;
}

function completedEventYears() {
  return db.prepare(`
    SELECT DISTINCT substr(date,1,4) AS y FROM event
    WHERE status IN ('finalized','completed') AND (archived = 0 OR archived IS NULL)
    ORDER BY y DESC
  `).all().map(r => r.y);
}

function resolveReportYear(reqYear) {
  if (reqYear && /^\d{4}$/.test(String(reqYear))) return String(reqYear);
  const years = completedEventYears();
  return years[0] || new Date().toISOString().slice(0, 4);
}

// Roster = every active member, plus any extra ids that scored points
// (covers deactivated members with historical points). Sorted by name.
function reportRoster(extraIds = []) {
  const members = db.prepare('SELECT id, name FROM member WHERE is_active = 1').all();
  const have = new Set(members.map(m => m.id));
  const missing = [...new Set(extraIds)].filter(id => !have.has(id));
  if (missing.length > 0) {
    const ph = missing.map(() => '?').join(',');
    members.push(...db.prepare(`SELECT id, name FROM member WHERE id IN (${ph})`).all(...missing));
  }
  members.sort((a, b) => a.name.localeCompare(b.name));
  return members;
}

function completedRaceTypesForYear(year) {
  return db.prepare(`
    SELECT DISTINCT er.race_type
    FROM event_race er JOIN event e ON e.id = er.event_id
    WHERE substr(e.date,1,4) = ? AND ${completedEventWhere('e')}
  `).all(year).map(r => r.race_type).sort((a, b) => raceTypeSortIndex(a) - raceTypeSortIndex(b));
}

// Report 1: one race type, all members, points per week (= per event) + total.
function getRaceTypeWeeklyReport(raceType, year) {
  const weeks = db.prepare(`
    SELECT DISTINCT e.id AS event_id, e.date
    FROM event e JOIN event_race er ON er.event_id = e.id
    WHERE er.race_type = ? AND substr(e.date,1,4) = ? AND ${completedEventWhere('e')}
    ORDER BY e.date ASC, e.id ASC
  `).all(raceType, year);
  const points = db.prepare(`
    SELECT er.event_id, pe.member_id, SUM(pe.points) AS pts
    FROM pointscore_entry pe
    JOIN event_race er ON pe.event_race_id = er.id
    JOIN event e ON e.id = er.event_id
    WHERE er.race_type = ? AND substr(e.date,1,4) = ? AND ${completedEventWhere('e')}
    GROUP BY er.event_id, pe.member_id
  `).all(raceType, year);
  const roster = reportRoster(points.map(p => p.member_id));
  const rows = new Map(roster.map(m => [m.id, { member_id: m.id, member_name: m.name, points: {}, total: 0 }]));
  for (const p of points) {
    const row = rows.get(p.member_id);
    if (!row) continue;
    row.points[p.event_id] = p.pts;
    row.total += p.pts;
  }
  return {
    race_type: raceType,
    category: categoryLabel(raceType),
    year,
    weeks,
    members: [...rows.values()],
    availableRaceTypes: completedRaceTypesForYear(year),
    availableYears: completedEventYears()
  };
}

// Report 2: all members × race types, season totals + grand total.
function getTotalPointscoreReport(year) {
  const cells = db.prepare(`
    SELECT pe.member_id, er.race_type, SUM(pe.points) AS pts
    FROM pointscore_entry pe
    JOIN event_race er ON pe.event_race_id = er.id
    JOIN event e ON e.id = er.event_id
    WHERE substr(e.date,1,4) = ? AND ${completedEventWhere('e')}
    GROUP BY pe.member_id, er.race_type
  `).all(year);
  const raceTypes = completedRaceTypesForYear(year);
  const roster = reportRoster(cells.map(c => c.member_id));
  const rows = new Map(roster.map(m => [m.id, { member_id: m.id, member_name: m.name, byType: {}, total: 0 }]));
  for (const c of cells) {
    const row = rows.get(c.member_id);
    if (!row) continue;
    row.byType[c.race_type] = c.pts;
    row.total += c.pts;
  }
  return { year, raceTypes, members: [...rows.values()], availableYears: completedEventYears() };
}

// Report 3: breaker counts + amounts from manually changed PBs.
// count = manual reductions logged in pb_change_log this season;
// amount = season-start PB (member.season_start_*, else the oldest logged
// old_value, else the current PB) minus the current PB. Whole seconds.
const BREAKER_STROKES = ['25m', '50m', '75m', 'backstroke', 'breaststroke', 'butterfly'];
function getBreakersSummaryReport(year) {
  const members = db.prepare('SELECT * FROM member WHERE is_active = 1 ORDER BY name').all();
  const logRows = db.prepare(`
    SELECT member_id, stroke, old_value, new_value
    FROM pb_change_log
    WHERE substr(changed_at,1,4) = ?
    ORDER BY changed_at ASC, id ASC
  `).all(year);
  const counts = new Map();      // member:stroke -> reductions
  const earliestOld = new Map(); // member:stroke -> oldest logged old_value
  for (const r of logRows) {
    const key = r.member_id + ':' + r.stroke;
    if (!earliestOld.has(key) && r.old_value != null) earliestOld.set(key, r.old_value);
    if (r.old_value != null && r.new_value != null && r.new_value < r.old_value) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const rows = [];
  const totals = [];
  for (const m of members) {
    let memberCount = 0;
    let memberAmount = 0;
    for (const stroke of BREAKER_STROKES) {
      const current = m['time_' + stroke];
      const key = m.id + ':' + stroke;
      const count = counts.get(key) || 0;
      if (current == null && count === 0) continue; // no PB, nothing logged
      const baseline = m['season_start_' + stroke] != null
        ? m['season_start_' + stroke]
        : (earliestOld.get(key) != null ? earliestOld.get(key) : current);
      const amount = (baseline != null && current != null) ? baseline - current : null;
      rows.push({
        member_id: m.id, member_name: m.name, stroke,
        season_start: baseline ?? null, current_pb: current ?? null,
        times_lowered: count, amount_lowered: amount
      });
      memberCount += count;
      memberAmount += amount != null ? amount : 0;
    }
    totals.push({ member_id: m.id, member_name: m.name, times_lowered: memberCount, amount_lowered: memberAmount });
  }
  return {
    source: 'Manually changed PB times (Members screen edits logged in pb_change_log) + season-start PB vs current PB. Whole seconds.',
    year,
    rows,
    totals,
    availableYears: completedEventYears()
  };
}

// GET /api/pointscore/by-race-type/:raceType — Bryan report 1.
app.get('/api/pointscore/by-race-type/:raceType', (req, res) => {
  try {
    const year = resolveReportYear(req.query.year);
    res.json(getRaceTypeWeeklyReport(req.params.raceType, year));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pointscore/by-race-type/:raceType/csv
app.get('/api/pointscore/by-race-type/:raceType/csv', (req, res) => {
  try {
    const year = resolveReportYear(req.query.year);
    const report = getRaceTypeWeeklyReport(req.params.raceType, year);
    const header = ['swimmer'].concat(report.weeks.map(w => w.date)).concat(['total']);
    const rows = report.members.map(m =>
      [m.member_name].concat(report.weeks.map(w => m.points[w.event_id] ?? 0)).concat([m.total]));
    sendCsv(res, 'wwsc-pointscore-' + report.race_type + '-' + year + '-v' + pkg.version + '.csv', header, rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pointscore/total — Bryan report 2.
app.get('/api/pointscore/total', (req, res) => {
  try {
    const year = resolveReportYear(req.query.year);
    res.json(getTotalPointscoreReport(year));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pointscore/total/csv
app.get('/api/pointscore/total/csv', (req, res) => {
  try {
    const year = resolveReportYear(req.query.year);
    const report = getTotalPointscoreReport(year);
    const header = ['swimmer'].concat(report.raceTypes.map(rt => categoryLabel(rt))).concat(['total']);
    const rows = report.members.map(m =>
      [m.member_name].concat(report.raceTypes.map(rt => m.byType[rt] ?? 0)).concat([m.total]));
    sendCsv(res, 'wwsc-total-pointscore-' + year + '-v' + pkg.version + '.csv', header, rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reports/breakers-summary — Bryan report 3.
app.get('/api/reports/breakers-summary', (req, res) => {
  try {
    const year = resolveReportYear(req.query.year);
    res.json(getBreakersSummaryReport(year));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reports/breakers-summary/csv
app.get('/api/reports/breakers-summary/csv', (req, res) => {
  try {
    const year = resolveReportYear(req.query.year);
    const report = getBreakersSummaryReport(year);
    sendCsv(res, 'wwsc-breakers-summary-' + year + '-v' + pkg.version + '.csv',
      ['swimmer', 'stroke', 'season_start_s', 'current_pb_s', 'times_lowered', 'amount_lowered_s'],
      report.rows.map(r => [r.member_name, r.stroke, r.season_start, r.current_pb, r.times_lowered, r.amount_lowered]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CSV exports. Content-Type text/csv, deterministic filename via header.
function sendCsv(res, filename, headerRow, dataRows) {
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headerRow.map(esc).join(',')].concat(dataRows.map(r => r.map(esc).join(',')));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
  res.send(lines.join('\n') + '\n');
}

// GET /api/reports/event-coverage.csv
app.get('/api/reports/event-coverage/csv', (req, res) => {
  try {
    const rows = getCompletedResultCoverageRows();
    sendCsv(res, 'wwsc-completed-result-categories-v' + pkg.version + '.csv',
      ['event_date', 'event_id', 'race_type', 'category', 'result_count', 'team_count'],
      rows.map(r => [r.event_date, r.event_id, r.race_type, r.category, r.result_count, r.team_count]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reports/break-counts.csv
app.get('/api/reports/break-counts/csv', (req, res) => {
  try {
    const report = getBreakCountReport();
    const rows = []
      .concat(report.overall.map(r => ['overall', '', '', '', r.member_name, r.member_id, r.break_count]))
      .concat(report.by_event.map(r => ['by_event', r.event_date, r.event_id, r.stroke, r.member_name, r.member_id, r.break_count]));
    sendCsv(res, 'wwsc-break-counts-v' + pkg.version + '.csv',
      ['scope', 'event_date', 'event_id', 'stroke', 'swimmer', 'member_id', 'break_count'],
      rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reports/improvements.csv
app.get('/api/reports/improvements/csv', (req, res) => {
  try {
    const report = getImprovementReport();
    const rows = []
      .concat(report.overall.map(r => ['overall', '', '', '', r.member_name, r.member_id, r.total_improvement_cs, r.improvement_count]))
      .concat(report.by_event.map(r => ['by_event', r.event_date, r.event_id, r.stroke, r.member_name, r.member_id, r.total_improvement_cs, r.improvement_count]));
    sendCsv(res, 'wwsc-total-improvements-v' + pkg.version + '.csv',
      ['scope', 'event_date', 'event_id', 'stroke', 'swimmer', 'member_id', 'total_improvement_centiseconds', 'improvement_count'],
      rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/export/db — raw SQLite DB download.
// Uses SQLite's backup API instead of streaming the live DB file directly.
app.get('/api/export/db', async (req, res) => {
  try {
    if (!DB_PATH) return res.status(500).json({ error: 'SQLite DB path is not configured' });
    const exportDir = path.join(path.dirname(DB_PATH), 'exports');
    fs.mkdirSync(exportDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = 'wwsc-sqlite-db-v' + pkg.version + '-' + stamp + '.db';
    const exportPath = path.join(exportDir, filename);
    const backup = db.backup(exportPath);
    if (backup && typeof backup.then === 'function') await backup;
    if (!fs.existsSync(exportPath)) return res.status(500).json({ error: 'DB export file was not created' });
    res.download(exportPath, filename, (err) => {
      try { fs.unlinkSync(exportPath); } catch (e) {}
      if (err && !res.headersSent) res.status(500).json({ error: err.message });
    });
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});

// GET /api/events/:eventId/pointscore.csv
app.get('/api/events/:eventId/pointscore/csv', (req, res) => {
  try {
    const ev = db.prepare('SELECT id, date FROM event WHERE id = ?').get(req.params.eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    const rows = db.prepare(`
      SELECT m.name AS member_name, er.race_type, pe.points
      FROM pointscore_entry pe
      JOIN event_race er ON pe.event_race_id = er.id
      JOIN member m ON pe.member_id = m.id
      WHERE er.event_id = ?
      ORDER BY m.name ASC, er.race_type ASC
    `).all(req.params.eventId);
    sendCsv(res, 'wwsc-event-pointscore-' + ev.date + '-v' + pkg.version + '.csv',
      ['event_date', 'swimmer', 'race_type', 'points'],
      rows.map(r => [ev.date, r.member_name, r.race_type, r.points]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pointscore/month/:ym.csv
app.get('/api/pointscore/month/:ym/csv', (req, res) => {
  try {
    const ym = req.params.ym;
    if (!/^\d{4}-\d{2}$/.test(ym)) return res.status(400).json({ error: 'month must be YYYY-MM' });
    const events = db.prepare(`SELECT id FROM event WHERE substr(date,1,7)=? AND (archived=0 OR archived IS NULL) AND status IN ('finalized','completed')`).all(ym);
    const standings = aggregatePointscoreForEvents(events.map(e => e.id));
    sendCsv(res, 'wwsc-monthly-pointscore-' + ym + '-v' + pkg.version + '.csv',
      ['month', 'rank', 'swimmer', 'total_points', 'events_counted'],
      standings.map((s, i) => [ym, i + 1, s.member_name, s.total, s.events_counted]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pointscore/season/:year.csv
app.get('/api/pointscore/season/:year/csv', (req, res) => {
  try {
    const year = req.params.year;
    if (!/^\d{4}$/.test(year)) return res.status(400).json({ error: 'year must be YYYY' });
    const events = db.prepare(`SELECT id FROM event WHERE substr(date,1,4)=? AND (archived=0 OR archived IS NULL) AND status IN ('finalized','completed')`).all(year);
    const standings = aggregatePointscoreForEvents(events.map(e => e.id));
    sendCsv(res, 'wwsc-season-pointscore-' + year + '-v' + pkg.version + '.csv',
      ['season', 'rank', 'swimmer', 'total_points', 'events_counted'],
      standings.map((s, i) => [year, i + 1, s.member_name, s.total, s.events_counted]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/time-history.csv — full dated time-history export (M2 data).
app.get('/api/time-history/csv', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT e.date AS event_date, m.name AS member_name, th.stroke,
             th.time, th.previous_best, th.is_break
      FROM time_history th
      JOIN member m ON th.member_id = m.id
      JOIN event e ON th.event_id = e.id
      ORDER BY e.date DESC, m.name ASC, th.stroke ASC
    `).all();
    sendCsv(res, 'wwsc-time-history-v' + pkg.version + '.csv',
      ['event_date', 'swimmer', 'stroke', 'time_centiseconds', 'previous_best_seconds', 'is_break'],
      rows.map(r => [r.event_date, r.member_name, r.stroke, r.time, r.previous_best, r.is_break]));
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
      const rawMax = Math.max(...lanes.map(l => l.handicap_time));
      const maxTime = rawMax + BASE_OFFSET; // +2s buffer per Bryan's VBA formula
      const upd = db.prepare('UPDATE heat_lane SET start_delay = ? WHERE id = ?');
      const t = db.transaction(() => {
        lanes.forEach(l => upd.run(maxTime - l.handicap_time, l.id));
      });
      t();
    };
    recalcHeat(fromHeat.id);
    recalcHeat(toHeat.id);

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
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
//  RELAY API
// ════════════════════════════════════════════════════════

const RELAY_TYPES = ['25m_relay', '25m_brace', '50m_brace', 'medley_relay', 'pogo'];

// F31: Simple team names per Bryan's Excel (no fancy names, just Team 1, Team 2, etc.)
const TEAM_NAMES = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6', 'Team 7', 'Team 8', 'Team 9', 'Team 10'];

// Helper: get PB total for a member based on relay type
function getRelayPB(member, raceType) {
  switch (raceType) {
    case '25m_relay': return member.time_25m || 9999;
    case '25m_brace': return member.time_25m || 9999;
    case '50m_brace': return member.time_50m || 9999;
    case 'pogo': return member.time_25m || 9999;
    case 'medley_relay': {
      // Sum of all stroke PBs as sorting metric
      const times = [member.time_backstroke, member.time_breaststroke, member.time_25m].filter(t => t != null);
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) : 9999;
    }
    default: return 9999;
  }
}

// Helper: distribute swimmers round-robin into N teams for balanced teams
function distributeRoundRobin(swimmers, numTeams, options = {}) {
  const forceReshuffle = options.forceReshuffle === true;
  // Sort by PB (fastest first) so baseline balance stays intact.
  swimmers.sort((a, b) => a.pb - b.pb);

  // Bryan 2026-04-21: Shuffle must produce a visibly different brace/relay
  // distribution. We keep the snake-balancing concept, but optionally rotate
  // and reverse the sorted order before distributing so repeated shuffles are
  // still balanced while changing pairings/teams in a user-visible way.
  if (forceReshuffle && swimmers.length > 1) {
    const offset = 1 + Math.floor(Math.random() * (swimmers.length - 1));
    const rotated = swimmers.slice(offset).concat(swimmers.slice(0, offset));
    if (Math.random() < 0.5) rotated.reverse();
    swimmers.splice(0, swimmers.length, ...rotated);
  }

  const teams = Array.from({ length: numTeams }, () => []);
  // Snake distribution for balance: 0,1,2,2,1,0,0,1,2...
  swimmers.forEach((s, i) => {
    const round = Math.floor(i / numTeams);
    const pos = i % numTeams;
    const idx = round % 2 === 0 ? pos : (numTeams - 1 - pos);
    teams[idx].push(s);
  });
  return teams;
}

// POST /api/races/:raceId/generate-relay-teams
app.post('/api/races/:raceId/generate-relay-teams', (req, res) => {
  try {
    const race = db.prepare('SELECT * FROM event_race WHERE id = ?').get(req.params.raceId);
    const forceReshuffle = req.body && req.body.forceReshuffle === true;
    if (!race) return res.status(404).json({ error: 'Race not found' });
    if (!RELAY_TYPES.includes(race.race_type)) return res.status(400).json({ error: 'Not a relay race type' });

    // Get attending members
    const members = db.prepare(`
      SELECT m.*, a.special_event_entry
      FROM member m
      JOIN attendance a ON a.member_id = m.id
      WHERE a.event_id = ? AND a.present = 1 AND m.is_active = 1
    `).all(race.event_id);

    if (members.length < 2) {
      return res.json({ teams: [], warning: 'Need at least 2 swimmers' });
    }

    let teams = [];

    if (race.race_type === 'pogo') {
      // R16: Pogo — exactly 4 swimmers per team, no swim-twice
      const relayMembers = members;
      if (relayMembers.length < 4) return res.json({ teams: [], warning: 'Need at least 4 swimmers for Pogo' });
      const swimmersWithPB = relayMembers.map(m => ({ ...m, pb: m.time_25m || 9999 }));
      swimmersWithPB.sort((a, b) => a.pb - b.pb);
      const numTeams = Math.floor(swimmersWithPB.length / 4);
      const distributed = distributeRoundRobin(swimmersWithPB.slice(0, numTeams * 4), numTeams, { forceReshuffle });

      teams = distributed.map((teamMembers, ti) => {
        const targetTime = teamMembers.reduce((sum, m) => sum + (m.pb !== 9999 ? m.pb : 0), 0);
        return {
          team_number: ti + 1,
          team_name: TEAM_NAMES[ti] || `Team ${ti + 1}`,
          members: teamMembers.map((m, mi) => ({
            member_id: m.id, name: m.name, leg_order: mi + 1, stroke: 'Free',
            pb: m.pb !== 9999 ? m.pb : null,
            time_25m: m.time_25m, time_50m: m.time_50m, time_backstroke: m.time_backstroke, time_breaststroke: m.time_breaststroke, time_butterfly: m.time_butterfly
          })),
          target_time: targetTime > 0 ? targetTime : null
        };
      });

    } else if (race.race_type === '25m_relay') {
      // v2.7.1: Standard relays include ALL present swimmers.
      const relayMembers = members;

      // v2.7.4: Bryan rule — <11 swimmers = 2 teams, >=11 = 3 teams
      const teamSize = 4;
      const numTeams = relayMembers.length >= 11 ? 3 : 2;

      if (relayMembers.length < 2) return res.json({ teams: [], warning: 'Need at least 2 swimmers' });

      const swimmersWithPB = relayMembers.map(m => ({ ...m, pb: getRelayPB(m, race.race_type) }));
      const distributed = distributeRoundRobin(swimmersWithPB, numTeams, { forceReshuffle });

      // v2.8.4 Bryan fix 4: flag undersized 25m relay teams so the UI can
      // explicitly prompt for a swim-twice selection instead of silently
      // producing uneven teams.
      teams = distributed.map((teamMembers, ti) => {
        const targetTime = teamMembers.reduce((sum, m) => sum + (m.pb !== 9999 ? m.pb : 0), 0);
        const undersized = teamMembers.length < teamSize;
        return {
          team_number: ti + 1,
          team_name: TEAM_NAMES[ti] || `Team ${ti + 1}`,
          members: teamMembers.map((m, mi) => ({
            member_id: m.id,
            name: m.name,
            leg_order: mi + 1,
            stroke: 'Free',
            pb: m.pb !== 9999 ? m.pb : null,
            time_25m: m.time_25m, time_50m: m.time_50m, time_backstroke: m.time_backstroke, time_breaststroke: m.time_breaststroke, time_butterfly: m.time_butterfly
          })),
          target_time: targetTime > 0 ? targetTime : null,
          needs_manual_entry: undersized && teamMembers.length !== members.length,
          needs_swim_twice_completion: undersized && teamMembers.length !== members.length
        };
      });

    } else if (race.race_type === '25m_brace' || race.race_type === '50m_brace') {
      // R10.2, R10.3: Pairs (teams of 2)
      const pbCol = race.race_type === '25m_brace' ? 'time_25m' : 'time_50m';
      
      // v2.7.1: Brace relays are standard events — ALL present swimmers participate.
      // 'N' means "Standard Events Only" = they ARE in Brace (it's standard).
      const relayMembers = members;

      if (relayMembers.length < 2) return res.json({ teams: [], warning: 'Need at least 2 swimmers' });

      const swimmersWithPB = relayMembers.map(m => ({ ...m, pb: m[pbCol] || 9999 }));
      swimmersWithPB.sort((a, b) => a.pb - b.pb);

      // Bryan 2026-04-21: Apply the same forceReshuffle rotation the round-robin
      // distribution uses, so repeated Brace shuffles produce visibly different
      // pairings while keeping the fastest+slowest balancing intent.
      if (forceReshuffle && swimmersWithPB.length > 1) {
        const offset = 1 + Math.floor(Math.random() * (swimmersWithPB.length - 1));
        const rotated = swimmersWithPB.slice(offset).concat(swimmersWithPB.slice(0, offset));
        if (Math.random() < 0.5) rotated.reverse();
        swimmersWithPB.splice(0, swimmersWithPB.length, ...rotated);
      }

      // Pair fastest with slowest for balance
      const pairs = [];
      const pool = [...swimmersWithPB];
      while (pool.length >= 2) {
        const fast = pool.shift();
        const slow = pool.pop();
        pairs.push([fast, slow]);
      }
      // R2: Odd Man Out — find best partner from already-paired swimmers
      if (pool.length === 1) {
        const oddSwimmer = pool[0];
        const oddPB = oddSwimmer.pb !== 9999 ? oddSwimmer.pb : 0;
        // Calculate average team PB of existing pairs
        const teamTotals = pairs.map(p => p.reduce((s, m) => s + (m.pb !== 9999 ? m.pb : 0), 0));
        const avgTeamPB = teamTotals.length > 0 ? teamTotals.reduce((a, b) => a + b, 0) / teamTotals.length : 0;
        // Find best partner: minimize abs(oddPB + partnerPB - avgTeamPB)
        let bestPartner = null;
        let bestDelta = Infinity;
        for (const pair of pairs) {
          for (const m of pair) {
            const potentialTotal = oddPB + (m.pb !== 9999 ? m.pb : 0);
            const delta = Math.abs(potentialTotal - avgTeamPB);
            if (delta < bestDelta) {
              bestDelta = delta;
              bestPartner = m;
            }
          }
        }
        if (bestPartner) {
          pairs.push([oddSwimmer, { ...bestPartner, leg_order: 2 }]);
        } else {
          pairs.push([oddSwimmer]); // Fallback: solo if no partners exist
        }
      }

      teams = pairs.map((pair, ti) => {
        const targetTime = pair.reduce((sum, m) => sum + (m.pb !== 9999 ? m.pb : 0), 0);
        return {
          team_number: ti + 1,
          team_name: TEAM_NAMES[ti] || `Team ${ti + 1}`,
          members: pair.map((m, mi) => ({
            member_id: m.id,
            name: m.name,
            leg_order: mi + 1,
            stroke: 'Free',
            pb: m.pb !== 9999 ? m.pb : null,
            time_25m: m.time_25m, time_50m: m.time_50m, time_backstroke: m.time_backstroke, time_breaststroke: m.time_breaststroke, time_butterfly: m.time_butterfly
          })),
          target_time: targetTime > 0 ? targetTime : null,
          needs_manual_entry: pair.length < 2
        };
      });

    } else if (race.race_type === 'medley_relay') {
      // R10.4: Teams of 3, different strokes
      // Get stroke assignments from attendance.special_event_entry
      const backstrokers = [];
      const breaststrokers = [];
      const freestylers = [];
      const wildcards = []; // 'Y' = auto-assign

      // BF2.6-11: Filter out swimmers who said 'No' to special events (N)
      // and also handle NULL/Empty as NO participation in Medley unless explicitly 'Y' or stroke.
      const medleyMembers = members.filter(m => {
        const entry = (m.special_event_entry || '').trim();
        return entry !== 'N' && entry !== '';
      });

      medleyMembers.forEach(m => {
        const entry = (m.special_event_entry || '').trim();
        const pb = getRelayPB(m, 'medley_relay');
        const swimmer = { ...m, pb };
        if (entry === 'Back') backstrokers.push(swimmer);
        else if (entry === 'Breast') breaststrokers.push(swimmer);
        else if (entry === 'Free') freestylers.push(swimmer);
        else wildcards.push(swimmer); // 'Y' = auto-assign
      });

      // Build teams: combine all swimmers into one pool
      // Swimmers with explicit strokes go in with requestedStroke set
      // Wildcards (Y) go in WITHOUT requestedStroke — they get auto-assigned
      const strokes = ['Back', 'Breast', 'Free'];
      const allPool = [];

      backstrokers.forEach(s => allPool.push({...s, requestedStroke: 'Back', isWildcard: false}));
      breaststrokers.forEach(s => allPool.push({...s, requestedStroke: 'Breast', isWildcard: false}));
      freestylers.forEach(s => allPool.push({...s, requestedStroke: 'Free', isWildcard: false}));
      wildcards.forEach(s => allPool.push({...s, requestedStroke: null, isWildcard: true}));

      const totalSwimmers = allPool.length;
      if (totalSwimmers < 3) {
        return res.json({ teams: [], warning: 'Need at least 3 swimmers for medley relay' });
      }

      // Number of complete teams (3 per team)
      const numTeams = Math.floor(totalSwimmers / 3);

      // Sort all by PB for balanced distribution
      allPool.sort((a, b) => a.pb - b.pb);

      teams = [];
      for (let i = 0; i < numTeams; i++) {
        teams.push({
          team_number: i + 1,
          team_name: TEAM_NAMES[i] || `Team ${i + 1}`,
          members: [],
          target_time: 0
        });
      }

      // Helper: get PB for a given stroke
      function medleyPB(swimmer, stroke) {
        if (stroke === 'Back') return swimmer.time_backstroke || null;
        if (stroke === 'Breast') return swimmer.time_breaststroke || null;
        return swimmer.time_25m || null; // Free
      }

      // 1. First pass: assign swimmers who requested a SPECIFIC stroke (not wildcards)
      for (const s of allPool) {
        if (s.requestedStroke && !s.isWildcard) {
          for (const team of teams) {
            if (team.members.length < 3 && !team.members.find(m => m.stroke === s.requestedStroke)) {
              const stroke = s.requestedStroke;
              team.members.push({ member_id: s.id, name: s.name, stroke, pb: medleyPB(s, stroke), auto: false,
                time_25m: s.time_25m, time_50m: s.time_50m, time_backstroke: s.time_backstroke, time_breaststroke: s.time_breaststroke, time_butterfly: s.time_butterfly });
              s.assigned = true;
              break;
            }
          }
        }
      }

      // 2. Second pass: fill remaining slots with wildcards (Y swimmers)
      const remaining = allPool.filter(s => !s.assigned);
      for (const s of remaining) {
        for (const team of teams) {
          if (team.members.length < 3) {
            const openStrokes = strokes.filter(st => !team.members.find(m => m.stroke === st));
            if (openStrokes.length > 0) {
              const stroke = openStrokes[0];
              team.members.push({ member_id: s.id, name: s.name, stroke, pb: medleyPB(s, stroke), auto: s.isWildcard === true,
                time_25m: s.time_25m, time_50m: s.time_50m, time_backstroke: s.time_backstroke, time_breaststroke: s.time_breaststroke, time_butterfly: s.time_butterfly });
              s.assigned = true;
              break;
            }
          }
        }
      }

      // R18 (v2.8.3): Leftover handling — Bryan confirmed "swim twice" flow.
      // Any leftover (1, 2, or 3+) gets placed into a partial team so the user
      // can visibly select an already-assigned swimmer to swim twice and
      // complete the team. The needs_swim_twice_completion flag tells the UI
      // to prompt the user; needs_manual_entry keeps legacy styling paths.
      const leftovers = allPool.filter(s => !s.assigned);
      if (leftovers.length >= 1) {
        const partialTeam = {
          team_number: numTeams + 1,
          team_name: TEAM_NAMES[numTeams] || `Team ${numTeams + 1}`,
          members: [],
          target_time: 0,
          needs_manual_entry: true,
          needs_swim_twice_completion: leftovers.length < 3
        };
        leftovers.forEach(s => {
          const openStrokes = strokes.filter(st => !partialTeam.members.find(m => m.stroke === st));
          const stroke = openStrokes.length > 0 ? openStrokes[0] : 'Free';
          partialTeam.members.push({ member_id: s.id, name: s.name, stroke, pb: medleyPB(s, stroke), auto: true,
            time_25m: s.time_25m, time_50m: s.time_50m, time_backstroke: s.time_backstroke, time_breaststroke: s.time_breaststroke, time_butterfly: s.time_butterfly });
        });
        teams.push(partialTeam);
      }

      // Finalize: set target times, sort members by medley order, set leg_order
      // v2.7.1: Flag teams with missing PBs so UI can warn
      teams.forEach(t => {
        const membersWithPB = t.members.filter(m => m.pb != null);
        const membersWithoutPB = t.members.filter(m => m.pb == null);
        t.target_time = membersWithPB.reduce((sum, m) => sum + m.pb, 0);
        t.has_missing_pb = membersWithoutPB.length > 0;
        t.missing_pb_count = membersWithoutPB.length;
        t.members.sort((a, b) => strokes.indexOf(a.stroke) - strokes.indexOf(b.stroke));
        t.members.forEach((m, idx) => m.leg_order = idx + 1);
      });

      // Sort team names alphabetically (Bryan's wishlist)
      teams.sort((a, b) => a.team_name.localeCompare(b.team_name));
      teams.forEach((t, i) => t.team_number = i + 1);
    }

    // v2.4.0 / BF2.6-17: relay handicap calculation
    // Normal relays: staggered start based on target PBs.
    // Medley relay: every team starts at 2 seconds, then nearest-to-target wins.
    const teamPBs = teams.map(t => {
      const members = t.members || [];
      return members.reduce((sum, m) => sum + (m.pb || 0), 0);
    });
    const validTeamPBs = teamPBs.filter(p => p > 0);
    const maxTeamPB = validTeamPBs.length ? Math.max(...validTeamPBs) : 0;
    const maxTime = maxTeamPB + BASE_OFFSET;

    teams.forEach((t, i) => {
      const teamPB = teamPBs[i];
      t.target_time = teamPB > 0 ? teamPB : null;
      if (race.race_type === 'medley_relay' || race.race_type === 'pogo' || race.race_type === '25m_brace' || race.race_type === '50m_brace') {
        // v2.7.4: Medley + Pogo + Brace: flat 2s start, nearest-to-target ranking
        t.start_delay = 2;
        t.max_time = teamPB > 0 ? teamPB + 2 : 2;
      } else {
        t.start_delay = teamPB > 0 ? maxTime - teamPB : 0;
        t.max_time = maxTime;
      }
    });

    res.json({ teams });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/races/:raceId/save-relay-teams
app.post('/api/races/:raceId/save-relay-teams', (req, res) => {
  try {
    const { teams } = req.body;
    if (!Array.isArray(teams)) return res.status(400).json({ error: 'teams array required' });
    const raceId = req.params.raceId;

    // R27 (v2.8.7): Drop teams with zero members before persisting so that
    // accidentally created manual teams do not pollute the database. Teams
    // with at least one member are kept even if incomplete — they show as
    // "not rankable" in Results so the user remains in control.
    const teamsToPersist = teams.filter(t => Array.isArray(t && t.members) && t.members.length > 0);
    // Renumber team_number so the persisted sequence stays 1..N after filtering.
    teamsToPersist.forEach((t, i) => {
      t.team_number = i + 1;
      if (t.team_name && /^Team \d+$/.test(t.team_name)) t.team_name = 'Team ' + (i + 1);
    });

    // Clear existing
    const existing = db.prepare('SELECT id FROM relay_team WHERE event_race_id = ?').all(raceId);
    const delMembers = db.prepare('DELETE FROM relay_team_member WHERE relay_team_id = ?');
    const delTeams = db.prepare('DELETE FROM relay_team WHERE event_race_id = ?');

    const insTeam = db.prepare('INSERT INTO relay_team (event_race_id, team_number, team_name, target_time, start_delay, max_time) VALUES (?, ?, ?, ?, ?, ?)');
    const insMember = db.prepare('INSERT INTO relay_team_member (relay_team_id, member_id, leg_order, stroke) VALUES (?, ?, ?, ?)');

    const batch = db.transaction(() => {
      existing.forEach(t => delMembers.run(t.id));
      delTeams.run(raceId);

      teamsToPersist.forEach(team => {
        const r = insTeam.run(raceId, team.team_number, team.team_name, team.target_time || null, team.start_delay || 0, team.max_time || null);
        const teamId = r.lastInsertRowid;
        // BF-5: Allow duplicate member_id (swim twice for uneven teams)
        (team.members || []).forEach(m => {
          if (m.member_id == null) return;
          insMember.run(teamId, m.member_id, m.leg_order, m.stroke || null);
        });
      });
    });

    batch();
    db.prepare("UPDATE event_race SET status = 'heats_generated' WHERE id = ?").run(raceId);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/races/:raceId/relay-teams
app.get('/api/races/:raceId/relay-teams', (req, res) => {
  try {
    const race = db.prepare('SELECT * FROM event_race WHERE id = ?').get(req.params.raceId);
    if (!race) return res.status(404).json({ error: 'Race not found' });

    const teams = db.prepare('SELECT * FROM relay_team WHERE event_race_id = ? ORDER BY team_number').all(req.params.raceId);
    const getMembers = db.prepare(`
      SELECT rtm.*, m.name, m.time_25m, m.time_50m, m.time_75m,
             m.time_backstroke, m.time_breaststroke, m.time_butterfly,
             a.special_event_entry
      FROM relay_team_member rtm
      JOIN member m ON rtm.member_id = m.id
      LEFT JOIN attendance a ON a.event_id = ? AND a.member_id = rtm.member_id
      WHERE rtm.relay_team_id = ?
      ORDER BY rtm.leg_order
    `);

    const result = teams.map(t => ({
      ...t,
      race_type: race.race_type,
      members: getMembers.all(race.event_id, t.id).map(m => ({
        ...m,
        auto: race.race_type === 'medley_relay' && (m.special_event_entry === 'Y')
      }))
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// R20 v2.8.4 — Bryan clarification: for special races winner = smallest |variance|.
// Standard relays (25m_relay) keep fastest total_time wins.
const SPECIAL_VARIANCE_RACES = ['25m_brace', '50m_brace', 'pogo', 'medley_relay'];
function rankScore(team, raceType) {
  if (SPECIAL_VARIANCE_RACES.includes(raceType)) {
    // Smallest absolute variance wins. null → large fallback so unset teams sort last.
    return team.variance != null ? Math.abs(team.variance) : 9999999;
  }
  // Standard relay: fastest total_time wins.
  return team.total_time ?? 9999999;
}
function rankTieValue(team, raceType) {
  if (SPECIAL_VARIANCE_RACES.includes(raceType)) {
    // Ranking is nearest-to-target by ABSOLUTE variance, and teams equally far from
    // target share a place. Bryan 2026-06-18: a team at +0.50 must tie a team at −0.50;
    // SYSTEM-SPEC §11: "kleinste |variance|, Gleichstand = gleicher Platz". So the tie
    // value is the absolute variance (same as rankScore), NOT the signed variance.
    // (Reverses the v2.12.2 signed-variance interpretation in commit 5128065, which
    // Bryan rejected on live v2.12.2.)
    return team.variance != null ? Math.abs(team.variance) : null;
  }
  return team.total_time ?? null;
}
function rankRelayTeams(raceId, raceType) {
  const allTeams = db.prepare('SELECT * FROM relay_team WHERE event_race_id = ? AND total_time IS NOT NULL').all(raceId);
  if (allTeams.length === 0) return;
  const scored = allTeams.map(t => ({ t, score: rankScore(t, raceType), tieValue: rankTieValue(t, raceType) }));
  scored.sort((a, b) => {
    const scoreCmp = a.score - b.score;
    if (scoreCmp !== 0) return scoreCmp;
    const tieCmp = (a.tieValue ?? 9999999) - (b.tieValue ?? 9999999);
    if (tieCmp !== 0) return tieCmp;
    return a.t.id - b.t.id;
  });
  const setPlace = db.prepare('UPDATE relay_team SET place = ? WHERE id = ?');
  let currentPlace = 0, prevScore = null, prevTieValue = null;
  scored.forEach((x, i) => {
    if (prevScore === null || x.score !== prevScore || x.tieValue !== prevTieValue) currentPlace = i + 1;
    setPlace.run(currentPlace, x.t.id);
    prevScore = x.score;
    prevTieValue = x.tieValue;
  });
  db.prepare('UPDATE relay_team SET place = NULL WHERE event_race_id = ? AND total_time IS NULL').run(raceId);
}

// PUT /api/relay-teams/:teamId/time
app.put('/api/relay-teams/:teamId/time', (req, res) => {
  try {
    const { total_time } = req.body;
    if (total_time == null || total_time < 0) return res.status(400).json({ error: 'total_time required' });

    const team = db.prepare('SELECT rt.*, er.race_type FROM relay_team rt JOIN event_race er ON rt.event_race_id = er.id WHERE rt.id = ?').get(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // v2.7.1: start_delay and target_time are WHOLE SECONDS, total_time is CENTISECONDS.
    // Convert whole seconds → centiseconds (*100) before arithmetic.
    const startDelayCs = (team.start_delay || 0) * 100;
    const targetTimeCs = (team.target_time || 0) * 100;
    const net_time = total_time - startDelayCs;
    let variance = null;
    if (team.target_time) {
      variance = net_time - targetTimeCs;
    }

    db.prepare('UPDATE relay_team SET total_time = ?, variance = ? WHERE id = ?').run(total_time, variance, req.params.teamId);

    // R6 + R20 v2.8.4: Live placing — special races rank by smallest |variance|,
    // standard relays by fastest total_time.
    rankRelayTeams(team.event_race_id, team.race_type);

    res.json({ ok: true, total_time, net_time, variance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/relay-teams/:teamId/member/:memberId/split
app.put('/api/relay-teams/:teamId/member/:memberId/split', (req, res) => {
  try {
    const { split_time } = req.body;
    if (split_time == null || split_time < 0) return res.status(400).json({ error: 'split_time required' });

    const member = db.prepare('SELECT * FROM relay_team_member WHERE relay_team_id = ? AND member_id = ?').get(req.params.teamId, req.params.memberId);
    if (!member) return res.status(404).json({ error: 'Team member not found' });

    db.prepare('UPDATE relay_team_member SET split_time = ? WHERE relay_team_id = ? AND member_id = ?').run(split_time, req.params.teamId, req.params.memberId);

    // Pogo auto-recalc: update team total_time + variance from member averages
    recalcPogoTeamIfNeeded(req.params.teamId);

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// v2.7.2: PUT /api/relay-teams/:teamId/member/:memberId/split2 — Pogo second timekeeper
app.put('/api/relay-teams/:teamId/member/:memberId/split2', (req, res) => {
  try {
    const { split_time_2 } = req.body;
    if (split_time_2 == null || split_time_2 < 0) return res.status(400).json({ error: 'split_time_2 required' });
    const member = db.prepare('SELECT * FROM relay_team_member WHERE relay_team_id = ? AND member_id = ?').get(req.params.teamId, req.params.memberId);
    if (!member) return res.status(404).json({ error: 'Team member not found' });
    db.prepare('UPDATE relay_team_member SET split_time_2 = ? WHERE relay_team_id = ? AND member_id = ?').run(split_time_2, req.params.teamId, req.params.memberId);

    // Pogo auto-recalc: update team total_time + variance from member averages
    recalcPogoTeamIfNeeded(req.params.teamId);

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Pogo: recalculate team total_time, variance, and live place after T1/T2 entry
function recalcPogoTeamIfNeeded(teamId) {
  const team = db.prepare('SELECT rt.*, er.race_type FROM relay_team rt JOIN event_race er ON rt.event_race_id = er.id WHERE rt.id = ?').get(teamId);
  if (!team || team.race_type !== 'pogo') return;

  const members = db.prepare('SELECT * FROM relay_team_member WHERE relay_team_id = ?').all(teamId);
  // Calculate sum of member averages (only members with both T1 and T2)
  let totalAvg = 0;
  let completeCount = 0;
  for (const m of members) {
    if (m.split_time != null && m.split_time_2 != null) {
      totalAvg += Math.round((m.split_time + m.split_time_2) / 2);
      completeCount++;
    }
  }

  if (completeCount === 0) return; // No complete pairs yet

  // Set team total_time to sum of completed averages
  const startDelayCs = (team.start_delay || 0) * 100;
  const targetTimeCs = (team.target_time || 0) * 100;
  const variance = targetTimeCs ? (totalAvg - targetTimeCs) : null;

  db.prepare('UPDATE relay_team SET total_time = ?, variance = ? WHERE id = ?').run(totalAvg, variance, teamId);

  // R6 + R20 v2.8.4: Pogo is a special race → rank by smallest |variance|.
  rankRelayTeams(team.event_race_id, team.race_type);
}

// POST /api/races/:raceId/rank-relay
app.post('/api/races/:raceId/rank-relay', (req, res) => {
  try {
    const race = db.prepare('SELECT * FROM event_race WHERE id = ?').get(req.params.raceId);
    if (!race) return res.status(404).json({ error: 'Race not found' });

    // R20 v2.8.4 — Bryan clarification: special races (brace, pogo, medley) use
    // smallest |variance| wins; standard relays use fastest total_time wins.
    const batch = db.transaction(() => rankRelayTeams(req.params.raceId, race.race_type));
    batch();

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  START SERVER
// ════════════════════════════════════════════════════════

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏊 WWSC Swimming App running at http://0.0.0.0:${PORT}`);
});
