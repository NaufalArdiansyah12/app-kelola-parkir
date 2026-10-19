# Alur Bisnis Parkir

## 1. Check-In (Petugas)

```mermaid
flowchart TD
    A[Petugas input plat nomor, jenis, area] --> B{Kendaraan sudah parkir?}
    B -- Ya --> E[ Tolak: kendaraan masih aktif]
    B -- Tidak --> C{Tarif jenis kendaraan ada?}
    C -- Tidak --> E2[Tolak: tarif belum diatur]
    C -- Ya --> D[Lock baris area]
    D --> F{terisi < kapasitas?}
    F -- Tidak --> E3[Tolak: area penuh]
    F -- Ya --> G[Simpan kendaraan bila baru]
    G --> H[Buat transaksi status masuk]
    H --> I[terisi + 1]
    I --> J[Cetak karcis masuk]
```

Implementasi: `TransaksiController@store` dalam `DB::transaction` + `lockForUpdate()`.

## 2. Check-Out (Petugas)

```mermaid
flowchart TD
    A[Petugas buka transaksi aktif] --> B[Tampilkan estimasi durasi & biaya]
    B --> C[Klik Bayar]
    C --> D[Lock transaksi & tarif]
    D --> E{Status masih masuk?}
    E -- Tidak --> F[Tolak: sudah dibayar]
    E -- Ya --> G[durasi = ceil selisih detik / 3600, min 1]
    G --> H[biaya = durasi x tarif per jam]
    H --> I[Update transaksi: keluar, durasi, biaya]
    I --> J[Lock area, terisi - 1]
    J --> K[Cetak nota pembayaran]
```

Implementasi: `TransaksiController@bayar` + `App\Support\TarifCalculator`.

## 3. Log Aktivitas

Login, logout, CRUD master, check-in, dan check-out dicatat ke `tb_log_aktivitas`
melalui `LogAktivitas::catat()`.
