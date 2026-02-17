/**
 * WWSC Swimming Event Management — Express Server
 * Single-admin local app, no auth needed.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { db, createBackup } = require('./db');

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
        start_delay: maxTime - s.handicap_time
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
