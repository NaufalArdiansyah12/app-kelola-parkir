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

        $statistik = [
            'kendaraan_aktif' => Transaksi::where('status', 'masuk')->count(),
            'transaksi_hari_ini' => Transaksi::where('status', 'keluar')->whereDate('waktu_keluar', $hariIni)->count(),
            'pendapatan_hari_ini' => (int) Transaksi::where('status', 'keluar')->whereDate('waktu_keluar', $hariIni)->sum('biaya_total'),
        ];

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
