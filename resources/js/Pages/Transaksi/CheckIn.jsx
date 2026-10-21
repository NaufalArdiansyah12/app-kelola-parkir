import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Layout from '../../Components/Layout';
import { AddButton, Badge, Button, Card, Field, Modal, StatCard, inputClass } from '../../Components/ui';

export default function CheckIn({ area, jenisOptions = ['motor', 'mobil', 'lainnya'] }) {
    const [modalOpen, setModalOpen] = useState(false);

    // Buka otomatis modal jika datang dengan parameter ?open=1
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('open') === '1') {
                const areaParam = params.get('area');
                if (areaParam) {
                    form.setData((prev) => ({ ...prev, id_area: areaParam }));
                }
                setModalOpen(true);
            }
        }
    }, []);

    const initMotor = (jenisOptions[0] ?? 'motor') === 'motor';
    const form = useForm({
        plat_nomor: '',
        jenis_kendaraan: jenisOptions[0] ?? 'motor',
        warna: '',
        pemilik: '',
        id_area:
            area.find(
                (item) => (initMotor ? (item.sisa_motor ?? item.sisa) : (item.sisa_mobil ?? item.sisa)) > 0,
            )?.id_area ?? '',
    });

    const isMotor = form.data.jenis_kendaraan === 'motor';
    const sisaJenis = (item, motor = isMotor) =>
        motor ? (item.sisa_motor ?? item.sisa) : (item.sisa_mobil ?? item.sisa);
    const kapJenis = (item, motor = isMotor) =>
        motor ? (item.kapasitas_motor ?? item.kapasitas) : (item.kapasitas_mobil ?? item.kapasitas);

    const gantiJenis = (jenisBaru) => {
        const motor = jenisBaru === 'motor';
        const current = area.find((item) => String(item.id_area) === String(form.data.id_area));
        const currentMasihBisa = current && sisaJenis(current, motor) > 0;
        const targetArea = currentMasihBisa
            ? form.data.id_area
            : (area.find((item) => sisaJenis(item, motor) > 0)?.id_area ?? '');

        form.setData((data) => ({
            ...data,
            jenis_kendaraan: jenisBaru,
            id_area: targetArea,
        }));
    };

    const openCreate = (targetAreaId = null) => {
        form.clearErrors();
        if (targetAreaId) {
            form.setData('id_area', targetAreaId);
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        form.post('/transaksi/masuk', {
            preserveScroll: true,
        });
    };

    const totalKapasitas = area.reduce((acc, item) => acc + (item.kapasitas || 0), 0);
    const totalTerisi = area.reduce((acc, item) => acc + (item.terisi || 0), 0);
    const totalSisa = area.reduce((acc, item) => acc + (item.sisa || 0), 0);

    return (
        <>
            <Head title="Check-In Parkir" />
            <Layout title="Check-In Parkir" subtitle="Pencatatan kendaraan masuk dan ketersediaan kuota slot">
                {/* Ringkasan Slot */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Total Sisa Slot"
                        value={totalSisa}
                        hint={`Dari total ${totalKapasitas} slot tersedia`}
                        accent="green"
                    />
                    <StatCard
                        label="Slot Terisi"
                        value={totalTerisi}
                        hint="Kendaraan sedang parkir"
                        accent="neutral"
                    />
                    <StatCard
                        label="Area Parkir"
                        value={area.length}
                        hint="Area / lantai operasional"
                        accent="yellow"
                    />
                </div>

                {/* Kartu Daftar Area & Tombol Aksi */}
                <Card
                    title="Ketersediaan Area & Kuota Slot"
                    description="Pantau kuota tiap lantai secara langsung atau buka modal untuk check-in"
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href="/transaksi"
                                className="rounded-full border border-[#E8EBF0] bg-white px-4 py-2 text-xs font-bold text-[#7A7E8D] hover:text-[#17182B] hover:bg-[#F8F9FC] shadow-2xs transition-colors"
                            >
                                Daftar Parkir Aktif
                            </Link>
                            <AddButton onClick={() => openCreate()}>
                                Buat Check-In
                            </AddButton>
                        </div>
                    }
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {area.map((item) => {
                            const isPenuh = item.sisa === 0;
                            const persenTerisi = item.kapasitas > 0 ? Math.round((item.terisi / item.kapasitas) * 100) : 0;

                            return (
                                <div
                                    key={item.id_area}
                                    className="flex flex-col justify-between rounded-[22px] border border-[#E8EBF0] bg-white p-5 transition hover:shadow-soft"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-extrabold text-sm text-[#17182B]">{item.nama_area}</h3>
                                                <p className="text-[11px] text-[#7A7E8D]">Kode: {item.kode || '-'}</p>
                                            </div>
                                            <Badge tone={isPenuh ? 'red' : 'green'}>
                                                {isPenuh ? 'Penuh' : `Sisa ${item.sisa}`}
                                            </Badge>
                                        </div>

                                        {/* Progress Bar Kuota */}
                                        <div className="mt-4 space-y-1">
                                            <div className="flex justify-between text-[11px] font-bold text-[#7A7E8D]">
                                                <span>Terisi {item.terisi}/{item.kapasitas}</span>
                                                <span>{persenTerisi}%</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F8]">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isPenuh ? 'bg-red-500' : persenTerisi > 80 ? 'bg-[#F8C838]' : 'bg-[#17182B]'
                                                    }`}
                                                    style={{ width: `${Math.min(100, persenTerisi)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Rincian Jenis Kendaraan */}
                                        <div className="mt-3 flex gap-2 text-[11px] text-[#7A7E8D]">
                                            <span className="rounded-xl bg-[#F8F9FC] border border-[#E8EBF0] px-2.5 py-1">
                                                Mobil: <strong className="text-[#17182B]">{item.sisa_mobil ?? 0}</strong>/{item.kapasitas_mobil ?? item.kapasitas}
                                            </span>
                                            <span className="rounded-xl bg-[#F8F9FC] border border-[#E8EBF0] px-2.5 py-1">
                                                Motor: <strong className="text-[#17182B]">{item.sisa_motor ?? 0}</strong>/{item.kapasitas_motor ?? 0}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant={isPenuh ? 'secondary' : 'primary'}
                                        className="mt-4 w-full justify-center"
                                        disabled={isPenuh}
                                        onClick={() => openCreate(item.id_area)}
                                    >
                                        {isPenuh ? 'Area Penuh' : '+ Check-In di Area Ini'}
                                    </Button>
                                </div>
                            );
                        })}

                        {area.length === 0 && (
                            <div className="col-span-full py-8 text-center text-sm text-muted">
                                Belum ada area parkir yang dikonfigurasi.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Modal Form Check-In */}
                <Modal
                    open={modalOpen}
                    onClose={closeModal}
                    title="Check-In Kendaraan Masuk"
                    description="Catat kendaraan masuk ke sistem dan cetak karcis parkir"
                >
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Plat Nomor" error={form.errors.plat_nomor}>
                            <input
                                autoFocus
                                className={`${inputClass} font-mono uppercase text-base`}
                                placeholder="B 1234 ABC"
                                value={form.data.plat_nomor}
                                onChange={(e) => form.setData('plat_nomor', e.target.value.toUpperCase())}
                            />
                        </Field>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Jenis Kendaraan" error={form.errors.jenis_kendaraan}>
                                <select
                                    className={`${inputClass} capitalize`}
                                    value={form.data.jenis_kendaraan}
                                    onChange={(e) => gantiJenis(e.target.value)}
                                >
                                    {jenisOptions.map((jenis) => (
                                        <option key={jenis} value={jenis}>
                                            {jenis}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Area Parkir" error={form.errors.id_area}>
                                <select
                                    className={inputClass}
                                    value={form.data.id_area}
                                    onChange={(e) => form.setData('id_area', e.target.value)}
                                >
                                    <option value="">Pilih area</option>
                                    {area.map((item) => {
                                        const sisa = sisaJenis(item);
                                        const total = kapJenis(item);
                                        const habis = total === 0 || sisa === 0;

                                        return (
                                            <option key={item.id_area} value={item.id_area} disabled={habis}>
                                                {item.nama_area} (sisa {sisa}/{total} {isMotor ? 'motor' : 'mobil'})
                                            </option>
                                        );
                                    })}
                                </select>
                            </Field>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Warna Kendaraan (Opsional)" error={form.errors.warna}>
                                <input
                                    className={inputClass}
                                    placeholder="Contoh: Hitam"
                                    value={form.data.warna}
                                    onChange={(e) => form.setData('warna', e.target.value)}
                                />
                            </Field>

                            <Field label="Nama Pemilik / Supir (Opsional)" error={form.errors.pemilik}>
                                <input
                                    className={inputClass}
                                    placeholder="Nama pemilik"
                                    value={form.data.pemilik}
                                    onChange={(e) => form.setData('pemilik', e.target.value)}
                                />
                            </Field>
                        </div>

                        <p className="text-[11px] text-muted">
                            Nomor slot kosong akan dialokasikan otomatis oleh sistem setelah karcis dicetak.
                        </p>

                        <div className="flex justify-end gap-2 border-t border-[#EFEAE0] pt-4">
                            <Button variant="secondary" onClick={closeModal}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Memproses...' : 'Simpan & Cetak Karcis'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </Layout>
        </>
    );
}
