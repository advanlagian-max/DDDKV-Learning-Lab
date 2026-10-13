@echo off
REM ===============================================================
REM  DKV Learning Lab — menjalankan aplikasi di Windows
REM  Klik dua kali berkas ini. Biarkan jendela ini TERBUKA selama
REM  pembelajaran (menutup jendela = aplikasi berhenti).
REM ===============================================================
cd /d "%~dp0.."
title DKV Learning Lab — jangan tutup jendela ini
if "%PORT%"=="" set PORT=8080
echo.
echo   DKV Learning Lab
echo   Aplikasi  : http://localhost:%PORT%
echo   Untuk siswa: http://IP-KOMPUTER-INI:%PORT%  ^(lihat dengan perintah: ipconfig^)
echo.
echo   Tekan Ctrl+C atau tutup jendela ini untuk menghentikan aplikasi.
echo.
node server\index.js
echo.
echo Aplikasi berhenti. Tekan tombol apa saja untuk menutup.
pause >nul
