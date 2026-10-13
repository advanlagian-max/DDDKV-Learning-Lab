#!/usr/bin/env bash
# Cadangkan basis data ke deploy/cadangan (30 berkas terakhir). Aman dijalankan saat server hidup.
set -e
cd "$(dirname "$0")/.."
exec node tools/backup-db.mjs --ke "$(dirname "$0")/cadangan" --simpan 30
