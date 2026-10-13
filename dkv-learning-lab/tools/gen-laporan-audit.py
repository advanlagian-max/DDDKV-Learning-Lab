#!/usr/bin/env python3
"""Menyusun laporan audit 6 kolom dari bukti mentah.

Masukan : docs/audit-api-hasil.json, docs/audit-ui-hasil.json
Luaran  : docs/11-audit-laporan.md, docs/11-audit-tabel-6-kolom.xlsx, docs/11-audit-tabel-6-kolom.csv

Jalankan dari akar repo:  python3 tools/gen-laporan-audit.py
"""
import csv
import json
import os
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
WIB = timezone(timedelta(hours=7))

COLUMNS = ["Fitur", "Langkah uji", "Hasil yang diharapkan", "Hasil aktual", "Status", "Perbaikan"]


def muat(nama):
    with open(os.path.join(DOCS, nama), encoding="utf-8") as f:
        return json.load(f)


def prefix(baris, kode):
    """Kumpulkan 48 baris menjadi satu daftar dengan ID unik (API-xx / UI-xx)."""
    out = []
    for r in baris:
        out.append({
            "id": f"{kode}-{r['no']:02d}",
            "area": r["area"],
            "fitur": r["fitur"],
            "langkah": r["langkah"],
            "harapan": r["harapan"],
            "aktual": r["aktual"],
            "status": r["status"],
            "perbaikan": r.get("perbaikan", "") or "",
            "alat": "API/HTTP" if kode == "API" else "peramban Chromium (Playwright)",
        })
    return out


# ---------------------------------------------------------------------------
# 1. Pemetaan pemeriksaan → sebelas area audit yang diminta pengguna
# ---------------------------------------------------------------------------
AREA_AUDIT = [
    ("1", "Ketersediaan seluruh 36 minggu & 72 pertemuan",
     ["API-01", "API-02", "API-03", "API-28", "UI-14"],
     "Seluruh minggu dan pertemuan harus ada, bertema, bersumber, dan dapat dibuka."),
    ("2", "Alokasi waktu tiap minggu tepat 12 JP (Senin 6 JP, Rabu 6 JP)",
     ["API-04", "API-05"],
     "Tidak boleh ada minggu yang kurang/lebih JP, dan agenda tiap pertemuan harus setara 6 JP."),
    ("3", "Navigasi & hak akses",
     ["API-06", "API-07", "API-08", "UI-01", "UI-02", "UI-03"],
     "Peran dibatasi di server, menu dan pengalihan halaman benar, tidak ada halaman yang kosong/pecah."),
    ("4", "Penyimpanan progres & hasil tugas",
     ["API-09", "API-10", "API-11", "API-12", "UI-04", "UI-06"],
     "Semua pekerjaan tersimpan di server, dapat dibaca ulang, dan alur revisi/remedial bekerja."),
    ("5", "Perhitungan nilai & rubrik",
     ["API-13", "API-14", "API-15", "API-16", "UI-05"],
     "Skor otomatis, konversi rubrik 1–4, rekap berbobot, dan aturan remedial harus konsisten."),
    ("6", "Interaksi setiap simulasi (laboratorium)",
     ["API-17", "UI-08", "UI-09"],
     "Tiap laboratorium dapat dioperasikan, menyimpan hasil, dan simulasi belum selesai ditandai jujur."),
    ("7", "Responsivitas desktop & ponsel",
     ["UI-10"],
     "Tidak ada halaman meluber horizontal di 1366×768 dan 390×844; navigasi ponsel bekerja."),
    ("8", "Validasi form & penanganan kesalahan",
     ["API-18", "API-19", "API-20", "API-21", "UI-07", "UI-15"],
     "Isian tidak lengkap diberi pesan jelas, masukan tidak sah ditolak wajar (bukan galat 500), tanpa galat konsol."),
    ("9", "Keamanan akses & data pengguna",
     ["API-22", "API-23", "API-24", "API-25"],
     "Kata sandi tidak bocor, token/rate limit/logout berlaku, injeksi gagal, pekerjaan siswa tidak bocor antar siswa."),
    ("10", "Kesesuaian materi dengan sumber buku",
     ["API-26", "API-27"],
     "Setiap rujukan halaman benar-benar ada dan kata kunci/tema tiap minggu ditemukan pada halaman yang dirujuk."),
    ("11", "Kesesuaian fitur supervisi dengan dokumen sekolah",
     ["API-29", "API-30", "API-31", "UI-11", "UI-12", "UI-13"],
     "Indikator, skala, identitas supervisor, dokumentasi 72 pertemuan, serta halaman cetak sesuai dokumen sekolah."),
    ("P", "Pendukung: kualitas teknis (tipe, build, integritas basis data)",
     ["API-32", "API-33"],
     "Pemeriksaan tambahan agar hasil audit tidak berdiri di atas kode yang tidak dapat dibangun."),
]

# ---------------------------------------------------------------------------
# 2. Kolom "perbaikan" — hanya diisi bila memang ada tindakan perbaikan
# ---------------------------------------------------------------------------
PERBAIKAN = {
    "API-11": "**Diperbaiki (produk):** `server/asesmen.js` GET `/api/asesmen/:id/kerja` kini ikut mengirim "
              "`skor_rincian`, sehingga rincian jawaban per butir tetap terbaca setelah halaman dimuat ulang "
              "(sebelumnya hanya terkirim sekali saat pengumpulan). Ditemukan lewat uji UI-04.",
    "API-26": "Tidak ada perubahan produk. Ditemukan bahwa penomoran halaman kurikulum memakai **halaman cetak buku**, "
              "sedangkan berkas sumber memakai penanda `<<<HAL n>>>` (halaman PDF). Selisih terbukti dari isi buku sendiri: "
              "B1 halaman cetak 23 ↔ penanda 35 (selisih 12), B2 halaman cetak 1 ↔ penanda 15 (selisih 14). "
              "Alat ukur audit yang disesuaikan, bukan datanya.",
    "API-27": "**Diperbaiki (data):** kata kunci 8 minggu diselaraskan dengan kosakata yang benar-benar muncul pada rentang "
              "halaman yang dirujuk — m5 (`ergonomi`→`keselamatan dan kesehatan kerja`, `postur`), m9 (`otomasi`/`digitalisasi`→`teknologi`/`internet`), "
              "m10 (`efisiensi`→`media`, `produksi`), m13 (`kreatif`→`berpikir kreatif`, `alasan yang jelas`), m14 (`sumber daya kreatif`/`daya saing`→`ekonomi kreatif`, `kreativitas`), "
              "m24 (`proyek tipografi`→`tipografi`, `jenis huruf`), m30 (`editing`/`koreksi warna`/`evaluasi foto`→`menyunting`, `warna`, `noise`), "
              "m36 (`portofolio`/`presentasi`/`asesmen akhir`→`rangkuman`, `uji kompetensi`, `refleksi`, `pengayaan`). "
              "Berkas: `data/kurikulum-sem1.json`, `data/kurikulum-sem2.json`; basis data di-seed ulang.",
    "UI-01": "Skrip audit: pemilihan tombol masuk dan penungguan halaman diperbaiki (awalnya gagal urutan rute). "
             "Tidak ada perubahan produk.",
    "UI-02": "Skrip audit: pengukuran kebocoran UI memakai `#root.innerHTML` per halaman. Tidak ada perubahan produk.",
    "UI-03": "**Diperbaiki (produk):** `/guru/materi` sempat gagal render (React error #31 karena nilai bertipe objek "
             "dipasang sebagai teks anak). Ditambahkan helper `teksNilai/teksSumber/teksFormatif/teksProyek` di `src/guru.tsx`; "
             "10 menu guru kini terbuka. Ditemukan lewat sapuan halaman (UI-14).",
    "UI-04": "**Diperbaiki (produk):** pembahasan pilihan ganda tidak lagi hilang setelah halaman dimuat ulang "
             "(GET pekerjaan menyertakan `skor_rincian`) + skrip audit diubah agar memulai dari kuis yang belum dikerjakan. "
             "Lihat juga API-11.",
    "UI-05": "Skrip audit: kartu asesmen kini dicari pada minggu aktif siswa (halaman memang otomatis menyaring ke minggu yang sedang berjalan) "
             "dan baris siswa dipilih dari status terkumpul; produk tidak diubah.",
    "UI-06": "Skrip audit: tombol 'Minta revisi'/'Buka ulang' dicari di dalam blok baris siswa yang sama; produk tidak diubah.",
    "UI-11": "**Diperbaiki (aksesibilitas):** tautan cetak pada baris supervisi hanya berupa ikon sehingga tidak terbaca "
             "pembaca layar/pencari teks. Tombol kini berlabel teks **🖨️ Cetak** dengan `aria-label` \"Cetak laporan supervisi #n\" "
             "(`src/supervisi.tsx`). Skrip audit juga diubah agar mencari tautan `/guru/supervisi/cetak/`.",
    "UI-13": "Skrip audit: kode indikator C.x berada di dalam `<input>`, sehingga dihitung lewat jumlah baris tabel (18 baris). "
             "Tidak ada perubahan produk.",
    "UI-14": "**Diperbaiki (produk):** perbaikan React error #31 di `src/guru.tsx` (lihat UI-03) membuat sapuan 26 halaman "
             "bersih: 0 galat, 0 halaman kosong.",
    "UI-15": "**Diperbaiki (produk):** 0 galat konsol peramban setelah perbaikan `/guru/materi`.",
}

# ---------------------------------------------------------------------------
# 3. Temuan & perbaikan produk (bug yang benar-benar ditemukan lewat audit)
# ---------------------------------------------------------------------------
TEMUAN_PRODUK = [
    ("T-1", "Halaman **/guru/materi** gagal dirender (React error #31)",
     "Ditemukan saat sapuan seluruh halaman (UI-14): memuat 10 menu guru berhenti di halaman materi guru karena satu nilai bertipe objek dipasang sebagai teks anak pada kartu \"Ringkasan unit minggu\".",
     "`src/guru.tsx`: ditambahkan helper `teksNilai/teksSumber/teksFormatif/teksProyek` yang mengubah nilai apa pun menjadi teks aman.",
     "Diverifikasi ulang: 26 halaman (siswa 13, guru 12, admin 1) terbuka tanpa galat React, 0 galat konsol (UI-14, UI-15)."),
    ("T-2", "**Pembahasan kuis hilang** setelah halaman asesmen dimuat ulang",
     "Ditemukan pada uji D (UI-04). Rincian benar/salah per butir hanya ada pada respons pengumpulan; GET pekerjaan tidak mengirim `skor_rincian`, sehingga pembahasan hilang begitu halaman di-refresh.",
     "`server/asesmen.js` GET `/api/asesmen/:id/kerja`: objek `kerja` kini menyertakan `skor_rincian` (`JSON.parse`), sejalan dengan pembacaan di `src/asesmen2.tsx`.",
     "Diverifikasi: kuis dikirim lewat antarmuka → skor otomatis 100, pembahasan terbuka, muat ulang tetap menampilkan pembahasan, kiriman kedua ditolak (UI-04); pembacaan ulang dari server juga utuh (API-11)."),
    ("T-3", "**Kata kunci 8 minggu tidak terverifikasi** pada halaman buku yang dirujuk",
     "Ditemukan pada uji kesesuaian materi (API-27): sebagian kata kunci memakai istilah yang tidak muncul di buku (mis. \"ergonomi\", \"digitalisasi\", \"koreksi warna\"), sehingga bahan ajar tidak dapat dilacak ke sumber.",
     "`data/kurikulum-sem1.json` & `kurikulum-sem2.json`: kata kunci minggu 5, 9, 10, 13, 14, 24, 30, 36 diganti dengan kosakata yang benar-benar ada pada rentang halaman yang dirujuk; basis data di-seed ulang.",
     "Diverifikasi ulang: rata-rata kecocokan 90% dari 35 minggu ber-rujukan, 0 minggu di bawah 60%, 0 minggu tanpa dasar teks (API-27)."),
    ("T-6", "Tambah siswa massal dari dalam aplikasi (permintaan sekolah) + 3 cacat yang ikut ketahuan",
     "Permintaan sekolah: data siswa ditambahkan lewat aplikasi, bukan terminal. Dibuat endpoint `POST /api/admin/users/impor` dan panel **Panel Admin → Akun → \"Tambah siswa massal\"** (tempel dari Excel, pratinjau, unduh CSV kredensial). Saat pengujian, tiga cacat ditemukan: (a) impor yang diulang membuat **akun kembar** karena username dibuat ulang; (b) setelah impor, halaman Admin memasang ulang panel sehingga **daftar yang ditempel & hasil impor hilang**; (c) tombol unduh CSV hilang bila impor berikutnya tidak menambah akun.",
     "(a) baris tanpa username kini dikenali dari **nama + kelas** sehingga diimpor ulang akan **dilewati** (aturan sama di `tools/impor-akun.mjs`); (b) `src/admin.tsx` memakai **penyegaran senyap** (`reload` tidak lagi menampilkan spinner sehingga panel tidak dipasang ulang); (c) daftar akun hasil impor terakhir disimpan di tingkat modul sehingga tetap dapat diunduh. Tambahan: `src/lib.tsx` tidak lagi memanggil `/api/auth/me` bila belum ada token (menghilangkan galat 401 di konsol saat halaman login dibuka).",
     "Uji nyata: `npm run uji:impor` **8/8 LULUS** (pratinjau; 3 akun + kelas baru dibuat; akun hasil impor **berhasil login**; impor ulang → \"0 akun dibuat, 3 dilewati\"; unduh CSV berisi nama/username/sandi; 0 galat konsol & 0 balasan 4xx/5xx). Uji API ke-41 pada `npm test`: **41/41 LULUS** (impor=200 3 dibuat, siswa=403, daftar kosong=400, sandi pendek=400). Tanpa regresi: audit API 33/33, audit UI 15/15."),
    ("T-5", "Pembatasan percobaan login dapat dilewati dengan memalsukan header X-Forwarded-For",
     "Ditemukan saat menyiapkan pemasangan daring (`docs/13-panduan-online.md`): header `X-Forwarded-For` selalu dipercaya, sehingga percobaan login gagal dapat dibuat tak terbatas dan IP pada log aktivitas dapat dipalsukan.",
     "`server/index.js`: header itu kini hanya dipercaya bila `DKV_TRUST_PROXY` disetel; ditambah penjaga kedua **15 kegagalan per akun per 15 menit dari IP mana pun**; ditambah `GET /api/health`, header keamanan (`nosniff`, `Referrer-Policy`, `Permissions-Policy`; `X-Frame-Options`/CSP/HSTS hanya saat `DKV_ONLINE=1`), dan variabel `HOST`.",
     "Diverifikasi `npm run uji:online` → **10/10 LULUS** (O2: 401×5 lalu 429 walau header berbeda tiap percobaan; O3: IP log = 127.0.0.1; O6: IP proxy asli tercatat; O7: bind 127.0.0.1; O8: 429 lintas-IP). Tanpa regresi: `npm test` 40/40 + 38/38, audit API 33/33, audit UI 15/15."),
    ("T-4", "Tombol cetak supervisi hanya ikon (tidak terbaca sebagai teks)",
     "Ditemukan pada uji halaman cetak (UI-11): tautan cetak tidak punya label teks, sehingga sulit ditemukan pengguna pembaca layar dan tidak muncul pada pencarian teks halaman.",
     "`src/supervisi.tsx`: tombol baris menjadi **🖨️ Cetak** dengan `aria-label` \"Cetak laporan supervisi #n\".",
     "Diverifikasi: halaman cetak supervisi terbuka dengan kop sekolah dan butir indikator terisi (UI-11)."),
]

# Koreksi alat ukur (bukan bug produk) — ditulis apa adanya agar hasil dapat dipercaya
KOREKSI_ALAT = [
    ("API-07", "Uji kunci navigasi minggu mengasumsikan menu dalam keadaan terkunci; keadaan awal basis data sudah terbuka sehingga hasilnya terbaca salah.",
     "Uji kini mengunci menu lebih dahulu, lalu membandingkan respons 403 (terkunci) dan 200 (dibuka)."),
    ("API-11", "Uji penyimpanan kuis memakai kuis yang sudah dikerjakan pada uji sebelumnya.",
     "Uji memilih kuis yang belum dikerjakan dan memverifikasi skor serta isi jawaban identik setelah dibaca ulang."),
    ("API-26/27", "Nomor halaman kurikulum (halaman cetak buku) diperbandingkan langsung dengan penanda halaman PDF pada berkas ekstraksi.",
     "Ditambahkan peta selisih yang dibuktikan dari isi buku (B1 +12, B2 +14) sebelum mencocokkan kata kunci."),
    ("UI-03", "Tab guru diukur dari jumlah tabel/daftar, bukan dari isi halaman.",
     "Uji mengukur panjang isi `<main>` tiap tab (>600 karakter) sehingga menghitung konten apa pun bentuknya."),
    ("UI-04/05/06", "Pemilihan kartu asesmen dan baris siswa memakai dugaan minggu (selalu minggu 1/5), padahal halaman menyaring ke minggu aktif.",
     "Uji kini membaca minggu aktif dari kartu lalu memilih baris siswa berstatus terkumpul pada blok yang sama."),
    ("UI-11", "Uji mencari teks \"Cetak\", padahal tautan cetak hanya berupa ikon.",
     "Uji mencari tautan `/guru/supervisi/cetak/…`; ditambah perbaikan label (T-4)."),
    ("UI-13", "Uji menghitung kode indikator C.x sebagai teks, padahal kode berada di dalam `<input>`.",
     "Uji menghitung baris tabel indikator (18 baris) dan memastikan kolom aspek C.1–C.4 ada."),
]

BATASAN = [
    "Peramban yang diuji: **Chromium headless 1248** (Playwright). Firefox, Safari, dan Edge belum diuji.",
    "Responsivitas diuji dengan **emulasi ukuran viewport** (1366×768 dan 390×844) di Chromium, bukan perangkat fisik (Android/iOS).",
    "`window.print()` tidak diuji sampai keluar kertas/printer. Pada lingkungan pratinjau tersemat, dialog cetak diblokir; yang diverifikasi adalah halaman cetak terender lengkap + pesan cadangan \"Ctrl/Cmd + P\".",
    "Belum ada uji beban/banyak pengguna serentak, uji jaringan lambat, maupun uji aksesibilitas formal (WCAG/audit pembaca layar).",
    "Basis data yang diuji adalah **data demo hasil `npm run seed`** (13 pengguna, 2 kelas), bukan data nyata sekolah.",
    "Area 10 (kesesuaian materi) diperiksa secara **keterlacakan otomatis** (rujukan halaman + kata kunci), bukan penilaian mutu akademik tiap paragraf oleh guru mata pelajaran.",
    "Simulasi **Technopreneurship** masih ditandai \"pengembangan\" di antarmuka — memang belum selesai, dan ditampilkan jujur (UI-09).",
    "Pemasangan daring (Caddy/Cloudflare Tunnel, HTTPS dari luar jaringan) belum diuji — yang diuji adalah kesiapan aplikasinya: `npm run uji:online` 10/10 LULUS (`docs/13-panduan-online.md` bagian 12).",
    "Integrasi dengan Google Sites baru diuji memakai halaman penyemat tiruan di Chromium (6/6 LULUS, `npm run uji:bingkai`); halaman Google Sites sungguhan & aplikasi Google Sites di ponsel belum diuji (`docs/14-panduan-google-site.md` bagian 5).",
    "Minggu 1 (orientasi & asesmen diagnostik) tidak memiliki padanan bab buku; ini keputusan desain yang tercatat di data sumber (ditampilkan pada hasil API-27).",
]


def tabel_md(rows):
    head = "| " + " | ".join(COLUMNS) + " |"
    sep = "|" + "|".join(["---"] * len(COLUMNS)) + "|"

    def bersih(t):
        return str(t).replace("|", "\\|").replace("\n", " ").strip() or "—"

    body = ["| " + " | ".join(bersih(r[c]) for c in COLUMNS) + " |" for r in rows]
    return "\n".join([head, sep] + body)


def baris_tabel(rows):
    """Ubah daftar pemeriksaan menjadi baris tabel 6 kolom (ID menempel di kolom Fitur)."""
    out = []
    for r in rows:
        out.append({
            "Fitur": f"{r['id']} — {r['fitur']}",
            "Langkah uji": f"[{r['alat']}] {r['langkah']}",
            "Hasil yang diharapkan": r["harapan"],
            "Hasil aktual": r["aktual"],
            "Status": "LULUS" if r["status"].upper().startswith("LULUS") else r["status"],
            "Perbaikan": PERBAIKAN.get(r["id"], "Tidak diperlukan perbaikan."),
        })
    return out


def main():
    api = prefix(muat("audit-api-hasil.json")["hasil"], "API")
    ui = prefix(muat("audit-ui-hasil.json")["hasil"], "UI")
    semua = {r["id"]: r for r in api + ui}

    lulus = sum(1 for r in semua.values() if r["status"].upper().startswith("LULUS"))
    total = len(semua)
    diperbaiki = sum(1 for r in semua.values() if "**Diperbaiki (produk)" in PERBAIKAN.get(r["id"], ""))
    waktu_api = muat("audit-api-hasil.json")["waktu"]
    waktu_ui = muat("audit-ui-hasil.json")["waktu"]
    BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus",
             "September", "Oktober", "November", "Desember"]

    def tanggal_id(dt):
        return f"{dt.day} {BULAN[dt.month - 1]} {dt.year}"

    def fmt(s):
        dt = datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(WIB)
        return f"{tanggal_id(dt)} {dt.strftime('%H:%M')} WIB"

    # ---------------- Markdown ----------------
    L = []
    L.append("# Laporan Audit Aplikasi DKV Learning Lab")
    L.append("")
    L.append("**SMK Negeri 3 Kuningan — Dasar-Dasar DKV Fase E · 36 minggu / 72 pertemuan**  ")
    L.append(f"Tanggal audit: **{tanggal_id(datetime.now(WIB))}** · "
             f"bukti terakhir: API {fmt(waktu_api)} & peramban {fmt(waktu_ui)}  ")
    L.append("Auditor: agen Arena.ai (pengujian otomatis + peramban sungguhan) · Basis uji: `http://localhost:8080`")
    L.append("")
    L.append("## 1. Ringkasan")
    L.append("")
    L.append(f"- **{total} pemeriksaan dijalankan, {lulus} LULUS, {total - lulus} GAGAL** "
             f"({len(api)} pemeriksaan API/data + {len(ui)} pemeriksaan antarmuka pada peramban sungguhan).")
    L.append("- Seluruh pemeriksaan dijalankan **nyata**: permintaan HTTP ke aplikasi yang berjalan dan klik nyata di Chromium "
             "(Playwright). Tidak ada status lulus yang diberikan tanpa dijalankan.")
    L.append(f"- **{len(TEMUAN_PRODUK)} masalah produk (T-1 … T-{len(TEMUAN_PRODUK)}) ditemukan dan diperbaiki** selama audit — "
             f"rinciannya di bagian 4, dan {diperbaiki} baris tabel di bawah mencantumkan perbaikan pada kolom terakhir.")
    L.append(f"- **{len(KOREKSI_ALAT)} koreksi alat ukur** dilakukan pada skrip audit karena pengukuran awal keliru — "
             "produknya sendiri sudah benar (bagian 5, ditulis terbuka agar hasil dapat dipercaya).")
    L.append(f"- **{len(BATASAN)} batasan pengujian** yang belum dicakup dicantumkan apa adanya di bagian 6.")
    L.append("- Simulasi Technopreneurship masih berstatus \"pengembangan\" dan ditandai jujur di antarmuka (tidak diklaim selesai).")
    L.append("")
    L.append("### 1.1 Rekap per area audit")
    L.append("")
    L.append("| Area | Pokok pemeriksaan | Jumlah uji | Lulus | Gagal |")
    L.append("|---|---|---|---|---|")
    for kode, judul, ids, _ in AREA_AUDIT:
        rs = [semua[i] for i in ids]
        ok = sum(1 for r in rs if r["status"].upper().startswith("LULUS"))
        L.append(f"| {kode} | {judul} | {len(rs)} | {ok} | {len(rs) - ok} |")
    L.append(f"| — | **Total** | **{total}** | **{lulus}** | **{total - lulus}** |")
    L.append("")
    L.append("### 1.2 Bukti mentah")
    L.append("")
    L.append("- `docs/audit-api-hasil.json` — 33 pemeriksaan API/data lengkap dengan langkah, harapan, dan hasil aktual.")
    L.append("- `docs/audit-ui-hasil.json` — 15 pemeriksaan antarmuka di peramban sungguhan.")
    L.append("- `docs/11-audit-tabel-6-kolom.xlsx` / `.csv` — tabel 6 kolom untuk disaring dan disortir.")
    L.append("")
    L.append("## 2. Cara audit dijalankan (dapat direproduksi)")
    L.append("")
    L.append("```bash")
    L.append("cd app")
    L.append("npm install            # sekali saja")
    L.append("npm run seed           # reset basis data demo ke keadaan bersih")
    L.append("npm run serve          # bangun + jalankan di http://localhost:8080")
    L.append("")
    L.append("# di terminal lain — audit yang sama seperti laporan ini")
    L.append("npm run audit:api      # 33 pemeriksaan API/data (butuh server berjalan)")
    L.append("npm run audit:ui       # 15 pemeriksaan peramban (butuh Chromium Playwright)")
    L.append("```")
    L.append("")
    L.append("Alat uji: Node.js + Playwright (Chromium headless). Bila Chromium belum ada:")
    L.append("`npm i -D playwright && npx playwright install chromium`. Rincian pemasangan ada di "
             "`docs/04-panduan-instalasi-dan-penggunaan.md`.")
    L.append("")
    L.append("> Catatan penting: `npm run audit:ui` **mengubah isi basis data demo** (mengirim kuis, menilai karya, membuka revisi). "
             "Jalankan `npm run seed` sebelum dan sesudah audit bila ingin data demo tetap rapi.")
    L.append("")
    L.append("## 3. Tabel hasil audit (6 kolom)")
    L.append("")
    L.append("Kolom: **Fitur · Langkah uji · Hasil yang diharapkan · Hasil aktual · Status · Perbaikan**. "
             "Kode `API-nn` = pemeriksaan API/data, `UI-nn` = pemeriksaan antarmuka peramban.")
    L.append("")
    for kode, judul, ids, tujuan in AREA_AUDIT:
        rs = [semua[i] for i in ids]
        ok = sum(1 for r in rs if r["status"].upper().startswith("LULUS"))
        L.append(f"### Area {kode}. {judul}")
        L.append("")
        L.append(f"*Tujuan pemeriksaan:* {tujuan}  ")
        L.append(f"*Hasil:* **{ok}/{len(rs)} LULUS**.")
        L.append("")
        L.append(tabel_md(baris_tabel(rs)))
        L.append("")
    L.append("## 4. Temuan yang diperbaiki (masalah produk)")
    L.append("")
    L.append("| No | Temuan | Bagaimana ditemukan | Perbaikan | Bukti setelah perbaikan |")
    L.append("|---|---|---|---|---|")
    for no, judul, temuan, perbaikan, bukti in TEMUAN_PRODUK:
        bersih = lambda t: t.replace("|", "\\|")
        L.append(f"| {no} | {bersih(judul)} | {bersih(temuan)} | {bersih(perbaikan)} | {bersih(bukti)} |")
    L.append("")
    L.append("## 5. Koreksi pada alat ukur audit (bukan masalah produk)")
    L.append("")
    L.append("Pada audit pertama, 8 pemeriksaan terbaca GAGAL padahal produknya benar. Penyebabnya ada di skrip audit, "
             "bukan di aplikasi. Semuanya diperbaiki dan dijalankan ulang; daftar berikut dicantumkan agar hasil audit "
             "tidak memberi kesan lebih baik dari kenyataannya.")
    L.append("")
    L.append("| Pemeriksaan | Kekeliruan pengukuran | Perbaikan pada skrip audit |")
    L.append("|---|---|---|")
    for pid, salah, benarnya in KOREKSI_ALAT:
        L.append(f"| {pid} | {salah.replace('|', chr(92) + '|')} | {benarnya.replace('|', chr(92) + '|')} |")
    L.append("")
    L.append("## 6. Batasan pengujian (belum diuji)")
    L.append("")
    for b in BATASAN:
        L.append(f"- {b}")
    L.append("")
    L.append("## 7. Tindak lanjut yang disarankan")
    L.append("")
    L.append("1. Menyelesaikan simulasi **Technopreneurship** yang masih berstatus \"pengembangan\".")
    L.append("2. Mengisi **data nyata sekolah** (kelas, peserta didik, guru) menggantikan data demo sebelum dipakai di kelas.")
    L.append("3. Menjalankan `npm run audit:api` + `npm run audit:ui` sebagai pemeriksaan rutin setiap kali aplikasi diubah.")
    L.append("4. Menguji sekali di perangkat nyata (ponsel Android) dan peramban Firefox/Edge sebelum tahun ajaran berjalan.")
    L.append("5. Meninjau ulang kata kunci/kalimat kunci tiap minggu bersama guru mata pelajaran (audit ini menguji keterlacakan ke buku, bukan mutu akademik).")
    L.append("")
    L.append("---")
    L.append("")
    L.append("*Laporan ini dibangkitkan otomatis dari bukti pengujian: `python3 tools/gen-laporan-audit.py`. "
             "Angka pada laporan berasal langsung dari hasil uji, bukan dari perkiraan.*")
    L.append("")
    md = "\n".join(L)
    with open(os.path.join(DOCS, "11-audit-laporan.md"), "w", encoding="utf-8") as f:
        f.write(md)

    # ---------------- CSV (tepat 6 kolom) ----------------
    urut = []
    for _, _, ids, _ in AREA_AUDIT:
        urut += [semua[i] for i in ids]
    rows6 = baris_tabel(urut)
    with open(os.path.join(DOCS, "11-audit-tabel-6-kolom.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        for r in rows6:
            w.writerow({c: r[c] for c in COLUMNS})

    # ---------------- XLSX ----------------
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Alignment, Font, PatternFill
        from openpyxl.utils import get_column_letter
    except ImportError:
        print("openpyxl tidak tersedia — xlsx dilewati.")
        print(f"Selesai: docs/11-audit-laporan.md ({len(md)} karakter), docs/11-audit-tabel-6-kolom.csv")
        return

    wb = Workbook()
    ws = wb.active
    ws.title = "Tabel 6 Kolom"
    warna_kepala = PatternFill("solid", fgColor="1F3864")
    ws.append(COLUMNS)
    for i, c in enumerate(COLUMNS, start=1):
        sel = ws.cell(row=1, column=i)
        sel.font = Font(bold=True, color="FFFFFF")
        sel.fill = warna_kepala
        sel.alignment = Alignment(vertical="center", wrap_text=True)
    for r in rows6:
        ws.append([r[c] for c in COLUMNS])
    lebar = [46, 52, 52, 60, 12, 60]
    for i, w_ in enumerate(lebar, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w_
    for row in ws.iter_rows(min_row=2):
        for sel in row:
            sel.alignment = Alignment(vertical="top", wrap_text=True)
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions

    ws2 = wb.create_sheet("Rincian per Area")
    kepala2 = ["Area audit", "ID", "Alat uji", "Fitur", "Langkah uji", "Hasil yang diharapkan",
               "Hasil aktual", "Status", "Perbaikan", "Area internal skrip"]
    ws2.append(kepala2)
    for i, _ in enumerate(kepala2, start=1):
        sel = ws2.cell(row=1, column=i)
        sel.font = Font(bold=True, color="FFFFFF")
        sel.fill = warna_kepala
        sel.alignment = Alignment(vertical="center", wrap_text=True)
    for kode, judul, ids, _ in AREA_AUDIT:
        for r in [semua[i] for i in ids]:
            ws2.append([f"{kode}. {judul}", r["id"], r["alat"], r["fitur"], r["langkah"], r["harapan"],
                        r["aktual"], r["status"], PERBAIKAN.get(r["id"], "Tidak diperlukan perbaikan."), r["area"]])
    for i, w_ in enumerate([34, 10, 24, 40, 50, 50, 58, 12, 55, 26], start=1):
        ws2.column_dimensions[get_column_letter(i)].width = w_
    for row in ws2.iter_rows(min_row=2):
        for sel in row:
            sel.alignment = Alignment(vertical="top", wrap_text=True)
    ws2.freeze_panes = "A2"
    ws2.auto_filter.ref = ws2.dimensions

    ws3 = wb.create_sheet("Temuan & Perbaikan")
    ws3.append(["No", "Temuan", "Bagaimana ditemukan", "Perbaikan", "Bukti setelah perbaikan"])
    for i in range(1, 6):
        sel = ws3.cell(row=1, column=i)
        sel.font = Font(bold=True, color="FFFFFF")
        sel.fill = warna_kepala
        sel.alignment = Alignment(vertical="center", wrap_text=True)
    for t in TEMUAN_PRODUK:
        ws3.append([t[0], t[1].replace("**", ""), t[2], t[3], t[4]])
    for i, w_ in enumerate([8, 44, 62, 62, 52], start=1):
        ws3.column_dimensions[get_column_letter(i)].width = w_
    for row in ws3.iter_rows(min_row=2):
        for sel in row:
            sel.alignment = Alignment(vertical="top", wrap_text=True)

    ws4 = wb.create_sheet("Ringkasan Area")
    ws4.append(["Area", "Pokok pemeriksaan", "Jumlah uji", "Lulus", "Gagal"])
    for i in range(1, 6):
        sel = ws4.cell(row=1, column=i)
        sel.font = Font(bold=True, color="FFFFFF")
        sel.fill = warna_kepala
    for kode, judul, ids, _ in AREA_AUDIT:
        rs = [semua[i] for i in ids]
        ok = sum(1 for r in rs if r["status"].upper().startswith("LULUS"))
        ws4.append([kode, judul, len(rs), ok, len(rs) - ok])
    ws4.append(["—", "Total", total, lulus, total - lulus])
    for i, w_ in enumerate([8, 56, 12, 10, 10], start=1):
        ws4.column_dimensions[get_column_letter(i)].width = w_

    wb.save(os.path.join(DOCS, "11-audit-tabel-6-kolom.xlsx"))
    print(f"Selesai: docs/11-audit-laporan.md ({len(md)} karakter), "
          f"docs/11-audit-tabel-6-kolom.csv, docs/11-audit-tabel-6-kolom.xlsx "
          f"— {total} baris, {lulus} lulus.")


if __name__ == "__main__":
    main()
