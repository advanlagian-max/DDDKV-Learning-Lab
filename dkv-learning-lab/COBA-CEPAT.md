# COBA CEPAT — 15 Menit Menjalankan & Menguji DKV Learning Lab

Panduan ini untuk **mencoba aplikasi** dan **memastikan semuanya berfungsi** sebelum dipakai di kelas.
Dua bagian: (A) coba sekarang di pratinjau, (B) pasang di komputer sendiri.

---

## A. Coba sekarang (tanpa memasang apa pun)

Aplikasi sedang berjalan di pratinjau pada sesi ini (port **8080**). Bila server berhenti, nyalakan lagi
dengan `npm run serve` di folder `app`.

### A1. Lima menit sebagai SISWA — `aditya` / `siswa123`

1. Buka halaman login → tab **🎓 Masuk sebagai Siswa** → masuk.
2. **Dashboard**: perhatikan *minggu aktif* (data demo memakai pekan 2) dan progres Anda.
3. Menu **Materi 36 Minggu** → minggu 1 & 2 terbuka; klik & baca sebentar. Minggu lain bertanda 🔒 karena
   guru belum membukanya (ini memang aturan aplikasinya, bukan galat).
4. Menu **Pertemuan (72)** → buka pertemuan **minggu 2 Senin** → baca agenda 6 JP (270 menit), modul,
   contoh diagram, lalu tandai pertemuan selesai.
5. Menu **Laboratorium Simulasi** → **Tipografi** → ubah ukuran huruf & leading → jalankan sampai kriteria
   terpenuhi → tekan **📤 Kumpulkan hasil tingkat 3** → tulis refleksi → kirim.
6. Menu **Asesmen & Penilaian** → **Rencana Asesmen** → kartu **Kuis pilihan ganda minggu 2** → **Buka** →
   jawab semua → **Kirim jawaban kuis** → skor otomatis muncul **beserta pembahasan per butir**.

### A2. Lima menit sebagai GURU — `dewi` / `guru123` (X DKV 1)

1. Masuk lewat tab **👩‍🏫 Mode Guru / Admin**.
2. **Kontrol Pembelajaran**: pilih kelas X DKV 1 + pertemuan minggu 2 → nyalakan menu yang ingin dibuka
   (mis. LKPD & Tugas) → tekan **Mulai Pembelajaran**. (Siswa akan melihat menu itu terbuka ±5 detik kemudian.)
3. **Asesmen 36 Minggu → Penilaian rubrik**: pilih minggu **2**, jenis **praktik** → baris `Aditya Pratama`
   berstatus *terkumpul* → pilih skor rubrik 1–4 di tiap kriteria → **centang konfirmasi** → **Simpan nilai**.
   Coba juga **Minta revisi** dan **Buka ulang (remedial)**.
4. **Rekap hasil belajar** → lihat nilai per jenis & nilai akhir → **Ekspor CSV**.
5. **Hasil laboratorium** (menu Penilaian) → cek hasil Tipografi yang dikumpulkan siswa tadi.

### A3. Tiga menit sebagai ADMIN/SUPERVISOR — `admin` / `admin123`

1. **Supervisi Akademik**: pilih guru → isi skor **1–4** untuk 18 indikator (C.1–C.4) → simpan.
2. **Riwayat** → tombol **🖨️ Cetak** pada baris → halaman cetak berisi kop sekolah, tabel indikator,
   dan kolom tanda tangan (kotak cetak muncul; pada pratinjau tersemat gunakan **Ctrl/Cmd + P** bila dialog
   cetak peramban diblokir).
3. **Dokumentasi Pertemuan**: buka salah satu dari 72 pertemuan → isi bagian A–I (usulan otomatis tersedia) → simpan.
4. **Log Aktivitas**: lihat jejak aksi Anda (login, penilaian, perubahan konten).
5. **Tambah siswa massal** (kalau ingin mencoba fitur baru): Panel Admin → 👤 Akun → panel *“Tambah siswa massal”* →
   tempel dua-tiga nama contoh (`Nama<TAB>NIS<TAB>X DKV 1`) → **🔍 Periksa dulu** → **📥 Impor akun** → **⬇️ Unduh daftar akun (CSV)**.

### A4. Buktikan aplikasi sehat (opsional, satu terminal)

```bash
cd app
npm run test:api     # harapan: RINGKASAN: 40/40 uji LULUS
npm test            # harapan: 40/40 API + 38/38 antarmuka
```

---

## B. Pasang di komputer sendiri (30–45 menit, sekali saja)

### B1. Yang perlu disiapkan

- Komputer guru (Windows 10/11 atau Linux; macOS juga bisa), RAM ≥ 2 GB, ruang disk ± 1 GB.
- **Node.js 20 LTS** — unduh di <https://nodejs.org> (pilih “LTS”), pasang dengan pengaturan bawaan.
  Cek berhasil: buka Command Prompt / Terminal → `node -v` menampilkan `v20.x` (atau v18+).
- Berkas paket: `DKV-Learning-Lab-LENGKAP-2026-10-13.zip` (21 MB) — ekstrak ke folder tanpa spasi,
  mis. `C:\dkv-learning-lab` (Windows) atau `/opt/dkv-learning-lab` (Linux).
- Internet **hanya sekali** untuk `npm install`.

### B2. Empat perintah

```bash
cd dkv-learning-lab/app     # Windows: cd C:\dkv-learning-lab\app
npm install                 # pasang dependensi (± 2–10 menit)
npm run seed                # isi 36 minggu, 72 modul, 260 asesmen, akun demo
npm start                   # aplikasi hidup di http://localhost:8080
```

Buka `http://localhost:8080` di peramban komputer itu → login dengan akun demo pada bagian A.

### B3. Bila ingin dibuka siswa dari HP (jaringan sekolah)

1. Pastikan komputer & HP tersambung **WiFi/LAN yang sama**.
2. Cari alamat IP komputer: Windows `ipconfig` (lihat IPv4, mis. `192.168.1.24`), Linux `ip a`.
3. Di HP siswa buka: **`http://192.168.1.24:8080`** → halaman login.
4. Bila tidak bisa dibuka, izinkan firewall (Windows, sebagai Administrator):
   ```bat
   netsh advfirewall firewall add rule name="DKV Learning Lab 8080" dir=in action=allow protocol=TCP localport=8080
   ```
5. Agar alamat selalu tetap, minta TIK menetapkan IP statis/DHCP reservation untuk komputer itu.
6. Saat mengajar: jalankan dengan **`app\deploy\jalankan-server.bat`** (klik dua kali) — jendela harus tetap terbuka.

### B4. Siapkan data sekolah (setelah aplikasi jalan)

Ikuti `docs/12-panduan-implementasi.md` bagian 4, ringkasnya:

1. Ganti password demo (⚙️ Akun) — aplikasi memperingatkan selama belum diganti.
2. Admin → **Pengaturan & Kalender**: identitas sekolah, tahun ajaran, hari & JP, kalender, pekan berjalan.
3. Admin → **Kelas**: buat kelas (mis. X DKV 1, X DKV 2).
4. Impor akun siswa massal dari CSV (contoh: `app/data/contoh-impor-akun.csv`):
   ```bash
   node tools/impor-akun.mjs --file data/contoh-impor-akun.csv --kering
   node tools/impor-akun.mjs --file data/contoh-impor-akun.csv --buat-kelas --sandi-awal dkv2026
   ```
5. Nonaktifkan akun demo; uji login 2 siswa & 2 guru.
6. Jalankan **`npm run backup`** sekali, lalu jadwalkan harian (`app/deploy/cadangkan-basisdata.bat`).

### B5. Untuk pengembang (hanya bila mengubah kode)

- Setelah menyunting `app/src/*.tsx`: `npm run build` lalu mulai ulang server (`npm run serve` = keduanya).
- Sebelum memakai di kelas setelah perubahan: `npm run audit:api` (33 pemeriksaan, aman untuk data nyata).
- Bila aplikasi di-online-kan: `docs/13`; bila ditempel di Google Sites: `docs/14`.

---

## C. Bila ada yang tidak beres

| Gejala | Tindakan |
|---|---|
| `node: command not found` / `'node' is not recognized` | Node.js belum terpasang / belum masuk PATH — pasang ulang, lalu buka terminal baru |
| `EADDRINUSE: address already in use 0.0.0.0:8080` | Port terpakai: hentikan proses lama atau `PORT=8081 npm start` |
| Halaman putih di peramban | Pastikan `npm start` masih berjalan; muat ulang paksa (Ctrl+Shift+R) |
| Siswa “Menu ini belum dibuka oleh guru” | Guru membuka menu di **Kontrol Pembelajaran** kelas & pertemuan itu |
| HP siswa tidak bisa membuka alamat IP | Cek WiFi sama, firewall, dan IP komputer; uji dulu dari laptop lain |
| Lupa akun demo | `admin/admin123`, guru `dewi` atau `saidun` (password `guru123`), siswa `aditya` (password `siswa123`) |
| Ingin mulai dari data bersih | `npm run seed` (**menghapus seluruh data** — cadangkan lebih dulu bila sudah ada data nyata) |
| Login terkunci 15 menit | Pengaman aplikasi: 5 percobaan gagal/15 menit per akun+IP, 15 gagal per akun dari IP mana pun |

Daftar lengkap ada di `docs/04-panduan-instalasi-dan-penggunaan.md` bagian 7 dan `docs/12` bagian 13.
