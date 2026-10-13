# Arsitektur Aplikasi & Skema Database — DKV Learning Lab v0.1

> Tahap 3 (Arsitektur) — dokumen hidup; diperbarui mengikuti implementasi.

## 1. Keputusan teknologi (dan alasannya)

| Lapisan | Pilihan | Alasan |
|---------|---------|--------|
| Frontend | **React + TypeScript + Vite** | Sesuai master prompt; build cepat, tanpa ketergantungan CDN (semua aset dilokalkan). |
| Styling | **Tailwind CSS v4** (plugin Vite) | Sesuai master prompt; utilitas konsisten, mudah dijaga. |
| Backend | **Node.js + Express** (JavaScript ESM) | Pilihan yang diizinkan prompt; satu bahasa dengan frontend; ringan untuk server sekolah. |
| Database | **SQLite** (better-sqlite3) | Tanpa server DB terpisah; mudah dipasang di komputer sekolah/lab; migrasi ke MySQL/PostgreSQL terencana lewat lapisan `db.js`. |
| Auth | Sesi server (token acak + tabel `sessions`) + **bcrypt** hash password | Aman, tanpa menyimpan password polos, mudah diaudit. |
| Sinkronisasi kontrol guru | **Polling** (klien siswa memanggil `/api/siswa/status` tiap ±5 detik) | Sesuai izin prompt ("gunakan polling berkala sebagai alternatif"); WebSocket direncanakan pada tahap lanjutan. |
| Penyajian | Express menyajikan hasil build React (`app/dist`) + API `/api/*` pada satu port | Sederhana untuk deployment sekolah; dev memakai Vite proxy. |

## 2. Peta aplikasi & alur pengguna

**Tiga peran**: `siswa`, `guru`, `admin`.

- **Siswa** — Login → **Dashboard** (pekan berjalan, status pembelajaran, tugas belum selesai, pengumuman) → **Materi 36 Minggu** (daftar minggu; terkunci mengikuti Kontrol Pembelajaran) → **Pertemuan (72)** & **detail pertemuan** Senin/Rabu (agenda 270 menit, aktivitas, LKPD, simulasi, refleksi cepat, tandai selesai) → **Laboratorium Simulasi** → **LKPD & Tugas** (isi & kumpulkan) → **Asesmen & Penilaian** (diagnostik, formatif, sumatif/uji kompetensi, proyek & praktik, refleksi; skor kuis otomatis) → **Portofolio Digital** (unggah karya, umpan balik guru).
- **Guru** — Login → Dashboard kelas → **Kontrol Pembelajaran** (pilih kelas minggu pertemuan; sakelar menu siswa; "Mulai Pembelajaran" sesi terarah; buka/kunci materi; izinkan simulasi) → Pemantauan siswa → Penilaian (koreksi esai/karya + rubrik) → Supervisi (dokumentasi instrumen) → Rekap nilai + ekspor CSV.
- **Admin** — Pengguna, kelas, tahun ajaran, kalender & JP, sumber materi, hak akses, log aktivitas.

**Modul materi per pertemuan** disimpan di dalam payload minggu (`weeks.payload.pertemuanSenin.modul` / `pertemuanRabu.modul`) sehingga satu permintaan API cukup untuk menampilkan agenda + materi lengkap; tabel `quiz_attempts` menyimpan riwayat penilaian kuis formatif (user, minggu, pertemuan, skor, total, jawaban, waktu).

**Alur kunci "guru mengontrol siswa"**: guru mengubah sakelar → tersimpan di tabel `learning_controls` (per kelas+pertemuan) → siswa terhubung polling menerima perubahan ≤5 dtk → server tetap menolak akses langsung (edge case: siswa buka URL langsung tetap ditolak karena pengecekan di API, bukan di UI).

## 3. Skema database (v0.1)

```sql
users(id, username UNIQUE, email, password_hash, role CHECK IN ('siswa','guru','admin'),
      nama_lengkap, nis_nip, kelas_id, aktif, created_at, last_login_at)
classes(id, nama, tingkat, tahun_ajaran, wali_guru_id REFERENCES users)
settings(key PRIMARY KEY, value JSON)          -- kalender, hari mengajar, JP, minggu efektif
weeks(nomor INTEGER PRIMARY KEY, semester, tema, sumber JSON, payload JSON, diupdate_oleh, diupdate_pada)
                 -- konten minggu (dapat diedit guru); payload = struktur lengkap dari kurikulum-*.json
learning_controls(class_id, meeting_key TEXT,     -- 'senin' | 'rabu'
      menu_key, enabled INTEGER,        -- per sakelar menu siswa
      updated_by, updated_at)
learning_sessions(id, class_id, week_nomor, meeting_key, status TEXT,  -- none|running|paused|ended
      current_slide INTEGER, allow_simulation INTEGER, lock_navigation INTEGER,
      started_at, updated_at, updated_by)
assignments(id, week_nomor, meeting_key, tipe,    -- lkpd|kuis|proyek
      judul, deskripsi, bobot, status,            -- draft|open|closed
      soal JSON,                                  -- untuk kuis (objektif+esai+rubrik)
      due_at, created_by)
submissions(id, assignment_id, user_id, jawaban JSON, skor REAL, umpan_balik, status,  -- draft|submitted|graded
      revisi_ke, submitted_at, graded_by, graded_at)
portfolio(id, user_id, week_nomor, judul, deskripsi, tahap, karya JSON, umpan_balik, revisi_ke, created_at)
reflections(id, user_id, week_nomor, tipe, isi, created_at)   -- tipe: siswa|guru
progress(id, user_id, week_nomor, status,                       -- belum|berjalan|selesai
      aktivitas JSON, completed_at)
announcements(id, class_id, judul, isi, created_by, created_at)
supervision(id, guru_id, kelas_id, week_nomor, tanggal, skor JSON,  -- skor per indikator C1-C4 & 5C
      catatan, rekomendasi JSON, tindak_lanjut, status, created_by, created_at)
assessments(id TEXT PK, week_nomor, meeting_key, tipe,      -- kuis|lkpd|formatif|praktik|proyek|sumatif
      judul, deskripsi, bobot, nilai_otomatis, perlu_konfirmasi,
      kktp, kesempatan_revisi, jumlah_butir,
      butir JSON,            -- soal pilihan ganda + kunci + pembahasan (tidak dikirim sebelum dikumpulkan)
      kriteria JSON, rubrik JSON, remedial, pengayaan, luaran, langkah JSON, bukti, sumber JSON,
      diubah_oleh, diubah_pada)
assessment_work(assessment_id, user_id, UNIQUE(assessment_id,user_id),
      status,                -- draf|terkumpul|dinilai|perlu-revisi
      jawaban JSON,          -- {pilihan[], teks, tautan}
      skor_butir, total_butir, skor_rincian JSON, skor, komentar, revisi_ke, dinilai_oleh, dinilai_pada, updated_at)
supervision_indicators(id, kode, aspek_kode, aspek_nama, nama, deskriptor, urutan, aktif,
      sumber, diubah_oleh, diubah_pada)          -- indikator supervisi, awal = butir dokumen instrumen sekolah
meeting_docs(week_nomor, meeting_key,            -- UNIQUE(week_nomor, meeting_key) — 72 pertemuan
      tujuan JSON, memahami JSON, mengaplikasi JSON, merefleksi JSON,
      prinsip JSON,                              -- prinsip pembelajaran mendalam yang DITANDAI guru (tidak ditebak aplikasi)
      bukti JSON, catatan_observasi, refleksi_guru, tindak_lanjut,
      status TEXT,                               -- draf|final
      diubah_oleh, diubah_pada)
activity_logs(id, user_id, role, aksi, target, detail JSON, ip, created_at)
login_attempts(username, ip, count, first_at, locked_until)     -- pembatasan percobaan login
sessions(token PRIMARY KEY, user_id, created_at, expires_at)    -- sesi server-side
```

**Prinsip keamanan data**
- Password: bcrypt (cost 10), tidak pernah dikirim balik ke klien.
- Sesi: token acak 32 byte; disimpan httpOnly cookie; kadaluarsa 12 jam; setiap request divalidasi server.
- Rate limit login: maksimum 5 percobaan gagal / 15 menit / (username+IP).
- Otorisasi dicek di server per endpoint sesuai peran; siswa tidak dapat memanggil endpoint guru (`middleware requireRole`).
- Kontrol pembelajaran dicek server (`guardMateriTerbuka`) — menyembunyikan tombol saja tidak cukup.
- Log aktivitas untuk perubahan kontrol, nilai, dan pengelolaan pengguna.

## 4. Peta API v0.1 (semua memerlukan sesi kecuali login)

```
POST /api/auth/login            {username, password} → {user, token}
POST /api/auth/logout
GET  /api/auth/me
GET  /api/meta                  → info aplikasi, konfigurasi JP/hari/kelas siswa
GET  /api/kurikulum             → daftar 36 minggu (ringkas)
GET  /api/kurikulum/:nomor      → detail minggu (+ status akses siswa)
PUT  /api/kurikulum/:nomor      (guru/admin) → simpan suntingan (konten/sumber disimpan, jejak diupd.)
PUT  /api/kurikulum/:nomor/pertemuan/:hari/modul (guru/admin) → sunting modul rinci 1 pertemuan (9 bagian; log `sunting_modul`)
POST /api/kuis-formatif/:minggu/:hari (siswa) → kunci jawaban di server, nilai + riwayat disimpan ke `quiz_attempts`
POST /api/simulasi/hasil (siswa) → simpan capaian lab (sim, tingkat, skor kriteria) ke `sim_attempts`; tunduk kunci menu `simulasi`
GET  /api/simulasi/hasil → siswa: miliknya; guru/admin: 60 capaian terbaru seluruh kelas
GET  /api/kuis-formatif/:minggu/:hari → siswa: riwayat sendiri; guru/admin: rekap percobaan seluruh siswa
GET  /api/siswa/status          → status sesi kelas siswa + sakelar menu + minggu berjalan (polling)
GET  /api/siswa/pertemuan/:minggu/:hari → data 1 pertemuan (Senin/Rabu) + penegakan kunci menu 'pertemuan' & aturan akses minggu
GET  /api/siswa/progress ; POST /api/siswa/progress   → tandai progres aktivitas
GET  /api/tugas                 (siswa: tugas terbuka; guru: semua)
POST /api/tugas/:id/submit      → simpan jawaban; kuis objektif dinilai otomatis
POST /api/tugas                (guru) buka/tutup/ubah tugas
GET  /api/portofolio ; POST /api/portofolio
GET  /api/refleksi ; POST /api/refleksi
--- Mesin asesmen 36 minggu (260 butir: kuis, LKPD, formatif, praktik, proyek, sumatif) ---
GET  /api/asesmen/rencana?minggu=&tipe=&ringkas=1   → rencana + status kerja siswa (kunci jawaban disembunyikan)
GET  /api/asesmen/:id/kerja     → butir pekerjaan; pembahasan hanya setelah pekerjaan dikirim
POST /api/asesmen/:id/kerja     → kirim pekerjaan (kuis dinilai otomatis di server; karya menunggu guru)
POST /api/asesmen/:id/revisi    → kirim ulang selama kesempatan revisi tersisa
GET  /api/guru/asesmen?minggu=&tipe=            (guru) daftar + statistik kelas
GET  /api/guru/asesmen/:id                      (guru) detail untuk menilai (jawaban & bukti karya siswa)
POST /api/guru/asesmen/:id/nilai                (guru) nilai rubrik + komentar — wajib konfirmasi guru
POST /api/guru/asesmen/:id/minta-revisi         (guru)
POST /api/guru/asesmen/:id/buka-ulang           (guru) buka ulang untuk remedial (nilai lama dikosongkan, tercatat di log)
PUT  /api/guru/asesmen/:id/rubrik               (guru) sunting bobot/KKTp/revisi/rubrik/butir (bobot total wajib 100)
GET  /api/guru/rekap-asesmen?kelas_id=&minggu=  (guru) perSiswa · perMinggu · perJenis
GET  /api/guru/rekap-asesmen.csv?mode=siswa|minggu|jenis (guru) ekspor CSV
GET  /api/guru/asesmen-remedial?kelas_id=       (guru) daftar remedial + kandidat pengayaan
--- Mode guru ---
GET  /api/guru/kelas ; GET /api/guru/siswa?kelas=
GET  /api/guru/kontrol?kelas=&minggu=&pertemuan=
POST /api/guru/kontrol          → ubah sakelar (dengan konfirmasi "Aktifkan Semua"/"Kunci Semua" di UI)
POST /api/guru/sesi             → mulai/jeda/lanjut/akhiri sesi pembelajaran
GET  /api/guru/submissions      → daftar jawaban untuk dinilai ; POST /api/guru/grade
GET  /api/guru/rekap            → rekap nilai per kelas (CSV: /api/guru/rekap?format=csv)
--- Supervisi akademik (indikator dapat dikonfigurasi) & dokumentasi per pertemuan ---
GET  /api/supervisi/indikator?semua=1   (guru/admin) → indikator dikelompokkan per aspek + sumber instrumen
POST /api/supervisi/indikator ; PUT /api/supervisi/indikator/:id ; POST /api/supervisi/indikator/:id/nonaktif
                                        (admin) konfigurasi indikator (indikator tambahan ditandai "ditambahkan sekolah")
POST /api/supervisi/indikator/muat-ulang (admin) → kembalikan daftar dari dokumen instrumen
GET  /api/supervisi/daftar-guru          (guru/admin) → pilihan guru yang disupervisi
GET  /api/supervisi ; GET /api/supervisi/:id ; POST /api/supervisi ; PUT /api/supervisi/:id (guru/admin)
                                        → skor 1–4 per indikator (divalidasi), rekomendasi, tindak lanjut, draft/final
DELETE /api/supervisi/:id                (admin)
GET  /api/supervisi.csv                  (guru/admin) → CSV: satu kolom per indikator + rata per aspek
GET  /api/supervisi/dokumentasi?minggu=&hari=   (guru/admin) → 72 pertemuan + status
GET/PUT /api/supervisi/dokumentasi/:minggu/:hari (guru/admin) → 9 bagian dokumentasi (usulan otomatis sebelum disimpan)
GET  /api/supervisi/dokumentasi.csv      (guru/admin) → CSV dokumentasi per pertemuan
GET/PUT /api/guru/settings      → guru mengubah hari, jumlah JP, durasi JP, minggu efektif,
                                  kalender sekolah, pekan berjalan, tahun ajaran, pengumuman awal
                                  (daftar kunci dibatasi di server; kunci lain 403 — hanya admin)
--- Admin ---
GET/POST /api/admin/users ; POST /api/admin/users/:id/reset ; POST /api/admin/users/:id/toggle
GET/POST /api/admin/kelas ; GET/PUT /api/admin/settings
GET  /api/admin/logs
```

## 4b. Aturan akses siswa (ditegakkan di server, bukan hanya menyembunyikan tombol)

| Kondisi permintaan siswa | Keputusan server |
|---|---|
| Minggu = minggu aktif (dari sesi guru atau pekan berjalan) | boleh bila sakelar menu **materi** terbuka |
| Minggu lain (sebelum/sesudah) | boleh hanya bila menu **materi** DAN menu **navigasi** terbuka; diblokir bila guru menyalakan **kunci navigasi** |
| Mengerjakan LKPD/tugas biasa | boleh bila menu **lkpd** terbuka dan tugas berstatus `open` |
| Mengerjakan kuis | boleh bila menu **kuis** terbuka |
| Simulasi | boleh bila menu **simulasi** terbuka dan sesi mengizinkan simulasi |
| Halaman pertemuan | boleh bila menu **pertemuan** terbuka untuk pertemuan aktif; pertemuan lain mengikuti aturan minggu di atas |
| Portofolio (lihat/tambah karya) | boleh bila menu **portofolio** terbuka; karya lama tidak dihapus saat dikunci |
| Refleksi (bagian asesmen) | boleh bila menu **kuis/asesmen** terbuka |
| Mengumpulkan hasil laboratorium | boleh bila menu **simulasi** terbuka (server menolak dengan 403 bila terkunci) |
| Kuis formatif per pertemuan | boleh bila menu **kuis/asesmen** terbuka; **kunci jawaban tidak pernah dikirim ke peramban** (penilaian di server) |
| Mengirim pekerjaan asesmen (kuis/sumatif) | boleh bila menu **kuis/asesmen** terbuka (403 `locked` bila ditutup) |
| Mengirim pekerjaan asesmen (LKPD/praktik/proyek/formatif) | boleh bila menu **LKPD/Tugas** terbuka |
| Nilai pekerjaan asesmen | **hanya** pilihan ganda dinilai otomatis; skor kiriman siswa diabaikan; karya/proses menunggu guru |
| Penilaian guru atas karya/proses | wajib `konfirmasi: true` (400 bila tidak) — rubrik harus diperiksa bersama bukti karya |
| Menyunting bobot/rubrik/butir asesmen | guru/admin; total bobot kriteria wajib 100; ubah butir/kunci/pembahasan wajib konfirmasi |
| Mengisi instrumen supervisi & dokumentasi pertemuan | guru/admin; **peserta didik 403** (baca maupun tulis) |
| Mengubah **indikator** supervisi, menghapus catatan supervisi | **hanya admin** (guru 403) agar instrumen tidak bergeser tanpa dasar dokumen |
| Mengubah nilai (kiriman guru & asesmen) | hanya guru/admin; peserta didik selalu **403** |
| Panel admin (akun, kelas, pengaturan, log) | hanya admin; peserta didik 403 di server **dan** dialihkan ke dashboard siswa di antarmuka |
| Endpoint guru/admin/penyuntingan materi | selalu **403** untuk peran siswa |
| Penguncian menu | hanya menutup akses; jawaban, nilai, dan karya **tidak dihapus** |

## 5. Pengujian yang direncanakan (kriteria bagian G master prompt)

| # | Skenario | Status target |
|---|----------|---------------|
| 1 | Login guru benar → masuk Mode Guru | **LULUS** |
| 2 | Login salah → ditolak + rate limit | **LULUS** (429 pada percobaan ke-6) |
| 3 | Siswa tidak bisa masuk Mode Guru (UI + API 403) | **LULUS** |
| 4 | Guru menonaktifkan menu → siswa tidak bisa akses | **LULUS** |
| 5 | Siswa membuka URL langsung materi terkunci → 403 | **LULUS** |
| 6 | Guru mengaktifkan kembali → akses pulih | **LULUS** |
| 7 | Perubahan kontrol sampai ke perangkat siswa (polling ≤5 dtk) | **LULUS** (dua klien) |
| 8 | Penguncian tidak menghapus jawaban/nilai | **LULUS** |
| 9 | Guru jeda/lanjut/akhiri pembelajaran | **LULUS** |
| 10 | Logout mengakhiri sesi | **LULUS** |

Hasil pengujian faktual (perintah, keluaran terminal, temuan, dan batas pengujian) ada di `05-data-uji-dan-hasil-pengujian.md`.

## 6. Roadmap tahap (mengikuti bagian N master prompt)

1. ✅ Analisis sumber (docs/01) — selesai v0.1
2. ✅ Pemetaan CP/ATP & kalender — selesai sebagai usulan; kalender sekolah menunggu data guru
3. ✅ Struktur 36 minggu/72 pertemuan — data JSON lengkap (`app/data/kurikulum-sem1.json`, `kurikulum-sem2.json`, `docs/03-peta-36-minggu.md`)
4. ✅ Arsitektur & skema — dokumen ini
5. ✅ Antarmuka + autentikasi — selesai & diuji (login siswa/guru, peran, sesi, ganti password; build produksi 271 kB)
6. ✅ Modul pembelajaran — 36 minggu terbaca siswa, dapat disunting guru, terhubung ke sumber buku
7. ◐ Simulasi — **4 berfungsi penuh** (tipografi, fotografi/segitiga eksposur, bitmap vs vektor, alur produksi); **4 ditandai "dalam pengembangan"** (K3/ergonomi, sketsa, technopreneur, studio proyek DKV)
8. ◐ Asesmen & portofolio — berfungsi: LKPD, kuis auto-skor, penilaian guru + umpan balik, portofolio, refleksi; belum ada unggahan berkas gambar besar
9. ✅ Dashboard guru & supervisi — kontrol pembelajaran, mulai/jeda/lanjut/akhiri, penilaian, rekap + CSV, instrumen supervisi C.1–C.4
10. ◐ Pengujian & dokumentasi — 23/23 uji lulus (docs/05), panduan instalasi & penggunaan (docs/04); **belum diuji di peramban sungguhan** dan belum diuji beban
