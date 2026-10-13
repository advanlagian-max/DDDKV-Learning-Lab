// seed.js — Mengisi database awal (idempoten) + kurikulum 36 minggu.
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
import { db, setSetting, getSetting } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const PASSWORD_DEMO = {
  admin: "admin123", guru: "guru123", supervisor: "guru123", siswa: "siswa123"
};

export function seed({ reset = false } = {}) {
  if (reset) {
    // Urutan penting (ada FK melingkar: users.kelas_id ↔ classes.wali_guru_id),
    // jadi foreign key dimatikan sementara saat reset lalu diaktifkan kembali.
    db.pragma("foreign_keys = OFF");
    for (const t of ["assessment_work", "assessments", "sessions", "login_attempts", "activity_logs", "supervision", "reflections", "portfolio",
      "submissions", "assignments", "progress", "learning_controls", "learning_sessions", "announcements",
      "weeks", "settings", "classes", "users"]) {
      db.prepare(`DELETE FROM ${t}`).run();
    }
    // Mulai ulang penomoran id agar data demo selalu dimulai dari id kecil (1,2,3,…)
    try { db.prepare("DELETE FROM sqlite_sequence").run(); } catch { }
  }
  // --- rencana asesmen 36 minggu (LKPD, kuis, formatif, sumatif, praktik, proyek) ---
  const fAsesmen = path.join(DATA_DIR, "asesmen-36m.json");
  const jmlAsesmen = db.prepare("SELECT COUNT(*) c FROM assessments").get().c;
  if (jmlAsesmen > 0) {
    console.log(`Asesmen 36 minggu: ${jmlAsesmen} butir sudah ada (suntingan guru dipertahankan)`);
  } else if (fs.existsSync(fAsesmen)) {
    db.prepare("DELETE FROM assessments").run();
    const doc = JSON.parse(fs.readFileSync(fAsesmen, "utf8"));
    const insAs = db.prepare(`INSERT OR REPLACE INTO assessments
      (id, week_nomor, meeting_key, tipe, judul, deskripsi, bobot, nilai_otomatis, perlu_konfirmasi, kktp, kesempatan_revisi,
       jumlah_butir, butir, kriteria, rubrik, remedial, pengayaan, luaran, langkah, bukti, sumber)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const a of doc.asesmen) {
      insAs.run(a.id, a.minggu, a.pertemuan, a.tipe, a.judul, a.deskripsi || null, a.bobot || 0,
        String(a.nilaiOtomatis), a.perluKonfirmasiGuru ? 1 : 0, a.kktp || 75, a.kesempatanRevisi ?? 1,
        a.jumlahButir || (a.butir ? a.butir.length : 0),
        JSON.stringify(a.butir || null), JSON.stringify(a.kriteria || null), JSON.stringify(a.rubrik || null),
        a.remedial || null, a.pengayaan || null, a.luaran || null,
        JSON.stringify(a.langkah || null), a.bukti || null, JSON.stringify(a.sumber || null));
    }
    console.log(`Asesmen 36 minggu dimuat: ${doc.asesmen.length} butir asesmen`);
  }


  // Nilai awal yang harus ada bahkan pada basis data lama (idempoten, tidak menimpa suntingan).
  if (!getSetting("institusi")) setSetting("institusi", { nama: "SMK Negeri 3 Kuningan", mapel: "Dasar-Dasar Desain Komunikasi Visual", fase: "Fase E / Kelas X" });
  if (!getSetting("supervisor")) setSetting("supervisor", { nama: "Saidun, S.Pd., M.M.", nip: "197009201994021002", sumber: "Instrumen Supervisi Akademik (dokumen sekolah)" });

  const hasUsers = db.prepare("SELECT COUNT(*) c FROM users").get().c > 0;
  if (hasUsers) return { seeded: false };

  // --- kelas ---
  const insClass = db.prepare("INSERT INTO classes (nama, tingkat, tahun_ajaran) VALUES (?,?,?)");
  const kelas1 = insClass.run("X DKV 1", "X", "2026/2027").lastInsertRowid;
  const kelas2 = insClass.run("X DKV 2", "X", "2026/2027").lastInsertRowid;

  // --- pengguna ---
  const insUser = db.prepare(`INSERT INTO users (username, email, password_hash, role, nama_lengkap, nis_nip, kelas_id)
    VALUES (?,?,?,?,?,?,?)`);
  const h = (p) => bcrypt.hashSync(p, 10);

  insUser.run("admin", "admin@smkn3kuningan.sch.id", h(PASSWORD_DEMO.admin), "admin", "Administrator Sekolah", "ADM-01", null);
  insUser.run("dewi", "dewi@smkn3kuningan.sch.id", h(PASSWORD_DEMO.guru), "guru", "Dewi Kartika, S.Ds.", "1988-0415", kelas1);
  insUser.run("saidun", "saidun@smkn3kuningan.sch.id", h(PASSWORD_DEMO.supervisor), "guru", "Saidun, S.Pd., M.M.", "197009201994021002", kelas2);

  const siswa1 = [
    ["aditya", "Aditya Pratama", "1001"], ["bella", "Bella Ramadhani", "1002"], ["citra", "Citra Lestari", "1003"],
    ["dimas", "Dimas Aryo", "1004"], ["elina", "Elina Nurfadilah", "1005"], ["fajar", "Fajar Setiawan", "1006"],
  ];
  const siswa2 = [
    ["gita", "Gita Puspita", "1007"], ["hafiz", "Hafiz Anshori", "1008"], ["intan", "Intan Permata", "1009"],
    ["jejen", "Jejen Suherman", "1010"],
  ];
  for (const [u, n, nis] of siswa1) insUser.run(u, null, h(PASSWORD_DEMO.siswa), "siswa", n, nis, kelas1);
  for (const [u, n, nis] of siswa2) insUser.run(u, null, h(PASSWORD_DEMO.siswa), "siswa", n, nis, kelas2);
  db.prepare("UPDATE classes SET wali_guru_id=? WHERE id=?").run(db.prepare("SELECT id FROM users WHERE username='dewi'").get().id, kelas1);
  db.prepare("UPDATE classes SET wali_guru_id=? WHERE id=?").run(db.prepare("SELECT id FROM users WHERE username='saidun'").get().id, kelas2);

  // --- pengaturan awal (dapat diubah admin tanpa menyentuh kode) ---
  setSetting("jam_pelajaran_menit", 45);
  setSetting("hari_pembelajaran", ["Senin", "Rabu"]);
  setSetting("jp_per_pertemuan", 6);
  setSetting("menit_per_pertemuan", 270);
  setSetting("pekan_berjalan", 2);           // untuk demo dashboard
  setSetting("tahun_ajaran", "2026/2027");
  setSetting("minggu_efektif", { semester1: { mulai: 1, selesai: 18, catatan: "asumsi - menunggu kalender sekolah" },
                                  semester2: { mulai: 19, selesai: 36, catatan: "asumsi - menunggu kalender sekolah" } });
  setSetting("institusi", { nama: "SMK Negeri 3 Kuningan", mapel: "Dasar-Dasar Desain Komunikasi Visual", fase: "Fase E / Kelas X" });
  // Identitas supervisor diambil dari dokumen instrumen (SUP) — dipakai pada kop & tanda tangan laporan cetak.
  setSetting("supervisor", { nama: "Saidun, S.Pd., M.M.", nip: "197009201994021002", sumber: "Instrumen Supervisi Akademik (dokumen sekolah)" });
  setSetting("pengumuman_awal", "Selamat datang di DKV Learning Lab. Ikuti arahan guru pada menu Kontrol Pembelajaran.");
  // Kalender: BELUM ada kalender resmi sekolah -> usulan yang wajib diverifikasi guru/admin
  setSetting("kalender_sekolah", [
    { tanggal: "2026-07-13", keterangan: "Contoh: awal tahun ajaran (usulan - perlu verifikasi)", jenis: "kegiatan" },
    { tanggal: "2026-09-01", keterangan: "Contoh: pekan asesmen tengah semester 1 (usulan - perlu verifikasi)", jenis: "asesmen" },
    { tanggal: "2026-12-21", keterangan: "Contoh: libur akhir semester 1 (usulan - perlu verifikasi)", jenis: "libur" },
    { tanggal: "2027-03-08", keterangan: "Contoh: pekan asesmen tengah semester 2 (usulan - perlu verifikasi)", jenis: "asesmen" },
    { tanggal: "2027-06-14", keterangan: "Contoh: pekan asesmen akhir tahun (usulan - perlu verifikasi)", jenis: "asesmen" }
  ]);

  // --- kurikulum 36 minggu (dari file data hasil penyusunan bertahap) ---
  const insWeek = db.prepare(`INSERT OR REPLACE INTO weeks (nomor, semester, tema, sumber, payload)
    VALUES (?,?,?,?,?)`);
  let total = 0;
  // modul per pertemuan (tujuan, pemantik, materi, contoh visual, aktivitas, LKPD, rubrik, kuis, tugas, tindak lanjut)
  const modul = {};
  for (const f of ["modul-sem1.json", "modul-sem2.json"]) {
    const fp = path.join(DATA_DIR, f);
    if (!fs.existsSync(fp)) continue;
    for (const w of JSON.parse(fs.readFileSync(fp, "utf8")).minggu) modul[w.minggu] = w;
  }
  for (const f of ["kurikulum-sem1.json", "kurikulum-sem2.json"]) {
    const doc = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf8"));
    for (const w of doc.minggu) {
      const mm = modul[w.minggu];
      if (mm) {
        for (const [hari, kunci] of [["senin", "pertemuanSenin"], ["rabu", "pertemuanRabu"]]) {
          if (mm[hari] && w[kunci]) w[kunci].modul = mm[hari];
        }
      }
      insWeek.run(w.minggu, w.semester, w.tema, JSON.stringify(w.sumber || []), JSON.stringify(w));
      total++;
    }
  }

  // --- contoh tugas terbuka (LKPD minggu 1-4) + kuis diagnostik ---
  const insA = db.prepare(`INSERT INTO assignments (week_nomor, meeting_key, tipe, judul, deskripsi, bobot, status, soal, due_at, created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const guruId = db.prepare("SELECT id FROM users WHERE username='dewi'").get().id;
  insA.run(1, "senin", "lkpd", "LKPD 01 — Peta Diri & Kontrak Belajar DKV",
    "Isi lembar profil belajar, target semester 1, dan kesepakatan kontrak belajar.", 10, "open", null, null, guruId);
  insA.run(2, "rabu", "lkpd", "LKPD 02 — Peta Ide Technopreneur DKV",
    "Tuliskan bidang layanan, calon pengguna, masalah, dan teknologi pendukung ide usaha DKV-mu.", 15, "open", null, null, guruId);
  insA.run(3, "senin", "lkpd", "LKPD 03 — Analisis Profesi & Peluang Usaha DKV",
    "Uraikan 2 profesi DKV dan 3 peluang jasa di sekitarmu beserta perencanaan sederhananya.", 15, "open", null, null, guruId);
  const kuisSoal = JSON.stringify([
    { q: "Gabungan kata 'techno' dan 'entrepreneur' disebut ...", opsi: ["Technopreneur", "Technologist", "Intrapreneur", "Entertainer"], kunci: 0, skor: 1 },
    { q: "Ilustrator, komikus, dan animator termasuk ... DKV.", opsi: ["profesi", "pelanggan", "media", "alat"], kunci: 0, skor: 1 },
    { q: "Ide kreatif menurut Zimmerer (Suryana, 2003) sering muncul ketika wirausaha ...", opsi: ["bekerja aktif dan mengamati", "menunggu tanpa usaha", "meniru hasil orang lain", "menghindari risiko"], kunci: 0, skor: 1 },
    { q: "DKV merupakan salah satu subsektor ekonomi kreatif yang ...", opsi: ["tumbuh pesat", "stagnan", "menurun", "tidak terkait industri"], kunci: 0, skor: 1 },
    { q: "Contoh technopreneur DKV adalah ...", opsi: ["jasa desain daring", "penjual gorengan", "petugas parkir", "pengemudi bus"], kunci: 0, skor: 1 },
  ]);
  insA.run(4, "senin", "kuis", "Kuis Diagnostik BAB 1 — Technopreneur & Profesi DKV",
    "Kuis pilihan ganda; dinilai otomatis oleh sistem.", 5, "open", kuisSoal, null, guruId);

  db.prepare("INSERT INTO announcements (class_id, judul, isi, created_by) VALUES (?,?,?,?)")
    .run(kelas1, "Praktik minggu ini membawa alat gambar", "Bawa pensil 2B/4B dan kertas A4 untuk latihan minggu 5.", guruId);

  return { seeded: true, weeks: total };
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  const reset = process.argv.includes("--reset");
  const r = seed({ reset });
  console.log("Seed:", r);
  console.log("Akun demo — admin/admin123, dewi/guru123 (guru), saidun/guru123 (supervisor), siswa1: aditya/siswa123 (dst). Ganti setelah demo!");
}
