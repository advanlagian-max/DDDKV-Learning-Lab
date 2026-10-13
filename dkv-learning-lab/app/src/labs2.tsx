// labs2.tsx — Laboratorium lanjutan: K3 & Ergonomi, Sketsa & Ilustrasi, serta Studio DKV (proyek terpadu).
import React, { useState } from "react";
import { Card, Btn, Badge, Field, inputCls, cx } from "./lib";
import { LabShell, type Kriteria, type UmpanBalik, type LabMeta } from "./labs";

/* ==================== 5. K3 & Ergonomi ==================== */
const ITEM_KERJA = [
  { id: "kabel", teks: "Kabel listrik melintang di jalur kaki", risiko: true, sebab: "Orang bisa tersandung dan perangkat bisa jatuh." },
  { id: "kopi", teks: "Gelas minuman terbuka di samping keyboard", risiko: true, sebab: "Tumpahan cairan dapat merusak perangkat dan menyebabkan korsleting." },
  { id: "tarik", teks: "Mencabut steker dengan menarik kawatnya", risiko: true, sebab: "Kawat dalam dapat putus dan menimbulkan percikan listrik." },
  { id: "duduk", teks: "Duduk membungkuk 3 jam tanpa jeda", risiko: true, sebab: "Beban leher, punggung, dan pergelangan tangan meningkat." },
  { id: "layar", teks: "Monitor berjarak ±30 cm dari mata", risiko: true, sebab: "Mata bekerja lebih berat; batas nyaman ±50–70 cm." },
  { id: "bersih", teks: "Membersihkan layar memakai kain lembut saat perangkat mati", risiko: false, sebab: "Cara ini aman dan tidak merusak layar." },
  { id: "meja", teks: "Meja cukup luas dan permukaannya stabil", risiko: false, sebab: "Kondisi kerja yang baik, tidak berisiko." },
  { id: "lampu", teks: "Ruang kerja cukup terang tanpa pantulan pada layar", risiko: false, sebab: "Pencahayaan memadai mencegah kelelahan mata." },
  { id: "jeda", teks: "Berdiri dan meregang setiap satu jam", risiko: false, sebab: "Kebiasaan kerja sehat, bukan risiko." },
  { id: "tas", teks: "Tas diletakkan di bawah meja, tidak di jalur jalan", risiko: false, sebab: "Penempatan aman, tidak mengganggu." },
  { id: "rak", teks: "Perangkat disimpan di rak kokoh dan tidak terlalu tinggi", risiko: false, sebab: "Mengurangi risiko jatuh dan cidera saat mengambil." },
];
const AKSI_KELELAHAN = [
  { id: "a1", teks: "Menerapkan aturan 20-20-20: setiap 20 menit melihat objek jauh selama 20 detik", benar: true },
  { id: "a2", teks: "Menyandarkan pergelangan pada bantalan dan menekuk siku ±90°", benar: true },
  { id: "a3", teks: "Menyesuaikan tinggi monitor dan menambah pencahayaan ruangan", benar: true },
  { id: "a4", teks: "Menambah kecerahan layar sampai maksimal agar mata “tidak berusaha”", benar: false },
  { id: "a5", teks: "Mengabaikan keluhan karena waktu pengerjaan masih panjang", benar: false },
  { id: "a6", teks: "Menggunakan obat tetes mata setiap jam tanpa memeriksa penyebabnya", benar: false },
  { id: "a7", teks: "Memiringkan layar tajam ke arah mata agar tampak jelas", benar: false },
];

export const META_K3: LabMeta = {
  id: "sim-k3-ergonomi", judul: "Laboratorium K3 & Ergonomi Kerja DKV", icon: "🦺",
  ringkas: "Temukan risiko keselamatan kerja, atur postur kerja yang sehat, lalu pilih tindakan aman untuk keluhan kerja.",
  petunjuk: [
    "Tingkat 1: tandai setiap kondisi yang berisiko pada daftar; hati-hati, ada kondisi yang justru sudah aman.",
    "Tingkat 2: geser pengatur postur dan lihat gambar kerja beserta garis pandang mata berubah.",
    "Tingkat 3: pilih tiga tindakan paling tepat untuk keluhan mata dan tangan setelah bekerja lama.",
    "Umpan balik menjelaskan alasan setiap risiko — pakai sebagai catatan sebelum praktik di laboratorium.",
  ],
  disclaimer: "Ini daftar periksa edukatif untuk pembelajaran K3 di sekolah, bukan penilaian keselamatan kerja resmi. Kondisi nyata di laboratorium/sekolah harus diperiksa tenaga ahli atau guru pembimbing.",
  rujukan: "Buku Semester 1, Bab 2 K3 (keselamatan kerja, ergonomi, sarana kerja) dan Bab 5 (postur kerja).",
  minggu: 5,
  tingkat: [
    { judul: "Temukan risiko", misi: "Tandai seluruh kondisi berisiko pada daftar dan jangan menandai kondisi yang sudah aman." },
    { judul: "Atur postur", misi: "Atur tinggi kursi, jarak monitor, tinggi monitor, dan pencahayaan ke rentang aman sekaligus." },
    { judul: "Tindakan aman", misi: "Pilih tepat tiga tindakan yang benar untuk keluhan mata dan pergelangan tangan." },
  ],
};

const RENTANG_POSTUR = [
  { id: "kursi", label: "Tinggi kursi (relatif meja)", min: 40, max: 75, pesan: "Paha sejajar lantai, kaki menapak dengan sandaran bawah." },
  { id: "jarak", label: "Jarak monitor (cm)", min: 55, max: 80, pesan: "Sekitar satu panjang lengan (±50–70 cm) dari mata." },
  { id: "monitor", label: "Tinggi monitor", min: 45, max: 70, pesan: "Bagian atas layar sejajar garis pandang mata." },
  { id: "cahaya", label: "Kecuraman pencahayaan ruang", min: 40, max: 80, pesan: "Cukup terang, tanpa pantulan menyilaukan pada layar." },
];
const LABEL_POSTUR = ["kursi", "jarak", "monitor", "cahaya"] as const;

export function K3Lab({ onResetLab }: { onResetLab: () => void }) {
  const [tingkat, setTingkat] = useState(1);
  const [tanda, setTanda] = useState<string[]>([]);
  const [postur, setPostur] = useState({ kursi: 70, jarak: 30, monitor: 30, cahaya: 60 });
  const [aksi, setAksi] = useState<string[]>([]);

  const risikoBenar = ITEM_KERJA.filter(i => i.risiko).map(i => i.id);
  const ditemukan = risikoBenar.filter(id => tanda.includes(id)).length;
  const salahTanda = tanda.filter(id => !risikoBenar.includes(id)).length;
  const posturAman = RENTANG_POSTUR.filter(r => postur[r.id] >= r.min && postur[r.id] <= r.max).length;
  const aksiBenar = AKSI_KELELAHAN.filter(a => aksi.includes(a.id) && a.benar).length;
  const aksiSalah = AKSI_KELELAHAN.filter(a => aksi.includes(a.id) && !a.benar).length;

  const kriteria: Kriteria[] = tingkat === 1
    ? [{ teks: `Menemukan ${risikoBenar.length}/${risikoBenar.length} kondisi berisiko`, lulus: ditemukan === risikoBenar.length },
       { teks: "Tidak menandai kondisi yang sudah aman", lulus: salahTanda === 0 }]
    : tingkat === 2
      ? RENTANG_POSTUR.map(r => ({ teks: `${r.label} dalam rentang aman (${r.min}–${r.max})`, lulus: postur[r.id] >= r.min && postur[r.id] <= r.max }))
      : [{ teks: "Tepat tiga tindakan benar terpilih", lulus: aksiBenar === 3 },
         { teks: "Tidak ada tindakan salah terpilih", lulus: aksiSalah === 0 }];

  const umpanBalik: UmpanBalik[] = tingkat === 1
    ? [
        { ok: ditemukan === risikoBenar.length, t: `Risiko ditemukan: ${ditemukan}/${risikoBenar.length}.` },
        { ok: salahTanda === 0, t: salahTanda === 0 ? "Tidak ada kondisi aman yang salah ditandai." : `${salahTanda} kondisi aman malah ditandai berisiko — periksa kembali alasannya.` },
        ...tanda.slice(0, 3).map(id => {
          const it = ITEM_KERJA.find(x => x.id === id)!;
          return { ok: it.risiko, t: `${it.teks}: ${it.sebab}` };
        }),
      ]
    : tingkat === 2
      ? [
          ...RENTANG_POSTUR.map(r => ({
            ok: postur[r.id] >= r.min && postur[r.id] <= r.max,
            t: `${r.label} = ${postur[r.id]} → ${postur[r.id] >= r.min && postur[r.id] <= r.max ? "aman" : postur[r.id] < r.min ? "terlalu rendah/dekat" : "terlalu tinggi/jauh"}. ${r.pesan}`,
          })),
          { ok: posturAman === 4, t: `Postur aman pada ${posturAman}/4 pengaturan.` },
        ]
      : [
          { ok: aksiBenar === 3 && aksiSalah === 0, t: `Tindakan benar terpilih: ${aksiBenar}, salah: ${aksiSalah}.` },
          ...[...aksi].slice(0, 3).map(id => {
            const a = AKSI_KELELAHAN.find(x => x.id === id)!;
            return { ok: a.benar, t: `${a.teks} → ${a.benar ? "tepat" : "kurang tepat"}.` };
          }),
        ];

  const headY = 92 - postur.kursi * 0.35;
  const monX = 300 - postur.jarak;
  const monY = 78 - postur.monitor * 0.32;
  const sejajar = Math.abs(monY - (headY - 18)) < 14;

  return (
    <LabShell meta={META_K3} tingkat={tingkat} setTingkat={setTingkat} kriteria={kriteria} umpanBalik={umpanBalik}
      onReset={onResetLab} rincian={{ tanda, postur, aksi }}>
      {tingkat === 1 && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800">🔍 Pemeriksaan meja kerja</h3>
          <p className="mt-1 text-sm text-slate-600">Tandai setiap kondisi yang menurutmu berisiko (klik kotaknya), lalu periksa umpan balik.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ITEM_KERJA.map(i => {
              const dipilih = tanda.includes(i.id);
              return (
                <li key={i.id}>
                  <label className={cx("flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm",
                    dipilih ? (i.risiko ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50") : "border-slate-200 hover:bg-slate-50")}>
                    <input type="checkbox" checked={dipilih} onChange={e => setTanda(e.target.checked ? [...tanda, i.id] : tanda.filter(x => x !== i.id))} />
                    <span>{i.teks}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 text-sm text-slate-600">Ditandai: <b>{tanda.length}</b> · risiko benar ditemukan: <b>{ditemukan}/{risikoBenar.length}</b> · salah tandai: <b>{salahTanda}</b></div>
        </Card>
      )}

      {tingkat === 2 && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800">🪑 Meja kerja ergonomis (pratinjau)</h3>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
              <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label="Pratinjau postur kerja">
                <rect x="0" y="0" width="320" height="200" fill="#fbfdff" />
                {/* meja */}
                <rect x="180" y="120" width="130" height="8" fill="#94a3b8" />
                <rect x="185" y="128" width="6" height="60" fill="#cbd5e1" />
                <rect x="299" y="128" width="6" height="60" fill="#cbd5e1" />
                {/* monitor */}
                <rect x={monX} y={monY} width="76" height="52" rx="3" fill="#1e3a8a" />
                <rect x={monX + 8} y={monY + 8} width="60" height="36" rx="2" fill="#bfdbfe" />
                <rect x={monX + 34} y={monY + 52} width="8" height="10" fill="#334155" />
                {/* garis pandang mata */}
                <line x1="40" y1={headY - 18} x2={monX + 76} y2={headY - 18} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6 4" />
                <text x="44" y={headY - 24} fontSize="9" fill="#dc2626">garis pandang mata</text>
                {/* kursi + orang */}
                <rect x="60" y={headY + 40} width="70" height="10" rx="3" fill="#a5b4fc" />
                <rect x="52" y={headY + 6} width="10" height="40" rx="3" fill="#818cf8" />
                <rect x="96" y={headY + 50} width="6" height="34" fill="#94a3b8" />
                <circle cx="96" cy={headY} r="15" fill="#fde68a" stroke="#d97706" />
                <line x1="96" y1={headY + 15} x2="96" y2={headY + 40} stroke="#1e293b" strokeWidth="5" />
                <line x1="96" y1={headY + 26} x2={monX - 6} y2={headY + 34} stroke="#1e293b" strokeWidth="4" />
                <line x1="80" y1={50 + 70} x2="86" y2={184} stroke="#1e293b" strokeWidth="4" />
                <line x1="110" y1={50 + 70} x2="118" y2={184} stroke="#1e293b" strokeWidth="4" />
                {/* pencahayaan */}
                <circle cx="40" cy="30" r={8 + postur.cahaya * 0.14} fill="#fde68a" opacity={0.35 + postur.cahaya / 200} />
                <text x="14" y="62" fontSize="9" fill="#7c2d12">pencahayaan {postur.cahaya}</text>
                <text x={monX - 4} y={monY - 6} fontSize="9" fill="#1e3a8a">monitor</text>
              </svg>
            </div>
            <div className="space-y-3">
              {RENTANG_POSTUR.map(r => (
                <div key={r.id}>
                  <label className="text-xs font-medium text-slate-600">{r.label}: {postur[r.id]} (aman {r.min}–{r.max})</label>
                  <input type="range" min={0} max={100} value={postur[r.id]}
                    onChange={e => setPostur({ ...postur, [r.id]: +e.target.value })} className="w-full" />
                </div>
              ))}
              <div className={cx("rounded-xl p-3 text-sm", posturAman === 4 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
                Postur aman pada {posturAman}/4 pengaturan. {sejajar ? "Bagian atas layar sejajar garis pandang mata — baik." : "Bagian atas layar belum sejajar garis pandang mata."}
              </div>
            </div>
          </div>
        </Card>
      )}

      {tingkat === 3 && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800">🚨 Skenario: bekerja 3 jam, mata perih & pergelangan nyeri</h3>
          <p className="mt-1 text-sm text-slate-600">Pilih <b>tiga</b> tindakan yang paling tepat sebagai langkah awal, lalu periksa umpan balik.</p>
          <ul className="mt-3 space-y-2">
            {AKSI_KELELAHAN.map(a => {
              const dipilih = aksi.includes(a.id);
              return (
                <li key={a.id}>
                  <label className={cx("flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm",
                    dipilih ? (a.benar ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50") : "border-slate-200 hover:bg-slate-50")}>
                    <input type="checkbox" checked={dipilih} onChange={e => setAksi(e.target.checked ? [...aksi, a.id] : aksi.filter(x => x !== a.id))} />
                    <span>{a.teks}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 text-sm text-slate-600">Terpilih: <b>{aksi.length}</b> · benar <b>{aksiBenar}</b> · kurang tepat <b>{aksiSalah}</b></div>
        </Card>
      )}
    </LabShell>
  );
}

/* ==================== 6. Sketsa & Ilustrasi ==================== */
type BriefSketsa = {
  judul: string; klien: string; sasaran: string; pesan: string;
  kunci: string[]; pengganggu: string[]; gaya: string; elemenWajib: string[];
};
const BRIEF_SKETSA: BriefSketsa[] = [
  {
    judul: "Ilustrasi poster kebersihan kelas", klien: "OSIS SMKN 3 Kuningan", sasaran: "Siswa kelas X",
    pesan: "Menjaga kelas tetap bersih itu mudah dan menyenangkan",
    kunci: ["lingkungan", "kolaborasi", "kebiasaan baik"],
    pengganggu: ["kemewahan", "menakut-nakuti", "kemasan produk"],
    gaya: "kartun-garis",
    elemenWajib: ["sapu", "tanaman", "siswa", "kelas"],
  },
  {
    judul: "Sampul buku cerita anak: daur ulang", klien: "Perpustakaan sekolah", sasaran: "Anak 8–10 tahun",
    pesan: "Barang bekas bisa bermanfaat kembali",
    kunci: ["imajinatif", "ramah anak", "bahan bekas"],
    pengganggu: ["teknologi tinggi", "gelap dan seram", "koran industri"],
    gaya: "flat-lucu",
    elemenWajib: ["botol", "tanaman", "anak", "warna"],
  },
  {
    judul: "Maskot ekstrakurikuler DKV", klien: "Pembina ekskul", sasaran: "Remaja 15–17 tahun",
    pesan: "Berani, ramah, dan sportif",
    kunci: ["karakter kuat", "sederhana", "mudah diingat"],
    pengganggu: ["rumit dan detail kecil", "warna pucat", "tidak berkarakter"],
    gaya: "kartun-garis",
    elemenWajib: ["pensil", "kuas", "layar", "ikon"],
  },
];
const SEMUA_KATA = [...new Set(BRIEF_SKETSA.flatMap(b => [...b.kunci, ...b.pengganggu]))].sort();
const GAYA = [
  { id: "kartun-garis", label: "Kartun garis tebal", warna: ["#1d4ed8", "#fbbf24", "#f1f5f9"], catatan: "Garis jelas, bentuk sederhana, mudah dibaca dari jauh." },
  { id: "flat-lucu", label: "Flat warna cerah", warna: ["#16a34a", "#f97316", "#ecfeff"], catatan: "Warna blok tanpa gradasi, ramah anak." },
  { id: "realis-vektor", label: "Realis-vektor detail", warna: ["#334155", "#94a3b8", "#e2e8f0"], catatan: "Banyak detail dan bayangan halus." },
];
const ELEMEN = [
  { id: "sapu", label: "🧹 sapu", kata: "kebersihan" }, { id: "tanaman", label: "🪴 tanaman", kata: "lingkungan" },
  { id: "siswa", label: "🧑‍🎓 siswa", kata: "kolaborasi" }, { id: "kelas", label: "🏫 ruang kelas", kata: "kebiasaan baik" },
  { id: "botol", label: "🍶 botol bekas", kata: "bahan bekas" }, { id: "anak", label: "🧒 anak", kata: "ramah anak" },
  { id: "warna", label: "🎨 palet warna", kata: "imajinatif" }, { id: "pensil", label: "✏️ pensil", kata: "karakter kuat" },
  { id: "kuas", label: "🖌️ kuas", kata: "sederhana" }, { id: "layar", label: "🖥️ layar", kata: "mudah diingat" },
  { id: "ikon", label: "⭐ ikon sederhana", kata: "sederhana" }, { id: "mahkota", label: "👑 mahkota mewah", kata: "kemewahan" },
];
const RUBRIK_KONSEP = ["Kesesuaian dengan brief", "Orisinalitas ide", "Keterbacaan bentuk", "Kelayakan produksi"];

export const META_SKETSA: LabMeta = {
  id: "sim-sketsa-lab", judul: "Laboratorium Sketsa & Ilustrasi", icon: "✏️",
  ringkas: "Kembangkan ide ilustrasi dari brief: tetapkan kata kunci, susun arah konsep bersama moodboard, lalu nilai konsepmu memakai rubrik.",
  petunjuk: [
    "Baca brief lebih dahulu (klien, sasaran, pesan) sebelum memilih apa pun.",
    "Tingkat 1: pilih tepat tiga kata kunci yang sesuai brief — hindari kata yang melenceng.",
    "Tingkat 2: pilih gaya ilustrasi dan empat elemen moodboard; kartu konsep akan berubah mengikuti pilihanmu.",
    "Tingkat 3: nilai konsepmu sendiri dengan rubrik, lalu tulis satu langkah perbaikan untuk skor terendah.",
  ],
  disclaimer: "Moodboard dan kartu konsep di sini disusun dari pilihan yang tersedia (simbol dan warna sederhana) sebagai model latihan berpikir konsep — bukan kanvas menggambar dan bukan penilaian karya seni sungguhan.",
  rujukan: "Buku Semester 1, Bab 4 (kreativitas: tahap persiapan–iluminasi–verifikasi) dan Bab 5 Sketsa & Ilustrasi.",
  minggu: 16,
  tingkat: [
    { judul: "Kata kunci", misi: "Pilih tepat tiga kata kunci yang benar-benar sesuai dengan brief." },
    { judul: "Arah konsep", misi: "Pilih gaya ilustrasi yang sesuai dan minimal tiga elemen moodboard yang relevan dengan pesan brief." },
    { judul: "Evaluasi konsep", misi: "Beri skor rubrik untuk konsepmu sendiri (tidak ada kriteria bernilai 1–2) dan tulis satu langkah perbaikan." },
  ],
};

export function SketsaLab({ onResetLab }: { onResetLab: () => void }) {
  const [tingkat, setTingkat] = useState(1);
  const brief = BRIEF_SKETSA[tingkat - 1];
  const [kunci, setKunci] = useState<string[]>([]);
  const [gaya, setGaya] = useState("");
  const [elemen, setElemen] = useState<string[]>([]);
  const [rubrik, setRubrik] = useState<Record<string, number>>({});
  const [perbaikan, setPerbaikan] = useState("");

  const kunciBenar = kunci.filter(k => brief.kunci.includes(k)).length;
  const kunciSalah = kunci.filter(k => brief.pengganggu.includes(k)).length;
  const gayaBenar = gaya === brief.gaya;
  const elemenRelevan = elemen.filter(e => { const it = ELEMEN.find(x => x.id === e); return it && brief.elemenWajib.includes(it.id); }).length;
  const skorRubrik = Object.values(rubrik);
  const rubrikLengkap = skorRubrik.length === RUBRIK_KONSEP.length;
  const rubrikAman = rubrikLengkap && skorRubrik.every(v => v >= 3);

  const kriteria: Kriteria[] = tingkat === 1
    ? [{ teks: "Tepat tiga kata kunci sesuai brief", lulus: kunciBenar === 3 },
       { teks: "Tidak memilih kata kunci yang melenceng", lulus: kunciSalah === 0 }]
    : tingkat === 2
      ? [{ teks: "Gaya ilustrasi sesuai arah brief", lulus: gayaBenar },
         { teks: "Minimal tiga elemen moodboard relevan", lulus: elemenRelevan >= 3 },
         { teks: "Moodboard berisi tepat empat elemen", lulus: elemen.length === 4 }]
      : [{ teks: "Seluruh kriteria rubrik diberi skor", lulus: rubrikLengkap },
         { teks: "Tidak ada kriteria bernilai 1–2", lulus: rubrikAman },
         { teks: "Langkah perbaikan untuk skor terendah ditulis", lulus: perbaikan.trim().length >= 12 }];

  const g = GAYA.find(x => x.id === gaya);
  const terendah = RUBRIK_KONSEP.reduce((a, b) => ((rubrik[a] ?? 4) <= (rubrik[b] ?? 4) ? a : b), RUBRIK_KONSEP[0]);

  const umpanBalik: UmpanBalik[] = tingkat === 1
    ? [
        { ok: kunciBenar === 3, t: `Kata kunci sesuai brief: ${kunciBenar}/3. Kata kunci brief: ${brief.kunci.join(", ")}.` },
        { ok: kunciSalah === 0, t: kunciSalah === 0 ? "Tidak ada kata kunci yang melenceng dari brief." : "Ada kata kunci yang tidak sejalan dengan brief — pikirkan pesan utamanya." },
      ]
    : tingkat === 2
      ? [
          { ok: gayaBenar, t: gaya ? `Gaya ${GAYA.find(x => x.id === gaya)?.label}: ${GAYA.find(x => x.id === gaya)?.catatan} ${gayaBenar ? "Cocok untuk brief ini." : "Kurang cocok dengan sasaran brief."}` : "Belum memilih gaya ilustrasi." },
          { ok: elemenRelevan >= 3, t: `Elemen yang mendukung pesan: ${elemenRelevan}. Elemen wajib brief ini: ${brief.elemenWajib.join(", ")}.` },
          { ok: elemen.length === 4, t: `Jumlah elemen moodboard: ${elemen.length} (patokan 4 agar fokus).` },
        ]
      : [
          { ok: rubrikLengkap, t: rubrikLengkap ? "Semua kriteria rubrik sudah dinilai." : "Lengkapi skor untuk empat kriteria rubrik." },
          { ok: rubrikAman, t: rubrikAman ? "Konsep sudah layak; tidak ada kriteria bernilai 1–2." : `Perbaiki kriteria dengan skor terendah: ${terendah}.` },
          { ok: perbaikan.trim().length >= 12, t: perbaikan.trim().length >= 12 ? "Langkah perbaikan sudah ditulis — pakai sebagai rencana sketsa berikutnya." : "Tulis satu langkah perbaikan yang konkret (minimal satu kalimat)." },
        ];

  return (
    <LabShell meta={META_SKETSA} tingkat={tingkat} setTingkat={setTingkat} kriteria={kriteria} umpanBalik={umpanBalik}
      onReset={onResetLab} rincian={{ kunci, gaya, elemen, rubrik, perbaikan }}>
      <Card className="p-5">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">Brief tingkat {tingkat}</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">{brief.judul}</div>
          <div className="mt-1 text-sm text-blue-900">Klien: {brief.klien} · Sasaran: {brief.sasaran} · Pesan: <b>{brief.pesan}</b></div>
        </div>

        {tingkat === 1 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-slate-700">Pilih tiga kata kunci yang mewakili brief</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SEMUA_KATA.map(k => (
                <button key={k} onClick={() => setKunci(kunci.includes(k) ? kunci.filter(x => x !== k) : kunci.length < 3 ? [...kunci, k] : kunci)}
                  className={cx("rounded-full border px-3 py-1.5 text-sm", kunci.includes(k) ? "border-blue-500 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-400")}>
                  {k}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">Terpilih {kunci.length}/3 · klik lagi untuk membatalkan.</div>
          </div>
        )}

        {tingkat === 2 && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="text-sm font-medium text-slate-700">Gaya ilustrasi</div>
              <div className="mt-2 space-y-1.5">
                {GAYA.map(x => (
                  <label key={x.id} className={cx("flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-sm", gaya === x.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50")}>
                    <input type="radio" name="gaya" checked={gaya === x.id} onChange={() => setGaya(x.id)} />
                    <span className="flex items-center gap-2">{x.warna.map((w, i) => <span key={i} className="inline-block h-4 w-4 rounded-full border border-slate-300" style={{ background: w }} />)} {x.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-sm font-medium text-slate-700">Moodboard (pilih empat elemen)</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ELEMEN.map(e => (
                  <button key={e.id} onClick={() => setElemen(elemen.includes(e.id) ? elemen.filter(x => x !== e.id) : elemen.length < 4 ? [...elemen, e.id] : elemen)}
                    className={cx("rounded-xl border px-2.5 py-1.5 text-sm", elemen.includes(e.id) ? "border-blue-500 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-400")}>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Kartu konsep (pratinjau)</div>
              <div className="mt-2 rounded-xl border p-4" style={{ background: g ? g.warna[2] : "#f8fafc", borderColor: g ? g.warna[0] : "#cbd5e1" }}>
                <div className="text-sm font-semibold" style={{ color: g ? g.warna[0] : "#334155" }}>{brief.judul}</div>
                <div className="mt-1 text-xs text-slate-600">{brief.pesan}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-2xl">
                  {elemen.length === 0 ? <span className="text-sm text-slate-400">Belum ada elemen dipilih…</span>
                    : elemen.map(id => <span key={id} title={id}>{ELEMEN.find(e => e.id === id)?.label.split(" ")[0]}</span>)}
                </div>
                <div className="mt-3 text-[11px] text-slate-500">
                  Gaya: {g ? g.label : "belum dipilih"} · sasaran: {brief.sasaran}
                </div>
              </div>
            </div>
          </div>
        )}

        {tingkat === 3 && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {RUBRIK_KONSEP.map(r => (
                <div key={r}>
                  <label className="text-xs font-medium text-slate-600">{r}: {rubrik[r] ?? "—"} (1 kurang … 4 sangat baik)</label>
                  <input type="range" min={1} max={4} value={rubrik[r] ?? 3} onChange={e => setRubrik({ ...rubrik, [r]: +e.target.value })} className="w-full" />
                </div>
              ))}
              <Field label="Langkah perbaikan untuk kriteria skor terendah">
                <textarea className={cx(inputCls, "h-20")} value={perbaikan} onChange={e => setPerbaikan(e.target.value)}
                  placeholder={`Contoh: memperjelas ${terendah.toLowerCase()} dengan menyederhanakan bentuk dan menambah kontras warna.`} />
              </Field>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-medium text-slate-800">Lembar penilaian konsep</div>
              <ul className="mt-2 space-y-1">
                {RUBRIK_KONSEP.map(r => <li key={r} className="flex justify-between"><span>{r}</span><b>{rubrik[r] ?? "—"}</b></li>)}
              </ul>
              <div className="mt-3 text-xs text-slate-500">
                Total skor konsepmu: <b>{skorRubrik.reduce((a, b) => a + b, 0)}</b> dari 16. Kriteria skor terendah: <b>{terendah}</b>.
                Konsep dengan skor 3–4 pada semua kriteria sudah layak dilanjutkan ke sketsa halus dan produksi.
              </div>
            </div>
          </div>
        )}
      </Card>
    </LabShell>
  );
}

/* ==================== 7. Studio DKV ==================== */
type BriefStudio = {
  judul: string; klien: string; kebutuhan: string; kendala: string; keluaran: string;
  risetBenar: string[]; konsepBenar: { sasaran: string; gaya: string; media: string };
  paletBenar: string; hurufBenar: string; kanvasBenar: string; revisiBenar: string; presentasiBenar: string[];
};
const BRIEF_STUDIO: BriefStudio[] = [
  {
    judul: "Kartu nama & logo untuk UMKM kopi", klien: "Kedai Kopi “Seduh Cimahi”", kebutuhan: "Identitas sederhana yang mudah dikenali warga sekitar",
    kendala: "Hanya dicetak hitam putih, ukuran kecil", keluaran: "Kartu nama 9 × 5,5 cm + logo vektor",
    risetBenar: ["r-harga", "r-pesaing", "r-sasaran"],
    konsepBenar: { sasaran: "dewasa-lokal", gaya: "sederhana-vektor", media: "kartu-cetak" },
    paletBenar: "mono", hurufBenar: "sans-jelas", kanvasBenar: "kartu",
    revisiBenar: "r-vektor-mono",
    presentasiBenar: ["p-klien", "p-konsep", "p-karya", "p-pelajaran"],
  },
  {
    judul: "Poster acara sekolah", klien: "OSIS SMKN 3 Kuningan", kebutuhan: "Poster acara pentas seni yang terlihat dari jauh",
    kendala: "Cetak A3 hanya dua warna: hitam dan satu warna tambahan", keluaran: "Poster A3 siap cetak + versi gambar untuk media sosial",
    risetBenar: ["r-harga", "r-sasaran", "r-ukuran"],
    konsepBenar: { sasaran: "siswa-sekolah", gaya: "kontras-besar", media: "poster-cetak" },
    paletBenar: "duo", hurufBenar: "sans-jelas", kanvasBenar: "a3",
    revisiBenar: "r-kontras-cetak",
    presentasiBenar: ["p-klien", "p-konsep", "p-karya", "p-pelajaran"],
  },
  {
    judul: "Tiga konten feed akun sekolah", klien: "Admin akun @smkn3kuningan", kebutuhan: "Rangkaian konten informasi PPDB yang konsisten",
    kendala: "Sebagian besar penonton memakai ponsel dengan koneksi terbatas", keluaran: "Tiga gambar 1080 × 1080 px + teks pendamping",
    risetBenar: ["r-sasaran", "r-ukuran", "r-pesaing"],
    konsepBenar: { sasaran: "siswa-sekolah", gaya: "berwarna-konsisten", media: "media-sosial" },
    paletBenar: "tiga-warna", hurufBenar: "sans-jelas", kanvasBenar: "kotak",
    revisiBenar: "r-sederhana-ponsel",
    presentasiBenar: ["p-klien", "p-karya", "p-hasil", "p-pelajaran"],
  },
];
const RISET = [
  { id: "r-harga", teks: "Berapa harga yang diterima pasar untuk produk seperti ini?" },
  { id: "r-pesaing", teks: "Seperti apa karya pesaing dan apa yang membuatnya berbeda?" },
  { id: "r-sasaran", teks: "Siapa sasaran utama dan di mana mereka melihat karya ini?" },
  { id: "r-ukuran", teks: "Ukuran dan bahan apa yang dipakai saat produksi nanti?" },
  { id: "r-warna-kursi", teks: "Apa warna kursi tempat klien biasa duduk?" },
  { id: "r-nama-tim", teks: "Siapa saja nama anggota tim desain kita?" },
  { id: "r-cuaca", teks: "Bagaimana prakiraan cuaca saat penyerahan hasil?" },
];
const SASARAN = [
  { id: "dewasa-lokal", label: "Pembeli dewasa di sekitar kedai" },
  { id: "siswa-sekolah", label: "Siswa & guru sekolah" },
  { id: "anak-anak", label: "Anak-anak usia dini" },
];
const KONSEP_GAYA = [
  { id: "sederhana-vektor", label: "Sederhana, bentuk vektor geometris" },
  { id: "kontras-besar", label: "Kontras besar, huruf tebal untuk dibaca dari jauh" },
  { id: "berwarna-konsisten", label: "Berwarna konsisten, banyak ruang kosong" },
];
const MEDIA = [
  { id: "kartu-cetak", label: "Cetak kecil (kartu)" },
  { id: "poster-cetak", label: "Cetak besar (poster)" },
  { id: "media-sosial", label: "Layar ponsel (media sosial)" },
];
const PALET = [
  { id: "mono", label: "Hitam–putih–satu abu", warna: ["#111827", "#6b7280", "#f3f4f6"] },
  { id: "duo", label: "Hitam + satu warna kuat", warna: ["#111827", "#f59e0b", "#f8fafc"] },
  { id: "tiga-warna", label: "Tiga warna serasi", warna: ["#1d4ed8", "#22c55e", "#f8fafc"] },
];
const HURUF = [
  { id: "sans-jelas", label: "Sans serif jelas (Arial/Verdana)", css: "Arial, sans-serif" },
  { id: "serif-resmi", label: "Serif resmi (Georgia/Times)", css: "Georgia, serif" },
  { id: "script-hias", label: "Script hias (Cursive)", css: "cursive" },
];
const KANVAS = [
  { id: "kartu", label: "9 × 5,5 cm (kartu nama)", w: 180, h: 110 },
  { id: "a3", label: "42 × 29,7 cm (A3)", w: 190, h: 134 },
  { id: "kotak", label: "1080 × 1080 px (kotak media sosial)", w: 140, h: 140 },
];
const REVISI = [
  { id: "r-vektor-mono", teks: "Ubah logo menjadi vektor satu warna agar tetap jelas saat dicetak hitam putih." },
  { id: "r-perbanyak-warna", teks: "Tambahkan gradasi warna pada logo agar tampak mahal." },
  { id: "r-perkecil-huruf", teks: "Perkecil huruf nama pemilik agar logo terlihat lebih besar." },
  { id: "r-kontras-cetak", teks: "Perbesar kontras dan hilangkan gradasi halus karena tidak terbaca saat dicetak dua warna." },
  { id: "r-sederhana-ponsel", teks: "Sederhanakan elemen dan perbesar teks utama agar terbaca di layar ponsel." },
];
const PRESENTASI = [
  { id: "p-klien", teks: "Kebutuhan & kendala klien" },
  { id: "p-konsep", teks: "Konsep dan alasan pemilihan warna/huruf" },
  { id: "p-karya", teks: "Karya akhir (mockup & berkas siap produksi)" },
  { id: "p-hasil", teks: "Hasil/highlight performa konten" },
  { id: "p-pelajaran", teks: "Kendala yang dihadapi & pelajaran yang didapat" },
  { id: "p-harga-kursi", teks: "Daftar harga kursi kantor" },
  { id: "p-cuaca", teks: "Prakiraan cuaca selama pengerjaan" },
];

export const META_STUDIO: LabMeta = {
  id: "sim-studio-dkv", judul: "Studio DKV — Proyek dari Brief sampai Presentasi", icon: "🎬",
  ringkas: "Kerjakan proyek desain lima tahap: riset, konsep, desain, uji & revisi, lalu presentasi — untuk tiga brief klien yang berbeda.",
  petunjuk: [
    "Pilih tingkat = klien/brief, lalu baca kebutuhan, kendala, dan keluaran yang diminta.",
    "Setiap tahap punya kriteria; selesaikan satu per satu sampai seluruh baris tantangan berwarna hijau.",
    "Pratinjau karya berubah mengikuti pilihan palet, huruf, dan ukuran kanvas.",
    "Akhiri dengan mengumpulkan hasil dan menulis refleksi proyek.",
  ],
  disclaimer: "Seluruh tahap adalah model pembelajaran alur kerja studio desain (brief → riset → konsep → desain → uji → presentasi). Karya yang muncul hanya pratinjau sederhana, bukan keluaran perangkat lunak desain profesional dan bukan penilaian mutu karya nyata.",
  rujukan: "Buku Semester 2 Bab 3 (komputer grafis & produk grafis) dan Buku Semester 1 Bab 3–4 (proses industri kreatif & kreativitas).",
  minggu: 35,
  tingkat: [
    { judul: "UMKM kopi", misi: "Selesaikan identitas UMKM: riset tepat, konsep sesuai kendala cetak hitam putih, dan revisi yang benar." },
    { judul: "Poster sekolah", misi: "Kerjakan poster A3 dua warna: fokus pada keterbacaan dari jauh dan kendala cetak." },
    { judul: "Konten media sosial", misi: "Susun tiga konten feed: konsisten, sederhana, dan tetap terbaca di ponsel." },
  ],
};

export function StudioLab({ onResetLab }: { onResetLab: () => void }) {
  const [tingkat, setTingkat] = useState(1);
  const brief = BRIEF_STUDIO[tingkat - 1];
  const [riset, setRiset] = useState<string[]>([]);
  const [konsep, setKonsep] = useState({ sasaran: "", gaya: "", media: "" });
  const [palet, setPalet] = useState("");
  const [huruf, setHuruf] = useState("");
  const [kanvas, setKanvas] = useState("");
  const [revisi, setRevisi] = useState("");
  const [presentasi, setPresentasi] = useState<string[]>([]);

  const risetBenar = riset.filter(r => brief.risetBenar.includes(r)).length;
  const risetSalah = riset.filter(r => !brief.risetBenar.includes(r)).length;
  const konsepBenar = konsep.sasaran === brief.konsepBenar.sasaran && konsep.gaya === brief.konsepBenar.gaya && konsep.media === brief.konsepBenar.media;
  const desainBenar = palet === brief.paletBenar && huruf === brief.hurufBenar && kanvas === brief.kanvasBenar;
  const revisiOk = revisi === brief.revisiBenar;
  const presentasiBenar = presentasi.filter(p => brief.presentasiBenar.includes(p)).length;
  const presentasiSalah = presentasi.filter(p => !brief.presentasiBenar.includes(p)).length;

  const kriteria: Kriteria[] = [
    { teks: "Tahap 1 — tiga pertanyaan riset tepat, tanpa pertanyaan melenceng", lulus: risetBenar === 3 && risetSalah === 0 },
    { teks: "Tahap 2 — sasaran, gaya, dan media sesuai brief", lulus: konsepBenar },
    { teks: "Tahap 3 — palet, huruf, dan ukuran kanvas tepat", lulus: desainBenar },
    { teks: "Tahap 4 — tindakan revisi sesuai temuan uji", lulus: revisiOk },
    { teks: "Tahap 5 — empat bagian presentasi tepat", lulus: presentasiBenar === 4 && presentasiSalah === 0 },
  ];

  const p = PALET.find(x => x.id === palet), h = HURUF.find(x => x.id === huruf), kv = KANVAS.find(x => x.id === kanvas);
  const pilihan = (arr: { id: string; label: string }[], id: string) => arr.find(x => x.id === id)?.label || "belum dipilih";

  const umpanBalik: UmpanBalik[] = [
    { ok: risetBenar === 3 && risetSalah === 0, t: `Riset: ${risetBenar} pertanyaan tepat, ${risetSalah} melenceng. Pertanyaan riset harus menyangkut sasaran, pesaing, dan kebutuhan produksi.` },
    { ok: konsepBenar, t: `Konsep: sasaran ${pilihan(SASARAN, konsep.sasaran)} · gaya ${pilihan(KONSEP_GAYA, konsep.gaya)} · media ${pilihan(MEDIA, konsep.media)}.` },
    { ok: desainBenar, t: `Desain: palet ${pilih1(PALET, palet)}, huruf ${pilih1(HURUF, huruf)}, kanvas ${pilih1(KANVAS, kanvas)}.` },
    { ok: revisiOk, t: `Uji & revisi: ${revisiOk ? "tindakan tepat — sesuai temuan uji." : "belum memilih tindakan revisi yang sesuai temuan uji."} Temuan: ${brief.kendala}.` },
    { ok: presentasiBenar === 4 && presentasiSalah === 0, t: `Presentasi: ${presentasiBenar} bagian tepat, ${presentasiSalah} tidak perlu.` },
  ];

  return (
    <LabShell meta={META_STUDIO} tingkat={tingkat} setTingkat={setTingkat} kriteria={kriteria} umpanBalik={umpanBalik}
      onReset={onResetLab} rincian={{ riset, konsep, palet, huruf, kanvas, revisi, presentasi }}>
      <Card className="p-5">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">Brief klien tingkat {tingkat}</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">{brief.judul}</div>
          <div className="mt-1 text-sm text-blue-900">
            Klien: {brief.klien}<br />Kebutuhan: {brief.kebutuhan}<br />
            Kendala: <b>{brief.kendala}</b><br />Keluaran: {brief.keluaran}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Tahap 1 & 2 */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-sm font-semibold text-slate-800">Tahap 1 · Riset (pilih tiga)</div>
              <div className="mt-2 space-y-1">
                {RISET.map(r => (
                  <label key={r.id} className={cx("flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm", riset.includes(r.id) ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50")}>
                    <input type="checkbox" checked={riset.includes(r.id)} onChange={e => setRiset(e.target.checked ? [...riset, r.id] : riset.filter(x => x !== r.id))} />
                    <span>{r.teks}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-sm font-semibold text-slate-800">Tahap 2 · Konsep</div>
              <div className="mt-2 space-y-2">
                <Field label="Sasaran"><select className={inputCls} value={konsep.sasaran} onChange={e => setKonsep({ ...konsep, sasaran: e.target.value })}>
                  <option value="">— pilih —</option>{SASARAN.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field>
                <Field label="Arah gaya"><select className={inputCls} value={konsep.gaya} onChange={e => setKonsep({ ...konsep, gaya: e.target.value })}>
                  <option value="">— pilih —</option>{KONSEP_GAYA.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field>
                <Field label="Media utama"><select className={inputCls} value={konsep.media} onChange={e => setKonsep({ ...konsep, media: e.target.value })}>
                  <option value="">— pilih —</option>{MEDIA.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field>
              </div>
            </div>
          </div>

          {/* Tahap 3 + pratinjau */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-sm font-semibold text-slate-800">Tahap 3 · Desain</div>
              <div className="mt-2 space-y-2">
                <div>
                  <div className="text-xs font-medium text-slate-600">Palet warna</div>
                  <div className="mt-1 space-y-1">
                    {PALET.map(x => (
                      <label key={x.id} className={cx("flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm", palet === x.id ? "bg-blue-50" : "hover:bg-slate-50")}>
                        <input type="radio" name="palet" checked={palet === x.id} onChange={() => setPalet(x.id)} />
                        <span className="flex gap-1">{x.warna.map((w, i) => <span key={i} className="inline-block h-4 w-6 rounded border border-slate-300" style={{ background: w }} />)}</span>
                        {x.label}
                      </label>
                    ))}
                  </div>
                </div>
                <Field label="Jenis huruf"><select className={inputCls} value={huruf} onChange={e => setHuruf(e.target.value)}>
                  <option value="">— pilih —</option>{HURUF.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field>
                <Field label="Ukuran kanvas"><select className={inputCls} value={kanvas} onChange={e => setKanvas(e.target.value)}>
                  <option value="">— pilih —</option>{KANVAS.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Pratinjau karya (model)</div>
              <div className="mt-2 grid place-items-center rounded-lg" style={{ background: p ? p.warna[2] : "#f1f5f9" }}>
                <div className="p-3 text-center" style={{ width: kv?.w ?? 180, height: kv?.h ?? 110, background: p ? p.warna[2] : "#e2e8f0", border: `1px solid ${p ? p.warna[0] : "#cbd5e1"}`, display: "grid", placeItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: h?.css ?? "Arial, sans-serif", color: p?.warna[0] ?? "#334155", fontWeight: 700, fontSize: kv?.id === "a3" ? 18 : 14 }}>
                      {brief.judul.split(" ").slice(0, 3).join(" ").toUpperCase()}
                    </div>
                    <div style={{ fontFamily: h?.css ?? "Arial, sans-serif", color: p?.warna[1] ?? "#475569", fontSize: 10, marginTop: 4 }}>
                      {brief.klien}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Kanvas: {kv?.label ?? "belum dipilih"} · palet: {p?.label ?? "belum dipilih"} · huruf: {h?.label ?? "belum dipilih"}
              </div>
            </div>
          </div>
        </div>

        {/* Tahap 4 & 5 */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-800">Tahap 4 · Uji & revisi</div>
            <div className="mt-1 text-xs text-slate-600">Temuan uji: {brief.kendala}. Pilih satu tindakan revisi yang paling sesuai.</div>
            <div className="mt-2 space-y-1">
              {REVISI.map(r => (
                <label key={r.id} className={cx("flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm", revisi === r.id ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50")}>
                  <input type="radio" name="revisi" checked={revisi === r.id} onChange={() => setRevisi(r.id)} />
                  <span>{r.teks}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-800">Tahap 5 · Presentasi (pilih empat bagian)</div>
            <div className="mt-2 space-y-1">
              {PRESENTASI.map(x => (
                <label key={x.id} className={cx("flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm", presentasi.includes(x.id) ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50")}>
                  <input type="checkbox" checked={presentasi.includes(x.id)} onChange={e => setPresentasi(e.target.checked ? [...presentasi, x.id] : presentasi.filter(y => y !== x.id))} />
                  <span>{x.teks}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <b>Ringkasan proyek (slidemu otomatis):</b>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>Brief: {brief.judul} — {brief.klien}</li>
            <li>Riset: {riset.length ? riset.map(r => RISET.find(x => x.id === r)?.teks).filter(Boolean).join(" · ") : "belum diisi"}</li>
            <li>Konsep: sasaran {pilihan(SASARAN, konsep.sasaran)} · gaya {pilihan(KONSEP_GAYA, konsep.gaya)} · media {pilihan(MEDIA, konsep.media)}</li>
            <li>Karya: kanvas {pilih1(KANVAS, kanvas)} · palet {pilih1(PALET, palet)} · huruf {pilih1(HURUF, huruf)}</li>
            <li>Revisi: {revisi ? REVISI.find(r => r.id === revisi)?.teks : "belum dipilih"}</li>
            <li>Presentasi: {presentasi.length ? presentasi.map(x => PRESENTASI.find(y => y.id === x)?.teks).filter(Boolean).join(" · ") : "belum diisi"}</li>
          </ol>
        </div>
      </Card>
    </LabShell>
  );
}

function pilih1(arr: { id: string; label: string }[], id: string) { return arr.find(x => x.id === id)?.label || "belum dipilih"; }
