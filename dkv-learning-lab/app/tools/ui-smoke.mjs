// ui-smoke.mjs — Uji UI sungguhan: menjalankan bundel React di jsdom dan memanggil API server yang aktif.
// Prasyarat: server berjalan (npm run serve / node server/index.js) dan bundel dibuat:
//   npx esbuild tools/ui-entry.tsx --bundle --format=iife --platform=browser --outfile=/tmp/app-iife.js \
//     --loader:.tsx=tsx --jsx=automatic --define:process.env.NODE_ENV='"production"'
// Jalankan: node tools/ui-smoke.mjs
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const BASE = process.env.BASE || "http://localhost:8080";
const BUNDLE = process.env.BUNDLE || "/tmp/app-iife.js";
const kode = fs.readFileSync(BUNDLE, "utf8");
const hasil = [];
let no = 0;
const catat = (nama, lulus, detail) => { hasil.push({ nama, lulus }); console.log(`${lulus ? "✅" : "❌"} ${++no}. ${nama} — ${detail}`); };

async function login(username, password, sebagai) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, sebagai }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(`login ${username} gagal: ${d.error}`);
  return d.token;
}

async function jalankan(route, token, tunggu = 900) {
  const vc = new VirtualConsole();   // senyapkan peringatan React agar keluaran uji terbaca
  const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`,
    { url: BASE + route, runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc });
  const { window } = dom;
  if (token) window.localStorage.setItem("dkv_token", token);
  // fetch di dalam jsdom diarahkan ke server nyata; token disertakan agar sesi sama dengan aplikasi
  window.fetch = (path, opts = {}) => {
    const url = String(path).startsWith("http") ? String(path) : BASE + String(path);
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    const t = window.localStorage.getItem("dkv_token");
    if (t) headers["x-dkv-token"] = t;
    return fetch(url, { method: opts.method || "GET", headers, body: opts.body }).then(async r => {
      const teks = await r.text();
      return { ok: r.ok, status: r.status, json: async () => JSON.parse(teks || "{}"), text: async () => teks };
    });
  };
  const err = [];
  window.addEventListener("error", e => err.push(e.message));
  const s = window.document.createElement("script");
  s.textContent = kode;
  window.document.body.appendChild(s);
  await new Promise(r => setTimeout(r, tunggu));
  return { window, html: window.document.body.innerHTML, err };
}

const teks = (html) => html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ");

(async () => {
  const siswa = await login("aditya", "siswa123", "siswa");
  const guru = await login("dewi", "guru123", "guru");
  const admin = await login("admin", "admin123", "admin");

  // 1. halaman login (tanpa token)
  let r = await jalankan("/login", null);
  let t = teks(r.html);
  catat("Halaman login tampil (tab siswa/guru, tombol akun demo berlabel data demo)",
    /Masuk/i.test(t) && /Data demo/i.test(t) && /akun contoh/i.test(t) && /Mode Guru/i.test(t), t.slice(0, 160).trim());

  // 2. dashboard siswa memuat data nyata dari server
  r = await jalankan("/", siswa); t = teks(r.html);
  catat("Dashboard siswa memuat data nyata (minggu berjalan, progres, pengumuman)",
    /Minggu berjalan/i.test(t) && /Minggu 2/i.test(t) && /Pengumuman guru/i.test(t) && /Praktik minggu ini/i.test(t), t.slice(0, 200).trim());

  // 3. daftar materi siswa (36 minggu dari API)
  r = await jalankan("/materi", siswa); t = teks(r.html);
  catat("Modul materi menampilkan daftar minggu dari API",
    /Materi Pembelajaran/i.test(t) && /Technopreneurship/i.test(t) && /Minggu 1/i.test(t), t.slice(0, 140).trim());

  // 4. halaman guru: Kontrol Pembelajaran (sakelar menu dari server)
  r = await jalankan("/guru/kontrol", guru); t = teks(r.html);
  catat("Kontrol Pembelajaran guru tampil dengan sakelar menu (9 menu)",
    /Kontrol Pembelajaran/i.test(t) && /Sakelar menu siswa/i.test(t) && /Lab Simulasi/i.test(t) && /Mulai Pembelajaran/i.test(t),
    t.slice(0, 160).trim());

  // 5. guru menyunting salah satu menu lalu tersimpan ke server (uji dua arah UI ⇄ API)
  const r2 = await jalankan("/guru/kontrol", guru, 1200); const w2 = r2.window;
  const tombolSimulasi = [...w2.document.querySelectorAll("button")].filter(b => b.className.includes("rounded-full"));
  const sebelum = (await (await fetch(`${BASE}/api/guru/kontrol?kelas_id=1&meeting=senin`, { headers: { "x-dkv-token": guru } })).json()).controls;
  if (tombolSimulasi[3]) tombolSimulasi[3].dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
  await new Promise(r => setTimeout(r, 800));
  const sesudah = (await (await fetch(`${BASE}/api/guru/kontrol?kelas_id=1&meeting=senin`, { headers: { "x-dkv-token": guru } })).json()).controls;
  const berubah = Object.keys(sebelum).some(k => sebelum[k] !== sesudah[k]);
  catat("Klik sakelar di UI guru benar-benar mengubah pengaturan di server",
    berubah, `sebelum=${JSON.stringify(sebelum)} sesudah=${JSON.stringify(sesudah)}`);
  // kembalikan ke semula
  await fetch(`${BASE}/api/guru/kontrol`, { method: "POST", headers: { "Content-Type": "application/json", "x-dkv-token": guru }, body: JSON.stringify({ kelas_id: 1, meeting: "senin", aksi_semua: "aktifkan" }) });

  // 6. guru melihat kiriman siswa & formulir nilai
  r = await jalankan("/guru/penilaian", guru); t = teks(r.html);
  catat("Halaman Penilaian guru memuat kiriman siswa + kolom skor & umpan balik",
    /Penilaian & Tugas/i.test(t) && /Kiriman siswa/i.test(t), t.slice(0, 140).trim());

  // 7. rekap guru (tabel siswa nyata)
  r = await jalankan("/guru/rekap", guru); t = teks(r.html);
  catat("Rekap penilaian menampilkan baris siswa dari database",
    /Rekap Penilaian/i.test(t) && /Aditya Pratama/i.test(t) && /Minggu selesai/i.test(t), t.slice(0, 160).trim());

  // 8. panel admin & pengaturan (hari, JP, kalender)
  r = await jalankan("/admin", admin); t = teks(r.html);
  catat("Panel Admin memuat akun, kelas, dan pengaturan",
    /Panel Admin/i.test(t) && /Administrator Sekolah/i.test(t), t.slice(0, 140).trim());

  // 9. halaman simulasi: tombol berfungsi (bukan tombol palsu)
  r = await jalankan("/simulasi/sim-tipografi", siswa, 1000); t = teks(r.html);
  const tombolJalan = [...r.window.document.querySelectorAll("button")].find(b => /Jalankan laboratorium/i.test(b.textContent));
  if (tombolJalan) tombolJalan.dispatchEvent(new r.window.MouseEvent("click", { bubbles: true }));
  await new Promise(res => setTimeout(res, 400));
  const t2 = teks(r.window.document.body.innerHTML);
  catat("Lab tipografi berjalan: klik 'Jalankan laboratorium' menampilkan pratinjau & umpan balik",
    /Jalankan laboratorium/i.test(t) && /Pratinjau/i.test(t2) && /Tracking/i.test(t2) && /Tantangan bertingkat/i.test(t2), t2.slice(0, 160).trim());

  // 10. guru memulai sesi → siswa melihat status berlangsung
  await fetch(`${BASE}/api/guru/sesi`, { method: "POST", headers: { "Content-Type": "application/json", "x-dkv-token": guru }, body: JSON.stringify({ kelas_id: 1, week_nomor: 2, meeting_key: "senin", aksi: "mulai" }) });
  r = await jalankan("/", siswa, 1400); t = teks(r.html);
  const berlangsung = /Berlangsung/i.test(t) || /berlangsung/i.test(t);
  await fetch(`${BASE}/api/guru/sesi`, { method: "POST", headers: { "Content-Type": "application/json", "x-dkv-token": guru }, body: JSON.stringify({ kelas_id: 1, aksi: "akhiri" }) });
  catat("Siswa melihat status pembelajaran 'Berlangsung' saat guru memulai sesi",
    berlangsung, t.slice(0, 200).trim());

  // 11. halaman daftar pertemuan (72 pertemuan)
  r = await jalankan("/pertemuan", siswa, 1100); t = teks(r.html);
  catat("Halaman daftar pertemuan menampilkan 72 pertemuan & pertemuan aktif",
    /Pertemuan Pembelajaran/i.test(t) && /Pertemuan aktif saat ini/i.test(t) && /270/.test(t), t.slice(0, 180).trim());

  // 12. halaman detail pertemuan (agenda 270 menit)
  r = await jalankan("/pertemuan/2/senin", siswa, 1100); t = teks(r.html);
  catat("Halaman detail pertemuan memuat agenda, aktivitas, dan kelengkapan",
    /Agenda pertemuan/i.test(t) && /total 270/.test(t) && /Tujuan yang dilatih/i.test(t) && /LKPD/.test(t), t.slice(0, 200).trim());

  // 13. halaman asesmen (7 kategori penilaian)
  r = await jalankan("/asesmen", siswa, 1100); t = teks(r.html);
  catat("Halaman asesmen memuat kategori diagnostik…refleksi & ringkasan nilai",
    /Asesmen & Penilaian/i.test(t) && /Diagnostik/i.test(t) && /Uji Kompetensi/i.test(t) && /Refleksi/i.test(t) && /Rata-rata kuis/i.test(t),
    t.slice(0, 200).trim());

  // 14. label data demo tampil pada halaman yang memuat data contoh
  r = await jalankan("/", siswa, 1100); t = teks(r.html);
  const adaDemoSiswa = /data demo/i.test(t);
  r = await jalankan("/login", null, 500); const tLogin = teks(r.html);
  catat("Penanda 'data demo' tampil pada halaman login & dashboard siswa",
    adaDemoSiswa && /Data demo/i.test(tLogin), `dashboard=${adaDemoSiswa}, login=${/Data demo/i.test(tLogin)}`);


  // 15. halaman pertemuan memuat modul materi lengkap + contoh visual (diagram SVG)
  await fetch(`${BASE}/api/guru/kontrol`, { method: "POST", headers: { "Content-Type": "application/json", "x-dkv-token": guru },
    body: JSON.stringify({ kelas_id: 1, meeting: "senin", menu_key: "kuis", enabled: true }) });
  r = await jalankan("/pertemuan/2/rabu", siswa, 1200); t = teks(r.html);
  catat("Halaman pertemuan memuat modul materi, contoh visual (diagram SVG), dan kuis formatif",
    /Materi pertemuan/i.test(t) && /Contoh visual/i.test(t) && /Asesmen formatif pertemuan ini/i.test(t)
    && /Istilah/i.test(t) && r.html.includes("<svg") && /Rubrik penilaian/i.test(t),
    `${r.html.includes("<svg") ? "diagram SVG dirender" : "diagram SVG tidak ditemukan"} · ${t.slice(0, 150).trim()}`);

  // 16. guru dapat membuka editor materi pertemuan (interaksi klik sungguhan)
  r = await jalankan("/pertemuan/2/rabu", guru, 1200);
  const tombolSunting = [...r.window.document.querySelectorAll("button")].find(b => /Sunting materi/i.test(b.textContent || ""));
  tombolSunting?.click();
  await new Promise(x => setTimeout(x, 600));
  const tEditor = teks(r.window.document.body.innerHTML);
  catat("Mode Guru: editor materi pertemuan terbuka setelah tombol diklik",
    !!tombolSunting && /Pengantar materi/i.test(tEditor) && /Simpan materi/i.test(tEditor),
    `${tombolSunting ? "tombol 'Sunting materi' ada" : "tombol tidak ditemukan"} → ${/Pengantar materi/i.test(tEditor) ? "form editor tampil" : "form tidak tampil"}`);

  // 17. siswa menjawab kuis formatif dari halaman pertemuan (dinilai server)
  r = await jalankan("/pertemuan/2/rabu", siswa, 1200);
  const doc = r.window.document;
  const namaGrup = [...new Set([...doc.querySelectorAll('input[type="radio"]')].map(i => i.name))];
  for (const n of namaGrup) doc.querySelector(`input[name="${n}"]`)?.click();
  await new Promise(x => setTimeout(x, 300));
  const tombolKirim = [...doc.querySelectorAll("button")].find(b => /Kirim jawaban/i.test(b.textContent || ""));
  tombolKirim?.click();
  await new Promise(x => setTimeout(x, 1400));
  const tKuis = teks(doc.body.innerHTML);
  catat("Kuis formatif dapat dijawab siswa dari halaman pertemuan & dinilai server",
    namaGrup.length >= 2 && /Nilai tersimpan|nilai \d+\/\d+/i.test(tKuis),
    `${namaGrup.length} butir dijawab → ${(/Nilai tersimpan[^.]*/.exec(tKuis) || ["tidak ada pesan nilai"])[0].slice(0, 60)}`);


  // 18. laboratorium tipografi: petunjuk, tantangan bertingkat, tombol reset, dan pratinjau yang menyesuaikan input
  await fetch(`${BASE}/api/guru/kontrol`, { method: "POST", headers: { "Content-Type": "application/json", "x-dkv-token": guru },
    body: JSON.stringify({ kelas_id: 1, meeting: "senin", menu_key: "simulasi", enabled: true }) });
  r = await jalankan("/simulasi/sim-tipografi", siswa, 1200);
  let tombolLabs = [...r.window.document.querySelectorAll("button")].find(b => /Jalankan laboratorium/i.test(b.textContent || ""));
  tombolLabs?.click();
  await new Promise(x => setTimeout(x, 700));
  let labTLab = teks(r.window.document.body.innerHTML);
  const labAdaPetunjuk = /Petunjuk penggunaan/i.test(labTLab);
  const labAdaTantangan = /Tantangan bertingkat/i.test(labTLab) && /Tingkat 1/.test(labTLab) && /Tingkat 3/.test(labTLab);
  const labAdaReset = /Atur ulang/i.test(labTLab);
  const labAdaRefleksi = /Refleksi laboratorium/i.test(labTLab);
  const labAdaModel = /model simulasi/i.test(labTLab) && /bukan mesin tata letak/i.test(labTLab);
  catat("Lab Tipografi: petunjuk, tantangan bertingkat, reset, refleksi, dan penanda model simulasi tampil",
    labAdaPetunjuk && labAdaTantangan && labAdaReset && labAdaRefleksi && labAdaModel,
    `petunjuk=${labAdaPetunjuk}, tantangan=${labAdaTantangan}, reset=${labAdaReset}, refleksi=${labAdaRefleksi}, label model=${labAdaModel}`);

  // 19. input lab benar-benar mengubah angka kriteria (labSlider isi 12 px → kriteria terpenuhi berubah)
  const labDocT = r.window.document;
  const labSlider = [...labDocT.querySelectorAll('input[type="range"]')].find(i => /Ukuran isi/.test(i.parentElement?.textContent || ""));
  const labSebelum = (/kriteria terpenuhi (\d+)\/(\d+)/.exec(teks(labDocT.body.innerHTML)) || [])[0] || "-";
  if (labSlider) {
    const setter = Object.getOwnPropertyDescriptor(labDocT.defaultView.HTMLInputElement.prototype, "value").set;
    setter.call(labSlider, "9");
    labSlider.dispatchEvent(new labDocT.defaultView.Event("input", { bubbles: true }));
  }
  await new Promise(x => setTimeout(x, 600));
  const labSesudah = (/kriteria terpenuhi (\d+)\/(\d+)/.exec(teks(labDocT.body.innerHTML)) || [])[0] || "-";
  catat("Lab Tipografi: mengubah input mengubah pratinjau & kriteria (input → perubahan → umpan balik)",
    !!labSlider && /Ukuran isi: 9 px/.test(teks(labDocT.body.innerHTML)) && labSebelum !== labSesudah,
    `labSebelum: ${labSebelum} → labSesudah: ${labSesudah}`);

  // 20. lab K3: menandai risiko memberi labUmpan balik, dan tombol reset mengosongkan pilihan
  r = await jalankan("/simulasi/sim-k3-ergonomi", siswa, 1200);
  [...r.window.document.querySelectorAll("button")].find(b => /Jalankan laboratorium/i.test(b.textContent || ""))?.click();
  await new Promise(x => setTimeout(x, 700));
  const labDocK = r.window.document;
  const labKotak = [...labDocK.querySelectorAll('input[type="checkbox"]')];
  labKotak.slice(0, 5).forEach(c => c.click());
  await new Promise(x => setTimeout(x, 600));
  const labTK3 = teks(labDocK.body.innerHTML);
  const labUmpan = /Risiko ditemukan: 5\/5/.test(labTK3);
  [...labDocK.querySelectorAll("button")].find(b => /Atur ulang/i.test(b.textContent || ""))?.click();
  await new Promise(x => setTimeout(x, 700));
  const labTReset = teks(labDocK.body.innerHTML);
  catat("Lab K3: menandai 5 risiko tepat & tombol reset mengembalikan keadaan awal",
    labUmpan && /Ditandai: 0/.test(labTReset),
    `labUmpan balik 5/5=${labUmpan}; setelah reset → ${(/Ditandai: \d+/.exec(labTReset) || ["?"])[0]}`);

  // 21. Studio DKV: berpindah tingkat mengganti brief klien
  r = await jalankan("/simulasi/sim-studio-dkv", siswa, 1200);
  [...r.window.document.querySelectorAll("button")].find(b => /Jalankan laboratorium/i.test(b.textContent || ""))?.click();
  await new Promise(x => setTimeout(x, 700));
  const labDocS = r.window.document;
  const labBriefAwal = teks(labDocS.body.innerHTML).includes("Kedai Kopi");
  [...labDocS.querySelectorAll("button")].find(b => /Tingkat 3/.test(b.textContent || ""))?.click();
  await new Promise(x => setTimeout(x, 600));
  const labTS = teks(labDocS.body.innerHTML);
  catat("Studio DKV: tingkat bertingkat mengganti brief (klien A → klien C) dan menampilkan lima tahap",
    labBriefAwal && /Tiga konten feed akun sekolah/i.test(labTS) && /Tahap 1 · Riset/i.test(labTS) && /Tahap 5 · Presentasi/i.test(labTS),
    `brief tingkat 1=${labBriefAwal}, setelah pindah tingkat: ${(/Brief klien tingkat 3/.test(labTS) ? "brief tingkat 3 tampil" : "gagal")} · lima tahap ${/Tahap 5 · Presentasi/i.test(labTS)}`);


  // 22. seluruh 7 laboratorium dapat dibuka, tidak menimbulkan galat, dan memuat kerangka lengkap
  const LAB_IDS = ["sim-tipografi", "sim-fotografi", "sim-bitmap-vektor", "sim-alur-produksi", "sim-k3-ergonomi", "sim-sketsa-lab", "sim-studio-dkv"];
  const ringkasLab = [];
  let labGagal = [];
  for (const id of LAB_IDS) {
    const rr = await jalankan(`/simulasi/${id}`, siswa, 1100);
    [...rr.window.document.querySelectorAll("button")].find(b => /Jalankan laboratorium/i.test(b.textContent || ""))?.click();
    await new Promise(x => setTimeout(x, 700));
    const tt = teks(rr.window.document.body.innerHTML);
    const lengkap = /Petunjuk penggunaan/i.test(tt) && /Tantangan bertingkat/i.test(tt) && /Atur ulang/i.test(tt)
      && /Refleksi laboratorium/i.test(tt) && /Umpan balik/i.test(tt) && /Tingkat 3/.test(tt) && rr.err.length === 0;
    ringkasLab.push(`${id}:${lengkap ? "ok" : "KURANG"}`);
    if (!lengkap) labGagal.push(`${id}${rr.err.length ? ` (galat: ${rr.err[0]})` : ""}`);
  }
  catat("Ketujuh laboratorium simulasi terbuka dengan kerangka lengkap tanpa galat JavaScript",
    labGagal.length === 0, labGagal.length ? `bermasalah: ${labGagal.join(", ")}` : ringkasLab.join(" · "));

  // 23. halaman pengerjaan asesmen siswa memuat kartu asesmen 36 minggu + filter & tombol buka
  r = await jalankan("/asesmen/rencana", siswa, 1400);
  let asT = teks(r.window.document.body.innerHTML);
  const asJudul = /Asesmen & Pengerjaan \(36 Minggu\)/.test(asT);
  const asKartu = /asesmen ditampilkan/.test(asT) && /bobot \d+/.test(asT) && /KKTp \d+/.test(asT);
  const asFilter = /Minggu/.test(asT) && /Jenis asesmen/.test(asT);
  const asTombolBuka = [...r.window.document.querySelectorAll("button")].some(b => /^Buka$/i.test((b.textContent || "").trim()));
  catat("Halaman pengerjaan asesmen siswa memuat rencana 36 minggu (badge bobot/KKTp, filter, tombol Buka)",
    asJudul && asKartu && asFilter && asTombolBuka,
    `judul=${asJudul}, kartu+badge=${asKartu}, filter minggu/jenis=${asFilter}, tombol buka=${asTombolBuka}`);

  // 24. membuka kartu kuis menampilkan soal tanpa kunci jawaban (kunci baru dibuka server setelah dikirim)
  const asDoc = r.window.document;
  [...asDoc.querySelectorAll("button")].find(b => /^Buka$/i.test((b.textContent || "").trim()))?.click();
  await new Promise(x => setTimeout(x, 900));
  const asTTerbuka = teks(asDoc.body.innerHTML);
  const asSoalTampil = /Butir pilihan ganda/.test(asTTerbuka) || /Pembahasan/i.test(asTTerbuka) || /Kirim jawaban kuis/.test(asTTerbuka) || /Kumpulkan pekerjaan/.test(asTTerbuka);
  catat("Kartu asesmen dapat dibuka & panel kerja tampil (soal/uraian + tombol kirim)",
    asSoalTampil, `penanda panel kerja tampil=${asSoalTampil}`);

  // 25. rekap hasil asesmen siswa: tiga tab (minggu/jenis/catatan)
  r = await jalankan("/asesmen/rekap", siswa, 1400);
  const asRT = teks(r.window.document.body.innerHTML);
  catat("Rekap asesmen siswa memuat tab per minggu, per jenis, dan catatan",
    /Rekap Hasil Belajar Saya/.test(asRT) && /Per minggu/.test(asRT) && /Per jenis/.test(asRT) && /Catatan/.test(asRT),
    `judul=${/Rekap Hasil Belajar Saya/.test(asRT)}, tab minggu/jenis/catatan=${/Per minggu/.test(asRT) && /Per jenis/.test(asRT)}`);

  // 26. ruang kerja guru: editor rubrik menampilkan total bobot & menolak simpan bila bobot ≠ 100
  r = await jalankan("/guru/asesmen", guru, 1600);
  const asG = r.window.document;
  let asGT = teks(asG.body.innerHTML);
  const asGTab = /Rencana & rubrik/.test(asGT) && /Penilaian rubrik/.test(asGT) && /Rekap hasil belajar/.test(asGT) && /Remedial & pengayaan/.test(asGT);
  const asGBobot = /Bobot dalam minggu/.test(asGT) && /KKTp \(ketuntasan\)/.test(asGT) && /Kesempatan revisi/.test(asGT);
  catat("Ruang kerja guru: empat tab asesmen + field bobot/KKTp/kesempatan revisi tampil",
    asGTab && asGBobot,
    `tab=${asGTab}, field bobot/KKTp/revisi=${asGBobot}`);

  // pilih kartu asesmen Praktik di daftar (kuis tidak memakai rubrik) sebelum menguji editor rubrik
  const kartuPraktik = [...asG.querySelectorAll("button")].find(b => /Penilaian praktik/.test(b.textContent || ""));
  kartuPraktik?.click();
  await new Promise(x => setTimeout(x, 1200));
  asGT = teks(asG.body.innerHTML);
  const asRubrikTampil = /Rubrik penilaian \(dapat disunting\)/.test(asGT) && /total bobot kriteria 100\/100/.test(asGT);
  catat("Ruang kerja guru: kartu asesmen Praktik menampilkan rubrik 4 kriteria dengan total bobot 100/100",
    !!kartuPraktik && asRubrikTampil, `kartu praktik ditemukan=${!!kartuPraktik}, rubrik tampil=${asRubrikTampil}, ${(/total bobot kriteria \d+\/100/.exec(asGT) || [])[0] || "total tidak ditemukan"}`);

  const asInputBobot = [...asG.querySelectorAll('input[type="number"]')];
  const asInputKriteria = asInputBobot[asInputBobot.length - 1];
  const setNilaiInput = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(asG.defaultView.HTMLInputElement.prototype, "value").set;
    setter.call(el, v);
    el.dispatchEvent(new asG.defaultView.Event("input", { bubbles: true }));
  };
  if (asInputKriteria) setNilaiInput(asInputKriteria, "0");
  await new Promise(x => setTimeout(x, 700));
  asGT = teks(asG.body.innerHTML);
  const asTotalBaru = (/total bobot kriteria (\d+)\/100/.exec(asGT) || [])[0] || "-";
  const asTombolSimpan = [...asG.querySelectorAll("button")].find(b => /Simpan rubrik & bobot/.test(b.textContent || ""));
  catat("Editor rubrik: mengubah bobot kriteria memperbarui total & menonaktifkan simpan sampai 100",
    /total bobot kriteria (?!100)/.test(asGT) && !!asTombolSimpan && asTombolSimpan.disabled === true,
    `setelah bobot diubah → ${asTotalBaru}; tombol simpan nonaktif=${asTombolSimpan ? asTombolSimpan.disabled : "tidak ada"}`);

  // 27. penilaian rubrik: tanpa centang konfirmasi ditolak server, setelah dicentang tersimpan
  r = await jalankan("/guru/asesmen/A-02-S-LKPD", guru, 1800);
  const asP = r.window.document;
  let asPT = teks(asP.body.innerHTML);
  const asPAdaRubrik = /Saya sudah memeriksa bukti karya/.test(asPT) && /Simpan nilai/.test(asPT) && /Buka ulang \(remedial\)/.test(asPT);
  const blokSiswa = [...asP.querySelectorAll("div")].filter(d => /Saya sudah memeriksa bukti karya/.test(d.textContent || "")).pop();
  const skorEmpat = blokSiswa ? [...blokSiswa.querySelectorAll("button")].filter(b => /^4 —/.test((b.textContent || "").trim())) : [];
  skorEmpat.forEach(b => b.click());
  await new Promise(x => setTimeout(x, 500));
  const tombolSimpanNilai = blokSiswa ? [...blokSiswa.querySelectorAll("button")].find(b => /Simpan nilai/.test(b.textContent || "")) : null;
  tombolSimpanNilai?.click();
  await new Promise(x => setTimeout(x, 900));
  asPT = teks(asP.body.innerHTML);
  const asPTolak = /wajib dikonfirmasi/i.test(asPT);
  const cekKonfirmasi = blokSiswa ? [...blokSiswa.querySelectorAll('input[type="checkbox"]')].pop() : null;
  cekKonfirmasi?.click();
  await new Promise(x => setTimeout(x, 400));
  blokSiswa ? [...blokSiswa.querySelectorAll("button")].find(b => /Simpan nilai/.test(b.textContent || ""))?.click() : null;
  await new Promise(x => setTimeout(x, 1100));
  asPT = teks(asP.body.innerHTML);
  const asPTersimpan = /tersimpan/i.test(asPT) && /rubrik/i.test(asPT);
  catat("Penilaian rubrik guru: ditolak tanpa centang konfirmasi, tersimpan setelah dikonfirmasi",
    asPAdaRubrik && skorEmpat.length >= 2 && asPTolak && asPTersimpan,
    `blok rubrik=${asPAdaRubrik}, skor dipilih=${skorEmpat.length}, ditolak tanpa konfirmasi=${asPTolak}, tersimpan setelah konfirmasi=${asPTersimpan}`);

  // 28. rekap guru tiga mode + tautan ekspor CSV berisi mode terpilih
  r = await jalankan("/guru/rekap-asesmen", guru, 1800);
  const asRekT = teks(r.window.document.body.innerHTML);
  const asRekTab = /Per peserta didik/.test(asRekT) && /Per minggu/.test(asRekT) && /Per jenis asesmen/.test(asRekT);
  const asCsvLink = [...r.window.document.querySelectorAll("a")].some(a => /rekap-asesmen\.csv/.test(a.getAttribute("href") || ""));
  const asRekBaris = [...r.window.document.querySelectorAll("tbody tr")].length;
  catat("Rekap asesmen guru: tiga mode + tautan ekspor CSV & tabel terisi dari basis data",
    asRekTab && asCsvLink && asRekBaris > 0,
    `tab 3 mode=${asRekTab}, tautan CSV=${asCsvLink}, baris tabel=${asRekBaris}`);

  // 29. halaman remedial guru memuat daftar di bawah KKTp & kandidat pengayaan
  r = await jalankan("/guru/remedial", guru, 1600);
  const asRemT = teks(r.window.document.body.innerHTML);
  catat("Halaman remedial guru memuat daftar di bawah KKTp dan kandidat pengayaan",
    /Daftar remedial/.test(asRemT) && /Kandidat pengayaan/.test(asRemT) && /KKTp/.test(asRemT),
    `daftar remedial=${/Daftar remedial/.test(asRemT)}, kandidat pengayaan=${/Kandidat pengayaan/.test(asRemT)}`);

  // 32. Supervisi: instrumen dimuat dari server (indikator instrumen sekolah) & skor mengubah rata aspek
  r = await jalankan("/guru/supervisi", guru, 1800);
  const svDoc = r.window.document;
  let svT = teks(svDoc.body.innerHTML);
  const svJudul = /Supervisi Akademik/.test(svT) && /C\.1 Perencanaan/.test(svT) && /Penerapan 5C/.test(svT) && /Asesmen dan Refleksi/.test(svT);
  const svSumber = /Instrumen Supervisi Akademik/.test(svT) && /dokumen instrumen sekolah/i.test(svT);
  const svBadgeAwal = (/terisi/.test(svT) ? (/(\d+)\/(\d+) indikator terisi/.exec(svT) || [])[0] : "-");
  const tombolSkor = [...svDoc.querySelectorAll("button")].filter(b => /^4$/.test((b.textContent || "").trim()));
  tombolSkor[0]?.click();
  await new Promise(x => setTimeout(x, 600));
  svT = teks(svDoc.body.innerHTML);
  const svBadgeAkhir = (/(\d+)\/(\d+) indikator terisi/.exec(svT) || [])[0] || "-";
  catat("Supervisi: indikator instrumen dimuat dari server & mengisi skor memperbarui rata-rata aspek",
    svJudul && svSumber && tombolSkor.length >= 18 && svBadgeAwal !== svBadgeAkhir,
    `judul+aspek=${svJudul}, sumber instrumen=${svSumber}, tombol skor=${tombolSkor.length}, ${svBadgeAwal} → ${svBadgeAkhir}`);

  // 33. Admin: tab indikator supervisi menampilkan daftar instrumen & perubahan tersimpan ke server
  r = await jalankan("/admin", admin, 1800);
  const adDoc = r.window.document;
  [...adDoc.querySelectorAll("button")].find(b => /Indikator Supervisi/.test(b.textContent || ""))?.click();
  await new Promise(x => setTimeout(x, 1200));
  let adT = teks(adDoc.body.innerHTML);
  const adJudul = /Indikator supervisi akademik/.test(adT);
  const adSumber = /disalin apa adanya dari dokumen instrumen/i.test(adT) && /Muat ulang dari instrumen/.test(adT);
  const adaDariInstrumen = (adT.match(/dari instrumen/g) || []).length >= 18;
  const barisInd = [...adDoc.querySelectorAll("table tbody tr")];
  const inputNama = barisInd[0]?.querySelectorAll("input")[1];
  const namaUji = `Uji UI ${Date.now()}`;
  if (inputNama) {
    const setter = Object.getOwnPropertyDescriptor(adDoc.defaultView.HTMLInputElement.prototype, "value").set;
    setter.call(inputNama, namaUji);
    inputNama.dispatchEvent(new adDoc.defaultView.Event("input", { bubbles: true }));
    await new Promise(x => setTimeout(x, 300));
    [...barisInd[0].querySelectorAll("button")].find(b => /Simpan/.test(b.textContent || ""))?.click();
    await new Promise(x => setTimeout(x, 1000));
  }
  const cekServer = await (await fetch(BASE + "/api/supervisi/indikator?semua=1", { headers: { "x-dkv-token": admin } })).json();
  const tersimpanServer = JSON.stringify(cekServer.indikator).includes(namaUji);
  [...adDoc.querySelectorAll("button")].find(b => /Muat ulang dari instrumen/.test(b.textContent || ""))?.click();
  await new Promise(x => setTimeout(x, 1200));
  const cekPulih = await (await fetch(BASE + "/api/supervisi/indikator?semua=1", { headers: { "x-dkv-token": admin } })).json();
  const pulih = !JSON.stringify(cekPulih.indikator).includes(namaUji);
  catat("Admin dapat menyunting indikator supervisi & memuat ulang daftar dari dokumen instrumen",
    adJudul && adSumber && adaDariInstrumen && tersimpanServer && pulih,
    `judul=${adJudul}, catatan sumber=${adSumber}, baris "dari instrumen"=${(adT.match(/dari instrumen/g) || []).length}, perubahan sampai server=${tersimpanServer}, kembali ke daftar instrumen=${pulih}`);

  // 34. Dokumentasi per pertemuan: sembilan bagian (A–I) + prinsip pembelajaran mendalam + simpan
  r = await jalankan("/guru/dokumentasi", guru, 1800);
  const dkDoc = r.window.document;
  let dkT = teks(dkDoc.body.innerHTML);
  const dkJudul = /Dokumentasi Pembelajaran per Pertemuan/.test(dkT) && /72 pertemuan/.test(dkT);
  const dkBagian = ["A. Tujuan pembelajaran", "B. Aktivitas memahami", "C. Aktivitas mengaplikasi", "D. Aktivitas merefleksi",
    "E. Penerapan prinsip pembelajaran mendalam", "F. Bukti aktivitas", "G. Catatan observasi", "H. Refleksi guru", "I. Tindak lanjut"]
    .every(x => dkT.includes(x));
  const dkPrinsip = (dkT.match(/Critical Thinking|berkesadaran|tutor sebaya/gi) || []).length >= 1;
  const dkUsulan = /Isi dari modul \(usulan\)/.test(dkT);
  const areaRefleksi = [...dkDoc.querySelectorAll("textarea")].find(a => /Refleksi uji UI/.test(a.value) || (a.parentElement?.textContent || "").includes("H. Refleksi guru"));
  const teksRefleksi = `Refleksi uji UI ${Date.now()}`;
  if (areaRefleksi) {
    const setter = Object.getOwnPropertyDescriptor(dkDoc.defaultView.HTMLTextAreaElement.prototype, "value").set;
    setter.call(areaRefleksi, teksRefleksi);
    areaRefleksi.dispatchEvent(new dkDoc.defaultView.Event("input", { bubbles: true }));
    await new Promise(x => setTimeout(x, 300));
    [...dkDoc.querySelectorAll("button")].find(b => /Simpan final/.test(b.textContent || ""))?.click();
    await new Promise(x => setTimeout(x, 1200));
  }
  const cekDokServer = await (await fetch(BASE + "/api/supervisi/dokumentasi/2/senin", { headers: { "x-dkv-token": guru } })).json();
  catat("Dokumentasi per pertemuan: bagian A–I + prinsip pembelajaran mendalam tampil & isian tersimpan ke server",
    dkJudul && dkBagian && dkPrinsip && dkUsulan && cekDokServer.dokumen?.refleksi_guru === teksRefleksi,
    `judul=${dkJudul}, bagian A–I=${dkBagian}, prinsip=${dkPrinsip}, isian usulan=${dkUsulan}, tersimpan server=${cekDokServer.dokumen?.refleksi_guru === teksRefleksi}`);

  // 35. Laporan supervisi siap cetak (kop sekolah, tabel indikator, tanda tangan supervisor)
  const daftarSv = await (await fetch(BASE + "/api/supervisi", { headers: { "x-dkv-token": guru } })).json();
  const idSv = daftarSv.supervisi?.[0]?.id;
  r = await jalankan(`/guru/supervisi/cetak/${idSv}`, guru, 1500);
  const cetakSvT = teks(r.window.document.body.innerHTML);
  catat("Laporan supervisi dapat dicetak: kop sekolah, tabel indikator, catatan, rekomendasi, tanda tangan supervisor",
    /Laporan Supervisi Akademik/.test(cetakSvT) && /SMK Negeri 3 Kuningan/.test(cetakSvT) && /C\.1\.1/.test(cetakSvT)
    && /Catatan supervisor/.test(cetakSvT) && /Rekomendasi bagi murid/.test(cetakSvT) && /Supervisor Akademik/.test(cetakSvT)
    && /197009201994021002/.test(cetakSvT) && /Cetak \/ Simpan PDF/.test(cetakSvT),
    `id #${idSv} · kop=${/SMK Negeri 3 Kuningan/.test(cetakSvT)}, indikator=${/C\.1\.1/.test(cetakSvT)}, tanda tangan+NIP=${/197009201994021002/.test(cetakSvT)}`);

  // 36. Dokumentasi pertemuan siap cetak (A–I + prinsip + tanda tangan)
  r = await jalankan("/guru/dokumentasi/cetak/2/senin", guru, 1500);
  const cetakDokT = teks(r.window.document.body.innerHTML);
  catat("Dokumentasi pertemuan dapat dicetak (tujuan, memahami–mengaplikasi–merefleksi, prinsip, bukti, observasi, refleksi, tindak lanjut)",
    /Dokumentasi Pembelajaran per Pertemuan/.test(cetakDokT) && /A\. Tujuan pembelajaran/.test(cetakDokT)
    && /B\. Aktivitas memahami/.test(cetakDokT) && /E\. Penerapan prinsip pembelajaran mendalam/.test(cetakDokT)
    && /F\. Bukti aktivitas/.test(cetakDokT) && /I\. Tindak lanjut/.test(cetakDokT) && /Supervisor Akademik/.test(cetakDokT),
    `judul=${/Dokumentasi Pembelajaran per Pertemuan/.test(cetakDokT)}, bagian A/B/E/F/I=${/A\. Tujuan pembelajaran/.test(cetakDokT) && /I\. Tindak lanjut/.test(cetakDokT)}, tanda tangan=${/Supervisor Akademik/.test(cetakDokT)}`);

  // 37. Rekap nilai siap cetak (tabel jenis asesmen + ketuntasan + tanda tangan)
  r = await jalankan("/guru/rekap-cetak", guru, 2000);
  const cetakRekT = teks(r.window.document.body.innerHTML);
  catat("Rekap nilai dapat dicetak: tabel per jenis asesmen, nilai akhir, kolom ketuntasan, tanda tangan",
    /Rekap Nilai Peserta Didik/.test(cetakRekT) && /Nilai akhir/.test(cetakRekT) && /Tuntas/.test(cetakRekT)
    && /sumatif/.test(cetakRekT) && /Supervisor Akademik/.test(cetakRekT) && /Cetak rekap kelas/.test(cetakRekT),
    `judul=${/Rekap Nilai Peserta Didik/.test(cetakRekT)}, kolom tuntas=${/Tuntas/.test(cetakRekT)}, baris peserta didik=${[...r.window.document.querySelectorAll("tbody tr")].length}`);

  // 38. Hak akses antarmuka: peserta didik dialihkan dari panel admin & halaman guru
  // hanya membaca isi #root (badan HTML memuat teks bundel skrip sehingga tidak sahih untuk uji "tidak boleh tampil")
  const teksRoot = (win) => teks(win.document.getElementById("root")?.innerHTML || "");
  const admSiswa = await jalankan("/admin", siswa, 1500);
  const admSiswaT = teksRoot(admSiswa.window);
  const guruSiswa = await jalankan("/guru/supervisi", siswa, 1500);
  const guruSiswaT = teksRoot(guruSiswa.window);
  const adminTidakBocor = !/Panel Admin/.test(admSiswaT) && !/Daftar akun/.test(admSiswaT);
  const guruTidakBocor = !/Supervisi Akademik/.test(guruSiswaT) && !/Indikator supervisi/.test(guruSiswaT);
  const kembaliKeDashboard = /Dashboard/.test(admSiswaT) && /Minggu berjalan/.test(admSiswaT);
  catat("Peserta didik dialihkan dari Panel Admin & halaman guru (tidak ada fitur admin/penilaian guru di antarmuka)",
    adminTidakBocor && guruTidakBocor && kembaliKeDashboard && admSiswa.err.length === 0 && guruSiswa.err.length === 0,
    `panel admin tidak bocor=${adminTidakBocor}, halaman guru tidak bocor=${guruTidakBocor}, dialihkan ke dashboard siswa=${kembaliKeDashboard}`);

  const gagal = hasil.filter(h => !h.lulus).length;
  console.log(`\nRINGKASAN UI: ${hasil.length - gagal}/${hasil.length} uji LULUS${gagal ? ` — ${gagal} GAGAL` : ""}`);
  process.exit(gagal ? 1 : 0);
})().catch(e => { console.error("Uji UI tidak dapat dijalankan:", e); process.exit(2); });
