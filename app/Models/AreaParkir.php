<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nama_area', 'kapasitas', 'kapasitas_mobil', 'kapasitas_motor', 'kolom', 'denah', 'terisi'])]
class AreaParkir extends Model
{
    public $timestamps = false;

    protected $table = 'tb_area_parkir';

    protected $primaryKey = 'id_area';

    protected $appends = ['sisa', 'kode', 'baris'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kapasitas' => 'integer',
            'kapasitas_mobil' => 'integer',
            'kapasitas_motor' => 'integer',
            'kolom' => 'integer',
            'denah' => 'array',
            'terisi' => 'integer',
        ];
    }

    public function getSisaAttribute(): int
    {
        return max(0, $this->kapasitas - $this->terisi);
    }

    /**
     * Jumlah baris denah.
     */
    public function getBarisAttribute(): int
    {
        return $this->denahLayout()['baris'];
    }

    /**
     * Denah tersimpan, atau susunan grid default bila belum diatur admin.
     *
     * @return array{baris: int, kolom: int, slot: array<int, array{n: int, b: int, k: int, rot: int}>}
     */
    public function denahLayout(): array
    {
        $kolom = max(1, (int) ($this->denah['kolom'] ?? $this->kolom));

        if (is_array($this->denah['slot'] ?? null) && $this->denah['slot'] !== []) {
            return [
                'baris' => max(1, (int) ($this->denah['baris'] ?? ceil($this->kapasitas / $kolom))),
                'kolom' => $kolom,
                'slot' => array_values($this->denah['slot']),
            ];
        }

        $kapasitas = max(0, (int) $this->kapasitas);

        return [
            'baris' => max(1, (int) ceil($kapasitas / $kolom)),
            'kolom' => $kolom,
            'slot' => $kapasitas < 1 ? [] : collect(range(1, $kapasitas))->map(fn (int $nomor) => [
                'n' => $nomor,
                'b' => intdiv($nomor - 1, $kolom),
                'k' => ($nomor - 1) % $kolom,
                'rot' => 0,
            ])->all(),
        ];
    }

    /**
     * Jenis kendaraan untuk nomor slot: slot mobil lebih dulu, sisanya motor.
     */
    public function jenisSlot(int $nomor): string
    {
        return $nomor <= $this->kapasitas_mobil ? 'mobil' : 'motor';
    }

    /**
     * Nomor slot yang tersedia untuk satu jenis kendaraan.
     *
     * @return list<int>
     */
    public function nomorSlotJenis(string $jenis): array
    {
        if ($jenis === 'motor') {
            return $this->kapasitas_motor < 1 ? [] : range($this->kapasitas_mobil + 1, $this->kapasitas);
        }

        return $this->kapasitas_mobil < 1 ? [] : range(1, $this->kapasitas_mobil);
    }

    /**
     * Prefix label slot, mis. "Zona A - Mobil" menjadi "A1", "A2", dst.
     */
    public function getKodeAttribute(): string
    {
        $nama = preg_replace('/\b(zona|area|parkir)\b/i', ' ', $this->nama_area) ?? $this->nama_area;

        if (preg_match('/\b([A-Za-z])\b/', $nama, $matches) === 1) {
            return strtoupper($matches[1]);
        }

        return strtoupper(substr(trim($nama) ?: $this->nama_area, 0, 1));
    }

    /**
     * @return HasMany<Transaksi, $this>
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_area', 'id_area');
    }
}
