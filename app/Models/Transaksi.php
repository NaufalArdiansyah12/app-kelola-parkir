<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_kendaraan', 'waktu_masuk', 'waktu_keluar', 'id_tarif', 'durasi_jam', 'biaya_total', 'status', 'id_user', 'id_area', 'nomor_slot'])]
class Transaksi extends Model
{
    public $timestamps = false;

    protected $table = 'tb_transaksi';

    protected $primaryKey = 'id_parkir';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'waktu_masuk' => 'datetime',
            'waktu_keluar' => 'datetime',
            'durasi_jam' => 'integer',
            'biaya_total' => 'integer',
            'nomor_slot' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Kendaraan, $this>
     */
    public function kendaraan(): BelongsTo
    {
        return $this->belongsTo(Kendaraan::class, 'id_kendaraan', 'id_kendaraan');
    }

    /**
     * @return BelongsTo<Tarif, $this>
     */
    public function tarif(): BelongsTo
    {
        return $this->belongsTo(Tarif::class, 'id_tarif', 'id_tarif');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    /**
     * @return BelongsTo<AreaParkir, $this>
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(AreaParkir::class, 'id_area', 'id_area');
    }
}
