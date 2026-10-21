import { Link } from '@inertiajs/react';

export default function Pagination({ paginator }) {
    if (!paginator || paginator.last_page <= 1) {
        return null;
    }

    const prev = paginator.links[paginator.current_page - 2];
    const next = paginator.links[paginator.current_page];

    return (
        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EBF0] pt-4 text-sm">
            <span className="text-[11px] font-medium text-[#7A7E8D]">
                Menampilkan {paginator.from ?? 0}-{paginator.to ?? 0} dari {paginator.total} data
            </span>
            <div className="flex items-center gap-1.5">
                <PageLink link={prev} label="Sebelumnya" />
                {paginator.links
                    .filter((link) => !link.label.includes('&laquo;') && !link.label.includes('&raquo;'))
                    .map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                className={`min-w-8 h-8 rounded-xl px-2.5 flex items-center justify-center text-[11px] font-bold tabular-nums transition-all ${
                                    link.active
                                        ? 'bg-[#17182B] text-white shadow-sm ring-2 ring-[#17182B]/20'
                                        : 'bg-[#F8F9FC] text-[#7A7E8D] border border-[#E8EBF0] hover:bg-white hover:text-[#17182B]'
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
        return <span className="px-3 py-1.5 text-[11px] text-gray-300">{label}</span>;
    }

    return (
        <Link
            href={link.url}
            preserveScroll
            className="rounded-xl border border-[#E8EBF0] bg-[#F8F9FC] px-3 py-1.5 text-[11px] font-semibold text-[#7A7E8D] hover:bg-white hover:text-[#17182B] transition-colors"
        >
            {label}
        </Link>
    );
}
