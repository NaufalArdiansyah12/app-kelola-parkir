import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ConfirmModal } from './ui';

const icons = {
    sparkle: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
        </svg>
    ),
    brush: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 2.625a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.375-9.375z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 6l4 4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
        </svg>
    ),
    dashboard: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
    ),
    user: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
    tarif: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
    area: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
    kendaraan: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l2-4h10l2 4M3 15h18M4 11v6a1 1 0 001 1h1m12 0h1a1 1 0 001-1v-6M7 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
    ),
    keuangan: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path strokeLinecap="round" d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path strokeLinecap="round" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    ),
    parkir: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 16V8h4a2.5 2.5 0 010 5H9" />
        </svg>
    ),
    checkin: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
    ),
    checkout: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    rekap: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    logout: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    menu: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-5 w-5">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
    ),
    calendar: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

const navByRole = {
    admin: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Kelola User', href: '/users', icon: 'user' },
        { label: 'Tarif Parkir', href: '/tarif', icon: 'tarif' },
        { label: 'Area Parkir', href: '/area', icon: 'area' },
        { label: 'Tambah Kendaraan', href: '/kendaraan', icon: 'kendaraan' },
        { label: 'Laporan Keuangan', href: '/laporan-keuangan', icon: 'keuangan' },
    ],
    petugas: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Parkir Aktif', href: '/transaksi', icon: 'parkir' },
        { label: 'Pos Check-In', href: '/transaksi/masuk', icon: 'checkin' },
        { label: 'Pos Check-Out', href: '/transaksi/keluar', icon: 'checkout' },
    ],
    owner: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Rekap Transaksi', href: '/rekap', icon: 'rekap' },
    ],
};

const roleLabel = {
    admin: 'Administrator',
    petugas: 'Petugas Pos',
    owner: 'Owner',
};

const roleSubLabel = {
    admin: 'Admin Hub',
    petugas: 'Pos Petugas',
    owner: 'Owner Hub',
};

export default function Layout({ title, subtitle, children, aside }) {
    const page = usePage();
    const { auth, flash } = page.props;
    const [open, setOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const nav = navByRole[auth?.role] ?? [];

    const isActive = (href) => {
        if (href === '/transaksi') {
            return page.url === '/transaksi' || page.url.startsWith('/transaksi?');
        }
        if (href === '/transaksi/masuk') {
            return page.url.startsWith('/transaksi/masuk');
        }
        if (href === '/transaksi/keluar') {
            return page.url.startsWith('/transaksi/keluar') || /^\/transaksi\/\d+\/checkout/.test(page.url);
        }
        return page.url === href || page.url.startsWith(href + '?');
    };

    const initials = (auth?.nama_lengkap ?? '?')
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const today = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const navItems = nav.map((item) => {
        const active = isActive(item.href);
        const IconComponent = icons[item.icon];

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs transition-all ${
                    active
                        ? 'bg-[#F8C838] text-[#17182B] font-extrabold shadow-sm'
                        : 'font-semibold text-[#7A7E8D] hover:text-[#17182B] hover:bg-white/80'
                }`}
            >
                <span className={active ? 'text-[#17182B]' : 'text-[#7A7E8D]'}>
                    {IconComponent ? <IconComponent /> : null}
                </span>
                <span className="truncate">{item.label}</span>
            </Link>
        );
    });

    return (
        <div className="min-h-screen w-full bg-[#F3F4F8] text-[#15161E] font-sans antialiased flex flex-col selection:bg-[#F8C838] selection:text-[#17182B]">
            {/* Responsive Mobile Header */}
            <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur border-b border-[#E8EBF0] z-30 sticky top-0">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        aria-label="Buka Navigasi"
                        className="p-2 rounded-xl bg-[#F8F9FC] text-[#17182B] hover:bg-[#F8C838] transition-all active:scale-95"
                    >
                        <span className="text-[#17182B]">{icons.menu()}</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#F8C838] flex items-center justify-center text-[#17182B] font-black shadow-sm">
                            {icons.sparkle}
                        </div>
                        <div>
                            <h1 className="font-black text-xs uppercase tracking-wider text-[#17182B] leading-none">Parkir</h1>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A7E8D]">
                                {roleSubLabel[auth?.role] ?? 'Workspace'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="w-8 h-8 rounded-full ring-2 ring-emerald-500 overflow-hidden bg-emerald-50 flex items-center justify-center font-bold text-xs text-[#17182B]">
                    {auth?.avatar ? (
                        <img src={auth.avatar} alt={auth.nama_lengkap} className="w-full h-full object-cover" />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>
            </header>

            {/* Mobile Backdrop */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-[#17182B]/40 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            <div className="flex-1 flex flex-col lg:flex-row relative">
                {/* Left Navigation Sidebar */}
                <aside
                    className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-[250px] bg-[#F3F4F8] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out border-r border-[#E8EBF0] shrink-0 overflow-y-auto ${
                        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                >
                    <div>
                        {/* Brand Badge */}
                        <div className="flex items-center gap-3 px-1 py-1 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-[#F8C838] flex items-center justify-center text-[#17182B] shadow-yellow-glow">
                                {icons.brush}
                            </div>
                            <div>
                                <h2 className="font-black text-base tracking-wider uppercase text-[#17182B] leading-tight">Parkir</h2>
                                <p className="text-xs font-bold tracking-widest uppercase text-[#7A7E8D] leading-none">
                                    {roleSubLabel[auth?.role] ?? 'Workspace'}
                                </p>
                            </div>
                        </div>

                        {/* Nav items */}
                        <nav className="space-y-1.5" aria-label="Navigasi utama">
                            {navItems}

                            <button
                                type="button"
                                onClick={() => setLogoutModalOpen(true)}
                                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50/80 transition-all text-left"
                            >
                                <span className="text-red-400">{icons.logout()}</span>
                                <span>Log Out</span>
                            </button>
                        </nav>
                    </div>

                    {/* Help Center Card */}
                    <div className="relative mt-8 pt-4">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#F8C838] border-4 border-[#F3F4F8] text-[#17182B] flex items-center justify-center font-black text-sm shadow-md z-10 pointer-events-auto">
                            <span>?</span>
                        </div>

                        <div className="bg-[#17182B] rounded-[28px] p-5 pt-8 text-center text-white relative shadow-elevated border border-white/5">
                            <h3 className="font-bold text-sm mb-1 text-white tracking-tight">Pusat Bantuan</h3>
                            <p className="text-[11px] text-gray-300 mb-4 leading-relaxed font-normal">
                                Butuh panduan operasional?<br />Hubungi koordinator pos!
                            </p>
                            <Link
                                href="/dashboard"
                                className="block w-full py-2.5 px-3 bg-white hover:bg-gray-100 text-[#17182B] text-xs font-bold rounded-full transition-all active:scale-95 shadow-sm text-center"
                            >
                                Buka Dashboard
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Stage */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Topbar Header */}
                    <header className="hidden lg:flex h-16 items-center justify-between gap-4 border-b border-[#E8EBF0] bg-[#F3F4F8]/90 px-8 backdrop-blur sticky top-0 z-30">
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-extrabold tracking-tight text-[#17182B]">{title}</h1>
                            {subtitle && <p className="truncate text-[11px] font-medium text-[#7A7E8D]">{subtitle}</p>}
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <span className="hidden items-center gap-1.5 rounded-full border border-[#E8EBF0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#7A7E8D] xl:inline-flex shadow-2xs">
                                {icons.calendar()}
                                {today}
                            </span>

                            <div className="flex items-center gap-2.5 rounded-full border border-[#E8EBF0] bg-white py-1 pr-3.5 pl-1 shadow-2xs">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#17182B] text-[10px] font-extrabold text-white">
                                    {initials}
                                </span>
                                <span className="leading-tight">
                                    <span className="block text-[11px] font-bold text-[#17182B]">{auth?.nama_lengkap}</span>
                                    <span className="block text-[10px] font-medium text-[#7A7E8D]">{roleLabel[auth?.role]}</span>
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setLogoutModalOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E8EBF0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#7A7E8D] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-95 shadow-2xs"
                            >
                                <span className="text-red-500 scale-90">{icons.logout()}</span>
                                <span className="hidden xl:inline">Log Out</span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col lg:flex-row">
                        <main className="flex-1 min-w-0 p-5 md:p-8 lg:p-9 space-y-7">
                            {flash?.success && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {flash.success}
                                </div>
                            )}
                            {flash?.error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 shadow-2xs flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    {flash.error}
                                </div>
                            )}

                            {children}
                        </main>

                        {aside && (
                            <aside className="w-full lg:w-[330px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#E8EBF0] bg-[#F3F4F8] p-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
                                {aside}
                            </aside>
                        )}
                    </div>
                </div>
            </div>

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
