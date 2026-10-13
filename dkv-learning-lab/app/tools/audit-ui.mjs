// audit-ui.mjs — Audit nyata di PERAMBAN SUNGGUHAN (Chromium/Playwright):
// alur login tiap peran, navigasi & hak akses di layar, 7 laboratorium simulasi (klik nyata),
// asesmen di layar (kuis siswa + penilaian rubrik guru), validasi form, responsivitas desktop & ponsel,
// halaman cetak, serta pemantauan galat konsol/peramban.
//
// Jalankan dari folder app (server harus aktif di port 8080):
//   LD_LIBRARY_PATH=/home/user/.cache/chrome-libs/usr/lib/x86_64-linux-gnu:/home/user/.cache/chrome-libs/lib/x86_64-linux-gnu \
//     node tools/audit-ui.mjs
// Disarankan menjalankan `npm run seed` lebih dahulu supaya data demo bersih (audit ini MENULIS data uji).
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE || "http://localhost:8080";
const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.join(APP, "..");
const JEJAK = { galat: [] };
let label = "-";

const hasil = [];
let no = 0;
const catat = (area, fitur, langkah, harapan, aktual, lulus, perbaikan = "") => {
  hasil.push({ no: ++no, area, fitur, langkah, harapan, aktual, status: lulus ? "LULUS" : "GAGAL", perbaikan });
  console.log(`${lulus ? "✅" : "❌"} ${String(no).padStart(2)}. [${area}] ${fitur}\n     harapan: ${harapan}\n     aktual : ${aktual}`);
};

const browser = await chromium.launch();
async function halaman(viewport = { width: 1366, height: 768 }) {
  const ctx = await browser.newContext({ viewport, locale: "id-ID" });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", (e) => JEJAK.galat.push(`[${label}] pageerror: ${String(e.message).slice(0, 200)}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/favicon|ERR_|Failed to load resource/i.test(t)) return;
    JEJAK.galat.push(`[${label}] console: ${t.slice(0, 200)}`);
  });
  return { ctx, page };
}

const teks = async (page, re) => (await page.getByText(re).first().innerText().catch(() => "")).trim();
const adaTeks = async (page, s) => (await page.getByText(s, { exact: false }).count()) > 0;
const adaPola = async (page, re) => (await page.getByText(re).count()) > 0;

async function masuk(page, { user, pass, tab = "siswa" }) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  if (tab === "guru") await page.getByRole("button", { name: /Mode Guru/ }).click();
  await page.locator("input").first().fill(user);
  await page.locator('input[type="password"]').fill(pass);
  await page.getByRole("button", { name: /^Masuk$/ }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 15000 });
  await page.waitForTimeout(600);
}
const menuKlik = async (page, nama) => {
  await page.getByRole("link", { name: new RegExp(nama) }).first().click();
  await page.waitForTimeout(700);
};
const overflow = async (page) => page.evaluate(() => ({
  sw: document.documentElement.scrollWidth, iw: window.innerWidth, body: document.body.scrollWidth,
}));
const badgeKriteria = async (page) => {
  const t = await teks(page, /kriteria terpenuhi \d+\/\d+/);
  const m = /(\d+)\/(\d+)/.exec(t);
  return m ? { lulus: +m[1], total: +m[2], teks: t } : { lulus: -1, total: -1, teks: "(badge tidak ditemukan)" };
};
const keTingkat = async (page, n) => {
  await page.locator(`button:has-text("Tingkat ${n}")`).first().click();
  await page.waitForTimeout(300);
};
const kumpulkan = async (page, n) => {
  await page.getByRole("button", { name: new RegExp(`Kumpulkan hasil tingkat ${n}`) }).click();
  await page.waitForTimeout(700);
  return teks(page, /Hasil tingkat \d+ disimpan|Belum tersimpan/);
};
const isiRange = async (page, i, v) => { await page.locator('input[type="range"]').nth(i).fill(String(v)); await page.waitForTimeout(110); };

try {
  /* ================= A. Login & hak akses di layar ================= */
  label = "A. Login siswa";
  {
    const { ctx, page } = await halaman();
    await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /^Masuk$/ }).click();
    await page.waitForTimeout(400);
    const kosong = await adaTeks(page, "Username dan password wajib diisi.");
    await page.locator("input").first().fill("aditya");
    await page.locator('input[type="password"]').fill("salah-sekali");
    await page.getByRole("button", { name: /^Masuk$/ }).click();
    await page.waitForTimeout(1000);
    const salah = await adaTeks(page, "Username atau password salah.");
    await page.locator('input[type="password"]').fill("siswa123");
    await page.getByRole("button", { name: /^Masuk$/ }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 15000 });
    await page.waitForTimeout(900);
    const dash = await adaPola(page, /Selamat|Minggu \d+|Pekan berjalan/);
    const nav = await page.getByRole("link", { name: /Materi 36 Minggu/ }).count();
    const adaAdmin = await page.getByRole("link", { name: /Administrasi/ }).count();
    catat("A. Login & sesi (peramban)", "Login peserta didik: validasi isian, kredensial salah, dan masuk berhasil",
      "Form kosong → kirim; password salah → kirim; kredensial benar → kirim; periksa menu yang tampak",
      "pesan 'Username dan password wajib diisi.'; pesan 'Username atau password salah.'; masuk ke dashboard; menu siswa tampil & menu admin tidak",
      `kosong: pesan validasi=${kosong}; salah: pesan=${salah}; masuk=${dash ? "dashboard tampil" : "GAGAL"}; menu 'Materi 36 Minggu'=${nav > 0 ? "ada" : "tidak"}; link Administrasi=${adaAdmin === 0 ? "tidak ada" : "ADA"}`,
      kosong && salah && dash && nav > 0 && adaAdmin === 0);
    await ctx.close();
  }

  label = "B. Navigasi siswa";
  {
    const { ctx, page } = await halaman();
    await masuk(page, { user: "aditya", pass: "siswa123" });
    const menu = ["Dashboard", "Materi 36 Minggu", "Pertemuan \\(72\\)", "Laboratorium Simulasi", "LKPD & Tugas",
      "Asesmen & Penilaian", "Rencana Asesmen 36 Minggu", "Rekap Hasil Asesmen", "Portofolio Digital"];
    const gagal = [];
    const urls = [];
    for (const m of menu) {
      await menuKlik(page, m);
      const u = new URL(page.url());
      if (u.pathname === "/login") gagal.push(`${m}→login`);
      urls.push(`${m.replace(/\\/g, "")}=${u.pathname}`);
    }
    await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const redirAdmin = new URL(page.url()).pathname;
    const adaAdminUI = await adaPola(page, /Administrasi pengguna|Kelola akun|Impor data/);
    await page.goto(BASE + "/guru/rekap", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const redirGuru = new URL(page.url()).pathname;
    const adaGuruUI = await adaPola(page, /Rekap nilai kelas|Ekspor CSV|Unduh CSV/i);
    catat("B. Navigasi & hak akses (peramban)", "Sembilan menu peserta didik terbuka & halaman guru/admin tertutup bagi siswa",
      "Klik kesembilan menu navigasi siswa satu per satu; lalu buka langsung /admin dan /guru/rekap",
      "semua menu membuka halaman (bukan /login); /admin dan /guru dialihkan ke beranda siswa tanpa isi menu guru/admin",
      `menu: ${urls.join(", ")}; /admin→${redirAdmin} (ada UI admin=${adaAdminUI}); /guru/rekap→${redirGuru} (ada UI guru=${adaGuruUI})`,
      gagal.length === 0 && redirAdmin === "/" && redirGuru === "/" && !adaAdminUI && !adaGuruUI);
    await ctx.close();
  }

  label = "C. Navigasi guru";
  {
    const { ctx, page } = await halaman();
    await masuk(page, { user: "dewi", pass: "guru123", tab: "guru" });
    const menu = ["Dashboard Guru", "Kontrol Pembelajaran", "Materi & Suntingan", "Asesmen 36 Minggu", "Rekap Asesmen",
      "Remedial & Pengayaan", "Penilaian", "Dokumentasi Pertemuan", "Supervisi Akademik", "Rekap Nilai"];
    const gagal = [];
    for (const m of menu) {
      await menuKlik(page, m);
      const u = new URL(page.url());
      if (u.pathname === "/login" || u.pathname === "/") gagal.push(`${m}→${u.pathname}`);
    }
    const tabAsesmen = [];
    await page.goto(BASE + "/guru/asesmen", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    for (const t of ["Rencana & rubrik", "Penilaian rubrik", "Rekap hasil belajar", "Remedial & pengayaan"]) {
      await page.getByRole("button", { name: new RegExp(t) }).first().click();
      await page.waitForTimeout(900);
      const panjangIsi = (await page.locator("main").innerText().catch(() => "")).trim().length;
      tabAsesmen.push(`${t}=${panjangIsi > 600 ? `terisi (${panjangIsi} char)` : `kosong (${panjangIsi} char)`}`);
    }
    catat("C. Navigasi guru & tab asesmen", "Sepuluh menu guru terbuka dan empat tab 'Asesmen 36 Minggu' menampilkan isi",
      "Klik kesepuluh menu guru; lalu buka /guru/asesmen dan klik tiap tab",
      "tidak ada menu yang kembali ke /login atau beranda siswa; setiap tab menampilkan tabel/daftar",
      `menu: ${gagal.length ? `gagal ${gagal.join(", ")}` : "10/10 terbuka"}; tab: ${tabAsesmen.join(", ")}`,
      gagal.length === 0 && tabAsesmen.every((x) => x.includes("terisi")));
    await ctx.close();
  }

  /* ================= D. Asesmen: siswa mengerjakan kuis ================= */
  label = "D. Kuis siswa";
  {
    const { ctx, page } = await halaman();
    await masuk(page, { user: "aditya", pass: "siswa123" });
    await page.goto(BASE + "/asesmen/rencana", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    let hasilKuis = "tidak ada kuis yang siap dikerjakan";
    let dapat = false;
    const jumlahBuka = await page.getByRole("button", { name: "Buka", exact: true }).count();
    for (let i = 0; i < jumlahBuka; i++) {
      if (await page.getByRole("button", { name: /Kirim jawaban kuis/ }).count()) { dapat = true; break; }
      const tombol = page.getByRole("button", { name: "Buka", exact: true }).nth(i);
      if (!(await tombol.count())) continue;
      await tombol.click(); await page.waitForTimeout(900);
    }
    dapat = dapat || (await page.getByRole("button", { name: /Kirim jawaban kuis/ }).count()) > 0;
    if (dapat) {
      const radio = page.locator('input[type="radio"]');
      const n = await radio.count();
      for (let i = 0; i < n; i++) await radio.nth(i).check().catch(() => {});
      await page.getByRole("button", { name: /Kirim jawaban kuis/ }).click();
      await page.waitForTimeout(1500);
      const dinilai = await adaPola(page, /dinilai otomatis|Pembahasan:/);
      const pembahasan = await adaPola(page, /Pembahasan:/);
      const ulang = await page.getByRole("button", { name: /Kirim jawaban kuis/ }).count();
      const skor = await teks(page, /dinilai otomatis: \d+\/100|\d+\/100/);
      hasilKuis = `opsi terjawab=${n}; status dinilai otomatis=${dinilai}; pembahasan terbuka=${pembahasan}; tombol kirim ulang=${ulang === 0 ? "hilang (benar)" : "MASIH ADA"}; ${skor ? `"${skor.slice(0, 60)}"` : ""}`;
    }
    catat("D. Asesmen di layar (siswa)", "Kuis dikerjakan lewat antarmuka, dinilai otomatis, pembahasan terbuka, tidak bisa dikirim dua kali",
      "Buka /asesmen/rencana → pilih kuis yang belum dikerjakan → pilih semua opsi → 'Kirim jawaban kuis' → periksa hasil",
      "nilai otomatis tampil, pembahasan terbuka setelah dikirim, dan tombol kirim tidak tersedia lagi",
      hasilKuis, dapat && /dinilai otomatis=true/.test(hasilKuis) && /pembahasan terbuka=true/.test(hasilKuis) && /hilang/.test(hasilKuis));
    await ctx.close();
  }

  label = "E. Praktik siswa & nilai guru";
  let mingguPraktik = null;
  {
    const s = await halaman();
    await masuk(s.page, { user: "aditya", pass: "siswa123" });
    await s.page.goto(BASE + "/asesmen/rencana", { waitUntil: "domcontentloaded" });
    await s.page.waitForTimeout(1500);
    let kumpul = "tidak menemukan kartu penilaian praktik pada minggu aktif";
    // Kartu praktik minggu yang sedang berjalan (halaman otomatis menyaring ke minggu aktif siswa)
    const kartuPraktik = s.page.locator('div[class*="rounded-2xl"]').filter({ hasText: "Penilaian praktik" }).first();
    if (await kartuPraktik.count()) {
      const isiKartu = (await kartuPraktik.innerText().catch(() => "")).replace(/\s+/g, " ");
      mingguPraktik = Number((isiKartu.match(/minggu (\d+)/) || [])[1] || 0) || null;
      const buka = kartuPraktik.getByRole("button", { name: "Buka", exact: true });
      if (await buka.count()) { await buka.click(); await s.page.waitForTimeout(900); }
      const ta = kartuPraktik.locator("textarea").first();
      if (await ta.count()) await ta.fill("Audit otomatis: proses praktik dikerjakan sesuai rubrik (persiapan, proses, keselamatan, kemandirian).");
      const kirim = kartuPraktik.getByRole("button", { name: /^Kumpulkan pekerjaan$/ });
      if (await kirim.count()) {
        await kirim.click();
        await s.page.waitForTimeout(1500);
        kumpul = (await teks(s.page, /terkumpul|Nilai akan diisi guru|dikumpulkan/)) || "respons diterima";
      } else kumpul = `kartu praktik minggu ${mingguPraktik} tidak punya tombol 'Kumpulkan pekerjaan'`;
    }
    await s.ctx.close();

    const g = await halaman();
    await masuk(g.page, { user: "dewi", pass: "guru123", tab: "guru" });
    await g.page.goto(BASE + "/guru/asesmen", { waitUntil: "domcontentloaded" });
    await g.page.waitForTimeout(900);
    await g.page.getByRole("button", { name: /Penilaian rubrik/ }).first().click();
    await g.page.waitForTimeout(800);
    const sel = g.page.locator("select");
    await sel.first().selectOption(String(mingguPraktik || 1)).catch(() => {});
    await g.page.waitForTimeout(900);
    await sel.nth(1).selectOption("praktik").catch(() => {});
    await g.page.waitForTimeout(900);
    let kartuTerpilih = "tidak ada kartu praktik";
    const kartuPra = g.page.locator('button:has-text("Praktik")');
    if (await kartuPra.count()) {
      await kartuPra.first().click();
      kartuTerpilih = (await kartuPra.first().innerText()).replace(/\s+/g, " ").slice(0, 60);
    }
    await g.page.waitForTimeout(1700);
    // cari baris siswa yang sudah mengumpulkan pekerjaan
    const tombolSimpan = g.page.getByRole("button", { name: /^Simpan nilai$/ });
    let blokSiswa = null, siswaTerpilih = "";
    for (let i = 0; i < await tombolSimpan.count(); i++) {
      const blok = tombolSimpan.nth(i).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');
      const isi = (await blok.innerText().catch(() => "")).replace(/\s+/g, " ");
      const status = (isi.match(/\b(terkumpul|perlu-revisi|dinilai|draf|belum)\b/) || [])[1] || "";
      if (["terkumpul", "perlu-revisi", "dinilai"].includes(status)) { blokSiswa = blok; siswaTerpilih = isi.slice(0, 40); break; }
    }
    let jmlRubrik = 0, konfirmasiTercentang = false;
    if (blokSiswa) {
      const tombolSkor4 = blokSiswa.getByRole("button", { name: /^4 —/ });
      jmlRubrik = await tombolSkor4.count();
      for (let i = 0; i < jmlRubrik; i++) { await tombolSkor4.nth(i).click(); await g.page.waitForTimeout(90); }
      const cek = blokSiswa.locator('input[type="checkbox"]').last();
      if (await cek.count()) { await cek.check().catch(() => {}); konfirmasiTercentang = await cek.isChecked().catch(() => false); }
      await blokSiswa.getByRole("button", { name: /^Simpan nilai$/ }).click();
      await g.page.waitForTimeout(1700);
    }
    const pesan = (await teks(g.page, /Nilai .* tersimpan|Gagal menyimpan|wajib dicentang|rubrik 1–4 wajib/)) || "";
    const barisDinilai = await g.page.locator("text=/dinilai pada/").count();
    catat("E. Asesmen di layar (guru)", "Guru menilai karya siswa memakai rubrik di layar (slider + konfirmasi + simpan)",
      "Siswa mengumpulkan pekerjaan praktik lewat antarmuka → guru buka tab 'Penilaian rubrik' → pilih minggu 1 & jenis praktik → isi semua skor rubrik → centang konfirmasi → 'Simpan nilai'",
      "nilai tersimpan (pesan sukses) dan baris siswa menampilkan 'dinilai pada …'",
      `minggu uji=${mingguPraktik}; pengumpulan praktik=${kumpul}; kartu="${kartuTerpilih}"; baris siswa yang dinilai="${siswaTerpilih}"; tombol skor rubrik diklik=${jmlRubrik}; konfirmasi dicentang=${konfirmasiTercentang}; pesan=${pesan || "(tidak terbaca)"}; baris 'dinilai pada'=${barisDinilai}`,
      jmlRubrik >= 4 && konfirmasiTercentang && /tersimpan/.test(pesan) && barisDinilai > 0);

    const blokAksi = blokSiswa || g.page.locator("body");
    await blokAksi.getByRole("button", { name: /^Minta revisi$/ }).first().click();
    await g.page.waitForTimeout(1200);
    const pesanRevisi = (await teks(g.page, /Permintaan revisi|Kesempatan revisi sudah habis|Gagal/)) || "";
    await blokAksi.getByRole("button", { name: /Buka ulang \(remedial\)/ }).first().click();
    await g.page.waitForTimeout(1200);
    const pesanBuka = (await teks(g.page, /dibuka ulang|Nilai sebelumnya|Gagal|belum mengumpulkan/)) || "";
    catat("E2. Asesmen di layar (guru)", "Tombol 'Minta revisi' dan 'Buka ulang (remedial)' memberi respons nyata",
      "Klik 'Minta revisi' lalu 'Buka ulang (remedial)' pada siswa di tab 'Penilaian rubrik'",
      "kedua tombol menampilkan pesan hasil (berhasil atau penjelasan batas kesempatan revisi) — bukan tombol mati",
      `minta revisi → ${pesanRevisi || "(tak terbaca)"}; buka ulang → ${pesanBuka || "(tak terbaca)"}`,
      /revisi/i.test(pesanRevisi) && /dibuka ulang|Nilai sebelumnya|belum mengumpulkan/i.test(pesanBuka));
    await g.ctx.close();
  }

  /* ================= F. Validasi form di layar ================= */
  label = "F. Validasi form";
  {
    const { ctx, page } = await halaman();
    await masuk(page, { user: "aditya", pass: "siswa123" });
    await page.goto(BASE + "/tugas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    let pesanTugas = "tombol kumpul tidak ditemukan";
    const btnKumpul = page.getByRole("button", { name: /Kumpulkan|Kirim/ }).first();
    if (await btnKumpul.count()) {
      await btnKumpul.click();
      await page.waitForTimeout(1200);
      pesanTugas = (await teks(page, /wajib|belum diisi|tidak boleh kosong|berhasil|tersimpan|minimal/i)) || "(tidak ada pesan)";
    }
    await page.goto(BASE + "/portofolio", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    let pesanPorto = "tombol simpan tidak ditemukan";
    const btnPorto = page.getByRole("button", { name: /Simpan|Tambah|Unggah/i }).first();
    if (await btnPorto.count()) {
      await btnPorto.click();
      await page.waitForTimeout(1200);
      pesanPorto = (await teks(page, /wajib|Judul|tidak boleh kosong|berhasil|tersimpan/i)) || "(tidak ada pesan)";
    }
    catat("F. Validasi form (peramban)", "Form tugas & portofolio memberi pesan jelas saat isian belum lengkap",
      "Klik tombol kumpul pada LKPD tanpa mengisi; lalu klik simpan portofolio tanpa judul",
      "muncul pesan kesalahan/penjelasan isian wajib (bukan diam tanpa reaksi)",
      `LKPD: ${pesanTugas}; portofolio: ${pesanPorto}`,
      !/tidak ditemukan/.test(pesanTugas) && pesanTugas !== "(tidak ada pesan)" && !/tidak ditemukan/.test(pesanPorto) && pesanPorto !== "(tidak ada pesan)");
    await ctx.close();
  }

  /* ================= G. Laboratorium simulasi (7 lab, klik nyata) ================= */
  label = "G. Lab simulasi";
  {
    const { ctx, page } = await halaman();
    await masuk(page, { user: "aditya", pass: "siswa123" });

    const ALUR_BENAR = {
      1: ["Menerima brief & mencatat kebutuhan klien", "Riset referensi & mengumpulkan bahan", "Menyusun sketsa kasar (thumbnail)",
        "Desain digital di perangkat", "Proofing: cetak uji & periksa ukuran/warna", "Revisi berdasarkan umpan balik",
        "Cetak produksi & periksa hasil", "Serah terima & evaluasi hasil"],
      2: ["Brief & menyusun kalender konten", "Riset audiens & tren yang relevan", "Menetapkan konsep visual & nada pesan",
        "Produksi konten (foto/grafis)", "Penyuntingan & penyesuaian ukuran", "Unggah & penjadwalan", "Evaluasi performa & rencana berikutnya"],
      3: ["Brief produk & kendala produksi", "Riset pesaing & bahan kemasan", "Konsep struktur & grafis kemasan", "Mockup digital (die-line)",
        "Uji cetak pada bahan asli", "Revisi & perbaikan detail", "Produksi massal & kendali mutu", "Evaluasi & pelaporan hasil"],
    };
    const susunAlur = async (target) => {
      for (let i = 0; i < target.length; i++) {
        const baris = page.locator('li:has(button[aria-label^="naikkan"])');
        for (let ulang = 0; ulang < 25; ulang++) {
          const semua = await baris.allInnerTexts();
          const idx = semua.findIndex((t) => t.replace(/^\d+\./, "").replace(/[✅❌]/g, "").trim().startsWith(target[i].slice(0, 22)));
          if (idx < 0 || idx <= i) break;
          await baris.nth(idx).locator('button[aria-label^="naikkan"]').click();
          await page.waitForTimeout(70);
        }
      }
    };

    const LAB = [
      {
        id: "sim-tipografi", nama: "Tipografi",
        kerjakan: async () => {
          await keTingkat(page, 1);
          const b1 = await badgeKriteria(page);
          await keTingkat(page, 2);
          const b2 = await badgeKriteria(page);
          await keTingkat(page, 3);
          // cari kombinasi ukuran isi + kontras yang membuat seluruh kriteria tingkat 3 terpenuhi
          let terbaik = { lulus: -1 };
          for (const size of [12, 10, 13, 11, 14]) {
            await isiRange(page, 2, size);
            for (let k = 0; k < 4; k++) {
              await page.locator("select").nth(3).selectOption({ index: k });
              await page.waitForTimeout(160);
              const b = await badgeKriteria(page);
              if (b.lulus > terbaik.lulus) terbaik = { ...b, size, kontras: k + 1 };
              if (b.lulus === b.total) break;
            }
            if (terbaik.lulus === terbaik.total) break;
          }
          await isiRange(page, 2, terbaik.size ?? 12);
          await page.locator("select").nth(3).selectOption({ index: (terbaik.kontras ?? 1) - 1 });
          await page.waitForTimeout(250);
          return `t1=${b1.lulus}/${b1.total}, t2=${b2.lulus}/${b2.total}, t3 ukuran isi ${terbaik.size}px + kontras opsi#${terbaik.kontras}`;
        },
      },
      {
        id: "sim-fotografi", nama: "Fotografi",
        kerjakan: async () => {
          const set = async (a, s, i) => { await isiRange(page, 0, a); await isiRange(page, 1, s); await isiRange(page, 2, i); };
          await keTingkat(page, 1); await set(2, 2, 2); const b1 = await badgeKriteria(page);
          await keTingkat(page, 2); await set(2, 0, 3); const b2 = await badgeKriteria(page);
          await keTingkat(page, 3); await set(2, 1, 4); const b3 = await badgeKriteria(page);
          return `t1=${b1.lulus}/${b1.total}, t2=${b2.lulus}/${b2.total}, t3=${b3.lulus}/${b3.total}`;
        },
      },
      {
        id: "sim-bitmap-vektor", nama: "Bitmap & Vektor",
        kerjakan: async () => {
          await keTingkat(page, 1); await isiRange(page, 0, 1000); const b1 = await badgeKriteria(page);
          await keTingkat(page, 2);
          await page.locator("select").nth(1).selectOption({ index: 0 });
          await page.locator("select").nth(2).selectOption("vektor");
          await page.waitForTimeout(250); const b2 = await badgeKriteria(page);
          await keTingkat(page, 3);
          for (const s of ["vektor tetap tajam meski diperbesar", "Foto perlu bitmap karena menyimpan rincian cahaya",
            "Ukuran berkas bitmap bertambah mengikuti jumlah piksel"]) {
            await page.locator(`label:has-text("${s}")`).first().click().catch(() => {});
            await page.waitForTimeout(80);
          }
          const b3 = await badgeKriteria(page);
          return `t1=${b1.lulus}/${b1.total}, t2=${b2.lulus}/${b2.total}, t3=${b3.lulus}/${b3.total}`;
        },
      },
      {
        id: "sim-alur-produksi", nama: "Alur Produksi",
        kerjakan: async () => {
          const hasilTingkat = [];
          for (let t = 1; t <= 3; t++) {
            await keTingkat(page, t);
            await susunAlur(ALUR_BENAR[t]);
            await page.getByRole("button", { name: /^Periksa urutan$/ }).click();
            await page.waitForTimeout(400);
            const b = await badgeKriteria(page);
            hasilTingkat.push(`t${t}=${b.lulus}/${b.total}`);
          }
          return hasilTingkat.join(", ");
        },
      },
      {
        id: "sim-k3-ergonomi", nama: "K3 & Ergonomi",
        kerjakan: async () => {
          await keTingkat(page, 1);
          for (const s of ["Kabel listrik melintang", "Gelas minuman terbuka", "Mencabut steker dengan menarik",
            "Duduk membungkuk", "Monitor berjarak"]) {
            await page.locator(`label:has-text("${s}")`).first().click().catch(() => {});
            await page.waitForTimeout(70);
          }
          const b1 = await badgeKriteria(page);
          await keTingkat(page, 2);
          await isiRange(page, 1, 65); await isiRange(page, 2, 60);
          const b2 = await badgeKriteria(page);
          await keTingkat(page, 3);
          for (const s of ["aturan 20-20-20", "Menyandarkan pergelangan", "Menyesuaikan tinggi monitor"]) {
            await page.locator(`label:has-text("${s}")`).first().click().catch(() => {});
            await page.waitForTimeout(70);
          }
          const b3 = await badgeKriteria(page);
          return `t1=${b1.lulus}/${b1.total}, t2=${b2.lulus}/${b2.total}, t3=${b3.lulus}/${b3.total}`;
        },
      },
      {
        id: "sim-sketsa-lab", nama: "Sketsa & Ilustrasi",
        kerjakan: async () => {
          await keTingkat(page, 1);
          for (const k of ["lingkungan", "kolaborasi", "kebiasaan baik"]) {
            await page.locator(`button:has-text("${k}")`).first().click().catch(() => {});
            await page.waitForTimeout(70);
          }
          const b1 = await badgeKriteria(page);
          await keTingkat(page, 2);
          await page.locator('label:has-text("Flat warna cerah")').click().catch(() => {});
          for (const e of ["botol bekas", "tanaman", "anak", "palet warna"]) {
            await page.locator(`button:has-text("${e}")`).first().click().catch(() => {});
            await page.waitForTimeout(70);
          }
          const b2 = await badgeKriteria(page);
          await keTingkat(page, 3);
          const rng = page.locator('input[type="range"]');
          for (let i = 0; i < await rng.count(); i++) await isiRange(page, i, 4);
          await page.locator("textarea").first().fill("Perbaiki keterbacaan bentuk dan kontras warna pada sketsa alternatif terpilih.");
          await page.waitForTimeout(250);
          const b3 = await badgeKriteria(page);
          return `t1=${b1.lulus}/${b1.total}, t2=${b2.lulus}/${b2.total}, t3=${b3.lulus}/${b3.total}`;
        },
      },
      {
        id: "sim-studio-dkv", nama: "Studio DKV",
        kerjakan: async () => {
          await keTingkat(page, 1);
          for (const s of ["Berapa harga yang diterima pasar", "Seperti apa karya pesaing", "Siapa sasaran utama"]) {
            await page.locator(`label:has-text("${s}")`).first().click().catch(() => {});
            await page.waitForTimeout(70);
          }
          await page.locator("select").nth(0).selectOption("dewasa-lokal");
          await page.locator("select").nth(1).selectOption("sederhana-vektor");
          await page.locator("select").nth(2).selectOption("kartu-cetak");
          await page.locator('label:has-text("Hitam–putih–satu abu")').click().catch(() => {});
          await page.locator("select").nth(3).selectOption("sans-jelas");
          await page.locator("select").nth(4).selectOption("kartu");
          await page.locator('label:has-text("Ubah logo menjadi vektor satu warna")').click().catch(() => {});
          for (const s of ["Kebutuhan & kendala klien", "Konsep dan alasan pemilihan warna", "Karya akhir (mockup", "Kendala yang dihadapi & pelajaran"]) {
            await page.locator(`label:has-text("${s}")`).first().click().catch(() => {});
            await page.waitForTimeout(70);
          }
          await page.waitForTimeout(300);
          const b = await badgeKriteria(page);
          return `t1=${b.lulus}/${b.total} (5 tahap proyek)`;
        },
      },
    ];

    const ringkas = [];
    let semuaLulus = true;
    for (const lab of LAB) {
      await page.goto(`${BASE}/simulasi/${lab.id}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1100);
      const tombolMulai = page.getByRole("button", { name: /Jalankan laboratorium/ });
      if (await tombolMulai.count()) { await tombolMulai.click(); await page.waitForTimeout(700); }
      let catatanKerja = "";
      try { catatanKerja = (await lab.kerjakan()) || ""; } catch (e) { catatanKerja = `galat interaksi: ${String(e.message).slice(0, 90)}`; }
      const b = await badgeKriteria(page);
      const tingkatAktif = ((await teks(page, /Misi tingkat \d+/)) || "tingkat 1").match(/\d+/)?.[0] || "1";
      const pesanSimpan = await kumpulkan(page, Number(tingkatAktif));
      const tersimpan = /disimpan/.test(pesanSimpan);
      if (!tersimpan || b.lulus !== b.total) semuaLulus = false;
      ringkas.push(`${lab.nama}: ${catatanKerja}; ${b.teks}; simpan="${pesanSimpan || "(tak terbaca)"}"`);
    }
    catat("G. Laboratorium simulasi (peramban)", "Tujuh laboratorium dapat dioperasikan dan hasilnya tersimpan lewat klik nyata",
      "Untuk tiap lab: buka halaman, selesaikan kriteria tiap tingkat dengan mengubah pengaturan/pilihan, lalu klik 'Kumpulkan hasil tingkat n'",
      "kriteria terpenuhi penuh (n/n) dan server menyimpan hasil ('Hasil tingkat n disimpan')",
      ringkas.join(" | "), semuaLulus);

    await page.goto(BASE + "/simulasi/sim-technopreneur", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    const tandai = await adaPola(page, /dalam pengembangan|belum tersedia/);
    catat("G2. Laboratorium simulasi (peramban)", "Simulasi yang belum selesai ditandai jujur di antarmuka",
      "Buka /simulasi/sim-technopreneur",
      "halaman menampilkan label 'dalam pengembangan'/'belum tersedia' — bukan tombol palsu",
      `label pengembangan tampil=${tandai}`, tandai);
    await ctx.close();
  }

  /* ================= H. Responsivitas ================= */
  label = "H. Responsivitas";
  {
    const ujiHalaman = [
      { path: "/materi/1", nama: "Materi minggu 1" },
      { path: "/simulasi/sim-tipografi", nama: "Lab tipografi" },
      { path: "/asesmen/rencana", nama: "Rencana asesmen" },
      { path: "/pertemuan/5/senin", nama: "Pertemuan minggu 5" },
    ];
    const laporan = [];
    let lulus = true;
    for (const vp of [{ w: 1366, h: 768, nama: "desktop 1366×768" }, { w: 390, h: 844, nama: "ponsel 390×844" }]) {
      const { ctx, page } = await halaman({ width: vp.w, height: vp.h });
      await masuk(page, { user: "aditya", pass: "siswa123" });
      for (const h of ujiHalaman) {
        await page.goto(BASE + h.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        const o = await overflow(page);
        const meluber = o.sw > o.iw + 2;
        if (meluber) lulus = false;
        laporan.push(`${vp.nama} ${h.nama}: ${meluber ? `MELUBER ${o.sw}>${o.iw}` : "pas"}`);
      }
      if (vp.w === 390) {
        await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        await page.getByRole("button", { name: /☰ Menu/ }).click();
        await page.waitForTimeout(600);
        const terlihat = await page.getByRole("link", { name: /Laboratorium Simulasi/ }).isVisible().catch(() => false);
        await page.getByRole("link", { name: /Laboratorium Simulasi/ }).click();
        await page.waitForTimeout(1000);
        const pindah = new URL(page.url()).pathname === "/simulasi";
        laporan.push(`ponsel: tombol ☰ Menu membuka navigasi=${terlihat}; berpindah ke ${new URL(page.url()).pathname}=${pindah}`);
        if (!terlihat || !pindah) lulus = false;
      }
      await ctx.close();
    }
    catat("H. Responsivitas (peramban)", "Tidak ada halaman meluber horizontal di desktop & ponsel; navigasi ponsel berfungsi",
      "Ukur scrollWidth vs lebar jendela pada 4 halaman di 1366×768 dan 390×844; lalu klik tombol ☰ Menu di ponsel",
      "scrollWidth ≤ lebar jendela + 2 px; menu ponsel terbuka dan memindahkan halaman",
      laporan.join(" | "), lulus);
  }

  /* ================= I. Halaman cetak ================= */
  label = "I. Halaman cetak";
  {
    const { ctx, page } = await halaman();
    await masuk(page, { user: "dewi", pass: "guru123", tab: "guru" });
    const daftar = [
      { path: "/guru/rekap-cetak", nama: "Rekap nilai kelas", tombol: /Cetak rekap kelas/ },
      { path: "/guru/dokumentasi/cetak/2/senin", nama: "Dokumentasi minggu 2 Senin", tombol: /Cetak \/ Simpan PDF/ },
    ];
    const laporan = [];
    let lulus = true;
    for (const h of daftar) {
      await page.goto(BASE + h.path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1300);
      const kop = await adaTeks(page, "SMK Negeri 3 Kuningan");
      const ttd = await adaPola(page, /Mengetahui|Kuningan, /);
      const btn = await page.getByRole("button", { name: h.tombol }).count();
      if (!kop || !ttd || btn === 0) lulus = false;
      laporan.push(`${h.nama}: kop=${kop}, tanda tangan=${ttd}, tombol cetak=${btn > 0}`);
      await page.getByRole("button", { name: h.tombol }).first().click().catch(() => {});
      await page.waitForTimeout(800);
      const pesan = await adaPola(page, /Ctrl\/Cmd \+ P|dialog cetak/);
      if (!pesan) lulus = false;
      laporan.push(`${h.nama}: tombol cetak ditekan → pesan pratinjau=${pesan}`);
    }
    await page.goto(BASE + "/guru/supervisi", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1300);
    let tautan = page.locator('a[href*="/guru/supervisi/cetak/"]').first();
    if (!(await tautan.count())) {
      // riwayat supervisi masih kosong (mis. setelah npm run seed) → buat satu catatan lewat API memakai sesi guru yang sedang aktif
      await page.evaluate(async () => {
        const token = localStorage.getItem("dkv_token") || localStorage.getItem("token");
        const daftar = await (await fetch("/api/supervisi/daftar-guru", { headers: { "x-dkv-token": token } })).json();
        const guruUji = daftar.guru?.[0];
        await fetch("/api/supervisi", {
          method: "POST", headers: { "Content-Type": "application/json", "x-dkv-token": token },
          body: JSON.stringify({ guru_id: guruUji.id, kelas_id: 1, week_nomor: 4, tanggal: "2026-10-13",
            skor: { "C.1.1": 4, "C.1.2": 3, "C.1.3": 2, "C.1.4": 4 }, catatan: "Audit UI", status: "draft" }),
        });
      }).catch(() => {});
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      tautan = page.locator('a[href*="/guru/supervisi/cetak/"]').first();
    }
    let infoSup = "tautan cetak supervisi tidak ditemukan";
    if (await tautan.count()) {
      await tautan.click();
      await page.waitForTimeout(1300);
      const kop = await adaTeks(page, "SMK Negeri 3 Kuningan");
      const isi = await adaPola(page, /Indikator|Skor|Catatan/);
      infoSup = `halaman=${new URL(page.url()).pathname}; kop=${kop}; isi indikator=${isi}`;
      if (!kop || !isi) lulus = false;
    } else lulus = false;
    catat("I. Halaman cetak (peramban)", "Halaman cetak rekap, dokumentasi, dan supervisi tampil lengkap (kop sekolah, tanda tangan, tombol cetak)",
      "Buka halaman cetak → periksa kop + blok tanda tangan + tombol cetak → tekan tombolnya",
      "setiap halaman memuat kop sekolah & blok tanda tangan; tombol cetak memberi respons (pesan pratinjau bila dialog cetak tidak muncul)",
      laporan.join(" | ") + " | supervisi: " + infoSup, lulus);
    await ctx.close();
  }

  /* ================= J. Supervisi & administrasi ================= */
  label = "J. Supervisi & admin";
  {
    const { ctx, page } = await halaman();
    await masuk(page, { user: "dewi", pass: "guru123", tab: "guru" });
    await page.goto(BASE + "/guru/dokumentasi", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);
    const entri = await page.locator("text=/Minggu \\d+/").count();
    const kontrol = await page.locator("select").count();
    catat("J. Supervisi & dokumentasi (peramban)", "Halaman dokumentasi pertemuan terbuka dengan kontrol pengisian",
      "Buka /guru/dokumentasi; hitung entri minggu dan kontrol pilihan di layar",
      "daftar memuat banyak entri minggu dan minimal satu kontrol pilihan (mis. prinsip pembelajaran) tersedia",
      `entri minggu terlihat=${entri}; jumlah kontrol select=${kontrol}`,
      entri >= 5 && kontrol >= 1);
    await ctx.close();

    const adm = await halaman();
    await masuk(adm.page, { user: "admin", pass: "admin123", tab: "guru" });
    await adm.page.waitForTimeout(900);
    const urlAdmin = new URL(adm.page.url()).pathname;
    const tab = adm.page.getByRole("button", { name: /Indikator Supervisi/ });
    let n = 0, ket = "tab 'Indikator Supervisi' tidak ditemukan";
    if (await tab.count()) {
      await tab.first().click();
      await adm.page.waitForTimeout(2200);
      n = await adm.page.locator("table tbody tr").count();
      const aspekAdm = /C\.[1-4]/.test(await adm.page.locator("main").innerText().catch(() => ""));
      ket = `tab terbuka; baris indikator=${n}; memuat kolom aspek C.1–C.4=${aspekAdm}`;
    }
    catat("J2. Administrasi (peramban)", "Admin dapat membuka tab Indikator Supervisi (butir instrumen dokumen sekolah)",
      "Masuk sebagai admin → /admin → klik tab '🪪 Indikator Supervisi'",
      "daftar butir indikator C.1.x–C.4.x tampil sehingga sekolah dapat menyuntingnya",
      `url=${urlAdmin}; ${ket}`, n >= 18);
    await adm.ctx.close();
  }

  /* ================= K. Sapuan seluruh halaman ================= */
  label = "K. Sapuan halaman";
  {
    const rencana = [
      { peran: "siswa", akun: "aditya", pass: "siswa123", tab: "siswa",
        halaman: ["/", "/materi", "/materi/1", "/materi/16", "/pertemuan", "/pertemuan/5/senin", "/simulasi", "/tugas",
          "/asesmen", "/asesmen/rencana", "/asesmen/rekap", "/portofolio", "/pengaturan"] },
      { peran: "guru", akun: "dewi", pass: "guru123", tab: "guru",
        halaman: ["/guru", "/guru/kontrol", "/guru/materi", "/guru/asesmen", "/guru/rekap-asesmen", "/guru/remedial",
          "/guru/penilaian", "/guru/dokumentasi", "/guru/supervisi", "/guru/rekap", "/guru/rekap-cetak",
          "/guru/dokumentasi/cetak/2/senin"] },
      { peran: "admin", akun: "admin", pass: "admin123", tab: "guru", halaman: ["/admin"] },
    ];
    const masalah = [];
    const rekap = [];
    for (const r of rencana) {
      const { ctx, page } = await halaman();
      const galatHal = [];
      const tangkap = (e) => galatHal.push(String(e.message).slice(0, 90));
      page.on("pageerror", tangkap);
      page.on("console", (m) => { if (m.type() === "error" && !/favicon|ERR_|Failed to load resource/i.test(m.text())) galatHal.push(m.text().slice(0, 90)); });
      await masuk(page, { user: r.akun, pass: r.pass, tab: r.tab });
      let kosong = 0;
      let tersedikit = { h: "-", n: 1e9 };
      for (const h of r.halaman) {
        galatHal.length = 0;
        await page.goto(BASE + h, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1200);
        const isi = (await page.locator("main").innerText().catch(() => "")).trim().length;
        if (isi < tersedikit.n) tersedikit = { h, n: isi };
        if (isi < 120) { kosong++; masalah.push(`${r.peran} ${h}: isi hanya ${isi} karakter`); }
        if (galatHal.length) masalah.push(`${r.peran} ${h}: ${galatHal[0]}`);
      }
      rekap.push(`${r.peran} ${r.halaman.length} halaman, kosong=${kosong} (terpendek ${tersedikit.h}: ${tersedikit.n} char)`);
      await ctx.close();
    }
    catat("K. Sapuan seluruh halaman (peramban)", "Semua halaman utama per peran dirender tanpa galat React dan tidak kosong",
      "Kunjungi 13 halaman siswa, 12 halaman guru, dan /admin dengan peramban; catat galat konsol/peramban dan panjang isi halaman",
      "0 galat JavaScript dan tidak ada halaman kosong (isi > 120 karakter; halaman pengaturan memang ringkas)",
      `${rekap.join("; ")}${masalah.length ? `; masalah: ${masalah.slice(0, 4).join(" | ")}` : "; 0 galat"}`,
      masalah.length === 0);
  }

  /* ================= L. Pengawasan galat peramban ================= */
  {
    const galat = JEJAK.galat;
    catat("K. Galat peramban", "Tidak ada galat JavaScript/console selama seluruh penelusuran audit",
      "Kumpulkan pageerror & console error di semua halaman yang dibuka (login, menu siswa/guru, 7 lab, asesmen, halaman cetak, admin)",
      "0 galat (kegagalan pemuatan sumber daya jaringan tidak dihitung)",
      galat.length === 0 ? "0 galat" : `${galat.length} galat: ${galat.slice(0, 5).join(" ; ")}`,
      galat.length === 0);
  }
} catch (e) {
  console.error("Audit UI gagal dijalankan:", e);
  process.exitCode = 2;
}

const gagal = hasil.filter((h) => h.status === "GAGAL");
const ringkas = `AUDIT UI/PERAMBAN: ${hasil.length - gagal.length}/${hasil.length} LULUS${gagal.length ? ` — GAGAL: ${gagal.map((g) => g.no).join(", ")}` : ""}`;
console.log(`\n${ringkas}`);
const berkas = path.join(ROOT, "docs", "audit-ui-hasil.json");
fs.writeFileSync(berkas, JSON.stringify({ waktu: new Date().toISOString(), basis: BASE, ringkas, hasil }, null, 2));
console.log(`Hasil rinci ditulis: ${path.relative(ROOT, berkas)}`);
await browser.close();
process.exit(gagal.length ? 1 : 0);
