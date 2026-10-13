// uji-bingkai.mjs — uji apakah aplikasi dapat DISEMATKAN di halaman lain (mis. Google Sites)
// dan apakah perlindungan bawaannya tetap menolak penyematan yang tidak diizinkan.
//
// Yang diuji (server sungguhan + peramban Chromium sungguhan):
//   B1  Dengan DKV_FRAME_ANCESTORS diset: aplikasi benar-benar termuat di dalam bingkai
//   B2  Login peserta didik BERHASIL di dalam bingkai (bukti tidak bergantung cookie pihak ketiga)
//   B3  Sesi tetap aktif setelah seluruh cookie dihapus lalu halaman dimuat ulang (token di localStorage)
//   B4  Tanpa DKV_FRAME_ANCESTORS (mode daring biasa): bingkai DITOLAK (perlindungan bawaan tetap ada)
//   B5  Header balasan tepat: tanpa X-Frame-Options saat diizinkan; DENY saat tidak diizinkan
//   B6  Tidak ada galat konsol "Refused to display" pada halaman penyemat yang diizinkan
//
// Pakai (dari folder app/, server demo boleh tetap berjalan):
//   LD_LIBRARY_PATH=... node tools/uji-bingkai.mjs
// Menulis hasil rinci ke ../docs/uji-bingkai-hasil.json
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DOK = path.join(APP, "..", "docs");
const TMP = path.join(APP, "data", ".uji-bingkai");
const ASAL_SEMAT = "http://127.0.0.1:8142";          // asal halaman penyemat (uji)
const DAFTAR_IZIN = `${ASAL_SEMAT} https://sites.google.com`;   // dua entri, seperti pemakaian nyata
const LULUS = (s = "") => ({ status: "LULUS", pesan: s });
const GAGAL = (s) => ({ status: "GAGAL", pesan: s });

const hasil = [];
const catat = (no, fitur, langkah, harapan, h) => {
  hasil.push({ no, fitur, langkah, harapan, aktual: h.pesan, status: h.status });
  console.log(`${h.status === "LULUS" ? "✅" : "❌"} ${String(no).padStart(2)}. ${fitur}\n     ${h.pesan}`);
};
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

async function mulaiApp({ port, dbPath, env = {} }) {
  const anak = spawn("node", ["server/index.js"], {
    cwd: APP, env: { ...process.env, PORT: String(port), DKV_DB: dbPath, ...env }, stdio: ["ignore", "pipe", "pipe"],
  });
  let keluaran = ""; anak.stdout.on("data", (d) => (keluaran += d)); anak.stderr.on("data", (d) => (keluaran += d));
  const dasar = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(dasar + "/api/health"); if (r.ok) return { anak, dasar, keluaran: () => keluaran }; } catch { /* belum siap */ }
    await tunggu(250);
  }
  anak.kill("SIGKILL");
  throw new Error(`Server ${port} tidak siap:\n${keluaran}`);
}
const hentikan = async (anak) => { anak.kill("SIGTERM"); await tunggu(600); try { anak.kill("SIGKILL"); } catch { /* sudah mati */ } };

const HALAMAN = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Situs Sekolah (uji penyematan)</title></head>
<body style="margin:0;font-family:sans-serif">
<p style="padding:8px">Halaman ini mewakili Google Sites (asal: ${ASAL_SEMAT})</p>
<iframe id="diizinkan" src="http://localhost:8141/" style="width:100%;height:600px;border:1px solid #ccc"></iframe>
<iframe id="ditolak" src="http://localhost:8143/" style="width:100%;height:300px;border:1px solid #ccc"></iframe>
</body></html>`;

async function main() {
  fs.mkdirSync(TMP, { recursive: true });
  const cad = spawn("node", ["tools/backup-db.mjs", "--ke", TMP, "--simpan", "2"], { cwd: APP, stdio: "ignore" });
  await new Promise((r) => cad.on("exit", r));
  const berkas = fs.readdirSync(TMP).filter((f) => /^dkv-\d{8}-\d{6}\.db$/.test(f)).sort().pop();
  const dbUji = path.join(TMP, berkas);

  // Server A: diizinkan disematkan (seperti penyetelan untuk Google Sites)
  const A = await mulaiApp({ port: 8141, dbPath: dbUji, env: { DKV_ONLINE: "1", DKV_FRAME_ANCESTORS: DAFTAR_IZIN } });
  // Server B: mode daring tanpa daftar izin (perlindungan bawaan)
  const B = await mulaiApp({ port: 8143, dbPath: dbUji, env: { DKV_ONLINE: "1" } });

  // Halaman penyemat
  const semat = http.createServer((req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(HALAMAN);
  });
  await new Promise((r) => semat.listen(8142, "127.0.0.1", r));

  // ---------- B5: header balasan ----------
  try {
    const ha = await fetch(A.dasar + "/api/health");
    const hb = await fetch(B.dasar + "/api/health");
    const xfoA = ha.headers.get("x-frame-options"), cspA = ha.headers.get("content-security-policy");
    const xfoB = hb.headers.get("x-frame-options"), cspB = hb.headers.get("content-security-policy");
    const ok = !xfoA && /frame-ancestors http:\/\/127\.0\.0\.1:8142 https:\/\/sites\.google\.com/.test(cspA || "")
      && xfoB === "DENY" && /frame-ancestors 'none'/.test(cspB || "");
    catat(5, "Header balasan tepat untuk penyematan", "GET /api/health pada server ber-izin dan server mode daring biasa",
      "ber-izin: tanpa X-Frame-Options + CSP memuat daftar asal; tanpa izin: X-Frame-Options DENY + frame-ancestors 'none'",
      ok ? LULUS(`ber-izin: xfo=${xfoA || "(tidak dikirim)"}, csp="${cspA}"; tanpa izin: xfo=${xfoB}, csp="${cspB}"`)
         : GAGAL(`ber-izin: xfo=${xfoA}, csp="${cspA}"; tanpa izin: xfo=${xfoB}, csp="${cspB}"`));
  } catch (e) { catat(5, "Header balasan tepat untuk penyematan", "Periksa header", "sesuai daftar izin", GAGAL(e.message)); }

  // ---------- peramban ----------
  const peramban = await chromium.launch();
  const ctx = await peramban.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const galatKonsol = [];
  page.on("console", (m) => { if (m.type() === "error") galatKonsol.push(m.text()); });
  page.on("pageerror", (e) => galatKonsol.push("pageerror: " + e.message));

  await page.goto(ASAL_SEMAT + "/", { waitUntil: "load" });
  await tunggu(2500);

  // B1 — aplikasi termuat di dalam bingkai yang diizinkan, dan bingkai tanpa izin ditolak
  try {
    const bingkai = page.frames().filter((f) => f !== page.mainFrame());
    const tandaA = await page.frameLocator("#diizinkan").locator("text=Masuk").first().isVisible().catch(() => false);
    const judulIframe = await page.locator("#diizinkan").getAttribute("src");
    // Bingkai B (tanpa izin) → Chromium menampilkan halaman galat
    const urlB = bingkai.map((f) => f.url());
    const bDitolak = urlB.some((u) => u.startsWith("chrome-error://")) || bingkai.every((f) => !/localhost:8143/.test(f.url()));
    catat(1, "Penyematan diizinkan dimuat, yang tidak diizinkan ditolak", "Muat halaman penyemat berisi 2 bingkai: aplikasi ber-izin (8141) & mode daring tanpa izin (8143)",
      "bingkai 8141 memuat halaman login; bingkai 8143 gagal dimuat (ditolak peramban)",
      tandaA && bDitolak
        ? LULUS(`bingkai 8141: halaman login terlihat (src=${judulIframe}); bingkai 8143: ditolak (url bingkai=${urlB.join(", ") || "tidak ada"})`)
        : GAGAL(`login terlihat=${tandaA}; url bingkai=${urlB.join(", ")}`));
  } catch (e) { catat(1, "Penyematan diizinkan dimuat, yang tidak diizinkan ditolak", "Muat halaman penyemat", "sesuai izin", GAGAL(e.message)); }

  // B2 — login peserta didik DI DALAM bingkai
  try {
    const f = page.frameLocator("#diizinkan");
    await f.locator('input:not([type="password"])').first().fill("aditya");
    await f.locator('input[type="password"]').first().fill("siswa123");
    await f.getByRole("button", { name: /^Masuk$/ }).click();
    await tunggu(2500);
    const masuk = await f.locator("text=Dashboard").first().isVisible().catch(() => false);
    const namaSiswa = await f.locator("text=Aditya Pratama").first().isVisible().catch(() => false);
    catat(2, "Login peserta didik berhasil di dalam bingkai", "Isi username & password lalu klik Masuk pada formulir DI DALAM iframe",
      "dashboard siswa tampil di dalam bingkai (tidak diblokir cookie pihak ketiga)",
      masuk || namaSiswa
        ? LULUS(`setelah login: dashboard=${masuk}; nama siswa tampil=${namaSiswa} — aplikasi berfungsi penuh di dalam bingkai`)
        : GAGAL("dashboard tidak terlihat setelah login di dalam bingkai"));
  } catch (e) { catat(2, "Login peserta didik berhasil di dalam bingkai", "Login di dalam iframe", "dashboard tampil", GAGAL(e.message)); }

  // B3 — sesi tidak bergantung cookie (hapus semua cookie → tetap masuk)
  try {
    await ctx.clearCookies();
    await page.reload({ waitUntil: "load" });
    await tunggu(2500);
    const f = page.frameLocator("#diizinkan");
    const masihMasuk = await f.locator("text=Aditya Pratama").first().isVisible().catch(() => false);
    const sisaCookie = (await ctx.cookies()).length;
    catat(3, "Sesi tetap aktif setelah cookie dihapus", "Hapus seluruh cookie konteks peramban lalu muat ulang halaman penyemat",
      "siswa tetap dalam keadaan masuk (token disimpan di localStorage milik aplikasi)",
      masihMasuk ? LULUS(`tetap masuk=true; cookie tersisa=${sisaCookie} — tidak bergantung cookie pihak ketiga (baik untuk Google Sites)`)
                 : GAGAL("setelah cookie dihapus sesi ikut hilang (akan bermasalah di dalam bingkai pihak ketiga)"));
  } catch (e) { catat(3, "Sesi tetap aktif setelah cookie dihapus", "Hapus cookie + muat ulang", "tetap masuk", GAGAL(e.message)); }

  // B4 — perlindungan bawaan: bingkai tanpa izin ditolak & pesannya tercatat
  try {
    const pesanTolak = galatKonsol.filter((t) => /8143/.test(t) && /frame-ancestors|X-Frame-Options|Refused to display/i.test(t));
    const urlBingkaiB = page.frames().filter((f) => f !== page.mainFrame()).map((f) => f.url());
    const diblokir = urlBingkaiB.some((u) => u.startsWith("chrome-error://")) || urlBingkaiB.every((u) => !/8143/.test(u));
    catat(4, "Perlindungan bawaan: penyematan tanpa izin ditolak", "Muat bingkai ke aplikasi mode daring TANPA DKV_FRAME_ANCESTORS pada halaman penyemat",
      "bingkai gagal dimuat + peramban mencatat pelanggaran CSP frame-ancestors 'none'",
      diblokir && pesanTolak.length > 0
        ? LULUS(`bingkai ditolak (${urlBingkaiB.filter((u) => u.startsWith("chrome-error")).length} halaman galat); pesan CSP: "${pesanTolak[0].slice(0, 110)}…"`)
        : GAGAL(`diblokir=${diblokir}; pesan CSP ditemukan=${pesanTolak.length}`));
  } catch (e) { catat(4, "Perlindungan bawaan: penyematan tanpa izin ditolak", "Periksa konsol & url bingkai", "ditolak + pesan CSP", GAGAL(e.message)); }

  // B6 — tidak ada galat pemblokiran untuk bingkai yang DIIZINKAN
  try {
    const pemblokiran8141 = galatKonsol.filter((t) => /8141/.test(t) && /Refused to display|frame-ancestors|X-Frame-Options/i.test(t));
    catat(6, "Bingkai yang diizinkan tidak menimbulkan galat pemblokiran", "Kumpulkan galat konsol selama halaman penyemat dibuka, login, dan muat ulang",
      "0 pesan pemblokiran untuk bingkai 8141 (pesan untuk bingkai yang sengaja ditolak tidak dihitung)",
      pemblokiran8141.length === 0 ? LULUS(`0 pesan pemblokiran untuk bingkai ber-izin; pesan total di konsol: ${galatKonsol.length}`)
                                   : GAGAL(`pesan pemblokiran bingkai 8141: ${pemblokiran8141.slice(0, 2).join(" | ")}`));
  } catch (e) { catat(6, "Bingkai yang diizinkan tidak menimbulkan galat pemblokiran", "Periksa konsol", "0 pesan untuk 8141", GAGAL(e.message)); }

  await peramban.close();
  semat.close();
  await hentikan(A.anak); await hentikan(B.anak);
  fs.rmSync(TMP, { recursive: true, force: true });

  hasil.sort((a, b) => a.no - b.no);
  const lulus = hasil.filter((h) => h.status === "LULUS").length;
  const ringkas = `UJI PENYEMATAN (GOOGLE SITES): ${lulus}/${hasil.length} LULUS`;
  fs.writeFileSync(path.join(DOK, "uji-bingkai-hasil.json"),
    JSON.stringify({ waktu: new Date().toISOString(), asal_penyemat: ASAL_SEMAT, daftar_izin: DAFTAR_IZIN, ringkas, hasil }, null, 2), "utf8");
  console.log(`\n${ringkas}`);
  console.log("Hasil rinci ditulis: docs/uji-bingkai-hasil.json");
  process.exit(lulus === hasil.length ? 0 : 1);
}

main().catch((e) => { console.error("Uji gagal dijalankan:", e); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(1); });
