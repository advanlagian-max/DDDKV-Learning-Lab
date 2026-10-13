// sims.tsx — Laboratorium simulasi: 7 laboratorium berfungsi (Tipografi, Fotografi, Bitmap & Vektor,
// Alur Produksi, K3 & Ergonomi, Sketsa & Ilustrasi, Studio DKV) + 1 simulasi technopreneur yang jujur
// ditandai masih dalam pengembangan.
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Btn, Badge, PageTitle, cx, useSiswaStatus } from "./lib";
import { TypografiLab, FotografiLab, BitmapVektorLab, AlurProduksiLab } from "./labs";
import { K3Lab, SketsaLab, StudioLab } from "./labs2";

export const SIM_REGISTRY: Record<string, { judul: string; desc: string; minggu: number[]; status: "tersedia" | "pengembangan"; icon: string }> = {
  "sim-tipografi": { judul: "Laboratorium Tipografi", desc: "Jenis huruf, ukuran, perataan, leading, kerning, tracking, dan hierarki — beserta umpan balik keterbacaan.", minggu: [19, 20, 21, 22, 23, 24], status: "tersedia", icon: "🔤" },
  "sim-fotografi": { judul: "Laboratorium Fotografi (Segitiga Eksposur)", desc: "Ubah aperture, shutter speed, dan ISO; lihat dampaknya pada kecerahan, gerakan, latar, dan noise.", minggu: [25, 26, 27, 28, 29, 30], status: "tersedia", icon: "📷" },
  "sim-bitmap-vektor": { judul: "Laboratorium Bitmap & Vektor", desc: "Perbesar gambar bitmap dan vektor, bandingkan mutunya, lalu pilih format sesuai kebutuhan keluaran.", minggu: [10, 31, 33, 34], status: "tersedia", icon: "🖼️" },
  "sim-alur-produksi": { judul: "Laboratorium Alur Produksi DKV", desc: "Susun urutan tahapan produksi untuk tiga jenis brief (poster, media sosial, kemasan).", minggu: [11, 15], status: "tersedia", icon: "🏭" },
  "sim-k3-ergonomi": { judul: "Laboratorium K3 & Ergonomi", desc: "Temukan risiko kerja, atur postur kerja sehat, dan pilih tindakan kerja aman.", minggu: [5], status: "tersedia", icon: "🦺" },
  "sim-sketsa-lab": { judul: "Laboratorium Sketsa & Ilustrasi", desc: "Kembangkan ide dari brief: kata kunci, arah konsep, moodboard, dan evaluasi konsep memakai rubrik.", minggu: [16, 17, 18], status: "tersedia", icon: "✏️" },
  "sim-studio-dkv": { judul: "Studio DKV — Proyek Terpadu", desc: "Selesaikan proyek lima tahap dari brief, riset, konsep, desain, uji, hingga presentasi.", minggu: [35, 36], status: "tersedia", icon: "🎬" },
  "sim-technopreneur": { judul: "Simulasi Technopreneurship DKV", desc: "Pilih ide usaha DKV, tentukan harga, dan lihat umpan balik kelayakan.", minggu: [2, 3, 4], status: "pengembangan", icon: "💼" },
};

const LABS: Record<string, React.ComponentType<{ onResetLab: () => void }>> = {
  "sim-tipografi": TypografiLab,
  "sim-fotografi": FotografiLab,
  "sim-bitmap-vektor": BitmapVektorLab,
  "sim-alur-produksi": AlurProduksiLab,
  "sim-k3-ergonomi": K3Lab,
  "sim-sketsa-lab": SketsaLab,
  "sim-studio-dkv": StudioLab,
};

export function SimulasiEmbed({ id }: { id: string }) {
  const [nonce, setNonce] = useState(0);
  const reg = SIM_REGISTRY[id];
  if (!reg) return <div className="text-sm text-slate-500">Simulasi tidak dikenal.</div>;
  const Lab = LABS[id];
  if (!Lab) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        <Badge tone="amber">dalam pengembangan</Badge>
        <p className="mt-2">{reg.desc} Simulasi ini <b>belum tersedia</b> dan ditandai jujur sebagai pekerjaan belum selesai pada laporan pengembangan.</p>
      </div>
    );
  }
  return <Lab key={nonce} onResetLab={() => setNonce(n => n + 1)} />;
}

export function SimulasiHub() {
  const { status } = useSiswaStatus();
  const blocked = status?.controls?.simulasi === false || status?.allow_simulation === false;
  const jumlahBerfungsi = Object.values(SIM_REGISTRY).filter(r => r.status === "tersedia").length;
  return (
    <div>
      <PageTitle title="Laboratorium Simulasi" sub={`${jumlahBerfungsi} laboratorium berfungsi · setiap lab menerima input, menampilkan perubahan, memberi umpan balik, menyediakan tombol reset, tantangan bertingkat, dan refleksi`} />
      {blocked && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">Guru belum mengizinkan simulasi pada sesi ini. Anda masih dapat melihat daftarnya.</div>}
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Semua lab di bawah adalah <b>model simulasi edukatif</b>: hasilnya dihitung dengan rumus sederhana dan disederhanakan,
        <b> bukan hasil kamera, bukan keluaran perangkat lunak desain, dan bukan penilaian karya nyata</b>.
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(SIM_REGISTRY).map(([id, r]) => (
          <Link key={id} to={`/simulasi/${id}`} className={cx("group", blocked && "pointer-events-none opacity-60")}>
            <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{r.icon}</div>
                <Badge tone={r.status === "tersedia" ? "green" : "amber"}>{r.status === "tersedia" ? "berfungsi" : "dalam pengembangan"}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-slate-800">{r.judul}</h3>
              <p className="mt-1 text-sm text-slate-600">{r.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1">{r.minggu.map(m => <Badge key={m} tone="slate">m{m}</Badge>)}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SimulasiDetail() {
  const { id } = useParams();
  const reg = SIM_REGISTRY[id || ""];
  const { status, refresh } = useSiswaStatus();
  const blocked = status?.controls?.simulasi === false || status?.allow_simulation === false;
  const [started, setStarted] = useState(false);
  if (!reg) return <div className="p-6">Simulasi tidak ditemukan. <Link className="text-blue-700 underline" to="/simulasi">Kembali</Link></div>;
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title={`${reg.icon} ${reg.judul}`} sub={reg.desc}
        right={<div className="flex gap-2"><Btn variant="ghost" onClick={refresh}>↻ Cek izin guru</Btn><Link to="/simulasi"><Btn variant="ghost">← Semua simulasi</Btn></Link></div>} />
      {blocked ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <b>Simulasi belum diizinkan guru</b> pada sesi ini. Tunggu instruksi — status diperbarui otomatis setiap ±5 detik.
        </div>
      ) : reg.status === "pengembangan" ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
          <Badge tone="amber">dalam pengembangan</Badge>
          <p className="mt-3 text-sm">Simulasi ini direncanakan dan <b>belum diimplementasikan</b>. Ditandai jujur sebagai pekerjaan yang belum selesai — jangan dianggap berfungsi.</p>
        </div>
      ) : started ? (
        <SimulasiEmbed id={id!} />
      ) : (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800">Sebelum mulai</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Setiap laboratorium memuat <b>petunjuk</b>, <b>tantangan bertingkat</b>, <b>umpan balik</b>, tombol <b>atur ulang</b>, dan <b>refleksi</b>.</li>
            <li>Coba ubah setiap pengaturan dan amati perubahannya; salah satu pengaturan biasanya menuntut penyesuaian pengaturan lain.</li>
            <li>Umpan balik dan hasil kerja dihitung dengan model sederhana — bukan hasil kamera atau perangkat lunak desain sungguhan.</li>
            <li>Selesaikan tantangan berurutan (tingkat 1 → 3), lalu kumpulkan hasil dan tulis refleksimu.</li>
          </ul>
          <div className="mt-4"><Btn onClick={() => setStarted(true)}>▶ Jalankan laboratorium</Btn></div>
        </Card>
      )}
    </div>
  );
}
