# 08 — Laboratorium Simulasi Interaktif (7 lab)

**DKV Learning Lab** · Dasar-Dasar Desain Komunikasi Visual · Fase E / Kelas X · SMK Negeri 3 Kuningan
Versi: 1.0 (13 Oktober 2026) · Status: **7 laboratorium berfungsi & teruji** (lihat `05-data-uji-dan-hasil-pengujian.md`)
Lokasi di aplikasi: menu **🧪 Laboratorium Simulasi** pada akun siswa (`/simulasi`, `/simulasi/:id`).

---

## 1. Prinsip yang dipakai semua lab

Setiap laboratorium memenuhi enam syarat berikut — semuanya dapat dilihat langsung di antarmuka:

| Syarat | Wujud di antarmuka |
|---|---|
| Menerima input pengguna | Slider, pilihan huruf, tombol pilih, kotak centang, unggahan pilihan, dsb. |
| Menampilkan perubahan yang terlihat | Pratinjau langsung: poster mini, hasil “pemotretan”, panel bitmap/vektor, gambar postur kerja, kartu konsep, pratinjau karya |
| Memberikan umpan balik | Panel **💬 Umpan balik & tindakan** berisi penilaian ✅/⚠️ beserta alasannya |
| Tombol reset | **↺ Atur ulang** mengembalikan seluruh pengaturan & jawaban ke keadaan awal (komponen dimuat ulang sehingga benar-benar bersih) |
| Tantangan bertingkat | Tiga tingkat per lab; tiap tingkat punya misi dan daftar kriteria yang berubah ⬜ → ✅ |
| Refleksi | Kolom **🪞 Refleksi laboratorium** yang dapat dikirim ke guru (tersimpan pada data refleksi siswa) |

Ditambah: tombol **📤 Kumpulkan hasil tingkat N** menyimpan capaian (simulasi, tingkat, skor kriteria) ke server. Guru melihatnya di **Penilaian → 🧪 Hasil laboratorium**.

> **Penting — apa yang dimodelkan.** Tidak ada kamera, sensor, lensa, atau perangkat lunak desain sungguhan di dalam lab ini.
> Semua angka dan gambar dihitung dengan rumus sederhana yang dibuat untuk pembelajaran. Karena itu setiap lab menampilkan
> label **“model simulasi”** dan penjelasan batasnya masing-masing. Hasil lab **bukan** bukti kemahiran memakai perangkat
> profesional, dan bukan pengganti praktik nyata dengan kamera atau aplikasi desain.

---

## 2. Daftar tujuh laboratorium

| # | Lab | Minggu terkait | Input utama | Perubahan yang terlihat | Kriteria tantangan (3 tingkat) |
|---|---|---|---|---|---|
| 1 | 🔤 **Tipografi** | 19–24 | Teks judul/subjudul/isi, 6 pilihan jenis huruf, ukuran judul–subjudul–isi, perataan, kontras, leading, tracking, kerning | Poster mini berubah huruf/ukuran/jarak/warna; pratinjau pasangan huruf (AV, To, WA); angka karakter per baris, jumlah ukuran berbeda, rasio kontras, rasio judul∶isi | T1 huruf & jarak nyaman · T2 hierarki & perataan · T3 brief poster (panjang baris 45–75 karakter, kontras, huruf isi) |
| 2 | 📷 **Fotografi** | 25–30 | Aperture f/1,8–16, shutter 1/1000–1/2 s, ISO 100–6400; tingkat = jenis pemotretan | Kecerahan latar, blur subjek, blur latar (kedalaman ruang), butiran noise, angka selisih eksposur & kecerahan model | T1 potret seimbang & latar lembut · T2 bekukan atlet (≥1/500) · T3 panggung gelap (ISO ≤3200, rana ≥1/125) |
| 3 | 🖼️ **Bitmap & Vektor** | 10, 31, 33, 34 | Zoom 100–1600%, jenis karya (logo/foto), ukuran keluaran (kartu, A3, spanduk 4×6 m, layar), rekomendasi format, pilihan alasan teknis, karya gabungan | Panel bitmap (piksel bertingkat, teks ikut pecah) vs panel vektor (tetap tajam), skor kualitas, jumlah piksel, kebutuhan piksel tiap keluaran | T1 amati perbesaran ≥800% · T2 pilih format tepat · T3 tiga alasan teknis benar tanpa salah |
| 4 | 🏭 **Alur Produksi** | 11, 15 | Tombol ↑/↓ menyusun 7–8 tahapan; tingkat = jenis brief | Urutan berubah; setelah diperiksa, baris hijau/merah + catatan tiap tahap | T1 poster cetak (8 langkah) · T2 konten media sosial (7) · T3 kemasan produk (8, termasuk uji cetak bahan) |
| 5 | 🦺 **K3 & Ergonomi** | 5 | T1: 11 kondisi kerja ditandai berisiko · T2: 4 slider postur · T3: pilih 3 tindakan aman | T1 penanda + jumlah risiko ditemukan · T2 gambar orang–meja–monitor bergerak, garis pandang mata & pencahayaan berubah, indikator “sejajar” · T3 daftar pilihan bertanda | T1 temukan 5 risiko tanpa salah tandai · T2 empat pengaturan postur dalam rentang aman · T3 tepat tiga tindakan benar |
| 6 | ✏️ **Sketsa & Ilustrasi** | 16–18 | T1 pilih 3 kata kunci (11 pilihan) · T2 pilih gaya + 4 elemen moodboard · T3 skor rubrik 1–4 + langkah perbaikan | Kartu konsep berubah warna & ikon mengikuti gaya + moodboard; lembar penilaian konsep menampilkan total skor dan kriteria terendah | T1 kata kunci sesuai brief tanpa melenceng · T2 gaya & ≥3 elemen relevan · T3 semua kriteria berskor ≥3 + perbaikan tertulis |
| 7 | 🎬 **Studio DKV** | 35–36 | Lima tahap: riset (pilih 3), konsep (sasaran/gaya/media), desain (palet/huruf/kanvas), revisi sesuai temuan uji, presentasi (pilih 4) | Pratinjau karya berubah ukuran/warna/huruf; ringkasan proyek (6 butir) terbentuk otomatis sebagai “slide” | T1 UMKM kopi (kendala cetak hitam putih) · T2 poster A3 dua warna · T3 tiga konten feed untuk ponsel |

Simulasi **💼 Technopreneurship** masih berstatus **dalam pengembangan** dan ditandai apa adanya pada antarmuka (minggu 2–4 tetap memakai materi & LKPD seperti biasa).

---

## 3. Yang dimodelkan dan yang tidak (batas tiap lab)

| Lab | Model yang dipakai | Bukan |
|---|---|---|
| Tipografi | Perhitungan panjang baris dari lebar kolom & lebar rata-rata huruf; aturan rentang ukuran/leading/tracking; kontras diberi perkiraan rasio | Mesin tata letak (kerning otomatis, ligatur, hinting) seperti aplikasi desain profesional; huruf yang dipakai adalah huruf bawaan peramban |
| Fotografi | Rumus kecerahan acuan f/5,6 · 1/125 s · ISO 400, batas blur per jenis gerakan, ambang ISO untuk noise, kedalaman ruang didekati dari nilai f | Hasil sensor kamera, karakter lensa, difraksi, metering sungguhan, warna/white balance |
| Bitmap & Vektor | Kotak 16×16 piksel sebagai contoh; skor kualitas dari perbesaran; kebutuhan piksel dari ukuran cetak & dpi | Mesin render gambar, interpolasi, kompresi berkas, perhitungan ukuran berkas nyata |
| Alur Produksi | Urutan normatif industri kreatif (praproduksi → produksi → pascaproduksi) dari materi buku | Alur wajib sebuah studio; praktik nyata sering mengulang/menggabungkan tahap |
| K3 & Ergonomi | Daftar periksa risiko & rentang postur yang disederhanakan untuk pembelajaran | Penilaian K3 resmi/audit keselamatan; kondisi nyata perlu diperiksa guru/tenaga ahli |
| Sketsa & Ilustrasi | Moodboard & kartu konsep dari pilihan simbol–warna terbatas; rubrik 4 kriteria sebagai alat berpikir konsep | Kanvas menggambar digital; penilaian estetika karya seni sungguhan |
| Studio DKV | Alur kerja studio disederhanakan dengan kunci jawaban pilihan ganda per tahap | Keluaran berkas siap cetak dari perangkat lunak desain; penilaian mutu karya nyata |

---

## 4. Alur pemakaian di kelas (usulan)

1. Guru membuka menu **Simulasi** pada Kontrol Pembelajaran (per kelas + pertemuan). Selama menu tertutup, server menolak pengumpulan hasil (HTTP 403) dan siswa melihat alasannya.
2. Siswa membuka lab sesuai minggu yang sedang berjalan (lihat kolom “Minggu terkait”), membaca **petunjuk**, lalu mencoba bebas.
3. Siswa menyelesaikan **tingkat 1 → 3**, menekan **📤 Kumpulkan hasil tingkat N**, lalu menulis **refleksi**.
4. Guru memeriksa **Penilaian → 🧪 Hasil laboratorium** (nama, kelas, lab, tingkat, skor kriteria, waktu) dan membaca refleksi siswa.
5. Hasil lab dipakai sebagai bukti belajar proses — bukan sebagai nilai akhir karya. Nilai karya tetap dari LKPD/portofolio.

---

## 5. Teknis singkat

| Hal | Keterangan |
|---|---|
| Berkas antarmuka | `app/src/labs.tsx` (kerangka `LabShell` + 4 lab pertama), `app/src/labs2.tsx` (K3, Sketsa, Studio), `app/src/sims.tsx` (daftar & rute) |
| Simpan hasil | `POST /api/simulasi/hasil` (siswa) → tabel `sim_attempts`; `GET /api/simulasi/hasil` (siswa: miliknya; guru/admin: 60 baris terbaru) |
| Log | Setiap pengumpulan mencatat aksi `simulasi_hasil` pada log aktivitas |
| Reset | Tombol reset memuat ulang komponen lab (key React bertambah) sehingga semua state benar-benar kembali ke awal |
| Refleksi | `POST /api/refleksi` dengan awalan `[Lab <nama lab>]`; ikut tunduk pada kunci menu Kuis/Asesmen |
| Uji | 40 uji API + 38 uji antarmuka = **78 uji LULUS** (lihat `05`) |

**Belum selesai / batasan yang dilaporkan jujur:** simulasi Technopreneurship belum dibuat; lab belum diuji di peramban/ponsel sungguhan (uji UI memakai jsdom) sehingga kerapian visual (khususnya pratinjau SVG postur dan kartu konsep) masih perlu diperiksa guru; model simulasi tidak menggantikan praktik memakai kamera dan perangkat lunak desain yang sebenarnya.
