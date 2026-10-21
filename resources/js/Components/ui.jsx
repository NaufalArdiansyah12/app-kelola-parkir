import { useEffect } from 'react';

export const inputClass =
    'w-full rounded-2xl border border-[#E8EBF0] bg-white px-3.5 py-2.5 text-xs font-medium text-[#15161E] outline-none transition placeholder:text-[#7A7E8D]/70 focus:border-[#F8C838] focus:ring-2 focus:ring-[#F8C838]/20 disabled:bg-[#F8F9FC]';

export function Card({ title, description, actions, children, className = '' }) {
    return (
        <section className={`rounded-[26px] border border-[#E8EBF0] bg-white shadow-soft ${className}`}>
            {(title || actions) && (
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EBF0] px-6 py-4">
                    <div>
                        {title && <h2 className="text-base font-extrabold tracking-tight text-[#17182B]">{title}</h2>}
                        {description && <p className="text-xs font-medium text-[#7A7E8D]">{description}</p>}
                    </div>
                    {actions}
                </header>
            )}
            <div className="p-6">{children}</div>
        </section>
    );
}

export function Button({ variant = 'primary', type = 'button', className = '', ...props }) {
    const styles = {
        primary: 'bg-[#F8C838] text-[#17182B] hover:bg-[#E9B927] font-extrabold shadow-sm',
        secondary: 'bg-[#F8F9FC] text-[#17182B] hover:bg-gray-100 border border-[#E8EBF0] font-bold',
        danger: 'bg-red-500 text-white hover:bg-red-600 font-bold',
        ghost: 'text-[#7A7E8D] hover:bg-white hover:text-[#17182B] font-semibold',
    };

    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
            {...props}
        />
    );
}

export function Field({ label, error, hint, children }) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-xs font-bold text-[#17182B]">{label}</span>
            {children}
            {hint && !error && <span className="block text-[11px] font-medium text-[#7A7E8D]">{hint}</span>}
            {error && <span className="block text-[11px] font-semibold text-red-600">{error}</span>}
        </label>
    );
}

export function Badge({ tone = 'neutral', children }) {
    const tones = {
        neutral: 'bg-[#F8F9FC] text-[#7A7E8D] border border-[#E8EBF0]',
        green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        yellow: 'bg-amber-50 text-amber-800 border border-amber-200/60',
        purple: 'bg-purple-50 text-purple-700 border border-purple-100',
        red: 'bg-red-50 text-red-700 border border-red-100',
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-bold ${tones[tone]}`}>
            {children}
        </span>
    );
}

export function StatCard({ label, value = 0, hint, accent = 'neutral', icon }) {
    const tones = {
        neutral: {
            card: 'border-[#E8EBF0] bg-white',
            label: 'text-[#7A7E8D]',
            hint: 'text-[#7A7E8D]',
            icon: 'bg-[#F8F9FC] text-[#17182B] border border-[#E8EBF0]',
        },
        green: {
            card: 'border-emerald-100 bg-emerald-50/40',
            label: 'text-emerald-700',
            hint: 'text-emerald-600',
            icon: 'bg-white text-emerald-600 border border-emerald-100',
        },
        yellow: {
            card: 'border-amber-100 bg-amber-50/40',
            label: 'text-amber-800',
            hint: 'text-amber-700',
            icon: 'bg-white text-amber-700 border border-amber-100',
        },
        purple: {
            card: 'border-purple-100 bg-purple-50/40',
            label: 'text-purple-700',
            hint: 'text-purple-600',
            icon: 'bg-white text-purple-700 border border-purple-100',
        },
        red: {
            card: 'border-red-100 bg-red-50/40',
            label: 'text-red-700',
            hint: 'text-red-600',
            icon: 'bg-white text-red-600 border border-red-100',
        },
    };
    const tone = tones[accent] ?? tones.neutral;

    return (
        <div className={`flex items-start gap-3.5 rounded-[24px] border p-5 shadow-soft transition-all hover:shadow-elevated ${tone.card}`}>
            {icon && (
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-2xs ${tone.icon}`}>
                    {icon}
                </span>
            )}
            <div className="min-w-0">
                <p className={`text-[11px] font-bold tracking-wide uppercase ${tone.label}`}>{label}</p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums text-[#17182B]">{value}</p>
                {hint && <p className={`mt-0.5 truncate text-[11px] font-medium ${tone.hint}`}>{hint}</p>}
            </div>
        </div>
    );
}

export function SearchInput({ value, onChange, onSubmit, placeholder }) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit?.();
            }}
            className="relative"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#7A7E8D]"
                aria-hidden="true"
            >
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
                className="w-56 rounded-full border border-[#E8EBF0] bg-white py-2 pl-10 pr-4 text-xs font-medium text-[#15161E] placeholder-[#7A7E8D] shadow-2xs outline-none transition focus:border-[#F8C838] focus:ring-2 focus:ring-[#F8C838]/20"
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </form>
    );
}

export function RowActions({ onEdit, onDelete, onView, editLabel = 'Edit', deleteLabel = 'Hapus', viewLabel = 'Lihat slot' }) {
    return (
        <div className="flex items-center gap-1">
            {onView && (
                <button
                    type="button"
                    onClick={onView}
                    aria-label={viewLabel}
                    className="rounded-xl p-1.5 text-[#7A7E8D] transition hover:bg-[#F8F9FC] hover:text-[#17182B]"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                </button>
            )}
            <button
                type="button"
                onClick={onEdit}
                aria-label={editLabel}
                className="rounded-xl p-1.5 text-[#7A7E8D] transition hover:bg-[#F8F9FC] hover:text-[#17182B]"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>
            <button
                type="button"
                onClick={onDelete}
                aria-label={deleteLabel}
                className="rounded-xl p-1.5 text-[#7A7E8D] transition hover:bg-red-50 hover:text-red-600"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
        </div>
    );
}

export function AddButton({ children, ...props }) {
    return (
        <Button variant="primary" {...props}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {children}
        </Button>
    );
}

export function Modal({ open, onClose, title, description, size = 'md', children }) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#17182B]/40 p-4 backdrop-blur-xs sm:items-center"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white border border-[#E8EBF0] shadow-2xl ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'}`}
            >
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E8EBF0] px-6 py-5">
                    <div>
                        <h2 className="text-base font-extrabold tracking-tight text-[#17182B]">{title}</h2>
                        {description && <p className="mt-0.5 text-xs font-medium text-[#7A7E8D]">{description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="rounded-full p-1.5 bg-[#F8F9FC] text-[#7A7E8D] transition hover:bg-gray-200 hover:text-[#17182B]"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="overflow-y-auto px-6 py-6">{children}</div>
            </div>
        </div>
    );
}

export function EmptyRow({ colSpan, children = 'Belum ada data.' }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-10 text-center text-xs font-medium text-[#7A7E8D]">
                {children}
            </td>
        </tr>
    );
}

export function Table({ head, children }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-[#E8EBF0]/80">
            <table className="w-full min-w-[36rem] text-left text-xs">
                <thead className="bg-[#F8F9FC] border-b border-[#E8EBF0] text-[10px] uppercase font-bold tracking-wider text-[#7A7E8D]">
                    <tr>
                        {head.map((label) => (
                            <th key={label} className="px-4 py-3">
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EBF0]/70 bg-white">{children}</tbody>
            </table>
        </div>
    );
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger',
    loading = false,
}) {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose, loading]);

    if (!open) return null;

    const isDanger = variant === 'danger';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#17182B]/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-desc"
                className="w-full max-w-sm rounded-3xl bg-white border border-[#E8EBF0] shadow-2xl p-6 overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            >
                {/* Warning / Danger Icon */}
                <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${
                        isDanger
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}
                >
                    {isDanger ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    )}
                </div>

                {/* Title & Description */}
                <h3 id="confirm-modal-title" className="text-base font-extrabold text-[#17182B] tracking-tight">
                    {title}
                </h3>
                <p id="confirm-modal-desc" className="text-xs text-[#7A7E8D] font-medium leading-relaxed mt-1.5 mb-6">
                    {message}
                </p>

                {/* Actions */}
                <div className="w-full grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-full border border-[#E8EBF0] bg-[#F8F9FC] hover:bg-gray-100 text-xs font-bold text-[#17182B] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`w-full py-2.5 px-4 rounded-full text-xs font-extrabold text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                            isDanger
                                ? 'bg-[#EF4444] hover:bg-red-600'
                                : 'bg-[#17182B] hover:bg-black'
                        }`}
                    >
                        {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        <span>{confirmText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
