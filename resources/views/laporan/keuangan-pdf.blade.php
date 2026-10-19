<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan Parkir</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            margin: 0;
            padding: 15px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header h1 {
            font-size: 16px;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 2px 0;
            color: #555;
            font-size: 10px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 12px;
            font-size: 10px;
        }
        .meta-table td {
            padding: 2px 0;
        }
        .summary-box {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .summary-box td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            background-color: #fcfcfc;
        }
        .summary-box .label {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
        }
        .summary-box .value {
            font-size: 13px;
            font-weight: bold;
            margin-top: 3px;
            color: #111;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            margin: 12px 0 6px 0;
            text-transform: uppercase;
            color: #333;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #ccc;
            padding: 5px 6px;
            text-align: left;
        }
        table.data-table th {
            background-color: #f0f0f0;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .mono {
            font-family: monospace;
            font-size: 10px;
        }
        .signatures {
            margin-top: 25px;
            width: 100%;
            page-break-inside: avoid;
        }
        .signatures td {
            width: 50%;
            text-align: center;
            font-size: 10px;
        }
        .sign-space {
            height: 55px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $judul ?? 'Laporan Keuangan & Rekonsiliasi Kasir Parkir' }}</h1>
        <p>Sistem Pengelolaan Parkir - Dokumen Resmi Penerimaan Kas</p>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 50%;"><strong>Periode:</strong> {{ $dari->format('d/m/Y') }} s/d {{ $sampai->format('d/m/Y') }}</td>
            <td style="width: 50%; text-align: right;"><strong>Tanggal Unduh:</strong> {{ now()->locale('id')->isoFormat('D MMMM Y, HH:mm') }}</td>
        </tr>
        <tr>
            <td><strong>Filter Petugas:</strong> {{ $petugasLabel }}</td>
            <td style="text-align: right;"><strong>Filter Kendaraan:</strong> {{ ucfirst($jenisLabel) }}</td>
        </tr>
    </table>

    <table class="summary-box">
        <tr>
            <td>
                <div class="label">Total Pendapatan</div>
                <div class="value">Rp {{ number_format($ringkasan['total_pendapatan'], 0, ',', '.') }}</div>
            </td>
            <td>
                <div class="label">Total Transaksi</div>
                <div class="value">{{ number_format($ringkasan['total_transaksi'], 0, ',', '.') }} Tiket</div>
            </td>
            <td>
                <div class="label">Total Durasi</div>
                <div class="value">{{ number_format($ringkasan['total_jam'], 0, ',', '.') }} Jam</div>
            </td>
            <td>
                <div class="label">Rata-rata / Tiket</div>
                <div class="value">Rp {{ number_format($ringkasan['rata_rata'], 0, ',', '.') }}</div>
            </td>
        </tr>
    </table>

    @if(count($perPetugas) > 0)
        <div class="section-title">Rekonsiliasi Kasir & Setoran Petugas</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th>Nama Kasir</th>
                    <th>Username</th>
                    <th class="text-center">Tiket</th>
                    <th class="text-center">Durasi</th>
                    <th class="text-right">Total Setoran Kas</th>
                    <th class="text-right">Porsi</th>
                </tr>
            </thead>
            <tbody>
                @foreach($perPetugas as $index => $petugas)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td><strong>{{ $petugas['nama_lengkap'] }}</strong></td>
                        <td>{{ $petugas['username'] }}</td>
                        <td class="text-center">{{ $petugas['jumlah_transaksi'] }}</td>
                        <td class="text-center">{{ $petugas['total_jam'] }} jam</td>
                        <td class="text-right font-bold">Rp {{ number_format($petugas['total_setoran'], 0, ',', '.') }}</td>
                        <td class="text-right">{{ $petugas['persentase'] }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="section-title">Rincian Transaksi Selesai ({{ count($transaksi) }} Baris Data)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 8%;">ID</th>
                <th style="width: 15%;">Plat Nomor</th>
                <th style="width: 10%;">Jenis</th>
                <th style="width: 14%;">Area</th>
                <th style="width: 14%;">Kasir</th>
                <th style="width: 13%;">Keluar</th>
                <th style="width: 8%;" class="text-center">Durasi</th>
                <th style="width: 14%;" class="text-right">Biaya (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transaksi as $i => $item)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td class="mono">#{{ $item->id_parkir }}</td>
                    <td class="mono"><strong>{{ $item->kendaraan?->plat_nomor ?? '-' }}</strong></td>
                    <td style="text-transform: capitalize;">{{ $item->kendaraan?->jenis_kendaraan ?? '-' }}</td>
                    <td>{{ $item->area?->nama_area ?? '-' }}</td>
                    <td>{{ $item->user?->nama_lengkap ?? '-' }}</td>
                    <td>{{ $item->waktu_keluar?->format('d/m/y H:i') ?? '-' }}</td>
                    <td class="text-center">{{ $item->durasi_jam }} jam</td>
                    <td class="text-right">Rp {{ number_format($item->biaya_total, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center">Tidak ada transaksi pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="signatures">
        <tr>
            <td>
                Petugas Kasir Penanggung Jawab,
                <div class="sign-space"></div>
                ( .................................................... )
            </td>
            <td>
                Mengetahui (Administrator),
                <div class="sign-space"></div>
                ( .................................................... )
            </td>
        </tr>
    </table>
</body>
</html>
