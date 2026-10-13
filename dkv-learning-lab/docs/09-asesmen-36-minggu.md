# 09 — Sistem Asesmen 36 Minggu (LKPD digital, kuis otomatis, formatif, sumatif, praktik, proyek)

Dokumen ini menjelaskan **mesin asesmen 36 minggu** yang berjalan di dalam aplikasi: 260 butir asesmen untuk 72 pertemuan, penilaian otomatis **hanya** untuk pilihan ganda, penilaian karya/proses oleh guru memakai rubrik yang dapat disunting, rekap tiga sudut pandang, serta jalur remedial & pengayaan.

- Data: `app/data/asesmen-36m.json` (dibangkitkan `tools/gen-asesmen.py`)
- Server: `app/server/asesmen.js` (semua endpoint `/api/asesmen*` dan `/api/guru/asesmen*`)
- Antarmuka siswa: `app/src/asesmen2.tsx` → rute `/asesmen/rencana`, `/asesmen/rekap`
- Antarmuka guru: `app/src/guru-asesmen.tsx` → rute `/guru/asesmen`, `/guru/asesmen/:id`, `/guru/rekap-asesmen`, `/guru/remedial`

---

## 1. Komposisi 260 butir asesmen (angka nyata dari basis data)

| Jenis | Jumlah | Dinilai otomatis? | Bobot usulan | KKTp | Kesempatan revisi |
|---|---|---|---|---|---|
| 🔘 Kuis pilihan ganda | 72 (1 per pertemuan) | **ya — di server**, pembahasan terbuka setelah kirim | 15 | 75 | 1 |
| 📝 LKPD digital | 72 (1 per pertemuan) | tidak | 20 | 75 | 2 |
| 📈 Asesmen formatif | 36 (1 per minggu) | tidak | 10 | 70 | 2 |
| 🛠️ Penilaian praktik | 36 (1 per minggu) | tidak | 30 | 70–75 | 1–2 |
| 🎨 Penilaian proyek | 36 (1 per minggu) | tidak | 25 | 75 | 2 |
| 🏁 Asesmen sumatif | 8 (pekan ke-4, 7, 11, 15, 18, 24, 30, 36) | **sebagian** — bagian PG otomatis, karya/uraian dinilai guru | 35 (bab) / 40 (akhir) | 75 | 1 |
| **Total** | **260 asesmen · 243 butir pilihan ganda** | 72 otomatis · 8 sebagian · 180 menunggu guru | — | — | — |

**Kriteria/LKPD.** LKPD memakai kriteria dari modul pertemuan (132 variasi nama kriteria, umumnya 2 kriteria @50 seperti “Kelengkapan isian”, “Kejelasan target”, “Dokumentasi hasil”). Rubrik baku untuk jenis lain:

| Jenis | Kriteria (bobot) |
|---|---|
| Formatif | Pemahaman konsep (33) · Partisipasi & kolaborasi (33) · Refleksi diri (34) |
| Praktik | Persiapan & alat/bahan (25) · Proses & langkah kerja (25) · Keselamatan, ketertiban, kebersihan (25) · Kemandirian & pemecahan masalah (25) |
| Proyek | Kesesuaian dengan brief/tujuan (25) · Kreativitas & orisinalitas ide (25) · Kualitas visual & keterbacaan (25) · Kelengkapan tahap & penyajian (25) |

Setiap butir juga membawa **remedial**, **pengayaan**, **luaran**, **langkah**, **bukti**, dan **sumber** (nomor halaman buku sumber) sehingga guru tidak perlu menyusun ulang.

---

## 2. Alur siswa

1. `/asesmen/rencana` — memilih minggu (1–36) dan jenis asesmen. Kartu menampilkan jenis, pertemuan, **bobot**, **KKTp**, status pengerjaan (`belum`, `draf`, `terkumpul`, `dinilai`, `perlu-revisi`), jumlah kesempatan revisi yang terpakai, dan nilai bila sudah ada.
2. Menekan **Buka** → panel kerja:
   - **Kuis / sumatif:** butir pilihan ganda; setelah dikirim, nilai, jumlah benar, kunci, dan **pembahasan** muncul per butir.
   - **LKPD / formatif / praktik / proyek:** uraian/catatan proses + tautan bukti karya, tabel rubrik (deskriptor skor 4–1) — nilai **tidak** diberikan otomatis.
3. **Kumpulkan pekerjaan** / **Kirim jawaban kuis**; bila guru meminta revisi dan kesempatan masih ada, tombol **Kirim revisi** muncul.
4. `/asesmen/rekap` — tab **per minggu**, **per jenis**, dan **catatan**: nilai, KKTp, komentar guru, status pengumpulan, jumlah revisi, serta saran remedial/pengayaan yang diberikan guru.

## 3. Alur guru (`/guru/asesmen`)

| Tab | Isi |
|---|---|
| 📋 Rencana & rubrik | daftar asesmen per minggu/jenis + **editor**: bobot dalam minggu, KKTp, kesempatan revisi, rubrik (kriteria & deskriptor), dan butir PG beserta kunci + pembahasan |
| ✅ Penilaian rubrik | pilih skor 1–4 tiap kriteria (atau skor manual 0–100 bila tanpa rubrik), komentar, **Simpan nilai**, **Minta revisi**, **Buka ulang (remedial)** |
| 📊 Rekap hasil belajar | tiga mode tabel (peserta didik / minggu / jenis asesmen) + unduh CSV per mode |
| 🩹 Remedial & pengayaan | daftar nilai di bawah KKTp beserta langkah remedial yang tertulis pada asesmen; kandidat pengayaan (nilai akhir ≥ 88 tanpa remedial) |

**Aturan yang ditegakkan server (bukan hanya tampilan):**

1. **Kunci jawaban & pembahasan tidak pernah dikirim** ke peramban sebelum pekerjaan dikirim (diuji: test 23 API).
2. **Nilai hanya otomatis untuk pilihan ganda.** Pekerjaan karya/proses berstatus `terkumpul` dengan `skor = null` sampai guru menilai (diuji: test 26).
3. **Penilaian guru wajib `konfirmasi: true`** — tanpa itu server membalas **HTTP 400** (diuji: test 26 & uji antarmuka 29).
4. **Skor kiriman siswa diabaikan** — siswa mengirim `skor: 100` bersama jawaban salah tetap mendapat 0 (diuji: test 25).
5. **Total bobot kriteria rubrik harus 100** — selain itu **HTTP 400** (diuji: test 27).
6. **Sunting butir/kunci/pembahasan wajib konfirmasi guru** (`konfirmasi: true` pada `PUT /api/guru/asesmen/:id/rubrik`).
7. **Kunci menu berlaku**: menu `kuis` tertutup → pengiriman jawaban kuis/sumatif ditahan (**403** `locked`), menu `lkpd` tertutup → LKPD/praktik/proyek ditahan. Penguncian **tidak menghapus** jawaban/nilai lama.
8. **Skor rubrik 1–4 dipetakan** ke `skor × bobot ÷ 4` dijumlahkan → **0–100**; sumatif menggabungkan bagian PG otomatis dengan bagian karya yang dinilai guru.
9. Setiap aksi penting dicatat di `activity_logs`: `kumpul_asesmen`, `nilai_asesmen`, `ubah_rubrik`, `minta_revisi`, `buka_ulang_asesmen`, `ekspor_rekap_asesmen`.

## 4. Rumus rekap

- **Nilai satu asesmen** = 0–100 (otomatis untuk PG; rubrik guru untuk karya).
- **Nilai minggu** = Σ(skor × bobot asesmen) ÷ Σ(bobot asesmen **yang sudah dinilai**) — komponen yang belum dijalankan/belum dinilai **tidak** menurunkan nilai.
- **Nilai akhir peserta didik** = rata-rata berbobot yang sama dihitung dari seluruh asesmen 36 minggu; karena itu wajar bila awal semester nilainya masih `—`.
- **Remedial** = asesmen dengan skor < KKTp asesmen tersebut; **pengayaan** = nilai akhir ≥ 88 dan tanpa remedial.
- **CSV** memakai pemisah `;` (aman untuk Excel ber-locale Indonesia) dengan mode `siswa`, `minggu`, atau `jenis`.

## 5. Peta endpoint

| Endpoint | Peran | Keterangan |
|---|---|---|
| `GET /api/asesmen/rencana?minggu=&tipe=&ringkas=1` | siswa | rencana + status kerja sendiri; **kunci disembunyikan** |
| `GET /api/asesmen/:id/kerja` | siswa | butir tanpa kunci (sebelum kirim) / lengkap dengan pembahasan (setelah kirim) |
| `POST /api/asesmen/:id/kerja` | siswa | kirim pekerjaan; kuis → dinilai otomatis; karya → `terkumpul` |
| `POST /api/asesmen/:id/revisi` | siswa | kirim ulang selama kesempatan revisi tersisa |
| `GET /api/guru/asesmen?minggu=&tipe=` | guru/admin | daftar + statistik kelas (terkumpul, dinilai, perlu revisi, rata-rata) |
| `GET /api/guru/asesmen/:id` | guru/admin | detail lengkap untuk menilai (termasuk jawaban & tautan bukti siswa) |
| `POST /api/guru/asesmen/:id/nilai` | guru/admin | simpan nilai rubrik + komentar (wajib `konfirmasi: true`) |
| `POST /api/guru/asesmen/:id/minta-revisi` | guru/admin | minta perbaikan (dibatasi kesempatan revisi) |
| `POST /api/guru/asesmen/:id/buka-ulang` | guru/admin | buka ulang pekerjaan untuk **remedial** — nilai lama dikosongkan & tercatat di log |
| `PUT /api/guru/asesmen/:id/rubrik` | guru/admin | sunting bobot/KKTp/revisi/rubrik/butir (bobot total harus 100; ubah butir wajib konfirmasi) |
| `GET /api/guru/rekap-asesmen?kelas_id=&minggu=` | guru/admin | `perSiswa`, `perMinggu` (36 baris), `perJenis` |
| `GET /api/guru/rekap-asesmen.csv?mode=siswa\|minggu\|jenis` | guru/admin | ekspor CSV |
| `GET /api/guru/asesmen-remedial?kelas_id=` | guru/admin | daftar remedial + kandidat pengayaan |

## 6. Batas yang perlu diketahui guru

- **Tidak ada penilaian otomatis untuk karya, proses, atau uraian.** Yang otomatis hanya pilihan ganda; ini disengaja agar nilai seni/proses tetap keputusan guru. Karena itu pekerjaan berstatus `terkumpul` harus dinilai pada tab **Penilaian rubrik**.
- Bobot & KKTp di atas adalah **usulan ⧗** yang dapat disunting guru; bobot total rubrik wajib tetap 100.
- Tabel rekap menampilkan nilai dari komponen yang **sudah dinilai** saja; kelas yang baru memulai minggu 1–2 akan banyak menampilkan `—`.
- Data asesmen dimuat otomatis saat server pertama kali dijalankan (dan **tidak** menimpa suntingan guru pada restart berikutnya). Untuk memuat ulang dari berkas: hapus baris tabel `assessments`/`assessment_work` lalu jalankan `npm run seed`.
