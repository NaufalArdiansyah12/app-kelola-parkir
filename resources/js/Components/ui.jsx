import { useEffect } from 'react';

export const inputClass =
    'w-full rounded-xl border border-panel-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:bg-panel-warm';

export function Card({ title, description, actions, children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-panel-border bg-white shadow-xs ${className}`}>
            {(title || actions) && (
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEAE0] px-5 py-3.5">
                    <div>
                        {title && <h2 className="text-sm font-bold tracking-tight text-ink">{title}</h2>}
                        {description && <p className="text-xs font-medium text-muted">{description}</p>}
                    </div>
                    {actions}
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

export function Button({ variant = 'primary', type = 'button', className = '', ...props }) {
    const styles = {
        primary: 'bg-ink text-white hover:bg-black',
        secondary: 'bg-panel-warm text-ink hover:bg-[#E1DACB] border border-panel-border',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'text-muted hover:bg-panel-warm hover:text-ink',
    };

    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
            {...props}
        />
    );
}

export function Field({ label, error, hint, children }) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-[11px] font-semibold tracking-wide text-[#6B665E]">{label}</span>
            {children}
            {hint && !error && <span className="block text-[11px] text-muted">{hint}</span>}
            {error && <span className="block text-[11px] font-medium text-red-600">{error}</span>}
        </label>
    );
}

export function Badge({ tone = 'neutral', children }) {
    const tones = {
        neutral: 'bg-panel-warm text-[#6B665E]',
        green: 'bg-pastel-green text-pastel-green-text',
        yellow: 'bg-pastel-yellow text-pastel-yellow-text',
        red: 'bg-red-50 text-red-700',
        purple: 'bg-[#EDEFFF] text-pastel-purple-dark',
    };

    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
            {children}
        </span>
    );
}

export function StatCard({ label, value = 0, hint, accent = 'neutral', icon }) {
    const tones = {
        neutral: {
            card: 'border-[#E1DACB] bg-panel-warm',
            label: 'text-[#6B665E]',
            hint: 'text-[#8A8377]',
            icon: 'bg-white/70 text-[#6B665E]',
        },
        green: {
            card: 'border-[#D3DFD5] bg-pastel-green',
            label: 'text-pastel-green-text',
            hint: 'text-pastel-green-text/80',
            icon: 'bg-white/60 text-pastel-green-text',
        },
        yellow: {
            card: 'border-[#F4E4BC] bg-pastel-yellow',
            label: 'text-pastel-yellow-text',
            hint: 'text-pastel-yellow-text/80',
            icon: 'bg-white/60 text-pastel-yellow-text',
        },
        purple: {
            card: 'border-pastel-purple-dark/30 bg-pastel-purple',
            label: 'text-white/85',
            hint: 'text-white/75',
            icon: 'bg-white/20 text-white',
        },
        red: {
            card: 'border-red-200 bg-red-50',
            label: 'text-red-700',
            hint: 'text-red-700/80',
            icon: 'bg-white/70 text-red-700',
        },
    };
    const tone = tones[accent] ?? tones.neutral;

    return (
        <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xs transition-shadow hover:shadow-sm ${tone.card}`}>
            {icon && (
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                    {icon}
                </span>
            )}
            <div className="min-w-0">
                <p className={`text-[11px] font-semibold tracking-wide ${tone.label}`}>{label}</p>
                <p className="mt-0.5 text-xl font-extrabold tracking-tight tabular-nums text-ink">{value}</p>
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
                strokeWidth="1.75"
                strokeLinecap="round"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
            >
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
                className={`${inputClass} w-52 pl-9`}
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
                    className="rounded-lg p-1.5 text-muted transition hover:bg-panel-warm hover:text-ink"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                    >
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
                className="rounded-lg p-1.5 text-muted transition hover:bg-panel-warm hover:text-ink"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                >
                    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>
            <button
                type="button"
                onClick={onDelete}
                aria-label={deleteLabel}
                className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                >
                    <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
        </div>
    );
}

export function AddButton({ children, ...props }) {
    return (
        <Button {...props}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
            >
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
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'}`}
            >
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#EFEAE0] px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
                        {description && <p className="mt-0.5 text-xs font-medium text-muted">{description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="rounded-lg p-1.5 text-muted transition hover:bg-panel-warm hover:text-ink"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="overflow-y-auto px-5 py-5">{children}</div>
            </div>
        </div>
    );
}

export function EmptyRow({ colSpan, children = 'Belum ada data.' }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-3 py-10 text-center text-xs font-medium text-muted">
                {children}
            </td>
        </tr>
    );
}

export function Table({ head, children }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-[#EFEAE0] text-[11px] uppercase tracking-wider text-muted">
                    <tr>
                        {head.map((label) => (
                            <th key={label} className="px-3 py-2 font-semibold">
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EEE4]">{children}</tbody>
            </table>
        </div>
    );
}
