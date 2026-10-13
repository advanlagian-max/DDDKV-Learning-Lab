// App.tsx — Router, kerangka navigasi, login, dan penjaga peran.
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth, api, useSiswaStatus, Btn, Field, inputCls, Spinner, Badge, DataDemo, cx, LockedNotice } from "./lib";
import {
  SiswaDashboard, MateriList, MateriDetail, TugasSiswa, PortofolioSiswa
} from "./siswa";
import { SimulasiHub, SimulasiDetail } from "./sims";
import { GuruDashboard, GuruKontrol, GuruMateri, GuruPenilaian, GuruRekap } from "./guru";
import { GuruSupervisi } from "./supervisi";
import { GuruDokumentasi } from "./dokumentasi";
import { CetakSupervisi, CetakDokumentasi, CetakRekapNilai } from "./cetak";
import { AdminHome } from "./admin";
import { PertemuanHub, PertemuanDetail } from "./pertemuan";
import { AsesmenSiswa } from "./asesmen";
import { AsesmenRencana, RekapSiswaAsesmen } from "./asesmen2";
import { GuruAsesmen, GuruAsesmenDetail } from "./guru-asesmen";

const NAV = {
  siswa: [
    { to: "/", label: "Dashboard", icon: "🏠", menu: "dashboard" },
    { to: "/materi", label: "Materi 36 Minggu", icon: "📚", menu: "materi" },
    { to: "/pertemuan", label: "Pertemuan (72)", icon: "🗓️", menu: "pertemuan" },
    { to: "/simulasi", label: "Laboratorium Simulasi", icon: "🧪", menu: "simulasi" },
    { to: "/tugas", label: "LKPD & Tugas", icon: "📝", menu: "lkpd" },
    { to: "/asesmen", label: "Asesmen & Penilaian", icon: "🎯", menu: "kuis" },
    { to: "/asesmen/rencana", label: "Rencana Asesmen 36 Minggu", icon: "📋", menu: "kuis" },
    { to: "/asesmen/rekap", label: "Rekap Hasil Asesmen", icon: "📈", menu: "kuis" },
    { to: "/portofolio", label: "Portofolio Digital", icon: "🎨", menu: "portofolio" },
  ],
  guru: [
    { to: "/guru", label: "Dashboard Guru", icon: "📊" },
    { to: "/guru/kontrol", label: "Kontrol Pembelajaran", icon: "🎛️" },
    { to: "/guru/materi", label: "Materi & Suntingan", icon: "📚" },
    { to: "/guru/asesmen", label: "Asesmen 36 Minggu", icon: "🎯" },
    { to: "/guru/rekap-asesmen", label: "Rekap Asesmen", icon: "📈" },
    { to: "/guru/remedial", label: "Remedial & Pengayaan", icon: "🩹" },
    { to: "/guru/penilaian", label: "Penilaian", icon: "✅" },
    { to: "/guru/dokumentasi", label: "Dokumentasi Pertemuan", icon: "📄" },
    { to: "/guru/supervisi", label: "Supervisi Akademik", icon: "🪪" },
    { to: "/guru/rekap", label: "Rekap Nilai", icon: "📈" },
  ],
  admin: [
    { to: "/admin", label: "Administrasi", icon: "🛠️" },
  ],
};

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"siswa" | "guru">("siswa");
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const user = await login(u.trim(), p, tab);
      nav(user.role === "siswa" ? "/" : user.role === "guru" ? "/guru" : "/admin");
    } catch (x: any) { setErr(x.message || "Login gagal."); }
    setBusy(false);
  };
  const isi = (uu: string, pp: string) => { setU(uu); setP(pp); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-slate-950 p-8 text-white md:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-2xl">🎨</div>
              <div>
                <div className="text-lg font-bold leading-tight">DKV Learning Lab</div>
                <div className="text-xs text-slate-400">SMKN 3 Kuningan · Fase E</div>
              </div>
            </div>
            <h1 className="mt-8 text-2xl font-bold leading-snug">Media pembelajaran interaktif Dasar-Dasar Desain Komunikasi Visual</h1>
            <p className="mt-3 text-sm text-slate-300">36 minggu · 72 pertemuan · 12 JP/pekan (Senin & Rabu) — berbasis buku Kemendikbudristek 2022 dan Instrumen Supervisi Deep Learning sekolah.</p>
          </div>
          <div className="mt-8 space-y-2 text-xs text-slate-400">
            <p>🧪 Simulasi tipografi, fotografi, bitmap-vektor, alur produksi</p>
            <p>🎛️ Kontrol pembelajaran real-time oleh guru</p>
            <p>🗂️ Dokumentasi supervisi & portofolio digital</p>
          </div>
        </div>
        <div className="p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-medium">
            <button onClick={() => setTab("siswa")} className={tab === "siswa" ? "rounded-xl bg-white py-2 shadow" : "py-2 text-slate-500"}>🎓 Masuk sebagai Siswa</button>
            <button onClick={() => setTab("guru")} className={tab === "guru" ? "rounded-xl bg-white py-2 shadow" : "py-2 text-slate-500"}>👩‍🏫 Mode Guru / Admin</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Username">
              <input className={inputCls} value={u} onChange={e => setU(e.target.value)} placeholder={tab === "siswa" ? "mis. aditya" : "mis. dewi / admin"} autoComplete="username" />
            </Field>
            <Field label="Password">
              <input type="password" className={inputCls} value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" />
            </Field>
            {err && <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}
            <Btn type="submit" disabled={busy} className="w-full py-2.5">{busy ? "Memeriksa…" : "Masuk"}</Btn>
          </form>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-slate-700">
            <div className="font-semibold text-amber-900">🏷️ Data demo — akun contoh (ganti password setelah uji coba):</div>
            {tab === "siswa" ? (
              <div className="mt-1 space-y-1">
                <button className="block hover:text-blue-700" onClick={() => isi("aditya", "siswa123")}>siswa: <b>aditya / siswa123</b> (X DKV 1)</button>
                <button className="block hover:text-blue-700" onClick={() => isi("gita", "siswa123")}>siswa: <b>gita / siswa123</b> (X DKV 2)</button>
              </div>
            ) : (
              <div className="mt-1 space-y-1">
                <button className="block hover:text-blue-700" onClick={() => isi("dewi", "guru123")}>guru: <b>dewi / guru123</b></button>
                <button className="block hover:text-blue-700" onClick={() => isi("saidun", "guru123")}>supervisor: <b>saidun / guru123</b></button>
                <button className="block hover:text-blue-700" onClick={() => isi("admin", "admin123")}>admin: <b>admin / admin123</b></button>
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
            Peta 36 minggu bersifat usulan operasional dan perlu diverifikasi guru terhadap CP/ATP & kalender sekolah.
          </p>
        </div>
      </div>
    </div>
  );
}

function NavSiswa({ items, onPick }: { items: any[]; onPick: () => void }) {
  const { status } = useSiswaStatus();
  const ctrl: any = status?.controls || {};
  return (
    <nav className="mt-4 space-y-1">
      {items.map((it: any) => {
        const terkunci = it.menu && ctrl[it.menu] === false;
        return (
          <NavLink key={it.to} to={it.to} end={it.to === "/"} onClick={onPick}
            className={({ isActive }) => cx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              isActive ? "bg-blue-600 text-white shadow" : terkunci ? "text-slate-500 hover:bg-slate-800" : "text-slate-300 hover:bg-slate-800")}>
            <span>{it.icon}</span>
            <span className="flex-1">{it.label}</span>
            {terkunci && <span className="rounded bg-amber-400/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950">terkunci</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Shell({ role, children }: { role: string; children: React.ReactNode }) {
  const { user, meta, logout } = useAuth();
  const nav = useNavigate();
  const items = (NAV as any)[role] || [];
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className={cx("dkv-no-print fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950 p-4 text-slate-200 transition-transform md:static md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl">🎨</div>
          <div>
            <div className="text-sm font-bold text-white">DKV Learning Lab</div>
            <div className="text-[11px] text-slate-400">{meta?.institusi?.nama || "SMK Negeri 3 Kuningan"}</div>
          </div>
        </div>
        {role === "siswa"
          ? <NavSiswa items={items} onPick={() => setOpen(false)} />
          : (
            <nav className="mt-4 space-y-1">
              {items.map((it: any) => (
                <NavLink key={it.to} to={it.to} end={it.to === "/" || it.to === "/guru" || it.to === "/admin"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    isActive ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-800")}>
                  <span>{it.icon}</span>{it.label}
                </NavLink>
              ))}
            </nav>
          )}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-xl bg-slate-900 p-3 text-xs">
            <div className="font-semibold text-white">{user?.nama_lengkap}</div>
            <div className="mt-0.5 text-slate-400">{user?.role === "siswa" ? "Peserta Didik" : user?.role === "guru" ? "Guru" : "Admin"}{meta?.kelas ? ` · ${meta.kelas.nama}` : ""}</div>
            <div className="mt-2 flex gap-2">
              <button className="rounded-lg bg-slate-800 px-2 py-1 hover:bg-slate-700" onClick={() => nav("/pengaturan")}>⚙️ Akun</button>
              <button className="rounded-lg bg-rose-600/80 px-2 py-1 hover:bg-rose-600" onClick={async () => { await logout(); nav("/login"); }}>Keluar</button>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="dkv-no-print flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm md:hidden" onClick={() => setOpen(!open)}>☰ Menu</button>
          <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
            <Badge tone="blue">{meta?.institusi?.mapel || "DD DKV"}</Badge>
            <span>Pekan berjalan: <b className="text-slate-800">Minggu {meta?.pekan_berjalan}</b></span>
            <span className="text-slate-300">|</span>
            <span>{meta?.hari_pembelajaran?.join(" & ")} · {meta?.jp_per_pertemuan} JP · {meta?.menit_per_pertemuan} menit</span>
          </div>
          <div className="text-sm text-slate-600">{user?.nama_lengkap}</div>
        </header>
        <main className="dkv-scroll flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function Pengaturan() {
  const { user } = useAuth();
  const [lama, setLama] = useState(""); const [baru, setBaru] = useState(""); const [msg, setMsg] = useState("");
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold">Pengaturan Akun</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm text-slate-600">Masuk sebagai <b>{user?.nama_lengkap}</b> ({user?.username})</p>
        <div className="space-y-3">
          <Field label="Password lama"><input type="password" className={inputCls} value={lama} onChange={e => setLama(e.target.value)} /></Field>
          <Field label="Password baru" hint="Minimal 6 karakter. Password disimpan dalam bentuk hash."><input type="password" className={inputCls} value={baru} onChange={e => setBaru(e.target.value)} /></Field>
          <Btn onClick={async () => {
            setMsg("");
            try { await api("/api/auth/change-password", { method: "POST", body: { lama, baru } }); setMsg("Password berhasil diganti."); setLama(""); setBaru(""); }
            catch (e: any) { setMsg(e.message); }
          }}>Simpan</Btn>
          {msg && <div className="text-sm text-slate-700">{msg}</div>}
        </div>
      </div>
    </div>
  );
}

function Guard({ role, children }: { role: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Memeriksa sesi…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!role.includes(user.role)) return <Navigate to={user.role === "siswa" ? "/" : user.role === "guru" ? "/guru" : "/admin"} replace />;
  return <Shell role={user.role}>{children}</Shell>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Guard role={["siswa"]}><SiswaDashboard /></Guard>} />
          <Route path="/materi" element={<Guard role={["siswa", "guru", "admin"]}><MateriList /></Guard>} />
          <Route path="/materi/:nomor" element={<Guard role={["siswa", "guru", "admin"]}><MateriDetail /></Guard>} />
          <Route path="/simulasi" element={<Guard role={["siswa", "guru", "admin"]}><SimulasiHub /></Guard>} />
          <Route path="/simulasi/:id" element={<Guard role={["siswa", "guru", "admin"]}><SimulasiDetail /></Guard>} />
          <Route path="/pertemuan" element={<Guard role={["siswa", "guru", "admin"]}><PertemuanHub /></Guard>} />
          <Route path="/pertemuan/:minggu/:hari" element={<Guard role={["siswa", "guru", "admin"]}><PertemuanDetail /></Guard>} />
          <Route path="/asesmen" element={<Guard role={["siswa", "guru", "admin"]}><AsesmenSiswa /></Guard>} />
          <Route path="/asesmen/rencana" element={<Guard role={["siswa", "guru", "admin"]}><AsesmenRencana /></Guard>} />
          <Route path="/asesmen/rekap" element={<Guard role={["siswa", "guru", "admin"]}><RekapSiswaAsesmen /></Guard>} />
          <Route path="/tugas" element={<Guard role={["siswa"]}><TugasSiswa /></Guard>} />
          <Route path="/portofolio" element={<Guard role={["siswa"]}><PortofolioSiswa /></Guard>} />

          <Route path="/guru" element={<Guard role={["guru", "admin"]}><GuruDashboard /></Guard>} />
          <Route path="/guru/kontrol" element={<Guard role={["guru", "admin"]}><GuruKontrol /></Guard>} />
          <Route path="/guru/materi" element={<Guard role={["guru", "admin"]}><GuruMateri /></Guard>} />
          <Route path="/guru/asesmen" element={<Guard role={["guru", "admin"]}><GuruAsesmen /></Guard>} />
          <Route path="/guru/asesmen/:id" element={<Guard role={["guru", "admin"]}><GuruAsesmenDetail /></Guard>} />
          <Route path="/guru/rekap-asesmen" element={<Guard role={["guru", "admin"]}><GuruAsesmen tabAwal="rekap" /></Guard>} />
          <Route path="/guru/remedial" element={<Guard role={["guru", "admin"]}><GuruAsesmen tabAwal="remedial" /></Guard>} />
          <Route path="/guru/penilaian" element={<Guard role={["guru", "admin"]}><GuruPenilaian /></Guard>} />
          <Route path="/guru/supervisi" element={<Guard role={["guru", "admin"]}><GuruSupervisi /></Guard>} />
          <Route path="/guru/supervisi/cetak/:id" element={<Guard role={["guru", "admin"]}><CetakSupervisi /></Guard>} />
          <Route path="/guru/dokumentasi" element={<Guard role={["guru", "admin"]}><GuruDokumentasi /></Guard>} />
          <Route path="/guru/dokumentasi/cetak/:minggu/:hari" element={<Guard role={["guru", "admin"]}><CetakDokumentasi /></Guard>} />
          <Route path="/guru/rekap-cetak" element={<Guard role={["guru", "admin"]}><CetakRekapNilai /></Guard>} />
          <Route path="/guru/rekap" element={<Guard role={["guru", "admin"]}><GuruRekap /></Guard>} />

          <Route path="/admin" element={<Guard role={["admin"]}><AdminHome /></Guard>} />
          <Route path="/pengaturan" element={<Guard role={["siswa", "guru", "admin"]}><Pengaturan /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
