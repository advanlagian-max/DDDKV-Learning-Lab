// asesmen.tsx — Halaman asesmen peserta didik: diagnostik, formatif, sumatif, praktik, proyek, presentasi, refleksi.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, useAuth, useSiswaStatus, Card, Btn, Badge, Spinner, Empty, PageTitle, Toast, Field, inputCls, DataDemo, cx } from "./lib";

type Kategori = "semua" | "diagnostik" | "formatif" | "sumatif" | "proyek" | "refleksi";

const LABEL_BENTUK: Record<string, string> = {
  "kuis-diagnostik": "Kuis diagnostik",
  "kuis-pilihan-ganda": "Kuis pilihan ganda (dinilai otomatis)",
  "asesmen-sumatif-bab-dan-semester": "Asesmen sumatif BAB & semester",
  "uji-kompetensi-ebab-buku": "Uji Kompetensi buku",
  "asesmen-sumatif-akhir-semester": "Asesmen sumatif akhir semester",
};

const kategoriDari = (bentuk: string, adaProyek: boolean): Kategori => {
  if (bentuk.includes("diagnostik")) return "diagnostik";
  if (bentuk.includes("sumatif") || bentuk.includes("uji-kompetensi")) return "sumatif";
  if (adaProyek) return "proyek";
  return "formatif";
};

export function AsesmenSiswa() {
  const { user } = useAuth();
  const { status } = useSiswaStatus();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [tugas, setTugas] = useState<any[]>([]);
  const [refleksi, setRefleksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<Kategori>("semua");
  const [msg, setMsg] = useState("");
  const [isi, setIsi] = useState("");
  const [muat, setMuat] = useState(true);

  const ambil = async () => {
    try {
      const [a, b, c] = await Promise.all([api("/api/kurikulum"), api("/api/tugas"), api("/api/refleksi")]);
      setWeeks(a.weeks || []); setTugas(b.tugas || []); setRefleksi(c.refleksi || []);
    } catch (e: any) { setMsg(e.message); }
    setMuat(false);
  };
  useEffect(() => { ambil(); }, []);

  const baris = useMemo(() => weeks.map(w => {
    const a = w.asesmenFormatif || {};
    const bentuk = String(a.bentuk || "");
    const tugasTerkait = tugas.filter(t => t.week_nomor === w.minggu);
    const kuis = tugasTerkait.find(t => t.tipe === "kuis");
    const lkpd = tugasTerkait.find(t => t.tipe !== "kuis");
    return {
      minggu: w.minggu, semester: w.semester, tema: w.tema, bentuk, asesmen: a,
      kategori: kategoriDari(bentuk, !!w.proyek), proyek: w.proyek, lkpd: w.lkpd, tugas: { kuis, lkpd },
      akses: w.akses,
    };
  }), [weeks, tugas]);

  const tampil = baris.filter(b => kategori === "semua" || b.kategori === kategori);
  const nilaiKuis = tugas.filter(t => t.tipe === "kuis" && t.skor !== null && t.skor !== undefined);
  const rata = nilaiKuis.length ? (nilaiKuis.reduce((s, t) => s + Number(t.skor || 0), 0) / nilaiKuis.length).toFixed(1) : "—";
  const lkpdSelesai = tugas.filter(t => t.tipe !== "kuis" && t.status_kumpul).length;

  const kirimRefleksi = async () => {
    if (!isi.trim()) return setMsg("Tulis refleksi terlebih dahulu.");
    try {
      await api("/api/refleksi", { method: "POST", body: { week_nomor: status?.minggu_aktif || null, isi } });
      setIsi(""); setMsg("Refleksi tersimpan — guru dapat melihatnya pada menu Penilaian."); ambil();
    } catch (e: any) { setMsg(`Gagal: ${e.message}`); }
  };

  const kategoriList: [Kategori, string][] = [["semua", "Semua asesmen"], ["diagnostik", "Diagnostik"], ["formatif", "Formatif"],
    ["sumatif", "Sumatif / Uji Kompetensi"], ["proyek", "Proyek & praktik"], ["refleksi", "Refleksi"]];

  return (
    <div>
      <PageTitle title="Asesmen & Penilaian" sub="Diagnostik · formatif · sumatif · praktik · proyek · presentasi · refleksi — penilaian objektif otomatis, karya & jawaban terbuka dinilai guru" />

      {msg && <Toast msg={msg} onClose={() => setMsg("")} />}
      {status?.controls?.kuis === false && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>Menu Asesmen belum dibuka guru.</b> Kamu masih dapat membaca daftar asesmen dan riwayat nilai; mengerjakan kuis/mengirim refleksi menunggu dibuka.
        </div>
      )}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-slate-600">Rata-rata kuis (otomatis)</div>
          <div className="mt-1 text-2xl font-semibold text-slate-800">{rata}</div>
          <div className="mt-1 text-xs text-slate-500">{nilaiKuis.length} kuis telah dinilai server</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">LKPD/tugas terkumpul</div>
          <div className="mt-1 text-2xl font-semibold text-slate-800">{lkpdSelesai}</div>
          <div className="mt-1 text-xs text-slate-500">dari {tugas.filter(t => t.tipe !== "kuis").length} tugas yang diterbitkan guru</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Refleksi terkirim</div>
          <div className="mt-1 text-2xl font-semibold text-slate-800">{refleksi.length}</div>
          <div className="mt-1 text-xs text-slate-500">refleksi dibaca guru pada menu Penilaian</div>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {kategoriList.map(([k, l]) => (
          <button key={k} onClick={() => setKategori(k)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", kategori === k ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700")}>
            {l}{k !== "refleksi" && <span className="ml-1 text-xs opacity-70">({baris.filter(b => k === "semua" || b.kategori === k).length})</span>}
          </button>
        ))}
      </div>

      {kategori === "refleksi" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800">🪞 Tulis refleksi pembelajaran</h3>
            <p className="mt-1 text-sm text-slate-600">Refleksi menjadi bukti asesmen sikap & kemajuan (aspek C.4 instrumen supervisi).</p>
            <div className="mt-3">
              <Field label={`Minggu ke-${status?.minggu_aktif ?? "—"} — apa yang kamu pelajari, apa yang masih sulit?`}>
                <textarea className={cx(inputCls, "h-28")} value={isi} onChange={e => setIsi(e.target.value)} />
              </Field>
              <div className="mt-2"><Btn onClick={kirimRefleksi}>Kirim refleksi</Btn></div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800">Riwayat refleksi saya</h3>
            {refleksi.length === 0 ? <Empty text="Belum ada refleksi." /> : (
              <ul className="mt-2 space-y-2 text-sm">
                {refleksi.slice(0, 10).map(r => (
                  <li key={r.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Minggu {r.week_nomor ?? "—"} · {r.created_at}</div>
                    <div className="mt-1 text-slate-700">{r.isi}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : muat ? <Spinner /> : tampil.length === 0 ? <Empty text="Tidak ada asesmen pada kategori ini." /> : (
        <div className="space-y-3">
          {tampil.map(b => {
            const nama = LABEL_BENTUK[b.bentuk] || b.bentuk || "Asesmen formatif";
            const warna: Record<Kategori, string> = { semua: "slate", diagnostik: "violet", formatif: "blue", sumatif: "rose", proyek: "amber", refleksi: "green" };
            const kuis = b.tugas.kuis;
            const lkpd = b.tugas.lkpd;
            return (
              <Card key={b.minggu} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={b.semester === 1 ? "blue" : "violet"}>Minggu {b.minggu}</Badge>
                      <Badge tone={warna[b.kategori]}>{nama}</Badge>
                      {b.asesmen?.jumlahSoal ? <Badge tone="slate">{b.asesmen.jumlahSoal} soal</Badge> : null}
                      {b.akses === "terkunci" && <Badge tone="amber">🔒 menunggu guru</Badge>}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-800">{b.tema}</div>
                    <div className="mt-1 text-xs text-slate-500">Cakupan: {b.asesmen?.cakupan || "—"}</div>
                    {b.lkpd?.judul && <div className="mt-1 text-xs text-slate-500">LKPD: {b.lkpd.judul}{b.lkpd.bobot ? ` · bobot ${b.lkpd.bobot}` : ""}</div>}
                    {b.proyek && <div className="mt-1 text-xs text-slate-500">Proyek: {b.proyek.judul} — luaran {b.proyek.luaran}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {kuis && (
                      <Badge tone={kuis.status_kumpul === "graded" ? "green" : kuis.status_kumpul ? "amber" : "slate"}>
                        {kuis.status_kumpul === "graded" ? `dinilai: ${kuis.skor}` : kuis.status_kumpul === "submitted" ? `sudah dikirim (skor ${kuis.skor ?? "-"})` : "belum dikerjakan"}
                      </Badge>
                    )}
                    <div className="flex flex-wrap justify-end gap-2">
                      {kuis
                        ? <Link to="/tugas"><Btn>{kuis.status_kumpul ? "Lihat jawaban" : "Kerjakan kuis"}</Btn></Link>
                        : b.kategori === "proyek"
                          ? <Link to="/portofolio"><Btn>Unggah karya</Btn></Link>
                          : <Link to={`/pertemuan/${b.minggu}/senin`}><Btn variant="ghost">Lihat pertemuan</Btn></Link>}
                      {lkpd && <Link to="/tugas"><Btn variant="ghost">Buka LKPD</Btn></Link>}
                      <Link to={`/materi/${b.minggu}`}><Btn variant="ghost">Materi</Btn></Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-3">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800">Bagaimana nilai dihitung?</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li><b>Objektif (kuis pilihan ganda)</b> — dinilai otomatis oleh server saat kamu menekan kirim; skor langsung tampil.</li>
            <li><b>Karya visual & jawaban terbuka</b> — dinilai guru memakai rubrik tiap LKPD (skor 1–4 pada kriteria) dengan umpan balik tertulis.</li>
            <li><b>Proyek & praktik</b> — bukti berupa karya pada portofolio digital + deskripsi proses; presentasi dinilai di kelas.</li>
            <li><b>Refleksi</b> — bukti kemajuan belajar, dipakai guru untuk remedial/pengayaan.</li>
          </ul>
        </Card>
        <DataDemo text="Daftar asesmen, jumlah soal, dan cakupan di halaman ini adalah data contoh (seed) hasil penyusunan 36 minggu; guru dapat menyesuaikannya." />
      </div>

      {user?.role !== "siswa" && <div className="mt-3 text-sm text-slate-500">Pratinjau ini ditampilkan sebagai peran {user?.role} — ringkasan nilai bersifat contoh.</div>}
    </div>
  );
}
