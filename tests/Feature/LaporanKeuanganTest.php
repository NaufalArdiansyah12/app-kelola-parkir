<?php

namespace Tests\Feature;

use App\Models\AreaParkir;
use App\Models\Kendaraan;
use App\Models\Tarif;
use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class LaporanKeuanganTest extends TestCase
{
    use DatabaseTransactions;

    public function test_guest_tidak_bisa_akses_laporan_keuangan(): void
    {
        $this->get('/laporan-keuangan')->assertRedirect('/login');
    }

    public function test_petugas_tidak_bisa_akses_laporan_keuangan(): void
    {
        $petugas = User::factory()->make(['role' => 'petugas']);

        $this->actingAs($petugas)
            ->get('/laporan-keuangan')
            ->assertForbidden();
    }

    public function test_admin_bisa_akses_halaman_laporan_keuangan(): void
    {
        $admin = User::where('role', 'admin')->first()
            ?? User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/laporan-keuangan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('LaporanKeuangan/Index')
                ->has('ringkasan')
                ->has('perPetugas')
                ->has('perJenis')
                ->has('transaksi')
                ->has('canExportPdf')
                ->has('maxPdfRecords')
            );
    }

    public function test_redirect_log_aktivitas_ke_laporan_keuangan(): void
    {
        $admin = User::where('role', 'admin')->first()
            ?? User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/log-aktivitas')
            ->assertRedirect('/laporan-keuangan');
    }

    public function test_admin_bisa_export_excel(): void
    {
        $admin = User::where('role', 'admin')->first()
            ?? User::factory()->create(['role' => 'admin']);

        $this->ensureSampleTransaction($admin);

        $response = $this->actingAs($admin)
            ->get('/laporan-keuangan/export-excel?dari=2020-01-01&sampai=2030-12-31');

        $response->assertOk();
        $this->assertStringContainsString('spreadsheetml.sheet', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('.xlsx', (string) $response->headers->get('content-disposition'));
        $this->assertNotEmpty($response->streamedContent());
    }

    public function test_admin_bisa_export_pdf_jika_data_dalam_batas(): void
    {
        $admin = User::where('role', 'admin')->first()
            ?? User::factory()->create(['role' => 'admin']);

        $this->ensureSampleTransaction($admin);

        $response = $this->actingAs($admin)
            ->get('/laporan-keuangan/export-pdf?dari=2020-01-01&sampai=2030-12-31');

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));
    }

    public function test_export_pdf_ditolak_dan_excel_bisa_jika_data_lebih_dari_1000(): void
    {
        $admin = User::where('role', 'admin')->first()
            ?? User::factory()->create(['role' => 'admin']);

        $this->ensureSampleTransaction($admin);

        $area = AreaParkir::first();
        $tarif = Tarif::first();
        $kendaraan = Kendaraan::first();
        $now = now();

        $rows = [];
        for ($i = 0; $i < 1005; $i++) {
            $rows[] = [
                'id_kendaraan' => $kendaraan->id_kendaraan,
                'id_area' => $area->id_area,
                'id_tarif' => $tarif->id_tarif,
                'id_user' => $admin->id_user,
                'waktu_masuk' => $now,
                'waktu_keluar' => $now,
                'durasi_jam' => 1,
                'biaya_total' => 2000,
                'status' => 'keluar',
            ];
        }
        Transaksi::insert($rows);

        // PDF harus ditolak dan redirect kembali dengan session error
        $pdfResponse = $this->actingAs($admin)
            ->from('/laporan-keuangan')
            ->get('/laporan-keuangan/export-pdf?dari=2020-01-01&sampai=2030-12-31');

        $pdfResponse->assertRedirect('/laporan-keuangan');
        $pdfResponse->assertSessionHas('error');

        // Excel harus tetap berhasil
        $excelResponse = $this->actingAs($admin)
            ->get('/laporan-keuangan/export-excel?dari=2020-01-01&sampai=2030-12-31');

        $excelResponse->assertOk();
        $this->assertStringContainsString('spreadsheetml.sheet', (string) $excelResponse->headers->get('content-type'));
        $this->assertStringContainsString('.xlsx', (string) $excelResponse->headers->get('content-disposition'));
        $this->assertNotEmpty($excelResponse->streamedContent());
    }

    private function ensureSampleTransaction(User $user): void
    {
        if (Transaksi::where('status', 'keluar')->exists()) {
            return;
        }

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area Test', 'kapasitas' => 10, 'terisi' => 0]);
        $tarif = Tarif::first() ?? Tarif::create(['jenis_kendaraan' => 'mobil', 'tarif_per_jam' => 5000]);
        $kendaraan = Kendaraan::first() ?? Kendaraan::create(['plat_nomor' => 'B 9999 TEST', 'jenis_kendaraan' => 'mobil', 'id_user' => $user->id_user]);

        Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $user->id_user,
            'waktu_masuk' => now()->subHours(2),
            'waktu_keluar' => now(),
            'durasi_jam' => 2,
            'biaya_total' => 10000,
            'status' => 'keluar',
        ]);
    }
}
