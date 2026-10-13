// lib.tsx — API client, konteks autentikasi, dan komponen UI bersama.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

// ---------- API ----------
const memStore: Record<string, string> = {};
export const tokenStore = {
  get(): string | null {
    try { return localStorage.getItem("dkv_token") || memStore["dkv_token"] || null; }
    catch { return memStore["dkv_token"] || null; }
  },
  set(t: string | null) {
    try { t ? localStorage.setItem("dkv_token", t) : localStorage.removeItem("dkv_token"); } catch {}
    if (t) memStore["dkv_token"] = t; else delete memStore["dkv_token"];
  }
};

export async function api(path: string, opts: { method?: string; body?: any; raw?: boolean } = {}): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = tokenStore.get();
  if (t) headers["x-dkv-token"] = t;
  const res = await fetch(path, {
    method: opts.method || "GET",
    headers,
    credentials: "include",
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (opts.raw) return res;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.error || `Kesalahan ${res.status}`);
    err.status = res.status; err.locked = data.locked; err.payload = data;
    throw err;
  }
  return data;
}

// ---------- Auth context ----------
type AuthCtx = {
  user: any | null; meta: any | null; loading: boolean;
  login: (username: string, password: string, sebagai: string) => Promise<any>;
  logout: () => void; refreshMeta: () => void;
};
const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [meta, setMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!tokenStore.get()) { setUser(null); setMeta(null); setLoading(false); return; }   // tanpa token: tidak perlu memanggil API (menghindari galat 401 yang mengotori konsol)
    try {
      const me = await api("/api/auth/me");
      setUser(me.user);
      const m = await api("/api/meta");
      setMeta(m);
    } catch { setUser(null); setMeta(null); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const login = async (username: string, password: string, sebagai: string) => {
    const r = await api("/api/auth/login", { method: "POST", body: { username, password, sebagai } });
    tokenStore.set(r.token);
    setUser(r.user);
    const m = await api("/api/meta");
    setMeta(m);
    return r.user;
  };
  const logout = async () => {
    try { await api("/api/auth/logout", { method: "POST" }); } catch {}
    tokenStore.set(null); setUser(null); setMeta(null);
  };
  const refreshMeta = () => { api("/api/meta").then(setMeta).catch(() => {}); };
  const v = useMemo(() => ({ user, meta, loading, login, logout, refreshMeta }), [user, meta, loading]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

// ---------- polling hook untuk kontrol guru → siswa ----------
export function useSiswaStatus(intervalMs = 5000) {
  const [status, setStatus] = useState<any | null>(null);
  const [koneksi, setKoneksi] = useState<"ok" | "gagal">("ok");
  const timer = useRef<any>(null);
  const poll = async () => {
    try { const s = await api("/api/siswa/status"); setStatus(s); setKoneksi("ok"); }
    catch (e: any) { if (e.status === 401) setKoneksi("gagal"); else setKoneksi("gagal"); }
  };
  useEffect(() => {
    poll();
    timer.current = setInterval(poll, intervalMs);
    return () => clearInterval(timer.current);
  }, [intervalMs]);
  return { status, koneksi, refresh: poll };
}

// ---------- UI dasar ----------
export const cx = (...c: any[]) => c.filter(Boolean).join(" ");

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}
export function Btn({ children, onClick, variant = "primary", disabled, type = "button", className = "", title }: any) {
  const styles: Record<string, string> = {
    primary: "bg-blue-700 text-white hover:bg-blue-800 disabled:bg-slate-300",
    dark: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300",
    ghost: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    accent: "bg-amber-500 text-slate-900 hover:bg-amber-400",
  };
  return (
    <button type={type} title={title} disabled={disabled} onClick={onClick}
      className={cx("rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed", styles[variant], className)}>
      {children}
    </button>
  );
}
export function Badge({ children, tone = "blue" }: any) {
  const tones: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800", green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800", rose: "bg-rose-100 text-rose-800",
    slate: "bg-slate-100 text-slate-700", violet: "bg-violet-100 text-violet-800",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}
export function Progress({ value, tone = "bg-blue-600" }: { value: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={cx("h-full rounded-full transition-all", tone)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function Field({ label, children, hint }: any) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
export const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export function LockedNotice({ title, reason }: { title: string; reason?: string }) {
  return (
    <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center">
      <div className="text-4xl">🔒</div>
      <h3 className="mt-2 text-lg font-semibold text-amber-900">{title}</h3>
      <p className="mt-1 text-sm text-amber-800">{reason || "Menu ini belum dibuka oleh guru."}</p>
      <p className="mt-3 text-xs text-amber-700">Status kontrol diperbarui otomatis setiap beberapa detik.</p>
    </div>
  );
}
export function Spinner({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 p-6 text-slate-500">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      {label}
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{text}</div>;
}
export function PageTitle({ title, sub, right }: any) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
export function Toast({ msg, tone = "green", onClose }: any) {
  if (!msg) return null;
  return (
    <div className={cx("fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg",
      tone === "green" ? "bg-emerald-600" : tone === "red" ? "bg-rose-600" : "bg-slate-800")}>
      {msg}
      <button className="ml-3 opacity-80 hover:opacity-100" onClick={onClose}>✕</button>
    </div>
  );
}

// Penanda data demo (dipakai pada halaman yang menampilkan data contoh dari seed)
export function DataDemo({ text = "Data demo — contoh dari data awal (seed). Ganti dengan data nyata sebelum dipakai di kelas." }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <span aria-hidden>🏷️</span>
      <span><b>Data demo.</b> {text.replace(/^Data demo\s*[—-]\s*/, "")}</span>
    </div>
  );
}
