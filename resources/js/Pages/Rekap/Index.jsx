import LaporanKeuanganIndex from '../LaporanKeuangan/Index';

export default function RekapIndex(props) {
    return (
        <LaporanKeuanganIndex
            {...props}
            title="Rekap Transaksi"
            subtitle="Rekapitulasi pendapatan operasional dan audit transaksi kasir"
            headTitle="Rekap Transaksi"
            baseUrl="/rekap"
            signatureRole="Owner / Pemilik Usaha"
        />
    );
}
