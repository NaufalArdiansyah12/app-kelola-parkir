import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CheckoutModal from '../../Components/CheckoutModal';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import { Badge, Button, Card, EmptyRow, StatCard, Table, inputClass } from '../../Components/ui';

export default function TransaksiIndex({ aktif, area = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [viewMode, setViewMode] = useState(filters.search ? 'tabel' : 'denah');
    const [selectedAreaId, setSelectedAreaId] = useState(area[0]?.id_area ?? null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [checkoutTransaksi, setCheckoutTransaksi] = useState(null);

    const currentArea = area.find((item) => item.id_area === selectedAreaId) ?? area[0] ?? null;
    const totalSisa = area.reduce((total, item) => total + (item.sisa ?? (item.kapasitas - item.terisi)), 0);

    const slots = currentArea?.slots ?? [];
    const terisiCount = slots.filter((slot) => slot.id_parkir).length;
    const mobilTerisi = slots.filter((slot) => slot.id_parkir && (slot.jenis_kendaraan ?? slot.jenis) === 'mobil').length;
    const mobilKapasitas = currentArea?.kapasitas_mobil ?? currentArea?.kapasitas ?? 0;
    const motorTerisi = slots.filter((slot) => slot.id_parkir && (slot.jenis_kendaraan ?? slot.jenis) === 'motor').length;
    const motorKapasitas = currentArea?.kapasitas_motor ?? 0;

    return (
        <>
            <Head title="Parkir Aktif" />
            <Layout title="Parkir Aktif" subtitle="Monitoring denah slot parkir dan kendaraan aktif">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Kendaraan Aktif" value={aktif.total} hint="Sedang parkir saat ini" accent="purple" />
                    <StatCard label="Total Sisa Slot" value={totalSisa} hint="Slot kosong tersedia" accent="green" />
                    <StatCard label="Total Area Parkir" value={area.length} hint="Zona / lantai operasional" accent="yellow" />
                </div>

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
                                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                        isSelected
                                            ? 'bg-ink text-white shadow-xs'
                                            : 'border border-panel-border bg-white text-[#6B665E] hover:bg-panel-warm'
                                    }`}
                                >
                                    <span>{item.nama_area}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                                            isSelected
                                                ? 'bg-white/20 text-white'
                                                : penuh
                                                  ? 'bg-red-100 text-red-700'
                                                  : 'bg-panel-warm text-muted'
                                        }`}
                                    >
                                        {itemTerisi}/{item.kapasitas} ({persen}%)
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Kontrol Mode Tampilan & Check-In */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex rounded-xl border border-panel-border bg-panel-warm p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('denah')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    viewMode === 'denah' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
                                }`}
                            >
                                Denah Visual
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('tabel')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    viewMode === 'tabel' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
                                }`}
                            >
                                Daftar Tabel ({aktif.total})
                            </button>
                        </div>

                        <Link
                            href="/transaksi/masuk?open=1"
                            className="inline-flex items-center gap-1 rounded-xl bg-ink px-3.5 py-2 text-xs font-bold text-white transition hover:bg-black"
                        >
                            + Check-In
                        </Link>
                    </div>
                </div>

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
                                    {Array.from({ length: currentArea.baris * (currentArea.kolom ?? 6) }, (_, index) => {
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
                                                aria-label={
                                                    terisi
                                                        ? `${slot.label} terisi, ${slot.plat_nomor}`
                                                        : `${slot.label} kosong`
                                                }
                                                title={terisi ? `${slot.label} • ${slot.plat_nomor}` : `${slot.label} kosong`}
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
                                    })}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEAE0] pt-3">
                                <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted">
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
                                                <span className="inline-flex items-center gap-2 rounded-full bg-panel-warm px-3 py-1.5 text-[#6B665E]">
                                                    <span className="font-bold text-ink">{selectedSlot.label}</span>
                                                    <span className="font-mono font-bold text-ink">{selectedSlot.plat_nomor}</span>
                                                    <span className="capitalize text-muted">
                                                        {selectedSlot.jenis_kendaraan ?? selectedSlot.jenis}
                                                    </span>
                                                    <span className="text-muted">masuk {selectedSlot.waktu_masuk}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCheckoutTransaksi(selectedSlot)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-ink px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-black"
                                                >
                                                    Proses Check-Out &rarr;
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-pastel-green px-3 py-1.5 text-pastel-green-text">
                                                    <span className="font-bold">{selectedSlot.label}</span>
                                                    <span>slot kosong ({selectedSlot.jenis})</span>
                                                </span>
                                                <Link
                                                    href={`/transaksi/masuk?open=1&area=${currentArea.id_area}`}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-pastel-yellow px-3 py-1.5 text-xs font-bold text-pastel-yellow-text transition hover:brightness-95"
                                                >
                                                    + Check-In di Slot Ini
                                                </Link>
                                            </div>
                                        )
                                    ) : (
                                        <span className="text-muted">Klik salah satu slot pada denah untuk melihat detail.</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="rounded-2xl border border-panel-border bg-white p-8 text-center text-muted">
                            Belum ada area parkir terdaftar.
                        </div>
                    )
                ) : (
                    <Card
                        title="Daftar Parkir Aktif"
                        actions={
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.get('/transaksi', { search }, { preserveState: true });
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    className={`${inputClass} w-40 uppercase`}
                                    placeholder="Cari plat"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value.toUpperCase())}
                                />
                                <Button type="submit" variant="secondary">
                                    Cari
                                </Button>
                            </form>
                        }
                    >
                        <Table head={['Plat', 'Jenis', 'Area', 'Masuk', 'Tarif / Jam', 'Aksi']}>
                            {aktif.data.length === 0 && <EmptyRow colSpan={6}>Tidak ada kendaraan aktif.</EmptyRow>}
                            {aktif.data.map((item) => (
                                <tr key={item.id_parkir}>
                                    <td className="px-3 py-2">
                                        <p className="font-mono font-medium text-ink">{item.kendaraan.plat_nomor}</p>
                                        <p className="text-xs text-muted">{item.kendaraan.pemilik || '-'}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge tone="purple">{item.kendaraan.jenis_kendaraan}</Badge>
                                    </td>
                                    <td className="px-3 py-2 text-[#6B665E]">
                                        {item.area.nama_area}
                                        {item.nomor_slot ? ` • ${item.area.kode}${item.nomor_slot}` : ''}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-muted">{item.waktu_masuk}</td>
                                    <td className="px-3 py-2 text-[#6B665E]">
                                        Rp {Number(item.tarif.tarif_per_jam).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-3 py-2">
                                        <button
                                            type="button"
                                            onClick={() => setCheckoutTransaksi(item)}
                                            className="text-xs font-bold text-accent hover:underline"
                                        >
                                            Check-Out
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                        <Pagination paginator={aktif} />
                    </Card>
                )}

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
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[11px] font-medium text-muted">
                <span>
                    Okupansi · <span className="text-[#6B665E]">Mobil {mobilTerisi}/{mobilKapasitas}</span> ·{' '}
                    <span className="text-[#6B665E]">Motor {motorTerisi}/{motorKapasitas}</span>
                </span>
                <span className="tabular-nums">
                    <span className="text-sm font-bold text-ink">{persen}%</span> terisi ({terisi}/{kapasitas})
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-chart-track">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${penuh ? 'bg-red-500' : 'bg-ink'}`}
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
