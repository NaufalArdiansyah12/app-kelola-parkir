<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_user', 'aktivitas', 'waktu_aktivitas'])]
class LogAktivitas extends Model
{
    public $timestamps = false;

    protected $table = 'tb_log_aktivitas';

    protected $primaryKey = 'id_log';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'waktu_aktivitas' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public static function catat(int $idUser, string $aktivitas): void
    {
        self::create([
            'id_user' => $idUser,
            'aktivitas' => mb_substr($aktivitas, 0, 100),
            'waktu_aktivitas' => now(),
        ]);
    }
}
