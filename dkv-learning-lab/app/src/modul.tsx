// modul.tsx — Tampilan modul materi per pertemuan: materi lengkap, contoh visual (SVG), kuis formatif,
// penanda progres per pertemuan, dan editor materi untuk guru.
import React, { useEffect, useMemo, useState } from "react";
import { api, Card, Btn, Badge, Field, inputCls, cx, useAuth } from "./lib";
import diagramData from "../data/diagram-contoh.json";

/* ==================== 1. Contoh visual (SVG dari data diagram) ==================== */
const DIAGRAM: Record<string, any> = Object.fromEntries((diagramData.diagram || []).map((d: any) => [d.id, d]));

function Elemen({ e }: { e: any }) {
  const umum: any = { opacity: e.opacity };
  switch (e.tag) {
    case "rect":
      return <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={e.rx ?? 0} fill={e.fill ?? "none"} stroke={e.stroke ?? "none"} strokeWidth={e.w2 ?? 1.5} opacity={e.opacity} />;
    case "circle":
      return <circle cx={e.cx} cy={e.cy} r={e.r} fill={e.fill ?? "none"} stroke={e.stroke ?? "none"} strokeWidth={e.w ?? 2} opacity={e.opacity} />;
    case "line":
      return <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={e.stroke ?? "#1e293b"} strokeWidth={e.w ?? 2} strokeDasharray={e.dash} opacity={e.opacity} strokeLinecap="round" />;
    case "poly":
      return <polygon points={e.points} fill={e.fill ?? "none"} stroke={e.stroke ?? "none"} strokeWidth={e.w ?? 1.5} opacity={e.opacity} />;
    case "path":
      return <path d={e.d} fill={e.fill ?? "none"} stroke={e.stroke ?? "#1e293b"} strokeWidth={e.w ?? 3} opacity={e.opacity} strokeLinecap="round" />;
    case "text":
      return (
        <text x={e.x} y={e.y} fontSize={e.size ?? 11} fill={e.fill ?? "#1e293b"} fontWeight={e.weight ?? "400"}
          textAnchor={e.anchor ?? "start"} {...umum}>{e.teks}</text>
      );
    default:
      return null;
  }
}

export function DiagramContoh({ id, judul }: { id: string; judul?: string }) {
  const d = DIAGRAM[id];
  if (!d) return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
      Diagram “{id}” belum tersedia pada berkas data diagram-contoh.json.
    </div>
  );
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-3">
      <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={judul || d.judul}>
        <rect x="0" y="0" width="320" height="200" fill="#fbfdff" />
        {(d.elemen || []).map((e: any, i: number) => <Elemen key={i} e={e} />)}
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        <b className="text-slate-800">{judul || d.judul}</b> — {d.keterangan}
      </figcaption>
    </figure>
  );
}

/* ==================== 2. Materi lengkap satu pertemuan ==================== */
export function MateriLengkap({ modul, minggu, hari, terkunci, onRefresh }: any) {
  if (!modul) return (
    <Card className="p-5">
      <div className="text-sm text-slate-600">
        Modul rinci untuk pertemuan ini belum tersedia di data. Guru dapat menambahkannya melalui penyuntingan modul.
      </div>
    </Card>
  );
  const m = modul;
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-800">📚 Materi pertemuan</h2>
          <Badge tone="blue">parafrase orisinal dari buku acuan</Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{m.materi?.pengantar}</p>
        <ol className="mt-3 space-y-2">
          {(m.materi?.poin || []).map((p: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
        {!!(m.materi?.istilah || []).length && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-2">Istilah</th><th className="px-3 py-2">Arti</th></tr>
              </thead>
              <tbody>
                {m.materi.istilah.map((it: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-800">{it.t}</td>
                    <td className="px-3 py-2 text-slate-600">{it.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-800">🧩 Aktivitas memahami – mengaplikasi – merefleksi</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[["💡 Memahami", m.aktivitas?.memahami], ["🛠️ Mengaplikasi", m.aktivitas?.mengaplikasi], ["🪞 Merefleksi", m.aktivitas?.merefleksi]].map(([t, arr]: any) => (
            <div key={t} className="rounded-xl border border-slate-200 p-3">
              <div className="text-sm font-semibold text-slate-700">{t}</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{(arr || []).map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-800">🖼️ Contoh visual</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {(m.contohVisual || []).map((c: any, i: number) => (
            <div key={i} className="space-y-2">
              {c.jenis === "diagram" ? (
                <DiagramContoh id={c.id} judul={c.judul} />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Badge tone={c.jenis === "rujukan-buku" ? "violet" : "slate"}>{c.jenis === "rujukan-buku" ? "rujukan buku acuan" : "pengamatan"}</Badge>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-800">{c.judul}</div>
                  <div className="mt-1 text-sm text-slate-600">{c.keterangan}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Diagram pada halaman ini digambar ulang secara orisinal untuk aplikasi (usulan ⧗). Tautan halaman buku pada bagian rujukan adalah usulan; istilah dapat berbeda dengan buku yang dipakai sekolah.
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-800">📝 LKPD, rubrik, tugas, dan tindak lanjut</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-700">{m.lkpd?.judul}</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">{(m.lkpd?.langkah || []).map((l: string, i: number) => <li key={i}>{l}</li>)}</ol>
            <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">Rubrik penilaian</div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[520px] text-xs">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr><th className="px-2 py-1">Kriteria</th><th className="px-2 py-1">4</th><th className="px-2 py-1">3</th><th className="px-2 py-1">2</th><th className="px-2 py-1">1</th></tr>
                </thead>
                <tbody>
                  {(m.lkpd?.rubrik || []).map((r: any, i: number) => (
                    <tr key={i} className="border-t border-slate-100 align-top">
                      <td className="px-2 py-1 font-medium text-slate-800">{r.kriteria}</td>
                      <td className="px-2 py-1 text-slate-600">{r.skor4}</td>
                      <td className="px-2 py-1 text-slate-600">{r.skor3}</td>
                      <td className="px-2 py-1 text-slate-600">{r.skor2}</td>
                      <td className="px-2 py-1 text-slate-600">{r.skor1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-700">Tugas</div>
              <div className="mt-1 text-sm text-slate-700">{m.tugas?.judul}</div>
              <div className="text-xs text-slate-500">Bentuk: {m.tugas?.bentuk} · Luaran: {m.tugas?.luaran}</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-sm font-semibold text-amber-900">Tindak lanjut</div>
              <div className="mt-1 text-sm text-amber-900"><b>Remedial:</b> {m.tindakLanjut?.remedial}</div>
              <div className="text-sm text-amber-900"><b>Pengayaan:</b> {m.tindakLanjut?.pengayaan}</div>
            </div>
          </div>
        </div>
      </Card>

      <KuisFormatif minggu={minggu} hari={hari} butir={m.asesmenFormatif?.butir || []} bentuk={m.asesmenFormatif?.bentuk} terkunci={terkunci} onRefresh={onRefresh} />
    </div>
  );
}

/* ==================== 3. Kuis formatif pertemuan ==================== */
export function KuisFormatif({ minggu, hari, butir, bentuk, terkunci, onRefresh }: any) {
  const { user } = useAuth();
  const [jawaban, setJawaban] = useState<Record<number, number>>({});
  const [hasil, setHasil] = useState<any | null>(null);
  const [pesan, setPesan] = useState("");
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const isSiswa = user?.role === "siswa";

  useEffect(() => {
    setHasil(null); setPesan(""); setJawaban({});
    if (!isSiswa) { setRiwayat([]); return; }
    api(`/api/kuis-formatif/${minggu}/${hari}`).then(r => setRiwayat(r.percobaan || [])).catch(() => setRiwayat([]));
  }, [minggu, hari, isSiswa]);

  const kirim = async () => {
    if (Object.keys(jawaban).length < butir.length) return setPesan("Jawab semua butir terlebih dahulu.");
    try {
      const r = await api(`/api/kuis-formatif/${minggu}/${hari}`, { method: "POST", body: { jawaban: butir.map((_: any, i: number) => jawaban[i]) } });
      setHasil(r);
      setPesan(`Nilai tersimpan: ${r.skor}/${r.total}.`);
      api(`/api/kuis-formatif/${minggu}/${hari}`).then(x => setRiwayat(x.percobaan || [])).catch(() => {});
      onRefresh?.();
    } catch (e: any) { setPesan(`Gagal mengirim: ${e.message}`); }
  };

  const terakhir = riwayat[0];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-slate-800">✅ Asesmen formatif pertemuan ini</h2>
        <Badge tone="slate">{bentuk || "kuis-pilihan-ganda"} · {butir.length} butir</Badge>
      </div>

      {!isSiswa && <div className="mt-3 text-sm text-slate-600">Penilaian kuis dikerjakan siswa pada halaman ini; guru dapat melihat hasilnya di menu Penilaian dan Rekap.</div>}

      {isSiswa && (
        <>
          {terkunci && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Menu Kuis/Asesmen belum dibuka oleh guru. Butir kuis tetap dapat dibaca untuk belajar, tetapi jawaban belum dapat dikirim.
            </div>
          )}
          <ol className="mt-3 space-y-4">
            {butir.map((b: any, i: number) => (
              <li key={i} className="rounded-xl border border-slate-200 p-3">
                <div className="text-sm font-medium text-slate-800">{i + 1}. {b.soal}</div>
                <div className="mt-2 space-y-1">
                  {b.opsi.map((o: string, j: number) => {
                    const dipilih = jawaban[i] === j;
                    const rinci = hasil?.rincian?.[i];
                    const tanda = hasil && rinci && j === rinci.kunci ? "✓" : hasil && dipilih && !rinci.benar ? "✕" : "";
                    return (
                      <label key={j} className={cx("flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                        dipilih ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50")}>
                        <input type="radio" name={`b-${minggu}-${hari}-${i}`} checked={dipilih} disabled={!!hasil}
                          onChange={() => setJawaban({ ...jawaban, [i]: j })} />
                        <span>{o}</span>
                        {!!tanda && <span className={cx("text-xs font-bold", tanda === "✓" ? "text-green-700" : "text-red-600")}>{tanda}</span>}
                      </label>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!hasil
              ? <Btn onClick={kirim} disabled={terkunci}>Kirim jawaban</Btn>
              : <Btn variant="ghost" onClick={() => { setHasil(null); setPesan(""); setJawaban({}); }}>Coba lagi</Btn>}
            {hasil && <Badge tone={hasil.skor === hasil.total ? "green" : "amber"}>nilai {hasil.skor}/{hasil.total}</Badge>}
            {terakhir && !hasil && <span className="text-xs text-slate-500">percobaan terakhir: {terakhir.skor}/{terakhir.total}</span>}
          </div>
          {pesan && <div className={cx("mt-2 text-sm", hasil ? "text-green-700" : "text-slate-700")}>{pesan}</div>}
        </>
      )}
    </Card>
  );
}

/* ==================== 4. Editor materi untuk guru ==================== */
const baris = (s: any) => (Array.isArray(s) ? s.join("\n") : s || "");
const jadiArray = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);

export function EditorModul({ minggu, hari, modul, onSaved }: any) {
  const [buka, setBuka] = useState(false);
  const [pesan, setPesan] = useState("");
  const [form, setForm] = useState<any>(() => keForm(modul));

  useEffect(() => { setForm(keForm(modul)); }, [modul, minggu, hari]);

  function keForm(m: any) {
    return {
      tujuan: baris(m?.tujuan),
      pemantik: baris(m?.pemantik),
      pengantar: m?.materi?.pengantar || "",
      poin: baris(m?.materi?.poin),
      istilah: baris((m?.materi?.istilah || []).map((i: any) => `${i.t} | ${i.a}`)),
      memahami: baris(m?.aktivitas?.memahami),
      mengaplikasi: baris(m?.aktivitas?.mengaplikasi),
      merefleksi: baris(m?.aktivitas?.merefleksi),
      lkpdJudul: m?.lkpd?.judul || "",
      lkpdLangkah: baris(m?.lkpd?.langkah),
      rubrik: baris((m?.lkpd?.rubrik || []).map((r: any) => [r.kriteria, r.skor4, r.skor3, r.skor2, r.skor1].join(" | "))),
      tugasJudul: m?.tugas?.judul || "",
      tugasBentuk: m?.tugas?.bentuk || "",
      tugasLuaran: m?.tugas?.luaran || "",
      remedial: m?.tindakLanjut?.remedial || "",
      pengayaan: m?.tindakLanjut?.pengayaan || "",
    };
  }

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const simpan = async () => {
    const pecah = (s: string, n: number) => jadiArray(s).map(l => { const p = l.split("|").map(x => x.trim()); while (p.length < n) p.push(""); return p; });
    const modulBaru = {
      ...(modul || {}),
      tujuan: jadiArray(form.tujuan),
      pemantik: jadiArray(form.pemantik),
      materi: {
        ...(modul?.materi || {}),
        pengantar: form.pengantar,
        poin: jadiArray(form.poin),
        istilah: pecah(form.istilah, 2).map(p => ({ t: p[0], a: p[1] })),
      },
      aktivitas: { memahami: jadiArray(form.memahami), mengaplikasi: jadiArray(form.mengaplikasi), merefleksi: jadiArray(form.merefleksi) },
      lkpd: { ...(modul?.lkpd || {}), judul: form.lkpdJudul, langkah: jadiArray(form.lkpdLangkah), rubrik: pecah(form.rubrik, 5).map(p => ({ kriteria: p[0], skor4: p[1], skor3: p[2], skor2: p[3], skor1: p[4] })) },
      tugas: { ...(modul?.tugas || {}), judul: form.tugasJudul, bentuk: form.tugasBentuk, luaran: form.tugasLuaran },
      tindakLanjut: { remedial: form.remedial, pengayaan: form.pengayaan },
    };
    try {
      await api(`/api/kurikulum/${minggu}/pertemuan/${hari}/modul`, { method: "PUT", body: { modul: modulBaru } });
      setPesan("Tersimpan. Perubahan langsung dipakai pada tampilan siswa dan tercatat di log.");
      onSaved?.();
    } catch (e: any) { setPesan(`Gagal menyimpan: ${e.message}`); }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-800">🧑‍🏫 Mode Guru — sunting materi pertemuan ini</h2>
          <div className="mt-1 text-xs text-slate-500">Perubahan berlaku untuk kelas & pertemuan ini, tersimpan di server, dan dicatat pada log aktivitas.</div>
        </div>
        <Btn variant={buka ? "ghost" : "primary"} onClick={() => setBuka(!buka)}>{buka ? "Tutup editor" : "Sunting materi"}</Btn>
      </div>

      {buka && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Tujuan pembelajaran (satu per baris)"><textarea className={cx(inputCls, "h-24")} value={form.tujuan} onChange={e => set("tujuan", e.target.value)} /></Field>
            <Field label="Pertanyaan pemantik (satu per baris)"><textarea className={cx(inputCls, "h-24")} value={form.pemantik} onChange={e => set("pemantik", e.target.value)} /></Field>
          </div>
          <Field label="Pengantar materi"><textarea className={cx(inputCls, "h-24")} value={form.pengantar} onChange={e => set("pengantar", e.target.value)} /></Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Poin materi (satu per baris)"><textarea className={cx(inputCls, "h-28")} value={form.poin} onChange={e => set("poin", e.target.value)} /></Field>
            <Field label="Istilah — tulis “istilah | arti” per baris"><textarea className={cx(inputCls, "h-28")} value={form.istilah} onChange={e => set("istilah", e.target.value)} /></Field>
            <Field label="Aktivitas memahami (satu per baris)"><textarea className={cx(inputCls, "h-24")} value={form.memahami} onChange={e => set("memahami", e.target.value)} /></Field>
            <Field label="Aktivitas mengaplikasi (satu per baris)"><textarea className={cx(inputCls, "h-24")} value={form.mengaplikasi} onChange={e => set("mengaplikasi", e.target.value)} /></Field>
            <Field label="Aktivitas merefleksi (satu per baris)"><textarea className={cx(inputCls, "h-24")} value={form.merefleksi} onChange={e => set("merefleksi", e.target.value)} /></Field>
            <Field label="Judul LKPD"><input className={inputCls} value={form.lkpdJudul} onChange={e => set("lkpdJudul", e.target.value)} /></Field>
            <Field label="Langkah LKPD (satu per baris)"><textarea className={cx(inputCls, "h-24")} value={form.lkpdLangkah} onChange={e => set("lkpdLangkah", e.target.value)} /></Field>
            <Field label="Rubrik — “kriteria | skor4 | skor3 | skor2 | skor1” per baris"><textarea className={cx(inputCls, "h-24")} value={form.rubrik} onChange={e => set("rubrik", e.target.value)} /></Field>
            <Field label="Judul tugas"><input className={inputCls} value={form.tugasJudul} onChange={e => set("tugasJudul", e.target.value)} /></Field>
            <Field label="Bentuk tugas"><input className={inputCls} value={form.tugasBentuk} onChange={e => set("tugasBentuk", e.target.value)} /></Field>
            <Field label="Luaran tugas"><input className={inputCls} value={form.tugasLuaran} onChange={e => set("tugasLuaran", e.target.value)} /></Field>
            <Field label="Tindak lanjut — remedial"><textarea className={cx(inputCls, "h-20")} value={form.remedial} onChange={e => set("remedial", e.target.value)} /></Field>
            <Field label="Tindak lanjut — pengayaan"><textarea className={cx(inputCls, "h-20")} value={form.pengayaan} onChange={e => set("pengayaan", e.target.value)} /></Field>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Belum dapat disunting dari antarmuka ini: butir kuis formatif dan contoh visual (perlu penyesuaian berkas data oleh pengembang/guru bersama operator).
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Btn onClick={simpan}>Simpan materi</Btn>
            <Btn variant="ghost" onClick={() => { setForm(keForm(modul)); setPesan("Perubahan pada formulir dikembalikan ke isi tersimpan."); }}>Batalkan perubahan</Btn>
          </div>
          {pesan && <div className="text-sm text-slate-700">{pesan}</div>}
        </div>
      )}
    </Card>
  );
}
