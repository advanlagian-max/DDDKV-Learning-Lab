// backup-db.mjs — mencadangkan basis data DKV Learning Lab dengan aman, walau server sedang berjalan.
//
// Pakai (dari folder app/):
//   node tools/backup-db.mjs                          → cadangan ke app/backups/, simpan 14 berkas terakhir
//   node tools/backup-db.mjs --ke D:\cadangan --simpan 30
//   DKV_DB=data/ujian.db node tools/backup-db.mjs     → mencadangkan basis data lain
//
// Cadangan dibuat memakai API .backup() SQLite (aman untuk basis data mode WAL yang sedang dipakai),
// lalu berkas hasilnya DIBUKA ULANG dan diperiksa (integrity_check + jumlah baris tabel inti),
// sehingga cadangan yang rusak tidak lolos tanpa ketahuan.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { db, DB_PATH } from "../server/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const ambil = (nama, bawaan) => {
  const i = args.indexOf(nama);
  return i >= 0 && args[i + 1] ? args[i + 1] : bawaan;
};

const folder = path.resolve(ambil("--ke", path.join(__dirname, "..", "backups")));
const simpan = Math.max(1, Number(ambil("--simpan", 14)));
fs.mkdirSync(folder, { recursive: true });

const t = new Date();
const p2 = (n) => String(n).padStart(2, "0");
const berkasBaru = `dkv-${t.getFullYear()}${p2(t.getMonth() + 1)}${p2(t.getDate())}-${p2(t.getHours())}${p2(t.getMinutes())}${p2(t.getSeconds())}.db`;
const tujuan = path.join(folder, berkasBaru);

console.log(`Basis data sumber : ${DB_PATH}`);
console.log(`Tujuan cadangan   : ${tujuan}`);
await db.backup(tujuan);
console.log(`Ukuran berkas     : ${(fs.statSync(tujuan).size / 1024).toFixed(0)} KB`);

// --- verifikasi: buka ulang cadangan dan periksa isinya ---
const uji = new Database(tujuan, { readonly: true });
const integritas = uji.pragma("integrity_check", { simple: true });
const TABEL_INTI = ["users", "classes", "weeks", "assessments", "assessment_work",
                    "supervision_indicators", "supervision", "meeting_docs", "activity_logs"];
const jumlah = {};
for (const tb of TABEL_INTI) {
  try { jumlah[tb] = uji.prepare(`SELECT COUNT(*) c FROM ${tb}`).get().c; } catch { jumlah[tb] = -1; }
}
uji.close();
db.close();

const ringkas = Object.entries(jumlah).map(([tb, n]) => `${tb}=${n}`).join(" ");
const utuh = integritas === "ok" && jumlah.users > 0 && jumlah.weeks === 36 && jumlah.assessments === 260;
console.log(`Verifikasi        : integrity_check=${integritas}; ${ringkas}`);
console.log(utuh ? "Status            : CADANGAN SAH ✅" : "Status            : CADANGAN BERMASALAH ❌");

// --- rotasi: simpan hanya N berkas terbaru ---
const semua = fs.readdirSync(folder).filter((f) => /^dkv-\d{8}-\d{6}\.db$/.test(f)).sort();
while (semua.length > simpan) {
  const buang = semua.shift();
  fs.unlinkSync(path.join(folder, buang));
  console.log(`Cadangan lama dihapus: ${buang}`);
}
console.log(`Jumlah cadangan   : ${semua.length} berkas (batas ${simpan}) di ${folder}`);
process.exit(utuh ? 0 : 1);
