# ParkirKu - Sistem Manajemen Parkir Bertingkat

Aplikasi manajemen parkir (UKK RPL Paket 2, kode KM25.4.1.1) dengan Laravel + Inertia.js + React.

## Fitur

- Login multi-role (admin, petugas, owner) dengan validasi status akun.
- Admin: CRUD user, tarif per jam, area parkir, kendaraan, serta log aktivitas.
- Petugas: check-in (validasi kuota area), cetak karcis, check-out dengan pembulatan durasi ke atas, cetak nota.
- Owner: rekap pendapatan dan volume transaksi per periode.

## Kebutuhan

- PHP 8.3+ (diuji 8.5), Composer
- Node.js 20+ (diuji 26)
- MySQL/MariaDB dengan database `db-kelola-parkir`

## Instalasi

```bash
composer install
cp .env.example .env
php artisan key:generate

# sesuaikan kredensial database di .env
php artisan db:seed

npm install
npm run build
php artisan serve
```

Buka `http://127.0.0.1:8000`.

### Impor database dari nol

```bash
mysql -u root < db_parkir.sql
```

File `db_parkir.sql` berisi DDL dan data seed.

## Akun Demo

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Petugas | `petugas` | `petugas123` |
| Owner | `owner` | `owner123` |

## Pengujian

```bash
php artisan test --compact
```

## Dokumentasi

- `docs/ERD.md` - struktur relasi database
- `docs/ALUR-BISNIS.md` - diagram alir check-in/check-out
- `docs/DOKUMENTASI-FUNGSI.md` - route, prosedur, dan keamanan
- `docs/LAPORAN-EVALUASI.md` - hasil uji dan rencana lanjutan
