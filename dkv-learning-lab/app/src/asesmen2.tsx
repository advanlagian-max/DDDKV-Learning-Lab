// asesmen2.tsx — Halaman asesmen siswa: mengerjakan LKPD digital, kuis (otomatis + pembahasan),
// asesmen formatif, sumatif, praktik, dan proyek; serta rekap hasil belajar milik siswa sendiri.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, Card, Btn, Badge, PageTitle, Spinner, Empty, Toast, Field, inputCls, cx, useSiswaStatus } from "./lib";

export const TIPE_INFO: Record<string, { label: string; icon: string; tone: any; nilai: string }> = {
  kuis: { label: "Kuis pilihan ganda", icon: "🔘", tone: "blue", nilai: "dinilai otomatis + pembahasan" },
  lkpd: { label: "LKPD digital", icon: "📝", tone: "violet", nilai: "dinilai guru dengan rubrik" },
  formatif: { label: "Asesmen formatif", icon: "📈", tone: "sky", nilai: "dinilai guru (observasi & refleksi)" },
  praktik: { label: "Penilaian praktik", icon: "🛠️", tone: "amber", nilai: "dinilai guru — proses kerja" },
  proyek: { label: "Penilaian proyek", icon: "🎨", tone: "rose", nilai: "dinilai guru — kreativitas & karya" },
  sumatif: { label: "Asesmen sumatif", icon: "🏁", tone: "green", nilai: "PG otomatis + uraian/karya dinilai guru" },
};
const STATUS_INFO: Record<string, { label: string; tone: any }> = {
  belum: { label: "belum dikerjakan", tone: "slate" },
  draf: { label: "draf", tone: "slate" },
  terkumpul: { label: "terkumpul — menunggu penilaian guru", tone: "amber" },
  dinilai: { label: "sudah dinilai", tone: "green" },
  "perlu-revisi": { label: "perlu revisi", tone: "rose" },
};

/* ==================== 1. Rencana & pengerjaan asesmen ==================== */
export function AsesmenRencana() {
  const { status } = useSiswaStatus();
  const [daftar, setDaftar] = useState<any[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [minggu, setMinggu] = useState(0);          // 0 = semua minggu; otomatis diarahkan ke minggu aktif
  const [tipe, setTipe] = useState("");
  const [autoMinggu, setAutoMinggu] = useState(false);
  const [terbuka, setTerbuka] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // Tampilkan lebih dulu asesmen minggu yang sedang berjalan supaya halaman tidak memuat 260 kartu sekaligus.
  useEffect(() => {
    if (!autoMinggu && status?.minggu_aktif) { setMinggu(status.minggu_aktif); setAutoMinggu(true); }
  }, [status, autoMinggu]);

  const muat = async () => {
    setMemuat(true);
    try {
      const q = new URLSearchParams();
      if (minggu) q.set("minggu", String(minggu));
      if (tipe) q.set("tipe", tipe);
      const r = await api(`/api/asesmen/rencana?${q.toString()}`);
      setDaftar(r.asesmen || []);
    } catch (e: any) { setToast(`Gagal memuat rencana asesmen: ${e.message}`); }
    setMemuat(false);
  };
  useEffect(() => { muat(); }, [minggu, tipe]);

  const ringkasStatus = useMemo(() => {
    const c: Record<string, number> = { belum: 0, terkumpul: 0, dinilai: 0, "perlu-revisi": 0 };
    for (const a of daftar) c[a.status] = (c[a.status] || 0) + 1;
    return c;
  }, [daftar]);

  const tuntas = daftar.length > 0 && daftar.every(a => a.status === "dinilai");
  return (
    <div>
      <PageTitle title="Asesmen & Pengerjaan (36 Minggu)" sub="LKPD digital, kuis, asesmen formatif, sumatif, penilaian praktik, dan penilaian proyek — lengkap dengan kriteria, bobot, rubrik, komentar guru, dan kesempatan revisi"
        right={<div className="flex gap-2"><Link to="/asesmen"><Btn variant="ghost">← Asesmen (ringkasan)</Btn></Link><Link to="/asesmen/rekap"><Btn variant="ghost">Rekap saya →</Btn></Link></div>} />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <Card className={cx("mb-4 p-4", tuntas ? "border-emerald-200 bg-emerald-50" : "")}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge tone="slate">{daftar.length} asesmen ditampilkan</Badge>
          {Object.entries(STATUS_INFO).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1"><Badge tone={v.tone}>{v.label}</Badge><b>{ringkasStatus[k] || 0}</b></span>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-600">
          Kuis pilihan ganda dinilai otomatis beserta pembahasan. LKPD, formatif, praktik, proyek, dan bagian uraian sumatif
          <b> tidak pernah dinilai otomatis</b> — nilai diisi guru memakai rubrik setelah guru mengonfirmasi pemeriksaan.
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Minggu">
          <select className={inputCls} value={minggu} onChange={e => setMinggu(+e.target.value)}>
            <option value={0}>Semua minggu (1–36)</option>
            {Array.from({ length: 36 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Minggu {m}</option>)}
          </select>
        </Field>
        <Field label="Jenis asesmen">
          <select className={inputCls} value={tipe} onChange={e => setTipe(e.target.value)}>
            <option value="">Semua jenis</option>
            {Object.entries(TIPE_INFO).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </Field>
        <div className="text-xs text-slate-500">
          Menu LKPD/Kuis {status?.controls?.lkpd === false ? "sedang dikunci guru" : "terbuka"} ·
          penguncian guru menahan pengiriman jawaban baru, tetapi jawaban & nilai lama tidak dihapus.
        </div>
      </div>

      {memuat ? <Spinner label="Memuat rencana asesmen…" /> : daftar.length === 0 ? <Empty text="Tidak ada asesmen pada filter ini." /> : (
        <div className="space-y-3">
          {daftar.map(a => (
            <KartuAsesmen key={a.id} a={a} terbuka={terbuka === a.id} onToggle={() => setTerbuka(terbuka === a.id ? null : a.id)} onPesan={setToast} onMuat={muat} />
          ))}
        </div>
      )}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <b>Catatan kejujuran:</b> bobot, KKTp, dan rubrik pada halaman ini adalah usulan yang dapat disunting guru.
        Nilai aspek artistik/proses tidak pernah muncul otomatis — nilai itu hasil pertimbangan guru dengan rubrik.
      </div>
    </div>
  );
}

function KartuAsesmen({ a, terbuka, onToggle, onPesan, onMuat }: any) {
  const info = TIPE_INFO[a.tipe] || TIPE_INFO.lkpd;
  const st = STATUS_INFO[a.status] || STATUS_INFO.belum;
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={info.tone}>{info.icon} {info.label}</Badge>
            <Badge tone="slate">minggu {a.minggu} · {a.pertemuan}</Badge>
            <Badge tone="slate">bobot {a.bobot}</Badge>
            <Badge tone="slate">KKTp {a.kktp}</Badge>
            <Badge tone="slate">revisi {a.revisi_ke}/{a.kesempatanRevisi}</Badge>
            <Badge tone={st.tone}>{st.label}</Badge>
            {a.skorTersimpan !== null && <Badge tone="green">nilai {a.skorTersimpan}</Badge>}
          </div>
          <div className="mt-2 font-medium text-slate-800">{a.judul}</div>
          <div className="text-xs text-slate-600">{a.deskripsi}</div>
          <div className="mt-1 text-xs text-slate-500">Cara penilaian: {info.nilai}{a.jumlahButir ? ` · ${a.jumlahButir} butir` : ""}</div>
        </div>
        <Btn variant={terbuka ? "ghost" : "primary"} onClick={onToggle}>{terbuka ? "Tutup" : "Buka"}</Btn>
      </div>
      {terbuka && <PanelKerja a={a} onPesan={onPesan} onMuat={onMuat} />}
    </Card>
  );
}

function PanelKerja({ a, onPesan, onMuat }: any) {
  const [detail, setDetail] = useState<any | null>(null);
  const [pilihan, setPilihan] = useState<Record<number, number>>({});
  const [teks, setTeks] = useState("");
  const [tautan, setTautan] = useState("");
  const [hasil, setHasil] = useState<any | null>(null);
  const [kirim, setKirim] = useState(false);

  const muat = async () => {
    const r = await api(`/api/asesmen/${a.id}/kerja`);
    setDetail(r);
    if (r.kerja?.jawaban) {
      setTeks(r.kerja.jawaban.teks || "");
      setTautan(r.kerja.jawaban.tautan || "");
      if (r.kerja.jawaban.pilihan) setPilihan(Object.fromEntries((r.kerja.jawaban.pilihan || []).map((v: any, i: number) => [i, v])));
    }
  };
  useEffect(() => { muat(); }, [a.id]);

  const adaButir = !!a.jumlahButir;
  const sudahDikumpul = ["terkumpul", "dinilai", "perlu-revisi"].includes(a.status);
  const bolehRevisi = (a.revisi_ke || 0) < a.kesempatanRevisi;

  const kirimJawaban = async (revisi = false) => {
    setKirim(true);
    try {
      const body = adaButir
        ? { jawaban: (detail?.butir || []).map((_: any, i: number) => pilihan[i]), teks, tautan }
        : { teks, tautan };
      const r = await api(`/api/asesmen/${a.id}/${revisi ? "revisi" : "kerja"}`, { method: "POST", body });
      setHasil(r);
      onPesan(r.pesan || "Terkirim.");
      await muat();
      onMuat();
    } catch (e: any) { onPesan(`Gagal mengirim: ${e.message}`); }
    setKirim(false);
  };

  if (!detail) return <div className="mt-3 text-sm text-slate-500">Memuat pekerjaan…</div>;
  const kerja = detail.kerja;
  const rubrik = detail.asesmen?.rubrik || [];

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      {!!detail.asesmen?.langkah?.length && (
        <div>
          <div className="text-sm font-semibold text-slate-700">Langkah LKPD</div>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-slate-600">{detail.asesmen.langkah.map((l: string, i: number) => <li key={i}>{l}</li>)}</ol>
        </div>
      )}

      {!!rubrik.length && (
        <div>
          <div className="text-sm font-semibold text-slate-700">Rubrik penilaian guru (dapat disunting guru)</div>
          <div className="mt-1 overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr><th className="px-2 py-1">Kriteria</th><th className="px-2 py-1">Bobot</th><th className="px-2 py-1">4</th><th className="px-2 py-1">3</th><th className="px-2 py-1">2</th><th className="px-2 py-1">1</th></tr>
              </thead>
              <tbody>
                {rubrik.map((r: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-1 font-medium text-slate-700">{r.kriteria}</td>
                    <td className="px-2 py-1 text-slate-600">{r.bobot}</td>
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
      )}

      {adaButir && (
        <div>
          <div className="text-sm font-semibold text-slate-700">Butir pilihan ganda {sudahDikumpul ? "(sudah dikumpulkan)" : ""}</div>
          <ol className="mt-2 space-y-3">
            {(detail.butir || []).map((b: any, i: number) => {
              const rinci = kerja?.rincian?.rincian?.[i] || kerja?.skor_rincian?.rincian?.[i];
              return (
                <li key={i} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-sm font-medium text-slate-800">{i + 1}. {b.soal}</div>
                  <div className="mt-2 space-y-1">
                    {(b.opsi || []).map((o: string, j: number) => {
                      const dipilih = pilihan[i] === j;
                      const benar = rinci && j === rinci.kunci;
                      return (
                        <label key={j} className={cx("flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                          rinci ? (benar ? "bg-emerald-50 text-emerald-800" : dipilih ? "bg-rose-50 text-rose-700" : "") : dipilih ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50")}>
                          <input type="radio" name={`${a.id}-${i}`} checked={dipilih} disabled={sudahDikumpul}
                            onChange={() => setPilihan({ ...pilihan, [i]: j })} />
                          <span>{o}</span>
                          {rinci && benar && <span className="text-xs font-bold text-emerald-700">✓ kunci</span>}
                          {rinci && !benar && dipilih && <span className="text-xs font-bold text-rose-600">✕ jawabanmu</span>}
                        </label>
                      );
                    })}
                  </div>
                  {rinci?.pembahasan && (
                    <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900"><b>Pembahasan:</b> {rinci.pembahasan}</div>
                  )}
                </li>
              );
            })}
          </ol>
          {!sudahDikumpul && <Btn className="mt-3" onClick={() => kirimJawaban(false)} disabled={kirim}>Kirim jawaban kuis</Btn>}
        </div>
      )}

      {!adaButir && (
        <div className="space-y-2">
          <Field label="Uraian / catatan proses (boleh ditulis singkat dan jelas)">
            <textarea className={cx(inputCls, "h-24")} value={teks} onChange={e => setTeks(e.target.value)} disabled={sudahDikumpul}
              placeholder="Tulis langkah yang kamu kerjakan, kendala, dan alasan pilihan desainmu…" />
          </Field>
          <Field label="Tautan bukti karya (opsional, mis. tautan berkas/foto karya)">
            <input className={inputCls} value={tautan} onChange={e => setTautan(e.target.value)} disabled={sudahDikumpul} placeholder="https://…" />
          </Field>
          {!sudahDikumpul && (
            <div className="text-xs text-slate-600">
              Setelah dikirim, status menjadi <b>terkumpul</b> dan nilai diisi guru memakai rubrik.
              Sistem <b>tidak</b> memberi nilai otomatis untuk aspek proses, kreativitas, dan kualitas karya visual.
            </div>
          )}
          {!sudahDikumpul && <Btn onClick={() => kirimJawaban(false)} disabled={kirim}>Kumpulkan pekerjaan</Btn>}
        </div>
      )}

      {(kerja || hasil) && (
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge tone={STATUS_INFO[kerja?.status]?.tone || "slate"}>{STATUS_INFO[kerja?.status]?.label || kerja?.status}</Badge>
            {kerja?.skor !== null && kerja?.skor !== undefined && <Badge tone="green">nilai {kerja.skor}</Badge>}
            {kerja?.skor_butir !== null && kerja?.total_butir ? <Badge tone="blue">PG: {kerja.skor_butir}/{kerja.total_butir} benar</Badge> : null}
          </div>
          {kerja?.komentar && <div className="mt-2 rounded-lg bg-white p-2 text-sm"><b>Komentar guru:</b> {kerja.komentar}</div>}
          {(a.status === "perlu-revisi" || (a.status === "dinilai" && bolehRevisi)) && (
            <div className="mt-2">
              <div className="text-xs text-slate-600">Kesempatan revisi: {a.kesempatanRevisi - (a.revisi_ke || 0)} kali tersisa.</div>
              {bolehRevisi && <Btn className="mt-2" variant="ghost" onClick={() => kirimJawaban(true)} disabled={kirim}>Kirim revisi</Btn>}
              {!bolehRevisi && <span className="text-xs text-rose-600">Kesempatan revisi habis — silakan ikuti program remedial dari guru.</span>}
            </div>
          )}
          {!!a.remedial && kerja?.skor !== null && kerja?.skor < a.kktp && (
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900"><b>Remedial:</b> {a.remedial}</div>
          )}
          {!!a.pengayaan && kerja?.skor !== null && kerja?.skor >= a.kktp && (
            <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900"><b>Pengayaan:</b> {a.pengayaan}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==================== 2. Rekap hasil belajar milik siswa ==================== */
export function RekapSiswaAsesmen() {
  const [daftar, setDaftar] = useState<any[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [tab, setTab] = useState<"minggu" | "jenis" | "catatan">("minggu");

  useEffect(() => {
    api("/api/asesmen/rencana?ringkas=1").then(r => setDaftar(r.asesmen || [])).catch(() => {}).finally(() => setMemuat(false));
  }, []);

  const hitung = (items: any[]) => {
    let total = 0, bobot = 0;
    for (const a of items) if (a.skorTersimpan !== null && a.skorTersimpan !== undefined) { total += a.skorTersimpan * a.bobot; bobot += a.bobot; }
    return bobot ? Math.round((total / bobot) * 10) / 10 : null;
  };
  const perMinggu = useMemo(() => Array.from({ length: 36 }, (_, i) => {
    const m = i + 1;
    const items = daftar.filter(a => a.minggu === m);
    return { minggu: m, jumlah: items.length, dinilai: items.filter(a => a.skorTersimpan !== null && a.skorTersimpan !== undefined).length, skor: hitung(items), jenis: [...new Set(items.map(a => a.tipe))] };
  }), [daftar]);
  const perJenis = useMemo(() => Object.keys(TIPE_INFO).map(t => {
    const items = daftar.filter(a => a.tipe === t);
    const dinilai = items.filter(a => a.skorTersimpan !== null && a.skorTersimpan !== undefined);
    return {
      tipe: t, jumlah: items.length, dinilai: dinilai.length,
      rata: dinilai.length ? Math.round((dinilai.reduce((x, a) => x + a.skorTersimpan, 0) / dinilai.length) * 10) / 10 : null,
      diBawahKktp: dinilai.filter(a => a.skorTersimpan < a.kktp).length,
    };
  }), [daftar]);
  const menunggu = daftar.filter(a => a.status === "terkumpul");
  const perluRevisi = daftar.filter(a => a.status === "perlu-revisi");
  const aman = hitung(daftar);

  if (memuat) return <Spinner label="Menghitung rekap…" />;
  return (
    <div>
      <PageTitle title="Rekap Hasil Belajar Saya" sub="Per minggu, per jenis asesmen, serta catatan komentar, revisi, dan status pengumpulan"
        right={<div className="flex gap-2"><Link to="/asesmen/rencana"><Btn variant="ghost">← Pengerjaan</Btn></Link></div>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Nilai akhir (berbobot)</div><div className="mt-1 text-2xl font-bold text-slate-800">{aman ?? "—"}</div><div className="text-xs text-slate-500">dari komponen yang sudah dinilai</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Sudah dinilai</div><div className="mt-1 text-2xl font-bold text-slate-800">{daftar.filter(a => a.status === "dinilai").length}/{daftar.length}</div><div className="text-xs text-slate-500">asesmen</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Menunggu guru</div><div className="mt-1 text-2xl font-bold text-slate-800">{menunggu.length}</div><div className="text-xs text-slate-500">sudah terkumpul</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Perlu revisi</div><div className="mt-1 text-2xl font-bold text-slate-800">{perluRevisi.length}</div><div className="text-xs text-slate-500">sesuai catatan guru</div></Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {([["minggu", "🗓️ Per minggu"], ["jenis", "🗂️ Per jenis asesmen"], ["catatan", "💬 Catatan & revisi"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", tab === k ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>{l}</button>
        ))}
      </div>

      {tab === "minggu" && (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-2">Minggu</th><th className="px-3 py-2">Jenis asesmen</th><th className="px-3 py-2">Dinilai</th><th className="px-3 py-2">Nilai minggu (berbobot)</th></tr>
              </thead>
              <tbody>
                {perMinggu.filter(r => r.jumlah > 0).map(r => (
                  <tr key={r.minggu} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-800">Minggu {r.minggu}</td>
                    <td className="px-3 py-2 text-slate-600">{r.jenis.map(t => TIPE_INFO[t]?.icon).join(" ")}</td>
                    <td className="px-3 py-2 text-slate-600">{r.dinilai}/{r.jumlah}</td>
                    <td className="px-3 py-2">{r.skor === null ? <span className="text-slate-400">belum ada nilai</span> : <Badge tone={r.skor >= 75 ? "green" : "amber"}>{r.skor}</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "jenis" && (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-2">Jenis asesmen</th><th className="px-3 py-2">Jumlah</th><th className="px-3 py-2">Dinilai</th><th className="px-3 py-2">Rata-rata</th><th className="px-3 py-2">Di bawah KKTp</th></tr>
              </thead>
              <tbody>
                {perJenis.map(r => (
                  <tr key={r.tipe} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-800">{TIPE_INFO[r.tipe].icon} {TIPE_INFO[r.tipe].label}</td>
                    <td className="px-3 py-2 text-slate-600">{r.jumlah}</td>
                    <td className="px-3 py-2 text-slate-600">{r.dinilai}</td>
                    <td className="px-3 py-2">{r.rata === null ? <span className="text-slate-400">—</span> : <Badge tone={r.rata >= 75 ? "green" : "amber"}>{r.rata}</Badge>}</td>
                    <td className="px-3 py-2 text-slate-600">{r.diBawahKktp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "catatan" && (
        <div className="space-y-3">
          {daftar.filter(a => a.status !== "belum").length === 0 && <Empty text="Belum ada pekerjaan yang dikumpulkan." />}
          {daftar.filter(a => a.status !== "belum").map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={TIPE_INFO[a.tipe]?.tone}>{TIPE_INFO[a.tipe]?.label}</Badge>
                <Badge tone="slate">minggu {a.minggu}</Badge>
                <Badge tone={STATUS_INFO[a.status]?.tone}>{STATUS_INFO[a.status]?.label}</Badge>
                {a.skorTersimpan !== null && <Badge tone="green">nilai {a.skorTersimpan} (KKTp {a.kktp})</Badge>}
                <Badge tone="slate">revisi {a.revisi_ke}/{a.kesempatanRevisi}</Badge>
              </div>
              <div className="mt-2 text-sm font-medium text-slate-800">{a.judul}</div>
              {a.skorTersimpan !== null && a.skorTersimpan < a.kktp && (
                <div className="mt-1 text-xs text-amber-800">Nilai di bawah KKTp — ikuti langkah remedial dari guru.</div>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
        Rekap ini dihitung dari komponen yang <b>sudah dinilai</b>; bobot komponen yang belum dijalankan tidak dihitung sehingga nilai tidak turun
        hanya karena asesmen belum dilaksanakan. Nilai aspek proses/karya berasal dari penilaian guru memakai rubrik.
      </div>
    </div>
  );
}
