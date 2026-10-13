# 12 — Panduan Implementasi (Penerapan di Sekolah)

**DKV Learning Lab · Dasar-Dasar DKV Fase E · SMK Negeri 3 Kuningan**
Disusun 13 Oktober 2026 · acuan teknis: `docs/04-panduan-instalasi-dan-penggunaan.md` ·
bukti kesiapan: `docs/11-audit-laporan.md` (48 pemeriksaan nyata, 48 LULUS)

Dokumen ini menjawab satu pertanyaan: **bagaimana aplikasi ini benar-benar dipakai di sekolah** — dari memasang,
mengisi data, melatih guru, sampai rutin harian, pencadangan, dan evaluasi. Semua perintah di bawah sudah
dijalankan pada aplikasi ini, kecuali bagian yang **ditandai "belum diuji"** (ditulis jujur, tidak disembunyikan).

---

## 0. Ringkasan cepat (bila hanya punya 30 menit)

| Langkah | Perintah / tindakan | Perkiraan waktu |
|---|---|---|
| 1 | Pasang **Node.js 20 LTS** di komputer guru | 10 menit |
| 2 | `cd app && npm install` | 5–10 menit (butuh internet sekali) |
| 3 | `npm run seed` — isi 36 minggu, 260 asesmen, akun demo | < 1 menit |
| 4 | `npm start` — aplikasi hidup di `http://localhost:8080` | langsung |
| 5 | Buka di peramban, masuk sebagai `admin/admin123`, ganti password | 3 menit |
| 6 | Siapkan data nyata: identitas sekolah, kalender, kelas, akun siswa | 1–2 jam |
| 7 | Uji coba 1 kelas (1 minggu), lalu jalan penuh | — |

Untuk peserta didik: mereka membuka **`http://IP-KOMPUTER-GURU:8080`** dari HP/laptop yang tersambung ke
**WiFi/jaringan sekolah yang sama**. Tidak perlu internet, tidak perlu memasang apa pun di perangkat siswa.

---

## 1. Pilih cara pemasangan

| | **A. Laptop guru (disarankan untuk mulai)** | **B. Komputer/server sekolah + LAN** | **C. VPS/hosting di internet** |
|---|---|---|---|
| Cara kerja | Aplikasi jalan di laptop guru; siswa mengakses lewat WiFi yang sama | Aplikasi jalan 24 jam di komputer lab/server sekolah | Aplikasi jalan di penyedia cloud, diakses dari mana saja |
| Kelebihan | Paling murah, tidak perlu izin IT, data ada di tangan guru | Selalu tersedia, tidak terganggu laptop dimatikan | Bisa diakses dari rumah |
| Kekurangan | Bila laptop mati/sleep, siswa putus | Perlu komputer yang menyala terus + IP jaringan tetap | **Wajib HTTPS**, perlu pengelolaan server, data pribadi siswa keluar dari sekolah |
| Kesiapan aplikasi | ✅ Siap | ✅ Siap (bila pemasangan otomatis dipasang, bagian 5) | ⚠️ Siap teknis, tetapi **keamanan jaringan menjadi tanggung jawab pengelola** (bagian 10) |

**Rekomendasi:** mulai dari **A** selama 2–4 minggu pertama, lalu pindah ke **B** bila sudah lancar.
Gunakan **C** hanya bila sekolah sudah punya pengelola server/HTTPS.
Aplikasi ini **tidak** dilengkapi HTTPS sendiri — jangan membuka port 8080 langsung ke internet tanpa HTTPS.

> **Pengguna Windows yang baru mulai (Node.js belum terpasang) & ingin langsung online + Google Sites:**
> ikuti saja panduan khusus itu: **`docs/15-panduan-windows-online.md`** (mulai dari memasang Node.js sampai go-live).

> **Ingin ditempel di Google Sites?** Google Sites tidak dapat menjalankan aplikasi Node/SQLite — yang bisa
> adalah menyematkan (embed) aplikasi yang sudah online ke halaman Google Sites, atau menautkannya sebagai tombol.
> Dua-duanya sudah diuji (`npm run uji:bingkai` → 6/6 LULUS) dan langkahnya ada di **`docs/14-panduan-google-site.md`**.

> **Ingin di-online-kan?** Langkah lengkap (VPS+Caddy, Cloudflare Tunnel tanpa membuka port, platform awan),
> penyetelan variabel `DKV_ONLINE` / `DKV_TRUST_PROXY` / `HOST`, pencadangan di server, pemantauan uptime,
> dan daftar periksa go-live ada di **`docs/13-panduan-online.md`**. Uji kesiapannya: `npm run uji:online`
> (10 pemeriksaan — hasil 13 Okt 2026: **10/10 LULUS**).

---

## 2. Kebutuhan perangkat & perangkat lunak

| Kebutuhan | Minimum | Catatan |
|---|---|---|
| Komputer aplikasi | Windows 10/11, Linux, atau macOS; RAM 2 GB; disk kosong ± 500 MB | Yang diuji: Linux + Node.js 20.20.2 |
| Node.js | **18 LTS atau lebih baru (disarankan 20 LTS)** + npm | `node -v` untuk memeriksa; unduh di nodejs.org |
| Peramban siswa | Chrome/Edge/Firefox versi 2 tahun terakhir, HP atau laptop | Antarmuka responsif (diuji pada 390×844 dan 1366×768) |
| Jaringan | WiFi/LAN sekolah (satu jaringan dengan komputer aplikasi) | Untuk cara A/B |
| Internet | **Hanya sekali** saat `npm install` | Setelah itu aplikasi berjalan tanpa internet |

Ukuran nyata aplikasi ini: `node_modules` 164 MB, `dist` (antarmuka) 520 KB, `data` (data + basis data) 7 MB,
basis data awal 1,4 MB. Antarmuka tidak memuat apa pun dari internet (tidak ada CDN/font daring), jadi
**pembelajaran tetap jalan walau internet sekolah mati** selama siswa berada di jaringan yang sama.

---

## 3. Pemasangan langkah demi langkah

```bash
# 1. Masuk ke folder aplikasi
cd dkv-learning-lab/app

# 2. Pasang dependensi (butuh internet, sekali saja)
npm install

# 3. Isi basis data: 36 minggu, 72 pertemuan, 260 asesmen, 18 indikator supervisi, akun demo
npm run seed

# 4. Bangun antarmuka (React → dist/) lalu jalankan server
npm run serve          # = "npm run build" + "npm start"
```

Tampilan yang benar setelah berhasil:

```
> dkv-learning-lab@0.1.0 serve
✓ built in 1.8s
DKV Learning Lab berjalan di http://0.0.0.0:8080
```

- `0.0.0.0` berarti aplikasi **menerima koneksi dari perangkat lain** di jaringan yang sama (bukan hanya komputer itu).
- Buka `http://localhost:8080` di peramban → halaman login.
- Bila port 8080 dipakai program lain: `PORT=8081 npm start` (Windows: `set PORT=8081 && npm start`).

### 3.1 Menjalankan sehari-hari

| Sistem | Cara cepat | Cara otomatis |
|---|---|---|
| Windows | klik dua kali `app/deploy/jalankan-server.bat` (jendela harus tetap terbuka) | Task Scheduler (bagian 5) |
| Linux/macOS | `./app/deploy/jalankan-server.sh` | systemd (bagian 5) |

Setelah mengubah kode sumber, jalankan `npm run build` lagi sebelum `npm start`
(`npm run serve` melakukan keduanya sekaligus).

### 3.2 Akun demo — WAJIB diganti sebelum dipakai sungguhan

| Peran | Username | Password awal | Catatan |
|---|---|---|---|
| Admin | `admin` | `admin123` | Punya akses penuh (akun, kelas, kalender, log) |
| Guru | `dewi`, `saidun` | `guru123` | Dewi → X DKV 1, Saidun → X DKV 2 (contoh) |
| Siswa | `aditya` + 9 siswa lain | `siswa123` | Data contoh kelas |

Cara mengganti password: masuk dengan akun tersebut → **⚙️ Akun → Ganti password**
(wajib memasukkan password lama). Untuk akun yang belum pernah dipakai, Admin juga dapat
mereset password dari **Panel Admin → Akun → Reset password**.
Setelah data nyata masuk, akun demo sebaiknya **dinonaktifkan** (tombol aktif/nonaktif di Panel Admin).

---

## 4. Menyiapkan data sekolah (urutan yang disarankan)

| Urutan | Kegiatan | Di mana | Siapa |
|---|---|---|---|
| 1 | Ganti password admin & guru | ⚙️ Akun → Ganti password | Admin/guru |
| 2 | Identitas sekolah, tahun ajaran, pengumuman | Admin → **Pengaturan & Kalender** | Admin |
| 3 | Hari pembelajaran, JP per pertemuan, menit per pertemuan (6 JP × 45 menit = 270) | Admin → Pengaturan & Kalender | Admin |
| 4 | Pekan berjalan (minggu aktif) | Admin → Pengaturan & Kalender | Admin |
| 5 | Kalender sekolah (libur, asesmen) — **data awal masih contoh** | Admin → Pengaturan & Kalender | Admin + kurikulum |
| 6 | Kelas (mis. X DKV 1, X DKV 2) | Admin → Kelas, atau otomatis saat impor akun | Admin |
| 7 | Akun guru | Admin → Akun (satu per satu) | Admin |
| 8 | **Akun siswa massal (1 kelas ±36 siswa)** | `tools/impor-akun.mjs` (bagian 4.1) | Admin/TIK |
| 9 | Kelas & mapel tiap guru (pembagian X DKV 1 ke Dewi, X DKV 2 ke Saidun) | Admin → Akun (kelas tiap guru) | Admin |
| 10 | Akun contoh dinonaktifkan | Admin → Akun | Admin |

### 4.1 Menambah akun siswa

Ada dua cara — **keduanya sudah diuji**:

**Cara A — dari dalam aplikasi (tanpa terminal, cocok untuk admin/guru):**
masuk sebagai `admin` → **Panel Admin → 👤 Akun** → panel **“Tambah siswa massal (tempel dari Excel / daftar kelas)”**:

1. Tempel daftar dari Excel/Dapodik ke kotak teks (satu baris = satu siswa). Kolom dipisah TAB (salin dari Excel),
   titik koma, atau koma: `Nama · NIS · Kelas · username (opsional) · sandi (opsional)`.
   Baris tanpa kolom kelas memakai **Kelas bawaan** yang dipilih di sebelah kanan.
2. Isi **Sandi awal** (bawaan `dkv2026`, minimal 6 karakter) dan biarkan **“Buat kelas baru otomatis”** tercentang.
3. Klik **🔍 Periksa dulu** → muncul pratinjau (termasuk penanda kelas yang belum ada) **tanpa menyimpan apa pun**.
4. Klik **📥 Impor akun** → daftar akun yang dibuat tampil lengkap dengan username otomatis dan sandi awal.
5. Klik **⬇️ Unduh daftar akun (CSV)** untuk dibagikan kepada siswa / dicetak, lalu minta siswa mengganti sandi di **⚙️ Akun**.

Perilaku yang sudah diuji (`npm run uji:impor`, 8/8 LULUS):
- username dibuat otomatis dari nama (`Uji Massal Satu` → `ujimassalsatu`), dan bila bentrok ditambah angka;
- **aman ditekan dua kali**: baris yang siswanya sudah ada (nama + kelas) atau username-nya sudah dipakai akan **dilewati**
  tanpa mengubah data lama — jadi tidak ada akun kembar;
- akun hasil impor **benar-benar dapat login**; tombol unduh CSV tetap tersedia walau impor berikutnya tidak menambah akun;
- peserta didik yang mencoba endpoint impor menerima **403**; daftar kosong atau sandi < 6 karakter ditolak **400** (uji ke-41 pada `npm test`).

**Cara B — lewat berkas CSV dengan perintah terminal (untuk operator/TIK atau ratusan akun):**

Sediakan berkas CSV dengan kolom berikut
(contoh siap pakai: **`app/data/contoh-impor-akun.csv`**):

```csv
nama,username,nis,kelas,role,sandi
Aditya Pratama,aditya,0071234567,X DKV 1,siswa,
Bunga Lestari,bunga,0071234568,X DKV 1,siswa,
Dewi Lestari,dewi,198501012010012001,,guru,
```

- `nama` = nama lengkap (wajib) · `username` · `nis` (boleh kosong) · `kelas` (nama kelas; boleh kosong untuk guru)
  · `role` (`siswa`/`guru`/`admin`; bawaan `siswa`) · `sandi` (boleh dikosongkan → memakai `--sandi-awal`).
- Nama kolom boleh berupa `nama_lengkap`, `nis_nip`, `password`, dan sejenisnya; pemisah koma atau titik koma.
- Aturan idempotennya sama dengan Cara A: baris tanpa username yang siswanya sudah ada (nama + kelas) akan dilewati.

```bash
cd app

# 1) Periksa dulu tanpa menyimpan apa pun
node tools/impor-akun.mjs --file data/contoh-impor-akun.csv --kering

# 2) Impor sungguhan + buatkan kelas yang belum ada
node tools/impor-akun.mjs --file data/contoh-impor-akun.csv --buat-kelas --sandi-awal dkv2026
```

Hasil nyata saat alat ini diuji (pada salinan basis data, 3 akun + 1 kelas baru):

```
+ kelas dibuat: X DKV 3 (id 3)
  DIBUAT    Uji Coba Satu (ujicoba1) · X DKV 3
  DIBUAT    Uji Coba Dua (ujicoba2) · X DKV 3
  DIBUAT    Guru Uji Coba (guruuji)
Ringkasan: 3 dibuat, 0 dilewati, 0 gagal
Laporan  : ...-hasil.csv
```

Uji lanjutan: login akun hasil impor berhasil (HTTP 200, peran benar), dan **dijalankan ulang seluruh baris
dilewati** (`username sudah ada`) sehingga aman diulang-ulang. Setiap baris juga ditulis ke berkas
`…-hasil.csv` (status + pesan) sebagai tanda terima untuk arsip sekolah.

> Tips: setelah siswa masuk pertama kali, minta mereka mengganti password di **⚙️ Akun**.
> Bila ada siswa yang lupa password, Admin meresetnya dari Panel Admin (belum ada pemulihan mandiri).

---

## 5. Membuat aplikasi hidup otomatis & dapat diakses siswa

### 5.1 Cari alamat untuk siswa (cara A/B)

1. Di komputer aplikasi, jalankan `ipconfig` (Windows) atau `ip a` (Linux) → catat **IPv4**
   contoh: `192.168.1.24`.
2. Alamat untuk siswa: **`http://192.168.1.24:8080`**.
3. Uji dari HP siswa: buka alamat itu → halaman login muncul.
4. Bila tidak bisa dibuka, buka izin firewall (Windows, jalankan **sebagai Administrator**):

```bat
netsh advfirewall firewall add rule name="DKV Learning Lab 8080" dir=in action=allow protocol=TCP localport=8080
```

5. Agar alamat tidak berubah, minta TIK menetapkan **IP tetap (static)** atau *DHCP reservation* untuk komputer itu,
   lalu tulis alamat tersebut di papan tulis / grup kelas.

### 5.2 Windows — jalankan otomatis saat komputer menyala

**Task Scheduler** (bukan folder Startup, agar jendela tetap berjalan walau tidak ada yang login):

1. Buka *Task Scheduler* → **Create Task**.
2. **General**: nama `DKV Learning Lab`; centang *Run whether user is logged on or not*; centang *Run with highest privileges*.
3. **Triggers**: *New…* → *Begin the task: At startup* (dan satu lagi *At log on* bila komputer tetap login manual).
4. **Actions**: *New…* → *Start a program* →
   *Program/script*: `C:\dkv-learning-lab\app\deploy\jalankan-server.bat`
   *Start in*: `C:\dkv-learning-lab\app\deploy`
5. **Conditions**: hapus centang *Start the task only if the computer is on AC power*.
6. Simpan, lalu uji dengan *Run* dan buka `http://localhost:8080`.

> Berkas `.bat` ini **belum diuji** di Windows pada lingkungan pembuatan aplikasi. Periksa sekali di komputer
> sekolah: pastikan jendela muncul, alamat tampil, dan halaman login terbuka.

### 5.3 Linux — layanan systemd

```bash
sudo cp app/deploy/dkv-learning-lab.service /etc/systemd/system/
sudo nano /etc/systemd/system/dkv-learning-lab.service      # sesuaikan User & WorkingDirectory
sudo systemctl daemon-reload
sudo systemctl enable --now dkv-learning-lab
systemctl status dkv-learning-lab
journalctl -u dkv-learning-lab -f                            # melihat log
```

> Unit systemd ini **belum diuji** (lingkungan pembuatan aplikasi tidak memakai systemd). Periksa dengan
> `systemctl status` setelah dipasang.

---

## 6. Rencana penerapan bertahap (4 minggu)

| Minggu | Kegiatan | Penanggung jawab | Bukti keberhasilan |
|---|---|---|---|
| **1** | Pasang aplikasi, ganti password, isi identitas sekolah & kalender, impor akun 2 kelas, tetapkan IP + autostart | Guru DKV + TIK | 72 akun siswa dapat login; guru dapat login; halaman 36 minggu terbuka |
| **2** | **Uji coba 1 kelas** (1 minggu pelajaran penuh): materi minggu aktif, 1 laboratorium, 1 kuis, 1 LKPD | Guru DKV 1 | Siswa mengerjakan kuis & lab; nilai otomatis muncul; guru melihat hasil di Penilaian |
| **3** | Pelatihan guru (bagian 7), penilaian rubrik nyata oleh guru, supervisi akademik diisi kepala sekolah/wakil kurikulum | Kepala sekolah/wakil kurikulum + guru | 1 catatan supervisi terisi 18 indikator; laporan supervisi tercetak |
| **4** | Jalan penuh 2 kelas + dokumentasi pertemuan mingguan + pencadangan harian | Guru DKV | Semua siswa aktif; pencadangan harian terverifikasi; 0 kehilangan data |

Sebelum minggu 1 dimulai, jalankan pemeriksaan kesiapan:

```bash
cd app
npm run audit        # 33 pemeriksaan API + 15 pemeriksaan antarmuka → 48/48 LULUS
npm run uji:online   # 10 pemeriksaan kesiapan daring (header, IP, rate limit) → 10/10 LULUS
```

> `npm run audit:ui` mengubah isi basis data demo. **Jangan** menjalankannya pada basis data yang sudah berisi
> nilai nyata siswa. Untuk pemeriksaan rutin setelah data nyata masuk, gunakan `npm run audit:api` dan
> `npm run test:api`, atau jalankan `npm run audit` pada salinan/cadangan basis data.

---

## 7. Pelatihan & sosialisasi

### 7.1 Guru — dua sesi @90 menit

**Sesi 1 (mengajar dengan aplikasi):**
1. Masuk & mengenal menu guru (10').
2. **Kontrol Pembelajaran**: membuka menu per kelas + pertemuan, "Aktifkan semua", "Kunci semua", memulai/menjeda/mengakhiri pembelajaran (25').
3. Materi 36 minggu & modul 72 pertemuan, menyunting materi pertemuan (20').
4. Laboratorium: menjalankan 1 lab di ponsel siswa, melihat hasil lab (15').
5. Tanya-jawab + daftar periksa harian (20').

**Sesi 2 (menilai & melaporkan):**
1. Asesmen 36 minggu: bobot, KKTp, kesempatan revisi, menyunting butir/kunci (20').
2. Menilai karya dengan rubrik 1–4 (wajib centang konfirmasi), minta revisi, buka ulang remedial (25').
3. Rekap nilai 3 mode + **ekspor CSV** (15').
4. Supervisi akademik: 18 indikator, skor 1–4, catatan & rekomendasi, laporan cetak (20').
5. Dokumentasi pertemuan mingguan (10').

### 7.2 Siswa — satu sesi 30 menit

1. Buka alamat aplikasi di HP → masuk (15').
2. Di mana minggu aktif, cara membaca materi & menandai progres (5').
3. Mengerjakan kuis/LKPD, mengumpulkan tugas, melihat nilai & umpan balik guru, revisi (7').
4. Aturan: satu akun satu siswa, jangan pakai akun teman, lapor guru bila lupa password (3').

### 7.3 "Bila terjadi masalah di kelas" — untuk guru

| Gejala | Tindakan |
|---|---|
| Siswa melihat "Menu ini belum dibuka oleh guru" | Buka **Kontrol Pembelajaran** → pilih kelas & pertemuan → nyalakan menu yang diperlukan |
| Semua siswa tidak bisa membuka aplikasi | Periksa komputer aplikasi masih menyala & server jalan; periksa WiFi sama; coba buka dari laptop guru |
| Siswa lupa password | Panel Admin → Akun → Reset password → beri password sementara |
| Nilai tidak muncul di rekap | Pastikan guru sudah menyimpan nilai dengan mencentang konfirmasi; muat ulang halaman |
| Halaman putih | `npm run build` lalu muat ulang paksa (Ctrl+Shift+R) |

---

## 8. Operasional rutin

| Waktu | Kegiatan | Waktu yang dibutuhkan |
|---|---|---|
| Sebelum bel | Nyalakan komputer aplikasi → buka Kontrol Pembelajaran → buka menu minggu aktif → *Mulai Pembelajaran* | 5 menit |
| Saat mengajar | Menjalankan lab, memantau pengumpulan, menjawab pertanyaan | — |
| Setelah bel | Menutup menu (opsional), menandai pertemuan selesai, melihat pengumpulan hari itu | 10 menit |
| Setiap Jumat | Menilai karya/lab yang terkumpul (rubrik 1–4), mengisi dokumentasi pertemuan minggu itu | 30 menit |
| Setiap bulan | Cek **Log Aktivitas**, ekspor rekap nilai CSV, arsipkan cadangan basis data | 15 menit |
| Setiap semester | Memperbarui kalender & pekan berjalan, mengevaluasi bersama wakil kurikulum | 1 jam |

---

## 9. Pencadangan, pemulihan, dan pemeliharaan

### 9.1 Pencadangan (sudah diuji)

```bash
cd app
npm run backup                                   # → app/backups/ (14 berkas terakhir)
node tools/backup-db.mjs --ke D:\cadangan --simpan 30   # simpan 30 berkas di folder lain
./deploy/cadangkan-basisdata.sh                  # Linux/macOS → deploy/cadangan (30 berkas)
```

Alat ini memakai mekanisme cadangan bawaan SQLite sehingga **aman dijalankan saat aplikasi hidup**, lalu
membuka ulang berkas cadangan untuk memastikan isinya utuh:

```
Basis data sumber : .../app/data/dkv.db
Ukuran berkas     : 1336 KB
Verifikasi        : integrity_check=ok; users=13 classes=2 weeks=36 assessments=260 ... 
Status            : CADANGAN SAH ✅
```

Jadwalkan otomatis: Windows Task Scheduler → jalankan `app/deploy/cadangkan-basisdata.bat` setiap hari pukul 15.00;
Linux: `crontab -e` → `0 15 * * * /opt/dkv-learning-lab/app/deploy/cadangkan-basisdata.sh`.

Berkas basis data ada di `app/data/`: `dkv.db` (+ `dkv.db-wal`, `dkv.db-shm`). **Cadangkan lewat alat di atas**,
jangan hanya menyalin `dkv.db` saat aplikasi hidup (berkas WAL berisi perubahan terakhir).

### 9.2 Pemulihan (restore)

```bash
cd app
# 1) Hentikan aplikasi (Ctrl+C pada jendela server / sudo systemctl stop dkv-learning-lab)
# 2) Simpan basis data sekarang sebagai cadangan darurat
mv data/dkv.db data/dkv.db.rusak-$(date +%Y%m%d)
# 3) Kembalikan berkas cadangan
cp backups/dkv-20261013-153000.db data/dkv.db
# 4) Jalankan lagi aplikasi
npm start
```
Uji pemulihan ini **sekali** sebelum kejadian nyata (pada salinan), agar guru/pengelola tahu langkahnya.

### 9.3 Pemeliharaan

- Setelah ada perubahan kode: `npm run build` → mulai ulang server.
- Memperbarui data kurikulum/asesmen dari berkas JSON: `npm run seed` **menghapus seluruh data** — hanya
  lakukan pada basis data demo. Pada basis data nyata, sunting lewat antarmuka guru/admin.
- Periksa `npm run audit:api` (aman untuk data nyata) setiap bulan atau setiap kali aplikasi diubah.
- Simpan salinan aplikasi (folder proyek) bersama dokumen ini, `README.md`, dan `docs/` agar dapat dipasang ulang.

---

## 10. Keamanan & perlindungan data siswa

**Sudah disediakan aplikasi:** password disimpan sebagai hash bcrypt; sesi 12 jam; pembatasan 5 percobaan gagal
per 15 menit; otorisasi per peran diperiksa di server (siswa → 403 pada endpoint guru/admin, teruji 10 endpoint);
seluruh aksi penting tercatat di **Log Aktivitas**; pekerjaan siswa tidak dapat dibaca siswa lain (teruji).

**Wajib dilakukan sekolah:**

1. **Ganti semua password demo** (`admin123`, `guru123`, `siswa123`) dan nonaktifkan akun contoh.
2. Password guru/admin minimal 8 karakter, jangan dibagikan lewat grup umum.
3. Untuk pemasangan **C**, sediakan **HTTPS** (mis. Caddy/nginx di depan aplikasi) dan jangan membuka port 8080 ke internet.
Aplikasi sudah menyediakan pengerasan mode daring: `DKV_ONLINE=1` (X-Frame-Options, CSP frame-ancestors, HSTS),
`DKV_TRUST_PROXY` (IP pembaca login/log dapat dipercaya hanya bila disetel — tanpa ini header `X-Forwarded-For` diabaikan),
`HOST` (bind ke `127.0.0.1` bila proxy ada di komputer yang sama), pembatasan 15 kegagalan login per akun dari IP mana pun,
dan `GET /api/health` untuk pemantauan. Rincian & langkah: **`docs/13-panduan-online.md`**.
4. Batasi jaringan: pakai WiFi sekolah, atau bila daring gunakan VPN/domain dengan HTTPS + pembatasan IP.
5. Berkas `dkv.db` dan hasil cadangan berisi data pribadi siswa (identitas, nilai, log) — simpan pada komputer/folder
   terbatas, jangan diunggah ke penyimpanan umum, dan jangan kirim lewat aplikasi pesan.
6. Sepakati masa simpan data (mis. nilai & pekerjaan disimpan 1 tahun, log 1 semester) bersama wakil kurikulum.
7. Bila ada perubahan guru/kelas, segera nonaktifkan akun yang tidak lagi dipakai.

> Contoh konfigurasi Caddy (bila memilih cara C) — **belum diuji** pada lingkungan pembuatan aplikasi:
> ```
> dkv.smknegeri3kuningan.sch.id {
>     reverse_proxy 127.0.0.1:8080
> }
> ```
> Setelah HTTPS aktif, pastikan `kalender_sekolah`/identitas sudah benar dan uji login dari luar jaringan sekali.

---

## 11. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Laptop aplikasi dimatikan/di-sleep saat pelajaran | Siswa tidak dapat mengakses | Aktifkan pengaturan "never sleep" saat terhubung listrik; pindah ke cara B (server sekolah) |
| Listrik mati | Kegiatan terhenti, pekerjaan yang belum dikirim hilang | Sarankan siswa mengirim pekerjaan sesering mungkin; cadangan harian; UPS bila ada |
| WiFi sekolah padat/putus | Sebagian siswa terkendala | Bagikan waktu untuk lab/kuis; sediakan paket data cadangan untuk guru |
| Siswa saling memakai akun | Nilai tidak sah | Tekankan aturan; periksa Log Aktivitas; reset password berkala |
| Kalender sekolah belum benar | Minggu aktif salah | Perbarui **kalender_sekolah** & **pekan_berjalan** dari Admin sebelum semester dimulai |
| Data rusak/disk rusak | Kehilangan nilai | Cadangan harian otomatis + uji pemulihan; simpan salinan di dua lokasi |
| Guru berganti | Kehilangan kebiasaan pemakaian | Dokumentasi ini + pelatihan 2 sesi + rekap nilai CSV sebagai arsip |
| Aplikasi tidak sengaja di-seed ulang | Data nyata hilang | Beri tahu semua operator: `npm run seed` = menghapus data; gunakan `npm run backup` dulu |

---

## 12. Kriteria keberhasilan penerapan (terukur)

1. **≥ 95%** siswa dapat login sendiri pada minggu pertama.
2. Untuk **setiap minggu pembelajaran**: materi minggu aktif dibuka dari laptop guru, ≥ 1 lab/kuis dikerjakan di kelas.
3. **≥ 80%** tugas mingguan terkumpul tepat waktu (terlihat di menu Penilaian → hasil laboratorium/asesmen).
4. Nilai akhir setiap siswa tersedia di **Rekap hasil belajar** dan diekspor CSV setiap bulan.
5. **Setiap minggu** terisi dokumentasi pertemuan; **setiap bulan** minimal 1 catatan supervisi dengan 18 indikator.
6. **Cadangan harian** berjalan dan **sekali** pemulihan diuji berhasil; tidak ada kehilangan data siswa.
7. `npm run audit:api` LULUS setiap kali aplikasi diubah; `npm run test:api` 40/40 LULUS.

---

## 13. Yang belum tersedia (jujur) & langkah sementara

| Belum ada | Sementara dilakukan |
|---|---|
| Tanda tangan **elektronik** pada laporan | Laporan dicetak, ditandatangani manual (halaman cetak sudah menyediakan kolom & kop sekolah) |
| **Unggah gambar** besar (bukti karya/foto) | Siswa menulis tautan bukti (Google Drive kelas) atau mengisi teks; gambar dapat ditambahkan pada versi berikutnya |
| Unggahan berkas besar (batas badan permintaan 2 MB) | Gunakan tautan, bukan unggahan berkas |
| Pemulihan password mandiri | Admin mereset password siswa |
| **1 simulasi** (Technopreneurship DKV) | Ditandai "pengembangan" di antarmuka; pakai proyek Studio DKV sebagai gantinya |
| Uji beban (36 siswa serentak) | Bagi waktu pengerjaan kuis/lab per kelas; belum ada angka kapasitas resmi |
| HTTPS bawaan aplikasi | Pasang reverse proxy (bagian 10) bila diakses dari internet |
| Uji di Firefox/Edge/Safari & perangkat ponsel fisik | Uji manual sekali di perangkat sekolah sebelum dipakai resmi (Chromium sudah diuji) |
| Penilaian mutu akademik materi oleh guru mapel | Audit hanya memeriksa keterlacakan ke buku; guru perlu membaca modul minggu 1–4 sebelum mengajar |

---

## 14. Lampiran

### 14.1 Peta berkas penting

| Berkas/folder | Isi |
|---|---|
| `app/server/index.js`, `db.js`, `asesmen.js`, `supervisi.js` | Server, skema basis data, mesin asesmen, supervisi |
| `app/src/*.tsx` | Antarmuka (siswa, guru, admin) |
| `app/dist/` | Antarmuka hasil build (dibuat oleh `npm run build`) |
| `app/data/dkv.db` | **Basis data utama** (seluruh nilai & pekerjaan) — yang dicadangkan |
| `app/backups/` | Hasil pencadangan (dibuat oleh `npm run backup`) |
| `app/tools/backup-db.mjs`, `impor-akun.mjs` | Alat pencadangan & impor akun massal |
| `app/tools/audit-api.mjs`, `audit-ui.mjs` | Alat audit (33 + 15 pemeriksaan) |
| `app/deploy/` | Skrip menjalankan otomatis, cadangan, unit systemd |
| `docs/04-…`, `docs/11-…`, `docs/12-…` | Panduan pemakaian, laporan audit, panduan implementasi (dokumen ini) |
| `docs/05-…`, `docs/06-…`, `docs/07-…`, `docs/09-…`, `docs/10-…` | Data uji, matriks 36 minggu, modul, asesmen, supervisi |

### 14.2 Variabel lingkungan & perintah

| Perintah / variabel | Fungsi |
|---|---|
| `PORT=8081 npm start` | Mengubah port aplikasi |
| `DKV_DB=data/ujian.db npm start` | Memakai berkas basis data lain (mis. untuk uji coba) |
| `npm run seed` | **Mereset** basis data demo (36 minggu, 260 asesmen, akun demo) |
| `npm run build` | Membangun antarmuka ke `dist/` |
| `npm start` / `npm run serve` | Menjalankan server / membangun lalu menjalankan |
| `npm run backup` | Mencadangkan basis data (terverifikasi) |
| `npm run impor:akun -- --file …` | Impor akun massal dari CSV (terminal) |
| Panel Admin → Akun → **Tambah siswa massal** | Impor akun massal dari dalam aplikasi (tanpa terminal) |
| `npm run uji:impor` | Uji otomatis alur impor massal di antarmuka (8 pemeriksaan peramban) |
| `npm test` | 40 uji API + 38 uji antarmuka (untuk pengembang) |
| `npm run audit:api` / `npm run audit:ui` | Audit 33 API / 15 peramban |
| `npm run uji:online` | Uji kesiapan pemasangan di internet (10 pemeriksaan) |
| `npm run uji:bingkai` | Uji penyematan aplikasi di halaman lain, mis. Google Sites (6 pemeriksaan peramban) |
| `DKV_ONLINE=1` | Mode daring: header pemblokir bingkai + HSTS |
| `DKV_TRUST_PROXY=1` | Percayai `X-Forwarded-For` (hanya bila di belakang reverse proxy) |
| `HOST=127.0.0.1` | Batasi aplikasi hanya untuk komputer itu (bila proxy di komputer yang sama) |

### 14.3 Daftar periksa hari pertama untuk guru

- [ ] Komputer aplikasi menyala, `npm start` berjalan, alamat siswa tertulis di papan tulis.
- [ ] Guru sudah mengganti password dan membuka menu minggu aktif.
- [ ] Siswa sudah diimpor, masing-masing mencoba login sekali.
- [ ] Pencadangan hari itu sudah dibuat (`npm run backup`) dan berkasnya ada di `app/backups/`.
- [ ] Nomor darurat pengelola aplikasi (TIK/guru) tersedia di kelas.
