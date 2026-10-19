import { Link } from '@inertiajs/react';

export default function Pagination({ paginator }) {
    if (!paginator || paginator.last_page <= 1) {
        return null;
    }

    const prev = paginator.links[paginator.current_page - 2];
    const next = paginator.links[paginator.current_page];

    return (
        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEAE0] pt-4 text-sm">
            <span className="text-[11px] font-medium text-muted">
                Menampilkan {paginator.from ?? 0}-{paginator.to ?? 0} dari {paginator.total} data
            </span>
            <div className="flex items-center gap-1">
                <PageLink link={prev} label="Sebelumnya" />
                {paginator.links
                    .filter((link) => !link.label.includes('&laquo;') && !link.label.includes('&raquo;'))
                    .map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                className={`min-w-8 rounded-lg px-2 py-1 text-center text-[11px] font-bold tabular-nums ${
                                    link.active ? 'bg-ink text-white' : 'bg-panel-warm text-[#6B665E] hover:bg-[#E1DACB]'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : null,
                    )}
                <PageLink link={next} label="Berikutnya" />
            </div>
        </nav>
    );
}

function PageLink({ link, label }) {
    if (!link?.url) {
        return <span className="px-2 py-1 text-[11px] text-[#C9C2B4]">{label}</span>;
    }

    return (
        <Link
            href={link.url}
            preserveScroll
            className="rounded-lg bg-panel-warm px-2 py-1 text-[11px] font-semibold text-[#6B665E] hover:bg-[#E1DACB]"
        >
            {label}
        </Link>
    );
}
