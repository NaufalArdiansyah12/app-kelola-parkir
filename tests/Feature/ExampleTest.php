<?php

namespace Tests\Feature;

use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_bisa_tambah_tarif_jenis_baru(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (! $admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $jenis = 'trek_'.uniqid();

        $response = $this->actingAs($admin)->post('/tarif', [
            'jenis_kendaraan' => $jenis,
            'tarif_per_jam' => 200000,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('tb_tarif', [
            'jenis_kendaraan' => $jenis,
            'tarif_per_jam' => 200000,
        ]);
    }

    public function test_petugas_bisa_akses_halaman_parkir_aktif_dengan_denah(): void
    {
        $user = User::where('role', 'petugas')->first();
        if (! $user) {
            $user = User::factory()->create(['role' => 'petugas']);
        }

        $response = $this->actingAs($user)->get('/transaksi');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Transaksi/Index')
            ->has('aktif')
            ->has('area')
            ->has('area.0.slots')
        );
    }

    public function test_petugas_bisa_akses_halaman_checkout(): void
    {
        $user = User::where('role', 'petugas')->first();
        if (! $user) {
            $user = User::factory()->create(['role' => 'petugas']);
        }

        $response = $this->actingAs($user)->get('/transaksi/keluar');
        $response->assertOk();

        $transaksi = Transaksi::where('status', 'masuk')->first();
        if ($transaksi) {
            $responseId = $this->actingAs($user)->get('/transaksi/keluar?id='.$transaksi->id_parkir);
            $responseId->assertOk();

            $responseSearch = $this->actingAs($user)->get('/transaksi/keluar?search='.$transaksi->id_parkir);
            $responseSearch->assertOk();
        }
    }

    public function test_dashboard_bisa_diakses_oleh_admin(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('statistik')
            ->has('area')
            ->has('chart')
            ->has('chartPendapatan')
            ->has('petugasOptions')
            ->has('chartFilters')
            ->has('tambahan')
        );
    }

    public function test_dashboard_grafik_pendapatan_bisa_difilter_periode_dan_petugas(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);
        $petugas = User::where('role', 'petugas')->first() ?? User::factory()->create(['role' => 'petugas']);

        $response = $this->actingAs($admin)->get("/dashboard?periode=bulan&petugas={$petugas->id_user}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('chartFilters.periode', 'bulan')
            ->where('chartFilters.petugas', (string) $petugas->id_user)
            ->has('chartPendapatan')
        );
    }

    public function test_dashboard_bisa_diakses_oleh_petugas(): void
    {
        $petugas = User::where('role', 'petugas')->first() ?? User::factory()->create(['role' => 'petugas']);

        $response = $this->actingAs($petugas)->get('/dashboard');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('statistik')
            ->has('area')
        );
    }

    public function test_admin_bisa_akses_halaman_kendaraan_dan_area_parkir_dengan_transaksi_terakhir(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/kendaraan');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Kendaraan/Index')
            ->has('aktif')
            ->has('area')
            ->has('transaksiTerakhir')
            ->has('stats')
        );
    }

    public function test_admin_bisa_tambah_kendaraan_dan_check_in_ke_area(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);
        $area = \App\Models\AreaParkir::first();

        $plat = 'B'.rand(1000, 9999).'ADM';

        $response = $this->actingAs($admin)->post('/kendaraan', [
            'plat_nomor' => $plat,
            'jenis_kendaraan' => 'motor',
            'warna' => 'Hitam',
            'pemilik' => 'Naufal',
            'id_area' => $area->id_area,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('tb_kendaraan', [
            'plat_nomor' => $plat,
            'jenis_kendaraan' => 'motor',
        ]);
        $this->assertDatabaseHas('tb_transaksi', [
            'id_area' => $area->id_area,
            'status' => 'masuk',
        ]);
    }
}
