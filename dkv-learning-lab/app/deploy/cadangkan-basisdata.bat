@echo off
REM Cadangkan basis data DKV Learning Lab (jalankan kapan saja; server boleh tetap hidup).
REM Hasil ada di folder deploy\cadangan (30 berkas terakhir disimpan).
cd /d "%~dp0.."
node tools\backup-db.mjs --ke "%~dp0cadangan" --simpan 30
echo.
echo Cadangan selesai. Tekan tombol apa saja untuk menutup.
pause >nul
