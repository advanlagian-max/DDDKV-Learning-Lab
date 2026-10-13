#!/usr/bin/env python3
# gen-modul-doc.py — Menghasilkan docs/07-modul-materi.md dari data modul (modul-sem1/2.json)
# dan berkas diagram (diagram-contoh.json) agar dokumen selalu sama dengan data aplikasi.
import json, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "app", "data")

minggu = {}
for f in ("modul-sem1.json", "modul-sem2.json"):
    for w in json.load(open(os.path.join(DATA, f), encoding="utf-8"))["minggu"]:
        minggu[w["minggu"]] = w

diagram = {d["id"]: d["judul"] for d in json.load(open(os.path.join(DATA, "diagram-contoh.json"), encoding="utf-8"))["diagram"]}

kur = {}
for f in ("kurikulum-sem1.json", "kurikulum-sem2.json"):
    for w in json.load(open(os.path.join(DATA, f), encoding="utf-8"))["minggu"]:
        kur[w["minggu"]] = (w["semester"], w["tema"])

total_butir = sum(len(minggu[n][h]["asesmenFormatif"]["butir"]) for n in minggu for h in ("senin", "rabu"))
total_rubrik = sum(len(minggu[n][h]["lkpd"]["rubrik"]) for n in minggu for h in ("senin", "rabu"))
total_tujuan = sum(len(minggu[n][h]["tujuan"]) for n in minggu for h in ("senin", "rabu"))
total_poin = sum(len(minggu[n][h]["materi"]["poin"]) for n in minggu for h in ("senin", "rabu"))
rujukan_diagram = collections.Counter(
    c["id"] for n in minggu for h in ("senin", "rabu") for c in minggu[n][h]["contohVisual"] if c["jenis"] == "diagram"
)
rujukan_buku = sum(1 for n in minggu for h in ("senin", "rabu") for c in minggu[n][h]["contohVisual"] if c["jenis"] == "rujukan-buku")

L = []
L.append("# 07 — Modul Materi 72 Pertemuan (Senin & Rabu)\n")
L.append("**DKV Learning Lab** · Dasar-Dasar Desain Komunikasi Visual · Fase E / Kelas X · SMK Negeri 3 Kuningan  ")
L.append("Berkas ini dibangkitkan otomatis oleh `tools/gen-modul-doc.py` dari data yang benar-benar dipakai aplikasi, ")
L.append("sehingga isinya selalu sama dengan yang dilihat siswa dan guru.\n")
L.append("---\n")

L.append("## 1. Ringkasan isi\n")
L.append("| Butir | Jumlah |")
L.append("|---|---|")
L.append(f"| Minggu | {len(minggu)} (2 semester) |")
L.append(f"| Pertemuan | {len(minggu)*2} (Senin & Rabu @6 JP / 270 menit) |")
L.append(f"| Tujuan pembelajaran per pertemuan | 2–3 · total {total_tujuan} |")
L.append(f"| Poin materi per pertemuan | 4 · total {total_poin} |")
L.append(f"| Butir asesmen formatif | {total_butir} |")
L.append(f"| Kriteria rubrik LKPD | {total_rubrik} |")
L.append(f"| Contoh visual rujukan buku | {rujukan_buku} |")
L.append(f"| Diagram orisinal (SVG di aplikasi) | {len(diagram)} tersedia · {sum(rujukan_diagram.values())} rujukan |")
L.append("")
L.append("Setiap pertemuan memuat 9 bagian wajib: **tujuan, pertanyaan pemantik, materi (pengantar + 4 poin + istilah), ")
L.append("contoh visual, aktivitas memahami–mengaplikasi–merefleksi, LKPD + langkah + rubrik, asesmen formatif, tugas, ")
L.append("dan tindak lanjut (remedial & pengayaan)**.\n")

L.append("## 2. Struktur berkas data\n")
L.append("```text")
L.append("app/data/_modul_part1..6.json     ← bagian penulisan (masing-masing 6 minggu), sumber suntingan penulis")
L.append("app/data/modul-sem1.json          ← hasil gabungan minggu 1–18  (dibaca aplikasi)")
L.append("app/data/modul-sem2.json          ← hasil gabungan minggu 19–36 (dibaca aplikasi)")
L.append("app/data/diagram-contoh.json      ← 20 diagram orisinal (bentuk sederhana → dirender SVG oleh React)")
L.append("tools/gabung-modul.py             ← penggabung + pemvalidasi (72 pertemuan, 6 JP/270 menit)")
L.append("tools/gen-modul-doc.py            ← pembangkit dokumen ini")
L.append("```\n")
L.append("Struktur satu pertemuan (disingkat):\n")
L.append("```json")
L.append('{ "tujuan": ["…", "…"], "pemantik": ["…", "…"],')
L.append('  "materi": { "pengantar": "…", "poin": ["…","…","…","…"], "istilah": [{"t":"…","a":"…"}] },')
L.append('  "contohVisual": [{"jenis":"diagram","id":"diagram-alur-produksi","judul":"…","keterangan":"…"},')
L.append('                   {"jenis":"rujukan-buku","judul":"…","keterangan":"…"}],')
L.append('  "aktivitas": { "memahami": ["…"], "mengaplikasi": ["…"], "merefleksi": ["…"] },')
L.append('  "lkpd": { "judul": "…", "langkah": ["…"], "rubrik": [{"kriteria":"…","skor4":"…","skor3":"…","skor2":"…","skor1":"…"}] },')
L.append('  "asesmenFormatif": { "bentuk": "kuis-pilihan-ganda", "butir": [{"soal":"…","opsi":["…","…","…"],"kunci":0}] },')
L.append('  "tugas": { "judul": "…", "bentuk": "individu", "luaran": "…" },')
L.append('  "tindakLanjut": { "remedial": "…", "pengayaan": "…" } }')
L.append("```\n")
L.append("Cara menggabungkan ulang setelah menyunting bagian: `python3 tools/gabung-modul.py` (menjalankan seluruh pemeriksaan), ")
L.append("lalu `npm run seed` di folder `app` agar basis data memuat modul terbaru.\n")

L.append("## 3. Peta 36 minggu (tema Senin–Rabu, asesmen, contoh visual)\n")
L.append("| M | Sem | Tema minggu (matriks) | Pertemuan Senin | Pertemuan Rabu | Butir kuis (S/R) | Diagram contoh |")
L.append("|---|---|---|---|---|---|---|")
for n in sorted(minggu):
    w = minggu[n]
    sem, tema = kur[n]
    s, rb = w["senin"], w["rabu"]
    def tem(x):
        # kalimat pertama pengantar materi sebagai penanda isi pertemuan
        t = (x["materi"]["pengantar"] or "").split(". ")[0]
        return (t[:96] + "…") if len(t) > 96 else t
    dia = ", ".join(c["id"].replace("diagram-", "") for c in s["contohVisual"] + rb["contohVisual"] if c["jenis"] == "diagram") or "—"
    L.append(f"| {n} | {sem} | {tema[:60]}{'…' if len(tema)>60 else ''} | {tem(s)} | {tem(rb)} | "
             f"{len(s['asesmenFormatif']['butir'])}/{len(rb['asesmenFormatif']['butir'])} | {dia} |")
L.append("")
L.append("Kolom Senin/Rabu pada tabel di atas memuat **kalimat pembuka materi tiap pertemuan**; teks lengkap (tujuan, pemantik, ")
L.append("4 poin materi, istilah, aktivitas tiga tahap, LKPD + rubrik, kuis, tugas, dan tindak lanjut) ada di ")
L.append("`app/data/modul-sem1.json` dan `modul-sem2.json`, serta tampil di halaman pertemuan aplikasi.\n")

L.append("## 4. Penanda asesmen & bentuk butir\n")
bentuk = collections.Counter(minggu[n][h]["asesmenFormatif"]["bentuk"] for n in minggu for h in ("senin", "rabu"))
L.append("| Bentuk asesmen formatif | Jumlah pertemuan |")
L.append("|---|---|")
for b, c in bentuk.most_common():
    L.append(f"| {b} | {c} |")
L.append("")
L.append("Kuis pilihan ganda (3 opsi) **dinilai di server** lewat `POST /api/kuis-formatif/:minggu/:hari` — kunci jawaban tidak ")
L.append("pernah dikirim ke peramban sebelum penilaian. Riwayat percobaan tersimpan pada tabel `quiz_attempts` dan hanya dapat ")
L.append("dilihat siswa pemiliknya (guru melihat rekap seluruh siswa di menu Penilaian/Rekap).\n")

L.append("## 5. Diagram contoh visual\n")
L.append("Semua diagram digambar ulang secara orisinal untuk aplikasi ini (usulan ⧗ yang perlu diverifikasi guru) dan tidak menyalin ")
L.append("gambar buku. Bentuknya disimpan sederhana di `diagram-contoh.json` lalu dirender menjadi SVG oleh `src/modul.tsx`.\n")
L.append("| id diagram | judul | dipakai pada |")
L.append("|---|---|---|")
pemakai = collections.defaultdict(list)
for n in sorted(minggu):
    for h in ("senin", "rabu"):
        for c in minggu[n][h]["contohVisual"]:
            if c["jenis"] == "diagram":
                pemakai[c["id"]].append(f"m{n} {h[:1].upper()}")
for did, judul in diagram.items():
    pakai = ", ".join(pemakai.get(did, [])) or "— (cadangan)"
    L.append(f"| `{did}` | {judul} | {pakai} |")
L.append("")

L.append("## 6. Bagaimana guru menyunting materi\n")
L.append("1. Masuk dengan akun guru (Mode Guru) → buka **Pertemuan** → pilih minggu dan hari.")
L.append("2. Gulir ke bagian **“Mode Guru — sunting materi pertemuan ini”** → tombol **Sunting materi**.")
L.append("3. Sunting: tujuan, pemantik, pengantar materi, poin materi, istilah, tiga jenis aktivitas, judul & langkah LKPD, rubrik ")
L.append("   (format `kriteria | skor4 | skor3 | skor2 | skor1`), tugas, dan tindak lanjut; lalu **Simpan materi**.")
L.append("4. Perubahan tersimpan di server (`PUT /api/kurikulum/:nomor/pertemuan/:hari/modul`), langsung terlihat siswa, dan tercatat ")
L.append("   sebagai aksi `sunting_modul` pada log aktivitas.\n")
L.append("**Belum dapat disunting dari antarmuka (batasan jujur):** butir kuis formatif dan contoh visual/diagram. Keduanya masih ")
L.append("perlu diubah melalui berkas data oleh pengembang bersama operator.\n")

L.append("## 7. Penanda progres per pertemuan\n")
L.append("- Siswa menandai **pertemuan** (Senin atau Rabu) yang sudah diselesaikan pada halaman detail pertemuan.")
L.append("- Server menyimpan daftar pertemuan yang ditandai pada kolom `aktivitas` (tabel `progress`) dan **menggabung**, bukan menimpa, ")
L.append("  sehingga tanda lama tidak hilang saat pertemuan lain ditandai.")
L.append("- Status minggu menjadi **selesai** hanya setelah Senin **dan** Rabu ditandai; sebelum itu bernilai **berjalan**.")
L.append("- Daftar 72 pertemuan menampilkan tanda ✓ pada pertemuan yang sudah ditandai siswa.\n")

L.append("## 8. Batas yang perlu diketahui guru\n")
L.append("1. Kedua buku acuan tidak memuat CP/ATP; seluruh tujuan adalah **usulan ⧗** yang wajib diverifikasi sekolah.")
L.append("2. Nomor halaman/subbab pada contoh visual jenis `rujukan-buku` adalah usulan; istilah dapat berbeda dengan buku yang dipakai sekolah.")
L.append("3. Materi disusun sebagai **parafrase orisinal** setia konsep sumber — bukan salinan verbatim dari buku.")
L.append("4. Diagram digambar ulang secara orisinal oleh tim aplikasi; verifikasi visual oleh guru masih diperlukan.")
L.append("5. Pengujian dilakukan lewat uji API dan jsdom (tanpa peramban sungguhan); tampilan cetak/ponsel perlu dilihat langsung oleh guru.")
L.append("")
L.append(f"_Dibangkitkan dari data aplikasi: {len(minggu)} minggu · {len(minggu)*2} pertemuan · {total_butir} butir kuis & {total_rubrik} kriteria rubrik._")

out = os.path.join(ROOT, "docs", "07-modul-materi.md")
open(out, "w", encoding="utf-8").write("\n".join(L) + "\n")
print(f"docs/07-modul-materi.md ditulis ({os.path.getsize(out)/1024:.1f} KB)")
