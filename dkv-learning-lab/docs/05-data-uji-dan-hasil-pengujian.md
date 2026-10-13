> **Catatan 13 Oktober 2026 — audit menyeluruh.** Dokumen ini memuat uji fungsional pembangunan (78 uji: 40 API + 38 antarmuka jsdom; kini **41 API** setelah ditambah uji impor akun massal).
> Setelahnya dijalankan **audit menyeluruh**: 33 pemeriksaan API/data + 15 pemeriksaan pada **peramban Chromium sungguhan**
> (48 pemeriksaan, seluruhnya LULUS) beserta 4 perbaikan produk. Laporan tabel 6 kolom ada di **`11-audit-laporan.md`**,
> bukti mentah di `audit-api-hasil.json` dan `audit-ui-hasil.json`. Bila kedua dokumen berbeda angka, **audit yang lebih baru** yang berlaku.

# 05 — Data Uji & Hasil Pengujian
Tanggal pengujian: **13 Oktober 2026** · Lingkungan: Node.js v20.20.2, npm 10.8.2, SQLite (better-sqlite3); uji antarmuka **dokumen ini** memakai jsdom (saat uji ini dijalankan Chromium belum terpasang — kini tersedia, lihat catatan audit di atas).
Berkas uji: `app/server/test-api.js` (40 uji) dan `app/tools/ui-smoke.mjs` (38 uji) · Perintah: `npm run test:api`, `npm run test:ui`, `npm test`.

**Hasil ringkas: 78/78 uji LULUS** (40 uji API + 38 uji antarmuka). Semua keluaran di bawah adalah keluaran nyata dari terminal, bukan perkiraan.

> **Pembaruan 13 Okt 2026 (prototipe antarmuka tahap 6b).** Ditambahkan halaman **Daftar Pertemuan (72)** dan **Detail Pertemuan** (`/pertemuan`, `/pertemuan/:minggu/:hari`) serta **Asesmen & Penilaian** (`/asesmen`), penanda **Data demo** pada halaman yang memuat data contoh, dan penegakan server untuk menu *pertemuan*, *portofolio*, dan *refleksi*. Uji bertambah menjadi **15 API + 14 antarmuka = 29 uji, semuanya LULUS**:

---

## 1. Skenario wajib Mode Guru (10 skenario) — diuji lewat HTTP nyata

| # | Skenario | Cara uji | Hasil nyata | Status |
|---|---|---|---|---|
| 1 | Login guru dengan kredensial benar | `POST /api/auth/login {dewi, guru123, guru}` | HTTP 200, peran `guru`, token diterbitkan | ✅ |
| 2 | Login guru dengan password salah ditolak | `POST /api/auth/login {dewi, salahbanget}` | HTTP 401 — “Username atau password salah.” | ✅ |
| 3 | Siswa tidak bisa mengakses Mode Guru | `GET /api/guru/kontrol`, `POST /api/guru/kontrol`, `GET /api/guru/submissions` dengan token siswa | HTTP 403 untuk ketiganya | ✅ |
| 4 | Menu yang dinonaktifkan tidak bisa diakses siswa | Guru kunci menu `materi` (kelas X DKV 1, pertemuan Senin) → siswa membuka minggu aktif 2 dan minggu 1 | HTTP 403 — “Menu Materi belum dibuka oleh guru.” (dua-duanya 403) | ✅ |
| 5 | Bypass URL / endpoint terlarang diblokir | Siswa memanggil `GET /api/kurikulum/5`, `POST /api/guru/sesi`, `PUT /api/admin/settings`, `PUT /api/kurikulum/3` | HTTP 403 seluruhnya | ✅ |
| 6 | Menu diaktifkan kembali → akses pulih | Guru buka `materi` → siswa membuka minggu 2 | HTTP 200, memuat “Technopreneurship dalam Bidang DKV” | ✅ |
| 7 | Perubahan kontrol tersinkron ke perangkat siswa | Kunci `simulasi` → baca `GET /api/siswa/status` → buka lagi → baca ulang | `simulasi: true → false → true` | ✅ |
| 8 | Pengaturan berlaku per kelas (tidak bocor) | Kunci `portofolio` untuk X DKV 1 → baca status siswa X DKV 1 dan X DKV 2 | kelas 1 = `false`, kelas 2 = `true` | ✅ |
| 9 | Penguncian TIDAK menghapus jawaban/nilai siswa | Siswa mengirim jawaban → guru kunci menu `lkpd` → siswa mencoba mengirim lagi → guru buka lagi | kirim pertama HTTP 200; saat terkunci HTTP 403 (“Menu LKPD sedang ditutup oleh guru. Jawaban tersimpan tidak terhapus…”); jawaban lama **masih ada** dan berstatus `submitted` | ✅ |
| 10 | Jeda / lanjut / akhiri pembelajaran berfungsi | Guru `mulai → jeda → lanjut → akhiri`; siswa membaca `GET /api/siswa/status` tiap tahap | siswa melihat `running → paused → running → ended` pada minggu 2, pertemuan Senin | ✅ |
| 11 | Logout mengakhiri sesi | `POST /api/auth/logout` lalu pakai ulang token lama | logout 200; token lama → HTTP 401; login baru berhasil 200 | ✅ |

> Penomoran di tabel ini 1–11 karena skenario “siswa diblokir” dan “bypass URL” diuji terpisah; **10 skenario wajib dari spesifikasi semuanya tercakup dan lulus.**

## 2. Uji keamanan tambahan (bagian dari `npm run test:api`)

| Uji | Cara uji | Hasil nyata | Status |
|---|---|---|---|
| Pembatasan percobaan login | 6 kali `POST /api/auth/login` dengan password salah untuk username yang sama | 5 kali → HTTP 401, percobaan ke-6 → **HTTP 429** “Terlalu banyak percobaan gagal…” | ✅ |
| Endpoint tanpa token | `GET /api/kurikulum` tanpa token | HTTP 401 | ✅ |
| Log aktivitas | `GET /api/admin/logs` setelah seluruh skenario | Aksi tercatat: `login`, `login_gagal`, `kontrol_menu`, `kumpul_tugas`, `sesi_konfigurasi`, `sesi_mulai`, `sesi_jeda`, `sesi_lanjut`, `sesi_akhiri`, `logout` — lengkap dengan pengguna, waktu, objek, IP | ✅ |
| Berkas statis & SPA | `GET /`, `GET /assets/index-*.js`, `GET /materi/2` | HTTP 200 (`text/html`, `application/javascript`) | ✅ |

## 3. Uji antarmuka nyata (React di jsdom + API aktif) — `npm run test:ui`

| # | Yang diuji | Hasil nyata | Status |
|---|---|---|---|
| 1 | Halaman login (tab siswa/guru, tombol akun demo) | Teks tampil: “DKV Learning Lab — SMKN 3 Kuningan · Fase E” | ✅ |
| 2 | Dashboard siswa memuat data nyata | “Minggu berjalan Minggu 2”, progres 0/36, pengumuman guru terbaca dari basis data | ✅ |
| 3 | Modul materi memuat 36 minggu dari API | Kartu minggu 1 “Technopreneurship…” tampil | ✅ |
| 4 | Halaman Kontrol Pembelajaran guru | Sakelar 9 menu, panel “Mulai Pembelajaran”, tombol Aktifkan/Kunci Semua tampil | ✅ |
| 5 | Klik sakelar di UI benar-benar mengubah server | Sebelum `{…materi:true…}` → sesudah klik `{…materi:false…}` (dibaca ulang dari API) | ✅ |
| 6 | Halaman Penilaian guru | Tab kiriman siswa dengan kolom skor & umpan balik tampil | ✅ |
| 7 | Rekap penilaian | Baris siswa nyata (“Aditya Pratama”), kolom “Minggu selesai” | ✅ |
| 8 | Panel Admin | Akun “Administrator Sekolah” dan tab pengaturan tampil | ✅ |
| 9 | Simulasi tidak berupa tombol palsu | Klik “▶ Jalankan simulasi” menampilkan panel pratinjau + umpan balik tipografi (Tracking, Leading) | ✅ |
| 10 | Sinkronisasi status ke siswa | Guru `mulai` sesi → dashboard siswa menampilkan status “…berlangsung” lalu sesi diakhiri | ✅ |

## 4. Pemeriksaan lain yang sudah dilakukan

| Pemeriksaan | Perintah | Hasil |
|---|---|---|
| Pemeriksaan tipe TypeScript | `npx tsc --noEmit` | 0 error |
| Build produksi | `npm run build` | sukses — `dist/index.html` 0,45 kB; CSS 31,96 kB (gzip 6,57 kB); JS 271,18 kB (gzip 80,22 kB) |
| Render semua halaman (20 halaman, termasuk 4 simulasi) | `node /tmp/smoke.cjs` (esbuild + `react-dom/server`) | “Semua halaman berhasil dirender tanpa error.” |
| Isi basis data setelah seed | `SELECT COUNT(*)` | 36 minggu, 13 pengguna, 2 kelas, 10 pengaturan, 4 tugas, 1 pengumuman |

## 5. Temuan & perbaikan selama pengujian (jujur, apa adanya)

| # | Temuan | Perbaikan |
|---|---|---|
| 1 | Aturan akses siswa: ketika menu **Materi** ditutup, materi minggu lain masih bisa dibuka bila menu **navigasi** terbuka (`GET /api/kurikulum/5` → HTTP 200) | `studentAccess` di server diubah: di luar minggu aktif, materi hanya terbuka bila **menu materi DAN navigasi** dibuka. Setelah perbaikan → HTTP 403. ✅ |
| 2 | `npm run seed` gagal `FOREIGN KEY constraint failed` (relasi melingkar `users.kelas_id ↔ classes.wali_guru_id`) | Reset kini mematikan foreign key sementara + mengosongkan `sqlite_sequence` agar penomoran id kembali dari 1. ✅ |
| 3 | Uji API awalnya memakai `kelas_id` tetap (1, 2) sehingga salah setelah data di-seed ulang | Uji kini mendeteksi id kelas & akun siswa dari API sehingga tetap sahih. ✅ |
| 4 | Badge status siswa menampilkan kode mentah (“ended”) | Diganti label Indonesia (belum dimulai / berlangsung / dijeda / selesai) + pesan kontekstual per status. ✅ |

> **Pembaruan 13 Okt 2026 (modul materi 72 pertemuan).** Modul rinci seluruh 72 pertemuan ditulis, digabungkan, dan dimuat ke basis data; ditambahkan tampilan **materi lengkap per pertemuan** (9 bagian wajib + diagram SVG orisinal), **kuis formatif yang dinilai di server**, **editor materi untuk guru**, **penanda progres per pertemuan**, dan endpoint sunting modul. Uji bertambah menjadi **21 API + 17 antarmuka = 38 uji, semuanya LULUS**:

| # | Uji | Hasil nyata | Status |
|---|---|---|---|
| API-13 | Modul 9 bagian tersedia pada pertemuan aktif | Minggu 2/Senin: 9 bagian · 4 poin materi · 2 contoh visual · 2 butir kuis (HTTP 200) | ✅ |
| API-14 | Kuis formatif dinilai server & riwayat tersimpan | 1 jawaban salah → **1/2**; semua benar → **2/2**; riwayat 2 percobaan | ✅ |
| API-15 | Siswa ditolak saat menyunting modul | `PUT …/modul` dengan token siswa → **403** “Anda tidak memiliki hak akses untuk tindakan ini.” | ✅ |
| API-16 | Guru menyunting materi → tampil pada sisi siswa | `PUT=200`, siswa membaca kembali teks pengayaan yang diubah guru | ✅ |
| API-17 | Progres per pertemuan | Tandai Senin → `berjalan`; tandai Rabu → **`selesai`** (aktivitas: senin, rabu) | ✅ |
| API-18 | Kunci menu kuis menahan jawaban baru, nilai lama tetap ada | Saat `kuis=false` → **403 locked** (“Menu Kuis/Asesmen belum dibuka oleh guru.”); riwayat tetap 2 percobaan | ✅ |
| API-21 | Log aktivitas memuat aksi baru | Tercatat: `sunting_modul`, `kuis_formatif` (selain login, kontrol_menu, sesi_*, kumpul_tugas) | ✅ |
| UI-15 | Halaman pertemuan memuat modul lengkap | “Materi pertemuan”, “Contoh visual” (diagram **SVG** dirender), tabel istilah, rubrik, “Asesmen formatif pertemuan ini” | ✅ |
| UI-16 | Editor materi guru (klik sungguhan) | Tombol “Sunting materi” diklik → form editor tampil (“Pengantar materi”, “Simpan materi”) | ✅ |
| UI-17 | Siswa menjawab kuis dari halaman pertemuan | 2 butir dijawab di jsdom → server menilai → “Nilai tersimpan: 2/2” | ✅ |

**Pemeriksaan tambahan modul:** `python3 tools/gabung-modul.py` → *72 pertemuan, 0 masalah, semua sesuai 6 JP / 270 menit*; 43 rujukan diagram pada modul semuanya ada di `diagram-contoh.json` (20 diagram); tidak ada kolom wajib yang kosong pada 72 pertemuan.

## 5c. Uji tambahan untuk halaman baru (13 Okt 2026)

| # | Uji | Hasil nyata | Status |
|---|---|---|---|
| API-14 | Endpoint pertemuan menghormati kunci menu guru | Kunci `pertemuan` → `GET /api/siswa/pertemuan/2/senin` **403** (“Menu Pertemuan aktif belum dibuka oleh guru.”); dibuka lagi → **200**, `6 JP / 270 menit` | ✅ |
| API-15 | Portofolio terkunci tidak menghapus karya | Unggah 200 → kunci menu → `GET /api/portofolio` **403** (“Menu Portofolio belum dibuka oleh guru…”) → buka lagi → **karya masih ada** | ✅ |
| UI-11 | Halaman daftar pertemuan | Menampilkan “Pertemuan Pembelajaran”, kartu “Pertemuan aktif saat ini”, dan label 270 menit | ✅ |
| UI-12 | Halaman detail pertemuan | Menampilkan “Agenda pertemuan”, “total 270”, “Tujuan yang dilatih”, bagian LKPD | ✅ |
| UI-13 | Halaman asesmen | Menampilkan kategori Diagnostik…Refleksi dan ringkasan “Rata-rata kuis” | ✅ |
| UI-14 | Penanda data demo | Tampil pada halaman login (“Data demo — akun contoh”) dan dashboard siswa | ✅ |

## 6. Belum diuji / batas pengujian (dilaporkan apa adanya)

1. **Belum diuji di peramban sungguhan** (Chrome/Edge/Firefox di desktop, tablet, ponsel) — sandbox pengujian tidak memiliki peramban; uji antarmuka memakai jsdom (DOM nyata + API nyata) dan pemeriksaan visual manual oleh pengguna masih diperlukan.
2. **Belum ada uji beban/banyak pengguna serentak** (mis. 36 siswa menekan submit bersamaan).
3. **Belum diuji dengan kalender pendidikan resmi**, karena dokumen kalender sekolah belum tersedia.
4. **Media/unggahan berkas**: portofolio saat ini menyimpan tautan/berkas sebagai data (JSON) — belum ada unggahan gambar berukuran besar ke penyimpanan berkas.
5. **4 simulasi masih berstatus “dalam pengembangan”** (technopreneur, K3/ergonomi, sketsa, studio proyek DKV) — ditandai jelas di antarmuka, tidak diklaim berfungsi.
6. **Belum diuji pada perangkat dengan pengelola sesi/kebijakan keamanan khusus sekolah** (mis. proxy yang memblokir header kustom `x-dkv-token`); bila terjadi, gunakan cookie sesi yang sudah dipasang server.
7. **Butir kuis formatif dan contoh visual belum dapat disunting dari antarmuka guru** — bagian modul lain sudah dapat disunting (teruji API-16); kedua bagian ini masih melalui berkas data.
8. **Penguji belum melihat halaman di peramban sungguhan** — uji UI menjalankan React di jsdom; kerapian diagram SVG pada layar ponsel/desktop masih perlu verifikasi visual guru.
9. **1 simulasi belum dibuat** — Technopreneurship DKV tetap ditandai “dalam pengembangan”.
10. **Model simulasi bukan alat profesional** — seluruh lab memakai rumus sederhana; hasilnya bukan keluaran kamera/perangkat lunak desain dan belum menggantikan praktik nyata, sehingga perlu pendampingan guru saat dipakai menilai.
11. **Pemulihan password mandiri** (lupa password via email) belum ada — penggantian dilakukan oleh Admin (reset) atau guru sendiri (Akun → Ganti password).

## 7. Cara mengulang pengujian

```bash
cd dkv-learning-lab/app
npm install
rm -f data/dkv.db*          # opsional: mulai dari nol
npm run seed
npm run build
npm start &                 # server harus aktif di port 8080
npm run test:api            # 13 uji API
npm run test:ui             # 10 uji antarmuka
```

Catatan: `npm run test:api` mengubah data (mengunci menu, menjalankan sesi, mengirim satu jawaban, membuat log uji). Setelah selesai, jalankan `npm run seed` bila ingin data demo bersih kembali.


## 5. Uji mesin asesmen 36 minggu (34 uji API + 31 uji antarmuka = **65/65 LULUS**)

Ditambahkan 13 Okt 2026 bersama **sistem asesmen 36 minggu** (260 butir asesmen; lihat `docs/09-asesmen-36-minggu.md`). Semua keluaran di bawah adalah keluaran nyata dari terminal.

### 5.1 Uji API (`npm run test:api`) — uji 23–32

| # | Uji | Keluaran nyata | Status |
|---|---|---|---|
| 23 | Kunci jawaban & pembahasan tidak dikirim ke siswa sebelum pekerjaan dikumpulkan | `2 butir terkirim tanpa kunci/pembahasan` | ✅ |
| 24 | Kuis dinilai otomatis di server (jawaban benar → 100) & pembahasan terbuka setelah dikirim | `skor=100, status=dinilai, pembahasan tampil=true` | ✅ |
| 25 | Skor kiriman siswa diabaikan (server menilai sendiri) | siswa mengirim `skor:100` + jawaban salah → nilai tersimpan `0` | ✅ |
| 26 | Karya/proses menunggu guru: tanpa konfirmasi ditolak (400), dengan konfirmasi tersimpan | `kirim LKPD → status terkumpul skor null; nilai tanpa konfirmasi=HTTP 400; dengan konfirmasi → 100` | ✅ |
| 27 | Rubrik dengan total bobot ≠ 100 ditolak; bobot sah tersimpan | `total 107 → HTTP 400; total 100 → HTTP 200` | ✅ |
| 28 | Siswa ditolak dari penilaian & rekap guru (403) | `detail=403, nilai=403, rekap=403, ekspor CSV=403` | ✅ |
| 29 | Rekap 3 mode + ekspor CSV berisi nilai | `perSiswa=6, perMinggu=36, perJenis=6, CSV 7 baris; contoh nilai_akhir=Aditya Pratama → 57.1` | ✅ |
| 30 | Daftar remedial memuat siswa dengan nilai di bawah KKTp | `3 baris remedial (mis. Aditya Pratama — Kuis pertemuan Senin minggu 2: 0 < KKTp 75)` | ✅ |
| 31 | Menu Kuis yang dikunci guru menahan pengiriman jawaban (403 terkunci) | `HTTP 403 — Menu Kuis/Asesmen belum dibuka oleh guru.` | ✅ |
| 32 | Guru dapat membuka ulang pekerjaan untuk remedial & siswa mengerjakan ulang | `buka ulang (skor lama 0) → status draf → kirim ulang skor 100` | ✅ |

Log aktivitas juga diperluas: uji log kini menuntut aksi `kumpul_asesmen`, `nilai_asesmen`, `ubah_rubrik`, `ekspor_rekap_asesmen`, dan `buka_ulang_asesmen` tercatat — **lulus**.

### 5.2 Uji antarmuka (`npm run test:ui`) — uji 23–31

| # | Yang diuji | Keluaran nyata | Status |
|---|---|---|---|
| 23 | `/asesmen/rencana` siswa: rencana 36 minggu + badge bobot/KKTp + filter + tombol Buka | `judul=true, kartu+badge=true, filter minggu/jenis=true, tombol buka=true` | ✅ |
| 24 | Kartu asesmen dapat dibuka → panel kerja (soal/uraian + tombol kirim) | `penanda panel kerja tampil=true` | ✅ |
| 25 | `/asesmen/rekap` siswa: tab per minggu, per jenis, catatan | `judul=true, tab minggu/jenis/catatan=true` | ✅ |
| 26 | `/guru/asesmen`: empat tab + field bobot/KKTp/kesempatan revisi | `tab=true, field bobot/KKTp/revisi=true` | ✅ |
| 27 | Kartu asesmen Praktik menampilkan rubrik 4 kriteria, total bobot 100/100 | `kartu praktik ditemukan=true, rubrik tampil=true, total bobot kriteria 100/100` | ✅ |
| 28 | Mengubah bobot kriteria memperbarui total & menonaktifkan simpan sampai 100 | `setelah bobot diubah → total bobot kriteria 75/100; tombol simpan nonaktif=true` | ✅ |
| 29 | Penilaian rubrik: ditolak tanpa centang konfirmasi, tersimpan setelah dicentang | `blok rubrik=true, skor dipilih=2, ditolak tanpa konfirmasi=true, tersimpan setelah konfirmasi=true` | ✅ |
| 30 | `/guru/rekap-asesmen`: tiga mode + tautan ekspor CSV + tabel terisi | `tab 3 mode=true, tautan CSV=true, baris tabel=6` | ✅ |
| 31 | `/guru/remedial`: daftar di bawah KKTp + kandidat pengayaan | `daftar remedial=true, kandidat pengayaan=true` | ✅ |

### 5.3 Pemeriksaan tambahan

| Pemeriksaan | Perintah | Hasil |
|---|---|---|
| Pemeriksaan tipe TypeScript | `npx tsc --noEmit` | 0 error (termasuk `asesmen2.tsx` & `guru-asesmen.tsx`) |
| Build produksi | `npm run build` | sukses — JS 446,79 kB (gzip 125,07 kB) |
| Muat data asesmen pada basis data yang sudah ada | jalankan server dua kali | pertama: `Asesmen 36 minggu dimuat: 260 butir asesmen`; kedua: `260 butir sudah ada (suntingan guru dipertahankan)` |
| Isi data asesmen | `SELECT COUNT(*)` | 260 asesmen (kuis 72, LKPD 72, formatif 36, praktik 36, proyek 36, sumatif 8) · 243 butir pilihan ganda · 188 butir menunggu penilaian guru |

---

## 6. Uji supervisi akademik, dokumentasi per pertemuan & hak akses (13 uji baru → total **78/78 LULUS**)

Ditambahkan 13 Okt 2026: instrumen supervisi dengan **indikator yang dapat dikonfigurasi** (awal = butir dokumen instrumen sekolah), **dokumentasi pembelajaran 72 pertemuan**, tiga **laporan siap cetak**, ekspor CSV, dan penguatan **hak akses** peserta didik. Keluaran di bawah adalah keluaran nyata `npm test`.

### 6.1 Uji API (`npm run test:api`) — uji 33–38

| # | Uji | Keluaran nyata | Status |
|---|---|---|---|
| 33 | Indikator supervisi dimuat dari dokumen instrumen sekolah (aspek C.1–C.4, termasuk 5C); siswa ditolak | `18 indikator pada C.1,C.2,C.3,C.4 · sumber: Instrumen Supervisi Akademik Kurikulum Merdeka… · siswa=403` | ✅ |
| 34 | Skor per indikator divalidasi (1–4 & hanya indikator instrumen) dan rata per aspek dihitung server | `tersimpan #4 (rata 3.25); indikator asing → 400; skor 9 → 400; aspek terhitung=true` | ✅ |
| 35 | Indikator dapat dikonfigurasi Admin (guru 403) & dapat dimuat ulang dari dokumen instrumen | `guru→403, admin→200 (terbaca guru=true), muat ulang=18 indikator` | ✅ |
| 36 | Dokumentasi per pertemuan: 7 bagian terisi usulan otomatis, tersimpan guru, siswa ditolak | `usulan: tujuan 2, memahami 2, mengaplikasi 2, merefleksi 1, bukti 4, prinsip pilihan 9; siswa GET/PUT=403/403` | ✅ |
| 37 | Rekap supervisi & dokumentasi dapat diekspor ke CSV (kepala kolom per indikator dan per aspek); siswa ditolak | `CSV supervisi 3 baris data (18 kolom indikator + rata per aspek) · CSV dokumentasi 1 baris · siswa=403` | ✅ |
| 38 | Peserta didik tidak dapat mengakses fitur admin atau mengubah nilai guru (semua 403, guru tetap boleh) | `admin users/settings/logs/POST=403 · guru/grade siswa=403 (guru=200) · supervisi siswa=403` | ✅ |

### 6.2 Uji antarmuka (`npm run test:ui`) — uji 32–38

| # | Yang diuji | Keluaran nyata | Status |
|---|---|---|---|
| 32 | Supervisi: indikator instrumen dimuat dari server & mengisi skor memperbarui rata-rata aspek | `judul+aspek=true, sumber instrumen=true, tombol skor=18, 0/18 indikator terisi → 1/18 indikator terisi` | ✅ |
| 33 | Admin dapat menyunting indikator supervisi & memuat ulang daftar dari dokumen instrumen | `baris "dari instrumen"=23, perubahan sampai server=true, kembali ke daftar instrumen=true` | ✅ |
| 34 | Dokumentasi per pertemuan: bagian A–I + prinsip pembelajaran mendalam tampil & isian tersimpan ke server | `bagian A–I=true, prinsip=true, isian usulan=true, tersimpan server=true` | ✅ |
| 35 | Laporan supervisi dapat dicetak: kop sekolah, tabel indikator, catatan, rekomendasi, tanda tangan supervisor | `id #4 · kop=true, indikator=true, tanda tangan+NIP=true` | ✅ |
| 36 | Dokumentasi pertemuan dapat dicetak (tujuan, memahami–mengaplikasi–merefleksi, prinsip, bukti, observasi, refleksi, tindak lanjut) | `judul=true, bagian A/B/E/F/I=true, tanda tangan=true` | ✅ |
| 37 | Rekap nilai dapat dicetak: tabel per jenis asesmen, nilai akhir, kolom ketuntasan, tanda tangan | `judul=true, kolom tuntas=true, baris peserta didik=10` | ✅ |
| 38 | Peserta didik dialihkan dari Panel Admin & halaman guru (tidak ada fitur admin/penilaian guru di antarmuka) | `panel admin tidak bocor=true, halaman guru tidak bocor=true, dialihkan ke dashboard siswa=true` | ✅ |

### 6.3 Pemeriksaan tambahan

| Pemeriksaan | Perintah | Hasil |
|---|---|---|
| Pemeriksaan tipe TypeScript | `npx tsc --noEmit` | 0 error (termasuk `supervisi.tsx`, `dokumentasi.tsx`, `cetak.tsx`) |
| Build produksi | `npm run build` | sukses — JS 484,04 kB (gzip 133,83 kB); CSS 38,02 kB (gzip 7,56 kB) |
| Isi tabel baru setelah memuat aplikasi | `SELECT COUNT(*)` | `supervision_indicators` = 18 indikator instrumen (4 aspek) · `meeting_docs` terisi sesuai jumlah pertemuan yang disimpan guru |
| Log aktivitas aksi baru | `GET /api/admin/logs` | `simpan_supervisi`, `sunting_dokumentasi`, `ubah_indikator_supervisi`, `ekspor_supervisi` tercatat |
