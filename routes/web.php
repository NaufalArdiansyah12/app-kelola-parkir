<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KendaraanController;
use App\Http\Controllers\LaporanKeuanganController;
use App\Http\Controllers\RekapController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:10,1');
});

Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/transaksi/{transaksi}/struk-masuk', [TransaksiController::class, 'strukMasuk'])->name('transaksi.struk-masuk');
    Route::get('/transaksi/{transaksi}/struk-keluar', [TransaksiController::class, 'strukKeluar'])->name('transaksi.struk-keluar');

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::get('/tarif', [TarifController::class, 'index'])->name('tarif.index');
        Route::post('/tarif', [TarifController::class, 'store'])->name('tarif.store');
        Route::put('/tarif/{tarif}', [TarifController::class, 'update'])->name('tarif.update');
        Route::delete('/tarif/{tarif}', [TarifController::class, 'destroy'])->name('tarif.destroy');

        Route::get('/area', [AreaController::class, 'index'])->name('area.index');
        Route::post('/area', [AreaController::class, 'store'])->name('area.store');
        Route::put('/area/{area}', [AreaController::class, 'update'])->name('area.update');
        Route::delete('/area/{area}', [AreaController::class, 'destroy'])->name('area.destroy');
        Route::put('/area/{area}/denah', [AreaController::class, 'simpanDenah'])->name('area.denah');

        Route::get('/kendaraan', [KendaraanController::class, 'index'])->name('kendaraan.index');
        Route::post('/kendaraan', [KendaraanController::class, 'store'])->name('kendaraan.store');
        Route::put('/kendaraan/{kendaraan}', [KendaraanController::class, 'update'])->name('kendaraan.update');
        Route::delete('/kendaraan/{kendaraan}', [KendaraanController::class, 'destroy'])->name('kendaraan.destroy');

        Route::get('/laporan-keuangan', [LaporanKeuanganController::class, 'index'])->name('laporan.keuangan');
        Route::get('/laporan-keuangan/export-excel', [LaporanKeuanganController::class, 'exportExcel'])->name('laporan.keuangan.excel');
        Route::get('/laporan-keuangan/export-pdf', [LaporanKeuanganController::class, 'exportPdf'])->name('laporan.keuangan.pdf');
        Route::redirect('/log-aktivitas', '/laporan-keuangan');
    });

    Route::middleware('role:petugas')->group(function () {
        Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi.index');
        Route::get('/transaksi/masuk', [TransaksiController::class, 'create'])->name('transaksi.create');
        Route::post('/transaksi/masuk', [TransaksiController::class, 'store'])->name('transaksi.store');
        Route::get('/transaksi/keluar', [TransaksiController::class, 'checkoutIndex'])->name('transaksi.keluar');
        Route::get('/transaksi/{transaksi}/checkout', [TransaksiController::class, 'checkout'])->name('transaksi.checkout');
        Route::post('/transaksi/{transaksi}/bayar', [TransaksiController::class, 'bayar'])->name('transaksi.bayar');
    });

    Route::middleware('role:owner')->group(function () {
        Route::get('/rekap', [RekapController::class, 'index'])->name('rekap.index');
        Route::get('/rekap/export-excel', [RekapController::class, 'exportExcel'])->name('rekap.excel');
        Route::get('/rekap/export-pdf', [RekapController::class, 'exportPdf'])->name('rekap.pdf');
    });
});
