<?php

namespace App\Http\Controllers;

use App\Models\AreaParkir;
use App\Models\Kendaraan;
use App\Models\Tarif;
use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $hariIni = Carbon::today();

        $periode = (string) $request->query('periode', 'minggu');
        if (! in_array($periode, ['minggu', 'bulan', 'tahun'], true)) {
            $periode = 'minggu';
        }

        $petugasParam = $request->query('petugas');
        $petugasId = ($petugasParam && $petugasParam !== 'semua' && is_numeric($petugasParam)) ? (int) $petugasParam : null;

        $petugasOptions = User::whereIn('role', ['petugas', 'admin'])
            ->orderBy('nama_lengkap')
            ->get(['id_user', 'nama_lengkap', 'username', 'role']);

        $selectedPetugasName = 'Semua Petugas';
        if ($petugasId) {
            $found = $petugasOptions->firstWhere('id_user', $petugasId);
            if ($found) {
                $selectedPetugasName = $found->nama_lengkap;
            }
        }

        $statistik = [
            'kendaraan_aktif' => Transaksi::where('status', 'masuk')->count(),
            'transaksi_hari_ini' => Transaksi::where('status', 'keluar')->whereDate('waktu_keluar', $hariIni)->count(),
            'pendapatan_hari_ini' => (int) Transaksi::where('status', 'keluar')->whereDate('waktu_keluar', $hariIni)->sum('biaya_total'),
        ];

        // 1. Hitung data grafik pendapatan dinamis (per minggu, bulan, tahun & filter petugas)
        $chartQuery = Transaksi::query()->where('status', 'keluar');
        if ($petugasId) {
            $chartQuery->where('id_user', $petugasId);
        }

        if ($periode === 'tahun') {
            $start = $hariIni->copy()->startOfYear();
            $end = $hariIni->copy()->endOfYear();

            $transaksiList = (clone $chartQuery)
                ->whereBetween('waktu_keluar', [$start, $end])
                ->get(['biaya_total', 'waktu_keluar']);

            $grouped = $transaksiList->groupBy(fn ($t) => (int) $t->waktu_keluar->format('n'));

            $chartPendapatan = collect(range(1, 12))->map(function (int $m) use ($hariIni, $grouped) {
                $items = $grouped->get($m, collect());
                $dt = Carbon::create($hariIni->year, $m, 1);

                return [
                    'key' => (string) $m,
                    'label' => $dt->locale('id')->isoFormat('MMM'),
                    'sub' => (string) $hariIni->year,
                    'pendapatan' => (int) $items->sum('biaya_total'),
                    'jumlah' => $items->count(),
                ];
            })->values();
        } elseif ($periode === 'bulan') {
            $start = $hariIni->copy()->startOfMonth();
            $end = $hariIni->copy()->endOfMonth();
            $daysInMonth = $hariIni->daysInMonth;

            $transaksiList = (clone $chartQuery)
                ->whereBetween('waktu_keluar', [$start, $end])
                ->get(['biaya_total', 'waktu_keluar']);

            $grouped = $transaksiList->groupBy(fn ($t) => (int) $t->waktu_keluar->format('j'));

            $monthName = $hariIni->locale('id')->isoFormat('MMM');
            $intervals = [
                ['start' => 1, 'end' => 7, 'label' => 'Mg 1', 'sub' => '1-7 '.$monthName],
                ['start' => 8, 'end' => 14, 'label' => 'Mg 2', 'sub' => '8-14 '.$monthName],
                ['start' => 15, 'end' => 21, 'label' => 'Mg 3', 'sub' => '15-21 '.$monthName],
                ['start' => 22, 'end' => 28, 'label' => 'Mg 4', 'sub' => '22-28 '.$monthName],
            ];
            if ($daysInMonth > 28) {
                $intervals[] = [
                    'start' => 29,
                    'end' => $daysInMonth,
                    'label' => 'Mg 5',
                    'sub' => '29-'.$daysInMonth.' '.$monthName,
                ];
            }

            $chartPendapatan = collect($intervals)->map(function ($intv) use ($grouped) {
                $pendapatan = 0;
                $jumlah = 0;
                for ($d = $intv['start']; $d <= $intv['end']; $d++) {
                    $items = $grouped->get($d, collect());
                    $pendapatan += (int) $items->sum('biaya_total');
                    $jumlah += $items->count();
                }

                return [
                    'key' => $intv['label'],
                    'label' => $intv['label'],
                    'sub' => $intv['sub'],
                    'pendapatan' => $pendapatan,
                    'jumlah' => $jumlah,
                ];
            })->values();
        } else {
            // Default: 'minggu' (7 hari terakhir)
            $start = $hariIni->copy()->subDays(6)->startOfDay();
            $end = $hariIni->copy()->endOfDay();

            $transaksiList = (clone $chartQuery)
                ->whereBetween('waktu_keluar', [$start, $end])
                ->get(['biaya_total', 'waktu_keluar']);

            $grouped = $transaksiList->groupBy(fn ($t) => $t->waktu_keluar->format('Y-m-d'));

            $chartPendapatan = collect(range(6, 0))->map(function (int $mundur) use ($hariIni, $grouped) {
                $tgl = $hariIni->copy()->subDays($mundur);
                $str = $tgl->toDateString();
                $items = $grouped->get($str, collect());

                return [
                    'key' => $str,
                    'label' => $tgl->locale('id')->isoFormat('ddd'),
                    'sub' => $tgl->format('d/m'),
                    'pendapatan' => (int) $items->sum('biaya_total'),
                    'jumlah' => $items->count(),
                ];
            })->values();
        }

        $totalPendapatanChart = (int) $chartPendapatan->sum('pendapatan');
        $totalTransaksiChart = (int) $chartPendapatan->sum('jumlah');

        // 2. Data aktivitas masuk 7 hari (kompatibilitas grafik lama)
        $masukPerHari = Transaksi::query()
            ->whereBetween('waktu_masuk', [$hariIni->copy()->subDays(6)->startOfDay(), $hariIni->copy()->endOfDay()])
            ->selectRaw('DATE(waktu_masuk) as tanggal, COUNT(*) as jumlah')
            ->groupByRaw('DATE(waktu_masuk)')
            ->pluck('jumlah', 'tanggal');

        $chart = collect(range(6, 0))
            ->map(function (int $mundur) use ($hariIni, $masukPerHari) {
                $tanggal = $hariIni->copy()->subDays($mundur);

                return [
                    'tanggal' => $tanggal->toDateString(),
                    'label' => $tanggal->locale('id')->isoFormat('ddd'),
                    'jumlah' => (int) ($masukPerHari[$tanggal->toDateString()] ?? 0),
                ];
            })
            ->values();

        $jenis = Transaksi::query()
            ->join('tb_kendaraan', 'tb_kendaraan.id_kendaraan', '=', 'tb_transaksi.id_kendaraan')
            ->where('tb_transaksi.status', 'keluar')
            ->where('tb_transaksi.waktu_keluar', '>=', $hariIni->copy()->subDays(29)->startOfDay())
            ->select('tb_kendaraan.jenis_kendaraan', DB::raw('COUNT(*) as jumlah'), DB::raw('SUM(tb_transaksi.biaya_total) as pendapatan'))
            ->groupBy('tb_kendaraan.jenis_kendaraan')
            ->orderByDesc('pendapatan')
            ->get();

        $recent = Transaksi::query()
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan', 'area:id_area,nama_area'])
            ->latest('id_parkir')
            ->limit(5)
            ->get()
            ->map(fn (Transaksi $t) => [
                'id_parkir' => $t->id_parkir,
                'plat_nomor' => $t->kendaraan?->plat_nomor,
                'jenis_kendaraan' => $t->kendaraan?->jenis_kendaraan,
                'nama_area' => $t->area?->nama_area,
                'waktu' => ($t->waktu_keluar ?? $t->waktu_masuk)->format('d M H:i'),
                'status' => $t->status,
                'biaya_total' => (int) $t->biaya_total,
            ]);

        return Inertia::render('Dashboard', [
            'statistik' => $statistik,
            'area' => AreaParkir::orderBy('nama_area')->get(),
            'chart' => $chart,
            'jenis' => $jenis,
            'recent' => $recent,
            'chartPendapatan' => $chartPendapatan,
            'totalPendapatanChart' => $totalPendapatanChart,
            'totalTransaksiChart' => $totalTransaksiChart,
            'petugasOptions' => $petugasOptions,
            'chartFilters' => [
                'periode' => $periode,
                'petugas' => $petugasId ? (string) $petugasId : 'semua',
                'petugas_nama' => $selectedPetugasName,
            ],
            'tambahan' => $user->role === 'admin'
                ? [
                    'total_user' => User::count(),
                    'total_kendaraan' => Kendaraan::count(),
                    'total_tarif' => Tarif::count(),
                ]
                : ($user->role === 'owner'
                    ? [
                        'pendapatan_bulan_ini' => (int) Transaksi::where('status', 'keluar')
                            ->whereBetween('waktu_keluar', [$hariIni->copy()->startOfMonth(), $hariIni->copy()->endOfMonth()])
                            ->sum('biaya_total'),
                    ]
                    : null),
        ]);
    }
}
