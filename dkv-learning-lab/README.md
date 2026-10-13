# DKV LEARNING LAB
Media pembelajaran interaktif **Dasar-Dasar Desain Komunikasi Visual (DD DKV)** · Fase E / Kelas X · **SMK Negeri 3 Kuningan**
36 minggu · 72 rancangan pertemuan (Senin & Rabu @6 JP / 270 menit) · aplikasi berjalan (React + Node.js + SQLite)

---

## Menjalankan aplikasi (3 perintah)

```bash
cd app
npm install
npm run seed      # isi 36 minggu + akun demo (idempoten)
npm run build
npm start         # http://localhost:8080
```

Alat operasional sekolah (lihat `docs/12-panduan-implementasi.md`):

```bash
npm run backup                                 # cadangkan basis data (terverifikasi + rotasi)
npm run impor:akun -- --file data/contoh-impor-akun.csv --kering          # periksa dulu
npm run impor:akun -- --file data/siswa.csv --buat-kelas --sandi-awal dkv2026
```

Akun demo (ganti sebelum dipakai sungguhan): `admin/admin123` · guru `dewi/guru123` (X DKV 1), `saidun/guru123` (X DKV 2) · siswa `aditya/siswa123` (dan 9 siswa lain, lihat `docs/04`).

## Pengujian

```bash
npm run test:api   # 41 uji API — 10 skenario wajib Mode Guru + modul + lab + asesmen + supervisi + hak akses + impor akun → 41/41 LULUS
npm run test:ui    # 38 uji antarmuka nyata (React di jsdom + API aktif)                        → 38/38 LULUS
npm test           # keduanya
```

Hasil nyata, temuan, perbaikan, dan **batas pengujian** (jujur, termasuk yang belum diuji) ada di `docs/05-data-uji-dan-hasil-pengujian.md`.

### Audit menyeluruh (13 Oktober 2026)

```bash
cd app
npm run seed        # reset basis data demo ke keadaan bersih
npm run serve       # bangun + jalankan di http://localhost:8080
# di terminal lain:
npm run audit:api   # 33 pemeriksaan API/data (HTTP nyata)              → 33/33 LULUS
npm run audit:ui    # 15 pemeriksaan antarmuka di Chromium sungguhan    → 15/15 LULUS
npm run audit       # keduanya berurutan
npm run uji:online  # 10 pemeriksaan kesiapan pemasangan di internet → 10/10 LULUS
npm run uji:bingkai # 6 pemeriksaan penyematan di halaman lain (mis. Google Sites) → 6/6 LULUS
npm run uji:impor   # 8 pemeriksaan alur "Tambah siswa massal" di antarmuka       → 8/8 LULUS
```

Audit memeriksa 11 area: kelengkapan 36 minggu & 72 pertemuan, alokasi 12 JP/minggu, navigasi & hak akses,
penyimpanan progres, perhitungan nilai & rubrik, interaksi 7 simulasi, responsivitas desktop & ponsel,
validasi form, keamanan, kesesuaian materi dengan buku sumber, dan kesesuaian fitur supervisi dengan dokumen sekolah.
Hasil lengkap (tabel 6 kolom: fitur · langkah uji · hasil yang diharapkan · hasil aktual · status · perbaikan) ada di
**`docs/11-audit-laporan.md`** beserta bukti mentah `docs/audit-api-hasil.json` dan `docs/audit-ui-hasil.json`.
Perhatian: `npm run audit:ui` mengubah isi basis data demo (mengirim kuis, menilai karya) — jalankan `npm run seed` setelahnya bila ingin data demo rapi.

## Isi berkas

| Berkas | Isi |
|---|---|
| `docs/01-analisis-sumber.md` | Analisis 3 dokumen sumber (buku Sem 1 & Sem 2, Instrumen Supervisi), status CP/ATP, indikator supervisi, tabel pemetaan 36 minggu → buku, 9 catatan penyesuaian, pemetaan 5C |
| `docs/02-arsitektur-dan-skema.md` | Keputusan teknologi + alasan, peta aplikasi & alur 3 peran, skema database, peta API, **aturan akses siswa**, kriteria uji, status roadmap |
| `docs/03-peta-36-minggu.md` | Peta operasional 36 minggu / 72 pertemuan + contoh agenda Senin & Rabu |
| `docs/04-panduan-instalasi-dan-penggunaan.md` | Panduan instalasi, akun demo, alur pemakaian harian guru/siswa/admin, hal yang perlu diverifikasi, pemecahan masalah |
| `docs/05-data-uji-dan-hasil-pengujian.md` | **78 uji** + keluaran nyata, temuan & perbaikan, batas pengujian, cara mengulang |
| `docs/06-matriks-36-minggu.md` (+ `.csv`, `.xlsx`) | **Matriks 36 minggu / 72 pertemuan / 432 JP**: topik Senin–Rabu, sumber & bab buku, tujuan usulan, konsep penting, aktivitas memahami/mengaplikasi/merefleksi, simulasi, asesmen, bukti portofolio + rincian agenda tiap pertemuan (6 JP/270 menit). Dibangkitkan oleh `tools/gen-matriks.py` |
| `docs/12-panduan-implementasi.md` | **Panduan implementasi di sekolah**: pilihan cara pemasangan (laptop guru/LAN/VPS), kebutuhan perangkat, langkah pasang, penyiapan data (identitas–kalender–kelas–impor akun massal), akses dari HP siswa + autostart Windows/systemd, rencana bertahap 4 minggu, pelatihan guru & siswa, operasional rutin, pencadangan & pemulihan, keamanan data siswa, risiko, kriteria keberhasilan, dan daftar yang belum tersedia |
| `docs/13-panduan-online.md` | **Panduan meng-online-kan**: pilihan VPS+Caddy / Cloudflare Tunnel (tanpa membuka port) / platform awan, variabel `DKV_ONLINE`·`DKV_TRUST_PROXY`·`HOST`, langkah pasang + HTTPS, memindahkan data yang sudah berjalan, cadangan keluar server, pemantauan uptime, keamanan & perlindungan data siswa, perkiraan biaya, dan daftar periksa go-live |
| `COBA-CEPAT.md` | Panduan 15 menit: mencoba aplikasi sebagai siswa/guru/admin + memasang di komputer sendiri + masalah umum |
| `docs/15-panduan-windows-online.md` | **Panduan Windows + online + Google Sites (mulai dari nol)**: pasang Node.js, jalankan aplikasi, uji LAN, trycloudflare 5 menit, Cloudflare Tunnel permanen + domain sekolah, sematkan di Google Sites, data sekolah & impor siswa, cadangan harian + autostart Task Scheduler, daftar periksa go-live, keamanan, masalah umum Windows |
| `docs/14-panduan-google-site.md` | **Panduan Google Sites**: penjelasan jujur bahwa Google Sites tidak dapat menjalankan aplikasi Node/SQLite, dua cara integrasi yang diuji (sematkan dalam bingkai / portal + tombol), penyetelan `DKV_FRAME_ANCESTORS`, langkah sematkan & publikasi, batas nyata Google Sites, dan opsi menjalankan di Google Compute Engine |
| `app/tools/uji-impor-ui.mjs` | **Uji alur "Tambah siswa massal"** di antarmuka (8 pemeriksaan peramban): pratinjau, pembuatan akun + kelas, login akun hasil impor, impor ulang dilewati, unduh CSV |
| `app/tools/uji-bingkai.mjs` | **Uji penyematan (iframe)**: menjalankan server + Chromium sungguhan, memeriksa bingkai ber-izin termuat, **login berhasil di dalam bingkai**, sesi tidak bergantung cookie, dan bingkai tanpa izin tetap ditolak — hasil 13 Okt 2026: 6/6 LULUS |
| `app/tools/uji-online.mjs` | **Uji kesiapan daring** (10 pemeriksaan nyata: `/api/health`, pemalsuan `X-Forwarded-For`, header keamanan, bind localhost, penjaga brute force lintas-IP) — hasil 13 Okt 2026: 10/10 LULUS |
| `app/deploy/` | `jalankan-server.bat`/`.sh`, `cadangkan-basisdata.bat`/`.sh`, unit `dkv-learning-lab.service`, dan README (berkas Windows/systemd **belum diuji** di lingkungan pembuatan) |
| `app/tools/backup-db.mjs`, `app/tools/impor-akun.mjs` | **Alat operasional**: pencadangan basis data terverifikasi (integritas + rotasi) dan impor akun guru/siswa massal dari CSV (dry-run, idempoten, laporan hasil) — keduanya sudah diuji |
| `docs/11-audit-laporan.md` (+ `.xlsx`, `.csv`) | **Laporan audit 13 Okt 2026**: 48 pemeriksaan dijalankan nyata (33 API + 15 peramban) dengan **tabel 6 kolom** (fitur · langkah uji · hasil yang diharapkan · hasil aktual · status · perbaikan), rekap per area, 4 temuan produk yang sudah diperbaiki, 7 koreksi alat ukur yang ditulis terbuka, dan 8 batasan pengujian. Dibangkitkan `tools/gen-laporan-audit.py` dari `docs/audit-api-hasil.json` + `docs/audit-ui-hasil.json` |
| `app/tools/audit-api.mjs`, `app/tools/audit-ui.mjs` | Skrip audit: 33 pemeriksaan API/data lewat HTTP dan 15 pemeriksaan antarmuka memakai Playwright (Chromium); menulis bukti JSON ke `docs/` |
| `docs/10-supervisi-dan-dokumentasi.md` | **Supervisi akademik & dokumentasi per pertemuan**: daftar 18 indikator instrumen sekolah (C.1–C.4 · 5C) yang dapat dikonfigurasi Admin, alur pengisian skor 1–4, dokumentasi 72 pertemuan (tujuan, memahami–mengaplikasi–merefleksi, prinsip pembelajaran mendalam, bukti, observasi, refleksi guru, tindak lanjut), tiga laporan siap cetak, daftar ekspor CSV, matriks hak akses, dan batas yang perlu diketahui sekolah |
| `docs/09-asesmen-36-minggu.md` | **Sistem asesmen 36 minggu**: komposisi 260 butir (kuis/LKPD/formatif/praktik/proyek/sumatif), bobot & KKTp usulan, alur siswa & guru, rubrik tiap jenis, aturan yang ditegakkan server (hanya PG yang otomatis, penilaian guru wajib konfirmasi, bobot rubrik harus 100), rumus rekap 3 mode, peta endpoint, dan batas yang perlu diketahui guru |
| `docs/08-laboratorium-simulasi.md` | **7 laboratorium simulasi**: syarat yang dipenuhi tiap lab (input, perubahan terlihat, umpan balik, reset, tantangan bertingkat, refleksi), daftar input & kriteria tiap lab, **tabel apa yang dimodelkan vs bukan** (kamera/perangkat lunak sungguhan), alur pemakaian kelas, dan catatan teknis |
| `docs/07-modul-materi.md` | **Modul materi 72 pertemuan**: ringkasan isi, struktur data, peta 36 minggu (Senin–Rabu, butir kuis, diagram), 20 diagram contoh visual, cara guru menyunting materi, penanda progres, dan batas yang perlu diketahui guru. Dibangkitkan oleh `tools/gen-modul-doc.py` |
| `app/data/modul-sem1.json`, `modul-sem2.json` | **Modul rinci 72 pertemuan** (9 bagian wajib per pertemuan: tujuan, pemantik, materi + istilah, contoh visual, aktivitas 3 tahap, LKPD + rubrik, kuis formatif, tugas, tindak lanjut). Sumber penulisan per bagian: `_modul_part1..6.json`; penggabung & pemvalidasi: `tools/gabung-modul.py` |
| `app/data/diagram-contoh.json` | 20 diagram orisinal (postur kerja, alur kelas, peluang usaha, alur produksi, bitmap vs vektor, prinsip desain, anatomi huruf, hierarki tipografi, spasi, segitiga eksposur, kamera, shot size, komposisi, cahaya, sunting, warna, path, layer, dll.) yang dirender menjadi SVG oleh `app/src/modul.tsx` |
| `app/data/asesmen-36m.json` | **260 butir asesmen 36 minggu** (72 kuis + 72 LKPD + 36 formatif + 36 praktik + 36 proyek + 8 sumatif; 243 butir pilihan ganda lengkap dengan kunci & pembahasan). Dibangkitkan `tools/gen-asesmen.py` |
| `app/data/kurikulum-sem1.json`, `kurikulum-sem2.json` | Data 36 minggu (23 kunci per minggu: tujuan, pemantik, materi inti dari buku, aktivitas, simulasi, LKPD, asesmen, rubrik, remedial/pengayaan, refleksi, catatan supervisi) |
| `app/server/db.js`, `seed.js`, `index.js`, `asesmen.js`, `supervisi.js` | Skema 20 tabel, seed idempoten, seluruh API + penegakan hak akses, **mesin asesmen 36 minggu** (`asesmen.js`), dan **supervisi + dokumentasi per pertemuan** dengan indikator yang dapat dikonfigurasi (`supervisi.js`) |
| `app/src/*.tsx` | Antarmuka: `App.tsx` (router/login/menu), `siswa.tsx`, `pertemuan.tsx` (daftar 72 pertemuan & detail pertemuan), `modul.tsx` (materi lengkap per pertemuan, diagram SVG, kuis formatif, editor materi guru), `labs.tsx` + `labs2.tsx` (kerangka laboratorium & 7 lab simulasi), `sims.tsx` (daftar & rute laboratorium), `asesmen.tsx`, `asesmen2.tsx` + `guru-asesmen.tsx`, `supervisi.tsx` (instrumen dapat dikonfigurasi + riwayat + ekspor), `dokumentasi.tsx` (72 pertemuan), `cetak.tsx` (3 laporan siap cetak), `guru.tsx`, `admin.tsx`, `lib.tsx` |
| `app/server/test-api.js`, `app/tools/ui-smoke.mjs` | Berkas uji API dan uji antarmuka |
| `tools/gen-matriks.py` | Pembangkit matriks 36 minggu (Markdown + CSV + XLSX) dari data kurikulum |
| `sumber/` | Buku Sem 1, buku Sem 2, dan hasil ekstraksi teksnya (`<<<HAL n>>>` per halaman) |

## Fitur yang sudah berjalan (teruji)

- **Mode Guru** — login terpisah, bcrypt, sesi 12 jam, pembatasan 5 percobaan gagal/15 menit, logout, ganti password; **Kontrol Pembelajaran** per kelas + pertemuan: 9 sakelar menu, Aktifkan/Kunci Semua dengan konfirmasi, kunci navigasi, izin simulasi; **Mulai Pembelajaran** (mulai/jeda/lanjut/akhiri) yang tersinkron ke perangkat siswa lewat polling ±5 detik beserta indikator koneksi; penguncian tidak menghapus jawaban/nilai/karya.
- **Siswa** — dashboard status & progres, 36 kartu materi (terkunci/buka dari server), **daftar 72 pertemuan + halaman detail pertemuan** (agenda bertahap 6 JP/270 menit, aktivitas, LKPD, simulasi, refleksi, tanda selesai, navigasi antarpertemuan), **halaman Asesmen & Penilaian** (diagnostik/formatif/sumatif/proyek/refleksi + ringkasan nilai), LKPD & kuis (auto-skor objektif), portofolio + umpan balik guru, pesan “Menu ini belum dibuka oleh guru”, **penanda Data demo** pada halaman berisi data contoh.
- **Modul materi 72 pertemuan** — setiap pertemuan menampilkan tujuan, pertanyaan pemantik, materi (pengantar, 4 poin, tabel istilah), **contoh visual** (diagram SVG orisinal + kartu rujukan buku), aktivitas memahami–mengaplikasi–merefleksi, LKPD beserta langkah & rubrik 4 tingkat, **kuis formatif yang dinilai di server (satu jawaban salah terbukti mengurangi skor)**, tugas, serta remedial & pengayaan; **navigasi antarpertemuan** (← sebelumnya / berikutnya →) dan **penanda progres per pertemuan** (Senin/Rabu) yang menjadikan status minggu “selesai” hanya setelah keduanya ditandai; **guru dapat menyunting materi pertemuan** dari antarmuka (tersimpan ke server, tercatat pada log `sunting_modul`).
- **Laboratorium simulasi (7 lab berfungsi)** — setiap lab menerima input, menampilkan perubahan yang terlihat, memberi umpan balik beralasan, menyediakan **tombol reset**, **tantangan bertingkat (3 tingkat)**, **kumpulkan hasil ke server**, dan **refleksi**: ① Tipografi (huruf, ukuran, perataan, leading, kerning, tracking, hierarki, kontras), ② Fotografi (aperture–shutter–ISO: kecerahan, blur gerakan, kedalaman ruang, noise), ③ Bitmap & Vektor (perbesaran 100–1600%, mutu, kebutuhan piksel, pemilihan format), ④ Alur Produksi (susun tahapan untuk 3 brief), ⑤ K3 & Ergonomi (temukan risiko, atur postur dengan pratinjau gambar kerja, pilih tindakan aman), ⑥ Sketsa & Ilustrasi (kata kunci → gaya & moodboard → evaluasi konsep dengan rubrik), ⑦ Studio DKV (brief → riset → konsep → desain → uji & revisi → presentasi). Setiap lab berlabel **“model simulasi”** dengan penjelasan batas (bukan kamera/perangkat lunak desain sungguhan); hasil yang dikumpulkan siswa terbaca guru di **Penilaian → 🧪 Hasil laboratorium**.
- **Asesmen 36 minggu (260 butir)** — siswa: `/asesmen/rencana` (filters minggu & jenis, bobot, KKTp, status, kesempatan revisi), pengerjaan kuis **dinilai otomatis di server dengan pembahasan per butir setelah dikirim**, pekerjaan LKPD/formatif/praktik/proyek memakai uraian + tautan bukti karya dengan tabel rubrik, serta pengiriman revisi; `/asesmen/rekap` menampilkan nilai per minggu, per jenis, dan catatan guru. Guru: `/guru/asesmen` untuk menyunting bobot, KKTp, kesempatan revisi, kriteria rubrik, dan butir/kunci/pembahasan; penilaian rubrik 1–4 (otomatis dikonversi 0–100) **wajib dikonfirmasi guru**, tombol minta revisi & **buka ulang untuk remedial**; `/guru/rekap-asesmen` (3 mode + ekspor CSV) dan `/guru/remedial` (daftar di bawah KKTp + kandidat pengayaan). Aturan penting: **hanya pilihan ganda yang dinilai otomatis**, skor kiriman siswa diabaikan, dan total bobot kriteria rubrik wajib 100 (semuanya diuji di API & antarmuka).
- **Supervisi akademik & dokumentasi pertemuan** — panel **Supervisi Akademik** memuat **18 indikator instrumen sekolah apa adanya** (C.1 Perencanaan, C.2 Pelaksanaan, C.3 5C, C.4 Asesmen & Refleksi) dengan **skor 1–4 per indikator**, rata-rata per aspek, catatan supervisor, rekomendasi bagi guru/murid/sekolah, tindak lanjut, serta riwayat yang dapat dicetak/diekspor CSV; **Admin dapat mengonfigurasi indikator** (kode, nama, deskriptor, urutan, aktif/nonaktif, tambah, muat ulang dari dokumen) dan indikator buatan sendiri ditandai “ditambahkan sekolah”. Panel **Dokumentasi Pertemuan** menyediakan **72 pertemuan** dengan tujuan, aktivitas **memahami–mengaplikasi–merefleksi**, **penerapan prinsip pembelajaran mendalam sesuai instrumen**, bukti aktivitas, catatan observasi, refleksi guru, dan tindak lanjut (isian usulan otomatis dari modul, ditandai sebelum disimpan guru). Tiga **laporan siap cetak** (A4 + kop sekolah + tanda tangan supervisor): laporan supervisi per catatan, dokumentasi per pertemuan, dan rekap nilai kelas.
- **Guru lain** — sunting materi/tujuan/pemantik, kelola tugas, penilaian + umpan balik, rekap + Ekspor CSV, instrumen supervisi C.1–C.4 (skor 1–4, rekomendasi, riwayat).
- **Admin** — akun (buat satu per satu, **tambah siswa massal dengan menempel daftar dari Excel + unduh CSV kredensial**, nonaktifkan, reset password), kelas, tahun ajaran, hari & JP & durasi JP, minggu efektif, kalender libur/asesmen, identitas sekolah, pengumuman awal, log aktivitas.
- **Keamanan** — otorisasi diperiksa di server untuk setiap endpoint (siswa → 403), akses masuk API tanpa token 401, seluruh aksi penting tercatat di log aktivitas.

## Yang belum selesai (ditandai jujur)

1. **Contoh visual dan kuis formatif di dalam modul pertemuan belum dapat disunting dari antarmuka guru** — keduanya masih perlu diubah melalui berkas data (`app/data/modul-sem*.json`) oleh pengembang bersama operator; bagian modul lain (tujuan, pemantik, materi, aktivitas, LKPD, rubrik, tugas, tindak lanjut) sudah dapat disunting guru, dan **butir kuis sistem asesmen 36 minggu sudah dapat disunting guru** dari `/guru/asesmen` (kunci & pembahasan wajib dikonfirmasi).
2. **1 simulasi masih “dalam pengembangan”** dan diberi label demikian di antarmuka: **Technopreneurship DKV** (K3 & ergonomi, sketsa & ilustrasi, dan studio proyek DKV sudah berfungsi sejak 13 Okt 2026).
3. **Peramban sungguhan: baru Chromium (headless) yang diuji** — audit 13 Okt 2026 menjalankan 15 pemeriksaan pada Chromium sungguhan (desktop 1366×768 & emulasi ponsel 390×844, 0 galat konsol). **Firefox, Edge, Safari, dan perangkat fisik belum diuji**; verifikasi visual oleh guru tetap diperlukan.
4. **Kalender pendidikan sekolah belum tersedia** — data kalender di aplikasi adalah contoh usulan yang wajib diverifikasi.
5. **Belum ada unggahan berkas gambar besar** pada portofolio (baru judul, deskripsi, tahap, tautan/data JSON).
5. **Belum ada pemulihan password mandiri** (lupa password ditangani Admin).
6. **Tanda tangan laporan masih manual** (belum tanda tangan elektronik) dan verifikasi hasil cetak di peramban sungguhan (Chrome/Edge, A4) masih perlu dilakukan guru/admin; bukti aktivitas dokumentasi juga masih berupa teks/tautan (belum unggah gambar).
7. **Belum diuji beban** (mis. 36 siswa mengirim jawaban serentak) dan belum ada pencadangan otomatis basis data.
