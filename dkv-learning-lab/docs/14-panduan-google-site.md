# 14 — Memasang/Menautkan Aplikasi di Google Sites

**DKV Learning Lab · SMK Negeri 3 Kuningan** · disusun 13 Oktober 2026
Rujukan: `docs/12-panduan-implementasi.md` (pemasangan) · `docs/13-panduan-online.md` (meng-online-kan)

> ## Jawaban singkat (jujur)
> **Aplikasi ini tidak dapat "dijalankan di dalam" Google Sites.** Google Sites adalah penyusun halaman
> statis — ia tidak dapat menjalankan kode server (Node.js/Express) maupun basis data SQLite. Tidak ada
> cara menaruh `server/index.js` di Google Sites, sama seperti tidak bisa menaruh aplikasi desktop di
> halaman Word.
>
> Yang **bisa** dan sudah diuji: aplikasi tetap berjalan di komputer/VPS (cara A/B/C di `docs/12`), lalu
> **disematkan (embed) sebagai bingkai** di halaman Google Sites, atau ditautkan sebagai tombol.
> Ini disebut *integrasi*, bukan *hosting di Google Sites*.

---

## 1. Empat kemungkinan, dengan penilaian jujur

| # | Cara | Bisa? | Catatan |
|---|---|---|---|
| 1 | **Sematkan (embed) aplikasi ke halaman Google Sites** | ✅ **Bisa — sudah diuji** | Google Sites menjadi "bingkai/portal". Aplikasi wajib diakses lewat **HTTPS** (halaman Google Sites HTTPS → alamat `http://` diblokir sebagai mixed content) dan wajib mengizinkan penyematan (`DKV_FRAME_ANCESTORS`, bagian 3 — tanpa ini aplikasi menolak tampil di bingkai). |
| 2 | **Portal + tombol "Buka DKV Learning Lab"** | ✅ Bisa (paling sederhana) | Halaman Google Sites memuat pengumuman, jadwal, dan tombol menuju URL aplikasi (tab baru). Paling andal di ponsel dan paling sedikit masalah tata letak. |
| 3 | **Aplikasi dijalankan di infrastruktur Google** (Cloud Compute Engine e2-micro) lalu disematkan | ✅ Mungkin | Aplikasi tetap Node+SQLite (bukan Cloud Run tanpa disk). Paket e2-micro free tier tersedia di region tertentu — **belum diuji** dari lingkungan ini (langkah ringkas di bagian 7). |
| 4 | **Ditulis ulang sebagai Google Apps Script + Google Sheets** agar benar-benar "di dalam" Google | ⚠️ Mungkin secara teknis, **tidak disarankan** | Perlu menulis ulang hampir seluruh aplikasi: mesin asesmen 260 butir, rubrik, supervisi 18 indikator, sesi, hash password, rate limit. Google Sheets bukan basis data transaksional; keterbatasan kuota Apps Script (waktu eksekusi & permintaan/hari) akan terasa saat 2 kelas mengerjakan kuis bersamaan. Kehilangan: bcrypt, penegakan hak akses server, transaksi. |

**Rekomendasi sekolah ini:** **Cara 1 (sematkan)** untuk halaman “Aplikasi”, **ditambah** tombol pada **Cara 2**
sebagai jalur alternatif — karena di ponsel, membuka aplikasi langsung (tab baru) memberi pengalaman paling nyaman.

---

## 2. Prasyarat (jangan dilewati)

1. Aplikasi sudah di-online-kan dengan **HTTPS**: `https://dkv.smkn3kuningan.sch.id` (lihat `docs/13`, pilihan
   Cloudflare Tunnel atau VPS+Caddy). Alamat `http://…` **tidak akan tampil** di dalam halaman Google Sites.
2. Penyetelan mode daring: `DKV_ONLINE=1`, `DKV_TRUST_PROXY` sesuai skenario (bagian 3 `docs/13`).
3. Password akun demo sudah diganti (aplikasi memperingatkan di konsol bila belum).
4. Keputusan sekolah: **siapa** yang boleh membuka situs (publik, atau hanya domain sekolah bila memakai
   Google Workspace for Education). Ingat: membatasi situs Google Sites **bukan** pengaman aplikasi —
   pengaman sesungguhnya adalah login aplikasi (username/password tiap siswa).

---

## 3. Yang harus disetel di aplikasi (perubahan 13 Oktober 2026)

Sebelumnya mode daring memasang `X-Frame-Options: DENY` yang **menolak semua** penyematan — bagus untuk keamanan,
tetapi membuat Google Sites menampilkan halaman kosong/galat. Sekarang ada variabel baru:

| Variabel | Isi | Akibat |
|---|---|---|
| `DKV_FRAME_ANCESTORS` | daftar asal yang boleh menyematkan, dipisah spasi | Header `X-Frame-Options` **tidak dikirim**; CSP berisi `frame-ancestors <daftar>`. Bingkai dari asal lain tetap ditolak peramban. |
| *(tidak diisi)* | — | Perilaku lama: `X-Frame-Options: DENY` + `frame-ancestors 'none'` → **tidak bisa** disematkan siapa pun. |

**Penyetelan yang disarankan untuk Google Sites:**

```bash
DKV_ONLINE=1
DKV_TRUST_PROXY=1                                   # 2 bila memakai Cloudflare Tunnel
DKV_FRAME_ANCESTORS="https://sites.google.com https://*.googleusercontent.com"
```

- `https://sites.google.com` → halaman Google Sites (semua situs, termasuk `sites.google.com/view/...`).
- `https://*.googleusercontent.com` → dipakai Google saat pratinjau/situs dengan domain kustom.
- Bila situs dipublikasikan pada **domain sekolah** (mis. `https://dkv-sekolah.sch.id`), tambahkan juga:
  `https://dkv-sekolah.sch.id`.
- Jangan memakai `*` (semua asal) — itu membuka aplikasi untuk disematkan situs mana pun (clickjacking).

Contoh pada unit systemd (`docs/13` bagian 4):

```ini
Environment=DKV_ONLINE=1
Environment=DKV_TRUST_PROXY=1
Environment=DKV_FRAME_ANCESTORS=https://sites.google.com https://*.googleusercontent.com
```

Saat dijalankan, server mencetak baris bukti:

```
Boleh disematkan dalam bingkai oleh: https://sites.google.com https://*.googleusercontent.com
```

---

> **Pemasangan di Windows dari nol:** lihat `docs/15-panduan-windows-online.md` (termasuk skrip
> `app\deploy\jalankan-server-online.bat` yang sudah menyetel `DKV_ONLINE`, `DKV_TRUST_PROXY`, dan `DKV_FRAME_ANCESTORS`).

## 4. Langkah menyematkan di Google Sites

1. Buka **sites.google.com** → *Buat situs baru* (atau buka situs sekolah yang ada).
2. Beri nama halaman, mis. **“Aplikasi Pembelajaran”**.
3. Pilih **Sisipkan (Insert) → Sematkan (Embed)**.
4. Pilih tab **Dengan URL (By URL)** → tempel `https://dkv.smkn3kuningan.sch.id` → **Sisipkan**.
   *(Alternatif lebih terkendali: pilih **Kode sematkan HTML** lalu tempel
   `<iframe src="https://dkv.smkn3kuningan.sch.id" style="border:0;width:100%;height:900px"></iframe>`.)*
5. Tarik sudut blok untuk memperbesar — pakai **tinggi maksimum**. Aplikasi tetap dapat digulir **di dalam**
   blok tersebut, jadi tinggi blok = “jendela” yang siswa lihat.
6. Tambahkan juga **tombol** (Insert → Tombol) bertuliskan **“Buka DKV Learning Lab di tab baru”** yang menaut
   ke URL yang sama; ini jalur paling nyaman untuk ponsel dan bila siswa perlu layar penuh.
7. **Publikasikan**: tombol *Publikasikan* → tentukan alamat situs (mis. `sites.google.com/view/dkv-smkn3`)
   → atur siapa yang boleh melihat (publik, atau hanya organisasi/domain sekolah bila memakai Workspace for Education).
8. Uji dari akun siswa: buka halaman → blok aplikasi tampil → login siswa → kuis/lab dapat dikerjakan.

Tata letak yang disarankan di halaman: **judul + penjelasan singkat + blok sematan + tombol tab baru +
kontak pengelola** (guru/TIK) untuk kendala login.

---

## 5. Bukti pengujian penyematan (13 Oktober 2026, `npm run uji:bingkai`)

Uji dijalankan dengan **Chromium sungguhan**: satu halaman penyemat (asal `http://127.0.0.1:8142` sebagai
tiruan Google Sites) memuat **dua** bingkai — satu ke server ber-izin, satu ke server mode daring tanpa izin.

| # | Pemeriksaan | Hasil nyata | Status |
|---|---|---|---|
| B1 | Bingkai ber-izin dimuat, bingkai tanpa izin ditolak | bingkai ber-izin menampilkan halaman login; bingkai kedua menjadi `chrome-error://chromewebdata/` | LULUS |
| B2 | **Login peserta didik di dalam bingkai** | setelah mengisi username/password dan menekan Masuk **di dalam iframe**, dashboard dan nama siswa tampil | LULUS |
| B3 | Sesi tidak bergantung cookie pihak ketiga | seluruh cookie dihapus + halaman dimuat ulang → siswa **tetap masuk** (token di `localStorage`, cookie tersisa 0) | LULUS |
| B4 | Perlindungan bawaan tetap ada | tanpa `DKV_FRAME_ANCESTORS`, peramban menolak bingkai: *“Framing … violates the following Content Security Policy directive: frame-ancestors 'none'”* | LULUS |
| B5 | Header balasan tepat | ber-izin: `X-Frame-Options` tidak dikirim, CSP `frame-ancestors http://127.0.0.1:8142 https://sites.google.com`; tanpa izin: `DENY` + `frame-ancestors 'none'` | LULUS |
| B6 | Tidak ada galat pemblokiran untuk bingkai ber-izin | 0 pesan pemblokiran untuk bingkai ber-izin | LULUS |

**Hasil: 6/6 LULUS** (rinci: `docs/uji-bingkai-hasil.json`). Setelah perubahan ini dijalankan ulang juga:
`npm test` **40/40 + 38/38**, `npm run audit:api` **33/33**, `npm run audit:ui` **15/15**,
`npm run uji:online` **10/10** — tidak ada regresi.

**Yang belum diuji (jujur):**
- Halaman **Google Sites sungguhan** (uji ini memakai halaman penyemat tiruan dengan perilaku asal yang sama).
  Setelah dipasang, wajib dibuka sekali dari akun siswa dan akun guru.
- Perilaku di **aplikasi Google Sites versi ponsel** dan Safari iOS (pembatasan cookie pihak ketiga paling ketat
  di sana, walaupun aplikasi ini tidak bergantung cookie — sudah diuji B3 di Chromium).
- Ketinggian blok sematan & gulir ganda di layar ponsel nyata.

---

## 6. Hal-hal yang perlu diketahui (batas nyata Google Sites)

| Hal | Penjelasan & tindakan |
|---|---|
| **Halaman kosong saat disematkan** | Berarti header belum mengizinkan → periksa `DKV_FRAME_ANCESTORS` dan pastikan memakai URL **https**. Uji cepat: `curl -sI https://domain/ \| grep -i frame` |
| **Gulir ganda** (gulir halaman Sites + gulir aplikasi) | Perbesar tinggi blok sematan; sediakan tombol “buka di tab baru”; di ponsel utamakan tab baru |
| **Sesi terpisah** antar konteks | Peramban memisahkan penyimpanan di dalam bingkai pihak ketiga: siswa yang membuka lewat halaman Sites akan diminta login sekali lagi bila sebelumnya login langsung. Bukan kerusakan — cukup login sekali di masing-masing jalur |
| **Tidak ada “Masuk dengan Google” (SSO)** | Login tetap username/password aplikasi. Bila sekolah menginginkan SSO Google, itu **pengembangan baru** (OAuth) — belum ada di aplikasi ini |
| **Google Sites bukan pengaman** | Situs yang publik = tautan aplikasi dapat ditemukan orang. Keamanan tetap dari login aplikasi + (bila perlu) Cloudflare Access untuk halaman guru/admin |
| **Pratinjau editor Google Sites** | Di dalam editor, blok sematan kadang tidak tampil sampai situs dipublikasikan — uji di alamat publikasi, bukan di editor |
| **Menimpa aplikasi dengan konten Sites** | Jangan menaruh aplikasi sebagai “sub-halaman” di dalam blok kecil; beri satu halaman penuh khusus aplikasi |
| **Pengumuman/jadwal** | Manfaat terbesar Google Sites bagi kelas ini: pengumuman, jadwal Senin–Rabu, panduan login, dan tautan bantuan — sedangkan pembelajaran tetap di aplikasi |

---

## 7. Bila ingin benar-benar berjalan “di Google” (Compute Engine)

Ringkas (opsi 3), **belum diuji** dari lingkungan pembuatan aplikasi:

1. Buat VM **e2-micro** (Ubuntu LTS) di Google Cloud pada region yang menyertakan free tier; pasang disk 10–20 GB.
2. Ikuti `docs/13` bagian 4 langkah 2–5 (`Node.js 20`, `npm ci`, `npm run build`, `npm run seed` atau pulihkan
   cadangan, systemd).
3. Pasang Caddy + **domain sekolah** (atau Cloudflare Tunnel bila tidak ingin membuka port) untuk HTTPS.
4. Pasang firewall GCP: hanya 22/80/443; **jangan** buka 8080.
5. Jadwalkan snapshot disk harian + `npm run backup` ke bucket Cloud Storage.
6. Sematkan ke Google Sites seperti bagian 4.
   Catatan: MySQL/Cloud SQL **tidak** dapat dipakai langsung oleh aplikasi ini (masih SQLite) — jangan menghapus
   disk, karena basis data hidup di situ.

---

## 8. Ringkas: pilih yang paling kecil risikonya

| Kebutuhan sekolah | Pilihan |
|---|---|
| Halaman informasi kelas + aplikasi dapat dibuka | **Cara 2** (portal + tombol) — paling andal |
| Halaman kelas dengan aplikasi **tampil di dalamnya** | **Cara 1** (sematkan) + tombol tab baru sebagai cadangan |
| Harus “di Google” sepenuhnya | **Cara 3** (Compute Engine), lalu sematkan |
| Harus tanpa server sama sekali | Tidak tersedia — perlu penulisan ulang sebagai Apps Script (Cara 4), di luar lingkup aplikasi ini |

**Daftar periksa singkat:** ☐ HTTPS aktif ☐ `DKV_ONLINE=1` + `DKV_FRAME_ANCESTORS` terisi ☐ password demo diganti
☐ blok sematan tampil di alamat publikasi ☐ login siswa & guru diuji di dalam bingkai ☐ tombol buka-tab-baru ada
☐ cadangan harian jalan ☐ siswa diberi tahu dua tautan (halaman Sites & tautan langsung).
