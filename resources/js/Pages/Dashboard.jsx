import { Head, Link, usePage } from '@inertiajs/react';
import Layout from '../Components/Layout';
import { Badge } from '../Components/ui';
import { rupiah } from '../lib/format';

const ctaByRole = {
    admin: { title: 'Kelola Master', body: 'Atur tarif, area, dan akun petugas.', label: 'Buka User', href: '/users' },
    petugas: { title: 'Pos Check-In', body: 'Catat kendaraan masuk dan cetak karcis.', label: 'Check-In', href: '/transaksi/masuk' },
    owner: { title: 'Laporan', body: 'Tinjau pendapatan pada periode tertentu.', label: 'Lihat Rekap', href: '/rekap' },
};

const donutColors = ['#8E9AFF', '#BACFBE', '#F3DE9A'];

export default function Dashboard({ statistik, area, chart, jenis, recent, tambahan }) {
    const { auth } = usePage().props;
    const cta = ctaByRole[auth.role] ?? ctaByRole.petugas;
    const totalMasuk = chart.reduce((total, item) => total + item.jumlah, 0);
    const maks = Math.max(1, ...chart.map((item) => item.jumlah));
    const totalJenis = jenis.reduce((total, item) => total + Number(item.pendapatan), 0);

    return (
        <>
            <Head title="Dashboard" />
            <Layout
                title="Dashboard"
                subtitle="Ringkasan operasional parkir hari ini"
                aside={
                    <>
                        <section className="flex flex-col gap-5">
                            <div>
                                <h2 className="text-base font-bold tracking-tight text-ink">Pendapatan 30 Hari</h2>
                                <p className="mt-0.5 text-xs font-medium text-muted">Komposisi per jenis kendaraan</p>
                            </div>

                            <div className="flex flex-col items-center pt-2">
                                <Donut data={jenis} total={totalJenis} />
                                <div className="w-full space-y-2 pt-5">
                                    {jenis.length === 0 && (
                                        <p className="text-center text-xs text-muted">Belum ada transaksi keluar.</p>
                                    )}
                                    {jenis.map((item, index) => (
                                        <div key={item.jenis_kendaraan} className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2 font-medium capitalize text-[#6B665E]">
                                                <span
                                                    className="h-2 w-2 rounded-[2px]"
                                                    style={{ backgroundColor: donutColors[index % donutColors.length] }}
                                                />
                                                {item.jenis_kendaraan}
                                            </span>
                                            <span className="font-bold tabular-nums text-ink">{rupiah(item.pendapatan)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="flex flex-col gap-4 border-t border-panel-border pt-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold tracking-tight text-ink">Area Parkir</h2>
                                <Link href={auth.role === 'admin' ? '/area' : '/transaksi'} className="text-xs font-semibold text-muted hover:text-ink">
                                    Lihat
                                </Link>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                {area.length === 0 && <p className="text-xs text-muted">Belum ada area.</p>}
                                {area.map((item) => {
                                    const persen = Math.min(100, Math.round((item.terisi / item.kapasitas) * 100));

                                    return (
                                        <div key={item.id_area} className="rounded-2xl border border-[#E6E0D4] bg-white px-4 py-3 shadow-xs">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-ink">{item.nama_area}</span>
                                                <span className="font-semibold tabular-nums text-muted">
                                                    {item.terisi}/{item.kapasitas}
                                                </span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-chart-track">
                                                <div
                                                    className={`h-full rounded-full ${persen >= 100 ? 'bg-red-400' : 'bg-chart-bar'}`}
                                                    style={{ width: `${Math.max(3, persen)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                }
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="relative flex h-[164px] flex-col justify-between overflow-hidden rounded-card-xl border border-[#D3DFD5] bg-pastel-green p-5 shadow-xs transition-shadow hover:shadow-sm">
                        <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#D2E2D4] px-2.5 py-0.5 text-[11px] font-semibold text-pastel-green-text">
                                Parkir aktif
                            </span>
                            <div className="mt-3.5 text-2xl font-extrabold tracking-tight tabular-nums text-ink">
                                {statistik.kendaraan_aktif} kendaraan
                            </div>
                            <p className="mt-1 text-xs font-medium text-pastel-green-text">
                                {area.reduce((total, item) => total + item.sisa, 0)} slot tersedia
                            </p>
                        </div>
                        <div className="flex items-end gap-1">
                            {area.slice(0, 12).map((item) => (
                                <span
                                    key={item.id_area}
                                    className="w-1.5 rounded-full bg-pastel-green-text/50"
                                    style={{ height: `${8 + Math.min(24, item.terisi * 3)}px` }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex h-[164px] flex-col justify-between rounded-card-xl border border-[#F4E4BC] bg-pastel-yellow p-5 shadow-xs transition-shadow hover:shadow-sm">
                        <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F5E6BF] px-2.5 py-0.5 text-[11px] font-semibold text-pastel-yellow-text">
                                Pendapatan hari ini
                            </span>
                            <div className="mt-3.5 text-2xl font-extrabold tracking-tight tabular-nums text-ink">
                                {rupiah(statistik.pendapatan_hari_ini)}
                            </div>
                            <p className="mt-1 text-xs font-medium text-pastel-yellow-text">
                                {statistik.transaksi_hari_ini} transaksi selesai
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-pastel-yellow-text">
                            <span className="h-2 w-2 rounded-full bg-pastel-yellow-text/60" />
                            {totalMasuk} kendaraan masuk dalam 7 hari
                        </div>
                    </div>

                    <div className="relative flex h-[164px] flex-col justify-between rounded-card-xl border border-pastel-purple-dark/30 bg-pastel-purple p-5 text-white shadow-xs">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold tracking-tight">{cta.title}</h3>
                                <span className="h-2 w-2 rounded-full bg-white/70" />
                            </div>
                            <p className="mt-1 pr-3 text-xs leading-relaxed text-white/85">{cta.body}</p>
                        </div>
                        <div>
                            <Link
                                href={cta.href}
                                className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-bold text-pastel-purple shadow-sm transition-all hover:bg-zinc-50 active:scale-95"
                            >
                                {cta.label}
                            </Link>
                        </div>
                    </div>
                </div>

                {tambahan?.total_user !== undefined && (
                    <div className="flex flex-wrap gap-2">
                        <Badge>Total user: {tambahan.total_user}</Badge>
                        <Badge>Total kendaraan: {tambahan.total_kendaraan}</Badge>
                        <Badge>Jenis tarif: {tambahan.total_tarif}</Badge>
                    </div>
                )}

                {tambahan?.pendapatan_bulan_ini !== undefined && (
                    <div className="flex flex-wrap gap-2">
                        <Badge tone="purple">Pendapatan bulan ini: {rupiah(tambahan.pendapatan_bulan_ini)}</Badge>
                    </div>
                )}

                <section className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                            <span className="text-xs font-medium text-muted">Kendaraan Masuk per Hari</span>
                            <div className="mt-0.5 text-2xl font-extrabold tracking-tight tabular-nums text-ink">
                                + {totalMasuk} kendaraan
                            </div>
                        </div>
                        <Link
                            href={auth.role === 'owner' ? '/rekap' : '/transaksi'}
                            className="text-xs font-semibold text-muted transition-colors hover:text-ink"
                        >
                            Lihat data lengkap →
                        </Link>
                    </div>

                    <div className="relative grid h-[240px] grid-cols-7 items-end gap-3 rounded-card-xl border border-[#ECE7DC] bg-white/40 px-4 pt-9 pb-3 sm:gap-6 sm:px-6">
                        {chart.map((item, index) => {
                            const tinggi = Math.max(4, Math.round((item.jumlah / maks) * 100));
                            const hariIni = index === chart.length - 1;

                            return (
                                <div key={item.tanggal} className="group relative flex h-full flex-col items-center justify-end">
                                    {hariIni && (
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-zinc-200/80 bg-white px-3 py-1 text-[11px] font-extrabold tabular-nums text-ink shadow-md">
                                            {item.jumlah}
                                        </div>
                                    )}
                                    <div
                                        className={`flex h-full w-7 flex-col justify-end overflow-hidden rounded-full p-0.5 transition-all sm:w-10 ${
                                            hariIni ? 'bg-chart-track ring-2 ring-zinc-300' : 'bg-chart-track group-hover:bg-[#E2DDD2]'
                                        }`}
                                    >
                                        <div
                                            className="w-full rounded-full bg-chart-bar transition-all duration-500"
                                            style={{ height: `${tinggi}%` }}
                                            title={`${item.jumlah} kendaraan`}
                                        />
                                    </div>
                                    <span
                                        className={`mt-3 text-[11px] ${
                                            hariIni ? 'font-bold text-ink' : 'font-semibold text-muted'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                        <h2 className="text-base font-bold tracking-tight text-ink">Transaksi Terakhir</h2>
                        <Link
                            href={auth.role === 'owner' ? '/rekap' : '/transaksi'}
                            className="text-[11px] font-semibold text-muted hover:text-ink"
                        >
                            Lihat semua
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {recent.length === 0 && (
                            <div className="rounded-2xl border border-[#EAE5DA] bg-white px-5 py-8 text-center text-xs text-muted">
                                Belum ada transaksi.
                            </div>
                        )}
                        {recent.map((item) => (
                            <div
                                key={item.id_parkir}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EAE5DA] bg-white px-5 py-3.5 shadow-xs transition-all hover:border-zinc-300"
                            >
                                <div className="flex w-48 items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel-warm text-[10px] font-extrabold text-[#6B665E]">
                                        {item.plat_nomor?.slice(0, 2)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-mono text-xs font-bold text-ink">{item.plat_nomor}</p>
                                        <p className="text-[10px] font-medium capitalize text-muted">
                                            {item.jenis_kendaraan} · {item.nama_area}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs font-bold tabular-nums text-ink">
                                    {item.status === 'keluar' ? rupiah(item.biaya_total) : '-'}
                                </div>
                                <Badge tone={item.status === 'masuk' ? 'yellow' : 'green'}>
                                    {item.status === 'masuk' ? 'Masuk' : 'Selesai'}
                                </Badge>
                                <div className="hidden text-xs font-medium text-muted sm:block">{item.waktu}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </Layout>
        </>
    );
}

function Donut({ data, total }) {
    const keliling = 2 * Math.PI * 38;
    let offset = 0;

    return (
        <div className="relative flex h-44 w-44 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#EAE5DB" strokeWidth="14" fill="transparent" />
                {data.map((item, index) => {
                    const porsi = total > 0 ? Number(item.pendapatan) / total : 0;
                    const panjang = porsi * keliling;
                    const segmen = (
                        <circle
                            key={item.jenis_kendaraan}
                            cx="50"
                            cy="50"
                            r="38"
                            stroke={donutColors[index % donutColors.length]}
                            strokeWidth="14"
                            fill="transparent"
                            strokeDasharray={`${panjang} ${keliling - panjang}`}
                            strokeDashoffset={-offset}
                        />
                    );
                    offset += panjang;

                    return segmen;
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Total</span>
                <span className="text-base font-extrabold tabular-nums text-ink">{rupiah(total)}</span>
            </div>
        </div>
    );
}
