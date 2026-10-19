<?php

namespace Tests\Unit;

use App\Support\TarifCalculator;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;

class TarifCalculatorTest extends TestCase
{
    public function test_durasi_dibulatkan_ke_atas_dengan_minimal_satu_jam(): void
    {
        $masuk = Carbon::parse('2026-10-19 08:00:00');

        $this->assertSame(1, TarifCalculator::durasiJam($masuk, $masuk->copy()->addMinutes(1)));
        $this->assertSame(1, TarifCalculator::durasiJam($masuk, $masuk->copy()->addHour()));
        $this->assertSame(2, TarifCalculator::durasiJam($masuk, $masuk->copy()->addHour()->addSecond()));
        $this->assertSame(3, TarifCalculator::durasiJam($masuk, $masuk->copy()->addMinutes(125)));
    }

    public function test_biaya_adalah_durasi_kali_tarif(): void
    {
        $this->assertSame(6000, TarifCalculator::biaya(3, 2000));
        $this->assertSame(5000, TarifCalculator::biaya(1, '5000'));
    }
}
