<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['jenis_kendaraan', 'tarif_per_jam'])]
class Tarif extends Model
{
    public const JENIS = ['motor', 'mobil', 'lainnya'];

    /**
     * Jenis kendaraan yang sudah memiliki tarif.
     *
     * @return list<string>
     */
    public static function jenisTerpakai(): array
    {
        return static::query()->orderBy('jenis_kendaraan')->pluck('jenis_kendaraan')->all();
    }

    /**
     * Pilihan jenis kendaraan: yang sudah punya tarif + jenis bawaan.
     *
     * @return list<string>
     */
    public static function jenisPilihan(): array
    {
        return array_values(array_unique([...static::jenisTerpakai(), ...self::JENIS]));
    }

    public $timestamps = false;

    protected $table = 'tb_tarif';

    protected $primaryKey = 'id_tarif';

    /**
     * @return HasMany<Transaksi, $this>
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_tarif', 'id_tarif');
    }
}
