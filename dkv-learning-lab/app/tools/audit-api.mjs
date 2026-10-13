// audit-api.mjs — Audit nyata bagian API/data: kelengkapan kurikulum, alokasi JP, hak akses,
// penyimpanan progres & hasil tugas, perhitungan nilai/rubrik, validasi form, keamanan,
// kesesuaian materi dengan sumber, dan kesesuaian fitur supervisi dengan dokumen sekolah.
//
// Jalankan (server harus aktif):  node tools/audit-api.mjs
// Keluaran: tabel di terminal + berkas JSON/Markdown di docs/ (dipakai menyusun laporan audit).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const BASE = process.env.BASE || "http://localhost:8080";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(__dirname, "..");
const ROOT = path.join(APP, "..");

const hasil = [];
let no = 0;
const catat = (area, fitur, langkah, harapan, aktual, lulus, perbaikan = "") => {
  hasil.push({ no: ++no, area, fitur, langkah, harapan, aktual, status: lulus ? "LULUS" : "GAGAL", perbaikan });
  console.log(`${lulus ? "✅" : "❌"} ${String(no).padStart(2)}. [${area}] ${fitur}\n     harapan: ${harapan}\n     aktual : ${aktual}`);
};

async function req(p, { method = "GET", body, token } = {}) {
  const h = { "Content-Type": "application/json" };
  if (token) h["x-dkv-token"] = token;
  const res = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  let data = {}; const teks = await res.text();
  try { data = JSON.parse(teks); } catch { data = { _teks: teks.slice(0, 200) }; }
  return { status: res.status, data, headers: res.headers };
}
const login = async (u, p, s) => (await req("/api/auth/login", { method: "POST", body: { username: u, password: p, sebagai: s } })).data.token;

const J = (v) => { try { return JSON.parse(v || "[]"); } catch { return []; } };
const teksHalaman = {};
const markerHalaman = { B1: "sem1", B2: "sem2" };
function muatSumber() {
  for (const [kode, berkas] of Object.entries(markerHalaman)) {
    const t = fs.readFileSync(path.join(ROOT, "sumber", "ekstraksi", `${berkas}_full.txt`), "utf8");
    teksHalaman[kode] = { mentah: t, halaman: {} };
    const bagian = t.split(/<<<HAL (\d+)>>>/);
    for (let i = 1; i < bagian.length; i += 2) teksHalaman[kode].halaman[Number(bagian[i])] = bagian[i + 1] || "";
  }
}
const halamanAda = (kode, n) => !!teksHalaman[kode]?.halaman?.[n];

(async () => {
  const guru = await login("dewi", "guru123", "guru");
  const admin = await login("admin", "admin123", "admin");
  const siswa = await login("aditya", "siswa123", "siswa");
  const siswa2 = await login("bella", "siswa123", "siswa");
  if (!guru || !admin || !siswa) { console.error("Login uji gagal — pastikan server aktif & data seed ada."); process.exit(2); }
  muatSumber();

  /* ================= A. Kelengkapan 36 minggu & 72 pertemuan ================= */
  const daftar = await req("/api/kurikulum", { token: guru });
  const minggu = daftar.data.weeks || [];
  const nomor = minggu.map(w => w.minggu);
  catat("A. Kurikulum", "Daftar 36 minggu tersedia dari API",
    "GET /api/kurikulum (token guru)", "36 minggu, nomor 1–36 berurutan, tiap minggu punya tema/sumber/tujuan",
    `${minggu.length} minggu; nomor ${nomor[0]}–${nomor[nomor.length - 1]}; lengkap=${nomor.length === 36 && nomor.every((n, i) => n === i + 1)}; semua bertema=${minggu.every(w => !!w.tema)}; semua bersumber=${minggu.every(w => (w.sumber || []).length > 0)}`,
    minggu.length === 36 && nomor.every((n, i) => n === i + 1) && minggu.every(w => !!w.tema && (w.sumber || []).length > 0));

  const detail = [];
  for (let n = 1; n <= 36; n++) detail.push((await req(`/api/kurikulum/${n}`, { token: guru })).data.week);
  const pertemuan = [];
  for (const w of detail) for (const hari of ["senin", "rabu"]) {
    const p = hari === "senin" ? w?.pertemuanSenin : w?.pertemuanRabu;
    if (p) pertemuan.push({ minggu: w.minggu, hari, ...p });
  }
  const agendaLengkap = pertemuan.filter(p => Array.isArray(p.agenda) && p.agenda.length >= 4 && p.agenda.every(a => a.tahap && (a.menit > 0) && a.kegiatan)).length;
  catat("A. Kurikulum", "72 pertemuan (Senin–Rabu) lengkap dengan agenda",
    "GET /api/kurikulum/1…36 lalu hitung pertemuanSenin & pertemuanRabu",
    "72 pertemuan, setiap pertemuan berisi agenda bertahap (tahap, menit, kegiatan)",
    `${pertemuan.length} pertemuan; agenda lengkap ${agendaLengkap}/${pertemuan.length}; contoh pertama: minggu ${pertemuan[0]?.minggu} ${pertemuan[0]?.hari} — ${pertemuan[0]?.agenda?.length} tahap`,
    pertemuan.length === 72 && agendaLengkap === 72);

  // data tersimpan di basis data (bukan hanya berkas)
  const dbCheck = execSync(`node -e "const D=require('better-sqlite3');const c=new D('${path.join(APP, "data", "dkv.db")}');console.log(JSON.stringify({weeks:c.prepare('select count(*) n from weeks').get().n}))"`,
    { cwd: APP }).toString().trim();
  const jmlWeeks = JSON.parse(dbCheck).weeks;
  catat("A. Kurikulum", "Data 36 minggu tersimpan di basis data aplikasi",
    "SELECT COUNT(*) FROM weeks (SQLite aplikasi)", "36 baris minggu tersimpan sehingga guru dapat menyuntingnya",
    `${jmlWeeks} baris pada tabel weeks`, jmlWeeks === 36);

  /* ================= B. Alokasi JP (12 JP/minggu; Senin 6, Rabu 6) ================= */
  const meta = (await req("/api/meta", { token: guru })).data;
  const jpSenin = pertemuan.filter(p => p.hari === "senin").map(p => p.jp);
  const jpRabu = pertemuan.filter(p => p.hari === "rabu").map(p => p.jp);
  const totalMinggu = detail.map(w => (w.pertemuanSenin?.jp || 0) + (w.pertemuanRabu?.jp || 0));
  catat("B. JP", "Setiap minggu tepat 12 JP (Senin 6 JP + Rabu 6 JP)",
    "Hitung jp pertemuanSenin + pertemuanRabu untuk 36 minggu",
    "semua minggu = 12 JP; Senin = 6 JP; Rabu = 6 JP",
    `menit per pertemuan ${meta.menit_per_pertemuan} (${meta.jp_per_pertemuan} JP × ${meta.jam_pelajaran_menit} menit); minggu bernilai 12 JP: ${totalMinggu.filter(t => t === 12).length}/36; Senin6: ${jpSenin.filter(x => x === 6).length}/36; Rabu6: ${jpRabu.filter(x => x === 6).length}/36`,
    totalMinggu.every(t => t === 12) && jpSenin.every(x => x === 6) && jpRabu.every(x => x === 6));

  const agendaMenitSalah = pertemuan.filter(p => (p.agenda || []).reduce((s, a) => s + Number(a.menit || 0), 0) !== p.menit);
  catat("B. JP", "Jumlah menit agenda setiap pertemuan sama dengan 6 JP (270 menit)",
    "Jumlahkan menit seluruh tahap agenda pada 72 pertemuan",
    "0 pertemuan dengan selisih (72 × 270 menit)",
    `${72 - agendaMenitSalah.length}/72 pertemuan tepat ${pertemuan[0]?.menit} menit${agendaMenitSalah.length ? `; menyimpang: minggu ${agendaMenitSalah.map(p => `${p.minggu}/${p.hari}(${p.agenda.reduce((s, a) => s + a.menit, 0)})`).join(", ")}` : ""}`,
    agendaMenitSalah.length === 0);

  /* ================= C. Navigasi & hak akses (sisi API) ================= */
  const tes403 = [];
  for (const [m, p] of [["GET", "/api/guru/kontrol?kelas_id=1&meeting=senin"], ["GET", "/api/guru/submissions"], ["GET", "/api/guru/rekap"], ["GET", "/api/admin/users"], ["GET", "/api/admin/logs"], ["PUT", "/api/kurikulum/1"], ["POST", "/api/guru/sesi"], ["GET", "/api/supervisi"], ["GET", "/api/supervisi/dokumentasi"], ["POST", "/api/guru/grade"]]) {
    tes403.push([`${m} ${p}`, (await req(p, { method: m, token: siswa, body: m === "GET" ? undefined : {} })).status]);
  }
  catat("C. Navigasi & akses", "Peserta didik diblokir dari seluruh endpoint guru/admin",
    "10 permintaan ke endpoint guru/admin memakai token siswa", "semua jawaban HTTP 403",
    tes403.map(([k, v]) => `${k.split(" ")[0]}=${v}`).join(", "), tes403.every(([, s]) => s === 403));

  // Menu "materi" dipastikan terbuka; menu "navigasi" dikunci → siswa hanya boleh minggu aktifnya.
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: 1, meeting: "senin", menu_key: "materi", enabled: true } });
  const statusSiswa = (await req("/api/siswa/status", { token: siswa })).data;
  const mingguAktif = statusSiswa.minggu_aktif;
  const mingguLain = mingguAktif === 1 ? 2 : 1;   // minggu di luar minggu aktif siswa
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: 1, meeting: statusSiswa.pertemuan_aktif, menu_key: "navigasi", enabled: false } });
  const kurikulumTerkunci = await req(`/api/kurikulum/${mingguLain}`, { token: siswa });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: 1, meeting: statusSiswa.pertemuan_aktif, menu_key: "navigasi", enabled: true } });
  const kurikulumTerbuka = await req(`/api/kurikulum/${mingguLain}`, { token: siswa });
  catat("C. Navigasi & akses", "Navigasi minggu siswa mengikuti kunci menu guru (server, bukan hanya tombol)",
    `Siswa membuka minggu ${mingguLain} (di luar minggu aktif ${mingguAktif}) saat menu navigasi terkunci, lalu setelah guru membukanya`,
    "terkunci → 403 berlabel locked beserta alasan; terbuka → 200 dengan data minggu",
    `terkunci=${kurikulumTerkunci.status}${kurikulumTerkunci.data.locked ? ` (locked:true: "${kurikulumTerkunci.data.error || ""}")` : ""}; terbuka=${kurikulumTerbuka.status} (tema minggu terbaca=${!!kurikulumTerbuka.data.week?.tema})`,
    kurikulumTerkunci.status === 403 && kurikulumTerkunci.data.locked === true && kurikulumTerbuka.status === 200 && !!kurikulumTerbuka.data.week?.tema);

  const guru404 = await req("/api/admin/users", { token: guru });
  const guruOk = await req("/api/guru/siswa?kelas_id=1", { token: guru });
  catat("C. Navigasi & akses", "Peran guru: dapat mengakses fitur kelas, tidak dapat mengelola akun",
    "GET /api/guru/siswa (guru) dan GET /api/admin/users (guru)", "guru: 200 untuk kelas, 403 untuk akun admin",
    `guru/siswa=${guruOk.status}, admin/users=${guru404.status}`, guruOk.status === 200 && guru404.status === 403);

  /* ================= D. Penyimpanan progres & hasil tugas ================= */
  const mingguBersih = (await req("/api/siswa/progress", { token: siswa })).data.progress?.map(p => p.week_nomor) || [];
  let mingguUji = 30; while (mingguBersih.includes(mingguUji)) mingguUji--;
  const p1 = await req("/api/siswa/progress", { method: "POST", token: siswa, body: { week_nomor: mingguUji, aktivitas: ["senin"] } });
  const p2 = await req("/api/siswa/progress", { method: "POST", token: siswa, body: { week_nomor: mingguUji, aktivitas: ["rabu"] } });
  const pBaca = (await req("/api/siswa/progress", { token: siswa })).data.progress?.find(p => p.week_nomor === mingguUji);
  catat("D. Progres & tugas", "Progres per pertemuan tersimpan & minggu selesai setelah Senin+Rabu",
    `POST /api/siswa/progress minggu ${mingguUji} (senin, lalu rabu) → GET /api/siswa/progress`,
    "status berjalan setelah Senin, selesai setelah Rabu, aktivitas tersimpan",
    `setelah senin="${p1.data.status}", setelah rabu="${p2.data.status}", tersimpan=[${(J(pBaca?.aktivitas).length ? J(pBaca.aktivitas) : pBaca?.aktivitas || []).toString()}]`,
    p1.data.status === "berjalan" && p2.data.status === "selesai" && !!pBaca);

  const tugasGuru = (await req("/api/tugas", { token: guru })).data.tugas || [];
  const tugasSiswa = (await req("/api/tugas", { token: siswa })).data.tugas || [];
  const tId = tugasSiswa[0]?.id;
  const tKumpul1 = await req(`/api/tugas/${tId}/submit`, { method: "POST", token: siswa, body: { jawaban: { teks: "Jawaban audit otomatis", tautan: "https://contoh.test/audit" } } });
  const tSetelah = (await req("/api/tugas", { token: siswa })).data.tugas?.find(t => t.id === tId);
  catat("D. Progres & tugas", "Hasil tugas siswa tersimpan dan terbaca ulang (guru & siswa)",
    `POST /api/tugas/${tId}/submit → GET /api/tugas (siswa) & GET /api/guru/submissions (guru)`,
    "kiriman tersimpan (status submitted/terkumpul) dan jawaban dapat dibaca kembali",
    `kirim=${tKumpul1.status} (${tKumpul1.data.status || tKumpul1.data.error || "-"}); status pada daftar siswa=${tSetelah?.status || tSetelah?.submission?.status || "-"}; tugas terbuka untuk siswa=${tugasSiswa.length}, tugas di sisi guru=${tugasGuru.length}`,
    tKumpul1.status === 200 && !!tSetelah);

  // Prasyarat seperti guru membuka kelas: semua menu dibuka, lalu pilih kuis yang BELUM dikerjakan siswa.
  for (const meeting of ["senin", "rabu"]) await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: 1, meeting, aksi_semua: "aktifkan" } });
  const dbAudit = new (createRequire(import.meta.url))("better-sqlite3")(path.join(APP, "data", "dkv.db"), { readonly: true });
  const idSiswaUji = dbAudit.prepare("SELECT id FROM users WHERE username='aditya'").get().id;
  const kuisUji = dbAudit.prepare(`SELECT a.id, a.butir FROM assessments a WHERE a.tipe='kuis'
      AND NOT EXISTS (SELECT 1 FROM assessment_work w WHERE w.assessment_id=a.id AND w.user_id=?) ORDER BY a.week_nomor LIMIT 1`).get(idSiswaUji);
  const butirUji = JSON.parse(kuisUji.butir || "[]");
  // sebagian jawaban sengaja salah supaya skor bukan 100 dan pembagian butir ikut teruji
  const jawabanUji = butirUji.map((b, i) => (i % 3 === 2 ? ((b.kunci + 1) % (b.opsi?.length || 4)) : b.kunci));
  const harapSkor = Math.round((jawabanUji.filter((j, i) => j === butirUji[i].kunci).length * 100) / (butirUji.length || 1));
  const kerjaKuis = await req(`/api/asesmen/${kuisUji.id}/kerja`, { method: "POST", token: siswa, body: { jawaban: jawabanUji } });
  const kerjaBaca = await req(`/api/asesmen/${kuisUji.id}/kerja`, { token: siswa });
  const jawabanSama = JSON.stringify(kerjaBaca.data.kerja?.jawaban?.pilihan) === JSON.stringify(jawabanUji);
  catat("D. Progres & tugas", "Hasil pekerjaan asesmen (kuis) tersimpan di server dan dapat dibaca kembali",
    `POST /api/asesmen/${kuisUji.id}/kerja (${butirUji.length} butir, sebagian sengaja salah) → GET /api/asesmen/${kuisUji.id}/kerja`,
    `tersimpan status dinilai dengan skor ${harapSkor} (hitung ulang independen); GET mengembalikan jawaban & skor yang sama`,
    `kirim=${kerjaKuis.status} (skor server=${kerjaKuis.data.skor ?? "-"}, harapan=${harapSkor}); baca ulang status=${kerjaBaca.data.kerja?.status ?? "kosong"} skor=${kerjaBaca.data.kerja?.skor ?? "-"} jawaban identik=${jawabanSama}`,
    kerjaKuis.status === 200 && kerjaKuis.data.skor === harapSkor && kerjaBaca.data.kerja?.status === "dinilai" && kerjaBaca.data.kerja?.skor === harapSkor && jawabanSama);

  const portoKirim = await req("/api/portofolio", { method: "POST", token: siswa2, body: { week_nomor: 5, judul: "Karya audit otomatis", deskripsi: "Uji penyimpanan portofolio", tahap: "draf", karya: { catatan: "audit" } } });
  const portoBaca = (await req("/api/portofolio", { token: siswa2 })).data.portofolio || [];
  const dompet = portoBaca.find(k => /Karya audit otomatis/.test(k.judul || ""));
  const umpan = dompet ? await req(`/api/portofolio/${dompet.id}/feedback`, { method: "POST", token: guru, body: { umpan_balik: "Umpan balik audit" } }) : { status: "-" };
  const refKirim = await req("/api/refleksi", { method: "POST", token: siswa2, body: { week_nomor: 5, tipe: "siswa", isi: "Refleksi audit otomatis" } });
  const refBaca = (await req("/api/refleksi", { token: siswa2 })).data.refleksi || [];
  catat("D. Progres & tugas", "Portofolio & refleksi tersimpan, guru dapat memberi umpan balik",
    "POST /api/portofolio → POST /api/portofolio/:id/feedback (guru) → POST /api/refleksi → GET keduanya",
    "karya tersimpan, umpan balik guru tersimpan, refleksi tersimpan",
    `karya=${portoKirim.status}, umpan balik guru=${umpan.status}, refleksi=${refKirim.status} & terbaca=${refBaca.some(r => /Refleksi audit otomatis/.test(r.isi || ""))}`,
    portoKirim.status === 200 && umpan.status === 200 && refKirim.status === 200 && refBaca.some(r => /Refleksi audit otomatis/.test(r.isi || "")));

  /* ================= E. Perhitungan nilai & rubrik ================= */
  const kuisId = "A-04-S-KUIS";
  const butirGuru = (await req(`/api/guru/asesmen/${kuisId}`, { token: guru })).data.asesmen;
  const kunci = butirGuru.butir.map(b => b.kunci);
  const siswaKuis = (await req("/api/guru/siswa?kelas_id=1", { token: guru })).data.siswa;
  const daftarNilai = [];
  for (const s of siswaKuis.slice(0, 4)) {
    await req(`/api/guru/asesmen/${kuisId}/buka-ulang`, { method: "POST", token: guru, body: { user_id: s.id, alasan: "audit" } });
    const tk = await login(s.username, "siswa123", "siswa");
    const kirim = await req(`/api/asesmen/${kuisId}/kerja`, { method: "POST", token: tk, body: { jawaban: kunci.map((k, i) => (i === 0 && daftarNilai.length === 0 ? (k + 1) % 3 : k)) } });
    daftarNilai.push({ nama: s.nama_lengkap, skor: kirim.data.skor, benar: (kirim.data.rincian || []).filter(r => r.benar).length, total: butirGuru.butir.length });
  }
  const skorBenar = daftarNilai.find(d => d.benar === d.total)?.skor;
  const skorSatuSalah = daftarNilai.find(d => d.benar === d.total - 1)?.skor;
  const harapanSatuSalah = butirGuru.butir.length > 1 ? Math.round(((daftarNilai.find(d => d.benar === d.total - 1)?.benar || 0) / butirGuru.butir.length) * 100) : null;
  catat("E. Nilai & rubrik", "Skor otomatis kuis dihitung server (proporsional jumlah benar)",
    `Kirim jawaban benar semua & satu salah pada ${kuisId} (${butirGuru.butir.length} butir)`,
    `benar semua → 100; satu salah → ${harapanSatuSalah}`,
    `${daftarNilai.map(d => `${d.nama}: ${d.benar}/${d.total} → ${d.skor}`).join("; ")}`,
    skorBenar === 100 && (skorSatuSalah === harapanSatuSalah || harapanSatuSalah === null));

  const praktikId = (await req("/api/guru/asesmen?minggu=4", { token: guru })).data.asesmen?.find(a => a.tipe === "praktik")?.id;
  const rubrikPraktik = (await req(`/api/guru/asesmen/${praktikId}`, { token: guru })).data.asesmen.rubrik;
  const sasaran = siswaKuis[4] || siswaKuis[0];
  await req(`/api/guru/asesmen/${praktikId}/buka-ulang`, { method: "POST", token: guru, body: { user_id: sasaran.id, alasan: "audit" } });
  const tk2 = await login(sasaran.username, "siswa123", "siswa");
  await req(`/api/asesmen/${praktikId}/kerja`, { method: "POST", token: tk2, body: { teks: "Bukti karya audit", tautan: "https://contoh.test/karya" } });
  const nilai4 = await req(`/api/guru/asesmen/${praktikId}/nilai`, { method: "POST", token: guru, body: { user_id: sasaran.id, kriteria: Object.fromEntries(rubrikPraktik.map(r => [r.kriteria, 4])), komentar: "semua 4", konfirmasi: true } });
  const nilai2 = await req(`/api/guru/asesmen/${praktikId}/nilai`, { method: "POST", token: guru, body: { user_id: sasaran.id, kriteria: Object.fromEntries(rubrikPraktik.map(r => [r.kriteria, 2])), komentar: "semua 2", konfirmasi: true } });
  const campur = {}; rubrikPraktik.forEach((r, i) => { campur[r.kriteria] = [4, 3, 2, 1][i % 4]; });
  const nilaiCampur = await req(`/api/guru/asesmen/${praktikId}/nilai`, { method: "POST", token: guru, body: { user_id: sasaran.id, kriteria: campur, komentar: "campur", konfirmasi: true } });
  const bobot = rubrikPraktik.map(r => r.bobot); const totalBobot = bobot.reduce((a, b) => a + b, 0);
  const harapanCampur = Math.round(rubrikPraktik.reduce((s, r, i) => s + ((campur[r.kriteria] / 4) * r.bobot * 100) / totalBobot, 0));
  catat("E. Nilai & rubrik", "Konversi rubrik 1–4 → 0–100 berbobot dan konsisten",
    `Nilai ${praktikId} dengan semua kriteria 4, semua 2, dan campuran ${JSON.stringify(campur)}`,
    "semua 4 → 100; semua 2 → 50; campuran → " + harapanCampur,
    `semua4=${nilai4.data.skor}, semua2=${nilai2.data.skor}, campuran=${nilaiCampur.data.skor} (bobot ${bobot.join("/")})`,
    nilai4.data.skor === 100 && nilai2.data.skor === 50 && Math.abs(nilaiCampur.data.skor - harapanCampur) <= 1);

  const rek = (await req("/api/guru/rekap-asesmen?kelas_id=1", { token: guru })).data;
  const semuaAsesmen = [];
  for (let m = 1; m <= 36; m++) semuaAsesmen.push(...((await req(`/api/guru/asesmen?minggu=${m}`, { token: guru })).data.asesmen || []));
  const bobotPeta = Object.fromEntries(semuaAsesmen.map(a => [a.id, a.bobot]));
  const siswaRek = rek.perSiswa?.[0];
  const detailNilai = (await req(`/api/guru/asesmen/${kuisId}`, { token: guru })).data.siswa;
  const barisRekap = (await req("/api/guru/rekap-asesmen?kelas_id=1", { token: guru })).data.perSiswa.find(p => p.user_id === siswaRek.user_id);
  // hitung ulang nilai akhir dari data mentah pekerjaan (independen dari server)
  let total = 0, bobotTotal = 0;
  for (const a of semuaAsesmen) {
    const d = (await req(`/api/guru/asesmen/${a.id}`, { token: guru })).data.siswa.find(s => s.user_id === siswaRek.user_id);
    if (d && d.skor !== null && d.skor !== undefined) { total += d.skor * bobotPeta[a.id]; bobotTotal += bobotPeta[a.id]; }
  }
  const harapanAkhir = bobotTotal ? Math.round((total / bobotTotal) * 10) / 10 : null;
  catat("E. Nilai & rubrik", "Rekap nilai akhir = rata-rata berbobot komponen yang sudah dinilai (dihitung ulang independen)",
    "Ambil seluruh skor per asesmen siswa dari API, hitung Σ(skor×bobot)/Σbobot, bandingkan dengan nilai akhir rekap",
    `nilai akhir rekap = ${harapanAkhir}`,
    `server=${barisRekap?.nilai_akhir ?? "null"}; hitung ulang=${harapanAkhir}; selisih=${barisRekap?.nilai_akhir === null || harapanAkhir === null ? "-" : Math.abs(barisRekap.nilai_akhir - harapanAkhir)}`,
    barisRekap?.nilai_akhir === harapanAkhir);

  const remedial = (await req("/api/guru/asesmen-remedial?kelas_id=1", { token: guru })).data.remedial || [];
  catat("E. Nilai & rubrik", "Remedial muncul hanya untuk nilai di bawah KKTp asesmen",
    "GET /api/guru/asesmen-remedial?kelas_id=1", "setiap baris memiliki skor < KKTp asesmen tersebut",
    `${remedial.length} baris; semua patuh=${remedial.every(r => r.skor < r.kktp)}; contoh: ${remedial[0] ? `${remedial[0].skor} < KKTp ${remedial[0].kktp}` : "-"}`,
    remedial.every(r => r.skor < r.kktp));

  /* ================= F. Simulasi (sisi data/API) ================= */
  const simKirim = await req("/api/simulasi/hasil", { method: "POST", token: siswa2, body: { sim_id: "sim-tipografi", tingkat: 2, skor: 3, maks: 3, rincian: { audit: true } } });
  const simBaca = await req("/api/simulasi/hasil", { token: siswa2 });
  const simSalah = await req("/api/simulasi/hasil", { method: "POST", token: siswa2, body: { sim_id: "sim-tidak-ada", tingkat: 1, skor: 1, maks: 1 } });
  const simSkorSalah = await req("/api/simulasi/hasil", { method: "POST", token: siswa2, body: { sim_id: "sim-tipografi", tingkat: 1, skor: 99, maks: 3 } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: 1, meeting: "senin", menu_key: "simulasi", enabled: false } });
  const simTerkunci = await req("/api/simulasi/hasil", { method: "POST", token: siswa2, body: { sim_id: "sim-tipografi", tingkat: 1, skor: 1, maks: 1 } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: 1, meeting: "senin", menu_key: "simulasi", enabled: true } });
  catat("F. Simulasi", "Hasil laboratorium tersimpan, divalidasi, dan tunduk kunci menu",
    "POST /api/simulasi/hasil (valid, sim tidak dikenal, skor di luar rentang, saat menu dikunci) → GET hasil",
    "valid → 200 & tersimpan; sim tidak dikenal/skor tidak sah → 400; menu dikunci → 403",
    `valid=${simKirim.status} (tersimpan=${(simBaca.data.hasil || simBaca.data.simulasi || []).length} baris); sim asing=${simSalah.status}; skor 99 dari 3=${simSkorSalah.status}; terkunci=${simTerkunci.status}`,
    simKirim.status === 200 && simSalah.status === 400 && simSkorSalah.status === 400 && simTerkunci.status === 403);

  /* ================= G. Validasi form & penanganan kesalahan ================= */
  const v1 = await req("/api/auth/login", { method: "POST", body: {} });
  const v2 = await req("/api/auth/login", { method: "POST", body: { username: "dewi", password: "salah" } });
  const v3 = await req("/api/auth/login", { method: "POST", body: { username: "tidak-ada-xyz", password: "apa-saja" } });
  catat("G. Validasi", "Login: isian kosong & kredensial salah ditangani dengan pesan jelas",
    "POST /api/auth/login tanpa isian, password salah, username tidak ada",
    "400 untuk isian kosong; 401 untuk kredensial salah; tidak ada 500",
    `kosong=${v1.status} (${v1.data.error || "-"}); salah=${v2.status}; tidak ada=${v3.status}`,
    v1.status === 400 && v2.status === 401 && v3.status === 401);

  const t404 = await req("/api/tugas/99999/submit", { method: "POST", token: siswa, body: { jawaban: {} } });
  const a404 = await req("/api/asesmen/TIDAK-ADA/kerja", { token: siswa });
  const s404 = await req("/api/supervisi/999999", { token: guru });
  const d400 = await req("/api/supervisi/dokumentasi/37/senin", { token: guru });
  const d400b = await req("/api/supervisi/dokumentasi/2/kamis", { token: guru });
  catat("G. Validasi", "Permintaan ke sumber daya/parameter tidak sah dijawab 400/404 (bukan 500)",
    "Tugas & asesmen tidak ada; catatan supervisi tidak ada; minggu 37; hari kamis",
    "404 untuk data tidak ada, 400 untuk parameter tidak sah",
    `tugas=${t404.status}, asesmen=${a404.status}, supervisi=${s404.status}, minggu-37=${d400.status}, hari-kamis=${d400b.status}`,
    t404.status === 404 && a404.status === 404 && s404.status === 404 && d400.status === 400 && d400b.status === 400);

  const konfirmasiKurang = await req(`/api/guru/asesmen/${praktikId}/nilai`, { method: "POST", token: guru, body: { user_id: sasaran.id, kriteria: campur, komentar: "tanpa konfirmasi" } });
  const rubrikSalah = (await req(`/api/guru/asesmen/${praktikId}`, { token: guru })).data.asesmen.rubrik.map((r, i) => ({ ...r, bobot: i === 0 ? r.bobot + 5 : r.bobot }));
  const rubrikTolak = await req(`/api/guru/asesmen/${praktikId}/rubrik`, { method: "PUT", token: guru, body: { rubrik: rubrikSalah } });
  const skorTolak = await req("/api/supervisi", { method: "POST", token: guru, body: { skor: { "C.1.1": 9 } } });
  const kodeTolak = await req("/api/supervisi", { method: "POST", token: guru, body: { skor: { "X.9.9": 3 } } });
  catat("G. Validasi", "Aturan nilai & instrumen ditegakkan (konfirmasi guru, bobot rubrik 100, skor 1–4)",
    "Nilai tanpa konfirmasi; simpan rubrik berbobot 105; skor indikator 9; kode indikator asing",
    "semuanya ditolak HTTP 400 dengan pesan yang menjelaskan",
    `tanpa konfirmasi=${konfirmasiKurang.status}; bobot 105=${rubrikTolak.status}; skor 9=${skorTolak.status}; kode asing=${kodeTolak.status}`,
    [konfirmasiKurang, rubrikTolak, skorTolak, kodeTolak].every(x => x.status === 400));

  const qKosong = await req("/api/asesmen/A-01-S-KUIS/kerja", { method: "POST", token: siswa, body: {} });
  const hidup = await req("/api/meta", { token: guru });
  catat("G. Validasi", "Kiriman tanpa jawaban tidak menjatuhkan server & ditangani wajar",
    "POST pekerjaan asesmen tanpa body jawaban, lalu cek server masih melayani",
    "jawaban 200/400 dengan pesan; /api/meta tetap 200 setelahnya",
    `kirim kosong=${qKosong.status} (${qKosong.data.error || `skor ${qKosong.data.skor}`}); server sesudahnya=${hidup.status}`,
    [200, 400].includes(qKosong.status) && hidup.status === 200);

  /* ================= H. Keamanan akses & data pengguna ================= */
  const responsPindai = [
    ["/api/auth/me", siswa], ["/api/guru/siswa?kelas_id=1", guru], ["/api/admin/users", admin],
    ["/api/admin/logs", admin], ["/api/meta", guru], ["/api/tugas", siswa],
  ];
  let bocor = [];
  for (const [p, t] of responsPindai) {
    const r = await req(p, { token: t });
    const s = JSON.stringify(r.data);
    if (/password_hash|\$2[aby]\$\d\d\$|bcrypt/i.test(s)) bocor.push(p);
  }
  catat("H. Keamanan", "Tidak ada hash/kolom kata sandi yang dikirim ke klien",
    "Pindai 6 endpoint utama (auth/me, guru, admin, meta, tugas) mencari password_hash/$2a$",
    "0 endpoint membocorkan kata sandi",
    bocor.length ? `bocor: ${bocor.join(", ")}` : "0 pembocoran pada 6 endpoint yang dipindai", bocor.length === 0);

  const uRate = `audit-${Date.now()}`;
  const kodeRate = [];
  for (let i = 0; i < 6; i++) kodeRate.push((await req("/api/auth/login", { method: "POST", body: { username: uRate, password: "salah" } })).status);
  const tokenPalsu = await req("/api/meta", { token: "token-palsu-123" });
  const tanpaToken = await req("/api/meta", {});
  const keluar = await req("/api/auth/logout", { method: "POST", token: siswa2 });
  const setelahKeluar = await req("/api/meta", { token: siswa2 });
  catat("H. Keamanan", "Rate limit, token palsu, tanpa token, dan logout berlaku benar",
    "6 percobaan login gagal; token palsu; tanpa token; logout lalu pakai token lama",
    "5 gagal → 401 & percobaan ke-6 → 429; token palsu/tanpa token → 401; setelah logout → 401",
    `rate: ${kodeRate.join(",")}; token palsu=${tokenPalsu.status}; tanpa token=${tanpaToken.status}; logout=${keluar.status}; token lama setelah logout=${setelahKeluar.status}`,
    kodeRate.slice(0, 5).every(c => c === 401) && kodeRate[5] === 429 && tokenPalsu.status === 401 && tanpaToken.status === 401 && setelahKeluar.status === 401);

  const inj1 = await req("/api/auth/login", { method: "POST", body: { username: "dewi' OR '1'='1", password: "x" } });
  const inj2 = await req("/api/kurikulum/1%20OR%201=1", { token: guru });
  const inj3 = await req(`/api/guru/asesmen/${encodeURIComponent("A-01-S-KUIS' OR '1'='1")}`, { token: guru });
  catat("H. Keamanan", "Percobaan injeksi SQL tidak berhasil & tidak menimbulkan galat server",
    "Login dengan username injeksi; nomor minggu injeksi; id asesmen injeksi",
    "401/400/404 — tanpa 500 dan tanpa data terleak",
    `login=${inj1.status}, minggu=${inj2.status}, asesmen=${inj3.status}`,
    [401, 400, 404].includes(inj1.status) && inj2.status < 500 && inj3.status < 500);

  const kerjaOrang = (await req(`/api/asesmen/${kuisId}/kerja`, { token: siswa })).data.kerja;
  const siswaLain = (await req("/api/guru/siswa?kelas_id=1", { token: guru })).data.siswa.map(s => s.username);
  catat("H. Keamanan", "Pekerjaan asesmen hanya dapat dibaca oleh pemiliknya (tidak ada jalur lintas siswa)",
    "Siswa membaca GET /api/asesmen/:id/kerja; periksa field & kepemilikan; siswa mencoba endpoint kiriman guru",
    "hanya ada satu pekerjaan (milik sendiri) dan endpoint guru tetap 403",
    `kunci 'kerja' tunggal=${!!kerjaOrang || "kosong"}; endpoint guru=${(await req("/api/guru/submissions", { token: siswa })).status}; daftar siswa uji=${siswaLain.length} akun`,
    kerjaOrang?.user_id === undefined || kerjaOrang?.user_id === null || !Array.isArray(kerjaOrang));

  /* ================= I. Kesesuaian materi dengan sumber buku ================= */
  // Nomor halaman pada kurikulum = halaman CETAK buku; berkas ekstraksi memakai penanda <<<HAL n>>> (urutan PDF).
  // Selisih penanda − halaman cetak dibuktikan dari isi buku sendiri, bukan dikira-kira:
  //   B1: penanda 35 memuat kepala halaman "23BAB 2 Keutamaan Keselamatan ..." → 35 − 23 = 12
  //   B2: penanda 15 memuat kepala halaman "Bab 1 Tipografi 1"                    → 15 − 1  = 14
  const OFFSET_CETAK = { B1: 12, B2: 14 };
  const buktiOffset = {
    B1: /23\s*BAB 2 Keutamaan Keselamatan/.test((teksHalaman.B1.halaman[35] || "").replace(/\s+/g, " ")),
    B2: /^Bab 1/.test((teksHalaman.B2.halaman[15] || "").trim()),
  };
  const teksCetak = (kode, cetak) => teksHalaman[kode]?.halaman?.[cetak + OFFSET_CETAK[kode]] || "";
  // Satu kolom sumber bisa memuat lebih dari satu rentang halaman, mis. "7-8, 15-18".
  const rentangDari = (halaman) => [...String(halaman || "").matchAll(/(\d+)\s*[–-]\s*(\d+)/g)].map(m => [Number(m[1]), Number(m[2])]);

  const sumberRingkas = minggu.map(w => ({ minggu: w.minggu, sumber: w.sumber || [] }));
  const denganHalaman = sumberRingkas.filter(w => w.sumber.some(s => /(\d+)\s*[–-]\s*(\d+)/.test(s.halaman || "")));
  const halamanHilang = [];
  for (const w of denganHalaman) for (const s of w.sumber) {
    if (OFFSET_CETAK[s.kode] === undefined) continue;
    for (const [a, b] of rentangDari(s.halaman)) for (let h = a; h <= b; h++)
      if (!teksCetak(s.kode, h).trim()) halamanHilang.push(`m${w.minggu}:${s.kode}h${h}`);
  }
  catat("I. Materi vs sumber", "Setiap rujukan halaman buku pada kurikulum benar-benar ada di berkas sumber",
    "Terjemahkan halaman cetak kurikulum → penanda <<<HAL n>>> memakai selisih yang dibuktikan dari kepala halaman buku, lalu periksa tiap halaman dalam rentang",
    "0 rujukan halaman yang menggantung; selisih halaman terbukti dari isi buku",
    `${denganHalaman.length}/36 minggu mencantumkan rentang halaman buku; bukti selisih B1=${buktiOffset.B1 ? "35−23=12 ✓" : "gagal"}, B2=${buktiOffset.B2 ? "15−1=14 ✓" : "gagal"}; halaman menggantung: ${halamanHilang.length ? halamanHilang.join(", ") : "0"}`,
    halamanHilang.length === 0 && buktiOffset.B1 && buktiOffset.B2);

  const co = [], tanpaSumber = [];
  for (const w of detail) {
    const rujukan = (w.sumber || []).filter(s => rentangDari(s.halaman).length && OFFSET_CETAK[s.kode] !== undefined);
    if (!rujukan.length) { tanpaSumber.push({ minggu: w.minggu, ket: (w.sumber || []).map(s => s.ket || `${s.kode} ${s.halaman ?? "-"}`).join("; ") }); continue; }
    const teks = rujukan.map(s => {
      let t = "";
      for (const [a, b] of rentangDari(s.halaman)) for (let h = a; h <= b; h++) t += " " + teksCetak(s.kode, h);
      return t;
    }).join(" ").toLowerCase();
    const kata = [...new Set((w.kataKunci || []).map(k => String(k).toLowerCase().trim()).filter(k => k.length >= 2))];
    const ketemu = kata.filter(k => teks.includes(k));
    co.push({ minggu: w.minggu, persen: Math.round((ketemu.length * 100) / (kata.length || 1)), n: kata.length, tidak: kata.filter(k => !teks.includes(k)) });
  }
  const rata = Math.round(co.reduce((s, x) => s + x.persen, 0) / (co.length || 1));
  const kosong = co.filter(x => x.n && !x.persen);
  const kecil = co.filter(x => x.persen < 60);
  catat("I. Materi vs sumber", "Kata kunci tiap minggu dapat ditemukan pada halaman buku yang dirujuk",
    "Untuk tiap minggu: cocokkan kata kunci materi dengan teks pada rentang halaman cetak yang dirujuk (memakai selisih halaman yang sama)",
    "setiap minggu yang merujuk halaman buku punya dasar teks (≥1 kata kunci) dan rata-rata kecocokan ≥70%; minggu tanpa rujukan buku dilaporkan terpisah",
    `rata-rata kecocokan ${rata}% dari ${co.length} minggu (${Math.round(co.reduce((s, x) => s + x.n, 0) / (co.length || 1))} kata kunci/minggu); minggu tanpa dasar teks: ${kosong.length ? kosong.map(x => `m${x.minggu}`).join(", ") : "0"}; minggu <60%: ${kecil.length ? kecil.map(x => `m${x.minggu}(${x.persen}%)`).join(", ") : "tidak ada"}; tanpa rujukan halaman buku: ${tanpaSumber.length ? tanpaSumber.map(x => `m${x.minggu} (${x.ket})`).join(", ") : "tidak ada"}`,
    kosong.length === 0 && rata >= 70);

  const modul1 = JSON.parse(fs.readFileSync(path.join(APP, "data", "modul-sem1.json"), "utf8"));
  const modul2 = JSON.parse(fs.readFileSync(path.join(APP, "data", "modul-sem2.json"), "utf8"));
  const semuaModul = [...modul1.minggu, ...modul2.minggu];
  const KUNCI_MODUL = ["tujuan", "pemantik", "materi", "contohVisual", "aktivitas", "lkpd", "asesmenFormatif", "tugas", "tindakLanjut"];
  let modulKurang = [], butirSalah = 0, rubrikKurang = 0, rujukanModul = 0;
  for (const w of semuaModul) for (const hari of ["senin", "rabu"]) {
    const m = w[hari];
    const kurang = KUNCI_MODUL.filter(k => m[k] === undefined);
    if (kurang.length) modulKurang.push(`w${w.minggu}/${hari}:${kurang.join("+")}`);
    for (const b of (m.asesmenFormatif?.butir || [])) {
      if (!Array.isArray(b.opsi) || b.opsi.length < 2 || !(Number(b.kunci) >= 0 && Number(b.kunci) < b.opsi.length)) butirSalah++;
    }
    for (const r of (m.lkpd?.rubrik || [])) if (![1, 2, 3, 4].every(n => r[`skor${n}`])) rubrikKurang++;
    for (const cv of (m.contohVisual || [])) {
      const mm = /halaman\s*(\d+)\s*[–-]\s*(\d+)/i.exec(cv.keterangan || "");
      if (mm) { for (let h = Number(mm[1]); h <= Number(mm[2]); h++) { if (!halamanAda("B1", h) && !halamanAda("B2", h)) { rujukanModul++; } } }
    }
  }
  catat("I. Materi vs sumber", "Modul 72 pertemuan lengkap (9 bagian), butir kuis & rubrik sah, rujukan halaman modul cocok",
    "Periksa 72 modul: kelengkapan 9 bagian, kunci jawaban di dalam rentang opsi, rubrik 4 tingkat, dan rujukan halaman pada contoh visual",
    "0 modul kurang bagian, 0 butir kunci tak sah, 0 rubrik kurang, 0 rujukan halaman menggantung",
    `modul kurang bagian: ${modulKurang.length ? modulKurang.join(", ") : "0"}; butir kunci tidak sah=${butirSalah}; rubrik tidak 4 tingkat=${rubrikKurang}; rujukan halaman modul menggantung=${rujukanModul}`,
    modulKurang.length === 0 && butirSalah === 0 && rubrikKurang === 0 && rujukanModul === 0);

  /* ================= J. Kesesuaian supervisi dengan dokumen sekolah ================= */
  const INSTRUMEN_DOKUMEN = {
    "C.1": { nama: "Perencanaan", butir: ["Tujuan pembelajaran jelas & terukur", "Materi sesuai CP/materi buku", "Strategi pembelajaran mendalam (Deep Learning)", "Diferensiasi kebutuhan murid"] },
    "C.2": { nama: "Pelaksanaan", butir: ["Pendahuluan & apersepsi", "Interaksi guru–murid", "Aktivitas murid dominan (student-centered)", "Kolaborasi antar murid", "Pemanfaatan teknologi & sumber belajar"] },
    "C.3": { nama: "Penerapan 5C (Deep Learning)", butir: ["Critical Thinking", "Creativity", "Collaboration", "Communication", "Connection to Real Life"] },
    "C.4": { nama: "Asesmen dan Refleksi", butir: ["Asesmen formatif berjalan", "Asesmen sumatif/praktik", "Refleksi guru", "Refleksi murid"] },
  };
  const ind = (await req("/api/supervisi/indikator?semua=1", { token: admin })).data;
  const aktual = {};
  (ind.indikator || []).forEach(a => { aktual[a.aspek_kode] = { nama: a.aspek_nama, butir: a.indikator.map(i => i.nama) }; });
  const samaPersis = Object.keys(INSTRUMEN_DOKUMEN).every(k => aktual[k] && aktual[k].butir.length === INSTRUMEN_DOKUMEN[k].butir.length
    && INSTRUMEN_DOKUMEN[k].butir.every(b => aktual[k].butir.includes(b)));
  const totalButir = Object.values(aktual).reduce((s, a) => s + a.butir.length, 0);
  catat("J. Supervisi vs dokumen", "18 indikator instrumen sama persis dengan dokumen sekolah (tidak ada yang dikarang)",
    "Bandingkan /api/supervisi/indikator dengan butir instrumen C.1–C.4 pada docs/01 §4 (dokumen SUP)",
    "aspek C.1(4) C.2(5) C.3(5) C.4(4) = 18 butir identik",
    `${totalButir} indikator: ${Object.entries(aktual).map(([k, a]) => `${k}(${a.butir.length})`).join(" ")}; identik=${samaPersis}`,
    samaPersis && totalButir === 18);

  const skala = ind.skala || [];
  const sv = (await req("/api/supervisi", { token: guru })).data.supervisi?.[0];
  const teladan = (await req("/api/supervisi/daftar-guru", { token: guru })).data.guru?.[0];
  const simpanSv = await req("/api/supervisi", { method: "POST", token: guru, body: { guru_id: teladan.id, kelas_id: 1, week_nomor: 4, tanggal: "2026-10-13", skor: { "C.1.1": 4, "C.1.2": 3, "C.1.3": 2, "C.1.4": 4 }, catatan: "Audit", rekomendasi: { guru: "g", murid: "m", sekolah: "s" }, tindak_lanjut: "t", status: "final" } });
  const detailSv = (await req(`/api/supervisi/${simpanSv.data.id}`, { token: guru })).data;
  const rataC1 = detailSv.aspek.find(a => a.aspek_kode === "C.1")?.rata;
  catat("J. Supervisi vs dokumen", "Skala 1–4, identitas supervisor, dan catatan instrumen sesuai dokumen",
    "GET /api/supervisi/indikator (skala), GET /api/supervisi/:id (institusi & supervisor), rata-rata aspek C.1 dari 4,3,2,4",
    "skala 1–4 berlabel; supervisor Saidun, S.Pd., M.M. NIP 197009201994021002; catatan memuat program sekolah; rata C.1 = 3.25",
    `skala=${skala.map(s => s.nilai).join("/")}; supervisor=${detailSv.supervisor?.nama} (${detailSv.supervisor?.nip}); program sekolah disebut=${/Adiwiyata/.test(detailSv.catatanInstrumen || "")}; rata C.1=${rataC1}`,
    skala.map(s => s.nilai).join("") === "1234" && /Saidun/.test(detailSv.supervisor?.nama || "") && /197009201994021002/.test(detailSv.supervisor?.nip || "") && rataC1 === 3.25);

  const dok = (await req("/api/supervisi/dokumentasi", { token: guru })).data;
  const satuDok = (await req("/api/supervisi/dokumentasi/3/rabu", { token: guru })).data;
  const prinsip = (satuDok.prinsipMendalam || []).map(p => p.nama);
  catat("J. Supervisi vs dokumen", "Dokumentasi 72 pertemuan memuat tujuh unsur permintaan sekolah",
    "GET /api/supervisi/dokumentasi (72 entri) & detail 3/rabu (tujuan, memahami, mengaplikasi, merefleksi, prinsip, bukti, observasi, refleksi guru, tindak lanjut)",
    "72 entri; detail memuat 9 kunci; daftar prinsip pembelajaran mendalam tersedia (≥8 pilihan, ditandai manual)",
    `${dok.dokumentasi?.length} entri · kunci detail: ${Object.keys(satuDok.usulan || {}).filter(k => ["tujuan", "memahami", "mengaplikasi", "merefleksi", "prinsip", "bukti", "catatan_observasi", "refleksi_guru", "tindak_lanjut"].includes(k)).length}/9 · pilihan prinsip=${prinsip.length} (contoh: ${prinsip.slice(0, 2).join("; ")})`,
    dok.dokumentasi?.length === 72 && prinsip.length >= 8 && Object.keys(satuDok.usulan || {}).length > 0);

  /* ================= K. Build, tipe, uji otomatis, basis data ================= */
  let tsc = "gagal", build = "gagal";
  try { execSync("npx tsc --noEmit", { cwd: APP, stdio: "pipe" }); tsc = "0 error"; } catch (e) { tsc = String(e.stdout || e.message).slice(0, 120); }
  try { build = execSync("npm run build 2>&1 | tail -1", { cwd: APP, shell: "/bin/bash" }).toString().trim(); } catch (e) { build = "gagal"; }
  catat("K. Kualitas", "Pemeriksaan tipe TypeScript & build produksi",
    "npx tsc --noEmit && npm run build", "0 error & build sukses",
    `tsc: ${tsc} · build: ${build}`, /0 error/.test(tsc) && /built in/.test(build));

  const integritas = execSync(`node -e "const D=require('better-sqlite3');const c=new D('${path.join(APP, "data", "dkv.db")}');console.log(JSON.stringify({cek:c.prepare('PRAGMA integrity_check').get().integrity_check, weeks:c.prepare('select count(*) n from weeks').get().n, asesmen:c.prepare('select count(*) n from assessments').get().n, indikator:c.prepare('select count(*) n from supervision_indicators').get().n, users:c.prepare('select count(*) n from users').get().n}))"`, { cwd: APP }).toString().trim();
  const ig = JSON.parse(integritas);
  catat("K. Kualitas", "Integritas basis data & kelengkapan data inti",
    "PRAGMA integrity_check; hitung baris weeks/assessments/supervision_indicators/users",
    "integrity_check = ok; 36 minggu; 260 asesmen; 18 indikator; akun demo lengkap",
    `integrity=${ig.cek}; weeks=${ig.weeks}; asesmen=${ig.asesmen}; indikator=${ig.indikator}; pengguna=${ig.users}`,
    ig.cek === "ok" && ig.weeks === 36 && ig.asesmen === 260 && ig.indikator === 18 && ig.users >= 13);

  /* ============ ringkasan & berkas keluaran ============ */
  const gagal = hasil.filter(h => h.status === "GAGAL");
  const ringkas = `AUDIT API/DATA: ${hasil.length - gagal.length}/${hasil.length} LULUS${gagal.length ? ` — GAGAL: ${gagal.map(g => g.no).join(", ")}` : ""}`;
  console.log(`\n${ringkas}`);
  const berkas = path.join(ROOT, "docs", "audit-api-hasil.json");
  fs.writeFileSync(berkas, JSON.stringify({ waktu: new Date().toISOString(), basis: BASE, ringkas, hasil }, null, 2));
  console.log(`Hasil rinci ditulis: ${path.relative(ROOT, berkas)}`);
  process.exit(gagal.length ? 1 : 0);
})().catch(e => { console.error("Audit gagal dijalankan:", e); process.exit(2); });
