// smoke-entry.tsx — uji "render" semua halaman tanpa peramban (deteksi crash saat merender).
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/lib";
import { Login, Pengaturan } from "../src/App";
import { SiswaDashboard, MateriList, MateriDetail, TugasSiswa, PortofolioSiswa } from "../src/siswa";
import { SimulasiHub, SimulasiDetail, SimulasiEmbed } from "../src/sims";
import { GuruDashboard, GuruKontrol, GuruMateri, GuruPenilaian, GuruSupervisi, GuruRekap } from "../src/guru";
import { AdminHome } from "../src/admin";

const halaman: [string, React.ReactElement][] = [
  ["Login", <Login />],
  ["Pengaturan (ganti password)", <Pengaturan />],
  ["SiswaDashboard", <SiswaDashboard />],
  ["MateriList", <MateriList />],
  ["MateriDetail", <MateriDetail />],
  ["TugasSiswa", <TugasSiswa />],
  ["PortofolioSiswa", <PortofolioSiswa />],
  ["SimulasiHub", <SimulasiHub />],
  ["SimulasiDetail", <SimulasiDetail />],
  ["Simulasi tipografi", <SimulasiEmbed id="sim-tipografi" />],
  ["Simulasi fotografi", <SimulasiEmbed id="sim-fotografi" />],
  ["Simulasi bitmap-vektor", <SimulasiEmbed id="sim-bitmap-vektor" />],
  ["Simulasi alur produksi", <SimulasiEmbed id="sim-alur-produksi" />],
  ["GuruDashboard", <GuruDashboard />],
  ["GuruKontrol", <GuruKontrol />],
  ["GuruMateri", <GuruMateri />],
  ["GuruPenilaian", <GuruPenilaian />],
  ["GuruSupervisi", <GuruSupervisi />],
  ["GuruRekap", <GuruRekap />],
  ["AdminHome", <AdminHome />],
];

let gagal = 0;
for (const [nama, el] of halaman) {
  try {
    const html = renderToString(
      <AuthProvider><MemoryRouter>{el}</MemoryRouter></AuthProvider>
    );
    console.log(`✅ ${nama.padEnd(26)} render OK (${html.length} karakter HTML)`);
  } catch (e: any) {
    gagal++;
    console.log(`❌ ${nama.padEnd(26)} GAGAL RENDER: ${e.message}`);
  }
}
console.log(gagal ? `\n${gagal} halaman gagal dirender.` : "\nSemua halaman berhasil dirender tanpa error.");
process.exit(gagal ? 1 : 0);
