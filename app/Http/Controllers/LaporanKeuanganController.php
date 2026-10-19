<?php

namespace App\Http\Controllers;

use App\Models\Tarif;
use App\Models\Transaksi;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Options;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanKeuanganController extends Controller
{
    public const MAX_PDF_RECORDS = 1000;

    protected string $filePrefix = 'laporan-keuangan';

    protected string $reportTitle = 'Laporan Keuangan & Rekonsiliasi Kasir Parkir';

    protected string $excelTitle = 'LAPORAN KEUANGAN DAN PENERIMAAN KAS PARKIR';

    public function index(Request $request): Response
    {
        return Inertia::render('LaporanKeuangan/Index', $this->buildReportData($request));
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildReportData(Request $request): array
    {
        $parsed = $this->parseFilters($request);
        $baseQuery = $this->buildFilteredQuery($parsed);

        $ringkasan = (clone $baseQuery)
            ->selectRaw('COUNT(*) as total_transaksi, COALESCE(SUM(biaya_total), 0) as total_pendapatan, COALESCE(SUM(durasi_jam), 0) as total_jam')
            ->first();

        $totalPendapatan = (int) ($ringkasan->total_pendapatan ?? 0);
        $totalTransaksi = (int) ($ringkasan->total_transaksi ?? 0);
        $totalJam = (int) ($ringkasan->total_jam ?? 0);
        $rataRata = $totalTransaksi > 0 ? (int) round($totalPendapatan / $totalTransaksi) : 0;

        $perPetugas = (clone $baseQuery)
            ->join('tb_user', 'tb_user.id_user', '=', 'tb_transaksi.id_user')
            ->select(
                'tb_user.id_user',
                'tb_user.nama_lengkap',
                'tb_user.username',
                DB::raw('COUNT(*) as jumlah_transaksi'),
                DB::raw('SUM(tb_transaksi.biaya_total) as total_setoran'),
                DB::raw('SUM(tb_transaksi.durasi_jam) as total_jam')
            )
            ->groupBy('tb_user.id_user', 'tb_user.nama_lengkap', 'tb_user.username')
            ->orderByDesc('total_setoran')
            ->get()
            ->map(fn ($p) => [
                'id_user' => $p->id_user,
                'nama_lengkap' => $p->nama_lengkap,
                'username' => $p->username,
                'jumlah_transaksi' => (int) $p->jumlah_transaksi,
                'total_setoran' => (int) $p->total_setoran,
                'total_jam' => (int) $p->total_jam,
                'persentase' => $totalPendapatan > 0 ? round(($p->total_setoran / $totalPendapatan) * 100, 1) : 0,
            ]);

        $perJenis = (clone $baseQuery)
            ->join('tb_kendaraan', 'tb_kendaraan.id_kendaraan', '=', 'tb_transaksi.id_kendaraan')
            ->select(
                'tb_kendaraan.jenis_kendaraan',
                DB::raw('COUNT(*) as jumlah'),
                DB::raw('SUM(tb_transaksi.biaya_total) as pendapatan')
            )
            ->groupBy('tb_kendaraan.jenis_kendaraan')
            ->orderByDesc('pendapatan')
            ->get()
            ->map(fn ($j) => [
                'jenis_kendaraan' => $j->jenis_kendaraan,
                'jumlah' => (int) $j->jumlah,
                'pendapatan' => (int) $j->pendapatan,
            ]);

        $transaksi = (clone $baseQuery)
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan', 'area:id_area,nama_area', 'user:id_user,nama_lengkap'])
            ->latest('waktu_keluar')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Transaksi $t) => [
                'id_parkir' => $t->id_parkir,
                'plat_nomor' => $t->kendaraan?->plat_nomor,
                'jenis_kendaraan' => $t->kendaraan?->jenis_kendaraan,
                'nama_area' => $t->area?->nama_area,
                'waktu_masuk' => $t->waktu_masuk->format('d/m/Y H:i'),
                'waktu_keluar' => $t->waktu_keluar?->format('d/m/Y H:i'),
                'durasi_jam' => $t->durasi_jam,
                'biaya_total' => (int) $t->biaya_total,
                'petugas' => $t->user?->nama_lengkap,
            ]);

        return [
            'ringkasan' => [
                'total_pendapatan' => $totalPendapatan,
                'total_transaksi' => $totalTransaksi,
                'total_jam' => $totalJam,
                'rata_rata' => $rataRata,
            ],
            'perPetugas' => $perPetugas,
            'perJenis' => $perJenis,
            'transaksi' => $transaksi,
            'petugasOptions' => User::whereIn('role', ['petugas', 'admin'])->orderBy('nama_lengkap')->get(['id_user', 'nama_lengkap']),
            'jenisOptions' => Tarif::jenisPilihan(),
            'canExportPdf' => $totalTransaksi <= self::MAX_PDF_RECORDS,
            'maxPdfRecords' => self::MAX_PDF_RECORDS,
            'filters' => [
                'dari' => $parsed['dari']->toDateString(),
                'sampai' => $parsed['sampai']->toDateString(),
                'id_user' => $parsed['id_user'] ? (string) $parsed['id_user'] : '',
                'jenis_kendaraan' => $parsed['jenis_kendaraan'] ?? '',
            ],
        ];
    }

    public function exportPdf(Request $request): HttpResponse|RedirectResponse
    {
        $parsed = $this->parseFilters($request);
        $baseQuery = $this->buildFilteredQuery($parsed);

        $count = (clone $baseQuery)->count();

        if ($count > self::MAX_PDF_RECORDS) {
            return back()->with('error', "Data transaksi melebihi batas 1.000 baris (total: {$count} data). PDF dibatasi maksimal 1.000 data demi stabilitas dan performa sistem. Silakan gunakan Export Excel.");
        }

        if ($count === 0) {
            return back()->with('error', 'Tidak ada data transaksi keluar pada filter periode ini untuk di-export.');
        }

        $ringkasanRaw = (clone $baseQuery)
            ->selectRaw('COUNT(*) as total_transaksi, COALESCE(SUM(biaya_total), 0) as total_pendapatan, COALESCE(SUM(durasi_jam), 0) as total_jam')
            ->first();

        $totalPendapatan = (int) ($ringkasanRaw->total_pendapatan ?? 0);
        $totalTransaksi = (int) ($ringkasanRaw->total_transaksi ?? 0);
        $totalJam = (int) ($ringkasanRaw->total_jam ?? 0);
        $rataRata = $totalTransaksi > 0 ? (int) round($totalPendapatan / $totalTransaksi) : 0;

        $perPetugas = (clone $baseQuery)
            ->join('tb_user', 'tb_user.id_user', '=', 'tb_transaksi.id_user')
            ->select(
                'tb_user.nama_lengkap',
                'tb_user.username',
                DB::raw('COUNT(*) as jumlah_transaksi'),
                DB::raw('SUM(tb_transaksi.biaya_total) as total_setoran'),
                DB::raw('SUM(tb_transaksi.durasi_jam) as total_jam')
            )
            ->groupBy('tb_user.nama_lengkap', 'tb_user.username')
            ->orderByDesc('total_setoran')
            ->get()
            ->map(fn ($p) => [
                'nama_lengkap' => $p->nama_lengkap,
                'username' => $p->username,
                'jumlah_transaksi' => (int) $p->jumlah_transaksi,
                'total_setoran' => (int) $p->total_setoran,
                'total_jam' => (int) $p->total_jam,
                'persentase' => $totalPendapatan > 0 ? round(($p->total_setoran / $totalPendapatan) * 100, 1) : 0,
            ]);

        $transaksi = (clone $baseQuery)
            ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan', 'area:id_area,nama_area', 'user:id_user,nama_lengkap'])
            ->latest('waktu_keluar')
            ->get();

        $petugasLabel = 'Semua Petugas';
        if ($parsed['id_user']) {
            $user = User::find($parsed['id_user']);
            if ($user) {
                $petugasLabel = $user->nama_lengkap;
            }
        }

        $jenisLabel = $parsed['jenis_kendaraan'] ?: 'Semua Jenis Kendaraan';

        $pdf = Pdf::loadView('laporan.keuangan-pdf', [
            'judul' => $this->reportTitle,
            'dari' => $parsed['dari'],
            'sampai' => $parsed['sampai'],
            'petugasLabel' => $petugasLabel,
            'jenisLabel' => $jenisLabel,
            'ringkasan' => [
                'total_pendapatan' => $totalPendapatan,
                'total_transaksi' => $totalTransaksi,
                'total_jam' => $totalJam,
                'rata_rata' => $rataRata,
            ],
            'perPetugas' => $perPetugas,
            'transaksi' => $transaksi,
        ])->setPaper('a4', 'portrait');

        $fileName = $this->filePrefix.'-'.$parsed['dari']->format('Ymd').'-'.$parsed['sampai']->format('Ymd').'.pdf';

        return $pdf->download($fileName);
    }

    public function exportExcel(Request $request): StreamedResponse|RedirectResponse
    {
        $parsed = $this->parseFilters($request);
        $baseQuery = $this->buildFilteredQuery($parsed);

        $count = (clone $baseQuery)->count();
        if ($count === 0) {
            return back()->with('error', 'Tidak ada data transaksi keluar pada filter periode ini untuk di-export.');
        }

        $ringkasanRaw = (clone $baseQuery)
            ->selectRaw('COUNT(*) as total_transaksi, COALESCE(SUM(biaya_total), 0) as total_pendapatan, COALESCE(SUM(durasi_jam), 0) as total_jam')
            ->first();

        $totalPendapatan = (int) ($ringkasanRaw->total_pendapatan ?? 0);
        $totalTransaksi = (int) ($ringkasanRaw->total_transaksi ?? 0);
        $totalJam = (int) ($ringkasanRaw->total_jam ?? 0);

        $fileName = $this->filePrefix.'-'.$parsed['dari']->format('Ymd').'-'.$parsed['sampai']->format('Ymd').'.xlsx';

        $petugasLabel = 'Semua Petugas';
        if ($parsed['id_user']) {
            $user = User::find($parsed['id_user']);
            if ($user) {
                $petugasLabel = $user->nama_lengkap;
            }
        }
        $jenisLabel = $parsed['jenis_kendaraan'] ?: 'Semua Jenis';

        return response()->streamDownload(function () use ($baseQuery, $parsed, $petugasLabel, $jenisLabel, $totalTransaksi, $totalPendapatan, $totalJam) {
            $tempDir = is_dir('/tmp/antigravity') ? '/tmp/antigravity' : sys_get_temp_dir();
            $tempFile = tempnam($tempDir, 'xlsx_');

            $options = new Options;
            $writer = new Writer($options);
            $writer->openToFile($tempFile);

            $titleStyle = (new Style)->withFontBold(true)->withFontSize(13);
            $boldStyle = (new Style)->withFontBold(true);

            $writer->addRow(Row::fromValuesWithStyle([$this->excelTitle], $titleStyle));
            $writer->addRow(Row::fromValues(['Periode', $parsed['dari']->format('d/m/Y').' s/d '.$parsed['sampai']->format('d/m/Y')]));
            $writer->addRow(Row::fromValues(['Filter Petugas', $petugasLabel]));
            $writer->addRow(Row::fromValues(['Filter Kendaraan', ucfirst($jenisLabel)]));
            $writer->addRow(Row::fromValues(['Tanggal Unduh', now()->format('d/m/Y H:i:s')]));
            $writer->addRow(Row::fromValues(['Total Transaksi', $totalTransaksi.' Tiket']));
            $writer->addRow(Row::fromValues(['Total Durasi Parkir', $totalJam.' Jam']));
            $writer->addRow(Row::fromValues(['Total Pendapatan (Rp)', $totalPendapatan]));
            $writer->addRow(Row::fromValues([]));

            // Kolom data tabel
            $writer->addRow(Row::fromValuesWithStyle([
                'No',
                'ID Tiket',
                'Plat Nomor',
                'Jenis Kendaraan',
                'Area Parkir',
                'Petugas Kasir',
                'Waktu Masuk',
                'Waktu Keluar',
                'Durasi (Jam)',
                'Biaya Total (Rp)',
            ], $boldStyle));

            $nomor = 1;
            (clone $baseQuery)
                ->with(['kendaraan:id_kendaraan,plat_nomor,jenis_kendaraan', 'area:id_area,nama_area', 'user:id_user,nama_lengkap'])
                ->latest('waktu_keluar')
                ->chunk(500, function ($items) use ($writer, &$nomor) {
                    foreach ($items as $item) {
                        $writer->addRow(Row::fromValues([
                            $nomor++,
                            '#'.$item->id_parkir,
                            $item->kendaraan?->plat_nomor ?? '-',
                            ucfirst($item->kendaraan?->jenis_kendaraan ?? '-'),
                            $item->area?->nama_area ?? '-',
                            $item->user?->nama_lengkap ?? '-',
                            $item->waktu_masuk?->format('d/m/Y H:i') ?? '-',
                            $item->waktu_keluar?->format('d/m/Y H:i') ?? '-',
                            (int) ($item->durasi_jam ?? 0),
                            (int) ($item->biaya_total ?? 0),
                        ]));
                    }
                });

            $writer->addRow(Row::fromValues([]));
            $writer->addRow(Row::fromValuesWithStyle([
                'TOTAL',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                $totalJam,
                $totalPendapatan,
            ], $boldStyle));

            $writer->close();

            readfile($tempFile);
            @unlink($tempFile);
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }

    /**
     * @return array{dari: Carbon, sampai: Carbon, id_user: ?int, jenis_kendaraan: ?string}
     */
    protected function parseFilters(Request $request): array
    {
        $filters = $request->validate([
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date', 'after_or_equal:dari'],
            'id_user' => ['nullable', 'integer'],
            'jenis_kendaraan' => ['nullable', 'string', 'max:30'],
        ]);

        return [
            'dari' => Carbon::parse($filters['dari'] ?? today()->startOfMonth())->startOfDay(),
            'sampai' => Carbon::parse($filters['sampai'] ?? today())->endOfDay(),
            'id_user' => ! empty($filters['id_user']) ? (int) $filters['id_user'] : null,
            'jenis_kendaraan' => ! empty($filters['jenis_kendaraan']) ? $filters['jenis_kendaraan'] : null,
        ];
    }

    /**
     * @param  array{dari: Carbon, sampai: Carbon, id_user: ?int, jenis_kendaraan: ?string}  $filters
     * @return Builder<Transaksi>
     */
    protected function buildFilteredQuery(array $filters): Builder
    {
        return Transaksi::query()
            ->where('status', 'keluar')
            ->whereBetween('waktu_keluar', [$filters['dari'], $filters['sampai']])
            ->when($filters['id_user'], fn ($q) => $q->where('id_user', $filters['id_user']))
            ->when($filters['jenis_kendaraan'], fn ($q) => $q->whereHas('kendaraan', fn ($k) => $k->where('jenis_kendaraan', $filters['jenis_kendaraan'])));
    }
}
