# Analisis Sumber & Pemetaan Kurikulum — DKV Learning Lab

> Tahap 1 (Analisis sumber & pemetaan) — status: **selesai untuk versi operasional 0.1**
> Semua klaim di dokumen ini ditelusuri ke berkas sumber yang disediakan. Bagian yang bukan dari sumber diberi tanda **"usulan — perlu verifikasi guru"**.

## 1. Berkas sumber yang dianalisis

| Kode | Berkas | Jenis | Halaman | Lokasi kerja |
|------|--------|-------|---------|--------------|
| B1 | Dasar-Dasar Desain Komunikasi Visual Semester 1, Kelas X SMK (Kemendikbudristek, 2022) | Buku siswa | 176 | `sumber/Desain-Komunikasi-VIsual-KLS-X-Sem-1 (1).pdf` |
| B2 | Dasar-Dasar Desain Komunikasi Visual Semester 2, Kelas X SMK (Kemendikbudristek, 2022) | Buku siswa | 184 | `sumber/Dasar-Dasar-Desain-Komunikasi-Visual-Semester-2-BS-KLS-X (1) (1).pdf` |
| SUP | Instrumen Supervisi Akademik Kurikulum Merdeka dengan Pendekatan Deep Learning | Instrumen supervisi sekolah | 2 | Dokumen Google Drive `1AD8bJWHb1c4K8nCeeu3pXIKQ3hGlffrc` |

Teks penuh hasil ekstraksi: `sumber/ekstraksi/sem1_full.txt` dan `sem2_full.txt` (penanda `<<<HAL n>>>` = halaman PDF).
Catatan teknis: lapisan teks B2 menghilangkan sebagian huruf "f" (mis. "Tipograi"); pencarian teks harus menormalkan huruf tersebut. B1 tidak memakai label "Tujuan Pembelajaran"/"Kata Kunci", sedangkan B2 memakainya — perbedaan fitur pedagogis ini memengaruhi penyeragaman istilah di aplikasi.

## 2. Struktur buku (terverifikasi dari daftar isi)

**B1 — Semester 1 (176 hal.)**
1. BAB 1 Profil Technopreneur, Peluang Usaha, dan Profesi di Bidang DKV (hal. 1) — A. Technopreneur DKV; B. Prospek Profesi; C. Mengenal Potensi Desainer sejak Dini.
2. BAB 2 Keutamaan Keselamatan dan Kesehatan Kerja (hal. 17) — A. Keselamatan pada Individu Pekerja; B. Peralatan Kerja; C. Lingkungan Kerja; D. Hasil Kerja.
3. BAB 3 Perkembangan Teknologi Industri dan Dunia Kerja Bidang DKV (hal. 51) — A. Perkembangan Proses Produksi Industri Kreatif; B. DKV dalam Industri 4.0; C. Teknologi Digital DKV dalam Industri; D. DKV di Era Kemajuan Teknologi Industri; E. Konsep Industri Hijau.
4. BAB 4 Teknik Dasar Proses Produksi pada Industri DKV (hal. 75) — A. Konsep Kreativitas; B. Berpikir Kreatif; C. Kreativitas dalam Industri Kreatif; D. Kreativitas Proses Produksi dan Teknologi; E. Budaya Kerja Desainer.
5. BAB 5 Sketsa dan Ilustrasi (hal. 93) — A. Konsep Sketsa dan Ilustrasi; B. Teknik Gambar; C. Jenis-Jenis Gambar Ilustrasi; D. Memulai Sketsa dan Ilustrasi; E. Prinsip dan Unsur Desain; F. Konsep Karya DKV melalui Sketsa.
6. Pelengkap: Rangkuman/Refleksi/Asesmen/Pengayaan tiap bab; Latihan Soal Semester 1 (hal. 133–144); Glosarium (hal. 145).

**B2 — Semester 2 (184 hal.)**
1. Bab 1 Tipografi (hal. 1) — A. Sejarah; B. Pengertian; C. Jenis; D. Fungsi, Anatomi, Prinsip, Lingkup Huruf, dan Layout; E. Leading, Kerning, Tracking. Dilengkapi **Tujuan Pembelajaran, Kata Kunci, dan Peta Konsep per bab**.
2. Bab 2 Fotografi Dasar (hal. 31) — A. Peralatan Kamera; B. Bagian-Bagian Kamera DSLR; C. Segitiga Exposure; D. Penggunaan Kamera DSLR; E. Alat Penunjang Indoor dan Outdoor; F. Jenis-Jenis Fotografi; G. Ukuran Gambar & Sudut Pengambilan; H. Pencahayaan; I. Penyuntingan Fotografi Digital.
3. Bab 3 Komputer Grafis (hal. 87) — A. Pengertian Bitmap dan Vektor; B. Jenis-Jenis Perangkat Lunak Desain Grafis (CorelDRAW, Adobe Illustrator, Adobe Photoshop); C. Produk Rancangan Komputer Grafis (**1) Mug — ukuran standar 8 cm × 20 cm; 2) Logo; 3) Packaging; 4) Kartu Nama**, hal. 124–137).
4. Pelengkap: Latihan Soal Semester 2 (hal. 143–156); Glosarium (hal. 157).

## 3. Status CP & ATP (penting — jangan diklaim berlebihan)

- Kedua buku menyatakan disusun berdasarkan **Capaian Pembelajaran (CP)** pada Kurikulum Merdeka: Keputusan Kepala BSKAP No. **008/H/KR/2022** beserta perubahannya No. **033/H/KR/2022** (tertulis pada halaman hak cipta/prakata; B1 & B2 hal. ii–vi). **Rumusan CP lengkap tidak dicetak di dalam buku** — hanya rujukannya.
- Karena itu, seluruh rumusan CP, ATP, dan kalender 36 minggu dalam aplikasi berstatus **"usulan operasional — perlu diverifikasi guru"** terhadap dokumen kurikulum resmi SMKN 3 Kuningan (CP Fase E, ATP sekolah, kalender pendidikan).
- Peta 36 minggu mengikuti daftar minggu pada master prompt, dipetakan ke bab/subbab buku (tabel di bawah). Penyesuaian antara urutan minggu dan urutan buku dicatat per minggu pada field `statusSumber` dan `catatanVerifikasi` di data.

## 4. Indikator supervisi (dari dokumen SUP — dasar fitur Supervisi)

Instrumen menilai dengan skala 1–4 pada aspek: **C.1 Perencanaan** (tujuan, materi, strategi Deep Learning, diferensiasi); **C.2 Pelaksanaan** (pendahuluan, interaksi guru-murid, aktivitas murid, kolaborasi, pemanfaatan teknologi & sumber belajar); **C.3 Penerapan Deep Learning — 5C** (Critical Thinking, Creativity, Collaboration, Communication, Connection to Real Life); **C.4 Asesmen dan Refleksi** (formatif, sumatif, refleksi guru, refleksi murid); dilengkapi catatan supervisor dan rekomendasi tindak lanjut bagi guru/murid/sekolah, ditandatangani supervisor **Saidun, S.Pd., M.M.** (NIP 197009201994021002). Catatan instrumen: integrasikan program sekolah (Adiwiyata, Gapura Pancawaluya, Gerakan Indonesia ASRI, Literasi & Numerasi, S3, SimPel) ke dalam modul ajar dan pelaksanaan pembelajaran.

## 5. Tabel pemetaan 36 minggu → sumber buku

| Minggu | Tema operasional | Padanan buku (bab — subbab) | Halaman | Status sumber |
|--------|------------------|------------------------------|---------|---------------|
| 1 | Orientasi Pembelajaran DKV, Asesmen Diagnostik, dan Pengenalan Aplikasi | **B1** Petunjuk Penggunaan Buku<br>**SUP** | xii-xiv | sebagian |
| 2 | Technopreneurship dalam Bidang DKV | **B1** BAB 1 Profil Technopreneur, Peluang Usaha, dan Profesi di Bidang DKV — A. Technopreneur Desain Komunikasi Visual | 3-5 | sesuai-buku |
| 3 | Profesi dan Peluang Usaha di Bidang DKV | **B1** BAB 1 — B. Prospek Profesi Desainer Komunikasi Visual | 6-10 | sesuai-buku |
| 4 | Potensi Diri, Ide Kreatif, dan Perencanaan Usaha Sederhana | **B1** BAB 1 — C. Mengenal Potensi Desainer sejak Dini + Rangkuman/Asesmen/Pengayaan BAB 1 | 11-16 | sesuai-buku |
| 5 | K3, Ergonomi, dan Kebiasaan Kerja Aman | **B1** BAB 2 Keutamaan Keselamatan dan Kesehatan Kerja — A. Keselamatan pada Individu Pekerja | 19-31 | sesuai-buku |
| 6 | Keselamatan Penggunaan Peralatan dan Perangkat Kerja | **B1** BAB 2 — B. Keselamatan pada Peralatan Kerja | 32-38 | sesuai-buku |
| 7 | Keselamatan Ruang Kerja serta Penanganan Hasil Pekerjaan | **B1** BAB 2 — C. Keselamatan pada Lingkungan Kerja + D. Keselamatan pada Hasil Kerja + Rangkuman & Asesmen BAB 2 | 39-50 | sesuai-buku |
| 8 | Perkembangan Industri dan Proses Produksi DKV | **B1** BAB 3 Perkembangan Teknologi Industri dan Dunia Kerja Bidang DKV — A. Perkembangan Proses Produksi Industri Kreatif (pengantar BAB 3 hal. 51-52) | 51-53 | sesuai-buku |
| 9 | Perkembangan Teknologi Industri dan Era Industri 4.0 | **B1** BAB 3 — B. Desain Komunikasi Visual dalam Industri 4.0 | 54-56 | sesuai-buku |
| 10 | Teknologi Digital dan Media dalam Pekerjaan DKV | **B1** BAB 3 — C. Teknologi Digital Desain Komunikasi Visual dalam Industri | 57-61 | sesuai-buku |
| 11 | Industri Kreatif dan Prinsip Kerja yang Memperhatikan Lingkungan | **B1** BAB 3 — D. DKV di Era Kemajuan Teknologi Industri + E. Konsep Industri Hijau + Rangkuman/Asesmen BAB 3 | 62-74 | sesuai-buku |
| 12 | Pengantar Kreativitas dan Eksplorasi Ide | **B1** BAB 4 Teknik Dasar Proses Produksi pada Industri DKV — A. Konsep Kreativitas | 77-79 | sesuai-buku |
| 13 | Berpikir Kreatif dan Pemecahan Masalah Desain | **B1** BAB 4 — B. Berpikir Kreatif | 80-81 | sesuai-buku |
| 14 | Penerapan Kreativitas dalam Industri DKV | **B1** BAB 4 — C. Kreativitas dalam Industri Kreatif | 82-83 | sesuai-buku |
| 15 | Alur Proses Produksi, Teknologi, dan Budaya Kerja | **B1** BAB 4 — D. Kreativitas Proses Produksi dan Teknologi + E. Budaya Kerja Desainer Komunikasi Visual + Rangkuman/Asesmen BAB 4 | 84-92 | sesuai-buku |
| 16 | Dasar Sketsa dan Ilustrasi | **B1** BAB 5 Sketsa dan Ilustrasi — A. Konsep dalam Sketsa dan Ilustrasi + B. Teknik Gambar Sketsa dan Ilustrasi + C. Jenis-Jenis Gambar Ilustrasi | 93-99 | sesuai-buku |
| 17 | Teknik Dasar Menggambar dan Ilustrasi Sesuai Cakupan Buku | **B1** BAB 5 — D. Memulai Sketsa dan Ilustrasi + E. Prinsip dan Unsur Desain | 100-115 | sesuai-buku |
| 18 | Unsur Visual, Pengembangan Konsep Sketsa, Refleksi, dan Evaluasi Semester | **B1** BAB 5 — F. Konsep Karya DKV melalui Sketsa + Rangkuman/Asesmen BAB 5 + Latihan Soal Semester 1 | 116-144 | sesuai-buku |
| 19 | Pengertian, Sejarah, dan Peran Tipografi | **B2** Bab 1 Tipografi — A. Sejarah Tipografi + B. Pengertian Tipografi | 4-6 | sesuai-buku |
| 20 | Jenis Huruf, Klasifikasi, dan Karakter Tipografi | **B2** Bab 1 — C. Jenis Tipografi (+ gambar 1.11-1.14 klasifikasi huruf) | 7-8, 15-18 | sesuai-buku |
| 21 | Anatomi Huruf dan Istilah Tipografi | **B2** Bab 1 — D. Fungsi, Anatomi, Prinsip, Lingkup Huruf, dan Layout dalam Tipografi (bagian fungsi & anatomi) | 9-13 | sesuai-buku |
| 22 | Fungsi Tipografi, Hierarki, dan Penerapan dalam Tata Letak | **B2** Bab 1 — D. ... Prinsip, Lingkup Huruf, dan Layout (legibility, readability, visibility, headline) | 13-21 | sesuai-buku |
| 23 | Leading, Kerning, Tracking, Keterbacaan, dan Keterlihatan | **B2** Bab 1 — E. Menjelaskan Pengertian Leading, Kerning, dan Tracking | 22-25 | sesuai-buku |
| 24 | Proyek Desain Berbasis Tipografi | **B2** Bab 1 — Rangkuman, Asesmen, Uji Kompetensi, Pengayaan, Refleksi (hal. 26-30) | 26-30 | sebagian |
| 25 | Pengenalan Kamera, Bagian Kamera, dan Perlengkapan Fotografi | **B2** Bab 2 Fotografi Dasar — A. Peralatan Kamera Fotografi + B. Bagian-Bagian Kamera DSLR | 34-48 | sesuai-buku |
| 26 | Segitiga Eksposur: Aperture, Shutter Speed, dan ISO | **B2** Bab 2 — C. Segitiga Exposure Kamera DSLR | 49-52 | sesuai-buku |
| 27 | Jenis dan Penerapan Fotografi | **B2** Bab 2 — D. Penggunaan Kamera DSLR + E. Alat Penunjang Fotografi Digital Indoor dan Outdoor + F. Jenis-Jenis Fotografi | 53-64 | sesuai-buku |
| 28 | Shot Size, Sudut Pengambilan Gambar, dan Komposisi | **B2** Bab 2 — G. Teknik Pengambilan Gambar Berdasarkan Ukuran Gambar dan Sudut Pengambilan (Angle) | 65-73 | sesuai-buku |
| 29 | Pencahayaan serta Praktik Foto Indoor dan Outdoor | **B2** Bab 2 — H. Pencahayaan pada Fotografi | 74-76 | sesuai-buku |
| 30 | Penyuntingan Foto Digital dan Evaluasi Hasil | **B2** Bab 2 — I. Penyuntingan Fotografi Digital + Rangkuman/Asesmen/Uji Kompetensi Bab 2 | 77-86 | sesuai-buku |
| 31 | Perbedaan Grafis Bitmap dan Vektor | **B2** Bab 3 Komputer Grafis — A. Pengertian Bitmap dan Vektor | 90-94 | sesuai-buku |
| 32 | Pengenalan Perangkat Lunak Grafis dan Kegunaannya | **B2** Bab 3 — B. Jenis-Jenis Perangkat Lunak Desain Grafis (pengenalan CorelDRAW, Adobe Illustrator, Adobe Photoshop) | 95-105 | sesuai-buku |
| 33 | Objek Vektor, Warna, Path, dan Fitur Pembentukan Objek | **B2** Bab 3 — B. Jenis-Jenis Perangkat Lunak Desain Grafis (praktik objek vektor & pembentukan objek) | 105-115 | sesuai-buku |
| 34 | Penyuntingan Gambar Bitmap dan Penggunaan Layer | **B2** Bab 3 — B. (praktik penyuntingan bitmap: seleksi, color range, color channels, panel layer) | 115-124 | sesuai-buku |
| 35 | Pembuatan Produk Grafis (Mug, Logo, Packaging, Kartu Nama) | **B2** Bab 3 — C. Produk Rancangan Komputer Grafis (1. Mug, 2. Logo, 3. Packaging, 4. Kartu Nama) | 124-137 | sesuai-buku |
| 36 | Proyek Terpadu, Portofolio, Presentasi, Asesmen Akhir, Remedial, Pengayaan, dan Refleksi | **B2** Bab 3 & penutup buku — Rangkuman/Asesmen/Uji Kompetensi BAB 3, Pengayaan, Refleksi + Latihan Soal Semester 2 + Glosarium | 138-157 | sesuai-buku |
## 6. Catatan penyesuaian & batasan (perlu verifikasi guru)

1. **Minggu 1 (orientasi, diagnostik, pengenalan aplikasi)** — usulan operasional; tidak ada bab khusus di buku (hanya "Petunjuk Penggunaan Buku" hal. xii–xiv). Dapat digabung ke minggu 2 bila minggu efektif berkurang.
2. **Minggu 8** diperkaya studi kasus: subbab **B1 3.A "Perkembangan Proses Produksi Industri Kreatif" hanya ±1 halaman** (hal. 53), sehingga ditambah pengantar BAB 3 (hal. 51–52) dan studi kasus agar cukup untuk 2×6 JP. Tercatat di field `catatanVerifikasi`.
3. **Minggu 24 (proyek tipografi)** — buku hanya menyediakan Refleksi/Asesmen/Uji Kompetensi/Pengayaan (hal. 26–30); proyek adalah **usulan guru**.
4. **Minggu 35 (produk grafis)** — sepenuhnya sesuai buku: tutorial produk **Mug (8 × 20 cm, CorelDRAW X7), Logo, Packaging, Kartu Nama** (hal. 124–137; alat bantu template gratis yang disebut buku: Freepik, Vecteezy, Flaticon).
5. **Asesmen buku diintegrasikan**: Asesmen BAB 1 pada minggu 4 (hal. 14–15), BAB 2 pada minggu 7 (hal. 46–49), BAB 3 pada minggu 11 (hal. 70–73), BAB 4 pada minggu 15 (hal. 89–91), BAB 5 pada minggu 18 (hal. 129–144 termasuk Latihan Soal Semester 1), Uji Kompetensi Bab 1 pada minggu 24 (hal. 28–29), Bab 2 pada minggu 30 (hal. 83–85), Bab 3 & Latihan Soal Semester 2 terpilih pada minggu 36 (hal. 139–156).
6. **Kalender pendidikan** SMKN 3 Kuningan belum tersedia pada saat analisis. Semua penomoran minggu adalah asumsi operasional; aplikasi menyediakan Pengaturan Kalender (admin) untuk menyesuaikan minggu efektif, libur, dan pekan asesmen tanpa mengubah kode.
7. **Alokasi menit** per tahap (yang selalu berjumlah 270 menit/pertemuan) adalah **template usulan**; guru dapat mengubahnya pada aplikasi (field agenda per minggu dapat diedit guru).
8. **Lisensi/aplikasi laboratorium**: buku mengacu pada CorelDRAW/Illustrator/Photoshop; bila laboratorium tidak tersedia lisensinya, sekolah dapat memakai alternatif (Inkscape/GIMP) sebagai padanan latihan — tercatat pada `catatanVerifikasi` minggu 32.
9. **Istilah**: aplikasi memakai istilah asli buku (mis. "segitiga exposure", "legibility/readability/visibility", "shot size"), dengan glosarium per minggu agar konsisten.

## 7. Rujukan fitur pedagogis dalam aplikasi (hubungan 5C)

Mapping yang dipakai aplikasi untuk menandai penerapan Deep Learning per minggu (bukan sekadar label — melekat pada aktivitas):
- **Mindful**: aktivitas refleksi terstruktur tiap pertemuan, ceklis ergonomi (m5), etika editing (m30).
- **Meaningful**: konteks nyata (industri kreatif lokal, UMKM, studio hijau, produk siap pakai m35).
- **Joyful**: sesi simulasi, debat peran, galeri karya, presentasi & apresiasi.
- **Critical thinking**: pembandingan konsep (m13), perbaikan headline (m22), prediksi eksposur (m26), studi kasus bitmap/vektor (m31).
- **Collaboration/Communication**: kerja kelompok, presentasi kilat, peer review di hampir seluruh minggu.
- **Connection to real life**: audit ruang kerja (m7), analisis peluang sekitar (m3), kebijakan studio hijau (m11), proyek produk grafis (m35–36).

## 8. Validasi silang halaman buku & matriks terperinci (pemeriksaan 13 Oktober 2026)

**Kalibrasi halaman cetak → berkas ekstraksi.** Teks hasil ekstraksi memakai penanda `<<<HAL n>>>` yang mengikuti **nomor halaman berkas PDF**, sedangkan kutipan pada data kurikulum memakai **nomor halaman cetak** buku. Selisih yang terukur: **Buku Sem 1 = +12** (halaman cetak 1 ada pada PDF 13) dan **Buku Sem 2 = +14** (halaman cetak 1 ada pada PDF 15). Selisih ini perlu diingat bila melakukan pengecekan manual.

**Hasil pemeriksaan.** Seluruh 35 rujukan bab/subbab pada 36 minggu dicek otomatis terhadap teks buku: **semuanya cocok** dengan judul subbab pada halaman yang dikutip. Selisih awal hanya muncul karena beberapa judul disingkat pada data (mis. "F. Konsep Karya DKV melalui Sketsa" → judul asli "F. Konsep Karya Desain Komunikasi Visual melalui Sketsa", hal. 116).

**Rujukan daftar isi yang dipakai sebagai patokan (halaman cetak):**
- Sem 1: BAB 1 h.1 · BAB 2 h.17 (A 19, B 32, C 39, D 41, Rangkuman 45, Pengayaan 50) · BAB 3 h.51 (A 53, B 54, C 57, D 62, E 67) · BAB 4 h.75 (A 77, B 80, C 82, D 84, E 85) · BAB 5 h.93 (A 95, B 96, C 98, D 100, E 107, F 116, Rangkuman 128, Pengayaan 132) · Latihan Soal Semester 1 h.133 · Glosarium h.145.
- Sem 2: Bab 1 Tipografi h.1 (A 4, B 6, C 7, D 9, E 22, Rangkuman 26, Asesmen 27, Uji Kompetensi 28, Pengayaan 29, Refleksi 30) · Bab 2 Fotografi Dasar h.31 (A 34, B 39, C 49, D 53, E 55, F 58, G 65, H 74, I 77, Rangkuman 82, Uji Kompetensi 85) · Bab 3 Komputer Grafis h.87 (A 90, B 95, C 124, Rangkuman 138, Asesmen 139, Uji Kompetensi 141) · Latihan Soal Semester 2 h.143 · Glosarium h.157.

**Matriks terperinci** (36 minggu × 2 pertemuan, 72 pertemuan, 432 JP) yang memuat topik, sumber & bab, tujuan usulan, konsep penting dari buku, aktivitas memahami/mengaplikasi/merefleksi, simulasi, asesmen, serta bukti portofolio tersedia di:
- `docs/06-matriks-36-minggu.md` (dokumen lengkap, termasuk rincian 72 pertemuan 6 JP/270 menit),
- `docs/06-matriks-36-minggu.csv` dan `docs/06-matriks-36-minggu.xlsx` (untuk diolah di Excel/Sheets),
- dibangkitkan ulang kapan saja dengan `python3 tools/gen-matriks.py`.

Tanda yang dipakai pada matriks: `〔B〕` dari buku (dengan bab/halaman) · `〔U〕` usulan desain pembelajaran · `⧗` perlu diverifikasi terhadap dokumen resmi sekolah · `⚠` perlu dikonfirmasi guru · `〔F〕` simulasi sudah berfungsi · `〔T7〕` simulasi masih dalam pengembangan.
