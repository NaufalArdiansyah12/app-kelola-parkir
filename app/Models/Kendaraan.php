<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['plat_nomor', 'jenis_kendaraan', 'warna', 'pemilik', 'id_user'])]
class Kendaraan extends Model
{
    public $timestamps = false;

    protected $table = 'tb_kendaraan';

    protected $primaryKey = 'id_kendaraan';

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    /**
     * @return HasMany<Transaksi, $this>
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_kendaraan', 'id_kendaraan');
    }
}
