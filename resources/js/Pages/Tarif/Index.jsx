import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import { AddButton, Badge, Button, Card, ConfirmModal, EmptyRow, Field, Modal, RowActions, StatCard, Table, inputClass } from '../../Components/ui';
import { rupiah } from '../../lib/format';

const jenisTone = {
    motor: 'green',
    mobil: 'purple',
    lainnya: 'yellow',
};

export default function TarifIndex({ tarif, jenisOptions = [], jenisTerpakai = [], stats = {} }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const form = useForm({ jenis_kendaraan: '', tarif_per_jam: '' });

    const jenisBaru = form.data.jenis_kendaraan.trim().toLowerCase();
    const duplikat = Boolean(
        jenisBaru &&
        jenisTerpakai.some(
            (jenis) => jenis === jenisBaru && jenis !== editing?.jenis_kendaraan,
        ),
    );

    const saranJenis = ['motor', 'mobil', 'truk', 'bus', 'sepeda', 'lainnya'].filter(
        (j) => !jenisTerpakai.includes(j),
    );

    const openCreate = () => {
        setEditing(null);
        form.setData({ jenis_kendaraan: '', tarif_per_jam: '' });
        form.clearErrors();
        setFormOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        form.setData({ jenis_kendaraan: item.jenis_kendaraan, tarif_per_jam: item.tarif_per_jam });
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
            form.put(`/tarif/${editing.id_tarif}`, options);
        } else {
            form.post('/tarif', options);
        }
    };

    const executeDelete = () => {
        if (!deletingItem) return;
        router.delete(`/tarif/${deletingItem.id_tarif}`, {
            preserveScroll: true,
            onFinish: () => setDeletingItem(null),
        });
    };

    return (
        <>
            <Head title="Tarif Parkir" />
            <Layout title="Tarif Parkir" subtitle="Tarif dasar per jam per jenis kendaraan">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Jenis Tarif" value={stats.total} hint="Jenis kendaraan terdaftar" accent="neutral" />
                    <StatCard label="Tarif Termurah" value={rupiah(stats.termurah)} hint="Per jam" accent="green" />
                    <StatCard label="Tarif Termahal" value={rupiah(stats.termahal)} hint="Per jam" accent="yellow" />
                </div>

                <Card
                    title="Daftar Tarif"
                    description={`${tarif.total} jenis kendaraan terdaftar`}
                    actions={<AddButton onClick={openCreate}>Tambah Tarif</AddButton>}
                >
                    <Table head={['Jenis Kendaraan', 'Tarif / Jam', 'Aksi']}>
                        {tarif.data.length === 0 && <EmptyRow colSpan={3} />}
                        {tarif.data.map((item) => (
                            <tr key={item.id_tarif} className="transition hover:bg-[#FAF8F3]">
                                <td className="px-3 py-3">
                                    <Badge tone={jenisTone[item.jenis_kendaraan] ?? 'neutral'}>
                                        <span className="capitalize">{item.jenis_kendaraan}</span>
                                    </Badge>
                                </td>
                                <td className="px-3 py-3 font-semibold text-ink tabular-nums">
                                    {rupiah(item.tarif_per_jam)}
                                </td>
                                <td className="px-3 py-3">
                                    <RowActions
                                        onEdit={() => openEdit(item)}
                                        onDelete={() => setDeletingItem(item)}
                                        editLabel={`Edit tarif ${item.jenis_kendaraan}`}
                                        deleteLabel={`Hapus tarif ${item.jenis_kendaraan}`}
                                    />
                                </td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination paginator={tarif} />
                </Card>

                <Modal
                    open={formOpen}
                    onClose={closeForm}
                    title={editing ? 'Edit Tarif' : 'Tambah Tarif'}
                    description={
                        editing
                            ? `Perbarui tarif ${editing.jenis_kendaraan}`
                            : 'Atur tarif dasar per jam untuk jenis kendaraan'
                    }
                >
                    <form onSubmit={submit} className="space-y-4">
                        <Field
                            label="Jenis Kendaraan"
                            error={form.errors.jenis_kendaraan}
                            hint="Ketik jenis baru untuk menambah jenis kendaraan."
                        >
                            <input
                                list="daftar-jenis-kendaraan"
                                className={`${inputClass} capitalize`}
                                placeholder="motor / mobil / truk"
                                value={form.data.jenis_kendaraan}
                                onChange={(e) => form.setData('jenis_kendaraan', e.target.value)}
                            />
                            <datalist id="daftar-jenis-kendaraan">
                                {saranJenis.map((jenis) => (
                                    <option key={jenis} value={jenis} />
                                ))}
                            </datalist>
                        </Field>

                        {duplikat && (
                            <div className="flex items-start gap-2 rounded-xl border border-[#F4E4BC] bg-pastel-yellow px-3 py-2.5 text-[11px] font-semibold text-pastel-yellow-text">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                >
                                    <path d="M12 9v3.75m0 3h.008M10.34 3.94 2.7 17.06A1.5 1.5 0 0 0 4 19.5h16a1.5 1.5 0 0 0 1.3-2.44L13.66 3.94a1.5 1.5 0 0 0-2.6 0Z" />
                                </svg>
                                <span>
                                    Jenis <span className="capitalize">{jenisBaru}</span> sudah memiliki tarif. Edit
                                    tarif yang ada di tabel.
                                </span>
                            </div>
                        )}
                        <Field label="Tarif per Jam (Rp)" error={form.errors.tarif_per_jam}>
                            <input
                                type="number"
                                min="0"
                                className={inputClass}
                                placeholder="0"
                                value={form.data.tarif_per_jam}
                                onChange={(e) => form.setData('tarif_per_jam', e.target.value)}
                            />
                        </Field>

                        <div className="flex justify-end gap-2 border-t border-[#EFEAE0] pt-4">
                            <Button variant="secondary" onClick={closeForm}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing || duplikat}>
                                {editing ? 'Simpan Perubahan' : 'Tambah Tarif'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <ConfirmModal
                    open={Boolean(deletingItem)}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={executeDelete}
                    title="Hapus Tarif Parkir"
                    message={`Apakah Anda yakin ingin menghapus tarif untuk jenis kendaraan "${deletingItem?.jenis_kendaraan}"? Tindakan ini permanen dan tidak dapat dibatalkan.`}
                    confirmText="Hapus Tarif"
                    cancelText="Batal"
                    variant="danger"
                />
            </Layout>
        </>
    );
}
