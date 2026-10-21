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
        Schema::table('tb_transaksi', function (Blueprint $table) {
            $table->string('metode_pembayaran', 20)->default('tunai')->after('status');
            $table->string('midtrans_order_id', 100)->nullable()->after('metode_pembayaran');
            $table->string('snap_token', 255)->nullable()->after('midtrans_order_id');
            $table->string('status_transaksi_midtrans', 50)->nullable()->after('snap_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_transaksi', function (Blueprint $table) {
            $table->dropColumn([
                'metode_pembayaran',
                'midtrans_order_id',
                'snap_token',
                'status_transaksi_midtrans',
            ]);
        });
    }
};
