<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tb_tarif', function (Blueprint $table) {
            $table->string('jenis_kendaraan', 50)->change();
        });

        Schema::table('tb_kendaraan', function (Blueprint $table) {
            $table->string('jenis_kendaraan', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_kendaraan', function (Blueprint $table) {
            $table->string('jenis_kendaraan', 20)->change();
        });

        Schema::table('tb_tarif', function (Blueprint $table) {
            $table->string('jenis_kendaraan', 20)->change();
        });
    }
};
