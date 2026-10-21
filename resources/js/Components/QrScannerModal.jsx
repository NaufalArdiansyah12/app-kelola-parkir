import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button, Modal } from './ui';

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
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
}

export default function QrScannerModal({
    open,
    onClose,
    onScan,
    targetTransaksi = null,
    onBypass = null,
}) {
    const [errorMsg, setErrorMsg] = useState('');
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [starting, setStarting] = useState(false);
    const scannerRef = useRef(null);
    const containerId = 'qr-camera-viewport';

    useEffect(() => {
        if (!open) return;

        let isMounted = true;
        let html5QrCode = null;

        const initCamera = async () => {
            try {
                setStarting(true);
                setErrorMsg('');

                const devices = await Html5Qrcode.getCameras();
                if (!isMounted) return;

                if (!devices || devices.length === 0) {
                    setErrorMsg('Tidak ada perangkat kamera yang terdeteksi.');
                    setStarting(false);
                    return;
                }

                setCameras(devices);

                const defaultCam =
                    devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[0];
                const camId = defaultCam.id;
                setSelectedCameraId(camId);

                html5QrCode = new Html5Qrcode(containerId);
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    camId,
                    {
                        fps: 10,
                        qrbox: { width: 220, height: 220 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (!isMounted) return;
                        playBeep();
                        html5QrCode
                            .stop()
                            .catch(() => {})
                            .finally(() => {
                                onClose();
                                onScan(decodedText, targetTransaksi);
                            });
                    },
                    () => {
                        // per-frame parse error ignored
                    }
                );

                if (isMounted) {
                    setStarting(false);
                }
            } catch (err) {
                if (isMounted) {
                    setStarting(false);
                    setErrorMsg(
                        'Akses kamera ditolak atau tidak tersedia. Pastikan izin kamera aktif pada browser.'
                    );
                }
            }
        };

        const timer = setTimeout(initCamera, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode
                    .stop()
                    .catch(() => {})
                    .finally(() => {
                        html5QrCode.clear();
                    });
            }
        };
    }, [open]);

    const changeCamera = async (newCamId) => {
        setSelectedCameraId(newCamId);
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                await scannerRef.current.start(
                    newCamId,
                    {
                        fps: 10,
                        qrbox: { width: 220, height: 220 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        playBeep();
                        scannerRef.current
                            .stop()
                            .catch(() => {})
                            .finally(() => {
                                onClose();
                                onScan(decodedText, targetTransaksi);
                            });
                    },
                    () => {}
                );
            } catch (err) {
                setErrorMsg('Gagal beralih ke kamera yang dipilih.');
            }
        }
    };

    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={targetTransaksi ? `Scan QR Karcis #${targetTransaksi.id_parkir}` : 'Scan QR Karcis Parkir'}
            description={
                targetTransaksi
                    ? `Arahkan QR karcis ${targetTransaksi.plat_nomor} ke kamera laptop untuk validasi`
                    : 'Arahkan QR code pada karcis ke kamera laptop / webcam'
            }
            size="md"
        >
            <div className="flex flex-col items-center">
                {cameras.length > 1 && (
                    <div className="mb-3 w-full">
                        <label className="mb-1 block text-[11px] font-semibold text-[#6B665E]">
                            Pilih Kamera:
                        </label>
                        <select
                            value={selectedCameraId}
                            onChange={(e) => changeCamera(e.target.value)}
                            className="w-full rounded-xl border border-panel-border bg-white px-3 py-1.5 text-xs text-ink outline-none"
                        >
                            {cameras.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label || `Kamera ${c.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {errorMsg ? (
                    <div className="my-4 w-full rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-red-600">
                        {errorMsg}
                    </div>
                ) : (
                    <div className="relative my-2 w-full max-w-sm overflow-hidden rounded-2xl border border-panel-border bg-black shadow-inner">
                        <div id={containerId} className="w-full" />
                        {starting && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs font-bold text-white">
                                Menyiapkan kamera...
                            </div>
                        )}
                    </div>
                )}

                <p className="mt-3 text-center text-xs text-muted">
                    Posisikan QR code karcis di dalam kotak pemindai sampai terdengar bunyi beep
                </p>

                <div className="mt-5 flex w-full items-center justify-between border-t border-[#EFEAE0] pt-3">
                    {onBypass ? (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onBypass(targetTransaksi);
                            }}
                            className="text-xs font-semibold text-muted hover:text-ink underline"
                        >
                            Karcis hilang? Bayar langsung
                        </button>
                    ) : (
                        <span />
                    )}
                    <Button variant="secondary" onClick={onClose}>
                        Batal
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
