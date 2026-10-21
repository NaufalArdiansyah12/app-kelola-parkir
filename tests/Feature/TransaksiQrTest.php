<?php

namespace Tests\Feature;

use App\Models\AreaParkir;
use App\Models\Kendaraan;
use App\Models\Tarif;
use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TransaksiQrTest extends TestCase
{
    use DatabaseTransactions;

    public function test_petugas_bisa_buka_struk_masuk(): void
    {
        $petugas = User::where('role', 'petugas')->first()
            ?? User::factory()->create(['role' => 'petugas']);

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 0]);
        $tarif = Tarif::where('jenis_kendaraan', 'motor')->first()
            ?? Tarif::create(['jenis_kendaraan' => 'motor', 'tarif_per_jam' => 2000]);
        $kendaraan = Kendaraan::first()
            ?? Kendaraan::create(['plat_nomor' => 'B 1111 QR', 'jenis_kendaraan' => 'motor', 'id_user' => $petugas->id_user]);

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $petugas->id_user,
            'waktu_masuk' => now(),
            'status' => 'masuk',
            'nomor_slot' => 1,
        ]);

        $response = $this->actingAs($petugas)->get("/transaksi/{$transaksi->id_parkir}/struk-masuk");

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Struk/Masuk')
                ->where('transaksi.id_parkir', $transaksi->id_parkir)
            );
    }

    public function test_petugas_bisa_scan_qr_tiket_pada_pos_keluar(): void
    {
        $petugas = User::where('role', 'petugas')->first()
            ?? User::factory()->create(['role' => 'petugas']);

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 0]);
        $tarif = Tarif::where('jenis_kendaraan', 'mobil')->first()
            ?? Tarif::create(['jenis_kendaraan' => 'mobil', 'tarif_per_jam' => 5000]);
        $kendaraan = Kendaraan::create([
            'plat_nomor' => 'B 8888 SCAN',
            'jenis_kendaraan' => 'mobil',
            'id_user' => $petugas->id_user,
        ]);

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $petugas->id_user,
            'waktu_masuk' => now()->subHours(2),
            'status' => 'masuk',
            'nomor_slot' => 2,
        ]);

        // Scan dengan format #ID (seperti yang dicetak di QR code)
        $response = $this->actingAs($petugas)->get("/transaksi/keluar?search=%23{$transaksi->id_parkir}");

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Transaksi/Checkout')
                ->where('selected.id_parkir', $transaksi->id_parkir)
                ->where('selected.plat_nomor', 'B 8888 SCAN')
            );
    }

    public function test_petugas_bisa_membuat_snap_token(): void
    {
        $petugas = User::where('role', 'petugas')->first()
            ?? User::factory()->create(['role' => 'petugas']);

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 0]);
        $tarif = Tarif::where('jenis_kendaraan', 'motor')->first()
            ?? Tarif::create(['jenis_kendaraan' => 'motor', 'tarif_per_jam' => 2000]);
        $kendaraan = Kendaraan::first()
            ?? Kendaraan::create(['plat_nomor' => 'B 7777 MID', 'jenis_kendaraan' => 'motor', 'id_user' => $petugas->id_user]);

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $petugas->id_user,
            'waktu_masuk' => now()->subHour(),
            'status' => 'masuk',
            'nomor_slot' => 3,
        ]);

        $response = $this->actingAs($petugas)->postJson("/transaksi/{$transaksi->id_parkir}/snap-token");

        $response->assertOk()
            ->assertJsonStructure([
                'snap_token',
                'order_id',
                'gross_amount',
            ]);

        $transaksi->refresh();
        $this->assertSame('midtrans', $transaksi->metode_pembayaran);
        $this->assertNotEmpty($transaksi->snap_token);
        $this->assertNotEmpty($transaksi->midtrans_order_id);
    }

    public function test_petugas_bisa_membuat_qris_bi_snap(): void
    {
        $petugas = User::where('role', 'petugas')->first()
            ?? User::factory()->create(['role' => 'petugas']);

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 0]);
        $tarif = Tarif::where('jenis_kendaraan', 'motor')->first()
            ?? Tarif::create(['jenis_kendaraan' => 'motor', 'tarif_per_jam' => 2000]);
        $kendaraan = Kendaraan::first()
            ?? Kendaraan::create(['plat_nomor' => 'B 3333 SNAP', 'jenis_kendaraan' => 'motor', 'id_user' => $petugas->id_user]);

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $petugas->id_user,
            'waktu_masuk' => now()->subHour(),
            'status' => 'masuk',
            'nomor_slot' => 6,
        ]);

        $response = $this->actingAs($petugas)->postJson("/transaksi/{$transaksi->id_parkir}/midtrans-qris");

        $response->assertOk()
            ->assertJsonStructure([
                'order_id',
                'gross_amount',
                'qr_string',
                'snap_token',
            ]);

        $transaksi->refresh();
        $this->assertSame('midtrans', $transaksi->metode_pembayaran);
        $this->assertNotEmpty($transaksi->midtrans_order_id);
    }

    public function test_petugas_bisa_membuat_va_bca(): void
    {
        $petugas = User::where('role', 'petugas')->first()
            ?? User::factory()->create(['role' => 'petugas']);

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 0]);
        $tarif = Tarif::where('jenis_kendaraan', 'motor')->first()
            ?? Tarif::create(['jenis_kendaraan' => 'motor', 'tarif_per_jam' => 2000]);
        $kendaraan = Kendaraan::first()
            ?? Kendaraan::create(['plat_nomor' => 'B 9999 VA', 'jenis_kendaraan' => 'motor', 'id_user' => $petugas->id_user]);

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $petugas->id_user,
            'waktu_masuk' => now()->subHour(),
            'status' => 'masuk',
            'nomor_slot' => 8,
        ]);

        $response = $this->actingAs($petugas)->postJson("/transaksi/{$transaksi->id_parkir}/midtrans-va", [
            'bank' => 'bca',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'order_id',
                'gross_amount',
                'bank',
                'va_number',
            ]);

        $transaksi->refresh();
        $this->assertSame('midtrans', $transaksi->metode_pembayaran);
        $this->assertNotEmpty($transaksi->midtrans_order_id);
    }

    public function test_petugas_bisa_cek_status_pembayaran(): void
    {
        $petugas = User::where('role', 'petugas')->first()
            ?? User::factory()->create(['role' => 'petugas']);

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 1]);
        $tarif = Tarif::where('jenis_kendaraan', 'motor')->first()
            ?? Tarif::create(['jenis_kendaraan' => 'motor', 'tarif_per_jam' => 2000]);
        $kendaraan = Kendaraan::first()
            ?? Kendaraan::create(['plat_nomor' => 'B 4444 CHK', 'jenis_kendaraan' => 'motor', 'id_user' => $petugas->id_user]);

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $petugas->id_user,
            'waktu_masuk' => now()->subHour(),
            'status' => 'masuk',
            'nomor_slot' => 7,
            'metode_pembayaran' => 'midtrans',
            'midtrans_order_id' => 'PARKIR-CHK-123',
        ]);

        $response = $this->actingAs($petugas)->getJson("/transaksi/{$transaksi->id_parkir}/midtrans-status");

        $response->assertOk()
            ->assertJsonStructure([
                'status',
                'selesai',
            ]);
    }

    public function test_petugas_bisa_selesaikan_pembayaran_midtrans(): void
    {
        $petugas = User::where('role', 'petugas')->first()
            ?? User::factory()->create(['role' => 'petugas']);

        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 1]);
        $tarif = Tarif::where('jenis_kendaraan', 'motor')->first()
            ?? Tarif::create(['jenis_kendaraan' => 'motor', 'tarif_per_jam' => 2000]);
        $kendaraan = Kendaraan::first()
            ?? Kendaraan::create(['plat_nomor' => 'B 7777 SET', 'jenis_kendaraan' => 'motor', 'id_user' => $petugas->id_user]);

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $petugas->id_user,
            'waktu_masuk' => now()->subHours(2),
            'status' => 'masuk',
            'nomor_slot' => 4,
            'metode_pembayaran' => 'midtrans',
            'midtrans_order_id' => 'PARKIR-TEST-123',
        ]);

        $response = $this->actingAs($petugas)->post("/transaksi/{$transaksi->id_parkir}/selesai-midtrans", [
            'order_id' => 'PARKIR-TEST-123',
            'status' => 'settlement',
        ]);

        $response->assertRedirect(route('transaksi.struk-keluar', $transaksi));

        $transaksi->refresh();
        $this->assertSame('keluar', $transaksi->status);
        $this->assertSame('midtrans', $transaksi->metode_pembayaran);
        $this->assertSame('settlement', $transaksi->status_transaksi_midtrans);
        $this->assertNotNull($transaksi->waktu_keluar);
    }

    public function test_webhook_midtrans_bisa_memproses_settlement(): void
    {
        $admin = User::first() ?? User::factory()->create(['role' => 'admin']);
        $area = AreaParkir::first() ?? AreaParkir::create(['nama_area' => 'Area A', 'kapasitas' => 10, 'terisi' => 1]);
        $tarif = Tarif::first() ?? Tarif::create(['jenis_kendaraan' => 'motor', 'tarif_per_jam' => 2000]);
        $kendaraan = Kendaraan::first() ?? Kendaraan::create(['plat_nomor' => 'B 5555 WEB', 'jenis_kendaraan' => 'motor', 'id_user' => $admin->id_user]);

        $orderId = 'PARKIR-ORDER-WEBHOOK-'.time();
        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $admin->id_user,
            'waktu_masuk' => now()->subHour(),
            'status' => 'masuk',
            'nomor_slot' => 5,
            'metode_pembayaran' => 'midtrans',
            'midtrans_order_id' => $orderId,
        ]);

        $serverKey = config('midtrans.server_key');
        $signature = hash('sha512', $orderId.'200'.'2000.00'.$serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => '200',
            'gross_amount' => '2000.00',
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
        ];

        $response = $this->postJson('/api/midtrans/webhook', $payload);

        $response->assertOk()
            ->assertJson(['status' => 'success']);

        $transaksi->refresh();
        $this->assertSame('keluar', $transaksi->status);
        $this->assertSame('settlement', $transaksi->status_transaksi_midtrans);
    }
}
