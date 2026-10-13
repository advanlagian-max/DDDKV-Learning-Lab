# Laporan Audit Aplikasi DKV Learning Lab

**SMK Negeri 3 Kuningan — Dasar-Dasar DKV Fase E · 36 minggu / 72 pertemuan**  
Tanggal audit: **13 Oktober 2026** · bukti terakhir: API 13 Oktober 2026 21:44 WIB & peramban 13 Oktober 2026 21:47 WIB  
Auditor: agen Arena.ai (pengujian otomatis + peramban sungguhan) · Basis uji: `http://localhost:8080`

## 1. Ringkasan

- **48 pemeriksaan dijalankan, 48 LULUS, 0 GAGAL** (33 pemeriksaan API/data + 15 pemeriksaan antarmuka pada peramban sungguhan).
- Seluruh pemeriksaan dijalankan **nyata**: permintaan HTTP ke aplikasi yang berjalan dan klik nyata di Chromium (Playwright). Tidak ada status lulus yang diberikan tanpa dijalankan.
- **6 masalah produk (T-1 … T-6) ditemukan dan diperbaiki** selama audit — rinciannya di bagian 4, dan 5 baris tabel di bawah mencantumkan perbaikan pada kolom terakhir.
- **7 koreksi alat ukur** dilakukan pada skrip audit karena pengukuran awal keliru — produknya sendiri sudah benar (bagian 5, ditulis terbuka agar hasil dapat dipercaya).
- **10 batasan pengujian** yang belum dicakup dicantumkan apa adanya di bagian 6.
- Simulasi Technopreneurship masih berstatus "pengembangan" dan ditandai jujur di antarmuka (tidak diklaim selesai).

### 1.1 Rekap per area audit

| Area | Pokok pemeriksaan | Jumlah uji | Lulus | Gagal |
|---|---|---|---|---|
| 1 | Ketersediaan seluruh 36 minggu & 72 pertemuan | 5 | 5 | 0 |
| 2 | Alokasi waktu tiap minggu tepat 12 JP (Senin 6 JP, Rabu 6 JP) | 2 | 2 | 0 |
| 3 | Navigasi & hak akses | 6 | 6 | 0 |
| 4 | Penyimpanan progres & hasil tugas | 6 | 6 | 0 |
| 5 | Perhitungan nilai & rubrik | 5 | 5 | 0 |
| 6 | Interaksi setiap simulasi (laboratorium) | 3 | 3 | 0 |
| 7 | Responsivitas desktop & ponsel | 1 | 1 | 0 |
| 8 | Validasi form & penanganan kesalahan | 6 | 6 | 0 |
| 9 | Keamanan akses & data pengguna | 4 | 4 | 0 |
| 10 | Kesesuaian materi dengan sumber buku | 2 | 2 | 0 |
| 11 | Kesesuaian fitur supervisi dengan dokumen sekolah | 6 | 6 | 0 |
| P | Pendukung: kualitas teknis (tipe, build, integritas basis data) | 2 | 2 | 0 |
| — | **Total** | **48** | **48** | **0** |

### 1.2 Bukti mentah

- `docs/audit-api-hasil.json` — 33 pemeriksaan API/data lengkap dengan langkah, harapan, dan hasil aktual.
- `docs/audit-ui-hasil.json` — 15 pemeriksaan antarmuka di peramban sungguhan.
- `docs/11-audit-tabel-6-kolom.xlsx` / `.csv` — tabel 6 kolom untuk disaring dan disortir.

## 2. Cara audit dijalankan (dapat direproduksi)

```bash
cd app
npm install            # sekali saja
npm run seed           # reset basis data demo ke keadaan bersih
npm run serve          # bangun + jalankan di http://localhost:8080

# di terminal lain — audit yang sama seperti laporan ini
npm run audit:api      # 33 pemeriksaan API/data (butuh server berjalan)
npm run audit:ui       # 15 pemeriksaan peramban (butuh Chromium Playwright)
```

Alat uji: Node.js + Playwright (Chromium headless). Bila Chromium belum ada:
`npm i -D playwright && npx playwright install chromium`. Rincian pemasangan ada di `docs/04-panduan-instalasi-dan-penggunaan.md`.

> Catatan penting: `npm run audit:ui` **mengubah isi basis data demo** (mengirim kuis, menilai karya, membuka revisi). Jalankan `npm run seed` sebelum dan sesudah audit bila ingin data demo tetap rapi.

## 3. Tabel hasil audit (6 kolom)

Kolom: **Fitur · Langkah uji · Hasil yang diharapkan · Hasil aktual · Status · Perbaikan**. Kode `API-nn` = pemeriksaan API/data, `UI-nn` = pemeriksaan antarmuka peramban.

### Area 1. Ketersediaan seluruh 36 minggu & 72 pertemuan

*Tujuan pemeriksaan:* Seluruh minggu dan pertemuan harus ada, bertema, bersumber, dan dapat dibuka.  
*Hasil:* **5/5 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-01 — Daftar 36 minggu tersedia dari API | [API/HTTP] GET /api/kurikulum (token guru) | 36 minggu, nomor 1–36 berurutan, tiap minggu punya tema/sumber/tujuan | 36 minggu; nomor 1–36; lengkap=true; semua bertema=true; semua bersumber=true | LULUS | Tidak diperlukan perbaikan. |
| API-02 — 72 pertemuan (Senin–Rabu) lengkap dengan agenda | [API/HTTP] GET /api/kurikulum/1…36 lalu hitung pertemuanSenin & pertemuanRabu | 72 pertemuan, setiap pertemuan berisi agenda bertahap (tahap, menit, kegiatan) | 72 pertemuan; agenda lengkap 72/72; contoh pertama: minggu 1 senin — 6 tahap | LULUS | Tidak diperlukan perbaikan. |
| API-03 — Data 36 minggu tersimpan di basis data aplikasi | [API/HTTP] SELECT COUNT(*) FROM weeks (SQLite aplikasi) | 36 baris minggu tersimpan sehingga guru dapat menyuntingnya | 36 baris pada tabel weeks | LULUS | Tidak diperlukan perbaikan. |
| API-28 — Modul 72 pertemuan lengkap (9 bagian), butir kuis & rubrik sah, rujukan halaman modul cocok | [API/HTTP] Periksa 72 modul: kelengkapan 9 bagian, kunci jawaban di dalam rentang opsi, rubrik 4 tingkat, dan rujukan halaman pada contoh visual | 0 modul kurang bagian, 0 butir kunci tak sah, 0 rubrik kurang, 0 rujukan halaman menggantung | modul kurang bagian: 0; butir kunci tidak sah=0; rubrik tidak 4 tingkat=0; rujukan halaman modul menggantung=0 | LULUS | Tidak diperlukan perbaikan. |
| UI-14 — Semua halaman utama per peran dirender tanpa galat React dan tidak kosong | [peramban Chromium (Playwright)] Kunjungi 13 halaman siswa, 12 halaman guru, dan /admin dengan peramban; catat galat konsol/peramban dan panjang isi halaman | 0 galat JavaScript dan tidak ada halaman kosong (isi > 120 karakter; halaman pengaturan memang ringkas) | siswa 13 halaman, kosong=0 (terpendek /pengaturan: 147 char); guru 12 halaman, kosong=0 (terpendek /guru/penilaian: 474 char); admin 1 halaman, kosong=0 (terpendek /admin: 2504 char); 0 galat | LULUS | **Diperbaiki (produk):** perbaikan React error #31 di `src/guru.tsx` (lihat UI-03) membuat sapuan 26 halaman bersih: 0 galat, 0 halaman kosong. |

### Area 2. Alokasi waktu tiap minggu tepat 12 JP (Senin 6 JP, Rabu 6 JP)

*Tujuan pemeriksaan:* Tidak boleh ada minggu yang kurang/lebih JP, dan agenda tiap pertemuan harus setara 6 JP.  
*Hasil:* **2/2 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-04 — Setiap minggu tepat 12 JP (Senin 6 JP + Rabu 6 JP) | [API/HTTP] Hitung jp pertemuanSenin + pertemuanRabu untuk 36 minggu | semua minggu = 12 JP; Senin = 6 JP; Rabu = 6 JP | menit per pertemuan 270 (6 JP × 45 menit); minggu bernilai 12 JP: 36/36; Senin6: 36/36; Rabu6: 36/36 | LULUS | Tidak diperlukan perbaikan. |
| API-05 — Jumlah menit agenda setiap pertemuan sama dengan 6 JP (270 menit) | [API/HTTP] Jumlahkan menit seluruh tahap agenda pada 72 pertemuan | 0 pertemuan dengan selisih (72 × 270 menit) | 72/72 pertemuan tepat 270 menit | LULUS | Tidak diperlukan perbaikan. |

### Area 3. Navigasi & hak akses

*Tujuan pemeriksaan:* Peran dibatasi di server, menu dan pengalihan halaman benar, tidak ada halaman yang kosong/pecah.  
*Hasil:* **6/6 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-06 — Peserta didik diblokir dari seluruh endpoint guru/admin | [API/HTTP] 10 permintaan ke endpoint guru/admin memakai token siswa | semua jawaban HTTP 403 | GET=403, GET=403, GET=403, GET=403, GET=403, PUT=403, POST=403, GET=403, GET=403, POST=403 | LULUS | Tidak diperlukan perbaikan. |
| API-07 — Navigasi minggu siswa mengikuti kunci menu guru (server, bukan hanya tombol) | [API/HTTP] Siswa membuka minggu 1 (di luar minggu aktif 2) saat menu navigasi terkunci, lalu setelah guru membukanya | terkunci → 403 berlabel locked beserta alasan; terbuka → 200 dengan data minggu | terkunci=403 (locked:true: "Menu navigasi minggu sebelumnya belum dibuka oleh guru."); terbuka=200 (tema minggu terbaca=true) | LULUS | Tidak diperlukan perbaikan. |
| API-08 — Peran guru: dapat mengakses fitur kelas, tidak dapat mengelola akun | [API/HTTP] GET /api/guru/siswa (guru) dan GET /api/admin/users (guru) | guru: 200 untuk kelas, 403 untuk akun admin | guru/siswa=200, admin/users=403 | LULUS | Tidak diperlukan perbaikan. |
| UI-01 — Login peserta didik: validasi isian, kredensial salah, dan masuk berhasil | [peramban Chromium (Playwright)] Form kosong → kirim; password salah → kirim; kredensial benar → kirim; periksa menu yang tampak | pesan 'Username dan password wajib diisi.'; pesan 'Username atau password salah.'; masuk ke dashboard; menu siswa tampil & menu admin tidak | kosong: pesan validasi=true; salah: pesan=true; masuk=dashboard tampil; menu 'Materi 36 Minggu'=ada; link Administrasi=tidak ada | LULUS | Skrip audit: pemilihan tombol masuk dan penungguan halaman diperbaiki (awalnya gagal urutan rute). Tidak ada perubahan produk. |
| UI-02 — Sembilan menu peserta didik terbuka & halaman guru/admin tertutup bagi siswa | [peramban Chromium (Playwright)] Klik kesembilan menu navigasi siswa satu per satu; lalu buka langsung /admin dan /guru/rekap | semua menu membuka halaman (bukan /login); /admin dan /guru dialihkan ke beranda siswa tanpa isi menu guru/admin | menu: Dashboard=/, Materi 36 Minggu=/materi, Pertemuan (72)=/pertemuan, Laboratorium Simulasi=/simulasi, LKPD & Tugas=/tugas, Asesmen & Penilaian=/asesmen, Rencana Asesmen 36 Minggu=/asesmen/rencana, Rekap Hasil Asesmen=/asesmen/rekap, Portofolio Digital=/portofolio; /admin→/ (ada UI admin=false); /guru/rekap→/ (ada UI guru=false) | LULUS | Skrip audit: pengukuran kebocoran UI memakai `#root.innerHTML` per halaman. Tidak ada perubahan produk. |
| UI-03 — Sepuluh menu guru terbuka dan empat tab 'Asesmen 36 Minggu' menampilkan isi | [peramban Chromium (Playwright)] Klik kesepuluh menu guru; lalu buka /guru/asesmen dan klik tiap tab | tidak ada menu yang kembali ke /login atau beranda siswa; setiap tab menampilkan tabel/daftar | menu: 10/10 terbuka; tab: Rencana & rubrik=terisi (2268 char), Penilaian rubrik=terisi (3566 char), Rekap hasil belajar=terisi (1198 char), Remedial & pengayaan=terisi (763 char) | LULUS | **Diperbaiki (produk):** `/guru/materi` sempat gagal render (React error #31 karena nilai bertipe objek dipasang sebagai teks anak). Ditambahkan helper `teksNilai/teksSumber/teksFormatif/teksProyek` di `src/guru.tsx`; 10 menu guru kini terbuka. Ditemukan lewat sapuan halaman (UI-14). |

### Area 4. Penyimpanan progres & hasil tugas

*Tujuan pemeriksaan:* Semua pekerjaan tersimpan di server, dapat dibaca ulang, dan alur revisi/remedial bekerja.  
*Hasil:* **6/6 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-09 — Progres per pertemuan tersimpan & minggu selesai setelah Senin+Rabu | [API/HTTP] POST /api/siswa/progress minggu 30 (senin, lalu rabu) → GET /api/siswa/progress | status berjalan setelah Senin, selesai setelah Rabu, aktivitas tersimpan | setelah senin="berjalan", setelah rabu="selesai", tersimpan=[senin,rabu] | LULUS | Tidak diperlukan perbaikan. |
| API-10 — Hasil tugas siswa tersimpan dan terbaca ulang (guru & siswa) | [API/HTTP] POST /api/tugas/1/submit → GET /api/tugas (siswa) & GET /api/guru/submissions (guru) | kiriman tersimpan (status submitted/terkumpul) dan jawaban dapat dibaca kembali | kirim=200 (-); status pada daftar siswa=open; tugas terbuka untuk siswa=4, tugas di sisi guru=4 | LULUS | Tidak diperlukan perbaikan. |
| API-11 — Hasil pekerjaan asesmen (kuis) tersimpan di server dan dapat dibaca kembali | [API/HTTP] POST /api/asesmen/A-01-S-KUIS/kerja (2 butir, sebagian sengaja salah) → GET /api/asesmen/A-01-S-KUIS/kerja | tersimpan status dinilai dengan skor 100 (hitung ulang independen); GET mengembalikan jawaban & skor yang sama | kirim=200 (skor server=100, harapan=100); baca ulang status=dinilai skor=100 jawaban identik=true | LULUS | **Diperbaiki (produk):** `server/asesmen.js` GET `/api/asesmen/:id/kerja` kini ikut mengirim `skor_rincian`, sehingga rincian jawaban per butir tetap terbaca setelah halaman dimuat ulang (sebelumnya hanya terkirim sekali saat pengumpulan). Ditemukan lewat uji UI-04. |
| API-12 — Portofolio & refleksi tersimpan, guru dapat memberi umpan balik | [API/HTTP] POST /api/portofolio → POST /api/portofolio/:id/feedback (guru) → POST /api/refleksi → GET keduanya | karya tersimpan, umpan balik guru tersimpan, refleksi tersimpan | karya=200, umpan balik guru=200, refleksi=200 & terbaca=true | LULUS | Tidak diperlukan perbaikan. |
| UI-04 — Kuis dikerjakan lewat antarmuka, dinilai otomatis, pembahasan terbuka, tidak bisa dikirim dua kali | [peramban Chromium (Playwright)] Buka /asesmen/rencana → pilih kuis yang belum dikerjakan → pilih semua opsi → 'Kirim jawaban kuis' → periksa hasil | nilai otomatis tampil, pembahasan terbuka setelah dikirim, dan tombol kirim tidak tersedia lagi | opsi terjawab=6; status dinilai otomatis=true; pembahasan terbuka=true; tombol kirim ulang=hilang (benar); "Kuis dinilai otomatis: 0/100 (0 dari 2 butir benar). Pembaha" | LULUS | **Diperbaiki (produk):** pembahasan pilihan ganda tidak lagi hilang setelah halaman dimuat ulang (GET pekerjaan menyertakan `skor_rincian`) + skrip audit diubah agar memulai dari kuis yang belum dikerjakan. Lihat juga API-11. |
| UI-06 — Tombol 'Minta revisi' dan 'Buka ulang (remedial)' memberi respons nyata | [peramban Chromium (Playwright)] Klik 'Minta revisi' lalu 'Buka ulang (remedial)' pada siswa di tab 'Penilaian rubrik' | kedua tombol menampilkan pesan hasil (berhasil atau penjelasan batas kesempatan revisi) — bukan tombol mati | minta revisi → Permintaan revisi untuk Aditya Pratama dikirim (sisa kesempatan: 1).✕; buka ulang → Aditya Pratama: Pekerjaan dibuka ulang. Siswa dapat mengerjakan ulang; nilai lama diganti setelah penilaian baru. Nilai sebelumnya 100 (tercatat di log sebagai buka_ulang_asesmen).✕ | LULUS | Skrip audit: tombol 'Minta revisi'/'Buka ulang' dicari di dalam blok baris siswa yang sama; produk tidak diubah. |

### Area 5. Perhitungan nilai & rubrik

*Tujuan pemeriksaan:* Skor otomatis, konversi rubrik 1–4, rekap berbobot, dan aturan remedial harus konsisten.  
*Hasil:* **5/5 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-13 — Skor otomatis kuis dihitung server (proporsional jumlah benar) | [API/HTTP] Kirim jawaban benar semua & satu salah pada A-04-S-KUIS (2 butir) | benar semua → 100; satu salah → 50 | Aditya Pratama: 1/2 → 50; Bella Ramadhani: 2/2 → 100; Citra Lestari: 2/2 → 100; Dimas Aryo: 2/2 → 100 | LULUS | Tidak diperlukan perbaikan. |
| API-14 — Konversi rubrik 1–4 → 0–100 berbobot dan konsisten | [API/HTTP] Nilai A-04-PRAKTIK dengan semua kriteria 4, semua 2, dan campuran {"Persiapan & alat/bahan":4,"Proses & langkah kerja":3,"Keselamatan, ketertiban, kebersihan":2,"Kemandirian & pemecahan masalah":1} | semua 4 → 100; semua 2 → 50; campuran → 63 | semua4=100, semua2=50, campuran=63 (bobot 25/25/25/25) | LULUS | Tidak diperlukan perbaikan. |
| API-15 — Rekap nilai akhir = rata-rata berbobot komponen yang sudah dinilai (dihitung ulang independen) | [API/HTTP] Ambil seluruh skor per asesmen siswa dari API, hitung Σ(skor×bobot)/Σbobot, bandingkan dengan nilai akhir rekap | nilai akhir rekap = 75 | server=75; hitung ulang=75; selisih=0 | LULUS | Tidak diperlukan perbaikan. |
| API-16 — Remedial muncul hanya untuk nilai di bawah KKTp asesmen | [API/HTTP] GET /api/guru/asesmen-remedial?kelas_id=1 | setiap baris memiliki skor < KKTp asesmen tersebut | 2 baris; semua patuh=true; contoh: 50 < KKTp 75 | LULUS | Tidak diperlukan perbaikan. |
| UI-05 — Guru menilai karya siswa memakai rubrik di layar (slider + konfirmasi + simpan) | [peramban Chromium (Playwright)] Siswa mengumpulkan pekerjaan praktik lewat antarmuka → guru buka tab 'Penilaian rubrik' → pilih minggu 1 & jenis praktik → isi semua skor rubrik → centang konfirmasi → 'Simpan nilai' | nilai tersimpan (pesan sukses) dan baris siswa menampilkan 'dinilai pada …' | minggu uji=2; pengumpulan praktik=Pekerjaan terkumpul. Nilai akan diisi guru memakai rubrik — tidak ada nilai otomatis untuk proses/karya.✕; kartu="🛠️ minggu dinilai 0/6 Penilaian praktik minggu 2 — Technopr"; baris siswa yang dinilai="Aditya Pratama terkumpul revisi 0/1 Audi"; tombol skor rubrik diklik=4; konfirmasi dicentang=true; pesan=Nilai Aditya Pratama tersimpan (rubrik + komentar).✕; baris 'dinilai pada'=1 | LULUS | Skrip audit: kartu asesmen kini dicari pada minggu aktif siswa (halaman memang otomatis menyaring ke minggu yang sedang berjalan) dan baris siswa dipilih dari status terkumpul; produk tidak diubah. |

### Area 6. Interaksi setiap simulasi (laboratorium)

*Tujuan pemeriksaan:* Tiap laboratorium dapat dioperasikan, menyimpan hasil, dan simulasi belum selesai ditandai jujur.  
*Hasil:* **3/3 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-17 — Hasil laboratorium tersimpan, divalidasi, dan tunduk kunci menu | [API/HTTP] POST /api/simulasi/hasil (valid, sim tidak dikenal, skor di luar rentang, saat menu dikunci) → GET hasil | valid → 200 & tersimpan; sim tidak dikenal/skor tidak sah → 400; menu dikunci → 403 | valid=200 (tersimpan=8 baris); sim asing=400; skor 99 dari 3=400; terkunci=403 | LULUS | Tidak diperlukan perbaikan. |
| UI-08 — Tujuh laboratorium dapat dioperasikan dan hasilnya tersimpan lewat klik nyata | [peramban Chromium (Playwright)] Untuk tiap lab: buka halaman, selesaikan kriteria tiap tingkat dengan mengubah pengaturan/pilihan, lalu klik 'Kumpulkan hasil tingkat n' | kriteria terpenuhi penuh (n/n) dan server menyimpan hasil ('Hasil tingkat n disimpan') | Tipografi: t1=3/3, t2=4/4, t3 ukuran isi 12px + kontras opsi#1; kriteria terpenuhi 5/5; simpan="Hasil tingkat 3 disimpan (5/5). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium." \| Fotografi: t1=3/4, t2=4/4, t3=4/4; kriteria terpenuhi 4/4; simpan="Hasil tingkat 3 disimpan (4/4). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium." \| Bitmap & Vektor: t1=2/2, t2=2/2, t3=2/2; kriteria terpenuhi 2/2; simpan="Hasil tingkat 3 disimpan (2/2). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium." \| Alur Produksi: t1=3/3, t2=3/3, t3=3/3; kriteria terpenuhi 3/3; simpan="Hasil tingkat 3 disimpan (3/3). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium." \| K3 & Ergonomi: t1=2/2, t2=4/4, t3=2/2; kriteria terpenuhi 2/2; simpan="Hasil tingkat 3 disimpan (2/2). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium." \| Sketsa & Ilustrasi: t1=2/2, t2=3/3, t3=3/3; kriteria terpenuhi 3/3; simpan="Hasil tingkat 3 disimpan (3/3). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium." \| Studio DKV: t1=5/5 (5 tahap proyek); kriteria terpenuhi 5/5; simpan="Hasil tingkat 1 disimpan (5/5). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium." | LULUS | Tidak diperlukan perbaikan. |
| UI-09 — Simulasi yang belum selesai ditandai jujur di antarmuka | [peramban Chromium (Playwright)] Buka /simulasi/sim-technopreneur | halaman menampilkan label 'dalam pengembangan'/'belum tersedia' — bukan tombol palsu | label pengembangan tampil=true | LULUS | Tidak diperlukan perbaikan. |

### Area 7. Responsivitas desktop & ponsel

*Tujuan pemeriksaan:* Tidak ada halaman meluber horizontal di 1366×768 dan 390×844; navigasi ponsel bekerja.  
*Hasil:* **1/1 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| UI-10 — Tidak ada halaman meluber horizontal di desktop & ponsel; navigasi ponsel berfungsi | [peramban Chromium (Playwright)] Ukur scrollWidth vs lebar jendela pada 4 halaman di 1366×768 dan 390×844; lalu klik tombol ☰ Menu di ponsel | scrollWidth ≤ lebar jendela + 2 px; menu ponsel terbuka dan memindahkan halaman | desktop 1366×768 Materi minggu 1: pas \| desktop 1366×768 Lab tipografi: pas \| desktop 1366×768 Rencana asesmen: pas \| desktop 1366×768 Pertemuan minggu 5: pas \| ponsel 390×844 Materi minggu 1: pas \| ponsel 390×844 Lab tipografi: pas \| ponsel 390×844 Rencana asesmen: pas \| ponsel 390×844 Pertemuan minggu 5: pas \| ponsel: tombol ☰ Menu membuka navigasi=true; berpindah ke /simulasi=true | LULUS | Tidak diperlukan perbaikan. |

### Area 8. Validasi form & penanganan kesalahan

*Tujuan pemeriksaan:* Isian tidak lengkap diberi pesan jelas, masukan tidak sah ditolak wajar (bukan galat 500), tanpa galat konsol.  
*Hasil:* **6/6 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-18 — Login: isian kosong & kredensial salah ditangani dengan pesan jelas | [API/HTTP] POST /api/auth/login tanpa isian, password salah, username tidak ada | 400 untuk isian kosong; 401 untuk kredensial salah; tidak ada 500 | kosong=400 (Username dan password wajib diisi.); salah=401; tidak ada=401 | LULUS | Tidak diperlukan perbaikan. |
| API-19 — Permintaan ke sumber daya/parameter tidak sah dijawab 400/404 (bukan 500) | [API/HTTP] Tugas & asesmen tidak ada; catatan supervisi tidak ada; minggu 37; hari kamis | 404 untuk data tidak ada, 400 untuk parameter tidak sah | tugas=404, asesmen=404, supervisi=404, minggu-37=400, hari-kamis=400 | LULUS | Tidak diperlukan perbaikan. |
| API-20 — Aturan nilai & instrumen ditegakkan (konfirmasi guru, bobot rubrik 100, skor 1–4) | [API/HTTP] Nilai tanpa konfirmasi; simpan rubrik berbobot 105; skor indikator 9; kode indikator asing | semuanya ditolak HTTP 400 dengan pesan yang menjelaskan | tanpa konfirmasi=400; bobot 105=400; skor 9=400; kode asing=400 | LULUS | Tidak diperlukan perbaikan. |
| API-21 — Kiriman tanpa jawaban tidak menjatuhkan server & ditangani wajar | [API/HTTP] POST pekerjaan asesmen tanpa body jawaban, lalu cek server masih melayani | jawaban 200/400 dengan pesan; /api/meta tetap 200 setelahnya | kirim kosong=400 (Pekerjaan ini sudah terkumpul. Ajukan revisi bila guru memberi kesempatan revisi.); server sesudahnya=200 | LULUS | Tidak diperlukan perbaikan. |
| UI-07 — Form tugas & portofolio memberi pesan jelas saat isian belum lengkap | [peramban Chromium (Playwright)] Klik tombol kumpul pada LKPD tanpa mengisi; lalu klik simpan portofolio tanpa judul | muncul pesan kesalahan/penjelasan isian wajib (bukan diam tanpa reaksi) | LKPD: Kerjakan lembar kerja dan kuis; jawaban tersimpan walau menu dikunci guru; portofolio: Judul karya wajib diisi.✕ | LULUS | Tidak diperlukan perbaikan. |
| UI-15 — Tidak ada galat JavaScript/console selama seluruh penelusuran audit | [peramban Chromium (Playwright)] Kumpulkan pageerror & console error di semua halaman yang dibuka (login, menu siswa/guru, 7 lab, asesmen, halaman cetak, admin) | 0 galat (kegagalan pemuatan sumber daya jaringan tidak dihitung) | 0 galat | LULUS | **Diperbaiki (produk):** 0 galat konsol peramban setelah perbaikan `/guru/materi`. |

### Area 9. Keamanan akses & data pengguna

*Tujuan pemeriksaan:* Kata sandi tidak bocor, token/rate limit/logout berlaku, injeksi gagal, pekerjaan siswa tidak bocor antar siswa.  
*Hasil:* **4/4 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-22 — Tidak ada hash/kolom kata sandi yang dikirim ke klien | [API/HTTP] Pindai 6 endpoint utama (auth/me, guru, admin, meta, tugas) mencari password_hash/$2a$ | 0 endpoint membocorkan kata sandi | 0 pembocoran pada 6 endpoint yang dipindai | LULUS | Tidak diperlukan perbaikan. |
| API-23 — Rate limit, token palsu, tanpa token, dan logout berlaku benar | [API/HTTP] 6 percobaan login gagal; token palsu; tanpa token; logout lalu pakai token lama | 5 gagal → 401 & percobaan ke-6 → 429; token palsu/tanpa token → 401; setelah logout → 401 | rate: 401,401,401,401,401,429; token palsu=401; tanpa token=401; logout=200; token lama setelah logout=401 | LULUS | Tidak diperlukan perbaikan. |
| API-24 — Percobaan injeksi SQL tidak berhasil & tidak menimbulkan galat server | [API/HTTP] Login dengan username injeksi; nomor minggu injeksi; id asesmen injeksi | 401/400/404 — tanpa 500 dan tanpa data terleak | login=401, minggu=404, asesmen=404 | LULUS | Tidak diperlukan perbaikan. |
| API-25 — Pekerjaan asesmen hanya dapat dibaca oleh pemiliknya (tidak ada jalur lintas siswa) | [API/HTTP] Siswa membaca GET /api/asesmen/:id/kerja; periksa field & kepemilikan; siswa mencoba endpoint kiriman guru | hanya ada satu pekerjaan (milik sendiri) dan endpoint guru tetap 403 | kunci 'kerja' tunggal=true; endpoint guru=403; daftar siswa uji=6 akun | LULUS | Tidak diperlukan perbaikan. |

### Area 10. Kesesuaian materi dengan sumber buku

*Tujuan pemeriksaan:* Setiap rujukan halaman benar-benar ada dan kata kunci/tema tiap minggu ditemukan pada halaman yang dirujuk.  
*Hasil:* **2/2 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-26 — Setiap rujukan halaman buku pada kurikulum benar-benar ada di berkas sumber | [API/HTTP] Terjemahkan halaman cetak kurikulum → penanda <<<HAL n>>> memakai selisih yang dibuktikan dari kepala halaman buku, lalu periksa tiap halaman dalam rentang | 0 rujukan halaman yang menggantung; selisih halaman terbukti dari isi buku | 35/36 minggu mencantumkan rentang halaman buku; bukti selisih B1=35−23=12 ✓, B2=15−1=14 ✓; halaman menggantung: 0 | LULUS | Tidak ada perubahan produk. Ditemukan bahwa penomoran halaman kurikulum memakai **halaman cetak buku**, sedangkan berkas sumber memakai penanda `<<<HAL n>>>` (halaman PDF). Selisih terbukti dari isi buku sendiri: B1 halaman cetak 23 ↔ penanda 35 (selisih 12), B2 halaman cetak 1 ↔ penanda 15 (selisih 14). Alat ukur audit yang disesuaikan, bukan datanya. |
| API-27 — Kata kunci tiap minggu dapat ditemukan pada halaman buku yang dirujuk | [API/HTTP] Untuk tiap minggu: cocokkan kata kunci materi dengan teks pada rentang halaman cetak yang dirujuk (memakai selisih halaman yang sama) | setiap minggu yang merujuk halaman buku punya dasar teks (≥1 kata kunci) dan rata-rata kecocokan ≥70%; minggu tanpa rujukan buku dilaporkan terpisah | rata-rata kecocokan 90% dari 35 minggu (5 kata kunci/minggu); minggu tanpa dasar teks: 0; minggu <60%: tidak ada; tanpa rujukan halaman buku: m1 (Struktur buku & cara belajar; Minggu orientasi & diagnostik adalah usulan operasional, tidak ada padanan bab di buku) | LULUS | **Diperbaiki (data):** kata kunci 8 minggu diselaraskan dengan kosakata yang benar-benar muncul pada rentang halaman yang dirujuk — m5 (`ergonomi`→`keselamatan dan kesehatan kerja`, `postur`), m9 (`otomasi`/`digitalisasi`→`teknologi`/`internet`), m10 (`efisiensi`→`media`, `produksi`), m13 (`kreatif`→`berpikir kreatif`, `alasan yang jelas`), m14 (`sumber daya kreatif`/`daya saing`→`ekonomi kreatif`, `kreativitas`), m24 (`proyek tipografi`→`tipografi`, `jenis huruf`), m30 (`editing`/`koreksi warna`/`evaluasi foto`→`menyunting`, `warna`, `noise`), m36 (`portofolio`/`presentasi`/`asesmen akhir`→`rangkuman`, `uji kompetensi`, `refleksi`, `pengayaan`). Berkas: `data/kurikulum-sem1.json`, `data/kurikulum-sem2.json`; basis data di-seed ulang. |

### Area 11. Kesesuaian fitur supervisi dengan dokumen sekolah

*Tujuan pemeriksaan:* Indikator, skala, identitas supervisor, dokumentasi 72 pertemuan, serta halaman cetak sesuai dokumen sekolah.  
*Hasil:* **6/6 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-29 — 18 indikator instrumen sama persis dengan dokumen sekolah (tidak ada yang dikarang) | [API/HTTP] Bandingkan /api/supervisi/indikator dengan butir instrumen C.1–C.4 pada docs/01 §4 (dokumen SUP) | aspek C.1(4) C.2(5) C.3(5) C.4(4) = 18 butir identik | 18 indikator: C.1(4) C.2(5) C.3(5) C.4(4); identik=true | LULUS | Tidak diperlukan perbaikan. |
| API-30 — Skala 1–4, identitas supervisor, dan catatan instrumen sesuai dokumen | [API/HTTP] GET /api/supervisi/indikator (skala), GET /api/supervisi/:id (institusi & supervisor), rata-rata aspek C.1 dari 4,3,2,4 | skala 1–4 berlabel; supervisor Saidun, S.Pd., M.M. NIP 197009201994021002; catatan memuat program sekolah; rata C.1 = 3.25 | skala=1/2/3/4; supervisor=Saidun, S.Pd., M.M. (197009201994021002); program sekolah disebut=true; rata C.1=3.25 | LULUS | Tidak diperlukan perbaikan. |
| API-31 — Dokumentasi 72 pertemuan memuat tujuh unsur permintaan sekolah | [API/HTTP] GET /api/supervisi/dokumentasi (72 entri) & detail 3/rabu (tujuan, memahami, mengaplikasi, merefleksi, prinsip, bukti, observasi, refleksi guru, tindak lanjut) | 72 entri; detail memuat 9 kunci; daftar prinsip pembelajaran mendalam tersedia (≥8 pilihan, ditandai manual) | 72 entri · kunci detail: 9/9 · pilihan prinsip=9 (contoh: Mindful & berkesadaran (mindful learning); Pembelajaran bermakna (meaningful learning)) | LULUS | Tidak diperlukan perbaikan. |
| UI-11 — Halaman cetak rekap, dokumentasi, dan supervisi tampil lengkap (kop sekolah, tanda tangan, tombol cetak) | [peramban Chromium (Playwright)] Buka halaman cetak → periksa kop + blok tanda tangan + tombol cetak → tekan tombolnya | setiap halaman memuat kop sekolah & blok tanda tangan; tombol cetak memberi respons (pesan pratinjau bila dialog cetak tidak muncul) | Rekap nilai kelas: kop=true, tanda tangan=true, tombol cetak=true \| Rekap nilai kelas: tombol cetak ditekan → pesan pratinjau=true \| Dokumentasi minggu 2 Senin: kop=true, tanda tangan=true, tombol cetak=true \| Dokumentasi minggu 2 Senin: tombol cetak ditekan → pesan pratinjau=true \| supervisi: halaman=/guru/supervisi/cetak/1; kop=true; isi indikator=true | LULUS | **Diperbaiki (aksesibilitas):** tautan cetak pada baris supervisi hanya berupa ikon sehingga tidak terbaca pembaca layar/pencari teks. Tombol kini berlabel teks **🖨️ Cetak** dengan `aria-label` "Cetak laporan supervisi #n" (`src/supervisi.tsx`). Skrip audit juga diubah agar mencari tautan `/guru/supervisi/cetak/`. |
| UI-12 — Halaman dokumentasi pertemuan terbuka dengan kontrol pengisian | [peramban Chromium (Playwright)] Buka /guru/dokumentasi; hitung entri minggu dan kontrol pilihan di layar | daftar memuat banyak entri minggu dan minimal satu kontrol pilihan (mis. prinsip pembelajaran) tersedia | entri minggu terlihat=38; jumlah kontrol select=1 | LULUS | Tidak diperlukan perbaikan. |
| UI-13 — Admin dapat membuka tab Indikator Supervisi (butir instrumen dokumen sekolah) | [peramban Chromium (Playwright)] Masuk sebagai admin → /admin → klik tab '🪪 Indikator Supervisi' | daftar butir indikator C.1.x–C.4.x tampil sehingga sekolah dapat menyuntingnya | url=/admin; tab terbuka; baris indikator=18; memuat kolom aspek C.1–C.4=true | LULUS | Skrip audit: kode indikator C.x berada di dalam `<input>`, sehingga dihitung lewat jumlah baris tabel (18 baris). Tidak ada perubahan produk. |

### Area P. Pendukung: kualitas teknis (tipe, build, integritas basis data)

*Tujuan pemeriksaan:* Pemeriksaan tambahan agar hasil audit tidak berdiri di atas kode yang tidak dapat dibangun.  
*Hasil:* **2/2 LULUS**.

| Fitur | Langkah uji | Hasil yang diharapkan | Hasil aktual | Status | Perbaikan |
|---|---|---|---|---|---|
| API-32 — Pemeriksaan tipe TypeScript & build produksi | [API/HTTP] npx tsc --noEmit && npm run build | 0 error & build sukses | tsc: 0 error · build: ✓ built in 1.97s | LULUS | Tidak diperlukan perbaikan. |
| API-33 — Integritas basis data & kelengkapan data inti | [API/HTTP] PRAGMA integrity_check; hitung baris weeks/assessments/supervision_indicators/users | integrity_check = ok; 36 minggu; 260 asesmen; 18 indikator; akun demo lengkap | integrity=ok; weeks=36; asesmen=260; indikator=18; pengguna=13 | LULUS | Tidak diperlukan perbaikan. |

## 4. Temuan yang diperbaiki (masalah produk)

| No | Temuan | Bagaimana ditemukan | Perbaikan | Bukti setelah perbaikan |
|---|---|---|---|---|
| T-1 | Halaman **/guru/materi** gagal dirender (React error #31) | Ditemukan saat sapuan seluruh halaman (UI-14): memuat 10 menu guru berhenti di halaman materi guru karena satu nilai bertipe objek dipasang sebagai teks anak pada kartu "Ringkasan unit minggu". | `src/guru.tsx`: ditambahkan helper `teksNilai/teksSumber/teksFormatif/teksProyek` yang mengubah nilai apa pun menjadi teks aman. | Diverifikasi ulang: 26 halaman (siswa 13, guru 12, admin 1) terbuka tanpa galat React, 0 galat konsol (UI-14, UI-15). |
| T-2 | **Pembahasan kuis hilang** setelah halaman asesmen dimuat ulang | Ditemukan pada uji D (UI-04). Rincian benar/salah per butir hanya ada pada respons pengumpulan; GET pekerjaan tidak mengirim `skor_rincian`, sehingga pembahasan hilang begitu halaman di-refresh. | `server/asesmen.js` GET `/api/asesmen/:id/kerja`: objek `kerja` kini menyertakan `skor_rincian` (`JSON.parse`), sejalan dengan pembacaan di `src/asesmen2.tsx`. | Diverifikasi: kuis dikirim lewat antarmuka → skor otomatis 100, pembahasan terbuka, muat ulang tetap menampilkan pembahasan, kiriman kedua ditolak (UI-04); pembacaan ulang dari server juga utuh (API-11). |
| T-3 | **Kata kunci 8 minggu tidak terverifikasi** pada halaman buku yang dirujuk | Ditemukan pada uji kesesuaian materi (API-27): sebagian kata kunci memakai istilah yang tidak muncul di buku (mis. "ergonomi", "digitalisasi", "koreksi warna"), sehingga bahan ajar tidak dapat dilacak ke sumber. | `data/kurikulum-sem1.json` & `kurikulum-sem2.json`: kata kunci minggu 5, 9, 10, 13, 14, 24, 30, 36 diganti dengan kosakata yang benar-benar ada pada rentang halaman yang dirujuk; basis data di-seed ulang. | Diverifikasi ulang: rata-rata kecocokan 90% dari 35 minggu ber-rujukan, 0 minggu di bawah 60%, 0 minggu tanpa dasar teks (API-27). |
| T-6 | Tambah siswa massal dari dalam aplikasi (permintaan sekolah) + 3 cacat yang ikut ketahuan | Permintaan sekolah: data siswa ditambahkan lewat aplikasi, bukan terminal. Dibuat endpoint `POST /api/admin/users/impor` dan panel **Panel Admin → Akun → "Tambah siswa massal"** (tempel dari Excel, pratinjau, unduh CSV kredensial). Saat pengujian, tiga cacat ditemukan: (a) impor yang diulang membuat **akun kembar** karena username dibuat ulang; (b) setelah impor, halaman Admin memasang ulang panel sehingga **daftar yang ditempel & hasil impor hilang**; (c) tombol unduh CSV hilang bila impor berikutnya tidak menambah akun. | (a) baris tanpa username kini dikenali dari **nama + kelas** sehingga diimpor ulang akan **dilewati** (aturan sama di `tools/impor-akun.mjs`); (b) `src/admin.tsx` memakai **penyegaran senyap** (`reload` tidak lagi menampilkan spinner sehingga panel tidak dipasang ulang); (c) daftar akun hasil impor terakhir disimpan di tingkat modul sehingga tetap dapat diunduh. Tambahan: `src/lib.tsx` tidak lagi memanggil `/api/auth/me` bila belum ada token (menghilangkan galat 401 di konsol saat halaman login dibuka). | Uji nyata: `npm run uji:impor` **8/8 LULUS** (pratinjau; 3 akun + kelas baru dibuat; akun hasil impor **berhasil login**; impor ulang → "0 akun dibuat, 3 dilewati"; unduh CSV berisi nama/username/sandi; 0 galat konsol & 0 balasan 4xx/5xx). Uji API ke-41 pada `npm test`: **41/41 LULUS** (impor=200 3 dibuat, siswa=403, daftar kosong=400, sandi pendek=400). Tanpa regresi: audit API 33/33, audit UI 15/15. |
| T-5 | Pembatasan percobaan login dapat dilewati dengan memalsukan header X-Forwarded-For | Ditemukan saat menyiapkan pemasangan daring (`docs/13-panduan-online.md`): header `X-Forwarded-For` selalu dipercaya, sehingga percobaan login gagal dapat dibuat tak terbatas dan IP pada log aktivitas dapat dipalsukan. | `server/index.js`: header itu kini hanya dipercaya bila `DKV_TRUST_PROXY` disetel; ditambah penjaga kedua **15 kegagalan per akun per 15 menit dari IP mana pun**; ditambah `GET /api/health`, header keamanan (`nosniff`, `Referrer-Policy`, `Permissions-Policy`; `X-Frame-Options`/CSP/HSTS hanya saat `DKV_ONLINE=1`), dan variabel `HOST`. | Diverifikasi `npm run uji:online` → **10/10 LULUS** (O2: 401×5 lalu 429 walau header berbeda tiap percobaan; O3: IP log = 127.0.0.1; O6: IP proxy asli tercatat; O7: bind 127.0.0.1; O8: 429 lintas-IP). Tanpa regresi: `npm test` 40/40 + 38/38, audit API 33/33, audit UI 15/15. |
| T-4 | Tombol cetak supervisi hanya ikon (tidak terbaca sebagai teks) | Ditemukan pada uji halaman cetak (UI-11): tautan cetak tidak punya label teks, sehingga sulit ditemukan pengguna pembaca layar dan tidak muncul pada pencarian teks halaman. | `src/supervisi.tsx`: tombol baris menjadi **🖨️ Cetak** dengan `aria-label` "Cetak laporan supervisi #n". | Diverifikasi: halaman cetak supervisi terbuka dengan kop sekolah dan butir indikator terisi (UI-11). |

## 5. Koreksi pada alat ukur audit (bukan masalah produk)

Pada audit pertama, 8 pemeriksaan terbaca GAGAL padahal produknya benar. Penyebabnya ada di skrip audit, bukan di aplikasi. Semuanya diperbaiki dan dijalankan ulang; daftar berikut dicantumkan agar hasil audit tidak memberi kesan lebih baik dari kenyataannya.

| Pemeriksaan | Kekeliruan pengukuran | Perbaikan pada skrip audit |
|---|---|---|
| API-07 | Uji kunci navigasi minggu mengasumsikan menu dalam keadaan terkunci; keadaan awal basis data sudah terbuka sehingga hasilnya terbaca salah. | Uji kini mengunci menu lebih dahulu, lalu membandingkan respons 403 (terkunci) dan 200 (dibuka). |
| API-11 | Uji penyimpanan kuis memakai kuis yang sudah dikerjakan pada uji sebelumnya. | Uji memilih kuis yang belum dikerjakan dan memverifikasi skor serta isi jawaban identik setelah dibaca ulang. |
| API-26/27 | Nomor halaman kurikulum (halaman cetak buku) diperbandingkan langsung dengan penanda halaman PDF pada berkas ekstraksi. | Ditambahkan peta selisih yang dibuktikan dari isi buku (B1 +12, B2 +14) sebelum mencocokkan kata kunci. |
| UI-03 | Tab guru diukur dari jumlah tabel/daftar, bukan dari isi halaman. | Uji mengukur panjang isi `<main>` tiap tab (>600 karakter) sehingga menghitung konten apa pun bentuknya. |
| UI-04/05/06 | Pemilihan kartu asesmen dan baris siswa memakai dugaan minggu (selalu minggu 1/5), padahal halaman menyaring ke minggu aktif. | Uji kini membaca minggu aktif dari kartu lalu memilih baris siswa berstatus terkumpul pada blok yang sama. |
| UI-11 | Uji mencari teks "Cetak", padahal tautan cetak hanya berupa ikon. | Uji mencari tautan `/guru/supervisi/cetak/…`; ditambah perbaikan label (T-4). |
| UI-13 | Uji menghitung kode indikator C.x sebagai teks, padahal kode berada di dalam `<input>`. | Uji menghitung baris tabel indikator (18 baris) dan memastikan kolom aspek C.1–C.4 ada. |

## 6. Batasan pengujian (belum diuji)

- Peramban yang diuji: **Chromium headless 1248** (Playwright). Firefox, Safari, dan Edge belum diuji.
- Responsivitas diuji dengan **emulasi ukuran viewport** (1366×768 dan 390×844) di Chromium, bukan perangkat fisik (Android/iOS).
- `window.print()` tidak diuji sampai keluar kertas/printer. Pada lingkungan pratinjau tersemat, dialog cetak diblokir; yang diverifikasi adalah halaman cetak terender lengkap + pesan cadangan "Ctrl/Cmd + P".
- Belum ada uji beban/banyak pengguna serentak, uji jaringan lambat, maupun uji aksesibilitas formal (WCAG/audit pembaca layar).
- Basis data yang diuji adalah **data demo hasil `npm run seed`** (13 pengguna, 2 kelas), bukan data nyata sekolah.
- Area 10 (kesesuaian materi) diperiksa secara **keterlacakan otomatis** (rujukan halaman + kata kunci), bukan penilaian mutu akademik tiap paragraf oleh guru mata pelajaran.
- Simulasi **Technopreneurship** masih ditandai "pengembangan" di antarmuka — memang belum selesai, dan ditampilkan jujur (UI-09).
- Pemasangan daring (Caddy/Cloudflare Tunnel, HTTPS dari luar jaringan) belum diuji — yang diuji adalah kesiapan aplikasinya: `npm run uji:online` 10/10 LULUS (`docs/13-panduan-online.md` bagian 12).
- Integrasi dengan Google Sites baru diuji memakai halaman penyemat tiruan di Chromium (6/6 LULUS, `npm run uji:bingkai`); halaman Google Sites sungguhan & aplikasi Google Sites di ponsel belum diuji (`docs/14-panduan-google-site.md` bagian 5).
- Minggu 1 (orientasi & asesmen diagnostik) tidak memiliki padanan bab buku; ini keputusan desain yang tercatat di data sumber (ditampilkan pada hasil API-27).

## 7. Tindak lanjut yang disarankan

1. Menyelesaikan simulasi **Technopreneurship** yang masih berstatus "pengembangan".
2. Mengisi **data nyata sekolah** (kelas, peserta didik, guru) menggantikan data demo sebelum dipakai di kelas.
3. Menjalankan `npm run audit:api` + `npm run audit:ui` sebagai pemeriksaan rutin setiap kali aplikasi diubah.
4. Menguji sekali di perangkat nyata (ponsel Android) dan peramban Firefox/Edge sebelum tahun ajaran berjalan.
5. Meninjau ulang kata kunci/kalimat kunci tiap minggu bersama guru mata pelajaran (audit ini menguji keterlacakan ke buku, bukan mutu akademik).

---

*Laporan ini dibangkitkan otomatis dari bukti pengujian: `python3 tools/gen-laporan-audit.py`. Angka pada laporan berasal langsung dari hasil uji, bukan dari perkiraan.*
