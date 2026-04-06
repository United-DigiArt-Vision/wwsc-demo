/**
 * WWSC Seed Script — Loads demo data from Bryan's club if DB is empty.
 * v2.6.0: All PB values in WHOLE SECONDS (e.g. 13 = 13 seconds).
 */
const { db } = require('./db');

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM member').get().c;
  if (count > 0) {
    console.log(`📋 DB already has ${count} members — skipping seed.`);
    return;
  }

  console.log('🌱 Seeding demo data (WWSC Winter Weakies Swimming Club)...');

  // Real members from Bryan's Excel with PB times in WHOLE SECONDS
  const members = [
    { name: 'Bryan Hesketh',    t25: 13, t50: 32, t75: 52, back: 36, breast: 38, fly: 42 },
    { name: 'Felicia O\'Brien', t25: 16, t50: 38, t75: 62, back: 44, breast: 42, fly: 50 },
    { name: 'Glenne Murray',    t25: 21, t50: 49, t75: 78, back: 55, breast: 54, fly: 65 },
    { name: 'Ben Chandler',     t25: 14, t50: 33, t75: 54, back: 37, breast: 39, fly: 43 },
    { name: 'Mark Thompson',    t25: 15, t50: 35, t75: 57, back: 40, breast: 41, fly: 46 },
    { name: 'Steve Collins',    t25: 17, t50: 40, t75: 64, back: 45, breast: 46, fly: 52 },
    { name: 'Jenny Walsh',      t25: 18, t50: 42, t75: 67, back: 47, breast: 48, fly: 55 },
    { name: 'Peter Davidson',   t25: 14, t50: 34, t75: 55, back: 38, breast: 40, fly: 44 },
    { name: 'Lisa Chen',        t25: 16, t50: 37, t75: 60, back: 42, breast: 43, fly: 49 },
    { name: 'David Hughes',     t25: 19, t50: 44, t75: 70, back: 50, breast: 49, fly: 58 },
    { name: 'Karen Mitchell',   t25: 20, t50: 46, t75: 74, back: 52, breast: 51, fly: 61 },
    { name: 'Rob Stewart',      t25: 15, t50: 36, t75: 58, back: 41, breast: 42, fly: 47 },
    { name: 'Sandra Blake',     t25: 23, t50: 50, t75: 80, back: 56, breast: 55, fly: 66 },
    { name: 'Tom Richards',     t25: 13, t50: 31, t75: 50, back: 35, breast: 37, fly: 41 },
    { name: 'Michelle Lee',     t25: 17, t50: 41, t75: 65, back: 46, breast: 47, fly: 53 },
    { name: 'Greg Patterson',   t25: 16, t50: 38, t75: 61, back: 43, breast: 44, fly: 50 },
    { name: 'Wendy Cooper',     t25: 19, t50: 43, t75: 69, back: 49, breast: 48, fly: 57 },
    { name: 'James Morton',     t25: 14, t50: 33, t75: 53, back: 37, breast: 39, fly: 43 },
    { name: 'Diane Foster',     t25: 21, t50: 48, t75: 76, back: 54, breast: 53, fly: 63 },
    { name: 'Paul Nguyen',      t25: 15, t50: 36, t75: 57, back: 40, breast: 41, fly: 47 },
    { name: 'Helen Sharp',      t25: 18, t50: 42, t75: 66, back: 47, breast: 46, fly: 54 },
    { name: 'Andrew Barnes',    t25: 16, t50: 39, t75: 62, back: 44, breast: 45, fly: 51 },
    { name: 'Sue Williams',     t25: 20, t50: 47, t75: 75, back: 53, breast: 52, fly: 62 },
  ];

  const insert = db.prepare(`
    INSERT INTO member (name, joined_date, time_25m, time_50m, time_75m, time_backstroke, time_breaststroke, time_butterfly)
    VALUES (?, '2025-05-01', ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = db.transaction(() => {
    members.forEach(m => {
      insert.run(m.name, m.t25, m.t50, m.t75, m.back, m.breast, m.fly);
    });
  });

  insertAll();
  console.log(`✅ Seeded ${members.length} members.`);
}

// v2.6.0: Migrate existing centisecond PBs to whole seconds
function migrateToWholeSeconds() {
  // Check if migration needed: if any PB > 200, they're likely centiseconds
  const sample = db.prepare('SELECT time_25m FROM member WHERE time_25m IS NOT NULL LIMIT 1').get();
  if (!sample || sample.time_25m <= 200) return; // Already whole seconds or empty

  console.log('🔄 Migrating PB times from centiseconds to whole seconds...');
  const cols = ['time_25m', 'time_50m', 'time_75m', 'time_backstroke', 'time_breaststroke', 'time_butterfly'];
  const migrate = db.transaction(() => {
    cols.forEach(col => {
      db.prepare(`UPDATE member SET ${col} = ROUND(${col} / 100.0) WHERE ${col} IS NOT NULL`).run();
    });
    // Also migrate season_start_times if they exist
    try {
      cols.forEach(col => {
        const sCol = col.replace('time_', 'season_start_');
        db.prepare(`UPDATE member SET ${sCol} = ROUND(${sCol} / 100.0) WHERE ${sCol} IS NOT NULL`).run();
      });
    } catch(e) { /* season columns may not exist */ }
    // Migrate heat_lane handicap_time and start_delay
    db.prepare(`UPDATE heat_lane SET handicap_time = ROUND(handicap_time / 100.0), start_delay = ROUND(start_delay / 100.0) WHERE handicap_time > 200`).run();
  });
  migrate();
  console.log('✅ PB migration complete — all times now in whole seconds.');
}

module.exports = { seedIfEmpty, migrateToWholeSeconds };
