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
        Schema::table('tb_area_parkir', function (Blueprint $table) {
            $table->unsignedSmallInteger('kapasitas_mobil')->default(0)->after('kapasitas');
            $table->unsignedSmallInteger('kapasitas_motor')->default(0)->after('kapasitas_mobil');
        });

        // Area lama: seluruh slot dianggap satu jenis sesuai nama areanya.
        DB::table('tb_area_parkir')->update([
            'kapasitas_mobil' => DB::raw("CASE WHEN LOWER(nama_area) LIKE '%motor%' THEN 0 ELSE kapasitas END"),
            'kapasitas_motor' => DB::raw("CASE WHEN LOWER(nama_area) LIKE '%motor%' THEN kapasitas ELSE 0 END"),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_area_parkir', function (Blueprint $table) {
            $table->dropColumn(['kapasitas_mobil', 'kapasitas_motor']);
        });
    }
};
