<?php

namespace Tests\Feature;

use App\Models\Transaksi;
use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
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
}
