import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ConfirmModal } from './ui';
import { rupiah } from '../lib/format';

function Icon({ name, className = 'w-4 h-4', strokeWidth = 2.5 }) {
    switch (name) {
        case 'menu':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
                    <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
                    <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
                </svg>
            );
        case 'sparkle':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
                </svg>
            );
        case 'brush':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 2.625a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.375-9.375z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 6l4 4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
                </svg>
            );
        case 'layout-grid':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
            );
        case 'folder':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            );
        case 'users':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
            );
        case 'database':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path strokeLinecap="round" d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path strokeLinecap="round" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
            );
        case 'tag':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
            );
        case 'car':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l2-4h10l2 4M3 15h18M4 11v6a1 1 0 001 1h1m12 0h1a1 1 0 001-1v-6M7 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
            );
        case 'parkir':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 16V8h4a2.5 2.5 0 010 5H9" />
                </svg>
            );
        case 'checkin':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
            );
        case 'checkout':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            );
        case 'logout':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            );
        case 'search':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
                </svg>
            );
        case 'bell':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
            );
        case 'calendar':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            );
        case 'clock':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'share-2':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
            );
        case 'chevron-down':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'chevron-left':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'chevron-right':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'arrow-up-right':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <line x1="7" y1="17" x2="17" y2="7" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 7 17 7 17 17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'arrow-down-right':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <line x1="7" y1="7" x2="17" y2="17" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 7 17 17 7 17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'pen-line':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
            );
        case 'mail':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'x':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
            );
        case 'check':
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        default:
            return null;
    }
}

const navConfigByRole = {
    admin: [
        { label: 'Dashboard', href: '/dashboard', icon: 'layout-grid' },
        { label: 'Kelola User', href: '/users', icon: 'users', badgeKey: 'total_user' },
        { label: 'Tarif Parkir', href: '/tarif', icon: 'tag', badgeKey: 'total_tarif' },
        { label: 'Area Parkir', href: '/area', icon: 'folder', countArea: true },
        { label: 'Tambah Kendaraan', href: '/kendaraan', icon: 'car', badgeKey: 'total_kendaraan' },
        { label: 'Laporan Keuangan', href: '/laporan-keuangan', icon: 'database' },
    ],
    petugas: [
        { label: 'Dashboard', href: '/dashboard', icon: 'layout-grid' },
        { label: 'Parkir Aktif', href: '/transaksi', icon: 'parkir' },
        { label: 'Pos Check-In', href: '/transaksi/masuk', icon: 'checkin' },
        { label: 'Pos Check-Out', href: '/transaksi/keluar', icon: 'checkout' },
    ],
    owner: [
        { label: 'Dashboard', href: '/dashboard', icon: 'layout-grid' },
        { label: 'Rekap Transaksi', href: '/rekap', icon: 'database' },
    ],
};

const subBrandByRole = {
    admin: 'Admin Hub',
    petugas: 'Pos Petugas',
    owner: 'Owner Hub',
};

const roleLabel = {
    admin: 'Administrator',
    petugas: 'Petugas Pos',
    owner: 'Owner Usaha',
};

function getSmoothSpline(points, baseline = 205) {
    if (!points || points.length === 0) return { line: '', area: '' };
    if (points.length === 1) {
        return {
            line: `M 35 ${points[0].y} L 965 ${points[0].y}`,
            area: `M 35 ${points[0].y} L 965 ${points[0].y} L 965 ${baseline} L 35 ${baseline} Z`,
        };
    }

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    let line = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    const tension = 0.2;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        let cp1x = p1.x + (p2.x - p0.x) * tension;
        let cp1y = p1.y + (p2.y - p0.y) * tension;
        let cp2x = p2.x - (p3.x - p1.x) * tension;
        let cp2y = p2.y - (p3.y - p1.y) * tension;

        cp1y = clamp(cp1y, 25, baseline);
        cp2y = clamp(cp2y, 25, baseline);

        line += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const area = `${line} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;

    return { line, area };
}

export default function AdminDashboardView({
    statistik,
    area = [],
    chart = [],
    jenis = [],
    recent = [],
    tambahan = {},
    chartPendapatan = [],
    totalPendapatanChart = 0,
    totalTransaksiChart = 0,
    petugasOptions = [],
    chartFilters = {},
}) {
    const { auth } = usePage().props;
    const role = auth?.role ?? 'admin';

    const activePeriode = chartFilters?.periode || 'minggu';
    const activePetugas = chartFilters?.petugas || 'semua';

    const handleChartFilter = (newPeriode, newPetugas) => {
        router.get(
            '/dashboard',
            {
                periode: newPeriode,
                petugas: newPetugas,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['chartPendapatan', 'totalPendapatanChart', 'totalTransaksiChart', 'chartFilters'],
            }
        );
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [alertsActive, setAlertsActive] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState('Hari Ini');
    const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
    const [acceptedInvite, setAcceptedInvite] = useState(false);
    const [hoveredChartIdx, setHoveredChartIdx] = useState(null);

    // Modals
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const daysOfWeek = [
        { label: 'SU', num: 24 },
        { label: 'MO', num: 25 },
        { label: 'TU', num: 26 },
        { label: 'WE', num: 27 },
        { label: 'TH', num: 28 },
        { label: 'FR', num: 29 },
        { label: 'SA', num: 30 },
    ];

    const filteredArea = area.filter((a) => {
        const matchesSearch = a.nama_area.toLowerCase().includes(searchQuery.toLowerCase());
        const persen = Math.round((a.terisi / a.kapasitas) * 100);
        if (!matchesSearch) return false;
        if (activeTab === 'tersedia') return a.sisa > 0;
        if (activeTab === 'completed') return persen >= 80;
        return true;
    });

    const maksChart = Math.max(1, ...chart.map((c) => c.jumlah));
    const totalKendaraanMasuk = chart.reduce((acc, c) => acc + c.jumlah, 0);
    const navItems = navConfigByRole[role] ?? navConfigByRole.petugas;

    const maxPendapatan = Math.max(1, ...(chartPendapatan || []).map((x) => x.pendapatan));
    const chartPoints = (chartPendapatan || []).map((c, i, arr) => {
        const span = Math.max(1, arr.length - 1);
        const x = 35 + i * (930 / span);
        const baseline = 205;
        const topY = 40;
        const ratio = c.pendapatan > 0 ? c.pendapatan / maxPendapatan : 0;
        const y = baseline - ratio * (baseline - topY);
        return { x, y, data: c };
    });
    const splinePaths = getSmoothSpline(chartPoints, 205);

    return (
        <div className="min-h-screen w-full bg-[#F3F4F8] text-[#15161E] font-sans antialiased flex flex-col selection:bg-[#F8C838] selection:text-[#17182B]">
            <Head title={`${roleLabel[role]} Dashboard`} />

            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-[#17182B] text-white px-4 py-2.5 rounded-2xl shadow-elevated text-xs font-bold border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    {toastMessage}
                </div>
            )}

            {/* Full-width Canvas Body */}
            <div className="w-full min-h-screen flex-1 flex flex-col relative">

                {/* Responsive Mobile Bar */}
                <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur border-b border-[#E8EBF0] z-30">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Open Navigation Drawer"
                            className="p-2 rounded-xl bg-[#F8F9FC] text-[#17182B] hover:bg-[#F8C838] transition-all active:scale-95"
                        >
                            <Icon name="menu" className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-[#F8C838] flex items-center justify-center text-[#17182B] font-black shadow-sm">
                                <Icon name="sparkle" className="w-4 h-4" />
                            </div>
                            <div>
                                <h1 className="font-black text-xs uppercase tracking-wider text-[#17182B] leading-none">Parkir</h1>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A7E8D]">
                                    {subBrandByRole[role]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCalendarOpen(!calendarOpen)}
                            aria-label="Open Calendar"
                            className="p-2 rounded-xl bg-[#F8F9FC] text-[#17182B] hover:bg-[#F8C838] transition-all active:scale-95"
                        >
                            <Icon name="calendar" className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full ring-2 ring-emerald-500 overflow-hidden bg-emerald-50 flex items-center justify-center font-bold text-xs text-[#17182B]">
                            {auth?.avatar ? (
                                <img src={auth.avatar} alt={auth.nama_lengkap} className="w-full h-full object-cover" />
                            ) : (
                                <span>{auth?.nama_lengkap?.slice(0, 2).toUpperCase() || 'US'}</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* 3-Column Core Application Body */}
                <div className="flex-1 flex flex-col lg:flex-row relative">

                    {/* ======================================================== */}
                    {/* 1. LEFT NAVIGATION COLUMN (250px) */}
                    {/* ======================================================== */}
                    <aside
                        id="app-sidebar"
                        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-[250px] bg-[#F3F4F8] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out border-r border-[#E8EBF0] shrink-0 overflow-y-auto ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                    >
                        <div>
                            {/* Brand Badge Lockup */}
                            <div className="flex items-center gap-3 px-1 py-1 mb-9">
                                <div className="w-10 h-10 rounded-2xl bg-[#F8C838] flex items-center justify-center text-[#17182B] shadow-yellow-glow">
                                    <Icon name="brush" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-black text-base tracking-wider uppercase text-[#17182B] leading-tight">Parkir</h2>
                                    <p className="text-xs font-bold tracking-widest uppercase text-[#7A7E8D] leading-none">
                                        {subBrandByRole[role]}
                                    </p>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <nav className="space-y-1.5" aria-label="Sidebar menu">
                                {navItems.map((item) => {
                                    const isDash = item.href === '/dashboard';
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs transition-all group ${
                                                isDash
                                                    ? 'bg-[#F8C838] text-[#17182B] font-extrabold shadow-sm'
                                                    : 'font-semibold text-[#7A7E8D] hover:text-[#17182B] hover:bg-white/80'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <Icon
                                                    name={item.icon}
                                                    className={`w-4 h-4 transition-colors ${
                                                        isDash ? 'text-[#17182B]' : 'text-[#7A7E8D] group-hover:text-[#17182B]'
                                                    }`}
                                                />
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badgeKey && tambahan?.[item.badgeKey] !== undefined && (
                                                <span className="w-5 h-5 rounded-full bg-white text-[#17182B] text-[10px] font-extrabold flex items-center justify-center border border-[#E8EBF0] shadow-2xs">
                                                    {tambahan[item.badgeKey]}
                                                </span>
                                            )}
                                            {item.countArea && (
                                                <span className="w-5 h-5 rounded-full bg-white text-[#17182B] text-[10px] font-extrabold flex items-center justify-center border border-[#E8EBF0] shadow-2xs">
                                                    {area.length}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => setLogoutModalOpen(true)}
                                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50/80 transition-all group text-left"
                                >
                                    <Icon name="logout" className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                                    <span>Log Out</span>
                                </button>
                            </nav>
                        </div>

                        {/* Help Center Banner */}
                        <div className="relative mt-10 pt-4">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#F8C838] border-4 border-[#F3F4F8] text-[#17182B] flex items-center justify-center font-black text-sm shadow-md z-10 pointer-events-auto">
                                <span>?</span>
                            </div>

                            <div className="bg-[#17182B] rounded-[28px] p-5 pt-8 text-center text-white relative shadow-elevated border border-white/5">
                                <h3 className="font-bold text-sm mb-1 text-white tracking-tight">Pusat Bantuan</h3>
                                <p className="text-[11px] text-gray-300 mb-4 leading-relaxed font-normal">
                                    {role === 'admin'
                                        ? 'Butuh panduan teknis?\nHubungi support IT!'
                                        : role === 'petugas'
                                          ? 'Panduan pos kasir?\nHubungi koordinator pos!'
                                          : 'Butuh rekap audit?\nBuka modul laporan!'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setHelpModalOpen(true)}
                                    className="w-full py-2.5 px-3 bg-white hover:bg-gray-100 text-[#17182B] text-xs font-bold rounded-full transition-all active:scale-95 shadow-sm"
                                >
                                    Buka Panduan
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Sidebar Dimmed Overlay for Mobile Viewports */}
                    {sidebarOpen && (
                        <div
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-[#17182B]/40 backdrop-blur-xs z-40 lg:hidden"
                        />
                    )}

                    {/* ======================================================== */}
                    {/* 2. CENTER STAGE CANVAS (Flex-1) */}
                    {/* ======================================================== */}
                    <main className="flex-1 p-5 sm:p-7 lg:p-9 overflow-y-auto space-y-7">
                        {/* Header: Personal Greeting + Inline Search Bar + Bell */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17182B] tracking-tight">
                                        Hello {auth?.nama_lengkap || roleLabel[role]}
                                    </h2>
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F8C838]/30 text-[#17182B] hover:rotate-12 transition-transform cursor-pointer">
                                        <Icon name="sparkle" className="w-4 h-4 text-[#17182B]" />
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#7A7E8D] font-medium mt-0.5">
                                    {role === 'admin' && 'Kelola master, hak akses, dan pantau operasional parkir hari ini !'}
                                    {role === 'petugas' && 'Operasional pos parkir, proses check-in dan kasir keluar hari ini !'}
                                    {role === 'owner' && 'Ringkasan performa finansial, omzet harian, dan okupansi area parkir !'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative w-full md:w-80 group">
                                    <Icon
                                        name="search"
                                        className="w-4 h-4 text-[#7A7E8D] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#17182B] transition-colors"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari area parkir, kode slot..."
                                        className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-xs font-medium placeholder-[#7A7E8D] text-[#15161E] border border-[#E8EBF0]/70 focus:outline-none focus:ring-2 focus:ring-[#F8C838] focus:border-transparent shadow-soft transition-all"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => showToast(`Ada ${statistik?.kendaraan_aktif || 0} kendaraan parkir aktif saat ini.`)}
                                    aria-label="Notifications"
                                    className="relative w-11 h-11 shrink-0 bg-white border border-[#E8EBF0]/70 rounded-full flex items-center justify-center text-[#17182B] hover:bg-[#F8F9FC] active:scale-95 transition-all shadow-soft"
                                >
                                    <Icon name="bell" className="w-4 h-4 text-[#17182B]" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
                                </button>
                            </div>
                        </div>

                        {/* SECTION 1: Revenue Chart & Recent Transactions */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            {/* Dynamic Revenue Bar Chart */}
                            <section className="xl:col-span-2 bg-white rounded-[26px] p-5 sm:p-6 border border-[#E8EBF0]/60 shadow-soft flex flex-col justify-between">
                                {/* Header with Filter Tools */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-5 pb-4 border-b border-[#E8EBF0]/60">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-base font-extrabold text-[#17182B] tracking-tight">
                                                Grafik Pendapatan
                                            </h4>
                                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-0.5 rounded-full">
                                                {rupiah(totalPendapatanChart)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#7A7E8D] mt-0.5 font-medium">
                                            {totalTransaksiChart} transaksi • Filter:{' '}
                                            <strong className="text-[#17182B] font-extrabold">
                                                {chartFilters?.petugas_nama || 'Semua Petugas'}
                                            </strong>
                                            {' '}({activePeriode === 'tahun' ? 'Tahun Ini' : activePeriode === 'bulan' ? 'Bulan Ini' : '1 Minggu Terakhir'})
                                        </p>
                                    </div>

                                    {/* Action Filters */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Dropdown Petugas */}
                                        <div className="relative">
                                            <select
                                                aria-label="Filter Petugas"
                                                value={activePetugas}
                                                onChange={(e) => handleChartFilter(activePeriode, e.target.value)}
                                                className="appearance-none pl-3.5 pr-8 py-1.5 bg-[#F8F9FC] hover:bg-white text-[#17182B] text-xs font-bold rounded-full border border-[#E8EBF0] outline-none focus:ring-2 focus:ring-[#F8C838] transition-all cursor-pointer shadow-2xs"
                                            >
                                                <option value="semua">Semua Petugas</option>
                                                {petugasOptions.map((p) => (
                                                    <option key={p.id_user} value={p.id_user}>
                                                        {p.nama_lengkap} ({p.role})
                                                    </option>
                                                ))}
                                            </select>
                                            <Icon name="chevron-down" className="w-3.5 h-3.5 text-[#7A7E8D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>

                                        {/* Periode Switcher */}
                                        <div className="flex items-center gap-1 bg-[#F8F9FC] p-1 rounded-full border border-[#E8EBF0] text-xs font-semibold">
                                            {[
                                                { id: 'minggu', label: '1 Minggu' },
                                                { id: 'bulan', label: '1 Bulan' },
                                                { id: 'tahun', label: '1 Tahun' },
                                            ].map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => handleChartFilter(p.id, activePetugas)}
                                                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
                                                        activePeriode === p.id
                                                            ? 'bg-[#17182B] text-white shadow-xs'
                                                            : 'text-[#7A7E8D] hover:text-[#17182B]'
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Smooth Line Chart Visualization */}
                                <div
                                    className="relative pt-3 pb-2 select-none"
                                    onMouseLeave={() => setHoveredChartIdx(null)}
                                >
                                    {/* SVG Canvas for Smooth Line */}
                                    <div className="relative h-48 w-full">
                                        <svg
                                            viewBox="0 0 1000 230"
                                            className="w-full h-full overflow-visible"
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                {/* Soft Gold-Yellow Gradient Under Line */}
                                                <linearGradient id="smoothRevenueArea" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#F8C838" stopOpacity="0.32" />
                                                    <stop offset="55%" stopColor="#F8C838" stopOpacity="0.08" />
                                                    <stop offset="100%" stopColor="#F8C838" stopOpacity="0.0" />
                                                </linearGradient>
                                                <linearGradient id="smoothRevenueStroke" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#17182B" />
                                                    <stop offset="60%" stopColor="#17182B" />
                                                    <stop offset="100%" stopColor="#E9B927" />
                                                </linearGradient>
                                            </defs>

                                            {/* Horizontal Subtle Guide Lines */}
                                            <line x1="30" y1="50" x2="970" y2="50" stroke="#F1F3F7" strokeWidth="1" strokeDasharray="4 4" />
                                            <line x1="30" y1="125" x2="970" y2="125" stroke="#F1F3F7" strokeWidth="1" strokeDasharray="4 4" />
                                            <line x1="30" y1="205" x2="970" y2="205" stroke="#E8EBF0" strokeWidth="1" />

                                            {chartPoints.length > 0 && (
                                                <>
                                                    {/* Filled Area Gradient */}
                                                    <path
                                                        d={splinePaths.area}
                                                        fill="url(#smoothRevenueArea)"
                                                        className="transition-all duration-300"
                                                    />

                                                    {/* Main Smooth Spline Line (No Dots on path) */}
                                                    <path
                                                        d={splinePaths.line}
                                                        fill="none"
                                                        stroke="url(#smoothRevenueStroke)"
                                                        strokeWidth="3.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="transition-all duration-300"
                                                    />
                                                </>
                                            )}

                                            {/* Hover Guide Line & Active Target Pin (Only on Hover) */}
                                            {hoveredChartIdx !== null && chartPoints[hoveredChartIdx] && (
                                                <g className="transition-all duration-150">
                                                    <line
                                                        x1={chartPoints[hoveredChartIdx].x}
                                                        y1="35"
                                                        x2={chartPoints[hoveredChartIdx].x}
                                                        y2="205"
                                                        stroke="#17182B"
                                                        strokeWidth="1.5"
                                                        strokeDasharray="3 3"
                                                        strokeOpacity="0.35"
                                                    />
                                                    <circle
                                                        cx={chartPoints[hoveredChartIdx].x}
                                                        cy={chartPoints[hoveredChartIdx].y}
                                                        r="5"
                                                        fill="#F8C838"
                                                        stroke="#17182B"
                                                        strokeWidth="2.5"
                                                    />
                                                </g>
                                            )}
                                        </svg>

                                        {/* Floating Tooltip Card on Hover */}
                                        {hoveredChartIdx !== null && chartPendapatan[hoveredChartIdx] && chartPoints[hoveredChartIdx] && (() => {
                                            const item = chartPendapatan[hoveredChartIdx];
                                            const pt = chartPoints[hoveredChartIdx];
                                            const pctX = (pt.x / 1000) * 100;
                                            const pctY = (pt.y / 230) * 100;
                                            const isLeft = hoveredChartIdx === 0;
                                            const isRight = hoveredChartIdx === chartPendapatan.length - 1;
                                            const transform = isLeft
                                                ? 'translate(0%, -115%)'
                                                : isRight
                                                  ? 'translate(-100%, -115%)'
                                                  : 'translate(-50%, -115%)';

                                            return (
                                                <div
                                                    className="absolute pointer-events-none z-30 transition-all duration-100 ease-out"
                                                    style={{
                                                        left: `${pctX}%`,
                                                        top: `${pctY}%`,
                                                        transform,
                                                    }}
                                                >
                                                    <div className="bg-[#17182B] text-white p-2.5 sm:p-3 rounded-2xl shadow-elevated border border-white/10 min-w-[130px] whitespace-nowrap">
                                                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-gray-400 mb-0.5">
                                                            <span className="text-[#F8C838] uppercase tracking-wider">{item.label}</span>
                                                            <span>{item.sub}</span>
                                                        </div>
                                                        <div className="text-sm font-black text-white tracking-tight">
                                                            {rupiah(item.pendapatan)}
                                                        </div>
                                                        <div className="text-[10px] text-gray-300 font-medium mt-0.5 flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${item.jumlah > 0 ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                                            <span>{item.jumlah} transaksi</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Transparent Hover Columns for frictionless hover interaction */}
                                        <div className="absolute inset-0 flex">
                                            {chartPendapatan.map((c, i) => (
                                                <div
                                                    key={c.key || i}
                                                    onMouseEnter={() => setHoveredChartIdx(i)}
                                                    className="flex-1 h-full cursor-pointer"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* X-Axis Labels (Days / Weeks / Months) */}
                                    <div className="flex justify-between items-center pt-2 px-1 text-center">
                                        {chartPendapatan.map((c, i) => {
                                            const isHovered = hoveredChartIdx === i;
                                            return (
                                                <div
                                                    key={c.key || i}
                                                    onMouseEnter={() => setHoveredChartIdx(i)}
                                                    className="flex-1 cursor-pointer transition-transform py-1 group"
                                                >
                                                    <span
                                                        className={`block text-[11px] truncate transition-colors ${
                                                            isHovered
                                                                ? 'font-black text-[#17182B]'
                                                                : 'font-bold text-[#7A7E8D] group-hover:text-[#17182B]'
                                                        }`}
                                                    >
                                                        {c.label}
                                                    </span>
                                                    <span
                                                        className={`block text-[9px] truncate transition-colors ${
                                                            isHovered
                                                                ? 'font-bold text-[#E9B927]'
                                                                : 'font-medium text-[#7A7E8D]/80'
                                                        }`}
                                                    >
                                                        {c.sub}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {chartPendapatan.length === 0 && (
                                        <div className="text-center text-xs text-[#7A7E8D] py-12">
                                            Tidak ada data pendapatan untuk filter ini.
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Recent Transactions List */}
                            <section className="xl:col-span-1 bg-white rounded-[26px] p-5 sm:p-6 border border-[#E8EBF0]/60 shadow-soft flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-[#17182B]">Transaksi Terakhir</h4>
                                        <p className="text-xs text-[#7A7E8D] mt-0.5">5 aktivitas kendaraan terkini</p>
                                    </div>
                                    <Link
                                        href={role === 'petugas' ? '/transaksi' : role === 'owner' ? '/rekap' : '/laporan-keuangan'}
                                        className="text-xs font-bold text-[#7A7E8D] hover:text-[#17182B]"
                                    >
                                        Semua →
                                    </Link>
                                </div>

                                <div className="space-y-2.5">
                                    {recent.slice(0, 4).map((r) => (
                                        <div
                                            key={r.id_parkir}
                                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F9FC] border border-[#E8EBF0]/50 text-xs"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-[#E8EBF0] flex items-center justify-center font-bold text-[10px] text-[#17182B]">
                                                    {r.plat_nomor?.slice(0, 2) || 'KB'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#17182B]">{r.plat_nomor}</p>
                                                    <p className="text-[10px] text-[#7A7E8D] capitalize">
                                                        {r.jenis_kendaraan} · {r.nama_area}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-extrabold text-[#17182B] block">
                                                    {r.status === 'keluar' ? rupiah(r.biaya_total) : 'Parkir'}
                                                </span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                                    r.status === 'masuk' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {r.status === 'masuk' ? 'Masuk' : 'Selesai'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {recent.length === 0 && (
                                        <p className="text-center text-xs text-[#7A7E8D] py-6">Belum ada transaksi parkir.</p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* SECTION 2: Area & Kapasitas Parkir */}
                        <section aria-labelledby="courses-header" className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <h3 id="courses-header" className="text-xl font-extrabold text-[#17182B]">
                                        Kapasitas & Area
                                    </h3>

                                    {/* Segmented Capsule Filter Tabs */}
                                    <div className="flex items-center gap-1 bg-white/70 p-1 rounded-full border border-[#E8EBF0]/50 text-xs font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('all')}
                                            className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                                                activeTab === 'all'
                                                    ? 'bg-[#17182B] text-white font-extrabold'
                                                    : 'text-[#7A7E8D] hover:text-[#17182B]'
                                            }`}
                                        >
                                            {activeTab === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-[#F8C838]" />}
                                            Semua
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('tersedia')}
                                            className={`px-3 py-1 rounded-full transition-all ${
                                                activeTab === 'tersedia'
                                                    ? 'bg-[#17182B] text-white font-extrabold'
                                                    : 'text-[#7A7E8D] hover:text-[#17182B]'
                                            }`}
                                        >
                                            Tersedia
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('completed')}
                                            className={`px-3 py-1 rounded-full transition-all ${
                                                activeTab === 'completed'
                                                    ? 'bg-[#17182B] text-white font-extrabold'
                                                    : 'text-[#7A7E8D] hover:text-[#17182B]'
                                            }`}
                                        >
                                            Padat
                                        </button>
                                    </div>
                                </div>

                                <Link
                                    href={role === 'admin' ? '/area' : '/transaksi'}
                                    className="text-xs font-bold text-[#7A7E8D] hover:text-[#17182B] transition-colors"
                                >
                                    {role === 'admin' ? 'Kelola area master →' : 'Monitoring denah visual →'}
                                </Link>
                            </div>

                            {/* Dynamic Progress Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                {filteredArea.slice(0, 3).map((item, index) => {
                                    const persen = Math.min(100, Math.round((item.terisi / item.kapasitas) * 100));
                                    const cardTheme = [
                                        { bg: 'bg-amber-50/80', border: 'border-amber-100', text: 'text-amber-600', pillBg: 'bg-emerald-50', pillText: 'text-emerald-600' },
                                        { bg: 'bg-sky-50/80', border: 'border-sky-100', text: 'text-sky-600', pillBg: 'bg-sky-50', pillText: 'text-sky-600' },
                                        { bg: 'bg-purple-50/80', border: 'border-purple-100', text: 'text-purple-600', pillBg: 'bg-purple-50', pillText: 'text-purple-600' },
                                    ][index % 3];

                                    return (
                                        <article
                                            key={item.id_area}
                                            className="bg-white rounded-[26px] p-5 border border-[#E8EBF0]/60 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between group"
                                        >
                                            <div>
                                                <div className="flex items-start gap-3.5 mb-3.5">
                                                    <div className={`w-12 h-12 rounded-2xl ${cardTheme.bg} flex items-center justify-center shrink-0 border ${cardTheme.border} overflow-hidden group-hover:scale-105 transition-transform font-black text-sm text-[#17182B]`}>
                                                        <span>{item.nama_area.slice(0, 2).toUpperCase()}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className={`font-bold text-sm text-[#17182B] leading-snug group-hover:${cardTheme.text} transition-colors truncate`}>
                                                            {item.nama_area}
                                                        </h4>
                                                        <p className="text-xs text-[#7A7E8D] mt-0.5">Kapasitas {item.kapasitas} Slot</p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${cardTheme.pillText} ${cardTheme.pillBg} px-3 py-0.5 rounded-full`}>
                                                        {persen >= 90 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                                        {persen >= 90 ? 'Hampir Penuh' : persen >= 50 ? 'Kapasitas Ramai' : 'Tersedia Banyak'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-[#7A7E8D] font-semibold py-2 px-1 mb-2 bg-[#F8F9FC]/70 rounded-xl">
                                                    <span className="flex items-center gap-1.5" title="Kapasitas total">
                                                        <Icon name="calendar" className="w-3.5 h-3.5 text-[#7A7E8D]" /> {item.kapasitas}
                                                    </span>
                                                    <span className="flex items-center gap-1.5" title="Slot terisi">
                                                        <Icon name="clock" className="w-3.5 h-3.5 text-[#7A7E8D]" /> {item.terisi}
                                                    </span>
                                                    <span className="flex items-center gap-1.5" title="Sisa slot">
                                                        <Icon name="users" className="w-3.5 h-3.5 text-[#7A7E8D]" /> {item.sisa}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                            persen >= 90 ? 'bg-[#EF4444]' : persen === 100 ? 'bg-emerald-500' : 'bg-[#17182B]'
                                                        }`}
                                                        style={{ width: `${Math.max(5, persen)}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2.5 text-right">
                                                    <span className="text-[11px] font-bold text-[#7A7E8D]">
                                                        Terisi: <strong className="text-emerald-600 font-extrabold">{persen}%</strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}

                                {filteredArea.length === 0 && (
                                    <div className="col-span-full bg-white rounded-[26px] p-8 text-center border border-[#E8EBF0] text-xs font-semibold text-[#7A7E8D]">
                                        Tidak ada area yang cocok dengan filter.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* SECTION: Operational Shift Banner */}
                        <section aria-labelledby="assignments-banner-header" className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 id="assignments-banner-header" className="text-xl font-extrabold text-[#17182B]">
                                    Operasional Pos Parkir
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => showToast('Link operasional disalin')}
                                    className="text-xs font-semibold text-[#7A7E8D] hover:text-[#17182B] flex items-center gap-1 transition-colors"
                                >
                                    Share <Icon name="share-2" className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="bg-white rounded-[26px] p-4 sm:p-5 border border-[#E8EBF0]/60 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#F8C838]/20 border border-[#F8C838]/40 flex items-center justify-center shrink-0 text-[#17182B]">
                                        <Icon name="parkir" className="w-7 h-7 text-[#17182B]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-[#17182B]">
                                            {role === 'petugas'
                                                ? 'Pos Kasir Parkir Siaga'
                                                : role === 'owner'
                                                  ? 'Rekapitulasi Usaha Hari Ini'
                                                  : 'Shift Petugas Masuk & Keluar'}
                                        </h4>
                                        <p className="text-xs text-[#7A7E8D] font-medium mt-0.5">
                                            {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 sm:gap-7">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7E8D] block">
                                            Total Transaksi Hari Ini
                                        </span>
                                        <span className="text-xs font-extrabold text-[#17182B]">
                                            {statistik?.transaksi_hari_ini || 0} Kendaraan Selesai
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        {role === 'petugas' ? (
                                            <>
                                                <Link
                                                    href="/transaksi/masuk?open=1"
                                                    className="px-4 py-2 text-xs font-extrabold text-[#17182B] bg-[#F8C838] hover:bg-[#E9B927] rounded-full shadow-sm transition-all active:scale-95"
                                                >
                                                    + Check-In Karcis
                                                </Link>
                                                <Link
                                                    href="/transaksi/keluar"
                                                    className="px-4 py-2 text-xs font-bold text-white bg-[#17182B] hover:bg-black rounded-full shadow-sm transition-all active:scale-95"
                                                >
                                                    Kasir Check-Out
                                                </Link>
                                            </>
                                        ) : role === 'owner' ? (
                                            <Link
                                                href="/rekap"
                                                className="px-5 py-2 text-xs font-extrabold text-[#17182B] bg-[#F8C838] hover:bg-[#E9B927] rounded-full shadow-sm transition-all active:scale-95"
                                            >
                                                Buka Rekap Transaksi →
                                            </Link>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setRescheduleModalOpen(true)}
                                                    className="px-4 py-2 text-xs font-bold text-[#17182B] bg-[#F8F9FC] hover:bg-gray-100 rounded-full border border-[#E8EBF0]/70 transition-all active:scale-95"
                                                >
                                                    Atur Jadwal
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAcceptedInvite(true);
                                                        showToast('Shift operasional telah dikonfirmasi');
                                                    }}
                                                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all active:scale-95 flex items-center gap-1 ${
                                                        acceptedInvite
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200'
                                                    }`}
                                                >
                                                    {acceptedInvite && <Icon name="check" className="w-3.5 h-3.5" />}
                                                    <span>{acceptedInvite ? 'Shift Aktif' : 'Konfirmasi Shift'}</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION: Home Tasks Duo Bento Cards */}
                        <section aria-labelledby="home-tasks-header" className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 id="home-tasks-header" className="text-xl font-extrabold text-[#17182B]">
                                    Monitoring & Quick Action
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-[#7A7E8D] hover:text-[#17182B] transition-colors"
                                        >
                                            <span>{timeFilter}</span>
                                            <Icon name="chevron-down" className="w-3.5 h-3.5" />
                                        </button>
                                        {timeDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-elevated border border-[#E8EBF0] py-1.5 z-20">
                                                {['Hari Ini', 'Minggu Ini', 'Bulan Ini'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => {
                                                            setTimeFilter(opt);
                                                            setTimeDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-[#17182B] hover:bg-[#F8F9FC]"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setTaskModalOpen(true)}
                                        className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                                    >
                                        Tambah Catatan <span>+</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                {/* Dark Navy Bento Task Card */}
                                <article className="bg-[#17182B] text-white rounded-[28px] p-6 shadow-elevated flex flex-col justify-between relative overflow-hidden group">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-bold text-base text-white tracking-tight">Kapasitas & Sirkulasi Slot</h4>
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white bg-white/10 border border-white/10 flex items-center gap-1">
                                                High <Icon name="arrow-up-right" className="w-3 h-3 text-red-400" />
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 font-normal leading-relaxed mb-6 max-w-sm">
                                            {role === 'petugas'
                                                ? 'Lihat denah visual slot kosong untuk mengarahkan pengemudi motor dan mobil ke lantai yang tepat.'
                                                : 'Pantau ketersediaan slot parkir motor dan mobil secara realtime untuk mencegah penumpukan kendaraan di gerbang masuk.'}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex items-end justify-between gap-3">
                                        <div>
                                            <Link
                                                href={role === 'admin' ? '/area' : '/transaksi'}
                                                className="text-xs font-bold text-white underline decoration-white/40 block mb-1 hover:text-[#F8C838] transition-colors"
                                            >
                                                {role === 'admin' ? 'Master Denah & Slot Parkir' : 'Buka Denah Parkir Aktif'}
                                            </Link>
                                            <span className="text-[11px] text-gray-400 flex items-center gap-1.5 font-medium">
                                                <Icon name="calendar" className="w-3.5 h-3.5 text-gray-400" /> Realtime update
                                            </span>
                                        </div>

                                        <div className="flex -space-x-2 overflow-hidden">
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-[#17182B] bg-emerald-500 text-[10px] font-black text-white">P1</span>
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-[#17182B] bg-sky-500 text-[10px] font-black text-white">P2</span>
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-[#17182B] bg-amber-500 text-[10px] font-black text-white">AD</span>
                                        </div>
                                    </div>
                                </article>

                                {/* Warm Yellow Bento Task Card */}
                                <article className="bg-[#F8C838] text-[#17182B] rounded-[28px] p-6 shadow-elevated flex flex-col justify-between relative overflow-hidden group">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-bold text-base text-[#17182B] tracking-tight">
                                                {role === 'petugas' ? 'Pos Kasir & Struk Keluar' : 'Audit Laporan Keuangan'}
                                            </h4>
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#17182B] bg-black/10 border border-black/10 flex items-center gap-1">
                                                Normal <Icon name="arrow-down-right" className="w-3 h-3 text-[#17182B]" />
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#17182B]/90 font-medium leading-relaxed mb-6 max-w-sm">
                                            {role === 'petugas'
                                                ? `Total kas terkumpul hari ini ${rupiah(statistik?.pendapatan_hari_ini || 0)}. Pastikan struk tercetak rapi sebelum kendaraan keluar.`
                                                : `Sinkronkan total pendapatan harian ${rupiah(statistik?.pendapatan_hari_ini || 0)} dengan rekap pembayaran fisik dan non-tunai.`}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-black/10 flex items-end justify-between gap-3">
                                        <div>
                                            <Link
                                                href={role === 'petugas' ? '/transaksi/keluar' : role === 'owner' ? '/rekap' : '/laporan-keuangan'}
                                                className="text-xs font-bold text-[#17182B] underline decoration-[#17182B]/40 block mb-1 hover:text-white transition-colors"
                                            >
                                                {role === 'petugas' ? 'Buka Kasir Check-Out' : 'Rekapitulasi Keuangan'}
                                            </Link>
                                            <span className="text-[11px] text-[#17182B]/80 flex items-center gap-1.5 font-bold">
                                                <Icon name="calendar" className="w-3.5 h-3.5 text-[#17182B]" /> Tutup Buku Harian
                                            </span>
                                        </div>

                                        <div className="flex -space-x-2 overflow-hidden">
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-[#F8C838] bg-[#17182B] text-[10px] font-black text-white">OW</span>
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-[#F8C838] bg-white text-[10px] font-black text-[#17182B]">AD</span>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>
                    </main>

                    {/* ======================================================== */}
                    {/* 3. RIGHT PROFILE & SCHEDULE PANEL (330px) */}
                    {/* ======================================================== */}
                    <aside
                        id="profile-side-panel"
                        className={`w-full lg:w-[330px] bg-[#F3F4F8] p-6 lg:border-l border-[#E8EBF0] flex flex-col gap-6 shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${
                            calendarOpen ? 'block' : 'hidden lg:flex'
                        }`}
                    >
                        {/* Profile Identity Block */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-extrabold text-[#17182B]">Profile</h3>
                                {role === 'admin' && (
                                    <Link
                                        href="/users"
                                        aria-label="Edit Profile"
                                        className="text-[#7A7E8D] hover:text-[#17182B] transition-colors p-1.5 rounded-xl hover:bg-white"
                                    >
                                        <Icon name="pen-line" className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-3">
                                    <div className="w-20 h-20 rounded-full bg-emerald-600 p-1 flex items-center justify-center shadow-soft">
                                        {auth?.avatar ? (
                                            <img src={auth.avatar} alt={auth.nama_lengkap} className="w-full h-full rounded-full object-cover bg-emerald-50" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-emerald-50 flex items-center justify-center font-black text-xl text-emerald-800">
                                                {auth?.nama_lengkap?.slice(0, 2).toUpperCase() || 'US'}
                                            </div>
                                        )}
                                    </div>
                                    <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                                </div>
                                <h4 className="font-extrabold text-base text-[#17182B]">{auth?.nama_lengkap || roleLabel[role]}</h4>
                                <p className="text-xs text-[#7A7E8D] font-medium">@{auth?.username || 'user'} · {roleLabel[role]}</p>
                            </div>
                        </div>

                        {/* Interactive Weekly Calendar Strip */}
                        <div className="bg-white rounded-[26px] p-4 border border-[#E8EBF0]/60 shadow-soft">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                                    aria-label="Previous Month"
                                    className="p-1 hover:bg-[#F8F9FC] rounded-lg text-[#7A7E8D] hover:text-[#17182B]"
                                >
                                    <Icon name="chevron-left" className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-extrabold text-[#17182B]">
                                    {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDay(Math.min(31, selectedDay + 1))}
                                    aria-label="Next Month"
                                    className="p-1 hover:bg-[#F8F9FC] rounded-lg text-[#7A7E8D] hover:text-[#17182B]"
                                >
                                    <Icon name="chevron-right" className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {daysOfWeek.map((d) => {
                                    const isSelected = selectedDay === d.num;
                                    return (
                                        <div key={d.label} className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-[#7A7E8D] mb-1">{d.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedDay(d.num)}
                                                className={`w-8 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                                                    isSelected
                                                        ? 'bg-[#17182B] text-white shadow-sm ring-2 ring-[#17182B]/20 font-extrabold scale-105'
                                                        : 'text-[#17182B] hover:bg-[#F8F9FC]'
                                                }`}
                                            >
                                                {d.num}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reminders Toggle Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#7A7E8D]">Pengingat Pos</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAlertsActive(!alertsActive);
                                        showToast(alertsActive ? 'Pengingat dinonaktifkan' : 'Pengingat diaktifkan');
                                    }}
                                    aria-label="Toggle Reminders"
                                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                                        alertsActive ? 'bg-[#F8C838]' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                                            alertsActive ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                <div className="p-3 bg-white rounded-2xl border border-[#E8EBF0]/60 shadow-soft flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <Icon name="mail" className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-[#17182B] truncate">Kapasitas Slot Motor</h4>
                                        <p className="text-[10px] text-[#7A7E8D]">Pukul 12:00 WIB • Evaluasi</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-white rounded-2xl border border-[#E8EBF0]/60 shadow-soft flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <Icon name="database" className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-[#17182B] truncate">Setoran Kasir Pos</h4>
                                        <p className="text-[10px] text-[#7A7E8D]">Pukul 16:00 WIB • Tutup Kasir</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Modals */}
            {helpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17182B]/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E8EBF0] space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-base text-[#17182B]">Pusat Bantuan & Panduan</h3>
                            <button
                                type="button"
                                onClick={() => setHelpModalOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100 text-[#7A7E8D]"
                            >
                                <Icon name="x" className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-[#7A7E8D] leading-relaxed">
                            Aplikasi Parkir Art Academy Workspace dirancang untuk kemudahan check-in karcis, monitoring denah,
                            pembayaran keluar cepat, dan audit finansial.
                        </p>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setHelpModalOpen(false)}
                                className="w-full py-2.5 bg-[#17182B] text-white rounded-full text-xs font-bold hover:bg-black"
                            >
                                Tutup Panduan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rescheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17182B]/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E8EBF0] space-y-4">
                        <h3 className="font-extrabold text-base text-[#17182B]">Atur Jadwal Shift</h3>
                        <p className="text-xs text-[#7A7E8D]">Konfigurasi rotasi jam kerja petugas pos parkir.</p>
                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setRescheduleModalOpen(false)}
                                className="flex-1 py-2 bg-gray-100 rounded-full text-xs font-bold text-[#17182B]"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setRescheduleModalOpen(false);
                                    showToast('Jadwal shift berhasil diperbarui');
                                }}
                                className="flex-1 py-2 bg-[#F8C838] rounded-full text-xs font-extrabold text-[#17182B]"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {taskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17182B]/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E8EBF0] space-y-4">
                        <h3 className="font-extrabold text-base text-[#17182B]">Tambah Catatan Operasional</h3>
                        <input
                            type="text"
                            placeholder="Tulis catatan pos / instruksi..."
                            className="w-full px-4 py-2.5 rounded-2xl border border-[#E8EBF0] text-xs font-medium outline-none focus:border-[#F8C838]"
                        />
                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setTaskModalOpen(false)}
                                className="flex-1 py-2 bg-gray-100 rounded-full text-xs font-bold text-[#17182B]"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTaskModalOpen(false);
                                    showToast('Catatan berhasil ditambahkan');
                                }}
                                className="flex-1 py-2 bg-[#17182B] rounded-full text-xs font-bold text-white hover:bg-black"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Warning Modal */}
            <ConfirmModal
                open={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={() => router.post('/logout')}
                title="Konfirmasi Keluar"
                message="Apakah Anda yakin ingin keluar dari akun ini? Sesi operasional Anda saat ini akan diakhiri."
                confirmText="Ya, Log Out"
                cancelText="Batal"
                variant="warning"
            />
        </div>
    );
}
