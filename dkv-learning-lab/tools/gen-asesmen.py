#!/usr/bin/env python3
# gen-asesmen.py — Membangkitkan rencana asesmen 36 minggu (LKPD, kuis, formatif, sumatif, praktik, proyek)
# dari data kurikulum + modul yang sudah ditulis, lengkap dengan kriteria, bobot, rubrik, dan pembahasan kuis.
# Hasil: app/data/asesmen-36m.json (dibaca server/seed.js lalu dimuat ke tabel assessments).
#
# PENTING (kejujuran data):
#  - Seluruh bobot, KKTp, jumlah kesempatan revisi, dan rumusan rubrik adalah USULAN ⧗ yang dapat disunting guru
#    langsung dari antarmuka (PUT /api/guru/asesmen/:id/rubrik).
#  - Pembahasan kuis dibangkitkan dari materi pertemuan yang ditulis pada modul (bukan dikarang bebas),
#    dan ditandai "usulan" agar guru memeriksa/menyuntingnya.
#  - Hanya butir pilihan ganda yang dinilai otomatis. Aspek proses, kreativitas, dan kualitas karya visual
#    WAJIB dinilai guru memakai rubrik (nilaiOtomatis: false, perluKonfirmasiGuru: true).
import json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "app", "data")

STOP = set("yang dan atau di ke dari pada untuk dengan adalah ini itu tidak bisa dapat akan agar bila jika saat pada seorang sebuah para oleh juga lebih paling hanya serta namun tetapi karena sebagai suatu secara dalam antara tanpa sudah belum masih".split())

def kata(teks):
    t = unicodedata.normalize("NFKD", str(teks or "")).lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return {w for w in t.split() if len(w) >= 4 and w not in STOP}

def pilih_pembahasan(soal, opsi_kunci, modul_pertemuan):
    """Pilih poin materi/istilah yang paling dekat dengan butir soal sebagai bahan pembahasan."""
    acuan = kata(soal) | kata(opsi_kunci)
    kandidat = []
    for p in (modul_pertemuan.get("materi", {}).get("poin") or []):
        kandidat.append((len(kata(p) & acuan), p))
    for it in (modul_pertemuan.get("materi", {}).get("istilah") or []):
        kandidat.append((len(kata(it.get("t")) & acuan) + len(kata(it.get("a")) & acuan), f"{it.get('t')} adalah {it.get('a')}"))
    for f in (modul_pertemuan.get("contohVisual") or []):
        kandidat.append((len(kata(f.get("keterangan")) & acuan) // 2, f.get("keterangan")))
    kandidat = [k for k in kandidat if k[0] > 0]
    if kandidat:
        kandidat.sort(key=lambda x: -x[0])
        return f"Jawaban benar: “{opsi_kunci}”. {kandidat[0][1]}"
    ist = (modul_pertemuan.get("materi", {}).get("istilah") or [{}])[0]
    if ist.get("t"):
        return f"Jawaban benar: “{opsi_kunci}”. Ingat kembali konsep {ist['t']}: {ist.get('a')}"
    return f"Jawaban benar: “{opsi_kunci}”. Bandingkan dengan tujuan pertemuan pada halaman ini."

def rubric(names, indikators, sumber="rumusan usulan"):
    """Membuat rubrik 4 tingkat. Setiap kriteria punya bobot; total bobot 100."""
    n = len(names)
    bobot = [round(100 / n) for _ in range(n)]
    bobot[-1] = 100 - sum(bobot[:-1])
    return [{
        "kriteria": names[i], "bobot": bobot[i], "indikator": indikators[i],
        "skor4": f"Sangat baik — {indikators[i]}, dikerjakan mandiri dan tuntas.",
        "skor3": f"Baik — {indikators[i]} tercapai dengan sedikit arahan.",
        "skor2": f"Cukup — {indikators[i]} tercapai sebagian, masih perlu bimbingan.",
        "skor1": f"Perlu bimbingan — {indikators[i]} belum tampak.",
        "catatan": sumber,
    } for i in range(n)]

def main():
    kur = {}
    for f in ("kurikulum-sem1.json", "kurikulum-sem2.json"):
        for w in json.load(open(os.path.join(DATA, f), encoding="utf-8"))["minggu"]:
            kur[w["minggu"]] = w
    modul = {}
    for f in ("modul-sem1.json", "modul-sem2.json"):
        for w in json.load(open(os.path.join(DATA, f), encoding="utf-8"))["minggu"]:
            modul[w["minggu"]] = w

    BOBOT = {"kuis": 15, "lkpd": 20, "formatif": 10, "praktik": 30, "proyek": 25}
    KKT_P = 75
    SUMATIF_BAB = {4, 7, 11, 15}
    SUMATIF_AKHIR = {18, 24, 30, 36}
    LIBUR_ASESMEN = "Asesmen sumatif mengikuti kalender sekolah (usulan: pekan asesmen minggu 18, 24, 30, 36)."

    out = []
    for n in sorted(kur):
        w = kur[n]
        for hari in ("senin", "rabu"):
            m = modul[n][hari]
            kode = f"A-{n:02d}-{hari[:1].upper()}"

            # ---------- 1. KUIS pilihan ganda (dinilai otomatis + pembahasan) ----------
            butir = []
            for b in m["asesmenFormatif"]["butir"]:
                opsi_kunci = b["opsi"][b["kunci"]]
                butir.append({
                    "soal": b["soal"], "opsi": b["opsi"], "kunci": b["kunci"],
                    "pembahasan": pilih_pembahasan(b["soal"], opsi_kunci, m),
                    "pembahasanSumber": "otomatis dari materi pertemuan (usulan ⧗ — periksa guru)",
                })
            out.append({
                "id": f"{kode}-KUIS", "minggu": n, "pertemuan": hari, "tipe": "kuis",
                "judul": f"Kuis pertemuan {hari.title()} minggu {n}",
                "deskripsi": "Pilihan ganda tiga opsi. Dinilai otomatis oleh server; pembahasan muncul setelah jawaban dikirim.",
                "bobot": BOBOT["kuis"], "nilaiOtomatis": True, "perluKonfirmasiGuru": False,
                "kktp": KKT_P, "kesempatanRevisi": 1, "jumlahButir": len(butir), "butir": butir,
                "kriteria": [{"nama": "Ketepatan jawaban", "bobot": 100, "indikator": f"Menjawab benar minimal {KKT_P}% butir"}],
                "rubrik": None,
                "remedial": "Mengulang materi pertemuan lalu mengerjakan ulang kuis (kesempatan revisi 1 kali).",
                "pengayaan": "Membuat 2 soal baru beserta kunci dan pembahasannya untuk bank soal kelas.",
                "sumber": ["materi pertemuan ini (modul)", "buku acuan semester terkait"],
            })

            # ---------- 2. LKPD (manual, rubrik dari modul) ----------
            r_lkpd = m["lkpd"]["rubrik"]
            n_l = len(r_lkpd)
            bobot_l = [round(100 / n_l) for _ in range(n_l)]
            bobot_l[-1] = 100 - sum(bobot_l[:-1])
            out.append({
                "id": f"{kode}-LKPD", "minggu": n, "pertemuan": hari, "tipe": "lkpd",
                "judul": m["lkpd"]["judul"],
                "deskripsi": "Lembar kerja digital: langkah dikerjakan, bukti belajar dikumpulkan, dinilai guru memakai rubrik.",
                "bobot": BOBOT["lkpd"], "nilaiOtomatis": False, "perluKonfirmasiGuru": True,
                "kktp": KKT_P, "kesempatanRevisi": 2,
                "langkah": m["lkpd"]["langkah"],
                "kriteria": [{"nama": r["kriteria"], "bobot": bobot_l[i], "indikator": r["skor3"]} for i, r in enumerate(r_lkpd)],
                "rubrik": [{"kriteria": r["kriteria"], "bobot": bobot_l[i], "indikator": r["skor3"],
                            "skor4": r["skor4"], "skor3": r["skor3"], "skor2": r["skor2"], "skor1": r["skor1"],
                            "catatan": "rumusan dari modul pertemuan"} for i, r in enumerate(r_lkpd)],
                "remedial": m["tindakLanjut"]["remedial"], "pengayaan": m["tindakLanjut"]["pengayaan"],
                "sumber": [f"LKPD {m['lkpd']['judul']}"],
            })

        # ---------- 3. ASESMEN FORMATIF mingguan (manual: observasi proses + refleksi) ----------
        af = w["asesmenFormatif"]
        out.append({
            "id": f"A-{n:02d}-FORMATIF", "minggu": n, "pertemuan": "minggu", "tipe": "formatif",
            "judul": f"Asesmen formatif minggu {n} — {af.get('cakupan') or w['tema']}",
            "deskripsi": f"Bentuk: {af.get('bentuk')}. Digunakan untuk memantau kemajuan selama pembelajaran (bukan penentu tunggal nilai).",
            "bobot": BOBOT["formatif"], "nilaiOtomatis": False, "perluKonfirmasiGuru": True,
            "kktp": 70, "kesempatanRevisi": 2,
            "kriteria": [
                {"nama": "Pemahaman konsep", "bobot": 40, "indikator": f"Menjelaskan {af.get('cakupan') or w['tema']}"},
                {"nama": "Partisipasi & kolaborasi", "bobot": 30, "indikator": "Ikut berpendapat, mendengar, dan bekerja sama"},
                {"nama": "Refleksi diri", "bobot": 30, "indikator": "Menuliskan kesulitan dan rencana perbaikan"},
            ],
            "rubrik": rubric(
                ["Pemahaman konsep", "Partisipasi & kolaborasi", "Refleksi diri"],
                ["menjelaskan konsep minggu ini dengan contoh sendiri", "aktif berpendapat dan bekerja sama di kelas", "menulis refleksi jujur beserta rencana perbaikan"]),
            "remedial": w.get("remedial"), "pengayaan": w.get("pengayaan"),
            "sumber": [f"asesmen formatif minggu {n} (kurikulum)"],
        })

        # ---------- 4. PRAKTIK mingguan (proses + keterampilan) ----------
        apl = " · ".join((modul[n]["senin"]["aktivitas"]["mengaplikasi"] + modul[n]["rabu"]["aktivitas"]["mengaplikasi"])[:3])
        out.append({
            "id": f"A-{n:02d}-PRAKTIK", "minggu": n, "pertemuan": "minggu", "tipe": "praktik",
            "judul": f"Penilaian praktik minggu {n} — {w['tema']}",
            "deskripsi": "Penilaian proses kerja (bukan hanya hasil akhir): persiapan, langkah kerja, keselamatan/ketertiban, dan kemandirian. Nilai diisi guru memakai rubrik — tidak ada nilai otomatis.",
            "bobot": BOBOT["praktik"], "nilaiOtomatis": False, "perluKonfirmasiGuru": True,
            "kktp": KKT_P, "kesempatanRevisi": 1,
            "bukti": apl,
            "kriteria": [
                {"nama": "Persiapan & alat/bahan", "bobot": 20, "indikator": "Menyiapkan alat, bahan, dan berkas kerja dengan lengkap"},
                {"nama": "Proses & langkah kerja", "bobot": 35, "indikator": "Mengikuti langkah kerja secara runtut dan rapi"},
                {"nama": "Keselamatan, ketertiban, kebersihan", "bobot": 20, "indikator": "Bekerja aman, tertib, dan merapikan tempat kerja"},
                {"nama": "Kemandirian & pemecahan masalah", "bobot": 25, "indikator": "Mencoba mandiri, bertanya pada waktu yang tepat, memperbaiki kesalahan"},
            ],
            "rubrik": rubric(
                ["Persiapan & alat/bahan", "Proses & langkah kerja", "Keselamatan, ketertiban, kebersihan", "Kemandirian & pemecahan masalah"],
                ["alat/bahan dan berkas disiapkan lengkap", "langkah kerja runtut sesuai panduan", "bekerja aman, tertib, dan merapikan tempat kerja", "mencoba mandiri dan memperbaiki kesalahan sendiri"]),
            "remedial": f"Mengulang langkah praktik yang belum tuntas bersama guru pendamping. {w.get('remedial') or ''}".strip(),
            "pengayaan": w.get("pengayaan"),
            "sumber": ["aktivitas mengaplikasi pertemuan Senin & Rabu"],
        })

        # ---------- 5. PROYEK mingguan (kreativitas + kualitas karya visual) ----------
        proyek = w.get("proyek")
        tugas_s = modul[n]["senin"]["tugas"]
        tugas_r = modul[n]["rabu"]["tugas"]
        luaran = proyek["luaran"] if proyek else f"{tugas_s['luaran']} dan {tugas_r['luaran']}"
        out.append({
            "id": f"A-{n:02d}-PROYEK", "minggu": n, "pertemuan": "minggu", "tipe": "proyek",
            "judul": proyek["judul"] if proyek else f"Karya minggu {n} — {w['tema']}",
            "deskripsi": "Penilaian karya/proyek: kreativitas, kesesuaian dengan brief, kualitas visual, dan kelengkapan tahap. Dinilai guru memakai rubrik; keputusan akhir ada pada guru.",
            "bobot": BOBOT["proyek"], "nilaiOtomatis": False, "perluKonfirmasiGuru": True,
            "kktp": KKT_P, "kesempatanRevisi": 2,
            "luaran": luaran,
            "kriteria": [
                {"nama": "Kesesuaian dengan brief/tujuan", "bobot": 25, "indikator": "Karya menjawab kebutuhan dan pesan yang diminta"},
                {"nama": "Kreativitas & orisinalitas ide", "bobot": 25, "indikator": "Ada gagasan sendiri yang dikembangkan, bukan meniru mentah"},
                {"nama": "Kualitas visual & keterbacaan", "bobot": 30, "indikator": "Tata letak, warna, huruf, dan gambar terbaca serta tertata"},
                {"nama": "Kelengkapan tahap & penyajian", "bobot": 20, "indikator": "Sketsa–proses–hasil akhir lengkap dan disajikan dengan penjelasan"},
            ],
            "rubrik": rubric(
                ["Kesesuaian dengan brief/tujuan", "Kreativitas & orisinalitas ide", "Kualitas visual & keterbacaan", "Kelengkapan tahap & penyajian"],
                ["karya sesuai brief, pesan tersampaikan", "gagasan dikembangkan sendiri dan beralasan", "tata letak, warna, huruf, dan gambar terbaca serta tertata", "tahap sketsa sampai hasil akhir lengkap dan dijelaskan"]),
            "remedial": f"Perbaikan karya sesuai catatan guru pada bagian yang belum tuntas. {w.get('remedial') or ''}".strip(),
            "pengayaan": f"{w.get('pengayaan') or 'Membuat variasi karya'}; menyiapkan karya untuk portofolio/pameran kelas.",
            "sumber": ["proyek/aktivitas minggu ini (kurikulum & modul)"],
        })

    # ---------- 6. ASESMEN SUMATIF (PG otomatis + bagian karya/uraian dinilai guru) ----------
    for n in sorted(SUMATIF_BAB | SUMATIF_AKHIR):
        akhir = n in SUMATIF_AKHIR
        rentang = range(max(1, n - 5), n + 1)
        kumpulan = [a for a in out if a["tipe"] == "kuis" and a["minggu"] in rentang]
        butir = []
        for a in kumpulan:
            butir.extend(a["butir"])
        butir = butir[:12] if len(butir) >= 8 else butir
        out.append({
            "id": f"A-{n:02d}-SUMATIF", "minggu": n, "pertemuan": "minggu", "tipe": "sumatif",
            "judul": ("Asesmen sumatif akhir semester" if akhir else "Uji kompetensi bab (EBAB)") + f" — setelah minggu {n}",
            "deskripsi": ("Gabungan pilihan ganda (dinilai otomatis, ada pembahasan) dan bagian karya/uraian yang dinilai guru memakai rubrik. "
                          + LIBUR_ASESMEN),
            "bobot": 40 if akhir else 35, "nilaiOtomatis": "sebagian", "perluKonfirmasiGuru": True,
            "kktp": 75, "kesempatanRevisi": 1,
            "jumlahButir": len(butir), "butir": butir,
            "kriteria": [
                {"nama": "Pilihan ganda (otomatis)", "bobot": 50, "indikator": "Ketepatan jawaban butir pilihan ganda"},
                {"nama": "Uraian/karya (dinilai guru)", "bobot": 50, "indikator": "Mutu jawaban uraian atau karya sesuai rubrik sumatif"},
            ],
            "rubrik": rubric(
                ["Uraian — ketepatan konsep", "Uraian — kelengkapan & alasan", "Karya — mutu visual & keterbacaan", "Karya — kesesuaian dengan tuntutan soal"],
                ["menjelaskan konsep dengan tepat", "jawaban lengkap dan beralasan", "karya tertata, terbaca, dan sesuai kaidah desain", "karya menjawab tuntutan soal/sumatif"]),
            "remedial": "Program remedial: mengulang butir yang salah, lalu mengerjakan asesmen setara pada pekan berikutnya.",
            "pengayaan": "Mengembangkan satu topik menjadi karya/materi ajar mini untuk teman sekelas.",
            "sumber": [f"materi minggu {max(1, n-5)}–{n}", "kalender asesmen sekolah"],
        })

    meta = {
        "judul": "Rencana asesmen 36 minggu — Dasar-Dasar DKV Kelas X",
        "jumlah": len(out),
        "jenis": {
            "kuis": "pilihan ganda, dinilai otomatis server + pembahasan",
            "lkpd": "lembar kerja digital, dinilai guru dengan rubrik",
            "formatif": "asesmen formatif mingguan (observasi proses & refleksi), dinilai guru",
            "praktik": "penilaian proses kerja/praktik, dinilai guru dengan rubrik",
            "proyek": "penilaian karya/proyek (kreativitas & kualitas visual), dinilai guru dengan rubrik",
            "sumatif": "uji kompetensi bab & sumatif akhir semester (PG otomatis + uraian/karya dinilai guru)",
        },
        "catatan": [
            "Bobot per jenis (kuis 15, lkpd 20, formatif 10, praktik 30, proyek 25; sumatif 35–40) adalah USULAN yang dapat disunting guru.",
            "KKTp usulan 70–75; sekolah dapat menyesuaikan.",
            "Nilai akhir minggu = rata-rata berbobot dari komponen yang SUDAH dinilai (bobot komponen yang belum dinilai tidak dihitung), sehingga siswa tidak dihukum karena asesmen yang belum dijalankan.",
            "Tidak ada nilai otomatis untuk aspek artistik/proses: nilai hanya keluar setelah guru memeriksa memakai rubrik dan menekan konfirmasi penilaian.",
        ],
    }
    out.sort(key=lambda a: (a["minggu"], {"senin": 0, "rabu": 1, "minggu": 2}[a["pertemuan"]], ["kuis", "lkpd", "formatif", "praktik", "proyek", "sumatif"].index(a["tipe"])))
    path = os.path.join(DATA, "asesmen-36m.json")
    json.dump({"meta": meta, "asesmen": out}, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    import collections
    c = collections.Counter(a["tipe"] for a in out)
    print(f"✓ {path} ({os.path.getsize(path)/1024:.1f} KB)")
    print("  komposisi:", dict(c), "total", len(out))
    print("  butir PG:", sum(len(a.get("butir") or []) for a in out), "| pembahasan kosong:",
          sum(1 for a in out for b in (a.get("butir") or []) if not b.get("pembahasan")))

if __name__ == "__main__":
    main()
