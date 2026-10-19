<?php

namespace Tests\Feature;

use App\Models\AreaParkir;
use App\Models\Kendaraan;
use App\Models\Tarif;
use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class RekapTest extends TestCase
{
    use DatabaseTransactions;

    public function test_guest_tidak_bisa_akses_rekap(): void
    {
        $this->get('/rekap')->assertRedirect('/login');
    }

    public function test_petugas_tidak_bisa_akses_rekap(): void
    {
        $petugas = User::factory()->make(['role' => 'petugas']);

        $this->actingAs($petugas)
            ->get('/rekap')
            ->assertForbidden();
    }

    public function test_owner_bisa_akses_halaman_rekap_transaksi_dengan_data_lengkap(): void
    {
        $owner = User::where('role', 'owner')->first()
            ?? User::factory()->create(['role' => 'owner']);

        $this->actingAs($owner)
            ->get('/rekap')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Rekap/Index')
                ->has('ringkasan')
                ->has('perPetugas')
                ->has('perJenis')
                ->has('transaksi')
                ->has('petugasOptions')
                ->has('jenisOptions')
                ->has('canExportPdf')
                ->has('maxPdfRecords')
                ->has('filters')
            );
    }

    public function test_owner_bisa_export_excel(): void
    {
        $owner = User::where('role', 'owner')->first()
            ?? User::factory()->create(['role' => 'owner']);

        $this->ensureSampleTransaction($owner);

        $response = $this->actingAs($owner)
            ->get('/rekap/export-excel?dari=2020-01-01&sampai=2030-12-31');

        $response->assertOk();
        $this->assertStringContainsString('spreadsheetml.sheet', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('.xlsx', (string) $response->headers->get('content-disposition'));
        $this->assertNotEmpty($response->streamedContent());
    }

    public function test_owner_bisa_export_pdf_jika_data_dalam_batas(): void
    {
        $owner = User::where('role', 'owner')->first()
            ?? User::factory()->create(['role' => 'owner']);

        $this->ensureSampleTransaction($owner);

        $response = $this->actingAs($owner)
            ->get('/rekap/export-pdf?dari=2020-01-01&sampai=2030-12-31');

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));
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
