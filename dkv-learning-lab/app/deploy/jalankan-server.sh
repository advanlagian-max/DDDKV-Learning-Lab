#!/usr/bin/env bash
# Menjalankan DKV Learning Lab di Linux/macOS.
# Pakai:  ./deploy/jalankan-server.sh        (hentikan dengan Ctrl+C)
set -e
cd "$(dirname "$0")/.."
export PORT="${PORT:-8080}"
echo "DKV Learning Lab → http://localhost:${PORT}  (untuk siswa: http://IP-KOMPUTER:${PORT})"
exec node server/index.js
