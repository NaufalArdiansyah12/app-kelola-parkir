import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Pagination from '../../Components/Pagination';
import { AddButton, Badge, Button, Card, EmptyRow, Field, Modal, RowActions, StatCard, Table, inputClass } from '../../Components/ui';

export default function AreaIndex({ area, stats = {} }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [slotArea, setSlotArea] = useState(null);
    const [denahArea, setDenahArea] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const form = useForm({ nama_area: '', kapasitas_mobil: '', kapasitas_motor: '', kolom: 6, denah: null });

    const totalSlot = (data) => (Number(data.kapasitas_mobil) || 0) + (Number(data.kapasitas_motor) || 0);

    const openCreate = () => {
        setEditing(null);
        form.setData({ nama_area: '', kapasitas_mobil: '', kapasitas_motor: '', kolom: 6, denah: null });
        form.clearErrors();
        setFormOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        form.setData({
            nama_area: item.nama_area,
            kapasitas_mobil: item.kapasitas_mobil ?? item.kapasitas,
            kapasitas_motor: item.kapasitas_motor ?? 0,
            kolom: item.kolom ?? 6,
            denah: {
                baris: item.baris,
                kolom: item.kolom ?? 6,
                slot: item.slots.map((slot) => ({ n: slot.nomor, b: slot.b, k: slot.k, rot: slot.rot ?? 0 })),
            },
        });
        form.clearErrors();
        setFormOpen(true);
    };

    const ubahKapasitas = (jenis, nilai) => {
        const kunci = jenis === 'motor' ? 'kapasitas_motor' : 'kapasitas_mobil';

        form.setData((data) => {
            const baru = { ...data, [kunci]: nilai };

            return {
                ...baru,
                denah: sesuaikanDenah(baru.denah, totalSlot(baru), Number(data.kolom) || 6),
            };
        });
    };

    const ubahKolom = (nilai) => {
        const kolom = Math.min(20, Math.max(1, Number(nilai) || 1));

        form.setData((data) => ({
            ...data,
            kolom,
            denah: sesuaikanDenah(data.denah, totalSlot(data), kolom),
        }));
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
            form.put(`/area/${editing.id_area}`, options);
        } else {
            form.post('/area', options);
        }
    };

    const destroy = (item) => {
        if (confirm(`Hapus area ${item.nama_area}?`)) {
            router.delete(`/area/${item.id_area}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Area Parkir" />
            <Layout title="Area Parkir" subtitle="Zona parkir, kapasitas, dan okupansi">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Area" value={stats.total} hint="Zona parkir terdaftar" accent="neutral" />
                    <StatCard label="Kapasitas" value={stats.kapasitas} hint="Slot parkir tersedia" accent="purple" />
                    <StatCard label="Terisi" value={stats.terisi} hint="Kendaraan sedang parkir" accent="yellow" />
                    <StatCard
                        label="Sisa Slot"
                        value={Math.max(0, (stats.kapasitas ?? 0) - (stats.terisi ?? 0))}
                        hint="Slot kosong saat ini"
                        accent="green"
                    />
                </div>

                <Card
                    title="Daftar Area"
                    description={`${area.total} zona parkir terdaftar`}
                    actions={<AddButton onClick={openCreate}>Tambah Area</AddButton>}
                >
                    <Table head={['Area', 'Kapasitas', 'Terisi', 'Sisa', 'Status', 'Aksi']}>
                        {area.data.length === 0 && <EmptyRow colSpan={6} />}
                        {area.data.map((item) => {
                            const penuh = item.terisi >= item.kapasitas;
                            const persen = item.kapasitas > 0 ? Math.min(100, (item.terisi / item.kapasitas) * 100) : 0;

                            return (
                                <tr key={item.id_area} className="transition hover:bg-[#FAF8F3]">
                                    <td className="px-3 py-3">
                                        <p className="font-semibold text-ink">{item.nama_area}</p>
                                        <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-chart-track">
                                            <div
                                                className={`h-full rounded-full ${penuh ? 'bg-red-500' : 'bg-ink'}`}
                                                style={{ width: `${persen}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-[#6B665E] tabular-nums">
                                        {item.kapasitas}
                                        <span className="ml-1 text-[11px] text-muted">
                                            ({item.kapasitas_mobil ?? item.kapasitas} mobil · {item.kapasitas_motor ?? 0}{' '}
                                            motor)
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-[#6B665E] tabular-nums">{item.terisi}</td>
                                    <td className="px-3 py-3 font-medium text-ink tabular-nums">{item.sisa}</td>
                                    <td className="px-3 py-3">
                                        <Badge tone={penuh ? 'red' : 'green'}>{penuh ? 'Penuh' : 'Tersedia'}</Badge>
                                    </td>
                                    <td className="px-3 py-3">
                                        <RowActions
                                            onView={() => {
                                                setSelectedSlot(null);
                                                setSlotArea(item);
                                            }}
                                            onEdit={() => openEdit(item)}
                                            onDelete={() => destroy(item)}
                                            viewLabel={`Lihat slot area ${item.nama_area}`}
                                            editLabel={`Edit area ${item.nama_area}`}
                                            deleteLabel={`Hapus area ${item.nama_area}`}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </Table>
                    <Pagination paginator={area} />
                </Card>

                <Modal
                    open={formOpen}
                    onClose={closeForm}
                    size="lg"
                    title={editing ? 'Edit Area' : 'Tambah Area'}
                    description={editing ? `Perbarui data ${editing.nama_area}` : 'Buat zona parkir baru beserta kapasitasnya'}
                >
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Nama Area" error={form.errors.nama_area}>
                            <input
                                className={inputClass}
                                placeholder="Contoh: Area A"
                                value={form.data.nama_area}
                                onChange={(e) => form.setData('nama_area', e.target.value)}
                            />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Field label="Slot Mobil" error={form.errors.kapasitas_mobil}>
                                <input
                                    type="number"
                                    min="0"
                                    className={inputClass}
                                    placeholder="10"
                                    value={form.data.kapasitas_mobil}
                                    onChange={(e) => ubahKapasitas('mobil', e.target.value)}
                                />
                            </Field>
                            <Field label="Slot Motor" error={form.errors.kapasitas_motor}>
                                <input
                                    type="number"
                                    min="0"
                                    className={inputClass}
                                    placeholder="10"
                                    value={form.data.kapasitas_motor}
                                    onChange={(e) => ubahKapasitas('motor', e.target.value)}
                                />
                            </Field>
                            <Field label="Slot per Baris" error={form.errors.kolom} hint="Jumlah sel per baris.">
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    className={inputClass}
                                    placeholder="6"
                                    value={form.data.kolom}
                                    onChange={(e) => ubahKolom(e.target.value)}
                                />
                            </Field>
                        </div>

                        <p className="text-[11px] font-medium text-muted">
                            Total {totalSlot(form.data)} slot · {Number(form.data.kapasitas_mobil) || 0} mobil ·{' '}
                            {Number(form.data.kapasitas_motor) || 0} motor
                        </p>

                        <div className="space-y-2">
                            <p className="text-[11px] font-semibold tracking-wide text-[#6B665E]">Denah Area</p>
                            <DenahEditor
                                kode={form.data.nama_area.trim().charAt(0).toUpperCase() || 'A'}
                                kapasitasMobil={Number(form.data.kapasitas_mobil) || 0}
                                value={form.data.denah}
                                onChange={(denah) => form.setData('denah', denah)}
                                emptyHint="Isi slot mobil/motor untuk mulai mengatur denah."
                            />
                            {form.errors.denah && (
                                <p className="text-[11px] font-medium text-red-600">{form.errors.denah}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[#EFEAE0] pt-4">
                            <Button variant="secondary" onClick={closeForm}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Simpan Perubahan' : 'Tambah Area'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    open={Boolean(slotArea)}
                    onClose={() => {
                        setSlotArea(null);
                        setSelectedSlot(null);
                    }}
                    size="lg"
                    title={slotArea ? `Denah ${slotArea.nama_area}` : 'Denah'}
                    description={
                        slotArea
                            ? `${slotArea.slots.filter((slot) => slot.id_parkir).length} dari ${slotArea.kapasitas} slot terisi`
                            : undefined
                    }
                >
                    {slotArea && (
                        <>
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                                <div className="flex-1">
                                    <OccupancyBar
                                        terisi={slotArea.slots.filter((slot) => slot.id_parkir).length}
                                        kapasitas={slotArea.kapasitas}
                                        mobilTerisi={slotArea.slots.filter((slot) => slot.id_parkir && (slot.jenis_kendaraan ?? slot.jenis) === 'mobil').length}
                                        mobilKapasitas={slotArea.kapasitas_mobil ?? slotArea.kapasitas}
                                        motorTerisi={slotArea.slots.filter((slot) => slot.id_parkir && (slot.jenis_kendaraan ?? slot.jenis) === 'motor').length}
                                        motorKapasitas={slotArea.kapasitas_motor ?? 0}
                                    />
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setDenahArea(slotArea);
                                        setSlotArea(null);
                                        setSelectedSlot(null);
                                    }}
                                >
                                    Atur Denah
                                </Button>
                            </div>

                            <div
                                className="grid gap-1.5 rounded-2xl bg-[#F7F4EE] p-2.5"
                                style={{
                                    gridTemplateColumns: `repeat(${slotArea.kolom ?? 6}, minmax(0, 1fr))`,
                                    gridTemplateRows: `repeat(${slotArea.baris}, auto)`,
                                }}
                            >
                                {Array.from({ length: slotArea.baris * (slotArea.kolom ?? 6) }, (_, index) => {
                                    const b = Math.floor(index / (slotArea.kolom ?? 6));
                                    const k = index % (slotArea.kolom ?? 6);
                                    const slot = slotArea.slots.find((item) => item.b === b && item.k === k);

                                    if (!slot) {
                                        return <div key={index} aria-hidden="true" />;
                                    }

                                    const terisi = Boolean(slot.id_parkir);
                                    const dipilih = selectedSlot?.nomor === slot.nomor;

                                    return (
                                        <button
                                            type="button"
                                            key={slot.nomor}
                                            onClick={() => setSelectedSlot(dipilih ? null : slot)}
                                            aria-pressed={dipilih}
                                            aria-label={
                                                terisi
                                                    ? `${slot.label} terisi, ${slot.plat_nomor}`
                                                    : `${slot.label} kosong`
                                            }
                                            title={terisi ? `${slot.label} • ${slot.plat_nomor}` : `${slot.label} kosong`}
                                            className={`group relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-xl border bg-white transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] ${
                                                dipilih
                                                    ? 'border-[#E9C46A] bg-[#FDF8E7] shadow-[0_0_0_3px_rgba(233,196,106,0.25)]'
                                                    : terisi
                                                      ? 'border-[#E4DED1] shadow-[0_1px_2px_rgba(23,23,23,0.04)] hover:-translate-y-0.5 hover:border-[#CFC7B6] hover:shadow-[0_6px_14px_rgba(23,23,23,0.10)]'
                                                      : 'border-[#EAE5DA] hover:-translate-y-0.5 hover:border-[#D7D0C0] hover:shadow-[0_6px_14px_rgba(23,23,23,0.06)]'
                                            }`}
                                        >
                                            {terisi ? (
                                                <>
                                                    <span
                                                        className="flex h-[74%] items-center justify-center"
                                                        style={{ transform: `rotate(${slot.rot ?? 0}deg)` }}
                                                    >
                                                        <VehicleTop
                                                            jenis={slot.jenis_kendaraan ?? slot.jenis}
                                                            className="h-full w-auto drop-shadow-[0_8px_10px_rgba(23,23,23,0.16)]"
                                                        />
                                                    </span>
                                                    <span className="absolute inset-x-0 bottom-1 truncate px-1 font-mono text-[9px] font-semibold tracking-tight text-[#8A8377] opacity-0 transition group-hover:opacity-100">
                                                        {slot.plat_nomor}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="flex flex-col items-center gap-1">
                                                    <VehicleTop
                                                        jenis={slot.jenis}
                                                        className="h-[38%] w-auto opacity-15"
                                                    />
                                                    <span
                                                        className={`text-[11px] font-semibold tracking-wide ${
                                                            dipilih ? 'text-[#876510]' : 'text-[#A9A297]'
                                                        }`}
                                                    >
                                                        {slot.label}
                                                    </span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEAE0] pt-3">
                                <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-3.5 w-3.5 rounded-[4px] border border-[#EAE5DA] bg-white" />
                                        Kosong
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CarTopView className="h-4 w-auto" />
                                        Mobil
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MotorTopView className="h-4 w-auto" />
                                        Motor
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-3.5 w-3.5 rounded-[4px] border border-[#E9C46A] bg-[#FDF8E7]" />
                                        Dipilih
                                    </span>
                                </div>

                                <div className="min-h-5 text-[11px] font-medium">
                                    {selectedSlot ? (
                                        selectedSlot.id_parkir ? (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-panel-warm px-3 py-1 text-[#6B665E]">
                                                <span className="font-bold text-ink">{selectedSlot.label}</span>
                                                <span className="font-mono">{selectedSlot.plat_nomor}</span>
                                                <span className="capitalize text-muted">
                                                    {selectedSlot.jenis_kendaraan ?? selectedSlot.jenis}
                                                </span>
                                                <span className="text-muted">masuk {selectedSlot.waktu_masuk}</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-pastel-green px-3 py-1 text-pastel-green-text">
                                                <span className="font-bold">{selectedSlot.label}</span>
                                                <span>slot kosong ({selectedSlot.jenis})</span>
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-muted">Klik slot untuk melihat detail.</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Modal>

                <Modal
                    open={Boolean(denahArea)}
                    onClose={() => setDenahArea(null)}
                    size="lg"
                    title={denahArea ? `Atur Denah ${denahArea.nama_area}` : 'Atur Denah'}
                    description="Geser slot ke posisi lain, klik slot untuk memutar 90°. Sel kosong menjadi lorong."
                >
                    {denahArea && <AturDenah area={denahArea} onClose={() => setDenahArea(null)} />}
                </Modal>
            </Layout>
        </>
    );
}

function AturDenah({ area, onClose }) {
    const [draft, setDraft] = useState({
        baris: area.baris,
        kolom: area.kolom ?? 6,
        slot: area.slots.map((slot) => ({ n: slot.nomor, b: slot.b, k: slot.k, rot: slot.rot ?? 0 })),
    });
    const [processing, setProcessing] = useState(false);
    const [pesan, setPesan] = useState('');

    const simpan = () => {
        setProcessing(true);
        router.put(`/area/${area.id_area}/denah`, draft, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: (errors) => setPesan(errors.denah ?? 'Gagal menyimpan denah.'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <DenahEditor
                kode={area.kode}
                kapasitasMobil={area.kapasitas_mobil ?? area.kapasitas}
                value={draft}
                onChange={setDraft}
            />

            {pesan && <p className="mt-2 text-[11px] font-medium text-red-600">{pesan}</p>}

            <div className="mt-4 flex justify-end gap-2 border-t border-[#EFEAE0] pt-4">
                <Button variant="secondary" onClick={onClose}>
                    Batal
                </Button>
                <Button onClick={simpan} disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan Denah'}
                </Button>
            </div>
        </>
    );
}

function DenahEditor({ kode = 'A', kapasitasMobil = 0, value, onChange, emptyHint = 'Belum ada slot.' }) {
    const [dragging, setDragging] = useState(null);
    const [pesan, setPesan] = useState('');

    if (!value || value.slot.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[#E1DACB] bg-[#FBFAF6] px-4 py-6 text-center text-[11px] font-medium text-muted">
                {emptyHint}
            </div>
        );
    }

    const { baris, kolom, slot } = value;
    const jenisSlot = (nomor) => (nomor <= kapasitasMobil ? 'mobil' : 'motor');

    const ubah = (slotBaru, barisBaru = baris) => onChange({ baris: barisBaru, kolom, slot: slotBaru });

    const geser = (nomor, b, k) => {
        const slotBaru = slot.map((item) => ({ ...item }));
        const asal = slotBaru.find((item) => item.n === nomor);
        const tujuan = slotBaru.find((item) => item.b === b && item.k === k);

        if (!asal) {
            return;
        }

        if (tujuan && tujuan.n !== asal.n) {
            tujuan.b = asal.b;
            tujuan.k = asal.k;
        }

        asal.b = b;
        asal.k = k;
        ubah(slotBaru);
    };

    const putar = (nomor) => {
        ubah(slot.map((item) => (item.n === nomor ? { ...item, rot: (item.rot + 90) % 360 } : item)));
    };

    const hapusBaris = () => {
        if (baris <= 1) {
            setPesan('Minimal satu baris.');

            return;
        }

        if (slot.some((item) => item.b === baris - 1)) {
            setPesan('Pindahkan dulu slot di baris terakhir.');

            return;
        }

        setPesan('');
        ubah(slot, baris - 1);
    };

    return (
        <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => ubah(slot, baris + 1)}>
                        + Baris
                    </Button>
                    <Button variant="secondary" onClick={hapusBaris}>
                        − Baris
                    </Button>
                    <span className="text-[11px] font-medium text-muted tabular-nums">
                        {baris} baris × {kolom} kolom
                    </span>
                </div>
                <span className="text-[11px] font-medium text-muted">Klik = putar · Geser = pindah</span>
            </div>

            <div
                className="grid gap-1.5 rounded-2xl bg-[#F7F4EE] p-2.5"
                style={{
                    gridTemplateColumns: `repeat(${kolom}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${baris}, auto)`,
                }}
            >
                {Array.from({ length: baris * kolom }, (_, index) => {
                    const b = Math.floor(index / kolom);
                    const k = index % kolom;
                    const item = slot.find((s) => s.b === b && s.k === k);

                    return (
                        <div
                            key={index}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                                event.preventDefault();
                                const nomor = Number(event.dataTransfer.getData('text/plain'));

                                if (nomor) {
                                    geser(nomor, b, k);
                                }

                                setDragging(null);
                            }}
                            className={`flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed transition ${
                                dragging ? 'border-[#C9C2B4] bg-white/60' : 'border-[#E4DED1]/70'
                            }`}
                        >
                            {item && (
                                <button
                                    type="button"
                                    draggable
                                    onDragStart={(event) => {
                                        event.dataTransfer.setData('text/plain', String(item.n));
                                        setDragging(item.n);
                                    }}
                                    onDragEnd={() => setDragging(null)}
                                    onClick={() => putar(item.n)}
                                    aria-label={`Slot ${kode}${item.n}, rotasi ${item.rot}°, klik untuk memutar`}
                                    title={`${kode}${item.n} • klik untuk memutar`}
                                    className={`relative flex h-full w-full cursor-grab flex-col items-center justify-center rounded-xl border bg-white transition active:cursor-grabbing ${
                                        dragging === item.n
                                            ? 'border-[#E9C46A] opacity-50'
                                            : 'border-[#EAE5DA] hover:border-[#CFC7B6] hover:shadow-[0_4px_10px_rgba(23,23,23,0.08)]'
                                    }`}
                                >
                                    <span className="absolute top-1 left-1.5 text-[9px] font-semibold text-[#8A8377]">
                                        {kode}{item.n}
                                    </span>
                                    <span
                                        className="flex h-[68%] items-center justify-center"
                                        style={{ transform: `rotate(${item.rot}deg)` }}
                                    >
                                        <VehicleTop jenis={jenisSlot(item.n)} className="h-full w-auto" />
                                    </span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {pesan && <p className="mt-2 text-[11px] font-medium text-red-600">{pesan}</p>}
        </>
    );
}

/**
 * Susun ulang denah saat kapasitas/kolom berubah: slot lama dipertahankan,
 * slot baru mengisi sel kosong terdekat.
 */
function sesuaikanDenah(denah, kapasitas, kolom) {
    if (kapasitas < 1) {
        return null;
    }

    const terpakai = new Set();
    const slot = [];

    for (const item of denah?.slot ?? []) {
        const key = `${item.b}-${item.k}`;

        if (item.n > kapasitas || item.k >= kolom || terpakai.has(key)) {
            continue;
        }

        terpakai.add(key);
        slot.push({ ...item });
    }

    const ada = new Set(slot.map((item) => item.n));

    for (let n = 1; n <= kapasitas; n += 1) {
        if (ada.has(n)) {
            continue;
        }

        let b = 0;
        let k = 0;

        while (terpakai.has(`${b}-${k}`)) {
            k += 1;

            if (k >= kolom) {
                k = 0;
                b += 1;
            }
        }

        terpakai.add(`${b}-${k}`);
        slot.push({ n, b, k, rot: 0 });
    }

    slot.sort((a, b) => a.n - b.n);

    return {
        baris: Math.max(Math.ceil(kapasitas / kolom), ...slot.map((item) => item.b + 1)),
        kolom,
        slot,
    };
}

function OccupancyBar({ terisi, kapasitas, mobilTerisi = 0, mobilKapasitas = 0, motorTerisi = 0, motorKapasitas = 0 }) {
    const persen = kapasitas > 0 ? Math.round((terisi / kapasitas) * 100) : 0;
    const penuh = terisi >= kapasitas;

    return (
        <div className="mb-4">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[11px] font-medium text-muted">
                <span>
                    Okupansi · <span className="text-[#6B665E]">Mobil {mobilTerisi}/{mobilKapasitas}</span> ·{' '}
                    <span className="text-[#6B665E]">Motor {motorTerisi}/{motorKapasitas}</span>
                </span>
                <span className="tabular-nums">
                    <span className="text-sm font-bold text-ink">{persen}%</span> terisi ({terisi}/{kapasitas})
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-chart-track">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${penuh ? 'bg-red-500' : 'bg-ink'}`}
                    style={{ width: `${Math.max(persen, 2)}%` }}
                />
            </div>
        </div>
    );
}

function VehicleTop({ jenis, className = '' }) {
    return jenis === 'motor' ? <MotorTopView className={className} /> : <CarTopView className={className} />;
}

function MotorTopView({ className = '' }) {
    return (
        <svg viewBox="0 0 64 108" className={className} aria-hidden="true">
            <ellipse cx="32" cy="100" rx="14" ry="4" fill="#171717" opacity="0.12" />
            <rect x="26" y="4" width="12" height="26" rx="6" fill="#2E343A" />
            <rect x="29" y="8" width="6" height="18" rx="3" fill="#505A63" />
            <rect x="26" y="72" width="12" height="28" rx="6" fill="#2E343A" />
            <rect x="29" y="76" width="6" height="20" rx="3" fill="#505A63" />
            <rect x="39" y="60" width="5" height="26" rx="2.5" fill="#9BA3A9" />
            <rect x="40" y="82" width="3" height="4" rx="1" fill="#4B545D" />
            <rect x="10" y="26" width="44" height="4" rx="2" fill="#69737C" />
            <rect x="8" y="25" width="8" height="6" rx="2" fill="#2E343A" />
            <rect x="48" y="25" width="8" height="6" rx="2" fill="#2E343A" />
            <circle cx="8" cy="20" r="3" fill="#D3D9DC" stroke="#4B545D" strokeWidth="1.5" />
            <circle cx="56" cy="20" r="3" fill="#D3D9DC" stroke="#4B545D" strokeWidth="1.5" />
            <path d="M26 14 C26 10, 38 10, 38 14 L36 26 L28 26 Z" fill="#4B545D" />
            <rect x="29" y="11" width="6" height="3" rx="1.5" fill="#FFFFFF" />
            <path d="M22 30 C20 38, 20 48, 24 54 L40 54 C44 48, 44 38, 42 30 Z" fill="#BACFBE" />
            <rect x="27" y="32" width="10" height="16" rx="4" fill="#3D5A45" opacity="0.8" />
            <circle cx="32" cy="38" r="2.5" fill="#EAE5DA" />
            <path d="M24 52 L40 52 C42 62, 41 74, 38 80 L26 80 C23 74, 22 62, 24 52 Z" fill="#2E343A" />
            <line x1="24" y1="65" x2="40" y2="65" stroke="#4A525A" strokeWidth="1.5" />
            <rect x="28" y="82" width="8" height="3" rx="1.5" fill="#E63946" />
        </svg>
    );
}

function CarTopView({ className = '' }) {
    return (
        <svg viewBox="0 0 64 108" className={className} aria-hidden="true">
            <ellipse cx="32" cy="100" rx="20" ry="4" fill="#171717" opacity="0.10" />
            <rect x="10" y="4" width="44" height="100" rx="18" fill="#AEB5BC" />
            <rect x="12" y="6" width="40" height="96" rx="16" fill="#F4F6F7" />
            <path d="M12 22h40v-2a16 16 0 0 0-16-14h-8a16 16 0 0 0-16 14v2Z" fill="#E6EAEC" />
            <rect x="17" y="18" width="30" height="17" rx="6" fill="#4B545D" opacity="0.9" />
            <rect x="20" y="21" width="24" height="11" rx="4" fill="#5E6973" opacity="0.55" />
            <rect x="17" y="38" width="30" height="34" rx="6" fill="#E1E6E8" />
            <rect x="20" y="41" width="24" height="28" rx="4" fill="#EDF1F2" />
            <path d="M20 58h24" stroke="#CBD3D6" strokeWidth="1.5" />
            <rect x="17" y="75" width="30" height="14" rx="6" fill="#4B545D" opacity="0.75" />
            <rect x="20" y="78" width="24" height="8" rx="4" fill="#69737C" opacity="0.4" />
            <rect x="5" y="30" width="5" height="12" rx="2.5" fill="#AEB5BC" />
            <rect x="54" y="30" width="5" height="12" rx="2.5" fill="#AEB5BC" />
            <rect x="18" y="7" width="9" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="37" y="7" width="9" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="18" y="98" width="9" height="3" rx="1.5" fill="#D9534F" opacity="0.7" />
            <rect x="37" y="98" width="9" height="3" rx="1.5" fill="#D9534F" opacity="0.7" />
        </svg>
    );
}
