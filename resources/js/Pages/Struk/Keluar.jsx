import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { rupiah } from '../../lib/format';

export default function StrukKeluar({ transaksi }) {
    useEffect(() => {
        const timer = setTimeout(() => window.print(), 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title="Nota Pembayaran" />
            <div className="flex min-h-screen items-start justify-center bg-panel-warm p-4 print:block print:bg-white print:p-0">
                <div className="w-full max-w-xs">
                    <div className="rounded-lg border border-dashed border-[#C9C2B4] bg-white p-4 font-mono text-xs text-ink print:border-0">
                        <div className="text-center">
                            <p className="text-sm font-bold tracking-wide">NOTA PEMBAYARAN</p>
                            <p className="text-[10px]">SISTEM MANAJEMEN PARKIR</p>
                            <p className="mt-1 text-[10px]">No. #{transaksi.id_parkir}</p>
                        </div>

                        <div className="my-3 border-t border-dashed border-panel-border" />

                        <Line label="Plat" value={transaksi.plat_nomor} />
                        <Line label="Jenis" value={transaksi.jenis_kendaraan} />
                        <Line label="Area" value={transaksi.nama_area} />
                        <Line label="Slot" value={transaksi.slot || '-'} />
                        <Line label="Masuk" value={transaksi.waktu_masuk} />
                        <Line label="Keluar" value={transaksi.waktu_keluar} />
                        <Line label="Durasi" value={`${transaksi.durasi_jam} jam`} />
                        <Line label="Tarif/Jam" value={rupiah(transaksi.tarif_per_jam)} />

                        <div className="my-3 border-t border-dashed border-panel-border" />

                        <div className="flex justify-between text-sm font-bold">
                            <span>TOTAL</span>
                            <span>{rupiah(transaksi.biaya_total)}</span>
                        </div>

                        <div className="my-3 border-t border-dashed border-panel-border" />

                        <p className="text-center text-[10px]">
                            Terima kasih telah menggunakan layanan parkir kami.
                            <br />
                            Petugas: {transaksi.petugas}
                        </p>
                    </div>

                    <div className="mt-4 flex gap-2 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-black"
                        >
                            Cetak Ulang
                        </button>
                        <Link
                            href="/transaksi"
                            className="flex-1 rounded-lg bg-panel-warm px-3 py-2 text-center text-sm text-ink hover:bg-[#E1DACB]"
                        >
                            Selesai
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function Line({ label, value }) {
    return (
        <div className="flex justify-between gap-3 py-0.5">
            <span>{label}</span>
            <span className="text-right font-semibold capitalize">{value}</span>
        </div>
    );
}
