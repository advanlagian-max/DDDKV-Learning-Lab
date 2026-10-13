// labs.tsx — Kerangka laboratorium simulasi (petunjuk, tantangan bertingkat, umpan balik, reset, refleksi)
// + 4 laboratorium inti: Tipografi, Fotografi, Bitmap & Vektor, Alur Produksi.
import React, { useMemo, useState } from "react";
import { Card, Btn, Badge, Field, inputCls, cx, api, useAuth } from "./lib";

export type Kriteria = { teks: string; lulus: boolean };
export type UmpanBalik = { ok: boolean; t: string };

export type LabMeta = {
  id: string;
  judul: string;
  icon: string;
  ringkas: string;
  petunjuk: string[];
  disclaimer: string;
  rujukan: string;
  minggu: number;
  tingkat: { judul: string; misi: string }[];
};

/* ==================== Kerangka bersama ==================== */
export function LabShell({ meta, tingkat, setTingkat, kriteria, umpanBalik, children, onReset, rincian }: {
  meta: LabMeta;
  tingkat: number;
  setTingkat: (n: number) => void;
  kriteria: Kriteria[];
  umpanBalik: UmpanBalik[];
  children: React.ReactNode;
  onReset: () => void;
  rincian?: any;
}) {
  const { user } = useAuth();
  const [pesan, setPesan] = useState("");
  const [bukaPetunjuk, setBukaPetunjuk] = useState(true);
  const [refleksi, setRefleksi] = useState("");
  const lulus = kriteria.filter(k => k.lulus).length;
  const tuntas = kriteria.length > 0 && lulus === kriteria.length;
  const isSiswa = user?.role === "siswa";

  const kumpul = async () => {
    try {
      await api("/api/simulasi/hasil", {
        method: "POST",
        body: { sim_id: meta.id, tingkat, skor: lulus, maks: kriteria.length, rincian: rincian ?? null },
      });
      setPesan(`Hasil tingkat ${tingkat} disimpan (${lulus}/${kriteria.length}). Guru dapat melihatnya di menu Penilaian → Hasil laboratorium.`);
    } catch (e: any) {
      setPesan(`Belum tersimpan: ${e.message}`);
    }
  };
  const kirimRefleksi = async () => {
    if (!refleksi.trim()) return setPesan("Tulis refleksi terlebih dahulu.");
    try {
      await api("/api/refleksi", { method: "POST", body: { week_nomor: meta.minggu, isi: `[Lab ${meta.judul}] ${refleksi}` } });
      setRefleksi("");
      setPesan("Refleksi tersimpan dan dapat dibaca guru.");
    } catch (e: any) {
      setPesan(`Refleksi belum tersimpan: ${e.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-800">📋 Petunjuk penggunaan</h3>
            <p className="mt-1 text-sm text-slate-600">{meta.ringkas}</p>
          </div>
          <div className="flex gap-2">
            <Badge tone="violet">model simulasi</Badge>
            <Btn variant="ghost" onClick={() => setBukaPetunjuk(!bukaPetunjuk)}>{bukaPetunjuk ? "Sembunyikan" : "Tampilkan"} petunjuk</Btn>
          </div>
        </div>
        {bukaPetunjuk && (
          <>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {meta.petunjuk.map((p, i) => <li key={i}>{p}</li>)}
            </ol>
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <b>Yang dimodelkan:</b> {meta.disclaimer}
            </div>
            <div className="mt-2 text-xs text-slate-500">Rujukan materi: {meta.rujukan}</div>
          </>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-800">🎯 Tantangan bertingkat</h3>
          <Badge tone={tuntas ? "green" : "slate"}>kriteria terpenuhi {lulus}/{kriteria.length}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.tingkat.map((t, i) => (
            <button key={i} onClick={() => setTingkat(i + 1)}
              className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", tingkat === i + 1 ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700 hover:border-blue-400")}>
              Tingkat {i + 1} · {t.judul}
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <b>Misi tingkat {tingkat}:</b> {meta.tingkat[tingkat - 1]?.misi}
        </p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {kriteria.map((k, i) => (
            <li key={i} className={cx("flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm", k.lulus ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700")}>
              <span>{k.lulus ? "✅" : "⬜"}</span><span>{k.teks}</span>
            </li>
          ))}
        </ul>
      </Card>

      {children}

      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">💬 Umpan balik & tindakan</h3>
        <ul className="mt-3 space-y-1.5 text-sm">
          {umpanBalik.map((f, i) => (
            <li key={i} className={f.ok ? "text-emerald-700" : "text-amber-800"}>{f.ok ? "✅" : "⚠️"} {f.t}</li>
          ))}
          {umpanBalik.length === 0 && <li className="text-slate-500">Ubah pengaturan atau jawab tantangan untuk menerima umpan balik.</li>}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn variant="ghost" onClick={() => { onReset(); setPesan("Semua pengaturan dan jawaban dikembalikan ke keadaan awal."); }}>↺ Atur ulang</Btn>
          {isSiswa && <Btn onClick={kumpul} disabled={kriteria.length === 0}>📤 Kumpulkan hasil tingkat {tingkat}</Btn>}
        </div>
        {pesan && <div className="mt-2 text-sm text-slate-700">{pesan}</div>}
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">🪞 Refleksi laboratorium</h3>
        <div className="mt-2 text-xs text-slate-500">Tulis temuanmu setelah mencoba: pengaturan/jawaban apa yang berhasil, apa yang perlu diperbaiki, dan mengapa.</div>
        <Field label="Refleksi">
          <textarea className={cx(inputCls, "mt-2 h-20")} value={refleksi} onChange={e => setRefleksi(e.target.value)}
            placeholder="Contoh: ukuran isi 12 px dengan leading 1.5 paling nyaman dibaca karena…" />
        </Field>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isSiswa
            ? <Btn variant="ghost" onClick={kirimRefleksi}>Kirim refleksi ke guru</Btn>
            : <span className="text-xs text-slate-500">Mode guru: refleksi diisi siswa dan terbaca di menu Penilaian → Refleksi.</span>}
        </div>
      </Card>
    </div>
  );
}

/* ==================== 1. Tipografi ==================== */
const FONTS = [
  { v: "Georgia, serif", label: "Georgia — serif (seperti Oldstyle)" },
  { v: "'Times New Roman', serif", label: "Times New Roman — serif (seperti Modern)" },
  { v: "Arial, sans-serif", label: "Arial — sans serif (tanpa kait)" },
  { v: "Verdana, sans-serif", label: "Verdana — sans serif lebar" },
  { v: "'Courier New', monospace", label: "Courier New — mono/slab" },
  { v: "cursive", label: "Cursive — script (huruf tulis)" },
];
const KONTRAS = [
  { v: "gelap-terang", label: "Teks gelap di latar terang", bg: "#ffffff", fg: "#0f172a", rasio: 15.2, lulus: true },
  { v: "terang-gelap", label: "Teks terang di latar biru tua", bg: "#0b2a5b", fg: "#ffffff", rasio: 12.4, lulus: true },
  { v: "lemah", label: "Teks kuning di latar putih (kontras lemah)", bg: "#ffffff", fg: "#facc15", rasio: 1.6, lulus: false },
];

export const META_TIPOGRAFI: LabMeta = {
  id: "sim-tipografi", judul: "Laboratorium Tipografi", icon: "🔤",
  ringkas: "Atur jenis huruf, ukuran, perataan, jarak huruf (kerning & tracking), jarak baris (leading), serta hierarki; amati pengaruhnya pada keterbacaan poster mini.",
  petunjuk: [
    "Ubah satu pengaturan sekaligus, lalu bandingkan pratinjau sebelum dan sesudahnya.",
    "Perhatikan angka “panjang baris (karakter/baris)” — 45–75 karakter paling nyaman dibaca.",
    "Uji juga pratinjau pasangan huruf (kerning) untuk melihat jarak antarpasangan seperti AV atau To.",
    "Kerjakan tantangan tingkat 1 → 3 secara berurutan, lalu tulis refleksimu.",
  ],
  disclaimer: "Pratinjau memakai huruf bawaan peramban dan perhitungan ukuran sederhana. Ini model edukatif tentang aturan keterbacaan — bukan mesin tata letak seperti perangkat lunak desain profesional.",
  rujukan: "Buku Semester 2, Bab 1 Tipografi (klasifikasi huruf, legibility/readability/visibility, kerning–tracking–leading, hierarki).",
  minggu: 19,
  tingkat: [
    { judul: "Huruf & jarak", misi: "Atur teks isi agar nyaman dibaca: ukuran isi 10–14 px, leading 1,3–1,6, tracking antara −1 dan +1." },
    { judul: "Hierarki", misi: "Susun hierarki yang jelas: judul minimal 1,6× ukuran isi, subjudul di antaranya, dan paling banyak 3 ukuran berbeda. Perataan isi harus konsisten (hindari justify untuk teks pendek)." },
    { judul: "Brief poster", misi: "Penuhi seluruh kaidah tingkat 1–2 sekaligus, tambahkan panjang baris 45–75 karakter, kontras memadai, dan jenis huruf isi yang mudah dibaca." },
  ],
};

export function TypografiLab({ onResetLab }: { onResetLab: () => void }) {
  const [tingkat, setTingkat] = useState(1);
  const [judul, setJudul] = useState("DAUR ULANG KERTAS");
  const [sub, setSub] = useState("Gerakan kelas bersih SMKN 3 Kuningan");
  const [isi, setIsi] = useState("Satu lembar kertas yang dipakai ulang berarti satu langkah kecil menjaga lingkungan sekolah. Mari mulai dari kelas kita sendiri, setiap hari, tanpa menunggu siapa pun.");
  const [fontJudul, setFontJudul] = useState(FONTS[2].v);
  const [fontIsi, setFontIsi] = useState(FONTS[2].v);
  const [sizeJudul, setSizeJudul] = useState(40);
  const [sizeSub, setSizeSub] = useState(20);
  const [sizeIsi, setSizeIsi] = useState(14);
  const [align, setAlign] = useState("left");
  const [leading, setLeading] = useState(1.4);
  const [tracking, setTracking] = useState(0);
  const [kerning, setKerning] = useState(0);
  const [kontras, setKontras] = useState(KONTRAS[0].v);

  const k = KONTRAS.find(x => x.v === kontras)!;
  const lebarKolom = 460;
  const faktor = fontIsi.includes("Courier") ? 0.6 : fontIsi.includes("Georgia") || fontIsi.includes("Times") ? 0.5 : 0.52;
  const karakterPerBaris = Math.round(lebarKolom / (sizeIsi * faktor));
  const ukuranUnik = new Set([sizeJudul, sizeSub, sizeIsi]).size;
  const justify = align === "justify";

  const cekIsi = sizeIsi >= 10 && sizeIsi <= 14;
  const cekLeading = leading >= 1.3 && leading <= 1.6;
  const cekTracking = Math.abs(tracking) <= 1;
  const cekHierarki = sizeJudul >= 1.6 * sizeIsi;
  const cekSub = sizeSub > sizeIsi && sizeSub < sizeJudul;
  const cekUkuranUnik = ukuranUnik <= 3;
  const cekAlign = !justify || isi.length > 220;
  const cekBaris = karakterPerBaris >= 45 && karakterPerBaris <= 75;
  const cekFontIsi = !fontIsi.includes("cursive");
  const cekKerning = kerning >= -2;

  const kriteria = tingkat === 1
    ? [{ teks: "Ukuran isi 10–14 px", lulus: cekIsi }, { teks: "Leading 1,3–1,6", lulus: cekLeading }, { teks: "Tracking −1…+1", lulus: cekTracking }]
    : tingkat === 2
      ? [{ teks: "Judul ≥ 1,6× ukuran isi", lulus: cekHierarki }, { teks: "Subjudul di antara isi & judul", lulus: cekSub },
         { teks: "Maksimal 3 ukuran huruf berbeda", lulus: cekUkuranUnik }, { teks: "Perataan konsisten (bukan justify teks pendek)", lulus: cekAlign }]
      : [{ teks: "Tingkat 1 terpenuhi (ukuran, leading, tracking)", lulus: cekIsi && cekLeading && cekTracking },
         { teks: "Hierarki jelas (judul ≥1,6× isi, subjudul di antara, maks 3 ukuran)", lulus: cekHierarki && cekSub && cekUkuranUnik },
         { teks: "Panjang baris 45–75 karakter", lulus: cekBaris },
         { teks: "Kontras teks–latar memadai", lulus: k.lulus },
         { teks: "Huruf isi mudah dibaca (bukan script/mono panjang)", lulus: cekFontIsi }];

  const umpanBalik: UmpanBalik[] = [
    { ok: cekIsi, t: cekIsi ? "Ukuran isi nyaman untuk teks paragraf." : "Ukuran isi di luar rentang nyaman (10–14 px)." },
    { ok: cekLeading, t: cekLeading ? "Jarak antarbaris seimbang." : leading < 1.3 ? "Leading terlalu rapat; baris tampak menempel." : "Leading terlalu longgar; paragraf terasa terputus." },
    { ok: cekTracking, t: cekTracking ? "Tracking proporsional." : "Tracking ekstrem menyulitkan pengenalan huruf." },
    { ok: cekHierarki && cekSub, t: cekHierarki ? "Hierarki ukuran terbaca: judul menonjol." : "Judul belum cukup menonjol dibanding teks isi." },
    { ok: cekBaris, t: `Panjang baris saat ini ± ${karakterPerBaris} karakter (patokan nyaman 45–75).` },
    { ok: k.lulus, t: k.lulus ? `Kontras memadai (perkiraan rasio ${k.rasio}:1).` : "Kontras lemah — teks akan sulit dibaca, terutama saat dicetak." },
    { ok: cekKerning, t: cekKerning ? "Pasangan huruf tidak bertabrakan." : "Kerning sangat negatif membuat pasangan huruf bertabrakan." },
  ];

  return (
    <LabShell meta={META_TIPOGRAFI} tingkat={tingkat} setTingkat={setTingkat} kriteria={kriteria} umpanBalik={umpanBalik}
      onReset={onResetLab} rincian={{ sizeIsi, leading, tracking, fontIsi, align }}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card className="space-y-3 p-5">
          <h3 className="font-semibold text-slate-800">🎛️ Panel pengaturan</h3>
          <Field label="Judul"><input className={inputCls} value={judul} onChange={e => setJudul(e.target.value)} /></Field>
          <Field label="Subjudul"><input className={inputCls} value={sub} onChange={e => setSub(e.target.value)} /></Field>
          <Field label="Teks isi"><textarea className={cx(inputCls, "h-20")} value={isi} onChange={e => setIsi(e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Jenis huruf judul"><select className={inputCls} value={fontJudul} onChange={e => setFontJudul(e.target.value)}>{FONTS.map(f => <option key={f.v} value={f.v}>{f.label}</option>)}</select></Field>
            <Field label="Jenis huruf isi"><select className={inputCls} value={fontIsi} onChange={e => setFontIsi(e.target.value)}>{FONTS.map(f => <option key={f.v} value={f.v}>{f.label}</option>)}</select></Field>
          </div>
          <div><label className="text-xs font-medium text-slate-600">Ukuran judul: {sizeJudul} px</label><input type="range" min={18} max={72} value={sizeJudul} onChange={e => setSizeJudul(+e.target.value)} className="w-full" /></div>
          <div><label className="text-xs font-medium text-slate-600">Ukuran subjudul: {sizeSub} px</label><input type="range" min={10} max={40} value={sizeSub} onChange={e => setSizeSub(+e.target.value)} className="w-full" /></div>
          <div><label className="text-xs font-medium text-slate-600">Ukuran isi: {sizeIsi} px</label><input type="range" min={8} max={22} value={sizeIsi} onChange={e => setSizeIsi(+e.target.value)} className="w-full" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Perataan isi">
              <select className={inputCls} value={align} onChange={e => setAlign(e.target.value)}>
                <option value="left">Rata kiri (perataan kiri)</option>
                <option value="center">Rata tengah</option>
                <option value="right">Rata kanan</option>
                <option value="justify">Rata kiri-kanan (justify)</option>
              </select>
            </Field>
            <Field label="Kontras teks–latar"><select className={inputCls} value={kontras} onChange={e => setKontras(e.target.value)}>{KONTRAS.map(c => <option key={c.v} value={c.v}>{c.label}</option>)}</select></Field>
          </div>
          <div><label className="text-xs font-medium text-slate-600">Leading (jarak baris): {leading.toFixed(2)}</label><input type="range" min={0.9} max={2.4} step={0.05} value={leading} onChange={e => setLeading(+e.target.value)} className="w-full" /></div>
          <div><label className="text-xs font-medium text-slate-600">Tracking (jarak seluruh huruf): {tracking} px</label><input type="range" min={-3} max={8} step={0.5} value={tracking} onChange={e => setTracking(+e.target.value)} className="w-full" /></div>
          <div><label className="text-xs font-medium text-slate-600">Kerning (pasangan huruf): {kerning} px</label><input type="range" min={-5} max={6} step={0.5} value={kerning} onChange={e => setKerning(+e.target.value)} className="w-full" /></div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Pratinjau poster mini</div>
              <Badge tone="slate">{fontIsi.includes("serif") ? "serif" : fontIsi.includes("Courier") ? "mono/slab" : "sans serif"}</Badge>
            </div>
            <div className="rounded-xl border border-slate-200 p-5" style={{ background: k.bg }}>
              <div style={{ fontFamily: fontJudul, fontSize: sizeJudul, letterSpacing: tracking, color: k.fg, lineHeight: 1.1 }}>{judul || "Judul…"}</div>
              <div className="mt-2" style={{ fontFamily: fontJudul, fontSize: sizeSub, letterSpacing: tracking, color: k.fg, lineHeight: 1.3 }}>{sub || "Subjudul…"}</div>
              <div className="mt-3" style={{ fontFamily: fontIsi, fontSize: sizeIsi, letterSpacing: tracking, lineHeight: leading, color: k.fg, textAlign: align as any }}>
                {isi || "Tulis teks isi…"}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 px-2 py-1.5">karakter/baris: <b>{karakterPerBaris}</b></div>
              <div className="rounded-lg bg-slate-50 px-2 py-1.5">ukuran berbeda: <b>{ukuranUnik}</b></div>
              <div className="rounded-lg bg-slate-50 px-2 py-1.5">rasio kontras: <b>{k.rasio}:1</b></div>
              <div className="rounded-lg bg-slate-50 px-2 py-1.5">judul/isi: <b>{(sizeJudul / sizeIsi).toFixed(2)}×</b></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Uji pasangan huruf (kerning)</div>
            <div className="mt-2 flex flex-wrap items-end gap-6 rounded-xl bg-slate-50 p-4">
              {["AV", "To", "WA"].map(p => (
                <div key={p} className="text-center">
                  <div style={{ fontFamily: fontJudul, fontSize: 44, letterSpacing: kerning, color: "#0f172a" }}>{p}</div>
                  <div className="text-[10px] text-slate-500">jarak {kerning} px</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </LabShell>
  );
}

/* ==================== 2. Fotografi ==================== */
const APERTURE = [1.8, 2.2, 2.8, 4, 5.6, 8, 11, 16];
const SHUTTER = [1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2];
const SHUTTER_LABEL = ["1/1000", "1/500", "1/250", "1/125", "1/60", "1/30", "1/15", "1/8", "1/4", "1/2"];
const ISO = [100, 200, 400, 800, 1600, 3200, 6400];
const SCENE = [
  { id: "potret", judul: "Potret diam", icon: "🧑", cahaya: 1.0, minShutter: 1 / 60, minShutterLabel: "1/60", aim: "f/2.8 atau lebih kecil untuk latar blur, ISO ≤ 800" },
  { id: "atlet", judul: "Atlet bergerak", icon: "🏃", cahaya: 1.0, minShutter: 1 / 500, minShutterLabel: "1/500", aim: "bekukan gerakan (≥1/500) dan jaga latar tetap terbaca" },
  { id: "konser", judul: "Panggung gelap", icon: "🎤", cahaya: 0.18, minShutter: 1 / 125, minShutterLabel: "1/125", aim: "naikkan ISO secukupnya (≤3200) tanpa terlalu banyak noise" },
];

export const META_FOTOGRAFI: LabMeta = {
  id: "sim-fotografi", judul: "Laboratorium Fotografi (Segitiga Eksposur)", icon: "📷",
  ringkas: "Ubah aperture, shutter speed, dan ISO; lihat pengaruhnya pada kecerahan, gerakan, ketajaman latar, dan noise.",
  petunjuk: [
    "Pilih tingkat = jenis pemotretan, lalu atur tiga pengaturan sampai kriterianya terpenuhi.",
    "Setiap pengaturan yang dinaikkan menuntut kompensasi pada pengaturan lain — inilah segitiga eksposur.",
    "Amati panel: kecerahan (%), gerakan (blur), kedalaman ruang (latar blur), dan noise.",
    "Catat kombinasi terbaik tiap tingkat untuk dibandingkan di kelas.",
  ],
  disclaimer: "Kecerahan, blur gerakan, latar blur, dan noise dihitung dengan rumus sederhana sebagai model edukatif. Hasil tidak sama dengan foto dari kamera sungguhan — tidak ada sensor, lensa, maupun mesin pencahayaan nyata di sini.",
  rujukan: "Buku Semester 2, Bab 2 Fotografi (segitiga exposure: aperture, shutter speed, ISO; pencahayaan).",
  minggu: 25,
  tingkat: [
    { judul: "Potret", misi: "Buat potret dengan eksposur seimbang, subjek tajam (≥1/60), dan ISO ≤ 800 agar noise rendah." },
    { judul: "Bekukan gerakan", misi: "Ambil atlet yang berlari: eksposur seimbang dan kecepatan rana minimal 1/500 agar subjek beku." },
    { judul: "Cahaya minim", misi: "Foto di panggung gelap: eksposur seimbang, rana ≥1/125, dan ISO tidak lebih dari 3200." },
  ],
};

export function FotografiLab({ onResetLab }: { onResetLab: () => void }) {
  const [tingkat, setTingkat] = useState(1);
  const [idxF, setIdxF] = useState(4);
  const [idxS, setIdxS] = useState(3);
  const [idxIso, setIdxIso] = useState(2);

  const sc = SCENE[tingkat - 1];
  const f = APERTURE[idxF], s = SHUTTER[idxS], iso = ISO[idxIso];
  // model sederhana: cahaya masuk relatif terhadap acuan f/5.6 · 1/125 s · ISO 400 pada cahaya normal
  const masuk = (s / (f * f)) * (iso / 400) * 3920;
  const kecerahan = masuk * sc.cahaya;
  const persen = Math.max(4, Math.min(100, kecerahan * 50));
  const evOffset = Math.log2(Math.max(0.02, kecerahan));
  const blur = s >= sc.minShutter ? (s >= sc.minShutter * 4 ? 5 : 2.6) : 0;
  const latarBlur = f <= 2.8 ? 7 : f <= 4 ? 4 : f <= 5.6 ? 1.5 : 0;
  const noise = iso >= 6400 ? 0.5 : iso >= 3200 ? 0.34 : iso >= 1600 ? 0.22 : iso >= 800 ? 0.12 : 0.03;

  const cekEksposur = Math.abs(evOffset) <= 0.5;
  const cekGerak = blur === 0;
  const cekIso = iso <= (tingkat === 1 ? 800 : 3200);
  const cekLatar = tingkat === 1 ? f <= 4 : true;
  const cekNoise = noise <= 0.34;

  const kriteria = [
    { teks: "Eksposur seimbang (selisih ≤ 0,5 tingkat)", lulus: cekEksposur },
    { teks: `Subjek tidak blur (rana ≥ ${sc.minShutterLabel})`, lulus: cekGerak },
    { teks: tingkat === 1 ? "ISO ≤ 800 (noise rendah)" : "ISO ≤ 3200 (noise masih terkendali)", lulus: cekIso },
    tingkat === 1
      ? { teks: "Latar belakang lembut (f ≤ 4)", lulus: cekLatar }
      : { teks: "Pengaturan masih wajar (kombinasi tidak ekstrem)", lulus: cekNoise },
  ];

  const umpanBalik: UmpanBalik[] = [
    { ok: cekEksposur, t: cekEksposur ? "Eksposur seimbang." : kecerahan < 1 ? "Gambar gelap (underexposed): perbesar bukaan (f lebih kecil), perlambat rana, atau naikkan ISO." : "Gambar terang berlebih (overexposed): kecilkan bukaan (f lebih besar), percepat rana, atau turunkan ISO." },
    { ok: cekGerak, t: cekGerak ? "Gerakan subjek terekam tajam." : `Subjek blur — rana ${SHUTTER_LABEL[idxS]} lebih lambat dari batas ${sc.minShutterLabel} untuk pemotretan ini.` },
    { ok: cekIso, t: cekIso ? `ISO ${iso} masih terkendali.` : `ISO ${iso} menimbulkan noise/bintik yang tampak pada gambar.` },
    { ok: latarBlur <= 4, t: f <= 2.8 ? "f/" + f + ": kedalaman ruang dangkal — latar sangat lembut (cocok potret)." : f >= 11 ? "f/" + f + ": kedalaman ruang dalam — latar tajam (cocok lanskap/still life)." : "f/" + f + ": kedalaman ruang sedang." },
  ];

  return (
    <LabShell meta={META_FOTOGRAFI} tingkat={tingkat} setTingkat={setTingkat} kriteria={kriteria} umpanBalik={umpanBalik}
      onReset={onResetLab} rincian={{ f, shutter: SHUTTER_LABEL[idxS], iso, scene: sc.id }}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h3 className="font-semibold text-slate-800">🎛️ Segitiga eksposur</h3>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            Adegan: <b>{sc.icon} {sc.judul}</b> · sasaran: {sc.aim}
          </div>
          <div><label className="text-xs font-medium text-slate-600">Aperture (diafragma): f/{f}</label>
            <input type="range" min={0} max={APERTURE.length - 1} value={idxF} onChange={e => setIdxF(+e.target.value)} className="w-full" />
            <div className="flex justify-between text-[10px] text-slate-400"><span>f/1.8 (bukaan lebar)</span><span>f/16 (bukaan kecil)</span></div>
          </div>
          <div><label className="text-xs font-medium text-slate-600">Shutter speed (kecepatan rana): {SHUTTER_LABEL[idxS]} s</label>
            <input type="range" min={0} max={SHUTTER.length - 1} value={idxS} onChange={e => setIdxS(+e.target.value)} className="w-full" />
            <div className="flex justify-between text-[10px] text-slate-400"><span>cepat → beku</span><span>lambat → blur</span></div>
          </div>
          <div><label className="text-xs font-medium text-slate-600">ISO: {iso}</label>
            <input type="range" min={0} max={ISO.length - 1} value={idxIso} onChange={e => setIdxIso(+e.target.value)} className="w-full" />
            <div className="flex justify-between text-[10px] text-slate-400"><span>ISO 100 (halus)</span><span>ISO 6400 (noise)</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="rounded-lg bg-slate-50 px-2 py-1.5">selisih eksposur: <b>{evOffset >= 0 ? "+" : ""}{evOffset.toFixed(1)} tingkat</b></div>
            <div className="rounded-lg bg-slate-50 px-2 py-1.5">kecerahan model: <b>{persen.toFixed(0)}%</b></div>
            <div className="rounded-lg bg-slate-50 px-2 py-1.5">gerakan: <b>{blur === 0 ? "beku" : blur > 3 ? "sangat blur" : "agak blur"}</b></div>
            <div className="rounded-lg bg-slate-50 px-2 py-1.5">latar: <b>{latarBlur >= 7 ? "sangat lembut" : latarBlur >= 4 ? "lembut" : latarBlur > 0 ? "agak lembut" : "tajam"}</b></div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Pratinjau hasil pemotretan (model)</div>
          <div className="relative grid h-64 place-items-center overflow-hidden rounded-xl"
            style={{ background: `hsl(210 22% ${Math.max(4, Math.min(96, 8 + persen * 0.78))}%)` }}>
            {/* latar belakang: pepohonan/lampu yang ikut blur sesuai aperture */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-around" style={{ filter: `blur(${latarBlur}px)`, opacity: 0.55 }}>
              {[0, 1, 2, 3, 4].map(i => <div key={i} className="rounded-t-full bg-emerald-900" style={{ width: 34, height: 60 + (i % 3) * 22 }} />)}
            </div>
            {tingkat === 3 && <div className="absolute top-3 left-6 h-10 w-10 rounded-full bg-yellow-200/80" style={{ filter: `blur(${latarBlur}px)` }} />}
            {/* subjek */}
            <div className="relative z-10 text-6xl" style={{
              filter: `blur(${blur}px)`,
              transform: tingkat === 1 ? "translateY(6px)" : "translateX(6px)",
            }}>{sc.icon}</div>
            {noise > 0.05 && (
              <div className="absolute inset-0" style={{
                opacity: noise,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,.85) 1px, transparent 1px), radial-gradient(circle, rgba(0,0,0,.55) 1px, transparent 1px)",
                backgroundSize: "5px 5px, 7px 7px", backgroundPosition: "0 0, 3px 3px",
              }} />
            )}
            <div className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-0.5 text-[10px] text-white">f/{f} · {SHUTTER_LABEL[idxS]}s · ISO {iso}</div>
            {blur > 2 && <div className="absolute bottom-2 right-2 rounded bg-rose-600/85 px-2 py-0.5 text-[10px] text-white">subjek bergerak — rana terlalu lambat</div>}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Model kecerahan memakai acuan f/5.6 · 1/125 s · ISO 400 pada cahaya normal, lalu diterapkan pada adegan terpilih.
            Blur, latar blur, dan noise dihitung dari selisih pengaturan — bukan hasil pantulan cahaya pada sensor.
          </p>
        </Card>
      </div>
    </LabShell>
  );
}

/* ==================== 3. Bitmap vs Vektor ==================== */
const KELUARAN = [
  { id: "kartu", label: "Kartu nama 9 × 5,5 cm", kebutuhanVektor: true },
  { id: "poster", label: "Poster A3 (42 × 29,7 cm)", kebutuhanVektor: false },
  { id: "spanduk", label: "Spanduk 4 × 6 meter", kebutuhanVektor: true },
  { id: "web", label: "Gambar untuk layar web", kebutuhanVektor: false },
];
const JENIS = [
  { id: "logo", label: "Logo & ikon (bentuk sederhana)", vektor: true },
  { id: "foto", label: "Foto produk (rincian nyata)", vektor: false },
];
const ALASAN_BENAR = [
  "vektor-tajam", "bitmap-rinci", "bitmap-berat",
];
const ALASAN = [
  { id: "vektor-tajam", teks: "Gambar vektor tetap tajam meski diperbesar berapa pun.", benar: true },
  { id: "bitmap-rinci", teks: "Foto perlu bitmap karena menyimpan rincian cahaya yang nyata.", benar: true },
  { id: "bitmap-berat", teks: "Ukuran berkas bitmap bertambah mengikuti jumlah piksel, sehingga berat untuk ukuran cetak raksasa.", benar: true },
  { id: "bitmap-logo", teks: "Bitmap lebih cocok untuk logo karena filenya kecil.", benar: false },
  { id: "vektor-kamera", teks: "Kamera menghasilkan gambar vektor.", benar: false },
];

export const META_BITMAPVEKTOR: LabMeta = {
  id: "sim-bitmap-vektor", judul: "Laboratorium Bitmap & Vektor", icon: "🖼️",
  ringkas: "Perbesar gambar bitmap dan vektor, bandingkan ketajamannya, lalu pilih format yang tepat untuk kebutuhan keluaran nyata.",
  petunjuk: [
    "Geser perbesaran dari 100% sampai 1600% dan amati dua panel: bitmap (piksel) dan vektor (bentuk).",
    "Perhatikan angka “kebutuhan piksel” untuk ukuran cetak — itulah alasan vektor dipakai untuk spanduk besar.",
    "Pada tingkat 2 dan 3, tentukan jenis gambar dan keluaran, lalu pilih rekomendasi beserta alasannya.",
    "Uji juga karya gabungan: foto bitmap dengan tulisan vektor di atasnya.",
  ],
  disclaimer: "Panel bitmap memakai kotak 16×16 piksel sebagai contoh; perhitungan kualitas dan kebutuhan piksel adalah model edukatif (bukan mesin render gambar atau perangkat lunak vektor sungguhan).",
  rujukan: "Buku Semester 2, Bab 3 Komputer Grafis (bitmap vs vektor, resolusi, perangkat lunak grafis).",
  minggu: 10,
  tingkat: [
    { judul: "Amati perbesaran", misi: "Naikkan perbesaran hingga ≥800% dan buktikan kualitas bitmap menurun sementara vektor tetap tajam." },
    { judul: "Pilih jenis & keluaran", misi: "Tentukan jenis karya dan ukuran keluaran, lalu pilih jenis grafis yang tepat agar hasil tidak pecah/berat." },
    { judul: "Alasan teknis", misi: "Pilih tepat tiga alasan teknis yang benar tentang bitmap dan vektor pada kebutuhan cetak besar." },
  ],
};

export function BitmapVektorLab({ onResetLab }: { onResetLab: () => void }) {
  const [tingkat, setTingkat] = useState(1);
  const [zoom, setZoom] = useState(200);
  const [karya, setKarya] = useState("logo");
  const [keluaran, setKeluaran] = useState("kartu");
  const [rekom, setRekom] = useState("");
  const [alasan, setAlasan] = useState<string[]>([]);
  const [gabungan, setGabungan] = useState(true);

  const base = 16;
  const kualitasBitmap = Math.max(0, Math.round(100 - Math.max(0, zoom - 100) / 14));
  const kualitasVektor = 100;
  const ukuranPiksel = Math.max(1, Math.round(base * (zoom / 100)));
  const out = KELUARAN.find(x => x.id === keluaran)!;
  const jen = JENIS.find(x => x.id === karya)!;
  const kebutuhanPiksel = out.id === "spanduk" ? "15.748 × 23.622 px (300 cm @100 dpi)" : out.id === "poster" ? "3.508 × 4.961 px (@300 dpi)" : out.id === "kartu" ? "1.063 × 650 px (@300 dpi)" : "1.920 × 1.080 px (@72–144 dpi)";
  const rekomTepat = out.kebutuhanVektor ? "vektor" : "bitmap";
  const rekomBenar = rekom !== "" && rekom === rekomTepat;
  const alasanDipilih = ALASAN.filter(a => alasan.includes(a.id));
  const alasanBenar = alasanDipilih.filter(a => a.benar).length;
  const alasanSalah = alasanDipilih.filter(a => !a.benar).length;

  const kriteria = tingkat === 1
    ? [{ teks: "Perbesaran ≥ 800% diamati", lulus: zoom >= 800 },
       { teks: "Kualitas bitmap jatuh di bawah 60 (terbukti pecah)", lulus: kualitasBitmap < 60 }]
    : tingkat === 2
      ? [{ teks: "Rekomendasi tepat untuk jenis karya & keluaran terpilih", lulus: rekomBenar },
         { teks: "Keluarannya nyata (ukuran tercantum)", lulus: !!out && !!jen }]
      : [{ teks: "Tepat 3 alasan benar terpilih", lulus: alasanBenar === 3 && alasanSalah === 0 },
         { teks: "Tidak ada alasan salah terpilih", lulus: alasanSalah === 0 }];

  const umpanBalik: UmpanBalik[] = [
    { ok: kualitasBitmap < 60 || zoom <= 200, t: `Perbesaran ${zoom}%: kualitas bitmap ± ${kualitasBitmap}/100, vektor ${kualitasVektor}/100 (satu piksel bitmap kini sebesar ${(zoom / 100).toFixed(1)}× ukuran aslinya).` },
    { ok: true, t: `Untuk ${out.label}, kebutuhan piksel memadai ± ${kebutuhanPiksel}. ${out.kebutuhanVektor ? "Ukuran sebesar ini berat bila memakai bitmap." : "Ukuran ini masih wajar untuk bitmap."}` },
    tingkat >= 2
      ? { ok: rekomBenar, t: rekomBenar ? `Rekomendasi ${rekom} tepat untuk ${jen.label} pada ${out.label}.` : rekom === "" ? "Belum memilih rekomendasi jenis grafis." : `Rekomendasi ${rekom} kurang tepat: ${jen.vektor ? "bentuk sederhana" : "foto"} untuk ${out.label} lebih baik memakai ${rekomTepat}.` }
      : { ok: true, t: "Naikkan perbesaran untuk melihat perbedaan paling jelas." },
    tingkat === 3
      ? { ok: alasanBenar === 3 && alasanSalah === 0, t: `Alasan terpilih: ${alasanBenar} benar, ${alasanSalah} salah.` }
      : { ok: true, t: "Lanjutkan ke tingkat berikutnya untuk tantangan pemilihan format." },
  ];

  return (
    <LabShell meta={META_BITMAPVEKTOR} tingkat={tingkat} setTingkat={setTingkat} kriteria={kriteria} umpanBalik={umpanBalik}
      onReset={onResetLab} rincian={{ zoom, karya, keluaran, rekom, alasan }}>
      <Card className="p-5">
        <label className="text-xs font-medium text-slate-600">Perbesaran (zoom): {zoom}%</label>
        <input type="range" min={100} max={1600} step={50} value={zoom} onChange={e => setZoom(+e.target.value)} className="w-full" />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={gabungan} onChange={e => setGabungan(e.target.checked)} /> Tampilkan karya gabungan (foto bitmap + tulisan vektor)
        </label>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-800">Gambar bitmap</h3><Badge tone={kualitasBitmap < 60 ? "rose" : "slate"}>kualitas {kualitasBitmap}/100</Badge></div>
          <div className="mt-3 grid h-52 place-items-center overflow-hidden rounded-xl bg-slate-100">
            <div className="relative">
              <canvas width={base} height={base} ref={cv => {
                if (!cv) return;
                const ctx = cv.getContext("2d");
                if (!ctx) return;
                for (let y = 0; y < base; y++) for (let x = 0; x < base; x++) {
                  const lingkaran = (x - 8) ** 2 + (y - 8) ** 2 < 42;
                  ctx.fillStyle = lingkaran ? (x + y < 16 ? "#f59e0b" : "#1d4ed8") : "#e2e8f0";
                  ctx.fillRect(x, y, 1, 1);
                }
              }} style={{ width: `${Math.min(190, ukuranPiksel)}px`, height: `${Math.min(190, ukuranPiksel)}px`, imageRendering: "pixelated" }} />
              {gabungan && (
                <span className="absolute inset-x-0 bottom-2 text-center font-semibold text-white" style={{ fontSize: Math.max(9, Math.min(18, zoom / 60)), textShadow: "0 1px 3px rgba(0,0,0,.9)" }}>
                  TEKS VEKTOR
                </span>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Sumber 16×16 piksel → ditampilkan {ukuranPiksel} px. Di atas 100%, tepi melingkar berubah bertingkat (jagged) dan teks ikut pecah bila dibuat bitmap.</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-800">Gambar vektor</h3><Badge tone="green">kualitas {kualitasVektor}/100</Badge></div>
          <div className="mt-3 grid h-52 place-items-center overflow-hidden rounded-xl bg-slate-100">
            <div className="relative">
              <svg viewBox="0 0 100 100" style={{ width: `${Math.min(190, ukuranPiksel)}px`, height: `${Math.min(190, ukuranPiksel)}px` }}>
                <circle cx="50" cy="50" r="46" fill="#e2e8f0" />
                <path d="M50 8 A42 42 0 0 1 50 92 Z" fill="#f59e0b" />
                <path d="M50 8 A42 42 0 0 0 50 92 Z" fill="#1d4ed8" />
                <circle cx="50" cy="50" r="14" fill="#e2e8f0" />
              </svg>
              {gabungan && (
                <span className="absolute inset-x-0 bottom-2 text-center font-semibold text-white" style={{ fontSize: Math.max(9, Math.min(18, zoom / 60)), textShadow: "0 1px 3px rgba(0,0,0,.9)" }}>
                  TEKS VEKTOR
                </span>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Bentuk dihitung secara matematis, jadi tepi tetap halus dan teks tetap tajam pada perbesaran berapa pun — termasuk bila nanti dicetak di spanduk.</p>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">🧭 Pemilihan format</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Jenis karya"><select className={inputCls} value={karya} onChange={e => setKarya(e.target.value)}>{JENIS.map(j => <option key={j.id} value={j.id}>{j.label}</option>)}</select></Field>
          <Field label="Ukuran keluaran"><select className={inputCls} value={keluaran} onChange={e => setKeluaran(e.target.value)}>{KELUARAN.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select></Field>
          <Field label="Rekomendasi saya">
            <select className={inputCls} value={rekom} onChange={e => setRekom(e.target.value)}>
              <option value="">— pilih —</option>
              <option value="vektor">Vektor</option>
              <option value="bitmap">Bitmap</option>
            </select>
          </Field>
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          Keluaran terpilih membutuhkan ± <b>{kebutuhanPiksel}</b>. {gabungan ? "Karya gabungan: latar foto bitmap + teks/bentuk vektor di atasnya." : ""}
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium text-slate-700">Pilih tiga alasan teknis yang benar</div>
          <div className="mt-2 space-y-1.5">
            {ALASAN.map(a => (
              <label key={a.id} className={cx("flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm", alasan.includes(a.id) ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50")}>
                <input type="checkbox" checked={alasan.includes(a.id)} onChange={e => setAlasan(e.target.checked ? [...alasan, a.id] : alasan.filter(x => x !== a.id))} />
                <span>{a.teks}</span>
              </label>
            ))}
          </div>
          {alasan.length > 0 && <div className="mt-2 text-xs text-slate-500">Terpilih {alasan.length} alasan · benar {alasanBenar} · salah {alasanSalah}</div>}
        </div>
      </Card>
    </LabShell>
  );
}

/* ==================== 4. Alur Produksi ==================== */
const ALUR: Record<string, { judul: string; langkah: { teks: string; catatan: string }[] }> = {
  poster: {
    judul: "Poster cetak untuk acara sekolah",
    langkah: [
      { teks: "Menerima brief & mencatat kebutuhan klien", catatan: "Ukuran, tenggat, dan pesan utama ditetapkan di awal." },
      { teks: "Riset referensi & mengumpulkan bahan", catatan: "Kumpulkan foto, logo sekolah, dan contoh poster sejenis." },
      { teks: "Menyusun sketsa kasar (thumbnail)", catatan: "Beberapa alternatif tata letak sebelum masuk komputer." },
      { teks: "Desain digital di perangkat", catatan: "Vektor untuk teks/bentuk, bitmap untuk foto." },
      { teks: "Proofing: cetak uji & periksa ukuran/warna", catatan: "Warna layar ≠ warna cetak — wajib uji." },
      { teks: "Revisi berdasarkan umpan balik", catatan: "Perbaiki sesuai catatan, bukan sesuai selera sendiri." },
      { teks: "Cetak produksi & periksa hasil", catatan: "Kontrol mutu sebelum dibagikan." },
      { teks: "Serah terima & evaluasi hasil", catatan: "Simpan berkas sumber rapi untuk kebutuhan berikutnya." },
    ],
  },
  media: {
    judul: "Rangkaian konten media sosial sekolah",
    langkah: [
      { teks: "Brief & menyusun kalender konten", catatan: "Tentukan tema, jadwal, dan sasaran tiap unggahan." },
      { teks: "Riset audiens & tren yang relevan", catatan: "Sesuaikan gaya dengan kebiasaan pengikut." },
      { teks: "Menetapkan konsep visual & nada pesan", catatan: "Satu gaya untuk seluruh rangkaian agar konsisten." },
      { teks: "Produksi konten (foto/grafis)", catatan: "Siapkan bahan sesuai ukuran tiap platform." },
      { teks: "Penyuntingan & penyesuaian ukuran", catatan: "Potong, atur warna, dan tambahkan teks penting." },
      { teks: "Unggah & penjadwalan", catatan: "Publikasikan sesuai kalender yang disusun." },
      { teks: "Evaluasi performa & rencana berikutnya", catatan: "Lihat keterlibatan pengguna untuk perbaikan." },
    ],
  },
  kemasan: {
    judul: "Kemasan produk UMKM",
    langkah: [
      { teks: "Brief produk & kendala produksi", catatan: "Bahan, isi, dan jumlah produksi menentukan rancangan." },
      { teks: "Riset pesaing & bahan kemasan", catatan: "Pahami kebiasaan pasar dan kemampuan cetak setempat." },
      { teks: "Konsep struktur & grafis kemasan", catatan: "Bentuk lipatan dan tata informasi dirancang bersama." },
      { teks: "Mockup digital (die-line)", catatan: "Gunakan garis potong dan lipatan sebagai acuan." },
      { teks: "Uji cetak pada bahan asli", catatan: "Warna dan bahan berbeda menghasilkan hasil berbeda." },
      { teks: "Revisi & perbaikan detail", catatan: "Perbaiki keterbacaan dan kesesuaian bentuk." },
      { teks: "Produksi massal & kendali mutu", catatan: "Cek sampel dari setiap tumpukan hasil cetak." },
      { teks: "Evaluasi & pelaporan hasil", catatan: "Catat kendala untuk pekerjaan berikutnya." },
    ],
  },
};
const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export const META_ALUR: LabMeta = {
  id: "sim-alur-produksi", judul: "Laboratorium Alur Produksi DKV", icon: "🏭",
  ringkas: "Susun tahapan produksi karya DKV dalam urutan yang benar untuk tiga jenis brief, lalu periksa kesalahan langkah.",
  petunjuk: [
    "Pilih tingkat = jenis brief, baca catatan tiap langkah lewat umpan balik setelah diperiksa.",
    "Geser langkah dengan tombol ↑/↓, lalu tekan “Periksa urutan”.",
    "Baris merah menandakan langkah yang salah posisi — pindahkan sampai semuanya hijau.",
    "Bandingkan urutan antar-brief: mengapa kemasan menambah tahap uji bahan?",
  ],
  disclaimer: "Urutan tahapan disusun dari alur kerja industri kreatif yang dipelajari di buku (praproduksi, produksi, pascaproduksi) sebagai model pembelajaran. Praktik di studio nyata dapat menggabungkan atau mengulang tahap tertentu.",
  rujukan: "Buku Semester 1, Bab 3 (konsep industri hijau, siklus industri) dan Bab 4 (kreativitas & proses berkarya).",
  minggu: 11,
  tingkat: [
    { judul: "Poster cetak", misi: "Susun 8 tahapan poster cetak dari brief sampai serah terima dengan urutan tepat." },
    { judul: "Media sosial", misi: "Susun 7 tahapan rangkaian konten media sosial dengan urutan tepat." },
    { judul: "Kemasan produk", misi: "Susun 8 tahapan kemasan produk, termasuk uji cetak bahan, dengan urutan tepat." },
  ],
};

export function AlurProduksiLab({ onResetLab }: { onResetLab: () => void }) {
  const kunci = ["poster", "media", "kemasan"][0];
  const [tingkat, setTingkat] = useState(1);
  const brief = ["poster", "media", "kemasan"][tingkat - 1];
  const [urut, setUrut] = useState<string[]>(() => shuffle(ALUR[kunci].langkah.map(l => l.teks)));
  const [diperiksa, setDiperiksa] = useState(false);

  const benar = ALUR[brief].langkah.map(l => l.teks);
  const pindah = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= urut.length) return;
    const cp = [...urut]; [cp[i], cp[j]] = [cp[j], cp[i]]; setUrut(cp); setDiperiksa(false);
  };
  const gantiTingkat = (n: number) => {
    setTingkat(n);
    setUrut(shuffle(ALUR[["poster", "media", "kemasan"][n - 1]].langkah.map(l => l.teks)));
    setDiperiksa(false);
  };
  const jumlahBenar = urut.filter((t, i) => benar[i] === t).length;
  const salah = diperiksa ? urut.map((t, i) => benar[i] !== t) : [];

  const kriteria = [
    { teks: `Seluruh ${benar.length} langkah pada posisi tepat`, lulus: diperiksa && jumlahBenar === benar.length },
    { teks: "Sudah memeriksa urutan minimal sekali", lulus: diperiksa },
    { teks: "Urutan tidak berubah setelah diperiksa benar", lulus: diperiksa && jumlahBenar === benar.length },
  ];

  const umpanBalik: UmpanBalik[] = diperiksa
    ? [
        { ok: jumlahBenar === benar.length, t: jumlahBenar === benar.length ? "🎉 Urutan tepat seluruhnya — alur praproduksi → produksi → pascaproduksi sudah benar." : `Posisi benar ${jumlahBenar}/${benar.length}. Perbaiki baris merah.` },
        ...urut.map((t, i) => benar[i] === t ? { ok: true, t: `Langkah ${i + 1} tepat — ${ALUR[brief].langkah[i].catatan}` } : { ok: false, t: `Langkah ${i + 1} kurang tepat: pada posisi ini seharusnya “${benar[i]}”.` }).slice(0, 4),
      ]
    : [{ ok: true, t: "Susun langkah-langkah, lalu tekan “Periksa urutan” untuk menerima umpan balik tiap posisi." }];

  return (
    <LabShell meta={META_ALUR} tingkat={tingkat} setTingkat={gantiTingkat} kriteria={kriteria} umpanBalik={umpanBalik}
      onReset={onResetLab} rincian={{ brief, jumlahBenar, total: benar.length }}>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Brief tingkat {tingkat}</div>
            <div className="text-lg font-semibold text-slate-800">{ALUR[brief].judul}</div>
          </div>
          <Badge tone="slate">{benar.length} tahapan</Badge>
        </div>
        <ul className="mt-4 space-y-2">
          {urut.map((t, i) => {
            const gaya = diperiksa ? (salah[i] ? "border-rose-300 bg-rose-50" : "border-emerald-400 bg-emerald-50") : "border-slate-200 bg-white";
            return (
              <li key={t} className={cx("flex items-center justify-between gap-2 rounded-xl border p-3 text-sm", gaya)}>
                <span><b className="mr-2 text-slate-400">{i + 1}.</b>{t}{diperiksa && (salah[i] ? " ❌" : " ✅")}</span>
                <span className="flex gap-1">
                  <button aria-label={`naikkan ${t}`} className="rounded-lg border border-slate-300 px-2 py-1 hover:bg-slate-100" onClick={() => pindah(i, -1)}>↑</button>
                  <button aria-label={`turunkan ${t}`} className="rounded-lg border border-slate-300 px-2 py-1 hover:bg-slate-100" onClick={() => pindah(i, 1)}>↓</button>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={() => setDiperiksa(true)}>Periksa urutan</Btn>
          <Btn variant="ghost" onClick={() => { setUrut(shuffle(benar)); setDiperiksa(false); }}>Acak ulang</Btn>
        </div>
        {diperiksa && (
          <div className={cx("mt-4 rounded-xl p-3 text-sm", jumlahBenar === benar.length ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
            {jumlahBenar === benar.length ? "Seluruh urutan benar — siap dipakai sebagai alur kerja kelas." : `Posisi benar: ${jumlahBenar}/${benar.length}.`}
          </div>
        )}
      </Card>
    </LabShell>
  );
}
