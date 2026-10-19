import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import {
    AddButton,
    Badge,
    Button,
    Card,
    EmptyRow,
    Field,
    Modal,
    RowActions,
    SearchInput,
    StatCard,
    Table,
    inputClass,
} from '../../Components/ui';

const emptyForm = {
    plat_nomor: '',
    jenis_kendaraan: 'motor',
    warna: '',
    pemilik: '',
};

const jenisTone = {
    motor: 'green',
    mobil: 'purple',
    lainnya: 'yellow',
};

export default function KendaraanIndex({ kendaraan, filters, jenisOptions, stats = {} }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const form = useForm({ ...emptyForm });

    const openCreate = () => {
        setEditing(null);
        form.setData({ ...emptyForm });
        form.clearErrors();
        setFormOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        form.setData({
            plat_nomor: item.plat_nomor,
            jenis_kendaraan: item.jenis_kendaraan,
            warna: item.warna ?? '',
            pemilik: item.pemilik ?? '',
        });
        form.clearErrors();
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        form.reset();
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => closeForm() };

        if (editing) {
            form.put(`/kendaraan/${editing.id_kendaraan}`, options);
        } else {
            form.post('/kendaraan', options);
        }
    };

    const destroy = (item) => {
        if (confirm(`Hapus kendaraan ${item.plat_nomor}?`)) {
            router.delete(`/kendaraan/${item.id_kendaraan}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Data Kendaraan" />
            <Layout title="Data Kendaraan" subtitle="Master kendaraan terdaftar">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Kendaraan" value={stats.total} hint="Terdaftar di sistem" accent="neutral" />
                    <StatCard label="Motor" value={stats.motor} hint="Kendaraan roda dua" accent="green" />
                    <StatCard label="Mobil" value={stats.mobil} hint="Kendaraan roda empat" accent="purple" />
                    <StatCard label="Lainnya" value={stats.lainnya} hint="Jenis kendaraan lain" accent="yellow" />
                </div>

                <Card
                    title="Daftar Kendaraan"
                    description={`${kendaraan.total} kendaraan terdaftar`}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                onSubmit={() => router.get('/kendaraan', { search }, { preserveState: true })}
                                placeholder="Cari plat atau pemilik"
                            />
                            <AddButton onClick={openCreate}>Tambah Kendaraan</AddButton>
                        </div>
                    }
                >
                    <Table head={['Kendaraan', 'Jenis', 'Warna', 'Pemilik', 'Dicatat Oleh', 'Aksi']}>
                        {kendaraan.data.length === 0 && <EmptyRow colSpan={6}>Tidak ada kendaraan yang cocok.</EmptyRow>}
                        {kendaraan.data.map((item) => (
                            <tr key={item.id_kendaraan} className="transition hover:bg-[#FAF8F3]">
                                <td className="px-3 py-3">
                                    <span className="inline-block rounded-lg border border-panel-border bg-panel-warm px-2 py-1 font-mono text-xs font-bold tracking-wider text-ink">
                                        {item.plat_nomor}
                                    </span>
                                </td>
                                <td className="px-3 py-3">
                                    <Badge tone={jenisTone[item.jenis_kendaraan] ?? 'neutral'}>
                                        <span className="capitalize">{item.jenis_kendaraan}</span>
                                    </Badge>
                                </td>
                                <td className="px-3 py-3 text-[#6B665E]">{item.warna || '-'}</td>
                                <td className="px-3 py-3 font-medium text-ink">{item.pemilik || '-'}</td>
                                <td className="px-3 py-3 text-xs text-muted">{item.dicatat_oleh || '-'}</td>
                                <td className="px-3 py-3">
                                    <RowActions
                                        onEdit={() => openEdit(item)}
                                        onDelete={() => destroy(item)}
                                        editLabel={`Edit ${item.plat_nomor}`}
                                        deleteLabel={`Hapus ${item.plat_nomor}`}
                                    />
                                </td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination paginator={kendaraan} />
                </Card>

                <Modal
                    open={formOpen}
                    onClose={closeForm}
                    title={editing ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
                    description={editing ? `Perbarui data ${editing.plat_nomor}` : 'Daftarkan kendaraan baru ke sistem'}
                >
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Plat Nomor" error={form.errors.plat_nomor}>
                                <input
                                    className={`${inputClass} font-mono uppercase`}
                                    placeholder="B 1234 ABC"
                                    value={form.data.plat_nomor}
                                    onChange={(e) => form.setData('plat_nomor', e.target.value.toUpperCase())}
                                />
                            </Field>
                            <Field label="Jenis Kendaraan" error={form.errors.jenis_kendaraan}>
                                <select
                                    className={`${inputClass} capitalize`}
                                    value={form.data.jenis_kendaraan}
                                    onChange={(e) => form.setData('jenis_kendaraan', e.target.value)}
                                >
                                    {jenisOptions.map((jenis) => (
                                        <option key={jenis} value={jenis}>
                                            {jenis}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Warna" error={form.errors.warna}>
                                <input
                                    className={inputClass}
                                    placeholder="Contoh: Hitam"
                                    value={form.data.warna}
                                    onChange={(e) => form.setData('warna', e.target.value)}
                                />
                            </Field>
                            <Field label="Pemilik" error={form.errors.pemilik}>
                                <input
                                    className={inputClass}
                                    placeholder="Nama pemilik"
                                    value={form.data.pemilik}
                                    onChange={(e) => form.setData('pemilik', e.target.value)}
                                />
                            </Field>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[#EFEAE0] pt-4">
                            <Button variant="secondary" onClick={closeForm}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </Layout>
        </>
    );
}
