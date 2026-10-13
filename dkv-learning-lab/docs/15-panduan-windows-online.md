# 15 — Pemasangan Windows + Online + Google Sites (mulai dari nol)

**DKV Learning Lab · SMK Negeri 3 Kuningan** · disusun 13 Oktober 2026
Untuk kondisi Anda: **laptop/komputer Windows 10/11 · Node.js belum terpasang · ingin langsung online dan ditempel di Google Sites.**

Urutan pekerjaan (perkiraan waktu total 2–3 jam, bisa dipecah):

| Tahap | Isi | Waktu |
|---|---|---|
| 1 | Pasang Node.js | 10 menit |
| 2 | Pasang aplikasi & uji di komputer sendiri | 30 menit |
| 3 | Uji dari HP lewat WiFi sekolah (LAN) | 15 menit |
| 4 | **Coba online 5 menit** (tautan sementara trycloudflare) | 10 menit |
| 5 | Online permanen dengan domain sekolah (Cloudflare Tunnel) | 45 menit |
| 6 | Sematkan di Google Sites + publikasikan | 30 menit |
| 7 | Isi data sekolah & impor akun siswa | 30–60 menit |
| 8 | Pencadangan + hidup otomatis saat komputer menyala | 30 menit |

> Dua berkas siap klik sudah disediakan di `app\deploy\`: **`cek-komputer.bat`** (memeriksa kesiapan, tidak mengubah
> apa pun) dan **`jalankan-server-online.bat`** (menjalankan aplikasi dalam mode online).
> **Jujur:** berkas `.bat` ini belum pernah dijalankan di Windows sungguhan dari lingkungan saya (Linux) —
> periksa sekali di komputer sekolah dengan `cek-komputer.bat`. Bila ada yang tidak sesuai, laporkan ke saya.

---

## Tahap 1 — Pasang Node.js (belum ada di komputer Anda)

1. Buka <https://nodejs.org> → klik tombol besar **LTS** (mis. “20.x LTS”) untuk Windows.
2. Jalankan berkas `node-v20.x.x-x64.msi` yang terunduh → **Next → Next → Install** (semua bawaan).
3. Tutup semua **Command Prompt** yang lama (penting: PATH baru dibaca oleh jendela baru).
4. Buka **Command Prompt** baru: tekan tombol Windows → ketik `cmd` → Enter. Lalu:
   ```bat
   node -v
   npm -v
   ```
   Harus muncul versi, mis. `v20.20.0` dan `10.8.2`.
   - Bila muncul **`'node' is not recognized...`** → Node.js belum terpasang benar atau Command Prompt lama.
     Pasang ulang, lalu buka Command Prompt baru.
   - Bila ragu, klik dua kali `app\deploy\cek-komputer.bat` — akan ditampilkan status lengkap.

---

## Tahap 2 — Pasang & jalankan aplikasi di komputer sekolah

1. Ekstrak `DKV-Learning-Lab-LENGKAP-2026-10-13.zip` ke **`C:\dkv-learning-lab`**
   (hindari folder yang mengandung spasi; klik kanan → *Extract All*, arahkan ke `C:\dkv-learning-lab`).
2. Buka Command Prompt, lalu:
   ```bat
   cd /d C:\dkv-learning-lab\app
   npm install
   npm run seed
   npm run build
   ```
   `npm install` perlu internet (± 2–10 menit). `npm run seed` mengisi 36 minggu, 72 modul, 260 asesmen, dan akun demo.
3. Jalankan:
   ```bat
   npm start
   ```
   Akan muncul:
   ```
   ⚠️  PERINGATAN: akun demo masih memakai password bawaan → admin, dewi, saidun, aditya
   DKV Learning Lab berjalan di http://0.0.0.0:8080
   ```
   Peringatan itu **normal pada pemasangan baru** (nanti dihilangkan pada Tahap 7).
4. Buka peramban: **`http://localhost:8080`** → login `admin` / `admin123` → uji cepat 15 menit ada di
   `COBA-CEPAT.md` (di folder paket).
5. Biarkan jendela Command Prompt tetap terbuka. Untuk menghentikan: `Ctrl+C`.
   Untuk cara klik-dua-kali, lihat Tahap 8 (autostart).

---

## Tahap 3 — Uji dari HP siswa lewat WiFi sekolah

1. Pastikan laptop & HP tersambung **WiFi/LAN yang sama**.
2. Cari IP laptop: di Command Prompt → `ipconfig` → catat **IPv4 Address** (mis. `192.168.1.24`).
3. Izinkan firewall (buka **Command Prompt sebagai Administrator**: klik kanan → *Run as administrator*):
   ```bat
   netsh advfirewall firewall add rule name="DKV Learning Lab 8080" dir=in action=allow protocol=TCP localport=8080
   ```
4. Dari HP buka **`http://192.168.1.24:8080`** → halaman login harus tampil → coba login siswa `aditya` / `siswa123`.
5. Minta TIK menetapkan **IP statis** (atau *DHCP reservation*) untuk laptop itu, agar alamat tidak berubah.

---

## Tahap 4 — Coba online 5 menit (tanpa domain, tanpa akun Cloudflare)

Cara tercepat melihat aplikasi online: **quick tunnel** `trycloudflare.com`. Cocok untuk uji coba, **bukan** untuk
jangka panjang (tautan berubah setiap kali dijalankan dan tidak bisa dipakai permanen di Google Sites).

1. Unduh `cloudflared` untuk Windows:
   <https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe>
2. Buat folder `C:\cloudflared`, pindahkan berkas tersebut ke sana, dan **ganti namanya menjadi `cloudflared.exe`**.
3. Pastikan aplikasi sedang berjalan (`jalankan-server-online.bat` atau `npm start`).
4. Buka Command Prompt, lalu:
   ```bat
   C:\cloudflared\cloudflared.exe tunnel --url http://localhost:8080
   ```
5. Tunggu ± 20 detik → muncul baris seperti:
   ```
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
   |  https://dingin-cepat-biru-1234.trycloudflare.com                                         |
   +--------------------------------------------------------------------------------------------+
   ```
6. Buka tautan itu di HP **dengan data seluler** (bukan WiFi sekolah) → halaman login muncul → login siswa.
7. Selesai menguji: tekan `Ctrl+C` pada jendela cloudflared. Aplikasi & data **tidak** terpengaruh.

> Jika halaman muncul tetapi login gagal, cek jendela `jalankan-server-online.bat` — di sana harus tampil
> baris `X-Forwarded-For dipercaya (DKV_TRUST_PROXY=2)` dan tidak ada galat.

---

## Tahap 5 — Online permanen dengan domain sekolah (Cloudflare Tunnel)

Tunnel permanen = alamat tetap (mis. **`https://dkv.smkn3kuningan.sch.id`**) + HTTPS otomatis + **tanpa membuka port**
di jaringan sekolah. Data siswa tetap berada di laptop sekolah.

**Prasyarat:** domain sekolah (mis. `smkn3kuningan.sch.id`) — mintalah bantuan TIK untuk memindahkan pengelolaan
DNS-nya ke Cloudflare (gratis) bila belum. **Ini perubahan DNS yang perlu persetujuan sekolah.**

```bat
REM 1. Masuk ke akun Cloudflare (peramban akan terbuka untuk memilih domain)
C:\cloudflared\cloudflared.exe tunnel login

REM 2. Buat tunnel bernama dkv-sekolah (catat ID yang ditampilkan)
C:\cloudflared\cloudflared.exe tunnel create dkv-sekolah

REM 3. Arahkan subdomain ke tunnel (ganti sesuai domain sekolah)
C:\cloudflared\cloudflared.exe tunnel route dns dkv-sekolah dkv.smkn3kuningan.sch.id
```

4. Buat berkas konfigurasi **`C:\Users\NAMA-ANDA\.cloudflared\config.yml`** (buka Notepad → Save As →
   pilih *All Files* → nama `config.yml`):

```yaml
tunnel: dkv-sekolah
credentials-file: C:\Users\NAMA-ANDA\.cloudflared\ID-TUNNEL.json
ingress:
  - hostname: dkv.smkn3kuningan.sch.id
    service: http://localhost:8080
  - service: http_status:404
```
   Ganti `NAMA-ANDA` dan `ID-TUNNEL` sesuai hasil langkah 2.

5. Pasang cloudflared sebagai **layanan Windows** (Command Prompt sebagai Administrator):
   ```bat
   C:\cloudflared\cloudflared.exe service install
   sc query cloudflared
   ```
   `sc query` harus menampilkan `STATE : 4 RUNNING`.

6. Jalankan aplikasi dalam mode online dengan pengaturan penyematan **sesuai domain situs Google Sites Anda**.
   Cara termudah: klik dua kali `app\deploy\jalankan-server-online.bat` (sudah menyetel
   `DKV_ONLINE=1`, `DKV_TRUST_PROXY=2`, dan `DKV_FRAME_ANCESTORS` untuk Google Sites).
   Bila situs dipublikasikan pada domain sendiri (mis. `https://dkv-sekolah.sch.id`), tambahkan domain itu ke
   `DKV_FRAME_ANCESTORS` di dalam berkas `.bat` tersebut.

7. Uji dari luar jaringan (data seluler):
   ```bat
   curl -I https://dkv.smkn3kuningan.sch.id
   curl -s https://dkv.smkn3kuningan.sch.id/api/health
   ```
   Harapan: header memuat `strict-transport-security` dan **tidak** memuat `x-frame-options`;
   `/api/health` menjawab `{"ok":true,...}`.

> **Jangan** membuka port 8080 di router. Tunnel ini bekerja dengan koneksi **keluar** dari laptop, sehingga
> tidak ada port yang mendengarkan dari internet — risiko jauh lebih kecil daripada *port forwarding*.

---

## Tahap 6 — Sematkan di Google Sites

1. Buka <https://sites.google.com> → buat situs/halaman baru (atau buka situs sekolah).
2. **Insert → Embed → By URL** → tempel `https://dkv.smkn3kuningan.sch.id` → **Insert**.
   (Alternatif: **Embed code** → tempel
   `<iframe src="https://dkv.smkn3kuningan.sch.id" style="border:0;width:100%;height:900px"></iframe>`.)
3. Besarkan blok sematan (tarik sudut) — gunakan tinggi maksimal; aplikasi dapat digulir di dalam blok itu.
4. Tambahkan juga tombol **“Buka DKV Learning Lab di tab baru”** yang menaut ke alamat yang sama — ini jalur
   paling nyaman untuk ponsel.
5. **Publish** → tentukan alamat situs (mis. `sites.google.com/view/dkv-smkn3kuningan.sch.id`) → atur siapa yang
   boleh melihat (publik, atau hanya domain sekolah bila memakai Google Workspace for Education).
6. Uji dari akun siswa: buka alamat publikasi → blok aplikasi tampil → login siswa → kerjakan satu kuis.
7. Bila **halaman kosong**: berarti asal penyemat belum diizinkan. Periksa `DKV_FRAME_ANCESTORS` (Tahap 5 langkah 6)
   dan pastikan alamat memakai **https**. Uji cepat: `curl -I https://dkv.smkn3kuningan.sch.id` → harus **tidak ada**
   `x-frame-options`, dan `content-security-policy` memuat `frame-ancestors https://sites.google.com …`.

Rincian lain (gulir ganda, sesi terpisah, batas Google Sites) ada di `docs/14-panduan-google-site.md`.

---

## Tahap 7 — Isi data sekolah & impor akun siswa

1. **Ganti password demo** (penting — aplikasi akan berhenti memperingatkan bila sudah dilakukan):
   masuk sebagai `admin` → **⚙️ Akun → Ganti password**; ulangi untuk akun guru; siswa cukup direset Admin.
2. Admin → **Pengaturan & Kalender**: identitas sekolah, tahun ajaran, hari pembelajaran, JP & menit per pertemuan
   (6 JP × 45 = 270 menit), pekan berjalan, kalender libur/asesmen.
3. Admin → **Kelas**: buat kelas (mis. `X DKV 1`, `X DKV 2`).
4. **Tambah akun siswa.**
   **Cara termudah (tanpa terminal):** Panel Admin → **👤 Akun** → panel **“Tambah siswa massal”** → tempel daftar dari
   Excel/Notepad (`Nama TAB NIS TAB Kelas` per baris) → **🔍 Periksa dulu** → **📥 Impor akun** → **⬇️ Unduh daftar akun (CSV)**
   untuk dibagikan ke siswa. Aman ditekan dua kali (siswa yang sudah ada dilewati, tidak ada akun kembar).
   Rincian langkah & bukti ujinya: `docs/12` bagian 4.1 Cara A.

   **Cara berkas CSV (untuk operator/banyak akun):** siapkan CSV dengan kolom: `nama, username, nis, kelas, role, sandi`.
   Templat: `app\data\TEMPLATE-daftar-siswa.csv`. Contoh baris:
   ```csv
   nama,username,nis,kelas,role,sandi
   Aditya Pratama,aditya,0071234567,X DKV 1,siswa,
   Dewi Lestari,dewi,198501012010012001,,guru,
   ```
   Periksa dahulu (**tidak menyimpan apa pun**), lalu impor:
   ```bat
   cd /d C:\dkv-learning-lab\app
   node tools\impor-akun.mjs --file data\daftar-siswa.csv --kering
   node tools\impor-akun.mjs --file data\daftar-siswa.csv --buat-kelas --sandi-awal dkv2026
   ```
   Hasil per baris ditulis juga ke `data\daftar-siswa-hasil.csv` (tanda terima arsip). Aman diulang: baris dengan
   username yang sudah ada akan dilewati.
   > Kirimkan daftar siswa Anda kepada saya (nama, kelas, NIS, username yang diinginkan) — saya buatkan berkas CSV
   > siap impor sehingga Anda tinggal menjalankan dua perintah di atas.
5. Admin → **Akun**: **nonaktifkan** akun demo (`aditya`, dan siswa contoh lain) agar tidak bisa dipakai lagi.
6. Uji: 2 siswa & 2 guru login dari HP; pastikan mereka hanya melihat menu siswa.

---

## Tahap 8 — Cadangan harian & hidup otomatis saat komputer menyala

### 8a. Pencadangan harian (wajib)

```bat
cd /d C:\dkv-learning-lab\app
npm run backup
```
Hasil tersimpan di `app\backups\` dan langsung diverifikasi (*“CADANGAN SAH”*).
Otomatiskan dengan **Task Scheduler**:

1. Windows → cari **Task Scheduler** → **Create Basic Task** → nama `Cadangan DKV`.
2. Trigger: **Daily**, jam **15:00** (setelah jam pelajaran).
3. Action: **Start a program** →
   *Program/script*: `C:\dkv-learning-lab\app\deploy\cadangkan-basisdata.bat`
   *Start in*: `C:\dkv-learning-lab\app\deploy`.
4. Simpan → klik kanan task → **Run** untuk menguji sekali → periksa folder `app\deploy\cadangan`.
5. Sekali seminggu, salin folder cadangan ke Google Drive sekolah (tahan terhadap kerusakan laptop).

### 8b. Aplikasi hidup otomatis saat Windows menyala

1. **Task Scheduler** → **Create Task** (bukan Basic):
   - *General*: nama `DKV Learning Lab`; centang **Run whether user is logged on or not**;
     centang **Run with highest privileges**.
   - *Triggers*: **At startup** (tambah satu lagi **At log on** bila laptop kadang dimatikan lalu dinyalakan ulang).
   - *Actions*: *Start a program* →
     *Program/script*: `C:\dkv-learning-lab\app\deploy\jalankan-server-online.bat`
     *Start in*: `C:\dkv-learning-lab\app\deploy`.
   - *Conditions*: hapus centang **Start the task only if the computer is on AC power**.
2. **Jangan biarkan laptop tidur saat pelajaran**: Settings → System → Power & sleep → *Sleep* = **Never**
   (saat tersambung listrik). Bila laptop tidur, tunnel ikut putus dan siswa tidak bisa membuka aplikasi.
3. cloudflared sudah otomatis sebagai layanan Windows (Tahap 5 langkah 5) — tidak perlu dijalankan manual.
4. Uji: restart laptop → tunggu 2 menit → buka `https://dkv.smkn3kuningan.sch.id` dari HP.

---

## Tahap 9 — Daftar periksa go-live (centang sebelum diumumkan ke siswa)

- [ ] `node -v` menampilkan v18+ ; `npm install`, `seed`, `build` pernah dijalankan tanpa galat.
- [ ] Aplikasi jalan (`http://localhost:8080` OK) dan **console** tidak menampilkan peringatan akun demo lagi.
- [ ] `https://dkv.smkn3kuningan.sch.id` terbuka dari **data seluler**; `/api/health` menjawab `ok:true`.
- [ ] `curl -I` → ada `strict-transport-security`, **tidak ada** `x-frame-options`.
- [ ] Blok sematan tampil di **alamat publikasi** Google Sites (bukan di editor); login siswa berhasil di dalamnya.
- [ ] Tombol “buka di tab baru” ada di halaman Sites.
- [ ] Data sekolah selesai: kalender, kelas, guru, siswa (impor CSV) — akun demo dinonaktifkan.
- [ ] Cadangan harian terjadwal & **sekali** pemulihan dicoba (`docs/12` bagian 9.2).
- [ ] Laptop **tidak tidur** saat listrik tersambung; autostart diuji dengan restart.
- [ ] Siswa & guru sudah dilatih (agenda: `docs/12` bagian 7); alamat tertulis di papan tulis/grup kelas.
- [ ] Kebijakan data disepakati: siapa boleh akses, berapa lama data disimpan (minimal 2 orang tahu pengelolaan).

---

## Keamanan (baca sekali, penting)

| Aturan | Alasan |
|---|---|
| **Jangan** membuka port 8080 di router | Tunnel tidak memerlukannya; port terbuka = sasaran pemindai internet |
| Ganti password demo & nonaktifkan akun contoh | Aplikasi sudah memperingatkan di konsol |
| Batasi halaman guru/admin dengan **Cloudflare Access** (gratis): Cloudflare → Zero Trust → Access → Applications → lindungi `dkv.smkn3kuningan.sch.id/guru*` dan `/admin*` dengan email guru/admin | Halaman guru tidak dapat dibuka orang yang menemukan alamatnya |
| Jangan bagikan berkas `app\data\dkv.db` atau hasil cadangan ke penyimpanan umum | Isinya data pribadi siswa (nilai, pekerjaan, log) |
| Batasi `DKV_FRAME_ANCESTORS` hanya ke Google Sites/domain sekolah | Mencegah situs lain menyematkan aplikasi (clickjacking) |
| Aplikasi = 1 instance saja | SQLite hanya menerima satu penulis; jangan jalankan dua salinan pada berkas yang sama |

Detail lengkap: `docs/13-panduan-online.md` bagian 11.

---

## Masalah umum (Windows)

| Gejala | Sebab & tindakan |
|---|---|
| `'node' is not recognized` | Node.js belum terpasang / Command Prompt lama → pasang & buka jendela baru |
| `npm ERR! network` / unduhan gagal | Internet terputus saat `npm install` → ulangi; bila sering, coba hotspot lain |
| PowerShell menolak `npm.ps1` (*running scripts is disabled*) | Pakai **Command Prompt** (bukan PowerShell), atau jalankan `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `EADDRINUSE: address already in use 0.0.0.0:8080` | Sudah ada salinan aplikasi berjalan → tutup jendela lain, atau `set PORT=8081 && npm start` |
| Halaman Google Sites kosong | `DKV_FRAME_ANCESTORS` belum sesuai / alamat belum https → lihat Tahap 6 langkah 7 |
| HP siswa tidak bisa membuka alamat IP (LAN) | Firewall belum diizinkan / beda WiFi → Tahap 3 |
| Tautan `trycloudflare` mati sendiri | Memang sifat quick tunnel (untuk uji coba) → lanjut ke Tahap 5 (tunnel permanen) |
| Login terkunci 15 menit | Pengaman aplikasi: 5 percobaan gagal/15 menit per akun+IP, 15 gagal per akun dari IP mana pun |
| Ingin mengulang dari data bersih | `npm run seed` (**menghapus seluruh data** — cadangkan dulu bila sudah ada data nyata) |

---

## Yang belum saya uji (jujur)

- Menjalankan `.bat`, memasang cloudflared sebagai layanan Windows, dan memasang aplikasi di Windows sungguhan —
  lingkungan kerja saya Linux. Periksa sekali dengan `cek-komputer.bat`, lalu laporkan bila ada langkah yang berbeda.
- Halaman **Google Sites sungguhan** (uji penyematan saya memakai halaman tiruan dengan perilaku asal yang sama:
  `npm run uji:bingkai` → 6/6 LULUS) dan aplikasi Google Sites versi ponsel.
- Uji beban (banyak siswa serentak) dan peramban Firefox/Edge/Safari.

Sesudah Anda mencoba, kabari langkah yang berhasil dan yang tersendat — saya sesuaikan panduannya untuk sekolah Anda.
