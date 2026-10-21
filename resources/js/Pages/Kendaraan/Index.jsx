import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import CheckoutModal from '../../Components/CheckoutModal';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import QrScannerModal from '../../Components/QrScannerModal';
import { Badge, Button, Card, EmptyRow, Field, Modal, StatCard, Table, inputClass } from '../../Components/ui';
import { rupiah } from '../../lib/format';

export default function KendaraanIndex({
    aktif,
    area = [],
    transaksiTerakhir = [],
    stats = {},
    filters = {},
    jenisOptions = ['motor', 'mobil', 'lainnya'],
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [viewMode, setViewMode] = useState(filters.search ? 'tabel' : 'denah');
    const [selectedAreaId, setSelectedAreaId] = useState(area[0]?.id_area ?? null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [checkoutTransaksi, setCheckoutTransaksi] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [targetScanner, setTargetScanner] = useState(null);
    const [tambahModalOpen, setTambahModalOpen] = useState(false);

    // Form Tambah Kendaraan
    const form = useForm({
        plat_nomor: '',
        jenis_kendaraan: jenisOptions[0] ?? 'motor',
        warna: '',
        pemilik: '',
        id_area: area[0]?.id_area ?? '',
    });

    const openTambahModal = (targetAreaId = null) => {
        form.clearErrors();
        if (targetAreaId) {
            form.setData('id_area', targetAreaId);
        } else if (!form.data.id_area && area.length > 0) {
            form.setData('id_area', area[0].id_area);
        }
        setTambahModalOpen(true);
    };

    const closeTambahModal = () => {
        setTambahModalOpen(false);
        form.reset();
        form.clearErrors();
    };

    const submitTambahKendaraan = (e) => {
        e.preventDefault();
        form.post('/kendaraan', {
            preserveScroll: true,
            onSuccess: () => {
                closeTambahModal();
                setSelectedSlot(null);
            },
        });
    };

    const handleMulaiCheckOut = (item) => {
        setTargetScanner(item);
        setCameraOpen(true);
    };

    const handleScan = (decodedText, targetItem) => {
        setCameraOpen(false);
        setTargetScanner(null);

        let code = decodedText.trim();
        if (code.includes('id=')) {
            const match = code.match(/id=([0-9]+)/);
            if (match) code = match[1];
        }

        const cleanId = code.replace(/\D/g, '');

        if (
            targetItem &&
            (cleanId === String(targetItem.id_parkir) ||
                code.toUpperCase() === (targetItem.plat_nomor || targetItem.kendaraan?.plat_nomor || '').toUpperCase())
        ) {
            setCheckoutTransaksi(targetItem);
            return;
        }

        const matchItem = aktif.data?.find(
            (item) =>
                String(item.id_parkir) === cleanId ||
                item.kendaraan?.plat_nomor?.toUpperCase() === code.toUpperCase()
        );

        if (matchItem) {
            setCheckoutTransaksi(matchItem);
            return;
        }

        router.get('/transaksi/keluar', { search: code });
    };

    const handleBypass = (targetItem) => {
        setCameraOpen(false);
        setTargetScanner(null);
        if (targetItem) {
            setCheckoutTransaksi(targetItem);
        }
    };

    const currentArea = area.find((item) => item.id_area === selectedAreaId) ?? area[0] ?? null;
    const totalSisa = stats.total_sisa ?? area.reduce((total, item) => total + (item.sisa ?? (item.kapasitas - item.terisi)), 0);

    const slots = currentArea?.slots ?? [];
    const terisiCount = slots.filter((slot) => slot.id_parkir).length;
    const mobilTerisi = slots.filter((slot) => slot.id_parkir && (slot.jenis_kendaraan ?? slot.jenis) === 'mobil').length;
    const mobilKapasitas = currentArea?.kapasitas_mobil ?? currentArea?.kapasitas ?? 0;
    const motorTerisi = slots.filter((slot) => slot.id_parkir && (slot.jenis_kendaraan ?? slot.jenis) === 'motor').length;
    const motorKapasitas = currentArea?.kapasitas_motor ?? 0;

    return (
        <>
            <Head title="Tambah Kendaraan & Denah Parkir" />
            <Layout
                title="Tambah Kendaraan & Area Parkir"
                subtitle="Denah monitoring slot parkir, check-in kendaraan baru, dan aktivitas terkini"
            >
                {/* 1. Stat Cards Row */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Kendaraan Aktif"
                        value={stats.total_aktif ?? aktif.total}
                        hint="Sedang parkir saat ini"
                        accent="purple"
                    />
                    <StatCard
                        label="Total Sisa Slot"
                        value={totalSisa}
                        hint="Slot kosong tersedia"
                        accent="green"
                    />
                    <StatCard
                        label="Total Area Parkir"
                        value={stats.total_area ?? area.length}
                        hint="Lantai & zona operasional"
                        accent="yellow"
                    />
                    <StatCard
                        label="Master Kendaraan"
                        value={stats.total_kendaraan ?? 0}
                        hint="Total kendaraan terdaftar"
                        accent="neutral"
                    />
                </div>

                {/* 2. Main Grid: Area Parkir (Left 2 cols) & Transaksi Terakhir (Right 1 col) */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    {/* LEFT 2 COLUMNS: Area Parkir + Denah Visual / Tabel */}
                    <div className="xl:col-span-2 space-y-4">
                        {/* Area Selector Tabs & Action Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Tab Pilihan Area */}
                            <div className="flex flex-wrap items-center gap-2">
                                {area.map((item) => {
                                    const isSelected = item.id_area === currentArea?.id_area;
                                    const itemTerisi = item.slots?.filter((s) => s.id_parkir).length ?? item.terisi;
                                    const persen = item.kapasitas > 0 ? Math.round((itemTerisi / item.kapasitas) * 100) : 0;
                                    const penuh = itemTerisi >= item.kapasitas;

                                    return (
                                        <button
                                            key={item.id_area}
                                            type="button"
                                            onClick={() => {
                                                setSelectedAreaId(item.id_area);
                                                setSelectedSlot(null);
                                            }}
                                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
                                                isSelected
                                                    ? 'bg-[#17182B] text-white shadow-sm'
                                                    : 'border border-[#E8EBF0] bg-white text-[#7A7E8D] hover:text-[#17182B] hover:bg-[#F8F9FC]'
                                            }`}
                                        >
                                            <span>{item.nama_area}</span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums ${
                                                    isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : penuh
                                                          ? 'bg-red-100 text-red-700'
                                                          : 'bg-[#F8F9FC] text-[#7A7E8D]'
                                                }`}
                                            >
                                                {itemTerisi}/{item.kapasitas} ({persen}%)
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* View Switcher & + Tambah Kendaraan */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex rounded-full border border-[#E8EBF0] bg-white p-1 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('denah')}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                                            viewMode === 'denah'
                                                ? 'bg-[#17182B] text-white shadow-xs'
                                                : 'text-[#7A7E8D] hover:text-[#17182B]'
                                        }`}
                                    >
                                        Denah Visual
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('tabel')}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                                            viewMode === 'tabel'
                                                ? 'bg-[#17182B] text-white shadow-xs'
                                                : 'text-[#7A7E8D] hover:text-[#17182B]'
                                        }`}
                                    >
                                        Tabel Aktif ({aktif.total})
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openTambahModal(currentArea?.id_area)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#F8C838] px-4 py-2 text-xs font-extrabold text-[#17182B] hover:bg-[#E9B927] transition-all shadow-sm active:scale-95"
                                >
                                    <span>+</span>
                                    <span>Tambah Kendaraan</span>
                                </button>
                            </div>
                        </div>

                        {/* Denah Visual Mode */}
                        {viewMode === 'denah' ? (
                            currentArea ? (
                                <Card
                                    title={`Denah ${currentArea.nama_area}`}
                                    description={`${terisiCount} dari ${currentArea.kapasitas} slot terisi`}
                                >
                                    <OccupancyBar
                                        terisi={terisiCount}
                                        kapasitas={currentArea.kapasitas}
                                        mobilTerisi={mobilTerisi}
                                        mobilKapasitas={mobilKapasitas}
                                        motorTerisi={motorTerisi}
                                        motorKapasitas={motorKapasitas}
                                    />

                                    <div className="flex justify-center overflow-x-auto rounded-2xl bg-[#F7F4EE] p-3 sm:p-5">
                                        <div
                                            className="grid gap-1.5 sm:gap-2"
                                            style={{
                                                gridTemplateColumns: `repeat(${currentArea.kolom ?? 6}, minmax(44px, 60px))`,
                                                gridTemplateRows: `repeat(${currentArea.baris}, auto)`,
                                            }}
                                        >
                                            {Array.from(
                                                { length: currentArea.baris * (currentArea.kolom ?? 6) },
                                                (_, index) => {
                                                    const b = Math.floor(index / (currentArea.kolom ?? 6));
                                                    const k = index % (currentArea.kolom ?? 6);
                                                    const slot = slots.find((item) => item.b === b && item.k === k);

                                                    if (!slot) {
                                                        return <div key={index} aria-hidden="true" />;
                                                    }

                                                    const terisi = Boolean(slot.id_parkir);
                                                    const dipilih = selectedSlot?.nomor === slot.nomor;

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={slot.nomor}
                                                            onClick={() => setSelectedSlot(dipilih ? null : slot)}
                                                            aria-pressed={dipilih}
                                                            title={
                                                                terisi
                                                                    ? `${slot.label} • ${slot.plat_nomor}`
                                                                    : `${slot.label} kosong`
                                                            }
                                                            className={`group relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-lg sm:rounded-xl border bg-white transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] ${
                                                                dipilih
                                                                    ? 'border-[#E9C46A] bg-[#FDF8E7] shadow-[0_0_0_2px_rgba(233,196,106,0.35)]'
                                                                    : terisi
                                                                      ? 'border-[#E4DED1] shadow-[0_1px_2px_rgba(23,23,23,0.04)] hover:-translate-y-0.5 hover:border-[#CFC7B6] hover:shadow-[0_4px_10px_rgba(23,23,23,0.10)]'
                                                                      : 'border-[#EAE5DA] hover:-translate-y-0.5 hover:border-[#D7D0C0] hover:shadow-[0_4px_10px_rgba(23,23,23,0.06)]'
                                                            }`}
                                                        >
                                                            {terisi ? (
                                                                <>
                                                                    <span
                                                                        className="flex h-[68%] items-center justify-center"
                                                                        style={{ transform: `rotate(${slot.rot ?? 0}deg)` }}
                                                                    >
                                                                        <VehicleTop
                                                                            jenis={slot.jenis_kendaraan ?? slot.jenis}
                                                                            className="h-full w-auto drop-shadow-sm"
                                                                        />
                                                                    </span>
                                                                    <span className="absolute inset-x-0 bottom-0.5 truncate px-0.5 text-center font-mono text-[8px] font-semibold tracking-tight text-[#8A8377] opacity-0 transition group-hover:opacity-100">
                                                                        {slot.plat_nomor}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="flex flex-col items-center gap-0.5">
                                                                    <VehicleTop
                                                                        jenis={slot.jenis}
                                                                        className="h-[30%] w-auto opacity-20"
                                                                    />
                                                                    <span
                                                                        className={`text-[10px] font-bold tracking-tight ${
                                                                            dipilih ? 'text-[#876510]' : 'text-[#8A8377]'
                                                                        }`}
                                                                    >
                                                                        {slot.label}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* Slot Action & Legend Footer */}
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EBF0] pt-3.5">
                                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-[#7A7E8D]">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-3.5 w-3.5 rounded-[4px] border border-[#EAE5DA] bg-white" />
                                                Kosong
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <CarTopView className="h-4 w-auto" />
                                                Mobil
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MotorTopView className="h-4 w-auto" />
                                                Motor
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-3.5 w-3.5 rounded-[4px] border border-[#E9C46A] bg-[#FDF8E7]" />
                                                Dipilih
                                            </span>
                                        </div>

                                        <div className="min-h-7 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                                            {selectedSlot ? (
                                                selectedSlot.id_parkir ? (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FC] border border-[#E8EBF0] px-3.5 py-1.5 text-[#17182B]">
                                                            <span className="font-extrabold text-[#17182B]">
                                                                {selectedSlot.label}
                                                            </span>
                                                            <span className="font-mono font-black text-[#17182B]">
                                                                {selectedSlot.plat_nomor}
                                                            </span>
                                                            <span className="capitalize text-[#7A7E8D]">
                                                                {selectedSlot.jenis_kendaraan ?? selectedSlot.jenis}
                                                            </span>
                                                            <span className="text-[#7A7E8D]">
                                                                masuk {selectedSlot.waktu_masuk}
                                                            </span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMulaiCheckOut(selectedSlot)}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#17182B] px-4 py-2 text-xs font-bold text-white transition hover:bg-black active:scale-95 shadow-sm"
                                                        >
                                                            Proses Check-Out &rarr;
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 text-emerald-800">
                                                            <span className="font-bold">{selectedSlot.label}</span>
                                                            <span>slot kosong ({selectedSlot.jenis})</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => openTambahModal(currentArea.id_area)}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#F8C838] px-4 py-2 text-xs font-extrabold text-[#17182B] transition hover:bg-[#E9B927] active:scale-95 shadow-sm"
                                                        >
                                                            + Check-In di Slot Ini
                                                        </button>
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-[#7A7E8D]">
                                                    Klik salah satu slot pada denah untuk melihat informasi / check-out.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <div className="rounded-3xl border border-[#E8EBF0] bg-white p-8 text-center text-[#7A7E8D]">
                                    Belum ada area parkir yang terdaftar.
                                </div>
                            )
                        ) : (
                            /* Tabel Aktif Mode */
                            <Card
                                title="Daftar Kendaraan Parkir Aktif"
                                description={`${aktif.total} kendaraan sedang berada di area parkir`}
                                actions={
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            router.get('/kendaraan', { search }, { preserveState: true });
                                        }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            className={`${inputClass} w-44 uppercase text-xs`}
                                            placeholder="Cari plat nomor..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value.toUpperCase())}
                                        />
                                        <Button type="submit" variant="secondary">
                                            Cari
                                        </Button>
                                    </form>
                                }
                            >
                                <Table head={['Plat & Pemilik', 'Jenis', 'Area & Slot', 'Waktu Masuk', 'Tarif / Jam', 'Aksi']}>
                                    {aktif.data.length === 0 && (
                                        <EmptyRow colSpan={6}>Tidak ada kendaraan yang sedang parkir.</EmptyRow>
                                    )}
                                    {aktif.data.map((item) => (
                                        <tr key={item.id_parkir} className="transition hover:bg-[#F8F9FC]">
                                            <td className="px-4 py-3">
                                                <p className="font-mono font-black text-xs text-[#17182B]">
                                                    {item.plat_nomor}
                                                </p>
                                                <p className="text-[11px] text-[#7A7E8D]">{item.pemilik || '-'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge tone={item.jenis_kendaraan === 'mobil' ? 'purple' : 'green'}>
                                                    <span className="capitalize">{item.jenis_kendaraan}</span>
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#17182B] font-medium">
                                                <span>{item.nama_area}</span>
                                                {item.slot && (
                                                    <span className="ml-1.5 font-mono text-[11px] font-bold text-[#7A7E8D]">
                                                        • {item.slot}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-[#7A7E8D]">
                                                {item.waktu_masuk}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-[#17182B] tabular-nums">
                                                {rupiah(item.tarif_per_jam)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMulaiCheckOut(item)}
                                                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[#17182B] hover:text-[#EF4444] transition-colors"
                                                >
                                                    <span>Check-Out</span>
                                                    <span>&rarr;</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                                <Pagination paginator={aktif} />
                            </Card>
                        )}
                    </div>

                    {/* RIGHT 1 COLUMN: CARD TRANSAKSI TERAKHIR */}
                    <div className="space-y-4">
                        <div className="rounded-3xl border border-[#E8EBF0] bg-white p-5 sm:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8EBF0]">
                                <div>
                                    <h4 className="text-base font-extrabold text-[#17182B] tracking-tight">
                                        Transaksi Terakhir
                                    </h4>
                                    <p className="text-xs text-[#7A7E8D] font-medium mt-0.5">
                                        Aktivitas kendaraan masuk & keluar terbaru
                                    </p>
                                </div>
                                <span className="w-8 h-8 rounded-full bg-[#F8F9FC] border border-[#E8EBF0] flex items-center justify-center text-xs font-black text-[#17182B]">
                                    {transaksiTerakhir.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {transaksiTerakhir.map((t) => (
                                    <div
                                        key={t.id_parkir}
                                        className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E8EBF0]/80 transition hover:bg-white hover:shadow-xs group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8EBF0] flex items-center justify-center font-black text-xs text-[#17182B] shadow-2xs group-hover:border-[#17182B] transition-colors">
                                                    {t.plat_nomor?.slice(0, 2) || 'KB'}
                                                </div>
                                                <div>
                                                    <p className="font-mono font-extrabold text-xs text-[#17182B] tracking-wide">
                                                        {t.plat_nomor}
                                                    </p>
                                                    <p className="text-[11px] text-[#7A7E8D] capitalize font-medium mt-0.5">
                                                        {t.jenis_kendaraan} • {t.nama_area} ({t.kode_slot})
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                        t.status === 'masuk'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-emerald-100 text-emerald-800'
                                                    }`}
                                                >
                                                    {t.status === 'masuk' ? 'Parkir' : 'Selesai'}
                                                </span>
                                                <span className="block text-xs font-black text-[#17182B] mt-1 tabular-nums">
                                                    {t.status === 'keluar' ? rupiah(t.biaya_total) : 'Aktif'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 pt-2 border-t border-[#E8EBF0]/50 flex items-center justify-between text-[10px] text-[#7A7E8D]">
                                            <span>Masuk: {t.waktu_masuk}</span>
                                            {t.durasi > 0 && <span>Durasi: {t.durasi} Jam</span>}
                                        </div>
                                    </div>
                                ))}

                                {transaksiTerakhir.length === 0 && (
                                    <div className="py-8 text-center text-xs text-[#7A7E8D]">
                                        Belum ada riwayat transaksi parkir.
                                    </div>
                                )}
                            </div>

                            {/* Quick Action Button Inside Card */}
                            <div className="mt-5 pt-4 border-t border-[#E8EBF0]">
                                <button
                                    type="button"
                                    onClick={() => openTambahModal(currentArea?.id_area)}
                                    className="w-full py-2.5 px-4 rounded-full bg-[#17182B] hover:bg-black text-white text-xs font-extrabold text-center transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>+</span>
                                    <span>Input Kendaraan Baru</span>
                                </button>
                            </div>
                        </div>

                        {/* Operational Notice Card */}
                        <div className="rounded-3xl border border-[#E8EBF0] bg-gradient-to-br from-[#FAF8F3] to-white p-5 shadow-2xs">
                            <div className="flex items-center gap-2.5 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <h5 className="text-xs font-extrabold text-[#17182B]">Pos Gerbang Operasional</h5>
                            </div>
                            <p className="text-[11px] text-[#7A7E8D] leading-relaxed">
                                Petugas dan admin dapat langsung melakukan check-in kendaraan dengan memilih slot denah kosong
                                atau menekan tombol Tambah Kendaraan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* MODAL TAMBAH KENDARAAN / CHECK-IN */}
                <Modal
                    open={tambahModalOpen}
                    onClose={closeTambahModal}
                    title="Tambah & Check-In Kendaraan"
                    description="Input data kendaraan baru dan tentukan area parkir yang dituju"
                >
                    <form onSubmit={submitTambahKendaraan} className="space-y-4">
                        <Field label="Plat Nomor" error={form.errors.plat_nomor}>
                            <input
                                className={`${inputClass} font-mono uppercase font-bold`}
                                placeholder="Contoh: B 1234 ABC"
                                value={form.data.plat_nomor}
                                onChange={(e) => form.setData('plat_nomor', e.target.value.toUpperCase())}
                                required
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Jenis Kendaraan" error={form.errors.jenis_kendaraan}>
                                <select
                                    className={`${inputClass} capitalize`}
                                    value={form.data.jenis_kendaraan}
                                    onChange={(e) => form.setData('jenis_kendaraan', e.target.value)}
                                >
                                    {jenisOptions.map((jenis) => (
                                        <option key={jenis} value={jenis}>
                                            {jenis}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Pilihan Area Parkir" error={form.errors.id_area}>
                                <select
                                    className={inputClass}
                                    value={form.data.id_area}
                                    onChange={(e) => form.setData('id_area', e.target.value)}
                                >
                                    {area.map((a) => (
                                        <option key={a.id_area} value={a.id_area}>
                                            {a.nama_area} (Sisa: {a.sisa ?? (a.kapasitas - a.terisi)} slot)
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Warna Kendaraan (Opsional)" error={form.errors.warna}>
                                <input
                                    className={inputClass}
                                    placeholder="Contoh: Hitam / Putih"
                                    value={form.data.warna}
                                    onChange={(e) => form.setData('warna', e.target.value)}
                                />
                            </Field>

                            <Field label="Nama Pemilik (Opsional)" error={form.errors.pemilik}>
                                <input
                                    className={inputClass}
                                    placeholder="Nama pemilik / pengunjung"
                                    value={form.data.pemilik}
                                    onChange={(e) => form.setData('pemilik', e.target.value)}
                                />
                            </Field>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[#E8EBF0] pt-4 mt-6">
                            <Button variant="secondary" onClick={closeTambahModal}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : 'Check-In Kendaraan'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* QR SCANNER & CHECKOUT MODAL */}
                <QrScannerModal
                    open={cameraOpen}
                    onClose={() => {
                        setCameraOpen(false);
                        setTargetScanner(null);
                    }}
                    onScan={handleScan}
                    targetTransaksi={targetScanner}
                    onBypass={handleBypass}
                />

                <CheckoutModal
                    open={Boolean(checkoutTransaksi)}
                    onClose={() => setCheckoutTransaksi(null)}
                    transaksi={checkoutTransaksi}
                />
            </Layout>
        </>
    );
}

function OccupancyBar({ terisi, kapasitas, mobilTerisi = 0, mobilKapasitas = 0, motorTerisi = 0, motorKapasitas = 0 }) {
    const persen = kapasitas > 0 ? Math.round((terisi / kapasitas) * 100) : 0;
    const penuh = terisi >= kapasitas;

    return (
        <div className="mb-4">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[11px] font-medium text-[#7A7E8D]">
                <span>
                    Okupansi · <span className="font-semibold text-[#17182B]">Mobil {mobilTerisi}/{mobilKapasitas}</span> ·{' '}
                    <span className="font-semibold text-[#17182B]">Motor {motorTerisi}/{motorKapasitas}</span>
                </span>
                <span className="tabular-nums">
                    <span className="text-sm font-bold text-[#17182B]">{persen}%</span> terisi ({terisi}/{kapasitas})
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#E8EBF0]">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${penuh ? 'bg-red-500' : 'bg-[#17182B]'}`}
                    style={{ width: `${Math.max(persen, 2)}%` }}
                />
            </div>
        </div>
    );
}

function VehicleTop({ jenis, className = '' }) {
    return jenis === 'motor' ? <MotorTopView className={className} /> : <CarTopView className={className} />;
}

function MotorTopView({ className = '' }) {
    return (
        <svg viewBox="0 0 64 108" className={className} aria-hidden="true">
            <ellipse cx="32" cy="100" rx="14" ry="4" fill="#171717" opacity="0.12" />
            <rect x="26" y="4" width="12" height="26" rx="6" fill="#2E343A" />
            <rect x="29" y="8" width="6" height="18" rx="3" fill="#505A63" />
            <rect x="26" y="72" width="12" height="28" rx="6" fill="#2E343A" />
            <rect x="29" y="76" width="6" height="20" rx="3" fill="#505A63" />
            <rect x="39" y="60" width="5" height="26" rx="2.5" fill="#9BA3A9" />
            <rect x="40" y="82" width="3" height="4" rx="1" fill="#4B545D" />
            <rect x="10" y="26" width="44" height="4" rx="2" fill="#69737C" />
            <rect x="8" y="25" width="8" height="6" rx="2" fill="#2E343A" />
            <rect x="48" y="25" width="8" height="6" rx="2" fill="#2E343A" />
            <circle cx="8" cy="20" r="3" fill="#D3D9DC" stroke="#4B545D" strokeWidth="1.5" />
            <circle cx="56" cy="20" r="3" fill="#D3D9DC" stroke="#4B545D" strokeWidth="1.5" />
            <path d="M26 14 C26 10, 38 10, 38 14 L36 26 L28 26 Z" fill="#4B545D" />
            <rect x="29" y="11" width="6" height="3" rx="1.5" fill="#FFFFFF" />
            <path d="M22 30 C20 38, 20 48, 24 54 L40 54 C44 48, 44 38, 42 30 Z" fill="#BACFBE" />
            <rect x="27" y="32" width="10" height="16" rx="4" fill="#3D5A45" opacity="0.8" />
            <circle cx="32" cy="38" r="2.5" fill="#EAE5DA" />
            <path d="M24 52 L40 52 C42 62, 41 74, 38 80 L26 80 C23 74, 22 62, 24 52 Z" fill="#2E343A" />
            <line x1="24" y1="65" x2="40" y2="65" stroke="#4A525A" strokeWidth="1.5" />
            <rect x="28" y="82" width="8" height="3" rx="1.5" fill="#E63946" />
        </svg>
    );
}

function CarTopView({ className = '' }) {
    return (
        <svg viewBox="0 0 64 108" className={className} aria-hidden="true">
            <ellipse cx="32" cy="100" rx="20" ry="4" fill="#171717" opacity="0.10" />
            <rect x="10" y="4" width="44" height="100" rx="18" fill="#AEB5BC" />
            <rect x="12" y="6" width="40" height="96" rx="16" fill="#F4F6F7" />
            <path d="M12 22h40v-2a16 16 0 0 0-16-14h-8a16 16 0 0 0-16 14v2Z" fill="#E6EAEC" />
            <rect x="17" y="18" width="30" height="17" rx="6" fill="#4B545D" opacity="0.9" />
            <rect x="20" y="21" width="24" height="11" rx="4" fill="#5E6973" opacity="0.55" />
            <rect x="17" y="38" width="30" height="34" rx="6" fill="#E1E6E8" />
            <rect x="20" y="41" width="24" height="28" rx="4" fill="#EDF1F2" />
            <path d="M20 58h24" stroke="#CBD3D6" strokeWidth="1.5" />
            <rect x="17" y="75" width="30" height="14" rx="6" fill="#4B545D" opacity="0.75" />
            <rect x="20" y="78" width="24" height="8" rx="4" fill="#69737C" opacity="0.4" />
            <rect x="5" y="30" width="5" height="12" rx="2.5" fill="#AEB5BC" />
            <rect x="54" y="30" width="5" height="12" rx="2.5" fill="#AEB5BC" />
            <rect x="18" y="7" width="9" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="37" y="7" width="9" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="18" y="98" width="9" height="3" rx="1.5" fill="#D9534F" opacity="0.7" />
            <rect x="37" y="98" width="9" height="3" rx="1.5" fill="#D9534F" opacity="0.7" />
        </svg>
    );
}
