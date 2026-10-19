import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import { Badge, Button, Card, EmptyRow, Field, Table, inputClass } from '../../Components/ui';

export default function LogIndex({ logs, users, filters }) {
    const [state, setState] = useState({
        search: filters.search ?? '',
        id_user: filters.id_user ?? '',
        dari: filters.dari ?? '',
        sampai: filters.sampai ?? '',
    });

    const apply = (event) => {
        event.preventDefault();
        router.get('/log-aktivitas', state, { preserveState: true });
    };

    const reset = () => {
        const empty = { search: '', id_user: '', dari: '', sampai: '' };
        setState(empty);
        router.get('/log-aktivitas', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Log Aktivitas" />
            <Layout title="Log Aktivitas" subtitle="Audit trail transaksi, otentikasi, dan mutasi data">
                <Card title="Filter">
                    <form onSubmit={apply} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <Field label="Aktivitas">
                            <input
                                className={inputClass}
                                placeholder="Cari aktivitas"
                                value={state.search}
                                onChange={(e) => setState({ ...state, search: e.target.value })}
                            />
                        </Field>
                        <Field label="User">
                            <select
                                className={inputClass}
                                value={state.id_user}
                                onChange={(e) => setState({ ...state, id_user: e.target.value })}
                            >
                                <option value="">Semua user</option>
                                {users.map((user) => (
                                    <option key={user.id_user} value={user.id_user}>
                                        {user.nama_lengkap}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Dari Tanggal">
                            <input
                                type="date"
                                className={inputClass}
                                value={state.dari}
                                onChange={(e) => setState({ ...state, dari: e.target.value })}
                            />
                        </Field>
                        <Field label="Sampai Tanggal">
                            <input
                                type="date"
                                className={inputClass}
                                value={state.sampai}
                                onChange={(e) => setState({ ...state, sampai: e.target.value })}
                            />
                        </Field>
                        <div className="flex items-end gap-2">
                            <Button type="submit">Terapkan</Button>
                            <Button variant="secondary" onClick={reset}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card title="Riwayat Aktivitas">
                    <Table head={['Waktu', 'User', 'Role', 'Aktivitas']}>
                        {logs.data.length === 0 && <EmptyRow colSpan={4} />}
                        {logs.data.map((log) => (
                            <tr key={log.id_log}>
                                <td className="whitespace-nowrap px-3 py-2 text-muted">{log.waktu_aktivitas}</td>
                                <td className="px-3 py-2 font-medium text-ink">
                                    {log.user?.nama_lengkap ?? '-'}
                                </td>
                                <td className="px-3 py-2">
                                    <Badge>{log.user?.role ?? '-'}</Badge>
                                </td>
                                <td className="px-3 py-2 text-[#6B665E]">{log.aktivitas}</td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination paginator={logs} />
                </Card>
            </Layout>
        </>
    );
}
