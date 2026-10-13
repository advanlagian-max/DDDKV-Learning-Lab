# 10 — Supervisi Akademik & Dokumentasi Pembelajaran per Pertemuan

Dokumen ini menjelaskan tiga hal yang diminta sekolah:

1. **Dashboard guru & admin** untuk mengelola kelas, akun, jadwal, materi, tugas, nilai, portofolio, dan catatan supervisi akademik.
2. **Dokumentasi per pertemuan** (72 pertemuan): tujuan pembelajaran, aktivitas **memahami–mengaplikasi–merefleksi**, **penerapan prinsip pembelajaran mendalam sesuai instrumen sekolah**, bukti aktivitas, catatan observasi, refleksi guru, dan tindak lanjut.
3. **Indikator supervisi yang dapat dikonfigurasi** — daftar awal disalin dari dokumen instrumen sekolah, **tidak ada indikator yang dikarang aplikasi**; ditambah **laporan siap cetak** dan **rekap nilai yang dapat diekspor**.

Berkas terkait: `app/server/supervisi.js` (server), `app/src/supervisi.tsx` (pengisian instrumen), `app/src/dokumentasi.tsx` (dokumentasi per pertemuan), `app/src/cetak.tsx` (halaman cetak), `app/src/admin.tsx` (konfigurasi indikator).

---

## 1. Dashboard guru & admin — apa yang dikelola di mana

| Kebutuhan | Tempat mengelola | Endpoint utama |
|---|---|---|
| **Kelas, wali kelas, tahun ajaran** | Admin → tab **🏫 Kelas** | `GET/POST /api/admin/kelas`, `GET /api/guru/kelas` |
| **Akun & hak akses** (buat, reset sandi, aktif/nonaktif) | Admin → tab **👤 Akun** | `GET/POST /api/admin/users`, `/api/admin/users/:id/reset`, `/:id/toggle` |
| **Jadwal & jam pelajaran** (hari mengajar, JP, durasi JP, minggu efektif, kalender sekolah/libur) | Admin → tab **🗓️ Pengaturan & Kalender** | `GET/PUT /api/admin/settings` (guru: `PUT /api/guru/settings` untuk kunci terbatas) |
| **Materi 36 minggu / 72 pertemuan** (tujuan, pemantik, materi, aktivitas, LKPD, rubrik, tugas, tindak lanjut) | Guru → **📚 Materi & Suntingan** dan halaman **Pertemuan** (tombol *Sunting materi*) | `PUT /api/kurikulum/:nomor`, `PUT /api/kurikulum/:nomor/pertemuan/:hari/modul` |
| **Tugas** (buka/tutup, judul, bobot, tenggat) | Guru → **✅ Penilaian → 🗂️ Kelola tugas** | `GET /api/tugas`, `POST /api/guru/tugas` |
| **Nilai** (kiriman siswa, asesmen 36 minggu + rubrik, rekap, ekspor) | Guru → **✅ Penilaian** dan **🎯 Asesmen 36 Minggu**, **📈 Rekap Penilaian/Rekap Asesmen** | `POST /api/guru/grade`, `/api/guru/asesmen*`, `/api/guru/rekap*` |
| **Portofolio siswa** (lihat karya + umpan balik) | Guru → **✅ Penilaian → 🎨 Karya portofolio** | `GET /api/portofolio`, `POST /api/portofolio/:id/feedback` |
| **Catatan supervisi akademik** | Guru/Admin → **🪪 Supervisi Akademik** (+ tab Admin **🪪 Indikator Supervisi** untuk konfigurasi) | `/api/supervisi*` |
| **Dokumentasi pembelajaran per pertemuan** | Guru → **📄 Dokumentasi Pertemuan** | `/api/supervisi/dokumentasi*` |

Dashboard guru menampilkan **Pusat kendali kelas** berisi tautan cepat + angka nyata (jumlah tugas, karya portofolio & karya yang belum diberi umpan balik, dokumentasi pertemuan yang sudah terisi, jumlah catatan supervisi). Dashboard admin menampilkan kartu ringkas ke lima area pengelolaan.

---

## 2. Indikator supervisi — sesuai dokumen, dapat dikonfigurasi

### 2.1 Asal-usul indikator (bukan karangan aplikasi)

Daftar awal disalin **apa adanya** dari dokumen sekolah *Instrumen Supervisi Akademik Kurikulum Merdeka dengan Pendekatan Deep Learning* (dokumen **SUP** pada analisis sumber, lihat `docs/01` §4), **18 indikator pada 4 aspek**, skala **1–4**:

| Kode | Aspek | Indikator |
|---|---|---|
| C.1.1–C.1.4 | **C.1 Perencanaan** | Tujuan pembelajaran jelas & terukur · Materi sesuai CP/materi buku · Strategi pembelajaran mendalam (Deep Learning) · Diferensiasi kebutuhan murid |
| C.2.1–C.2.5 | **C.2 Pelaksanaan** | Pendahuluan & apersepsi · Interaksi guru–murid · Aktivitas murid dominan (student-centered) · Kolaborasi antar murid · Pemanfaatan teknologi & sumber belajar |
| C.3.1–C.3.5 | **C.3 Penerapan 5C (Deep Learning)** | Critical Thinking · Creativity · Collaboration · Communication · Connection to Real Life |
| C.4.1–C.4.4 | **C.4 Asesmen dan Refleksi** | Asesmen formatif berjalan · Asesmen sumatif/praktik · Refleksi guru · Refleksi murid |

Catatan instrumen yang ikut ditampilkan di aplikasi: program sekolah (Adiwiyata, Gapura Pancawaluya, Gerakan Indonesia ASRI, Literasi & Numerasi, S3, SimPel) diintegrasikan ke modul ajar dan pelaksanaan pembelajaran; catatan supervisor serta rekomendasi tindak lanjut bagi guru/murid/sekolah ditandatangani supervisor pada dokumen tercetak. Identitas supervisor pada kop laporan diambil dari dokumen (**Saidun, S.Pd., M.M.** — NIP 197009201994021002) dan **dapat diubah Admin** melalui pengaturan `supervisor` bila sekolah menunjuk pejabat lain.

### 2.2 Yang dapat dikonfigurasi (Admin → tab 🪪 Indikator Supervisi)

- **Ubah** kode, nama, deskriptor, dan urutan indikator; **nonaktifkan/aktifkan** indikator (riwayat penilaian lama tidak dihapus).
- **Tambah** indikator baru. Indikator tambahan **ditandai “ditambahkan sekolah”** agar terbedakan dari butir instrumen resmi — aplikasi tidak menambah indikator resmi dengan sendirinya.
- **Muat ulang dari instrumen** untuk mengembalikan daftar asli dari dokumen (18 indikator).
- Setiap perubahan tercatat pada log aktivitas sebagai `ubah_indikator_supervisi`, dan **guru tidak dapat mengubahnya** (hanya Admin) — agar instrumen tidak bergeser tanpa dasar.

### 2.3 Mengisi instrumen (Guru/Admin → 🪪 Supervisi Akademik)

1. Pilih **kelas**, **guru yang disupervisi**, **minggu**, dan **tanggal**.
2. Beri **skor 1–4 per indikator** (1 = perlu pendampingan … 4 = sangat baik). Rata-rata **per aspek** (C.1–C.4) dan rata-rata total dihitung server.
3. Isi **catatan supervisor**, **rekomendasi bagi guru/murid/sekolah**, dan **tindak lanjut**; simpan sebagai **draft** atau **final**.
4. Riwayat menampilkan skor per aspek; setiap baris dapat **dicetak**, **disunting**, dan (khusus Admin) **dihapus**.
5. Server menolak skor di luar 1–4, indikator yang tidak aktif/tidak dikenal, dan seluruh permintaan dari akun **peserta didik** (403).

---

## 3. Dokumentasi pembelajaran per pertemuan (72 pertemuan)

Guru → **📄 Dokumentasi Pertemuan**. Daftar berisi **72 pertemuan** (36 minggu × Senin/Rabu) dengan filter minggu, status (`belum diisi` / `draf` / `final`), dan ekspor CSV.

Setiap pertemuan memiliki **sembilan bagian**:

| Bagian | Isi | Bantuan aplikasi |
|---|---|---|
| A | **Tujuan pembelajaran** | usulan otomatis dari modul (dapat disunting) |
| B | Aktivitas **memahami** | usulan otomatis dari modul |
| C | Aktivitas **mengaplikasi** | usulan otomatis dari modul |
| D | Aktivitas **merefleksi** | usulan otomatis dari modul |
| E | **Penerapan prinsip pembelajaran mendalam** (sesuai instrumen sekolah) | daftar pilihan: mindful/berkesadaran, pembelajaran bermakna, 5C, kontekstual, diferensiasi, asesmen formatif, kolaborasi & tutor sebaya, teknologi & sumber belajar, integrasi program sekolah — **ditandai guru/observer**, aplikasi **tidak menebak** |
| F | **Bukti aktivitas** | usulan otomatis (LKPD, kuis formatif, tugas & luarannya, asesmen mingguan, bukti portofolio) |
| G | **Catatan observasi** | diisi pengamat/supervisor |
| H | **Refleksi guru** | diisi guru |
| I | **Tindak lanjut** | diisi guru |

Status dokumen: **usulan** (hanya tampilan, dihitung saat dibuka) → **draf** → **final** (setelah guru menyimpan). Isian usulan **tidak pernah** dianggap dokumen resmi sebelum disimpan guru; hal ini dinyatakan pada halaman dan pada hasil cetak. Tombol **↺ Isi dari modul (usulan)** memuat ulang usulan ke formulir bila perlu.

---

## 4. Laporan yang dapat dicetak & rekap yang dapat diekspor

| Halaman cetak | Rute | Isi |
|---|---|---|
| Laporan supervisi akademik | `/guru/supervisi/cetak/:id` | kop sekolah, identitas guru/kelas/minggu/tanggal, tabel skor **per indikator** + rata per aspek + rata total, catatan supervisor, rekomendasi guru/murid/sekolah, tindak lanjut, catatan instrumen, kolom tanda tangan (supervisor + NIP) |
| Dokumentasi pertemuan | `/guru/dokumentasi/cetak/:minggu/:hari` | sembilan bagian (A–I) termasuk centang prinsip pembelajaran mendalam, sumber data (usulan/dokumen tersimpan), kolom tanda tangan |
| Rekap nilai kelas | `/guru/rekap-cetak` | tabel per jenis asesmen (kuis/LKPD/formatif/praktik/proyek/sumatif), nilai akhir berbobot, LKPD terkumpul, karya portofolio, minggu selesai, kolom **ketuntasan** (KKTp 75), catatan rumus, kolom tanda tangan |

Semua halaman memakai A4 (margin 14 mm), menyembunyikan menu/topbar saat dicetak (`@media print`), dan menyediakan tombol **🖨️ Cetak / Simpan PDF`. Bila dialog cetak diblokir oleh pratinjau di dalam aplikasi, tekan **Ctrl/Cmd + P** — halaman sudah dalam tata letak cetak.

**Ekspor CSV** (pemisah `;` agar aman dibuka Excel ber-locale Indonesia, dengan BOM UTF-8):

| Berkas | Endpoint | Isi |
|---|---|---|
| `rekap-nilai-<kelas>.csv` | `GET /api/guru/rekap?kelas_id=&format=csv` | rekap LKPD, rata-rata nilai, karya, minggu selesai |
| `rekap-asesmen-<mode>.csv` | `GET /api/guru/rekap-asesmen.csv?mode=siswa\|minggu\|jenis` | nilai akhir & rata per jenis, remedial |
| `rekap-supervisi.csv` | `GET /api/supervisi.csv` | **satu kolom per indikator** + rata per aspek + rata total + catatan/tindak lanjut |
| `dokumentasi-pertemuan.csv` | `GET /api/supervisi/dokumentasi.csv` | sembilan bagian dokumentasi untuk setiap pertemuan yang sudah disimpan |

---

## 5. Hak akses (ditegakkan server, bukan hanya menyembunyikan tombol)

| Tindakan | Siswa | Guru | Admin |
|---|---|---|---|
| Membuka `/admin` dan seluruh `/api/admin/*` (akun, kelas, pengaturan, log) | **403 + dialihkan ke dashboard siswa** | 403 | ✅ |
| Mengubah nilai (kiriman guru & asesmen) — `POST /api/guru/grade`, `POST /api/guru/asesmen/:id/nilai` | **403** | ✅ | ✅ |
| Mengisi/menyunting instrumen supervisi (`POST/PUT /api/supervisi`) | **403** | ✅ | ✅ |
| Dokumen supervisi: `GET/PUT /api/supervisi/dokumentasi*`, `GET /api/supervisi/indikator`, `GET /api/supervisi*` | **403** | ✅ | ✅ |
| Mengubah **indikator** instrumen, muat ulang dari dokumen, menghapus catatan supervisi | 403 | **403** | ✅ |
| Mengekspor CSV supervisi & dokumentasi, mencetak laporan | 403 | ✅ | ✅ |
| Melihat modul, kuis formatif, asesmen, portofolio sendiri | ✅ | ✅ | ✅ |

Uji otomatis membuktikan seluruh baris di atas (uji API 28, 33, 35–38 dan uji antarmuka 38 pada `docs/05`).

---

## 6. Batas yang perlu diketahui sekolah (jujur)

1. **Validasi instrumen.** Aplikasi hanya memuat butir instrumen **apa adanya dari dokumen**; bila sekolah/instansi memiliki versi instrumen yang berbeda (misalnya revisi resmi dengan kode dan jumlah butir berbeda), gunakan tab **Indikator Supervisi** untuk menyesuaikan atau kirimkan berkas instrumen agar disesuaikan pengembang. Indikator tambahan selalu ditandai “ditambahkan sekolah”.
2. **Tanda tangan masih manual.** Laporan cetak menyediakan kolom tanda tangan; belum ada tanda tangan elektronik/QR verifikasi.
3. **Kalender pendidikan** yang dipakai belum resmi (usulan pada `docs/04`), sehingga tanggal supervisi & minggu efektif perlu diverifikasi guru/admin.
4. **Catatan observasi & refleksi guru bersifat naratif** — aplikasi tidak menilai mutu tulisan; penilaian tetap memakai skor indikator instrumen.
5. **Uji antarmuka memakai jsdom**, bukan peramban sungguhan; hasil cetak sebaiknya diperiksa sekali di Chrome/Edge (A4, aktifkan *Background graphics* agar warna tabel ikut tercetak).
6. **Belum ada unggahan berkas gambar** pada bukti aktivitas dokumentasi (bukti ditulis sebagai butir teks/tautan).
