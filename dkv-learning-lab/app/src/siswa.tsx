// siswa.tsx — Halaman peserta didik: dashboard, materi, tugas/asesmen, portofolio.
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, useAuth, useSiswaStatus, Card, Btn, Badge, Progress, LockedNotice, Spinner, Empty, PageTitle, Field, inputCls, Toast, cx, DataDemo } from "./lib";
import { SimulasiEmbed } from "./sims";

const STATUS_LABEL: Record<string, { t: string; tone: any }> = {
  none: { t: "Pembelajaran belum dimulai", tone: "slate" },
  running: { t: "Pembelajaran sedang berlangsung", tone: "green" },
  paused: { t: "Pembelajaran dijeda", tone: "amber" },
  ended: { t: "Pembelajaran selesai", tone: "blue" },
};

export function StatusPembelajaran() {
  const { status, koneksi } = useSiswaStatus();
  if (!status) return <Card className="p-5"><Spinner label="Menghubungkan ke kelas…" /></Card>;
  const st = STATUS_LABEL[status.status_pembelajaran] || STATUS_LABEL.none;
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cx("h-2.5 w-2.5 rounded-full", status.status_pembelajaran === "running" ? "bg-emerald-500" : status.status_pembelajaran === "paused" ? "bg-amber-500" : "bg-slate-300")} />
            <span className="font-semibold text-slate-800">{st.t}</span>
            <Badge tone={st.tone}>{{ none: "menunggu instruksi guru", running: "berlangsung", paused: "dijeda", ended: "selesai" }[status.status_pembelajaran as string] || "menunggu instruksi guru"}</Badge>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Kelas <b>{status.kelas?.nama || "—"}</b> · Pekan berjalan <b>Minggu {status.pekan_berjalan}</b> · Pertemuan aktif: <b className="capitalize">{status.pertemuan_aktif}</b> (Minggu {status.minggu_aktif})
          </div>
        </div>
        <div className="text-right text-xs">
          <div className={koneksi === "ok" ? "text-emerald-600" : "text-rose-600"}>
            {koneksi === "ok" ? "● Terhubung ke kontrol guru" : "● Koneksi kontrol terputus — perubahan belum tentu diterapkan"}
          </div>
          <div className="mt-1 text-slate-400">Sinkronisasi otomatis setiap ±5 detik</div>
        </div>
      </div>
      {status.status_pembelajaran === "paused" && (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Guru menjeda pembelajaran. Kerjakan yang ada di layar; tunggu instruksi untuk melanjutkan.</div>
      )}
      {status.status_pembelajaran === "none" && (
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">Belum ada sesi yang dimulai guru. Menu dapat dijelajahi sesuai izin; tunggu instruksi guru untuk memulai.</div>
      )}
      {status.status_pembelajaran === "ended" && (
        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">Sesi pembelajaran terakhir telah diakhiri guru. Progres dan jawabanmu tetap tersimpan.</div>
      )}
    </Card>
  );
}

export function SiswaDashboard() {
  const { user, meta } = useAuth();
  const { status } = useSiswaStatus();
  const [tugas, setTugas] = useState<any[]>([]);
  const [pengumuman, setPengumuman] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [porto, setPorto] = useState<number>(0);
  useEffect(() => {
    api("/api/tugas").then(r => setTugas(r.tugas || [])).catch(() => {});
    api("/api/siswa/announcements").then(r => setPengumuman(r.announcements || [])).catch(() => {});
    api("/api/siswa/progress").then(r => setProgress(r.progress || [])).catch(() => {});
    api("/api/portofolio").then(r => setPorto((r.portofolio || []).length)).catch(() => {});
  }, []);
  const belum = tugas.filter(t => !t.status_kumpul);
  const selesai = progress.filter(p => p.status === "selesai").length;
  const pekan = meta?.pekan_berjalan || 1;
  const ctrl = status?.controls || {};
  return (
    <div className="space-y-6">
      <PageTitle title={`Assalamualaikum, ${user?.nama_lengkap?.split(" ")[0]} 👋`} sub="Ringkasan pembelajaran Dasar-Dasar DKV pekan ini" />
      <StatusPembelajaran />
      <div className="grid gap-4 md:grid-cols-4">
        {[["Minggu berjalan", `Minggu ${pekan}`, "📅"], ["Progres materi", `${selesai}/36 minggu`, "📈"], ["Tugas belum selesai", `${belum.length}`, "📝"], ["Karya portofolio", `${porto}`, "🎨"]].map(([l, v, i]) => (
          <Card key={l as string} className="p-4">
            <div className="text-2xl">{i}</div>
            <div className="mt-2 text-xs text-slate-500">{l}</div>
            <div className="text-lg font-bold text-slate-900">{v}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Materi minggu ini</h3>
            {ctrl.materi === false ? <Badge tone="rose">Materi ditutup guru</Badge> : <Badge tone="green">Materi terbuka</Badge>}
          </div>
          <p className="text-sm text-slate-600">Minggu {pekan}: lihat detail materi, tujuan, pemantik, dan agenda pertemuan pada menu Materi Pembelajaran.</p>
          <div className="mt-4 flex gap-2">
            <Link to={`/materi/${pekan}`}><Btn disabled={ctrl.materi === false}>Buka materi minggu {pekan}</Btn></Link>
            <Link to="/materi"><Btn variant="ghost">Semua minggu</Btn></Link>
          </div>
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs text-slate-500"><span>Progres tahun pembelajaran</span><span>{selesai}/36 minggu</span></div>
            <Progress value={(selesai / 36) * 100} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Pengumuman guru</h3>
            <Badge tone="amber">data demo</Badge>
          </div>
          {pengumuman.length === 0 && <Empty text="Belum ada pengumuman." />}
          <ul className="space-y-3">
            {pengumuman.slice(0, 4).map(a => (
              <li key={a.id} className="rounded-xl bg-slate-50 p-3">
                <div className="text-sm font-medium text-slate-800">{a.judul}</div>
                <div className="mt-1 text-xs text-slate-500">{a.isi}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="mb-3 font-semibold text-slate-800">Tugas yang belum diselesaikan</h3>
        {belum.length === 0 ? <Empty text="Semua tugas sudah dikumpulkan. Kerja bagus! 🎉" /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {belum.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{t.judul}</div>
                  <div className="text-xs text-slate-500">Minggu {t.week_nomor} · {t.tipe.toUpperCase()} · bobot {t.bobot}</div>
                </div>
                <Link to="/tugas"><Btn variant="ghost">Kerjakan</Btn></Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
export function MateriList() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [sem, setSem] = useState<number | 0>(0);
  const { status } = useSiswaStatus();
  useEffect(() => { api("/api/kurikulum").then(r => setWeeks(r.weeks || [])).catch(() => {}); }, []);
  const filtered = weeks.filter(w =>
    (sem === 0 || w.semester === sem) &&
    (q === "" || w.tema.toLowerCase().includes(q.toLowerCase()) || String(w.minggu) === q.trim()));
  const ctrl = status?.controls || {};
  return (
    <div>
      <PageTitle title="Materi Pembelajaran" sub="36 minggu · 2 pertemuan/pekan · terhubung dengan buku Dasar-Dasar DKV Kelas X" />
      <div className="mb-5 flex flex-wrap gap-2">
        <input className={cx(inputCls, "max-w-xs")} placeholder="Cari minggu / tema…" value={q} onChange={e => setQ(e.target.value)} />
        {[0, 1, 2].map(s => (
          <Btn key={s} variant={sem === s ? "dark" : "ghost"} onClick={() => setSem(s as any)}>{s === 0 ? "Semua" : `Semester ${s}`}</Btn>
        ))}
      </div>
      {user?.role === "siswa" && (ctrl.materi === false) && <LockedNotice title="Menu Materi belum dibuka oleh guru" reason="Anda tetap dapat melihat daftar minggu. Isi materi akan terbuka setelah guru mengaktifkan." />}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(w => {
          const locked = user?.role === "siswa" && w.akses === "terkunci";
          return (
            <Link key={w.minggu} to={`/materi/${w.minggu}`} className="group">
              <Card className={cx("h-full p-4 transition group-hover:-translate-y-0.5 group-hover:shadow-md", locked && "opacity-70")}>
                <div className="flex items-center justify-between">
                  <Badge tone={w.semester === 1 ? "blue" : "violet"}>Minggu {w.minggu} · Sem {w.semester}</Badge>
                  {locked ? <Badge tone="rose">🔒 terkunci</Badge> : <Badge tone="green">terbuka</Badge>}
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-800">{w.tema}</h3>
                <div className="mt-2 line-clamp-2 text-xs text-slate-500">{(w.tujuan || []).slice(0, 2).join(" · ")}</div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(w.sumber || []).slice(0, 2).map((s: any, i: number) => (
                    <Badge key={i} tone="slate">{s.kode}{s.halaman ? ` hal. ${s.halaman}` : ""}</Badge>
                  ))}
                  {w.simulasi && <Badge tone="amber">🧪 simulasi</Badge>}
                  {w.proyek && <Badge tone="violet">🏆 proyek</Badge>}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function MateriDetail() {
  const { nomor } = useParams();
  const { user } = useAuth();
  const [week, setWeek] = useState<any | null>(null);
  const [err, setErr] = useState<any | null>(null);
  const [progress, setProgress] = useState<string>("belum");
  const [refleksi, setRefleksi] = useState("");
  const [toast, setToast] = useState("");
  const { status } = useSiswaStatus();

  useEffect(() => {
    setWeek(null); setErr(null);
    api(`/api/kurikulum/${nomor}`).then(r => setWeek(r.week)).catch(e => setErr(e));
    if (user?.role === "siswa") {
      api("/api/siswa/progress").then(r => {
        const p = (r.progress || []).find((x: any) => x.week_nomor === Number(nomor));
        setProgress(p?.status || "belum");
      }).catch(() => {});
    }
  }, [nomor]);

  if (err) return <LockedNotice title="Materi belum terbuka" reason={err.message} />;
  if (!week) return <Spinner label="Memuat materi…" />;
  const ctrl = status?.controls || {};
  const isSiswa = user?.role === "siswa";

  const tandai = async (s: string) => {
    await api("/api/siswa/progress", { method: "POST", body: { week_nomor: week.minggu, status: s } });
    setProgress(s); setToast(s === "selesai" ? "Minggu ditandai selesai." : "Progress diperbarui.");
  };
  const simAllowed = !isSiswa || (ctrl.simulasi !== false && status?.allow_simulation !== false);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={week.semester === 1 ? "blue" : "violet"}>Minggu {week.minggu} · Semester {week.semester}</Badge>
            <Badge tone="slate">{week.statusSumber === "sesuai-buku" ? "sesuai buku" : "perlu verifikasi guru"}</Badge>
            {isSiswa && <Badge tone={progress === "selesai" ? "green" : progress === "berjalan" ? "amber" : "slate"}>progres: {progress}</Badge>}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{week.tema}</h1>
        </div>
        <div className="flex gap-2">
          {Number(nomor) > 1 && <Link to={`/materi/${Number(nomor) - 1}`}><Btn variant="ghost">← Minggu {Number(nomor) - 1}</Btn></Link>}
          {Number(nomor) < 36 && <Link to={`/materi/${Number(nomor) + 1}`}><Btn variant="ghost">Minggu {Number(nomor) + 1} →</Btn></Link>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-800">🎯 Tujuan Pembelajaran</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{week.tujuan.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
          <h2 className="mt-5 font-semibold text-slate-800">❓ Pertanyaan Pemantik</h2>
          <ul className="mt-2 space-y-1 text-sm italic text-slate-600">{week.pemantik.map((t: string, i: number) => <li key={i}>“{t}”</li>)}</ul>
          <h2 className="mt-5 font-semibold text-slate-800">📖 Materi Inti</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{week.materiInti.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
          <h2 className="mt-5 font-semibold text-slate-800">🧭 Peta Konsep</h2>
          <div className="mt-2 flex flex-wrap gap-2">{week.petaKonsep.map((p: string, i: number) => <Badge key={i} tone="blue">{p}</Badge>)}</div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-800">📚 Sumber</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {week.sumber.map((s: any, i: number) => (
                <li key={i} className="rounded-lg bg-slate-50 p-2">
                  <b>{s.kode}</b> {s.bab || ""} — {s.subbab || s.ket || "—"} {s.halaman ? `(hal. ${s.halaman})` : ""}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold text-slate-800">🗝️ Kata Kunci</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">{week.kataKunci.map((k: string, i: number) => <Badge key={i} tone="slate">{k}</Badge>)}</div>
          </Card>
          {isSiswa && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-800">✅ Progres saya</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn variant={progress === "berjalan" ? "dark" : "ghost"} onClick={() => tandai("berjalan")}>Sedang berjalan</Btn>
                <Btn variant={progress === "selesai" ? "success" : "ghost"} onClick={() => tandai("selesai")}>Tandai selesai</Btn>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[["Senin", week.pertemuanSenin], ["Rabu", week.pertemuanRabu]].map(([hari, p]: any) => (
          <Card key={hari} className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">🗓️ Pertemuan {hari}</h2>
              <div className="flex items-center gap-2">
                <Badge tone="blue">{p.jp} JP · {p.menit} menit</Badge>
                <Link to={`/pertemuan/${week.minggu}/${String(hari).toLowerCase()}`}><Btn variant="ghost">Buka halaman pertemuan</Btn></Link>
              </div>
            </div>
            <p className="mt-1 text-sm font-medium text-blue-700">{p.tema}</p>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {p.agenda.map((a: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 align-top">
                    <td className="w-14 py-2 pr-2 text-xs text-slate-400">{a.menit}′</td>
                    <td className="py-2">
                      <div className="font-medium text-slate-700">{a.tahap}</div>
                      <div className="text-xs text-slate-500">{a.kegiatan}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[["💡 Memahami", week.aktivitas.memahami], ["🛠️ Mengaplikasi", week.aktivitas.mengaplikasi], ["🪞 Merefleksi", week.aktivitas.merefleksi]].map(([t, arr]: any) => (
          <Card key={t} className="p-5">
            <h2 className="font-semibold text-slate-800">{t}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{arr.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
          </Card>
        ))}
      </div>

      {week.simulasi && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-800">🧪 Simulasi: {week.simulasi.judul}</h2>
            <Badge tone="amber">simulasi edukatif — bukan pengganti perangkat lunak profesional</Badge>
          </div>
          {simAllowed ? (
            <div className="mt-3"><SimulasiEmbed id={week.simulasi.id} /></div>
          ) : (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">Simulasi belum diizinkan guru pada sesi ini.</div>
          )}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold text-slate-800">📝 LKPD: {week.lkpd.judul}</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">{week.lkpd.langkah.map((l: string, i: number) => <li key={i}>{l}</li>)}</ol>
          <div className="mt-3 text-xs text-slate-500">Bobot {week.lkpd.bobot}. Kumpulkan jawaban melalui menu <b>LKPD & Asesmen</b>.</div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-slate-800">🧾 Asesmen & Kriteria</h2>
          <div className="mt-2 text-sm text-slate-600">Formatif: {week.asesmenFormatif.bentuk} · {week.asesmenFormatif.jumlahSoal} butir<br />Cakupan: {week.asesmenFormatif.cakupan}</div>
          <h3 className="mt-4 text-sm font-semibold text-slate-800">Kriteria keberhasilan</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">{week.kriteriaKeberhasilan.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
          {week.proyek && (
            <div className="mt-4 rounded-xl bg-violet-50 p-3 text-sm">
              <b>🏆 {week.proyek.judul}</b> <Badge tone="violet">{week.proyek.jenis}</Badge>
              <div className="mt-1 text-xs text-slate-600">Luaran: {week.proyek.luaran} · Tenggat: {week.proyek.tenggat}</div>
            </div>
          )}
        </Card>
      </div>

      {isSiswa && (
        <Card className="p-5">
          <h2 className="font-semibold text-slate-800">🪞 Refleksi Singkat Minggu {week.minggu}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm italic text-slate-600">
            {week.refleksiSiswa.map((r: string, i: number) => <li key={i}>{r}</li>)}
          </ul>
          <div className="mt-3">
            <Field label="Tulis refleksimu">
              <textarea className={cx(inputCls, "min-h-24")} value={refleksi} onChange={e => setRefleksi(e.target.value)} placeholder="Apa yang saya pelajari, apa yang masih sulit…" />
            </Field>
            <div className="mt-2">
              <Btn onClick={async () => {
                if (!refleksi.trim()) return;
                await api("/api/refleksi", { method: "POST", body: { week_nomor: week.minggu, isi: refleksi } });
                setRefleksi(""); setToast("Refleksi tersimpan. Terima kasih!");
              }}>Simpan refleksi</Btn>
            </div>
          </div>
        </Card>
      )}

      {week.catatanVerifikasi && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Catatan penyesuaian (untuk guru):</b> {week.catatanVerifikasi}
        </div>
      )}
    </div>
  );
}

export function TugasSiswa() {
  const [data, setData] = useState<any>({ tugas: [], lkpd_open: true });
  const [jawaban, setJawaban] = useState<Record<number, any>>({});
  const [toast, setToast] = useState("");
  const { status } = useSiswaStatus();
  const load = () => api("/api/tugas").then(setData).catch(() => {});
  useEffect(() => { load(); }, []);
  const ctrl = status?.controls || {};
  return (
    <div className="mx-auto max-w-4xl">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <PageTitle title="LKPD & Asesmen" sub="Kerjakan lembar kerja dan kuis; jawaban tersimpan walau menu dikunci guru" />
      {ctrl.lkpd === false && <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Menu LKPD sedang ditutup guru. Jawaban lama tetap aman; pengumpulan baru menunggu menu dibuka.</div>}
      <div className="space-y-4">
        {data.tugas.length === 0 && <Empty text="Belum ada tugas." />}
        {data.tugas.map((t: any) => {
          const sudah = !!t.status_kumpul;
          const soal = t.tipe === "kuis" && t.soal ? JSON.parse(t.soal) : null;
          return (
            <Card key={t.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={t.tipe === "kuis" ? "violet" : "blue"}>{t.tipe.toUpperCase()}</Badge>
                    <Badge tone="slate">Minggu {t.week_nomor}</Badge>
                    {sudah && <Badge tone={t.status_kumpul === "graded" ? "green" : "amber"}>{t.status_kumpul === "graded" ? "dinilai" : "terkumpul"}</Badge>}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-800">{t.judul}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t.deskripsi}</p>
                </div>
                <div className="text-right text-xs text-slate-500">bobot {t.bobot}{t.skor != null && <div className="mt-1 text-sm font-semibold text-slate-800">Skor: {t.skor}</div>}</div>
              </div>
              {t.umpan_balik && <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800"><b>Umpan balik guru:</b> {t.umpan_balik}</div>}
              {soal ? (
                <div className="mt-4 space-y-3">
                  {soal.map((s: any, i: number) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-3">
                      <div className="text-sm font-medium text-slate-800">{i + 1}. {s.q}</div>
                      <div className="mt-2 grid gap-1.5 md:grid-cols-2">
                        {s.opsi.map((o: string, j: number) => (
                          <label key={j} className={cx("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                            (jawaban[t.id]?.[i] === j) ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:bg-slate-50")}>
                            <input type="radio" name={`q${t.id}-${i}`} checked={jawaban[t.id]?.[i] === j}
                              onChange={() => setJawaban(j2 => ({ ...j2, [t.id]: { ...(j2[t.id] || {}), [i]: j } }))} />
                            {o}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Btn disabled={!jawaban[t.id]} onClick={async () => {
                    try {
                      const arr = soal.map((_: any, i: number) => jawaban[t.id]?.[i] ?? -1);
                      const r = await api(`/api/tugas/${t.id}/submit`, { method: "POST", body: { jawaban: arr } });
                      setToast(`Kuis terkirim! Skor otomatis: ${r.skor}/${soal.reduce((a: number, s: any) => a + s.skor, 0)}`); load();
                    } catch (e: any) { setToast(e.message); }
                  }}>Kumpulkan kuis</Btn>
                </div>
              ) : (
                <div className="mt-4">
                  <textarea className={cx(inputCls, "min-h-28")} placeholder="Tulis jawaban LKPD-mu di sini…"
                    defaultValue={t.jawaban ? JSON.parse(t.jawaban) : ""}
                    onChange={e => setJawaban(j => ({ ...j, [t.id]: e.target.value }))} />
                  <div className="mt-2">
                    <Btn disabled={ctrl.lkpd === false} onClick={async () => {
                      try {
                        await api(`/api/tugas/${t.id}/submit`, { method: "POST", body: { jawaban: jawaban[t.id] || (t.jawaban ? JSON.parse(t.jawaban) : "") } });
                        setToast("Jawaban LKPD terkirim."); load();
                      } catch (e: any) { setToast(e.message); }
                    }}>{sudah ? "Perbarui jawaban" : "Kumpulkan"}</Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function PortofolioSiswa() {
  const { status } = useSiswaStatus();
  const portoDikunci = status?.controls?.portofolio === false;
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ judul: "", deskripsi: "", tahap: "konsep", week_nomor: "" });
  const [toast, setToast] = useState("");
  const load = () => api("/api/portofolio").then(r => setItems(r.portofolio || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  return (
    <div className="mx-auto max-w-4xl">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <PageTitle title="Portofolio Digital" sub="Simpan karya tiap minggu, deskripsikan, dan terima umpan balik guru"
        right={<Badge tone="amber">data demo</Badge>} />
      {portoDikunci && <LockedNotice title="Menu Portofolio belum dibuka guru" reason="Karya dan umpan balik yang sudah ada TIDAK terhapus — hanya penambahan/perubahan yang ditutup sementara. Status diperbarui otomatis setiap ±5 detik." />}
      <Card className={cx("mb-6 p-5", portoDikunci && "opacity-60")}>
        <h3 className="font-semibold text-slate-800">Tambah karya</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Judul karya"><input className={inputCls} value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} /></Field>
          <Field label="Minggu ke-"><input type="number" min={1} max={36} className={inputCls} value={form.week_nomor} onChange={e => setForm({ ...form, week_nomor: e.target.value })} /></Field>
          <Field label="Deskripsi singkat"><input className={inputCls} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Pesan, proses, pelajaran…" /></Field>
          <Field label="Tahap pengerjaan">
            <select className={inputCls} value={form.tahap} onChange={e => setForm({ ...form, tahap: e.target.value })}>
              <option value="konsep">Konsep / sketsa</option>
              <option value="proses">Dalam proses</option>
              <option value="revisi">Revisi</option>
              <option value="final">Final</option>
            </select>
          </Field>
        </div>
        <div className="mt-3">
          <Btn onClick={async () => {
            if (!form.judul.trim()) { setToast("Judul karya wajib diisi."); return; }
            await api("/api/portofolio", { method: "POST", body: { ...form, week_nomor: form.week_nomor ? Number(form.week_nomor) : null } });
            setForm({ judul: "", deskripsi: "", tahap: "konsep", week_nomor: "" }); setToast("Karya tersimpan di portofolio."); load();
          }}>Simpan karya</Btn>
        </div>
      </Card>
      {items.length === 0 && <Empty text="Belum ada karya. Mulai dari minggu 1!" />}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(p => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="violet">Minggu {p.week_nomor || "—"}</Badge>
              <Badge tone={p.tahap === "final" ? "green" : "slate"}>{p.tahap}</Badge>
            </div>
            <h3 className="mt-2 font-semibold text-slate-800">{p.judul}</h3>
            <p className="mt-1 text-sm text-slate-600">{p.deskripsi}</p>
            {p.umpan_balik && <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800"><b>Umpan balik guru:</b> {p.umpan_balik}</div>}
            <div className="mt-3 text-xs text-slate-400">Dibuat {new Date(p.created_at).toLocaleString("id-ID")} · revisi ke-{p.revisi_ke}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
