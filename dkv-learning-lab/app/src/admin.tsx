// admin.tsx — Panel Admin: akun, kelas, tahun ajaran, kalender, JP, hak akses, log aktivitas.
import React, { useEffect, useState } from "react";
import { api, Card, Btn, Badge, Field, inputCls, Spinner, Empty, PageTitle, Toast, DataDemo, cx } from "./lib";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function AdminHome() {
  const [tab, setTab] = useState<"pengguna" | "kelas" | "pengaturan" | "supervisi" | "log">("pengguna");
  const [users, setUsers] = useState<any[]>([]);
  const [kelas, setKelas] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // `senyap = true` dipakai saat menyegarkan setelah aksi (impor akun, simpan pengaturan):
  // data diperbarui TANPA menampilkan spinner, sehingga panel/tab yang sedang dibuka tidak
  // dipasang ulang dan isian/hasil pekerjaan admin (mis. daftar siswa yang ditempel) tetap utuh.
  const muat = async (senyap = false) => {
    if (!senyap) setLoading(true);
    try {
      const [u, k, s, l] = await Promise.all([
        api("/api/admin/users"), api("/api/guru/kelas"), api("/api/admin/settings"), api("/api/admin/logs"),
      ]);
      setUsers(u.users || []); setKelas(k.kelas || []); setSettings(s.settings || {}); setLogs(l.logs || []);
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  };
  useEffect(() => { muat(); }, []);
  const segarkan = () => muat(true);

  const jumlah = (role: string) => users.filter(u => u.role === role).length;

  return (
    <div>
      <PageTitle title="Panel Admin" sub="Kelola akun & hak akses, kelas, jadwal & kalender, indikator supervisi akademik, serta memantau log aktivitas — peserta didik tidak memiliki akses ke panel ini" />
      {msg && <Toast msg={msg} onClose={() => setMsg("")} />}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Admin", jumlah("admin")], ["Guru", jumlah("guru")], ["Siswa", jumlah("siswa")], ["Kelas", kelas.length]].map(([l, v]) => (
          <Card key={l as string} className="p-4"><div className="text-sm text-slate-600">{l as string}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800">{v as number}</div></Card>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {([
          ["pengguna", "👤", "Akun & hak akses", `${users.length} akun · reset sandi · aktif/nonaktif`],
          ["kelas", "🏫", "Kelas & wali kelas", `${kelas.length} kelas · tingkat · tahun ajaran`],
          ["pengaturan", "🗓️", "Jadwal & kalender", "hari mengajar, JP, minggu efektif, kalender sekolah"],
          ["supervisi", "🪪", "Indikator supervisi", "sesuai dokumen instrumen sekolah (C.1–C.4 · 5C)"],
          ["log", "🧾", "Log aktivitas", `${logs.length} catatan terbaru`],
        ] as const).map(([k, ikon, judul, ket]) => (
          <button key={k} onClick={() => setTab(k as any)} className="text-left">
            <Card className={cx("h-full p-4 transition", tab === k ? "border-blue-400" : "hover:shadow-md")}>
              <div className="font-medium text-slate-800">{ikon} {judul}</div>
              <div className="mt-1 text-xs text-slate-500">{ket}</div>
            </Card>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {([["pengguna", "👤 Akun"], ["kelas", "🏫 Kelas"], ["pengaturan", "⚙️ Pengaturan & Kalender"], ["supervisi", "🪪 Indikator Supervisi"], ["log", "🧾 Log Aktivitas"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={cx("rounded-xl px-3 py-1.5 text-sm font-medium", tab === k ? "bg-blue-700 text-white" : "bg-white border border-slate-300 text-slate-700")}>{l}</button>
        ))}
      </div>

      <DataDemo text="Akun, kelas, pengaturan, dan log di panel ini berasal dari data contoh (seed) hasil penyiapan 36 minggu." />
      <div className="mb-4" />
      {loading ? <Spinner /> : (
        <>
          {tab === "pengguna" && <TabPengguna users={users} kelas={kelas} reload={segarkan} pesan={setMsg} />}
          {tab === "kelas" && <TabKelas kelas={kelas} users={users} reload={segarkan} pesan={setMsg} />}
          {tab === "pengaturan" && <TabPengaturan settings={settings} reload={segarkan} pesan={setMsg} />}
          {tab === "supervisi" && <TabIndikatorSupervisi pesan={setMsg} />}
          {tab === "log" && <TabLog logs={logs} />}
        </>
      )}
    </div>
  );
}

/* ---------- Akun ---------- */
function TabPengguna({ users, kelas, reload, pesan }: any) {
  const [f, setF] = useState({ username: "", password: "", role: "siswa", nama_lengkap: "", nis_nip: "", kelas_id: "" });
  const buat = async () => {
    try {
      await api("/api/admin/users", { method: "POST", body: { ...f, kelas_id: f.kelas_id ? Number(f.kelas_id) : null } });
      pesan(`Akun ${f.username} dibuat (password disimpan sebagai hash bcrypt).`);
      setF({ username: "", password: "", role: "siswa", nama_lengkap: "", nis_nip: "", kelas_id: "" });
      reload();
    } catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };
  const [resetId, setResetId] = useState<number | null>(null);
  const [sandiBaru, setSandiBaru] = useState("");
  const reset = async (u: any) => {
    if (resetId !== u.id) { setResetId(u.id); setSandiBaru(""); return; }   // klik pertama: tampilkan isian sandi (tanpa dialog bawaan peramban)
    if (sandiBaru.trim().length < 6) { pesan("Password minimal 6 karakter."); return; }
    try { await api(`/api/admin/users/${u.id}/reset`, { method: "POST", body: { password: sandiBaru.trim() } }); pesan(`Password ${u.username} direset.`); setResetId(null); setSandiBaru(""); reload(); }
    catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };
  const toggle = async (u: any) => {
    await api(`/api/admin/users/${u.id}/toggle`, { method: "POST" });
    pesan(`Akun ${u.username} ${u.aktif ? "dinonaktifkan" : "diaktifkan"}.`);
    reload();
  };
  return (
    <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="p-4">
        <h3 className="font-semibold text-slate-800">Daftar akun</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-slate-500">
              <th className="py-2">Username</th><th>Nama</th><th>Peran</th><th>Kelas</th><th>Login terakhir</th><th>Status</th><th className="text-right">Aksi</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-2 font-mono text-xs">{u.username}</td>
                  <td>{u.nama_lengkap}</td>
                  <td><Badge tone={u.role === "admin" ? "violet" : u.role === "guru" ? "blue" : "slate"}>{u.role}</Badge></td>
                  <td>{u.kelas || "—"}</td>
                  <td className="text-xs text-slate-500">{u.last_login_at || "—"}</td>
                  <td>{u.aktif ? <Badge tone="green">aktif</Badge> : <Badge tone="rose">nonaktif</Badge>}</td>
                  <td className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {resetId === u.id && (
                        <input type="password" autoFocus className={cx(inputCls, "w-44")} placeholder="Sandi baru (min. 6)" value={sandiBaru} onChange={e => setSandiBaru(e.target.value)} />
                      )}
                      <Btn variant="ghost" onClick={() => reset(u)}>{resetId === u.id ? "Simpan sandi" : "Reset password"}</Btn>
                      {resetId === u.id && <Btn variant="ghost" onClick={() => { setResetId(null); setSandiBaru(""); }}>Batal</Btn>}
                      <Btn variant={u.aktif ? "danger" : "success"} onClick={() => toggle(u)}>{u.aktif ? "Nonaktifkan" : "Aktifkan"}</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-slate-800">Tambah akun</h3>
        <div className="mt-3 space-y-3">
          <Field label="Username"><input className={inputCls} value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></Field>
          <Field label="Nama lengkap"><input className={inputCls} value={f.nama_lengkap} onChange={e => setF({ ...f, nama_lengkap: e.target.value })} /></Field>
          <Field label="NIS/NIP"><input className={inputCls} value={f.nis_nip} onChange={e => setF({ ...f, nis_nip: e.target.value })} /></Field>
          <Field label="Peran">
            <select className={inputCls} value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
              <option value="siswa">Siswa</option><option value="guru">Guru</option><option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Kelas"><select className={inputCls} value={f.kelas_id} onChange={e => setF({ ...f, kelas_id: e.target.value })}>
            <option value="">— tidak ada —</option>{kelas.map((k: any) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select></Field>
          <Field label="Password awal" hint="Disimpan sebagai hash bcrypt; minimal 6 karakter.">
            <input type="text" className={inputCls} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          </Field>
          <Btn onClick={buat}>➕ Buat akun</Btn>
        </div>
      </Card>
    </div>
    <PanelImporMassal kelas={kelas} reload={reload} pesan={pesan} />
    </div>
  );
}

/* ---------- Impor siswa massal (tempel dari Excel/daftar kelas) ---------- */
// Daftar akun hasil impor terakhir disimpan di tingkat modul supaya tetap dapat diunduh
// walaupun impor berikutnya tidak membuat akun baru (mis. menekan Impor dua kali berturut-turut).
let imporAkunTerakhir: any[] = [];

function PanelImporMassal({ kelas, reload, pesan }: any) {
  const [teks, setTeks] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [sandiAwal, setSandiAwal] = useState("dkv2026");
  const [buatKelas, setBuatKelas] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pratinjau, setPratinjau] = useState<any[] | null>(null);
  const [hasil, setHasil] = useState<any>(null);
  const [daftarUnduh, setDaftarUnduh] = useState<any[]>(imporAkunTerakhir);

  // Mengurai tempelan: satu baris = satu siswa.
  // Kolom dipisah TAB (tempel dari Excel), titik koma, atau koma:
  //   Nama | NIS | Kelas | username (opsional) | sandi (opsional)
  const urai = (): any[] => {
    const namaKelasBawaan = kelas.find((k: any) => String(k.id) === String(kelasId))?.nama || "";
    const baris = teks.split(/\r?\n/).map((b) => b.trim()).filter(Boolean);
    const data: any[] = [];
    for (const [i, b] of baris.entries()) {
      const kolom = b.split(/\t|;|,/).map((x) => x.trim());
      if (i === 0 && /^nama/i.test(kolom[0] || "")) continue;      // baris kepala kolom dilewati
      if (!kolom[0]) continue;
      data.push({
        nama: kolom[0], nis: kolom[1] || "", kelas: kolom[2] || namaKelasBawaan,
        username: (kolom[3] || "").toLowerCase().replace(/\s+/g, ""), sandi: kolom[4] || "",
      });
    }
    return data;
  };

  const periksa = () => {
    const data = urai();
    if (!data.length) { pesan("Belum ada baris yang bisa dibaca. Tempel daftar siswa lebih dulu."); setPratinjau(null); return; }
    setPratinjau(data);
    const tanpaKelas = data.filter((d) => !d.kelas).length;
    const kelasBaru = [...new Set(data.map((d) => d.kelas).filter((k) => k && !kelas.some((x: any) => x.nama.toLowerCase() === k.toLowerCase())))];
    pesan(`${data.length} baris terbaca${tanpaKelas ? `, ${tanpaKelas} tanpa kelas (akan gagal kecuali dipilih kelas bawaan)` : ""}${kelasBaru.length ? `; kelas baru: ${kelasBaru.join(", ")}` : ""}.`);
  };

  const impor = async () => {
    const data = urai();
    if (!data.length) { pesan("Belum ada baris yang bisa dibaca."); return; }
    if (String(sandiAwal).trim().length < 6) { pesan("Sandi awal minimal 6 karakter."); return; }
    setBusy(true);
    try {
      const r = await api("/api/admin/users/impor", { method: "POST", body: { daftar: data, sandi_awal: sandiAwal, buat_kelas: buatKelas } });
      setHasil(r); setPratinjau(null);
      if (r.dibuat?.length) { imporAkunTerakhir = r.dibuat; setDaftarUnduh(r.dibuat); }   // simpan untuk diunduh walau impor berikutnya tidak menambah akun
      pesan(r.pesan || "Impor selesai.");
      reload();
    } catch (e: any) { pesan(`Gagal impor: ${e.message}`); }
    setBusy(false);
  };

  const unduhCsv = () => {
    if (!daftarUnduh.length) return;
    const kepala = ["nama", "username", "sandi", "nis", "kelas"];
    const isi = daftarUnduh.map((d: any) => [d.nama, d.username, d.sandi, d.nis || "", d.kelas || ""]);
    const csv = [kepala, ...isi].map((b) => b.map((c: any) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `daftar-akun-siswa-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-slate-800">Tambah siswa massal (tempel dari Excel / daftar kelas)</h3>
      <p className="mt-1 text-xs text-slate-500">
        Satu baris = satu siswa. Kolom dipisah TAB (salin dari Excel), titik koma, atau koma:
        <span className="font-mono"> Nama · NIS · Kelas · username (opsional) · sandi (opsional)</span>.
        Username yang dikosongkan akan dibuat otomatis dari nama; baris dengan username yang sudah ada dilewati
        (aman dijalankan berulang).
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_260px]">
        <textarea
          className={cx(inputCls, "h-40 font-mono text-xs")}
          placeholder={"Aditya Pratama\t0071234567\tX DKV 1\nBunga Lestari\t0071234568\tX DKV 1\nCitra Ayu\t0071234569\tX DKV 2"}
          value={teks} onChange={(e) => setTeks(e.target.value)}
        />
        <div className="space-y-3">
          <Field label="Kelas bawaan" hint="Dipakai untuk baris yang tidak mencantumkan kelas.">
            <select className={inputCls} value={kelasId} onChange={(e) => setKelasId(e.target.value)}>
              <option value="">— tidak ada —</option>
              {kelas.map((k: any) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </Field>
          <Field label="Sandi awal" hint="Minimal 6 karakter; siswa dapat menggantinya di ⚙️ Akun.">
            <input className={inputCls} value={sandiAwal} onChange={(e) => setSandiAwal(e.target.value)} />
          </Field>
          <label className="flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" className="mt-0.5" checked={buatKelas} onChange={(e) => setBuatKelas(e.target.checked)} />
            Buat kelas baru otomatis bila belum ada
          </label>
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={periksa}>🔍 Periksa dulu</Btn>
            <Btn onClick={impor} disabled={busy}>{busy ? "Menyimpan…" : "📥 Impor akun"}</Btn>
          </div>
        </div>
      </div>

      {pratinjau && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
          <div className="font-semibold text-slate-700">Pratinjau {pratinjau.length} baris (belum disimpan)</div>
          <div className="mt-2 max-h-48 overflow-y-auto">
            <table className="w-full">
              <thead><tr className="text-left text-slate-500"><th>Nama</th><th>NIS</th><th>Kelas</th><th>Username</th></tr></thead>
              <tbody>{pratinjau.slice(0, 30).map((d, i) => (
                <tr key={i} className="border-t border-slate-200"><td>{d.nama}</td><td>{d.nis || "—"}</td><td>{d.kelas || <span className="text-rose-600">belum ada</span>}</td><td className="font-mono">{d.username || "(otomatis)"}</td></tr>
              ))}</tbody>
            </table>
          </div>
          {pratinjau.length > 30 && <div className="mt-1 text-slate-500">… dan {pratinjau.length - 30} baris lagi</div>}
        </div>
      )}

      {hasil && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <div className="font-semibold text-emerald-900">{hasil.pesan}</div>
          {hasil.ringkas?.dilewati > 0 && <div className="mt-1 text-xs text-emerald-800">Dilewati: {hasil.dilewati.map((d: any) => `${d.nama} (${d.username})`).join(", ")}</div>}
          {hasil.ringkas?.gagal > 0 && <div className="mt-1 text-xs text-rose-700">Gagal: {hasil.gagal.map((d: any) => `baris ${d.no} ${d.nama} — ${d.alasan}`).join("; ")}</div>}
          {hasil.dibuat?.length > 0 && (
            <div className="mt-2 max-h-56 overflow-y-auto rounded-lg bg-white p-2">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500"><th>Nama</th><th>Username</th><th>Sandi awal</th><th>Kelas</th></tr></thead>
                <tbody>{hasil.dibuat.map((d: any) => (
                  <tr key={d.username} className="border-t border-slate-100"><td>{d.nama}</td><td className="font-mono">{d.username}</td><td className="font-mono">{d.sandi}</td><td>{d.kelas || "—"}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {daftarUnduh.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <Btn variant="success" onClick={unduhCsv}>⬇️ Unduh daftar akun (CSV)</Btn>
          <span>Berisi {daftarUnduh.length} akun dari impor terakhir yang membuat akun. Bagikan kepada siswa; minta mereka mengganti sandi di ⚙️ Akun.</span>
        </div>
      )}
    </Card>
  );
}

/* ---------- Kelas ---------- */
function TabKelas({ kelas, users, reload, pesan }: any) {
  const [f, setF] = useState({ nama: "", tingkat: "X", tahun_ajaran: "" });
  const buat = async () => {
    try { await api("/api/admin/kelas", { method: "POST", body: f }); pesan("Kelas dibuat."); setF({ ...f, nama: "" }); reload(); }
    catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="p-4">
        <h3 className="font-semibold text-slate-800">Daftar kelas</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-slate-500"><th className="py-2">Kelas</th><th>Tingkat</th><th>Tahun ajaran</th><th>Wali/Mapel</th><th>Jumlah siswa</th></tr></thead>
            <tbody>
              {kelas.map((k: any) => (
                <tr key={k.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-700">{k.nama}</td><td>{k.tingkat || "—"}</td>
                  <td>{k.tahun_ajaran || "—"}</td><td>{k.wali || "—"}</td>
                  <td>{users.filter((u: any) => u.kelas_id === k.id && u.role === "siswa").length}</td>
                </tr>
              ))}
              {kelas.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-slate-500">Belum ada kelas.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-slate-800">Tambah kelas</h3>
        <div className="mt-3 space-y-3">
          <Field label="Nama kelas"><input className={inputCls} value={f.nama} onChange={e => setF({ ...f, nama: e.target.value })} placeholder="X DKV 3" /></Field>
          <Field label="Tingkat"><input className={inputCls} value={f.tingkat} onChange={e => setF({ ...f, tingkat: e.target.value })} /></Field>
          <Field label="Tahun ajaran"><input className={inputCls} value={f.tahun_ajaran} onChange={e => setF({ ...f, tahun_ajaran: e.target.value })} placeholder="2026/2027" /></Field>
          <Btn onClick={buat}>➕ Buat kelas</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Pengaturan & Kalender ---------- */
function BarisSetting({ k, v, onSave }: any) {
  const [val, setVal] = useState(typeof v === "string" ? v : JSON.stringify(v));
  const [json, setJson] = useState(typeof v !== "string");
  useEffect(() => { setVal(typeof v === "string" ? v : JSON.stringify(v)); setJson(typeof v !== "string"); }, [v]);
  const simpan = () => {
    let parsed: any = val;
    if (json) { try { parsed = JSON.parse(val); } catch { return onSave(null, "JSON tidak valid."); } }
    onSave(parsed, null);
  };
  return (
    <div className="grid gap-2 border-b border-slate-100 py-3 md:grid-cols-[220px_1fr_auto]">
      <div className="text-sm font-medium text-slate-700">{k}<div className="text-xs text-slate-400">{json ? "JSON" : "teks/angka"}</div></div>
      <textarea className={cx(inputCls, "font-mono text-xs", json ? "h-24" : "h-10")} value={val} onChange={e => setVal(e.target.value)} />
      <div className="flex items-start gap-2">
        <Btn variant="ghost" onClick={simpan}>Simpan</Btn>
        {json && <Badge tone="slate">{(() => { try { const o = JSON.parse(val); return Array.isArray(o) ? `${o.length} item` : `${Object.keys(o).length} kunci`; } catch { return "?"; } })()}</Badge>}
      </div>
    </div>
  );
}

function TabPengaturan({ settings, reload, pesan }: any) {
  const [kal, setKal] = useState<any[]>([]);
  useEffect(() => { setKal(Array.isArray(settings.kalender_sekolah) ? settings.kalender_sekolah : []); }, [settings]);
  const simpan = async (key: string, value: any, err: string | null) => {
    if (err) return pesan(err);
    try { await api("/api/admin/settings", { method: "PUT", body: { key, value } }); pesan(`${key} diperbarui.`); reload(); }
    catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };
  const simpanKal = async (next: any[]) => {
    setKal(next);
    await simpan("kalender_sekolah", next, null);
  };
  const jenisOpt = ["libur", "asesmen", "kegiatan", "hari-efektif"];
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">Jadwal & jam pelajaran</h3>
        <p className="mt-1 text-xs text-slate-500">Perubahan di sini langsung dipakai aplikasi (tanpa menyunting kode). Guru juga dapat mengubahnya dari halaman Kontrol Pembelajaran.</p>
        <div className="mt-3">
          <div className="grid gap-2 border-b border-slate-100 py-3 md:grid-cols-[220px_1fr_auto]">
            <div className="text-sm font-medium text-slate-700">hari_pembelajaran</div>
            <div className="flex flex-wrap gap-2">
              {HARI.map(h => {
                const aktif = (settings.hari_pembelajaran || []).includes(h);
                return (
                  <label key={h} className={cx("flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm", aktif ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white")}>
                    <input type="checkbox" className="h-4 w-4" checked={aktif}
                      onChange={() => {
                        const arr = new Set<string>(settings.hari_pembelajaran || []);
                        aktif ? arr.delete(h) : arr.add(h);
                        simpan("hari_pembelajaran", [...arr], null);
                      }} />{h}
                  </label>
                );
              })}
            </div>
            <span className="text-xs text-slate-400">perubahan hari tersimpan otomatis</span>
          </div>
          {[["jp_per_pertemuan", "Jumlah JP per pertemuan"], ["menit_per_pertemuan", "Durasi total per pertemuan (menit)"],
            ["jam_pelajaran_menit", "Durasi 1 JP (menit)"], ["pekan_berjalan", "Pekan berjalan (minggu aktif)"],
            ["tahun_ajaran", "Tahun ajaran"], ["pengumuman_awal", "Pengumuman awal untuk siswa"]].map(([k, label]) => (
            <BarisSetting key={k} k={k} v={settings[k]} onSave={(v: any, e: any) => simpan(k, v, e)} />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Minggu efektif & kalender pendidikan</h3>
          <Badge tone="amber">menunggu verifikasi kalender resmi sekolah</Badge>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {["semester1", "semester2"].map(s => {
            const m = settings.minggu_efektif?.[s] || {};
            return (
              <div key={s} className="rounded-xl border border-slate-200 p-3">
                <div className="text-sm font-medium text-slate-700">{s === "semester1" ? "Semester 1" : "Semester 2"}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Field label="Mulai minggu"><input type="number" className={inputCls} value={m.mulai ?? ""} onChange={e => simpan("minggu_efektif", { ...settings.minggu_efektif, [s]: { ...m, mulai: +e.target.value } }, null)} /></Field>
                  <Field label="Selesai minggu"><input type="number" className={inputCls} value={m.selesai ?? ""} onChange={e => simpan("minggu_efektif", { ...settings.minggu_efektif, [s]: { ...m, selesai: +e.target.value } }, null)} /></Field>
                </div>
                <Field label="Catatan"><input className={inputCls} value={m.catatan || ""} onChange={e => simpan("minggu_efektif", { ...settings.minggu_efektif, [s]: { ...m, catatan: e.target.value } }, null)} /></Field>
              </div>
            );
          })}
        </div>

        <h4 className="mt-5 text-sm font-semibold text-slate-700">Daftar libur / asesmen / kegiatan</h4>
        {kal.length === 0 ? <Empty text="Belum ada entri kalender. Tambahkan libur atau pekan asesmen di sini." /> : (
          <table className="mt-2 w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-slate-500"><th className="py-2">Tanggal/pekan</th><th>Keterangan</th><th>Jenis</th><th></th></tr></thead>
            <tbody>
              {kal.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2"><input className={inputCls} value={row.tanggal || ""} onChange={e => { const n = [...kal]; n[i] = { ...row, tanggal: e.target.value }; setKal(n); }} /></td>
                  <td><input className={inputCls} value={row.keterangan || ""} onChange={e => { const n = [...kal]; n[i] = { ...row, keterangan: e.target.value }; setKal(n); }} /></td>
                  <td>
                    <select className={inputCls} value={row.jenis || "libur"} onChange={e => { const n = [...kal]; n[i] = { ...row, jenis: e.target.value }; setKal(n); }}>
                      {jenisOpt.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </td>
                  <td className="text-right"><Btn variant="danger" onClick={() => simpanKal(kal.filter((_, j) => j !== i))}>Hapus</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-3 flex gap-2">
          <Btn variant="ghost" onClick={() => setKal([...kal, { tanggal: "2027-01-01", keterangan: "Contoh: libur semester", jenis: "libur" }])}>➕ Tambah baris</Btn>
          <Btn onClick={() => simpanKal(kal)}>💾 Simpan kalender</Btn>
        </div>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Kalender pendidikan resmi sekolah belum disediakan. Data di sini adalah <b>usulan yang perlu diverifikasi guru/admin</b>; sunting agar sesuai kalender sekolah sebelum dipakai pada tahun ajaran berjalan.</p>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">Hak akses & institusi</h3>
        <div className="mt-3">
          {[["institusi", "Identitas sekolah & mapel"]].map(([k, label]) => (
            <BarisSetting key={k} k={k} v={settings[k]} onSave={(v: any, e: any) => simpan(k, v, e)} />
          ))}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-slate-500"><th className="py-2">Peran</th><th>Kewenangan</th></tr></thead>
            <tbody>
              {[["siswa", "Melihat materi/menu yang dibuka guru, mengerjakan LKPD & kuis, mengunggah karya portofolio, mengirim refleksi"],
                ["guru", "Kontrol pembelajaran, mulai/jeda/akhiri sesi, menilai, membuat tugas, supervisi, rekap, mengubah jadwal & JP"],
                ["admin", "Semua kewenangan guru + kelola akun, kelas, tahun ajaran, kalender, pengaturan global, log aktivitas"]].map(([r, k]) => (
                <tr key={r} className="border-b border-slate-100 align-top">
                  <td className="py-2"><Badge tone={r === "admin" ? "violet" : r === "guru" ? "blue" : "slate"}>{r}</Badge></td>
                  <td className="text-slate-600">{k}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Log ---------- */
function TabLog({ logs }: { logs: any[] }) {
  const [q, setQ] = useState("");
  const rows = logs.filter(l => !q || JSON.stringify(l).toLowerCase().includes(q.toLowerCase()));
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800">Log aktivitas (pengguna, waktu, aksi, kelas/objek)</h3>
        <input className={cx(inputCls, "max-w-xs")} placeholder="cari aksi / pengguna…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="mt-3 max-h-[520px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white"><tr className="border-b text-left text-xs text-slate-500">
            <th className="py-2">Waktu</th><th>Pengguna</th><th>Aksi</th><th>Objek</th><th>Detail</th><th>IP</th>
          </tr></thead>
          <tbody>
            {rows.map(l => (
              <tr key={l.id} className="border-b border-slate-100">
                <td className="py-1.5 text-xs text-slate-500">{l.created_at}</td>
                <td>{l.nama_lengkap || `user-${l.user_id}`}</td>
                <td><Badge tone="slate">{l.aksi}</Badge></td>
                <td className="text-slate-600">{l.objek || "—"}</td>
                <td className="max-w-[280px] truncate text-xs text-slate-500">{l.detail || "—"}</td>
                <td className="text-xs text-slate-400">{l.ip || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-slate-500">Belum ada log.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---------- Indikator Supervisi (dapat dikonfigurasi sesuai dokumen instrumen) ---------- */
function TabIndikatorSupervisi({ pesan }: any) {
  const [data, setData] = useState<any>(null);
  const [draf, setDraf] = useState<Record<number, any>>({});
  const [baru, setBaru] = useState({ kode: "", aspek_kode: "", aspek_nama: "", nama: "", deskriptor: "", urutan: "" });
  const [memuat, setMemuat] = useState(true);

  const muat = async () => {
    setMemuat(true);
    try { setData(await api("/api/supervisi/indikator?semua=1")); setDraf({}); }
    catch (e: any) { pesan(e.message); }
    setMemuat(false);
  };
  useEffect(() => { muat(); }, []);

  const ubah = (i: any, k: string, v: any) => setDraf({ ...draf, [i.id]: { ...(draf[i.id] || {}), [k]: v } });
  const nilai = (i: any, k: string) => (draf[i.id]?.[k] !== undefined ? draf[i.id][k] : i[k]);

  const simpan = async (i: any) => {
    try {
      const d = draf[i.id] || {};
      const r = await api(`/api/supervisi/indikator/${i.id}`, { method: "PUT", body: { ...d, aktif: d.aktif === undefined ? i.aktif : d.aktif } });
      pesan(r.pesan); muat();
    } catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };
  const nonaktif = async (i: any) => {
    try { const r = await api(`/api/supervisi/indikator/${i.id}/nonaktif`, { method: "POST" }); pesan(r.pesan); muat(); }
    catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };
  const tambah = async () => {
    try {
      const r = await api("/api/supervisi/indikator", { method: "POST", body: { ...baru, urutan: baru.urutan ? +baru.urutan : undefined } });
      pesan(r.pesan); setBaru({ kode: "", aspek_kode: "", aspek_nama: "", nama: "", deskriptor: "", urutan: "" }); muat();
    } catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };
  const muatUlang = async () => {
    try { const r = await api("/api/supervisi/indikator/muat-ulang", { method: "POST" }); pesan(r.pesan); muat(); }
    catch (e: any) { pesan(`Gagal: ${e.message}`); }
  };

  if (memuat && !data) return <Spinner />;
  const dariInstrumen = (i: any) => (i.sumber || "").includes("Instrumen Supervisi");
  const opsiAspek: string[] = [...new Set<string>((data?.indikator || []).map((a: any) => `${a.aspek_kode}|${a.aspek_nama}`))];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">Indikator supervisi akademik</h3>
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <b>Indikator awal disalin apa adanya dari dokumen instrumen sekolah</b> — {data?.sumber}. Aplikasi tidak menambah indikator resmi
          dengan karangannya sendiri. Jika instrumen resmi direvisi, sunting di sini atau tekan <b>Muat ulang dari instrumen</b> untuk
          mengembalikan daftar asli ({data?.totalAktif} indikator aktif saat ini). Indikator tambahan buatan sekolah ditandai “ditambahkan sekolah”.
        </div>
        <div className="mt-2 text-xs text-slate-600">{data?.catatanInstrumen}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="ghost" onClick={muatUlang}>↺ Muat ulang dari instrumen</Btn>
          <Btn variant="ghost" onClick={muat}>Perbarui tampilan</Btn>
        </div>
      </Card>

      {(data?.indikator || []).map((a: any) => (
        <Card key={a.aspek_kode} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-slate-800">{a.aspek_kode} {a.aspek_nama}</h4>
            <Badge tone="slate">{a.indikator.length} indikator</Badge>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead><tr className="border-b text-left text-xs text-slate-500">
                <th className="py-2 w-24">Kode</th><th>Nama indikator</th><th>Deskriptor (opsional)</th>
                <th className="w-20">Urutan</th><th className="w-20">Aktif</th><th className="w-40">Sumber</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {a.indikator.map((i: any) => (
                  <tr key={i.id} className="border-b border-slate-100 align-top">
                    <td className="py-2"><input className={cx(inputCls, "w-20")} value={nilai(i, "kode")} onChange={e => ubah(i, "kode", e.target.value)} /></td>
                    <td><input className={inputCls} value={nilai(i, "nama")} onChange={e => ubah(i, "nama", e.target.value)} /></td>
                    <td><input className={inputCls} placeholder="mis. apa yang diamati di kelas" value={nilai(i, "deskriptor") || ""} onChange={e => ubah(i, "deskriptor", e.target.value)} /></td>
                    <td><input type="number" className={cx(inputCls, "w-16")} value={nilai(i, "urutan")} onChange={e => ubah(i, "urutan", +e.target.value)} /></td>
                    <td>
                      <input type="checkbox" checked={!!Number(nilai(i, "aktif"))} onChange={e => ubah(i, "aktif", e.target.checked ? 1 : 0)} />
                    </td>
                    <td className="text-xs">
                      {dariInstrumen(i) ? <Badge tone="green">dari instrumen</Badge> : <Badge tone="amber">ditambahkan sekolah</Badge>}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Btn variant="ghost" onClick={() => simpan(i)}>Simpan</Btn>
                        <Btn variant="ghost" onClick={() => nonaktif(i)}>{Number(i.aktif) ? "Nonaktifkan" : "Aktifkan"}</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <Card className="p-5">
        <h3 className="font-semibold text-slate-800">Tambah indikator (hanya bila ada dasar dokumen sekolah)</h3>
        <p className="mt-1 text-xs text-slate-500">Indikator tambahan ditandai “ditambahkan sekolah” pada daftar agar dapat dibedakan dari butir instrumen resmi.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Kode"><input className={inputCls} value={baru.kode} onChange={e => setBaru({ ...baru, kode: e.target.value })} placeholder="C.5.1" /></Field>
          <Field label="Aspek (kode & nama)">
            <select className={inputCls} value={`${baru.aspek_kode}|${baru.aspek_nama}`}
              onChange={e => { const bagian = e.target.value.split("|"); setBaru({ ...baru, aspek_kode: bagian[0] || "", aspek_nama: bagian[1] || "" }); }}>
              <option value="|">— pilih aspek yang ada —</option>
              {opsiAspek.map((o: string) => <option key={o} value={o}>{o.split("|")[1]}</option>)}
            </select>
          </Field>
          <Field label="Nama indikator"><input className={inputCls} value={baru.nama} onChange={e => setBaru({ ...baru, nama: e.target.value })} /></Field>
          <Field label="Deskriptor"><input className={inputCls} value={baru.deskriptor} onChange={e => setBaru({ ...baru, deskriptor: e.target.value })} /></Field>
          <Field label="Urutan"><input type="number" className={inputCls} value={baru.urutan} onChange={e => setBaru({ ...baru, urutan: e.target.value })} /></Field>
        </div>
        <div className="mt-3"><Btn onClick={tambah} disabled={!baru.kode || !baru.nama || !baru.aspek_kode}>+ Tambah indikator</Btn></div>
      </Card>
    </div>
  );
}
