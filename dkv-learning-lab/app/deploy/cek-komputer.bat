@echo off
REM ============================================================
REM  Cek kesiapan komputer untuk DKV Learning Lab (Windows)
REM  Klik dua kali. Tidak mengubah apa pun - hanya memeriksa.
REM ============================================================
setlocal
cd /d "%~dp0.."
title Cek kesiapan komputer - DKV Learning Lab

echo.
echo   === CEK KESIAPAN KOMPUTER ===
echo   Folder aplikasi: %CD%
echo.

set ADA_NODE=0
where node >nul 2>nul
if %errorlevel%==0 set ADA_NODE=1
if %ADA_NODE%==0 goto :node_belum

for /f "delims=" %%v in ('node -v') do echo   [OK]     Node.js versi %%v
for /f "delims=" %%v in ('npm -v') do echo   [OK]     npm versi %%v
goto :lanjut

:node_belum
echo   [KURANG] Node.js BELUM terpasang.
echo            Unduh versi LTS di https://nodejs.org lalu pasang (Next - Next - Install).
goto :akhir

:lanjut
if exist node_modules goto :dep_ada
echo   [KURANG] Dependensi belum dipasang. Jalankan: npm install
goto :cek_build
:dep_ada
echo   [OK]     Dependensi (node_modules) sudah ada

:cek_build
if exist dist\index.html goto :build_ada
echo   [KURANG] Antarmuka belum dibangun. Jalankan: npm run build
goto :cek_db
:build_ada
echo   [OK]     Antarmuka (dist) siap

:cek_db
if exist data\dkv.db goto :db_ada
echo   [INFO]   Basis data belum ada - akan dibuat otomatis saat aplikasi dijalankan pertama kali
goto :cek_jalan
:db_ada
echo   [OK]     Basis data data\dkv.db ada

:cek_jalan
echo.
echo   === APAKAH APLIKASI SEDANG BERJALAN? ===
curl -s -m 3 http://localhost:8080/api/health >nul 2>nul
if %errorlevel%==0 goto :jalan
echo   [INFO]   Aplikasi belum berjalan. Nyalakan dengan deploy\jalankan-server-online.bat
goto :akhir
:jalan
echo   [OK]     Aplikasi menjawab di http://localhost:8080
curl -s -m 3 http://localhost:8080/api/health
echo.

:akhir
echo.
echo   Selesai. Tekan tombol apa saja untuk menutup.
pause >nul
exit /b 0
