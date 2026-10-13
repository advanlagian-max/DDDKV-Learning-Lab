// pertemuan.tsx — Halaman daftar pertemuan (72 pertemuan) & detail tiap pertemuan (Senin/Rabu, 6 JP/270 menit).
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, useAuth, useSiswaStatus, Card, Btn, Badge, LockedNotice, Spinner, Empty, PageTitle, Toast, Field, inputCls, DataDemo, cx } from "./lib";
import { MateriLengkap, EditorModul } from "./modul";

const HARI = ["senin", "rabu"] as const;
export const LABEL_HARI: Record<string, string> = { senin: "Senin", rabu: "Rabu" };
const MENIT_PER_PERTEMUAN = 270;

export const urutPertemuan = (minggu: number, hari: string) => (minggu - 1) * 2 + (hari === "senin" ? 1 : 2);
export const dariUrutan = (n: number) => {
  const minggu = Math.floor((n - 1) / 2) + 1;
  const hari = (n - 1) % 2 === 0 ? "senin" : "rabu";
  return { minggu, hari };
};

/* ---------------- 1. Daftar pertemuan ---------------- */
export function PertemuanHub() {
  const { status } = useSiswaStatus();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [sem, setSem] = useState<1 | 2 | 0>(0);
  const mingguAktif = status?.minggu_aktif;
  const pertemuanAktif = status?.pertemuan_aktif || "senin";
  const terkunciPertemuan = status?.controls?.pertemuan === false;

  const [prog, setProg] = useState<Record<number, string[]>>({});

  useEffect(() => { api("/api/kurikulum").then(r => setWeeks(r.weeks || [])).catch(() => {}); }, []);

  const tampil = useMemo(() => weeks.filter(w => (sem === 0 ? true : w.semester === sem)), [weeks, sem]);
  const isSiswa = !!status; // status hanya tersedia bagi siswa

  // penanda progres per pertemuan (aktivitas tersimpan berisi "senin" dan/atau "rabu")
  useEffect(() => {
    if (!isSiswa) return;
    api("/api/siswa/progress").then(r => {
      const map: Record<number, string[]> = {};
      for (const p of r.progress || []) {
        try { map[p.week_nomor] = JSON.parse(p.aktivitas || "[]"); } catch { map[p.week_nomor] = []; }
      }
      setProg(map);
    }).catch(() => {});
  }, [isSiswa]);

  return (
    <div>
      <PageTitle title="Pertemuan Pembelajaran" sub="72 pertemuan · Senin & Rabu · masing-masing 6 JP (270 menit) — pilih pertemuan untuk melihat agenda, aktivitas, LKPD, dan simulasi" />

      {isSiswa && (
        <Card className={cx("mb-5 p-5", terkunciPertemuan ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Pertemuan aktif saat ini</div>
              <div className="mt-1 text-lg font-semibold text-slate-800">
                Minggu {mingguAktif ?? "—"} · {LABEL_HARI[pertemuanAktif]} · 6 JP / 270 menit
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Status pembelajaran: <b>{status?.status_pembelajaran === "running" ? "berlangsung" : status?.status_pembelajaran === "paused" ? "dijeda" : status?.status_pembelajaran === "ended" ? "selesai" : "belum dimulai"}</b>
                {" · "}Pertemuan ini {terkunciPertemuan ? "belum dibuka guru" : "sudah dibuka guru"}.
              </div>
            </div>
            <Link to={`/pertemuan/${mingguAktif}/${pertemuanAktif}`}><Btn variant={terkunciPertemuan ? "ghost" : "primary"}>Buka pertemuan ini</Btn></Link>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {([[0, "Semua semester"], [1, "Semester 1"], [2, "Semester 2"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setSem(v as any)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", sem === v ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>{l}</button>
        ))}
        <span className="text-xs text-slate-500">🔒 = menunggu dibuka guru (server membatasi akses materi)</span>
      </div>

      {weeks.length === 0 ? <Spinner /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tampil.map(w => {
            const terkunci = w.akses === "terkunci";
            return (
              <Card key={w.minggu} className={cx("p-4", terkunci && "bg-slate-50")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone={w.semester === 1 ? "blue" : "violet"}>Minggu {w.minggu}</Badge>
                      <Badge tone="slate">Sem {w.semester}</Badge>
                      {terkunci && <Badge tone="amber">🔒 menunggu guru</Badge>}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">{w.tema}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {HARI.map(h => {
                    const selesaiPertemuan = (prog[w.minggu] || []).includes(h);
                    return (
                      <Link key={h} to={`/pertemuan/${w.minggu}/${h}`}>
                        <div className={cx("rounded-xl border px-3 py-2 text-center text-sm hover:border-blue-400 hover:bg-blue-50",
                          selesaiPertemuan ? "border-green-300 bg-green-50 text-green-900" : "border-slate-200 text-slate-700")}>
                          <div className="font-medium">{LABEL_HARI[h]} {selesaiPertemuan && "✓"}</div>
                          <div className="text-xs">{selesaiPertemuan ? "sudah ditandai siswa" : "6 JP · 270′"}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {isSiswa && <div className="mt-5"><DataDemo text="Daftar pertemuan, tema, dan status buka/kunci berasal dari data contoh (seed) 36 minggu." /></div>}
    </div>
  );
}

/* ---------------- 2. Detail pertemuan ---------------- */
export function PertemuanDetail() {
  const { minggu, hari } = useParams();
  const navigasi = useNavigate();
  const { user } = useAuth();
  const { status, refresh } = useSiswaStatus();
  const [data, setData] = useState<any | null>(null);
  const [err, setErr] = useState<any | null>(null);
  const [toast, setToast] = useState("");
  const [refleksi, setRefleksi] = useState("");
  const [progress, setProgress] = useState("belum");
  const [aktivitasProg, setAktivitasProg] = useState<string[]>([]);

  const nomor = Number(minggu);
  const h = (hari || "senin").toLowerCase();

  useEffect(() => {
    setData(null); setErr(null);
    api(`/api/siswa/pertemuan/${nomor}/${h}`).then(setData).catch(e => setErr(e));
    if (user?.role === "siswa") {
      api("/api/siswa/progress").then(r => {
        const p = (r.progress || []).find((x: any) => x.week_nomor === nomor);
        setProgress(p?.status || "belum");
        try { setAktivitasProg(p ? JSON.parse(p.aktivitas || "[]") : []); } catch { setAktivitasProg([]); }
      }).catch(() => {});
    }
  }, [nomor, h, user?.role]);

  if (err) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <LockedNotice title={`Pertemuan Minggu ${nomor} (${LABEL_HARI[h] || h}) belum dapat dibuka`} reason={err.message} />
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => { setErr(null); api(`/api/siswa/pertemuan/${nomor}/${h}`).then(setData).catch(setErr); refresh(); }}>↻ Cek izin guru</Btn>
          <Link to="/pertemuan"><Btn variant="ghost">← Daftar pertemuan</Btn></Link>
        </div>
      </div>
    );
  }
  if (!data) return <Spinner label="Memuat pertemuan…" />;

  const p = data.pertemuan;
  const totalMenit = (p.agenda || []).reduce((a: number, x: any) => a + (x.menit || 0), 0);
  const urut = urutPertemuan(nomor, h);
  const sebelum = urut > 1 ? dariUrutan(urut - 1) : null;
  const sesudah = urut < 72 ? dariUrutan(urut + 1) : null;
  const isSiswa = user?.role === "siswa";
  const simId = data.simulasi?.id;
  const simulasiSiap = simId && !["sim-k3-ergonomi", "sim-sketsa-lab", "sim-technopreneur", "sim-studio-dkv"].includes(simId);

  const tandai = async () => {
    try {
      const r = await api("/api/siswa/progress", { method: "POST", body: { week_nomor: nomor, aktivitas: [h] } });
      setProgress(r.status || "berjalan");
      setAktivitasProg(r.aktivitas || []);
      setToast(r.status === "selesai"
        ? `Kedua pertemuan minggu ${nomor} sudah ditandai — status minggu menjadi “selesai”.`
        : `Pertemuan ${LABEL_HARI[h]} minggu ${nomor} ditandai selesai. Tandai pertemuan ${LABEL_HARI[h === "senin" ? "rabu" : "senin"]} untuk menyelesaikan minggu ini.`);
    } catch (e: any) { setToast(`Gagal: ${e.message}`); }
  };
  const muatUlang = () => api(`/api/siswa/pertemuan/${nomor}/${h}`).then(setData).catch(setErr);
  const kirimRefleksi = async () => {
    if (!refleksi.trim()) return setToast("Tulis refleksi terlebih dahulu.");
    try {
      await api("/api/refleksi", { method: "POST", body: { week_nomor: nomor, isi: `[${LABEL_HARI[h]} m${nomor}] ${refleksi}` } });
      setRefleksi(""); setToast("Refleksi tersimpan dan dapat dilihat guru.");
    } catch (e: any) { setToast(`Gagal: ${e.message}`); }
  };
  const simAllowed = !isSiswa || (status?.controls?.simulasi !== false && status?.allow_simulation !== false);
  const lkpdTerkunci = isSiswa && status?.controls?.lkpd === false;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link to="/pertemuan" className="hover:text-blue-700">Pertemuan</Link><span>›</span>
            <Link to={`/materi/${nomor}`} className="hover:text-blue-700">Minggu {nomor}</Link><span>›</span>
            <span className="font-medium text-slate-700">{LABEL_HARI[h]}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{p.tema}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="blue">Minggu {nomor} · Semester {data.semester}</Badge>
            <Badge tone="slate">{LABEL_HARI[h]}</Badge>
            <Badge tone="violet">{p.jp} JP · {p.menit} menit</Badge>
            {data.aktif_sekarang && <Badge tone="green">pertemuan aktif sekarang</Badge>}
            {isSiswa && <Badge tone={progress === "selesai" ? "green" : progress === "berjalan" ? "amber" : "slate"}>progres minggu: {progress}</Badge>}
            {isSiswa && aktivitasProg.includes(h) && <Badge tone="green">pertemuan ini ditandai ✓</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {sebelum && <Link to={`/pertemuan/${sebelum.minggu}/${sebelum.hari}`}><Btn variant="ghost">← {LABEL_HARI[sebelum.hari]} m{sebelum.minggu}</Btn></Link>}
          {sesudah && <Link to={`/pertemuan/${sesudah.minggu}/${sesudah.hari}`}><Btn variant="ghost">{LABEL_HARI[sesudah.hari]} m{sesudah.minggu} →</Btn></Link>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">⏱️ Agenda pertemuan</h2>
            <Badge tone="slate">total {totalMenit}′ dari {MENIT_PER_PERTEMUAN}′</Badge>
          </div>
          <ol className="mt-3 space-y-3">
            {(p.agenda || []).map((a: any, i: number) => {
              const lewat = (p.agenda || []).slice(0, i).reduce((s: number, x: any) => s + (x.menit || 0), 0);
              return (
                <li key={i} className="flex gap-3">
                  <div className="w-16 shrink-0 text-right">
                    <div className="text-xs font-medium text-slate-500">menit {lewat + 1}–{lewat + (a.menit || 0)}</div>
                    <div className="text-sm font-semibold text-blue-700">{a.menit}′</div>
                  </div>
                  <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-sm font-medium text-slate-800">{a.tahap}</div>
                    <div className="mt-0.5 text-sm text-slate-600">{a.kegiatan}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-800">🎯 Tujuan yang dilatih</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{(data.tujuan || []).map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">Tujuan ini adalah rumusan usulan pembelajaran; CP/ATP resmi masih perlu diverifikasi sekolah.</div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-800">🧩 Aktivitas</h2>
            {[["💡 Memahami", data.aktivitas?.memahami], ["🛠️ Mengaplikasi", data.aktivitas?.mengaplikasi], ["🪞 Merefleksi", data.aktivitas?.merefleksi]].map(([t, arr]: any) => (
              <div key={t} className="mt-3">
                <div className="text-sm font-medium text-slate-700">{t}</div>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-600">{(arr || []).map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-800">📎 Kelengkapan pertemuan</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="font-medium text-slate-700">LKPD / tugas</div>
                  <div className="text-xs text-slate-500">{data.lkpd?.judul || "Tidak ada LKPD khusus pada minggu ini"}</div>
                </div>
                <Link to="/tugas"><Btn variant="ghost">{lkpdTerkunci ? "Terbuka di menu LKPD" : "Buka LKPD"}</Btn></Link>
              </div>
              <div className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="font-medium text-slate-700">Simulasi</div>
                  <div className="text-xs text-slate-500">{data.simulasi?.judul || "Tidak dijadwalkan simulasi digital (praktik langsung)"}</div>
                </div>
                {data.simulasi ? <Link to={`/simulasi/${simId}`}><Btn variant="ghost">{simAllowed ? "Jalankan" : "Lihat"}</Btn></Link> : <Badge tone="slate">praktik kelas</Badge>}
              </div>
              <div className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="font-medium text-slate-700">Asesmen</div>
                  <div className="text-xs text-slate-500">
                    {data.asesmenFormatif ? `${data.asesmenFormatif.bentuk} · ${data.asesmenFormatif.jumlahSoal} soal — ${data.asesmenFormatif.cakupan}` : "—"}
                  </div>
                </div>
                <Link to="/asesmen"><Btn variant="ghost">Lihat</Btn></Link>
              </div>
            </div>
            {!simulasiSiap && data.simulasi && <div className="mt-2 text-xs text-amber-800">Simulasi ini masih berlabel “dalam pengembangan” pada aplikasi.</div>}
          </Card>

          {!!(data.kriteriaKeberhasilan || []).length && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-800">✅ Kriteria keberhasilan</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{data.kriteriaKeberhasilan.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
            </Card>
          )}

          {isSiswa && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-800">🪞 Refleksi cepat pertemuan ini</h2>
              <Field label="Apa yang kamu pahami / masih sulit?">
                <textarea className={cx(inputCls, "h-20")} value={refleksi} onChange={e => setRefleksi(e.target.value)} placeholder="Contoh: saya paham tahapan produksi, tetapi masih bingung membedakan revisi dan proofing." />
              </Field>
              <div className="mt-2 flex flex-wrap gap-2">
                <Btn onClick={kirimRefleksi}>Kirim refleksi</Btn>
                <Btn variant="ghost" onClick={tandai}>Tandai pertemuan selesai</Btn>
              </div>
              <div className="mt-2 text-xs text-slate-500">Progres disimpan per minggu (bukan per pertemuan) agar sesuai struktur penilaian.</div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-800">Modul materi pertemuan {LABEL_HARI[h]} minggu {nomor}</h2>
          <Badge tone="blue">9 bagian wajib</Badge>
        </div>
        <MateriLengkap modul={data.modul} minggu={nomor} hari={h} terkunci={isSiswa && status?.controls?.kuis === false} onRefresh={refresh} />
      </div>

      {(user?.role === "guru" || user?.role === "admin") && (
        <div className="mt-4">
          <EditorModul minggu={nomor} hari={h} modul={data.modul} onSaved={muatUlang} />
        </div>
      )}

      <DataDemo text="Agenda, aktivitas, LKPD, materi, dan asesmen pertemuan ini adalah rancangan contoh (seed) yang dapat disunting guru." />
    </div>
  );
}
