/**
 * WWSC Seed Script — Loads demo data from Bryan's club if DB is empty.
 * v2.4.0: All PB values in centiseconds with realistic hundredths.
 */
const { db } = require('./db');

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM member').get().c;
  if (count > 0) {
    console.log(`📋 DB already has ${count} members — skipping seed.`);
    return;
  }

  console.log('🌱 Seeding demo data (WWSC Winter Weakies Swimming Club)...');

  // Real members from Bryan's Excel with realistic handicap times (centiseconds)
  // 1312 = 13.12 seconds. Scaled 50m/75m/strokes proportionally with realistic variation.
  const members = [
    { name: 'Bryan Hesketh',    t25: 1312, t50: 3178, t75: 5192, back: 3589, breast: 3812, fly: 4234 },
    { name: 'Felicia O\'Brien', t25: 1622, t50: 3834, t75: 6245, back: 4423, breast: 4178, fly: 5034 },
    { name: 'Glenne Murray',    t25: 2145, t50: 4923, t75: 7834, back: 5512, breast: 5389, fly: 6523 },
    { name: 'Ben Chandler',     t25: 1389, t50: 3312, t75: 5423, back: 3723, breast: 3934, fly: 4312 },
    { name: 'Mark Thompson',    t25: 1534, t50: 3523, t75: 5734, back: 4012, breast: 4123, fly: 4623 },
    { name: 'Steve Collins',    t25: 1712, t50: 4023, t75: 6412, back: 4534, breast: 4612, fly: 5223 },
    { name: 'Jenny Walsh',      t25: 1823, t50: 4212, t75: 6734, back: 4712, breast: 4834, fly: 5534 },
    { name: 'Peter Davidson',   t25: 1411, t50: 3412, t75: 5523, back: 3823, breast: 4023, fly: 4412 },
    { name: 'Lisa Chen',        t25: 1598, t50: 3723, t75: 6023, back: 4212, breast: 4312, fly: 4923 },
    { name: 'David Hughes',     t25: 1923, t50: 4423, t75: 7023, back: 5023, breast: 4923, fly: 5823 },
    { name: 'Karen Mitchell',   t25: 2034, t50: 4623, t75: 7412, back: 5223, breast: 5123, fly: 6134 },
    { name: 'Rob Stewart',      t25: 1523, t50: 3612, t75: 5834, back: 4123, breast: 4212, fly: 4723 },
    { name: 'Sandra Blake',     t25: 2256, t50: 5034, t75: 8023, back: 5612, breast: 5523, fly: 6623 },
    { name: 'Tom Richards',     t25: 1289, t50: 3112, t75: 5034, back: 3512, breast: 3712, fly: 4123 },
    { name: 'Michelle Lee',     t25: 1745, t50: 4112, t75: 6523, back: 4623, breast: 4712, fly: 5334 },
    { name: 'Greg Patterson',   t25: 1612, t50: 3823, t75: 6134, back: 4323, breast: 4412, fly: 5023 },
    { name: 'Wendy Cooper',     t25: 1934, t50: 4334, t75: 6923, back: 4923, breast: 4823, fly: 5723 },
    { name: 'James Morton',     t25: 1378, t50: 3323, t75: 5312, back: 3712, breast: 3923, fly: 4323 },
    { name: 'Diane Foster',     t25: 2123, t50: 4823, t75: 7623, back: 5412, breast: 5323, fly: 6334 },
    { name: 'Paul Nguyen',      t25: 1512, t50: 3612, t75: 5723, back: 4023, breast: 4123, fly: 4723 },
    { name: 'Helen Sharp',      t25: 1834, t50: 4223, t75: 6623, back: 4723, breast: 4623, fly: 5423 },
    { name: 'Andrew Barnes',    t25: 1623, t50: 3923, t75: 6234, back: 4412, breast: 4523, fly: 5123 },
    { name: 'Sue Williams',     t25: 2045, t50: 4723, t75: 7523, back: 5323, breast: 5212, fly: 6223 },
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

module.exports = { seedIfEmpty };
