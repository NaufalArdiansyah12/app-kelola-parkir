<?php

namespace Database\Seeders;

use App\Models\AreaParkir;
use App\Models\Kendaraan;
use App\Models\Tarif;
use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(['username' => 'admin'], [
            'nama_lengkap' => 'Administrator',
            'password' => 'admin123',
            'role' => 'admin',
            'status_aktif' => true,
        ]);

        User::firstOrCreate(['username' => 'petugas'], [
            'nama_lengkap' => 'Petugas Pos',
            'password' => 'petugas123',
            'role' => 'petugas',
            'status_aktif' => true,
        ]);

        User::firstOrCreate(['username' => 'owner'], [
            'nama_lengkap' => 'Pemilik Usaha',
            'password' => 'owner123',
            'role' => 'owner',
            'status_aktif' => true,
        ]);

        foreach (['motor' => 2000, 'mobil' => 5000, 'lainnya' => 8000] as $jenis => $tarif) {
            Tarif::firstOrCreate(['jenis_kendaraan' => $jenis], ['tarif_per_jam' => $tarif]);
        }

        foreach ([
            ['nama_area' => 'Zona A - Mobil', 'kapasitas' => 20],
            ['nama_area' => 'Zona B - Mobil', 'kapasitas' => 15],
            ['nama_area' => 'Zona Motor', 'kapasitas' => 50],
        ] as $area) {
            AreaParkir::firstOrCreate(['nama_area' => $area['nama_area']], [...$area, 'terisi' => 0]);
        }

        foreach ([
            ['plat_nomor' => 'B 1234 ABC', 'jenis_kendaraan' => 'mobil', 'warna' => 'Hitam', 'pemilik' => 'Budi'],
            ['plat_nomor' => 'B 5678 DEF', 'jenis_kendaraan' => 'motor', 'warna' => 'Merah', 'pemilik' => 'Sari'],
            ['plat_nomor' => 'D 9012 GHI', 'jenis_kendaraan' => 'mobil', 'warna' => 'Putih', 'pemilik' => 'Andi'],
        ] as $kendaraan) {
            Kendaraan::firstOrCreate(['plat_nomor' => $kendaraan['plat_nomor']], [...$kendaraan, 'id_user' => $admin->id_user]);
        }

        // ponytail: data contoh agar dashboard/rekap tidak kosong saat demo; hapus blok ini untuk produksi
        $this->seedContohTransaksi();
    }

    private function seedContohTransaksi(): void
    {
        if (Transaksi::exists()) {
            return;
        }

        $petugas = User::where('username', 'petugas')->firstOrFail();
        $tarif = Tarif::pluck('id_tarif', 'jenis_kendaraan');
        $area = AreaParkir::pluck('id_area', 'nama_area');

        $contoh = [
            ['B 1234 ABC', 'mobil', 'Zona A - Mobil', 2, 5],
            ['B 5678 DEF', 'motor', 'Zona Motor', 3, 1],
            ['D 9012 GHI', 'mobil', 'Zona B - Mobil', 4, 3],
            ['B 1234 ABC', 'mobil', 'Zona A - Mobil', 5, 2],
            ['B 5678 DEF', 'motor', 'Zona Motor', 6, 4],
            ['D 9012 GHI', 'mobil', 'Zona A - Mobil', 1, 8],
            ['B 1234 ABC', 'mobil', 'Zona B - Mobil', 0, 6],
        ];

        foreach ($contoh as [$plat, $jenis, $namaArea, $hariLalu, $jam]) {
            $kendaraan = Kendaraan::where('plat_nomor', $plat)->firstOrFail();
            $masuk = now()->subDays($hariLalu)->setTime(8, 0);

            Transaksi::create([
                'id_kendaraan' => $kendaraan->id_kendaraan,
                'waktu_masuk' => $masuk,
                'waktu_keluar' => $masuk->copy()->addHours($jam),
                'id_tarif' => $tarif[$jenis],
                'durasi_jam' => $jam,
                'biaya_total' => $jam * (int) Tarif::find($tarif[$jenis])->tarif_per_jam,
                'status' => 'keluar',
                'id_user' => $petugas->id_user,
                'id_area' => $area[$namaArea],
            ]);
        }

        foreach ([['B 5678 DEF', 'motor', 'Zona Motor', 2], ['D 9012 GHI', 'mobil', 'Zona A - Mobil', 1]] as [$plat, $jenis, $namaArea, $jamLalu]) {
            $kendaraan = Kendaraan::where('plat_nomor', $plat)->firstOrFail();
            $masuk = now()->subHours($jamLalu);

            Transaksi::create([
                'id_kendaraan' => $kendaraan->id_kendaraan,
                'waktu_masuk' => $masuk,
                'id_tarif' => $tarif[$jenis],
                'status' => 'masuk',
                'id_user' => $petugas->id_user,
                'id_area' => $area[$namaArea],
            ]);

            AreaParkir::whereKey($area[$namaArea])->increment('terisi');
        }
    }
}
