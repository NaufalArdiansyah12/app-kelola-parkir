import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Custom Icon Set matching the modern rounded/dual-tone sidebar reference
 */
const icons = {
    brandCube: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="2" width="20" height="20" rx="3.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7.5l5 2.8v5.4l-5 2.8-5-2.8v-5.4l5-2.8z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7.5v11M12 13l5-2.7M12 13l-5-2.7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    dashboard: ({ active }) => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none">
            {/* Pie chart dual-tone */}
            <path
                d="M11 3.05a9 9 0 1 0 9.95 9.95H11V3.05z"
                fill={active ? '#7C7CEE' : '#71717A'}
            />
            <path
                d="M13.5 2.1a9 9 0 0 1 8.4 8.4H13.5V2.1z"
                fill={active ? '#FCD34D' : '#A1A1AA'}
            />
        </svg>
    ),
    user: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2.5c-4.42 0-8 2.24-8 5v1a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-1c0-2.76-3.58-5-8-5z" />
        </svg>
    ),
    tarif: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="4" />
            <rect x="6" y="8" width="5" height="2.5" rx="1.25" fill="#27272A" />
            <circle cx="16" cy="14" r="2.2" fill="#27272A" />
        </svg>
    ),
    area: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.4 7.5 12.5 7.5 12.5s7.5-7.1 7.5-12.5A7.5 7.5 0 0 0 12 2zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z" />
        </svg>
    ),
    kendaraan: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <path d="M5 8.5a2 2 0 0 1 1.8-1.1h10.4a2 2 0 0 1 1.8 1.1l1.8 3.6A2 2 0 0 1 21 13v4a1.5 1.5 0 0 1-1.5 1.5H18a2 2 0 0 1-4 0H10a2 2 0 0 1-4 0H4.5A1.5 1.5 0 0 1 3 17v-4c0-.35.09-.7.25-1L5 8.5zm3 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </svg>
    ),
    keuangan: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <rect x="2" y="5" width="20" height="14" rx="3.5" />
            <circle cx="12" cy="12" r="3" fill="#27272A" />
            <path d="M6 10h1v4H6zm11 0h1v4h-1z" fill="#27272A" />
        </svg>
    ),
    log: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="4" />
            <path d="M7 9h10v2H7zm0 4h6v2H7z" fill="#27272A" />
        </svg>
    ),
    parkir: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="4.5" />
            <path d="M9.5 7h4a3 3 0 0 1 0 6H12v4H9.5V7zm2.5 4h1.5a1 1 0 0 0 0-2H12v2z" fill="#27272A" />
        </svg>
    ),
    checkin: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="4.5" />
            <path d="M12 8l4 4-4 4v-2.5H8v-3h4V8z" fill="#27272A" />
        </svg>
    ),
    checkout: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="4.5" />
            <path d="M12 8l-4 4 4 4v-2.5h4v-3h-4V8z" fill="#27272A" />
        </svg>
    ),
    rekap: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3h13A1.5 1.5 0 0 1 20 4.5V6H4V4.5zM4 8h16v1.5a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 9.5V8zm4 7h8a1.5 1.5 0 0 1 1.5 1.5v.5a3.5 3.5 0 0 1-3.5 3.5H9A3.5 3.5 0 0 1 5.5 17v-.5A1.5 1.5 0 0 1 7 15h1z" />
        </svg>
    ),
    logout: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="4.5" />
            <path d="M11 9l3 3-3 3v-2H8v-2h3V9z" fill="#27272A" />
        </svg>
    ),
    close: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    menu: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
    ),
    calendar: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <rect width="18" height="18" x="3" y="4" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

const navByRole = {
    admin: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'User', href: '/users', icon: 'user' },
        { label: 'Tarif', href: '/tarif', icon: 'tarif' },
        { label: 'Area Parkir', href: '/area', icon: 'area' },
        { label: 'Kendaraan', href: '/kendaraan', icon: 'kendaraan' },
        { label: 'Laporan Keuangan', href: '/laporan-keuangan', icon: 'keuangan' },
    ],
    petugas: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Parkir Aktif', href: '/transaksi', icon: 'parkir' },
        { label: 'Check-In', href: '/transaksi/masuk', icon: 'checkin' },
        { label: 'Check-Out', href: '/transaksi/keluar', icon: 'checkout' },
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

export default function Layout({ title, subtitle, children, aside }) {
    const page = usePage();
    const { auth, flash } = page.props;
    const [open, setOpen] = useState(false);
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
                className={`flex items-center gap-4 py-2.5 px-3 text-sm font-medium transition-colors ${
                    active ? 'text-[#FDE68A]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
                <span className={active ? 'text-inherit' : 'text-zinc-500'}>
                    {IconComponent ? <IconComponent active={active} /> : null}
                </span>
                <span className="truncate tracking-wide">{item.label}</span>
            </Link>
        );
    });

    const LogoutIcon = icons.logout;

    return (
        <div className="min-h-screen bg-canvas text-ink antialiased">
            {/* Header Mobile */}
            <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-sidebar px-5 py-3.5 text-white shadow-lg lg:hidden">
                <div className="flex items-center gap-2.5">
                    <span className="text-white">{icons.brandCube}</span>
                    <span className="text-lg font-bold tracking-tight">ParkirKu</span>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 active:scale-95"
                    aria-label="Buka navigasi"
                >
                    {icons.menu()}
                </button>
            </header>

            {/* Backdrop Mobile */}
            <div
                onClick={() => setOpen(false)}
                className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            <div className="flex min-h-screen w-full bg-canvas pt-14 lg:pt-0">
                {/* Sidebar (Sesuai Gaya Desain Gambar: background #262628 / Dark Graphite) */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col justify-between overflow-y-auto bg-sidebar px-6 py-8 text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
                        open ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex flex-col">
                        {/* Logo & Brand */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-white">{icons.brandCube}</span>
                                <span className="text-xl font-bold tracking-tight text-white">ParkirKu</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white lg:hidden"
                                aria-label="Tutup navigasi"
                            >
                                {icons.close()}
                            </button>
                        </div>

                        {/* Profile Section */}
                        <div className="mt-8 flex flex-col items-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800 text-xl font-bold text-zinc-200 shadow-md">
                                {auth?.avatar ? (
                                    <img src={auth.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <span className="mt-4 text-xs font-normal text-zinc-400">Welcome Back,</span>
                            <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white">
                                {auth?.nama_lengkap}
                            </h2>
                        </div>

                        {/* Navigation Items */}
                        <nav className="mt-10 flex flex-col gap-1.5" aria-label="Navigasi utama">
                            {navItems}
                        </nav>
                    </div>

                    {/* Bottom Logout */}
                    <div className="pt-6">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-4 px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200 active:scale-95"
                        >
                            <span className="text-zinc-500">
                                <LogoutIcon />
                            </span>
                            <span className="tracking-wide">Log Out</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-panel-border bg-canvas/85 px-8 backdrop-blur lg:flex xl:px-10">
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-extrabold tracking-tight text-ink">{title}</h1>
                            {subtitle && (
                                <p className="truncate text-[11px] font-medium text-muted">{subtitle}</p>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                            <span className="hidden items-center gap-1.5 rounded-full border border-panel-border bg-white px-3 py-1.5 text-[11px] font-semibold text-muted xl:inline-flex">
                                {icons.calendar()}
                                {today}
                            </span>

                            <div className="flex items-center gap-2.5 rounded-full border border-panel-border bg-white py-1 pr-3.5 pl-1">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar text-[10px] font-extrabold text-white">
                                    {initials}
                                </span>
                                <span className="hidden leading-tight sm:block">
                                    <span className="block text-[11px] font-bold text-ink">
                                        {auth?.nama_lengkap}
                                    </span>
                                    <span className="block text-[10px] font-medium text-muted">
                                        {roleLabel[auth?.role]}
                                    </span>
                                </span>
                            </div>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="inline-flex items-center gap-1.5 rounded-full border border-panel-border bg-white px-3 py-2 text-[11px] font-semibold text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-95"
                                aria-label="Log Out"
                            >
                                <span className="text-zinc-500 scale-90"><LogoutIcon /></span>
                                <span className="hidden xl:inline">Log Out</span>
                            </Link>
                        </div>
                    </header>

                    <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
                        <main className="flex min-w-0 flex-1 flex-col gap-7 p-5 md:p-8 lg:p-10">
                            <div className="flex flex-wrap items-start justify-between gap-3 lg:hidden">
                                <div>
                                    <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
                                    {subtitle && (
                                        <p className="mt-0.5 text-xs font-medium text-muted">{subtitle}</p>
                                    )}
                                </div>
                                <span className="rounded-full border border-panel-border bg-white px-3 py-1 text-[11px] font-semibold text-muted">
                                    @{auth?.username}
                                </span>
                            </div>

                            {flash?.success && (
                                <div className="rounded-xl border border-[#CFE0D1] bg-pastel-green px-4 py-3 text-xs font-semibold text-pastel-green-text">
                                    {flash.success}
                                </div>
                            )}
                            {flash?.error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                                    {flash.error}
                                </div>
                            )}

                            {children}
                        </main>

                        {aside && (
                            <aside className="w-full shrink-0 border-t border-panel-border bg-panel-warm p-5 md:p-8 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l">
                                {aside}
                            </aside>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}