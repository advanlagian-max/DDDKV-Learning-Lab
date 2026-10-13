// supervisi.tsx — Supervisi akademik: instrumen dengan indikator yang dapat dikonfigurasi (Admin),
// pengisian skor 1–4 per indikator, rekap per aspek, riwayat, ekspor CSV, dan laporan siap cetak.
//
// Indikator TIDAK dikarang di antarmuka: daftar diambil dari server (server/supervisi.js) yang memuat
// butir instrumen dokumen sekolah apa adanya; Admin dapat menyunting bila instrumen resmi direvisi.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, useAuth, Card, Btn, Badge, Field, inputCls, Spinner, Empty, PageTitle, Toast, DataDemo, cx } from "./lib";
import { KelasPicker, useKelas } from "./guru";

export function GuruSupervisi() {
  const { user } = useAuth();
  const { kelas, kelasId, setKelasId } = useKelas();
  const [instrumen, setInstrumen] = useState<any>(null);
  const [skor, setSkor] = useState<Record<string, number>>({});
  const [catatan, setCatatan] = useState("");
  const [rekomendasi, setRekomendasi] = useState({ guru: "", murid: "", sekolah: "" });
  const [tindak, setTindak] = useState("");
  const [week, setWeek] = useState(2);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [guruId, setGuruId] = useState<number | null>(null);
  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [suntingId, setSuntingId] = useState<number | null>(null);
  const [hapusId, setHapusId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const muatRiwayat = () => api("/api/supervisi").then(r => setRiwayat(r.supervisi || [])).catch(() => { });
  useEffect(() => {
    api("/api/supervisi/indikator").then(setInstrumen).catch(e => setMsg(`Gagal memuat instrumen: ${e.message}`));
    muatRiwayat();
    api("/api/supervisi/daftar-guru").then(r => setDaftarGuru(r.guru || [])).catch(() => { });
  }, []);

  const aspek = instrumen?.indikator || [];
  const rata = (kode?: string) => {
    const nilai = Object.entries(skor).filter(([k]) => !kode || k.startsWith(kode)).map(([, v]) => Number(v)).filter(v => v > 0);
    return nilai.length ? (nilai.reduce((a, b) => a + b, 0) / nilai.length).toFixed(2) : "—";
  };
  const totalTerisi = Object.values(skor).filter(v => v > 0).length;
  const totalIndikator = useMemo(() => aspek.reduce((n: number, a: any) => n + a.indikator.length, 0), [aspek]);

  const simpan = async (status: string) => {
    try {
      const body: any = {
        guru_id: guruId || user?.id, kelas_id: kelasId || null, week_nomor: week, tanggal, skor,
        catatan, rekomendasi, tindak_lanjut: tindak, status,
      };
      const r = suntingId
        ? await api(`/api/supervisi/${suntingId}`, { method: "PUT", body })
        : await api("/api/supervisi", { method: "POST", body });
      setMsg(`${r.pesan || "Tersimpan."} Skor terisi ${totalTerisi}/${totalIndikator} indikator.`);
      setSuntingId(r.id || suntingId);
      muatRiwayat();
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };

  const muatSunting = async (id: number) => {
    try {
      const d = await api(`/api/supervisi/${id}`);
      const sk: Record<string, number> = {};
      d.aspek.forEach((a: any) => a.indikator.forEach((i: any) => { if (i.skor) sk[i.kode] = i.skor; }));
      let rek: any = {}; try { rek = JSON.parse(d.catatan.rekomendasi || "{}"); } catch { }
      setSkor(sk); setCatatan(d.catatan.catatan || ""); setRekomendasi({ guru: rek.guru || "", murid: rek.murid || "", sekolah: rek.sekolah || "" });
      setTindak(d.catatan.tindak_lanjut || ""); setWeek(d.catatan.week_nomor || 2); setTanggal(d.catatan.tanggal || "");
      setGuruId(d.catatan.guru_id || null); setSuntingId(id);
      setMsg(`Menyunting catatan supervisi #${id} (${d.catatan.nama_guru}).`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) { setMsg(`Gagal memuat: ${e.message}`); }
  };

  const hapus = async (id: number) => {
    try {
      const r = await api(`/api/supervisi/${id}`, { method: "DELETE" });
      setMsg(r.pesan || "Dihapus."); setHapusId(null);
      if (suntingId === id) { setSuntingId(null); setSkor({}); }
      muatRiwayat();
    } catch (e: any) { setMsg(`Gagal menghapus: ${e.message}`); }
  };

  const unduhCsv = async () => {
    const res = await api("/api/supervisi.csv", { raw: true });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a"); a.href = url; a.download = "rekap-supervisi.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!instrumen) return <Spinner label="Memuat instrumen supervisi…" />;

  return (
    <div>
      <PageTitle title="Supervisi Akademik" sub="Instrumen skala 1–4 dengan indikator yang dimuat dari dokumen instrumen sekolah (C.1–C.4, termasuk 5C) — dapat dikonfigurasi Admin bila instrumen resmi direvisi"
        right={<div className="flex flex-wrap gap-2">
          {suntingId && <Badge tone="violet">menyunting #{suntingId}</Badge>}
          <Badge tone={totalTerisi === totalIndikator && totalIndikator > 0 ? "green" : "amber"}>{totalTerisi}/{totalIndikator} indikator terisi</Badge>
        </div>} />
      {msg && <Toast msg={msg} onClose={() => setMsg("")} />}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <KelasPicker kelas={kelas} kelasId={kelasId} setKelasId={setKelasId} />
        <Field label="Guru yang disupervisi">
          <select className={inputCls} value={guruId ?? ""} onChange={e => setGuruId(e.target.value ? +e.target.value : null)}>
            <option value="">{user?.nama_lengkap} (saya)</option>
            {daftarGuru.filter(g => g.id !== user?.id).map(g => <option key={g.id} value={g.id}>{g.nama_lengkap}</option>)}
          </select>
        </Field>
        <Field label="Minggu ke-"><input type="number" min={1} max={36} className={cx(inputCls, "w-24")} value={week} onChange={e => setWeek(+e.target.value)} /></Field>
        <Field label="Tanggal"><input type="date" className={inputCls} value={tanggal} onChange={e => setTanggal(e.target.value)} /></Field>
        <Badge tone="blue">Rata-rata (terisi): {rata()}</Badge>
        {suntingId && <Btn variant="ghost" onClick={() => { setSuntingId(null); setSkor({}); setCatatan(""); setTindak(""); setRekomendasi({ guru: "", murid: "", sekolah: "" }); }}>+ Catatan baru</Btn>}
      </div>

      <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <b>Indikator diambil dari dokumen instrumen sekolah</b> — {instrumen.sumber}. {instrumen.catatanInstrumen}
        {instrumen.dapatMenyunting
          ? <> Sebagai Admin Anda dapat <Link to="/admin" className="underline">menyunting indikator di panel Administrasi</Link>.</>
          : <> Perubahan indikator hanya dapat dilakukan Admin agar daftar tetap sesuai instrumen resmi.</>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {aspek.map((a: any) => (
          <Card key={a.aspek_kode} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-800">{a.aspek_kode} {a.aspek_nama}</h3>
              <Badge tone={rata(a.aspek_kode) === "—" ? "slate" : "blue"}>rata aspek: {rata(a.aspek_kode)}</Badge>
            </div>
            <div className="mt-3 space-y-3">
              {a.indikator.map((i: any) => (
                <div key={i.kode} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{i.kode} · {i.nama}</div>
                      {i.deskriptor && <div className="text-xs text-slate-500">{i.deskriptor}</div>}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map(n => (
                        <button key={n} title={instrumen.skala?.[n - 1]?.label} onClick={() => setSkor({ ...skor, [i.kode]: n })}
                          className={cx("h-9 w-9 rounded-xl text-sm font-semibold", skor[i.kode] === n ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>{n}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-5">
        <h3 className="font-semibold text-slate-800">Catatan supervisor & rekomendasi tindak lanjut</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Catatan supervisor/guru"><textarea className={cx(inputCls, "h-28")} value={catatan} onChange={e => setCatatan(e.target.value)} /></Field>
          <div className="space-y-3">
            <Field label="Rekomendasi bagi guru"><input className={inputCls} value={rekomendasi.guru} onChange={e => setRekomendasi({ ...rekomendasi, guru: e.target.value })} /></Field>
            <Field label="Rekomendasi bagi murid"><input className={inputCls} value={rekomendasi.murid} onChange={e => setRekomendasi({ ...rekomendasi, murid: e.target.value })} /></Field>
            <Field label="Rekomendasi bagi sekolah"><input className={inputCls} value={rekomendasi.sekolah} onChange={e => setRekomendasi({ ...rekomendasi, sekolah: e.target.value })} /></Field>
          </div>
        </div>
        <div className="mt-3"><Field label="Tindak lanjut"><input className={inputCls} value={tindak} onChange={e => setTindak(e.target.value)} /></Field></div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="ghost" onClick={() => simpan("draft")}>💾 Simpan draft</Btn>
          <Btn onClick={() => simpan("final")}>✅ Simpan final</Btn>
          {suntingId && <Link to={`/guru/supervisi/cetak/${suntingId}`}><Btn variant="ghost">🖨️ Cetak laporan #{suntingId}</Btn></Link>}
        </div>
        <p className="mt-2 text-xs text-slate-500">Skor 1–4 mengikuti instrumen: 1 = {instrumen.skala?.[0]?.label}, 4 = {instrumen.skala?.[3]?.label}. Skor hanya tersimpan untuk indikator yang diisi.</p>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-800">Riwayat supervisi ({riwayat.length})</h3>
          <Btn variant="ghost" onClick={unduhCsv}>⬇️ Ekspor CSV (per indikator & per aspek)</Btn>
        </div>
        {riwayat.length === 0 ? <Empty text="Belum ada catatan supervisi." /> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="border-b text-left text-xs text-slate-500">
                <th className="py-2">#</th><th>Tanggal</th><th>Guru</th><th>Kelas</th><th>Minggu</th>
                {["C.1", "C.2", "C.3", "C.4"].map(k => <th key={k}>{k}</th>)}<th>Rata</th><th>Status</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {riwayat.map(s => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-500">{s.id}</td>
                    <td>{s.tanggal || s.created_at}</td>
                    <td>{s.nama_guru || "—"}</td>
                    <td>{s.nama_kelas || "—"}</td>
                    <td>{s.week_nomor || "—"}</td>
                    {["C.1", "C.2", "C.3", "C.4"].map(k => (
                      <td key={k}>{s.perAspek?.find((a: any) => a.aspek_kode === k)?.rata ?? "—"}</td>
                    ))}
                    <td className="font-medium">{s.rata ?? "—"}</td>
                    <td><Badge tone={s.status === "final" ? "green" : "slate"}>{s.status}</Badge></td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/guru/supervisi/cetak/${s.id}`} aria-label={`Cetak laporan supervisi #${s.id}`} title="Cetak laporan"><Btn variant="ghost">🖨️ Cetak</Btn></Link>
                        <Btn variant="ghost" onClick={() => muatSunting(s.id)}>Sunting</Btn>
                        {user?.role === "admin" && (hapusId === s.id
                          ? <Btn variant="ghost" onClick={() => hapus(s.id)}>Yakin hapus?</Btn>
                          : <Btn variant="ghost" onClick={() => setHapusId(s.id)}>Hapus</Btn>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <DataDemo text="Riwayat berisi catatan yang disimpan di aplikasi; dokumen instrumen resmi tetap ditandatangani supervisor pada berkas cetak (tersedia tombol cetak per baris)." />
      </Card>
    </div>
  );
}
