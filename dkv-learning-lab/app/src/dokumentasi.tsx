// dokumentasi.tsx — Dokumentasi pembelajaran per pertemuan (72 pertemuan): tujuan, aktivitas
// memahami–mengaplikasi–merefleksi, penerapan prinsip pembelajaran mendalam, bukti aktivitas,
// catatan observasi, refleksi guru, dan tindak lanjut. Dapat dicetak & diekspor CSV.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Card, Btn, Badge, Field, inputCls, Spinner, Empty, PageTitle, Toast, DataDemo, cx } from "./lib";

const lihat = (arr?: string[]) => (arr && arr.length ? arr.join(" • ") : "—");

export function GuruDokumentasi() {
  const [daftar, setDaftar] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [minggu, setMinggu] = useState<number | "">("");
  const [pilih, setPilih] = useState<{ minggu: number; hari: string }>({ minggu: 2, hari: "senin" });
  const [rinci, setRinci] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [simpan, setSimpan] = useState(false);

  const muatDaftar = () => api("/api/supervisi/dokumentasi").then(r => { setDaftar(r.dokumentasi || []); setMeta(r); }).catch(e => setMsg(e.message));
  useEffect(() => { muatDaftar(); }, []);
  useEffect(() => {
    setRinci(null); setForm(null);
    api(`/api/supervisi/dokumentasi/${pilih.minggu}/${pilih.hari}`).then(r => {
      setRinci(r);
      const d = r.dokumen;
      setForm({
        tujuan: (d?.tujuan || r.usulan?.tujuan || []).join("\n"),
        memahami: (d?.memahami || r.usulan?.memahami || []).join("\n"),
        mengaplikasi: (d?.mengaplikasi || r.usulan?.mengaplikasi || []).join("\n"),
        merefleksi: (d?.merefleksi || r.usulan?.merefleksi || []).join("\n"),
        prinsip: d?.prinsip || [],
        bukti: (d?.bukti || r.usulan?.bukti || []).join("\n"),
        catatan_observasi: d?.catatan_observasi || "",
        refleksi_guru: d?.refleksi_guru || "",
        tindak_lanjut: d?.tindak_lanjut || "",
        status: d?.status || "draf",
      });
    }).catch(e => setMsg(e.message));
  }, [pilih.minggu, pilih.hari]);

  const keBawah = async (status: "draf" | "final") => {
    setSimpan(true);
    try {
      const b: any = { ...form, status };
      for (const k of ["tujuan", "memahami", "mengaplikasi", "merefleksi", "bukti"]) b[k] = String(form[k] || "").split("\n").map((x: string) => x.trim()).filter(Boolean);
      const r = await api(`/api/supervisi/dokumentasi/${pilih.minggu}/${pilih.hari}`, { method: "PUT", body: b });
      setMsg(r.pesan || "Tersimpan.");
      muatDaftar();
      const ulang = await api(`/api/supervisi/dokumentasi/${pilih.minggu}/${pilih.hari}`);
      setRinci(ulang);
    } catch (e: any) { setMsg(`Gagal menyimpan: ${e.message}`); }
    setSimpan(false);
  };

  const pakaiUsulan = () => {
    const u = rinci?.usulan || {};
    setForm({
      ...form,
      tujuan: (u.tujuan || []).join("\n"), memahami: (u.memahami || []).join("\n"),
      mengaplikasi: (u.mengaplikasi || []).join("\n"), merefleksi: (u.merefleksi || []).join("\n"),
      bukti: (u.bukti || []).join("\n"),
    });
    setMsg("Isian usulan dari modul dimuat ke formulir — periksa & sesuaikan sebelum disimpan sebagai dokumen.");
  };

  const unduhCsv = async () => {
    const res = await api("/api/supervisi/dokumentasi.csv", { raw: true });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a"); a.href = url; a.download = "dokumentasi-pertemuan.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const tampil = minggu === "" ? daftar : daftar.filter(d => d.week_nomor === minggu);
  const terisi = daftar.filter(d => d.memiliki_dokumen).length;

  return (
    <div>
      <PageTitle title="Dokumentasi Pembelajaran per Pertemuan"
        sub="72 pertemuan: tujuan, aktivitas memahami–mengaplikasi–merefleksi, prinsip pembelajaran mendalam sesuai instrumen sekolah, bukti aktivitas, catatan observasi, refleksi guru, dan tindak lanjut"
        right={<div className="flex flex-wrap items-center gap-2">
          <Badge tone={terisi ? "green" : "slate"}>{terisi}/72 pertemuan tersimpan</Badge>
          <Btn variant="ghost" onClick={unduhCsv}>⬇️ Ekspor CSV</Btn>
        </div>} />
      {msg && <Toast msg={msg} onClose={() => setMsg("")} />}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Tampilkan minggu">
          <select className={inputCls} value={minggu} onChange={e => setMinggu(e.target.value ? +e.target.value : "")}>
            <option value="">Semua minggu (72 pertemuan)</option>
            {Array.from({ length: 36 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Minggu {m}</option>)}
          </select>
        </Field>
        <div className="text-xs text-slate-500">
          Isian <b>usulan otomatis</b> diambil dari modul & kurikulum aplikasi dan ditandai sebagai usulan —
          berlaku sebagai dokumen setelah guru menyimpan (draf/final).
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card className="p-0">
          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-2">Pertemuan</th><th className="px-3 py-2">Tema / tujuan</th><th className="px-3 py-2">Status</th></tr>
              </thead>
              <tbody>
                {tampil.map(d => (
                  <tr key={`${d.week_nomor}-${d.meeting_key}`}
                    className={cx("cursor-pointer border-t border-slate-100 hover:bg-slate-50", pilih.minggu === d.week_nomor && pilih.hari === d.meeting_key ? "bg-blue-50" : "")}
                    onClick={() => setPilih({ minggu: d.week_nomor, hari: d.meeting_key })}>
                    <td className="px-3 py-2 font-medium text-slate-700">M{d.week_nomor} · {d.hari}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{d.tema || "—"}<div className="text-slate-400">{d.ringkasTujuan ? String(d.ringkasTujuan).slice(0, 64) + "…" : "belum ada tujuan"}</div></td>
                    <td className="px-3 py-2">
                      <Badge tone={d.status === "final" ? "green" : d.status === "draf" ? "amber" : "slate"}>{d.status}</Badge>
                    </td>
                  </tr>
                ))}
                {tampil.length === 0 && <tr><td colSpan={3}><Empty text="Tidak ada pertemuan pada filter ini." /></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <div>
          {!rinci || !form ? <Spinner label="Memuat dokumentasi pertemuan…" /> : (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">Minggu {pilih.minggu} · {pilih.hari === "senin" ? "Senin" : "Rabu"}</h3>
                  <div className="text-xs text-slate-500">{rinci.usulan?.tema || "—"} · status dokumen: {rinci.dokumen ? rinci.dokumen.status : "belum disimpan"} {rinci.dokumen?.diubah_pada ? `(diubah ${rinci.dokumen.diubah_pada}${rinci.dokumen.diubah_nama ? ` oleh ${rinci.dokumen.diubah_nama}` : ""})` : ""}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Btn variant="ghost" onClick={pakaiUsulan}>↺ Isi dari modul (usulan)</Btn>
                  <Link to={`/guru/dokumentasi/cetak/${pilih.minggu}/${pilih.hari}`}><Btn variant="ghost">🖨️ Cetak</Btn></Link>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Field label="A. Tujuan pembelajaran (satu poin per baris)">
                  <textarea className={cx(inputCls, "h-24")} value={form.tujuan} onChange={e => setForm({ ...form, tujuan: e.target.value })} />
                </Field>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="B. Aktivitas memahami (per baris)">
                    <textarea className={cx(inputCls, "h-28")} value={form.memahami} onChange={e => setForm({ ...form, memahami: e.target.value })} />
                  </Field>
                  <Field label="C. Aktivitas mengaplikasi (per baris)">
                    <textarea className={cx(inputCls, "h-28")} value={form.mengaplikasi} onChange={e => setForm({ ...form, mengaplikasi: e.target.value })} />
                  </Field>
                  <Field label="D. Aktivitas merefleksi (per baris)">
                    <textarea className={cx(inputCls, "h-28")} value={form.merefleksi} onChange={e => setForm({ ...form, merefleksi: e.target.value })} />
                  </Field>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-sm font-medium text-slate-700">E. Penerapan prinsip pembelajaran mendalam</div>
                  <div className="mt-1 text-xs text-slate-500">Tandai prinsip yang <b>benar-benar diterapkan</b> pada pertemuan ini (daftar mengikuti instrumen sekolah; aplikasi tidak menebak).</div>
                  <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    {(rinci.prinsipMendalam || []).map((p: any) => (
                      <label key={p.kode} className="flex items-start gap-2 text-xs text-slate-700">
                        <input type="checkbox" checked={(form.prinsip || []).includes(p.kode)}
                          onChange={e => setForm({ ...form, prinsip: e.target.checked ? [...(form.prinsip || []), p.kode] : (form.prinsip || []).filter((x: string) => x !== p.kode) })} />
                        <span>{p.nama}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="F. Bukti aktivitas (satu bukti per baris — foto, LKPD, kuis, karya portofolio)">
                  <textarea className={cx(inputCls, "h-24")} value={form.bukti} onChange={e => setForm({ ...form, bukti: e.target.value })} />
                </Field>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="G. Catatan observasi (pengamatan kelas)">
                    <textarea className={cx(inputCls, "h-28")} value={form.catatan_observasi} onChange={e => setForm({ ...form, catatan_observasi: e.target.value })} />
                  </Field>
                  <Field label="H. Refleksi guru">
                    <textarea className={cx(inputCls, "h-28")} value={form.refleksi_guru} onChange={e => setForm({ ...form, refleksi_guru: e.target.value })} />
                  </Field>
                  <Field label="I. Tindak lanjut">
                    <textarea className={cx(inputCls, "h-28")} value={form.tindak_lanjut} onChange={e => setForm({ ...form, tindak_lanjut: e.target.value })} />
                  </Field>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Btn variant="ghost" disabled={simpan} onClick={() => keBawah("draf")}>💾 Simpan draf</Btn>
                <Btn disabled={simpan} onClick={() => keBawah("final")}>✅ Simpan final</Btn>
                <span className="text-xs text-slate-500">Ringkas: tujuan {String(form.tujuan).split("\n").filter(Boolean).length} · memahami {String(form.memahami).split("\n").filter(Boolean).length} · mengaplikasi {String(form.mengaplikasi).split("\n").filter(Boolean).length} · merefleksi {String(form.merefleksi).split("\n").filter(Boolean).length} · prinsip {(form.prinsip || []).length} · bukti {String(form.bukti).split("\n").filter(Boolean).length}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">{rinci.catatanInstrumen}</div>
              <DataDemo text={`Isian usulan diambil dari modul: tujuan ${lihat(rinci.usulan?.tujuan).slice(0, 70)}… — periksa kembali sebelum dijadikan dokumen resmi.`} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
