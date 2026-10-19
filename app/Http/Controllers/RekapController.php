<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RekapController extends LaporanKeuanganController
{
    protected string $filePrefix = 'rekap-transaksi';

    protected string $reportTitle = 'Rekap Transaksi & Rekonsiliasi Kasir Parkir';

    protected string $excelTitle = 'REKAP TRANSAKSI DAN PENERIMAAN KAS PARKIR';

    public function index(Request $request): Response
    {
        return Inertia::render('Rekap/Index', $this->buildReportData($request));
    }
}
