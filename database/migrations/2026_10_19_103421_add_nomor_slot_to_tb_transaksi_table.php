<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tb_transaksi', function (Blueprint $table) {
            $table->unsignedSmallInteger('nomor_slot')->nullable()->after('id_area');
            $table->index(['id_area', 'status', 'nomor_slot']);
        });

        // Isi slot transaksi aktif lama supaya grid area tidak bentrok.
        DB::table('tb_area_parkir')->pluck('id_area')->each(function (int $idArea) {
            DB::table('tb_transaksi')
                ->where('id_area', $idArea)
                ->where('status', 'masuk')
                ->orderBy('waktu_masuk')
                ->pluck('id_parkir')
                ->each(fn (int $idParkir, int $index) => DB::table('tb_transaksi')
                    ->where('id_parkir', $idParkir)
                    ->update(['nomor_slot' => $index + 1]));
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_transaksi', function (Blueprint $table) {
            $table->dropIndex(['id_area', 'status', 'nomor_slot']);
            $table->dropColumn('nomor_slot');
        });
    }
};
