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
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $sekarang = Carbon::now();

        $aktif = Transaksi::query()
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan,warna,pemilik', 'area:id_area,nama_area', 'tarif:id_tarif,jenis_kendaraan,tarif_per_jam'])
            ->where('status', 'masuk')
            ->when($search, fn ($q) => $q->whereHas('kendaraan', fn ($k) => $k->where('plat_nomor', 'like', "%{$search}%")))
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

        return Inertia::render('Transaksi/Index', [
            'aktif' => $aktif,
            'area' => $areaList,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        $aktif = Transaksi::query()
            ->where('status', 'masuk')
            ->with('kendaraan:id_kendaraan,jenis_kendaraan')
            ->get()
            ->groupBy('id_area');

        $area = AreaParkir::orderBy('nama_area')->get()->map(function (AreaParkir $item) use ($aktif) {
            $terpakai = $aktif->get($item->id_area, collect());
            $motor = $terpakai->filter(fn (Transaksi $t) => $t->kendaraan?->jenis_kendaraan === 'motor')->count();

            return [
                ...$item->toArray(),
                'sisa_mobil' => max(0, $item->kapasitas_mobil - ($terpakai->count() - $motor)),
                'sisa_motor' => max(0, $item->kapasitas_motor - $motor),
            ];
        });

        return Inertia::render('Transaksi/CheckIn', [
            'area' => $area,
            'jenisOptions' => Tarif::jenisTerpakai(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'plat_nomor' => ['required', 'string', 'max:15'],
            'jenis_kendaraan' => ['required', 'string', 'max:30'],
            'warna' => ['nullable', 'string', 'max:20'],
            'pemilik' => ['nullable', 'string', 'max:100'],
            'id_area' => ['required', 'integer', 'exists:tb_area_parkir,id_area'],
        ]);

        $plat = strtoupper(trim($data['plat_nomor']));
        $kendaraan = Kendaraan::where('plat_nomor', $plat)->first();

        if ($kendaraan && Transaksi::where('id_kendaraan', $kendaraan->id_kendaraan)->where('status', 'masuk')->exists()) {
            throw ValidationException::withMessages([
                'plat_nomor' => 'Kendaraan ini masih tercatat parkir (belum check-out).',
            ]);
        }

        $tarif = Tarif::where('jenis_kendaraan', $data['jenis_kendaraan'])->first();

        if (! $tarif) {
            throw ValidationException::withMessages([
                'jenis_kendaraan' => 'Tarif untuk jenis kendaraan ini belum diatur admin.',
            ]);
        }

        $transaksi = DB::transaction(function () use ($data, $plat, $kendaraan, $tarif, $request) {
            $area = AreaParkir::whereKey($data['id_area'])->lockForUpdate()->firstOrFail();

            if ($area->terisi >= $area->kapasitas) {
                throw ValidationException::withMessages([
                    'id_area' => "Area {$area->nama_area} penuh ({$area->terisi}/{$area->kapasitas}).",
                ]);
            }

            $kendaraan ??= Kendaraan::create([
                'plat_nomor' => $plat,
                'jenis_kendaraan' => $data['jenis_kendaraan'],
                'warna' => $data['warna'] ?? null,
                'pemilik' => $data['pemilik'] ?? null,
                'id_user' => $request->user()->id_user,
            ]);

            $jenisSlot = $data['jenis_kendaraan'] === 'motor' ? 'motor' : 'mobil';
            $kandidat = $area->nomorSlotJenis($jenisSlot);

            if ($kandidat === []) {
                throw ValidationException::withMessages([
                    'id_area' => "Area {$area->nama_area} tidak menyediakan slot {$jenisSlot}.",
                ]);
            }

            $slotTerpakai = Transaksi::where('id_area', $area->id_area)
                ->where('status', 'masuk')
                ->pluck('nomor_slot')
                ->filter()
                ->all();

            $nomorSlot = collect($kandidat)->first(fn (int $nomor) => ! in_array($nomor, $slotTerpakai, true));

            if ($nomorSlot === null) {
                throw ValidationException::withMessages([
                    'id_area' => "Slot {$jenisSlot} di area {$area->nama_area} penuh.",
                ]);
            }

            $area->increment('terisi');

            return Transaksi::create([
                'id_kendaraan' => $kendaraan->id_kendaraan,
                'waktu_masuk' => now(),
                'id_tarif' => $tarif->id_tarif,
                'status' => 'masuk',
                'id_user' => $request->user()->id_user,
                'id_area' => $area->id_area,
                'nomor_slot' => $nomorSlot,
            ]);
        });

        LogAktivitas::catat($request->user()->id_user, "Check-in {$plat} di area {$transaksi->id_area}");

        return redirect()->route('transaksi.struk-masuk', $transaksi);
    }

    public function strukMasuk(Transaksi $transaksi): Response
    {
        return Inertia::render('Struk/Masuk', [
            'transaksi' => $this->strukData($transaksi),
        ]);
    }

    public function checkout(Transaksi $transaksi): RedirectResponse
    {
        abort_unless($transaksi->status === 'masuk', 404);

        return redirect()->route('transaksi.keluar', ['id' => $transaksi->id_parkir]);
    }

    public function checkoutIndex(Request $request): Response
    {
        $id = $request->query('id');
        $search = $request->string('search')->trim()->value();

        $selected = null;
        if ($id) {
            $transaksi = Transaksi::with(['kendaraan', 'tarif', 'area', 'user'])
                ->where('status', 'masuk')
                ->find($id);

            if ($transaksi) {
                $sekarang = Carbon::now();
                $durasi = TarifCalculator::durasiJam($transaksi->waktu_masuk, $sekarang);
                $selected = [
                    ...$this->strukData($transaksi),
                    'perkiraan_durasi' => $durasi,
                    'perkiraan_biaya' => TarifCalculator::biaya($durasi, $transaksi->tarif->tarif_per_jam),
                ];
            }
        }

        if (! $selected && $search) {
            $cleanSearch = strtoupper(trim(str_replace('#', '', $search)));
            $exact = Transaksi::with(['kendaraan', 'tarif', 'area', 'user'])
                ->where('status', 'masuk')
                ->where(function ($q) use ($cleanSearch) {
                    $q->where('id_parkir', $cleanSearch)
                        ->orWhereHas('kendaraan', fn ($k) => $k->where('plat_nomor', $cleanSearch));
                })
                ->first();

            if ($exact) {
                $sekarang = Carbon::now();
                $durasi = TarifCalculator::durasiJam($exact->waktu_masuk, $sekarang);
                $selected = [
                    ...$this->strukData($exact),
                    'perkiraan_durasi' => $durasi,
                    'perkiraan_biaya' => TarifCalculator::biaya($durasi, $exact->tarif->tarif_per_jam),
                ];
            }
        }

        $aktif = Transaksi::query()
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan,warna', 'area:id_area,nama_area', 'tarif:id_tarif,tarif_per_jam'])
            ->where('status', 'masuk')
            ->when($search, function ($q) use ($search) {
                $clean = trim(str_replace('#', '', $search));
                $q->where(function ($sub) use ($clean) {
                    $sub->where('id_parkir', 'like', "%{$clean}%")
                        ->orWhereHas('kendaraan', fn ($k) => $k->where('plat_nomor', 'like', "%{$clean}%"));
                });
            })
            ->latest('waktu_masuk')
            ->limit(15)
            ->get()
            ->map(function (Transaksi $t) {
                $durasi = TarifCalculator::durasiJam($t->waktu_masuk, Carbon::now());

                return [
                    'id_parkir' => $t->id_parkir,
                    'plat_nomor' => $t->kendaraan?->plat_nomor,
                    'jenis_kendaraan' => $t->kendaraan?->jenis_kendaraan,
                    'warna' => $t->kendaraan?->warna,
                    'area' => $t->area?->nama_area,
                    'slot' => $t->nomor_slot ? ($t->area?->kode.$t->nomor_slot) : null,
                    'waktu_masuk' => $t->waktu_masuk->format('d/m H:i'),
                    'durasi' => $durasi,
                    'estimasi_biaya' => TarifCalculator::biaya($durasi, $t->tarif?->tarif_per_jam ?? 0),
                ];
            });

        return Inertia::render('Transaksi/Checkout', [
            'selected' => $selected,
            'aktif' => $aktif,
            'filters' => [
                'search' => $search,
                'id' => $id,
            ],
        ]);
    }

    public function bayar(Request $request, Transaksi $transaksi): RedirectResponse
    {
        DB::transaction(function () use ($transaksi) {
            $transaksi = Transaksi::with('tarif')->whereKey($transaksi->id_parkir)->lockForUpdate()->firstOrFail();

            if ($transaksi->status !== 'masuk') {
                throw ValidationException::withMessages([
                    'transaksi' => 'Transaksi ini sudah dibayar.',
                ]);
            }

            $waktuKeluar = Carbon::now();
            $durasi = TarifCalculator::durasiJam($transaksi->waktu_masuk, $waktuKeluar);

            $transaksi->update([
                'waktu_keluar' => $waktuKeluar,
                'durasi_jam' => $durasi,
                'biaya_total' => TarifCalculator::biaya($durasi, $transaksi->tarif->tarif_per_jam),
                'status' => 'keluar',
            ]);

            AreaParkir::whereKey($transaksi->id_area)->lockForUpdate()->decrement('terisi');
        });

        LogAktivitas::catat($request->user()->id_user, "Check-out transaksi #{$transaksi->id_parkir}");

        return redirect()->route('transaksi.struk-keluar', $transaksi);
    }

    public function strukKeluar(Transaksi $transaksi): Response
    {
        abort_unless($transaksi->status === 'keluar', 404);

        return Inertia::render('Struk/Keluar', [
            'transaksi' => $this->strukData($transaksi),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function strukData(Transaksi $transaksi): array
    {
        $transaksi->load(['kendaraan', 'tarif', 'area', 'user']);

        return [
            'id_parkir' => $transaksi->id_parkir,
            'plat_nomor' => $transaksi->kendaraan->plat_nomor,
            'jenis_kendaraan' => $transaksi->kendaraan->jenis_kendaraan,
            'warna' => $transaksi->kendaraan->warna,
            'pemilik' => $transaksi->kendaraan->pemilik,
            'nama_area' => $transaksi->area->nama_area,
            'slot' => $transaksi->nomor_slot ? $transaksi->area->kode.$transaksi->nomor_slot : null,
            'waktu_masuk' => $transaksi->waktu_masuk->format('d/m/Y H:i:s'),
            'waktu_keluar' => $transaksi->waktu_keluar?->format('d/m/Y H:i:s'),
            'durasi_jam' => $transaksi->durasi_jam,
            'tarif_per_jam' => (int) $transaksi->tarif->tarif_per_jam,
            'biaya_total' => (int) $transaksi->biaya_total,
            'status' => $transaksi->status,
            'petugas' => $transaksi->user->nama_lengkap,
        ];
    }
}
