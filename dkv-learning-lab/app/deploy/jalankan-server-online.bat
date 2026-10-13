@echo off
REM ============================================================
REM  DKV Learning Lab — MODE ONLINE (Windows)
REM  Klik dua kali berkas ini untuk menjalankan aplikasi dengan
REM  pengaturan aman untuk diakses dari internet + disematkan
REM  di Google Sites. Jendela ini harus TETAP TERBUKA.
REM  Panduan lengkap: docs\15-panduan-windows-online.md
REM ============================================================
setlocal
cd /d "%~dp0.."
title DKV Learning Lab (mode online) - jangan tutup jendela ini

REM ---------- Setelan (sunting bila perlu) ----------
set PORT=8080
set HOST=0.0.0.0
set DKV_ONLINE=1
REM  DKV_TRUST_PROXY: 2 bila memakai Cloudflare Tunnel, 1 bila memakai Caddy/nginx di komputer ini
set DKV_TRUST_PROXY=2
REM  Asal yang boleh menyematkan aplikasi (Google Sites). Ganti/tambah sesuai domain situs sekolah.
set DKV_FRAME_ANCESTORS=https://sites.google.com https://*.googleusercontent.com
REM --------------------------------------------------

where node >nul 2>nul
if errorlevel 1 goto :tanpa_node

if not exist node_modules goto :tanpa_dependensi
if not exist dist\index.html goto :tanpa_build
if not exist data\dkv.db echo Catatan: basis data belum ada - akan dibuat otomatis sekarang.

echo.
echo   DKV Learning Lab - MODE ONLINE
echo   ---------------------------------------------
echo   Alamat di komputer ini : http://localhost:%PORT%
echo   Alamat untuk siswa     : lihat langkah cloudflared
echo                            pada docs\15-panduan-windows-online.md
echo.
echo   Pengerasan aktif: X-Frame-Options/CSP + HSTS (DKV_ONLINE=1)
echo   Penyematan dari     : %DKV_FRAME_ANCESTORS%
echo.
echo   Tekan Ctrl+C atau tutup jendela ini untuk menghentikan aplikasi.
echo.
node server\index.js
echo.
echo Aplikasi berhenti. Tekan tombol apa saja untuk menutup.
pause >nul
exit /b 0

:tanpa_node
echo.
echo   [X] Node.js BELUM terpasang di komputer ini.
echo.
echo   1. Buka https://nodejs.org  lalu unduh versi LTS.
echo   2. Pasang dengan pengaturan bawaan (Next - Next - Install).
echo   3. Tutup jendela ini, buka Command Prompt BARU, lalu jalankan lagi berkas ini.
echo.
pause >nul
exit /b 1

:tanpa_dependensi
echo.
echo   [X] Dependensi belum dipasang.
echo   Buka Command Prompt di folder ini lalu jalankan:  npm install
echo   Setelah selesai, klik dua kali berkas ini lagi.
echo.
pause >nul
exit /b 1

:tanpa_build
echo.
echo   [X] Antarmuka (dist) belum dibangun.
echo   Jalankan di Command Prompt:  npm run build
echo   Setelah selesai, klik dua kali berkas ini lagi.
echo.
pause >nul
exit /b 1
