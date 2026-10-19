import { Head, useForm } from '@inertiajs/react';
import { Button, Field, inputClass } from '../../Components/ui';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Login - ParkirKu" />

            <div className="flex min-h-screen w-full flex-col lg:h-screen lg:flex-row lg:overflow-hidden antialiased">
                {/* Sisi Kiri: Informasi Aplikasi (50%) */}
                <div className="relative flex flex-col justify-between overflow-hidden bg-sidebar p-8 text-white sm:p-12 lg:w-1/2 lg:p-12 xl:p-16">
                    {/* Background Glow Effect */}
                    <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pastel-purple/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-pastel-yellow/10 blur-3xl" />

                    {/* Brand Header */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner">
                            <span className="text-base font-black text-pastel-purple">P</span>
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-tight text-white">ParkirKu</span>
                            <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                                v1.0
                            </span>
                        </div>
                    </div>

                    {/* Konten Utama Informasi */}
                    <div className="relative z-10 my-10 space-y-6 lg:my-0">
                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-pastel-purple/30 bg-pastel-purple/10 px-3 py-1 text-xs font-semibold text-pastel-purple">
                                <span className="h-1.5 w-1.5 rounded-full bg-pastel-purple animate-pulse" />
                                Smart Parking Management
                            </span>
                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-white">
                                Kelola Parkir Bertingkat Lebih Cepat & Teratur.
                            </h1>
                            <p className="text-sm leading-relaxed text-zinc-300">
                                Solusi menyeluruh untuk monitoring kapasitas slot secara real-time, pencatatan check-in/out akurat, serta rekapitulasi pendapatan harian.
                            </p>
                        </div>

                        {/* Poin Fitur Utama */}
                        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pastel-purple/20 text-pastel-purple">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.4 7.5 12.5 7.5 12.5s7.5-7.1 7.5-12.5A7.5 7.5 0 0 0 12 2zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold text-white">Monitoring Area & Slot</h2>
                                    <p className="text-[11px] text-zinc-400">Pantau ketersediaan slot tiap lantai secara langsung tanpa tebak-tebakan.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pastel-green/20 text-pastel-green-text">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="3" y="4" width="18" height="16" rx="4" />
                                        <path d="M12 8l4 4-4 4v-2.5H8v-3h4V8z" fill="#1e1e1e" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold text-white">Check-In & Cetak Struk Cepat</h2>
                                    <p className="text-[11px] text-zinc-400">Penerbitan barcode tiket masuk dan penghitungan tarif otomatis saat checkout.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pastel-yellow/20 text-pastel-yellow-text">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="3" y="4" width="18" height="16" rx="4" />
                                        <circle cx="16" cy="14" r="2.2" fill="#1e1e1e" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold text-white">Rekapitulasi & Tarif Dinamis</h2>
                                    <p className="text-[11px] text-zinc-400">Tarif berbasis jam atau flat per jenis kendaraan dengan laporan omzet transparan.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Kiri */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>&copy; {new Date().getFullYear()} ParkirKu System</span>
                        <span>Multi-Level Parking Solution</span>
                    </div>
                </div>

                {/* Sisi Kanan: Form Login (50%) */}
                <div className="flex flex-1 items-center justify-center overflow-y-auto bg-canvas p-6 sm:p-12 lg:w-1/2 lg:p-12 xl:p-16">
                    <div className="w-full max-w-md space-y-8">
                        <div>
                            <span className="inline-block rounded-full bg-panel-warm px-3 py-1 text-xs font-semibold text-[#6B665E]">
                                Akses Petugas & Admin
                            </span>
                            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                                Selamat Datang
                            </h2>
                            <p className="mt-1 text-xs font-medium text-muted">
                                Masukkan kredensial akun untuk mengakses sistem operasional parkir.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-panel-border bg-white p-6 shadow-xs sm:p-8">
                            <Field label="Username" error={errors.username}>
                                <input
                                    className={inputClass}
                                    value={data.username}
                                    onChange={(event) => setData('username', event.target.value)}
                                    placeholder="Masukkan username"
                                    autoComplete="username"
                                    autoFocus
                                />
                            </Field>

                            <Field label="Password" error={errors.password}>
                                <input
                                    type="password"
                                    className={inputClass}
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </Field>

                            <Button type="submit" disabled={processing} className="w-full py-2.5 text-sm">
                                {processing ? 'Memproses Masuk...' : 'Masuk ke Sistem'}
                            </Button>

                            <div className="rounded-xl border border-panel-border bg-panel-warm/60 p-3 text-center text-[11px] text-[#6B665E]">
                                Akun bermasalah? Hubungi administrator untuk reset password atau aktivasi role.
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
