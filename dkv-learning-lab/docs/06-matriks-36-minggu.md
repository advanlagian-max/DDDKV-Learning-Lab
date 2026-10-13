# 06 — Matriks 36 Minggu & 72 Pertemuan (Analisis Buku DD DKV + Instrumen Supervisi)

Dasar: **Buku Siswa Dasar-Dasar Desain Komunikasi Visual Kelas X Semester 1 & 2 (Kemendikbudristek, 2022)** dan **Dokumen Instrumen Supervisi Akademik** sekolah. Disusun otomatis dari data kurikulum terverifikasi (`app/data/kurikulum-sem1.json`, `kurikulum-sem2.json`) memakai `tools/gen-matriks.py`.

Ringkasan: **36 minggu · 72 pertemuan · 432 JP · 19.440 menit** (setiap pertemuan 6 JP = 270 menit; 1 JP = 45 menit; 270 menit sudah termasuk transisi/istirahat).

> **Catatan kejujuran dokumen:** matriks ini adalah **rancangan operasional pembelajaran**, bukan ATP resmi dan bukan pengganti isi buku. Bagian yang bersumber dari buku ditandai `〔B〕` beserta bab/halaman; usulan desain pembelajaran ditandai `〔U〕`; hal yang harus diverifikasi terhadap dokumen resmi sekolah ditandai `⧗`; simulasi yang belum selesai ditandai `〔T7〕`.

---

## 1. Cara membaca tanda

| Tanda | Arti |
|---|---|
| 〔B〕 | **Bersumber buku** — teks/konsep/kegiatan berasal dari buku siswa; bab & halaman dicantumkan |
| 〔U〕 | **Usulan desain pembelajaran** — rumusan guru/penyusun, tidak diklaim sebagai isi buku |
| ⧗ | **Perlu diverifikasi** dengan dokumen resmi sekolah (CP, ATP, indikator, kalender) |
| ⚠ | **Isi/kata kunci perlu dikonfirmasi guru** sebelum dipakai (mis. istilah, lisensi perangkat lunak) |
| 〔F〕 | Simulasi digital **sudah berfungsi** dan sudah diuji di aplikasi |
| 〔T7〕 | Simulasi digital **belum selesai** (ditandai “dalam pengembangan” pada aplikasi) |

Kolom **Sumber & bab terkait** dan **Konsep penting** = isi buku (〔B〕). Kolom **Tujuan pembelajaran, Aktivitas memahami/mengaplikasi/merefleksi, Asesmen, dan Bukti portofolio** = usulan desain pembelajaran (〔U〕) dengan tetap berpijak pada aktivitas buku (mis. “Ayo Berdiskusi”, “Ayo Praktikkan”, “Ayo Berkreasi”).

## 2. Ringkasan analisis sumber

### 2.1 Buku Semester 1 (kode B1) — bab dan halaman cetak

| Bab/bagian | Halaman cetak | Dipakai pada |
|---|---|---|
| Petunjuk Penggunaan Buku | xii | — |
| BAB 1 Profil Technopreneur, Peluang Usaha, dan Profesi di Bidang DKV | 1–16 | Minggu 1–4 |
| BAB 2 Keutamaan Keselamatan dan Kesehatan Kerja | 17–50 | Minggu 5–7 |
| BAB 3 Perkembangan Teknologi Industri dan Dunia Kerja Bidang DKV | 51–74 | Minggu 8–11 |
| BAB 4 Teknik Dasar Proses Produksi (Kreativitas) pada Industri DKV | 75–92 | Minggu 12–15 |
| BAB 5 Sketsa dan Ilustrasi | 93–132 | Minggu 16–18 |
| Latihan Soal Akhir Semester 1 | 133–144 | Minggu 18 |
| Glosarium | ≥145 | rujukan istilah |

### 2.2 Buku Semester 2 (kode B2) — bab dan halaman cetak

| Bab/bagian | Halaman cetak | Dipakai pada |
|---|---|---|
| Bab 1 Tipografi (sejarah, jenis, anatomi, prinsip, leading/kerning/tracking) | 1–30 | Minggu 19–24 |
| Bab 2 Fotografi Dasar (kamera, segitiga eksposur, ukuran gambar, sudut, pencahayaan, penyuntingan) | 31–86 | Minggu 25–30 |
| Bab 3 Komputer Grafis (bitmap/vektor, perangkat lunak, praktik, produk) | 87–142 | Minggu 31–36 |
| Latihan Soal Akhir Semester 2 | 143–156 | Minggu 36 |
| Glosarium | ≥157 | rujukan istilah |

**Empat produk pada Bab 3.C** (dirujuk minggu 35): mug (8 × 20 cm, dibuat dengan CorelDRAW X7 pada buku), logo, packaging, kartu nama. 〔B〕 h. 135–137. Karena buku menyebut perangkat lunak berlisensi, praktik sekolah diarahkan ke alternatif bebas (Inkscape/GIMP) ⚠.

### 2.3 Instrumen Supervisi Akademik (kode SUP)

Skala **1–4**; aspek yang dinilai beserta sub-butir yang dipakai aplikasi:

| Aspek | Sub-butir pada matriks |
|---|---|
| C.1 Perencanaan | tujuan jelas & terukur; materi sesuai CP/materi buku; strategi pembelajaran mendalam; diferensiasi |
| C.2 Pelaksanaan | pendahuluan/apersepsi; interaksi guru–murid; aktivitas murid; kolaborasi; pemanfaatan teknologi & sumber belajar |
| C.3 Penerapan Deep Learning (5C) | Critical Thinking, Creativity, Collaboration, Communication, Connection to Real Life |
| C.4 Asesmen & Refleksi | asesmen formatif berjalan; sumatif/praktik; refleksi guru; refleksi murid |

Catatan instrumen: integrasi program sekolah (Adiwiyata, Gapura Pancawaluya, Gerakan Indonesia ASRI, Literasi & Numerasi, S3, SimPel) ke dalam modul ajar dan pelaksanaan pembelajaran. Kolom `catatanSupervisi` pada tiap minggu memetakan rencana ke aspek C.1–C.4 (kata kunci: perencanaan, pelaksanaan, asesmen, deepLearning/mindful). Tanda tangan dokumen asli: Saidun, S.Pd., M.M. (NIP 197009201994021002).

### 2.4 Status CP, ATP, dan kalender ⧗

- Buku siswa **tidak memuat rumusan CP/ATP**; seluruh tujuan pembelajaran di matriks ini adalah **usulan** yang menunggu verifikasi terhadap dokumen kurikulum resmi sekolah ⧗.
- Basis kurikulum yang dirujuk: Kepmen BSKAP No. 008/H/KR/2022 dan 033/H/KR/2022 (rujukan dokumen resmi) — **kutipan pasalnya tidak diklaim** di aplikasi ini.
- Kalender pendidikan sekolah belum tersedia; minggu efektif & pekan asesmen pada matriks masih asumsi (Sem 1 minggu 1–18, Sem 2 minggu 19–36) ⧗.
- Validasi silang rujukan halaman: seluruh judul subbab pada kolom sumber dicek otomatis terhadap teks hasil ekstraksi buku (halaman cetak → berkas PDF: Sem 1 +12, Sem 2 +14). Hasil: **semua rujukan halaman cocok**; selisih awal hanya karena penyingkatan judul subbab.

---

## 3. Matriks Semester 1 (minggu 1–18)

Setiap baris = 1 minggu = 2 pertemuan (Senin & Rabu), masing-masing 6 JP / 270 menit.

| Minggu | Topik (Senin / Rabu) | Sumber & bab terkait | Tujuan pembelajaran (usulan) | Konsep penting (dari buku) | Aktivitas memahami | Aktivitas mengaplikasi | Aktivitas merefleksi | Simulasi/praktik | Asesmen | Bukti portofolio |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** (Sm 1) | **Senin:** Tur pembelajaran & asesmen diagnostik<br>**Rabu:** Kontrak belajar & pengenalan aplikasi | 〔B〕 B1 Petunjuk Penggunaan Buku (hal. xii-xiv)<br>〔B〕 Instrumen Supervisi Akademik (aspek C.1–C.4)<br>Status sumber: **sebagian buku + usulan**<br>⚠ Minggu orientasi adalah usulan operasional di luar bab buku; dapat digabung dengan minggu 2 bila minggu efektif berkurang. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan cakupan mata pelajaran Dasar-Dasar DKV dan kaitannya dengan kompetensi keahlian DKV. 2) Mengidentifikasi minat, pengalaman awal, dan gaya belajar melalui asesmen diagnostik. 3) Menggunakan aplikasi DKV Learning Lab (login, membuka materi, menyimpan portofolio) sesuai prosedur. | 〔B〕 Peta mata pelajaran DD DKV: 5 bab semester 1 (technopreneur, K3, teknologi industri, proses produksi, sketsa & ilustrasi) dan 3 bab semester 2 (tipografi, fotografi, komputer grafis) sesuai daftar isi buku.<br>〔B〕 Cara menggunakan buku teks: fitur Aktivitas, Rangkuman, Asesmen, Pengayaan, Latihan Soal (Petunjuk Penggunaan Buku).<br>〔B〕 Kontrak dan budaya belajar DKV: disiplin, kebersihan studio, kejujuran karya, kolaborasi.<br>〔B〕 Alur aplikasi: dashboard, materi 36 minggu, simulasi, LKPD, asesmen, portofolio. | 1) Menelaah peta materi 36 minggu di aplikasi; 2) Menyimak struktur buku teks | 1) Login & menelusuri aplikasi mandiri; 2) Mengunggah karya awal ke portofolio | 1) Menuliskan target belajar pribadi semester 1; 2) Menuliskan satu kekhawatiran dan satu harapan | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: kuis-diagnostik — 15 soal; cakupan: Pengetahuan awal desain, alat, keselamatan kerja 〔U〕 | 〔U〕 LKPD: LKPD 01 - Peta Diri & Kontrak Belajar DKV (lembar kerja terisi) + refleksi minggu ini |
| **2** (Sm 1) | **Senin:** Pengertian & tujuan technopreneurship<br>**Rabu:** Praktik: peluang technopreneur DKV di sekitar kita | 〔B〕 B1 BAB 1 Profil Technopreneur, Peluang Usaha, dan Profesi di Bidang DKV · A. Technopreneur Desain Komunikasi Visual (hal. 3-5)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan pengertian technopreneur dan technopreneurship dengan bahasa sendiri. 2) Mengidentifikasi tujuan dan karakter wirausaha bidang DKV. 3) Menyebutkan contoh pemanfaatan teknologi oleh technopreneur DKV. | 〔B〕 Pengertian technopreneur: gabungan techno (teknologi) dan entrepreneur (wirausaha), yaitu pemanfaatan kemajuan teknologi untuk berwirausaha (hal. 3).<br>〔B〕 Tujuan berwirausaha: keuntungan, lapangan kerja, inovasi, kemandirian ekonomi.<br>〔B〕 Karakter wirausaha yang dibangun sejak dini: kreativitas, inovasi, kepekaan peluang, keberanian mengambil risiko terukur.<br>〔B〕 Contoh praktik technopreneur DKV: jasa desain daring, konten kreator, studio digital, penjualan produk desain. | 1) Membaca & merumuskan definisi technopreneur; 2) Menganalisis contoh technopreneur DKV | 1) Menjalankan simulasi ide usaha; 2) Menyusun mini-profil ide usaha | 1) Menilai kesesuaian karakter wirausaha dengan diri; 2) Menuliskan ide usaha yang ingin dieksplorasi | Simulasi Technopreneurship DKV (`sim-technopreneur`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Pengertian, tujuan, karakter technopreneur 〔U〕 | 〔U〕 LKPD: LKPD 02 - Peta Ide Technopreneur DKV (lembar kerja terisi) + refleksi minggu ini |
| **3** (Sm 1) | **Senin:** Menjelajah profesi DKV<br>**Rabu:** Peluang & perencanaan usaha DKV | 〔B〕 B1 BAB 1 · B. Prospek Profesi Desainer Komunikasi Visual (hal. 6-10)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Mengidentifikasi minimal enam profesi DKV beserta lingkup pekerjaannya. 2) Menjelaskan hubungan peluang usaha dan perencanaan yang matang. 3) Membandingkan tuntutan kompetensi dua profesi DKV yang diminati. | 〔B〕 Peluang dan perencanaan saling berkaitan; perencanaan adalah hal mendasar dalam membangun usaha (hal. 6).<br>〔B〕 Profil profesi DKV: ilustrator, komikus, desainer grafis, animator, fotografer indoor/outdoor, videografer, editor video (gambar 1.1-1.8).<br>〔B〕 Tujuan penggunaan DKV: menyampaikan informasi, pesan, instruksi, dan persuasi.<br>〔B〕 Peluang kerja: industri kreatif, studio, media, periklanan, hingga wirausaha mandiri. | 1) Menganalisis lingkup 6+ profesi DKV; 2) Menelaah tujuan penggunaan DKV | 1) Memetakan peluang jasa DKV di sekitar; 2) Menyusun perencanaan sederhana | 1) Menilai kesesuaian diri dengan profesi pilihan; 2) Menuliskan langkah pertama pekan ini | Simulasi Technopreneurship DKV (mode peluang & harga) (`sim-technopreneur`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: kuis-mencocokkan — 8 soal; cakupan: Profesi DKV dan deskripsi pekerjaan 〔U〕 | 〔U〕 LKPD: LKPD 03 - Analisis Profesi & Peluang Usaha DKV (lembar kerja terisi) + refleksi minggu ini |
| **4** (Sm 1) | **Senin:** Potensi diri & munculnya ide kreatif<br>**Rabu:** Praktik rencana usaha sederhana + asesmen BAB 1 | 〔B〕 B1 BAB 1 · C. Mengenal Potensi Desainer sejak Dini + Rangkuman/Asesmen/Pengayaan BAB 1 (hal. 11-16)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Mengidentifikasi potensi diri (kreativitas dan inovasi) sebagai calon desainer. 2) Menjelaskan bagaimana ide kreatif muncul menurut Zimmerer (Suryana, 2003) pada buku hal. 11. 3) Menyusun rencana usaha sederhana bidang DKV secara berkelompok. | 〔B〕 Desainer perlu kreativitas dan inovasi tinggi; kreativitas adalah kemampuan berpikir menemukan ide baru.<br>〔B〕 Zimmerer (Suryana, 2003): ide-ide kreatif sering muncul ketika wirausaha (lihat buku hal. 11) - kaitkan dengan kebiasaan mengamati dan mencatat.<br>〔B〕 Mengenal potensi diri: minat, bakat, keterampilan awal, dan cara mengembangkannya.<br>〔B〕 Penyusunan rencana usaha sederhana: ide, sasaran pengguna, produk/jasa, cara produksi, perkiraan biaya & harga. | 1) Menelaah konsep kreativitas & inovasi; 2) Menganalisis contoh rencana usaha | 1) Latihan 10 alternatif ide; 2) Menyusun kanvas rencana usaha | 1) Memetakan potensi diri; 2) Menuliskan komitmen latihan kreativitas mingguan | Simulasi Technopreneurship DKV (uji harga & kelayakan) (`sim-technopreneur`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: Kuis pilihan ganda — 8 soal; cakupan: BAB 1 utuh 〔U〕 | 〔U〕 LKPD: LKPD 04 - Kanvas Rencana Usaha Sederhana DKV (lembar kerja terisi) + refleksi minggu ini |
| **5** (Sm 1) | **Senin:** Ergonomi kerja desainer<br>**Rabu:** Praktik K3: fotografi & pekerjaan fisik ringan | 〔B〕 B1 BAB 2 Keutamaan Keselamatan dan Kesehatan Kerja · A. Keselamatan pada Individu Pekerja (hal. 19-31)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan prinsip ergonomi posisi kerja duduk dan berdiri. 2) Mencontohkan posisi kerja aman untuk desain, fotografi, dan videografi. 3) Memperbaiki postur kerja sendiri berdasarkan prinsip K3. | 〔B〕 Ergonomi duduk di depan komputer: posisi tubuh, jangkauan tangan, ketinggian kursi sampai siku menekuk tegak lurus meja (gambar 2.1-2.3).<br>〔B〕 Postur saat pengambilan gambar beragam sudut termasuk posisi low angle (gambar 2.4).<br>〔B〕 Posisi yang tidak disarankan: menggambar dengan bersandar dan kaki menekuk menopang pekerjaan (gambar 2.5).<br>〔B〕 Bekerja berdiri tegak/tidak membungkuk (2.6), pijakan tambahan (2.7), kaki pivot saat following shot (2.8), minta bantuan saat mengangkat beban berat (2.9). | 1) Menelaah aturan ergonomi; 2) Mengidentifikasi risiko postur | 1) Mengoreksi postur teman dengan ceklis; 2) Mempraktikkan posisi memotret aman | 1) Menilai kebiasaan kerja sendiri; 2) Menetapkan satu target perbaikan ergonomi | Simulasi K3 & Ergonomi Kerja Desain (`sim-k3-ergonomi`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Ergonomi duduk, posisi fotografi, angkat beban 〔U〕 | 〔U〕 LKPD: LKPD 05 - Ceklis Ergonomi & Posisi Kerja Aman (lembar kerja terisi) + refleksi minggu ini |
| **6** (Sm 1) | **Senin:** Prosedur perawatan peralatan<br>**Rabu:** Manajemen data & jadwal perawatan | 〔B〕 B1 BAB 2 · B. Keselamatan pada Peralatan Kerja (hal. 32-38)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan prosedur perawatan dan penyimpanan peralatan kerja DKV. 2) Mendemonstrasikan penggunaan alat kerja yang aman (pensil, cutter, kuas, kamera, flashdisk). 3) Menyusun jadwal perawatan peralatan studio kelas. | 〔B〕 Semua alat kerja memiliki cara perawatan dan penggunaan berbeda; kelalaian merusak alat dan mengganggu produksi (hal. 32).<br>〔B〕 Menjaga ketajaman ujung pensil dengan peraut/cutter (2.10); tempat penyimpanan dari botol plastik bekas (2.11).<br>〔B〕 Menyimpan kuas dengan bulu menghadap ke atas (2.12); tidak menyentuh lensa kamera dengan jari (2.13).<br>〔B〕 Pengelolaan data: penutup flashdisk hilang berisiko merusak file; rutin menyalin/memindahkan data (hal. 37-38). | 1) Menelaah prosedur perawatan; 2) Mengidentifikasi akibat kelalaian | 1) Praktik perawatan & penataan alat; 2) Menyusun struktur folder karya | 1) Menilai tanggung jawab terhadap alat bersama; 2) Menetapkan kebiasaan pengelolaan file | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Perawatan alat & penanganan data 〔U〕 | 〔U〕 LKPD: LKPD 06 - Perawatan Alat & Pengelolaan Data Karya (lembar kerja terisi) + refleksi minggu ini |
| **7** (Sm 1) | **Senin:** Lingkungan kerja aman & nyaman<br>**Rabu:** Penanganan hasil karya + asesmen BAB 2 | 〔B〕 B1 BAB 2 · C. Keselamatan pada Lingkungan Kerja + D. Keselamatan pada Hasil Kerja + Rangkuman & Asesmen BAB 2 (hal. 39-50)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan syarat lingkungan kerja aman dan sehat (cahaya, sirkulasi udara, kelayakan ruang). 2) Menerapkan cara menangani hasil karya (kertas/digital) agar tidak rusak. 3) Menyelesaikan asesmen BAB 2 secara mandiri dan jujur. | 〔B〕 Lingkungan kerja luar ruangan: keamanan dari risiko kecelakaan, cuaca ekstrem, kelayakan lingkungan/bangunan (hal. 39).<br>〔B〕 Lingkungan kerja dalam ruangan: sirkulasi udara dengan exhaust fan, pengaturan titik lampu, ruang praktik dengan cahaya cukup (gambar 2.14-2.15).<br>〔B〕 Hasil kerja DKV: gambar manual/digital, fotografi, videografi - media penyampai pesan: informasi, ajakan, larangan, perintah, imbauan (hal. 41).<br>〔B〕 Unsur media: visual (gambar, warna, ornamen, tipografi, foto) dan verbal (judul, subjudul, slogan, paragraf pesan); penanganan karya kertas dengan hati-hati (2.16-2.17). | 1) Menelaah syarat lingkungan kerja aman; 2) Menganalisis unsur media visual & verbal | 1) Menyusun rekomendasi perbaikan ruang; 2) Mempraktikkan penanganan karya | 1) Menilai kebersihan & keamanan ruang latihan sendiri; 2) Menyimpulkan pentingnya K3 bagi kualitas karya | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Lingkungan kerja & penanganan hasil kerja 〔U〕 | 〔U〕 LKPD: LKPD 07 - Audit Ringan Ruang Kerja & Perawatan Karya (lembar kerja terisi) + refleksi minggu ini |
| **8** (Sm 1) | **Senin:** Industri kreatif & posisi DKV<br>**Rabu:** Menelusuri proses produksi DKV | 〔B〕 B1 BAB 3 Perkembangan Teknologi Industri dan Dunia Kerja Bidang DKV · A. Perkembangan Proses Produksi Industri Kreatif (pengantar BAB 3 hal. 51-52) (hal. 51-53)<br>Status sumber: **sesuai buku**<br>⚠ Pengantar BAB 3 (hal. 51-52) ditambahkan; subbab A buku relatif singkat (1 halaman) sehingga diperkaya studi kasus agar cukup untuk 6 JP + 6 JP. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan peran industri kreatif bagi perekonomian nasional. 2) Menjelaskan posisi DKV sebagai subsektor ekonomi kreatif yang tumbuh pesat. 3) Menemukan contoh perkembangan proses produksi DKV di lingkungan sekitar. | 〔B〕 Industri kreatif di Indonesia menjadi motor penggerak perekonomian nasional (hal. 53).<br>〔B〕 DKV merupakan salah satu dari empat subsektor ekonomi kreatif yang mengalami pertumbuhan sangat pesat.<br>〔B〕 Peranan DKV: memberikan dampak besar pada subsektor ekonomi kreatif di Indonesia (kemasan, iklan, identitas visual, media digital).<br>〔B〕 Pengantar BAB 3: perkembangan teknologi industri dan dunia kerja bidang DKV (hal. 51-52). | 1) Menelaah peran industri kreatif nasional; 2) Mengidentifikasi subsektor ekonomi kreatif | 1) Memetakan contoh peran DKV; 2) Membedah alur produksi contoh karya | 1) Menghubungkan pertumbuhan industri dengan rencana karier pribadi | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Industri kreatif & subsektor DKV 〔U〕 | 〔U〕 LKPD: LKPD 08 - Peta Industri Kreatif & Peran DKV (lembar kerja terisi) + refleksi minggu ini |
| **9** (Sm 1) | **Senin:** Dari revolusi industri ke Industri 4.0<br>**Rabu:** Industri 4.0 dan masa depan kerja DKV | 〔B〕 B1 BAB 3 · B. Desain Komunikasi Visual dalam Industri 4.0 (hal. 54-56)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan pengertian revolusi industri dan latar sejarahnya. 2) Menjelaskan ciri Industri 4.0 dan implikasinya bagi dunia kerja DKV. 3) Menganalisis perubahan cara produksi karya sebelum dan sesudah Industri 4.0. | 〔B〕 Revolusi industri adalah perubahan besar cara manusia mengolah sumber daya dan memproduksi barang; berawal dari fenomena tahun 1750-1850 (hal. 54).<br>〔B〕 Pada masa itu terjadi perubahan besar di bidang pertanian, transportasi, dan manufaktur.<br>〔B〕 Industri 4.0 ditandai digitalisasi, otomasi, dan keterhubungan sistem produksi.<br>〔B〕 Implikasi bagi DKV: produksi karya lebih cepat, kolaborasi jarak jauh, tuntutan keterampilan digital. | 1) Menelaah latar revolusi industri; 2) Mengidentifikasi ciri Industri 4.0 | 1) Menyusun garis waktu revolusi industri-DKV; 2) Berargumen dalam diskusi peran | 1) Menilai kesiapan diri menghadapi kerja digital | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Revolusi industri, Industri 4.0, dampak DKV 〔U〕 | 〔U〕 LKPD: LKPD 09 - Garis Waktu Revolusi Industri & Dampak DKV (lembar kerja terisi) + refleksi minggu ini |
| **10** (Sm 1) | **Senin:** Peralihan teknologi analog-digital<br>**Rabu:** Praktik: memilih alat digital sesuai kebutuhan karya | 〔B〕 B1 BAB 3 · C. Teknologi Digital Desain Komunikasi Visual dalam Industri (hal. 57-61)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan peralihan teknologi analog/manual ke digital dalam industri DKV. 2) Mengidentifikasi manfaat teknologi digital bagi efisiensi dan mutu produksi. 3) Membandingkan alat kerja analog dan digital untuk satu jenis karya. | 〔B〕 Peralihan teknologi digital menggantikan teknologi analog dan manual telah menghasilkan proses produksi yang lebih efisien dan bermutu tinggi (hal. 57).<br>〔B〕 Peralatan analog beralih menggunakan peralatan digital (kamera, alat gambar, percetakan).<br>〔B〕 Jalan panjang penggunaan teknologi digital dalam industri DKV.<br>〔B〕 Dampak: kecepatan revisi, kemudahan duplikasi, konsistensi hasil, dan kolaborasi. | 1) Menelaah alasan peralihan teknologi; 2) Mengidentifikasi manfaat digitalisasi | 1) Membandingkan proses manual & digital; 2) Menyusun tabel rekomendasi alat | 1) Menilai keterampilan digital pribadi saat ini | Simulasi Bitmap vs Vektor (pratinjau digitalisasi gambar) (`sim-bitmap-vektor`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Peralihan analog-digital & manfaatnya 〔U〕 | 〔U〕 LKPD: LKPD 10 - Analog vs Digital: Pilihan Alat Kerja DKV (lembar kerja terisi) + refleksi minggu ini |
| **11** (Sm 1) | **Senin:** Siklus industri & teknologi<br>**Rabu:** Praktik kerja ramah lingkungan + asesmen BAB 3 | 〔B〕 B1 BAB 3 · D. DKV di Era Kemajuan Teknologi Industri + E. Konsep Industri Hijau + Rangkuman/Asesmen BAB 3 (hal. 62-74)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan siklus industri: praproduksi, produksi, dan pascaproduksi. 2) Menjelaskan konsep industri hijau dan penerapannya pada pekerjaan DKV. 3) Menyusun usulan praktik kerja DKV yang lebih ramah lingkungan. | 〔B〕 Kemajuan teknologi industri memberikan kemudahan dan hasil yang lebih baik serta konsisten pada produk DKV (hal. 62).<br>〔B〕 Siklus industri: praproduksi (perancangan & persiapan sumber daya), produksi, dan pascaproduksi hingga menjadi barang jadi (hal. 67).<br>〔B〕 Konsep industri hijau: produksi yang memperhatikan lingkungan.<br>〔B〕 Penerapan pada DKV: hemat kertas & tinta, pengelolaan limbah cetak, pemanfaatan bahan daur ulang, desain hemat energi. | 1) Menelaah konsep industri hijau; 2) Mengidentifikasi tahap siklus industri | 1) Memetakan peran DKV pada siklus; 2) Menyusun kebijakan studio hijau | 1) Menilai kebiasaan kerja sendiri dari sisi lingkungan | Simulasi Alur Produksi DKV (menyusun tahapan produksi) (`sim-alur-produksi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Siklus industri & industri hijau 〔U〕 | 〔U〕 LKPD: LKPD 11 - Studio DKV Hijau & Siklus Produksi (lembar kerja terisi) + refleksi minggu ini |
| **12** (Sm 1) | **Senin:** Kreativitas dari masalah ke ide<br>**Rabu:** Mengasah eksplorasi ide | 〔B〕 B1 BAB 4 Teknik Dasar Proses Produksi pada Industri DKV · A. Konsep Kreativitas (hal. 77-79)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan konsep kreativitas sebagai respons terhadap masalah. 2) Membedakan peran latar belakang permasalahan dalam melahirkan solusi desain. 3) Menghasilkan banyak alternatif ide dari satu latar belakang masalah. | 〔B〕 Kreativitas dibutuhkan ketika manusia menghadapi masalah dan harus mencari solusinya (hal. 77).<br>〔B〕 Masalah berasal dari sendi kehidupan masyarakat: sosial, budaya, ekonomi, sains, teknologi.<br>〔B〕 Solusi awalnya berangkat dari suatu ide untuk menjawab latar belakang permasalahan.<br>〔B〕 Alur dasar: latar belakang masalah, ide, alternatif solusi, karya desain. | 1) Menelaah hubungan masalah-ide-solusi; 2) Menganalisis latar belakang masalah karya nyata | 1) Latihan problem-15 ide; 2) Mengembangkan 10 alternatif solusi visual | 1) Menilai cara saya menyalurkan ide ketika buntu; 2) Menuliskan kebiasaan yang meningkatkan produktivitas ide | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Konsep kreativitas & alur masalah-ide 〔U〕 | 〔U〕 LKPD: LKPD 12 - Problem to Ide: Eksplorasi Solusi Visual (lembar kerja terisi) + refleksi minggu ini |
| **13** (Sm 1) | **Senin:** Berpikir dari sudut pandang berbeda<br>**Rabu:** Praktik pemecahan masalah desain | 〔B〕 B1 BAB 4 · B. Berpikir Kreatif (hal. 80-81)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan berpikir kreatif sebagai cara memandang masalah dari sudut pandang berbeda. 2) Menghasilkan solusi desain yang dapat dipertanggungjawabkan alasannya. 3) Menerapkan teknik pemecahan masalah pada kasus desain sederhana. | 〔B〕 Berpikir kreatif bukan berpikir angka; ia adalah cara berpikir dari sudut pandang berbeda dalam memecahkan masalah (hal. 80).<br>〔B〕 Orang kreatif kadang dianggap antik/unik, asalkan memiliki alasan yang jelas dan dapat dipertanggungjawabkan.<br>〔B〕 Tingkat efektivitas solusi ditentukan oleh kesesuaian ide dengan masalah & konteks.<br>〔B〕 Latihan: membalik asumsi, meminjam sudut pandang pengguna, dan menggabungkan gagasan. | 1) Menelaah definisi berpikir kreatif; 2) Menganalisis syarat ide yang dapat dipertanggungjawabkan | 1) Latihan membalik asumsi; 2) Menyelesaikan kasus desain dengan 2 alternatif konsep | 1) Menilai keberanian diri memunculkan ide tidak biasa; 2) Menuliskan standar pertanggungjawaban ide saya | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Berpikir kreatif & pertanggungjawaban ide 〔U〕 | 〔U〕 LKPD: LKPD 13 - Kasus Desain: 2 Konsep & Alasannya (lembar kerja terisi) + refleksi minggu ini |
| **14** (Sm 1) | **Senin:** Kreativitas sebagai nilai jual<br>**Rabu:** Praktik: menaikkan nilai karya dengan kreativitas | 〔B〕 B1 BAB 4 · C. Kreativitas dalam Industri Kreatif (hal. 82-83)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan mengapa nilai jual industri kreatif bergantung pada kreativitas. 2) Menganalisis peran kreativitas pada contoh produk industri kreatif. 3) Menilai peluang pengembangan kreativitas pada karya sendiri. | 〔B〕 Industri kreatif menitikberatkan produksi melalui pemanfaatan sumber daya proses kreatif (hal. 82).<br>〔B〕 Nilai jual bergantung seberapa banyak kreativitas dilibatkan; makin banyak, makin tinggi nilainya.<br>〔B〕 Kreativitas menjadi pembeda produk di pasar.<br>〔B〕 Penerapan: identitas visual, kemasan, konten promosi, pengalaman pengguna. | 1) Menelaah hubungan kreativitas-nilai jual; 2) Menganalisis studi kasus produk | 1) Menilai produk lokal; 2) Meredesain karya sederhana | 1) Menilai perkembangan kreativitas karya saya | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Kreativitas dalam industri kreatif 〔U〕 | 〔U〕 LKPD: LKPD 14 - Redesain: Dari Biasa ke Bernilai (lembar kerja terisi) + refleksi minggu ini |
| **15** (Sm 1) | **Senin:** Kreativitas proses produksi & teknologi<br>**Rabu:** Budaya kerja desainer + asesmen BAB 4 | 〔B〕 B1 BAB 4 · D. Kreativitas Proses Produksi dan Teknologi + E. Budaya Kerja Desainer Komunikasi Visual + Rangkuman/Asesmen BAB 4 (hal. 84-92)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan bagaimana kreativitas proses produksi dan teknologi menentukan mutu produk. 2) Membedakan media konvensional dan nonkonvensional dalam pekerjaan desainer. 3) Menjelaskan budaya kerja profesional desainer komunikasi visual. | 〔B〕 Kreativitas proses produksi dan teknologi memberi mutu pada produk yang dihasilkan (hal. 84).<br>〔B〕 Produk tidak selalu baru; dapat berupa pengembangan produk yang sudah ada (contoh pada buku: ojek pangkalan vs ojek online, gambar 4.6).<br>〔B〕 Budaya kerja desainer: memecahkan masalah secara kreatif melalui berbagai media komunikasi visual (hal. 85).<br>〔B〕 Media konvensional (poster, leaflet, brosur, media cetak) dan nonkonvensional (media digital & pengalaman). | 1) Menelaah faktor mutu produk; 2) Mengidentifikasi media konvensional & nonkonvensional | 1) Memetakan pengembangan produk; 2) Simulasi peran kerja studio | 1) Menilai kesiapan budaya kerja profesional saya | Simulasi Alur Produksi DKV (urutan tahapan & revisi) (`sim-alur-produksi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Proses produksi, mutu, media, budaya kerja 〔U〕 | 〔U〕 LKPD: LKPD 15 - Pengembangan Produk & Budaya Kerja Studio (lembar kerja terisi) + refleksi minggu ini |
| **16** (Sm 1) | **Senin:** Konsep karya & teknik sketsa<br>**Rabu:** Jenis ilustrasi & mulai berkarya | 〔B〕 B1 BAB 5 Sketsa dan Ilustrasi · A. Konsep dalam Sketsa dan Ilustrasi + B. Teknik Gambar Sketsa dan Ilustrasi + C. Jenis-Jenis Gambar Ilustrasi (hal. 93-99)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan konsep karya sebagai gagasan awal berkarya DKV. 2) Menerapkan minimal dua teknik gambar sketsa/ilustrasi. 3) Membedakan jenis-jenis gambar ilustrasi dan penggunaannya. | 〔B〕 Konsep karya = gagasan/ide sebelum membuat karya; merupakan kegiatan awal berkarya yang melibatkan proses berpikir, diawali menentukan tema (hal. 95).<br>〔B〕 Teknik gambar sketsa & ilustrasi, antara lain teknik arsir: membuat garis sejajar/menyilang untuk kesan gelap-terang (hal. 96).<br>〔B〕 Sketsa adalah gambar rancangan kasar yang dibuat cepat dan tidak menuntut detail.<br>〔B〕 Jenis gambar ilustrasi: kartun 2D dan 3D, dan jenis lain sesuai buku (hal. 98-99). | 1) Menelaah konsep karya & alur berkarya; 2) Menganalisis jenis ilustrasi | 1) Latihan teknik arsir; 2) Membuat 3 sketsa konsep | 1) Menilai perkembangan keterampilan sketsa saya | Laboratorium Sketsa (papan latihan digital: garis, arsir, komposisi) (`sim-sketsa-lab`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Konsep karya, teknik, jenis ilustrasi 〔U〕 | 〔U〕 Proyek: Proyek Mini: Sketsa Konsep Poster Sekolah (individu) — luaran: 3 sketsa konsep (pilih 1 untuk penyelesaian pada minggu 18); tenggat Minggu 18 + refleksi minggu ini |
| **17** (Sm 1) | **Senin:** Alat, bahan, dan langkah memulai sketsa<br>**Rabu:** Prinsip & unsur desain dalam karya | 〔B〕 B1 BAB 5 · D. Memulai Sketsa dan Ilustrasi + E. Prinsip dan Unsur Desain (hal. 100-115)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menggunakan alat sketsa/ilustrasi sesuai jenis dan fungsinya. 2) Menjelaskan prinsip desain: kesatuan, keseimbangan, proporsi, penekanan, irama. 3) Menerapkan prinsip dan unsur desain pada karya sketsa. | 〔B〕 Alat sketsa/ilustrasi: pensil digolongkan keras (4H-9H), sedang (H, HB, F, 2H, 3H), dan lunak (black/B); pemilihan alat memengaruhi hasil (hal. 100).<br>〔B〕 Memulai sketsa: sikap kerja, urutan menggambar, pengembangan bentuk dasar ke detail.<br>〔B〕 Prinsip desain (hal. 107): kesatuan, keseimbangan, proporsi, penekanan, dan irama.<br>〔B〕 Penerapan prinsip pada susunan karya; pengenalan unsur desain visual yang menyusun karya. | 1) Menelaah fungsi alat gambar; 2) Menjelaskan 5 prinsip desain | 1) Latihan tahapan menggambar; 2) Menerapkan prinsip desain pada sketsa | 1) Menilai kualitas komposisi karya sendiri | Laboratorium Sketsa (latihan komposisi & prinsip desain) (`sim-sketsa-lab`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Alat gambar & prinsip desain 〔U〕 | 〔U〕 Proyek: Proyek Mini: Sketsa Konsep Poster Sekolah (lanjutan) (individu) — luaran: Karya sketsa final dengan prinsip desain; tenggat Minggu 18 + refleksi minggu ini |
| **18** (Sm 1) | **Senin:** Dari sketsa menjadi karya<br>**Rabu:** Presentasi karya, asesmen, dan refleksi semester | 〔B〕 B1 BAB 5 · F. Konsep Karya DKV melalui Sketsa + Rangkuman/Asesmen BAB 5 + Latihan Soal Semester 1 (hal. 116-144)<br>Status sumber: **sesuai buku**<br>⚠ Latihan Soal Semester 1 (hal. 133-144) digunakan sebagai bagian asesmen sumatif; jumlah butir & bobot menyesuaikan kebijakan guru. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Mengembangkan sketsa menjadi konsep karya DKV yang utuh. 2) Menyebutkan bentuk karya cetak yang dapat diwujudkan dari sketsa/ilustrasi (poster, majalah, komik, dan lain-lain). 3) Menyelesaikan asesmen akhir semester dan refleksi pembelajaran. | 〔B〕 Karya sketsa & ilustrasi dapat diwujudkan pada karya-karya cetak: poster, majalah, komik, dan lain-lain (hal. 116).<br>〔B〕 Poster adalah karya desain grafis pada selembar kertas yang memuat komposisi gambar dan huruf (buku hal. 116).<br>〔B〕 Pengembangan konsep: dari sketsa terpilih menuju karya yang memiliki pesan jelas.<br>〔B〕 Evaluasi semester: rangkuman, asesmen bab 5, latihan soal semester 1, refleksi capaian. | 1) Menelaah bentuk karya cetak dari sketsa; 2) Meninjau prinsip desain pada karya | 1) Menyelesaikan karya akhir; 2) Mempresentasikan karyanya | 1) Menilai capaian semester 1; 2) Menetapkan target semester 2 | Laboratorium Sketsa (penyelesaian konsep karya) (`sim-sketsa-lab`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: Asesmen sumatif BAB & semester — 20 soal; cakupan: Asesmen BAB 5 & Latihan Soal Semester 1 (buku hal. 129-144) 〔U〕<br>**＋ pekan asesmen sumatif/uji kompetensi** | 〔U〕 Proyek: Proyek Mini: Karya Cetak dari Sketsa Konsep (individu) — luaran: Poster/komik/ilustrasi majalah dengan deskripsi karya; tenggat Minggu 18 (selesai) + refleksi minggu ini |

## 4. Matriks Semester 2 (minggu 19–36)

Setiap baris = 1 minggu = 2 pertemuan (Senin & Rabu), masing-masing 6 JP / 270 menit.

| Minggu | Topik (Senin / Rabu) | Sumber & bab terkait | Tujuan pembelajaran (usulan) | Konsep penting (dari buku) | Aktivitas memahami | Aktivitas mengaplikasi | Aktivitas merefleksi | Simulasi/praktik | Asesmen | Bukti portofolio |
|---|---|---|---|---|---|---|---|---|---|---|
| **19** (Sm 2) | **Senin:** Sejarah & konsep tipografi<br>**Rabu:** Peran tipografi dalam DKV | 〔B〕 B2 Bab 1 Tipografi · A. Sejarah Tipografi + B. Pengertian Tipografi (hal. 4-6)<br>Status sumber: **sesuai buku**<br>⚠ Aktivitas Ayo Bereksplorasi 1.1 diintegrasikan ke pertemuan Senin sesuai buku. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan tiga era perkembangan tipografi (pracetak, cetak, digital). 2) Menjelaskan pengertian tipografi sebagai seni cetak/tata huruf. 3) Menjelaskan peran tipografi dalam Desain Komunikasi Visual. | 〔B〕 Sejarah tipografi dibagi tiga era: perkembangan era pracetak (dimulai dari ukiran dan lukisan), era cetak, dan era digital (sesuai buku hal. 4-5).<br>〔B〕 Pengertian tipografi: seni cetak atau tata huruf, seni menyusun huruf dengan tujuan memperoleh kesan tertentu sehingga teks menyampaikan pesan kepada pembaca (hal. 6).<br>〔B〕 Pada era digital, tipografi menjadi salah satu teknik wajib bagi desainer grafis.<br>〔B〕 Peran tipografi dalam DKV: membangun keterbacaan, karakter, dan daya tarik pesan visual. | 1) Menelaah 3 era sejarah tipografi; 2) Menjelaskan pengertian tipografi | 1) Menyusun garis waktu; 2) Mengamati & menilai tipografi nyata di sekitar | 1) Menilai kepekaan saya terhadap huruf di sekitar | Laboratorium Tipografi (pemilihan huruf & kesan) (`sim-tipografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Sejarah & pengertian tipografi 〔U〕 | 〔U〕 LKPD: LKPD 19 - Garis Waktu & Galeri Tipografi Sekitar (lembar kerja terisi) + refleksi minggu ini |
| **20** (Sm 2) | **Senin:** Mengenal klasifikasi huruf<br>**Rabu:** Memilih huruf sesuai karakter pesan | 〔B〕 B2 Bab 1 · C. Jenis Tipografi (+ gambar 1.11-1.14 klasifikasi huruf) (hal. 7-8, 15-18)<br>Status sumber: **sesuai buku**<br>⚠ Ciri klasifikasi merujuk gambar 1.11-1.14 (hal. 15-18); urutan mengikuti alur bab meski gambar berada setelah pembahasan anatomi. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Mengidentifikasi ciri huruf tulis (script) dan huruf latin. 2) Membedakan ciri Oldstyle, Modern Style, Slab Serif, dan Sans Serif. 3) Memilih klasifikasi huruf yang sesuai dengan karakter pesan desain. | 〔B〕 Teks selalu ada di tiap desain; teks terbentuk dari gabungan huruf sehingga pemilihan huruf harus sesuai desain (hal. 7).<br>〔B〕 Jenis tipografi mencakup huruf tulis/latin (script) dan kelompok huruf cetak.<br>〔B〕 Klasifikasi & ciri: Oldstyle (gambar 1.11), Modern Style (1.12), Slab Serif (1.13), Sans Serif (1.14).<br>〔B〕 Karakter huruf memengaruhi kesan desain (gambar 1.2): serius, ramah, tegas, santai. | 1) Menelaah ciri 4 klasifikasi huruf; 2) Menganalisis karakter/kesan huruf | 1) Mengklasifikasi contoh huruf; 2) Memilih huruf sesuai pesan | 1) Menilai kemampuan saya memilih huruf | Laboratorium Tipografi (pemilihan jenis huruf & kesan) (`sim-tipografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Jenis & klasifikasi huruf 〔U〕 | 〔U〕 LKPD: LKPD 20 - Klasifikasi & Pemilihan Huruf (lembar kerja terisi) + refleksi minggu ini |
| **21** (Sm 2) | **Senin:** Fungsi tipografi & anatomi huruf<br>**Rabu:** Praktik: membaca anatomi pada karya | 〔B〕 B2 Bab 1 · D. Fungsi, Anatomi, Prinsip, Lingkup Huruf, dan Layout dalam Tipografi (bagian fungsi & anatomi) (hal. 9-13)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan fungsi tipografi dalam perancangan DKV. 2) Mengidentifikasi bagian-bagian anatomi huruf (baseline, stem, ascender, descender, lowercase, uppercase, ear, shoulder). 3) Menggunakan istilah anatomi huruf secara tepat. | 〔B〕 Fungsi tipografi dalam perancangan & proses produksi DKV (hal. 9).<br>〔B〕 Anatomi huruf: baseline (gambar 1.3), stem (1.4), ascender & descender (1.5), lowercase & uppercase (1.6), ear & shoulder (1.7).<br>〔B〕 Setiap bagian huruf memengaruhi keterbacaan dan karakter.<br>〔B〕 Istilah dipakai untuk berkomunikasi profesional antar-desainer. | 1) Menelaah anatomi huruf dari gambar buku; 2) Menjelaskan fungsi tipografi | 1) Melabeli huruf dengan istilah anatomi; 2) Membuat poster anatomi huruf | 1) Menilai penguasaan istilah saya | Laboratorium Tipografi (anatomi & label interaktif) (`sim-tipografi`) — 〔F〕 berfungsi di aplikasi | Formatif: kuis-mencocokkan — 10 soal; cakupan: Anatomi huruf & fungsi tipografi 〔U〕 | 〔U〕 LKPD: LKPD 21 - Poster Anatomi Huruf (lembar kerja terisi) + refleksi minggu ini |
| **22** (Sm 2) | **Senin:** Legibility, readability, visibility & headline<br>**Rabu:** Praktik tata letak: hierarki teks | 〔B〕 B2 Bab 1 · D. ... Prinsip, Lingkup Huruf, dan Layout (legibility, readability, visibility, headline) (hal. 13-21)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan legibility, readability, dan visibility. 2) Menerapkan penyusunan headline yang benar (awal kapital, semua kapital, menggantung, penegasan). 3) Menghindari kesalahan pemotongan headline pada tata letak. | 〔B〕 Legibility (gambar 1.8): kualitas huruf dapat dibedakan satu dari lainnya; Readability (1.9): kenyamanan membaca; Visibility (1.10): keterlihatan dari jarak.<br>〔B〕 Headline: penulisan dengan huruf awal kapital (1.15), seluruh huruf kapital (1.16), menggantung (1.17), dan pemberian kesan penegasan (1.18).<br>〔B〕 Pemotongan headline yang salah (1.19) vs yang benar (1.20).<br>〔B〕 Lingkup huruf & layout: hierarki teks, pemisah kata, panjang baris. | 1) Menelaah 3 prinsip keterbacaan; 2) Menganalisis contoh headline | 1) Memperbaiki headline bermasalah; 2) Menyusun hierarki teks poster | 1) Menilai mutu tipografi karya sendiri | Laboratorium Tipografi (hierarki & keterbacaan) (`sim-tipografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Legibility/readability/visibility & headline 〔U〕 | 〔U〕 LKPD: LKPD 22 - Hierarki Teks & Perbaikan Headline (lembar kerja terisi) + refleksi minggu ini |
| **23** (Sm 2) | **Senin:** Memahami tiga pengatur spasi<br>**Rabu:** Praktik pengaturan spasi | 〔B〕 B2 Bab 1 · E. Menjelaskan Pengertian Leading, Kerning, dan Tracking (hal. 22-25)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan pengertian leading, kerning, dan tracking. 2) Mencontohkan kondisi spasi huruf yang perlu pengaturan khusus (gambar 1.24). 3) Mengatur spasi teks untuk meningkatkan keterbacaan. | 〔B〕 Leading (gambar 1.21): jarak antarbaris; contoh penerapan pada poster kemerdekaan (1.22).<br>〔B〕 Kerning (1.23): penyesuaian jarak antarhuruf; beberapa pasangan huruf perlu diatur khusus (1.24).<br>〔B〕 Tracking (1.25): pengaturan jarak huruf secara keseluruhan pada rentang teks.<br>〔B〕 Pengaruh ketiganya pada keterbacaan & estetika teks. | 1) Menelaah definisi 3 istilah spasi; 2) Menganalisis gambar 1.21-1.25 | 1) Menandai pasangan huruf kerning khusus; 2) Menata spasi teks | 1) Menilai ketelitian saya dalam detail tipografi | Laboratorium Tipografi (pengatur leading/kerning/tracking interaktif) (`sim-tipografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Leading, kerning, tracking 〔U〕 | 〔U〕 LKPD: LKPD 23 - Spasi yang Nyaman Dibaca (lembar kerja terisi) + refleksi minggu ini |
| **24** (Sm 2) | **Senin:** Perancangan karya tipografi<br>**Rabu:** Penyelesaian, presentasi, & asesmen Bab 1 | 〔B〕 B2 Bab 1 · Rangkuman, Asesmen, Uji Kompetensi, Pengayaan, Refleksi (hal. 26-30) (hal. 26-30)<br>Status sumber: **sebagian buku + usulan**<br>⚠ Proyek desain tipografi adalah usulan guru (buku hanya menyediakan refleksi/asesmen); guru dapat menggantinya dengan tugas pengayaan buku hal. 29. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menerapkan pengetahuan tipografi (jenis, anatomi, prinsip, spasi) pada satu karya desain. 2) Menjelaskan pertanggungjawaban pilihan tipografi dalam karya. 3) Menyelesaikan asesmen & uji kompetensi Bab 1. | 〔B〕 Penerapan keterpaduan: jenis huruf, anatomi, hierarki, spasi, prinsip keterbacaan.<br>〔B〕 Menyusun karya berbasis tipografi (poster/undangan/kartu ucapan) dengan alasan desain.<br>〔B〕 Uji kompetensi Bab 1 sebagai asesmen bab (buku hal. 28-29).<br>〔B〕 Pelaporan proses: latar masalah, pilihan tipografi, evaluasi. | 1) Meninjau rangkuman Bab 1; 2) Menganalisis kebutuhan pesan | 1) Merancang & membuat karya tipografi; 2) Mempresentasikan pertanggungjawaban desain | 1) Menilai perkembangan kompetensi tipografi saya | Laboratorium Tipografi (studio karya tipografi) (`sim-tipografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Uji Kompetensi buku (BAB 1 Tipografi) — 10 soal; cakupan: Uji Kompetensi Bab 1 Tipografi (buku hal. 28-29) 〔U〕<br>**＋ pekan asesmen sumatif/uji kompetensi** | 〔U〕 Proyek: Proyek: Karya Desain Berbasis Tipografi (individu) — luaran: Poster/undangan/kartu dengan lembar pertanggungjawaban; tenggat Minggu 24 (selesai) + refleksi minggu ini |
| **25** (Sm 2) | **Senin:** Jenis kamera & bagian-bagian DSLR<br>**Rabu:** Praktik pengenalan kontrol kamera | 〔B〕 B2 Bab 2 Fotografi Dasar · A. Peralatan Kamera Fotografi + B. Bagian-Bagian Kamera DSLR (hal. 34-48)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Membedakan jenis-jenis kamera dan kegunaannya. 2) Mengidentifikasi bagian-bagian kamera DSLR (bawah, depan, atas, belakang) dan fungsinya. 3) Menjelaskan fungsi dial mode, viewfinder, dan pengendali cepat (quick control). | 〔B〕 Jenis kamera yang dibahas buku: kamera saku (2.2), kamera smartphone (2.3), kamera bridge (2.4), mirrorless (2.5), hingga DSLR (2.7).<br>〔B〕 Bagian bawah & depan kamera DSLR (2.8) dan bagian atas & belakang (2.9) beserta fungsi tiap bagian.<br>〔B〕 Tombol dial mode (2.10): memilih mode pemotretan.<br>〔B〕 Tampilan viewfinder (2.11) dan pengendali cepat/quick control (2.12): membaca & mengubah pengaturan. | 1) Menelaah jenis kamera & bagian DSLR; 2) Membaca fungsi dial/viewfinder/quick control | 1) Menjelajahi kamera nyata; 2) Mempraktikkan pengaturan dasar kamera | 1) Menilai kesiapan saya mengoperasikan kamera | Laboratorium Fotografi (model kamera & bagian-bagian interaktif) (`sim-fotografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 10 soal; cakupan: Jenis kamera & bagian DSLR 〔U〕 | 〔U〕 LKPD: LKPD 25 - Identifikasi Kamera & Bagiannya (lembar kerja terisi) + refleksi minggu ini |
| **26** (Sm 2) | **Senin:** Konsep segitiga eksposur<br>**Rabu:** Praktik/simulasi memengaruhi hasil foto | 〔B〕 B2 Bab 2 · C. Segitiga Exposure Kamera DSLR (hal. 49-52)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan pengertian diafragma/aperture, shutter speed, dan ISO. 2) Menjelaskan hubungan ketiganya dalam menentukan eksposur. 3) Memprediksi perubahan hasil foto ketika salah satu unsur diubah. | 〔B〕 Kamera saku/kompak sering mengatur eksposur otomatis; DSLR memungkinkan pengaturan manual (hal. 49).<br>〔B〕 Segitiga exposure (gambar 2.13): keterkaitan diafragma, shutter speed, dan ISO.<br>〔B〕 Diafragma mengatur bukaan cahaya; shutter speed mengatur durasi cahaya masuk; ISO mengatur sensitivitas sensor (gambar 2.14).<br>〔B〕 Perubahan satu unsur menuntut penyesuaian unsur lain (kekompensasian). | 1) Menelaah teori segitiga eksposur; 2) Membaca tampilan viewfinder (2.14) | 1) Menjalankan simulasi eksposur; 2) Melakukan eksperimen 3 kombinasi setelan | 1) Menilai pemahaman saya atas hubungan 3 unsur | Laboratorium Fotografi (simulasi aperture-shutter-ISO) (`sim-fotografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Diafragma, shutter speed, ISO 〔U〕 | 〔U〕 LKPD: LKPD 26 - Eksperimen Segitiga Eksposur (lembar kerja terisi) + refleksi minggu ini |
| **27** (Sm 2) | **Senin:** Langkah penggunaan DSLR & alat penunjang<br>**Rabu:** Jenis fotografi & latihan pembidikan | 〔B〕 B2 Bab 2 · D. Penggunaan Kamera DSLR + E. Alat Penunjang Fotografi Digital Indoor dan Outdoor + F. Jenis-Jenis Fotografi (hal. 53-64)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Mengikuti langkah penggunaan kamera DSLR sesuai buku. 2) Mengidentifikasi alat penunjang fotografi indoor dan outdoor. 3) Membedakan 7 jenis fotografi dan konteks penggunaannya. | 〔B〕 Langkah penggunaan DSLR (hal. 53): membuka penutup lensa, memasang baterai, menyiapkan kartu memori, dan seterusnya mengikuti alur buku.<br>〔B〕 Alat penunjang indoor/outdoor (hal. 55-57): antara lain tripod, slider, dan tudung lensa; tudung lensa mencegah flare sehingga saturasi & kontras terjaga.<br>〔B〕 Jenis fotografi (hal. 58-64): potret (2.15), makanan (2.16), still life (2.17), jalanan (2.18), aksi (2.19), periklanan (2.20), alam/pemandangan (2.21).<br>〔B〕 Setiap jenis menuntut pendekatan peralatan & pengaturan berbeda. | 1) Menelaah langkah penggunaan DSLR; 2) Mengidentifikasi alat penunjang & jenis fotografi | 1) Mempraktikkan langkah baku; 2) Memotret 2 jenis fotografi | 1) Menilai jenis fotografi yang paling sesuai minat saya | Laboratorium Fotografi (pilihan alat & jenis) (`sim-fotografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Penggunaan DSLR, alat penunjang, jenis fotografi 〔U〕 | 〔U〕 LKPD: LKPD 27 - Dua Jenis Fotografi & Peralatannya (lembar kerja terisi) + refleksi minggu ini |
| **28** (Sm 2) | **Senin:** Mengenal ukuran gambar & angle<br>**Rabu:** Praktik komposisi & panning | 〔B〕 B2 Bab 2 · G. Teknik Pengambilan Gambar Berdasarkan Ukuran Gambar dan Sudut Pengambilan (Angle) (hal. 65-73)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Membedakan 7 ukuran gambar: ECU, BCU, CU, MCU, MS, MLS, LS. 2) Membedakan sudut pengambilan: frog eye, low angle, eye level, high angle, bird eye. 3) Memilih ukuran & sudut sesuai pesan foto. | 〔B〕 Ukuran gambar (gambar 2.22-2.28): Extreme Close Up, Big Close Up, Close Up, Medium Close Up, Medium Shot, Medium Long Shot, Long Shot.<br>〔B〕 Sudut pengambilan (2.29): frog eye (2.30), low angle (2.31), eye level, high angle, bird eye.<br>〔B〕 Teknik panning (2.35): menggerakkan kamera berlawanan objek sehingga objek tampak beku dan latar blur.<br>〔B〕 Pemilihan ukuran & sudut menentukan fokus dan pesan foto. | 1) Menelaah 7 ukuran gambar & 5 sudut; 2) Menganalisis efek sudut pada pesan | 1) Latihan menangkap ukuran gambar; 2) Memotret cerita visual 5 bingkai | 1) Menilai kekayaan sudut pandang foto saya | Laboratorium Fotografi (pemilih shot size & angle) (`sim-fotografi`) — 〔F〕 berfungsi di aplikasi | Formatif: kuis-mencocokkan — 10 soal; cakupan: Istilah ukuran gambar & sudut 〔U〕 | 〔U〕 LKPD: LKPD 28 - Cerita Visual 5 Bingkai (lembar kerja terisi) + refleksi minggu ini |
| **29** (Sm 2) | **Senin:** Karakter arah cahaya<br>**Rabu:** Praktik foto indoor & outdoor dengan pencahayaan | 〔B〕 B2 Bab 2 · H. Pencahayaan pada Fotografi (hal. 74-76)<br>Status sumber: **sesuai buku**<br>⚠ Jenis pencahayaan selain side & rim light mengikuti penomoran gambar 2.38-2.39 pada buku; guru dapat menyesuaikan contoh sesuai alat yang tersedia. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan peran arah cahaya terhadap karakter foto. 2) Membedakan jenis pencahayaan: front light, side light, rim light, dan lainnya sesuai buku. 3) Menerapkan pencahayaan pada praktik indoor & outdoor. | 〔B〕 Pencahayaan membentuk bayangan, dimensi, dan suasana foto (hal. 74).<br>〔B〕 Side light: cahaya dari sudut 90 derajat/samping objek; bayangan terbagi berlawanan (gambar 2.38).<br>〔B〕 Rim light: cahaya dari arah belakang yang membentuk garis tepi (hal. 75-76).<br>〔B〕 Kombinasi arah cahaya diterapkan berbeda untuk foto indoor (lampu studio) dan outdoor (cahaya matahari). | 1) Menelaah jenis pencahayaan & efeknya; 2) Mengidentifikasi arah cahaya pada foto contoh | 1) Mengatur sumber cahaya indoor; 2) Memotret outdoor memanfaatkan cahaya alami | 1) Menilai kepekaan saya terhadap cahaya | Laboratorium Fotografi (pengatur arah cahaya) (`sim-fotografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Jenis & arah pencahayaan 〔U〕 | 〔U〕 LKPD: LKPD 29 - Studio Cahaya: Indoor & Outdoor (lembar kerja terisi) + refleksi minggu ini |
| **30** (Sm 2) | **Senin:** Dasar penyuntingan foto<br>**Rabu:** Evaluasi hasil & asesmen Bab 2 | 〔B〕 B2 Bab 2 · I. Penyuntingan Fotografi Digital + Rangkuman/Asesmen/Uji Kompetensi Bab 2 (hal. 77-86)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan tujuan dan tahapan penyuntingan foto digital. 2) Melakukan penyuntingan dasar (pemotongan, koreksi cahaya-warna, kebersihan gambar). 3) Mengevaluasi hasil foto akhir dengan kriteria yang jelas. | 〔B〕 Penyuntingan fotografi digital: tujuan, alur, dan etika (hal. 77).<br>〔B〕 Penyuntingan dasar: pemotongan (crop), koreksi eksposur/kontras, koreksi warna, menghilangkan gangguan.<br>〔B〕 Evaluasi hasil: ketajaman, eksposur, komposisi, kesesuaian pesan.<br>〔B〕 Asesmen Bab 2 & uji kompetensi (hal. 83-85). | 1) Menelaah alur & etika penyuntingan; 2) Menggunakan kriteria evaluasi foto | 1) Menyunting 2 foto; 2) Menilai karya sejawat & merevisi | 1) Menilai perkembangan keterampilan fotografi saya | Laboratorium Fotografi (sebelum-sesudah penyuntingan) (`sim-fotografi`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 5 soal; cakupan: Penyuntingan foto digital 〔U〕 | 〔U〕 LKPD: LKPD 30 - Sebelum & Sesudah: Penyuntingan Foto (lembar kerja terisi) + refleksi minggu ini |
| **31** (Sm 2) | **Senin:** Eksperimen bitmap vs vektor<br>**Rabu:** Praktik memilih jenis grafis | 〔B〕 B2 Bab 3 Komputer Grafis · A. Pengertian Bitmap dan Vektor (hal. 90-94)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan pengertian gambar bitmap dan vektor. 2) Membandingkan kualitas keduanya saat diperbesar (ketajaman). 3) Memilih jenis grafis yang tepat untuk kebutuhan karya. | 〔B〕 Bitmap: kumpulan titik piksel dalam grid; tiap piksel punya lokasi & warna sehingga membentuk tampilan gambar; disebut juga raster (hal. 90).<br>〔B〕 Kelemahan bitmap: membesar melebihi batas akan pecah/tidak tajam (sesuai kutipan Anggawirya, 2004 pada buku).<br>〔B〕 Vektor: dibentuk dari garis/path matematis sehingga tetap tajam saat diperbesar.<br>〔B〕 Pemilihan sesuai kebutuhan: foto (bitmap) vs logo/ilustrasi presisi (vektor). | 1) Menelaah definisi bitmap & vektor; 2) Menganalisis kelemahan bitmap | 1) Menguji pembesaran gambar; 2) Menentukan jenis grafis untuk 8 kasus | 1) Menilai pemahaman saya tentang format gambar | Laboratorium Bitmap & Vektor (pengujian pembesaran gambar) (`sim-bitmap-vektor`) — 〔F〕 berfungsi di aplikasi | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Bitmap, vektor, piksel, ketajaman 〔U〕 | 〔U〕 LKPD: LKPD 31 - Bitmap atau Vektor? Studi Kasus 8 Kebutuhan (lembar kerja terisi) + refleksi minggu ini |
| **32** (Sm 2) | **Senin:** Mengenal tiga perangkat lunak grafis<br>**Rabu:** Memilih aplikasi untuk kebutuhan nyata | 〔B〕 B2 Bab 3 · B. Jenis-Jenis Perangkat Lunak Desain Grafis (pengenalan CorelDRAW, Adobe Illustrator, Adobe Photoshop) (hal. 95-105)<br>Status sumber: **sesuai buku**<br>⚠ Jika laboratorium belum memiliki lisensi Adobe, guru dapat memakai alternatif (mis. Inkscape/GIMP) sebagai padanan latihan dengan catatan aplikasi industri tet… | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Mengidentifikasi perangkat lunak grafis utama: CorelDRAW, Adobe Illustrator, Adobe Photoshop. 2) Menjelaskan kegunaan masing-masing perangkat lunak. 3) Menentukan perangkat lunak yang tepat untuk satu kebutuhan pekerjaan. | 〔B〕 Buku membahas tiga perangkat lunak: CorelDRAW (1), Adobe Illustrator (2), Adobe Photoshop (3) pada peta konsep hal. 89.<br>〔B〕 CorelDRAW & Illustrator berbasis vektor untuk logo, ilustrasi, tata letak; Photoshop berbasis bitmap untuk foto & retouching.<br>〔B〕 Anatomi area kerja aplikasi: lembar kerja, toolbar, panel (dari pembahasan bab).<br>〔B〕 Pemilihan alat mengikuti kebutuhan luaran. | 1) Menelaah fungsi tiap aplikasi; 2) Mengenal area kerja | 1) Membuat dokumen & menyimpan di tiap aplikasi; 2) Merancang alur kerja proyek | 1) Menilai kesiapan saya memakai aplikasi industri | tidak dijadwalkan simulasi digital → praktik langsung di kelas 〔U〕 | Formatif: Kuis pilihan ganda — 8 soal; cakupan: Perangkat lunak grafis & kegunaannya 〔U〕 | 〔U〕 LKPD: LKPD 32 - Tiga Aplikasi, Satu Proyek (lembar kerja terisi) + refleksi minggu ini |
| **33** (Sm 2) | **Senin:** Objek vektor & warna<br>**Rabu:** Path & pembentukan objek | 〔B〕 B2 Bab 3 · B. Jenis-Jenis Perangkat Lunak Desain Grafis (praktik objek vektor & pembentukan objek) (hal. 105-115)<br>Status sumber: **sesuai buku**<br>⚠ Nomor halaman praktik objek vektor mengikuti bagian B bab 3 (hal. 95-123); fitur yang tersedia berbeda antarkomputer laboratorium - guru menyesuaikan versi apl… | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Membuat dan memodifikasi objek vektor dasar. 2) Mengatur warna objek (isi & garis). 3) Menggunakan path dan fitur pembentukan objek untuk menyusun bentuk baru. | 〔B〕 Membuat objek dasar (persegi, elips) dan memodifikasinya; mengenal Pick Tool & shortcut seperti F6 pada praktik buku (hal. 135 dst).<br>〔B〕 Mengatur warna objek: isi (fill) & garis (outline).<br>〔B〕 Path: garis pembentuk objek vektor; menyusun & mengedit titik path.<br>〔B〕 Fitur pembentukan objek: menggabungkan, memotong, dan menyusun bentuk (sesuai praktik aplikasi pada buku). | 1) Menelaah konsep path & pembentukan objek; 2) Mengenal pengaturan warna | 1) Membuat & memodifikasi objek dasar; 2) Menyusun ikon dari bentuk gabungan | 1) Menilai ketelitian saya mengatur bentuk & warna | Laboratorium Bitmap & Vektor (latihan bentuk & path vektor) (`sim-bitmap-vektor`) — 〔F〕 berfungsi di aplikasi | Formatif: praktik-terbimbing — 3 soal; cakupan: Tantangan cepat: buat, warnai, susun 〔U〕 | 〔U〕 LKPD: LKPD 33 - Ikon dari Bentuk Dasar (lembar kerja terisi) + refleksi minggu ini |
| **34** (Sm 2) | **Senin:** Teknik seleksi bitmap<br>**Rabu:** Layer & komposisi bitmap | 〔B〕 B2 Bab 3 · B. (praktik penyuntingan bitmap: seleksi, color range, color channels, panel layer) (hal. 115-124)<br>Status sumber: **sesuai buku**<br>⚠ Penyebutan menu Select > Color Range & Color Channels mengikuti gambar 3.61 & hal. 123 buku; versi antarmuka aplikasi dapat berbeda. | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Melakukan seleksi objek pada gambar bitmap. 2) Menggunakan panel layer untuk mengelola bagian gambar. 3) Menerapkan penyuntingan dasar pada foto/gambar bitmap. | 〔B〕 Teknik seleksi pada bitmap, antara lain marquee & lasso; seleksi kompleks dengan Color Range melalui menu Select (gambar 3.61).<br>〔B〕 Color Channels untuk seleksi rumit seperti rambut/bulu dengan mengaktifkan channel pada panel layer (hal. 123).<br>〔B〕 Panel layer: mengelola, menyembunyikan, dan menyusun bagian-bagian gambar.<br>〔B〕 Penyuntingan bitmap: koreksi & komposisi gambar. | 1) Menelaah teknik seleksi & panel layer; 2) Mengenal Color Range & Color Channels | 1) Memotong objek dari foto; 2) Menyusun komposisi berlayer | 1) Menilai kerapian & keteraturan kerja saya di aplikasi | Laboratorium Bitmap & Vektor (simulasi seleksi & layer) (`sim-bitmap-vektor`) — 〔F〕 berfungsi di aplikasi | Formatif: praktik-terbimbing — 3 soal; cakupan: Tantangan seleksi cepat 〔U〕 | 〔U〕 LKPD: LKPD 34 - Poster 3 Layer dari Hasil Seleksi (lembar kerja terisi) + refleksi minggu ini |
| **35** (Sm 2) | **Senin:** Mengikuti langkah pembuatan produk<br>**Rabu:** Menyelesaikan & menyajikan produk grafis | 〔B〕 B2 Bab 3 · C. Produk Rancangan Komputer Grafis (1. Mug, 2. Logo, 3. Packaging, 4. Kartu Nama) (hal. 124-137)<br>Status sumber: **sesuai buku** | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menjelaskan langkah pembuatan produk grafis sesuai buku. 2) Membuat satu produk grafis dari rangkaian langkah kerja. 3) Menerapkan standar ukuran kerja (mis. ukuran standar mug 8 cm x 20 cm). | 〔B〕 Produk rancangan komputer grafis yang dibahas buku: 1) Mug, 2) Logo, 3) Packaging, 4) Kartu Nama (hal. 124-137).<br>〔B〕 Mug: membuat lembar kerja, ukuran standar mug 8 cm x 20 cm, latar & desain, ekspor (hal. 124-127).<br>〔B〕 Logo & packaging: menyusun identitas dan menambahkan keterangan produk (desain akhir packaging, gambar 3.85).<br>〔B〕 Kartu nama: membuat kotak, memberi warna dengan Pick Tool, menambahkan ikon sosial media (desain sendiri atau template gratis seperti Freepik, Vecteezy, Flaticon), menambahkan logo, menyimpan dengan Ctrl+S (ha… | 1) Menelaah langkah kerja produk dari buku; 2) Memahami standar ukuran kerja | 1) Membuat produk grafis mengikuti alur; 2) Menyimpan & mengekspor karya | 1) Menilai ketelitian saya mengikuti standar | Studio Proyek Desain Terpadu (bahan pendamping) (`sim-studio-dkv`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: ceklis-progres — 8 soal; cakupan: Lembar kerja, elemen, warna, penyimpanan file 〔U〕 | 〔U〕 Proyek: Proyek: Produk Grafis (Mug/Logo/Packaging/Kartu Nama) (individu) — luaran: File produk + deskripsi desain; tenggat Minggu 35 (selesai) + refleksi minggu ini |
| **36** (Sm 2) | **Senin:** Penyelesaian proyek terpadu<br>**Rabu:** Presentasi, asesmen akhir, dan refleksi tahunan | 〔B〕 B2 Bab 3 & penutup buku · Rangkuman/Asesmen/Uji Kompetensi BAB 3, Pengayaan, Refleksi + Latihan Soal Semester 2 + Glosarium (hal. 138-157)<br>Status sumber: **sesuai buku**<br>⚠ Latihan Soal Semester 2 (hal. 143-156) berjumlah besar; guru memilih butir sesuai peta asesmen sekolah. Remedial/pengayaan mengikuti kebijakan kurikulum SMKN 3… | ⧗ *usulan (CP/ATP belum diverifikasi sekolah)*: 1) Menyelesaikan proyek terpadu lintas materi semester 2. 2) Mengkurasi portofolio tahun pembelajaran dan mempresentasikannya. 3) Menyelesaikan asesmen akhir serta refleksi perkembangan kompetensi. | 〔B〕 Integrasi kompetensi semester 2: tipografi, fotografi, komputer grafis dalam satu proyek.<br>〔B〕 Rangkuman & asesmen BAB 3, uji kompetensi (hal. 138-142).<br>〔B〕 Latihan Soal Semester 2 (hal. 143-156) & glosarium (hal. 157) sebagai bahan pengayaan.<br>〔B〕 Kurasi portofolio: seleksi, deskripsi, dan narasi perkembangan. | 1) Meninjau rangkuman & glosarium; 2) Menyiapkan narasi portofolio | 1) Menyelesaikan proyek terpadu; 2) Mempresentasikan portofolio | 1) Menilai perjalanan kompetensi setahun; 2) Menetapkan target lanjutan | Studio Proyek Desain Terpadu (brief-riset-ide-desain-revisi-presentasi) (`sim-studio-dkv`) — 〔T7〕 masih dalam pengembangan (ditandai di aplikasi) | Formatif: Asesmen sumatif akhir semester — 25 soal; cakupan: Bab 3 + latihan soal semester 2 terpilih (hal. 139-156) 〔U〕<br>**＋ pekan asesmen sumatif/uji kompetensi** | 〔U〕 Proyek: Proyek Terpadu Semester 2 & Portofolio Tahunan (individu) — luaran: Karya komunikasi visual terpadu + portofolio 8-10 karya bernarasi; tenggat Minggu 36 (selesai) + refleksi minggu ini |

---

## 5. Rincian 72 pertemuan (Senin 6 JP/270 menit · Rabu 6 JP/270 menit)

Agenda di bawah adalah rancangan 〔U〕 yang sudah tertanam pada data kurikulum; setiap pertemuan berjumlah 6 JP = 270 menit (termasuk transisi/istirahat).

### Minggu 1 · Senin — Tur pembelajaran & asesmen diagnostik
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 30 | Salam, perkenalan, penjelasan tujuan minggu. |
| Sosialisasi mata pelajaran | 45 | Guru memaparkan cakupan DD DKV dan bentuk asesmen. |
| Asesmen diagnostik pengetahuan | 60 | Kuis diagnostik daring: dasar desain, unsur visual, warna, alat kerja. |
| Istirahat & transisi | 15 | Istirahat; guru meninjau hasil sementara. |
| Asesmen diagnostik non-kognitif | 60 | Angket minat, pengalaman, gaya belajar, akses perangkat. |
| Refleksi & penutup | 60 | Umpan balik awal hasil diagnostik dan penguatan harapan belajar. |

### Minggu 1 · Rabu — Kontrak belajar & pengenalan aplikasi
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 25 | Meninjau ringkasan diagnostik; menetapkan target belajar pribadi. |
| Kontrak & budaya kerja studio | 45 | Menyusun kesepakatan kelas: keselamatan, kebersihan, etika karya. |
| Tur aplikasi | 70 | Praktik login, menelusuri menu Materi, Simulasi, LKPD, Portofolio. |
| Istirahat & transisi | 15 | Istirahat. |
| Unggah karya awal | 90 | Setiap siswa mengunggah satu karya/ide awal ke portofolio sebagai baseline. |
| Refleksi & penutup | 25 | Refleksi penggunaan aplikasi; komitmen pekan depan. |

### Minggu 2 · Senin — Pengertian & tujuan technopreneurship
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menyebut sumber penghasilan dari keterampilan desain. |
| Eksplorasi konsep | 65 | Membaca A. Technopreneur DKV; diskusi berpasangan merumuskan definisi sendiri. |
| Demonstrasi & penguatan | 45 | Guru menampilkan contoh technopreneur DKV; klarifikasi konsep. |
| Latihan terbimbing | 80 | Kelompok memetakan tujuan & karakter wirausaha ke peta konsep. |
| Asesmen formatif | 30 | Kuis 5 soal: pengertian, tujuan, karakter. |
| Refleksi & penutup | 25 | Refleksi lisan: karakter wirausaha yang paling menantang. |

### Minggu 2 · Rabu — Praktik: peluang technopreneur DKV di sekitar kita
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Tinjau kuis Senin; penguatan konsep. |
| Penguatan konsep | 40 | Membahas contoh jasa desain daring dan produk digital DKV. |
| Simulasi interaktif | 40 | Simulasi Technopreneurship: memilih ide usaha DKV, menetapkan harga, menerima umpan balik kelayakan. |
| Praktik terbimbing | 110 | Kelompok menyusun mini-profil ide usaha DKV (nama, layanan, pengguna, teknologi). |
| Presentasi & umpan balik | 35 | Presentasi kilat 2 menit per kelompok. |
| Refleksi & dokumentasi | 25 | Simpan LKPD ke portofolio; refleksi tertulis. |

### Minggu 3 · Senin — Menjelajah profesi DKV
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Berbagi hasil tugas pengayaan minggu 2. |
| Eksplorasi profesi | 65 | Membaca B. Prospek Profesi; tiap kelompok menguraikan 2 profesi. |
| Demo & klarifikasi | 45 | Guru menampilkan contoh hasil kerja tiap profesi. |
| Latihan terbimbing | 80 | Menghubungkan profesi-produk kerja-kompetensi kunci dalam tabel. |
| Asesmen formatif | 30 | Kuis mencocokkan profesi dan deskripsi pekerjaan. |
| Refleksi & penutup | 25 | Refleksi: profesi yang ingin dieksplorasi lebih jauh. |

### Minggu 3 · Rabu — Peluang & perencanaan usaha DKV
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau kuis; penguatan hubungan profesi-usaha. |
| Penguatan konsep | 40 | Diskusi: mengapa perencanaan mendasar dalam membangun usaha? |
| Praktik analisis peluang | 130 | Kelompok mengamati kebutuhan desain di lingkungan dan menuliskan 3 peluang jasa DKV serta perencanaannya. |
| Istirahat & transisi | 20 | Istirahat. |
| Presentasi & umpan balik | 45 | Presentasi hasil analisis; guru mengoreksi asumsi tidak realistis. |
| Refleksi & dokumentasi | 15 | Simpan LKPD ke portofolio. |

### Minggu 4 · Senin — Potensi diri & munculnya ide kreatif
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menuliskan ide paling menarik yang pernah muncul. |
| Eksplorasi konsep | 65 | Membaca C. Mengenal Potensi Desainer sejak Dini; menandai kalimat kunci. |
| Pemetaan diri | 45 | Mengisi lembar potensi diri: kekuatan, kelemahan, peluang latihan. |
| Latihan terbimbing | 80 | Latihan ide: satu tema, hasilkan 10 alternatif ide visual/jasa desain. |
| Asesmen formatif | 30 | Kuis singkat materi minggu 2-4. |
| Refleksi & penutup | 25 | Refleksi: kebiasaan yang membuat ide lebih sering muncul. |

### Minggu 4 · Rabu — Praktik rencana usaha sederhana + asesmen BAB 1
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Mengulas potensi diri; membentuk kelompok. |
| Penguatan konsep | 35 | Guru memandu format kanvas rencana usaha 1 halaman. |
| Kerja kelompok | 120 | Menyusun rencana usaha sederhana: ide, pengguna, produk, biaya, harga. |
| Istirahat & transisi | 15 | Istirahat. |
| Presentasi & umpan balik | 45 | Presentasi kanvas usaha; umpan balik kelayakan. |
| Asesmen & dokumentasi | 35 | Menuntaskan Asesmen BAB 1 (buku hal. 14-15); simpan ke portofolio. |

### Minggu 5 · Senin — Ergonomi kerja desainer
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: keluhan pegal setelah praktik komputer. |
| Eksplorasi konsep | 65 | Membaca A. Keselamatan pada Individu Pekerja; menandai 5 aturan ergonomi. |
| Demonstrasi | 45 | Guru mendemonstrasikan pengaturan kursi, meja, dan jarak layar. |
| Latihan terbimbing | 80 | Berpasangan saling mengoreksi postur kerja dengan lembar ceklis. |
| Asesmen formatif | 30 | Kuis 5 soal ergonomi. |
| Refleksi & penutup | 25 | Menuliskan satu perbaikan kebiasaan kerja pribadi. |

### Minggu 5 · Rabu — Praktik K3: fotografi & pekerjaan fisik ringan
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau kuis; membahas risiko kerja studio dan lapangan. |
| Penguatan konsep | 40 | Membahas gambar 2.4-2.9: posisi memotret, pivot, angkat beban. |
| Simulasi & praktik posisi | 40 | Latihan mengenali posisi berisiko dan memilih tindakan aman. |
| Praktik terarah | 110 | Praktik posisi memotret berbagai sudut secara aman dan latihan pivot di halaman sekolah. |
| Pembahasan hasil | 35 | Meninjau hasil latihan; mengaitkan posisi kerja dengan kualitas. |
| Refleksi & dokumentasi | 25 | Unggah catatan K3 ke portofolio. |

### Minggu 6 · Senin — Prosedur perawatan peralatan
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Mengamati kondisi alat kerja kelas. |
| Eksplorasi konsep | 65 | Membaca B. Keselamatan pada Peralatan Kerja; mencatat prosedur tiap alat. |
| Demonstrasi | 45 | Guru mendemonstrasikan perawatan lensa, kuas, dan pensil. |
| Latihan terbimbing | 80 | Praktik membersihkan & menata peralatan; membuat tempat penyimpanan sederhana. |
| Asesmen formatif | 30 | Kuis prosedur perawatan per alat. |
| Refleksi & penutup | 25 | Refleksi kondisi alat sebelum-sesudah. |

### Minggu 6 · Rabu — Manajemen data & jadwal perawatan
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Cerita insiden kehilangan data. |
| Penguatan konsep | 40 | Membahas penanganan flashdisk, penyalinan, penamaan file. |
| Praktik terstruktur | 125 | Menata file karya (folder semester-minggu-tugas) dan menyusun jadwal perawatan alat. |
| Istirahat & transisi | 20 | Istirahat. |
| Presentasi hasil | 40 | Presentasi jadwal perawatan; tetapkan PIC mingguan. |
| Refleksi & dokumentasi | 25 | Simpan LKPD ke portofolio. |

### Minggu 7 · Senin — Lingkungan kerja aman & nyaman
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Survei kilat kenyamanan ruang praktik (cahaya, udara, kebisingan). |
| Eksplorasi konsep | 65 | Membaca C. Keselamatan pada Lingkungan Kerja; membandingkan kondisi ideal dan nyata. |
| Demonstrasi & diskusi | 45 | Mengamati pengaturan lampu & exhaust fan; diskusi lingkungan kerja luar ruangan. |
| Latihan terbimbing | 80 | Menyusun rekomendasi perbaikan lingkungan praktik dengan sketsa tata letak. |
| Asesmen formatif | 30 | Kuis 5 soal lingkungan kerja. |
| Refleksi & penutup | 25 | Menetapkan satu perbaikan ruang praktik yang bisa segera dilakukan. |

### Minggu 7 · Rabu — Penanganan hasil karya + asesmen BAB 2
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Mengamati contoh karya cetak yang rusak/terawat. |
| Penguatan konsep | 40 | Membahas D. Keselamatan pada Hasil Kerja: unsur visual-verbal dan penanganan karya. |
| Praktik perawatan karya | 90 | Praktik menyimpan, melindungi, dan mengarsipkan karya cetak serta file digital. |
| Istirahat & transisi | 15 | Istirahat. |
| Asesmen BAB 2 | 80 | Mengerjakan Asesmen BAB 2 (buku hal. 46-49) secara mandiri. |
| Refleksi & dokumentasi | 25 | Menutup bab: rangkuman, refleksi, dokumentasi portofolio. |

### Minggu 8 · Senin — Industri kreatif & posisi DKV
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: mendata produk kreatif yang dipakai siswa hari ini. |
| Eksplorasi konsep | 65 | Membaca A. Perkembangan Proses Produksi Industri Kreatif; mencatat data peran industri kreatif. |
| Demonstrasi & penguatan | 45 | Guru menampilkan contoh karya DKV pada produk ekonomi kreatif. |
| Latihan terbimbing | 80 | Kelompok memetakan contoh subsektor ekonomi kreatif dan peran DKV di dalamnya. |
| Asesmen formatif | 30 | Kuis 5 soal industri kreatif. |
| Refleksi & penutup | 25 | Refleksi: peluang yang terlihat dari pertumbuhan industri kreatif. |

### Minggu 8 · Rabu — Menelusuri proses produksi DKV
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Mengulas kuis; menghubungkan industri kreatif dengan tahapan produksi. |
| Penguatan konsep | 40 | Mengenal gambaran alur produksi karya DKV dari brief sampai karya jadi. |
| Studi kasus ringan | 125 | Kelompok membedah satu contoh karya DKV sederhana (mis. poster kantin): siapa terlibat, alat, tahapan. |
| Istirahat & transisi | 20 | Istirahat. |
| Presentasi & umpan balik | 40 | Presentasi hasil bedah karya. |
| Refleksi & dokumentasi | 25 | Simpan hasil ke portofolio. |

### Minggu 9 · Senin — Dari revolusi industri ke Industri 4.0
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: urutkan penemuan (mesin uap, listrik, komputer, internet) pada garis waktu. |
| Eksplorasi konsep | 65 | Membaca B. DKV dalam Industri 4.0; mencatat ciri tiap era. |
| Demonstrasi & penguatan | 45 | Guru membandingkan proses produksi manual, analog, dan digital. |
| Latihan terbimbing | 80 | Kelompok membuat garis waktu revolusi industri dengan contoh di bidang DKV. |
| Asesmen formatif | 30 | Kuis 5 soal revolusi industri & Industri 4.0. |
| Refleksi & penutup | 25 | Refleksi: keterampilan apa yang wajib dimiliki desainer era 4.0? |

### Minggu 9 · Rabu — Industri 4.0 dan masa depan kerja DKV
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau garis waktu; membahas temuan menarik. |
| Penguatan konsep | 40 | Ciri Industri 4.0: otomasi, data, konektivitas, kolaborasi digital. |
| Diskusi terarah | 130 | Debat peran: peluang dan tantangan Industri 4.0 bagi desainer muda (kelompok pro & kontra). |
| Istirahat & transisi | 15 | Istirahat. |
| Rumusan bersama | 40 | Menyusun daftar keterampilan masa depan DKV hasil diskusi. |
| Refleksi & dokumentasi | 25 | Simpan rumusan ke portofolio; refleksi tertulis. |

### Minggu 10 · Senin — Peralihan teknologi analog-digital
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: membandingkan foto analog keluarga dan foto ponsel. |
| Eksplorasi konsep | 65 | Membaca C. Teknologi Digital DKV dalam Industri; mencatat contoh peralihan alat. |
| Demonstrasi | 45 | Guru menunjukkan perbandingan alat analog dan digital (kamera, alat gambar, cetak). |
| Latihan terbimbing | 80 | Menelaah studi kasus: membuat poster dengan cara manual vs digital; catat waktu & mutu. |
| Asesmen formatif | 30 | Kuis 5 soal teknologi digital. |
| Refleksi & penutup | 25 | Refleksi: alat digital apa yang paling ingin saya kuasai? |

### Minggu 10 · Rabu — Praktik: memilih alat digital sesuai kebutuhan karya
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau hasil minggu lalu; kaitkan dengan pilihan alat. |
| Penguatan konsep | 40 | Kriteria memilih alat: jenis luaran, efisiensi, biaya, keterampilan. |
| Praktik terstruktur | 130 | Kelompok menyusun tabel rekomendasi alat digital untuk 5 jenis karya DKV dan menyiapkan contoh mini (mock-up sederhana dengan alat yang tersedia). |
| Istirahat & transisi | 15 | Istirahat. |
| Presentasi & umpan balik | 40 | Presentasi tabel rekomendasi; guru mengoreksi pilihan yang kurang tepat. |
| Refleksi & dokumentasi | 25 | Simpan ke portofolio. |

### Minggu 11 · Senin — Siklus industri & teknologi
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: melacak perjalanan satu poster dari ide sampai dicetak. |
| Eksplorasi konsep | 65 | Membaca D dan E: kemajuan teknologi industri, siklus industri, industri hijau. |
| Demonstrasi & penguatan | 45 | Guru memaparkan siklus industri dengan contoh studio DKV dan percetakan. |
| Latihan terbimbing | 80 | Menempatkan pekerjaan DKV (desainer, fotografer, percetakan) ke dalam siklus praproduksi-produksi-pascaproduksi. |
| Asesmen formatif | 30 | Kuis 5 soal siklus industri. |
| Refleksi & penutup | 25 | Refleksi: di tahap mana desainer paling banyak berperan? |

### Minggu 11 · Rabu — Praktik kerja ramah lingkungan + asesmen BAB 3
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau siklus industri; memunculkan isu limbah & energi. |
| Penguatan konsep | 35 | Prinsip industri hijau di bidang DKV. |
| Kerja kelompok | 110 | Menyusun usulan 'studio DKV hijau': 5 kebijakan praktis (kertas, tinta, listrik, limbah, desain). |
| Istirahat & transisi | 20 | Istirahat. |
| Presentasi & umpan balik | 40 | Presentasi usulan; penilaian kelayakan. |
| Asesmen & dokumentasi | 45 | Menuntaskan Asesmen BAB 3 (buku hal. 70-73); dokumentasi portofolio. |

### Minggu 12 · Senin — Kreativitas dari masalah ke ide
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: mengumpulkan 5 masalah nyata di sekolah yang bisa dijawab desain. |
| Eksplorasi konsep | 65 | Membaca A. Konsep Kreativitas; menelaah alur masalah-ide-solusi. |
| Demonstrasi & penguatan | 45 | Contoh latar belakang masalah pada karya DKV nyata (kampanye, poster layanan). |
| Latihan terbimbing | 80 | Latihan 'problem → 15 ide': dari satu masalah, tulis sebanyak mungkin ide solusi. |
| Asesmen formatif | 30 | Kuis 5 soal konsep kreativitas. |
| Refleksi & penutup | 25 | Merefleksikan proses berpikir saat ide tersendat. |

### Minggu 12 · Rabu — Mengasah eksplorasi ide
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau ide-ide dari sesi Senin. |
| Penguatan konsep | 40 | Teknik memancing ide: observasi, pertanyaan apa-jika, pembalikan asumsi. |
| Praktik terstruktur | 130 | Kerja kelompok: pilih satu masalah terkuat, kembangkan latar belakang masalah dan 10 alternatif solusi visual. |
| Istirahat & transisi | 15 | Istirahat. |
| Presentasi kilat & pemilihan | 40 | Presentasi 1 menit per kelompok; kelas memilih ide paling kuat dengan alasan. |
| Refleksi & dokumentasi | 25 | Simpan hasil eksplorasi ide ke portofolio. |

### Minggu 13 · Senin — Berpikir dari sudut pandang berbeda
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: satu masalah, tiga sudut pandang (pengguna, penjual, pengelola). |
| Eksplorasi konsep | 65 | Membaca B. Berpikir Kreatif; menandai syarat ide yang dapat dipertanggungjawabkan. |
| Demonstrasi & penguatan | 45 | Contoh desain yang lahir dari sudut pandang tidak biasa. |
| Latihan terbimbing | 80 | Latihan membalik asumsi: 'bagaimana jika syaratnya dibalik?' untuk satu konteks DKV. |
| Asesmen formatif | 30 | Kuis 5 soal berpikir kreatif. |
| Refleksi & penutup | 25 | Refleksi: ide aneh saya yang ternyata bisa dipertanggungjawabkan. |

### Minggu 13 · Rabu — Praktik pemecahan masalah desain
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Membentuk tim dan memilih kasus desain nyata. |
| Penguatan konsep | 40 | Langkah pemecahan masalah: pahami, rancang, uji ide, perbaiki. |
| Praktik kelompok | 130 | Setiap tim menyelesaikan satu kasus (mis. poster imbauan hemat air) dengan 2 alternatif konsep dan alasan pemilihannya. |
| Istirahat & transisi | 15 | Istirahat. |
| Uji ide bersama | 40 | Tim saling menguji: 'apakah ide ini menjawab masalah dan bisa dipertanggungjawabkan?' |
| Refleksi & dokumentasi | 25 | Simpan proses + hasil ke portofolio. |

### Minggu 14 · Senin — Kreativitas sebagai nilai jual
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: membandingkan dua produk sejenis dengan desain berbeda. |
| Eksplorasi konsep | 65 | Membaca C. Kreativitas dalam Industri Kreatif; mengaitkan kreativitas dengan nilai jual. |
| Demonstrasi | 45 | Guru membedah 2 studi kasus produk (sebelum & sesudah redesain). |
| Latihan terbimbing | 80 | Kelompok menilai 3 produk lokal: di mana letak kreativitas dan pengaruhnya pada nilai. |
| Asesmen formatif | 30 | Kuis 5 soal kreativitas & nilai jual. |
| Refleksi & penutup | 25 | Refleksi: kreativitas dalam karya saya sendiri sejauh ini. |

### Minggu 14 · Rabu — Praktik: menaikkan nilai karya dengan kreativitas
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Memilih karya sebelumnya yang akan ditingkatkan nilainya. |
| Penguatan konsep | 40 | Kriteria karya bernilai: pesan jelas, orisinal, kontekstual, rapi. |
| Praktik peningkatan karya | 130 | Siswa meredesain konsep karya sederhana (mis. label produk kantin) dengan menambah unsur kreativitas, mencatat perubahan. |
| Istirahat & transisi | 15 | Istirahat. |
| Klinik karya | 40 | Umpan balik guru & teman pada karya hasil redesain. |
| Refleksi & dokumentasi | 25 | Dokumentasi sebelum-sesudah ke portofolio. |

### Minggu 15 · Senin — Kreativitas proses produksi & teknologi
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menyebut produk lama yang telah dikembangkan (contoh buku: ojek pangkalan vs daring). |
| Eksplorasi konsep | 65 | Membaca D & E; mencatat faktor mutu produk dan peran teknologi. |
| Demonstrasi & penguatan | 45 | Membedah pengembangan produk dari sisi desain & teknologi. |
| Latihan terbimbing | 80 | Kelompok memilih produk lama di sekitar, memetakan 3 cara pengembangannya dari sisi DKV. |
| Asesmen formatif | 30 | Kuis 5 soal proses produksi & mutu. |
| Refleksi & penutup | 25 | Refleksi: pengembangan produk mendorong saya berpikir seperti apa? |

### Minggu 15 · Rabu — Budaya kerja desainer + asesmen BAB 4
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Menghubungkan budaya kerja dengan kebiasaan belajar sehari-hari. |
| Penguatan konsep | 35 | Budaya kerja: disiplin waktu, komunikasi, etika klien, pengelolaan revisi. |
| Simulasi peran kerja | 110 | Simulasi mini-studio: peran desainer, klien, dan penilai; menangani satu brief dengan revisi terkendali. |
| Istirahat & transisi | 20 | Istirahat. |
| Pembahasan & umpan balik | 40 | Membahas dinamika kerja: negosiasi, komunikasi visual, penyelesaian perbedaan. |
| Asesmen & dokumentasi | 45 | Menuntaskan Asesmen BAB 4 (buku hal. 89-91); dokumentasi. |

### Minggu 16 · Senin — Konsep karya & teknik sketsa
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: melihat buku sketsa desainer; menebak alur pikirnya. |
| Eksplorasi konsep | 65 | Membaca A & B; mencatat pengertian konsep karya dan langkah awalnya. |
| Demonstrasi | 45 | Guru mendemonstrasikan teknik arsir sejajar dan menyilang. |
| Latihan terbimbing | 80 | Latihan arsir pada beberapa bentuk geometris & benda sederhana untuk pencapaian gelap-terang. |
| Asesmen formatif | 30 | Kuis 5 soal konsep karya & teknik sketsa. |
| Refleksi & penutup | 25 | Refleksi: teknik mana yang paling nyaman & mengapa. |

### Minggu 16 · Rabu — Jenis ilustrasi & mulai berkarya
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau hasil latihan arsir; menetapkan target perbaikan. |
| Penguatan konsep | 40 | Membahas jenis ilustrasi (kartun 2D/3D dan lain-lain) serta konteks pemakaiannya. |
| Praktik sketsa konsep | 130 | Setiap siswa membuat 3 sketsa kasar konsep karya (1 tema, 3 pendekatan visual) dan melabeli teknik yang dipakai. |
| Istirahat & transisi | 15 | Istirahat. |
| Klinik sketsa | 40 | Umpan balik keliling: kekuatan komposisi, arah pengembangan. |
| Refleksi & dokumentasi | 25 | Foto & unggah sketsa ke portofolio. |

### Minggu 17 · Senin — Alat, bahan, dan langkah memulai sketsa
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menguji berbagai pensil pada kertas, membandingkan hasil. |
| Eksplorasi konsep | 65 | Membaca D. Memulai Sketsa dan Ilustrasi; mencatat golongan pensil & fungsinya. |
| Demonstrasi | 45 | Guru mendemonstrasikan langkah menggambar dari bentuk dasar ke detail. |
| Latihan terbimbing | 80 | Latihan menggambar objek sederhana dengan tahapan bentuk dasar → proporsi → detail. |
| Asesmen formatif | 30 | Kuis 5 soal alat & langkah sketsa. |
| Refleksi & penutup | 25 | Refleksi: kesulitan pada tahap mana? |

### Minggu 17 · Rabu — Prinsip & unsur desain dalam karya
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Menampilkan 2 karya: satu harmonis, satu sumbang; menebak penyebabnya. |
| Penguatan konsep | 40 | Membahas prinsip desain: kesatuan, keseimbangan, proporsi, penekanan, irama. |
| Praktik penerapan | 130 | Menyusun ulang sketsa minggu 16 dengan menerapkan minimal 3 prinsip desain; mencatat perubahan. |
| Istirahat & transisi | 15 | Istirahat. |
| Klinik & presentasi karya | 40 | Presentasi singkat: prinsip apa yang diterapkan dan efeknya. |
| Refleksi & dokumentasi | 25 | Unggah karya final minggu ini ke portofolio. |

### Minggu 18 · Senin — Dari sketsa menjadi karya
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Meninjau sketsa final; menentukan bentuk karya akhir. |
| Eksplorasi & penguatan | 60 | Membaca F. Konsep Karya DKV melalui Sketsa: poster, majalah, komik. |
| Kerja karya | 130 | Menyelesaikan karya dari sketsa terpilih (poster/komik halaman/ilustrasi majalah) beserta pesan visualnya. |
| Istirahat & transisi | 15 | Istirahat. |
| Umpan balik | 30 | Klinik karya terakhir sebelum penilaian. |
| Refleksi & penutup | 10 | Ceklis kesiapan penilaian. |

### Minggu 18 · Rabu — Presentasi karya, asesmen, dan refleksi semester
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Penjelasan alur presentasi & penilaian akhir semester. |
| Presentasi karya | 80 | Setiap siswa mempresentasikan karyanya: pesan, prinsip desain, proses. |
| Umpan balik & penilaian | 45 | Guru menilai dengan rubrik; teman memberi apresiasi terarah. |
| Istirahat & transisi | 15 | Istirahat. |
| Asesmen akhir semester | 75 | Mengerjakan Asesmen BAB 5 dan Latihan Soal Semester 1 (buku hal. 129-144) secara bertahap. |
| Refleksi & dokumentasi | 35 | Refleksi capaian semester, kurasi portofolio, penetapan target semester 2. |

### Minggu 19 · Senin — Sejarah & konsep tipografi
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: mengamati poster lama vs modern; menebak perubahan gaya huruf. |
| Eksplorasi konsep | 65 | Membaca A. Sejarah Tipografi; menyusun garis waktu 3 era. |
| Demonstrasi & aktivitas 1.1 | 45 | Diskusi hasil Ayo Bereksplorasi 1.1: mencari jenis huruf Phoenicia, Yunani, Romawi dan memberi pendapat. |
| Latihan terbimbing | 80 | Menganalisis 3 contoh desain tipografi (poster/kemasan/majalah) dan mengaitkan dengan kesan yang ditimbulkan. |
| Asesmen formatif | 30 | Kuis 5 soal sejarah & pengertian tipografi. |
| Refleksi & penutup | 25 | Refleksi: era mana yang paling memengaruhi desain hari ini? |

### Minggu 19 · Rabu — Peran tipografi dalam DKV
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau hasil kuis; menetapkan fokus hari. |
| Penguatan konsep | 40 | Evolusi alat: pahat, sablon, mesin cetak, komputer. |
| Praktik mengamati | 125 | Tur visual sekitar sekolah: mencatat 10 contoh tipografi (papan nama, poster, kemasan) dan menilai keterbacaan & kesan. |
| Istirahat & transisi | 20 | Istirahat. |
| Presentasi & umpan balik | 40 | Berbagi temuan; guru mengarahkan pada peran tipografi di DKV. |
| Refleksi & dokumentasi | 25 | Dokumentasi foto temuan ke portofolio. |

### Minggu 20 · Senin — Mengenal klasifikasi huruf
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menebak 'mood' 4 contoh poster dari bentuk hurufnya. |
| Eksplorasi konsep | 65 | Membaca C. Jenis Tipografi dan ciri gambar 1.11-1.14; mengisi tabel ciri. |
| Demonstrasi | 45 | Guru memperlihatkan perbandingan serif/sans serif pada layar & cetak. |
| Latihan terbimbing | 80 | Klasifikasi 20 contoh huruf ke 4 kelompok dengan alasan. |
| Asesmen formatif | 30 | Kuis 8 soal klasifikasi huruf. |
| Refleksi & penutup | 25 | Refleksi: kelompok huruf favorit dan alasannya. |

### Minggu 20 · Rabu — Memilih huruf sesuai karakter pesan
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Mengingat temuan klasifikasi; menyiapkan sesi pemilihan. |
| Penguatan konsep | 40 | Kaitkan karakter huruf dengan pesan: ajakan, peringatan, acara, produk. |
| Praktik pemilihan | 130 | Kelompok memilih & membenarkan pemilihan 3 pasang (pesan-huruf) untuk konteks berbeda; menuliskan alasan. |
| Istirahat & transisi | 15 | Istirahat. |
| Presentasi & umpan balik | 40 | Presentasi pilihan; kelas menilai kesesuaian. |
| Refleksi & dokumentasi | 25 | Unggah ke portofolio. |

### Minggu 21 · Senin — Fungsi tipografi & anatomi huruf
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: membedah huruf besar 'R' dan 'g' di papan tulis. |
| Eksplorasi konsep | 65 | Membaca bagian fungsi & anatomi; melabeli gambar anatomi huruf (1.3-1.7). |
| Demonstrasi | 45 | Guru menggambar anatomi huruf besar di papan; siswa menandai bagian. |
| Latihan terbimbing | 80 | Latihan melabeli 6 huruf berbeda (A, E, g, y, R, T) dengan istilah anatomi. |
| Asesmen formatif | 30 | Kuis mencocokkan istilah-anatomi. |
| Refleksi & penutup | 25 | Refleksi: istilah yang paling sulit diingat + cara menghafalnya. |

### Minggu 21 · Rabu — Praktik: membaca anatomi pada karya
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau latihan; menyiapkan kartu huruf. |
| Penguatan konsep | 40 | Menghubungkan anatomi dengan keterbacaan pada teks panjang. |
| Praktik mandiri | 130 | Membuat poster anatomi satu huruf pilihan: huruf besar + 8 label istilah + penjelasan singkat (karya manual/digital). |
| Istirahat & transisi | 15 | Istirahat. |
| Klinik & pajang karya | 40 | Karya dipajang; saling memeriksa ketepatan label. |
| Refleksi & dokumentasi | 25 | Unggah poster anatomi ke portofolio. |

### Minggu 22 · Senin — Legibility, readability, visibility & headline
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: uji baca 3 contoh teks dari jarak dekat, sedang, jauh. |
| Eksplorasi konsep | 65 | Membaca bagian prinsip; membandingkan 1.8-1.10 dan 1.15-1.20. |
| Demonstrasi | 45 | Guru memperagakan pemotongan headline salah vs benar. |
| Latihan terbimbing | 80 | Memperbaiki 5 contoh headline bermasalah (terpotong, terlalu panjang, kontras lemah). |
| Asesmen formatif | 30 | Kuis 8 soal prinsip keterbacaan. |
| Refleksi & penutup | 25 | Refleksi: kesalahan tipografi yang paling sering saya buat. |

### Minggu 22 · Rabu — Praktik tata letak: hierarki teks
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau perbaikan headline; menyiapkan konten latihan. |
| Penguatan konsep | 40 | Hierarki: headline-subheadline-tubuh-keterangan. |
| Praktik layout | 130 | Menyusun ulang 1 poster sederhana (judul, isi, penutup) dengan hierarki benar; boleh manual/digital. |
| Istirahat & transisi | 15 | Istirahat. |
| Uji baca jauh & umpan balik | 40 | Uji visibility karya dari berbagai jarak; catat temuan. |
| Refleksi & dokumentasi | 25 | Unggah karya + catatan perbaikan ke portofolio. |

### Minggu 23 · Senin — Memahami tiga pengatur spasi
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menilai 3 cuplikan teks dengan spasi berbeda, memilih yang paling nyaman. |
| Eksplorasi konsep | 65 | Membaca E; mencatat definisi leading/kerning/tracking dari buku. |
| Demonstrasi | 45 | Guru mendemonstrasikan perubahan leading & tracking pada teks contoh. |
| Latihan terbimbing | 80 | Latihan manual: menyalin 1 paragraf, menandai pasangan huruf yang butuh kerning khusus. |
| Asesmen formatif | 30 | Kuis 5 soal leading/kerning/tracking. |
| Refleksi & penutup | 25 | Refleksi: spasi seperti apa yang paling nyaman dibaca? |

### Minggu 23 · Rabu — Praktik pengaturan spasi
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau latihan; menentukan teks yang akan ditata. |
| Penguatan konsep | 40 | Rentang spasi yang sehat: terlalu rapat vs terlalu renggang. |
| Praktik pengaturan | 130 | Menata ulang satu teks poster/undangan: atur leading, perbaiki kerning 3 pasang huruf, sesuaikan tracking; cetak/lihat hasil. |
| Istirahat & transisi | 15 | Istirahat. |
| Perbandingan hasil | 40 | Bandingkan sebelum-sesudah; beri skor kenyamanan bersama. |
| Refleksi & dokumentasi | 25 | Unggah sebelum-sesudah ke portofolio. |

### Minggu 24 · Senin — Perancangan karya tipografi
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Membahas rangkuman Bab 1 & brief proyek karya tipografi. |
| Penguatan konsep | 40 | Rambu-rambu karya: pesan jelas, tipografi terarah, rapi. |
| Perancangan | 135 | Menyusun konsep karya: pesan, target pembaca, pilihan 2 huruf, tata letak kasar. |
| Istirahat & transisi | 15 | Istirahat. |
| Pengerjaan & konsultasi | 40 | Pengerjaan karya; konsultasi cepat per siswa. |
| Refleksi & penutup | 15 | Ceklis progres karya. |

### Minggu 24 · Rabu — Penyelesaian, presentasi, & asesmen Bab 1
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Finalisasi karya & ceklis mandiri. |
| Penyelesaian karya | 100 | Menyelesaikan karya; memastikan prinsip keterbacaan dan spasi diterapkan. |
| Istirahat & transisi | 20 | Istirahat. |
| Presentasi karya | 60 | Presentasi: pesan, pilihan huruf, alasan, evaluasi diri. |
| Uji kompetensi Bab 1 | 45 | Mengerjakan Uji Kompetensi (buku hal. 28-29) secara mandiri. |
| Refleksi & dokumentasi | 25 | Dokumentasi karya & refleksi ke portofolio. |

### Minggu 25 · Senin — Jenis kamera & bagian-bagian DSLR
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: membandingkan foto ponsel dan foto kamera profesional. |
| Eksplorasi konsep | 65 | Membaca A & B; mencatat jenis kamera dan bagian DSLR dengan fungsinya. |
| Demonstrasi | 45 | Guru mengenalkan kamera DSLR nyata: siswa menyebut nama bagian saat ditunjuk. |
| Latihan terbimbing | 80 | Berpasangan menjelajahi kamera: temukan & jelaskan 10 bagian, isi lembar identifikasi. |
| Asesmen formatif | 30 | Kuis 10 soal bagian kamera. |
| Refleksi & penutup | 25 | Refleksi: bagian mana yang paling asing bagi saya? |

### Minggu 25 · Rabu — Praktik pengenalan kontrol kamera
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau identifikasi; menyiapkan sesi kontrol kamera. |
| Penguatan konsep | 40 | Dial mode, viewfinder, quick control: fungsi & kapan dipakai. |
| Praktik terstruktur | 130 | Rotasi stasiun: tiap kelompok mempraktikkan menyalakan kamera, memasang baterai/kartu memori, membaca viewfinder, mengubah pengaturan via quick control (tanpa memotret tajam/dengan aman). |
| Istirahat & transisi | 15 | Istirahat. |
| Cek pemahaman | 40 | Permainan 'tebak bagian & fungsi' secara cepat. |
| Refleksi & dokumentasi | 25 | Catatan pengenalan kamera diunggah ke portofolio. |

### Minggu 26 · Senin — Konsep segitiga eksposur
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menilai 3 foto (gelap, tepat, terang) dan menebak penyebabnya. |
| Eksplorasi konsep | 65 | Membaca C. Segitiga Exposure; mencatat definisi & analogi tiap unsur. |
| Demonstrasi | 45 | Guru mendemonstrasikan perubahan diafragma & shutter pada kamera (atau tampilan simulasi). |
| Latihan terbimbing | 80 | Latihan prediksi: 'jika ISO dinaikkan & shutter dipercepat, apa yang terjadi?' (kartu skenario). |
| Asesmen formatif | 30 | Kuis 8 soal segitiga eksposur. |
| Refleksi & penutup | 25 | Refleksi: unsur mana yang paling sulit dipahami? |

### Minggu 26 · Rabu — Praktik/simulasi memengaruhi hasil foto
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau kuis; menyiapkan sesi eksperimen. |
| Simulasi interaktif | 60 | Menjalankan Simulasi Fotografi: mengubah aperture, shutter speed, ISO pada model virtual dan mengamati hasilnya. |
| Eksperimen terkendali | 105 | Praktik nyata: memotret objek sama dengan 3 kombinasi eksposur berbeda; mencatat setelan pada lembar data. |
| Istirahat & transisi | 15 | Istirahat. |
| Analisis hasil | 45 | Membandingkan hasil foto & setelan; menyimpulkan hubungan unsur. |
| Refleksi & dokumentasi | 25 | Unggah 3 foto + tabel setelan ke portofolio. |

### Minggu 27 · Senin — Langkah penggunaan DSLR & alat penunjang
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menyusun urutan langkah pemotretan dari kartu langkah acak. |
| Eksplorasi konsep | 65 | Membaca D & E; mencatat langkah baku dan alat penunjang + fungsinya. |
| Demonstrasi | 45 | Guru mendemonstrasikan rangkaian penggunaan kamera dari awal. |
| Latihan terbimbing | 80 | Praktik rangkaian langkah penggunaan DSLR; berpasangan saling mengecek dengan ceklis. |
| Asesmen formatif | 30 | Kuis 8 soal langkah & alat penunjang. |
| Refleksi & penutup | 25 | Refleksi: langkah mana yang sering terlupa? |

### Minggu 27 · Rabu — Jenis fotografi & latihan pembidikan
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Mengulas jenis fotografi lewat kuis foto cepat. |
| Penguatan konsep | 40 | Pendekatan tiap jenis: potret, makanan, still life, jalanan, aksi, periklanan, alam. |
| Praktik jenis fotografi | 130 | Stasiun mini: kelompok memotret 2 jenis berbeda (mis. still life & potret) dengan menyesuaikan setelan & penunjang. |
| Istirahat & transisi | 15 | Istirahat. |
| Seleksi & diskusi | 40 | Pilih 3 foto terbaik tiap kelompok; diskusikan kesesuaian pendekatan jenis. |
| Refleksi & dokumentasi | 25 | Unggah foto terpilih ke portofolio. |

### Minggu 28 · Senin — Mengenal ukuran gambar & angle
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menebak ukuran gambar & sudut dari 7 contoh foto. |
| Eksplorasi konsep | 65 | Membaca G; mencocokkan istilah dan gambar 2.22-2.31. |
| Demonstrasi | 45 | Guru memotret satu siswa dari 5 sudut berbeda; kelas menebak & menilai efek. |
| Latihan terbimbing | 80 | Latihan berpasangan: 'tangkap' 7 ukuran gambar pada satu objek. |
| Asesmen formatif | 30 | Kuis 10 soal istilah ukuran & sudut. |
| Refleksi & penutup | 25 | Refleksi: ukuran/sudut yang paling sering saya lupakan. |

### Minggu 28 · Rabu — Praktik komposisi & panning
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau kuis; menyiapkan sesi praktik komposisi. |
| Penguatan konsep | 40 | Dasar komposisi & kapan memakai tiap sudut untuk pesan tertentu. |
| Praktik terarah | 125 | Memotret cerita mini 5 bingkai (mulai dari LS sampai ECU) dan mencoba panning bersama. |
| Istirahat & transisi | 20 | Istirahat. |
| Kurasi & umpan balik | 40 | Pilih 5 bingkai terbaik; guru menilai keragaman ukuran/sudut. |
| Refleksi & dokumentasi | 25 | Unggah cerita visual ke portofolio. |

### Minggu 29 · Senin — Karakter arah cahaya
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: memperhatikan wajah teman di bawah 3 arah cahaya ponsel. |
| Eksplorasi konsep | 65 | Membaca H. Pencahayaan; mencatat jenis & efeknya (2.38 dst). |
| Demonstrasi | 45 | Guru memindahkan sumber lampu mengelilingi objek; siswa mengamati perubahan bayangan. |
| Latihan terbimbing | 80 | Latihan menebak arah cahaya dari 10 contoh foto. |
| Asesmen formatif | 30 | Kuis 8 soal pencahayaan. |
| Refleksi & penutup | 25 | Refleksi: arah cahaya favorit & alasannya. |

### Minggu 29 · Rabu — Praktik foto indoor & outdoor dengan pencahayaan
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Menyiapkan sesi indoor & outdoor; meninjau alat. |
| Penguatan konsep | 35 | Strategi indoor (lampu, reflektor sederhana) & outdoor (jam emas, bayangan). |
| Praktik lapangan | 130 | Sesi A: still life indoor dengan 3 arah lampu; Sesi B: potret outdoor; masing-masing 3 foto terbaik. |
| Istirahat & transisi | 20 | Istirahat. |
| Analisis & presentasi | 40 | Membandingkan foto indoor & outdoor; mengaitkan dengan teori arah cahaya. |
| Refleksi & dokumentasi | 25 | Unggah 6 foto + analisis ke portofolio. |

### Minggu 30 · Senin — Dasar penyuntingan foto
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menilai 'foto mana yang diedit berlebihan'. |
| Eksplorasi konsep | 65 | Membaca I. Penyuntingan Fotografi Digital; mencatat alur & etika. |
| Demonstrasi | 45 | Guru menyunting satu foto: crop, eksposur, warna, bersih-bersih gangguan. |
| Latihan terbimbing | 80 | Menyunting 2 foto sendiri dengan urutan baku; mencatat langkah. |
| Asesmen formatif | 30 | Kuis 5 soal penyuntingan. |
| Refleksi & penutup | 25 | Refleksi: batas etika editing menurut saya. |

### Minggu 30 · Rabu — Evaluasi hasil & asesmen Bab 2
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau hasil suntingan; menyiapkan kriteria evaluasi. |
| Penguatan konsep | 35 | Kriteria evaluasi foto: teknis, komposisi, pesan. |
| Klinik evaluasi | 105 | Penilaian sejawat terarah: 3 karya terbaik tiap siswa dinilai dengan lembar kriteria, lalu direvisi. |
| Istirahat & transisi | 20 | Istirahat. |
| Asesmen Bab 2 | 65 | Mengerjakan Asesmen & Uji Kompetensi Bab 2 (buku hal. 83-85). |
| Refleksi & dokumentasi | 25 | Dokumentasi karya foto terbaik semester; refleksi. |

### Minggu 31 · Senin — Eksperimen bitmap vs vektor
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: zoom foto ponsel sampai pecah-pecah. |
| Eksplorasi konsep | 65 | Membaca A. Pengertian Bitmap dan Vektor; mengisi tabel perbandingan. |
| Demonstrasi & simulasi | 45 | Membandingkan pembesaran gambar bitmap & vektor melalui simulasi layar. |
| Latihan terbimbing | 80 | Latihan pengamatan mikroskopis: mengamati piksel gambar bitmap secara digital (zoom) & menggambar path sederhana. |
| Asesmen formatif | 30 | Kuis 8 soal bitmap-vektor. |
| Refleksi & penutup | 25 | Refleksi: perbedaan paling penting bagi pekerjaan saya. |

### Minggu 31 · Rabu — Praktik memilih jenis grafis
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau kuis; menyiapkan studi kasus. |
| Penguatan konsep | 40 | Aturan praktis: kapan bitmap, kapan vektor. |
| Praktik studi kasus | 130 | Kelompok menerima 8 kebutuhan desain (logo, foto katalog, spanduk besar, stiker, dsb.) dan menentukan jenis grafis + alasannya; menyertakan bukti pengujian pembesaran. |
| Istirahat & transisi | 15 | Istirahat. |
| Presentasi & umpan balik | 40 | Presentasi keputusan; guru mengoreksi alasan teknis. |
| Refleksi & dokumentasi | 25 | Unggah tabel keputusan ke portofolio. |

### Minggu 32 · Senin — Mengenal tiga perangkat lunak grafis
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: menebak karya dibuat dengan aplikasi apa. |
| Eksplorasi konsep | 65 | Membaca B; mengisi tabel aplikasi-fungsi-jenis grafis. |
| Demonstrasi | 45 | Guru membuka ketiga aplikasi/alternatif yang tersedia; menunjukkan area kerja & alat dasar. |
| Latihan terbimbing | 80 | Eksplorasi terbimbing: membuat dokumen baru, mengenal toolbar, menyimpan file di tiap aplikasi. |
| Asesmen formatif | 30 | Kuis 8 soal perangkat lunak & kegunaannya. |
| Refleksi & penutup | 25 | Refleksi: aplikasi mana yang paling ingin saya kuasai? |

### Minggu 32 · Rabu — Memilih aplikasi untuk kebutuhan nyata
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau tabel; menyiapkan studi kasus. |
| Penguatan konsep | 40 | Kriteria memilih aplikasi: jenis luaran, ukuran, tim, sumber daya. |
| Praktik alur kerja | 130 | Kelompok merancang alur kerja sederhana proyek (mis. identitas produk UMKM): aplikasi apa untuk riset visual, logo, kemasan, katalog. |
| Istirahat & transisi | 15 | Istirahat. |
| Presentasi alur | 40 | Presentasi alur kerja & alasan pemilihan aplikasi. |
| Refleksi & dokumentasi | 25 | Simpan alur kerja ke portofolio. |

### Minggu 33 · Senin — Objek vektor & warna
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: membedah logo sederhana menjadi bentuk dasar. |
| Eksplorasi & demonstrasi | 70 | Guru mendemonstrasikan membuat objek, mengubah ukuran (pick tool), dan memberi warna isi/garis. |
| Latihan terbimbing | 95 | Latihan berjenjang: membuat 5 objek dasar, memberi warna, menyusun komposisi sederhana. |
| Istirahat & transisi | 15 | Istirahat. |
| Asesmen formatif | 30 | Cek keterampilan: menyelesaikan 3 tantangan cepat (buat, warnai, susun). |
| Refleksi & penutup | 35 | Menyimpan file dengan penamaan benar; refleksi. |

### Minggu 33 · Rabu — Path & pembentukan objek
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau objek Senin; menyiapkan latihan bentuk. |
| Penguatan konsep | 40 | Membahas path & operasi pembentukan (gabung, potong, irisan). |
| Praktik bentuk | 130 | Membuat ikon sederhana (mis. ikon buku atau gelas) dari gabungan bentuk dasar menggunakan operasi pembentukan & pengaturan path. |
| Istirahat & transisi | 15 | Istirahat. |
| Klinik karya | 40 | Umpan balik kerapian path & susunan warna. |
| Refleksi & dokumentasi | 25 | Ekspor hasil (PNG/SVG sederhana) & unggah ke portofolio. |

### Minggu 34 · Senin — Teknik seleksi bitmap
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: membayangkan memisahkan objek dari latar. |
| Eksplorasi & demonstrasi | 70 | Guru mendemonstrasikan marquee, lasso, dan Color Range (Select > Color Range) sesuai gambar 3.61. |
| Latihan terbimbing | 95 | Latihan seleksi berjenjang: bentuk sederhana, objek berlatar warna, lalu objek bertepi kompleks. |
| Istirahat & transisi | 15 | Istirahat. |
| Asesmen formatif | 30 | Tantangan cepat: potong 3 objek dari 3 foto. |
| Refleksi & penutup | 35 | Refleksi teknik seleksi mana yang paling andal bagi saya. |

### Minggu 34 · Rabu — Layer & komposisi bitmap
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau hasil seleksi; menyiapkan komposisi berlapis. |
| Penguatan konsep | 40 | Panel layer: menambah, menamai, membekukan, mengatur urutan. |
| Praktik komposisi | 130 | Menyusun poster sederhana 3 layer (latar, objek utama, teks) dari hasil seleksi; mencoba Color Channels untuk objek bertepi rumit. |
| Istirahat & transisi | 15 | Istirahat. |
| Klinik & penyimpanan | 40 | Umpan balik komposisi; menyimpan dalam format kerja & ekspor. |
| Refleksi & dokumentasi | 25 | Unggah karya & catatan proses ke portofolio. |

### Minggu 35 · Senin — Mengikuti langkah pembuatan produk
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Apersepsi: memilih produk grafis untuk latihan (mug/logo/simple packaging/kartu nama). |
| Eksplorasi & demonstrasi | 70 | Guru mendemonstrasikan salah satu alur lengkap dari buku (membuat lembar kerja, ukuran standar 8x20 cm untuk mug, elemen desain). |
| Latihan terbimbing | 95 | Siswa mengikuti langkah-langkah buku untuk membuat produk pilihan; guru mendampingi per tahap. |
| Istirahat & transisi | 15 | Istirahat. |
| Asesmen formatif | 30 | Ceklis progres: lembar kerja, elemen, warna. |
| Refleksi & penutup | 35 | Menyimpan file kerja dengan penamaan benar; refleksi kendala. |

### Minggu 35 · Rabu — Menyelesaikan & menyajikan produk grafis
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Meninjau progres; menyiapkan penyelesaian karya. |
| Penyelesaian karya | 120 | Menuntaskan produk: menambahkan ikon/logo, memeriksa ukuran & warna, menyimpan (Ctrl+S), dan mengekspor untuk pratinjau. |
| Istirahat & transisi | 15 | Istirahat. |
| Presentasi produk | 60 | Presentasi: apa produknya, untuk siapa, ukuran & alasan desain. |
| Umpan balik & penilaian | 30 | Guru menilai dengan rubrik; catatan perbaikan. |
| Refleksi & dokumentasi | 25 | Unggah hasil & deskripsi ke portofolio. |

### Minggu 36 · Senin — Penyelesaian proyek terpadu
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Pembukaan | 25 | Brief proyek terpadu: karya komunikasi visual mini menggunakan tipografi, foto, dan grafis. |
| Perencanaan akhir | 40 | Menetapkan konsep, pembagian waktu, dan target karya. |
| Kerja proyek | 130 | Pengerjaan proyek (riset, desain, produksi) dengan konsultasi berkala. |
| Istirahat & transisi | 20 | Istirahat. |
| Umpan balik antar tema | 35 | Peer review terarah: tipografi, kualitas foto, kerapian grafis. |
| Refleksi & penutup | 20 | Ceklis kesiapan presentasi. |

### Minggu 36 · Rabu — Presentasi, asesmen akhir, dan refleksi tahunan
6 JP · 270 menit (rincian agenda 270 menit termasuk transisi/istirahat · 1 JP = 45 menit) 〔U〕

| Tahap | Menit | Kegiatan |
|---|---|---|
| Apersepsi | 20 | Penjelasan alur presentasi & penilaian akhir. |
| Presentasi karya | 80 | Presentasi proyek terpadu: konsep, proses, bukti belajar. |
| Asesmen akhir | 65 | Mengerjakan bagian Asesmen BAB 3 & latihan soal terpilih (hal. 139-156) sesuai penugasan guru. |
| Istirahat & transisi | 15 | Istirahat. |
| Remedial & pengayaan terarah | 50 | Remedial bagi yang belum tuntas; pengayaan lanjutan bagi yang sudah tuntas (mis. memperdalam glosarium, tantangan desain tambahan). |
| Refleksi & dokumentasi | 40 | Refleksi tahunan, kurasi portofolio akhir, penetapan target kelas XI. |

---
## 6. Peta simulasi (nyata vs dalam pengembangan)

| Simulasi | Minggu pemakaian | Status jujur |
|---|---|---|
| Simulasi Technopreneurship DKV | 2, 3, 4 | **dalam pengembangan** 〔T7〕 — ditandai di antarmuka, bukan tombol palsu |
| Simulasi K3 & Ergonomi Kerja Desain | 5 | **dalam pengembangan** 〔T7〕 — ditandai di antarmuka, bukan tombol palsu |
| Simulasi Bitmap vs Vektor (pratinjau digitalisasi gambar) | 10, 31, 33, 34 | **berfungsi & sudah diuji** 〔F〕 |
| Simulasi Alur Produksi DKV (menyusun tahapan produksi) | 11, 15 | **berfungsi & sudah diuji** 〔F〕 |
| Laboratorium Sketsa (papan latihan digital: garis, arsir, komposisi) | 16, 17, 18 | **dalam pengembangan** 〔T7〕 — ditandai di antarmuka, bukan tombol palsu |
| Laboratorium Tipografi (pemilihan huruf & kesan) | 19, 20, 21, 22, 23, 24 | **berfungsi & sudah diuji** 〔F〕 |
| Laboratorium Fotografi (model kamera & bagian-bagian interaktif) | 25, 26, 27, 28, 29, 30 | **berfungsi & sudah diuji** 〔F〕 |
| Studio Proyek Desain Terpadu (bahan pendamping) | 35, 36 | **dalam pengembangan** 〔T7〕 — ditandai di antarmuka, bukan tombol palsu |

Minggu tanpa simulasi digital: 1, 6, 7, 8, 9, 12, 13, 14, 32 → diisi praktik langsung (latihan gambar/observasi/diskusi kelas) 〔U〕.

Semua simulasi berlabel: **“simulasi edukatif, bukan pengganti perangkat lunak profesional”**.

---
## 7. Peta asesmen & bukti portofolio

| Minggu | Asesmen formatif (usulan) | Pekan sumatif | Bukti portofolio |
|---|---|---|---|
| 1 | kuis-diagnostik (15 soal) — Pengetahuan awal desain, alat, keselamatan kerja | — | 〔U〕 LKPD: LKPD 01 - Peta Diri & Kontrak Belajar DKV (lembar kerja terisi) + refleksi minggu ini |
| 2 | kuis-pilihan-ganda (5 soal) — Pengertian, tujuan, karakter technopreneur | — | 〔U〕 LKPD: LKPD 02 - Peta Ide Technopreneur DKV (lembar kerja terisi) + refleksi minggu ini |
| 3 | kuis-mencocokkan (8 soal) — Profesi DKV dan deskripsi pekerjaan | — | 〔U〕 LKPD: LKPD 03 - Analisis Profesi & Peluang Usaha DKV (lembar kerja terisi) + refleksi minggu ini |
| 4 | kuis-pilihan-ganda (8 soal) — BAB 1 utuh | — | 〔U〕 LKPD: LKPD 04 - Kanvas Rencana Usaha Sederhana DKV (lembar kerja terisi) + refleksi minggu ini |
| 5 | kuis-pilihan-ganda (5 soal) — Ergonomi duduk, posisi fotografi, angkat beban | — | 〔U〕 LKPD: LKPD 05 - Ceklis Ergonomi & Posisi Kerja Aman (lembar kerja terisi) + refleksi minggu ini |
| 6 | kuis-pilihan-ganda (8 soal) — Perawatan alat & penanganan data | — | 〔U〕 LKPD: LKPD 06 - Perawatan Alat & Pengelolaan Data Karya (lembar kerja terisi) + refleksi minggu ini |
| 7 | kuis-pilihan-ganda (5 soal) — Lingkungan kerja & penanganan hasil kerja | — | 〔U〕 LKPD: LKPD 07 - Audit Ringan Ruang Kerja & Perawatan Karya (lembar kerja terisi) + refleksi minggu ini |
| 8 | kuis-pilihan-ganda (5 soal) — Industri kreatif & subsektor DKV | — | 〔U〕 LKPD: LKPD 08 - Peta Industri Kreatif & Peran DKV (lembar kerja terisi) + refleksi minggu ini |
| 9 | kuis-pilihan-ganda (5 soal) — Revolusi industri, Industri 4.0, dampak DKV | — | 〔U〕 LKPD: LKPD 09 - Garis Waktu Revolusi Industri & Dampak DKV (lembar kerja terisi) + refleksi minggu ini |
| 10 | kuis-pilihan-ganda (5 soal) — Peralihan analog-digital & manfaatnya | — | 〔U〕 LKPD: LKPD 10 - Analog vs Digital: Pilihan Alat Kerja DKV (lembar kerja terisi) + refleksi minggu ini |
| 11 | kuis-pilihan-ganda (5 soal) — Siklus industri & industri hijau | — | 〔U〕 LKPD: LKPD 11 - Studio DKV Hijau & Siklus Produksi (lembar kerja terisi) + refleksi minggu ini |
| 12 | kuis-pilihan-ganda (5 soal) — Konsep kreativitas & alur masalah-ide | — | 〔U〕 LKPD: LKPD 12 - Problem to Ide: Eksplorasi Solusi Visual (lembar kerja terisi) + refleksi minggu ini |
| 13 | kuis-pilihan-ganda (5 soal) — Berpikir kreatif & pertanggungjawaban ide | — | 〔U〕 LKPD: LKPD 13 - Kasus Desain: 2 Konsep & Alasannya (lembar kerja terisi) + refleksi minggu ini |
| 14 | kuis-pilihan-ganda (5 soal) — Kreativitas dalam industri kreatif | — | 〔U〕 LKPD: LKPD 14 - Redesain: Dari Biasa ke Bernilai (lembar kerja terisi) + refleksi minggu ini |
| 15 | kuis-pilihan-ganda (5 soal) — Proses produksi, mutu, media, budaya kerja | — | 〔U〕 LKPD: LKPD 15 - Pengembangan Produk & Budaya Kerja Studio (lembar kerja terisi) + refleksi minggu ini |
| 16 | kuis-pilihan-ganda (5 soal) — Konsep karya, teknik, jenis ilustrasi | — | 〔U〕 Proyek: Proyek Mini: Sketsa Konsep Poster Sekolah (individu) — luaran: 3 sketsa konsep (pilih 1 untuk penyelesaian pada minggu 18); tenggat Minggu 18 + refleksi minggu ini |
| 17 | kuis-pilihan-ganda (8 soal) — Alat gambar & prinsip desain | — | 〔U〕 Proyek: Proyek Mini: Sketsa Konsep Poster Sekolah (lanjutan) (individu) — luaran: Karya sketsa final dengan prinsip desain; tenggat Minggu 18 + refleksi minggu ini |
| 18 | asesmen-sumatif-bab-dan-semester (20 soal) — Asesmen BAB 5 & Latihan Soal Semester 1 (buku hal. 129-144) | ya ⧗ | 〔U〕 Proyek: Proyek Mini: Karya Cetak dari Sketsa Konsep (individu) — luaran: Poster/komik/ilustrasi majalah dengan deskripsi karya; tenggat Minggu 18 (selesai) + refleksi minggu ini |
| 19 | kuis-pilihan-ganda (5 soal) — Sejarah & pengertian tipografi | — | 〔U〕 LKPD: LKPD 19 - Garis Waktu & Galeri Tipografi Sekitar (lembar kerja terisi) + refleksi minggu ini |
| 20 | kuis-pilihan-ganda (8 soal) — Jenis & klasifikasi huruf | — | 〔U〕 LKPD: LKPD 20 - Klasifikasi & Pemilihan Huruf (lembar kerja terisi) + refleksi minggu ini |
| 21 | kuis-mencocokkan (10 soal) — Anatomi huruf & fungsi tipografi | — | 〔U〕 LKPD: LKPD 21 - Poster Anatomi Huruf (lembar kerja terisi) + refleksi minggu ini |
| 22 | kuis-pilihan-ganda (8 soal) — Legibility/readability/visibility & headline | — | 〔U〕 LKPD: LKPD 22 - Hierarki Teks & Perbaikan Headline (lembar kerja terisi) + refleksi minggu ini |
| 23 | kuis-pilihan-ganda (5 soal) — Leading, kerning, tracking | — | 〔U〕 LKPD: LKPD 23 - Spasi yang Nyaman Dibaca (lembar kerja terisi) + refleksi minggu ini |
| 24 | uji-kompetensi-ebab-buku (10 soal) — Uji Kompetensi Bab 1 Tipografi (buku hal. 28-29) | ya ⧗ | 〔U〕 Proyek: Proyek: Karya Desain Berbasis Tipografi (individu) — luaran: Poster/undangan/kartu dengan lembar pertanggungjawaban; tenggat Minggu 24 (selesai) + refleksi minggu ini |
| 25 | kuis-pilihan-ganda (10 soal) — Jenis kamera & bagian DSLR | — | 〔U〕 LKPD: LKPD 25 - Identifikasi Kamera & Bagiannya (lembar kerja terisi) + refleksi minggu ini |
| 26 | kuis-pilihan-ganda (8 soal) — Diafragma, shutter speed, ISO | — | 〔U〕 LKPD: LKPD 26 - Eksperimen Segitiga Eksposur (lembar kerja terisi) + refleksi minggu ini |
| 27 | kuis-pilihan-ganda (8 soal) — Penggunaan DSLR, alat penunjang, jenis fotografi | — | 〔U〕 LKPD: LKPD 27 - Dua Jenis Fotografi & Peralatannya (lembar kerja terisi) + refleksi minggu ini |
| 28 | kuis-mencocokkan (10 soal) — Istilah ukuran gambar & sudut | — | 〔U〕 LKPD: LKPD 28 - Cerita Visual 5 Bingkai (lembar kerja terisi) + refleksi minggu ini |
| 29 | kuis-pilihan-ganda (8 soal) — Jenis & arah pencahayaan | — | 〔U〕 LKPD: LKPD 29 - Studio Cahaya: Indoor & Outdoor (lembar kerja terisi) + refleksi minggu ini |
| 30 | kuis-pilihan-ganda (5 soal) — Penyuntingan foto digital | — | 〔U〕 LKPD: LKPD 30 - Sebelum & Sesudah: Penyuntingan Foto (lembar kerja terisi) + refleksi minggu ini |
| 31 | kuis-pilihan-ganda (8 soal) — Bitmap, vektor, piksel, ketajaman | — | 〔U〕 LKPD: LKPD 31 - Bitmap atau Vektor? Studi Kasus 8 Kebutuhan (lembar kerja terisi) + refleksi minggu ini |
| 32 | kuis-pilihan-ganda (8 soal) — Perangkat lunak grafis & kegunaannya | — | 〔U〕 LKPD: LKPD 32 - Tiga Aplikasi, Satu Proyek (lembar kerja terisi) + refleksi minggu ini |
| 33 | praktik-terbimbing (3 soal) — Tantangan cepat: buat, warnai, susun | — | 〔U〕 LKPD: LKPD 33 - Ikon dari Bentuk Dasar (lembar kerja terisi) + refleksi minggu ini |
| 34 | praktik-terbimbing (3 soal) — Tantangan seleksi cepat | — | 〔U〕 LKPD: LKPD 34 - Poster 3 Layer dari Hasil Seleksi (lembar kerja terisi) + refleksi minggu ini |
| 35 | ceklis-progres (8 soal) — Lembar kerja, elemen, warna, penyimpanan file | — | 〔U〕 Proyek: Proyek: Produk Grafis (Mug/Logo/Packaging/Kartu Nama) (individu) — luaran: File produk + deskripsi desain; tenggat Minggu 35 (selesai) + refleksi minggu ini |
| 36 | asesmen-sumatif-akhir-semester (25 soal) — Bab 3 + latihan soal semester 2 terpilih (hal. 139-156) | ya ⧗ | 〔U〕 Proyek: Proyek Terpadu Semester 2 & Portofolio Tahunan (individu) — luaran: Karya komunikasi visual terpadu + portofolio 8-10 karya bernarasi; tenggat Minggu 36 (selesai) + refleksi minggu ini |

Asesmen diagnostik: minggu 1 (kuis awal). Asesmen sumatif/uji kompetensi: minggu 18, minggu 24, minggu 36. Penilaian karya visual/terbuka dilakukan guru (rubrik per minggu); kuis objektif dinilai otomatis di server.

---
## 8. Rekap waktu

| Item | Nilai |
|---|---|
| Minggu | 36 (18 minggu per semester) |
| Pertemuan | 72 (2 per minggu: Senin & Rabu) |
| JP per pertemuan | 6 JP (270 menit; 1 JP = 45 menit) |
| Total JP | 432 JP |
| Total menit | 19440 menit = 324 jam pelaksanaan |

Rincian per minggu sama untuk seluruh semester (6 JP Senin + 6 JP Rabu); guru dapat mengubah hari, jumlah JP, durasi JP, dan minggu efektif melalui menu pengaturan aplikasi tanpa menyunting kode.

---
## 9. Daftar yang wajib diverifikasi ⧗

1. **CP/ATP** seluruh 36 minggu — buku tidak memuatnya; bandingkan dengan CP Fase E & ATP resmi sekolah.
2. **Kalender pendidikan** — minggu efektif, pekan asesmen, dan hari libur.
3. **Indikator & bobot supervisi** — samakan dengan Instrumen Supervisi yang berlaku (skor 1–4, aspek C.1–C.4).
4. **Lisensi perangkat lunak** — CorelDRAW/Adobe pada buku; alternatif Inkscape/GIMP ⚠.
5. Butir-butir berikut ditandai `⚠` pada matriks karena isinya paling perlu dicek guru:

   - **Minggu 1** (Orientasi Pembelajaran DKV, Asesmen Diagnostik, dan Pengenalan Aplikasi): Minggu orientasi adalah usulan operasional di luar bab buku; dapat digabung dengan minggu 2 bila minggu efektif berkurang.
   - **Minggu 8** (Perkembangan Industri dan Proses Produksi DKV): Pengantar BAB 3 (hal. 51-52) ditambahkan; subbab A buku relatif singkat (1 halaman) sehingga diperkaya studi kasus agar cukup untuk 6 JP + 6 JP.
   - **Minggu 18** (Unsur Visual, Pengembangan Konsep Sketsa, Refleksi, dan Evaluasi Semester): Latihan Soal Semester 1 (hal. 133-144) digunakan sebagai bagian asesmen sumatif; jumlah butir & bobot menyesuaikan kebijakan guru.
   - **Minggu 19** (Pengertian, Sejarah, dan Peran Tipografi): Aktivitas Ayo Bereksplorasi 1.1 diintegrasikan ke pertemuan Senin sesuai buku.
   - **Minggu 20** (Jenis Huruf, Klasifikasi, dan Karakter Tipografi): Ciri klasifikasi merujuk gambar 1.11-1.14 (hal. 15-18); urutan mengikuti alur bab meski gambar berada setelah pembahasan anatomi.
   - **Minggu 24** (Proyek Desain Berbasis Tipografi): Proyek desain tipografi adalah usulan guru (buku hanya menyediakan refleksi/asesmen); guru dapat menggantinya dengan tugas pengayaan buku hal. 29.
   - **Minggu 29** (Pencahayaan serta Praktik Foto Indoor dan Outdoor): Jenis pencahayaan selain side & rim light mengikuti penomoran gambar 2.38-2.39 pada buku; guru dapat menyesuaikan contoh sesuai alat yang tersedia.
   - **Minggu 32** (Pengenalan Perangkat Lunak Grafis dan Kegunaannya): Jika laboratorium belum memiliki lisensi Adobe, guru dapat memakai alternatif (mis. Inkscape/GIMP) sebagai padanan latihan dengan catatan aplikasi industri tetap menjadi acuan buku.
   - **Minggu 33** (Objek Vektor, Warna, Path, dan Fitur Pembentukan Objek): Nomor halaman praktik objek vektor mengikuti bagian B bab 3 (hal. 95-123); fitur yang tersedia berbeda antarkomputer laboratorium - guru menyesuaikan versi aplikasi.
   - **Minggu 34** (Penyuntingan Gambar Bitmap dan Penggunaan Layer): Penyebutan menu Select > Color Range & Color Channels mengikuti gambar 3.61 & hal. 123 buku; versi antarmuka aplikasi dapat berbeda.
   - **Minggu 36** (Proyek Terpadu, Portofolio, Presentasi, Asesmen Akhir, Remedial, Pengayaan, dan Refleksi): Latihan Soal Semester 2 (hal. 143-156) berjumlah besar; guru memilih butir sesuai peta asesmen sekolah. Remedial/pengayaan mengikuti kebijakan kurikulum SMKN 3 Kuningan.
