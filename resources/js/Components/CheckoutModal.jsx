import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge, Button, Modal, inputClass } from './ui';
import { rupiah } from '../lib/format';

export default function CheckoutModal({ open, onClose, transaksi }) {
    const [uangDiterima, setUangDiterima] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open && transaksi) {
            setUangDiterima('');
            setProcessing(false);
        }
    }, [open, transaksi]);

    if (!transaksi) {
        return null;
    }

    const biayaTotal = Number(transaksi.perkiraan_biaya ?? transaksi.biaya_total ?? 0);
    const nominalBayar = parseInt(String(uangDiterima).replace(/\D/g, '') || '0', 10);
    const kembalian = nominalBayar - biayaTotal;
    const uangCukup = nominalBayar >= biayaTotal;

    const setUangPas = () => {
        setUangDiterima(String(biayaTotal));
    };

    const tambahUang = (nominal) => {
        setUangDiterima(String(nominal));
    };

    const handleBayar = () => {
        if (!uangCukup) {
            alert('Uang yang dibayarkan masih kurang.');
            return;
        }

        router.post(
            `/transaksi/${transaksi.id_parkir}/bayar`,
            {},
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    onClose();
                },
            },
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Check-Out Tiket #${transaksi.id_parkir}`}
            description="Konfirmasi pembayaran kasir dan cetak struk parkir keluar"
            size="md"
        >
            <div className="space-y-4">
                {/* Ringkasan Kendaraan */}
                <div className="flex items-center justify-between rounded-xl bg-panel-warm p-4">
                    <div>
                        <span className="text-[10px] font-bold tracking-wider text-muted">KENDARAAN</span>
                        <p className="mt-0.5 font-mono text-xl font-black text-ink">{transaksi.plat_nomor}</p>
                        <p className="text-xs text-muted">
                            {transaksi.nama_area || transaksi.area?.nama_area || 'Area Parkir'}{' '}
                            {transaksi.slot ? `• Slot ${transaksi.slot}` : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge tone="purple">
                            <span className="capitalize">{transaksi.jenis_kendaraan || transaksi.kendaraan?.jenis_kendaraan}</span>
                        </Badge>
                        <p className="mt-1 text-xs text-muted">Masuk: {transaksi.waktu_masuk}</p>
                    </div>
                </div>

                {/* Perhitungan Biaya */}
                <div className="space-y-2 rounded-xl border border-panel-border bg-white p-3.5 text-xs">
                    <div className="flex justify-between text-muted">
                        <span>Tarif / Jam</span>
                        <span className="font-medium text-ink">
                            {rupiah(transaksi.tarif_per_jam || transaksi.tarif?.tarif_per_jam || 0)}
                        </span>
                    </div>
                    <div className="flex justify-between text-muted">
                        <span>Durasi Parkir</span>
                        <span className="font-medium text-ink">
                            {transaksi.durasi ?? transaksi.perkiraan_durasi ?? 1} jam (dibulatkan)
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-panel-border pt-2 text-sm font-extrabold text-ink">
                        <span>Total Tagihan</span>
                        <span className="text-xl font-black text-accent">{rupiah(biayaTotal)}</span>
                    </div>
                </div>

                {/* Form Uang Tunai */}
                <div className="space-y-2.5 rounded-xl border border-panel-border bg-[#FAF8F3] p-3.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B665E]">
                            Uang Tunai Diterima (Rp)
                        </label>
                        <button
                            type="button"
                            onClick={setUangPas}
                            className="rounded-lg border border-panel-border bg-white px-2 py-0.5 text-[11px] font-bold text-ink hover:bg-panel-warm active:scale-95"
                        >
                            Uang Pas
                        </button>
                    </div>

                    <input
                        autoFocus
                        type="number"
                        min="0"
                        step="1000"
                        className={`${inputClass} text-base font-bold text-ink`}
                        placeholder="0"
                        value={uangDiterima}
                        onChange={(e) => setUangDiterima(e.target.value)}
                    />

                    {/* Shortcut Nominal */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {[5000, 10000, 20000, 50000, 100000].map((nominal) => (
                            <button
                                key={nominal}
                                type="button"
                                onClick={() => tambahUang(nominal)}
                                className="rounded-lg border border-panel-border bg-white px-2 py-1 text-[11px] font-semibold text-ink hover:bg-panel-warm active:scale-95"
                            >
                                {nominal.toLocaleString('id-ID')}
                            </button>
                        ))}
                    </div>

                    {/* Status Kembalian */}
                    {nominalBayar > 0 && (
                        <div
                            className={`flex items-center justify-between rounded-lg p-2.5 text-xs font-bold ${
                                kembalian >= 0 ? 'bg-pastel-green text-pastel-green-text' : 'bg-red-50 text-red-600'
                            }`}
                        >
                            <span>{kembalian >= 0 ? 'Kembalian:' : 'Uang Masih Kurang:'}</span>
                            <span className="text-sm font-black">{rupiah(Math.abs(kembalian))}</span>
                        </div>
                    )}
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose} disabled={processing}>
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleBayar}
                        disabled={processing || !uangCukup}
                        className="py-2.5 text-xs font-bold"
                    >
                        {processing ? 'Memproses...' : 'Bayar & Cetak Nota Keluar'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
