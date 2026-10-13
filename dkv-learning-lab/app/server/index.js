// index.js — Server DKV Learning Lab (Express + SQLite)
import express from "express";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
import {
  db, log, getSetting, setSetting, createSession, sessionUser, destroySession, purgeExpiredSessions,
  checkLoginAllowed, recordLoginFail, clearLoginFails, MENU_KEYS, getControls, setControl, getSession, loadKurikulum
} from "./db.js";
import { seed } from "./seed.js";
import { registerAsesmen } from "./asesmen.js";
import { registerSupervisi } from "./supervisi.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
// Mode daring untuk pemasangan di internet — lihat docs/13-panduan-online.md
//   DKV_ONLINE=1      → header pemblokir bingkai + HSTS (hanya saat di belakang HTTPS)
//   DKV_TRUST_PROXY=1 → percayai X-Forwarded-For dari reverse proxy (Caddy/nginx).
//                       Tanpa ini header tersebut DIABAIKAN sehingga IP pemanggil tidak dapat dipalsukan.
//   DKV_FRAME_ANCESTORS="https://sites.google.com https://*.googleusercontent.com"
//                     → daftar asal yang BOLEH menyematkan aplikasi dalam bingkai (mis. Google Sites).
//                       Bila diisi, header X-Frame-Options tidak dikirim dan CSP frame-ancestors memakai
//                       daftar tersebut. Bila TIDAK diisi, aplikasi tetap menolak disematkan saat mode daring.
const ONLINE = ["1", "true", "ya", "on"].includes(String(process.env.DKV_ONLINE || "").toLowerCase());
const TRUST_PROXY = String(process.env.DKV_TRUST_PROXY || "").trim();
const FRAME_ANCESTORS = String(process.env.DKV_FRAME_ANCESTORS || "").trim();
const MULAI = Date.now();
const app = express();
if (TRUST_PROXY) app.set("trust proxy", /^\d+$/.test(TRUST_PROXY) ? Number(TRUST_PROXY) : TRUST_PROXY);
app.use(express.json({ limit: "2mb" }));
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (FRAME_ANCESTORS) {
    // Aplikasi sengaja diizinkan disematkan HANYA oleh asal pada daftar (mis. Google Sites / domain sekolah).
    // X-Frame-Options TIDAK dikirim karena tidak mendukung daftar izin; batasnya dijaga CSP frame-ancestors.
    res.setHeader("Content-Security-Policy", `frame-ancestors ${FRAME_ANCESTORS}; base-uri 'self'; object-src 'none'`);
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  } else if (ONLINE) {
    // Sengaja hanya di mode daring: header ini memblokir penampilan aplikasi di dalam bingkai,
    // sehingga dimatikan saat dijalankan lokal untuk pratinjau/uji.
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
});

seed();

// ---------- util ----------
function parseCookies(req) {
  const h = req.headers.cookie || "";
  return Object.fromEntries(h.split(";").map(s => s.trim().split("=")).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]));
}
function auth(req, res, next) {
  const token = parseCookies(req).dkv_token || req.headers["x-dkv-token"];
  const user = sessionUser(token);
  if (!user) return res.status(401).json({ error: "Sesi tidak valid. Silakan login kembali." });
  req.user = user; req.token = token;
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Anda tidak memiliki hak akses untuk tindakan ini." });
    next();
  };
}
// IP pemanggil. X-Forwarded-For HANYA dipakai bila DKV_TRUST_PROXY disetel (aplikasi di belakang
// reverse proxy). Sebelumnya header itu selalu dipercaya sehingga siapa pun dapat memalsukan IP-nya
// dan melewati pembatasan percobaan login 5 kali/15 menit.
const ip = (req) => {
  const alamat = TRUST_PROXY ? (req.ip || req.socket.remoteAddress) : req.socket.remoteAddress;
  return String(alamat || "-").replace(/^::ffff:/, "").replace(/^::1$/, "127.0.0.1");
};

function kelasSiswa(user) {
  return db.prepare("SELECT * FROM classes WHERE id=?").get(user.kelas_id);
}
function pekanBerjalan() { return getSetting("pekan_berjalan", 1); }
function activeMeeting(user) {
  const kelas = kelasSiswa(user);
  if (!kelas) return { kelas: null, week: pekanBerjalan(), meeting: "senin", status: "none" };
  const s = getSession(kelas.id);
  const running = ["running", "paused"].includes(s.status) && s.week_nomor;
  return running
    ? { kelas, week: s.week_nomor, meeting: s.meeting_key || "senin", status: s.status, sesi: s }
    : { kelas, week: pekanBerjalan(), meeting: "senin", status: s.status === "ended" ? "ended" : s.status, sesi: s };
}
// Aturan akses materi siswa (dicek di server — bukan hanya menyembunyikan tombol)
function studentAccess(user, weekNomor) {
  const am = activeMeeting(user);
  const controls = getControls(am.kelas.id, am.meeting);
  const week = db.prepare("SELECT nomor FROM weeks WHERE nomor=?").get(weekNomor);
  if (!week) return { allowed: false, reason: "Minggu tidak ditemukan." };
  if (am.sesi && am.sesi.lock_navigation && weekNomor !== am.week)
    return { allowed: false, reason: "Guru mengunci navigasi ke materi lain pada sesi ini.", am, controls };
  if (weekNomor === am.week)
    return { allowed: controls.materi, reason: controls.materi ? null : "Menu Materi belum dibuka oleh guru.", am, controls };
  // Di luar minggu aktif, materi hanya terbuka bila Menu Materi DAN navigasi dibuka guru.
  if (!controls.materi)
    return { allowed: false, reason: "Menu Materi belum dibuka oleh guru.", am, controls };
  if (weekNomor < am.week) {
    if (controls.navigasi) return { allowed: true, reason: null, am, controls };
    return { allowed: false, reason: "Menu navigasi minggu sebelumnya belum dibuka oleh guru.", am, controls };
  }
  if (controls.navigasi && (!am.sesi || !am.sesi.lock_navigation)) return { allowed: true, reason: null, am, controls };
  return { allowed: false, reason: "Materi minggu berikutnya belum dibuka oleh guru.", am, controls };
}

// ---------- autentikasi ----------
// Pemantauan sederhana (tanpa autentikasi, tanpa data pribadi) — dipakai layanan uptime.
app.get("/api/health", (req, res) => {
  let basis = "ok";
  try { db.prepare("SELECT 1").get(); } catch { basis = "galat"; }
  res.json({
    ok: basis === "ok", aplikasi: "DKV Learning Lab", mode_daring: ONLINE,
    waktu: new Date().toISOString(), uptime_detik: Math.round((Date.now() - MULAI) / 1000),
    basis_data: basis,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password, sebagai } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Username dan password wajib diisi." });
  const kunci = `${String(username).toLowerCase()}|${ip(req)}`;
  const kunciLintasIp = `${String(username).toLowerCase()}|*`;   // penjaga brute force lintas-IP
  const cek = checkLoginAllowed(kunci);
  const cekLintasIp = checkLoginAllowed(kunciLintasIp, 15);
  if (!cek.allowed || !cekLintasIp.allowed)
    return res.status(429).json({ error: `Terlalu banyak percobaan gagal. Coba lagi setelah ${cekLintasIp.allowed ? cek.until : cekLintasIp.until} UTC.` });
  const row = db.prepare("SELECT * FROM users WHERE lower(username)=lower(?) AND aktif=1").get(username);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    recordLoginFail(kunci);
    recordLoginFail(kunciLintasIp);
    log(null, "login_gagal", username, { sebagai }, ip(req));
    return res.status(401).json({ error: "Username atau password salah." });
  }
  if (sebagai === "guru" && row.role === "siswa")
    return res.status(403).json({ error: "Akun siswa tidak dapat membuka Mode Guru." });
  if (sebagai === "siswa" && row.role !== "siswa")
    return res.status(403).json({ error: "Gunakan halaman login Guru untuk akun ini." });
  clearLoginFails(kunci);
  clearLoginFails(kunciLintasIp);
  purgeExpiredSessions();
  const token = createSession(row.id);
  db.prepare("UPDATE users SET last_login_at=datetime('now') WHERE id=?").run(row.id);
  log(row, "login", row.username, { sebagai: sebagai || row.role }, ip(req));
  res.cookie?.("dkv_token", token, { httpOnly: true, sameSite: "lax", maxAge: 12 * 3600 * 1000 });
  res.setHeader("Set-Cookie", `dkv_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${12 * 3600}`);
  res.json({ user: publicUser(row), token });
});
function publicUser(u) {
  return { id: u.id, username: u.username, role: u.role, nama_lengkap: u.nama_lengkap, kelas_id: u.kelas_id, nis_nip: u.nis_nip };
}
app.post("/api/auth/logout", auth, (req, res) => {
  destroySession(req.token);
  log(req.user, "logout", req.user.username, null, ip(req));
  res.setHeader("Set-Cookie", "dkv_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  res.json({ ok: true });
});
app.get("/api/auth/me", auth, (req, res) => res.json({ user: req.user }));
app.post("/api/auth/change-password", auth, (req, res) => {
  const { lama, baru } = req.body || {};
  if (!baru || String(baru).length < 6) return res.status(400).json({ error: "Password baru minimal 6 karakter." });
  const row = db.prepare("SELECT * FROM users WHERE id=?").get(req.user.id);
  if (!bcrypt.compareSync(lama || "", row.password_hash)) return res.status(401).json({ error: "Password lama salah." });
  db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(bcrypt.hashSync(baru, 10), req.user.id);
  log(req.user, "ganti_password", req.user.username, null, ip(req));
  res.json({ ok: true });
});

// ---------- meta & kurikulum ----------
app.get("/api/meta", auth, (req, res) => {
  const kelas = req.user.kelas_id ? db.prepare("SELECT * FROM classes WHERE id=?").get(req.user.kelas_id) : null;
  res.json({
    app: "DKV Learning Lab", versi: "0.1",
    institusi: getSetting("institusi"), kalender: getSetting("minggu_efektif"),
    jam_pelajaran_menit: getSetting("jam_pelajaran_menit"), hari_pembelajaran: getSetting("hari_pembelajaran"),
    jp_per_pertemuan: getSetting("jp_per_pertemuan"), menit_per_pertemuan: getSetting("menit_per_pertemuan"),
    pekan_berjalan: pekanBerjalan(), kelas, user: req.user
  });
});
app.get("/api/kurikulum", auth, (req, res) => {
  const weeks = loadKurikulum().map(w => ({
    minggu: w.minggu, semester: w.semester, tema: w.tema, statusSumber: w.statusSumber,
    sumber: w.sumber, simulasi: w.simulasi, tujuan: w.tujuan, kataKunci: w.kataKunci, proyek: w.proyek,
    asesmenFormatif: w.asesmenFormatif, lkpd: { judul: w.lkpd?.judul, bobot: w.lkpd?.bobot }
  }));
  if (req.user.role === "siswa") {
    return res.json({ weeks: weeks.map(w => ({ ...w, akses: studentAccess(req.user, w.minggu).allowed ? "terbuka" : "terkunci" })) });
  }
  res.json({ weeks });
});
app.get("/api/kurikulum/:nomor", auth, (req, res) => {
  const nomor = Number(req.params.nomor);
  const row = db.prepare("SELECT * FROM weeks WHERE nomor=?").get(nomor);
  if (!row) return res.status(404).json({ error: "Minggu tidak ditemukan." });
  const payload = JSON.parse(row.payload);
  if (req.user.role === "siswa") {
    const acc = studentAccess(req.user, nomor);
    if (!acc.allowed) return res.status(403).json({ error: acc.reason, locked: true, minggu: nomor });
    return res.json({ week: payload, akses: { allowed: true, meeting: acc.meeting, week: acc.am.week } });
  }
  res.json({ week: payload });
});
app.put("/api/kurikulum/:nomor", auth, requireRole("guru", "admin"), (req, res) => {
  const nomor = Number(req.params.nomor);
  const row = db.prepare("SELECT payload FROM weeks WHERE nomor=?").get(nomor);
  if (!row) return res.status(404).json({ error: "Minggu tidak ditemukan." });
  const merged = { ...JSON.parse(row.payload), ...req.body };
  db.prepare("UPDATE weeks SET payload=?, tema=?, sumber=?, diupdate_oleh=?, diupdate_pada=datetime('now') WHERE nomor=?")
    .run(JSON.stringify(merged), merged.tema, JSON.stringify(merged.sumber || []), req.user.id, nomor);
  log(req.user, "sunting_materi", `minggu-${nomor}`, { field: Object.keys(req.body || {}) }, ip(req));
  res.json({ ok: true, week: merged });
});

// ---------- status siswa (untuk polling kontrol) ----------
app.get("/api/siswa/status", auth, requireRole("siswa"), (req, res) => {
  const am = activeMeeting(req.user);
  const controls = am.kelas ? getControls(am.kelas.id, am.meeting) : Object.fromEntries(MENU_KEYS.map(k => [k, true]));
  const tugasTerbuka = db.prepare(`SELECT COUNT(*) c FROM assignments a
      WHERE a.status='open' AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.user_id=?)
      AND a.week_nomor <= ?`).get(req.user.id, am.week).c;
  res.json({
    kelas: am.kelas, pekan_berjalan: pekanBerjalan(), minggu_aktif: am.week, pertemuan_aktif: am.meeting,
    status_pembelajaran: am.sesi?.status || "none", allow_simulation: am.sesi ? !!am.sesi.allow_simulation : true,
    lock_navigation: am.sesi ? !!am.sesi.lock_navigation : false, controls, tugas_terbuka: tugasTerbuka,
    pengumuman_awal: getSetting("pengumuman_awal")
  });
});
app.get("/api/siswa/pertemuan/:minggu/:hari", auth, (req, res) => {
  const minggu = Number(req.params.minggu);
  const hari = String(req.params.hari || "").toLowerCase();
  if (!["senin", "rabu"].includes(hari)) return res.status(400).json({ error: "Hari harus senin atau rabu." });
  const row = db.prepare("SELECT payload FROM weeks WHERE nomor=?").get(minggu);
  if (!row) return res.status(404).json({ error: "Minggu tidak ditemukan." });
  const payload = JSON.parse(row.payload);
  const kunci = hari === "senin" ? "pertemuanSenin" : "pertemuanRabu";
  if (req.user.role === "siswa") {
    const am = activeMeeting(req.user);
    const controls = getControls(am.kelas.id, am.meeting);
    const aktif = minggu === am.week && hari === am.meeting;
    if (aktif && !controls.pertemuan)
      return res.status(403).json({ error: "Menu Pertemuan aktif belum dibuka oleh guru.", locked: true, minggu });
    const acc = studentAccess(req.user, minggu);
    if (!acc.allowed) return res.status(403).json({ error: acc.reason, locked: true, minggu });
    return res.json({
      minggu, hari, pertemuan: payload[kunci], modul: payload[kunci]?.modul || null, tema: payload.tema, semester: payload.semester,
      tujuan: payload.tujuan, aktivitas: payload.aktivitas, lkpd: payload.lkpd, simulasi: payload.simulasi,
      asesmenFormatif: payload.asesmenFormatif, refleksiSiswa: payload.refleksiSiswa, kriteriaKeberhasilan: payload.kriteriaKeberhasilan,
      aktif_sekarang: aktif, minggu_aktif: am.week, pertemuan_aktif: am.meeting
    });
  }
  res.json({ minggu, hari, pertemuan: payload[kunci], modul: payload[kunci]?.modul || null, tema: payload.tema, semester: payload.semester,
    tujuan: payload.tujuan, aktivitas: payload.aktivitas, lkpd: payload.lkpd, simulasi: payload.simulasi,
    asesmenFormatif: payload.asesmenFormatif, refleksiSiswa: payload.refleksiSiswa, kriteriaKeberhasilan: payload.kriteriaKeberhasilan });
});
// ---------- modul per pertemuan: suntingan guru & kuis formatif ----------
const MODUL_KEYS = ["tujuan", "pemantik", "materi", "contohVisual", "aktivitas", "lkpd", "asesmenFormatif", "tugas", "tindakLanjut"];
app.put("/api/kurikulum/:nomor/pertemuan/:hari/modul", auth, requireRole("guru", "admin"), (req, res) => {
  const nomor = Number(req.params.nomor);
  const hari = String(req.params.hari || "").toLowerCase();
  if (!["senin", "rabu"].includes(hari)) return res.status(400).json({ error: "Hari harus senin atau rabu." });
  const row = db.prepare("SELECT payload FROM weeks WHERE nomor=?").get(nomor);
  if (!row) return res.status(404).json({ error: "Minggu tidak ditemukan." });
  const payload = JSON.parse(row.payload);
  const kunci = hari === "senin" ? "pertemuanSenin" : "pertemuanRabu";
  const lama = payload[kunci]?.modul || {};
  const kiriman = req.body?.modul || {};
  const bersih = {};
  for (const k of MODUL_KEYS) if (k in kiriman) bersih[k] = kiriman[k];
  if (!Object.keys(bersih).length) return res.status(400).json({ error: "Tidak ada bagian modul yang dikirim." });
  payload[kunci].modul = { ...lama, ...bersih };
  db.prepare("UPDATE weeks SET payload=?, diupdate_oleh=?, diupdate_pada=datetime('now') WHERE nomor=?")
    .run(JSON.stringify(payload), req.user.id, nomor);
  log(req.user, "sunting_modul", `minggu-${nomor}/${hari}`, { bagian: Object.keys(bersih) }, ip(req));
  res.json({ ok: true, modul: payload[kunci].modul });
});

// Kuis formatif (dinilai server berdasarkan butir modul yang ditulis di server pula)
app.post("/api/kuis-formatif/:minggu/:hari", auth, requireRole("siswa"), (req, res) => {
  const nomor = Number(req.params.minggu);
  const hari = String(req.params.hari || "").toLowerCase();
  const row = db.prepare("SELECT payload FROM weeks WHERE nomor=?").get(nomor);
  if (!row) return res.status(404).json({ error: "Minggu tidak ditemukan." });
  const payload = JSON.parse(row.payload);
  const butir = (payload[hari === "senin" ? "pertemuanSenin" : "pertemuanRabu"]?.modul?.asesmenFormatif?.butir) || [];
  if (!butir.length) return res.status(400).json({ error: "Pertemuan ini tidak memiliki butir kuis formatif." });
  const am = activeMeeting(req.user);
  const controls = getControls(am.kelas.id, am.meeting);
  if (!controls.kuis) return res.status(403).json({ error: "Menu Kuis/Asesmen belum dibuka oleh guru.", locked: true });
  const jawaban = Array.isArray(req.body?.jawaban) ? req.body.jawaban : [];
  let skor = 0;
  const rincian = butir.map((b, i) => {
    const benar = Number(jawaban[i]) === b.kunci;
    if (benar) skor++;
    return { no: i + 1, benar, kunci: b.kunci };
  });
  db.prepare("INSERT INTO quiz_attempts (user_id, week_nomor, meeting_key, skor, total, jawaban) VALUES (?,?,?,?,?,?)")
    .run(req.user.id, nomor, hari, skor, butir.length, JSON.stringify(jawaban));
  log(req.user, "kuis_formatif", `minggu-${nomor}/${hari}`, { skor, total: butir.length }, ip(req));
  res.json({ ok: true, skor, total: butir.length, rincian });
});
app.get("/api/kuis-formatif/:minggu/:hari", auth, (req, res) => {
  const nomor = Number(req.params.minggu);
  const hari = String(req.params.hari || "").toLowerCase();
  const rows = req.user.role === "siswa"
    ? db.prepare("SELECT skor, total, created_at FROM quiz_attempts WHERE user_id=? AND week_nomor=? AND meeting_key=? ORDER BY id DESC LIMIT 5").all(req.user.id, nomor, hari)
    : db.prepare(`SELECT q.skor, q.total, q.created_at, u.nama_lengkap FROM quiz_attempts q JOIN users u ON u.id=q.user_id
        WHERE q.week_nomor=? AND q.meeting_key=? ORDER BY q.id DESC LIMIT 50`).all(nomor, hari);
  res.json({ percobaan: rows });
});

// ---------- hasil laboratorium simulasi ----------
const SIM_IDS = ["sim-tipografi", "sim-fotografi", "sim-bitmap-vektor", "sim-alur-produksi", "sim-k3-ergonomi", "sim-sketsa-lab", "sim-studio-dkv"];
app.post("/api/simulasi/hasil", auth, requireRole("siswa"), (req, res) => {
  const { sim_id, tingkat, skor, maks, rincian } = req.body || {};
  if (!SIM_IDS.includes(String(sim_id))) return res.status(400).json({ error: "Simulasi tidak dikenal." });
  const t = Number(tingkat), sk = Number(skor), mk = Number(maks);
  if (!(t >= 1 && t <= 3) || !(sk >= 0 && mk > 0 && sk <= mk)) return res.status(400).json({ error: "Nilai tingkat/skor tidak sah." });
  const am = activeMeeting(req.user);
  const controls = getControls(am.kelas.id, am.meeting);
  if (!controls.simulasi) return res.status(403).json({ error: "Menu Simulasi belum dibuka oleh guru.", locked: true });
  db.prepare("INSERT INTO sim_attempts (user_id, sim_id, tingkat, skor, maks, rincian) VALUES (?,?,?,?,?,?)")
    .run(req.user.id, sim_id, t, sk, mk, JSON.stringify(rincian ?? null));
  log(req.user, "simulasi_hasil", `${sim_id}/tingkat-${t}`, { skor: sk, maks: mk }, ip(req));
  res.json({ ok: true });
});
app.get("/api/simulasi/hasil", auth, (req, res) => {
  const rows = req.user.role === "siswa"
    ? db.prepare("SELECT id, sim_id, tingkat, skor, maks, created_at FROM sim_attempts WHERE user_id=? ORDER BY id DESC LIMIT 30").all(req.user.id)
    : db.prepare(`SELECT s.id, s.sim_id, s.tingkat, s.skor, s.maks, s.created_at, u.nama_lengkap, k.nama AS kelas
        FROM sim_attempts s JOIN users u ON u.id=s.user_id LEFT JOIN classes k ON k.id=u.kelas_id
        ORDER BY s.id DESC LIMIT 60`).all();
  res.json({ hasil: rows });
});

app.get("/api/siswa/announcements", auth, (req, res) => {
  const rows = req.user.kelas_id
    ? db.prepare("SELECT * FROM announcements WHERE class_id=? OR class_id IS NULL ORDER BY created_at DESC LIMIT 20").all(req.user.kelas_id)
    : db.prepare("SELECT * FROM announcements WHERE class_id IS NULL ORDER BY created_at DESC LIMIT 20").all();
  res.json({ announcements: rows });
});

// ---------- progres, tugas, portofolio, refleksi (siswa) ----------
app.get("/api/siswa/progress", auth, (req, res) => {
  res.json({ progress: db.prepare("SELECT * FROM progress WHERE user_id=? ORDER BY week_nomor").all(req.user.id) });
});
app.post("/api/siswa/progress", auth, requireRole("siswa"), (req, res) => {
  const { week_nomor, status, aktivitas } = req.body || {};
  const prev = db.prepare("SELECT aktivitas, status FROM progress WHERE user_id=? AND week_nomor=?").get(req.user.id, week_nomor);
  let daftar = [];
  try { daftar = prev ? JSON.parse(prev.aktivitas || "[]") : []; } catch { daftar = []; }
  for (const a of Array.isArray(aktivitas) ? aktivitas : []) if (!daftar.includes(a)) daftar.push(a);
  const duaPertemuan = ["senin", "rabu"].every(h => daftar.includes(h));
  const statusAkhir = duaPertemuan ? "selesai" : (status || prev?.status || "berjalan");
  db.prepare(`INSERT INTO progress (user_id, week_nomor, status, aktivitas, completed_at) VALUES (?,?,?,?,?)
    ON CONFLICT(user_id, week_nomor) DO UPDATE SET status=excluded.status, aktivitas=excluded.aktivitas, completed_at=excluded.completed_at`)
    .run(req.user.id, week_nomor, statusAkhir, JSON.stringify(daftar), statusAkhir === "selesai" ? new Date().toISOString() : null);
  res.json({ ok: true, status: statusAkhir, aktivitas: daftar });
});
app.get("/api/tugas", auth, (req, res) => {
  if (req.user.role === "siswa") {
    const rows = db.prepare(`SELECT a.*, s.jawaban, s.skor, s.umpan_balik, s.status AS status_kumpul, s.submitted_at
      FROM assignments a LEFT JOIN submissions s ON s.assignment_id=a.id AND s.user_id=?
      WHERE a.status != 'draft' ORDER BY a.week_nomor`).all(req.user.id);
    const am = activeMeeting(req.user);
    const lkpdOpen = getControls(am.kelas.id, am.meeting).lkpd;
    return res.json({ tugas: rows, lkpd_open: lkpdOpen });
  }
  res.json({ tugas: db.prepare("SELECT * FROM assignments ORDER BY week_nomor").all() });
});
app.post("/api/tugas/:id/submit", auth, requireRole("siswa"), (req, res) => {
  const a = db.prepare("SELECT * FROM assignments WHERE id=?").get(Number(req.params.id));
  if (!a) return res.status(404).json({ error: "Tugas tidak ditemukan." });
  if (a.status === "closed") return res.status(403).json({ error: "Tugas ini sudah ditutup oleh guru." });
  if (a.status === "draft") return res.status(403).json({ error: "Tugas belum dibuka." });
  const am = activeMeeting(req.user);
  const controls = getControls(am.kelas.id, am.meeting);
  if (!controls.lkpd && a.tipe !== "kuis") return res.status(403).json({ error: "Menu LKPD sedang ditutup oleh guru. Jawaban tersimpan tidak terhapus; coba lagi setelah dibuka." });
  if (!controls.kuis && a.tipe === "kuis") return res.status(403).json({ error: "Menu Kuis/Asesmen sedang ditutup oleh guru." });
  const { jawaban } = req.body || {};
  let skor = null;
  if (a.tipe === "kuis" && Array.isArray(a.soal ? JSON.parse(a.soal) : [])) {
    const soal = JSON.parse(a.soal);
    if (Array.isArray(jawaban)) {
      skor = soal.reduce((acc, s, i) => acc + (Number(jawaban[i]) === s.kunci ? s.skor : 0), 0);
    }
  }
  const prev = db.prepare("SELECT * FROM submissions WHERE assignment_id=? AND user_id=?").get(a.id, req.user.id);
  if (prev) {
    db.prepare(`UPDATE submissions SET jawaban=?, skor=?, status='submitted', revisi_ke=revisi_ke+1, submitted_at=datetime('now') WHERE id=?`)
      .run(JSON.stringify(jawaban), skor, prev.id);
  } else {
    db.prepare(`INSERT INTO submissions (assignment_id, user_id, jawaban, skor, status) VALUES (?,?,?,?,'submitted')`)
      .run(a.id, req.user.id, JSON.stringify(jawaban), skor);
  }
  log(req.user, "kumpul_tugas", `tugas-${a.id}`, { skor }, ip(req));
  res.json({ ok: true, skor });
});
app.get("/api/portofolio", auth, (req, res) => {
  if (req.user.role === "siswa") {
    const am = activeMeeting(req.user);
    if (getControls(am.kelas.id, am.meeting).portofolio === false)
      return res.status(403).json({ error: "Menu Portofolio belum dibuka oleh guru. Karya kamu tetap tersimpan.", locked: true });
    return res.json({ portofolio: db.prepare("SELECT * FROM portfolio WHERE user_id=? ORDER BY created_at DESC").all(req.user.id) });
  }
  const userId = Number(req.query.user_id || 0);
  if (userId) return res.json({ portofolio: db.prepare("SELECT * FROM portfolio WHERE user_id=? ORDER BY created_at DESC").all(userId) });
  res.json({ portofolio: db.prepare(`SELECT p.*, u.nama_lengkap FROM portfolio p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC LIMIT 200`).all() });
});
app.post("/api/portofolio", auth, requireRole("siswa"), (req, res) => {
  const { week_nomor, judul, deskripsi, tahap, karya } = req.body || {};
  if (!judul) return res.status(400).json({ error: "Judul karya wajib diisi." });
  const amP = activeMeeting(req.user);
  if (getControls(amP.kelas.id, amP.meeting).portofolio === false)
    return res.status(403).json({ error: "Menu Portofolio belum dibuka oleh guru. Karya sebelumnya tetap aman.", locked: true });
  db.prepare("INSERT INTO portfolio (user_id, week_nomor, judul, deskripsi, tahap, karya) VALUES (?,?,?,?,?,?)")
    .run(req.user.id, week_nomor || null, judul, deskripsi || null, tahap || "konsep", JSON.stringify(karya || null));
  res.json({ ok: true });
});
app.post("/api/portofolio/:id/feedback", auth, requireRole("guru", "admin"), (req, res) => {
  db.prepare("UPDATE portfolio SET umpan_balik=? WHERE id=?").run(req.body?.umpan_balik || "", Number(req.params.id));
  res.json({ ok: true });
});
app.get("/api/refleksi", auth, (req, res) => {
  const rows = req.user.role === "siswa"
    ? db.prepare("SELECT * FROM reflections WHERE user_id=? ORDER BY created_at DESC").all(req.user.id)
    : db.prepare(`SELECT r.*, u.nama_lengkap FROM reflections r JOIN users u ON u.id=r.user_id ORDER BY r.created_at DESC LIMIT 300`).all();
  res.json({ refleksi: rows });
});
app.post("/api/refleksi", auth, (req, res) => {
  const { week_nomor, isi } = req.body || {};
  if (!isi) return res.status(400).json({ error: "Isi refleksi wajib diisi." });
  if (req.user.role === "siswa") {
    const amR = activeMeeting(req.user);
    if (getControls(amR.kelas.id, amR.meeting).kuis === false)
      return res.status(403).json({ error: "Menu Asesmen/refleksi belum dibuka oleh guru.", locked: true });
  }
  db.prepare("INSERT INTO reflections (user_id, week_nomor, tipe, isi) VALUES (?,?,?,?)")
    .run(req.user.id, week_nomor || null, req.user.role === "guru" ? "guru" : "siswa", isi);
  res.json({ ok: true });
});

// ---------- Mode Guru ----------
app.get("/api/guru/kelas", auth, requireRole("guru", "admin"), (req, res) => {
  res.json({ kelas: db.prepare(`SELECT c.*, u.nama_lengkap AS wali FROM classes c LEFT JOIN users u ON u.id=c.wali_guru_id`).all() });
});
app.get("/api/guru/siswa", auth, requireRole("guru", "admin"), (req, res) => {
  const kelasId = Number(req.query.kelas_id || 0);
  const rows = kelasId
    ? db.prepare("SELECT id, username, nama_lengkap, nis_nip, kelas_id FROM users WHERE role='siswa' AND kelas_id=? ORDER BY nama_lengkap").all(kelasId)
    : db.prepare("SELECT id, username, nama_lengkap, nis_nip, kelas_id FROM users WHERE role='siswa' ORDER BY nama_lengkap").all();
  res.json({ siswa: rows });
});
app.get("/api/guru/kontrol", auth, requireRole("guru", "admin"), (req, res) => {
  const kelasId = Number(req.query.kelas_id);
  const meeting = (req.query.meeting || "senin").toLowerCase();
  if (!kelasId) return res.status(400).json({ error: "kelas_id wajib." });
  const s = getSession(kelasId);
  res.json({ controls: getControls(kelasId, meeting), menu_keys: MENU_KEYS, sesi: s, kelas: db.prepare("SELECT * FROM classes WHERE id=?").get(kelasId) });
});
app.post("/api/guru/kontrol", auth, requireRole("guru", "admin"), (req, res) => {
  const { kelas_id, meeting, menu_key, enabled, aksi_semua } = req.body || {};
  if (!kelas_id || !meeting) return res.status(400).json({ error: "kelas_id dan meeting wajib." });
  if (aksi_semua === "aktifkan" || aksi_semua === "kunci") {
    for (const m of MENU_KEYS) setControl(Number(kelas_id), meeting, m, aksi_semua === "aktifkan", req.user);
    log(req.user, aksi_semua === "aktifkan" ? "kontrol_aktifkan_semua" : "kontrol_kunci_semua", `${kelas_id}/${meeting}`, null, ip(req));
    return res.json({ ok: true, controls: getControls(Number(kelas_id), meeting) });
  }
  if (!menu_key || !MENU_KEYS.includes(menu_key)) return res.status(400).json({ error: "menu_key tidak valid." });
  setControl(Number(kelas_id), meeting, menu_key, !!enabled, req.user);
  log(req.user, "kontrol_menu", `${kelas_id}/${meeting}/${menu_key}`, { enabled: !!enabled }, ip(req));
  res.json({ ok: true, controls: getControls(Number(kelas_id), meeting) });
});
app.post("/api/guru/sesi", auth, requireRole("guru", "admin"), (req, res) => {
  const { kelas_id, week_nomor, meeting_key, aksi, allow_simulation, lock_navigation } = req.body || {};
  if (!kelas_id) return res.status(400).json({ error: "kelas_id wajib." });
  const s = getSession(kelas_id);
  const upd = (patch) => {
    const fields = Object.keys(patch).map(k => `${k}=@${k}`).join(",");
    db.prepare(`UPDATE learning_sessions SET ${fields}, updated_at=datetime('now'), updated_by=@by WHERE id=@id`)
      .run({ ...patch, by: req.user.id, id: s.id });
  };
  if (aksi === "mulai") upd({ status: "running", week_nomor: week_nomor || s.week_nomor, meeting_key: meeting_key || s.meeting_key || "senin", started_at: new Date().toISOString() });
  else if (aksi === "jeda") upd({ status: "paused" });
  else if (aksi === "lanjut") upd({ status: "running" });
  else if (aksi === "akhiri") upd({ status: "ended" });
  else if (aksi === "konfigurasi") upd({
    allow_simulation: allow_simulation === undefined ? s.allow_simulation : (allow_simulation ? 1 : 0),
    lock_navigation: lock_navigation === undefined ? s.lock_navigation : (lock_navigation ? 1 : 0),
    week_nomor: week_nomor ?? s.week_nomor, meeting_key: meeting_key ?? s.meeting_key
  });
  else return res.status(400).json({ error: "aksi tidak dikenal." });
  log(req.user, `sesi_${aksi}`, `kelas-${kelas_id}`, { week_nomor, meeting_key }, ip(req));
  res.json({ ok: true, sesi: getSession(kelas_id) });
});
app.get("/api/guru/submissions", auth, requireRole("guru", "admin"), (req, res) => {
  const rows = db.prepare(`SELECT s.*, a.judul AS tugas_judul, a.tipe, a.week_nomor, a.bobot, u.nama_lengkap
    FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN users u ON u.id=s.user_id
    ORDER BY s.submitted_at DESC LIMIT 300`).all();
  res.json({ submissions: rows });
});
app.post("/api/guru/grade", auth, requireRole("guru", "admin"), (req, res) => {
  const { submission_id, skor, umpan_balik } = req.body || {};
  if (!submission_id) return res.status(400).json({ error: "submission_id wajib." });
  db.prepare("UPDATE submissions SET skor=?, umpan_balik=?, status='graded', graded_by=?, graded_at=datetime('now') WHERE id=?")
    .run(skor ?? null, umpan_balik || null, req.user.id, submission_id);
  log(req.user, "penilaian", `submission-${submission_id}`, { skor }, ip(req));
  res.json({ ok: true });
});
app.post("/api/guru/tugas", auth, requireRole("guru", "admin"), (req, res) => {
  const { id, week_nomor, meeting_key, tipe, judul, deskripsi, bobot, status } = req.body || {};
  if (id) {
    db.prepare("UPDATE assignments SET judul=COALESCE(?,judul), deskripsi=COALESCE(?,deskripsi), bobot=COALESCE(?,bobot), status=COALESCE(?,status) WHERE id=?")
      .run(judul ?? null, deskripsi ?? null, bobot ?? null, status ?? null, id);
  } else {
    if (!judul || !week_nomor) return res.status(400).json({ error: "week_nomor & judul wajib." });
    db.prepare("INSERT INTO assignments (week_nomor, meeting_key, tipe, judul, deskripsi, bobot, status, created_by) VALUES (?,?,?,?,?,?,?,?)")
      .run(week_nomor, meeting_key || "senin", tipe || "lkpd", judul, deskripsi || null, bobot || 0, status || "open", req.user.id);
  }
  log(req.user, id ? "ubah_tugas" : "buat_tugas", id ? `tugas-${id}` : judul, null, ip(req));
  res.json({ ok: true });
});
app.get("/api/guru/rekap", auth, requireRole("guru", "admin"), (req, res) => {
  const kelasId = Number(req.query.kelas_id || 0);
  const rows = db.prepare(`SELECT u.id, u.nama_lengkap,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE s.user_id=u.id AND a.tipe='lkpd') AS jml_lkpd,
      (SELECT ROUND(AVG(s.skor*10.0/a.bobot),1) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE s.user_id=u.id AND a.bobot>0 AND s.skor IS NOT NULL) AS rata_nilai,
      (SELECT COUNT(*) FROM portfolio p WHERE p.user_id=u.id) AS jml_karya,
      (SELECT COUNT(*) FROM progress pr WHERE pr.user_id=u.id AND pr.status='selesai') AS minggu_selesai
    FROM users u WHERE u.role='siswa' ${kelasId ? "AND u.kelas_id=" + kelasId : ""} ORDER BY u.nama_lengkap`).all();
  if (req.query.format === "csv") {
    const head = "nama_lengkap,lkpd_terkumpul,rata_nilai_0_100,karya_portofolio,minggu_selesai\n";
    const csv = rows.map(r => `"${r.nama_lengkap}",${r.jml_lkpd},${r.rata_nilai ?? ""},${r.jml_karya},${r.minggu_selesai}`).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=rekap-nilai.csv");
    return res.send(head + csv);
  }
  res.json({ rekap: rows });
});
// Endpoint supervisi akademik dipindahkan ke server/supervisi.js: indikator dapat dikonfigurasi
// (mengikuti dokumen instrumen sekolah) + dokumentasi pembelajaran per pertemuan + ekspor CSV.

// ---------- Pengaturan pembelajaran yang boleh diubah guru (tanpa menyunting kode) ----------
const GURU_SETTING_KEYS = [
  "hari_pembelajaran", "jp_per_pertemuan", "menit_per_pertemuan", "jam_pelajaran_menit",
  "minggu_efektif", "kalender_sekolah", "pekan_berjalan", "tahun_ajaran", "pengumuman_awal", "institusi"
];
app.get("/api/guru/settings", auth, requireRole("guru", "admin"), (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings").all()
    .filter(r => GURU_SETTING_KEYS.includes(r.key));
  res.json({ settings: Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)])), boleh_diubah: GURU_SETTING_KEYS });
});
app.put("/api/guru/settings", auth, requireRole("guru", "admin"), (req, res) => {
  const { key, value } = req.body || {};
  if (!key) return res.status(400).json({ error: "key wajib." });
  if (!GURU_SETTING_KEYS.includes(key)) return res.status(403).json({ error: "Kunci pengaturan ini hanya boleh diubah oleh admin." });
  setSetting(key, value);
  log(req.user, "ubah_pengaturan", key, { value }, ip(req));
  res.json({ ok: true, key, value });
});

// ---------- Admin ----------
app.get("/api/admin/users", auth, requireRole("admin"), (req, res) => {
  res.json({ users: db.prepare(`SELECT u.id, u.username, u.role, u.nama_lengkap, u.nis_nip, u.kelas_id, u.aktif, u.last_login_at, c.nama AS kelas
    FROM users u LEFT JOIN classes c ON c.id=u.kelas_id ORDER BY u.role, u.nama_lengkap`).all() });
});
// Impor akun massal (dipakai panel Admin → Akun → "Tambah siswa massal").
// Menerima baris yang sudah diurai di antarmuka: [{nama, nis, kelas, username?, sandi?}]
// Aturan: sandi disimpan sebagai hash bcrypt; username dibuat otomatis bila kosong (unik);
// kelas dibuat otomatis bila diminta; baris dengan username yang sudah ada DILEWATI (aman diulang).
app.post("/api/admin/users/impor", auth, requireRole("admin"), (req, res) => {
  const { daftar, sandi_awal, buat_kelas } = req.body || {};
  if (!Array.isArray(daftar) || daftar.length === 0) return res.status(400).json({ error: "Daftar siswa masih kosong." });
  if (daftar.length > 300) return res.status(400).json({ error: "Maksimal 300 baris sekali impor. Bagi menjadi beberapa kali." });
  const sandiBawaan = String(sandi_awal || "").trim();
  if (sandiBawaan.length < 6) return res.status(400).json({ error: "Sandi awal minimal 6 karakter." });

  const rapikan = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
  const kelasMap = new Map(db.prepare("SELECT id, nama FROM classes").all().map((k) => [k.nama.toLowerCase(), k.id]));
  const dipakai = new Set(db.prepare("SELECT lower(username) u FROM users").all().map((r) => r.u));
  // Untuk baris TANPA username: siswa yang sudah ada dikenali dari nama + kelas, sehingga
  // menekan tombol Impor dua kali tidak membuat akun kembar (kesalahan yang pernah terjadi).
  // Bila sekolah memang punya dua siswa bernama sama, isi kolom username sendiri agar tetap dibuat.
  const siswaAda = new Map();
  for (const r of db.prepare("SELECT lower(nama_lengkap) n, kelas_id, username FROM users WHERE role='siswa'").all())
    siswaAda.set(`${r.n}\u0000${r.kelas_id ?? ""}`, r.username);
  const tahun = (() => { try { return getSetting("tahun_ajaran") || null; } catch { return null; } })();

  const usulUsername = (nama) => {
    let dasar = rapikan(nama).toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!dasar) dasar = "siswa";
    dasar = dasar.slice(0, 20);
    let u = dasar, n = 2;
    while (dipakai.has(u)) { u = `${dasar.slice(0, 18)}${n}`; n += 1; }
    return u;
  };

  const dibuat = [], dilewati = [], gagal = [];
  const jalan = db.transaction(() => {
    for (const [i, b] of daftar.entries()) {
      const no = i + 1;
      const nama = rapikan(b?.nama);
      const nis = rapikan(b?.nis) || null;
      const kelasNama = rapikan(b?.kelas);
      const sandi = rapikan(b?.sandi) || sandiBawaan;
      if (!nama) { gagal.push({ no, nama: "(kosong)", alasan: "Nama kosong." }); continue; }
      if (sandi.length < 6) { gagal.push({ no, nama, alasan: "Sandi kurang dari 6 karakter." }); continue; }

      let kelasId = null;
      if (kelasNama) {
        kelasId = kelasMap.get(kelasNama.toLowerCase()) ?? null;
        if (!kelasId) {
          if (!buat_kelas) { gagal.push({ no, nama, alasan: `Kelas "${kelasNama}" belum ada dan pembuatan kelas otomatis tidak dicentang.` }); continue; }
          const info = db.prepare("INSERT INTO classes (nama, tingkat, tahun_ajaran) VALUES (?,?,?)").run(kelasNama, "X", tahun);
          kelasId = Number(info.lastInsertRowid);
          kelasMap.set(kelasNama.toLowerCase(), kelasId);
          log(req.user, "buat_kelas", kelasNama, { dari: "impor massal" }, ip(req));
        }
      }

      let username = rapikan(b?.username).toLowerCase().replace(/\s+/g, "");
      if (username) {
        if (!/^[a-z0-9._-]{3,32}$/.test(username)) { gagal.push({ no, nama, alasan: `Username "${username}" tidak sah (pakai huruf/angka, 3–32 karakter).` }); continue; }
        if (dipakai.has(username)) { dilewati.push({ no, nama, username, alasan: "Username sudah ada — data lama tidak diubah." }); continue; }
      } else {
        const kunciNama = `${nama.toLowerCase()}\u0000${kelasId ?? ""}`;
        const kembar = siswaAda.get(kunciNama);
        if (kembar) { dilewati.push({ no, nama, username: kembar, alasan: "Siswa dengan nama ini sudah ada di kelas tersebut (data lama tidak diubah)." }); continue; }
        username = usulUsername(nama);
      }

      try {
        db.prepare("INSERT INTO users (username, password_hash, role, nama_lengkap, nis_nip, kelas_id) VALUES (?,?,?,?,?,?)")
          .run(username, bcrypt.hashSync(sandi, 10), "siswa", nama, nis, kelasId);
        dipakai.add(username);
        siswaAda.set(`${nama.toLowerCase()}\u0000${kelasId ?? ""}`, username);
        dibuat.push({ no, nama, username, sandi, nis, kelas: kelasNama || null });
      } catch (e) {
        gagal.push({ no, nama, alasan: "Gagal menyimpan (kemungkinan username bentrok)." });
      }
    }
  });
  jalan();

  log(req.user, "impor_pengguna", `siswa-${dibuat.length}`, { jumlah: daftar.length, dibuat: dibuat.length, dilewati: dilewati.length, gagal: gagal.length }, ip(req));
  res.json({
    ok: true, dibuat, dilewati, gagal,
    ringkas: { jumlah: daftar.length, dibuat: dibuat.length, dilewati: dilewati.length, gagal: gagal.length },
    pesan: `${dibuat.length} akun dibuat, ${dilewati.length} dilewati, ${gagal.length} gagal.`,
  });
});

app.post("/api/admin/users", auth, requireRole("admin"), (req, res) => {
  const { username, password, role, nama_lengkap, nis_nip, kelas_id } = req.body || {};
  if (!username || !password || !role || !nama_lengkap) return res.status(400).json({ error: "username, password, role, nama_lengkap wajib." });
  if (String(password).length < 6) return res.status(400).json({ error: "Password minimal 6 karakter." });
  try {
    db.prepare("INSERT INTO users (username, password_hash, role, nama_lengkap, nis_nip, kelas_id) VALUES (?,?,?,?,?,?)")
      .run(username, bcrypt.hashSync(password, 10), role, nama_lengkap, nis_nip || null, kelas_id || null);
    log(req.user, "buat_pengguna", username, { role }, ip(req));
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: "Username sudah dipakai." }); }
});
app.post("/api/admin/users/:id/reset", auth, requireRole("admin"), (req, res) => {
  const { password } = req.body || {};
  if (!password || String(password).length < 6) return res.status(400).json({ error: "Password minimal 6 karakter." });
  db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(bcrypt.hashSync(password, 10), Number(req.params.id));
  log(req.user, "reset_password", `user-${req.params.id}`, null, ip(req));
  res.json({ ok: true });
});
app.post("/api/admin/users/:id/toggle", auth, requireRole("admin"), (req, res) => {
  db.prepare("UPDATE users SET aktif = 1 - aktif WHERE id=?").run(Number(req.params.id));
  log(req.user, "ubah_status_pengguna", `user-${req.params.id}`, null, ip(req));
  res.json({ ok: true });
});
app.post("/api/admin/kelas", auth, requireRole("admin"), (req, res) => {
  const { nama, tingkat, tahun_ajaran } = req.body || {};
  if (!nama) return res.status(400).json({ error: "nama kelas wajib." });
  const info = db.prepare("INSERT INTO classes (nama, tingkat, tahun_ajaran) VALUES (?,?,?)").run(nama, tingkat || null, tahun_ajaran || null);
  log(req.user, "buat_kelas", nama, null, ip(req));
  res.json({ ok: true, id: info.lastInsertRowid });
});
app.get("/api/admin/settings", auth, requireRole("admin"), (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  res.json({ settings: Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)])) });
});
app.put("/api/admin/settings", auth, requireRole("admin"), (req, res) => {
  const { key, value } = req.body || {};
  if (!key) return res.status(400).json({ error: "key wajib." });
  setSetting(key, value);
  log(req.user, "ubah_pengaturan", key, { value }, ip(req));
  res.json({ ok: true });
});
app.get("/api/admin/logs", auth, requireRole("admin"), (req, res) => {
  res.json({ logs: db.prepare(`SELECT l.*, u.nama_lengkap FROM activity_logs l LEFT JOIN users u ON u.id=l.user_id
    ORDER BY l.created_at DESC LIMIT 300`).all() });
});

// ---------- statis (hasil build React) ----------
const DIST = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));

// ---------- mesin asesmen 36 minggu (LKPD, kuis, formatif, sumatif, praktik, proyek) ----------

  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(DIST, "index.html")));
} else {
  app.get("/", (req, res) => res.send("DKV Learning Lab API aktif. Frontend belum dibuild (jalankan `npm run build`)."));
}
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: "Kesalahan server internal." }); });

registerAsesmen(app, { auth, requireRole, log, ip, activeMeeting });
registerSupervisi(app, { auth, requireRole, log, ip });

// Peringatan bila akun demo masih memakai password bawaan — penting sebelum diakses dari internet.
(function peringatanKeamanan() {
  const demo = [["admin", "admin123"], ["dewi", "guru123"], ["saidun", "guru123"], ["aditya", "siswa123"]];
  const temuan = demo.filter(([u, s]) => {
    const row = db.prepare("SELECT password_hash FROM users WHERE lower(username)=lower(?) AND aktif=1").get(u);
    return row && bcrypt.compareSync(s, row.password_hash);
  }).map(([u]) => u);
  if (!temuan.length) return;
  console.log("");
  console.log(`⚠️  PERINGATAN: akun demo masih memakai password bawaan → ${temuan.join(", ")}`);
  console.log(ONLINE
    ? "   Aplikasi berjalan dalam MODE DARING. Ganti password (⚙️ Akun) atau nonaktifkan akunnya (Panel Admin) SEKARANG."
    : "   Ganti password sebelum aplikasi diakses dari internet (lihat docs/13-panduan-online.md).");
})();

app.listen(PORT, HOST, () => {
  console.log(`DKV Learning Lab berjalan di http://${HOST}:${PORT}${ONLINE ? " (mode daring)" : ""}`);
  if (TRUST_PROXY) console.log(`X-Forwarded-For dipercaya (DKV_TRUST_PROXY=${TRUST_PROXY}).`);
  if (FRAME_ANCESTORS) console.log(`Boleh disematkan dalam bingkai oleh: ${FRAME_ANCESTORS}`);
});
