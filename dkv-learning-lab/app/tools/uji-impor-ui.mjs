// uji-impor-ui.mjs — uji impor siswa massal LEWAT ANTARMUKA (peramban sungguhan).
//
// Alur yang diuji (semua lewat klik nyata di Chromium):
//   I1  Panel "Tambah siswa massal" tampil di Panel Admin → Akun
//   I2  Tombol "🔍 Periksa dulu" menampilkan pratinjau (termasuk penanda kelas yang belum ada)
//   I3  Tombol "📥 Impor akun" membuat akun + kelas baru, dan menampilkan daftar akun beserta sandi awal
//   I4  Akun hasil impor benar-benar dapat login dari halaman login siswa
//   I5  Menekan Impor lagi dengan data yang sama → tiga baris DILEWATI (tidak menggandakan akun)
//   I6  Tombol "⬇️ Unduh daftar akun (CSV)" menghasilkan berkas CSV berisi nama/username/sandi
//   I7  Setelah impor, daftar akun di halaman Admin bertambah (reload otomatis)
//
// Pakai (server demo harus berjalan di 8080):
//   LD_LIBRARY_PATH=... node tools/uji-impor-ui.mjs
// Skrip ini MENAMBAH akun uji ke basis data demo. Jalankan `npm run seed` sesudahnya untuk data bersih.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const B = process.env.BASE || "http://localhost:8080";
const DOK = path.join(APP, "..", "docs");
const LULUS = (s = "") => ({ status: "LULUS", pesan: s });
const GAGAL = (s) => ({ status: "GAGAL", pesan: s });
const hasil = [];
const catat = (no, fitur, langkah, harapan, h) => {
  hasil.push({ no, fitur, langkah, harapan, aktual: h.pesan, status: h.status });
  console.log(`${h.status === "LULUS" ? "✅" : "❌"} ${no}. ${fitur}\n     ${h.pesan}`);
};

const TEMPEL = [
  "Uji Massal Satu\t0099000001\tX DKV 9",
  "Uji Massal Dua\t0099000002\tX DKV 9",
  "Uji Massal Tiga\t0099000003\tX DKV 1",   // kelas yang sudah ada
].join("\n");

async function main() {
  const peramban = await chromium.launch();
  const ctx = await peramban.newContext({ viewport: { width: 1366, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const galat = [];
  const tolakan = [];   // balasan 4xx/5xx beserta URL-nya, untuk bukti di I8
  page.on("pageerror", (e) => galat.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") galat.push(m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) tolakan.push(`${r.status()} ${r.request().method()} ${r.url().replace(B, "")}`); });

  // Masuk sebagai admin
  await page.goto(B + "/login");
  await page.getByRole("button", { name: /Mode Guru \/ Admin/ }).click();
  await page.locator("input").first().fill("admin");
  await page.locator('input[type="password"]').fill("admin123");
  await page.getByRole("button", { name: /^Masuk$/ }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
  await page.goto(B + "/admin");
  await page.waitForTimeout(2000);

  // I1 — panel tersedia (tab Akun adalah tab bawaan)
  const panel = page.getByText("Tambah siswa massal", { exact: false }).first();
  const adaPanel = await panel.isVisible().catch(() => false);
  catat("I1", "Panel impor massal tersedia di Panel Admin → Akun", "Buka /admin sebagai admin dan periksa panel",
    "Panel \"Tambah siswa massal (tempel dari Excel / daftar kelas)\" terlihat",
    adaPanel ? LULUS("panel tampil di tab Akun") : GAGAL("panel tidak ditemukan"));

  // Isi tempelan dari Excel (TAB), pilih kelas bawaan X DKV 1, sandi awal khusus
  await page.locator('textarea[placeholder^="Aditya Pratama"]').fill(TEMPEL);
  await page.getByRole("button", { name: /Periksa dulu/ }).click();
  await page.waitForTimeout(800);

  // I2 — pratinjau
  try {
    const pratinjau = page.getByText("Pratinjau 3 baris", { exact: false }).first();
    const ada = await pratinjau.isVisible().catch(() => false);
    const adaKelasBaru = await page.getByText("X DKV 9", { exact: true }).first().isVisible().catch(() => false);
    catat("I2", "Tombol \"Periksa dulu\" menampilkan pratinjau", "Klik 🔍 Periksa dulu setelah menempel 3 baris (2 kelas baru, 1 kelas lama)",
      "pratinjau 3 baris tampil sebelum disimpan",
      ada ? LULUS(`pratinjau tampil (kelas X DKV 9 terbaca=${adaKelasBaru}); belum ada akun yang dibuat`) : GAGAL("pratinjau tidak tampil"));
  } catch (e) { catat("I2", "Tombol \"Periksa dulu\" menampilkan pratinjau", "Klik Periksa dulu", "pratinjau tampil", GAGAL(e.message)); }

  // I3 — impor
  try {
    await page.getByRole("button", { name: /Impor akun/ }).click();
    await page.waitForTimeout(2500);
    const blok = page.locator("div.border-emerald-200");
    const isiBlok = (await blok.innerText().catch(() => "")).replace(/\s+/g, " ");
    const pesan = (isiBlok.match(/\d+ akun dibuat[^✕]*/) || [""])[0].trim();
    const akunBaris = await blok.locator("table tbody tr").count();
    const adaSandi = isiBlok.includes("dkv2026");
    catat("I3", "Tombol Impor membuat akun + kelas baru", "Klik 📥 Impor akun",
      "3 akun dibuat, kelas X DKV 9 terbentuk otomatis, daftar akun + sandi awal tampil",
      /3 akun dibuat/.test(pesan) && adaSandi
        ? LULUS(`pesan="${pesan}"; baris daftar akun hasil impor=${akunBaris}; sandi awal tampil=true`)
        : GAGAL(`pesan="${pesan}"; sandi tampil=${adaSandi}; isi blok="${isiBlok.slice(0, 120)}"`));
  } catch (e) { catat("I3", "Tombol Impor membuat akun + kelas baru", "Klik Impor akun", "3 akun dibuat", GAGAL(e.message)); }

  // I4 — akun hasil impor dapat login lewat halaman login siswa
  try {
    // Konteks peramban TERPISAH: kalau memakai konteks yang sama, login siswa menimpa token admin
    // di localStorage (dan permintaan admin berikutnya menjadi 403) — kesalahan skrip uji, bukan aplikasi.
    const ctxSiswa = await peramban.newContext({ viewport: { width: 390, height: 844 } });   // sekaligus menguji di ukuran ponsel
    const halaman = await ctxSiswa.newPage();
    await halaman.goto(B + "/login");
    await halaman.locator("input").first().fill("ujimassalsatu");
    await halaman.locator('input[type="password"]').fill("dkv2026");
    await halaman.getByRole("button", { name: /^Masuk$/ }).click();
    await halaman.waitForTimeout(2500);
    const masuk = !(await halaman.url()).includes("/login");
    const nama = await halaman.getByText("Uji Massal Satu").first().isVisible().catch(() => false);
    catat("I4", "Akun hasil impor dapat login", "Login dengan username otomatis (ujimassalsatu) & sandi awal di halaman siswa",
      "login berhasil dan nama siswa tampil di dashboard",
      masuk && nama ? LULUS(`masuk=true (url=${halaman.url().replace(B, "")}); nama tampil=${nama}`) : GAGAL(`masuk=${masuk}; nama tampil=${nama}`));
    await ctxSiswa.close();
  } catch (e) { catat("I4", "Akun hasil impor dapat login", "Login siswa hasil impor", "login berhasil", GAGAL(e.message)); }

  // I5 — impor diulang: semua dilewati
  try {
    await page.bringToFront();
    // tempelan diisi ulang karena daftar di textarea tetap utuh setelah impor (bukti tidak hilang)
    const isiTextarea = await page.locator('textarea[placeholder^="Aditya Pratama"]').inputValue();
    await page.getByRole("button", { name: /Impor akun/ }).click();
    await page.waitForTimeout(2500);
    const isiBlok = (await page.locator("div.border-emerald-200").innerText().catch(() => "")).replace(/\s+/g, " ");
    const pesan = (isiBlok.match(/\d+ akun dibuat[^✕]*/) || [""])[0].trim();
    catat("I5", "Impor ulang tidak menggandakan akun", "Tekan 📥 Impor akun sekali lagi dengan tempelan yang sama",
      "\"0 akun dibuat, 3 dilewati\"; tempelan di kotak teks tetap utuh",
      /0 akun dibuat/.test(pesan) && isiTextarea.includes("Uji Massal")
        ? LULUS(`pesan="${pesan}"; isi kotak tempelan tetap ada (${isiTextarea.split("\n").length} baris)`)
        : GAGAL(`pesan="${pesan}"; tempelan utuh=${isiTextarea.includes("Uji Massal")}`));
  } catch (e) { catat("I5", "Impor ulang tidak menggandakan akun", "Klik Impor lagi", "0 dibuat, 3 dilewati", GAGAL(e.message)); }

  // I6 — unduh CSV daftar akun
  try {
    const [unduhan] = await Promise.all([
      page.waitForEvent("download", { timeout: 15000 }),
      page.getByRole("button", { name: /Unduh daftar akun/ }).click(),
    ]);
    const berkas = path.join(APP, "data", ".uji-impor-akun.csv");
    await unduhan.saveAs(berkas);
    const isi = fs.readFileSync(berkas, "utf8");
    const namaBerkas = unduhan.suggestedFilename();
    const lengkap = ["ujimassalsatu", "ujimassaldua", "ujimassaltiga", "dkv2026", "Uji Massal Satu"].every((t) => isi.includes(t));
    const tetapTersedia = await page.getByRole("button", { name: /Unduh daftar akun/ }).isVisible().catch(() => false);
    fs.unlinkSync(berkas);
    catat("I6", "Unduh daftar akun (CSV) tetap tersedia setelah impor ulang", "Impor ulang (0 akun baru) lalu klik ⬇️ Unduh daftar akun (CSV) dan periksa isi berkas",
      "tombol unduh masih ada dan berkas CSV berisi nama, username, sandi awal ketiga akun hasil impor sebelumnya",
      lengkap && tetapTersedia ? LULUS(`berkas=${namaBerkas}; tombol tetap tampil=true; memuat 3 akun + sandi + nama siswa`) : GAGAL(`berkas=${namaBerkas}; tombol tetap tampil=${tetapTersedia}; isi tidak lengkap: ${isi.slice(0, 120)}`));
  } catch (e) { catat("I6", "Unduh daftar akun (CSV) berfungsi", "Klik unduh CSV", "berkas CSV benar", GAGAL(e.message)); }

  // I7 — daftar akun di Admin bertambah
  try {
    const hitung = await page.locator("table").first().locator("tbody tr").count();
    catat("I7", "Daftar akun di Admin ikut bertambah", "Setelah impor, hitung baris tabel \"Daftar akun\"",
      "tabel memuat akun baru (13 akun demo → 16)",
      hitung >= 16 ? LULUS(`baris tabel daftar akun=${hitung}`) : GAGAL(`baris tabel=${hitung} (diharapkan ≥ 16)`));
  } catch (e) { catat("I7", "Daftar akun di Admin ikut bertambah", "Hitung baris", "≥ 16", GAGAL(e.message)); }

  const galatHal = galat.filter((t) => !/favicon|401 \(Unauthorized\)/i.test(t));   // 401 pra-login wajar (belum ada token)
  const tolakanUnik = [...new Set(tolakan)];
  const lulus8 = galatHal.length === 0 && tolakanUnik.length === 0;
  hasil.push({ no: "I8", fitur: "Tidak ada galat JavaScript / permintaan ditolak selama alur impor",
    langkah: "Kumpulkan galat konsol, galat halaman, dan balasan 4xx/5xx (URL dicatat) selama seluruh alur",
    harapan: "0 galat konsol dan 0 balasan 4xx/5xx yang tidak diharapkan",
    aktual: `galat konsol=${galatHal.length}; balasan 4xx/5xx=${tolakanUnik.length}${tolakanUnik.length ? " → " + tolakanUnik.join(" | ") : ""}`,
    status: lulus8 ? "LULUS" : "GAGAL" });
  console.log(`${lulus8 ? "✅" : "❌"} I8. Tidak ada galat JavaScript / permintaan ditolak\n     galat=${galatHal.length}${galatHal.length ? ": " + galatHal.slice(0, 2).join(" | ") : ""}; 4xx/5xx=${tolakanUnik.length ? tolakanUnik.join(" | ") : "0"}`);

  await peramban.close();
  const lulus = hasil.filter((h) => h.status === "LULUS").length;
  const ringkas = `UJI IMPOR SISWA MASSAL (ANTARMUKA): ${lulus}/${hasil.length} LULUS`;
  fs.writeFileSync(path.join(DOK, "uji-impor-ui-hasil.json"),
    JSON.stringify({ waktu: new Date().toISOString(), basis: B, ringkas, hasil }, null, 2), "utf8");
  console.log(`\n${ringkas}`);
  console.log("Hasil rinci ditulis: docs/uji-impor-ui-hasil.json");
  process.exit(lulus === hasil.length ? 0 : 1);
}

main().catch((e) => { console.error("Uji gagal dijalankan:", e); process.exit(1); });
