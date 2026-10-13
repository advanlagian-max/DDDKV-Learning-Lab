# deploy/ — berkas bantu pemasangan di sekolah

Berkas di folder ini adalah alat bantu operasional. Panduan lengkapnya: **`docs/12-panduan-implementasi.md`**.

| Berkas | Untuk | Cara pakai |
|---|---|---|
| `jalankan-server.bat` | Windows | Klik dua kali (mode lokal/LAN). Jendela hitam harus tetap terbuka selama pembelajaran. |
| `jalankan-server-online.bat` | Windows | Mode **online** (untuk Cloudflare Tunnel + sematan Google Sites): menyetel `DKV_ONLINE=1`, `DKV_TRUST_PROXY=2`, `DKV_FRAME_ANCESTORS`. Panduan: `docs/15-panduan-windows-online.md` |
| `cek-komputer.bat` | Windows | Memeriksa kesiapan komputer (Node.js, dependensi, antarmuka, basis data, apakah aplikasi berjalan). Tidak mengubah apa pun. |
| `jalankan-server.sh` | Linux/macOS | `./deploy/jalankan-server.sh` |
| `cadangkan-basisdata.bat` | Windows | Klik dua kali (boleh dijalankan saat aplikasi hidup). Hasil: `deploy/cadangan/`. |
| `cadangkan-basisdata.sh` | Linux/macOS | `./deploy/cadangkan-basisdata.sh` |
| `dkv-learning-lab.service` | Linux (systemd) | Contoh unit agar aplikasi hidup otomatis saat komputer menyala. Salin ke `/etc/systemd/system/`, sunting jalurnya, lalu `sudo systemctl enable --now dkv-learning-lab`. |

## Sebelum menjalankan: sekali saja

```bash
cd app
npm install          # butuh internet sekali saja
npm run seed         # isi data demo (dilewati bila basis data sudah ada)
npm run build        # bangun antarmuka
```

## Catatan jujur tentang berkas di folder ini

- `jalankan-server.sh` dan `cadangkan-basisdata.sh` sudah diperiksa (sintaks `bash -n`) dan perintah Node di dalamnya
  sudah diuji nyata, tetapi **belum dijalankan di komputer sekolah**.
- `jalankan-server.bat` dan `dkv-learning-lab.service` **belum diuji** di lingkungan pembuatan aplikasi (sandbox Linux
  tanpa Windows/systemd). Periksa sekali di komputer tujuan sebelum dipakai untuk pembelajaran.
- Cadangan berisi data siswa (nilai, pekerjaan, log). Simpan di komputer/folder yang aksesnya dibatasi guru/admin.
