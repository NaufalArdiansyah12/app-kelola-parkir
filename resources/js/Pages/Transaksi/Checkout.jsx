import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import CheckoutModal from '../../Components/CheckoutModal';
import Layout from '../../Components/Layout';
import { Badge, Button, Card, inputClass } from '../../Components/ui';
import { rupiah } from '../../lib/format';

function playBeep() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
}

export default function Checkout({ selected, sudah_keluar, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [modalBayarOpen, setModalBayarOpen] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [isStartingCamera, setIsStartingCamera] = useState(false);
    const [isFileScanning, setIsFileScanning] = useState(false);

    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const containerId = 'inpage-qr-scanner';

    // Kamera HANYA menyala jika tombol "Nyalakan Kamera" ditekan
    useEffect(() => {
        if (selected || !isCameraActive) {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current
                    .stop()
                    .catch(() => {})
                    .finally(() => {
                        scannerRef.current?.clear();
                    });
            }
            return;
        }

        let isMounted = true;
        let html5Qr = null;

        const startCamera = async () => {
            try {
                setIsStartingCamera(true);
                setCameraError('');

                const devices = await Html5Qrcode.getCameras();
                if (!isMounted) return;

                if (!devices || devices.length === 0) {
                    setCameraError('Tidak ada perangkat kamera / webcam yang terdeteksi.');
                    setIsStartingCamera(false);
                    return;
                }

                setCameras(devices);
                const defaultCam =
                    devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[0];
                const camId = selectedCameraId || defaultCam.id;
                setSelectedCameraId(camId);

                // Instansiasi dengan optimasi native BarcodeDetector & QR only
                html5Qr = new Html5Qrcode(containerId, {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true,
                    },
                    verbose: false,
                });
                scannerRef.current = html5Qr;

                const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.75);
                    return { width: qrboxSize, height: qrboxSize };
                };

                await html5Qr.start(
                    camId,
                    {
                        fps: 15,
                        qrbox: qrboxFunction,
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (!isMounted) return;
                        playBeep();
                        html5Qr
                            .stop()
                            .catch(() => {})
                            .finally(() => {
                                setIsCameraActive(false);
                                handleScanSuccess(decodedText);
                            });
                    },
                    () => {}
                );

                if (isMounted) {
                    setIsStartingCamera(false);
                }
            } catch (err) {
                if (isMounted) {
                    setIsStartingCamera(false);
                    setCameraError(
                        'Akses kamera ditolak atau tidak tersedia. Izinkan browser untuk mengakses kamera laptop.'
                    );
                }
            }
        };

        const timer = setTimeout(startCamera, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (html5Qr && html5Qr.isScanning) {
                html5Qr
                    .stop()
                    .catch(() => {})
                    .finally(() => {
                        html5Qr.clear();
                    });
            }
        };
    }, [selected, isCameraActive, selectedCameraId]);

    const changeCamera = async (newCamId) => {
        setSelectedCameraId(newCamId);
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.75);
                    return { width: qrboxSize, height: qrboxSize };
                };

                await scannerRef.current.start(
                    newCamId,
                    {
                        fps: 15,
                        qrbox: qrboxFunction,
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        playBeep();
                        scannerRef.current
                            .stop()
                            .catch(() => {})
                            .finally(() => {
                                setIsCameraActive(false);
                                handleScanSuccess(decodedText);
                            });
                    },
                    () => {}
                );
            } catch (err) {
                setCameraError('Gagal beralih ke kamera yang dipilih.');
            }
        }
    };

    const stopCamera = async () => {
        setIsCameraActive(false);
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (_) {}
        }
    };

    // Bersihkan hasil scan menjadi ID tiket murni
    const handleScanSuccess = (decodedText) => {
        let code = String(decodedText || '').trim();

        // 1. Ekstrak dari URL
        if (code.includes('http://') || code.includes('https://')) {
            const urlMatch = code.match(/(?:id=|transaksi\/|search=)(\d+)/i);
            if (urlMatch) {
                code = urlMatch[1];
            }
        }

        // 2. Ekstrak dari pola "id=123"
        if (code.includes('id=')) {
            const match = code.match(/id=([0-9]+)/i);
            if (match) {
                code = match[1];
            }
        }

        // 3. Bersihkan tanda pagar dan prefix
        code = code.replace(/^[#]+/, '').replace(/^PARKIR[-_]/i, '').trim();

        setSearch(code);
        router.get('/transaksi/keluar', { search: code }, { preserveState: true });
    };

    const handleManualSearch = (event) => {
        event?.preventDefault();
        let code = search.trim();
        if (!code) return;

        code = code.replace(/^[#]+/, '').replace(/^PARKIR[-_]/i, '').trim();
        router.get('/transaksi/keluar', { search: code }, { preserveState: true });
    };

    // Opsi cadangan scan dari file foto/struk
    const handleFileScan = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsFileScanning(true);
        try {
            const tempScanner = new Html5Qrcode('temp-qr-file-scanner', {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                experimentalFeatures: { useBarCodeDetectorIfSupported: true },
                verbose: false,
            });
            const decoded = await tempScanner.scanFile(file, true);
            tempScanner.clear();
            playBeep();
            handleScanSuccess(decoded);
        } catch (err) {
            alert('Kode QR tidak dapat dibaca dari gambar tersebut. Pastikan foto struk tajam, tegak, dan tidak silau.');
        } finally {
            setIsFileScanning(false);
            e.target.value = '';
        }
    };

    const resetScan = () => {
        setSearch('');
        setIsCameraActive(false);
        setModalBayarOpen(false);
        router.get('/transaksi/keluar');
    };

    const searchNotFound = Boolean(filters.search && !selected && !sudah_keluar);

    return (
        <>
            <Head title="Pos Check-Out & Kasir" />
            <Layout
                title="Pos Check-Out & Kasir"
                subtitle="Nyalakan kamera untuk scan QR struk, cocokkan data kendaraan, lalu proses pembayaran"
            >
                {/* Hidden container untuk fallback scanFile */}
                <div id="temp-qr-file-scanner" className="hidden" />

                {!selected ? (
                    /* TAMPILAN 1: KONTROL SCANNER QR (KAMERA HANYA HIDUP JIKA TOMBOL DITEKAN) */
                    <div className="mx-auto flex max-w-xl flex-col items-center">
                        <Card className="w-full p-6 text-center">
                            <div className="mb-4">
                                <span className="inline-flex rounded-full bg-panel-warm px-3 py-1 font-mono text-xs font-bold text-ink">
                                    LANGKAH 1
                                </span>
                                <h2 className="mt-2 text-lg font-black tracking-tight text-ink">
                                    Pindai QR Karcis Pengendara
                                </h2>
                                <p className="text-xs text-muted">
                                    {isCameraActive
                                        ? 'Posisikan kode QR karcis di tengah kotak pemindai dengan jarak sekitar 20-30 cm'
                                        : 'Tekan tombol di bawah untuk menyalakan kamera laptop saat kendaraan tiba'}
                                </p>
                            </div>

                            {/* Viewport Kamera Live (Hanya saat isCameraActive = true) */}
                            {isCameraActive ? (
                                <div className="space-y-3">
                                    {cameras.length > 1 && (
                                        <div className="flex items-center justify-center gap-2">
                                            <label className="text-[11px] font-semibold text-[#6B665E]">
                                                Kamera:
                                            </label>
                                            <select
                                                value={selectedCameraId}
                                                onChange={(e) => changeCamera(e.target.value)}
                                                className="rounded-xl border border-panel-border bg-white px-3 py-1 text-xs text-ink outline-none"
                                            >
                                                {cameras.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.label || `Kamera ${c.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-[#E9C46A] bg-black shadow-inner sm:max-w-sm">
                                        <div id={containerId} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
                                        {isStartingCamera && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                                                <svg
                                                    className="h-8 w-8 animate-spin text-[#E9C46A]"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8H4z"
                                                    />
                                                </svg>
                                                <span className="mt-2 text-xs font-semibold">
                                                    Menyalakan kamera...
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-center gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={stopCamera}
                                            className="px-4 py-2 text-xs flex items-center gap-1.5"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                                                <rect width="14" height="14" x="5" y="5" rx="2" />
                                            </svg>
                                            <span>Matikan Kamera</span>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Kotak Siaga saat Kamera Belum Dinyalakan */
                                <div className="my-3 flex flex-col items-center rounded-2xl border border-panel-border bg-[#FCFBF8] p-8">
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-panel-warm text-ink">
                                        <svg
                                            className="h-8 w-8"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={() => setIsCameraActive(true)}
                                            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold shadow-sm"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                <circle cx="12" cy="13" r="4" />
                                            </svg>
                                            <span>Nyalakan Kamera & Scan QR</span>
                                        </Button>

                                        {/* Opsi Upload Foto Struk jika kamera bermasalah */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isFileScanning}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-panel-border bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-2xs hover:bg-panel-warm active:scale-95"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                <circle cx="9" cy="9" r="2" />
                                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                            </svg>
                                            <span>{isFileScanning ? 'Membaca...' : 'Unggah Foto'}</span>
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileScan}
                                            className="hidden"
                                        />
                                    </div>

                                    <p className="mt-2.5 text-[11px] text-muted">
                                        Kamera hanya aktif saat tombol ditekan. Pastikan izin kamera aktif pada browser.
                                    </p>
                                </div>
                            )}

                            {cameraError && (
                                <div className="my-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                                    {cameraError}
                                </div>
                            )}

                            {/* Banner Notifikasi jika karcis SUDAH PERNAH CHECK-OUT */}
                            {sudah_keluar && (
                                <div className="my-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900 shadow-2xs space-y-1">
                                    <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-amber-700">
                                            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                        <span>Karcis Sudah Selesai Check-Out</span>
                                    </div>
                                    <p className="text-amber-800">
                                        Karcis <strong className="font-mono">#{sudah_keluar.id_parkir}</strong> ({sudah_keluar.plat_nomor}) sudah tercatat keluar pada <span className="font-semibold">{sudah_keluar.waktu_keluar}</span> dengan total biaya <span className="font-semibold">{rupiah(sudah_keluar.biaya_total)}</span>.
                                    </p>
                                    <p className="text-[11px] text-amber-700">
                                        Kendaraan ini sudah tidak aktif di dalam area parkir.
                                    </p>
                                </div>
                            )}

                            {searchNotFound && (
                                <div className="my-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                                    Karcis dengan nomor / plat "{filters.search}" tidak ditemukan. Pastikan nomor tiket atau plat nomor sudah benar.
                                </div>
                            )}

                            {/* Opsi Cadangan Pencarian Manual / Barcode Gun */}
                            <div className="mt-6 border-t border-[#EFEAE0] pt-4">
                                <form onSubmit={handleManualSearch} className="flex gap-2">
                                    <input
                                        className={`${inputClass} font-mono uppercase text-xs`}
                                        placeholder="Atau ketik manual No. Tiket / Plat..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value.toUpperCase())}
                                    />
                                    <Button type="submit" variant="secondary" className="px-4 text-xs font-bold">
                                        Cari
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>
                ) : (
                    /* TAMPILAN 2: COCOKKAN DATA KENDARAAN (VERIFIKASI) SEBELUM BAYAR */
                    <div className="mx-auto max-w-2xl">
                        <Card className="p-6">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEAE0] pb-4">
                                <div>
                                    <span className="inline-flex rounded-full bg-pastel-green px-3 py-1 font-mono text-xs font-bold text-pastel-green-text">
                                        LANGKAH 2: VERIFIKASI DATA
                                    </span>
                                    <h2 className="mt-1 text-xl font-black text-ink">
                                        Cocokkan Kendaraan Pengendara
                                    </h2>
                                    <p className="text-xs text-muted">
                                        Periksa apakah data di struk sesuai dengan fisik kendaraan sebelum melanjutkan ke pembayaran
                                    </p>
                                </div>
                                <div className="rounded-xl bg-panel-warm px-4 py-2 text-right">
                                    <span className="text-[10px] font-bold tracking-wider text-muted">NO. TIKET</span>
                                    <p className="font-mono text-xl font-black text-ink">#{selected.id_parkir}</p>
                                </div>
                            </div>

                            {/* Kotak Sorotan Kendaraan */}
                            <div className="mb-6 grid gap-4 rounded-2xl border border-panel-border bg-[#FCFBF8] p-5 sm:grid-cols-2">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                                        Plat Nomor Kendaraan
                                    </span>
                                    <p className="mt-1 font-mono text-3xl font-black tracking-wider text-ink">
                                        {selected.plat_nomor}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge tone="purple">
                                            <span className="capitalize">{selected.jenis_kendaraan}</span>
                                        </Badge>
                                        {selected.warna && (
                                            <span className="rounded-md bg-panel-warm px-2 py-0.5 text-xs text-[#6B665E]">
                                                Warna: {selected.warna}
                                            </span>
                                        )}
                                    </div>
                                    {selected.pemilik && (
                                        <p className="mt-2 text-xs text-muted">
                                            Pemilik: <span className="font-semibold text-ink">{selected.pemilik}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 border-t border-[#EFEAE0] pt-4 text-xs sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Area & Slot:</span>
                                        <span className="font-bold text-ink">
                                            {selected.nama_area} {selected.slot ? `• Slot ${selected.slot}` : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Waktu Masuk:</span>
                                        <span className="font-mono font-semibold text-ink">{selected.waktu_masuk}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Durasi Sementara:</span>
                                        <span className="font-bold text-ink">{selected.perkiraan_durasi} Jam</span>
                                    </div>
                                    <div className="flex justify-between border-t border-dashed border-[#EFEAE0] pt-2">
                                        <span className="text-muted">Estimasi Biaya:</span>
                                        <span className="font-black text-accent text-sm">
                                            {rupiah(selected.perkiraan_biaya)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Navigasi Antara Langkah 1 & 2 */}
                            <div className="flex items-center justify-between border-t border-[#EFEAE0] pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={resetScan}
                                    className="px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                    <span>Pindai Karcis Lain</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() => setModalBayarOpen(true)}
                                    className="px-6 py-2.5 text-xs font-black shadow-sm flex items-center gap-2"
                                >
                                    <span>Data Sesuai, Lanjut ke Pembayaran</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </Layout>

            {/* Modal Kasir Pembayaran */}
            <CheckoutModal
                open={modalBayarOpen}
                onClose={() => setModalBayarOpen(false)}
                transaksi={selected}
            />
        </>
    );
}
