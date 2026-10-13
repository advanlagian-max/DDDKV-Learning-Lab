// guru-asesmen.tsx — Ruang kerja asesmen guru: menyunting rubrik & bobot, menilai dengan rubrik (wajib konfirmasi),
// meminta revisi, serta rekap per peserta didik / per minggu / per jenis asesmen dan daftar remedial–pengayaan.
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, Card, Btn, Badge, PageTitle, Spinner, Empty, Toast, Field, inputCls, cx } from "./lib";
import { TIPE_INFO } from "./asesmen2";

export function GuruAsesmen({ tabAwal, idAwal }: { tabAwal?: "rencana" | "nilai" | "rekap" | "remedial"; idAwal?: string } = {}) {
  const [tab, setTab] = useState<"rencana" | "nilai" | "rekap" | "remedial">(tabAwal || "rencana");
  const [msg, setMsg] = useState("");
  return (
    <div>
      <PageTitle title="Asesmen 36 Minggu" sub="LKPD digital, kuis otomatis (dengan pembahasan), formatif, sumatif, praktik, dan proyek — rubrik dapat disunting, penilaian wajib dikonfirmasi, rekap per peserta didik/minggu/jenis"
        right={<Badge tone="violet">260 butir asesmen</Badge>} />
      {msg && <Toast msg={msg} onClose={() => setMsg("")} />}
      <div className="mb-4 flex flex-wrap gap-1">
        {([["rencana", "📋 Rencana & rubrik"], ["nilai", "✅ Penilaian rubrik"], ["rekap", "📊 Rekap hasil belajar"], ["remedial", "🩹 Remedial & pengayaan"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", tab === k ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>{l}</button>
        ))}
      </div>
      {tab === "rencana" && <TabRencana setMsg={setMsg} idAwal={idAwal} />}
      {tab === "nilai" && <TabNilai setMsg={setMsg} idAwal={idAwal} />}
      {tab === "rekap" && <TabRekap setMsg={setMsg} />}
      {tab === "remedial" && <TabRemedial />}
    </div>
  );
}

/** Rute dalam: /guru/asesmen/:id membuka langsung tab penilaian rubrik untuk asesmen tersebut. */
export function GuruAsesmenDetail() {
  const { id } = useParams();
  return <GuruAsesmen tabAwal="nilai" idAwal={id} />;
}

/* ---------- filter minggu & jenis ---------- */
function FilterBar({ minggu, setMinggu, tipe, setTipe }: any) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-3">
      <Field label="Minggu">
        <select className={inputCls} value={minggu} onChange={e => setMinggu(+e.target.value)}>
          {Array.from({ length: 36 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Minggu {m}</option>)}
        </select>
      </Field>
      <Field label="Jenis asesmen">
        <select className={inputCls} value={tipe} onChange={e => setTipe(e.target.value)}>
          <option value="">Semua jenis</option>
          {Object.entries(TIPE_INFO).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
      </Field>
    </div>
  );
}

/* ==================== A. Rencana & penyuntingan rubrik/bobot ==================== */
function TabRencana({ setMsg, idAwal }: any) {
  const [minggu, setMinggu] = useState(5);
  const [tipe, setTipe] = useState("");
  const [daftar, setDaftar] = useState<any[]>([]);
  const [pilih, setPilih] = useState<string>(idAwal || "");
  const [detail, setDetail] = useState<any | null>(null);

  const muat = async () => {
    const q = new URLSearchParams({ minggu: String(minggu) });
    if (tipe) q.set("tipe", tipe);
    const r = await api(`/api/guru/asesmen?${q.toString()}`);
    setDaftar(r.asesmen || []);
    if (!pilih && r.asesmen?.length) setPilih(r.asesmen[0].id);
  };
  useEffect(() => { muat(); }, [minggu, tipe]);
  useEffect(() => { if (pilih) api(`/api/guru/asesmen/${pilih}`).then(setDetail).catch(() => setDetail(null)); }, [pilih]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div>
        <FilterBar minggu={minggu} setMinggu={setMinggu} tipe={tipe} setTipe={setTipe} />
        <div className="space-y-2">
          {daftar.length === 0 && <Empty text="Tidak ada asesmen pada filter ini." />}
          {daftar.map(a => (
            <button key={a.id} onClick={() => setPilih(a.id)} className="w-full text-left">
              <Card className={cx("p-3", pilih === a.id ? "border-blue-400 bg-blue-50" : "")}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={TIPE_INFO[a.tipe]?.tone}>{TIPE_INFO[a.tipe]?.icon} {TIPE_INFO[a.tipe]?.label}</Badge>
                  <Badge tone="slate">{a.pertemuan}</Badge>
                  <Badge tone="slate">bobot {a.bobot}</Badge>
                  {a.nilaiOtomatis === "true" && <Badge tone="blue">otomatis</Badge>}
                  {a.nilaiOtomatis === "sebagian" && <Badge tone="amber">sebagian otomatis</Badge>}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-800">{a.judul}</div>
                <div className="text-xs text-slate-500">terkumpul {a.terkumpul}/{a.jumlahSiswa} · dinilai {a.dinilai} · perlu revisi {a.perluRevisi} · rata {a.rata ?? "—"}</div>
              </Card>
            </button>
          ))}
        </div>
      </div>
      <div>
        {!detail ? <Spinner label="Memuat asesmen…" /> : <EditorAsesmen detail={detail} setMsg={setMsg} onUlang={muat} />}
      </div>
    </div>
  );
}

function EditorAsesmen({ detail, setMsg, onUlang }: any) {
  const a = detail.asesmen;
  const [bobot, setBobot] = useState(a.bobot);
  const [kktp, setKktp] = useState(a.kktp);
  const [revisi, setRevisi] = useState(a.kesempatanRevisi);
  const [rubrik, setRubrik] = useState<any[]>(a.rubrik || []);
  const [butir, setButir] = useState<any[]>(a.butir || []);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [bukaButir, setBukaButir] = useState(false);

  useEffect(() => {
    setBobot(a.bobot); setKktp(a.kktp); setRevisi(a.kesempatanRevisi);
    setRubrik(a.rubrik || []); setButir(a.butir || []); setKonfirmasi(false); setBukaButir(false);
  }, [a.id, a.diubah_pada]);

  const totalBobot = rubrik.reduce((s, r) => s + Number(r.bobot || 0), 0);
  const ubahRubrik = (i: number, k: string, v: any) => setRubrik(rubrik.map((r, j) => j === i ? { ...r, [k]: k === "bobot" ? Number(v) || 0 : v } : r));
  const ubahButir = (i: number, k: string, v: any) => setButir(butir.map((b, j) => j === i ? { ...b, [k]: v } : b));

  const simpan = async (kirimButir: boolean) => {
    try {
      const body: any = { bobot, kktp, kesempatanRevisi: revisi };
      if (rubrik.length) body.rubrik = rubrik;
      if (kirimButir && butir.length) { body.butir = butir; body.konfirmasi = konfirmasi; }
      await api(`/api/guru/asesmen/${a.id}/rubrik`, { method: "PUT", body });
      setMsg("Tersimpan. Perubahan rubrik/bobot/butir berlaku untuk penilaian berikutnya dan tercatat di log (ubah_rubrik).");
      onUlang?.();
    } catch (e: any) { setMsg(`Gagal menyimpan: ${e.message}`); }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={TIPE_INFO[a.tipe]?.tone}>{TIPE_INFO[a.tipe]?.label}</Badge>
          <Badge tone="slate">minggu {a.minggu} · {a.pertemuan}</Badge>
          <Badge tone={a.nilaiOtomatis === "true" ? "blue" : a.nilaiOtomatis === "sebagian" ? "amber" : "rose"}>
            {a.nilaiOtomatis === "true" ? "dinilai otomatis + pembahasan" : a.nilaiOtomatis === "sebagian" ? "PG otomatis + karya dinilai guru" : "dinilai guru dengan rubrik"}
          </Badge>
          {a.diubah_pada && <Badge tone="violet">disunting {a.diubah_pada}</Badge>}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">{a.judul}</h3>
        <p className="text-sm text-slate-600">{a.deskripsi}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Bobot dalam minggu (usulan 10–40)"><input type="number" min={0} max={100} className={inputCls} value={bobot} onChange={e => setBobot(+e.target.value)} /></Field>
          <Field label="KKTp (ketuntasan)"><input type="number" min={0} max={100} className={inputCls} value={kktp} onChange={e => setKktp(+e.target.value)} /></Field>
          <Field label="Kesempatan revisi"><input type="number" min={0} max={5} className={inputCls} value={revisi} onChange={e => setRevisi(+e.target.value)} /></Field>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900"><b>Remedial:</b> {a.remedial || "—"}</div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900"><b>Pengayaan:</b> {a.pengayaan || "—"}</div>
        </div>
      </Card>

      {rubrik.length > 0 && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-800">Rubrik penilaian (dapat disunting)</h3>
            <Badge tone={Math.abs(totalBobot - 100) < 0.01 ? "green" : "rose"}>total bobot kriteria {totalBobot}/100</Badge>
          </div>
          <div className="mt-3 space-y-3">
            {rubrik.map((r, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_100px]">
                  <Field label={`Kriteria ${i + 1}`}><input className={inputCls} value={r.kriteria} onChange={e => ubahRubrik(i, "kriteria", e.target.value)} /></Field>
                  <Field label="Bobot"><input type="number" className={inputCls} value={r.bobot} onChange={e => ubahRubrik(i, "bobot", e.target.value)} /></Field>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {["skor4", "skor3", "skor2", "skor1"].map(k => (
                    <Field key={k} label={`Deskriptor ${k.replace("skor", "skor ")}`}>
                      <textarea className={cx(inputCls, "h-16")} value={r[k]} onChange={e => ubahRubrik(i, k, e.target.value)} />
                    </Field>
                  ))}
                </div>
                {r.indikator && <div className="mt-1 text-xs text-slate-500">Indikator: {r.indikator}{r.catatan ? ` · ${r.catatan}` : ""}</div>}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn onClick={() => simpan(false)} disabled={Math.abs(totalBobot - 100) >= 0.01}>Simpan rubrik & bobot</Btn>
            <Btn variant="ghost" onClick={() => setRubrik([...rubrik, { kriteria: "Kriteria baru", bobot: 0, skor4: "", skor3: "", skor2: "", skor1: "" }])}>+ Tambah kriteria</Btn>
            {rubrik.length > 1 && <Btn variant="ghost" onClick={() => setRubrik(rubrik.slice(0, -1))}>− Hapus kriteria terakhir</Btn>}
          </div>
          {Math.abs(totalBobot - 100) >= 0.01 && <div className="mt-2 text-xs text-rose-600">Total bobot harus tepat 100 sebelum dapat disimpan — sesuaikan angka pada kolom bobot.</div>}
        </Card>
      )}

      {butir.length > 0 && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-800">Butir pilihan ganda & pembahasan ({butir.length})</h3>
            <Btn variant="ghost" onClick={() => setBukaButir(!bukaButir)}>{bukaButir ? "Sembunyikan" : "Tampilkan & sunting"}</Btn>
          </div>
          {bukaButir && (
            <>
              <ol className="mt-3 space-y-3">
                {butir.map((b, i) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-3">
                    <Field label={`Soal ${i + 1}`}><input className={inputCls} value={b.soal} onChange={e => ubahButir(i, "soal", e.target.value)} /></Field>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {b.opsi.map((o: string, j: number) => (
                        <Field key={j} label={`Opsi ${String.fromCharCode(65 + j)}${b.kunci === j ? " (kunci)" : ""}`}>
                          <input className={inputCls} value={o}
                            onChange={e => setButir(butir.map((x, k) => k === i ? { ...x, opsi: x.opsi.map((y: string, m: number) => m === j ? e.target.value : y) } : x))} />
                        </Field>
                      ))}
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[160px_1fr]">
                      <Field label="Kunci jawaban">
                        <select className={inputCls} value={b.kunci} onChange={e => ubahButir(i, "kunci", +e.target.value)}>
                          {b.opsi.map((_: string, j: number) => <option key={j} value={j}>{String.fromCharCode(65 + j)}</option>)}
                        </select>
                      </Field>
                      <Field label="Pembahasan (dibaca siswa setelah mengirim jawaban)">
                        <textarea className={cx(inputCls, "h-16")} value={b.pembahasan || ""} onChange={e => ubahButir(i, "pembahasan", e.target.value)} />
                      </Field>
                    </div>
                    {b.pembahasanSumber && <div className="mt-1 text-xs text-slate-500">{b.pembahasanSumber}</div>}
                  </li>
                ))}
              </ol>
              <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={konfirmasi} onChange={e => setKonfirmasi(e.target.checked)} />
                <span>Saya sudah memeriksa butir, kunci, dan pembahasan di atas (wajib untuk menyimpan perubahan butir).</span>
              </label>
              <Btn className="mt-2" onClick={() => simpan(true)} disabled={!konfirmasi}>Simpan butir & pembahasan</Btn>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

/* ==================== B. Penilaian memakai rubrik (wajib konfirmasi) ==================== */
function TabNilai({ setMsg, idAwal }: any) {
  const [minggu, setMinggu] = useState(5);
  const [tipe, setTipe] = useState("");
  const [daftar, setDaftar] = useState<any[]>([]);
  const [pilih, setPilih] = useState<string>(idAwal || "");
  const [detail, setDetail] = useState<any | null>(null);
  const [skor, setSkor] = useState<Record<string, Record<string, number>>>({});
  const [komentar, setKomentar] = useState<Record<string, string>>({});
  const [konfirmasi, setKonfirmasi] = useState<Record<string, boolean>>({});
  const [manual, setManual] = useState<Record<string, string>>({});

  const muatDaftar = async () => {
    const q = new URLSearchParams({ minggu: String(minggu) });
    if (tipe) q.set("tipe", tipe);
    const r = await api(`/api/guru/asesmen?${q.toString()}`);
    setDaftar(r.asesmen || []);
    if (!pilih && r.asesmen?.length) setPilih(r.asesmen[0].id);
  };
  const muatDetail = async () => { if (pilih) { const r = await api(`/api/guru/asesmen/${pilih}`); setDetail(r); } };
  useEffect(() => { muatDaftar(); }, [minggu, tipe]);
  useEffect(() => { muatDetail(); }, [pilih]);

  const simpanNilai = async (user_id: number, nama: string) => {
    try {
      const kriteria = skor[user_id] || {};
      await api(`/api/guru/asesmen/${pilih}/nilai`, {
        method: "POST",
        body: { user_id, kriteria, komentar: komentar[user_id] || "", konfirmasi: !!konfirmasi[user_id], skor_karya: manual[user_id] ? Number(manual[user_id]) : undefined },
      });
      setMsg(`Nilai ${nama} tersimpan (rubrik + komentar).`);
      setKonfirmasi({ ...konfirmasi, [user_id]: false });
      muatDetail(); muatDaftar();
    } catch (e: any) { setMsg(`Gagal menyimpan: ${e.message}`); }
  };
  const bukaUlang = async (user_id: number, nama: string) => {
    try {
      const alasan = komentar[user_id]?.trim() || "Mengulang bagian yang belum tuntas (remedial).";
      const r = await api(`/api/guru/asesmen/${pilih}/buka-ulang`, { method: "POST", body: { user_id, alasan } });
      setMsg(`${nama}: ${r.pesan} Nilai sebelumnya ${r.skor_lama ?? "—"} (tercatat di log sebagai buka_ulang_asesmen).`);
      muatDetail(); muatDaftar();
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };
  const mintaRevisi = async (user_id: number, nama: string) => {
    try {
      const r = await api(`/api/guru/asesmen/${pilih}/minta-revisi`, { method: "POST", body: { user_id, komentar: komentar[user_id] || "Perbaiki sesuai catatan guru." } });
      setMsg(`Permintaan revisi untuk ${nama} dikirim (sisa kesempatan: ${r.sisaRevisi}).`);
      muatDetail(); muatDaftar();
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };

  const rubrik = detail?.asesmen?.rubrik || [];
  const a = detail?.asesmen;

  return (
    <div>
      <FilterBar minggu={minggu} setMinggu={setMinggu} tipe={tipe} setTipe={setTipe} />
      <div className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {daftar.map(x => (
          <button key={x.id} onClick={() => setPilih(x.id)} className="text-left">
            <Card className={cx("p-3", pilih === x.id ? "border-blue-400 bg-blue-50" : "")}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={TIPE_INFO[x.tipe]?.tone}>{TIPE_INFO[x.tipe]?.icon}</Badge>
                <Badge tone="slate">{x.pertemuan}</Badge>
                <Badge tone={x.dinilai === x.jumlahSiswa && x.jumlahSiswa > 0 ? "green" : "amber"}>dinilai {x.dinilai}/{x.jumlahSiswa}</Badge>
                {x.perluRevisi > 0 && <Badge tone="rose">revisi {x.perluRevisi}</Badge>}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-800">{x.judul}</div>
              <div className="text-xs text-slate-500">terkumpul {x.terkumpul}/{x.jumlahSiswa} · rata {x.rata ?? "—"} · bobot {x.bobot} · KKTp {x.kktp}</div>
            </Card>
          </button>
        ))}
      </div>

      {!detail ? <Spinner label="Pilih asesmen untuk dinilai…" /> : (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={TIPE_INFO[a.tipe]?.tone}>{TIPE_INFO[a.tipe]?.label}</Badge>
            <Badge tone="slate">minggu {a.minggu} · bobot {a.bobot} · KKTp {a.kktp}</Badge>
            {rubrik.length === 0 && <Badge tone="amber">tanpa rubrik — penilaian manual dengan konfirmasi</Badge>}
            <a className="ml-auto text-xs text-blue-700 underline" href={`/guru/asesmen/${a.id}`}>tautan langsung</a>
          </div>
          <h3 className="mt-2 font-semibold text-slate-800">{a.judul}</h3>
          {rubrik.length > 0 && (
            <div className="mt-2 text-xs text-slate-600">
              Rubrik: {rubrik.map((r: any) => `${r.kriteria} (${r.bobot})`).join(" · ")}
              {a.nilaiOtomatis === "sebagian" ? " — skor akhir menggabungkan bagian pilihan ganda otomatis dengan bagian karya/uraian." : ""}
            </div>
          )}
          <div className="mt-4 space-y-3">
            {(detail.siswa || []).map((s: any) => (
              <div key={s.user_id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-800">{s.nama_lengkap}</span>
                    <Badge tone={s.status === "dinilai" ? "green" : s.status === "terkumpul" ? "amber" : s.status === "perlu-revisi" ? "rose" : "slate"}>{s.status}</Badge>
                    {s.skor !== null && s.skor !== undefined && <Badge tone="green">nilai {s.skor}</Badge>}
                    {s.skor_butir !== null && s.total_butir ? <Badge tone="blue">PG {s.skor_butir}/{s.total_butir}</Badge> : null}
                    <Badge tone="slate">revisi {s.revisi_ke}/{a.kesempatanRevisi}</Badge>
                  </div>
                </div>

                {s.jawaban && (s.jawaban.teks || s.jawaban.tautan) && (
                  <div className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
                    {s.jawaban.teks && <div className="whitespace-pre-wrap">{s.jawaban.teks}</div>}
                    {s.jawaban.tautan && <a className="text-blue-700 underline" href={s.jawaban.tautan} target="_blank" rel="noreferrer">bukti karya: {s.jawaban.tautan}</a>}
                  </div>
                )}
                {s.rincian?.bagianOtomatis !== undefined && (
                  <div className="mt-2 text-xs text-slate-600">Bagian otomatis (PG): <b>{s.rincian.bagianOtomatis}</b> · bagian karya/uraian dinilai guru: <b>{s.rincian.bagianGuru}</b></div>
                )}

                {rubrik.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {rubrik.map((r: any) => (
                      <div key={r.kriteria} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <div>
                          <div className="text-xs font-medium text-slate-600">{r.kriteria} · bobot {r.bobot}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {[4, 3, 2, 1].map(n => (
                              <button key={n} onClick={() => setSkor({ ...skor, [s.user_id]: { ...(skor[s.user_id] || {}), [r.kriteria]: n } })}
                                className={cx("rounded-lg border px-2 py-1 text-xs", skor[s.user_id]?.[r.kriteria] === n ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700")}>
                                {n} — {r[`skor${n}`]?.slice(0, 46) || "—"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <Field label="Skor manual 0–100 (mis. koreksi kuis atau penilaian tanpa rubrik)">
                      <input className={inputCls} value={manual[s.user_id] ?? (s.skor ?? "")} onChange={e => setManual({ ...manual, [s.user_id]: e.target.value })} />
                    </Field>
                  </div>
                )}

                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                  <input className={inputCls} placeholder="Komentar guru untuk siswa" value={komentar[s.user_id] ?? (s.komentar || "")} onChange={e => setKomentar({ ...komentar, [s.user_id]: e.target.value })} />
                  <Btn onClick={() => simpanNilai(s.user_id, s.nama_lengkap)}>Simpan nilai</Btn>
                  <Btn variant="ghost" onClick={() => mintaRevisi(s.user_id, s.nama_lengkap)}>Minta revisi</Btn>
                  <Btn variant="ghost" onClick={() => bukaUlang(s.user_id, s.nama_lengkap)}>Buka ulang (remedial)</Btn>
                </div>
                <label className="mt-2 flex items-start gap-2 text-xs text-slate-700">
                  <input type="checkbox" checked={!!konfirmasi[s.user_id]} onChange={e => setKonfirmasi({ ...konfirmasi, [s.user_id]: e.target.checked })} />
                  <span>Saya sudah memeriksa bukti karya/proses siswa ini dengan rubrik di atas (wajib dicentang; server menolak penilaian tanpa konfirmasi).</span>
                </label>
                {s.status === "dinilai" && s.dinilai_pada && <div className="mt-1 text-xs text-slate-500">dinilai pada {s.dinilai_pada}</div>}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Penilaian aspek artistik/proses <b>tidak pernah otomatis</b>. Nilai hanya tersimpan setelah guru memilih skor setiap kriteria dan mencentang konfirmasi.
          </div>
        </Card>
      )}
    </div>
  );
}

/* ==================== C. Rekap per peserta didik / per minggu / per jenis ==================== */
function TabRekap({ setMsg }: any) {
  const [mode, setMode] = useState<"siswa" | "minggu" | "jenis">("siswa");
  const [data, setData] = useState<any | null>(null);
  useEffect(() => { api("/api/guru/rekap-asesmen").then(setData).catch(e => setMsg(`Gagal memuat rekap: ${e.message}`)); }, []);
  if (!data) return <Spinner label="Menghitung rekap asesmen…" />;
  const tabelKosong = (mode === "siswa" && !data.perSiswa?.length) || (mode === "minggu" && !data.perMinggu?.length) || (mode === "jenis" && !data.perJenis?.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {([["siswa", "👤 Per peserta didik"], ["minggu", "🗓️ Per minggu"], ["jenis", "🗂️ Per jenis asesmen"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k as any)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", mode === k ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>{l}</button>
        ))}
        <a className="ml-auto" href={`/api/guru/rekap-asesmen.csv?mode=${mode}`} download>
          <Btn variant="ghost">⬇️ Unduh CSV ({mode})</Btn>
        </a>
      </div>
      {tabelKosong ? <Empty text="Belum ada data." /> : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            {mode === "siswa" && (
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Peserta didik</th><th className="px-3 py-2">Nilai akhir</th>
                    {Object.keys(TIPE_INFO).map(t => <th key={t} className="px-3 py-2">{TIPE_INFO[t].icon} {t}</th>)}
                    <th className="px-3 py-2">Menunggu</th><th className="px-3 py-2">Remedial</th><th className="px-3 py-2">Pengayaan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.perSiswa.map((s: any) => (
                    <tr key={s.user_id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{s.nama_lengkap}</td>
                      <td className="px-3 py-2">{s.nilai_akhir === null ? <span className="text-slate-400">—</span> : <Badge tone={s.nilai_akhir >= 75 ? "green" : "amber"}>{s.nilai_akhir}</Badge>}</td>
                      {Object.keys(TIPE_INFO).map(t => (
                        <td key={t} className="px-3 py-2 text-slate-600">{s.per_jenis[t]?.rata ?? "—"} <span className="text-xs text-slate-400">({s.per_jenis[t]?.dinilai ?? 0}/{s.per_jenis[t]?.total ?? 0})</span></td>
                      ))}
                      <td className="px-3 py-2 text-slate-600">{s.menungguPenilaian}</td>
                      <td className="px-3 py-2">{s.remedial.length ? <Badge tone="rose">{s.remedial.length} asesmen</Badge> : <span className="text-slate-400">—</span>}</td>
                      <td className="px-3 py-2">{s.nilai_akhir !== null && s.nilai_akhir >= 88 && s.remedial.length === 0 ? <Badge tone="green">layak</Badge> : <span className="text-slate-400">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {mode === "minggu" && (
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-3 py-2">Minggu</th><th className="px-3 py-2">Asesmen</th><th className="px-3 py-2">Rata kelas</th>{data.perSiswa.map((s: any) => <th key={s.user_id} className="px-3 py-2">{s.nama_lengkap.split(" ")[0]}</th>)}</tr>
                </thead>
                <tbody>
                  {data.perMinggu.filter((r: any) => r.jumlahAsesmen > 0).map((r: any) => (
                    <tr key={r.minggu} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{r.minggu}</td>
                      <td className="px-3 py-2 text-slate-600">{r.jumlahAsesmen} ({r.tipe.map((t: string) => TIPE_INFO[t]?.icon).join("")})</td>
                      <td className="px-3 py-2">{r.rata_kelas ?? "—"}</td>
                      {r.siswa.map((s: any) => <td key={s.user_id} className="px-3 py-2 text-slate-600">{s.skor ?? "—"}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {mode === "jenis" && (
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-3 py-2">Jenis asesmen</th><th className="px-3 py-2">Jumlah asesmen</th><th className="px-3 py-2">Rata kelas</th>{data.perSiswa.map((s: any) => <th key={s.user_id} className="px-3 py-2">{s.nama_lengkap.split(" ")[0]}</th>)}</tr>
                </thead>
                <tbody>
                  {data.perJenis.map((r: any) => (
                    <tr key={r.tipe} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{TIPE_INFO[r.tipe]?.icon} {TIPE_INFO[r.tipe]?.label}</td>
                      <td className="px-3 py-2 text-slate-600">{r.jumlahAsesmen}</td>
                      <td className="px-3 py-2">{r.rata_kelas ?? "—"}</td>
                      {r.siswa.map((s: any) => (
                        <td key={s.user_id} className="px-3 py-2 text-slate-600">
                          {s.rata ?? "—"} {s.diBawahKktp ? <Badge tone="rose">{s.diBawahKktp}↓</Badge> : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
        Nilai minggu dihitung berbobot dari komponen yang <b>sudah dinilai</b> pada minggu itu; komponen yang belum dijalankan tidak menurunkan nilai.
        Kolom “menunggu” = pekerjaan terkumpul yang belum dinilai guru (tidak ada nilai otomatis untuk karya/proses).
      </div>
    </div>
  );
}

/* ==================== D. Remedial & pengayaan ==================== */
function TabRemedial() {
  const [data, setData] = useState<any | null>(null);
  useEffect(() => { api("/api/guru/asesmen-remedial").then(setData).catch(() => setData({ remedial: [], pengayaan: [] })); }, []);
  if (!data) return <Spinner label="Menghitung daftar remedial…" />;
  const layak = (data.pengayaan || []).filter((p: any) => p.layakPengayaan);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">🩹 Daftar remedial (nilai di bawah KKTp)</h3>
        <div className="mt-2 text-xs text-slate-500">Nilai di bawah KKTp pada asesmen yang sudah dinilai. Langkah remedial mengikuti kolom “remedial” tiap asesmen (mengulang bagian yang belum tuntas, bukan sekadar menambah nilai).</div>
        {data.remedial.length === 0 ? <Empty text="Belum ada siswa di bawah KKTp." /> : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {data.remedial.map((r: any, i: number) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <div className="font-medium text-slate-800">{r.nama_lengkap}</div>
                  <div className="text-xs text-slate-500">minggu {r.minggu} · {TIPE_INFO[r.tipe]?.label} · {r.judul}</div>
                </div>
                <Badge tone="rose">{r.skor} &lt; KKTp {r.kktp}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">🚀 Kandidat pengayaan</h3>
        <div className="mt-2 text-xs text-slate-500">Siswa dengan nilai akhir ≥ 88 tanpa remedial. Pengayaan yang tersedia tercantum pada tiap asesmen (mis. membuat soal baru, variasi karya, materi ajar mini).</div>
        {layak.length === 0 ? <Empty text="Belum ada kandidat pengayaan." /> : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {layak.map((p: any) => (
              <li key={p.user_id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="font-medium text-slate-800">{p.nama_lengkap}</span>
                <Badge tone="green">nilai akhir {p.nilai_akhir}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
