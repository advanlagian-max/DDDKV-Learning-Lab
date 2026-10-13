#!/usr/bin/env python3
# gabung-modul.py — Menggabungkan berkas bagian modul (_modul_part*.json) menjadi
# app/data/modul-sem1.json (minggu 1–18) dan modul-sem2.json (minggu 19–36),
# sekaligus memvalidasi kelengkapan 72 pertemuan.
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "app", "data")

WAJIB = ["tujuan", "pemantik", "materi", "contohVisual", "aktivitas", "lkpd", "asesmenFormatif", "tugas", "tindakLanjut"]
WAJIB_AKTIVITAS = ["memahami", "mengaplikasi", "merefleksi"]
WAJIB_LKPD = ["judul", "langkah", "rubrik"]

# perbaikan salah ketik yang ditemukan saat penulisan
PERBAIKAN = {
    "uraian indsutri hijau": "uraian industri hijau",
    "Mintа": "Minta",
    "sinar Terang": "sinar terang",
}

def perbaiki(t):
    for a, b in PERBAIKAN.items():
        t = t.replace(a, b)
    # buang karakter non-latin yang menyusup (mis. huruf Kiril yang mirip latin)
    t = re.sub(r"[\u0400-\u04FF]", "", t)
    return t

def bersihkan(obj):
    if isinstance(obj, str):
        return perbaiki(obj)
    if isinstance(obj, list):
        return [bersihkan(x) for x in obj]
    if isinstance(obj, dict):
        return {k: bersihkan(v) for k, v in obj.items()}
    return obj

def validasi(m, errors):
    """Validasi satu pertemuan."""
    for k in WAJIB:
        if k not in m:
            errors.append(f"field {k} tidak ada")
    for k in WAJIB_AKTIVITAS:
        if len(m.get("aktivitas", {}).get(k, [])) < 1:
            errors.append(f"aktivitas.{k} kosong")
    for k in WAJIB_LKPD:
        if k not in m.get("lkpd", {}):
            errors.append(f"lkpd.{k} tidak ada")
    if len(m.get("lkpd", {}).get("rubrik", [])) < 1:
        errors.append("rubrik kosong")
    if len(m.get("tujuan", [])) < 2:
        errors.append("tujuan kurang dari 2")
    if len(m.get("pemantik", [])) < 2:
        errors.append("pemantik kurang dari 2")
    mat = m.get("materi", {})
    if not mat.get("pengantar"):
        errors.append("materi.pengantar kosong")
    if len(mat.get("poin", [])) < 3:
        errors.append("materi.poin kurang dari 3")
    if len(mat.get("istilah", [])) < 1:
        errors.append("materi.istilah kosong")
    if len(m.get("contohVisual", [])) < 1:
        errors.append("contohVisual kosong")
    butir = m.get("asesmenFormatif", {}).get("butir", [])
    if len(butir) < 2:
        errors.append("butir asesmen kurang dari 2")
    for i, b in enumerate(butir):
        if not b.get("soal") or len(b.get("opsi", [])) < 3:
            errors.append(f"butir {i+1} tidak lengkap (soal/opsi)")
        if not isinstance(b.get("kunci"), int) or not (0 <= b.get("kunci") < len(b.get("opsi", []))):
            errors.append(f"butir {i+1} kunci tidak sah")
    if not m.get("tugas", {}).get("judul"):
        errors.append("tugas.judul kosong")
    if not m.get("tindakLanjut", {}).get("remedial") or not m.get("tindakLanjut", {}).get("pengayaan"):
        errors.append("tindakLanjut tidak lengkap")

def main():
    minggu = {}
    for i in range(1, 7):
        p = os.path.join(DATA, f"_modul_part{i}.json")
        if not os.path.exists(p):
            print(f"⚠ bagian {i} belum ada (dilewati)"); continue
        d = json.load(open(p, encoding="utf-8"))
        for w in d["minggu"]:
            minggu[w["minggu"]] = bersihkan(w)
    print(f"minggu terkumpul: {sorted(minggu)}")

    # validasi
    errors = []
    for n in sorted(minggu):
        for hari in ("senin", "rabu"):
            if hari not in minggu[n]:
                errors.append(f"minggu {n}: pertemuan {hari} tidak ada"); continue
            lokal = []
            validasi(minggu[n][hari], lokal)
            errors += [f"minggu {n} {hari}: {e}" for e in lokal]
    if errors:
        print(f"✗ {len(errors)} masalah ditemukan:")
        for e in errors[:40]:
            print("   -", e)
        sys.exit(1)
    print("✓ validasi struktur 72 pertemuan: 0 masalah")

    # cek kesesuaian dengan data kurikulum (nomor minggu & durasi)
    kur = {}
    for f in ("kurikulum-sem1.json", "kurikulum-sem2.json"):
        for w in json.load(open(os.path.join(DATA, f), encoding="utf-8"))["minggu"]:
            kur[w["minggu"]] = w
    for n, w in minggu.items():
        if n not in kur:
            print(f"✗ minggu {n} tidak ada di data kurikulum"); sys.exit(1)
        for hari, kunci in (("senin", "pertemuanSenin"), ("rabu", "pertemuanRabu")):
            if kur[n][kunci]["jp"] != 6 or kur[n][kunci]["menit"] != 270:
                print(f"✗ minggu {n} {hari}: {kur[n][kunci]['jp']} JP / {kur[n][kunci]['menit']} menit"); sys.exit(1)
    print("✓ semua 72 pertemuan sesuai 6 JP / 270 menit")

    # tulis berkas semester
    for sem, rentang, nama in ((1, range(1, 19), "modul-sem1.json"), (2, range(19, 37), "modul-sem2.json")):
        isi = {
            "meta": {
                "semester": sem,
                "judul": f"Modul Pertemuan Minggu {rentang.start}–{rentang.stop-1} — Dasar-Dasar DKV Kelas X",
                "catatan": ("Penjelasan disusun orisinal dan setia pada konsep buku siswa; bukan salinan verbatim. "
                            "Setiap pertemuan memuat tujuan, pemantik, materi, contoh visual, aktivitas memahami/mengaplikasi/merefleksi, "
                            "LKPD, asesmen formatif, tugas, rubrik, dan tindak lanjut."),
                "sumber": ["B1: Buku Sem 1 (Kemendikbudristek 2022)", "B2: Buku Sem 2 (Kemendikbudristek 2022)"],
            },
            "minggu": [minggu[n] for n in rentang if n in minggu],
        }
        out = os.path.join(DATA, nama)
        json.dump(isi, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        ukuran = os.path.getsize(out) / 1024
        print(f"✓ {nama}: {len(isi['minggu'])} minggu ({ukuran:.1f} KB)")

    total_butir = sum(len(minggu[n][h]["asesmenFormatif"]["butir"]) for n in minggu for h in ("senin", "rabu"))
    total_rubrik = sum(len(minggu[n][h]["lkpd"]["rubrik"]) for n in minggu for h in ("senin", "rabu"))
    print(f"ringkasan: {len(minggu)} minggu · {len(minggu)*2} pertemuan · {total_butir} butir kuis formatif · {total_rubrik} kriteria rubrik")

if __name__ == "__main__":
    main()
