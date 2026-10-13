# 13 — Panduan Meng-online-kan Aplikasi (diakses dari internet)

**DKV Learning Lab · SMK Negeri 3 Kuningan** · disusun 13 Oktober 2026
Rujukan: `docs/12-panduan-implementasi.md` (pemasangan lokal/LAN) · `docs/11-audit-laporan.md` (bukti kesiapan)

Dokumen ini khusus untuk **cara C** pada panduan implementasi: aplikasi dibuka bukan hanya dari jaringan sekolah,
tetapi juga dari internet (rumah, ponsel siswa/guru, kunjungan pengawas).
Semua perintah sudah dijalankan pada aplikasi ini **kecuali yang ditandai "belum diuji"**.

> **Penting, jujur sejak awal:** aplikasi ini **tidak** menyediakan HTTPS sendiri, **tidak** punya 2 faktor
> autentikasi, dan menyimpan data dalam satu berkas SQLite (**hanya boleh satu instance yang berjalan**).
> Karena itu online-kan lewat **reverse proxy HTTPS** (Caddy/nginx) atau **tunnel/platform** yang memberi HTTPS,
> dan jangan pernah membuka port 8080 mentah-mentah ke internet.

---

## 1. Pilihan cara online (pilih satu)

| | **Opsi 1 — VPS + Caddy** | **Opsi 2 — Cloudflare Tunnel** | **Opsi 3 — Platform (Render/Railway/Fly)** | **Opsi 4 — Port forwarding sekolah** |
|---|---|---|---|---|
| Server | VPS (mis. 1 vCPU / 1 GB) | Komputer yang sudah ada di sekolah | Milik platform | Komputer di sekolah |
| HTTPS | Caddy otomatis (Let's Encrypt) | otomatis dari Cloudflare | otomatis dari platform | **harus diurus sendiri** |
| Perlu IP publik | ya (milik VPS) | **tidak** | tidak | ya, statis |
| Perlu buka port | hanya 80/443 | **tidak ada port dibuka** | tidak | 443/8080 dibuka |
| Data siswa | di VPS (di luar sekolah) | **tetap di sekolah** | di platform (di luar sekolah) | tetap di sekolah |
| Cocok untuk | dipakai banyak kelas, guru dari rumah | sekolah yang ingin aman & hemat, data tetap di sekolah | sekolah tanpa tenaga IT | **tidak disarankan** |
| Perkiraan waktu pasang | 1–2 jam | 1 jam | 1 jam | 2–3 jam + urusan jaringan |
| Catatan | perlu memilih penyedia VPS | perlu akun Cloudflare + domain | **wajib volume persisten** untuk SQLite | risiko tertinggi, sering diblokir ISP |

> **Pengguna Windows?** Langkah lengkap versi Windows (pasang Node.js dari nol, cloudflared sebagai layanan
> Windows, autostart, Task Scheduler) ada di **`docs/15-panduan-windows-online.md`**.

**Rekomendasi untuk sekolah ini:** **Opsi 2 (Cloudflare Tunnel)** bila data siswa harus tetap berada di sekolah —
tidak ada port yang dibuka, HTTPS otomatis, dan dapat dibatasi hanya untuk akun guru/admin tertentu.
Gunakan **Opsi 1** bila ingin sepenuhnya mandiri dan aplikasi dipakai dari luar jaringan sekolah secara luas.

---

## 2. Yang WAJIB dilakukan sebelum online (jangan dilewati)

| # | Tindakan | Cara | Alasan |
|---|---|---|---|
| 1 | Ganti semua password demo | ⚙️ Akun → Ganti password (`admin`, `dewi`, `saidun`, `aditya`) | Aplikasi mencetak **peringatan** saat dijalankan bila akun demo masih memakai password bawaan |
| 2 | Aktifkan mode daring | `DKV_ONLINE=1` saat menjalankan server | Mengaktifkan `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, dan HSTS |
| 3 | Setel kepercayaan proxy | `DKV_TRUST_PROXY=1` (satu reverse proxy) — lihat tabel 3 | Tanpa ini, IP pemanggil tidak tercatat dengan benar **dan** header `X-Forwarded-For` sengaja diabaikan |
| 4 | Sediakan HTTPS | Caddy/nginx/Cloudflare di depan aplikasi | Password & data siswa tidak boleh melewati HTTP polos |
| 5 | Batasi alamat bind | `HOST=127.0.0.1` bila proxy ada di komputer yang sama | Port 8080 tidak terbuka ke jaringan/internet |
| 6 | Pencadangan otomatis + simpan di luar server | `cron` menjalankan `tools/backup-db.mjs` + salin hasilnya keluar server | VPS bisa hilang/rusak; data nilai tidak boleh hilang |
| 7 | Pemantauan uptime | Panggil `GET /api/health` dari layanan uptime | Mengetahui lebih dulu bila aplikasi mati |
| 8 | Satu instance saja | Jangan jalankan 2 proses/2 replika | SQLite hanya menerima satu penulis; dua instance = data bisa rusak |
| 9 | Tulis kebijakan data | Wakil kurikulum: siapa boleh akses, berapa lama data disimpan | Perlindungan data pribadi siswa (UU PDP) |

---

## 3. Variabel lingkungan (baru) & contoh penyetelan

| Variabel | Bawaan | Fungsi |
|---|---|---|
| `PORT` | `8080` | Port aplikasi |
| `HOST` | `0.0.0.0` | Alamat bind. Pakai `127.0.0.1` bila reverse proxy ada di komputer yang sama |
| `DKV_DB` | `app/data/dkv.db` | Lokasi berkas basis data |
| `DKV_ONLINE` | *(mati)* | `1` = mode daring: header pemblokir bingkai + HSTS aktif |
| `DKV_TRUST_PROXY` | *(mati)* | `1` = percayai `X-Forwarded-For` (aplikasi di belakang reverse proxy). Nilai lain yang diterima Express juga boleh (mis. `loopback`) |
| `DKV_FRAME_ANCESTORS` | *(mati)* | Daftar asal (dipisah spasi) yang **boleh menyematkan aplikasi dalam bingkai** — mis. `https://sites.google.com https://*.googleusercontent.com` untuk Google Sites. Bila diisi: `X-Frame-Options` tidak dikirim dan CSP `frame-ancestors` memakai daftar tersebut. Bila kosong: penyematan ditolak (`X-Frame-Options: DENY`). Rincian + uji: `docs/14-panduan-google-site.md` |

**Contoh penyetelan sesuai cara online:**

| Skenario | Penyetelan |
|---|---|
| Caddy/nginx di komputer yang sama | `HOST=127.0.0.1 DKV_TRUST_PROXY=1 DKV_ONLINE=1` |
| Caddy di komputer lain / load balancer (1 lompatan) | `DKV_TRUST_PROXY=1 DKV_ONLINE=1` (bind tetap `0.0.0.0`, batasi lewat firewall) |
| Cloudflare Tunnel (`cloudflared` di komputer yang sama) | `HOST=127.0.0.1 DKV_TRUST_PROXY=2 DKV_ONLINE=1` → IP pengunjung asli (dari Cloudflare) yang tercatat |
| Uji lokal sebelum dipasang | tanpa `DKV_ONLINE` (agar pratinjau/iframe dan uji jsdom tetap jalan) |

> Mengapa `DKV_TRUST_PROXY` penting: aplikasi membatasi **5 percobaan login gagal per 15 menit** per
> `username+IP`. Sebelum pengerasan 13 Okt 2026, header `X-Forwarded-For` **selalu dipercaya**, sehingga penyerang
> bisa mengirim header acak tiap percobaan untuk melewati pembatasan itu dan mencatat IP palsu di log.
> Sekarang header itu **diabaikan kecuali** `DKV_TRUST_PROXY` disetel, dan ditambahkan penjaga kedua:
> **15 kegagalan per akun per 15 menit dari IP mana pun** (uji `O2` & `O8`, bagian 12).

---

## 4. Opsi 1 — VPS + Caddy (langkah lengkap)

Contoh dipakai: Ubuntu 22.04/24.04, domain `dkv.smkn3kuningan.sch.id`, aplikasi di `/opt/dkv-learning-lab`.

```bash
# ---- 1. Di komputer sekolah: siapkan paket aplikasi ----
cd /path/ke/dkv-learning-lab
zip -r dkv-app.zip . -x "app/node_modules/*" -x "app/data/dkv.db*" -x "app/dist/*"   # kode + data kurikulum
scp dkv-app.zip admin@IP-VPS:/tmp/                                        # unggah
# Data yang sudah berjalan (bila ingin dibawa): npm run backup → unggah berkas dkv-*.db

# ---- 2. Di VPS: pasang Node.js 20 LTS ----
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs unzip caddy

# ---- 3. Pasang aplikasi ----
sudo mkdir -p /opt/dkv-learning-lab && cd /opt/dkv-learning-lab
sudo unzip /tmp/dkv-app.zip -d /opt/dkv-learning-lab
cd app
npm ci                      # butuh internet sekali
npm run build

# ---- 4. Basis data ----
#  a) mulai baru:      npm run seed
#  b) memindahkan data yang sudah ada:
#     unggah berkas cadangan ke /opt/dkv-learning-lab/app/data/ lalu:
#     cp /tmp/dkv-20261013-153000.db data/dkv.db && rm -f data/dkv.db-wal data/dkv.db-shm

# ---- 5. Jalankan sebagai layanan ----
sudo cp deploy/dkv-learning-lab.service /etc/systemd/system/
sudo nano /etc/systemd/system/dkv-learning-lab.service     # sesuaikan User, WorkingDirectory, Environment
sudo systemctl daemon-reload && sudo systemctl enable --now dkv-learning-lab
systemctl status dkv-learning-lab

# ---- 6. Caddy sebagai reverse proxy + HTTPS otomatis ----
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
dkv.smkn3kuningan.sch.id {
    encode gzip
    reverse_proxy 127.0.0.1:8080
}
EOF
sudo systemctl reload caddy

# ---- 7. Firewall: hanya 22/80/443 ----
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
```

**Isi layanan (`deploy/dkv-learning-lab.service`) untuk mode daring** — tambahkan tiga baris `Environment`:

```ini
Environment=PORT=8080
Environment=HOST=127.0.0.1
Environment=NODE_ENV=production
Environment=DKV_ONLINE=1
Environment=DKV_TRUST_PROXY=1
```

**DNS:** di pengelola domain sekolah (mis. registrar `sch.id`), buat **A record** `dkv` → IP VPS.
Setelah propagasi, buka `https://dkv.smkn3kuningan.sch.id` → halaman login muncul dengan gembok (HTTPS).

> Berkas `Caddyfile`, `ufw`, dan `cloudflared` di dokumen ini **belum diuji** di lingkungan pembuatan aplikasi
> (sandbox Linux tanpa Caddy/systemd/internet keluar). Periksa sekali di VPS: `curl -I https://domain` harus
> memuat `strict-transport-security`, dan `GET /api/health` menjawab `ok:true`.

---

## 5. Opsi 2 — Cloudflare Tunnel (tanpa IP publik, data tetap di sekolah)

Cocok bila aplikasi tetap berjalan di komputer sekolah tetapi perlu diakses dari rumah. **Tidak ada port** yang
dibuka di jaringan sekolah; koneksi keluar yang dibuat sendiri oleh `cloudflared`.

```bash
# ---- 1. Di komputer sekolah: pasang cloudflared (Ubuntu/Debian) ----
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# ---- 2. Masuk & buat tunnel (butuh akun Cloudflare + domain sekolah sudah di Cloudflare) ----
cloudflared tunnel login
cloudflared tunnel create dkv-sekolah
cloudflared tunnel route dns dkv-sekolah dkv.smkn3kuningan.sch.id

# ---- 3. Berkas konfigurasi ~/.cloudflared/config.yml ----
cat > ~/.cloudflared/config.yml <<'EOF'
tunnel: dkv-sekolah
credentials-file: /home/USER/.cloudflared/<ID-TUNNEL>.json
ingress:
  - hostname: dkv.smkn3kuningan.sch.id
    service: http://localhost:8080
  - service: http_status:404
EOF

# ---- 4. Jalankan sebagai layanan ----
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

Setel aplikasi: `HOST=127.0.0.1 DKV_ONLINE=1 DKV_TRUST_PROXY=2`
(diubah pada unit systemd aplikasi; lihat bagian 4 langkah 5).

**Tambahan disarankan (gratis):** di dashboard Cloudflare → **Access → Applications**, lindungi
`dkv.smkn3kuningan.sch.id/guru*` dan `/admin*` dengan aturan email guru/admin sekolah, sehingga halaman guru
tidak dapat dibuka siapa pun yang menemukan alamatnya.

---

## 6. Opsi 3 — Platform (Render/Railway/Fly.io)

| Hal | Penyetelan |
|---|---|
| Build | `npm ci && npm run build` (di folder `app`) |
| Start | `node server/index.js` |
| Env | `PORT` (diberikan platform), `DKV_DB=/data/dkv.db`, `DKV_ONLINE=1`, `DKV_TRUST_PROXY=1` (platform menambahkan satu lapis proxy) |
| **Volume persisten** | **WAJIB** dipasang di folder `/data` (atau folder lain) — tanpa ini basis data terhapus setiap kali aplikasi di-restart |
| Health check | `/api/health` |
| Jumlah instance | **1** (jangan 2 replika: SQLite satu penulis) |
| Isi data awal | Jalankan `npm run seed` sekali lewat terminal platform, atau unggah berkas cadangan ke volume |

Perkiraan biaya (perlu diverifikasi ke penyedia, harga berubah): paket terkecil dengan disk persisten biasanya
**mulai dari kisaran puluhan ribu rupiah per bulan**; paket gratis umumnya **tidak cocok** karena tidak menyediakan
disk persisten dan aplikasi diistirahatkan saat menganggur.

---

## 7. Opsi 4 — Port forwarding di sekolah (paling tidak disarankan)

Bila terpaksa: minta IP publik statis, atur *port forwarding* 443 → komputer aplikasi, pasang reverse proxy
**+ HTTPS** (Caddy), `DKV_ONLINE=1`, dan batasi hanya dari alamat/negara tertentu bila router mendukung.
Risiko: sering diblokir kebijakan ISP, IP berubah, dan permukaan serangan paling besar. Gunakan Opsi 2 sebagai gantinya.

---

## 8. Memindahkan data yang sudah berjalan ke server online

```bash
# Di komputer lama (server demo/LAN):
cd app && npm run backup -- --ke /tmp       # menghasilkan dkv-<tanggal>-<jam>.db yang sudah diverifikasi
# Kirim berkas itu ke server baru (scp), lalu:
cd /opt/dkv-learning-lab/app
sudo systemctl stop dkv-learning-lab
cp data/dkv.db data/dkv.db.lama 2>/dev/null || true
cp /tmp/dkv-20261013-153000.db data/dkv.db
rm -f data/dkv.db-wal data/dkv.db-shm      # jejak WAL dari mesin lama tidak boleh dipakai
sudo systemctl start dkv-learning-lab
```
Periksa setelah pindah: jumlah pengguna & nilai sama seperti sebelumnya (Panel Admin → Akun/Log; Rekap nilai guru).

---

## 9. Pencadangan & pemulihan di server online

```bash
# 1. Jadwalkan cadangan setiap hari 23.00 (cron)
crontab -e
0 23 * * * cd /opt/dkv-learning-lab/app && /usr/bin/node tools/backup-db.mjs --ke /var/backups/dkv --simpan 30 >> /var/log/dkv-backup.log 2>&1

# 2. Salin hasil cadangan keluar server (contoh memakai rclone ke Google Drive sekolah)
0 23 * * * rclone copy /var/backups/dkv remote-dkv:dkv-backups --max-age 25h

# 3. Pemeriksaan: berkas cadangan terbaru harus "CADANGAN SAH"
tail -5 /var/log/dkv-backup.log
```

Pemulihan sama seperti `docs/12-panduan-implementasi.md` bagian 9.2 — uji sekali pada server baru
(bukan saat kejadian darurat).

---

## 10. Pemantauan, log, dan pembaruan

| Kegiatan | Cara |
|---|---|
| Cek hidup/mati | Layanan uptime (mis. UptimeRobot, Healthchecks) → `https://domain/api/health` setiap 5 menit; balasan memuat `ok`, `uptime_detik`, `basis_data` |
| Melihat log aplikasi | `journalctl -u dkv-learning-lab -f` (Linux) atau jendela server (Windows) |
| Log aktivitas pengguna | Dalam aplikasi: Panel Admin → **Log Aktivitas** (login, penilaian, perubahan konten, IP) |
| Memperbarui aplikasi | Unggah kode baru → `cd /opt/dkv-learning-lab/app && npm ci && npm run build && sudo systemctl restart dkv-learning-lab` |
| Pemeriksaan sebelum pembaruan | `npm run audit:api` (33 pemeriksaan) dan `npm run test:api` (40 uji) — keduanya aman untuk data nyata |
| Uji kesiapan online | `npm run uji:online` (10 pemeriksaan) — jalankan pada salinan, lihat bagian 12 |
| Uji penyematan (Google Sites) | `npm run uji:bingkai` (6 pemeriksaan peramban) — lihat `docs/14` bagian 5 |
| Kesehatan basis data | `npm run backup` (memeriksa `integrity_check` dan jumlah baris tabel inti setiap kali dicadangkan) |

---

## 11. Keamanan & perlindungan data siswa

**Yang sudah disediakan aplikasi (teruji):**
- Otorisasi diperiksa di server untuk setiap endpoint; siswa menerima **403** pada 10 endpoint guru/admin (audit API butir C).
- Password disimpan sebagai hash bcrypt; token sesi acak 32 byte, berlaku 12 jam; logout mencabut token (uji 39/40).
- Pembatasan 5 percobaan gagal/15 menit per akun+IP **dan** 15 percobaan gagal/15 menit per akun dari IP mana pun.
- `X-Forwarded-For` tidak dapat dipalsukan bila `DKV_TRUST_PROXY` tidak disetel (uji O2/O3).
- Mode daring menambahkan `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, dan HSTS (uji O5);
  penyematan hanya dibuka bila `DKV_FRAME_ANCESTORS` diisi (uji `npm run uji:bingkai`, 6/6 LULUS).
- Percobaan injeksi SQL tidak menembus aplikasi; pekerjaan siswa tidak dapat dibaca siswa lain (audit API butir H).

**Yang harus dilakukan manusia:**
1. Ganti password demo, dan jangan pernah memakai kembali `admin123`.
2. Batasi halaman guru/admin dengan Cloudflare Access, VPN, atau pembatasan IP bila memungkinkan.
3. Jangan mengunggah berkas `dkv.db`/hasil cadangan ke penyimpanan umum atau mengirimnya lewat aplikasi pesan.
4. Simpan hasil cadangan terenkripsi (mis. arsip ber-password) bila diletakkan di layanan awan.
5. Sepakati masa simpan data (mis. 1 tahun) dan siapa yang boleh mengekspor rekap nilai (data pribadi).
6. Perbarui kredensial bila ada guru/admin yang meninggalkan sekolah; nonaktifkan akunnya.

**Belum tersedia (jujur):** 2 faktor autentikasi, pemulihan password mandiri lewat email, pembatasan berbasis peran
per-kelas untuk guru, penyimpanan terenkripsi di sisi basis data, dan jejak audit ekspor nilai.

---

## 12. Uji kesiapan online (dijalankan, bukan diklaim)

```bash
cd app
npm run uji:online        # 10 pemeriksaan; menulis ../docs/uji-online-hasil.json
```

Skrip ini **menjalankan server sungguhan** dari salinan basis data (basis data demo tidak terganggu) dan menguji:

| # | Pemeriksaan | Hasil nyata 13 Okt 2026 |
|---|---|---|
| O1 | `GET /api/health` (untuk uptime) | 200, `ok:true`, `basis_data:ok` |
| O2 | 6× login gagal dengan header `X-Forwarded-For` berbeda | `401,401,401,401,401,429` → **palsu header tidak menembus** pembatasan |
| O3 | IP pada log aktivitas | tercatat `127.0.0.1` (header palsu diabaikan) |
| O4 | Header dasar + kompatibilitas pratinjau | `nosniff` & `Referrer-Policy` aktif; header pemblokir bingkai mati di mode lokal |
| O5 | Mode daring `DKV_ONLINE=1` | `X-Frame-Options=DENY`, CSP `frame-ancestors 'none'`, HSTS `max-age=15552000` |
| O6 | `DKV_TRUST_PROXY=1` | IP asli `198.51.100.7` tercatat dari header proxy |
| O7 | `HOST=127.0.0.1` | alamat ikat `0100007F` — **tidak** terbuka ke jaringan |
| O8 | Penjaga brute force lintas-IP | 429 walau IP pemanggil masih bersih |
| O9 | Peringatan akun demo | tercetak saat server dijalankan |
| O10 | Alur normal (login guru + `/api/kurikulum`) | 200 dan 36 minggu terbaca |

**Hasil: 10/10 LULUS.** Setelah pengerasan ini dijalankan ulang juga: `npm test` **40/40 + 38/38**,
`npm run audit:api` **33/33**, `npm run audit:ui` **15/15** — tidak ada yang rusak karena perubahan keamanan.

**Belum diuji (jujur):** pemasangan Caddy/cloudflared sungguhan, HTTPS dari luar jaringan, uji dari perangkat
nyata, uji beban (mis. 36 siswa serentak), dan pemantauan uptime pihak ketiga.

---

## 13. Perkiraan biaya (perlu diverifikasi ke penyedia)

| Pos | Perkiraan | Catatan |
|---|---|---|
| Domain `sch.id` | puluhan ribu – ratusan ribu rupiah / tahun | Harga berbeda tiap registrar; sebagian sekolah sudah punya |
| Opsi 1 VPS 1 vCPU/1 GB | kisaran puluhan ribu – seratus ribu rupiah / bulan | Termasuk bandwidth wajar; aplikasi ini sangat ringan (basis data 1,4 MB di awal) |
| Opsi 2 Cloudflare Tunnel | **Rp 0** (gratis) | Butuh domain yang sudah memakai Cloudflare; paket gratis memadai |
| Opsi 3 Platform | puluhan ribu rupiah / bulan untuk disk persisten | Paket gratis umumnya tidak menyediakan disk persisten |
| Sertifikat HTTPS | **Rp 0** (Let's Encrypt via Caddy / Cloudflare) | Perpanjangan otomatis |
| Tenaga | 1–2 jam pemasangan + 15 menit/bulan pemeliharaan | Bisa dibantu guru TIK |

---

## 14. Daftar periksa go-live (centang semua sebelum diumumkan ke siswa)

- [ ] Password demo sudah diganti & akun contoh dinonaktifkan (peringatan di konsol sudah tidak muncul).
- [ ] `DKV_ONLINE=1`, `DKV_TRUST_PROXY` sesuai skenario, `HOST` sesuai (bagian 3).
- [ ] HTTPS aktif — `curl -I https://domain` memuat `strict-transport-security`; halaman login bergembok.
- [ ] `GET /api/health` menjawab `ok:true` dan dipantau layanan uptime.
- [ ] Hanya 1 instance aplikasi berjalan; port 8080 tidak terbuka ke internet (`ss -tlnp` / firewall).
- [ ] Cadangan harian terjadwal, hasilnya disalin keluar server, dan **sekali** pemulihan diuji.
- [ ] Data nyata lengkap: identitas sekolah, kalender, kelas, akun guru/siswa (impor CSV), pembagian kelas guru.
- [ ] `npm run audit:api` LULUS dan `npm run uji:online` LULUS pada server baru.
- [ ] Siswa & guru dilatih (docs/12 bagian 7); alamat ditulis di papan tulis/grup kelas.
- [ ] Kebijakan data: siapa boleh akses, berapa lama disimpan, dan siapa yang mengelola (wakil kurikulum).
- [ ] Ada pengelola cadangan bila guru utama berhalangan (minimal 2 orang tahu caranya).

---

## 15. Batas untuk skala besar (jujur)

| Keterbatasan | Artinya untuk sekolah |
|---|---|
| SQLite satu penulis | Jangan menjalankan 2 replika/2 server untuk basis data yang sama; jangan taruh basis data di berkas jaringan (NAS) |
| Rate limit & sesi tersimpan di SQLite (satu proses) | Berjalan baik untuk satu sekolah; untuk banyak sekolah perlu basis data terpusat (PostgreSQL) — perlu pengembangan |
| Tanpa 2FA/SSO | Keamanan bergantung pada password; wajib password kuat + pembatasan akses (Cloudflare Access/VPN) |
| Belum ada unggahan berkas besar (batas 2 MB/permintaan) | Bukti karya memakai tautan |
| Belum diuji beban | Belum ada angka resmi jumlah pengguna serentak; jalankan uji beban sebelum pemakaian serentak besar |
| Tanda tangan laporan masih manual | Perlu pengembangan tanda tangan elektronik bila ingin tanpa kertas |
