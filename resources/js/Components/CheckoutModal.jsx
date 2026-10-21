import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { rupiah } from '../lib/format';

/* ========================================================================= */
/* MODERN SVG ICONS (NO EMOJIS)                                              */
/* ========================================================================= */
function IconArrowLeft({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function IconBanknote({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="12" x="2" y="6" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
        </svg>
    );
}

function IconBuildingBank({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 3 7h18l-9-5z" />
        </svg>
    );
}

function IconArrowPath({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
        </svg>
    );
}

function IconExternalLink({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
        </svg>
    );
}

function IconCheck({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function IconCopy({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    );
}

function IconBookmark({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18l-7-4-7 4V4z" />
        </svg>
    );
}

/* ========================================================================= */
/* SNAP SCRIPT LOADER                                                        */
/* ========================================================================= */
const loadSnapScript = (clientKey, isProduction) => {
    return new Promise((resolve) => {
        if (window.snap) {
            resolve(window.snap);
            return;
        }
        const scriptId = 'midtrans-snap-script';
        if (document.getElementById(scriptId)) {
            const check = setInterval(() => {
                if (window.snap) {
                    clearInterval(check);
                    resolve(window.snap);
                }
            }, 100);
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey || '');
        script.onload = () => resolve(window.snap);
        script.onerror = () => resolve(null);
        document.body.appendChild(script);
    });
};

/* ========================================================================= */
/* CHECKOUT MODAL COMPONENT                                                  */
/* ========================================================================= */
export default function CheckoutModal({ open, onClose, transaksi }) {
    const { midtrans } = usePage().props;
    const clientKey = midtrans?.client_key || '';
    const isProduction = Boolean(midtrans?.is_production);

    const [view, setView] = useState('select'); // 'select' | 'qris' | 'va' | 'card' | 'tunai' | 'success'
    const [selectedMethod, setSelectedMethod] = useState('qris');
    const [uangDiterima, setUangDiterima] = useState('');
    const [processing, setProcessing] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [qrisData, setQrisData] = useState(null);
    const [vaData, setVaData] = useState(null);
    const [snapToken, setSnapToken] = useState('');
    const [successData, setSuccessData] = useState(null);
    const [copied, setCopied] = useState(false);

    const pollTimerRef = useRef(null);

    useEffect(() => {
        if (open && transaksi) {
            setView('select');
            setSelectedMethod('qris');
            setUangDiterima('');
            setProcessing(false);
            setLoadingDetail(false);
            setErrorMessage('');
            setQrisData(null);
            setVaData(null);
            setSnapToken('');
            setSuccessData(null);
            setCopied(false);
        }

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
            }
        };
    }, [open, transaksi]);

    useEffect(() => {
        if ((view === 'qris' || view === 'va' || view === 'card') && open && transaksi) {
            pollTimerRef.current = setInterval(() => {
                cekStatusPembayaran(false);
            }, 3000);
        } else if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
        }

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
            }
        };
    }, [view, open, transaksi]);

    if (!open || !transaksi) {
        return null;
    }

    const biayaTotal = Number(transaksi.perkiraan_biaya ?? transaksi.biaya_total ?? 0);
    const biayaAdmin = 0;
    const totalTagihan = biayaTotal + biayaAdmin;
    const nominalBayar = parseInt(String(uangDiterima).replace(/\D/g, '') || '0', 10);
    const kembalian = nominalBayar - totalTagihan;
    const uangCukup = nominalBayar >= totalTagihan;

    const getMethodName = (key) => {
        switch (key) {
            case 'qris': return 'GoPay / QRIS';
            case 'bca_va': return 'BCA Virtual Account';
            case 'bni_va': return 'BNI Virtual Account';
            case 'card': return 'Credit Card';
            case 'tunai': return 'Tunai (Cash)';
            default: return 'Midtrans Digital';
        }
    };

    const cekStatusPembayaran = async (manual = false) => {
        try {
            const res = await fetch(`/transaksi/${transaksi.id_parkir}/midtrans-status`);
            if (!res.ok) return;

            const data = await res.json();
            if (data.selesai) {
                if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                setSuccessData({
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    method: getMethodName(selectedMethod),
                    target: transaksi.plat_nomor || `#PARKIR-${transaksi.id_parkir}`,
                    transferAmount: biayaTotal,
                    additionalCost: biayaAdmin,
                    total: totalTagihan,
                    redirect: data.redirect || `/transaksi/${transaksi.id_parkir}/struk-keluar`,
                });
                setView('success');
            } else if (manual) {
                alert('Status: Masih menunggu pembayaran dari pelanggan.');
            }
        } catch {
            // silent polling
        }
    };

    const handleLanjutBayar = async () => {
        setErrorMessage('');

        if (selectedMethod === 'tunai') {
            setView('tunai');
            return;
        }

        if (selectedMethod === 'qris') {
            setView('qris');
            if (!qrisData) {
                setLoadingDetail(true);
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    const res = await fetch(`/transaksi/${transaksi.id_parkir}/midtrans-qris`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Gagal memuat QRIS');
                    setQrisData(data);
                } catch (err) {
                    setErrorMessage(err.message || 'Gagal membuat tagihan QRIS');
                } finally {
                    setLoadingDetail(false);
                }
            }
            return;
        }

        if (selectedMethod === 'bca_va' || selectedMethod === 'bni_va') {
            const bank = selectedMethod === 'bca_va' ? 'bca' : 'bni';
            setView('va');
            if (!vaData || vaData.bank.toLowerCase() !== bank) {
                setLoadingDetail(true);
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    const res = await fetch(`/transaksi/${transaksi.id_parkir}/midtrans-va`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                        body: JSON.stringify({ bank }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Gagal memuat VA');
                    setVaData(data);
                } catch (err) {
                    setErrorMessage(err.message || 'Gagal membuat tagihan Virtual Account');
                } finally {
                    setLoadingDetail(false);
                }
            }
            return;
        }

        if (selectedMethod === 'card') {
            setView('card');
            if (!snapToken) {
                setLoadingDetail(true);
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    const res = await fetch(`/transaksi/${transaksi.id_parkir}/snap-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Gagal memuat Snap Token');
                    setSnapToken(data.snap_token);

                    await loadSnapScript(clientKey, isProduction);
                    setTimeout(() => {
                        if (window.snap && data.snap_token) {
                            window.snap.embed(data.snap_token, {
                                embedId: 'snap-embed-container',
                                onSuccess: () => cekStatusPembayaran(true),
                                onPending: () => alert('Menunggu pembayaran diselesaikan.'),
                                onError: () => alert('Pembayaran gagal atau dibatalkan.'),
                            });
                        }
                    }, 200);
                } catch (err) {
                    setErrorMessage(err.message || 'Gagal memuat formulir kartu');
                } finally {
                    setLoadingDetail(false);
                }
            }
        }
    };

    const handleBayarTunaiSelesai = () => {
        if (!uangCukup) {
            alert('Uang yang dibayarkan masih kurang.');
            return;
        }

        setProcessing(true);
        router.post(
            `/transaksi/${transaksi.id_parkir}/bayar`,
            {},
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    setSuccessData({
                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        method: 'Tunai (Cash)',
                        target: transaksi.plat_nomor || `#PARKIR-${transaksi.id_parkir}`,
                        transferAmount: biayaTotal,
                        additionalCost: biayaAdmin,
                        total: totalTagihan,
                        redirect: `/transaksi/${transaksi.id_parkir}/struk-keluar`,
                    });
                    setView('success');
                },
            },
        );
    };

    const handleKonfirmasiMidtransKasir = () => {
        setProcessing(true);
        router.post(
            `/transaksi/${transaksi.id_parkir}/selesai-midtrans`,
            {
                order_id: qrisData?.order_id || vaData?.order_id || `PARKIR-${transaksi.id_parkir}`,
                status: 'settlement',
            },
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    setSuccessData({
                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        method: getMethodName(selectedMethod),
                        target: transaksi.plat_nomor || `#PARKIR-${transaksi.id_parkir}`,
                        transferAmount: biayaTotal,
                        additionalCost: biayaAdmin,
                        total: totalTagihan,
                        redirect: `/transaksi/${transaksi.id_parkir}/struk-keluar`,
                    });
                    setView('success');
                },
            },
        );
    };

    const salinNomorVA = (nomor) => {
        navigator.clipboard?.writeText(nomor);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-[32px] bg-[#F7F8FA] p-6 shadow-2xl transition-all">
                {/* ======================================================== */}
                {/* SCREEN 1: PAYMENT METHOD SELECTION                       */}
                {/* ======================================================== */}
                {view === 'select' && (
                    <div className="space-y-4">
                        {/* Top Header */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xs transition hover:bg-neutral-100 active:scale-95"
                                aria-label="Tutup"
                            >
                                <IconArrowLeft className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold tracking-tight text-neutral-900">
                                Payment Method
                            </h3>
                            <div className="w-9" />
                        </div>

                        {/* List Payment Method Cards */}
                        <div className="space-y-2.5 pt-1">
                            {/* Option 1: Credit Card */}
                            <div
                                onClick={() => setSelectedMethod('card')}
                                className={`flex cursor-pointer items-center justify-between rounded-2xl bg-white p-3.5 shadow-2xs transition-all border ${
                                    selectedMethod === 'card'
                                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                                        : 'border-neutral-100 hover:border-neutral-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100">
                                        <div className="flex -space-x-1.5">
                                            <span className="h-4 w-4 rounded-full bg-[#EB001B] opacity-95" />
                                            <span className="h-4 w-4 rounded-full bg-[#F79E1B] opacity-95" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Credit Card</p>
                                        <p className="text-[11px] font-medium text-neutral-400">Visa, Mastercard, JCB</p>
                                    </div>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                    selectedMethod === 'card' ? 'border-neutral-900' : 'border-neutral-300'
                                }`}>
                                    {selectedMethod === 'card' && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                                </div>
                            </div>

                            {/* Option 2: GoPay / QRIS (BI SNAP) */}
                            <div
                                onClick={() => setSelectedMethod('qris')}
                                className={`flex cursor-pointer items-center justify-between rounded-2xl bg-white p-3.5 shadow-2xs transition-all border ${
                                    selectedMethod === 'qris'
                                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                                        : 'border-neutral-100 hover:border-neutral-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100">
                                        <div className="rounded bg-[#E31B23] px-1.5 py-0.5 font-mono text-[9px] font-black text-white tracking-tight">
                                            QRIS
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">GoPay / QRIS</p>
                                        <p className="text-[11px] font-medium text-neutral-400">BI SNAP Standard • Semua e-Wallet & Bank</p>
                                    </div>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                    selectedMethod === 'qris' ? 'border-neutral-900' : 'border-neutral-300'
                                }`}>
                                    {selectedMethod === 'qris' && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                                </div>
                            </div>

                            {/* Option 3: BCA Virtual Account */}
                            <div
                                onClick={() => setSelectedMethod('bca_va')}
                                className={`flex cursor-pointer items-center justify-between rounded-2xl bg-white p-3.5 shadow-2xs transition-all border ${
                                    selectedMethod === 'bca_va'
                                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                                        : 'border-neutral-100 hover:border-neutral-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00529C]/10 font-black text-[#00529C] text-xs">
                                        BCA
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">BCA Virtual Account</p>
                                        <p className="text-[11px] font-medium text-neutral-400">m-BCA, KlikBCA, ATM BCA</p>
                                    </div>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                    selectedMethod === 'bca_va' ? 'border-neutral-900' : 'border-neutral-300'
                                }`}>
                                    {selectedMethod === 'bca_va' && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                                </div>
                            </div>

                            {/* Option 4: Bank Transfer VA (BNI / BRI) */}
                            <div
                                onClick={() => setSelectedMethod('bni_va')}
                                className={`flex cursor-pointer items-center justify-between rounded-2xl bg-white p-3.5 shadow-2xs transition-all border ${
                                    selectedMethod === 'bni_va'
                                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                                        : 'border-neutral-100 hover:border-neutral-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-700 border border-neutral-100">
                                        <IconBuildingBank className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Bank Transfer (VA)</p>
                                        <p className="text-[11px] font-medium text-neutral-400">BNI, BRI, Mandiri Bill</p>
                                    </div>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                    selectedMethod === 'bni_va' ? 'border-neutral-900' : 'border-neutral-300'
                                }`}>
                                    {selectedMethod === 'bni_va' && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                                </div>
                            </div>

                            {/* Option 5: Tunai (Cash Kasir) */}
                            <div
                                onClick={() => setSelectedMethod('tunai')}
                                className={`flex cursor-pointer items-center justify-between rounded-2xl bg-white p-3.5 shadow-2xs transition-all border ${
                                    selectedMethod === 'tunai'
                                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                                        : 'border-neutral-100 hover:border-neutral-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <IconBanknote className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Tunai (Cash Kasir)</p>
                                        <p className="text-[11px] font-medium text-neutral-400">Uang tunai kasir & kalkulator kembalian</p>
                                    </div>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                    selectedMethod === 'tunai' ? 'border-neutral-900' : 'border-neutral-300'
                                }`}>
                                    {selectedMethod === 'tunai' && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                                </div>
                            </div>
                        </div>

                        {/* Mustard Yellow Promo Code / Ticket Banner (Mirroring Reference) */}
                        <div className="flex items-center justify-between rounded-2xl bg-[#D69E2E] px-4 py-3 text-white shadow-xs">
                            <div className="flex items-center gap-2.5">
                                <IconBookmark className="h-4 w-4 shrink-0 text-white" />
                                <div>
                                    <p className="text-xs font-bold">Tiket #{transaksi.id_parkir}</p>
                                    <p className="text-[10px] text-white/80">{transaksi.plat_nomor} • {transaksi.perkiraan_durasi ?? 1} Jam</p>
                                </div>
                            </div>
                            <span className="rounded-xl bg-neutral-900/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs">
                                Verified
                            </span>
                        </div>

                        {/* Breakdown Summary Box */}
                        <div className="space-y-1.5 pt-1 text-xs">
                            <div className="flex items-center justify-between text-neutral-500 font-medium">
                                <span>Transfer Amount</span>
                                <span>{rupiah(biayaTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-neutral-500 font-medium">
                                <span>Additional Cost</span>
                                <span>{rupiah(biayaAdmin)}</span>
                            </div>
                            <div className="border-b border-dashed border-neutral-300 my-2" />
                            <div className="flex items-center justify-between pt-0.5">
                                <span className="font-semibold text-neutral-600">Total</span>
                                <span className="text-base font-black text-neutral-900">{rupiah(totalTagihan)}</span>
                            </div>
                        </div>

                        {/* Full Width Dark Pill Button */}
                        <button
                            type="button"
                            onClick={handleLanjutBayar}
                            className="w-full rounded-2xl bg-[#191B21] py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:bg-black active:scale-[0.99]"
                        >
                            Pay
                        </button>
                    </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN: QRIS DETAIL (PROFESIONAL BI SNAP)                */}
                {/* ======================================================== */}
                {view === 'qris' && (
                    <div className="space-y-3.5">
                        {/* Header dengan Back Button & Status Indicator */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setView('select')}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xs transition hover:bg-neutral-100"
                                aria-label="Kembali"
                            >
                                <IconArrowLeft className="h-4 w-4" />
                            </button>
                            <div className="text-center">
                                <h3 className="text-sm font-bold text-neutral-900">QRIS Payment</h3>
                                <p className="text-[10px] font-medium text-neutral-400">Standar Pembayaran Nasional</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                </span>
                            </div>
                        </div>

                        {loadingDetail ? (
                            <div className="py-16 text-center">
                                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                                <p className="mt-3 text-xs font-semibold text-neutral-500">Membuat tagihan QRIS BI SNAP...</p>
                            </div>
                        ) : errorMessage ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600">
                                <p>{errorMessage}</p>
                                <button type="button" onClick={handleLanjutBayar} className="mt-2 font-bold underline">Coba Lagi</button>
                            </div>
                        ) : qrisData && (
                            <div className="space-y-3">
                                {/* CARD STANDAR RESMI QRIS */}
                                <div className="mx-auto max-w-[300px] overflow-hidden rounded-[26px] border border-neutral-200 bg-white shadow-xs">
                                    {/* Header Banner QRIS */}
                                    <div className="bg-[#1C1D21] px-4 py-2.5 text-white flex items-center justify-between">
                                        <div className="leading-tight">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-base font-black tracking-widest text-[#E31B23]">
                                                    QRIS
                                                </span>
                                            </div>
                                            <span className="block text-[7px] font-semibold tracking-wider text-neutral-300">
                                                STANDAR PEMBAYARAN NASIONAL
                                            </span>
                                        </div>
                                        <span className="rounded bg-[#E31B23] px-2 py-0.5 text-[8px] font-black tracking-widest text-white uppercase">
                                            BI SNAP
                                        </span>
                                    </div>

                                    {/* Merchant Section */}
                                    <div className="border-b border-dashed border-neutral-200 bg-neutral-50/70 px-4 py-2 text-center">
                                        <p className="text-[11px] font-black tracking-wide uppercase text-neutral-900">
                                            POS PARKIR • {transaksi.plat_nomor}
                                        </p>
                                        <p className="font-mono text-[9px] text-neutral-400">
                                            NMID: {qrisData.order_id}
                                        </p>
                                    </div>

                                    {/* Frame QR Code dengan Corner Brackets */}
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <div className="relative rounded-2xl bg-white p-3 border border-neutral-100 shadow-2xs">
                                            {/* Stylized Scanner Corner Brackets */}
                                            <span className="absolute top-1.5 left-1.5 h-3.5 w-3.5 border-t-2 border-l-2 border-neutral-900 rounded-tl-sm" />
                                            <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 border-t-2 border-r-2 border-neutral-900 rounded-tr-sm" />
                                            <span className="absolute bottom-1.5 left-1.5 h-3.5 w-3.5 border-b-2 border-l-2 border-neutral-900 rounded-bl-sm" />
                                            <span className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 border-b-2 border-r-2 border-neutral-900 rounded-br-sm" />

                                            {qrisData.qr_url ? (
                                                <img src={qrisData.qr_url} alt="QRIS" className="h-44 w-44 object-contain" />
                                            ) : (
                                                <QRCodeSVG value={qrisData.qr_string} size={176} level="M" />
                                            )}
                                        </div>

                                        <div className="mt-3 text-center">
                                            <span className="block text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                                                Total Pembayaran
                                            </span>
                                            <p className="text-base font-black text-neutral-900 tracking-tight">
                                                {rupiah(totalTagihan)}
                                            </p>
                                        </div>

                                        {/* Partner Badges */}
                                        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1 text-[9px] font-bold text-neutral-500">
                                            <span className="rounded bg-neutral-100 px-1.5 py-0.5">GoPay</span>
                                            <span className="rounded bg-neutral-100 px-1.5 py-0.5">OVO</span>
                                            <span className="rounded bg-neutral-100 px-1.5 py-0.5">DANA</span>
                                            <span className="rounded bg-neutral-100 px-1.5 py-0.5">ShopeePay</span>
                                            <span className="rounded bg-neutral-100 px-1.5 py-0.5">BCA</span>
                                            <span className="rounded bg-neutral-100 px-1.5 py-0.5">m-Banking</span>
                                        </div>
                                    </div>

                                    {/* Live Polling Footer Bar */}
                                    <div className="flex items-center justify-center gap-2 border-t border-neutral-100 bg-neutral-50 px-3 py-2 text-[10px] font-semibold text-neutral-600">
                                        <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                                        <span>Menunggu scan & verifikasi pembayaran...</span>
                                    </div>
                                </div>

                                {/* Modern Action Buttons */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => cekStatusPembayaran(true)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50"
                                        >
                                            <IconArrowPath className="h-3.5 w-3.5 text-neutral-600" />
                                            <span>Periksa Status</span>
                                        </button>
                                        {clientKey && (
                                            <a
                                                href={`https://simulator.sandbox.midtrans.com/qris/index?order_id=${qrisData.order_id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-white py-2.5 text-xs font-bold text-neutral-600 shadow-2xs hover:text-neutral-900"
                                            >
                                                <IconExternalLink className="h-3.5 w-3.5 text-neutral-500" />
                                                <span>Simulator</span>
                                            </a>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleKonfirmasiMidtransKasir}
                                        disabled={processing}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#191B21] py-3.5 text-xs font-bold text-white shadow-md hover:bg-black disabled:opacity-50"
                                    >
                                        <IconCheck className="h-4 w-4" />
                                        <span>{processing ? 'Memverifikasi...' : 'Konfirmasi Lunas & Selesai'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN: VIRTUAL ACCOUNT (BCA / BNI)                      */}
                {/* ======================================================== */}
                {view === 'va' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setView('select')}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xs"
                                aria-label="Kembali"
                            >
                                <IconArrowLeft className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold text-neutral-900">{vaData?.bank || 'Bank'} Virtual Account</h3>
                            <div className="w-9" />
                        </div>

                        {loadingDetail ? (
                            <div className="py-14 text-center">
                                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                                <p className="mt-3 text-xs font-semibold text-neutral-500">Menghubungkan ke Virtual Account...</p>
                            </div>
                        ) : vaData && (
                            <div className="space-y-4 pt-1">
                                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs text-center space-y-2">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                        Nomor Virtual Account
                                    </span>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="font-mono text-xl font-black text-neutral-900 tracking-wider">
                                            {vaData.va_number}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => salinNomorVA(vaData.va_number)}
                                            className="flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-700 hover:bg-neutral-200"
                                        >
                                            <IconCopy className="h-3 w-3" />
                                            <span>{copied ? 'Tersalin' : 'Salin'}</span>
                                        </button>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-800 pt-1">
                                        Total: {rupiah(totalTagihan)}
                                    </p>
                                    <p className="text-[10px] text-neutral-400">
                                        Transfer dari m-Banking, ATM, atau Internet Banking {vaData.bank}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => cekStatusPembayaran(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 shadow-2xs"
                                    >
                                        <IconArrowPath className="h-3.5 w-3.5" />
                                        <span>Periksa Status Transfer</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleKonfirmasiMidtransKasir}
                                        disabled={processing}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#191B21] py-3.5 text-xs font-bold text-white shadow-md hover:bg-black"
                                    >
                                        <IconCheck className="h-4 w-4" />
                                        <span>{processing ? 'Memproses...' : 'Konfirmasi Pembayaran Selesai'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN: CREDIT CARD (SNAP EMBED DALAM MODAL)             */}
                {/* ======================================================== */}
                {view === 'card' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setView('select')}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xs"
                                aria-label="Kembali"
                            >
                                <IconArrowLeft className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold text-neutral-900">Card Payment</h3>
                            <div className="w-9" />
                        </div>

                        {loadingDetail && (
                            <div className="py-12 text-center text-xs text-neutral-500">
                                Menyiapkan formulir kartu...
                            </div>
                        )}

                        <div id="snap-embed-container" className="w-full min-h-[350px] overflow-hidden rounded-2xl bg-white p-2" />
                    </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN: TUNAI (CASH KALKULATOR)                          */}
                {/* ======================================================== */}
                {view === 'tunai' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setView('select')}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xs"
                                aria-label="Kembali"
                            >
                                <IconArrowLeft className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold text-neutral-900">Pembayaran Tunai</h3>
                            <div className="w-9" />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                    Uang Tunai Diterima (Rp)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setUangDiterima(String(totalTagihan))}
                                    className="rounded-lg border border-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-800 hover:bg-neutral-50"
                                >
                                    Uang Pas
                                </button>
                            </div>

                            <input
                                autoFocus
                                type="number"
                                min="0"
                                step="1000"
                                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3.5 py-2.5 text-base font-black text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                                placeholder="0"
                                value={uangDiterima}
                                onChange={(e) => setUangDiterima(e.target.value)}
                            />

                            <div className="flex flex-wrap gap-1.5">
                                {[5000, 10000, 20000, 50000, 100000].map((nominal) => (
                                    <button
                                        key={nominal}
                                        type="button"
                                        onClick={() => setUangDiterima(String(nominal))}
                                        className="rounded-xl border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-95"
                                    >
                                        {nominal.toLocaleString('id-ID')}
                                    </button>
                                ))}
                            </div>

                            {nominalBayar > 0 && (
                                <div className={`flex items-center justify-between rounded-xl p-3 text-xs font-bold ${
                                    kembalian >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-600'
                                }`}>
                                    <span>{kembalian >= 0 ? 'Kembalian:' : 'Uang Kurang:'}</span>
                                    <span className="text-sm font-black">{rupiah(Math.abs(kembalian))}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleBayarTunaiSelesai}
                            disabled={processing || !uangCukup}
                            className="w-full rounded-2xl bg-[#191B21] py-3.5 text-center text-sm font-bold text-white shadow-md hover:bg-black disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Konfirmasi Bayar Tunai & Selesai'}
                        </button>
                    </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN 2: PAYMENT SUCCESS (EXACT MATCH REFERENCE IMAGE)  */}
                {/* ======================================================== */}
                {view === 'success' && successData && (
                    <div className="space-y-4 text-center">
                        {/* Layered Green Glow Circular Badge */}
                        <div className="pt-2">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF7E8] ring-8 ring-[#EAF7E8]/50">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#62C343] text-white shadow-md">
                                    <IconCheck className="h-6 w-6" />
                                </div>
                            </div>
                        </div>

                        {/* Heading & Subtitle */}
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">
                                Payment in progress
                            </h3>
                            <p className="mt-0.5 text-xs text-neutral-400">
                                Package activation in progress
                            </p>
                        </div>

                        {/* Invoice Receipt White Card */}
                        <div className="rounded-2xl border border-neutral-100 bg-white p-5 text-left text-xs shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between text-neutral-500 font-medium">
                                <span>Date</span>
                                <span className="font-semibold text-neutral-800">{successData.date}</span>
                            </div>
                            <div className="flex items-center justify-between text-neutral-500 font-medium">
                                <span>Payment Method</span>
                                <span className="font-semibold text-neutral-800">{successData.method}</span>
                            </div>
                            <div className="flex items-center justify-between text-neutral-500 font-medium">
                                <span>Gift to</span>
                                <span className="font-semibold text-neutral-800">{successData.target}</span>
                            </div>
                            <div className="flex items-center justify-between text-neutral-500 font-medium">
                                <span>Transfer Amount</span>
                                <span className="font-semibold text-neutral-800">{rupiah(successData.transferAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-neutral-500 font-medium">
                                <span>Additional Cost</span>
                                <span className="font-semibold text-neutral-800">{rupiah(successData.additionalCost)}</span>
                            </div>

                            <div className="border-b border-dashed border-neutral-200 my-2" />

                            <div className="flex items-center justify-between pt-0.5">
                                <span className="font-semibold text-neutral-600">Total</span>
                                <span className="text-base font-black text-neutral-900">{rupiah(successData.total)}</span>
                            </div>
                        </div>

                        {/* Full Width Dark Pill Button */}
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                if (successData.redirect) {
                                    window.location.href = successData.redirect;
                                } else {
                                    router.reload();
                                }
                            }}
                            className="w-full rounded-2xl bg-[#191B21] py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:bg-black active:scale-[0.99]"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
