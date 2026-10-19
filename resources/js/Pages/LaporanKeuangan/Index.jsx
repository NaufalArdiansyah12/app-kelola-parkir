import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import {
    Badge,
    Button,
    Card,
    EmptyRow,
    Field,
    StatCard,
    Table,
    inputClass,
} from '../../Components/ui';
import { rupiah } from '../../lib/format';

const jenisTone = {
    motor: 'green',
    mobil: 'purple',
    lainnya: 'yellow',
};

export default function LaporanKeuanganIndex({
    ringkasan,
    perPetugas = [],
    perJenis = [],
    transaksi,
    petugasOptions = [],
    jenisOptions = [],
    canExportPdf = true,
    maxPdfRecords = 1000,
    filters,
    title = 'Laporan Keuangan & Kasir',
    subtitle = 'Rekapitulasi pendapatan operasional dan audit setoran kasir',
    headTitle = 'Laporan Keuangan',
    baseUrl = '/laporan-keuangan',
    signatureRole = 'Administrator',
}) {
    const [state, setState] = useState({
        dari: filters.dari ?? '',
        sampai: filters.sampai ?? '',
        id_user: filters.id_user ?? '',
        jenis_kendaraan: filters.jenis_kendaraan ?? '',
    });

    const apply = (event) => {
        event?.preventDefault();
        router.get(baseUrl, state, { preserveState: true });
    };

    const reset = () => {
        router.get(baseUrl, {}, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const buildExportUrl = (path) => {
        const params = new URLSearchParams();
        if (state.dari) {
            params.append('dari', state.dari);
        }
        if (state.sampai) {
            params.append('sampai', state.sampai);
        }
        if (state.id_user) {
            params.append('id_user', state.id_user);
        }
        if (state.jenis_kendaraan) {
            params.append('jenis_kendaraan', state.jenis_kendaraan);
        }
        const qs = params.toString();
        return qs ? `${path}?${qs}` : path;
    };

    const isPdfDisabled = ringkasan.total_transaksi === 0 || !canExportPdf;
    const isExcelDisabled = ringkasan.total_transaksi === 0;

    return (
        <>
            <Head title={headTitle} />
            <Layout
                title={title}
                subtitle={subtitle}
            >
                {/* Print Header */}
                <div className="hidden border-b pb-4 print:block">
                    <h1 className="text-xl font-bold uppercase tracking-tight text-black">
                        {title}
                    </h1>
                    <p className="mt-1 text-xs text-muted">
                        Periode: {filters.dari} s/d {filters.sampai}
                    </p>
                </div>

                {/* Banner Peringatan Kuota PDF (> 1000) */}
                {!canExportPdf && ringkasan.total_transaksi > maxPdfRecords && (
                    <div className="flex items-center gap-3 rounded-2xl border border-pastel-yellow-text/30 bg-pastel-yellow p-4 text-xs font-medium text-pastel-yellow-text print:hidden">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="h-5 w-5 shrink-0"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                            <span className="font-bold">Batas Export PDF: </span>
                            Terdapat <strong>{ringkasan.total_transaksi.toLocaleString('id-ID')} data</strong> pada periode ini (melebihi batas {maxPdfRecords.toLocaleString('id-ID')} baris). Export PDF dinonaktifkan demi performa server. Silakan gunakan <strong>Export Excel</strong> untuk mengunduh seluruh data.
                        </div>
                    </div>
                )}

                {/* Filter Bar & Action Buttons */}
                <Card
                    title="Filter Periode & Petugas"
                    description="Sesuaikan rentang tanggal atau saring per petugas kasir"
                    className="print:hidden"
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Tombol Export Excel */}
                            <a
                                href={isExcelDisabled ? undefined : buildExportUrl(`${baseUrl}/export-excel`)}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-pastel-green-text/25 bg-pastel-green px-3.5 py-2 text-xs font-bold text-pastel-green-text transition hover:bg-[#D8E6DA] ${
                                    isExcelDisabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Unduh data format Spreadsheet CSV/Excel"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="8" y1="13" x2="16" y2="13" />
                                    <line x1="8" y1="17" x2="16" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                                Export Excel
                            </a>

                            {/* Tombol Export PDF */}
                            <a
                                href={isPdfDisabled ? undefined : buildExportUrl(`${baseUrl}/export-pdf`)}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 ${
                                    isPdfDisabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''
                                }`}
                                title={
                                    !canExportPdf
                                        ? `Data melebihi ${maxPdfRecords} baris, hanya bisa di-export ke Excel`
                                        : 'Unduh dokumen PDF'
                                }
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <path d="M9 15v-4h2a1.5 1.5 0 0 1 0 3H9" />
                                </svg>
                                Export PDF
                                {!canExportPdf && (
                                    <span className="ml-1 rounded-sm bg-red-200 px-1 text-[10px] text-red-900">
                                        &gt;1000
                                    </span>
                                )}
                            </a>

                            {/* Cetak Langsung Browser */}
                            <Button variant="secondary" onClick={handlePrint}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1 h-3.5 w-3.5"
                                >
                                    <polyline points="6 9 6 2 18 2 18 9" />
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                    <rect width="12" height="8" x="6" y="14" />
                                </svg>
                                Cetak
                            </Button>
                        </div>
                    }
                >
                    <form onSubmit={apply} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
                        <Field label="Dari Tanggal">
                            <input
                                type="date"
                                className={inputClass}
                                value={state.dari}
                                onChange={(e) => setState({ ...state, dari: e.target.value })}
                            />
                        </Field>

                        <Field label="Sampai Tanggal">
                            <input
                                type="date"
                                className={inputClass}
                                value={state.sampai}
                                onChange={(e) => setState({ ...state, sampai: e.target.value })}
                            />
                        </Field>

                        <Field label="Petugas Kasir">
                            <select
                                className={inputClass}
                                value={state.id_user}
                                onChange={(e) => setState({ ...state, id_user: e.target.value })}
                            >
                                <option value="">Semua Petugas</option>
                                {petugasOptions.map((u) => (
                                    <option key={u.id_user} value={u.id_user}>
                                        {u.nama_lengkap}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Jenis Kendaraan">
                            <select
                                className={`${inputClass} capitalize`}
                                value={state.jenis_kendaraan}
                                onChange={(e) => setState({ ...state, jenis_kendaraan: e.target.value })}
                            >
                                <option value="">Semua Jenis</option>
                                {jenisOptions.map((j) => (
                                    <option key={j} value={j} className="capitalize">
                                        {j}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                Tampilkan
                            </Button>
                            {(filters.id_user || filters.jenis_kendaraan || filters.dari !== filters.sampai) && (
                                <Button variant="secondary" onClick={reset}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total Pendapatan"
                        value={rupiah(ringkasan.total_pendapatan)}
                        hint="Penerimaan kas bersih periode ini"
                        accent="green"
                    />
                    <StatCard
                        label="Total Transaksi"
                        value={`${ringkasan.total_transaksi} tiket`}
                        hint="Kendaraan selesai parkir"
                        accent="purple"
                    />
                    <StatCard
                        label="Rata-rata / Kendaraan"
                        value={rupiah(ringkasan.rata_rata)}
                        hint="Nilai tiket rata-rata"
                        accent="neutral"
                    />
                    <StatCard
                        label="Total Durasi Parkir"
                        value={`${ringkasan.total_jam} jam`}
                        hint="Akumulasi waktu tertagih"
                        accent="yellow"
                    />
                </div>

                {/* Cashier Reconciliation & Category Breakdown */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Rekonsiliasi Kasir */}
                    <div className="lg:col-span-2">
                        <Card
                            title="Rekonsiliasi Setoran Kasir"
                            description="Rincian uang kas yang harus disetorkan oleh tiap petugas"
                        >
                            <Table head={['Petugas Kasir', 'Tiket Dilayani', 'Durasi', 'Setoran Kasir', 'Porsi']}>
                                {perPetugas.length === 0 && (
                                    <EmptyRow colSpan={5}>Tidak ada data setoran kasir pada periode ini.</EmptyRow>
                                )}
                                {perPetugas.map((petugas) => (
                                    <tr key={petugas.id_user} className="transition hover:bg-[#FAF8F3]">
                                        <td className="px-3 py-3">
                                            <p className="font-semibold text-ink">{petugas.nama_lengkap}</p>
                                            <p className="text-xs text-muted">@{petugas.username}</p>
                                        </td>
                                        <td className="px-3 py-3 font-mono text-ink">
                                            {petugas.jumlah_transaksi} tiket
                                        </td>
                                        <td className="px-3 py-3 text-xs text-[#6B665E]">
                                            {petugas.total_jam} jam
                                        </td>
                                        <td className="px-3 py-3 font-bold text-ink">
                                            {rupiah(petugas.total_setoran)}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 overflow-hidden rounded-full bg-panel-warm border border-panel-border">
                                                    <div
                                                        className="h-full bg-pastel-green-text"
                                                        style={{ width: `${Math.min(petugas.persentase, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-muted">
                                                    {petugas.persentase}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </Card>
                    </div>

                    {/* Pendapatan per Jenis Kendaraan */}
                    <Card
                        title="Per Jenis Kendaraan"
                        description="Komposisi penerimaan kas"
                    >
                        <Table head={['Jenis', 'Tiket', 'Pendapatan']}>
                            {perJenis.length === 0 && <EmptyRow colSpan={3}>Belum ada data.</EmptyRow>}
                            {perJenis.map((item) => (
                                <tr key={item.jenis_kendaraan} className="transition hover:bg-[#FAF8F3]">
                                    <td className="px-3 py-2.5">
                                        <Badge tone={jenisTone[item.jenis_kendaraan] ?? 'neutral'}>
                                            <span className="capitalize">{item.jenis_kendaraan}</span>
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2.5 font-mono text-xs text-[#6B665E]">{item.jumlah}</td>
                                    <td className="px-3 py-2.5 font-semibold text-ink">{rupiah(item.pendapatan)}</td>
                                </tr>
                            ))}
                        </Table>
                    </Card>
                </div>

                {/* Detail Transaksi Masuk Kas */}
                <Card
                    title="Rincian Transaksi Selesai (Kas Masuk)"
                    description={`${transaksi.total} transaksi berhasil ditagih pada periode ini`}
                >
                    <Table head={['No. Tiket', 'Plat Nomor', 'Jenis', 'Area', 'Petugas Kasir', 'Waktu Masuk', 'Waktu Keluar', 'Durasi', 'Biaya Total']}>
                        {transaksi.data.length === 0 && <EmptyRow colSpan={9}>Tidak ada riwayat transaksi kas masuk.</EmptyRow>}
                        {transaksi.data.map((item) => (
                            <tr key={item.id_parkir} className="transition hover:bg-[#FAF8F3]">
                                <td className="px-3 py-2.5 font-mono text-xs text-muted">#{item.id_parkir}</td>
                                <td className="px-3 py-2.5">
                                    <span className="inline-block rounded-lg border border-panel-border bg-panel-warm px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-ink">
                                        {item.plat_nomor}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5 capitalize text-xs text-[#6B665E]">
                                    {item.jenis_kendaraan}
                                </td>
                                <td className="px-3 py-2.5 text-xs text-[#6B665E]">{item.nama_area}</td>
                                <td className="px-3 py-2.5 text-xs font-medium text-ink">
                                    {item.petugas || '-'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                                    {item.waktu_masuk}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                                    {item.waktu_keluar}
                                </td>
                                <td className="px-3 py-2.5 text-xs text-[#6B665E]">{item.durasi_jam} jam</td>
                                <td className="px-3 py-2.5 font-bold text-ink">{rupiah(item.biaya_total)}</td>
                            </tr>
                        ))}
                    </Table>
                    <div className="print:hidden">
                        <Pagination paginator={transaksi} />
                    </div>
                </Card>

                {/* Print Signatures */}
                <div className="hidden pt-8 print:grid grid-cols-2 gap-8 text-center text-xs text-black">
                    <div>
                        <p className="font-semibold">Petugas Kasir Penanggung Jawab,</p>
                        <div className="h-16" />
                        <p className="border-t border-black inline-block px-8 pt-1">
                            ( ..................................................... )
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold">Mengetahui ({signatureRole}),</p>
                        <div className="h-16" />
                        <p className="border-t border-black inline-block px-8 pt-1">
                            ( ..................................................... )
                        </p>
                    </div>
                </div>
            </Layout>
        </>
    );
}
