import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { rupiah } from '../../lib/format';

export default function StrukMasuk({ transaksi }) {
    useEffect(() => {
        const timer = setTimeout(() => window.print(), 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title="Karcis Masuk" />
            <div className="flex min-h-screen items-start justify-center bg-panel-warm p-4 print:block print:bg-white print:p-0">
                <div className="w-full max-w-xs">
                    <div className="rounded-lg border border-dashed border-[#C9C2B4] bg-white p-4 font-mono text-xs text-ink print:border-0">
                        <div className="text-center">
                            <p className="text-sm font-bold tracking-wide">KARCIS MASUK</p>
                            <p className="text-[10px]">SISTEM MANAJEMEN PARKIR</p>
                            <p className="mt-1 text-[10px]">No. #{transaksi.id_parkir}</p>
                        </div>

                        <div className="my-3 border-t border-dashed border-panel-border" />

                        <Line label="Plat" value={transaksi.plat_nomor} />
                        <Line label="Jenis" value={transaksi.jenis_kendaraan} />
                        <Line label="Warna" value={transaksi.warna || '-'} />
                        <Line label="Area" value={transaksi.nama_area} />
                        <Line label="Slot" value={transaksi.slot || '-'} />
                        <Line label="Masuk" value={transaksi.waktu_masuk} />
                        <Line label="Tarif/Jam" value={rupiah(transaksi.tarif_per_jam)} />
                        <Line label="Petugas" value={transaksi.petugas} />

                        <div className="my-3 border-t border-dashed border-panel-border" />

                        <div className="my-2 flex flex-col items-center justify-center">
                            <div className="rounded-xl border border-panel-border bg-white p-3 shadow-2xs">
                                <QRCodeSVG
                                    value={String(transaksi.id_parkir)}
                                    size={160}
                                    level="M"
                                    includeMargin={true}
                                />
                            </div>
                            <span className="mt-1.5 font-mono text-xs font-bold tracking-wider text-ink">
                                #{transaksi.id_parkir}
                            </span>
                            <span className="text-[9px] text-muted">
                                Scan QR ini pada pos check-out keluar
                            </span>
                        </div>

                        <div className="my-3 border-t border-dashed border-panel-border" />

                        <p className="text-center text-[10px]">
                            Simpan karcis ini sebagai bukti parkir.
                            <br />
                            Kehilangan karcis dianggap parkir 1 hari.
                        </p>
                    </div>

                    <div className="mt-4 flex gap-2 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-black"
                        >
                            Cetak
                        </button>
                        <Link
                            href="/transaksi/masuk"
                            className="flex-1 rounded-lg bg-panel-warm px-3 py-2 text-center text-sm text-ink hover:bg-[#E1DACB]"
                        >
                            Transaksi Baru
                        </Link>
                    </div>
                    <Link
                        href="/transaksi"
                        className="mt-2 block text-center text-sm text-muted hover:underline print:hidden"
                    >
                        Kembali ke daftar parkir
                    </Link>
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
