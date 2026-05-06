/**
 * WWSC Swimming — Database Layer
 * SQLite via better-sqlite3 (synchronous)
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// v2.8.12: Hosted deployments need persistent storage.
// Default stays repo-local for development, but Render/production can set
// WWSC_DB_PATH=/var/data/wwsc.db on a persistent disk.
const configuredDbPath = process.env.WWSC_DB_PATH ? path.resolve(process.env.WWSC_DB_PATH) : null;
const DATA_DIR = process.env.WWSC_DATA_DIR
  ? path.resolve(process.env.WWSC_DATA_DIR)
  : (configuredDbPath ? path.dirname(configuredDbPath) : path.join(__dirname, 'data'));
const BACKUP_DIR = process.env.WWSC_BACKUP_DIR
  ? path.resolve(process.env.WWSC_BACKUP_DIR)
  : path.join(DATA_DIR, 'backups');
const DB_PATH = configuredDbPath || path.join(DATA_DIR, 'wwsc.db');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS member (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT NOT NULL,
      is_active         INTEGER NOT NULL DEFAULT 1,
      joined_date       TEXT,
      time_25m          INTEGER,
      time_50m          INTEGER,
      time_75m          INTEGER,
      time_backstroke   INTEGER,
      time_breaststroke INTEGER,
      time_butterfly    INTEGER
    );

    CREATE TABLE IF NOT EXISTS event (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      date            TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'setup',
      created_at      TEXT NOT NULL,
      standard_event  TEXT DEFAULT 'ordinary_swim',
      special_event   TEXT
    );

    CREATE TABLE IF NOT EXISTS event_race (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id  INTEGER NOT NULL REFERENCES event(id),
      race_type TEXT NOT NULL,
      status    TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id            INTEGER NOT NULL REFERENCES event(id),
      member_id           INTEGER NOT NULL REFERENCES member(id),
      present             INTEGER NOT NULL DEFAULT 0,
      special_event_entry TEXT,
      UNIQUE(event_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS heat (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      event_race_id INTEGER NOT NULL REFERENCES event_race(id),
      heat_number   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS heat_lane (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      heat_id       INTEGER NOT NULL REFERENCES heat(id),
      lane_number   INTEGER NOT NULL,
      member_id     INTEGER NOT NULL REFERENCES member(id),
      handicap_time INTEGER NOT NULL,
      start_delay   INTEGER NOT NULL,
      finish_time   INTEGER,
      net_time      INTEGER,
      variance      INTEGER,
      place         INTEGER,
      is_break      INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS relay_team (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      event_race_id INTEGER NOT NULL REFERENCES event_race(id),
      team_number   INTEGER NOT NULL,
      team_name     TEXT,
      total_time    INTEGER,
      target_time   INTEGER,
      variance      INTEGER,
      place         INTEGER
    );

    CREATE TABLE IF NOT EXISTS relay_team_member (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      relay_team_id INTEGER NOT NULL REFERENCES relay_team(id),
      member_id     INTEGER NOT NULL REFERENCES member(id),
      leg_order     INTEGER NOT NULL,
      stroke        TEXT,
      split_time    INTEGER
    );

    CREATE TABLE IF NOT EXISTS pointscore_entry (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      event_race_id INTEGER NOT NULL REFERENCES event_race(id),
      member_id     INTEGER NOT NULL REFERENCES member(id),
      points        INTEGER NOT NULL DEFAULT 0,
      UNIQUE(event_race_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS time_history (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id     INTEGER NOT NULL REFERENCES member(id),
      event_id      INTEGER NOT NULL REFERENCES event(id),
      stroke        TEXT NOT NULL,
      time          INTEGER NOT NULL,
      is_break      INTEGER NOT NULL DEFAULT 0,
      previous_best INTEGER
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
    CREATE INDEX IF NOT EXISTS idx_heat_lane_heat ON heat_lane(heat_id);
    CREATE INDEX IF NOT EXISTS idx_heat_event_race ON heat(event_race_id);
    CREATE INDEX IF NOT EXISTS idx_event_race_event ON event_race(event_id);
    CREATE INDEX IF NOT EXISTS idx_pointscore_member ON pointscore_entry(member_id);
    CREATE INDEX IF NOT EXISTS idx_time_history_member ON time_history(member_id);
  `);
}

// ── Backup ──────────────────────────────────────────────
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `wwsc_backup_${timestamp}.db`);
  db.backup(backupPath);

  // Keep only last 20 backups
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('wwsc_backup_') && f.endsWith('.db'))
    .sort();
  while (backups.length > 20) {
    fs.unlinkSync(path.join(BACKUP_DIR, backups.shift()));
  }
  return backupPath;
}

initSchema();

// ── Migrations ──────────────────────────────────────────
function runMigrations() {
  // Add season_start columns to member (safe: checks if column exists first)
  const cols = db.prepare("PRAGMA table_info(member)").all().map(c => c.name);
  const seasonCols = [
    'season_start_25m', 'season_start_50m', 'season_start_75m',
    'season_start_backstroke', 'season_start_breaststroke', 'season_start_butterfly'
  ];
  seasonCols.forEach(col => {
    if (!cols.includes(col)) {
      db.exec(`ALTER TABLE member ADD COLUMN ${col} INTEGER`);
    }
  });

  // Add archived column for soft-delete
  const eventColsPre = db.prepare("PRAGMA table_info(event)").all().map(c => c.name);
  if (!eventColsPre.includes('archived')) {
    db.exec("ALTER TABLE event ADD COLUMN archived INTEGER DEFAULT 0");
  }

  // Add event config columns
  const eventCols = db.prepare("PRAGMA table_info(event)").all().map(c => c.name);
  if (!eventCols.includes('standard_event')) {
    db.exec("ALTER TABLE event ADD COLUMN standard_event TEXT DEFAULT 'ordinary_swim'");
  }
  if (!eventCols.includes('special_event')) {
    db.exec("ALTER TABLE event ADD COLUMN special_event TEXT");
  }

  // Add special_event_entry to attendance
  const attCols = db.prepare("PRAGMA table_info(attendance)").all().map(c => c.name);
  if (!attCols.includes('special_event_entry')) {
    db.exec("ALTER TABLE attendance ADD COLUMN special_event_entry TEXT");
  }

  // v2.4.0: Add manual_place to heat_lane
  const hlCols = db.prepare("PRAGMA table_info(heat_lane)").all().map(c => c.name);
  if (!hlCols.includes('manual_place')) {
    db.exec("ALTER TABLE heat_lane ADD COLUMN manual_place INTEGER");
  }

  // v2.4.0: Add start_delay and max_time to relay_team
  const rtCols = db.prepare("PRAGMA table_info(relay_team)").all().map(c => c.name);
  if (!rtCols.includes('start_delay')) {
    db.exec("ALTER TABLE relay_team ADD COLUMN start_delay INTEGER DEFAULT 0");
  }
  if (!rtCols.includes('max_time')) {
    db.exec("ALTER TABLE relay_team ADD COLUMN max_time INTEGER");
  }

  // v2.7.2: Pogo uses 2 timekeepers — add second time columns
  if (!hlCols.includes('finish_time_2')) {
    db.exec("ALTER TABLE heat_lane ADD COLUMN finish_time_2 INTEGER");
  }
  const rtmCols = db.prepare("PRAGMA table_info(relay_team_member)").all().map(c => c.name);
  if (!rtmCols.includes('split_time_2')) {
    db.exec("ALTER TABLE relay_team_member ADD COLUMN split_time_2 INTEGER");
  }

  // v2.6.0: PB times are now WHOLE SECONDS (not centiseconds).
  // Old v2.4.0 centisecond migration removed — no longer needed.
}

runMigrations();

module.exports = { db, createBackup, DB_PATH };
