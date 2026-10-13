# 04 — Panduan Instalasi & Penggunaan
**DKV Learning Lab** · Dasar-Dasar Desain Komunikasi Visual · Fase E / Kelas X · SMK Negeri 3 Kuningan
Versi dokumen: 1.0 (13 Oktober 2026) · Status: **sudah diuji jalan** (lihat `05-data-uji-dan-hasil-pengujian.md`)

---

## 1. Kebutuhan sistem

| Komponen | Kebutuhan minimum | Catatan |
|---|---|---|
| Node.js | 20 LTS (diuji pada v20.20.2) | `node -v` |
| npm | 10.x | `npm -v` |
| Basis data | SQLite (bawaan, file `app/data/dkv.db`) | tanpa server DB terpisah |
| Peramban | Chrome/Edge/Firefox/Safari versi 2 tahun terakhir | responsif: desktop, tablet, ponsel |
| Ruang disk | ± 250 MB (termasuk `node_modules`) | |

Tidak diperlukan MySQL/PostgreSQL untuk menjalankan versi ini. Alasan pemilihan SQLite + rencana migrasi ke MySQL/PostgreSQL bila sekolah memerlukannya ada di `02-arsitektur-dan-skema.md`.

## 2. Instalasi (5 langkah)

```bash
# 1. masuk ke folder aplikasi
cd dkv-learning-lab/app

# 2. pasang dependensi
npm install

# 3. isi basis data + 36 minggu kurikulum + akun demo (idempoten)
npm run seed

# 4. build antarmuka (React → dist/)
npm run build

# 5. jalankan server (API + antarmuka) di port 8080
npm start        # = node server/index.js
```

Buka `http://localhost:8080`. Port dapat diganti: `PORT=3000 npm start`.

Perintah lain yang tersedia:

| Perintah | Kegunaan |
|---|---|
| `npm run dev:server` | jalankan API saja (8080) |
| `npm run dev:client` | Vite dev server untuk pengembangan antarmuka (proxy `/api` → 8080) |
| `npm run serve` | build ulang lalu jalankan server |
| `npm run seed` | **reset** seluruh data demo dan isi ulang 36 minggu (menghapus data uji) |
| `npm run test:api` | 40 uji API (10 skenario Mode Guru + modul materi + lab simulasi + mesin asesmen + supervisi/dokumentasi + hak akses) |
| `npm run test:ui` | 38 uji antarmuka nyata (React di jsdom + API aktif) |
| `npm test` | menjalankan keduanya |

> `npm run seed` **menghapus** data (termasuk jawaban/nilai siswa). Jalankan hanya saat menyiapkan demo baru. Sebelum tahun ajaran berjalan, buat salinan berkas `app/data/dkv.db`.

## 3. Akun demo (WAJIB diganti sebelum dipakai sungguhan)

| Peran | Username | Password | Kelas |
|---|---|---|---|
| Admin | `admin` | `admin123` | — |
| Guru (wali X DKV 1) | `dewi` | `guru123` | X DKV 1 |
| Guru (wali X DKV 2, sekaligus nama supervisor) | `saidun` | `guru123` | X DKV 2 |
| Siswa (6) | `aditya`, `bella`, `citra`, `dimas`, `elina`, `fajar` | `siswa123` | X DKV 1 |
| Siswa (4) | `gita`, `hafiz`, `intan`, `jejen` | `siswa123` | X DKV 2 |

Password disimpan sebagai **hash bcrypt** (tidak ada teks biasa dan tidak ada password statis di berkas frontend). Ganti dengan: login → **Akun → Ganti password** (semua peran), atau Admin → tab **Akun → Reset password**.

## 4. Alur penggunaan harian

### 4.1 Guru — menyiapkan pembelajaran (5 menit sebelum bel)
1. Login dengan akun guru (tab **Guru** pada halaman login).
2. Buka **Kontrol Pembelajaran** → pilih **kelas** dan **pertemuan** (Senin/Rabu).
3. Atur **sakelar menu** siswa: dashboard, materi, pertemuan aktif, simulasi, LKPD, kuis, portofolio, referensi, navigasi. Tombol **Aktifkan Semua** / **Kunci Semua** meminta konfirmasi lebih dahulu.
4. Isi **Mulai Pembelajaran**: pilih minggu (1–36) dan pertemuan → **▶ Mulai Pembelajaran**. Siswa melihat status *berlangsung* dalam ±5 detik.
5. Butuh menghentikan sejenak? **⏸ Jeda** → siswa melihat “Pembelajaran dijeda”. **⏵ Lanjutkan** untuk kembali. **⏹ Akhiri** menyimpan progres siswa dan menutup sesi.
6. Bagian **Jadwal, jam pelajaran & kalender** memungkinkan guru mengubah hari pembelajaran, jumlah JP, durasi JP, minggu efektif, dan kalender **tanpa menyunting kode**.

### 4.2 Guru — selama pembelajaran
- **Materi & Rancangan Minggu**: menyunting tema, tujuan, pemantik, kata kunci; perubahan langsung terlihat siswa.
- **Materi rinci per pertemuan**: buka **Pertemuan → pilih minggu & hari → Mode Guru — sunting materi pertemuan ini → Sunting materi**. Yang dapat disunting: tujuan, pertanyaan pemantik, pengantar materi, 4 poin materi, daftar istilah, tiga jenis aktivitas, judul & langkah LKPD, rubrik penilaian (format `kriteria | skor4 | skor3 | skor2 | skor1`), judul/bentuk/luaran tugas, serta remedial & pengayaan. **Simpan materi** menulis langsung ke server (`sunting_modul` tercatat di log). Butir kuis dan contoh visual belum dapat disunting dari antarmuka.
- **Memantau kuis formatif pertemuan**: hasil kuis tiap pertemuan tersimpan pada tabel `quiz_attempts` (skor, total, waktu) dan terbaca pada menu Penilaian/Rekap; mengunci menu **Kuis** menahan jawaban baru tanpa menghapus nilai lama.
- **Penilaian & Tugas**: menilai kiriman (skor 0–100 + umpan balik), membuat/menutup tugas & kuis, memberi umpan balik karya portofolio, membaca refleksi siswa.
- **Hasil laboratorium simulasi**: tab **Penilaian → 🧪 Hasil laboratorium** menampilkan capaian tiap siswa (lab, tingkat, skor kriteria, waktu). Nilai capaian dipakai sebagai bukti proses belajar — bukan pengganti nilai karya.
- **Dokumentasi Supervisi**: mengisi instrumen (aspek C.1 Perencanaan, C.2 Pelaksanaan, C.3 Penerapan 5C, C.4 Asesmen & Refleksi; skor 1–4), catatan, dan rekomendasi bagi guru/murid/sekolah.
- **Rekap Nilai**: ringkasan per siswa (LKPD terkumpul, rata-rata nilai, karya portofolio, minggu selesai) + unduh **CSV**.

### 4.3 Siswa
- **Dashboard**: status pembelajaran (belum dimulai / berlangsung / dijeda / selesai), minggu berjalan, progres, pengumuman guru, daftar tugas yang belum selesai.
- **Pertemuan (72)**: daftar 72 pertemuan (Senin & Rabu, masing-masing 6 JP/270 menit) + kartu “Pertemuan aktif saat ini”, dengan **penanda progres per pertemuan** (tanda ✓ pada Senin/Rabu yang sudah ditandai siswa). Membuka satu pertemuan menampilkan **agenda bertahap dengan menit**, tujuan, tiga jenis aktivitas, LKPD, simulasi terkait, asesmen, kriteria keberhasilan, **refleksi cepat**, tombol **tandai selesai**, dan navigasi pertemuan sebelumnya/berikutnya. Di bawah agenda tersaji **modul materi lengkap pertemuan itu** (tujuan, pemantik, materi + tabel istilah, **contoh visual berupa diagram SVG orisinal** dan rujukan halaman buku, aktivitas tiga tahap, LKPD + langkah + rubrik, kuis formatif yang dinilai server, tugas, remedial/pengayaan). Kuis dapat langsung dijawab di halaman ini; nilai muncul setelah dikirim (mis. “Nilai tersimpan: 2/2”) dan riwayat percobaan tersimpan. Menu yang dikunci guru tampil bergembok dan halaman menjelaskan alasannya (bukan tombol mati).
- **Asesmen & Penilaian**: enam kategori (diagnostik, formatif, sumatif/uji kompetensi, proyek & praktik, refleksi) untuk 36 minggu, ringkasan rata-rata kuis otomatis, jumlah LKPD terkumpul, riwayat refleksi, serta penjelasan cara penilaian. Tombol mengarah ke halaman yang benar: kuis → LKPD & Tugas, karya → Portofolio, praktik → detail pertemuan.
- **Materi Pembelajaran**: 36 kartu minggu; yang belum dibuka guru menampilkan “Menu ini belum dibuka oleh guru” (akses ditolak oleh server, bukan sekadar disembunyikan).
- **Laboratorium Simulasi**: **7 lab berfungsi penuh** — tipografi, fotografi (segitiga eksposur), bitmap vs vektor, alur produksi, K3 & ergonomi, sketsa & ilustrasi, studio DKV. Tiap lab punya petunjuk, tantangan bertingkat (3 tingkat), umpan balik, tombol **Atur ulang**, tombol **Kumpulkan hasil**, dan kolom **refleksi**; semuanya berlabel **model simulasi** (bukan kamera/perangkat lunak desain sungguhan). Satu simulasi, **Technopreneurship DKV**, masih ditandai jujur **dalam pengembangan**. Panduan lengkap: `08-laboratorium-simulasi.md`.
- **LKPD & Asesmen**: mengerjakan LKPD/kuis; kuis objektif dinilai otomatis di server, jawaban terbuka dinilai guru.
- **Portofolio Digital**: mengunggah karya (judul, deskripsi, tahap: konsep/desain final, tautan atau berkas), menerima umpan balik guru.

### 4.4 Guru — menilai asesmen 36 minggu (LKPD, kuis, formatif, praktik, proyek, sumatif)

1. Buka **Asesmen 36 Minggu** (`/guru/asesmen`). Pilih minggu, lalu klik kartu asesmen.
2. Tab **📋 Rencana & rubrik** untuk memeriksa bobot, KKTp, kesempatan revisi, kriteria rubrik, dan butir kuis. Semua dapat disunting: bobot total kriteria rubrik **harus 100**, dan menyimpan perubahan butir/kunci/pembahasan wajib mencentang pernyataan konfirmasi.
3. Setelah siswa mengumpulkan pekerjaan, buka tab **✅ Penilaian rubrik**: pilih skor 1–4 untuk setiap kriteria (server mengubahnya menjadi nilai 0–100), tulis komentar, centang **konfirmasi**, lalu **Simpan nilai**. Gunakan **Minta revisi** bila pekerjaan perlu diperbaiki, atau **Buka ulang (remedial)** bila siswa harus mengerjakan ulang setelah kesempatan revisi habis (nilai lama tercatat di log).
4. Pantau tab **📊 Rekap hasil belajar** (per peserta didik / per minggu / per jenis asesmen) dan unduh CSV bila perlu dilampirkan ke wali kelas. Tab **🩹 Remedial & pengayaan** menampilkan siapa yang di bawah KKTp — tiap asesmen sudah memuat langkah remedial dan pengayaan yang disarankan.
5. Kuis dan bagian pilihan ganda sumatif dinilai **otomatis di server** (pembahasan terbuka untuk siswa setelah dikirim). **Karya, proses, dan uraian tidak pernah dinilai otomatis** — itu keputusan guru.

Kunci menu tetap berlaku: bila menu **Kuis/Asesmen** atau **LKPD/Tugas** ditutup, siswa tidak dapat mengirim pekerjaan baru (jawaban & nilai lama tidak dihapus).

### 4.5 Guru/Admin — supervisi akademik & dokumentasi per pertemuan

1. **🪪 Supervisi Akademik**: pilih kelas, guru yang disupervisi, minggu, dan tanggal → beri **skor 1–4 untuk setiap indikator** instrumen (C.1–C.4, termasuk 5C). Rata-rata per aspek dihitung otomatis. Isi catatan supervisor, rekomendasi (guru/murid/sekolah), dan tindak lanjut, lalu **Simpan draft** atau **Simpan final**.
2. Klik **🖨️** pada baris riwayat untuk membuka **laporan siap cetak** (A4, kop sekolah, kolom tanda tangan supervisor) — gunakan tombol *Cetak / Simpan PDF*, atau Ctrl/Cmd + P bila dialog cetak diblokir pratinjau. Tombol **Ekspor CSV** menghasilkan rekap dengan satu kolom per indikator + rata per aspek.
3. **Admin** dapat menyesuaikan indikator pada **Panel Admin → 🪪 Indikator Supervisi**: ubah kode/nama/deskriptor/urutan, nonaktifkan, tambah (ditandai “ditambahkan sekolah”), atau **Muat ulang dari instrumen** untuk kembali ke daftar asli dokumen. Guru tidak dapat mengubah indikator.
4. **📄 Dokumentasi Pertemuan**: pilih minggu/pertemuan → periksa isian usulan dari modul, lengkapi **tujuan, aktivitas memahami–mengaplikasi–merefleksi, prinsip pembelajaran mendalam (dicentiang sesuai yang benar-benar diterapkan), bukti aktivitas, catatan observasi, refleksi guru, dan tindak lanjut** → **Simpan draf/final**, cetak, atau ekspor CSV.
5. **🖨️ Rekap siap cetak** tersedia pada halaman *Rekap Penilaian* (kolom per jenis asesmen, nilai akhir berbobot, ketuntasan, tanda tangan).

### 4.6 Admin
Tab **Akun** (buat/nonaktifkan/reset password), **Kelas**, **Pengaturan & Kalender** (hari, JP, durasi JP, pekan berjalan, tahun ajaran, minggu efektif, kalender libur/asesmen, identitas sekolah, pengumuman awal), **Log Aktivitas** (pengguna, waktu, aksi, objek, IP).

## 5. Hal yang perlu diverifikasi guru sebelum dipakai resmi

1. **Kalender pendidikan** — data awal adalah contoh usulan; sunting di Admin → Pengaturan & Kalender sesuai kalender resmi sekolah.
2. **Rumusan Capaian Pembelajaran** — buku tidak memuat CP rinci; seluruh rumusan CP/ATP di aplikasi ditandai “usulan yang perlu diverifikasi guru”.
3. **Peta 36 minggu ↔ buku** — rancangan operasional, bukan ATP resmi; 9 catatan penyesuaian ada di `01-analisis-sumber.md`.
4. **Lisensi perangkat lunak** — materi menyebut CorelDRAW/Adobe; untuk praktik sekolah gunakan alternatif bebas (Inkscape, GIMP) sesuai catatan verifikasi minggu 8, 24, 29, 32, 33.
5. **Modul materi 72 pertemuan** — penjelasan bersifat parafrase orisinal; nomor halaman/subbab yang dirujuk adalah usulan, dan **20 diagram contoh visual digambar ulang oleh pengembang** sehingga perlu diperiksa guru sebelum dipakai resmi (ringkasan & peta per minggu: `07-modul-materi.md`).
6. **Nama & tanda tangan supervisor** pada instrumen cetak tetap mengikuti dokumen asli (Saidun, S.Pd., M.M.).
7. **Hasil audit 13 Oktober 2026** — 48 pemeriksaan (API + peramban Chromium) LULUS, 4 masalah produk sudah diperbaiki selama audit. Yang **belum** dicakup: peramban Firefox/Edge/Safari, perangkat ponsel fisik, uji beban banyak pengguna serentak, dan penilaian mutu akademik materi oleh guru (audit hanya memeriksa keterlacakan rujukan halaman & kata kunci ke buku). Rincian: `11-audit-laporan.md` bagian 6.

## 6. Menjalankan audit aplikasi (pemeriksaan menyeluruh)

Audit dipakai untuk memastikan aplikasi benar-benar berjalan, bukan hanya terlihat berjalan. Audit yang
dilaporkan pada 13 Oktober 2026: **33/33 pemeriksaan API/data LULUS** dan **15/15 pemeriksaan antarmuka
LULUS** — seluruhnya dijalankan nyata (permintaan HTTP ke aplikasi yang berjalan dan klik nyata di peramban
Chromium). Laporan lengkap: `docs/11-audit-laporan.md` (tabel 6 kolom) serta bukti mentah
`docs/audit-api-hasil.json` dan `docs/audit-ui-hasil.json`.

```bash
# 1. siapkan data bersih lalu jalankan aplikasi
cd app
npm run seed            # reset basis data demo (menghapus data uji sebelumnya)
npm run serve           # bangun antarmuka + jalankan di http://localhost:8080

# 2. di terminal lain — jalankan audit
npm run audit:api       # 33 pemeriksaan API/data (butuh server berjalan)
npm run audit:ui        # 15 pemeriksaan peramban (butuh Chromium Playwright)
npm run audit           # jalankan keduanya berurutan
```

Catatan penting:

- `npm run audit:ui` memakai **Playwright/Chromium**. Bila belum terpasang: `npm i -D playwright && npx playwright install chromium`.
- Audit **mengubah isi basis data demo** (mengirim kuis, mengumpulkan karya, menilai, membuka revisi). Jalankan
  `npm run seed` sebelum dan sesudah audit bila ingin data demo tetap rapi.
- Audit berhenti dengan kode keluar **1** bila ada pemeriksaan yang GAGAL, sehingga dapat dipakai sebagai
  pemeriksaan rutin sebelum aplikasi dipakai di kelas.
- Membangkitkan ulang laporan dari bukti mentah: `python3 tools/gen-laporan-audit.py` (dari akar proyek).

## 7. Pemecahan masalah

**Materi pertemuan tampil kosong / “Modul rinci belum tersedia”.** Berarti basis data belum memuat modul. Jalankan `python3 tools/gabung-modul.py` (dari akar proyek) untuk memeriksa & menggabungkan bagian, lalu di folder `app`: `npm run seed`. Periksa juga bahwa `app/data/modul-sem1.json` dan `modul-sem2.json` ada.

**Guru sudah menyimpan materi tetapi siswa belum melihat perubahan.** Muat ulang halaman pertemuan siswa (data diambil saat halaman dibuka). Bila tetap sama, periksa log aktivitas Admin: aksi `sunting_modul` harus tercatat untuk minggu/pertemuan tersebut.

| Gejala | Sebab & tindakan |
|---|---|
| `EADDRINUSE: address already in use 0.0.0.0:8080` | Server lain masih jalan. Hentikan proses lama atau jalankan `PORT=8081 npm start`. |
| Halaman putih setelah pembaruan kode | `npm run build` belum dijalankan, atau muat ulang dengan Ctrl+Shift+R. |
| “Terlalu banyak percobaan gagal” | Pengaman login: 5 kali gagal per username+IP → terkunci 15 menit (tunggu, atau hapus baris di tabel `login_attempts`). |
| Siswa melihat “Menu ini belum dibuka oleh guru” | Guru belum membuka menu tersebut untuk kelas+pertemuan aktif. Buka di Kontrol Pembelajaran. |
| Penanda “Data demo” pada halaman | Menandai bahwa isi halaman berasal dari data contoh (seed). Setelah guru/siswa mengisi data nyata, penanda ini dapat dihapus/diubah pada komponen `DataDemo` di `src/lib.tsx`. |
| Status siswa tidak berubah | Pastikan kelas & pertemuan pada kontrol sesuai kelas siswa; indikator “Terhubung ke kontrol guru” harus hijau (sinkron tiap ±5 detik). |
| Data demo perlu diulang | `npm run seed` (menghapus seluruh data). |
