import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import { AddButton, Badge, Button, Card, ConfirmModal, EmptyRow, Field, Modal, RowActions, SearchInput, StatCard, Table, inputClass } from '../../Components/ui';

const emptyForm = {
    nama_lengkap: '',
    username: '',
    password: '',
    role: 'petugas',
    status_aktif: true,
};

const roleMeta = {
    admin: { label: 'Admin', tone: 'purple' },
    petugas: { label: 'Petugas', tone: 'green' },
    owner: { label: 'Owner', tone: 'yellow' },
};

const initials = (name) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');

export default function UsersIndex({ users, filters, stats = {} }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const form = useForm({ ...emptyForm });

    const openCreate = () => {
        setEditing(null);
        form.setData({ ...emptyForm });
        form.clearErrors();
        setFormOpen(true);
    };

    const openEdit = (user) => {
        setEditing(user);
        form.setData({
            nama_lengkap: user.nama_lengkap,
            username: user.username,
            password: '',
            role: user.role,
            status_aktif: user.status_aktif,
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
            form.put(`/users/${editing.id_user}`, options);
        } else {
            form.post('/users', options);
        }
    };

    const executeDelete = () => {
        if (!deletingUser) return;
        router.delete(`/users/${deletingUser.id_user}`, {
            preserveScroll: true,
            onFinish: () => setDeletingUser(null),
        });
    };

    return (
        <>
            <Head title="Manajemen User" />
            <Layout title="Manajemen User" subtitle="Kelola akun dan hak akses pengguna">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Akun" value={stats.total} hint={`${stats.aktif ?? 0} akun aktif`} accent="neutral" />
                    <StatCard label="Administrator" value={stats.admin} hint="Akses penuh sistem" accent="purple" />
                    <StatCard label="Petugas" value={stats.petugas} hint="Operasional pos parkir" accent="green" />
                    <StatCard label="Owner" value={stats.owner} hint="Akses laporan" accent="yellow" />
                </div>

                <Card
                    title="Daftar User"
                    description={`${users.total} akun terdaftar`}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                onSubmit={() => router.get('/users', { search }, { preserveState: true })}
                                placeholder="Cari nama atau username"
                            />
                            <AddButton onClick={openCreate}>Tambah User</AddButton>
                        </div>
                    }
                >
                    <Table head={['Pengguna', 'Role', 'Status', 'Aksi']}>
                        {users.data.length === 0 && <EmptyRow colSpan={4}>Tidak ada user yang cocok.</EmptyRow>}
                        {users.data.map((user) => {
                            const role = roleMeta[user.role] ?? { label: user.role, tone: 'neutral' };

                            return (
                                <tr key={user.id_user} className="transition hover:bg-[#FAF8F3]">
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-warm text-xs font-bold text-[#6B665E]">
                                                {initials(user.nama_lengkap)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-ink">{user.nama_lengkap}</p>
                                                <p className="truncate text-xs text-muted">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <Badge tone={role.tone}>{role.label}</Badge>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B665E]">
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    user.status_aktif ? 'bg-pastel-green-text' : 'bg-red-500'
                                                }`}
                                            />
                                            {user.status_aktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <RowActions
                                            onEdit={() => openEdit(user)}
                                            onDelete={() => setDeletingUser(user)}
                                            editLabel={`Edit ${user.username}`}
                                            deleteLabel={`Hapus ${user.username}`}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </Table>
                    <Pagination paginator={users} />
                </Card>

                <Modal
                    open={formOpen}
                    onClose={closeForm}
                    title={editing ? 'Edit User' : 'Tambah User'}
                    description={editing ? `Perbarui data akun @${editing.username}` : 'Buat akun baru untuk mengakses sistem'}
                >
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Nama Lengkap" error={form.errors.nama_lengkap}>
                            <input
                                className={inputClass}
                                placeholder="Nama lengkap pengguna"
                                value={form.data.nama_lengkap}
                                onChange={(e) => form.setData('nama_lengkap', e.target.value)}
                            />
                        </Field>
                        <Field label="Username" error={form.errors.username}>
                            <input
                                className={inputClass}
                                placeholder="Username untuk login"
                                value={form.data.username}
                                onChange={(e) => form.setData('username', e.target.value)}
                            />
                        </Field>
                        <Field
                            label={editing ? 'Password Baru (opsional)' : 'Password'}
                            error={form.errors.password}
                            hint={editing ? 'Biarkan kosong bila tidak diubah.' : undefined}
                        >
                            <input
                                type="password"
                                className={inputClass}
                                placeholder={editing ? '••••••••' : 'Minimal 6 karakter'}
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                            />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Role" error={form.errors.role}>
                                <select
                                    className={inputClass}
                                    value={form.data.role}
                                    onChange={(e) => form.setData('role', e.target.value)}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="petugas">Petugas</option>
                                    <option value="owner">Owner</option>
                                </select>
                            </Field>
                            <Field label="Status Akun">
                                <label className="flex h-[38px] items-center gap-2 text-sm text-[#6B665E]">
                                    <input
                                        type="checkbox"
                                        checked={form.data.status_aktif}
                                        onChange={(e) => form.setData('status_aktif', e.target.checked)}
                                    />
                                    Akun aktif
                                </label>
                            </Field>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[#EFEAE0] pt-4">
                            <Button variant="secondary" onClick={closeForm}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Simpan Perubahan' : 'Tambah User'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <ConfirmModal
                    open={Boolean(deletingUser)}
                    onClose={() => setDeletingUser(null)}
                    onConfirm={executeDelete}
                    title="Hapus Akun Pengguna"
                    message={`Apakah Anda yakin ingin menghapus akun user "${deletingUser?.nama_lengkap || deletingUser?.username}"? Tindakan ini permanen dan tidak dapat dibatalkan.`}
                    confirmText="Hapus User"
                    cancelText="Batal"
                    variant="danger"
                />
            </Layout>
        </>
    );
}
