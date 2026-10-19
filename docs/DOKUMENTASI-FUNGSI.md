# Dokumentasi Prosedur & Fungsi

## Stack

- Laravel 13 (PHP 8.5), MySQL
- Inertia.js 3 + React 19
- Tailwind CSS 4, Vite 8

## Peta Route

| Method | URI | Nama | Akses | Handler |
|---|---|---|---|---|
| GET | `/login` | `login` | Guest | `AuthController@create` |
| POST | `/login` | - | Guest (throttle 10/menit) | `AuthController@store` |
| POST | `/logout` | `logout` | Semua role | `AuthController@destroy` |
| GET | `/dashboard` | `dashboard` | Semua role | `DashboardController` |
| GET | `/users` | `users.index` | Admin | `UserController@index` |
| POST | `/users` | `users.store` | Admin | `UserController@store` |
| PUT | `/users/{user}` | `users.update` | Admin | `UserController@update` |
| DELETE | `/users/{user}` | `users.destroy` | Admin | `UserController@destroy` |
| GET | `/tarif` | `tarif.index` | Admin | `TarifController@index` |
| POST | `/tarif` | `tarif.store` | Admin | `TarifController@store` |
| PUT | `/tarif/{tarif}` | `tarif.update` | Admin | `TarifController@update` |
| DELETE | `/tarif/{tarif}` | `tarif.destroy` | Admin | `TarifController@destroy` |
| GET | `/area` | `area.index` | Admin | `AreaController@index` |
| POST | `/area` | `area.store` | Admin | `AreaController@store` |
| PUT | `/area/{area}` | `area.update` | Admin | `AreaController@update` |
| DELETE | `/area/{area}` | `area.destroy` | Admin | `AreaController@destroy` |
| GET | `/kendaraan` | `kendaraan.index` | Admin | `KendaraanController@index` |
| POST | `/kendaraan` | `kendaraan.store` | Admin | `KendaraanController@store` |
| PUT | `/kendaraan/{kendaraan}` | `kendaraan.update` | Admin | `KendaraanController@update` |
| DELETE | `/kendaraan/{kendaraan}` | `kendaraan.destroy` | Admin | `KendaraanController@destroy` |
| GET | `/log-aktivitas` | `log.index` | Admin | `LogController@index` |
| GET | `/transaksi` | `transaksi.index` | Petugas | `TransaksiController@index` |
| GET | `/transaksi/masuk` | `transaksi.create` | Petugas | `TransaksiController@create` |
| POST | `/transaksi/masuk` | `transaksi.store` | Petugas | `TransaksiController@store` |
| GET | `/transaksi/{transaksi}/checkout` | `transaksi.checkout` | Petugas | `TransaksiController@checkout` |
| POST | `/transaksi/{transaksi}/bayar` | `transaksi.bayar` | Petugas | `TransaksiController@bayar` |
| GET | `/transaksi/{transaksi}/struk-masuk` | `transaksi.struk-masuk` | Auth | `TransaksiController@strukMasuk` |
| GET | `/transaksi/{transaksi}/struk-keluar` | `transaksi.struk-keluar` | Auth | `TransaksiController@strukKeluar` |
| GET | `/rekap` | `rekap.index` | Owner | `RekapController@index` |

## Fungsi Inti

### `App\Support\TarifCalculator`

```php
TarifCalculator::durasiJam(CarbonInterface $masuk, CarbonInterface $keluar): int
// ceil(selisih detik / 3600), minimal 1

TarifCalculator::biaya(int $durasiJam, int|float|string $tarifPerJam): int
// durasiJam * tarifPerJam
```

### `App\Models\LogAktivitas::catat(int $idUser, string $aktivitas): void`

Menyimpan audit trail (dipotong 100 karakter sesuai kolom).

### `TransaksiController@store`

1. Validasi input.
2. Tolak bila plat masih punya transaksi `masuk`.
3. Pastikan tarif jenis kendaraan tersedia.
4. Transaksi DB: lock area → cek kapasitas → buat kendaraan bila baru → buat transaksi → `terisi + 1`.
5. Redirect ke struk masuk.

### `TransaksiController@bayar`

1. Transaksi DB: lock baris transaksi.
2. Tolak bila status bukan `masuk`.
3. Hitung durasi & biaya.
4. Update status `keluar`, lalu `terisi - 1` pada area.
5. Redirect ke nota pembayaran.

## Keamanan

- Password di-hash Bcrypt melalui cast `hashed`.
- Semua query memakai Eloquent/parameter binding.
- Otorisasi route memakai middleware `role:...` (`EnsureRole`).
- Login dibatasi 10 percobaan/menit.
- Akun nonaktif (`status_aktif = 0`) tidak dapat login.

## Pagination

Diterapkan pada user, tarif, area, kendaraan, log aktivitas, parkir aktif, dan detail rekap (10-20 baris per halaman).
