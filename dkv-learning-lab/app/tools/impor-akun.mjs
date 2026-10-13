// impor-akun.mjs — membuat akun guru/siswa secara massal dari berkas CSV (untuk implementasi di sekolah).
//
// Pakai (server harus sedang berjalan; jalankan dari folder app/):
//   node tools/impor-akun.mjs --file data/siswa.csv
//   node tools/impor-akun.mjs --file data/siswa.csv --buat-kelas --sandi-awal dkv2026
//   node tools/impor-akun.mjs --file data/siswa.csv --kering        # hanya memeriksa, tidak menyimpan
//
// Format CSV (baris pertama = nama kolom; pemisah koma atau titik koma):
//   nama,username,nis,kelas,role,sandi
//   Aditya Pratama,aditya,0071234567,X DKV 1,siswa,
//   Dewi Lestari,dewi,,,guru,
// Kolom boleh sebagian saja. `nama` = nama lengkap (wajib), `username` wajib bila sandi diisi.
// `role` bawaan "siswa". `kelas` dicocokkan dengan nama kelas di aplikasi (boleh dikosongkan untuk guru).
// `sandi` kosong → memakai --sandi-awal. Baris dengan username yang sudah ada akan DILEWATI (aman diulang).
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const ambil = (nama, bawaan) => {
  const i = args.indexOf(nama);
  return i >= 0 && args[i + 1] ? args[i + 1] : bawaan;
};

const berkas = ambil("--file", "");
if (!berkas) {
  console.error("Contoh: node tools/impor-akun.mjs --file data/siswa.csv [--buat-kelas] [--sandi-awal siswa123]");
  process.exit(2);
}
const URL_DASAR = ambil("--url", "http://localhost:8080").replace(/\/$/, "");
const [ADMIN_USER, ADMIN_SANDI] = ambil("--admin", "admin:admin123").split(":");
const SANDI_AWAL = ambil("--sandi-awal", "siswa123");
const BUAT_KELAS = args.includes("--buat-kelas");
const KERING = args.includes("--kering");

// --- pembaca CSV sederhana (mendukung tanda kutip) ---
function bacaCsv(teks) {
  const baris = [];
  let sel = [], isi = "", dalamKutip = false;
  const pisah = (teks.split("\n")[0].match(/;/g) || []).length > (teks.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (dalamKutip) {
      if (c === '"' && teks[i + 1] === '"') { isi += '"'; i++; }
      else if (c === '"') dalamKutip = false;
      else isi += c;
    } else if (c === '"') dalamKutip = true;
    else if (c === pisah) { sel.push(isi); isi = ""; }
    else if (c === "\n") { sel.push(isi); isi = ""; baris.push(sel); sel = []; }
    else if (c !== "\r") isi += c;
  }
  if (isi.length || sel.length) { sel.push(isi); baris.push(sel); }
  return baris.filter((b) => b.some((s) => String(s).trim() !== ""));
}

const ALIAS = {
  nama: ["nama", "nama_lengkap", "nama lengkap", "nama siswa", "namasiswa"],
  username: ["username", "user", "akun", "username_login"],
  nis: ["nis", "nis_nip", "nis/nip", "nip", "nisn"],
  kelas: ["kelas", "kelas_id", "rombel", "nama kelas"],
  role: ["role", "peran"],
  sandi: ["sandi", "password", "kata sandi", "pass"],
};

const isi = fs.readFileSync(berkas, "utf8");
const baris = bacaCsv(isi);
if (baris.length < 2) { console.error("Berkas CSV kosong atau hanya berisi kepala kolom."); process.exit(2); }
const kepala = baris[0].map((h) => h.trim().toLowerCase());
const kolomDari = (logis) => {
  for (const a of ALIAS[logis]) {
    const i = kepala.indexOf(a);
    if (i >= 0) return i;
  }
  return -1;
};
const K = { nama: kolomDari("nama"), username: kolomDari("username"), nis: kolomDari("nis"), kelas: kolomDari("kelas"), role: kolomDari("role"), sandi: kolomDari("sandi") };
if (K.nama < 0) { console.error(`Kolom wajib "nama" tidak ditemukan. Kepala kolom terbaca: ${kepala.join(", ")}`); process.exit(2); }

const ambil0 = (row, i) => (i >= 0 && row[i] != null ? String(row[i]).trim() : "");
const dataBaris = baris.slice(1).map((row, n) => ({
  no: n + 1,
  nama: ambil0(row, K.nama),
  username: ambil0(row, K.username),
  nis: ambil0(row, K.nis),
  kelas: ambil0(row, K.kelas),
  role: (ambil0(row, K.role) || "siswa").toLowerCase(),
  sandi: ambil0(row, K.sandi) || SANDI_AWAL,
})).filter((d) => d.nama);

// --- sesi admin ---
const panggil = async (jalan, opsi = {}) => {
  const r = await fetch(URL_DASAR + jalan, {
    method: opsi.method || "GET",
    headers: { "Content-Type": "application/json", ...(opsi.token ? { "x-dkv-token": opsi.token } : {}) },
    body: opsi.body ? JSON.stringify(opsi.body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch { /* balasan bukan JSON */ }
  return { status: r.status, data: j };
};

console.log(`Server        : ${URL_DASAR}`);
console.log(`Berkas CSV    : ${berkas} (${dataBaris.length} baris data)`);
console.log(`Mode          : ${KERING ? "KERING (tidak menyimpan)" : "SIMPAN"}`);
console.log("");

const masuk = await panggil("/api/auth/login", { method: "POST", body: { username: ADMIN_USER, password: ADMIN_SANDI } });
if (masuk.status !== 200 || !masuk.data?.token) {
  console.error(`Gagal masuk sebagai admin (${masuk.status}): ${masuk.data?.error || "tidak ada token"}`);
  process.exit(1);
}
const token = masuk.data.token;

const daftarPengguna = (await panggil("/api/admin/users", { token })).data?.users || [];
const penggunaAda = new Map(daftarPengguna.map((u) => [String(u.username).toLowerCase(), u]));
// Baris tanpa username dikenali dari nama + kelas agar impor ulang tidak membuat akun kembar
// (sama seperti perilaku panel "Tambah siswa massal" di aplikasi).
const siswaAda = new Map();
for (const u of daftarPengguna.filter((x) => x.role === "siswa"))
  siswaAda.set(`${String(u.nama_lengkap).toLowerCase()}\u0000${u.kelas_id ?? ""}`, u.username);
const daftarKelas = (await panggil("/api/guru/kelas", { token })).data?.kelas || [];
const kelasAda = new Map(daftarKelas.map((k) => [String(k.nama).toLowerCase(), k.id]));
console.log(`Sudah ada     : ${penggunaAda.size} akun · ${daftarKelas.length} kelas (${daftarKelas.map((k) => k.nama).join(", ") || "-"})`);

const hasil = [];
let dibuat = 0, dilewati = 0, gagal = 0;

for (const d of dataBaris) {
  if (!d.username) { hasil.push({ ...d, status: "GAGAL", pesan: "username kosong" }); gagal++; continue; }
  if (penggunaAda.has(d.username.toLowerCase())) { hasil.push({ ...d, status: "DILEWATI", pesan: "username sudah ada" }); dilewati++; continue; }
  if (!["siswa", "guru", "admin"].includes(d.role)) { hasil.push({ ...d, status: "GAGAL", pesan: `role tidak dikenal: ${d.role}` }); gagal++; continue; }

  let kelasId = null;
  let catatanKelas = "";
  if (d.kelas) {
    kelasId = kelasAda.get(d.kelas.toLowerCase()) ?? null;
    if (!kelasId) {
      if (!BUAT_KELAS) { hasil.push({ ...d, status: "GAGAL", pesan: `kelas "${d.kelas}" belum ada (pakai --buat-kelas)` }); gagal++; continue; }
      if (KERING) { catatanKelas = `kelas "${d.kelas}" akan dibuat`; }
      else {
        const buat = await panggil("/api/admin/kelas", { method: "POST", token, body: { nama: d.kelas, tingkat: "X", tahun_ajaran: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1) } });
        if (buat.status !== 200) { hasil.push({ ...d, status: "GAGAL", pesan: `kelas "${d.kelas}" gagal dibuat: ${buat.data?.error || buat.status}` }); gagal++; continue; }
        kelasId = (await panggil("/api/guru/kelas", { token })).data?.kelas?.find((k) => k.nama.toLowerCase() === d.kelas.toLowerCase())?.id ?? null;
        kelasAda.set(d.kelas.toLowerCase(), kelasId);
        catatanKelas = `kelas "${d.kelas}" dibuat (id ${kelasId})`;
        console.log(`+ kelas dibuat: ${d.kelas} (id ${kelasId})`);
      }
    }
  }
  if (!d.username && d.role === "siswa") {
    const kunci = `${d.nama.toLowerCase()}\u0000${kelasId ?? ""}`;
    const kembar = siswaAda.get(kunci);
    if (kembar) { hasil.push({ ...d, status: "DILEWATI", pesan: `siswa dengan nama ini sudah ada (username: ${kembar})` }); dilewati++; continue; }
  }
  if (KERING) { hasil.push({ ...d, status: "RENCANA", pesan: ["akan dibuat", catatanKelas].filter(Boolean).join("; ") }); continue; }

  const buat = await panggil("/api/admin/users", {
    method: "POST", token,
    body: { username: d.username, password: d.sandi, role: d.role, nama_lengkap: d.nama, nis_nip: d.nis || null, kelas_id: kelasId },
  });
  if (buat.status === 200 && buat.data?.ok) {
    hasil.push({ ...d, status: "DIBUAT", pesan: [catatanKelas, buat.data.pesan || "ok"].filter(Boolean).join("; ") });
    dibuat++;
  } else {
    hasil.push({ ...d, status: "GAGAL", pesan: buat.data?.error || `HTTP ${buat.status}` });
    gagal++;
  }
}

// --- laporan ---
const laporan = path.join(path.dirname(path.resolve(berkas)), path.basename(berkas).replace(/\.[^.]+$/, "") + "-hasil.csv");
const barisLaporan = [["no", "nama", "username", "role", "kelas", "status", "pesan"]]
  .concat(hasil.map((h) => [h.no, h.nama, h.username, h.role, h.kelas, h.status, h.pesan]));
fs.writeFileSync(laporan, barisLaporan.map((b) => b.map((s) => `"${String(s ?? "").replace(/"/g, '""')}"`).join(",")).join("\n") + "\n", "utf8");

console.log("");
for (const h of hasil) console.log(`  ${h.status.padEnd(9)} ${h.nama}${h.username ? ` (${h.username})` : ""}${h.kelas ? ` · ${h.kelas}` : ""}${h.pesan && h.status !== "DIBUAT" ? ` → ${h.pesan}` : ""}`);
console.log("");
console.log(`Ringkasan: ${dibuat} dibuat, ${dilewati} dilewati, ${gagal} gagal${KERING ? " (mode kering: tidak ada yang disimpan)" : ""}`);
console.log(`Laporan  : ${laporan}`);
process.exit(gagal ? 1 : 0);
