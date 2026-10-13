// asesmen.js — Mesin asesmen 36 minggu: LKPD digital, kuis (otomatis + pembahasan), formatif, sumatif,
// praktik, dan proyek. Nilai otomatis HANYA untuk butir pilihan ganda; aspek proses, kreativitas, dan
// kualitas karya visual dinilai guru memakai rubrik dan wajib dikonfirmasi.
//
// Aturan penting yang ditegakkan server:
//  1. Kunci jawaban tidak pernah dikirim ke peramban sebelum siswa mengirim jawaban.
//  2. Permintaan menyimpan skor dari sisi siswa DIABAIKAN (tidak ada nilai otomatis untuk karya/proses).
//  3. Penilaian guru wajib menyertakan konfirmasi: true (rubrik sudah diperiksa).
//  4. Perubahan kunci/pembahasan butir wajib menyertakan konfirmasi: true dan dicatat pada log.
import { db, getControls } from "./db.js";

const TIPE_OTOMATIS = new Set(["kuis"]);
const TIPE_MANUAL = new Set(["lkpd", "formatif", "praktik", "proyek"]);
const MENU_PER_TIPE = { kuis: "kuis", sumatif: "kuis", lkpd: "lkpd", formatif: "lkpd", praktik: "lkpd", proyek: "lkpd" };
const TIPE_SAH = ["kuis", "lkpd", "formatif", "praktik", "proyek", "sumatif"];

export function registerAsesmen(app, { auth, requireRole, log, ip, activeMeeting }) {
  const ambilAsesmen = (id) => db.prepare("SELECT * FROM assessments WHERE id=?").get(id);
  const butirAman = (rows) => (rows || []).map(b => ({ soal: b.soal, opsi: b.opsi }));  // tanpa kunci/pembahasan

  function cekKunciMenu(user, asesmen) {
    const am = activeMeeting(user);
    const controls = am.kelas ? getControls(am.kelas.id, am.meeting) : {};
    const menu = MENU_PER_TIPE[asesmen.tipe];
    return { boleh: controls[menu] !== false, menu, am };
  }
  function nilaiOtomatis(butir, jawaban) {
    let benar = 0;
    const rincian = butir.map((b, i) => {
      const pilihan = Number(jawaban?.[i]);
      const ok = pilihan === b.kunci;
      if (ok) benar++;
      return { no: i + 1, pilihan: Number.isFinite(pilihan) ? pilihan : null, benar: ok, kunci: b.kunci, pembahasan: b.pembahasan || "" };
    });
    return { skor: butir.length ? Math.round((benar * 100) / butir.length) : 0, benar, total: butir.length, rincian };
  }
  const hitungRubrik = (rubrik, kriteria) => {
    let total = 0, bobot = 0;
    for (const r of rubrik) {
      const s = Number(kriteria?.[r.kriteria]);
      if (!(s >= 1 && s <= 4)) return { error: `Skor rubrik 1–4 wajib diisi untuk kriteria “${r.kriteria}”.` };
      total += s * r.bobot;
      bobot += r.bobot;
    }
    return { skor: bobot ? Math.round((total / (bobot * 4)) * 100) : 0 };
  };
  const kelasGuru = (user) => user.kelas_id || db.prepare("SELECT id FROM classes ORDER BY id LIMIT 1").get()?.id || null;
  const siswaKelas = (kelasId) => db.prepare("SELECT id, nama_lengkap, kelas_id FROM users WHERE role='siswa' AND kelas_id=? ORDER BY nama_lengkap").all(kelasId);

  /* ==================== SISI SISWA ==================== */
  // Rencana & status pengerjaan (kunci jawaban tidak dikirim sebelum dikerjakan)
  app.get("/api/asesmen/rencana", auth, (req, res) => {
    const minggu = Number(req.query.minggu || 0);
    const tipe = String(req.query.tipe || "");
    const ringkas = req.query.ringkas === "1";   // untuk rekap: tanpa butir & rubrik agar payload kecil
    let sql = "SELECT * FROM assessments WHERE 1=1";
    const args = [];
    if (minggu) { sql += " AND week_nomor=?"; args.push(minggu); }
    if (TIPE_SAH.includes(tipe)) { sql += " AND tipe=?"; args.push(tipe); }
    sql += " ORDER BY week_nomor, CASE meeting_key WHEN 'senin' THEN 0 WHEN 'rabu' THEN 1 ELSE 2 END, CASE tipe WHEN 'kuis' THEN 0 WHEN 'lkpd' THEN 1 WHEN 'formatif' THEN 2 WHEN 'praktik' THEN 3 WHEN 'proyek' THEN 4 ELSE 5 END";
    const rows = db.prepare(sql).all(...args);
    const kerja = req.user.role === "siswa"
      ? Object.fromEntries(db.prepare("SELECT * FROM assessment_work WHERE user_id=?").all(req.user.id).map(w => [w.assessment_id, w]))
      : {};
    const out = rows.map(a => {
      const w = kerja[a.id];
      const selesai = w && ["terkumpul", "dinilai", "perlu-revisi"].includes(w.status);
      return {
        id: a.id, minggu: a.week_nomor, pertemuan: a.meeting_key, tipe: a.tipe, judul: a.judul, deskripsi: a.deskripsi,
        bobot: a.bobot, kktp: a.kktp, kesempatanRevisi: a.kesempatan_revisi,
        nilaiOtomatis: a.nilai_otomatis === "true" || a.nilai_otomatis === "sebagian",
        perluKonfirmasiGuru: !!a.perlu_konfirmasi, jumlahButir: a.jumlah_butir,
        kriteria: ringkas ? [] : JSON.parse(a.kriteria || "[]"), rubrik: ringkas ? [] : JSON.parse(a.rubrik || "[]"),
        butir: (!ringkas && JSON.parse(a.butir || "null")) ? butirAman(JSON.parse(a.butir)) : null,
        remedial: ringkas ? null : a.remedial, pengayaan: ringkas ? null : a.pengayaan, luaran: a.luaran, sumber: ringkas ? [] : JSON.parse(a.sumber || "[]"),
        status: w?.status || "belum", revisi_ke: w?.revisi_ke || 0,
        skorTersimpan: w?.skor ?? null, diterima: !!selesai,
      };
    });
    res.json({ asesmen: out });
  });

  // Pekerjaan sendiri (termasuk pembahasan setelah dikirim)
  app.get("/api/asesmen/:id/kerja", auth, (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const w = db.prepare("SELECT * FROM assessment_work WHERE assessment_id=? AND user_id=?").get(a.id, req.user.id);
    const butir = JSON.parse(a.butir || "null");
    const bolehLihatPembahasan = !!w && ["terkumpul", "dinilai", "perlu-revisi"].includes(w.status);
    res.json({
      asesmen: { id: a.id, tipe: a.tipe, judul: a.judul, bobot: a.bobot, kktp: a.kktp, kesempatanRevisi: a.kesempatan_revisi, rubrik: JSON.parse(a.rubrik || "[]"), kriteria: JSON.parse(a.kriteria || "[]"), langkah: JSON.parse(a.langkah || "null") },
      // skor_rincian ikut dikirim agar siswa dapat MEMBACA PEMBAHASAN per butir setelah mengumpulkan
      // (sebelumnya hanya terkirim sekali di respons pengumpulan, sehingga pembahasan hilang saat halaman dimuat ulang).
      kerja: w ? { status: w.status, jawaban: JSON.parse(w.jawaban || "null"), skor: w.skor, skor_butir: w.skor_butir, total_butir: w.total_butir, revisi_ke: w.revisi_ke, komentar: w.komentar, dinilai_pada: w.dinilai_pada, skor_rincian: JSON.parse(w.skor_rincian || "null") } : null,
      butir: bolehLihatPembahasan && butir ? butir : butirAman(butir),
      pembahasanTerbuka: !!bolehLihatPembahasan,
    });
  });

  // Mengirim pekerjaan. Kuis/sumatif: dinilai otomatis. LKPD/formatif/praktik/proyek: menunggu guru.
  app.post("/api/asesmen/:id/kerja", auth, requireRole("siswa"), (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const { boleh, menu } = cekKunciMenu(req.user, a);
    if (!boleh) return res.status(403).json({ error: `Menu ${menu === "kuis" ? "Kuis/Asesmen" : "LKPD/Tugas"} belum dibuka oleh guru.`, locked: true });
    const lama = db.prepare("SELECT * FROM assessment_work WHERE assessment_id=? AND user_id=?").get(a.id, req.user.id);
    if (lama && ["terkumpul", "dinilai"].includes(lama.status))
      return res.status(400).json({ error: "Pekerjaan ini sudah terkumpul. Ajukan revisi bila guru memberi kesempatan revisi." });
    const butir = JSON.parse(a.butir || "null");
    const jawaban = req.body?.jawaban ?? null;
    const teks = typeof req.body?.teks === "string" ? req.body.teks.slice(0, 8000) : null;
    const tautan = typeof req.body?.tautan === "string" ? req.body.tautan.slice(0, 500) : null;
    const paket = JSON.stringify({ pilihan: butir ? jawaban : null, teks, tautan });
    let otomatis = null, skor = null, status = "terkumpul";
    if (TIPE_OTOMATIS.has(a.tipe) && butir) {
      otomatis = nilaiOtomatis(butir, jawaban);
      skor = otomatis.skor;                  // hanya pilihan ganda yang dinilai otomatis
      status = "dinilai";
    } else if (a.tipe === "sumatif" && butir) {
      otomatis = nilaiOtomatis(butir, jawaban);   // bagian PG saja; nilai akhir menunggu guru
      status = "terkumpul";
    }
    // Nilai kiriman siswa untuk skor DIABAIKAN (tidak dipakai) — bukti tidak ada nilai otomatis untuk karya.
    db.prepare(`INSERT INTO assessment_work (assessment_id, user_id, status, jawaban, skor_butir, total_butir, skor_rincian, skor, updated_at)
      VALUES (?,?,?,?,?,?,?,?,datetime('now'))
      ON CONFLICT(assessment_id, user_id) DO UPDATE SET status=excluded.status, jawaban=excluded.jawaban,
        skor_butir=excluded.skor_butir, total_butir=excluded.total_butir, skor_rincian=excluded.skor_rincian,
        skor=excluded.skor, updated_at=datetime('now')`)
      .run(a.id, req.user.id, status, paket, otomatis?.benar ?? null, otomatis?.total ?? null, otomatis ? JSON.stringify({ rincian: otomatis.rincian }) : null, skor);
    log(req.user, "kumpul_asesmen", a.id, { tipe: a.tipe, otomatis: skor }, ip(req));
    res.json({
      ok: true, status, skor,
      dinilaiOtomatis: TIPE_OTOMATIS.has(a.tipe),
      pesan: TIPE_OTOMATIS.has(a.tipe)
        ? `Kuis dinilai otomatis: ${skor}/100 (${otomatis.benar} dari ${otomatis.total} butir benar). Pembahasan terbuka di bawah.`
        : "Pekerjaan terkumpul. Nilai akan diisi guru memakai rubrik — tidak ada nilai otomatis untuk proses/karya.",
      rincian: otomatis?.rincian || null,
    });
  });

  // Revisi (kesempatan terbatas)
  app.post("/api/asesmen/:id/revisi", auth, requireRole("siswa"), (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const w = db.prepare("SELECT * FROM assessment_work WHERE assessment_id=? AND user_id=?").get(a.id, req.user.id);
    if (!w) return res.status(400).json({ error: "Belum ada pekerjaan yang dikumpulkan." });
    if ((w.revisi_ke || 0) >= a.kesempatan_revisi)
      return res.status(400).json({ error: `Kesempatan revisi sudah habis (${a.kesempatan_revisi} kali). Hubungi guru untuk remedial.` });
    const { boleh, menu } = cekKunciMenu(req.user, a);
    if (!boleh) return res.status(403).json({ error: `Menu ${menu === "kuis" ? "Kuis/Asesmen" : "LKPD/Tugas"} belum dibuka oleh guru.`, locked: true });
    const butir = JSON.parse(a.butir || "null");
    const jawaban = req.body?.jawaban ?? null;
    const teks = typeof req.body?.teks === "string" ? req.body.teks.slice(0, 8000) : null;
    const tautan = typeof req.body?.tautan === "string" ? req.body.tautan.slice(0, 500) : null;
    let otomatis = null, skor = null, status = "terkumpul";
    if (butir) { otomatis = nilaiOtomatis(butir, jawaban); skor = TIPE_OTOMATIS.has(a.tipe) ? otomatis.skor : null; status = TIPE_OTOMATIS.has(a.tipe) ? "dinilai" : "terkumpul"; }
    db.prepare(`UPDATE assessment_work SET status=?, jawaban=?, skor_butir=?, total_butir=?, skor_rincian=?, skor=?, komentar=NULL,
      revisi_ke=revisi_ke+1, updated_at=datetime('now') WHERE assessment_id=? AND user_id=?`)
      .run(status, JSON.stringify({ pilihan: butir ? jawaban : null, teks, tautan }), otomatis?.benar ?? null, otomatis?.total ?? null,
        otomatis ? JSON.stringify({ rincian: otomatis.rincian }) : null, skor, a.id, req.user.id);
    log(req.user, "revisi_asesmen", a.id, { revisi_ke: (w.revisi_ke || 0) + 1 }, ip(req));
    res.json({ ok: true, status, skor, revisi_ke: (w.revisi_ke || 0) + 1, sisaRevisi: a.kesempatan_revisi - ((w.revisi_ke || 0) + 1), rincian: otomatis?.rincian || null });
  });

  /* ==================== SISI GURU ==================== */
  app.get("/api/guru/asesmen", auth, requireRole("guru", "admin"), (req, res) => {
    const minggu = Number(req.query.minggu || 0);
    const tipe = String(req.query.tipe || "");
    let sql = "SELECT * FROM assessments WHERE 1=1";
    const args = [];
    if (minggu) { sql += " AND week_nomor=?"; args.push(minggu); }
    if (TIPE_SAH.includes(tipe)) { sql += " AND tipe=?"; args.push(tipe); }
    sql += " ORDER BY week_nomor, CASE meeting_key WHEN 'senin' THEN 0 WHEN 'rabu' THEN 1 ELSE 2 END, CASE tipe WHEN 'kuis' THEN 0 WHEN 'lkpd' THEN 1 WHEN 'formatif' THEN 2 WHEN 'praktik' THEN 3 WHEN 'proyek' THEN 4 ELSE 5 END";
    const kelasId = Number(req.query.kelas_id || 0) || kelasGuru(req.user);
    const jmlSiswa = siswaKelas(kelasId).length;
    const rows = db.prepare(sql).all(...args).map(a => {
      const stat = db.prepare(`SELECT
          SUM(CASE WHEN w.status IN ('terkumpul','dinilai','perlu-revisi') THEN 1 ELSE 0 END) AS terkumpul,
          SUM(CASE WHEN w.status='dinilai' THEN 1 ELSE 0 END) AS dinilai,
          SUM(CASE WHEN w.status='perlu-revisi' THEN 1 ELSE 0 END) AS perlu_revisi,
          ROUND(AVG(CASE WHEN w.skor IS NOT NULL THEN w.skor END),1) AS rata
        FROM assessment_work w JOIN users u ON u.id=w.user_id WHERE w.assessment_id=? AND u.kelas_id=?`).get(a.id, kelasId);
      return {
        id: a.id, minggu: a.week_nomor, pertemuan: a.meeting_key, tipe: a.tipe, judul: a.judul, deskripsi: a.deskripsi,
        bobot: a.bobot, kktp: a.kktp, kesempatanRevisi: a.kesempatan_revisi, nilaiOtomatis: a.nilai_otomatis,
        perluKonfirmasi: !!a.perlu_konfirmasi, jumlahButir: a.jumlah_butir, jumlahSiswa: jmlSiswa,
        terkumpul: stat?.terkumpul || 0, dinilai: stat?.dinilai || 0, perluRevisi: stat?.perlu_revisi || 0, rata: stat?.rata ?? null,
        remedial: a.remedial, pengayaan: a.pengayaan,
      };
    });
    res.json({ asesmen: rows, kelas_id: kelasId, jumlahSiswa: jmlSiswa });
  });

  app.get("/api/guru/asesmen/:id", auth, requireRole("guru", "admin"), (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const kelasId = Number(req.query.kelas_id || 0) || kelasGuru(req.user);
    const siswa = siswaKelas(kelasId);
    const kerja = Object.fromEntries(db.prepare("SELECT * FROM assessment_work WHERE assessment_id=?").all(a.id).map(w => [w.user_id, w]));
    res.json({
      asesmen: {
        id: a.id, minggu: a.week_nomor, pertemuan: a.meeting_key, tipe: a.tipe, judul: a.judul, deskripsi: a.deskripsi,
        bobot: a.bobot, kktp: a.kktp, kesempatanRevisi: a.kesempatan_revisi, nilaiOtomatis: a.nilai_otomatis,
        perluKonfirmasi: !!a.perlu_konfirmasi, kriteria: JSON.parse(a.kriteria || "[]"), rubrik: JSON.parse(a.rubrik || "[]"),
        butir: JSON.parse(a.butir || "null"), remedial: a.remedial, pengayaan: a.pengayaan,
        luaran: a.luaran, langkah: JSON.parse(a.langkah || "null"), sumber: JSON.parse(a.sumber || "[]"), diubah_pada: a.diubah_pada,
      },
      siswa: siswa.map(s => ({
        user_id: s.id, nama_lengkap: s.nama_lengkap,
        status: kerja[s.id]?.status || "belum",
        skor: kerja[s.id]?.skor ?? null, skor_butir: kerja[s.id]?.skor_butir ?? null, total_butir: kerja[s.id]?.total_butir ?? null,
        komentar: kerja[s.id]?.komentar || null, revisi_ke: kerja[s.id]?.revisi_ke || 0,
        jawaban: (() => { try { return JSON.parse(kerja[s.id]?.jawaban || "null"); } catch { return null; } })(),
        rincian: (() => { try { return JSON.parse(kerja[s.id]?.skor_rincian || "null"); } catch { return null; } })(),
        dinilai_pada: kerja[s.id]?.dinilai_pada || null,
      })),
      kelas_id: kelasId,
    });
  });

  // Guru menilai memakai rubrik — WAJIB konfirmasi (tidak ada nilai otomatis untuk karya/proses)
  app.post("/api/guru/asesmen/:id/nilai", auth, requireRole("guru", "admin"), (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const { user_id, kriteria, komentar, konfirmasi, skor_karya } = req.body || {};
    if (konfirmasi !== true)
      return res.status(400).json({ error: "Penilaian wajib dikonfirmasi guru: centang pernyataan bahwa rubrik sudah diperiksa bersama bukti karya/proses." });
    if (!user_id) return res.status(400).json({ error: "Siswa tidak ditentukan." });
    const rubrik = JSON.parse(a.rubrik || "[]");
    const w = db.prepare("SELECT * FROM assessment_work WHERE assessment_id=? AND user_id=?").get(a.id, user_id);
    if (!w) return res.status(400).json({ error: "Siswa ini belum mengumpulkan pekerjaan." });
    let skor, rincian = {};
    if (rubrik.length) {
      const h = hitungRubrik(rubrik, kriteria);
      if (h.error) return res.status(400).json({ error: h.error });
      rincian.kriteria = kriteria;
      let skorGuru = h.skor;
      if (a.tipe === "sumatif" && w.skor_butir !== null && w.total_butir) {
        const skorPg = Math.round((w.skor_butir * 100) / w.total_butir);
        const bobotPg = JSON.parse(a.kriteria || "[]")[0]?.bobot ?? 50;
        rincian.bagianOtomatis = skorPg;
        rincian.bagianGuru = skorGuru;
        skor = Math.round((skorPg * bobotPg + skorGuru * (100 - bobotPg)) / 100);
      } else {
        skor = skorGuru;
      }
    } else {
      // Tanpa rubrik: hanya boleh bila guru memberi skor manual dengan konfirmasi (mis. koreksi kuis)
      const s = Number(skor_karya);
      if (!(s >= 0 && s <= 100)) return res.status(400).json({ error: "Asesmen ini tidak punya rubrik; isi skor manual 0–100 beserta konfirmasi guru." });
      skor = Math.round(s);
      rincian.manual = true;
      rincian.sebelumnya = w.skor;
    }
    db.prepare(`UPDATE assessment_work SET status='dinilai', skor=?, skor_rincian=?, komentar=?, dinilai_oleh=?, dinilai_pada=datetime('now'), updated_at=datetime('now')
      WHERE assessment_id=? AND user_id=?`).run(skor, JSON.stringify(rincian), komentar || null, req.user.id, a.id, user_id);
    log(req.user, "nilai_asesmen", a.id, { user_id, skor, tipe: a.tipe, otomatis: a.nilai_otomatis }, ip(req));
    res.json({ ok: true, skor, rincian });
  });

  app.post("/api/guru/asesmen/:id/minta-revisi", auth, requireRole("guru", "admin"), (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const { user_id, komentar } = req.body || {};
    const w = db.prepare("SELECT * FROM assessment_work WHERE assessment_id=? AND user_id=?").get(a.id, user_id);
    if (!w) return res.status(400).json({ error: "Siswa ini belum mengumpulkan pekerjaan." });
    if ((w.revisi_ke || 0) >= a.kesempatan_revisi)
      return res.status(400).json({ error: `Kesempatan revisi sudah habis (${a.kesempatan_revisi} kali) — gunakan jalur remedial.` });
    db.prepare("UPDATE assessment_work SET status='perlu-revisi', komentar=?, updated_at=datetime('now') WHERE assessment_id=? AND user_id=?")
      .run(komentar || "Silakan perbaiki pekerjaan sesuai catatan guru.", a.id, user_id);
    log(req.user, "minta_revisi", a.id, { user_id }, ip(req));
    res.json({ ok: true, sisaRevisi: a.kesempatan_revisi - (w.revisi_ke || 0) });
  });

  // Buka ulang pekerjaan siswa untuk remedial (guru memberi kesempatan mengerjakan ulang setelah kesempatan revisi habis)
  app.post("/api/guru/asesmen/:id/buka-ulang", auth, requireRole("guru", "admin"), (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const { user_id, alasan } = req.body || {};
    const w = db.prepare("SELECT * FROM assessment_work WHERE assessment_id=? AND user_id=?").get(a.id, user_id);
    if (!w) return res.status(400).json({ error: "Siswa ini belum mengumpulkan pekerjaan." });
    db.prepare(`UPDATE assessment_work SET status='draf', skor=NULL, skor_butir=NULL, skor_rincian=NULL,
        dinilai_oleh=NULL, dinilai_pada=NULL, revisi_ke=COALESCE(revisi_ke,0)+1, komentar=?, updated_at=datetime('now')
      WHERE assessment_id=? AND user_id=?`)
      .run(alasan || "Dibuka ulang oleh guru sebagai tindak lanjut remedial.", a.id, user_id);
    log(req.user, "buka_ulang_asesmen", a.id, { user_id, skor_lama: w.skor, alasan: alasan || null }, ip(req));
    res.json({ ok: true, pesan: "Pekerjaan dibuka ulang. Siswa dapat mengerjakan ulang; nilai lama diganti setelah penilaian baru.", skor_lama: w.skor });
  });

  // Menyunting rubrik, bobot, KKTp, kesempatan revisi, dan butir kuis (kunci/pembahasan wajib konfirmasi)
  app.put("/api/guru/asesmen/:id/rubrik", auth, requireRole("guru", "admin"), (req, res) => {
    const a = ambilAsesmen(req.params.id);
    if (!a) return res.status(404).json({ error: "Asesmen tidak ditemukan." });
    const { bobot, kktp, kesempatanRevisi, rubrik, kriteria, butir, remedial, pengayaan, konfirmasi } = req.body || {};
    if (butir && konfirmasi !== true)
      return res.status(400).json({ error: "Mengubah butir/kunci/pembahasan kuis wajib dikonfirmasi guru (centang pernyataan pemeriksaan)." });
    if (rubrik) {
      if (!Array.isArray(rubrik) || rubrik.some(r => !r.kriteria || !(r.bobot >= 0) || !r.skor4 || !r.skor3 || !r.skor2 || !r.skor1))
        return res.status(400).json({ error: "Rubrik tidak sah: setiap kriteria memerlukan nama, bobot, dan deskriptor skor 4–1." });
      const total = rubrik.reduce((s, r) => s + Number(r.bobot || 0), 0);
      if (Math.abs(total - 100) > 0.01) return res.status(400).json({ error: `Total bobot kriteria harus 100 (saat ini ${total}).` });
    }
    if (butir) {
      if (!Array.isArray(butir) || butir.some(b => !b.soal || !Array.isArray(b.opsi) || b.opsi.length < 3 || !(b.kunci >= 0 && b.kunci < b.opsi.length)))
        return res.status(400).json({ error: "Butir tidak sah: butuh soal, minimal tiga opsi, dan kunci yang sesuai." });
    }
    db.prepare(`UPDATE assessments SET bobot=COALESCE(?,bobot), kktp=COALESCE(?,kktp), kesempatan_revisi=COALESCE(?,kesempatan_revisi),
        rubrik=COALESCE(?,rubrik), kriteria=COALESCE(?,kriteria), butir=COALESCE(?,butir), jumlah_butir=COALESCE(?,jumlah_butir),
        remedial=COALESCE(?,remedial), pengayaan=COALESCE(?,pengayaan), diubah_oleh=?, diubah_pada=datetime('now') WHERE id=?`)
      .run(bobot ?? null, kktp ?? null, kesempatanRevisi ?? null, rubrik ? JSON.stringify(rubrik) : null, kriteria ? JSON.stringify(kriteria) : null,
        butir ? JSON.stringify(butir) : null, butir ? butir.length : null, remedial ?? null, pengayaan ?? null, req.user.id, a.id);
    log(req.user, "ubah_rubrik", a.id, { bagian: Object.keys(req.body || {}).filter(k => k !== "konfirmasi") }, ip(req));
    res.json({ ok: true });
  });

  /* ==================== REKAP: per peserta didik, per minggu, per jenis asesmen ==================== */
  function dataRekap(kelasId, mingguFilter = 0) {
    const siswa = siswaKelas(kelasId);
    const asesmen = db.prepare("SELECT * FROM assessments" + (mingguFilter ? " WHERE week_nomor=?" : "") + " ORDER BY week_nomor")
      .all(...(mingguFilter ? [mingguFilter] : []));
    const kerja = db.prepare(`SELECT w.* FROM assessment_work w JOIN users u ON u.id=w.user_id WHERE u.kelas_id=?`).all(kelasId);
    const petaKerja = Object.fromEntries(kerja.map(w => [`${w.assessment_id}|${w.user_id}`, w]));
    const nilai = (aid, uid) => petaKerja[`${aid}|${uid}`] || null;
    const rataBerbobot = (daftar) => {
      let total = 0, bobot = 0;
      for (const { skor, bobot: b } of daftar) if (skor !== null && skor !== undefined) { total += skor * b; bobot += b; }
      return bobot ? Math.round((total / bobot) * 10) / 10 : null;
    };
    // per peserta didik
    const perSiswa = siswa.map(s => {
      const perMinggu = [];
      for (let m = 1; m <= 36; m++) {
        const daftar = asesmen.filter(a => a.week_nomor === m).map(a => ({ skor: nilai(a.id, s.id)?.skor ?? null, bobot: a.bobot, tipe: a.tipe }));
        const dinilai = daftar.filter(d => d.skor !== null).length;
        perMinggu.push({ minggu: m, skor: rataBerbobot(daftar), dinilai, total: daftar.length });
      }
      const perJenis = {};
      for (const t of TIPE_SAH) {
        const daftar = asesmen.filter(a => a.tipe === t).map(a => ({ skor: nilai(a.id, s.id)?.skor ?? null, bobot: a.bobot }));
        const dinilai = daftar.filter(d => d.skor !== null);
        perJenis[t] = { rata: dinilai.length ? Math.round((dinilai.reduce((x, d) => x + d.skor, 0) / dinilai.length) * 10) / 10 : null, dinilai: dinilai.length, total: daftar.length };
      }
      const semua = asesmen.map(a => ({ skor: nilai(a.id, s.id)?.skor ?? null, bobot: a.bobot }));
      const remedial = asesmen.filter(a => { const w = nilai(a.id, s.id); return w && w.skor !== null && w.skor < a.kktp; })
        .map(a => ({ id: a.id, minggu: a.week_nomor, tipe: a.tipe, judul: a.judul, skor: nilai(a.id, s.id).skor, kktp: a.kktp }));
      const menunggu = asesmen.filter(a => { const w = nilai(a.id, s.id); return w && w.status === "terkumpul"; }).length;
      return { user_id: s.id, nama_lengkap: s.nama_lengkap, nilai_akhir: rataBerbobot(semua), per_minggu: perMinggu, per_jenis: perJenis, remedial, menungguPenilaian: menunggu };
    });
    // per minggu
    const perMinggu = [];
    for (let m = 1; m <= 36; m++) {
      const daftarAsesmen = asesmen.filter(a => a.week_nomor === m);
      const rows = perSiswa.map(s => ({ user_id: s.user_id, nama_lengkap: s.nama_lengkap, skor: s.per_minggu[m - 1].skor, dinilai: s.per_minggu[m - 1].dinilai, total: s.per_minggu[m - 1].total }));
      const adaNilai = rows.filter(r => r.skor !== null);
      perMinggu.push({
        minggu: m, jumlahAsesmen: daftarAsesmen.length, bobotTotal: daftarAsesmen.reduce((x, a) => x + a.bobot, 0),
        rata_kelas: adaNilai.length ? Math.round((adaNilai.reduce((x, r) => x + r.skor, 0) / adaNilai.length) * 10) / 10 : null,
        siswa: rows,
        tipe: [...new Set(daftarAsesmen.map(a => a.tipe))],
      });
    }
    // per jenis asesmen
    const perJenis = TIPE_SAH.map(t => {
      const daftarAsesmen = asesmen.filter(a => a.tipe === t);
      const rows = perSiswa.map(s => ({
        user_id: s.user_id, nama_lengkap: s.nama_lengkap, rata: s.per_jenis[t].rata,
        dinilai: s.per_jenis[t].dinilai, total: s.per_jenis[t].total,
        diBawahKktp: daftarAsesmen.filter(a => { const w = nilai(a.id, s.user_id); return w && w.skor !== null && w.skor < a.kktp; }).length,
      }));
      const ada = rows.filter(r => r.rata !== null);
      return {
        tipe: t, jumlahAsesmen: daftarAsesmen.length, rata_kelas: ada.length ? Math.round((ada.reduce((x, r) => x + r.rata, 0) / ada.length) * 10) / 10 : null,
        siswa: rows,
      };
    });
    return { perSiswa, perMinggu, perJenis };
  }

  app.get("/api/guru/rekap-asesmen", auth, requireRole("guru", "admin"), (req, res) => {
    const kelasId = Number(req.query.kelas_id || 0) || kelasGuru(req.user);
    const data = dataRekap(kelasId, Number(req.query.minggu || 0));
    res.json({ kelas_id: kelasId, mode: req.query.mode || "semua", ...data });
  });

  app.get("/api/guru/rekap-asesmen.csv", auth, requireRole("guru", "admin"), (req, res) => {
    const kelasId = Number(req.query.kelas_id || 0) || kelasGuru(req.user);
    const mode = String(req.query.mode || "siswa");
    const { perSiswa, perMinggu, perJenis } = dataRekap(kelasId);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    let csv = "";
    if (mode === "minggu") {
      csv = "minggu;jumlah_asesmen;rata_kelas;" + perSiswa.map(s => esc(s.nama_lengkap)).join(";") + "\n";
      for (const r of perMinggu) csv += [r.minggu, r.jumlahAsesmen, r.rata_kelas ?? "", ...r.siswa.map(s => s.skor ?? "")].join(";") + "\n";
    } else if (mode === "jenis") {
      csv = "jenis_asesmen;jumlah_asesmen;rata_kelas;" + perSiswa.map(s => esc(s.nama_lengkap)).join(";") + "\n";
      for (const r of perJenis) csv += [r.tipe, r.jumlahAsesmen, r.rata_kelas ?? "", ...r.siswa.map(s => s.rata ?? "")].join(";") + "\n";
    } else {
      csv = "nama;nilai_akhir;menunggu_penilaian;jumlah_remedial;" + TIPE_SAH.map(t => `rata_${t}`).join(";") + "\n";
      for (const s of perSiswa) csv += [esc(s.nama_lengkap), s.nilai_akhir ?? "", s.menungguPenilaian, s.remedial.length, ...TIPE_SAH.map(t => s.per_jenis[t].rata ?? "")].join(";") + "\n";
    }
    log(req.user, "ekspor_rekap_asesmen", `mode-${mode}`, null, ip(req));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=rekap-asesmen-${mode}.csv`);
    res.send(csv);
  });

  // Daftar siswa yang perlu remedial (di bawah KKTp) — per kelas, semua tipe
  app.get("/api/guru/asesmen-remedial", auth, requireRole("guru", "admin"), (req, res) => {
    const kelasId = Number(req.query.kelas_id || 0) || kelasGuru(req.user);
    const { perSiswa } = dataRekap(kelasId);
    const daftar = [];
    for (const s of perSiswa) for (const r of s.remedial) daftar.push({ nama_lengkap: s.nama_lengkap, user_id: s.user_id, ...r });
    const pengayaan = perSiswa.map(s => ({
      user_id: s.user_id, nama_lengkap: s.nama_lengkap,
      layakPengayaan: s.nilai_akhir !== null && s.nilai_akhir >= 88 && s.remedial.length === 0,
      nilai_akhir: s.nilai_akhir,
    }));
    res.json({ remedial: daftar, pengayaan, kelas_id: kelasId });
  });
}
