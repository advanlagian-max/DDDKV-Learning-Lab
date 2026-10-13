// cetak.tsx — Halaman siap cetak (A4) untuk: laporan supervisi akademik, dokumentasi per pertemuan,
// dan rekap nilai kelas. Semua halaman memakai kop sekolah + kolom tanda tangan supervisor.
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, Btn, Badge, Spinner, Empty, cx } from "./lib";

export function TombolCetak({ label = "🖨️ Cetak / Simpan PDF", kembali }: any) {
  const [pesan, setPesan] = useState("");
  return (
    <div className="dkv-no-print mb-4 flex flex-wrap items-center gap-3">
      {kembali && <Link to={kembali}><Btn variant="ghost">← Kembali</Btn></Link>}
      <Btn onClick={() => { setPesan(""); try { window.print(); } catch { } setPesan("Bila dialog cetak tidak muncul (pratinjau di dalam aplikasi), tekan Ctrl/Cmd + P."); }}>{label}</Btn>
      <span className="text-xs text-slate-500">Ukuran A4 · kop sekolah · kolom tanda tangan — pastikan “Background graphics” aktif bila perlu.</span>
      {pesan && <span className="text-xs text-amber-700">{pesan}</span>}
    </div>
  );
}

export function KopSurat({ institusi, judul, sub, meta }: any) {
  return (
    <div className="border-b-2 border-slate-800 pb-3">
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-slate-800 text-2xl">🎨</div>
        <div className="flex-1 text-center">
          <div className="text-sm font-semibold uppercase tracking-wide">{(institusi?.nama || "SMK Negeri 3 Kuningan")}</div>
          <div className="text-xs">{institusi?.mapel || "Dasar-Dasar Desain Komunikasi Visual"} · {institusi?.fase || "Fase E / Kelas X"}</div>
          <div className="mt-1 text-base font-bold uppercase">{judul}</div>
          {sub && <div className="text-xs">{sub}</div>}
        </div>
        <div className="hidden h-14 w-14 shrink-0 md:block" />
      </div>
      {meta && (
        <table className="mt-3 w-full text-xs">
          <tbody>
            {meta.map(([k, v]: any) => (
              <tr key={k}><td className="w-40 py-0.5 align-top font-semibold">{k}</td><td className="py-0.5">: {v ?? "—"}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TandaTangan({ supervisor, institusi, tanggal }: any) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-8 text-xs">
      <div>
        <div>Mengetahui,</div>
        <div>Kepala Program / Wali Kelas</div>
        <div className="mt-16 border-t border-slate-400 pt-1">(……………………………………)</div>
      </div>
      <div className="text-right">
        <div>{institusi?.kota || "Kuningan"}, {tanggal || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
        <div>Supervisor Akademik</div>
        <div className="mt-16 border-t border-slate-400 pt-1">{supervisor?.nama || "Saidun, S.Pd., M.M."}</div>
        {supervisor?.nip && <div className="text-[10px]">NIP {supervisor.nip}</div>}
      </div>
    </div>
  );
}

const skalaLabel = (n: number) => (n === 4 ? "Sangat baik" : n === 3 ? "Baik" : n === 2 ? "Cukup" : n === 1 ? "Perlu pendampingan" : "—");

/* ---------------- 1. Laporan supervisi akademik ---------------- */
export function CetakSupervisi() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api(`/api/supervisi/${id}`).then(setData).catch(e => setErr(e.message)); }, [id]);
  if (err) return <Empty text={err} />;
  if (!data) return <Spinner label="Menyiapkan laporan supervisi…" />;
  const c = data.catatan;
  let rek: any = {}; try { rek = JSON.parse(c.rekomendasi || "{}"); } catch { }
  return (
    <div className="mx-auto max-w-[880px]">
      <TombolCetak kembali="/guru/supervisi" />
      <div className="dkv-cetak rounded-xl bg-white p-6 text-slate-900 shadow">
        <KopSurat institusi={data.institusi} judul="Laporan Supervisi Akademik Pembelajaran"
          sub={`Acuan: ${data.sumber}`}
          meta={[
            ["Nama guru", c.nama_guru], ["NIP", c.nip_guru || "—"],
            ["Kelas / Mapel", `${c.nama_kelas || "—"} / ${data.institusi?.mapel || "DD DKV"}`],
            ["Minggu ke-", c.week_nomor ? `Minggu ${c.week_nomor}` : "—"],
            ["Tanggal supervisi", c.tanggal || c.created_at], ["Status instrumen", c.status === "final" ? "Final" : "Draft"],
          ]} />

        <h2 className="mt-4 text-sm font-bold">A. Skor tiap indikator instrumen (skala 1–4)</h2>
        <table className="mt-2 w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 px-2 py-1 text-left">Kode</th>
              <th className="border border-slate-400 px-2 py-1 text-left">Indikator (sesuai instrumen)</th>
              <th className="border border-slate-400 px-2 py-1 w-16">Skor</th>
              <th className="border border-slate-400 px-2 py-1 w-36">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data.aspek.map((a: any) => (
              <React.Fragment key={a.aspek_kode}>
                {a.indikator.map((i: any) => (
                  <tr key={i.kode}>
                    <td className="border border-slate-400 px-2 py-1">{i.kode}</td>
                    <td className="border border-slate-400 px-2 py-1">{i.nama}</td>
                    <td className="border border-slate-400 px-2 py-1 text-center">{i.skor ?? "—"}</td>
                    <td className="border border-slate-400 px-2 py-1">{skalaLabel(i.skor)}</td>
                  </tr>
                ))}
                <tr key={a.aspek_kode + "-rata"} className="bg-slate-50 font-semibold">
                  <td className="border border-slate-400 px-2 py-1" colSpan={2}>{a.aspek_kode} {a.aspek_nama} — rata-rata aspek</td>
                  <td className="border border-slate-400 px-2 py-1 text-center">{a.rata ?? "—"}</td>
                  <td className="border border-slate-400 px-2 py-1"></td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="bg-slate-200 font-bold">
              <td className="border border-slate-400 px-2 py-1" colSpan={2}>Rata-rata seluruh indikator yang dinilai</td>
              <td className="border border-slate-400 px-2 py-1 text-center">{c.rata ?? "—"}</td>
              <td className="border border-slate-400 px-2 py-1"></td>
            </tr>
          </tbody>
        </table>

        <h2 className="mt-4 text-sm font-bold">B. Catatan supervisor</h2>
        <p className="mt-1 whitespace-pre-wrap text-xs">{c.catatan || "—"}</p>

        <h2 className="mt-3 text-sm font-bold">C. Rekomendasi tindak lanjut</h2>
        <table className="mt-1 w-full border-collapse text-xs">
          <tbody>
            {[["Bagi guru", rek.guru], ["Bagi murid", rek.murid], ["Bagi sekolah", rek.sekolah]].map(([k, v]: any) => (
              <tr key={k}><td className="w-32 border border-slate-400 px-2 py-1 font-semibold">{k}</td><td className="border border-slate-400 px-2 py-1">{v || "—"}</td></tr>
            ))}
            <tr><td className="border border-slate-400 px-2 py-1 font-semibold">Tindak lanjut</td><td className="border border-slate-400 px-2 py-1">{c.tindak_lanjut || "—"}</td></tr>
          </tbody>
        </table>

        <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
          Catatan instrumen: {data.catatanInstrumen}
        </p>
        <TandaTangan supervisor={data.supervisor} institusi={data.institusi} tanggal={c.tanggal} />
      </div>
    </div>
  );
}

/* ---------------- 2. Dokumentasi pembelajaran per pertemuan ---------------- */
export function CetakDokumentasi() {
  const { minggu, hari } = useParams();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api(`/api/supervisi/dokumentasi/${minggu}/${hari}`).then(setData).catch(e => setErr(e.message)); }, [minggu, hari]);
  if (err) return <Empty text={err} />;
  if (!data) return <Spinner label="Menyiapkan dokumentasi pertemuan…" />;
  const d = data.dokumen;
  const u = data.usulan;
  const pakai = d || u;
  const sumberTeks = d ? `Disimpan guru${d.diubah_nama ? ` (${d.diubah_nama})` : ""} · status ${d.status}` : "Isian usulan otomatis dari modul (belum disimpan guru)";
  const daftar = (v: any) => (Array.isArray(v) && v.length ? v : []) as string[];
  const nomor = (arr: string[]) => arr.map((t, i) => <li key={i} className="ml-4 list-decimal">{t}</li>);
  return (
    <div className="mx-auto max-w-[880px]">
      <TombolCetak kembali="/guru/dokumentasi" />
      <div className="dkv-cetak rounded-xl bg-white p-6 text-slate-900 shadow">
        <KopSurat institusi={data.institusi} judul="Dokumentasi Pembelajaran per Pertemuan"
          sub={`Minggu ${data.minggu} · Hari ${data.hari === "senin" ? "Senin" : "Rabu"} — tujuan, aktivitas memahami–mengaplikasi–merefleksi, prinsip pembelajaran mendalam, bukti, observasi, refleksi guru, tindak lanjut`}
          meta={[
            ["Minggu / Hari", `${data.minggu} / ${data.hari}`],
            ["Tema minggu", u.tema || "—"],
            ["Sumber data", sumberTeks],
            ["Terakhir diubah", d?.diubah_pada || "belum disimpan"],
          ]} />

        {[
          ["A. Tujuan pembelajaran", daftar(pakai.tujuan)],
          ["B. Aktivitas memahami", daftar(pakai.memahami)],
          ["C. Aktivitas mengaplikasi", daftar(pakai.mengaplikasi)],
          ["D. Aktivitas merefleksi", daftar(pakai.merefleksi)],
        ].map(([judul, arr]: any) => (
          <div key={judul} className="mt-3">
            <h2 className="text-sm font-bold">{judul}</h2>
            {arr.length ? <ol className="mt-1 text-xs">{nomor(arr)}</ol> : <p className="mt-1 text-xs italic text-slate-500">— belum diisi —</p>}
          </div>
        ))}

        <div className="mt-3">
          <h2 className="text-sm font-bold">E. Penerapan prinsip pembelajaran mendalam (sesuai instrumen sekolah)</h2>
          <table className="mt-1 w-full border-collapse text-xs">
            <tbody>
              {(data.prinsipMendalam || []).map((p: any) => {
                const dipakai = daftar(pakai.prinsip).some((x: string) => x.toLowerCase().includes(p.kode) || x.toLowerCase().includes(p.nama.toLowerCase().slice(0, 18)));
                return (
                  <tr key={p.kode}>
                    <td className="w-10 border border-slate-400 px-2 py-1 text-center font-bold">{dipakai ? "✓" : "—"}</td>
                    <td className="border border-slate-400 px-2 py-1">{p.nama}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-1 text-[10px] text-slate-600">Tanda ✓ berarti prinsip ditandai diterapkan pada pertemuan ini oleh guru/supervisor (bukan hasil tebakan aplikasi).</p>
        </div>

        <div className="mt-3">
          <h2 className="text-sm font-bold">F. Bukti aktivitas</h2>
          {daftar(pakai.bukti).length ? <ul className="mt-1 text-xs">{daftar(pakai.bukti).map((b, i) => <li key={i} className="ml-4 list-disc">{b}</li>)}</ul> : <p className="mt-1 text-xs italic text-slate-500">— belum diisi —</p>}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[["G. Catatan observasi", pakai.catatan_observasi], ["H. Refleksi guru", pakai.refleksi_guru], ["I. Tindak lanjut", pakai.tindak_lanjut]].map(([judul, isi]: any) => (
            <div key={judul}>
              <h2 className="text-sm font-bold">{judul}</h2>
              <p className="mt-1 whitespace-pre-wrap text-xs">{isi || "— belum diisi —"}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-slate-600">Catatan instrumen: {data.catatanInstrumen}</p>
        <TandaTangan institusi={data.institusi} />
      </div>
    </div>
  );
}

/* ---------------- 3. Rekap nilai kelas (siap cetak) ---------------- */
export function CetakRekapNilai() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [kelasId, setKelasId] = useState(0);
  const [rekap, setRekap] = useState<any[]>([]);
  const [asesmen, setAsesmen] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => { api("/api/guru/kelas").then(r => { setKelas(r.kelas || []); setKelasId(r.kelas?.[0]?.id || 0); }).catch(e => setErr(e.message)); }, []);
  useEffect(() => {
    if (!kelasId) return;
    Promise.all([api(`/api/guru/rekap?kelas_id=${kelasId}`), api(`/api/guru/rekap-asesmen?kelas_id=${kelasId}`), api("/api/meta")])
      .then(([a, b, m]) => { setRekap(a.rekap || []); setAsesmen(b); setMeta(m); })
      .catch(e => setErr(e.message));
  }, [kelasId]);

  const kelasNama = kelas.find(k => k.id === kelasId)?.nama || "—";
  const perSiswa = asesmen?.perSiswa || [];
  const nilaiAkhir = (id: number) => perSiswa.find((p: any) => p.user_id === id)?.nilai_akhir ?? "—";
  const jenis = ["kuis", "lkpd", "formatif", "praktik", "proyek", "sumatif"];

  return (
    <div className="mx-auto max-w-[980px]">
      <div className="dkv-no-print mb-4 flex flex-wrap items-center gap-2">
        <TombolCetak label="🖨️ Cetak rekap kelas" />
        {kelas.map(k => (
          <button key={k.id} onClick={() => setKelasId(k.id)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", k.id === kelasId ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>{k.nama}</button>
        ))}
      </div>
      {err && <Empty text={err} />}
      {!rekap.length && !err && <Spinner label="Menghitung rekap nilai…" />}
      {!!rekap.length && (
        <div className="dkv-cetak rounded-xl bg-white p-6 text-slate-900 shadow">
          <KopSurat institusi={meta?.institusi} judul="Rekap Nilai Peserta Didik"
            sub={`Kelas ${kelasNama} · Tahun ajaran ${meta?.tahun_ajaran || "—"} · KKTp asesmen: 75 (dapat disunting guru per butir asesmen)`}
            meta={[
              ["Kelas", kelasNama], ["Jumlah peserta didik", String(rekap.length)],
              ["Minggu berjalan", meta?.pekan_berjalan ? `Minggu ${meta.pekan_berjalan}` : "—"],
              ["Tanggal cetak", new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
            ]} />
          <div className="overflow-x-auto">
            <table className="mt-3 w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 px-2 py-1">No</th>
                  <th className="border border-slate-400 px-2 py-1 text-left">Nama peserta didik</th>
                  {jenis.map(j => <th key={j} className="border border-slate-400 px-2 py-1">{j}</th>)}
                  <th className="border border-slate-400 px-2 py-1">Nilai akhir</th>
                  <th className="border border-slate-400 px-2 py-1">LKPD</th>
                  <th className="border border-slate-400 px-2 py-1">Karya</th>
                  <th className="border border-slate-400 px-2 py-1">Minggu selesai</th>
                  <th className="border border-slate-400 px-2 py-1">Tuntas?</th>
                </tr>
              </thead>
              <tbody>
                {rekap.map((s: any, i: number) => {
                  const na = nilaiAkhir(s.id ?? s.user_id);
                  const pj = perSiswa.find((p: any) => p.user_id === (s.id ?? s.user_id))?.per_jenis || {};
                  return (
                    <tr key={s.id ?? i}>
                      <td className="border border-slate-400 px-2 py-1 text-center">{i + 1}</td>
                      <td className="border border-slate-400 px-2 py-1">{s.nama_lengkap}</td>
                      {jenis.map(j => <td key={j} className="border border-slate-400 px-2 py-1 text-center">{pj?.[j]?.rata ?? "—"}</td>)}
                      <td className="border border-slate-400 px-2 py-1 text-center font-semibold">{na}</td>
                      <td className="border border-slate-400 px-2 py-1 text-center">{s.jml_lkpd}</td>
                      <td className="border border-slate-400 px-2 py-1 text-center">{s.jml_karya}</td>
                      <td className="border border-slate-400 px-2 py-1 text-center">{s.minggu_selesai}/36</td>
                      <td className="border border-slate-400 px-2 py-1 text-center">{typeof na === "number" ? (na >= 75 ? "Tuntas" : "Belum") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
            Nilai jenis asesmen = rata-rata asesmen jenis tersebut yang <b>sudah dinilai</b>; nilai akhir = rata-rata berbobot
            seluruh asesmen yang sudah dinilai (komponen yang belum dijalankan tidak menurunkan nilai). Tanda “—” berarti belum ada nilai.
            Kolom “Karya” = jumlah karya portofolio yang diunggah; “LKPD” = jumlah LKPD terkumpul.
          </p>
          <TandaTangan institusi={meta?.institusi} />
        </div>
      )}
    </div>
  );
}
