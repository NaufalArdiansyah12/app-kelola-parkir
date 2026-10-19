# ERD - Sistem Manajemen Parkir

Database: `db-kelola-parkir` (MySQL/MariaDB)

```mermaid
erDiagram
    tb_user ||--o{ tb_kendaraan : "mencatat"
    tb_user ||--o{ tb_transaksi : "melayani"
    tb_user ||--o{ tb_log_aktivitas : "menghasilkan"
    tb_kendaraan ||--o{ tb_transaksi : "parkir"
    tb_tarif ||--o{ tb_transaksi : "dikenakan"
    tb_area_parkir ||--o{ tb_transaksi : "ditempati"

    tb_user {
        int id_user PK
        varchar nama_lengkap
        varchar username UK
        varchar password
        enum role "admin|petugas|owner"
        tinyint status_aktif
    }

    tb_tarif {
        int id_tarif PK
        enum jenis_kendaraan "motor|mobil|lainnya"
        decimal tarif_per_jam
    }

    tb_area_parkir {
        int id_area PK
        varchar nama_area
        int kapasitas
        int terisi
    }

    tb_kendaraan {
        int id_kendaraan PK
        varchar plat_nomor "INDEX"
        varchar jenis_kendaraan
        varchar warna
        varchar pemilik
        int id_user FK
    }

    tb_transaksi {
        int id_parkir PK
        int id_kendaraan FK
        datetime waktu_masuk "INDEX"
        datetime waktu_keluar
        int id_tarif FK
        int durasi_jam
        decimal biaya_total
        enum status "masuk|keluar"
        int id_user FK
        int id_area FK
    }

    tb_log_aktivitas {
        int id_log PK
        int id_user FK
        varchar aktivitas
        datetime waktu_aktivitas
    }
```

## Catatan

- `tb_transaksi.id_user` menyimpan petugas yang memproses check-in.
- `tb_kendaraan.id_user` menyimpan user yang mendaftarkan kendaraan.
- Index `plat_nomor` dan `waktu_masuk` sudah tersedia untuk pencarian dan laporan.
