// test-api.js — Uji 10 skenario Mode Guru + uji keamanan tambahan (HTTP nyata ke server).
// Jalankan: node server/test-api.js   (server harus aktif, default http://localhost:8080)
const BASE = process.env.BASE || "http://localhost:8080";
const hasil = [];
let no = 0;
function catat(nama, lulus, detail) { hasil.push({ no: ++no, nama, lulus, detail }); console.log(`${lulus ? "✅" : "❌"} ${no}. ${nama} — ${detail}`); }

async function req(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["x-dkv-token"] = token;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = {};
  try { data = await res.json(); } catch { }
  return { status: res.status, data };
}
const login = (username, password, sebagai) => req("/api/auth/login", { method: "POST", body: { username, password, sebagai } });

(async () => {
  let guru, admin, siswa, siswa2;
  // 1. login guru benar
  let r = await login("dewi", "guru123", "guru");
  guru = r.data.token;
  catat("Login guru dengan kredensial benar", r.status === 200 && !!guru, `HTTP ${r.status}, peran=${r.data.user?.role}, token diterbitkan`);

  // 2. login salah gagal
  r = await login("dewi", "salahbanget", "guru");
  catat("Login guru dengan password salah ditolak", r.status === 401, `HTTP ${r.status} — ${r.data.error}`);

  // tambahan: pembatasan percobaan login (5x gagal → terkunci 15 menit)
  // memakai username unik per eksekusi agar uji dapat diulang (kunci tersimpan di DB)
  const userUji = `uji-ratelimit-${Date.now()}`;
  let kode = [];
  for (let i = 0; i < 5; i++) kode.push((await login(userUji, "salah", "guru")).status);
  const terkunci = await login(userUji, "salah", "guru");
  catat("Pembatasan percobaan login (rate limit)", kode.every(c => c === 401) && terkunci.status === 429,
    `5 percobaan salah → HTTP ${kode.join(",")}, percobaan ke-6 → HTTP ${terkunci.status}`);

  // id kelas & siswa dideteksi dari API (bukan konstanta) supaya uji tetap sahih
  const daftarKelas = await req("/api/guru/kelas", { token: guru });
  const KELAS_A = daftarKelas.data.kelas[0].id, KELAS_B = daftarKelas.data.kelas[1].id;
  const sA = (await req(`/api/guru/siswa?kelas_id=${KELAS_A}`, { token: guru })).data.siswa[0];
  const sB = (await req(`/api/guru/siswa?kelas_id=${KELAS_B}`, { token: guru })).data.siswa[0];
  r = await login(sA.username, "siswa123", "siswa"); siswa = r.data.token;
  r = await login(sB.username, "siswa123", "siswa"); siswa2 = r.data.token;
  r = await login("admin", "admin123", "admin"); admin = r.data.token;
  console.log(`   (kelas uji: ${KELAS_A} & ${KELAS_B} · siswa: ${sA.username} & ${sB.username})`);

  // 3. siswa diblokir dari Mode Guru
  const g1 = await req(`/api/guru/kontrol?kelas_id=${KELAS_A}&meeting=senin`, { token: siswa });
  const g2 = await req("/api/guru/kontrol", { method: "POST", token: siswa, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "materi", enabled: false } });
  const g3 = await req("/api/guru/submissions", { token: siswa });
  catat("Siswa tidak bisa mengakses endpoint Mode Guru", g1.status === 403 && g2.status === 403 && g3.status === 403,
    `GET kontrol=${g1.status}, POST kontrol=${g2.status}, submissions=${g3.status}`);

  // 4. menu dinonaktifkan tidak bisa diakses siswa
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "materi", enabled: false } });
  const a1 = await req("/api/kurikulum/2", { token: siswa });
  const a2 = await req("/api/kurikulum/1", { token: siswa });
  catat("Menu Materi yang dikunci guru tidak dapat diakses siswa", a1.status === 403 && a2.status === 403,
    `minggu aktif=${a1.status} (${a1.data.error || "-"}), minggu sebelumnya=${a2.status} (${a2.data.error || "-"})`);


  // 5. bypass URL diblokir (ganti URL / panggil API langsung)
  const b1 = await req("/api/kurikulum/5", { token: siswa });
  const b2 = await req("/api/guru/sesi", { method: "POST", token: siswa, body: { kelas_id: KELAS_A, aksi: "mulai" } });
  const b3 = await req("/api/admin/settings", { method: "PUT", token: siswa, body: { key: "pekan_berjalan", value: 30 } });
  const b4 = await req("/api/kurikulum/3", { method: "PUT", token: siswa, body: { tema: "diubah siswa" } });
  catat("Bypass URL / endpoint terlarang diblokir server", [b1, b2, b3, b4].every(x => x.status === 403),
    `materi lain=${b1.status}, sesi=${b2.status}, settings admin=${b3.status}, edit materi=${b4.status}`);

  // 6. menu diaktifkan kembali → akses pulih
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "materi", enabled: true } });
  const c1 = await req("/api/kurikulum/2", { token: siswa });
  catat("Setelah menu dibuka guru, siswa dapat mengakses kembali", c1.status === 200 && !!c1.data.week,
    `HTTP ${c1.status}, minggu ${c1.data.week?.minggu} — ${c1.data.week?.tema?.slice(0, 40)}…`);

  // 5b. halaman/endpoint pertemuan menghormati kunci menu 'pertemuan'
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "pertemuan", enabled: false } });
  const pt2 = await req("/api/siswa/pertemuan/2/senin", { token: siswa });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "pertemuan", enabled: true } });
  const pt3 = await req("/api/siswa/pertemuan/2/senin", { token: siswa });
  catat("Halaman pertemuan mengikuti kunci menu guru (server) & pulih setelah dibuka",
    pt2.status === 403 && pt3.status === 200 && pt3.data.pertemuan?.jp === 6 && pt3.data.pertemuan?.menit === 270,
    `terkunci=${pt2.status} (${pt2.data.error || "-"}), terbuka=${pt3.status} → ${pt3.data.pertemuan?.jp} JP/${pt3.data.pertemuan?.menit} menit`);

  // 7. perubahan kontrol tersinkron ke perangkat siswa
  const s1 = await req("/api/siswa/status", { token: siswa });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "simulasi", enabled: false } });
  const s2 = await req("/api/siswa/status", { token: siswa });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "simulasi", enabled: true } });
  const s3 = await req("/api/siswa/status", { token: siswa });
  catat("Kontrol guru tersinkron ke status siswa (polling)",
    s1.data.controls?.simulasi === true && s2.data.controls?.simulasi === false && s3.data.controls?.simulasi === true,
    `simulasi: ${s1.data.controls?.simulasi} → ${s2.data.controls?.simulasi} → ${s3.data.controls?.simulasi}`);

  // 7b. pengaturan per kelas+pertemuan (tidak bocor ke kelas lain)
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "portofolio", enabled: false } });
  const lain = await req("/api/siswa/status", { token: siswa2 });   // kelas 2
  const sendiri = await req("/api/siswa/status", { token: siswa });  // kelas 1
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "portofolio", enabled: true } });
  catat("Pengaturan berlaku per kelas (tidak bocor ke kelas lain)",
    sendiri.data.controls?.portofolio === false && lain.data.controls?.portofolio === true,
    `kelas 1 portofolio=${sendiri.data.controls?.portofolio}, kelas 2 portofolio=${lain.data.controls?.portofolio}`);

  // 8. penguncian tidak menghapus jawaban/nilai/karya siswa
  const tugasList = await req("/api/tugas", { token: siswa });
  const t = tugasList.data.tugas?.find(x => x.tipe !== "kuis") || tugasList.data.tugas?.[0];
  const kirim1 = await req(`/api/tugas/${t.id}/submit`, { method: "POST", token: siswa, body: { jawaban: ["Jawaban uji otomatis: prinsip DKV", "Refleksi uji"] } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "lkpd", enabled: false } });
  const kirim2 = await req(`/api/tugas/${t.id}/submit`, { method: "POST", token: siswa, body: { jawaban: ["percobaan saat terkunci"] } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "lkpd", enabled: true } });
  const setelah = await req("/api/tugas", { token: siswa });
  const baris = setelah.data.tugas?.find(x => x.id === t.id);
  catat("Penguncian menu TIDAK menghapus jawaban/nilai siswa",
    kirim1.status === 200 && kirim2.status === 403 && !!baris?.jawaban && baris?.status_kumpul === "submitted",
    `kirim=${kirim1.status}, kirim saat terkunci=${kirim2.status} (${kirim2.data.error?.slice(0, 45)}…), jawaban lama masih ada=${!!baris?.jawaban}`);

  // 8b. portofolio: kunci menu tidak menghapus karya
  const kirimKarya = await req("/api/portofolio", { method: "POST", token: siswa, body: { week_nomor: 2, judul: "Karya uji otomatis", deskripsi: "bukti bahwa kunci menu tidak menghapus karya", tahap: "konsep" } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "portofolio", enabled: false } });
  const portoTerkunci = await req("/api/portofolio", { token: siswa });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "portofolio", enabled: true } });
  const portoSesudah = await req("/api/portofolio", { token: siswa });
  const karyaAda = (portoSesudah.data.portofolio || []).some((p) => p.judul === "Karya uji otomatis");
  catat("Portofolio terkunci tidak terhapus & dapat dibuka kembali", kirimKarya.status === 200 && portoTerkunci.status === 403 && karyaAda,
    `unggah=${kirimKarya.status}, saat terkunci=${portoTerkunci.status} (${portoTerkunci.data.error?.slice(0, 40)}…), karya masih ada=${karyaAda}`);


  // 8c. modul materi per pertemuan tersedia lengkap (9 bagian) bagi siswa
  const st0 = await req("/api/siswa/status", { token: siswa });
  const mingguAktif = st0.data.minggu_aktif, meetingAktif = st0.data.pertemuan_aktif || "senin";
  for (const mk2 of ["pertemuan", "kuis"]) await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: meetingAktif, menu_key: mk2, enabled: true } });
  const mod = await req(`/api/siswa/pertemuan/${mingguAktif}/${meetingAktif}`, { token: siswa });
  const md = mod.data.modul || {};
  const sembilan = ["tujuan", "pemantik", "materi", "contohVisual", "aktivitas", "lkpd", "asesmenFormatif", "tugas", "tindakLanjut"].every(k => k in md);
  catat("Modul 9 bagian tersedia pada pertemuan aktif", mod.status === 200 && sembilan,
    `minggu ${mingguAktif}/${meetingAktif}: ${Object.keys(md).length} bagian · ${md.materi?.poin?.length || 0} poin materi · ${md.contohVisual?.length || 0} contoh visual · ${md.asesmenFormatif?.butir?.length || 0} butir kuis`);

  // 8d. kuis formatif dinilai di server dan riwayatnya tersimpan
  const butirKuis = md.asesmenFormatif?.butir || [];
  const jawabSalah = butirKuis.map((b, i) => i === 0 ? (b.kunci + 1) % b.opsi.length : b.kunci);
  const kuisSalah = await req(`/api/kuis-formatif/${mingguAktif}/${meetingAktif}`, { method: "POST", token: siswa, body: { jawaban: jawabSalah } });
  const kuisBenar = await req(`/api/kuis-formatif/${mingguAktif}/${meetingAktif}`, { method: "POST", token: siswa, body: { jawaban: butirKuis.map(b => b.kunci) } });
  const riwayat = await req(`/api/kuis-formatif/${mingguAktif}/${meetingAktif}`, { token: siswa });
  catat("Kuis formatif dinilai server (bukan di peramban) & riwayat tersimpan",
    kuisBenar.data.skor === butirKuis.length && kuisSalah.data.skor === butirKuis.length - 1 && (riwayat.data.percobaan || []).length >= 2,
    `1 jawaban salah → ${kuisSalah.data.skor}/${kuisSalah.data.total}; semua benar → ${kuisBenar.data.skor}/${kuisBenar.data.total}; riwayat ${(riwayat.data.percobaan || []).length} percobaan`);

  // 8e. siswa tidak berhak menyunting modul (otorisasi dicek server)
  const tolakSiswa = await req(`/api/kurikulum/${mingguAktif}/pertemuan/${meetingAktif}/modul`, { method: "PUT", token: siswa, body: { modul: { tujuan: ["disunting siswa"] } } });
  catat("Siswa ditolak saat menyunting modul materi (HTTP 403)", tolakSiswa.status === 403, `HTTP ${tolakSiswa.status} — ${tolakSiswa.data.error}`);

  // 8f. guru menyunting modul → tersimpan di server & langsung tampil pada sisi siswa
  const capGuru = `Pengayaan uji ${Date.now()}`;
  const simpanModul = await req(`/api/kurikulum/${mingguAktif}/pertemuan/${meetingAktif}/modul`, { method: "PUT", token: guru, body: { modul: { tindakLanjut: { ...(md.tindakLanjut || {}), pengayaan: capGuru } } } });
  const cekSiswa = await req(`/api/siswa/pertemuan/${mingguAktif}/${meetingAktif}`, { token: siswa });
  catat("Guru menyunting materi & perubahan tampil pada sisi siswa",
    simpanModul.status === 200 && cekSiswa.data.modul?.tindakLanjut?.pengayaan === capGuru,
    `PUT=${simpanModul.status}, siswa membaca “${String(cekSiswa.data.modul?.tindakLanjut?.pengayaan).slice(0, 28)}…”`);

  // 8g. progres per pertemuan (Senin/Rabu) menentukan status minggu
  // Pilih pekan yang belum pernah ditandai siswa ini, agar uji tetap sahih walau dijalankan ulang tanpa seed.
  const progresAwal = await req("/api/siswa/progress", { token: siswa });
  const sudahDitandai = new Set((progresAwal.data.progress || []).flatMap(x => {
    try { return JSON.parse(x.aktivitas || "[]").map(h => `${x.week_nomor}:${h}`); } catch { return []; }
  }));
  const calon = [mingguAktif, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].filter(w => !sudahDitandai.has(`${w}:senin`) && !sudahDitandai.has(`${w}:rabu`));
  const mingguUji = calon[0] || mingguAktif;
  const p1 = await req("/api/siswa/progress", { method: "POST", token: siswa, body: { week_nomor: mingguUji, aktivitas: ["senin"] } });
  const p2 = await req("/api/siswa/progress", { method: "POST", token: siswa, body: { week_nomor: mingguUji, aktivitas: ["rabu"] } });
  catat("Progres per pertemuan: minggu selesai setelah Senin & Rabu ditandai",
    p1.data.status === "berjalan" && p2.data.status === "selesai" && p2.data.aktivitas.includes("senin") && p2.data.aktivitas.includes("rabu"),
    `pekan uji ${mingguUji} (pekan bersih=${calon.length > 0}): setelah Senin → ${p1.data.status}; setelah Rabu → ${p2.data.status} (aktivitas: ${(p2.data.aktivitas || []).join(", ")})`);

  // 8h. kunci menu kuis menahan pengiriman jawaban tetapi tidak menghapus nilai lama
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: meetingAktif, menu_key: "kuis", enabled: false } });
  const kuisTerkunci = await req(`/api/kuis-formatif/${mingguAktif}/${meetingAktif}`, { method: "POST", token: siswa, body: { jawaban: butirKuis.map(b => b.kunci) } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: meetingAktif, menu_key: "kuis", enabled: true } });
  const riwayat2 = await req(`/api/kuis-formatif/${mingguAktif}/${meetingAktif}`, { token: siswa });
  catat("Kunci menu kuis menahan jawaban baru, riwayat nilai lama tetap ada",
    kuisTerkunci.status === 403 && kuisTerkunci.data.locked === true && (riwayat2.data.percobaan || []).length >= 2,
    `saat terkunci → HTTP ${kuisTerkunci.status} (${kuisTerkunci.data.error}); riwayat tetap ${(riwayat2.data.percobaan || []).length} percobaan`);


  // 8i. hasil laboratorium simulasi dapat dikumpulkan siswa & terbaca guru
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: meetingAktif, menu_key: "simulasi", enabled: true } });
  const simKirim = await req("/api/simulasi/hasil", { method: "POST", token: siswa, body: { sim_id: "sim-tipografi", tingkat: 1, skor: 2, maks: 3, rincian: { sizeIsi: 12 } } });
  const simSiswa = await req("/api/simulasi/hasil", { token: siswa });
  const simGuru = await req("/api/simulasi/hasil", { token: guru });
  catat("Hasil laboratorium simulasi tersimpan (siswa → guru)",
    simKirim.status === 200 && (simSiswa.data.hasil || []).length >= 1 && (simGuru.data.hasil || []).some(x => x.sim_id === "sim-tipografi" && x.nama_lengkap),
    `kirim=${simKirim.status}, milik siswa=${(simSiswa.data.hasil || []).length} percobaan, guru melihat ${(simGuru.data.hasil || []).length} baris (contoh: ${(simGuru.data.hasil || [])[0]?.nama_lengkap || "—"} · ${(simGuru.data.hasil || [])[0]?.sim_id || "—"})`);

  // 8j. validasi & otorisasi pengumpulan hasil laboratorium
  const simIdSalah = await req("/api/simulasi/hasil", { method: "POST", token: siswa, body: { sim_id: "sim-tidak-ada", tingkat: 1, skor: 1, maks: 1 } });
  const simSkorSalah = await req("/api/simulasi/hasil", { method: "POST", token: siswa, body: { sim_id: "sim-k3-ergonomi", tingkat: 9, skor: 5, maks: 2 } });
  const simGuruKirim = await req("/api/simulasi/hasil", { method: "POST", token: guru, body: { sim_id: "sim-k3-ergonomi", tingkat: 1, skor: 1, maks: 1 } });
  catat("Validasi & otorisasi hasil laboratorium (sim tidak dikenal/tingkat tidak sah/guru diblokir)",
    simIdSalah.status === 400 && simSkorSalah.status === 400 && simGuruKirim.status === 403,
    `sim tak dikenal=${simIdSalah.status} (${simIdSalah.data.error}), tingkat/skor tidak sah=${simSkorSalah.status}, guru mengirim=${simGuruKirim.status}`);

  // 8k. kunci menu simulasi menahan pengumpulan hasil, tidak menghapus hasil lama
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: meetingAktif, menu_key: "simulasi", enabled: false } });
  const simTerkunci = await req("/api/simulasi/hasil", { method: "POST", token: siswa, body: { sim_id: "sim-fotografi", tingkat: 1, skor: 1, maks: 1 } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: meetingAktif, menu_key: "simulasi", enabled: true } });
  const simSetelah = await req("/api/simulasi/hasil", { token: siswa });
  catat("Kunci menu Simulasi menahan pengumpulan hasil, hasil lama tetap ada",
    simTerkunci.status === 403 && simTerkunci.data.locked === true && (simSetelah.data.hasil || []).length >= 1,
    `saat terkunci → HTTP ${simTerkunci.status} (${simTerkunci.data.error}); hasil lama tetap ${(simSetelah.data.hasil || []).length} percobaan`);

  // 9. jeda / lanjut pembelajaran berfungsi (status siswa ikut berubah)
  const sesiUrl = "/api/guru/sesi";
  await req(sesiUrl, { method: "POST", token: guru, body: { kelas_id: KELAS_A, week_nomor: 2, meeting_key: "senin", aksi: "konfigurasi" } });
  const mulai = await req(sesiUrl, { method: "POST", token: guru, body: { kelas_id: KELAS_A, week_nomor: 2, meeting_key: "senin", aksi: "mulai" } });
  const st1 = await req("/api/siswa/status", { token: siswa });
  await req(sesiUrl, { method: "POST", token: guru, body: { kelas_id: KELAS_A, aksi: "jeda" } });
  const st2 = await req("/api/siswa/status", { token: siswa });
  await req(sesiUrl, { method: "POST", token: guru, body: { kelas_id: KELAS_A, aksi: "lanjut" } });
  const st3 = await req("/api/siswa/status", { token: siswa });
  await req(sesiUrl, { method: "POST", token: guru, body: { kelas_id: KELAS_A, aksi: "akhiri" } });
  const st4 = await req("/api/siswa/status", { token: siswa });
  catat("Mulai / jeda / lanjut / akhiri pembelajaran tersinkron",
    mulai.status === 200 && st1.data.status_pembelajaran === "running" && st2.data.status_pembelajaran === "paused"
    && st3.data.status_pembelajaran === "running" && st4.data.status_pembelajaran === "ended",
    `siswa melihat: ${st1.data.status_pembelajaran} → ${st2.data.status_pembelajaran} → ${st3.data.status_pembelajaran} → ${st4.data.status_pembelajaran} (minggu aktif ${st1.data.minggu_aktif}, pertemuan ${st1.data.pertemuan_aktif})`);

  // ===== 11–17. Mesin asesmen 36 minggu (kuis otomatis + rubrik guru + rekap) =====
  // Asesmen uji dipilih dari data nyata, bukan konstanta, agar uji tetap sahih bila data disunting.
  const mingguAses = (await req("/api/siswa/status", { token: siswa })).data.minggu_aktif || 1;
  const daftarGuru = (await req(`/api/guru/asesmen?minggu=${mingguAses}`, { token: guru })).data.asesmen || [];
  const kuisUji = daftarGuru.find(a => a.tipe === "kuis");
  const lkpdUji = daftarGuru.find(a => a.tipe === "lkpd");
  const praktikUji = daftarGuru.find(a => a.tipe === "praktik");

  // 11. kunci jawaban & pembahasan tidak bocor sebelum pekerjaan dikirim
  await req(`/api/guru/asesmen/${kuisUji.id}/buka-ulang`, { method: "POST", token: guru, body: { user_id: sA.id || sA.user_id, alasan: "persiapan uji" } });
  const praKirim = await req(`/api/asesmen/${kuisUji.id}/kerja`, { token: siswa });
  const teksKirim = JSON.stringify(praKirim.data.butir || []);
  catat("Kunci jawaban & pembahasan tidak dikirim ke siswa sebelum pekerjaan dikumpulkan",
    praKirim.status === 200 && !teksKirim.includes('"kunci"') && !teksKirim.includes('"pembahasan"') && (praKirim.data.butir || []).length > 0,
    `${(praKirim.data.butir || []).length} butir terkirim tanpa kunci/pembahasan (jml butir: ${kuisUji.jumlahButir})`);

  // 12. kuis dinilai otomatis di server + pembahasan terbuka setelah dikirim
  const kunciUji = (await req(`/api/guru/asesmen/${kuisUji.id}`, { token: guru })).data.asesmen.butir.map(b => b.kunci);
  const kirimKuis = await req(`/api/asesmen/${kuisUji.id}/kerja`, { method: "POST", token: siswa, body: { jawaban: kunciUji } });
  const pasca = await req(`/api/asesmen/${kuisUji.id}/kerja`, { token: siswa });
  const adaPembahasan = JSON.stringify(pasca.data.butir || []).includes("pembahasan");
  catat("Kuis dinilai otomatis di server (jawaban benar → 100) & pembahasan terbuka setelah dikirim",
    kirimKuis.status === 200 && kirimKuis.data.skor === 100 && pasca.data.kerja?.status === "dinilai" && adaPembahasan,
    `skor=${kirimKuis.data.skor}, status=${pasca.data.kerja?.status}, pembahasan tampil=${adaPembahasan}`);

  // 13. skor kiriman siswa diabaikan server (tidak bisa menambah nilai sendiri)
  await req(`/api/guru/asesmen/${kuisUji.id}/buka-ulang`, { method: "POST", token: guru, body: { user_id: sA.id || sA.user_id, alasan: "uji manipulasi skor" } });
  const jawabanSalah = kunciUji.map(k => (k + 1) % 3);
  const kirimNakal = await req(`/api/asesmen/${kuisUji.id}/kerja`, { method: "POST", token: siswa, body: { jawaban: jawabanSalah, skor: 100, skor_butir: 999 } });
  catat("Skor kiriman siswa diabaikan (server menilai sendiri)",
    kirimNakal.status === 200 && kirimNakal.data.skor === 0,
    `siswa mengirim skor:100 + jawaban salah → nilai tersimpan ${kirimNakal.data.skor}`);

  // 14. pekerjaan karya menunggu guru (tidak ada nilai otomatis) & guru tak bisa menilai tanpa konfirmasi
  // dibuka ulang lebih dulu supaya uji dapat diulang (pekerjaan mungkin sudah terkumpul pada eksekusi sebelumnya)
  await req(`/api/guru/asesmen/${lkpdUji.id}/buka-ulang`, { method: "POST", token: guru, body: { user_id: sA.id || sA.user_id, alasan: "persiapan uji penilaian karya" } });
  const kirimLkpd = await req(`/api/asesmen/${lkpdUji.id}/kerja`, { method: "POST", token: siswa, body: { teks: "Laporan LKPD uji otomatis.", tautan: "https://contoh.test/uji" } });
  const kriteriaLkpd = (await req(`/api/guru/asesmen/${lkpdUji.id}`, { token: guru })).data.asesmen.kriteria || [];
  const petaNilai = Object.fromEntries(kriteriaLkpd.map(k => [k.nama, 4]));
  const tanpaKonfirmasi = await req(`/api/guru/asesmen/${lkpdUji.id}/nilai`, { method: "POST", token: guru, body: { user_id: sA.id || sA.user_id, kriteria: petaNilai, komentar: "tanpa konfirmasi" } });
  const denganKonfirmasi = await req(`/api/guru/asesmen/${lkpdUji.id}/nilai`, { method: "POST", token: guru, body: { user_id: sA.id || sA.user_id, kriteria: petaNilai, komentar: "sesuai rubrik", konfirmasi: true } });
  catat("Karya/proses menunggu guru: tanpa konfirmasi ditolak (400), dengan konfirmasi tersimpan",
    kirimLkpd.status === 200 && kirimLkpd.data.skor === null && kirimLkpd.data.status === "terkumpul"
    && tanpaKonfirmasi.status === 400 && denganKonfirmasi.status === 200 && denganKonfirmasi.data.skor === 100,
    `kirim LKPD → status ${kirimLkpd.data.status} skor ${kirimLkpd.data.skor}; nilai tanpa konfirmasi=HTTP ${tanpaKonfirmasi.status}; dengan konfirmasi → ${denganKonfirmasi.data.skor}`);

  // 15. rubrik dengan total bobot ≠ 100 ditolak
  const detailPraktik = await req(`/api/guru/asesmen/${praktikUji.id}`, { token: guru });
  const rubrikSah = detailPraktik.data.asesmen.rubrik || [];
  const rubrikSalah = rubrikSah.map((r, i) => ({ ...r, bobot: i === 0 ? r.bobot + 7 : r.bobot }));
  const tolakBobot = await req(`/api/guru/asesmen/${praktikUji.id}/rubrik`, { method: "PUT", token: guru, body: { rubrik: rubrikSalah } });
  const terimaBobot = await req(`/api/guru/asesmen/${praktikUji.id}/rubrik`, { method: "PUT", token: guru, body: { rubrik: rubrikSah, kktp: praktikUji.kktp, kesempatanRevisi: praktikUji.kesempatanRevisi } });
  catat("Rubrik dengan total bobot ≠ 100 ditolak; bobot sah tersimpan",
    tolakBobot.status === 400 && terimaBobot.status === 200,
    `total ${rubrikSalah.reduce((x, r) => x + r.bobot, 0)} → HTTP ${tolakBobot.status}; total ${rubrikSah.reduce((x, r) => x + r.bobot, 0)} → HTTP ${terimaBobot.status}`);

  // 16. siswa tidak bisa memakai jalur penilaian guru & rekap guru
  const akses1 = await req(`/api/guru/asesmen/${praktikUji.id}`, { token: siswa });
  const akses2 = await req(`/api/guru/asesmen/${praktikUji.id}/nilai`, { method: "POST", token: siswa, body: { user_id: 1, kriteria: {}, konfirmasi: true } });
  const akses3 = await req("/api/guru/rekap-asesmen", { token: siswa });
  const akses4 = await req("/api/guru/rekap-asesmen.csv?mode=siswa", { token: siswa });
  catat("Siswa ditolak dari penilaian & rekap guru (403)",
    [akses1, akses2, akses3, akses4].every(x => x.status === 403),
    `detail=${akses1.status}, nilai=${akses2.status}, rekap=${akses3.status}, ekspor CSV=${akses4.status}`);

  // 17. rekap 3 mode + ekspor CSV nyata dari kelas
  const rek = await req("/api/guru/rekap-asesmen", { token: guru });
  const csvRes = await fetch(`${BASE}/api/guru/rekap-asesmen.csv?mode=siswa`, { headers: { "x-dkv-token": guru } });
  const csvTeks = await csvRes.text();
  const kelasTerisi = (rek.data.perSiswa || []).find(p => p.nilai_akhir !== null);
  catat("Rekap 3 mode (peserta didik/minggu/jenis) + ekspor CSV berisi nilai",
    rek.status === 200 && (rek.data.perSiswa || []).length > 0 && (rek.data.perMinggu || []).length === 36
    && (rek.data.perJenis || []).length >= 5 && csvRes.status === 200 && csvTeks.includes("nilai_akhir") && kelasTerisi,
    `perSiswa=${rek.data.perSiswa.length}, perMinggu=${rek.data.perMinggu.length}, perJenis=${rek.data.perJenis.length}, CSV ${csvTeks.split("\n").length - 1} baris; contoh nilai_akhir=${kelasTerisi?.nama_lengkap} → ${kelasTerisi?.nilai_akhir}`);

  // 18. remedial tercatat bila nilai di bawah KKTp
  const remedial = await req("/api/guru/asesmen-remedial", { token: guru });
  const barisRemedial = (remedial.data.remedial || []).length;
  catat("Daftar remedial memuat siswa dengan nilai di bawah KKTp",
    remedial.status === 200 && barisRemedial > 0 && (remedial.data.remedial || []).every(x => x.skor < x.kktp),
    `${barisRemedial} baris remedial (mis. ${(remedial.data.remedial || [])[0]?.nama_lengkap} — ${(remedial.data.remedial || [])[0]?.judul}: ${(remedial.data.remedial || [])[0]?.skor} < KKTp ${(remedial.data.remedial || [])[0]?.kktp})`);

  // 19. menu Kuis dikunci guru → pengiriman jawaban ditahan (tidak ada nilai baru)
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "kuis", enabled: false } });
  const terkunciKuis = await req(`/api/asesmen/${kuisUji.id}/kerja`, { method: "POST", token: siswa, body: { jawaban: kunciUji } });
  await req("/api/guru/kontrol", { method: "POST", token: guru, body: { kelas_id: KELAS_A, meeting: "senin", menu_key: "kuis", enabled: true } });
  catat("Menu Kuis yang dikunci guru menahan pengiriman jawaban (403 terkunci)",
    terkunciKuis.status === 403 && terkunciKuis.data.locked === true,
    `HTTP ${terkunciKuis.status} — ${terkunciKuis.data.error}`);

  // 20. guru membuka ulang pekerjaan untuk remedial (nilai lama kosong, siswa dapat mengerjakan ulang)
  const bukaUlang = await req(`/api/guru/asesmen/${kuisUji.id}/buka-ulang`, { method: "POST", token: guru, body: { user_id: sA.id || sA.user_id, alasan: "remedial uji" } });
  const kerjaUlang = await req(`/api/asesmen/${kuisUji.id}/kerja`, { token: siswa });
  const ulangKirim = await req(`/api/asesmen/${kuisUji.id}/kerja`, { method: "POST", token: siswa, body: { jawaban: kunciUji } });
  catat("Guru dapat membuka ulang pekerjaan untuk remedial & siswa mengerjakan ulang",
    bukaUlang.status === 200 && kerjaUlang.data.kerja?.status === "draf" && ulangKirim.status === 200 && ulangKirim.data.skor === 100,
    `buka ulang (skor lama ${bukaUlang.data.skor_lama}) → status ${kerjaUlang.data.kerja?.status} → kirim ulang skor ${ulangKirim.data.skor}`);

  // ===== 33–38. Supervisi akademik (indikator dari dokumen) + dokumentasi per pertemuan + hak akses =====
  // 33. daftar indikator dimuat dari dokumen instrumen; siswa ditolak
  const ind = await req("/api/supervisi/indikator", { token: guru });
  const aspekKode = (ind.data.indikator || []).map(a => a.aspek_kode).join(",");
  const indSiswa = await req("/api/supervisi/indikator", { token: siswa });
  const daftarGuruSv = await req("/api/supervisi/daftar-guru", { token: guru });
  catat("Indikator supervisi dimuat dari dokumen instrumen sekolah (aspek C.1–C.4, termasuk 5C); siswa ditolak",
    ind.status === 200 && aspekKode === "C.1,C.2,C.3,C.4" && ind.data.totalAktif >= 18
    && /Instrumen Supervisi/.test(ind.data.sumber || "") && ind.data.dapatMenyunting === false
    && indSiswa.status === 403 && (daftarGuruSv.data.guru || []).length >= 1,
    `${ind.data.totalAktif} indikator pada ${aspekKode} · sumber: ${(ind.data.sumber || "").slice(0, 46)}… · siswa=${indSiswa.status}`);

  // 34. skor per indikator divalidasi 1–4 & rata per aspek dihitung server
  const kodeIndikator = (ind.data.indikator || []).flatMap(a => a.indikator.map(i => i.kode));
  const guruUji = (daftarGuruSv.data.guru || [])[0];
  // satu indikator per aspek (C.1–C.4) agar pengelompokan rata per aspek ikut teruji
  const perAspekKode = (ind.data.indikator || []).map(a => a.indikator[0]?.kode).filter(Boolean);
  const skorUji = {}; [4, 3, 2, 4].forEach((v, i) => { if (perAspekKode[i]) skorUji[perAspekKode[i]] = v; });
  const simpanSv = await req("/api/supervisi", { method: "POST", token: guru, body: { guru_id: guruUji.id, kelas_id: KELAS_A, week_nomor: mingguAses, tanggal: "2026-10-13", skor: skorUji, catatan: "Catatan uji otomatis", rekomendasi: { guru: "Rekomendasi guru", murid: "Rekomendasi murid", sekolah: "Rekomendasi sekolah" }, tindak_lanjut: "Tindak lanjut uji", status: "final" } });
  const kodeLuar = await req("/api/supervisi", { method: "POST", token: guru, body: { skor: { "C.9.9": 4 } } });
  const skorLuar = await req("/api/supervisi", { method: "POST", token: guru, body: { skor: { [kodeIndikator[0]]: 9 } } });
  const daftarSv = await req("/api/supervisi", { token: guru });
  const barisSv = (daftarSv.data.supervisi || []).find(x => x.id === simpanSv.data.id);
  const aspekAda = ["C.1", "C.2", "C.3", "C.4"].every(k => (barisSv?.perAspek || []).some(a => a.aspek_kode === k));
  catat("Skor per indikator divalidasi (1–4 & hanya indikator instrumen) dan rata per aspek dihitung server",
    simpanSv.status === 200 && kodeLuar.status === 400 && skorLuar.status === 400 && aspekAda && barisSv.rata !== null,
    `tersimpan #${simpanSv.data.id} (rata ${barisSv?.rata}); indikator asing → ${kodeLuar.status}; skor 9 → ${skorLuar.status}; aspek terhitung=${aspekAda}`);

  // 35. indikator dapat dikonfigurasi Admin; guru tidak dapat mengubah, dan daftar dapat dimuat ulang dari instrumen
  const idInd = (ind.data.indikator || [])[0].indikator[0].id;
  const tolakGuru = await req(`/api/supervisi/indikator/${idInd}`, { method: "PUT", token: guru, body: { nama: "diubah guru" } });
  const deskriptorUji = `Deskriptor uji ${Date.now()}`;
  const ubahAdmin = await req(`/api/supervisi/indikator/${idInd}`, { method: "PUT", token: admin, body: { deskriptor: deskriptorUji } });
  const cekGuru = await req("/api/supervisi/indikator", { token: guru });
  const terbaca = JSON.stringify(cekGuru.data.indikator).includes(deskriptorUji);
  const muatUlang = await req("/api/supervisi/indikator/muat-ulang", { method: "POST", token: admin });
  const setelahReset = await req("/api/supervisi/indikator", { token: admin });
  catat("Indikator supervisi dapat dikonfigurasi Admin (guru 403) & dapat dimuat ulang dari dokumen instrumen",
    tolakGuru.status === 403 && ubahAdmin.status === 200 && terbaca && muatUlang.status === 200
    && muatUlang.data.jumlah >= 18 && setelahReset.data.totalAktif >= 18,
    `guru→${tolakGuru.status}, admin→${ubahAdmin.status} (terbaca guru=${terbaca}), muat ulang=${muatUlang.data.jumlah} indikator`);

  // 36. dokumentasi per pertemuan: isian usulan (7 bagian) + simpan + siswa ditolak
  const dok0 = await req(`/api/supervisi/dokumentasi/${mingguAses}/senin`, { token: guru });
  const us = dok0.data.usulan || {};
  const lengkap7 = (us.tujuan || []).length > 0 && (us.memahami || []).length > 0 && (us.mengaplikasi || []).length > 0
    && (us.merefleksi || []).length > 0 && (us.bukti || []).length > 0 && (dok0.data.prinsipMendalam || []).length >= 8;
  const isiDok = { tujuan: ["Tujuan uji dokumentasi"], memahami: ["Aktivitas memahami uji"], mengaplikasi: ["Aktivitas mengaplikasi uji"], merefleksi: ["Aktivitas merefleksi uji"], prinsip: ["5c", "bermakna"], bukti: ["Bukti uji: foto karya"], catatan_observasi: "Catatan observasi uji", refleksi_guru: "Refleksi guru uji", tindak_lanjut: "Tindak lanjut uji", status: "final" };
  const simpanDok = await req(`/api/supervisi/dokumentasi/${mingguAses}/senin`, { method: "PUT", token: guru, body: isiDok });
  const cekDok = await req(`/api/supervisi/dokumentasi/${mingguAses}/senin`, { token: guru });
  const dokSiswa = await req(`/api/supervisi/dokumentasi/${mingguAses}/senin`, { token: siswa });
  const dokSiswaPut = await req(`/api/supervisi/dokumentasi/${mingguAses}/senin`, { method: "PUT", token: siswa, body: isiDok });
  const daftarDok = await req("/api/supervisi/dokumentasi", { token: guru });
  catat("Dokumentasi per pertemuan: 7 bagian terisi usulan otomatis, tersimpan guru, siswa ditolak",
    dok0.status === 200 && lengkap7 && simpanDok.status === 200 && cekDok.data.dokumen?.status === "final"
    && (cekDok.data.dokumen?.prinsip || []).includes("5c") && cekDok.data.dokumen?.catatan_observasi === isiDok.catatan_observasi
    && dokSiswa.status === 403 && dokSiswaPut.status === 403 && (daftarDok.data.dokumentasi || []).length === 72,
    `usulan: tujuan ${(us.tujuan || []).length}, memahami ${(us.memahami || []).length}, mengaplikasi ${(us.mengaplikasi || []).length}, merefleksi ${(us.merefleksi || []).length}, bukti ${(us.bukti || []).length}, prinsip pilihan ${(dok0.data.prinsipMendalam || []).length}; siswa GET/PUT=${dokSiswa.status}/${dokSiswaPut.status}`);

  // 37. ekspor CSV supervisi (per indikator & per aspek) + dokumentasi
  const csvSv = await fetch(`${BASE}/api/supervisi.csv`, { headers: { "x-dkv-token": guru } });
  const teksSv = await csvSv.text();
  const csvDok = await fetch(`${BASE}/api/supervisi/dokumentasi.csv`, { headers: { "x-dkv-token": guru } });
  const teksDok = await csvDok.text();
  const csvSiswa = await fetch(`${BASE}/api/supervisi.csv`, { headers: { "x-dkv-token": siswa } });
  catat("Rekap supervisi & dokumentasi dapat diekspor ke CSV (kepala kolom per indikator dan per aspek); siswa ditolak",
    csvSv.status === 200 && /"id";"tanggal";"guru"/.test(teksSv) && teksSv.includes(kodeIndikator[0]) && /rata_C1/.test(teksSv)
    && csvDok.status === 200 && /"minggu";"hari";"status"/.test(teksDok) && /catatan_observasi/.test(teksDok)
    && csvSiswa.status === 403,
    `CSV supervisi ${teksSv.split("\r\n").length - 2} baris data (${kodeIndikator.length} kolom indikator + rata per aspek) · CSV dokumentasi ${teksDok.split("\r\n").length - 2} baris · siswa=${csvSiswa.status}`);

  // 38. hak akses: peserta didik tidak dapat masuk fitur admin dan tidak dapat mengubah nilai guru
  const adm1 = await req("/api/admin/users", { token: siswa });
  const adm2 = await req("/api/admin/settings", { token: siswa });
  const adm3 = await req("/api/admin/logs", { token: siswa });
  const adm4 = await req("/api/admin/users", { method: "POST", token: siswa, body: { username: "nakal", password: "rahasia123", role: "admin", nama_lengkap: "Nakal" } });
  const adm5 = await req("/api/admin/settings", { method: "PUT", token: siswa, body: { key: "pekan_berjalan", value: 36 } });
  const grade1 = await req("/api/guru/grade", { method: "POST", token: siswa, body: { submission_id: 1, skor: 100, umpan_balik: "nilai sendiri" } });
  const grade2 = await req("/api/guru/grade", { method: "POST", token: guru, body: { submission_id: 1, skor: 88, umpan_balik: "dinilai guru" } });
  const sv = await req("/api/supervisi", { method: "POST", token: siswa, body: { skor: {} } });
  catat("Peserta didik tidak dapat mengakses fitur admin atau mengubah nilai guru (semua 403, guru tetap boleh)",
    [adm1, adm2, adm3, adm4, adm5, grade1, sv].every(x => x.status === 403) && grade2.status === 200,
    `admin users/settings/logs/POST=403 · guru/grade siswa=${grade1.status} (guru=${grade2.status}) · supervisi siswa=${sv.status}`);

  // 10. logout mengakhiri sesi
  const keluar = await req("/api/auth/logout", { method: "POST", token: guru });
  const sesudah = await req("/api/auth/me", { token: guru });
  const guruLagi = await login("dewi", "guru123", "guru");
  catat("Logout mengakhiri sesi (token lama tidak berlaku)", keluar.status === 200 && sesudah.status === 401 && guruLagi.status === 200,
    `logout=${keluar.status}, token lama dipakai ulang → HTTP ${sesudah.status}, login baru=${guruLagi.status}`);

  // tambahan: log aktivitas tercatat
  const logs = await req("/api/admin/logs", { token: admin });
  const aksiTercatat = new Set((logs.data.logs || []).map(l => l.aksi));
  catat("Log aktivitas tercatat (pengguna, waktu, aksi, objek)",
    ["login", "login_gagal", "kontrol_menu", "sesi_mulai", "sesi_jeda", "sesi_lanjut", "sesi_akhiri", "kumpul_tugas", "sunting_modul", "kuis_formatif", "simulasi_hasil",
      "kumpul_asesmen", "nilai_asesmen", "ubah_rubrik", "ekspor_rekap_asesmen", "buka_ulang_asesmen",
      "simpan_supervisi", "sunting_dokumentasi", "ubah_indikator_supervisi", "ekspor_supervisi"].every(a => aksiTercatat.has(a)),
    `aksi tercatat: ${[...aksiTercatat].slice(0, 12).join(", ")}`);

  // tambahan: impor akun massal dari panel Admin (endpoint yang dipakai tombol "Tambah siswa massal")
  const impor1 = await req("/api/admin/users/impor", { method: "POST", token: admin, body: {
    daftar: [
      { nama: "Uji API Satu", nis: "0099001001", kelas: "X DKV UJI" },
      { nama: "Uji API Dua", nis: "0099001002", kelas: "X DKV UJI" },
      { nama: "Uji API Tiga", nis: "0099001003", kelas: "X DKV 1" },     // kelas yang sudah ada
    ], sandi_awal: "ujiapi123", buat_kelas: true,
  } });
  const kelasBaruAda = (await req("/api/admin/users", { token: admin })).data.users.some(u => u.kelas === "X DKV UJI");
  const akunBaruAda = (await req("/api/admin/users", { token: admin })).data.users.filter(u => String(u.username).startsWith("ujiapi"));
  const loginImpor = await req("/api/auth/login", { method: "POST", body: { username: akunBaruAda[0]?.username, password: "ujiapi123", sebagai: "siswa" } });
  // dijalankan ulang: harus DILEWATI (tidak membuat akun kembar)
  const impor2 = await req("/api/admin/users/impor", { method: "POST", token: admin, body: {
    daftar: [{ nama: "Uji API Satu", nis: "0099001001", kelas: "X DKV UJI" }], sandi_awal: "ujiapi123", buat_kelas: true,
  } });
  const jumlahSetelahImporUlang = (await req("/api/admin/users", { token: admin })).data.users.filter(u => String(u.username).startsWith("ujiapi")).length;
  const imporSiswa = await req("/api/admin/users/impor", { method: "POST", token: siswa, body: { daftar: [{ nama: "Nakal" }], sandi_awal: "nakal123" } });
  const imporKosong = await req("/api/admin/users/impor", { method: "POST", token: admin, body: { daftar: [], sandi_awal: "ujiapi123" } });
  const imporSandiPendek = await req("/api/admin/users/impor", { method: "POST", token: admin, body: { daftar: [{ nama: "Uji Pendek" }], sandi_awal: "123" } });
  catat("Impor akun massal dari panel Admin (bentuk username otomatis, idempoten, hak akses tegas)",
    impor1.status === 200 && impor1.data.ringkas?.dibuat === 3 && kelasBaruAda && akunBaruAda.length === 3 && loginImpor.status === 200
      && impor2.status === 200 && impor2.data.ringkas?.dilewati === 1 && jumlahSetelahImporUlang === 3
      && imporSiswa.status === 403 && imporKosong.status === 400 && imporSandiPendek.status === 400,
    `impor=200 (${impor1.data.ringkas?.dibuat} dibuat, kelas "X DKV UJI" terbentuk=${kelasBaruAda}); login akun hasil impor=${loginImpor.status}; `
    + `impor ulang → ${impor2.data.ringkas?.dilewati} dilewati & jumlah akun tetap ${jumlahSetelahImporUlang}; siswa=${imporSiswa.status}; daftar kosong=${imporKosong.status}; sandi 3 karakter=${imporSandiPendek.status}`);

  const gagal = hasil.filter(h => !h.lulus).length;
  console.log(`\nRINGKASAN: ${hasil.length - gagal}/${hasil.length} uji LULUS${gagal ? ` — ${gagal} GAGAL` : ""}`);
  process.exit(gagal ? 1 : 0);
})().catch(e => { console.error("Uji gagal dijalankan:", e); process.exit(2); });
