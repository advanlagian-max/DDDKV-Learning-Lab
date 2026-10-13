# BACA PERTAMA — Paket Aplikasi DKV Learning Lab

**Media pembelajaran interaktif Dasar-Dasar DKV (Fase E / Kelas X) · SMK Negeri 3 Kuningan**
36 minggu · 72 pertemuan (Senin & Rabu @6 JP / 270 menit) · aplikasi React + Node.js + SQLite

Paket ini **lengkap dan siap dipasang** — sudah diuji dengan cara mengekstrak ulang paket ini, memasang
dependensi, menjalankan aplikasi, dan memeriksa hasilnya (rincian hasil uji ada di `PAKET-VERIFIKASI-*.md`
di folder induk paket, atau tanyakan ke pengirim paket).

---

## Menjalankan dalam 3 perintah (±10 menit, butuh internet sekali saja)

```bash
cd app
npm install        # memasang dependensi (butuh internet; sekali saja)
npm start          # menjalankan aplikasi di http://localhost:8080
```

Saat pertama dijalankan, aplikasi **mengisi sendiri** basis datanya: 36 minggu kurikulum, 72 modul
pertemuan, 260 butir asesmen, 18 indikator supervisi, dan 13 akun demo. Tidak perlu perintah tambahan.

Bila port 8080 dipakai program lain: `PORT=8081 npm start` (Windows: `set PORT=8081 && npm start`).

**Akun demo** (ganti sebelum dipakai sungguhan — aplikasi akan memperingatkan bila belum diganti):

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Guru | `dewi`, `saidun` | `guru123` |
| Siswa | `aditya` (+9 siswa lain) | `siswa123` |

**Penting:** `npm start` memakai antarmuka yang sudah dibangun di `app/dist/`. Bila Anda **mengubah kode**
(`app/src`), jalankan `npm run build` lalu `npm start` (atau langsung `npm run serve`).

---

## Di mana membaca selanjutnya

| Ingin… | Berkas |
|---|---|
| **Mencoba aplikasi 15 menit (paling awal)** | `COBA-CEPAT.md` |
| **Pemasangan Windows + online + Google Sites (mulai dari nol)** | `docs/15-panduan-windows-online.md` |
| Memasang di sekolah: data sekolah, impor akun siswa, autostart, pelatihan, operasional, cadangan | `docs/12-panduan-implementasi.md` |
| Memakai aplikasi sehari-hari (guru/siswa/admin) | `docs/04-panduan-instalasi-dan-penggunaan.md` |
| Mengakses dari internet (HTTPS, VPS, Cloudflare Tunnel) | `docs/13-panduan-online.md` |
| Menempelkan di Google Sites (sematkan) | `docs/14-panduan-google-site.md` |
| Membaca hasil audit menyeluruh (48 pemeriksaan nyata) | `docs/11-audit-laporan.md` |
| Melihat bukti mentah audit & uji | `docs/audit-*.json`, `docs/uji-*.json` |
| Memahami isi kurikulum 36 minggu, modul, asesmen, supervisi | `docs/03`, `docs/07`, `docs/09`, `docs/10` |
| Ringkasan proyek & perintah | `README.md` |

---

## Isi paket

```
dkv-learning-lab/
├── README.md                 ringkasan proyek + perintah
├── BACA-PERTAMA.md           berkas ini
├── docs/                     15+ dokumen: panduan, kurikulum, asesmen, supervisi, laporan audit, bukti uji
├── tools/                    pembangkit dokumen (matriks, modul, asesmen, laporan audit)
├── sumber/                   buku sumber: hasil ekstraksi teks (dan PDF bila paket lengkap)
└── app/
    ├── package.json          perintah: start / serve / seed / test / audit / uji:online / uji:bingkai / backup / impor:akun
    ├── server/               server Express, skema basis data, mesin asesmen, supervisi, seed
    ├── src/                  antarmuka React (siswa, guru, admin, lab simulasi, cetak)
    ├── data/                 kurikulum, modul, asesmen, diagram (JSON) — basis data dibuat otomatis
    ├── dist/                 antarmuka hasil build (siap pakai)
    ├── deploy/               skrip menjalankan otomatis, pencadangan, unit systemd
    └── tools/                audit, uji online & penyematan, pencadangan, impor akun
```

Tidak disertakan (memang tidak perlu): `node_modules/` (dibuat oleh `npm install`) dan berkas basis data
`app/data/dkv.db*` (dibuat otomatis saat pertama dijalankan, agar Anda mulai dari data bersih).

---

## Perintah yang sering dipakai

| Perintah | Fungsi |
|---|---|
| `npm start` | Menjalankan aplikasi (antarmuka `dist/` yang sudah ada) |
| `npm run serve` | Bangun ulang antarmuka + jalankan |
| `npm run build` | Hanya membangun antarmuka (`src/` → `dist/`) |
| `npm run seed` | **Mereset** basis data ke data demo (hati-hati: menghapus data) |
| `npm run backup` | Mencadangkan basis data (terverifikasi + rotasi berkas) |
| `npm run impor:akun -- --file data/contoh-impor-akun.csv --kering` | Uji impor akun massal (tanpa menyimpan) |
| `npm test` | 41 uji API + 38 uji antarmuka (untuk pengembang) |
| `npm run uji:impor` | Uji alur “Tambah siswa massal” di antarmuka (8 pemeriksaan peramban) |
| `npm run audit` | Audit 33 pemeriksaan API + 15 pemeriksaan peramban |
| `npm run uji:online` | 10 pemeriksaan kesiapan pemasangan di internet |
| `npm run uji:bingkai` | 6 pemeriksaan penyematan di halaman lain (mis. Google Sites) |

Cara termudah menambah akun siswa: **Panel Admin → 👤 Akun → “Tambah siswa massal”** (tempel dari Excel, tanpa terminal,
lengkap dengan unduh daftar akun CSV). Contoh CSV untuk cara terminal: `app/data/contoh-impor-akun.csv` dan templat siap isi `app/data/TEMPLATE-daftar-siswa.csv`
(kolom: nama, username, nis, kelas, role, sandi). Di Windows, `${CD}` sudah tersedia—lihat `deploy\cek-komputer.bat`
dan `deploy\jalankan-server-online.bat`.

---

## Syarat minimum

- **Node.js 18+ (disarankan 20 LTS)** dan npm — unduh di nodejs.org
- Peramban modern (Chrome/Edge/Firefox) di komputer guru; siswa cukup memakai peramban HP
- Internet **hanya sekali** untuk `npm install`; setelah itu aplikasi berjalan tanpa internet
- Windows / Linux / macOS

---

## Yang perlu Anda ketahui sebelum dipakai resmi (jujur)

1. **Data awalnya data demo** (13 akun contoh, kalender contoh). Ganti password demo, sunting identitas sekolah
   & kalender, lalu impor akun nyata — langkahnya di `docs/12`.
2. **Belum diuji di Firefox/Edge/Safari** dan perangkat ponsel fisik; yang diuji: Chromium sungguhan
   (desktop & emulasi ponsel), 15 pemeriksaan antarmuka + 33 pemeriksaan API, seluruhnya LULUS.
3. **1 simulasi masih berstatus “pengembangan”** (Technopreneurship DKV) dan ditandai jujur di antarmuka.
4. **Belum ada tanda tangan elektronik, unggah gambar bukti, pemulihan password mandiri**, dan uji beban
   banyak pengguna serentak. Daftar lengkap batas: `docs/11-audit-laporan.md` bagian 6 dan `docs/12` bagian 13.
5. Buku sumber (PDF) berhak cipta milik Kemendikbudristek — hanya untuk keperluan pembelajaran.
