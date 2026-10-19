# Laporan Evaluasi

## Ringkasan Uji Fungsi

Pengujian dilakukan pada 19 Oktober 2026 menggunakan data seed dan alur HTTP nyata
(login, CRUD, check-in, check-out, rekap).

| No | Fungsi | Skenario | Hasil |
|---|---|---|---|
| 1 | Login | Kredensial benar | Lulus |
| 2 | Login | Akun nonaktif / password salah | Lulus (ditolak) |
| 3 | RBAC | Petugas membuka `/users` | Lulus (403) |
| 4 | CRUD User | Tambah petugas baru | Lulus |
| 5 | CRUD Tarif | Tambah tarif duplikat | Lulus (validasi) |
| 6 | CRUD Area | Tambah area baru | Lulus |
| 7 | CRUD Kendaraan | Tambah plat baru (auto uppercase) | Lulus |
| 8 | Check-In | Plat belum terdaftar | Lulus (kendaraan dibuat otomatis) |
| 9 | Check-In | Plat masih aktif | Lulus (ditolak) |
| 10 | Check-In | Area penuh | Lulus (ditolak) |
| 11 | Check-Out | Perhitungan durasi & biaya | Lulus (1 jam, Rp 5.000) |
| 12 | Check-Out | Area `terisi` berkurang | Lulus (kembali 0) |
| 13 | Struk | Karcis masuk & nota tampil | Lulus |
| 14 | Log Aktivitas | Login/CRUD/transaksi tercatat | Lulus |
| 15 | Rekap | Filter tanggal & agregasi | Lulus |
| 16 | Pagination | Master & laporan | Lulus |
| 17 | Unit test | `TarifCalculator` (4 test, 11 assertion) | Lulus |

Perintah verifikasi:

```bash
php artisan test --compact
vendor/bin/pint --test
npm run build
```

## Status Bug

Tidak ada bug terbuka pada alur utama.

## Batasan yang Diketahui

1. Skema tabel dibuat manual (sesuai PRD), sehingga aplikasi tidak memakai migration.
   Perubahan skema dilakukan langsung di database/`db_parkir.sql`.
2. Struk dicetak memakai dialog print browser (bukan driver printer thermal langsung).
3. Laporan hanya menampilkan transaksi berstatus `keluar` (pendapatan terealisasi).
4. Belum ada fitur denda karcis hilang dan tarif progresif per 24 jam.

## Rencana Pengembangan

1. Migrasi skema ke Laravel migration + factory untuk data uji otomatis.
2. Integrasi printer thermal 58/80 mm (ESC/POS) dan cetak langsung.
3. Tarif progresif harian serta denda kehilangan karcis.
4. Ekspor laporan ke PDF/Excel.
5. Dashboard grafik tren pendapatan per jam dan per area.
