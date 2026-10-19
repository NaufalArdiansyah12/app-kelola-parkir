<?php

namespace App\Support;

use Carbon\CarbonInterface;

final class TarifCalculator
{
    /**
     * Durasi parkir dibulatkan ke atas, minimal 1 jam.
     */
    public static function durasiJam(CarbonInterface $masuk, CarbonInterface $keluar): int
    {
        $detik = max(0, $keluar->getTimestamp() - $masuk->getTimestamp());

        return max(1, (int) ceil($detik / 3600));
    }

    public static function biaya(int $durasiJam, int|float|string $tarifPerJam): int
    {
        return $durasiJam * (int) $tarifPerJam;
    }
}
