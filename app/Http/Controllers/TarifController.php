<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\Tarif;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TarifController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Tarif/Index', [
            'tarif' => Tarif::orderBy('jenis_kendaraan')->paginate(10)->withQueryString(),
            'jenisOptions' => Tarif::jenisPilihan(),
            'jenisTerpakai' => Tarif::jenisTerpakai(),
            'stats' => [
                'total' => Tarif::count(),
                'termurah' => (int) Tarif::min('tarif_per_jam'),
                'termahal' => (int) Tarif::max('tarif_per_jam'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge(['jenis_kendaraan' => strtolower(trim((string) $request->input('jenis_kendaraan')))]);

        $data = $request->validate([
            'jenis_kendaraan' => ['required', 'string', 'max:30', 'unique:tb_tarif,jenis_kendaraan'],
            'tarif_per_jam' => ['required', 'integer', 'min:0'],
        ], [
            'jenis_kendaraan.unique' => 'Jenis kendaraan ini sudah memiliki tarif. Silakan edit tarif yang ada.',
        ]);

        Tarif::create($data);
        LogAktivitas::catat($request->user()->id_user, "Menambah tarif {$data['jenis_kendaraan']}");

        return back()->with('success', 'Tarif berhasil ditambahkan.');
    }

    public function update(Request $request, Tarif $tarif): RedirectResponse
    {
        $request->merge(['jenis_kendaraan' => strtolower(trim((string) $request->input('jenis_kendaraan')))]);

        $data = $request->validate([
            'jenis_kendaraan' => ['required', 'string', 'max:30', Rule::unique('tb_tarif', 'jenis_kendaraan')->ignore($tarif->id_tarif, 'id_tarif')],
            'tarif_per_jam' => ['required', 'integer', 'min:0'],
        ], [
            'jenis_kendaraan.unique' => 'Jenis kendaraan ini sudah memiliki tarif. Silakan edit tarif yang ada.',
        ]);

        $tarif->update($data);
        LogAktivitas::catat($request->user()->id_user, "Mengubah tarif {$tarif->jenis_kendaraan}");

        return back()->with('success', 'Tarif berhasil diperbarui.');
    }

    public function destroy(Request $request, Tarif $tarif): RedirectResponse
    {
        if ($tarif->transaksi()->exists()) {
            return back()->with('error', 'Tarif sudah dipakai transaksi, tidak dapat dihapus.');
        }

        $tarif->delete();
        LogAktivitas::catat($request->user()->id_user, "Menghapus tarif {$tarif->jenis_kendaraan}");

        return back()->with('success', 'Tarif berhasil dihapus.');
    }
}
