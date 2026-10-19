<?php

namespace App\Http\Controllers;

use App\Models\AreaParkir;
use App\Models\LogAktivitas;
use App\Models\Transaksi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AreaController extends Controller
{
    public function index(): Response
    {
        $area = AreaParkir::orderBy('nama_area')->paginate(10)->withQueryString();

        $terisi = Transaksi::query()
            ->with('kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan')
            ->where('status', 'masuk')
            ->whereIn('id_area', $area->pluck('id_area'))
            ->get()
            ->groupBy('id_area');

        $area->through(fn (AreaParkir $item) => [
            ...$item->toArray(),
            'slots' => collect($item->denahLayout()['slot'])
                ->filter(fn (array $slot) => $slot['n'] <= $item->kapasitas)
                ->map(function (array $slot) use ($item, $terisi) {
                    $transaksi = $terisi->get($item->id_area)?->firstWhere('nomor_slot', $slot['n']);

                    return [
                        'nomor' => $slot['n'],
                        'label' => $item->kode.$slot['n'],
                        'jenis' => $item->jenisSlot($slot['n']),
                        'b' => $slot['b'],
                        'k' => $slot['k'],
                        'rot' => $slot['rot'],
                        'id_parkir' => $transaksi?->id_parkir,
                        'plat_nomor' => $transaksi?->kendaraan?->plat_nomor,
                        'jenis_kendaraan' => $transaksi?->kendaraan?->jenis_kendaraan,
                        'waktu_masuk' => $transaksi?->waktu_masuk?->format('H:i'),
                    ];
                })
                ->values()
                ->all(),
        ]);

        return Inertia::render('Area/Index', [
            'area' => $area,
            'stats' => [
                'total' => AreaParkir::count(),
                'kapasitas' => (int) AreaParkir::sum('kapasitas'),
                'terisi' => (int) AreaParkir::sum('terisi'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nama_area' => ['required', 'string', 'max:50'],
            'kapasitas_mobil' => ['required', 'integer', 'min:0'],
            'kapasitas_motor' => ['required', 'integer', 'min:0'],
            'kolom' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $kapasitas = $data['kapasitas_mobil'] + $data['kapasitas_motor'];

        if ($kapasitas < 1) {
            throw ValidationException::withMessages([
                'kapasitas_mobil' => 'Isi minimal satu slot mobil atau motor.',
            ]);
        }

        $denah = $this->denahPayload($request, $kapasitas);

        AreaParkir::create([
            ...$data,
            'kapasitas' => $kapasitas,
            'kolom' => $denah['kolom'] ?? $data['kolom'],
            'denah' => $denah,
            'terisi' => 0,
        ]);
        LogAktivitas::catat($request->user()->id_user, "Menambah area {$data['nama_area']}");

        return back()->with('success', 'Area parkir berhasil ditambahkan.');
    }

    public function update(Request $request, AreaParkir $area): RedirectResponse
    {
        $data = $request->validate([
            'nama_area' => ['required', 'string', 'max:50'],
            'kapasitas_mobil' => ['required', 'integer', 'min:0'],
            'kapasitas_motor' => ['required', 'integer', 'min:0'],
            'kolom' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $kapasitas = $data['kapasitas_mobil'] + $data['kapasitas_motor'];

        if ($kapasitas < 1) {
            throw ValidationException::withMessages([
                'kapasitas_mobil' => 'Isi minimal satu slot mobil atau motor.',
            ]);
        }

        if ($kapasitas < $area->terisi) {
            throw ValidationException::withMessages([
                'kapasitas_mobil' => 'Total kapasitas tidak boleh lebih kecil dari jumlah terisi saat ini.',
            ]);
        }

        $denah = $this->denahPayload($request, $kapasitas);

        if ($denah === null) {
            $denah = $kapasitas === $area->kapasitas && $data['kolom'] === $area->kolom
                ? $area->denah
                : null;
        }

        $area->update([
            ...$data,
            'kapasitas' => $kapasitas,
            'kolom' => $denah['kolom'] ?? $data['kolom'],
            'denah' => $denah,
        ]);
        LogAktivitas::catat($request->user()->id_user, "Mengubah area {$area->nama_area}");

        return back()->with('success', 'Area parkir berhasil diperbarui.');
    }

    public function simpanDenah(Request $request, AreaParkir $area): RedirectResponse
    {
        $denah = $this->denahPayload($request, $area->kapasitas);

        if ($denah === null) {
            throw ValidationException::withMessages(['denah' => 'Denah tidak boleh kosong.']);
        }

        $area->update(['kolom' => $denah['kolom'], 'denah' => $denah]);

        LogAktivitas::catat($request->user()->id_user, "Mengatur denah area {$area->nama_area}");

        return back()->with('success', 'Denah area berhasil disimpan.');
    }

    /**
     * Validasi denah dari form. Null bila admin tidak mengirim denah.
     *
     * @return array{baris: int, kolom: int, slot: array<int, array{n: int, b: int, k: int, rot: int}>}|null
     */
    private function denahPayload(Request $request, int $kapasitas): ?array
    {
        if (! $request->filled('denah')) {
            return null;
        }

        $data = $request->validate([
            'denah.baris' => ['required', 'integer', 'min:1', 'max:50'],
            'denah.kolom' => ['required', 'integer', 'min:1', 'max:20'],
            'denah.slot' => ['required', 'array', 'size:'.$kapasitas],
            'denah.slot.*.n' => ['required', 'integer', 'min:1', 'max:'.$kapasitas],
            'denah.slot.*.b' => ['required', 'integer', 'min:0'],
            'denah.slot.*.k' => ['required', 'integer', 'min:0'],
            'denah.slot.*.rot' => ['required', 'integer', 'in:0,90,180,270'],
        ])['denah'];

        $nomor = array_column($data['slot'], 'n');
        $sel = array_map(fn (array $slot) => $slot['b'].'-'.$slot['k'], $data['slot']);

        if (count(array_unique($nomor)) !== count($nomor)) {
            throw ValidationException::withMessages(['denah' => 'Nomor slot tidak boleh dobel.']);
        }

        if (count(array_unique($sel)) !== count($sel)) {
            throw ValidationException::withMessages(['denah' => 'Ada slot yang menempati sel yang sama.']);
        }

        foreach ($data['slot'] as $slot) {
            if ($slot['b'] >= $data['baris'] || $slot['k'] >= $data['kolom']) {
                throw ValidationException::withMessages(['denah' => 'Ada slot di luar batas denah.']);
            }
        }

        return [
            'baris' => (int) $data['baris'],
            'kolom' => (int) $data['kolom'],
            'slot' => array_values($data['slot']),
        ];
    }

    public function destroy(Request $request, AreaParkir $area): RedirectResponse
    {
        if ($area->transaksi()->exists()) {
            return back()->with('error', 'Area sudah dipakai transaksi, tidak dapat dihapus.');
        }

        $area->delete();
        LogAktivitas::catat($request->user()->id_user, "Menghapus area {$area->nama_area}");

        return back()->with('success', 'Area parkir berhasil dihapus.');
    }
}
