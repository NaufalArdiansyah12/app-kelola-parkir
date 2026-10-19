<?php

namespace App\Http\Controllers;

use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\Tarif;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KendaraanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $kendaraan = Kendaraan::query()
            ->with('user:id_user,nama_lengkap')
            ->when($search, fn ($q) => $q->where('plat_nomor', 'like', "%{$search}%")->orWhere('pemilik', 'like', "%{$search}%"))
            ->orderBy('plat_nomor')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Kendaraan $k) => [
                'id_kendaraan' => $k->id_kendaraan,
                'plat_nomor' => $k->plat_nomor,
                'jenis_kendaraan' => $k->jenis_kendaraan,
                'warna' => $k->warna,
                'pemilik' => $k->pemilik,
                'dicatat_oleh' => $k->user?->nama_lengkap,
            ]);

        return Inertia::render('Kendaraan/Index', [
            'kendaraan' => $kendaraan,
            'filters' => ['search' => $search],
            'jenisOptions' => Tarif::jenisPilihan(),
            'stats' => [
                'total' => Kendaraan::count(),
                'motor' => Kendaraan::where('jenis_kendaraan', 'motor')->count(),
                'mobil' => Kendaraan::where('jenis_kendaraan', 'mobil')->count(),
                'lainnya' => Kendaraan::where('jenis_kendaraan', 'lainnya')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['plat_nomor'] = strtoupper($data['plat_nomor']);

        if (Kendaraan::where('plat_nomor', $data['plat_nomor'])->exists()) {
            return back()->withErrors(['plat_nomor' => 'Plat nomor sudah terdaftar.'])->withInput();
        }

        Kendaraan::create([...$data, 'id_user' => $request->user()->id_user]);
        LogAktivitas::catat($request->user()->id_user, "Menambah kendaraan {$data['plat_nomor']}");

        return back()->with('success', 'Kendaraan berhasil ditambahkan.');
    }

    public function update(Request $request, Kendaraan $kendaraan): RedirectResponse
    {
        $data = $this->validated($request);
        $data['plat_nomor'] = strtoupper($data['plat_nomor']);

        $kendaraan->update($data);
        LogAktivitas::catat($request->user()->id_user, "Mengubah kendaraan {$kendaraan->plat_nomor}");

        return back()->with('success', 'Kendaraan berhasil diperbarui.');
    }

    public function destroy(Request $request, Kendaraan $kendaraan): RedirectResponse
    {
        if ($kendaraan->transaksi()->exists()) {
            return back()->with('error', 'Kendaraan memiliki riwayat transaksi, tidak dapat dihapus.');
        }

        $plat = $kendaraan->plat_nomor;
        $kendaraan->delete();
        LogAktivitas::catat($request->user()->id_user, "Menghapus kendaraan {$plat}");

        return back()->with('success', 'Kendaraan berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'plat_nomor' => ['required', 'string', 'max:15'],
            'jenis_kendaraan' => ['required', 'string', 'max:30'],
            'warna' => ['nullable', 'string', 'max:20'],
            'pemilik' => ['nullable', 'string', 'max:100'],
        ]);
    }
}
