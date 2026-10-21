<?php

namespace App\Http\Controllers;

use App\Models\AreaParkir;
use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\Tarif;
use App\Models\Transaksi;
use App\Support\TarifCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class KendaraanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $sekarang = Carbon::now();

        $aktif = Transaksi::query()
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan,warna,pemilik', 'area:id_area,nama_area', 'tarif:id_tarif,jenis_kendaraan,tarif_per_jam'])
            ->where('status', 'masuk')
            ->when($search, fn ($q) => $q->whereHas('kendaraan', fn ($k) => $k->where('plat_nomor', 'like', "%{$search}%")->orWhere('pemilik', 'like', "%{$search}%")))
            ->latest('waktu_masuk')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Transaksi $t) use ($sekarang) {
                $durasi = TarifCalculator::durasiJam($t->waktu_masuk, $sekarang);
                $tarifPerJam = (int) ($t->tarif?->tarif_per_jam ?? 0);

                return [
                    'id_parkir' => $t->id_parkir,
                    'plat_nomor' => $t->kendaraan?->plat_nomor,
                    'jenis_kendaraan' => $t->kendaraan?->jenis_kendaraan,
                    'warna' => $t->kendaraan?->warna,
                    'pemilik' => $t->kendaraan?->pemilik,
                    'nama_area' => $t->area?->nama_area,
                    'nomor_slot' => $t->nomor_slot,
                    'slot' => $t->nomor_slot ? ($t->area?->kode.$t->nomor_slot) : null,
                    'waktu_masuk' => $t->waktu_masuk->format('d/m/Y H:i'),
                    'durasi' => $durasi,
                    'tarif_per_jam' => $tarifPerJam,
                    'perkiraan_biaya' => TarifCalculator::biaya($durasi, $tarifPerJam),
                    'kendaraan' => $t->kendaraan,
                    'area' => $t->area,
                    'tarif' => $t->tarif,
                ];
            });

        $areas = AreaParkir::orderBy('nama_area')->get();

        $terisi = Transaksi::query()
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan,warna,pemilik', 'tarif:id_tarif,jenis_kendaraan,tarif_per_jam'])
            ->where('status', 'masuk')
            ->whereIn('id_area', $areas->pluck('id_area'))
            ->get()
            ->groupBy('id_area');

        $areaList = $areas->map(fn (AreaParkir $item) => [
            ...$item->toArray(),
            'slots' => collect($item->denahLayout()['slot'])
                ->filter(fn (array $slot) => $slot['n'] <= $item->kapasitas)
                ->map(function (array $slot) use ($item, $terisi, $sekarang) {
                    $transaksi = $terisi->get($item->id_area)?->firstWhere('nomor_slot', $slot['n']);
                    $durasi = $transaksi ? TarifCalculator::durasiJam($transaksi->waktu_masuk, $sekarang) : 0;
                    $tarifPerJam = (int) ($transaksi?->tarif?->tarif_per_jam ?? 0);

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
                        'warna' => $transaksi?->kendaraan?->warna,
                        'pemilik' => $transaksi?->kendaraan?->pemilik,
                        'nama_area' => $item->nama_area,
                        'slot' => $item->kode.$slot['n'],
                        'waktu_masuk' => $transaksi?->waktu_masuk?->format('d/m/Y H:i'),
                        'durasi' => $durasi,
                        'tarif_per_jam' => $tarifPerJam,
                        'perkiraan_biaya' => $transaksi ? TarifCalculator::biaya($durasi, $tarifPerJam) : 0,
                    ];
                })
                ->values()
                ->all(),
        ]);

        $transaksiTerakhir = Transaksi::query()
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan,warna,pemilik', 'area:id_area,nama_area', 'tarif:id_tarif,jenis_kendaraan,tarif_per_jam'])
            ->latest('waktu_masuk')
            ->take(6)
            ->get()
            ->map(function (Transaksi $t) use ($sekarang) {
                $durasi = $t->status === 'keluar' && $t->waktu_keluar
                    ? TarifCalculator::durasiJam($t->waktu_masuk, $t->waktu_keluar)
                    : TarifCalculator::durasiJam($t->waktu_masuk, $sekarang);
                $tarifPerJam = (int) ($t->tarif?->tarif_per_jam ?? 0);

                return [
                    'id_parkir' => $t->id_parkir,
                    'plat_nomor' => $t->kendaraan?->plat_nomor ?? '-',
                    'jenis_kendaraan' => $t->kendaraan?->jenis_kendaraan ?? 'motor',
                    'warna' => $t->kendaraan?->warna,
                    'pemilik' => $t->kendaraan?->pemilik,
                    'nama_area' => $t->area?->nama_area ?? '-',
                    'kode_slot' => $t->nomor_slot ? ($t->area?->kode.$t->nomor_slot) : '-',
                    'waktu_masuk' => $t->waktu_masuk?->format('d/m/Y H:i') ?? '-',
                    'waktu_keluar' => $t->waktu_keluar?->format('d/m/Y H:i') ?? '-',
                    'durasi' => $durasi,
                    'biaya_total' => (int) ($t->biaya_total ?? TarifCalculator::biaya($durasi, $tarifPerJam)),
                    'status' => $t->status,
                ];
            });

        $totalSisa = $areaList->reduce(fn ($total, $item) => $total + ($item['sisa'] ?? ($item['kapasitas'] - $item['terisi'])), 0);

        return Inertia::render('Kendaraan/Index', [
            'aktif' => $aktif,
            'area' => $areaList,
            'transaksiTerakhir' => $transaksiTerakhir,
            'filters' => ['search' => $search],
            'jenisOptions' => Tarif::jenisTerpakai(),
            'stats' => [
                'total_aktif' => Transaksi::where('status', 'masuk')->count(),
                'total_sisa' => $totalSisa,
                'total_area' => $areas->count(),
                'total_kendaraan' => Kendaraan::count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'plat_nomor' => ['required', 'string', 'max:15'],
            'jenis_kendaraan' => ['required', 'string', 'max:30'],
            'warna' => ['nullable', 'string', 'max:20'],
            'pemilik' => ['nullable', 'string', 'max:100'],
            'id_area' => ['nullable', 'integer', 'exists:tb_area_parkir,id_area'],
        ]);

        $data['plat_nomor'] = strtoupper(trim($data['plat_nomor']));

        if (! empty($data['id_area'])) {
            $kendaraan = Kendaraan::firstOrCreate(
                ['plat_nomor' => $data['plat_nomor']],
                [
                    'jenis_kendaraan' => $data['jenis_kendaraan'],
                    'warna' => $data['warna'] ?? null,
                    'pemilik' => $data['pemilik'] ?? null,
                    'id_user' => $request->user()->id_user,
                ]
            );

            if (Transaksi::where('id_kendaraan', $kendaraan->id_kendaraan)->where('status', 'masuk')->exists()) {
                return back()->withErrors(['plat_nomor' => 'Kendaraan ini masih tercatat sedang parkir aktif.'])->withInput();
            }

            $tarif = Tarif::where('jenis_kendaraan', $data['jenis_kendaraan'])->first();
            $area = AreaParkir::findOrFail($data['id_area']);

            $slotKosong = $area->slotKosongUntuk($data['jenis_kendaraan']);
            if ($slotKosong === null) {
                return back()->withErrors(['id_area' => "Kapasitas {$data['jenis_kendaraan']} di {$area->nama_area} sudah penuh."])->withInput();
            }

            Transaksi::create([
                'id_kendaraan' => $kendaraan->id_kendaraan,
                'id_area' => $data['id_area'],
                'id_user' => $request->user()->id_user,
                'id_tarif' => $tarif?->id_tarif,
                'nomor_slot' => $slotKosong,
                'waktu_masuk' => Carbon::now(),
                'status' => 'masuk',
            ]);

            LogAktivitas::catat($request->user()->id_user, "Check-in kendaraan {$kendaraan->plat_nomor} di {$area->nama_area} slot {$slotKosong}");

            return back()->with('success', "Kendaraan {$kendaraan->plat_nomor} berhasil masuk ke {$area->nama_area} (Slot {$area->kode}{$slotKosong}).");
        }

        if (Kendaraan::where('plat_nomor', $data['plat_nomor'])->exists()) {
            return back()->withErrors(['plat_nomor' => 'Plat nomor sudah terdaftar.'])->withInput();
        }

        Kendaraan::create([
            'plat_nomor' => $data['plat_nomor'],
            'jenis_kendaraan' => $data['jenis_kendaraan'],
            'warna' => $data['warna'] ?? null,
            'pemilik' => $data['pemilik'] ?? null,
            'id_user' => $request->user()->id_user,
        ]);

        LogAktivitas::catat($request->user()->id_user, "Menambah kendaraan {$data['plat_nomor']}");

        return back()->with('success', 'Kendaraan berhasil ditambahkan.');
    }

    public function update(Request $request, Kendaraan $kendaraan): RedirectResponse
    {
        $data = $request->validate([
            'plat_nomor' => ['required', 'string', 'max:15'],
            'jenis_kendaraan' => ['required', 'string', 'max:30'],
            'warna' => ['nullable', 'string', 'max:20'],
            'pemilik' => ['nullable', 'string', 'max:100'],
        ]);

        $data['plat_nomor'] = strtoupper(trim($data['plat_nomor']));

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
}
