// supervisi.js — Supervisi akademik yang dapat dikonfigurasi + dokumentasi pembelajaran per pertemuan.
//
// PENTING (integritas sumber):
//   Indikator di bawah ini disalin dari DOKUMEN SEKOLAH "Instrumen Supervisi Akademik Kurikulum Merdeka
//   dengan Pendekatan Deep Learning" (berkas SUP pada analisis sumber, docs/01 §4). Tidak ada indikator
//   yang dikarang: daftar awal = butir instrumen apa adanya (aspek C.1–C.4, termasuk 5C pada C.3).
//   Sekolah dapat menyuntingnya lewat panel Admin (tambah/ubah/nonaktifkan/urutan) bila instrumen resmi
//   direvisi, dan dapat memuat ulang daftar asli dengan tombol "muat ulang dari instrumen".
//
// Aturan akses yang ditegakkan server:
//   - Mengubah indikator (nuansa instrumen resmi) HANYA admin.
//   - Mengisi instrumen & dokumentasi: guru/admin. Peserta didik selalu 403.
import { db, getSetting, setSetting } from "./db.js";

export const SUMBER_INSTRUMEN = "Instrumen Supervisi Akademik Kurikulum Merdeka dengan Pendekatan Deep Learning (dokumen sekolah/SUP)";

// Skala penilaian mengikuti dokumen: 1–4.
export const SKALA_INSTRUMEN = [
  { nilai: 1, label: "Belum terlihat / perlu pendampingan" },
  { nilai: 2, label: "Cukup" },
  { nilai: 3, label: "Baik" },
  { nilai: 4, label: "Sangat baik" },
];

export const INDIKATOR_SEED = [
  // C.1 Perencanaan
  { kode: "C.1.1", aspek_kode: "C.1", aspek_nama: "Perencanaan", nama: "Tujuan pembelajaran jelas & terukur" },
  { kode: "C.1.2", aspek_kode: "C.1", aspek_nama: "Perencanaan", nama: "Materi sesuai CP/materi buku" },
  { kode: "C.1.3", aspek_kode: "C.1", aspek_nama: "Perencanaan", nama: "Strategi pembelajaran mendalam (Deep Learning)" },
  { kode: "C.1.4", aspek_kode: "C.1", aspek_nama: "Perencanaan", nama: "Diferensiasi kebutuhan murid" },
  // C.2 Pelaksanaan
  { kode: "C.2.1", aspek_kode: "C.2", aspek_nama: "Pelaksanaan", nama: "Pendahuluan & apersepsi" },
  { kode: "C.2.2", aspek_kode: "C.2", aspek_nama: "Pelaksanaan", nama: "Interaksi guru–murid" },
  { kode: "C.2.3", aspek_kode: "C.2", aspek_nama: "Pelaksanaan", nama: "Aktivitas murid dominan (student-centered)" },
  { kode: "C.2.4", aspek_kode: "C.2", aspek_nama: "Pelaksanaan", nama: "Kolaborasi antar murid" },
  { kode: "C.2.5", aspek_kode: "C.2", aspek_nama: "Pelaksanaan", nama: "Pemanfaatan teknologi & sumber belajar" },
  // C.3 Penerapan Deep Learning — 5C
  { kode: "C.3.1", aspek_kode: "C.3", aspek_nama: "Penerapan 5C (Deep Learning)", nama: "Critical Thinking" },
  { kode: "C.3.2", aspek_kode: "C.3", aspek_nama: "Penerapan 5C (Deep Learning)", nama: "Creativity" },
  { kode: "C.3.3", aspek_kode: "C.3", aspek_nama: "Penerapan 5C (Deep Learning)", nama: "Collaboration" },
  { kode: "C.3.4", aspek_kode: "C.3", aspek_nama: "Penerapan 5C (Deep Learning)", nama: "Communication" },
  { kode: "C.3.5", aspek_kode: "C.3", aspek_nama: "Penerapan 5C (Deep Learning)", nama: "Connection to Real Life" },
  // C.4 Asesmen dan Refleksi
  { kode: "C.4.1", aspek_kode: "C.4", aspek_nama: "Asesmen dan Refleksi", nama: "Asesmen formatif berjalan" },
  { kode: "C.4.2", aspek_kode: "C.4", aspek_nama: "Asesmen dan Refleksi", nama: "Asesmen sumatif/praktik" },
  { kode: "C.4.3", aspek_kode: "C.4", aspek_nama: "Asesmen dan Refleksi", nama: "Refleksi guru" },
  { kode: "C.4.4", aspek_kode: "C.4", aspek_nama: "Asesmen dan Refleksi", nama: "Refleksi murid" },
];

// Catatan instrumen (dikutip dari dokumen): integrasi program sekolah ke dalam modul & pelaksanaan.
export const CATATAN_INSTRUMEN =
  "Instrumen meminta program sekolah diintegrasikan ke dalam modul ajar dan pelaksanaan pembelajaran: Adiwiyata, Gapura Pancawaluya, Gerakan Indonesia ASRI, Literasi & Numerasi, S3, dan SimPel. Catatan supervisor serta rekomendasi tindak lanjut bagi guru/murid/sekolah ditandatangani supervisor pada dokumen tercetak.";

function pastikanIndikator() {
  const jumlah = db.prepare("SELECT COUNT(*) c FROM supervision_indicators").get().c;
  if (jumlah > 0) return { seeded: false, jumlah };
  isiUlangIndikator();
  return { seeded: true, jumlah: INDIKATOR_SEED.length };
}

export function isiUlangIndikator(oleh = null) {
  db.prepare("DELETE FROM supervision_indicators").run();
  const ins = db.prepare(`INSERT INTO supervision_indicators
    (kode, aspek_kode, aspek_nama, nama, deskriptor, urutan, aktif, sumber, diubah_oleh, diubah_pada)
    VALUES (?,?,?,?,?,?,1,?,?,datetime('now'))`);
  INDIKATOR_SEED.forEach((it, i) => ins.run(it.kode, it.aspek_kode, it.aspek_nama, it.nama, it.deskriptor || null, i + 1, SUMBER_INSTRUMEN, oleh));
  return INDIKATOR_SEED.length;
}

export function registerSupervisi(app, { auth, requireRole, log, ip }) {
  pastikanIndikator();

  const daftarIndikator = (hanyaAktif = false) =>
    db.prepare(`SELECT * FROM supervision_indicators ${hanyaAktif ? "WHERE aktif=1" : ""} ORDER BY urutan, id`).all();

  const grupIndikator = (rows) => {
    const grup = [];
    for (const r of rows) {
      let g = grup.find(x => x.aspek_kode === r.aspek_kode);
      if (!g) { g = { aspek_kode: r.aspek_kode, aspek_nama: r.aspek_nama, indikator: [] }; grup.push(g); }
      g.indikator.push(r);
    }
    return grup;
  };

  const hitungAspek = (skor, indikator) => {
    const perAspek = {};
    for (const ind of indikator) {
      const nilai = Number(skor?.[ind.kode]);
      if (!nilai) continue;
      perAspek[ind.aspek_kode] = perAspek[ind.aspek_kode] || { aspek_kode: ind.aspek_kode, aspek_nama: ind.aspek_nama, nilai: [], };
      perAspek[ind.aspek_kode].nilai.push(nilai);
    }
    return Object.values(perAspek).map(a => ({
      aspek_kode: a.aspek_kode, aspek_nama: a.aspek_nama,
      rata: Math.round((a.nilai.reduce((x, y) => x + y, 0) / a.nilai.length) * 100) / 100,
      jumlah_indikator: a.nilai.length,
    }));
  };

  /* ---------------- Indikator (dapat dikonfigurasi) ---------------- */
  app.get("/api/supervisi/indikator", auth, requireRole("guru", "admin"), (req, res) => {
    // admin dapat meminta daftar lengkap (termasuk indikator nonaktif) dengan ?semua=1
    const hanyaAktif = !(req.query.semua === "1" && req.user.role === "admin");
    const semua = daftarIndikator(hanyaAktif);
    res.json({
      indikator: grupIndikator(semua),
      totalAktif: daftarIndikator(true).length,
      skala: SKALA_INSTRUMEN,
      sumber: SUMBER_INSTRUMEN,
      catatanInstrumen: CATATAN_INSTRUMEN,
      dapatMenyunting: req.user.role === "admin",
    });
  });

  app.post("/api/supervisi/indikator", auth, requireRole("admin"), (req, res) => {
    const { kode, aspek_kode, aspek_nama, nama, deskriptor, urutan, sumber } = req.body || {};
    if (!kode || !nama) return res.status(400).json({ error: "Kode dan nama indikator wajib diisi." });
    if (!aspek_kode || !aspek_nama) return res.status(400).json({ error: "Aspek (kode & nama) wajib diisi agar indikator tergabung pada instrumen." });
    const ada = db.prepare("SELECT id FROM supervision_indicators WHERE kode=?").get(kode);
    if (ada) return res.status(400).json({ error: `Kode indikator ${kode} sudah dipakai.` });
    const info = db.prepare(`INSERT INTO supervision_indicators (kode, aspek_kode, aspek_nama, nama, deskriptor, urutan, aktif, sumber, diubah_oleh, diubah_pada)
      VALUES (?,?,?,?,?,?,1,?,?,datetime('now'))`)
      .run(kode, aspek_kode, aspek_nama, nama, deskriptor || null, Number(urutan) || 999, sumber || `Ditambahkan sekolah (bukan dari instrumen: ditandai terpisah)`, req.user.id);
    log(req.user, "ubah_indikator_supervisi", `indikator-${info.lastInsertRowid}`, { aksi: "tambah", kode }, ip(req));
    res.json({ ok: true, id: info.lastInsertRowid, pesan: "Indikator ditambahkan. Beri deskriptor & sumber yang jelas agar tetap dapat diaudit." });
  });

  app.put("/api/supervisi/indikator/:id", auth, requireRole("admin"), (req, res) => {
    const lama = db.prepare("SELECT * FROM supervision_indicators WHERE id=?").get(req.params.id);
    if (!lama) return res.status(404).json({ error: "Indikator tidak ditemukan." });
    const b = req.body || {};
    db.prepare(`UPDATE supervision_indicators SET kode=?, aspek_kode=?, aspek_nama=?, nama=?, deskriptor=?, urutan=?, aktif=?,
        sumber=COALESCE(?, sumber), diubah_oleh=?, diubah_pada=datetime('now') WHERE id=?`)
      .run(b.kode ?? lama.kode, b.aspek_kode ?? lama.aspek_kode, b.aspek_nama ?? lama.aspek_nama, b.nama ?? lama.nama,
        b.deskriptor ?? lama.deskriptor, b.urutan ?? lama.urutan, b.aktif === undefined ? lama.aktif : (b.aktif ? 1 : 0),
        b.sumber ?? null, req.user.id, lama.id);
    log(req.user, "ubah_indikator_supervisi", `indikator-${lama.id}`, { aksi: "ubah", kode: b.kode || lama.kode }, ip(req));
    res.json({ ok: true, pesan: "Indikator diperbarui. Perubahan berlaku untuk pengisian instrumen berikutnya; nilai lama tetap tersimpan." });
  });

  app.post("/api/supervisi/indikator/:id/nonaktif", auth, requireRole("admin"), (req, res) => {
    const lama = db.prepare("SELECT * FROM supervision_indicators WHERE id=?").get(req.params.id);
    if (!lama) return res.status(404).json({ error: "Indikator tidak ditemukan." });
    db.prepare("UPDATE supervision_indicators SET aktif=?, diubah_oleh=?, diubah_pada=datetime('now') WHERE id=?")
      .run(lama.aktif ? 0 : 1, req.user.id, lama.id);
    log(req.user, "ubah_indikator_supervisi", `indikator-${lama.id}`, { aksi: lama.aktif ? "nonaktif" : "aktifkan", kode: lama.kode }, ip(req));
    res.json({ ok: true, aktif: !lama.aktif, pesan: lama.aktif ? "Indikator dinonaktifkan (tidak muncul pada pengisian baru, riwayat lama tetap utuh)." : "Indikator diaktifkan kembali." });
  });

  app.post("/api/supervisi/indikator/muat-ulang", auth, requireRole("admin"), (req, res) => {
    const jumlah = isiUlangIndikator(req.user.id);
    log(req.user, "ubah_indikator_supervisi", "semua", { aksi: "muat-ulang-dari-instrumen", jumlah }, ip(req));
    res.json({ ok: true, jumlah, pesan: `Daftar indikator dimuat ulang dari instrumen dokumen sekolah (${jumlah} indikator). Catatan: riwayat penilaian lama tetap tersimpan.` });
  });

  // Daftar guru yang dapat dipilih sebagai subjek supervisi (supervisor boleh siapa saja yang berperan guru/admin).
  app.get("/api/supervisi/daftar-guru", auth, requireRole("guru", "admin"), (req, res) => {
    const rows = db.prepare(`SELECT u.id, u.nama_lengkap, u.nis_nip, u.username, c.nama AS nama_kelas
      FROM users u LEFT JOIN classes c ON c.id=u.kelas_id WHERE u.role='guru' AND u.aktif=1 ORDER BY u.nama_lengkap`).all();
    res.json({ guru: rows });
  });

  /* ---------------- Instrumen supervisi (pengisian) ---------------- */
  const lengkapiBaris = (row, indikator) => {
    let skor = {}; try { skor = JSON.parse(row.skor || "{}"); } catch { }
    return { ...row, skor, perAspek: hitungAspek(skor, indikator), rata: (() => {
      const n = Object.values(skor).filter(v => Number(v) > 0).map(Number);
      return n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 100) / 100 : null;
    })() };
  };

  app.get("/api/supervisi", auth, requireRole("guru", "admin"), (req, res) => {
    const indikator = daftarIndikator();
    const filter = [];
    const args = [];
    if (req.query.guru_id) { filter.push("s.guru_id=?"); args.push(req.query.guru_id); }
    if (req.query.kelas_id) { filter.push("s.kelas_id=?"); args.push(req.query.kelas_id); }
    if (req.query.status) { filter.push("s.status=?"); args.push(req.query.status); }
    const rows = db.prepare(`SELECT s.*, g.nama_lengkap AS nama_guru, c.nama AS nama_kelas FROM supervision s
      LEFT JOIN users g ON g.id=s.guru_id LEFT JOIN classes c ON c.id=s.kelas_id
      ${filter.length ? "WHERE " + filter.join(" AND ") : ""} ORDER BY s.id DESC LIMIT 200`).all(...args);
    res.json({ supervisi: rows.map(r => lengkapiBaris(r, indikator)) });
  });

  const validasiSkor = (skor) => {
    if (skor === undefined) return { ok: true, nilai: null };
    if (typeof skor !== "object" || Array.isArray(skor)) return { ok: false, error: "Skor harus berupa objek {kode_indikator: 1–4}." };
    const kodeSah = new Set(daftarIndikator(true).map(i => i.kode));
    const bersih = {};
    for (const [kode, nilai] of Object.entries(skor)) {
      if (!kodeSah.has(kode)) return { ok: false, error: `Indikator ${kode} tidak aktif/tidak dikenal pada instrumen.` };
      const n = Number(nilai);
      if (!(n >= 1 && n <= 4)) return { ok: false, error: `Skor indikator ${kode} harus 1–4 sesuai instrumen.` };
      bersih[kode] = n;
    }
    return { ok: true, nilai: bersih };
  };

  const simpan = (req, res, id = null) => {
    const b = req.body || {};
    const v = validasiSkor(b.skor);
    if (!v.ok) return res.status(400).json({ error: v.error });
    if (b.status && !["draft", "final"].includes(b.status)) return res.status(400).json({ error: "Status harus draft atau final." });
    const rekomendasi = typeof b.rekomendasi === "object" && b.rekomendasi ? JSON.stringify(b.rekomendasi) : (b.rekomendasi || null);
    if (id) {
      const lama = db.prepare("SELECT * FROM supervision WHERE id=?").get(id);
      if (!lama) return res.status(404).json({ error: "Catatan supervisi tidak ditemukan." });
      db.prepare(`UPDATE supervision SET guru_id=?, kelas_id=?, week_nomor=?, tanggal=?, skor=?, catatan=?, rekomendasi=?, tindak_lanjut=?, status=? WHERE id=?`)
        .run(b.guru_id ?? lama.guru_id, b.kelas_id ?? lama.kelas_id, b.week_nomor ?? lama.week_nomor, b.tanggal ?? lama.tanggal,
          v.nilai ? JSON.stringify(v.nilai) : lama.skor, b.catatan ?? lama.catatan, rekomendasi || lama.rekomendasi,
          b.tindak_lanjut ?? lama.tindak_lanjut, b.status ?? lama.status, lama.id);
      log(req.user, "simpan_supervisi", `supervisi-${lama.id}`, { aksi: "ubah", status: b.status || lama.status }, ip(req));
      return res.json({ ok: true, id: lama.id, pesan: "Catatan supervisi diperbarui." });
    }
    const info = db.prepare(`INSERT INTO supervision (guru_id, kelas_id, week_nomor, tanggal, skor, catatan, rekomendasi, tindak_lanjut, status)
      VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(b.guru_id ?? req.user.id, b.kelas_id ?? null, b.week_nomor ?? null, b.tanggal ?? new Date().toISOString().slice(0, 10),
        JSON.stringify(v.nilai || {}), b.catatan ?? null, rekomendasi, b.tindak_lanjut ?? null, b.status || "draft");
    log(req.user, "simpan_supervisi", `supervisi-${info.lastInsertRowid}`, { aksi: "baru", status: b.status || "draft" }, ip(req));
    res.json({ ok: true, id: info.lastInsertRowid, pesan: b.status === "final" ? "Instrumen disimpan sebagai final." : "Instrumen disimpan sebagai draft." });
  };

  app.post("/api/supervisi", auth, requireRole("guru", "admin"), (req, res) => simpan(req, res));
  app.put("/api/supervisi/:id", auth, requireRole("guru", "admin"), (req, res) => simpan(req, res, req.params.id));
  app.delete("/api/supervisi/:id", auth, requireRole("admin"), (req, res) => {
    const lama = db.prepare("SELECT id FROM supervision WHERE id=?").get(req.params.id);
    if (!lama) return res.status(404).json({ error: "Catatan supervisi tidak ditemukan." });
    db.prepare("DELETE FROM supervision WHERE id=?").run(lama.id);
    log(req.user, "hapus_supervisi", `supervisi-${lama.id}`, null, ip(req));
    res.json({ ok: true, pesan: "Catatan supervisi dihapus (admin)." });
  });

  app.get("/api/supervisi.csv", auth, requireRole("guru", "admin"), (req, res) => {
    const indikator = daftarIndikator();
    const rows = db.prepare(`SELECT s.*, g.nama_lengkap AS nama_guru, c.nama AS nama_kelas FROM supervision s
      LEFT JOIN users g ON g.id=s.guru_id LEFT JOIN classes c ON c.id=s.kelas_id ORDER BY s.id`).all();
    const aspek = [...new Set(indikator.map(i => i.aspek_kode))].sort();
    const head = ["id", "tanggal", "guru", "kelas", "minggu", "status",
      ...indikator.map(i => `${i.kode} ${i.nama}`), ...aspek.map(a => `rata_${a.replace(".", "")}`), "rata_total", "catatan", "tindak_lanjut"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    let csv = head.map(esc).join(";") + "\r\n";
    for (const r of rows) {
      const lengkap = lengkapiBaris(r, indikator);
      let rek = {}; try { rek = JSON.parse(r.rekomendasi || "{}"); } catch { }
      csv += [r.id, r.tanggal || r.created_at, r.nama_guru, r.nama_kelas, r.week_nomor, r.status,
        ...indikator.map(i => lengkap.skor[i.kode] ?? ""),
        ...aspek.map(a => (lengkap.perAspek.find(x => x.aspek_kode === a)?.rata ?? "")),
        lengkap.rata ?? "", `${r.catatan || ""}${rek.guru ? ` | Rekomendasi guru: ${rek.guru}` : ""}`, r.tindak_lanjut ?? ""].map(esc).join(";") + "\r\n";
    }
    log(req.user, "ekspor_supervisi", "csv", { baris: rows.length }, ip(req));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=rekap-supervisi.csv");
    res.send("\ufeff" + csv);
  });

  /* ---------------- Dokumentasi pembelajaran per pertemuan (72 pertemuan) ---------------- */
  const KUNCI_PERTEMUAN = { senin: "pertemuanSenin", rabu: "pertemuanRabu" };
  const bagianModul = (week, meeting) => {
    const w = db.prepare("SELECT payload FROM weeks WHERE nomor=?").get(week);
    if (!w) return null;
    let payload = {}; try { payload = JSON.parse(w.payload || "{}"); } catch { }
    return payload?.[KUNCI_PERTEMUAN[meeting]]?.modul || null;
  };

  // Isian usulan otomatis dari data kurikulum/modul — ditandai jelas sebagai usulan, bukan dokumen resmi.
  const usulanOtomatis = (week, meeting) => {
    const w = db.prepare("SELECT * FROM weeks WHERE nomor=?").get(week);
    let payload = {}; try { payload = JSON.parse(w?.payload || "{}"); } catch { }
    const m = bagianModul(week, meeting) || {};
    const hari = meeting === "senin" ? "Senin" : "Rabu";
    const daftar = (v) => Array.isArray(v) ? v : (v ? [String(v)] : []);
    // Struktur modul: aktivitas = { memahami: [...], mengaplikasi: [...], merefleksi: [...] }
    const tahap = (nama) => {
      const a = m.aktivitas;
      if (!a) return [];
      if (Array.isArray(a)) return a.filter(x => (x?.tahap || "").toLowerCase().startsWith(nama)).flatMap(x => x.langkah || []);
      return daftar(a[nama]);
    };
    const buktiOtomatis = [
      m.lkpd?.judul ? `LKPD: ${m.lkpd.judul}` : null,
      m.asesmenFormatif?.butir?.length ? `Kuis formatif ${m.asesmenFormatif.butir.length} butir (dinilai di server)` : null,
      m.tugas?.judul ? `Tugas: ${m.tugas.judul}${m.tugas.bentuk ? ` (${m.tugas.bentuk})` : ""}` : null,
      m.tugas?.luaran ? `Luaran tugas: ${m.tugas.luaran}` : null,
      payload?.asesmen ? `Asesmen mingguan: ${payload.asesmen}` : null,
      payload?.bukti ? `Bukti portofolio: ${payload.bukti}` : null,
    ].filter(Boolean);
    return {
      week_nomor: week, meeting_key: meeting, hari,
      tema: w?.tema || null,
      tujuan: JSON.stringify(daftar(m.tujuan?.length ? m.tujuan : payload.tujuan)),
      memahami: JSON.stringify(tahap("memahami")),
      mengaplikasi: JSON.stringify(tahap("mengaplikasi")),
      merefleksi: JSON.stringify(tahap("merefleksi")),
      // Prinsip pembelajaran mendalam TIDAK ditebak aplikasi: guru/supervisor yang menandai
      // prinsip mana yang benar-benar diterapkan pada pertemuan ini (daftar pilihan dari instrumen).
      prinsip: JSON.stringify([]),
      bukti: JSON.stringify(buktiOtomatis),
      catatan_observasi: "",
      refleksi_guru: "",
      tindak_lanjut: "",
      status: "usulan",
      sumber: "otomatis dari modul & kurikulum aplikasi",
      prinsipInstrumen: PRINSIP_MENDALAM,
      catatanInstrumen: CATATAN_INSTRUMEN,
    };
  };

  app.get("/api/supervisi/dokumentasi", auth, requireRole("guru", "admin"), (req, res) => {
    const minggu = Number(req.query.minggu || 0);
    const hari = req.query.hari;
    const rows = db.prepare(`SELECT d.*, u.nama_lengkap AS diubah_nama FROM meeting_docs d LEFT JOIN users u ON u.id=d.diubah_oleh
      ${minggu ? "WHERE d.week_nomor = ?" + (hari ? " AND d.meeting_key = ?" : "") : "ORDER BY d.week_nomor, d.meeting_key"}`)
      .all(...(minggu ? (hari ? [minggu, hari] : [minggu]) : []));
    const peta = Object.fromEntries(rows.map(r => [`${r.week_nomor}|${r.meeting_key}`, r]));
    const daftar = [];
    for (let w = 1; w <= 36; w++) {
      for (const h of ["senin", "rabu"]) {
        const kunci = `${w}|${h}`;
        const ada = peta[kunci];
        const u = usulanOtomatis(w, h);
        daftar.push({
          week_nomor: w, meeting_key: h, hari: u.hari, tema: u.tema,
          status: ada ? ada.status : "belum diisi",
          memiliki_dokumen: !!ada,
          lengkap: ada ? !!(ada.catatan_observasi || ada.refleksi_guru || ada.tindak_lanjut) : false,
          diubah_pada: ada?.diubah_pada || null, diubah_nama: ada?.diubah_nama || null,
          ringkasTujuan: JSON.parse(ada?.tujuan || u.tujuan || "[]")[0] || null,
        });
      }
    }
    const terisi = daftar.filter(d => d.memiliki_dokumen).length;
    res.json({ dokumentasi: minggu ? daftar.filter(d => d.week_nomor === minggu) : daftar, total: 72, terisi, prinsipMendalam: PRINSIP_MENDALAM, catatanInstrumen: CATATAN_INSTRUMEN });
  });

  app.get("/api/supervisi/dokumentasi/:minggu/:hari", auth, requireRole("guru", "admin"), (req, res) => {
    const week = Number(req.params.minggu), hari = String(req.params.hari).toLowerCase();
    if (!(week >= 1 && week <= 36) || !["senin", "rabu"].includes(hari)) return res.status(400).json({ error: "Minggu 1–36 dan hari senin/rabu." });
    const ada = db.prepare("SELECT d.*, u.nama_lengkap AS diubah_nama FROM meeting_docs d LEFT JOIN users u ON u.id=d.diubah_oleh WHERE d.week_nomor=? AND d.meeting_key=?").get(week, hari);
    const usulan = usulanOtomatis(week, hari);
    const uraikan = (v) => { try { const x = JSON.parse(v || "[]"); return Array.isArray(x) ? x : [String(x)]; } catch { return []; } };
    const ubahKeArray = (v) => Array.isArray(v) ? v : (typeof v === "string" && v.trim() ? v.split("\n").map(x => x.trim()).filter(Boolean) : []);
    res.json({
      minggu: week, hari,
      dokumen: ada ? {
        ...ada,
        tujuan: uraikan(ada.tujuan), memahami: uraikan(ada.memahami), mengaplikasi: uraikan(ada.mengaplikasi),
        merefleksi: uraikan(ada.merefleksi), prinsip: uraikan(ada.prinsip), bukti: uraikan(ada.bukti),
      } : null,
      usulan: { ...usulan, tujuan: uraikan(usulan.tujuan), memahami: uraikan(usulan.memahami), mengaplikasi: uraikan(usulan.mengaplikasi), merefleksi: uraikan(usulan.merefleksi), prinsip: uraikan(usulan.prinsip), bukti: uraikan(usulan.bukti) },
      prinsipMendalam: PRINSIP_MENDALAM,
      catatanInstrumen: CATATAN_INSTRUMEN,
      institusi: getSetting("institusi", null),
    });
  });

  app.put("/api/supervisi/dokumentasi/:minggu/:hari", auth, requireRole("guru", "admin"), (req, res) => {
    const week = Number(req.params.minggu), hari = String(req.params.hari).toLowerCase();
    if (!(week >= 1 && week <= 36) || !["senin", "rabu"].includes(hari)) return res.status(400).json({ error: "Minggu 1–36 dan hari senin/rabu." });
    const b = req.body || {};
    const keTeks = (v) => JSON.stringify(Array.isArray(v) ? v.filter(x => String(x).trim() !== "") : (v ? [String(v)] : []));
    const status = b.status === "final" ? "final" : "draf";
    db.prepare(`INSERT INTO meeting_docs (week_nomor, meeting_key, tujuan, memahami, mengaplikasi, merefleksi, prinsip, bukti,
        catatan_observasi, refleksi_guru, tindak_lanjut, status, diubah_oleh, diubah_pada)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
      ON CONFLICT(week_nomor, meeting_key) DO UPDATE SET
        tujuan=excluded.tujuan, memahami=excluded.memahami, mengaplikasi=excluded.mengaplikasi, merefleksi=excluded.merefleksi,
        prinsip=excluded.prinsip, bukti=excluded.bukti, catatan_observasi=excluded.catatan_observasi,
        refleksi_guru=excluded.refleksi_guru, tindak_lanjut=excluded.tindak_lanjut, status=excluded.status,
        diubah_oleh=excluded.diubah_oleh, diubah_pada=datetime('now')`)
      .run(week, hari, keTeks(b.tujuan), keTeks(b.memahami), keTeks(b.mengaplikasi), keTeks(b.merefleksi),
        keTeks(b.prinsip), keTeks(b.bukti), b.catatan_observasi || null, b.refleksi_guru || null, b.tindak_lanjut || null,
        status, req.user.id);
    log(req.user, "sunting_dokumentasi", `minggu-${week}-${hari}`, { status, prinsip: keTeks(b.prinsip).length }, ip(req));
    res.json({ ok: true, pesan: status === "final" ? "Dokumentasi pertemuan disimpan sebagai final." : "Dokumentasi pertemuan disimpan sebagai draf." });
  });

  app.get("/api/supervisi/dokumentasi.csv", auth, requireRole("guru", "admin"), (req, res) => {
    const rows = db.prepare("SELECT * FROM meeting_docs ORDER BY week_nomor, meeting_key").all();
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["minggu", "hari", "status", "tujuan", "memahami", "mengaplikasi", "merefleksi", "prinsip_mendalam", "bukti_aktivitas", "catatan_observasi", "refleksi_guru", "tindak_lanjut", "diubah_pada"];
    const bersih = (v) => { try { const x = JSON.parse(v || "[]"); return Array.isArray(x) ? x.join(" • ") : String(x); } catch { return v || ""; } };
    let csv = head.map(esc).join(";") + "\r\n";
    for (const r of rows) {
      csv += [r.week_nomor, r.meeting_key, r.status, bersih(r.tujuan), bersih(r.memahami), bersih(r.mengaplikasi), bersih(r.merefleksi),
        bersih(r.prinsip), bersih(r.bukti), r.catatan_observasi, r.refleksi_guru, r.tindak_lanjut, r.diubah_pada].map(esc).join(";") + "\r\n";
    }
    log(req.user, "ekspor_dokumentasi", "csv", { baris: rows.length }, ip(req));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=dokumentasi-pertemuan.csv");
    res.send("\ufeff" + csv);
  });
  app.get("/api/supervisi/:id", auth, requireRole("guru", "admin"), (req, res) => {
    const indikator = daftarIndikator();
    const row = db.prepare(`SELECT s.*, g.nama_lengkap AS nama_guru, g.nis_nip AS nip_guru, c.nama AS nama_kelas
      FROM supervision s LEFT JOIN users g ON g.id=s.guru_id LEFT JOIN classes c ON c.id=s.kelas_id WHERE s.id=?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: "Catatan supervisi tidak ditemukan." });
    const skor = lengkapiBaris(row, indikator).skor;
    const grup = grupIndikator(indikator).map(g => ({
      ...g,
      indikator: g.indikator.map(i => ({ ...i, skor: Number(skor[i.kode]) || null })),
      rata: (() => {
        const n = g.indikator.map(i => Number(skor[i.kode])).filter(Boolean);
        return n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 100) / 100 : null;
      })(),
    }));
    res.json({
      catatan: row, aspek: grup, skala: SKALA_INSTRUMEN, sumber: SUMBER_INSTRUMEN, catatanInstrumen: CATATAN_INSTRUMEN,
      institusi: getSetting("institusi", null), supervisor: getSetting("supervisor", null),
    });
  });
}

/* Prinsip pembelajaran mendalam yang dipakai instrumen (Deep Learning) — dipakai sebagai daftar pilihan,
   bukan indikator tambahan. Indikator resmi tetap C.1–C.4 di atas. */
export const PRINSIP_MENDALAM = [
  { kode: "berkesadaran", nama: "Mindful & berkesadaran (mindful learning)" },
  { kode: "bermakna", nama: "Pembelajaran bermakna (meaningful learning)" },
  { kode: "5c", nama: "5C: Critical Thinking, Creativity, Collaboration, Communication, Connection to Real Life" },
  { kode: "kontekstual", nama: "Kontekstual & menghubungkan dengan dunia nyata/industri DKV" },
  { kode: "diferensiasi", nama: "Diferensiasi sesuai kesiapan & minat murid" },
  { kode: "asesmen-formatif", nama: "Asesmen formatif berkelanjutan sebagai umpan balik" },
  { kode: "kolaborasi-tutor", nama: "Kolaborasi & tutor sebaya" },
  { kode: "teknologi", nama: "Pemanfaatan teknologi & sumber belajar digital/lokal" },
  { kode: "program-sekolah", nama: "Integrasi program sekolah (Adiwiyata, Gapura Pancawaluya, ASRI, Literasi & Numerasi, S3, SimPel)" },
];
