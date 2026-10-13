// uji-online.mjs — uji kesiapan aplikasi untuk dipasang ONLINE (di internet).
//
// Yang diuji (dengan menjalankan server sungguhan dari salinan basis data, bukan basis data demo aktif):
//   O1  Endpoint kesehatan /api/health untuk pemantauan uptime
//   O2  Palsu X-Forwarded-For TIDAK dapat melewati pembatasan percobaan login (5×/15 menit)
//   O3  IP pada log aktivitas memakai alamat soket, bukan header yang dipalsukan
//   O4  Header keamanan dasar selalu ada; header pemblokir bingkai TIDAK aktif di mode lokal
//   O5  Mode daring (DKV_ONLINE=1): X-Frame-Options, CSP frame-ancestors, HSTS aktif
//   O6  DKV_TRUST_PROXY=1: X-Forwarded-For dipercaya → IP asli pemanggil tercatat
//   O7  HOST=127.0.0.1 benar-benar mengikat hanya ke localhost (tidak terbuka ke jaringan)
//   O8  Penjaga brute force lintas-IP (15 gagal/15 menit untuk satu username dari banyak IP)
//   O9  Peringatan "akun demo masih memakai password bawaan" muncul saat server dijalankan
//   O10 Alur normal tetap sehat: login guru → token → /api/kurikulum 200
//
// Pakai (dari folder app/, server demo boleh tetap berjalan):
//   node tools/uji-online.mjs
// Menulis hasil rinci ke ../docs/uji-online-hasil.json
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DOK = path.join(APP, "..", "docs");
const TMP = path.join(APP, "data", ".uji-online");
const LULUS = (s = "") => ({ status: "LULUS", pesan: s });
const GAGAL = (s) => ({ status: "GAGAL", pesan: s });

const hasil = [];
const catat = (no, fitur, langkah, harapan, hasilUji) => {
  hasil.push({ no, fitur, langkah, harapan, aktual: hasilUji.pesan, status: hasilUji.status });
  console.log(`${hasilUji.status === "LULUS" ? "✅" : "❌"} ${String(no).padStart(2)}. ${fitur}\n     ${hasilUji.pesan}`);
};

const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
const panggil = async (dasar, jalan, opsi = {}) => {
  const r = await fetch(dasar + jalan, {
    method: opsi.method || "GET",
    headers: { "Content-Type": "application/json", ...(opsi.token ? { "x-dkv-token": opsi.token } : {}), ...(opsi.headers || {}) },
    body: opsi.body ? JSON.stringify(opsi.body) : undefined,
  });
  let j = null; try { j = await r.json(); } catch { /* bukan JSON */ }
  return { status: r.status, data: j, header: (n) => r.headers.get(n) };
};

async function mulaiServer({ port, dbPath, online = false, trustProxy = "", host = "0.0.0.0" }) {
  const env = { ...process.env, PORT: String(port), DKV_DB: dbPath, HOST: host };
  if (online) env.DKV_ONLINE = "1"; else delete env.DKV_ONLINE;
  if (trustProxy) env.DKV_TRUST_PROXY = trustProxy; else delete env.DKV_TRUST_PROXY;
  const anak = spawn("node", ["server/index.js"], { cwd: APP, env, stdio: ["ignore", "pipe", "pipe"] });
  let keluaran = "";
  anak.stdout.on("data", (d) => { keluaran += d.toString(); });
  anak.stderr.on("data", (d) => { keluaran += d.toString(); });
  const dasar = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(dasar + "/api/health"); if (r.ok) return { anak, dasar, keluaran: () => keluaran }; } catch { /* belum siap */ }
    await tunggu(250);
  }
  anak.kill("SIGKILL");
  throw new Error(`Server port ${port} tidak siap. Keluaran:\n${keluaran}`);
}

const hentikan = async (anak) => { anak.kill("SIGTERM"); await tunggu(700); try { anak.kill("SIGKILL"); } catch { /* sudah mati */ } };

async function main() {
  fs.mkdirSync(TMP, { recursive: true });
  // Salinan basis data yang konsisten (dibuat oleh alat pencadangan) supaya basis data demo tidak terganggu
  const cadangan = spawn("node", ["tools/backup-db.mjs", "--ke", TMP, "--simpan", "2"], { cwd: APP, stdio: "ignore" });
  await new Promise((r) => cadangan.on("exit", r));
  const berkas = fs.readdirSync(TMP).filter((f) => /^dkv-\d{8}-\d{6}\.db$/.test(f)).sort().pop();
  const dbUji = path.join(TMP, berkas);
  const bersihkanMenu = new Database(dbUji);
  bersihkanMenu.prepare("DELETE FROM login_attempts").run();
  bersihkanMenu.close();
  const bacaLog = (n = 12) => {
    const db = new Database(dbUji, { readonly: true });
    const baris = db.prepare("SELECT aksi, target, ip FROM activity_logs ORDER BY id DESC LIMIT ?").all(n);
    db.close();
    return baris;
  };

  // =============== Server A: mode lokal (seperti pratinjau/uji) ===============
  const A = await mulaiServer({ port: 8131, dbPath: dbUji });

  // O1 — /api/health
  try {
    const h = await panggil(A.dasar, "/api/health");
    catat(1, "Endpoint kesehatan untuk pemantauan uptime", "GET /api/health (tanpa token)",
      "200 + ok:true + status basis data + mode daring",
      h.status === 200 && h.data?.ok === true && h.data?.basis_data === "ok"
        ? LULUS(`HTTP ${h.status}; ok=${h.data.ok}; basis_data=${h.data.basis_data}; mode_daring=${h.data.mode_daring}; uptime=${h.data.uptime_detik}s`)
        : GAGAL(`HTTP ${h.status}; balasan=${JSON.stringify(h.data)}`));
  } catch (e) { catat(1, "Endpoint kesehatan untuk pemantauan uptime", "GET /api/health", "200 + ok:true", GAGAL(e.message)); }

  // O2 — pemalsuan X-Forwarded-For tidak boleh melewati rate limit
  try {
    const kode = [];
    for (let i = 1; i <= 6; i++) {
      const r = await panggil(A.dasar, "/api/auth/login", {
        method: "POST", headers: { "x-forwarded-for": `203.0.113.${i}` },
        body: { username: "aditya", password: `salah${i}` },
      });
      kode.push(r.status);
    }
    const terkunci = kode[5] === 429;
    catat(2, "Pemalsuan X-Forwarded-For tidak melewati pembatasan login", "6× login gagal untuk satu akun, tiap percobaan memakai header X-Forwarded-For berbeda",
      "percobaan ke-6 ditolak 429 (terkunci), bukan 401 lagi",
      terkunci
        ? LULUS(`urutan kode balasan=${kode.join(", ")} → percobaan ke-6 ditolak 429`)
        : GAGAL(`urutan kode balasan=${kode.join(", ")} → header palsu berhasil mengelabui pembatasan`));
  } catch (e) { catat(2, "Pemalsuan X-Forwarded-For tidak melewati pembatasan login", "6× login gagal", "429 pada percobaan ke-6", GAGAL(e.message)); }

  // O3 — IP yang tercatat di log aktivitas
  try {
    const baris = bacaLog(10).filter((b) => b.aksi === "login_gagal");
    const ipTercatat = [...new Set(baris.map((b) => b.ip))];
    const bersih = ipTercatat.length > 0 && ipTercatat.every((i) => !String(i).startsWith("203.0.113."));
    catat(3, "IP pada log aktivitas tidak dapat dipalsukan", "Baca tabel activity_logs setelah 6 percobaan gagal ber-header palsu",
      "kolom ip berisi alamat soket (127.0.0.1), bukan 203.0.113.x",
      bersih ? LULUS(`IP tercatat: ${ipTercatat.join(", ")} (header palsu diabaikan)`)
             : GAGAL(`IP tercatat: ${ipTercatat.join(", ")} — header palsu ikut tercatat`));
  } catch (e) { catat(3, "IP pada log aktivitas tidak dapat dipalsukan", "Baca activity_logs", "IP = 127.0.0.1", GAGAL(e.message)); }

  // O4 — header keamanan dasar hadir, pemblokir bingkai tidak aktif di mode lokal
  try {
    const r = await fetch(A.dasar + "/api/health");
    const nosniff = r.headers.get("x-content-type-options");
    const frame = r.headers.get("x-frame-options");
    const csp = r.headers.get("content-security-policy");
    const referrer = r.headers.get("referrer-policy");
    catat(4, "Header keamanan dasar & kompatibilitas pratinjau", "Periksa header balasan GET /api/health pada mode lokal",
      "nosniff + Referrer-Policy ada; X-Frame-Options/CSP bingkai TIDAK aktif (agar pratinjau tetap tampil)",
      nosniff === "nosniff" && referrer && !frame && !csp
        ? LULUS(`nosniff=${nosniff}; referrer-policy=${referrer}; x-frame-options=${frame || "(mati)"}; csp=${csp || "(mati)"}`)
        : GAGAL(`nosniff=${nosniff}; referrer=${referrer}; x-frame-options=${frame}; csp=${csp}`));
  } catch (e) { catat(4, "Header keamanan dasar & kompatibilitas pratinjau", "Periksa header", "header dasar ada", GAGAL(e.message)); }

  // O10 (dijalankan pada server A) — alur normal tetap sehat
  try {
    const masuk = await panggil(A.dasar, "/api/auth/login", { method: "POST", body: { username: "dewi", password: "guru123", sebagai: "guru" } });
    const kuri = masuk.data?.token ? await panggil(A.dasar, "/api/kurikulum", { token: masuk.data.token }) : { status: 0, data: null };
    catat(10, "Alur normal tetap sehat setelah pengerasan", "Login guru → pakai token → GET /api/kurikulum",
      "login 200 + 36 minggu terbaca",
      masuk.status === 200 && kuri.status === 200 && (kuri.data?.weeks || []).length === 36
        ? LULUS(`login=${masuk.status}; /api/kurikulum=${kuri.status}; minggu=${kuri.data.weeks.length}`)
        : GAGAL(`login=${masuk.status}; /api/kurikulum=${kuri.status}`));
  } catch (e) { catat(10, "Alur normal tetap sehat setelah pengerasan", "Login guru + baca kurikulum", "200 & 36 minggu", GAGAL(e.message)); }

  // O9 — peringatan akun demo pada keluaran server
  try {
    const keluaran = A.keluaran();
    const adaPeringatan = /PERINGATAN: akun demo masih memakai password bawaan/.test(keluaran) && /admin/.test(keluaran);
    catat(9, "Peringatan akun demo masih memakai password bawaan", "Jalankan server lalu periksa keluaran konsol",
      "tercetak peringatan beserta daftar akun demo yang belum diganti",
      adaPeringatan ? LULUS("peringatan tercetak di konsol saat server dijalankan")
                    : GAGAL(`peringatan tidak ditemukan. Keluaran: ${keluaran.split("\n").slice(-4).join(" | ")}`));
  } catch (e) { catat(9, "Peringatan akun demo masih memakai password bawaan", "Periksa keluaran konsol", "peringatan tercetak", GAGAL(e.message)); }

  await hentikan(A.anak);

  // =============== Server B: mode daring + reverse proxy + hanya localhost ===============
  const B = await mulaiServer({ port: 8132, dbPath: dbUji, online: true, trustProxy: "1", host: "127.0.0.1" });

  // O5 — header mode daring
  try {
    const r = await fetch(B.dasar + "/api/health");
    const frame = r.headers.get("x-frame-options");
    const csp = r.headers.get("content-security-policy");
    const hsts = r.headers.get("strict-transport-security");
    const h = await panggil(B.dasar, "/api/health");
    catat(5, "Pengerasan mode daring (DKV_ONLINE=1)", "Jalankan server dengan DKV_ONLINE=1 lalu periksa header",
      "X-Frame-Options=DENY, CSP frame-ancestors 'none', HSTS aktif, mode_daring=true",
      frame === "DENY" && /frame-ancestors 'none'/.test(csp || "") && /max-age=/.test(hsts || "") && h.data?.mode_daring === true
        ? LULUS(`x-frame-options=${frame}; csp="${csp}"; hsts="${hsts}"; mode_daring=${h.data.mode_daring}`)
        : GAGAL(`x-frame-options=${frame}; csp="${csp}"; hsts=${hsts}; mode_daring=${h.data?.mode_daring}`));
  } catch (e) { catat(5, "Pengerasan mode daring (DKV_ONLINE=1)", "Periksa header mode daring", "DENY + CSP + HSTS", GAGAL(e.message)); }

  // O6 — dengan DKV_TRUST_PROXY=1, X-Forwarded-For dipercaya (IP asli tercatat)
  try {
    const sebelum = bacaLog(1).length;
    await panggil(B.dasar, "/api/auth/login", { method: "POST", headers: { "x-forwarded-for": "198.51.100.7" }, body: { username: "saidun", password: "salah" } });
    const baris = bacaLog(3).filter((b) => b.aksi === "login_gagal");
    const ip = baris[0]?.ip;
    catat(6, "DKV_TRUST_PROXY=1: IP asli pemanggil tercatat", "Kirim login gagal dengan X-Forwarded-For: 198.51.100.7 (server di belakang proxy)",
      "kolom ip pada log = 198.51.100.7 (bukan 127.0.0.1)",
      ip === "198.51.100.7" ? LULUS(`IP tercatat=${ip} (header dipercaya saat DKV_TRUST_PROXY=1)`)
                           : GAGAL(`IP tercatat=${ip}; diharapkan 198.51.100.7 (log sebelum: ${sebelum} baris)`));
  } catch (e) { catat(6, "DKV_TRUST_PROXY=1: IP asli pemanggil tercatat", "Login gagal ber-header XFF", "IP = 198.51.100.7", GAGAL(e.message)); }

  // O7 — HOST=127.0.0.1 hanya mengikat ke localhost
  try {
    // Hanya soket LISTEN (kolom state = 0A) yang dihitung; soket koneksi biasa (mis. memakai port
    // kebetulan sama sebagai port lokal) tidak boleh ikut terbaca — sempat membuat uji ini goyah.
    const isi = fs.readFileSync("/proc/net/tcp", "utf8").split("\n").slice(1);
    const portHex = (8132).toString(16).toUpperCase().padStart(4, "0");
    const cocok = isi.map((l) => l.trim().split(/\s+/))
      .filter((k) => k.length > 3 && k[3] === "0A" && k[1]?.endsWith(":" + portHex));
    const alamat = cocok.map((k) => k[1].split(":")[0]);
    const hanyaLokal = alamat.length > 0 && alamat.every((a) => a === "0100007F");
    catat(7, "HOST=127.0.0.1 mengikat hanya ke localhost", "Jalankan server dengan HOST=127.0.0.1 lalu periksa /proc/net/tcp",
      "alamat ikat 127.0.0.1 (0100007F), bukan 0.0.0.0 (00000000)",
      hanyaLokal ? LULUS(`alamat ikat=${[...new Set(alamat)].join(", ")} (tidak terbuka ke jaringan)`)
                 : GAGAL(`alamat ikat=${[...new Set(alamat)].join(", ") || "(port tidak ditemukan)"}`));
  } catch (e) { catat(7, "HOST=127.0.0.1 mengikat hanya ke localhost", "Periksa /proc/net/tcp", "0100007F", GAGAL(e.message)); }

  await hentikan(B.anak);

  // O8 — penjaga brute force lintas-IP
  try {
    const db = new Database(dbUji);
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    db.prepare("INSERT INTO login_attempts (kunci, count, first_at) VALUES (?,?,?) ON CONFLICT(kunci) DO UPDATE SET count=?, first_at=?")
      .run("aditya|*", 15, now, 15, now);
    db.close();
    const C = await mulaiServer({ port: 8133, dbPath: dbUji });
    const r = await panggil(C.dasar, "/api/auth/login", { method: "POST", body: { username: "aditya", password: "apapun" } });
    await hentikan(C.anak);
    catat(8, "Penjaga brute force lintas-IP (15 gagal/15 menit per akun)", "Isi 15 kegagalan untuk kunci 'aditya|*' lalu coba login dari IP yang masih bersih",
      "ditolak 429 (walau IP pemanggil belum pernah gagal)",
      r.status === 429 ? LULUS(`HTTP ${r.status}; pesan="${r.data?.error}"`)
                       : GAGAL(`HTTP ${r.status}; balasan=${JSON.stringify(r.data)}`));
  } catch (e) { catat(8, "Penjaga brute force lintas-IP (15 gagal/15 menit per akun)", "Isi 15 kegagalan kunci |*", "429", GAGAL(e.message)); }

  // Rapikan
  fs.rmSync(TMP, { recursive: true, force: true });

  const lulus = hasil.filter((h) => h.status === "LULUS").length;
  const ringkas = `UJI KESIAPAN ONLINE: ${lulus}/${hasil.length} LULUS`;
  fs.writeFileSync(path.join(DOK, "uji-online-hasil.json"),
    JSON.stringify({ waktu: new Date().toISOString(), ringkas, hasil }, null, 2), "utf8");
  console.log(`\n${ringkas}`);
  console.log("Hasil rinci ditulis: docs/uji-online-hasil.json");
  process.exit(lulus === hasil.length ? 0 : 1);
}

main().catch((e) => { console.error("Uji gagal dijalankan:", e); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(1); });
