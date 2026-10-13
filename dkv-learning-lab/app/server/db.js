// db.js — Inisialisasi SQLite + skema + helper. DKV Learning Lab.
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
export const DB_PATH = process.env.DKV_DB || path.join(DATA_DIR, "dkv.db");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('siswa','guru','admin')),
  nama_lengkap TEXT NOT NULL,
  nis_nip TEXT,
  kelas_id INTEGER REFERENCES classes(id),
  aktif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  tingkat TEXT,
  tahun_ajaran TEXT,
  wali_guru_id INTEGER REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS weeks (
  nomor INTEGER PRIMARY KEY,
  semester INTEGER NOT NULL,
  tema TEXT NOT NULL,
  sumber TEXT,
  payload TEXT NOT NULL,
  diupdate_oleh INTEGER,
  diupdate_pada TEXT
);
CREATE TABLE IF NOT EXISTS learning_controls (
  class_id INTEGER NOT NULL REFERENCES classes(id),
  meeting_key TEXT NOT NULL,
  menu_key TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_by INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (class_id, meeting_key, menu_key)
);
CREATE TABLE IF NOT EXISTS learning_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL REFERENCES classes(id),
  week_nomor INTEGER,
  meeting_key TEXT,
  status TEXT NOT NULL DEFAULT 'none',
  allow_simulation INTEGER NOT NULL DEFAULT 1,
  lock_navigation INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by INTEGER
);
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_nomor INTEGER NOT NULL,
  meeting_key TEXT,
  tipe TEXT NOT NULL DEFAULT 'lkpd',
  judul TEXT NOT NULL,
  deskripsi TEXT,
  bobot REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  soal TEXT,
  due_at TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  jawaban TEXT,
  skor REAL,
  umpan_balik TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  revisi_ke INTEGER NOT NULL DEFAULT 1,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  graded_by INTEGER,
  graded_at TEXT,
  UNIQUE (assignment_id, user_id)
);
CREATE TABLE IF NOT EXISTS portfolio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  week_nomor INTEGER,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  tahap TEXT,
  karya TEXT,
  umpan_balik TEXT,
  revisi_ke INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  week_nomor INTEGER,
  tipe TEXT NOT NULL DEFAULT 'siswa',
  isi TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER NOT NULL REFERENCES users(id),
  week_nomor INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum',
  aktivitas TEXT,
  completed_at TEXT,
  PRIMARY KEY (user_id, week_nomor)
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER REFERENCES classes(id),
  judul TEXT NOT NULL,
  isi TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS supervision (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guru_id INTEGER REFERENCES users(id),
  kelas_id INTEGER REFERENCES classes(id),
  week_nomor INTEGER,
  tanggal TEXT,
  skor TEXT,
  catatan TEXT,
  rekomendasi TEXT,
  tindak_lanjut TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS supervision_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kode TEXT NOT NULL,
  aspek_kode TEXT NOT NULL,
  aspek_nama TEXT NOT NULL,
  nama TEXT NOT NULL,
  deskriptor TEXT,
  urutan INTEGER NOT NULL DEFAULT 0,
  aktif INTEGER NOT NULL DEFAULT 1,
  sumber TEXT,
  diubah_oleh INTEGER REFERENCES users(id),
  diubah_pada TEXT
);
CREATE TABLE IF NOT EXISTS meeting_docs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_nomor INTEGER NOT NULL,
  meeting_key TEXT NOT NULL,
  tujuan TEXT,
  memahami TEXT,
  mengaplikasi TEXT,
  merefleksi TEXT,
  prinsip TEXT,
  bukti TEXT,
  catatan_observasi TEXT,
  refleksi_guru TEXT,
  tindak_lanjut TEXT,
  status TEXT NOT NULL DEFAULT 'draf',
  diubah_oleh INTEGER REFERENCES users(id),
  diubah_pada TEXT,
  UNIQUE (week_nomor, meeting_key)
);
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  role TEXT,
  aksi TEXT NOT NULL,
  target TEXT,
  detail TEXT,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS login_attempts (
  kunci TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  first_at TEXT NOT NULL DEFAULT (datetime('now')),
  locked_until TEXT
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  week_nomor INTEGER NOT NULL,
  meeting_key TEXT NOT NULL,
  skor INTEGER NOT NULL,
  total INTEGER NOT NULL,
  jawaban TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sim_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  sim_id TEXT NOT NULL,
  tingkat INTEGER NOT NULL,
  skor INTEGER NOT NULL,
  maks INTEGER NOT NULL,
  rincian TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  week_nomor INTEGER NOT NULL,
  meeting_key TEXT NOT NULL,
  tipe TEXT NOT NULL,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  bobot INTEGER DEFAULT 0,
  nilai_otomatis TEXT DEFAULT 'tidak',
  perlu_konfirmasi INTEGER DEFAULT 1,
  kktp INTEGER DEFAULT 75,
  kesempatan_revisi INTEGER DEFAULT 1,
  jumlah_butir INTEGER DEFAULT 0,
  butir TEXT,
  kriteria TEXT,
  rubrik TEXT,
  remedial TEXT,
  pengayaan TEXT,
  luaran TEXT,
  langkah TEXT,
  bukti TEXT,
  sumber TEXT,
  diubah_oleh INTEGER,
  diubah_pada TEXT
);

CREATE TABLE IF NOT EXISTS assessment_work (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draf',
  jawaban TEXT,
  skor_butir INTEGER,
  total_butir INTEGER,
  skor_rincian TEXT,
  skor INTEGER,
  komentar TEXT,
  revisi_ke INTEGER DEFAULT 0,
  dinilai_oleh INTEGER,
  dinilai_pada TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (assessment_id, user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
`;
db.exec(SCHEMA);

// ---------- helpers ----------
export function log(user, aksi, target, detail, ip) {
  db.prepare("INSERT INTO activity_logs (user_id, role, aksi, target, detail, ip) VALUES (?,?,?,?,?,?)")
    .run(user?.id ?? null, user?.role ?? null, aksi, target ?? null, detail ? JSON.stringify(detail) : null, ip ?? null);
}
export function getSetting(key, fallback = null) {
  const row = db.prepare("SELECT value FROM settings WHERE key=?").get(key);
  return row ? JSON.parse(row.value) : fallback;
}
export function setSetting(key, value) {
  db.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(key, JSON.stringify(value));
}
export function newToken() { return crypto.randomBytes(32).toString("hex"); }
export function createSession(userId, hours = 12) {
  const token = newToken();
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?, datetime('now', ?))")
    .run(token, userId, `+${hours} hours`);
  return token;
}
export function sessionUser(token) {
  if (!token) return null;
  const row = db.prepare(`SELECT s.token, s.expires_at, u.id, u.username, u.role, u.nama_lengkap, u.kelas_id, u.nis_nip
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token=? AND s.expires_at > datetime('now') AND u.aktif=1`).get(token);
  return row || null;
}
export function destroySession(token) { db.prepare("DELETE FROM sessions WHERE token=?").run(token); }
export function purgeExpiredSessions() { db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run(); }

// login rate limit: maks 5 gagal / 15 menit per username+ip
// (ambang `maks` dapat dinaikkan untuk penjaga lintas-IP, lihat pemakaian di index.js)
export function checkLoginAllowed(kunci, maks = 5) {
  const row = db.prepare("SELECT * FROM login_attempts WHERE kunci=?").get(kunci);
  if (!row) return { allowed: true };
  if (row.locked_until && new Date(row.locked_until.replace(" ", "T") + "Z") > new Date())
    return { allowed: false, until: row.locked_until };
  const first = new Date(row.first_at.replace(" ", "T") + "Z").getTime();
  if (Date.now() - first > 15 * 60 * 1000) {
    db.prepare("DELETE FROM login_attempts WHERE kunci=?").run(kunci);
    return { allowed: true };
  }
  if (row.count >= maks) {
    const until = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    db.prepare("UPDATE login_attempts SET locked_until=? WHERE kunci=?").run(until, kunci);
    return { allowed: false, until };
  }
  return { allowed: true };
}
export function recordLoginFail(kunci) {
  db.prepare(`INSERT INTO login_attempts (kunci, count) VALUES (?,1)
    ON CONFLICT(kunci) DO UPDATE SET count = CASE WHEN locked_until IS NULL THEN count+1 ELSE count END`)
    .run(kunci);
}
export function clearLoginFails(kunci) { db.prepare("DELETE FROM login_attempts WHERE kunci=?").run(kunci); }

export const MENU_KEYS = [
  "dashboard", "materi", "pertemuan", "simulasi", "lkpd", "kuis", "portofolio", "referensi", "navigasi"
];

// Kontrol default & helper
export function ensureControls(classId, meetingKey) {
  for (const menu of MENU_KEYS) {
    db.prepare(`INSERT OR IGNORE INTO learning_controls (class_id, meeting_key, menu_key, enabled)
      VALUES (?,?,?,1)`).run(classId, meetingKey, menu);
  }
}
export function getControls(classId, meetingKey) {
  ensureControls(classId, meetingKey);
  const rows = db.prepare("SELECT menu_key, enabled FROM learning_controls WHERE class_id=? AND meeting_key=?").all(classId, meetingKey);
  return Object.fromEntries(rows.map(r => [r.menu_key, !!r.enabled]));
}
export function setControl(classId, meetingKey, menuKey, enabled, byUser) {
  ensureControls(classId, meetingKey);
  db.prepare(`UPDATE learning_controls SET enabled=?, updated_by=?, updated_at=datetime('now')
    WHERE class_id=? AND meeting_key=? AND menu_key=?`).run(enabled ? 1 : 0, byUser?.id ?? null, classId, meetingKey, menuKey);
}
export function getSession(classId) {
  let row = db.prepare("SELECT * FROM learning_sessions WHERE class_id=? ORDER BY id DESC LIMIT 1").get(classId);
  if (!row) {
    db.prepare("INSERT INTO learning_sessions (class_id, status) VALUES (?, 'none')").run(classId);
    row = db.prepare("SELECT * FROM learning_sessions WHERE class_id=? ORDER BY id DESC LIMIT 1").get(classId);
  }
  return row;
}
export function loadKurikulum() {
  const rows = db.prepare("SELECT nomor, payload FROM weeks ORDER BY nomor").all();
  return rows.map(r => JSON.parse(r.payload));
}
