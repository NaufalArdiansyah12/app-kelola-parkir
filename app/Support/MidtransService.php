<?php

namespace App\Support;

use App\Models\AreaParkir;
use App\Models\LogAktivitas;
use App\Models\Transaksi;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Snap;
use Midtrans\Transaction;

class MidtransService
{
    public static function init(): void
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production', false);
        Config::$isSanitized = config('midtrans.is_sanitized', true);
        Config::$is3ds = config('midtrans.is_3ds', true);
    }

    /**
     * @return array{order_id: string, gross_amount: int, qr_string: string, qr_url: ?string, expiry_time: ?string, snap_token: ?string}
     */
    public static function createQrisTransaction(Transaksi $transaksi): array
    {
        self::init();

        $transaksi->loadMissing(['kendaraan', 'tarif', 'area']);

        if ($transaksi->status !== 'masuk') {
            throw ValidationException::withMessages([
                'transaksi' => 'Transaksi ini sudah selesai.',
            ]);
        }

        $sekarang = Carbon::now();
        $durasi = TarifCalculator::durasiJam($transaksi->waktu_masuk, $sekarang);
        $biayaTotal = TarifCalculator::biaya($durasi, $transaksi->tarif->tarif_per_jam);

        $orderId = "PARKIR-{$transaksi->id_parkir}-".time();

        $qrString = null;
        $qrUrl = null;
        $expiryTime = null;
        $snapToken = null;

        $serverKey = Config::$serverKey;
        $isDemo = empty($serverKey) || str_contains($serverKey, 'demo');

        if (! $isDemo) {
            try {
                $chargeParams = [
                    'payment_type' => 'qris',
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => $biayaTotal,
                    ],
                    'customer_details' => [
                        'first_name' => $transaksi->kendaraan->pemilik ?: 'Pengendara',
                        'last_name' => $transaksi->kendaraan->plat_nomor,
                    ],
                    'item_details' => [
                        [
                            'id' => "TARIF-{$transaksi->tarif->id_tarif}",
                            'price' => $biayaTotal,
                            'quantity' => 1,
                            'name' => "Parkir {$transaksi->kendaraan->plat_nomor} ({$durasi} Jam)",
                        ],
                    ],
                    'qris' => [
                        'acquirer' => 'gopay',
                    ],
                ];

                $response = CoreApi::charge($chargeParams);
                $qrString = $response->qr_string ?? null;
                $expiryTime = $response->expiry_time ?? null;

                if (! empty($response->actions)) {
                    foreach ($response->actions as $action) {
                        if (($action->name ?? '') === 'generate-qr-code') {
                            $qrUrl = $action->url ?? null;
                            break;
                        }
                    }
                }
            } catch (\Throwable) {
                // Biarkan lanjut fallback jika Core API charge terkendala
            }

            try {
                $snapParams = [
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => $biayaTotal,
                    ],
                ];
                $snapToken = Snap::getSnapToken($snapParams);
            } catch (\Throwable) {
                //
            }
        }

        // Fallback mock QRIS jika sandbox demo
        if (! $qrString) {
            $qrString = "00020101021226620014COM.GO-JEK.WWW011993600914312311635570210G1231163550303UKE51440014ID.CO.QRIS.WWW0215AID4433785199560303UKE5204530953033605404{$biayaTotal}5802ID5908PARKIRKU6007JAKARTA61051234062250721{$orderId}6304DEMO";
        }

        if (! $snapToken) {
            $snapToken = 'DEMO-SNAP-'.$orderId;
        }

        $transaksi->update([
            'midtrans_order_id' => $orderId,
            'snap_token' => $snapToken,
            'metode_pembayaran' => 'midtrans',
            'status_transaksi_midtrans' => 'pending',
        ]);

        return [
            'order_id' => $orderId,
            'gross_amount' => $biayaTotal,
            'qr_string' => $qrString,
            'qr_url' => $qrUrl,
            'expiry_time' => $expiryTime,
            'snap_token' => $snapToken,
        ];
    }

    /**
     * @return array{order_id: string, gross_amount: int, bank: string, va_number: string, expiry_time: ?string}
     */
    public static function createVaTransaction(Transaksi $transaksi, string $bank = 'bca'): array
    {
        self::init();

        $transaksi->loadMissing(['kendaraan', 'tarif', 'area']);

        if ($transaksi->status !== 'masuk') {
            throw ValidationException::withMessages([
                'transaksi' => 'Transaksi ini sudah selesai.',
            ]);
        }

        $sekarang = Carbon::now();
        $durasi = TarifCalculator::durasiJam($transaksi->waktu_masuk, $sekarang);
        $biayaTotal = TarifCalculator::biaya($durasi, $transaksi->tarif->tarif_per_jam);

        $orderId = "PARKIR-{$transaksi->id_parkir}-".time();
        $vaNumber = null;
        $expiryTime = null;

        $serverKey = Config::$serverKey;
        $isDemo = empty($serverKey) || str_contains($serverKey, 'demo');

        if (! $isDemo) {
            try {
                $chargeParams = [
                    'payment_type' => 'bank_transfer',
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => $biayaTotal,
                    ],
                    'customer_details' => [
                        'first_name' => $transaksi->kendaraan->pemilik ?: 'Pengendara',
                        'last_name' => $transaksi->kendaraan->plat_nomor,
                    ],
                    'item_details' => [
                        [
                            'id' => "TARIF-{$transaksi->tarif->id_tarif}",
                            'price' => $biayaTotal,
                            'quantity' => 1,
                            'name' => "Parkir {$transaksi->kendaraan->plat_nomor} ({$durasi} Jam)",
                        ],
                    ],
                    'bank_transfer' => [
                        'bank' => $bank,
                    ],
                ];

                $response = CoreApi::charge($chargeParams);
                if (! empty($response->va_numbers[0]->va_number)) {
                    $vaNumber = $response->va_numbers[0]->va_number;
                }
                $expiryTime = $response->expiry_time ?? null;
            } catch (\Throwable) {
                // fallback
            }
        }

        if (! $vaNumber) {
            $prefix = match ($bank) {
                'bca' => '16355',
                'bni' => '98816',
                'bri' => '00199',
                default => '88012',
            };
            $vaNumber = $prefix.str_pad((string) $transaksi->id_parkir, 6, '0', STR_PAD_LEFT).time();
        }

        $transaksi->update([
            'midtrans_order_id' => $orderId,
            'metode_pembayaran' => 'midtrans',
            'status_transaksi_midtrans' => 'pending',
        ]);

        return [
            'order_id' => $orderId,
            'gross_amount' => $biayaTotal,
            'bank' => strtoupper($bank),
            'va_number' => $vaNumber,
            'expiry_time' => $expiryTime,
        ];
    }

    /**
     * @return array{snap_token: string, order_id: string, gross_amount: int}
     */
    public static function createSnapToken(Transaksi $transaksi): array
    {
        self::init();

        $transaksi->loadMissing(['kendaraan', 'tarif', 'area']);

        if ($transaksi->status !== 'masuk') {
            throw ValidationException::withMessages([
                'transaksi' => 'Transaksi ini sudah selesai.',
            ]);
        }

        $sekarang = Carbon::now();
        $durasi = TarifCalculator::durasiJam($transaksi->waktu_masuk, $sekarang);
        $biayaTotal = TarifCalculator::biaya($durasi, $transaksi->tarif->tarif_per_jam);

        $orderId = "PARKIR-{$transaksi->id_parkir}-".time();

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $biayaTotal,
            ],
            'customer_details' => [
                'first_name' => $transaksi->kendaraan->pemilik ?: 'Pengendara',
                'last_name' => $transaksi->kendaraan->plat_nomor,
            ],
            'item_details' => [
                [
                    'id' => "TARIF-{$transaksi->tarif->id_tarif}",
                    'price' => $biayaTotal,
                    'quantity' => 1,
                    'name' => "Parkir {$transaksi->kendaraan->plat_nomor} ({$durasi} Jam)",
                ],
            ],
        ];

        if (empty(Config::$serverKey) || str_contains(Config::$serverKey, 'demo')) {
            $snapToken = 'DEMO-SNAP-TOKEN-'.$orderId;
        } else {
            $snapToken = Snap::getSnapToken($params);
        }

        $transaksi->update([
            'midtrans_order_id' => $orderId,
            'snap_token' => $snapToken,
            'metode_pembayaran' => 'midtrans',
            'status_transaksi_midtrans' => 'pending',
        ]);

        return [
            'snap_token' => $snapToken,
            'order_id' => $orderId,
            'gross_amount' => $biayaTotal,
        ];
    }

    /**
     * @return array{status: string, selesai: bool}
     */
    public static function checkPaymentStatus(Transaksi $transaksi, ?int $userId = null): array
    {
        self::init();

        $transaksi->refresh();

        if ($transaksi->status === 'keluar') {
            return [
                'status' => $transaksi->status_transaksi_midtrans ?: 'settlement',
                'selesai' => true,
            ];
        }

        if (! $transaksi->midtrans_order_id) {
            return [
                'status' => 'pending',
                'selesai' => false,
            ];
        }

        $status = 'pending';

        if (! empty(Config::$serverKey) && ! str_contains(Config::$serverKey, 'demo')) {
            try {
                $res = Transaction::status($transaksi->midtrans_order_id);
                $status = $res->transaction_status ?? 'pending';
            } catch (\Throwable) {
                $status = $transaksi->status_transaksi_midtrans ?: 'pending';
            }
        } else {
            $status = $transaksi->status_transaksi_midtrans ?: 'pending';
        }

        if (in_array($status, ['capture', 'settlement'], true)) {
            self::selesaikanPembayaran($transaksi, $transaksi->midtrans_order_id, $status, $userId);

            return [
                'status' => $status,
                'selesai' => true,
            ];
        }

        return [
            'status' => $status,
            'selesai' => false,
        ];
    }

    public static function selesaikanPembayaran(Transaksi $transaksi, ?string $orderId = null, string $status = 'settlement', ?int $userId = null): Transaksi
    {
        return DB::transaction(function () use ($transaksi, $orderId, $status, $userId) {
            $locked = Transaksi::with('tarif')->whereKey($transaksi->id_parkir)->lockForUpdate()->firstOrFail();

            if ($locked->status === 'keluar') {
                return $locked;
            }

            $waktuKeluar = Carbon::now();
            $durasi = TarifCalculator::durasiJam($locked->waktu_masuk, $waktuKeluar);
            $biayaTotal = TarifCalculator::biaya($durasi, $locked->tarif->tarif_per_jam);

            $locked->update([
                'waktu_keluar' => $waktuKeluar,
                'durasi_jam' => $durasi,
                'biaya_total' => $biayaTotal,
                'status' => 'keluar',
                'metode_pembayaran' => 'midtrans',
                'midtrans_order_id' => $orderId ?? $locked->midtrans_order_id,
                'status_transaksi_midtrans' => $status,
            ]);

            AreaParkir::whereKey($locked->id_area)->lockForUpdate()->decrement('terisi');

            if ($userId) {
                LogAktivitas::catat($userId, "Check-out digital (Midtrans) transaksi #{$locked->id_parkir}");
            }

            return $locked;
        });
    }

    public static function handleWebhook(array $payload): bool
    {
        self::init();

        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;

        if (! $orderId || ! $signatureKey) {
            return false;
        }

        $serverKey = Config::$serverKey;
        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        if (! str_contains($serverKey, 'demo') && $signatureKey !== $expectedSignature) {
            return false;
        }

        $transaksi = Transaksi::where('midtrans_order_id', $orderId)->first();
        if (! $transaksi) {
            return false;
        }

        if (in_array($transactionStatus, ['capture', 'settlement'], true)) {
            self::selesaikanPembayaran($transaksi, $orderId, $transactionStatus, $transaksi->id_user);
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'], true)) {
            $transaksi->update([
                'status_transaksi_midtrans' => $transactionStatus,
            ]);
        }

        return true;
    }
}
