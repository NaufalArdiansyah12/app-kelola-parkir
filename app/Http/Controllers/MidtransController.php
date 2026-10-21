<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Support\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MidtransController extends Controller
{
    public function qris(Transaksi $transaksi): JsonResponse
    {
        $data = MidtransService::createQrisTransaction($transaksi);

        return response()->json($data);
    }

    public function va(Request $request, Transaksi $transaksi): JsonResponse
    {
        $bank = $request->input('bank', 'bca');
        $data = MidtransService::createVaTransaction($transaksi, $bank);

        return response()->json($data);
    }

    public function snapToken(Transaksi $transaksi): JsonResponse
    {
        $data = MidtransService::createSnapToken($transaksi);

        return response()->json($data);
    }

    public function cekStatus(Request $request, Transaksi $transaksi): JsonResponse
    {
        $result = MidtransService::checkPaymentStatus($transaksi, $request->user()?->id_user);

        return response()->json([
            ...$result,
            'redirect' => $result['selesai'] ? route('transaksi.struk-keluar', $transaksi) : null,
        ]);
    }

    public function selesai(Request $request, Transaksi $transaksi): RedirectResponse|JsonResponse
    {
        $orderId = $request->input('order_id');
        $status = $request->input('status', 'settlement');

        $updated = MidtransService::selesaikanPembayaran($transaksi, $orderId, $status, $request->user()?->id_user);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'redirect' => route('transaksi.struk-keluar', $updated),
            ]);
        }

        return redirect()->route('transaksi.struk-keluar', $updated);
    }

    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $success = MidtransService::handleWebhook($payload);

        return response()->json([
            'status' => $success ? 'success' : 'ignored',
        ]);
    }
}
