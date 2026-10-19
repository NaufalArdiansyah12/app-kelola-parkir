import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CheckoutModal from '../../Components/CheckoutModal';
import Layout from '../../Components/Layout';
import { Badge, Button, Card, EmptyRow, Table, inputClass } from '../../Components/ui';
import { rupiah } from '../../lib/format';

export default function Checkout({ selected, aktif = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [modalTransaksi, setModalTransaksi] = useState(selected ?? null);

    useEffect(() => {
        if (selected) {
            setModalTransaksi(selected);
        }
    }, [selected]);

    const handleSearch = (event) => {
        event.preventDefault();
        if (!search.trim()) return;

        router.get('/transaksi/keluar', { search: search.trim() }, { preserveState: true });
    };

    const resetSearch = () => {
        setSearch('');
        setModalTransaksi(null);
        router.get('/transaksi/keluar');
    };

    const pilihTransaksi = (id) => {
        setUangDiterima('');
        router.get('/transaksi/keluar', { id }, { preserveState: true });
    };

    const setUangPas = () => {
        setUangDiterima(String(biayaTotal));
    };

    const tambahUang = (nominal) => {
        setUangDiterima(String(nominal));
    };

    const bayar = () => {
        if (!selected) return;

        if (nominalBayar > 0 && nominalBayar < biayaTotal) {
            alert('Uang yang dibayarkan masih kurang.');
            return;
        }

        if (
            !confirm(
                `Konfirmasi pembayaran tiket #${selected.id_parkir} (${selected.plat_nomor}) sebesar ${rupiah(
                    biayaTotal,
                )}?`,
            )
        ) {
            return;
        }

        router.post(
            `/transaksi/${selected.id_parkir}/bayar`,
            {},
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="Pos Check-Out & Kasir" />
            <Layout title="Pos Check-Out & Kasir" subtitle="Proses pembayaran kendaraan keluar dan pencetakan nota">
                {/* Scanner / Barcode / Ticket Search Bar */}
                <Card className="p-4 sm:p-5">
                    <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </span>
                            <input
                                autoFocus={!selected}
                                className={`${inputClass} pl-10 text-base font-mono uppercase tracking-wider`}
                                placeholder="Scan tiket / ketik No. Tiket atau Plat Nomor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" variant="primary" className="px-5 py-2.5">
                                Cari Kendaraan
                            </Button>
                            {(search || selected) && (
                                <Button type="button" variant="secondary" onClick={resetSearch} className="py-2.5">
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Sesi Pembayaran Aktif jika ada kendaraan terpilih */}
                {selected && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Data Kendaraan */}
                        <Card title="Detail Kendaraan Masuk">
                            <div className="mb-4 flex items-center justify-between rounded-xl bg-panel-warm p-4">
                                <div>
                                    <span className="text-[11px] font-semibold tracking-wide text-muted">NO. TIKET</span>
                                    <p className="font-mono text-2xl font-black text-ink">#{selected.id_parkir}</p>
                                </div>
                                <div className="text-right">
                                    <Badge tone="purple">
                                        <span className="capitalize">{selected.jenis_kendaraan}</span>
                                    </Badge>
                                    <p className="mt-1 font-mono text-xl font-extrabold text-ink">{selected.plat_nomor}</p>
                                </div>
                            </div>

                            <dl className="space-y-2.5 text-sm">
                                <Row label="Pemilik / Supir" value={selected.pemilik || '-'} />
                                <Row label="Warna Kendaraan" value={selected.warna || '-'} />
                                <Row label="Area Parkir" value={selected.nama_area} />
                                <Row label="Nomor Slot" value={selected.slot || '-'} mono />
                                <Row label="Waktu Masuk" value={selected.waktu_masuk} />
                                <Row label="Petugas Pos Masuk" value={selected.petugas || '-'} />
                            </dl>

                            <div className="mt-5 border-t border-[#EFEAE0] pt-4">
                                <Button
                                    variant="secondary"
                                    onClick={resetSearch}
                                    className="w-full text-xs"
                                >
                                    Pilih Kendaraan Lain
                                </Button>
                            </div>
                        </Card>

                        {/* Kasir & Hitung Biaya */}
                        <Card title="Kasir Pembayaran">
                            <dl className="space-y-2 text-sm">
                                <Row label="Tarif / Jam" value={rupiah(selected.tarif_per_jam)} />
                                <Row label="Durasi Parkir" value={`${selected.perkiraan_durasi} jam (dibulatkan)`} />
                                <div className="flex items-center justify-between border-t border-panel-border pt-3">
                                    <dt className="text-base font-extrabold text-ink">Total Tagihan</dt>
                                    <dd className="text-2xl font-black text-accent">{rupiah(biayaTotal)}</dd>
                                </div>
                            </dl>

                            {/* Kalkulator Tunai */}
                            <div className="mt-5 space-y-3 rounded-2xl border border-panel-border bg-[#FAF8F3] p-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B665E]">
                                        Uang Tunai Diterima (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        className={`${inputClass} text-lg font-bold text-ink`}
                                        placeholder="0"
                                        value={uangDiterima}
                                        onChange={(e) => setUangDiterima(e.target.value)}
                                    />
                                </div>

                                {/* Shortcut Pecahan Uang */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={setUangPas}
                                        className="rounded-lg border border-panel-border bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:bg-panel-warm active:scale-95"
                                    >
                                        Uang Pas
                                    </button>
                                    {[5000, 10000, 20000, 50000, 100000].map((nominal) => (
                                        <button
                                            key={nominal}
                                            type="button"
                                            onClick={() => tambahUang(nominal)}
                                            className="rounded-lg border border-panel-border bg-white px-2.5 py-1 text-xs font-medium text-ink hover:bg-panel-warm active:scale-95"
                                        >
                                            {nominal.toLocaleString('id-ID')}
                                        </button>
                                    ))}
                                </div>

                                {/* Status Kembalian */}
                                {nominalBayar > 0 && (
                                    <div
                                        className={`flex items-center justify-between rounded-xl p-3 text-sm font-bold ${
                                            kembalian >= 0
                                                ? 'bg-pastel-green text-pastel-green-text'
                                                : 'bg-red-50 text-red-600'
                                        }`}
                                    >
                                        <span>{kembalian >= 0 ? 'Kembalian:' : 'Uang Kurang:'}</span>
                                        <span className="text-base font-extrabold">{rupiah(Math.abs(kembalian))}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 flex gap-2">
                                <Button
                                    onClick={bayar}
                                    disabled={processing || !uangCukup}
                                    className="flex-1 py-3 text-sm font-extrabold"
                                >
                                    {processing ? 'Memproses Bayar...' : 'Bayar & Cetak Nota Keluar'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Daftar Kendaraan Siap Check-Out */}
                <Card
                    title="Kendaraan Parkir Aktif"
                    description="Pilih kendaraan dari daftar bila pengendara tidak membawa tiket atau nomor tiket hilang"
                >
                    <Table head={['No. Tiket', 'Plat Nomor', 'Jenis', 'Area & Slot', 'Waktu Masuk', 'Durasi', 'Estimasi Biaya', 'Aksi']}>
                        {aktif.length === 0 && (
                            <EmptyRow colSpan={8}>Tidak ada kendaraan yang sedang parkir.</EmptyRow>
                        )}
                        {aktif.map((item) => {
                            const isSelected = selected?.id_parkir === item.id_parkir;

                            return (
                                <tr
                                    key={item.id_parkir}
                                    className={`transition ${isSelected ? 'bg-pastel-yellow/70 font-semibold' : 'hover:bg-panel-warm/50'}`}
                                >
                                    <td className="px-3 py-3 font-mono font-bold text-ink">#{item.id_parkir}</td>
                                    <td className="px-3 py-3">
                                        <p className="font-mono font-bold text-ink">{item.plat_nomor}</p>
                                        <p className="text-[11px] text-muted">{item.warna || '-'}</p>
                                    </td>
                                    <td className="px-3 py-3">
                                        <Badge tone="purple">
                                            <span className="capitalize">{item.jenis_kendaraan}</span>
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-3 text-[#6B665E]">
                                        {item.area} {item.slot ? `(${item.slot})` : ''}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-muted">{item.waktu_masuk}</td>
                                    <td className="px-3 py-3 text-ink">{item.durasi} jam</td>
                                    <td className="px-3 py-3 font-semibold text-accent">{rupiah(item.estimasi_biaya)}</td>
                                    <td className="px-3 py-3">
                                        <Button
                                            variant="primary"
                                            className="px-3 py-1 text-xs font-bold"
                                            onClick={() => setModalTransaksi(item)}
                                        >
                                            Proses Check-Out
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </Table>
                </Card>

                <CheckoutModal
                    open={Boolean(modalTransaksi)}
                    onClose={() => setModalTransaksi(null)}
                    transaksi={modalTransaksi}
                />
            </Layout>
        </>
    );
}

function Row({ label, value, mono = false }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[#F4EFE6] pb-2 last:border-b-0">
            <dt className="text-muted">{label}</dt>
            <dd className={`text-right font-semibold text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
        </div>
    );
}
