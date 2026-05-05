import * as SQLite from 'expo-sqlite';

let db;

export function getDB() {
  if (!db) {
    db = SQLite.openDatabaseSync('onetouch.db');
  }
  return db;
}

export function initDB() {
  const database = getDB();
  database.execSync(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bpm INTEGER NOT NULL,
      wellness_score INTEGER NOT NULL,
      zone TEXT NOT NULL,
      ai_message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function saveScan({ bpm, wellness_score, zone, ai_message }) {
  const database = getDB();
  const created_at = new Date().toISOString();
  database.runSync(
    'INSERT INTO scans (bpm, wellness_score, zone, ai_message, created_at) VALUES (?, ?, ?, ?, ?)',
    [bpm, wellness_score, zone, ai_message, created_at]
  );
}

export function getScans(limit = 30) {
  const database = getDB();
  return database.getAllSync(
    'SELECT * FROM scans ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

export function getTodayScanCount() {
  const database = getDB();
  const today = new Date().toISOString().split('T')[0];
  const result = database.getFirstSync(
    "SELECT COUNT(*) as count FROM scans WHERE created_at LIKE ?",
    [`${today}%`]
  );
  return result?.count ?? 0;
}

export function getLatestScan() {
  const database = getDB();
  return database.getFirstSync(
    'SELECT * FROM scans ORDER BY created_at DESC LIMIT 1'
  );
}
