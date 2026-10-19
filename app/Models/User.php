<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[Fillable(['nama_lengkap', 'username', 'password', 'role', 'status_aktif'])]
#[Hidden(['password'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'tb_user';

    protected $primaryKey = 'id_user';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'status_aktif' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Kendaraan, $this>
     */
    public function kendaraan(): HasMany
    {
        return $this->hasMany(Kendaraan::class, 'id_user', 'id_user');
    }

    /**
     * @return HasMany<Transaksi, $this>
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_user', 'id_user');
    }
}
