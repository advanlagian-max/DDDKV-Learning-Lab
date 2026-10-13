// guru.tsx — Mode Guru: dashboard, kontrol pembelajaran, sunting materi, penilaian, supervisi, rekap.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, useAuth, Card, Btn, Badge, Field, inputCls, Spinner, Empty, PageTitle, Toast, Progress, DataDemo, cx } from "./lib";

const MEETINGS = [
  { key: "senin", label: "Senin" },
  { key: "rabu", label: "Rabu" },
];

const MENU_LABEL: Record<string, string> = {
  dashboard: "Dashboard siswa",
  materi: "Modul Materi",
  pertemuan: "Pertemuan aktif hari ini",
  simulasi: "Lab Simulasi",
  lkpd: "LKPD / Tugas",
  kuis: "Kuis / Asesmen",
  portofolio: "Portofolio digital",
  referensi: "Referensi / Glosarium",
  navigasi: "Navigasi minggu (prev/next)",
};

const STATUS_SESI: Record<string, { t: string; tone: string }> = {
  none: { t: "Belum dimulai", tone: "slate" },
  running: { t: "Berlangsung", tone: "green" },
  paused: { t: "Dijeda", tone: "amber" },
  ended: { t: "Selesai", tone: "blue" },
};

export function useKelas() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [kelasId, setKelasId] = useState<number>(0);
  useEffect(() => {
    api("/api/guru/kelas").then(r => {
      setKelas(r.kelas || []);
      if ((r.kelas || []).length) setKelasId(prev => prev || r.kelas[0].id);
    }).catch(() => {});
  }, []);
  return { kelas, kelasId, setKelasId };
}

export function KelasPicker({ kelas, kelasId, setKelasId }: any) {
  if (!kelas.length) return <Badge tone="rose">belum ada kelas</Badge>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-600">Kelas:</span>
      <div className="flex flex-wrap gap-1">
        {kelas.map((k: any) => (
          <button key={k.id} onClick={() => setKelasId(k.id)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium",
              k.id === kelasId ? "bg-blue-700 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}>
            {k.nama}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 1. Dashboard Guru ---------------- */
export function GuruDashboard() {
  const { user } = useAuth();
  const { kelas, kelasId, setKelasId } = useKelas();
  const [siswa, setSiswa] = useState<any[]>([]);
  const [kun, setKun] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [sesi, setSesi] = useState<any>(null);
  const [kelola, setKelola] = useState<{ porto: number; portoTanpaUmpan: number; tugas: number; sv: number; dokTerisi: number }>({ porto: 0, portoTanpaUmpan: 0, tugas: 0, sv: 0, dokTerisi: 0 });
  const [err, setErr] = useState("");

  const muat = useCallback(async (kid: number, idsSiswaBaru: Set<number> = new Set()) => {
    if (!kid) return;
    try {
      const [a, b, c] = await Promise.all([
        api(`/api/guru/siswa?kelas_id=${kid}`),
        api(`/api/guru/kontrol?kelas_id=${kid}&meeting=senin`),
        api("/api/guru/submissions"),
      ]);
      setSiswa(a.siswa || []); setKun(b); setSesi(b.sesi); setSubs(c.submissions || []);
      const [d, e, f] = await Promise.all([
        api("/api/portofolio").catch(() => ({ portofolio: [] })),
        api("/api/tugas").catch(() => ({ tugas: [] })),
        api("/api/supervisi").catch(() => ({ supervisi: [] })),
      ]);
      const porto = (d.portofolio || []).filter((k: any) => idsSiswaBaru.has(k.user_id));
      setKelola({
        porto: porto.length, portoTanpaUmpan: porto.filter((k: any) => !k.umpan_balik).length,
        tugas: (e.tugas || []).length, sv: (f.supervisi || []).length,
        dokTerisi: await (async () => {
          try { const g = await api("/api/supervisi/dokumentasi"); return g.terisi || 0; } catch { return 0; }
        })(),
      });
    } catch (e: any) { setErr(e.message); }
  }, []);
  useEffect(() => {
    const idsSiswaBaru = new Set((siswa || []).map((s: any) => s.id));
    muat(kelasId, idsSiswaBaru);
  }, [kelasId, muat]);

  const idsSiswa = useMemo(() => new Set(siswa.map(s => s.id)), [siswa]);
  const subsKelas = subs.filter(s => idsSiswa.has(s.user_id));
  const belumDinilai = subsKelas.filter(s => s.status !== "graded").length;
  const terbuka = kun ? Object.values(kun.controls || {}).filter(Boolean).length : 0;
  const st = STATUS_SESI[sesi?.status || "none"];

  return (
    <div>
      <PageTitle title="Dashboard Guru" sub={`${user?.nama_lengkap || ""} — ringkasan kelas & sesi pembelajaran`}
        right={<Link to="/guru/kontrol"><Btn>🎛️ Kontrol Pembelajaran</Btn></Link>} />
      {err && <Toast msg={err} tone="red" onClose={() => setErr("")} />}
      <div className="mb-4"><KelasPicker kelas={kelas} kelasId={kelasId} setKelasId={setKelasId} /></div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Siswa terdaftar", `${siswa.length}`, "👥", "slate"],
          ["Kiriman belum dinilai", `${belumDinilai}`, "📥", belumDinilai ? "amber" : "green"],
          ["Menu terbuka (Senin)", `${terbuka}/9`, "🔓", "blue"],
          ["Status sesi", st.t, "📡", st.tone],
        ].map(([l, v, i, tone]) => (
          <Card key={l as string} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{l as string}</span><span className="text-xl">{i as string}</span>
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-800">{v as string}</div>
            <div className="mt-2"><Badge tone={tone as string}>{l === "Status sesi" ? `minggu ${sesi?.week_nomor ?? "-"} · ${sesi?.meeting_key ?? "-"}` : "sinkron"}</Badge></div>
          </Card>
        ))}
      </div>

      <div className="mt-6"><DataDemo text="Ringkasan kelas, siswa, dan kiriman pada dashboard ini berasal dari data contoh (seed) untuk demo." /></div>
      <div className="mt-6">
        <h3 className="mb-2 font-semibold text-slate-800">Pusat kendali kelas (kelola materi, tugas, nilai, portofolio, dokumentasi, supervisi)</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { to: "/guru/materi", ikon: "📚", judul: "Materi & suntingan", ket: "36 minggu · 72 pertemuan (modul, tujuan, LKPD, kuis formatif)" },
            { to: "/guru/penilaian", ikon: "🗂️", judul: `Tugas (${kelola.tugas})`, ket: "kelola tugas, nilai kiriman, umpan balik" },
            { to: "/guru/asesmen", ikon: "🎯", judul: "Nilai asesmen 36 minggu", ket: "260 butir · rubrik · rekap · remedial" },
            { to: "/guru/penilaian", ikon: "🎨", judul: `Portofolio (${kelola.porto})`, ket: `${kelola.portoTanpaUmpan} karya belum diberi umpan balik` },
            { to: "/guru/dokumentasi", ikon: "📄", judul: `Dokumentasi pertemuan (${kelola.dokTerisi}/72)`, ket: "tujuan, 3 aktivitas, prinsip mendalam, bukti, observasi, refleksi, tindak lanjut" },
            { to: "/guru/supervisi", ikon: "🪪", judul: `Supervisi akademik (${kelola.sv})`, ket: "instrumen C.1–C.4 sesuai dokumen sekolah + laporan cetak" },
          ].map(k => (
            <Link key={k.judul} to={k.to}>
              <Card className="p-4 transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{k.ikon} {k.judul}</span><span className="text-slate-400">→</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">{k.ket}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800">Langkah cepat pembelajaran hari ini</h3>
          <p className="mt-1 text-sm text-slate-600">Alur yang disarankan: buka menu → aktifkan materi → mulai sesi → pantau di kontrol.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/guru/kontrol"><Btn>1️⃣ Atur kontrol & mulai sesi</Btn></Link>
            <Link to="/guru/materi"><Btn variant="ghost">2️⃣ Periksa materi minggu ini</Btn></Link>
            <Link to="/guru/penilaian"><Btn variant="ghost">3️⃣ Nilai kiriman siswa</Btn></Link>
            <Link to="/guru/supervisi"><Btn variant="ghost">📋 Instrumen supervisi</Btn></Link>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800">Daftar siswa kelas ini</h3>
          {siswa.length === 0 ? <Empty text="Belum ada siswa terdaftar di kelas ini." /> : (
            <ul className="mt-2 max-h-56 divide-y divide-slate-100 overflow-auto text-sm">
              {siswa.map(s => (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <span className="text-slate-700">{s.nama_lengkap}</span>
                  <span className="text-xs text-slate-400">{s.username}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------------- 2. Kontrol Pembelajaran + Mulai Pembelajaran ---------------- */
export function GuruKontrol() {
  const { kelas, kelasId, setKelasId } = useKelas();
  const [meeting, setMeeting] = useState("senin");
  const [kontrol, setKontrol] = useState<any>(null);
  const [sesi, setSesi] = useState<any>(null);
  const [week, setWeek] = useState(2);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const muat = useCallback(async () => {
    if (!kelasId) return;
    const r = await api(`/api/guru/kontrol?kelas_id=${kelasId}&meeting=${meeting}`);
    setKontrol(r.controls); setSesi(r.sesi);
    if (r.sesi?.week_nomor) setWeek(r.sesi.week_nomor);
  }, [kelasId, meeting]);
  useEffect(() => { muat().catch(() => {}); }, [muat]);

  const ubah = async (menu_key: string, enabled: boolean) => {
    setBusy(true);
    try {
      const r = await api("/api/guru/kontrol", { method: "POST", body: { kelas_id: kelasId, meeting, menu_key, enabled } });
      setKontrol(r.controls);
      setToast(`${MENU_LABEL[menu_key]} ${enabled ? "dibuka" : "ditutup"} untuk ${meeting} — berlaku pada perangkat siswa dalam ±5 detik.`);
    } catch (e: any) { setToast(`Gagal: ${e.message}`); }
    setBusy(false);
  };
  const aksiSemua = async (aksi: "aktifkan" | "kunci") => {
    const pesan = aksi === "aktifkan"
      ? `Buka SEMUA menu untuk kelas ini pada pertemuan ${meeting}?`
      : `Kunci SEMUA menu untuk kelas ini pada pertemuan ${meeting}? Jawaban, nilai, dan karya siswa TIDAK terhapus.`;
    if (!window.confirm(pesan)) return;
    setBusy(true);
    try {
      const r = await api("/api/guru/kontrol", { method: "POST", body: { kelas_id: kelasId, meeting, aksi_semua: aksi } });
      setKontrol(r.controls);
      setToast(aksi === "aktifkan" ? "Semua menu dibuka." : "Semua menu dikunci. Data siswa tetap aman.");
    } catch (e: any) { setToast(`Gagal: ${e.message}`); }
    setBusy(false);
  };
  const aksiSesi = async (aksi: string, extra: any = {}) => {
    setBusy(true);
    try {
      const r = await api("/api/guru/sesi", { method: "POST", body: { kelas_id: kelasId, week_nomor: week, meeting_key: meeting, aksi, ...extra } });
      setSesi(r.sesi);
      const label: Record<string, string> = { mulai: "Pembelajaran dimulai", jeda: "Pembelajaran dijeda", lanjut: "Pembelajaran dilanjutkan", akhiri: "Sesi diakhiri — progres siswa tersimpan", konfigurasi: "Konfigurasi sesi disimpan" };
      setToast(`${label[aksi] || aksi}. Status siswa: ${STATUS_SESI[r.sesi?.status || "none"].t}.`);
    } catch (e: any) { setToast(`Gagal: ${e.message}`); }
    setBusy(false);
  };
  const konfig = async (patch: any) => {
    await aksiSesi("konfigurasi", { allow_simulation: patch.allow_simulation ?? sesi?.allow_simulation, lock_navigation: patch.lock_navigation ?? sesi?.lock_navigation });
  };

  const st = STATUS_SESI[sesi?.status || "none"];
  return (
    <div>
      <PageTitle title="Kontrol Pembelajaran" sub="Atur menu siswa, kunci/buka materi, dan jalankan sesi per kelas + pertemuan" />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <KelasPicker kelas={kelas} kelasId={kelasId} setKelasId={setKelasId} />
        <div className="flex gap-1">
          {MEETINGS.map(m => (
            <button key={m.key} onClick={() => setMeeting(m.key)}
              className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", m.key === meeting ? "bg-slate-900 text-white" : "bg-white border border-slate-300 text-slate-700")}>
              Pertemuan {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Sakelar menu siswa</h3>
            <Badge tone="blue">kelas + pertemuan {meeting}</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">Pengetatan berlaku hanya pada kelas & pertemuan yang dipilih — kelas lain tidak terpengaruh.</p>
          <ul className="mt-3 divide-y divide-slate-100">
            {Object.keys(kontrol || {}).map(k => (
              <li key={k} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-700">{MENU_LABEL[k] || k} <span className="ml-1 text-xs text-slate-400">({k})</span></span>
                <button disabled={busy} onClick={() => ubah(k, !kontrol[k])}
                  className={cx("relative h-7 w-14 shrink-0 rounded-full transition", kontrol[k] ? "bg-emerald-500" : "bg-slate-300")}
                  title={kontrol[k] ? "Klik untuk mengunci" : "Klik untuk membuka"}>
                  <span className={cx("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all", kontrol[k] ? "left-7" : "left-0.5")} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn variant="success" disabled={busy} onClick={() => aksiSemua("aktifkan")}>✅ Aktifkan Semua</Btn>
            <Btn variant="danger" disabled={busy} onClick={() => aksiSemua("kunci")}>🔒 Kunci Semua</Btn>
          </div>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">Mengunci menu <b>tidak menghapus</b> jawaban, nilai, atau karya siswa — hanya menutup akses sementara. Siswa melihat pesan “Menu ini belum dibuka oleh guru”.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Mulai Pembelajaran</h3>
            <Badge tone={st.tone}>{st.t}</Badge>
          </div>
          <div className="mt-3 space-y-3">
            <Field label="Minggu yang diajarkan">
              <select className={inputCls} value={week} onChange={e => setWeek(+e.target.value)}>
                {Array.from({ length: 36 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Minggu {n}</option>)}
              </select>
            </Field>
            <Field label="Pertemuan">
              <select className={inputCls} value={meeting} onChange={e => setMeeting(e.target.value)}>
                {MEETINGS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </Field>
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Izinkan simulasi</span>
                <input type="checkbox" className="h-4 w-4" checked={!!sesi?.allow_simulation}
                  onChange={e => konfig({ allow_simulation: e.target.checked })} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Kunci navigasi minggu (prev/next)</span>
                <input type="checkbox" className="h-4 w-4" checked={!!sesi?.lock_navigation}
                  onChange={e => konfig({ lock_navigation: e.target.checked })} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn disabled={busy} onClick={() => aksiSesi("mulai")}>▶ Mulai Pembelajaran</Btn>
              <Btn variant="accent" disabled={busy || sesi?.status !== "running"} onClick={() => aksiSesi("jeda")}>⏸ Jeda</Btn>
              <Btn variant="ghost" disabled={busy || sesi?.status !== "paused"} onClick={() => aksiSesi("lanjut")}>⏵ Lanjutkan</Btn>
              <Btn variant="danger" disabled={busy || !["running", "paused"].includes(sesi?.status)} onClick={() => aksiSesi("akhiri")}>⏹ Akhiri sesi</Btn>
            </div>
            <p className="text-xs text-slate-500">Saat sesi berjalan, siswa pada perangkat masing-masing melihat materi minggu {sesi?.week_nomor ?? week} ({sesi?.meeting_key ?? meeting}) dengan status “berlangsung/dijeda”. Menekan “Akhiri” menyimpan progres siswa.</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h3 className="font-semibold text-slate-800">Urutan kegiatan pertemuan {meeting} (minggu {week})</h3>
        <UrutanKegiatan week={week} meeting={meeting} />
      </Card>

      <JadwalDanKalender />
    </div>
  );
}

/* Pengaturan jadwal/JP/kalender yang dapat diubah guru tanpa menyunting kode */
function JadwalDanKalender() {
  const [s, setS] = useState<any>(null);
  const [pesan, setPesan] = useState("");
  useEffect(() => { api("/api/guru/settings").then(r => setS(r.settings)).catch(e => setPesan(e.message)); }, []);
  const simpan = async (key: string, value: any) => {
    try {
      await api("/api/guru/settings", { method: "PUT", body: { key, value } });
      setS({ ...s, [key]: value });
      setPesan(`${key} diperbarui — langsung dipakai aplikasi.`);
    } catch (e: any) { setPesan(`Gagal: ${e.message}`); }
  };
  if (!s) return null;
  const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return (
    <Card className="mt-6 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Jadwal, jam pelajaran & kalender (tanpa edit kode)</h3>
        <Badge tone="amber">kalender: usulan, verifikasi dulu</Badge>
      </div>
      {pesan && <div className="mt-2 text-sm text-slate-600">{pesan}</div>}
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-slate-700">Hari pembelajaran</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {HARI.map(h => {
                const aktif = (s.hari_pembelajaran || []).includes(h);
                return (
                  <button key={h} onClick={() => {
                    const set = new Set<string>(s.hari_pembelajaran || []);
                    aktif ? set.delete(h) : set.add(h);
                    simpan("hari_pembelajaran", [...set]);
                  }} className={cx("rounded-xl px-3 py-1.5 text-sm", aktif ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>{h}</button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="JP per pertemuan"><input type="number" className={inputCls} defaultValue={s.jp_per_pertemuan}
              onBlur={e => simpan("jp_per_pertemuan", Number(e.target.value))} /></Field>
            <Field label="Menit per pertemuan"><input type="number" className={inputCls} defaultValue={s.menit_per_pertemuan}
              onBlur={e => simpan("menit_per_pertemuan", Number(e.target.value))} /></Field>
            <Field label="Durasi 1 JP (menit)"><input type="number" className={inputCls} defaultValue={s.jam_pelajaran_menit}
              onBlur={e => simpan("jam_pelajaran_menit", Number(e.target.value))} /></Field>
            <Field label="Pekan berjalan"><input type="number" min={1} max={36} className={inputCls} defaultValue={s.pekan_berjalan}
              onBlur={e => simpan("pekan_berjalan", Number(e.target.value))} /></Field>
          </div>
          <Field label="Minggu efektif (JSON)">
            <textarea className={cx(inputCls, "h-24 font-mono text-xs")} defaultValue={JSON.stringify(s.minggu_efektif, null, 1)}
              onBlur={e => { try { simpan("minggu_efektif", JSON.parse(e.target.value)); } catch { setPesan("JSON minggu efektif tidak valid."); } }} />
          </Field>
        </div>
        <div>
          <div className="text-sm font-medium text-slate-700">Kalender pendidikan (libur / asesmen / kegiatan)</div>
          <textarea className={cx(inputCls, "mt-1 h-56 font-mono text-xs")} defaultValue={JSON.stringify(s.kalender_sekolah || [], null, 1)}
            onBlur={e => { try { simpan("kalender_sekolah", JSON.parse(e.target.value)); } catch { setPesan("JSON kalender tidak valid."); } }} />
          <p className="mt-2 text-xs text-amber-800">Isi awal adalah contoh usulan karena kalender pendidikan resmi sekolah belum tersedia — <b>wajib diverifikasi</b> sebelum dipakai.</p>
        </div>
      </div>
    </Card>
  );
}

function UrutanKegiatan({ week, meeting }: { week: number; meeting: string }) {
  const [w, setW] = useState<any>(null);
  const [urut, setUrut] = useState<string[]>([]);
  const [simpan, setSimpan] = useState("");
  useEffect(() => {
    api(`/api/kurikulum/${week}`).then(r => {
      setW(r.week);
      const p = meeting === "senin" ? r.week.pertemuanSenin : r.week.pertemuanRabu;
      setUrut((p?.agenda || []).map((a: any) => (typeof a === "string" ? a : `${a.judul || a.kegiatan || JSON.stringify(a)}`)));
    }).catch(() => {});
  }, [week, meeting]);
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= urut.length) return;
    const c = [...urut]; [c[i], c[j]] = [c[j], c[i]]; setUrut(c);
  };
  const simpanUrut = async () => {
    const key = meeting === "senin" ? "pertemuanSenin" : "pertemuanRabu";
    const asli = (meeting === "senin" ? w?.pertemuanSenin : w?.pertemuanRabu)?.agenda || [];
    const agenda = urut.map((t, i) => {
      const src = asli.find((a: any) => (typeof a === "string" ? a : a.judul || a.kegiatan) === t);
      return typeof src === "string" ? src : (src || { judul: t });
    });
    try {
      await api(`/api/kurikulum/${week}`, { method: "PUT", body: { [key]: { ...(meeting === "senin" ? w.pertemuanSenin : w.pertemuanRabu), agenda } } });
      setSimpan("Urutan kegiatan tersimpan.");
    } catch (e: any) { setSimpan(`Gagal menyimpan: ${e.message}`); }
  };
  if (!w) return <Spinner />;
  return (
    <div className="mt-3">
      <ol className="space-y-1.5">
        {urut.map((t, i) => (
          <li key={`${i}-${t}`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <span className="text-slate-400">{i + 1}.</span>
            <span className="flex-1 text-slate-700">{t}</span>
            <button className="rounded border border-slate-300 px-2 py-0.5" onClick={() => move(i, -1)}>↑</button>
            <button className="rounded border border-slate-300 px-2 py-0.5" onClick={() => move(i, 1)}>↓</button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-3">
        <Btn onClick={simpanUrut}>💾 Simpan urutan</Btn>
        {simpan && <span className="text-sm text-slate-600">{simpan}</span>}
      </div>
    </div>
  );
}

/* ---------------- 3. Sunting Materi ---------------- */
// Nilai pada data kurikulum dapat berbentuk teks ATAU objek (mis. sumber, proyek, asesmenFormatif).
// Fungsi di bawah mencegah galat React "object is not valid as a React child" pada halaman guru.
const teksNilai = (v: any, cadangan = "—") => {
  if (v === null || v === undefined || v === "") return cadangan;
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map((x: any) => teksNilai(x, "")).filter(Boolean).join("; ") || cadangan;
  return v.judul || v.teks || v.nama || v.bentuk || v.kode || v.error || JSON.stringify(v);
};
const teksSumber = (s?: any) => {
  if (!s) return "sumber";
  if (typeof s === "string") return s;
  const judul = [s.kode, s.bab || s.subbab].filter(Boolean).join(" · ");
  return `${judul || "sumber"}${s.halaman ? ` (hal. ${s.halaman})` : ""}`;
};
const teksFormatif = (f?: any) => {
  if (!f) return "—";
  if (typeof f === "string") return f;
  return [f.bentuk, f.jumlahSoal ? `${f.jumlahSoal} butir` : null, f.cakupan].filter(Boolean).join(" · ") || "—";
};
const teksProyek = (p?: any) => {
  if (!p) return "—";
  if (typeof p === "string") return p;
  return [teksNilai(p.judul || p.teks, "proyek"), p.luaran ? `luaran: ${p.luaran}` : null, p.tenggat ? `tenggat ${p.tenggat}` : null]
    .filter(Boolean).join(" — ");
};

export function GuruMateri() {
  const [nomor, setNomor] = useState(1);
  const [w, setW] = useState<any>(null);
  const [tema, setTema] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [pemantik, setPemantik] = useState("");
  const [kataKunci, setKataKunci] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    setW(null);
    api(`/api/kurikulum/${nomor}`).then(r => {
      const x = r.week; setW(x);
      setTema(x.tema || "");
      setTujuan((x.tujuan || []).join("\n"));
      setPemantik((x.pemantik || []).join("\n"));
      setKataKunci((x.kataKunci || []).join(", "));
    }).catch(() => setMsg("Gagal memuat minggu."));
  }, [nomor]);
  const simpan = async () => {
    try {
      const r = await api(`/api/kurikulum/${nomor}`, {
        method: "PUT", body: {
          tema,
          tujuan: tujuan.split("\n").map(s => s.trim()).filter(Boolean),
          pemantik: pemantik.split("\n").map(s => s.trim()).filter(Boolean),
          kataKunci: kataKunci.split(",").map(s => s.trim()).filter(Boolean),
        }
      });
      setW(r.week); setMsg("Perubahan tersimpan & langsung terlihat oleh siswa.");
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };
  return (
    <div>
      <PageTitle title="Materi & Rancangan Minggu" sub="Sunting ringkasan unit; struktur lengkap (LKPD, rubrik, asesmen) tetap tersimpan di data kurikulum" />
      {msg && <Toast msg={msg} onClose={() => setMsg("")} />}
      <Field label="Pilih minggu">
        <select className={inputCls} value={nomor} onChange={e => setNomor(+e.target.value)}>
          {Array.from({ length: 36 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Minggu {n} (Semester {n <= 18 ? 1 : 2})</option>)}
        </select>
      </Field>
      {!w ? <div className="mt-4"><Spinner /></div> : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3 p-5">
            <h3 className="font-semibold text-slate-800">Suntingan</h3>
            <Field label="Tema minggu"><input className={inputCls} value={tema} onChange={e => setTema(e.target.value)} /></Field>
            <Field label="Tujuan pembelajaran (satu per baris)" hint="Tulis sebagai perilaku teramati: “siswa dapat …”">
              <textarea className={cx(inputCls, "h-32")} value={tujuan} onChange={e => setTujuan(e.target.value)} />
            </Field>
            <Field label="Pertanyaan pemantik (satu per baris)">
              <textarea className={cx(inputCls, "h-24")} value={pemantik} onChange={e => setPemantik(e.target.value)} />
            </Field>
            <Field label="Kata kunci (pisahkan dengan koma)">
              <input className={inputCls} value={kataKunci} onChange={e => setKataKunci(e.target.value)} />
            </Field>
            <Btn onClick={simpan}>💾 Simpan perubahan</Btn>
          </Card>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-800">Ringkasan unit minggu {nomor}</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge tone="blue">{teksSumber(w.sumber?.[0])}</Badge>
                <Badge tone="slate">{w.statusSumber === "sumber-buku" ? "sesuai buku" : "usulan perlu verifikasi guru"}</Badge>
                {w.simulasi?.id && <Badge tone="violet">simulasi: {w.simulasi.judul}</Badge>}
                <Badge tone="amber">LKPD: {w.lkpd?.judul ? "ada" : "—"}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600"><b>Proyek/tugas:</b> {teksProyek(w.proyek)}</p>
              <p className="mt-2 text-sm text-slate-600"><b>Asesmen formatif:</b> {teksFormatif(w.asesmenFormatif)}</p>
              <p className="mt-2 text-sm text-slate-600"><b>Catatan verifikasi:</b> {teksNilai(w.catatanVerifikasi)}</p>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-slate-800">Materi inti (dari buku)</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {(w.materiInti || []).slice(0, 8).map((m: any, i: number) => <li key={i}>{typeof m === "string" ? m : m.judul}</li>)}
              </ul>
              <Link to={`/materi/${nomor}`} className="mt-3 inline-block text-sm text-blue-700 underline">Lihat tampilan siswa →</Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 4. Penilaian & Tugas ---------------- */
const SIM_LABEL: Record<string, string> = {
  "sim-tipografi": "Tipografi", "sim-fotografi": "Fotografi", "sim-bitmap-vektor": "Bitmap & Vektor",
  "sim-alur-produksi": "Alur Produksi", "sim-k3-ergonomi": "K3 & Ergonomi", "sim-sketsa-lab": "Sketsa & Ilustrasi",
  "sim-studio-dkv": "Studio DKV",
};

export function GuruPenilaian() {
  const [tab, setTab] = useState<"kiriman" | "tugas" | "karya" | "refleksi" | "laboratorium">("kiriman");
  const [subs, setSubs] = useState<any[]>([]);
  const [porto, setPorto] = useState<any[]>([]);
  const [refleksi, setRefleksi] = useState<any[]>([]);
  const [tugas, setTugas] = useState<any[]>([]);
  const [lab, setLab] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [nilai, setNilai] = useState<Record<number, { skor: string; fb: string }>>({});
  const [fbKarya, setFbKarya] = useState<Record<number, string>>({});
  const [baru, setBaru] = useState({ week_nomor: 2, tipe: "lkpd", judul: "", deskripsi: "", status: "open", meeting_key: "senin" });

  const muat = async () => {
    const [a, b, c, d, e] = await Promise.all([
      api("/api/guru/submissions").catch(() => ({ submissions: [] })),
      api("/api/portofolio").catch(() => ({ portofolio: [] })),
      api("/api/refleksi").catch(() => ({ refleksi: [] })),
      api("/api/tugas").catch(() => ({ tugas: [] })),
      api("/api/simulasi/hasil").catch(() => ({ hasil: [] })),
    ]);
    setSubs(a.submissions || []); setPorto(b.portofolio || []); setRefleksi(c.refleksi || []); setTugas(d.tugas || []);
    setLab((e as any)?.hasil || []);
  };
  useEffect(() => { muat(); }, []);

  const simpanNilai = async (id: number) => {
    const v = nilai[id] || { skor: "", fb: "" };
    if (v.skor === "") return setMsg("Isi skor dulu (0–100).");
    try {
      await api("/api/guru/grade", { method: "POST", body: { submission_id: id, skor: Number(v.skor), umpan_balik: v.fb } });
      setMsg("Nilai & umpan balik tersimpan; siswa langsung melihatnya.");
      muat();
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };
  const simpanKarya = async (id: number) => {
    try {
      await api(`/api/portofolio/${id}/feedback`, { method: "POST", body: { umpan_balik: fbKarya[id] || "" } });
      setMsg("Umpan balik karya tersimpan."); muat();
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };
  const buatTugas = async () => {
    try {
      await api("/api/guru/tugas", { method: "POST", body: baru });
      setMsg("Tugas dibuat."); setBaru({ ...baru, judul: "", deskripsi: "" }); muat();
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };
  const ubahStatus = async (id: number, status: string) => {
    await api("/api/guru/tugas", { method: "POST", body: { id, status } });
    setMsg(`Tugas ${status === "open" ? "dibuka" : status === "closed" ? "ditutup" : "dijadikan draft"}.`); muat();
  };

  return (
    <div>
      <PageTitle title="Penilaian & Tugas" sub="Nilai objektif otomatis (kuis), nilai manual untuk jawaban terbuka & karya visual" />
      {msg && <Toast msg={msg} onClose={() => setMsg("")} />}
      <div className="mb-4 flex flex-wrap gap-1">
        {([["kiriman", "📥 Kiriman siswa"], ["tugas", "🗂️ Kelola tugas"], ["karya", "🎨 Karya portofolio"], ["refleksi", "🪞 Refleksi"], ["laboratorium", "🧪 Hasil laboratorium"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", tab === k ? "bg-blue-700 text-white" : "bg-white border border-slate-300 text-slate-700")}>{l}</button>
        ))}
      </div>

      {tab === "kiriman" && (
        <div className="space-y-3">
          {subs.length === 0 && <Empty text="Belum ada kiriman." />}
          {subs.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-800">{s.nama_lengkap} · {s.tugas_judul}</div>
                  <div className="text-xs text-slate-500">minggu {s.week_nomor} · {s.tipe} · dikirim {s.submitted_at || "—"} · revisi ke-{s.revisi_ke ?? 0}</div>
                </div>
                <Badge tone={s.status === "graded" ? "green" : "amber"}>{s.status === "graded" ? `dinilai: ${s.skor}` : "belum dinilai"}</Badge>
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <b>Jawaban siswa:</b>
                <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-slate-600">{cekJawaban(s.jawaban)}</pre>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[120px_1fr_auto]">
                <input className={inputCls} placeholder="skor 0–100" value={nilai[s.id]?.skor ?? (s.skor ?? "")}
                  onChange={e => setNilai({ ...nilai, [s.id]: { skor: e.target.value, fb: nilai[s.id]?.fb ?? (s.umpan_balik || "") } })} />
                <input className={inputCls} placeholder="umpan balik untuk siswa" value={nilai[s.id]?.fb ?? (s.umpan_balik || "")}
                  onChange={e => setNilai({ ...nilai, [s.id]: { skor: nilai[s.id]?.skor ?? String(s.skor ?? ""), fb: e.target.value } })} />
                <Btn onClick={() => simpanNilai(s.id)}>Simpan nilai</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "tugas" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800">Buat tugas / LKPD baru</h3>
            <div className="mt-3 space-y-3">
              <Field label="Minggu"><input type="number" min={1} max={36} className={inputCls} value={baru.week_nomor} onChange={e => setBaru({ ...baru, week_nomor: +e.target.value })} /></Field>
              <Field label="Pertemuan">
                <select className={inputCls} value={baru.meeting_key} onChange={e => setBaru({ ...baru, meeting_key: e.target.value })}>
                  {MEETINGS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
              </Field>
              <Field label="Jenis">
                <select className={inputCls} value={baru.tipe} onChange={e => setBaru({ ...baru, tipe: e.target.value })}>
                  <option value="lkpd">LKPD</option><option value="tugas">Tugas</option><option value="kuis">Kuis</option><option value="proyek">Proyek</option>
                </select>
              </Field>
              <Field label="Judul"><input className={inputCls} value={baru.judul} onChange={e => setBaru({ ...baru, judul: e.target.value })} /></Field>
              <Field label="Petunjuk singkat"><textarea className={cx(inputCls, "h-20")} value={baru.deskripsi} onChange={e => setBaru({ ...baru, deskripsi: e.target.value })} /></Field>
              <Btn onClick={buatTugas}>➕ Buat tugas</Btn>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800">Daftar tugas</h3>
            <ul className="mt-3 divide-y divide-slate-100">
              {tugas.map(t => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <div className="text-slate-800">{t.judul}</div>
                    <div className="text-xs text-slate-500">minggu {t.week_nomor} · {t.tipe} · bobot {t.bobot ?? 0}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={t.status === "open" ? "green" : t.status === "draft" ? "slate" : "rose"}>{t.status}</Badge>
                    <Btn variant="ghost" onClick={() => ubahStatus(t.id, t.status === "open" ? "closed" : "open")}>
                      {t.status === "open" ? "Tutup" : "Buka"}
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "karya" && (
        <div className="space-y-3">
          {porto.length === 0 && <Empty text="Belum ada karya portofolio." />}
          {porto.map(p => (
            <Card key={p.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-800">{p.judul} — {p.nama_lengkap || "siswa"}</div>
                  <div className="text-xs text-slate-500">minggu {p.week_nomor ?? "-"} · tahap {p.tahap} · {p.created_at}</div>
                </div>
                {p.umpan_balik ? <Badge tone="green">sudah diberi umpan balik</Badge> : <Badge tone="amber">belum ada umpan balik</Badge>}
              </div>
              <p className="mt-2 text-sm text-slate-600">{p.deskripsi}</p>
              <div className="mt-2 flex gap-2">
                <input className={inputCls} placeholder="umpan balik" value={fbKarya[p.id] ?? (p.umpan_balik || "")}
                  onChange={e => setFbKarya({ ...fbKarya, [p.id]: e.target.value })} />
                <Btn onClick={() => simpanKarya(p.id)}>Simpan</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "refleksi" && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800">Refleksi siswa (dan catatan guru)</h3>
          {refleksi.length === 0 ? <Empty text="Belum ada refleksi." /> : (
            <ul className="mt-3 divide-y divide-slate-100">
              {refleksi.map(r => (
                <li key={r.id} className="py-3 text-sm">
                  <div className="text-xs text-slate-500">{(r.nama_lengkap || "guru")} · {r.tipe} · minggu {r.week_nomor ?? "-"} · {r.created_at}</div>
                  <div className="mt-1 text-slate-700">{r.isi}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
      <div className="mt-5"><DataDemo text="Kiriman, karya, dan refleksi yang tercantum adalah data contoh (seed) sampai siswa mengirim pekerjaan nyata." /></div>
      {tab === "laboratorium" && (
        <div className="space-y-3">
          <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Hasil tantangan laboratorium simulasi yang dikumpulkan siswa (dinilai dengan model simulasi, bukan hasil perangkat lunak nyata).
            Setiap baris memuat simulasi, tingkat tantangan, skor kriteria, dan waktu pengumpulan.
          </div>
          {lab.length === 0 && <Empty text="Belum ada hasil laboratorium yang dikumpulkan." />}
          {lab.length > 0 && (
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-3 py-2">Siswa</th><th className="px-3 py-2">Kelas</th><th className="px-3 py-2">Laboratorium</th><th className="px-3 py-2">Tingkat</th><th className="px-3 py-2">Skor kriteria</th><th className="px-3 py-2">Waktu</th></tr>
                  </thead>
                  <tbody>
                    {lab.map(l => (
                      <tr key={l.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-800">{l.nama_lengkap || "—"}</td>
                        <td className="px-3 py-2 text-slate-600">{l.kelas || "—"}</td>
                        <td className="px-3 py-2 text-slate-700">{SIM_LABEL[l.sim_id] || l.sim_id}</td>
                        <td className="px-3 py-2 text-slate-600">tingkat {l.tingkat}</td>
                        <td className="px-3 py-2"><Badge tone={l.skor === l.maks ? "green" : "amber"}>{l.skor}/{l.maks}</Badge></td>
                        <td className="px-3 py-2 text-xs text-slate-500">{l.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

    </div>
  );
}

function cekJawaban(j: any) {
  if (!j) return "—";
  try {
    const v = typeof j === "string" ? JSON.parse(j) : j;
    if (Array.isArray(v)) return v.map((x, i) => `${i + 1}. ${typeof x === "object" ? JSON.stringify(x) : x}`).join("\n");
    if (typeof v === "object") return Object.entries(v).map(([k, val]) => `${k}: ${val}`).join("\n");
    return String(v);
  } catch { return String(j); }
}

/* ---------------- 5. Supervisi Pembelajaran ----------------
   Halaman supervisi dipindahkan ke src/supervisi.tsx (instrumen dengan indikator yang dapat
   dikonfigurasi Admin + laporan cetak). Antarmuka rekap nilai tetap di bagian berikutnya. */

/* ---------------- 6. Rekap Penilaian ---------------- */
export function GuruRekap() {
  const { kelas, kelasId, setKelasId } = useKelas();
  const [rekap, setRekap] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    api(`/api/guru/rekap${kelasId ? `?kelas_id=${kelasId}` : ""}`).then(r => setRekap(r.rekap || [])).catch(e => setMsg(e.message));
  }, [kelasId]);

  const unduhCsv = async () => {
    const res = await api(`/api/guru/rekap?kelas_id=${kelasId}&format=csv`, { raw: true });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rekap-nilai-${kelasId || "semua"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <PageTitle title="Rekap Penilaian" sub="Ringkasan LKPD terkumpul, rata-rata nilai, karya portofolio, dan minggu yang telah diselesaikan siswa"
        right={<div className="flex flex-wrap gap-2">
          <Link to="/guru/rekap-cetak"><Btn variant="ghost">🖨️ Rekap siap cetak</Btn></Link>
          <Btn variant="ghost" onClick={unduhCsv}>⬇️ Unduh CSV</Btn>
        </div>} />
      {msg && <Toast msg={msg} tone="red" onClose={() => setMsg("")} />}
      <div className="mb-4"><KelasPicker kelas={kelas} kelasId={kelasId} setKelasId={setKelasId} /></div>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-slate-500">
              <th className="py-2">Nama siswa</th><th>LKPD terkumpul</th><th>Rata-rata nilai (0–100)</th><th>Karya portofolio</th><th>Minggu selesai</th><th className="w-40">Progres</th>
            </tr></thead>
            <tbody>
              {rekap.map(r => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-700">{r.nama_lengkap}</td>
                  <td>{r.jml_lkpd}</td>
                  <td>{r.rata_nilai ?? "—"}</td>
                  <td>{r.jml_karya}</td>
                  <td>{r.minggu_selesai}/36</td>
                  <td><Progress value={(Number(r.minggu_selesai) / 36) * 100} /></td>
                </tr>
              ))}
              {rekap.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-slate-500">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-4"><DataDemo text="Rekap ini dihitung dari data contoh (seed): 10 siswa, 4 tugas, dan pengiriman uji." /></div>
    </div>
  );
}
