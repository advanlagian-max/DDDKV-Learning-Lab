# 07 — Modul Materi 72 Pertemuan (Senin & Rabu)

**DKV Learning Lab** · Dasar-Dasar Desain Komunikasi Visual · Fase E / Kelas X · SMK Negeri 3 Kuningan  
Berkas ini dibangkitkan otomatis oleh `tools/gen-modul-doc.py` dari data yang benar-benar dipakai aplikasi, 
sehingga isinya selalu sama dengan yang dilihat siswa dan guru.

---

## 1. Ringkasan isi

| Butir | Jumlah |
|---|---|
| Minggu | 36 (2 semester) |
| Pertemuan | 72 (Senin & Rabu @6 JP / 270 menit) |
| Tujuan pembelajaran per pertemuan | 2–3 · total 144 |
| Poin materi per pertemuan | 4 · total 281 |
| Butir asesmen formatif | 147 |
| Kriteria rubrik LKPD | 144 |
| Contoh visual rujukan buku | 45 |
| Diagram orisinal (SVG di aplikasi) | 20 tersedia · 43 rujukan |

Setiap pertemuan memuat 9 bagian wajib: **tujuan, pertanyaan pemantik, materi (pengantar + 4 poin + istilah), 
contoh visual, aktivitas memahami–mengaplikasi–merefleksi, LKPD + langkah + rubrik, asesmen formatif, tugas, 
dan tindak lanjut (remedial & pengayaan)**.

## 2. Struktur berkas data

```text
app/data/_modul_part1..6.json     ← bagian penulisan (masing-masing 6 minggu), sumber suntingan penulis
app/data/modul-sem1.json          ← hasil gabungan minggu 1–18  (dibaca aplikasi)
app/data/modul-sem2.json          ← hasil gabungan minggu 19–36 (dibaca aplikasi)
app/data/diagram-contoh.json      ← 20 diagram orisinal (bentuk sederhana → dirender SVG oleh React)
tools/gabung-modul.py             ← penggabung + pemvalidasi (72 pertemuan, 6 JP/270 menit)
tools/gen-modul-doc.py            ← pembangkit dokumen ini
```

Struktur satu pertemuan (disingkat):

```json
{ "tujuan": ["…", "…"], "pemantik": ["…", "…"],
  "materi": { "pengantar": "…", "poin": ["…","…","…","…"], "istilah": [{"t":"…","a":"…"}] },
  "contohVisual": [{"jenis":"diagram","id":"diagram-alur-produksi","judul":"…","keterangan":"…"},
                   {"jenis":"rujukan-buku","judul":"…","keterangan":"…"}],
  "aktivitas": { "memahami": ["…"], "mengaplikasi": ["…"], "merefleksi": ["…"] },
  "lkpd": { "judul": "…", "langkah": ["…"], "rubrik": [{"kriteria":"…","skor4":"…","skor3":"…","skor2":"…","skor1":"…"}] },
  "asesmenFormatif": { "bentuk": "kuis-pilihan-ganda", "butir": [{"soal":"…","opsi":["…","…","…"],"kunci":0}] },
  "tugas": { "judul": "…", "bentuk": "individu", "luaran": "…" },
  "tindakLanjut": { "remedial": "…", "pengayaan": "…" } }
```

Cara menggabungkan ulang setelah menyunting bagian: `python3 tools/gabung-modul.py` (menjalankan seluruh pemeriksaan), 
lalu `npm run seed` di folder `app` agar basis data memuat modul terbaru.

## 3. Peta 36 minggu (tema Senin–Rabu, asesmen, contoh visual)

| M | Sem | Tema minggu (matriks) | Pertemuan Senin | Pertemuan Rabu | Butir kuis (S/R) | Diagram contoh |
|---|---|---|---|---|---|---|
| 1 | 1 | Orientasi Pembelajaran DKV, Asesmen Diagnostik, dan Pengenal… | Mata pelajaran DD DKV membekali keterampilan dasar bekerja di bidang komunikasi visual: memahami… | Kontrak belajar menjaga kelas praktik tetap aman, tertib, dan adil | 2/2 | alur-kelas |
| 2 | 1 | Technopreneurship dalam Bidang DKV | Technopreneur adalah wirausaha yang memanfaatkan teknologi untuk menciptakan nilai dan peluang u… | Peluang usaha yang baik lahir dari masalah nyata di sekitar | 2/2 | peluang |
| 3 | 1 | Profesi dan Peluang Usaha di Bidang DKV | Bidang DKV tidak hanya berisi satu pekerjaan | Setelah mengenal profesi, langkah berikutnya adalah mengaitkannya dengan usaha yang bisa dimulai… | 2/2 | rencana-usaha |
| 4 | 1 | Potensi Diri, Ide Kreatif, dan Perencanaan Usaha Sederhana | Potensi diri adalah gabungan minat, keterampilan, dan pengalaman | Rencana membuat pekerjaan terarah | 2/2 | rencana-usaha |
| 5 | 1 | K3, Ergonomi, dan Kebiasaan Kerja Aman | Keselamatan dan kesehatan kerja dimulai dari diri sendiri | Pekerjaan DKV sering dilakukan di lapangan: membungkuk untuk sudut rendah, mengikuti gerakan sub… | 2/2 | postur |
| 6 | 1 | Keselamatan Penggunaan Peralatan dan Perangkat Kerja | Peralatan yang terawat bekerja lebih lama dan hasilnya lebih baik | Kehilangan data sama merugikan dengan kehilangan alat | 2/2 | alur-kelas |
| 7 | 1 | Keselamatan Ruang Kerja serta Penanganan Hasil Pekerjaan | Lingkungan kerja memengaruhi mutu dan keselamatan | Karya yang selesai belum berakhir ceritanya: penanganan setelah produksi menentukan apakah karya… | 2/2 | — |
| 8 | 1 | Perkembangan Industri dan Proses Produksi DKV | Industri kreatif mengubah gagasan menjadi barang dan pengalaman yang bernilai | Menelusuri proses membantu kita bekerja lebih tertib | 2/2 | alur-produksi, alur-produksi |
| 9 | 1 | Perkembangan Teknologi Industri dan Era Industri 4.0 | Revolusi industri bergerak dari tenaga otot, tenaga uap dan listrik, otomatisasi, sampai sistem … | Perubahan teknologi membawa peluang kerja baru sekaligus menuntut cara belajar yang berbeda | 2/2 | peluang |
| 10 | 1 | Teknologi Digital dan Media dalam Pekerjaan DKV | Teknologi adalah cara manusia mengerjakan sesuatu | Alat yang tepat bergantung pada keluaran yang diinginkan | 2/2 | bitmap-vektor |
| 11 | 1 | Industri Kreatif dan Prinsip Kerja yang Memperhatikan Lingku… | Industri hijau berusaha menekan dampak lingkungan pada setiap tahap kerja | Praktik hijau diuji pada pekerjaan nyata: menata letak cetak agar tidak ada ruang terbuang, mema… | 2/2 | alur-produksi |
| 12 | 1 | Pengantar Kreativitas dan Eksplorasi Ide | Kreativitas adalah kemampuan menghasilkan gagasan baru yang berguna | Gagasan pertama jarang yang terbaik | 2/2 | peluang |
| 13 | 1 | Berpikir Kreatif dan Pemecahan Masalah Desain | Berpikir kreatif berarti bersedia meninjau masalah dari beberapa sudut | Pemecahan masalah desain berjalan paling baik ketika dikerjakan berkelompok: satu mengamati, sat… | 2/2 | peluang |
| 14 | 1 | Penerapan Kreativitas dalam Industri DKV | Di pasar yang penuh pilihan, karya yang punya ciri lebih mudah diingat | Perbaikan karya dilakukan bertahap: tentukan satu hal yang paling mengganggu, ubah hanya bagian … | 2/2 | alur-produksi |
| 15 | 1 | Alur Proses Produksi, Teknologi, dan Budaya Kerja | Teknologi mengubah cara kerja, tetapi gagasan tetap menentukan mutu | Budaya kerja adalah kebiasaan yang diulang setiap hari: hadir tepat waktu, menyiapkan bahan, men… | 2/2 | — |
| 16 | 1 | Dasar Sketsa dan Ilustrasi | Sketsa adalah gambaran awal gagasan yang cepat dan sederhana, sedangkan ilustrasi adalah gambar … | Ilustrasi memiliki banyak gaya: realis, kartun, dekoratif, dan bentuk sederhana | 2/2 | — |
| 17 | 1 | Teknik Dasar Menggambar dan Ilustrasi Sesuai Cakupan Buku | Menggambar dimulai dari langkah sederhana: mengamati bentuk, membuat garis bantu, menyusun propo… | Unsur desain adalah bahan dasar karya (garis, bentuk, warna, tekstur, ruang), sedangkan prinsip … | 2/2 | prinsip-desain |
| 18 | 1 | Unsur Visual, Pengembangan Konsep Sketsa, Refleksi, dan Eval… | Karya cetak seperti poster, komik, dan ilustrasi majalah memiliki aturan berbeda | Presentasi karya melatih menjelaskan keputusan desain, bukan sekadar menunjukkan gambar | 2/2 | alur-produksi |
| 19 | 2 | Pengertian, Sejarah, dan Peran Tipografi | Tipografi adalah seni dan teknik memilih serta menata huruf agar pesan tersampaikan | Tipografi bekerja bersama gambar untuk mengarahkan mata pengguna | 2/2 | — |
| 20 | 2 | Jenis Huruf, Klasifikasi, dan Karakter Tipografi | Huruf dikelompokkan berdasarkan bentuk dasarnya | Memilih huruf adalah keputusan komunikasi | 2/2 | hierarki-tipografi |
| 21 | 2 | Anatomi Huruf dan Istilah Tipografi | Setiap huruf tersusun atas bagian-bagian yang punya nama | Pada karya nyata, pilihan huruf bekerja bersama warna dan gambar | 2/2 | anatomi-huruf, anatomi-huruf |
| 22 | 2 | Fungsi Tipografi, Hierarki, dan Penerapan dalam Tata Letak | Keterbacaan memiliki tiga sisi: kejelasan bentuk huruf, kenyamanan membaca rangkaian teks, dan k… | Tata letak teks mengatur lebar kolom, jarak baris, dan ruang kosong | 2/2 | hierarki-tipografi, hierarki-tipografi |
| 23 | 2 | Leading, Kerning, Tracking, Keterbacaan, dan Keterlihatan | Tiga istilah spasi sering membingungkan: leading mengatur jarak antarbaris, kerning mengatur jar… | Pengaturan spasi diuji pada karya nyata: poster, kartu, dan tampilan digital | 2/2 | spasi, spasi |
| 24 | 2 | Proyek Desain Berbasis Tipografi | Karya berbasis tipografi menempatkan huruf sebagai unsur utama: poster tipografis, kartu undanga… | Karya akhir dinilai dari keterpaduan pesan, pilihan huruf, dan ketelitian teknis | 2/3 | spasi |
| 25 | 2 | Pengenalan Kamera, Bagian Kamera, dan Perlengkapan Fotografi | Fotografi dimulai dari mengenal alat | Menguasai kamera berarti dapat mengulang hasil yang sama | 2/2 | kamera |
| 26 | 2 | Segitiga Eksposur: Aperture, Shutter Speed, dan ISO | Eksposur adalah jumlah cahaya yang diterima sensor | Pengaturan eksposur diuji di lokasi nyata | 2/2 | segitiga-eksposur, segitiga-eksposur |
| 27 | 2 | Jenis dan Penerapan Fotografi | Alat penunjang membantu fotografer mengendalikan cahaya | Jenis fotografi berkembang sesuai kebutuhan pemesan | 2/2 | kamera |
| 28 | 2 | Shot Size, Sudut Pengambilan Gambar, dan Komposisi | Ukuran gambar menentukan seberapa dekat penonton dengan objek, sedangkan sudut pengambilan menen… | Komposisi mengatur letak objek sehingga foto nyaman dilihat | 2/2 | shot-size, komposisi |
| 29 | 2 | Pencahayaan serta Praktik Foto Indoor dan Outdoor | Arah datangnya cahaya membentuk bayangan, dan bayanganlah yang membuat objek terlihat berdimensi | Di lapangan, cahaya tidak selalu ideal | 2/2 | cahaya, cahaya |
| 30 | 2 | Penyuntingan Foto Digital dan Evaluasi Hasil | Penyuntingan memperbaiki foto agar tampil sesuai maksud, bukan menjadikannya berbeda dari kenyat… | Menilai foto memerlukan kriteria agar penilaian tidak sekadar selera | 2/3 | sunting, sunting |
| 31 | 2 | Perbedaan Grafis Bitmap dan Vektor | Gambar digital disimpan dengan dua cara | Memilih jenis grafis bergantung pada keluaran | 2/2 | bitmap-vektor, bitmap-vektor |
| 32 | 2 | Pengenalan Perangkat Lunak Grafis dan Kegunaannya | Perangkat lunak desain dibedakan menurut jenis gambar yang diolah | Aplikasi yang dipilih menentukan kelancaran kerja | 2/2 | alur-produksi |
| 33 | 2 | Objek Vektor, Warna, Path, dan Fitur Pembentukan Objek | Pada aplikasi vektor, semua yang tampak di kanvas adalah objek: garis, bentuk, dan teks | Bentuk rumit biasanya dibangun dari bentuk sederhana | 2/2 | warna, path |
| 34 | 2 | Penyuntingan Gambar Bitmap dan Penggunaan Layer | Seleksi adalah dasar penyuntingan bitmap: sebelum mengubah sebagian gambar, bagian itu harus dip… | Lapisan membuat pekerjaan rapi dan dapat dibatalkan | 2/2 | layer |
| 35 | 2 | Pembuatan Produk Grafis (Mug, Logo, Packaging, Kartu Nama) | Produk grafis dibuat untuk dipakai, sehingga ukuran dan bahan menentukan cara menyiapkan berkas | Produk selesai bukan berarti pekerjaan berakhir | 2/2 | alur-produksi |
| 36 | 2 | Proyek Terpadu, Portofolio, Presentasi, Asesmen Akhir, Remed… | Proyek terpadu menggabungkan kemampuan tipografi, fotografi, dan komputer grafis dalam satu kary… | Presentasi akhir menunjukkan kemampuan menjelaskan karya, menerima pertanyaan, dan mengakui bagi… | 2/3 | alur-produksi, alur-produksi |

Kolom Senin/Rabu pada tabel di atas memuat **kalimat pembuka materi tiap pertemuan**; teks lengkap (tujuan, pemantik, 
4 poin materi, istilah, aktivitas tiga tahap, LKPD + rubrik, kuis, tugas, dan tindak lanjut) ada di 
`app/data/modul-sem1.json` dan `modul-sem2.json`, serta tampil di halaman pertemuan aplikasi.

## 4. Penanda asesmen & bentuk butir

| Bentuk asesmen formatif | Jumlah pertemuan |
|---|---|
| kuis-pilihan-ganda | 70 |
| uji-kompetensi-ebab-buku | 1 |
| asesmen-sumatif-akhir-semester | 1 |

Kuis pilihan ganda (3 opsi) **dinilai di server** lewat `POST /api/kuis-formatif/:minggu/:hari` — kunci jawaban tidak 
pernah dikirim ke peramban sebelum penilaian. Riwayat percobaan tersimpan pada tabel `quiz_attempts` dan hanya dapat 
dilihat siswa pemiliknya (guru melihat rekap seluruh siswa di menu Penilaian/Rekap).

## 5. Diagram contoh visual

Semua diagram digambar ulang secara orisinal untuk aplikasi ini (usulan ⧗ yang perlu diverifikasi guru) dan tidak menyalin 
gambar buku. Bentuknya disimpan sederhana di `diagram-contoh.json` lalu dirender menjadi SVG oleh `src/modul.tsx`.

| id diagram | judul | dipakai pada |
|---|---|---|
| `diagram-postur` | Postur kerja sehat di depan komputer | m5 S |
| `diagram-alur-kelas` | Alur kerja penggambaran kelas & bangunan | m1 R, m6 R |
| `diagram-peluang` | Tiga hal yang perlu dihitung sebelum berwirausaha | m2 R, m9 R, m12 R, m13 R |
| `diagram-rencana-usaha` | Lima bagian rencana usaha jasa desain | m3 R, m4 R |
| `diagram-alur-produksi` | Alur enam tahap pengerjaan karya desain | m8 S, m8 R, m11 R, m14 R, m18 R, m32 R, m35 R, m36 S, m36 R |
| `diagram-bitmap-vektor` | Bitmap (piksel) dibandingkan vektor (bentuk matematis) | m10 R, m31 S, m31 R |
| `diagram-prinsip-desain` | Prinsip dasar penyusunan karya | m17 R |
| `diagram-anatomi-huruf` | Anatomi huruf dan istilah dasarnya | m21 S, m21 R |
| `diagram-hierarki-tipografi` | Empat tingkat hierarki tulisan satu karya | m20 R, m22 S, m22 R |
| `diagram-spasi` | Jarak antarhuruf dan antar baris tulisan | m23 S, m23 R, m24 R |
| `diagram-segitiga-eksposur` | Tiga pengaturan yang menentukan terang foto | m26 S, m26 R |
| `diagram-kamera` | Bagian utama kamera dan fungsinya | m25 R, m27 S |
| `diagram-shot-size` | Ukuran pengambilan gambar (shot size) | m28 S |
| `diagram-komposisi` | Penempatan objek pada bidang gambar | m28 R |
| `diagram-cahaya` | Tiga arah cahaya pada pemotretan studio sederhana | m29 S, m29 R |
| `diagram-sunting` | Memilih dan menyusun urutan gambar | m30 S, m30 R |
| `diagram-warna` | Susunan warna pada satu karya | m33 S |
| `diagram-path` | Membentuk objek baru dari bentuk dasar | m33 R |
| `diagram-layer` | Susunan lapisan pada berkas bitmap | m34 R |
| `diagram-lkpd-alur` | Alur pengerjaan LKPD tiap pertemuan | — (cadangan) |

## 6. Bagaimana guru menyunting materi

1. Masuk dengan akun guru (Mode Guru) → buka **Pertemuan** → pilih minggu dan hari.
2. Gulir ke bagian **“Mode Guru — sunting materi pertemuan ini”** → tombol **Sunting materi**.
3. Sunting: tujuan, pemantik, pengantar materi, poin materi, istilah, tiga jenis aktivitas, judul & langkah LKPD, rubrik 
   (format `kriteria | skor4 | skor3 | skor2 | skor1`), tugas, dan tindak lanjut; lalu **Simpan materi**.
4. Perubahan tersimpan di server (`PUT /api/kurikulum/:nomor/pertemuan/:hari/modul`), langsung terlihat siswa, dan tercatat 
   sebagai aksi `sunting_modul` pada log aktivitas.

**Belum dapat disunting dari antarmuka (batasan jujur):** butir kuis formatif dan contoh visual/diagram. Keduanya masih 
perlu diubah melalui berkas data oleh pengembang bersama operator.

## 7. Penanda progres per pertemuan

- Siswa menandai **pertemuan** (Senin atau Rabu) yang sudah diselesaikan pada halaman detail pertemuan.
- Server menyimpan daftar pertemuan yang ditandai pada kolom `aktivitas` (tabel `progress`) dan **menggabung**, bukan menimpa, 
  sehingga tanda lama tidak hilang saat pertemuan lain ditandai.
- Status minggu menjadi **selesai** hanya setelah Senin **dan** Rabu ditandai; sebelum itu bernilai **berjalan**.
- Daftar 72 pertemuan menampilkan tanda ✓ pada pertemuan yang sudah ditandai siswa.

## 8. Batas yang perlu diketahui guru

1. Kedua buku acuan tidak memuat CP/ATP; seluruh tujuan adalah **usulan ⧗** yang wajib diverifikasi sekolah.
2. Nomor halaman/subbab pada contoh visual jenis `rujukan-buku` adalah usulan; istilah dapat berbeda dengan buku yang dipakai sekolah.
3. Materi disusun sebagai **parafrase orisinal** setia konsep sumber — bukan salinan verbatim dari buku.
4. Diagram digambar ulang secara orisinal oleh tim aplikasi; verifikasi visual oleh guru masih diperlukan.
5. Pengujian dilakukan lewat uji API dan jsdom (tanpa peramban sungguhan); tampilan cetak/ponsel perlu dilihat langsung oleh guru.

_Dibangkitkan dari data aplikasi: 36 minggu · 72 pertemuan · 147 butir kuis & 144 kriteria rubrik._
