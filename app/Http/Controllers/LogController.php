<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'id_user' => ['nullable', 'integer'],
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date'],
        ]);

        $logs = LogAktivitas::query()
            ->with('user:id_user,nama_lengkap,role')
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where('aktivitas', 'like', "%{$search}%"))
            ->when($filters['id_user'] ?? null, fn ($q, $id) => $q->where('id_user', $id))
            ->when($filters['dari'] ?? null, fn ($q, $dari) => $q->whereDate('waktu_aktivitas', '>=', $dari))
            ->when($filters['sampai'] ?? null, fn ($q, $sampai) => $q->whereDate('waktu_aktivitas', '<=', $sampai))
            ->latest('waktu_aktivitas')
            ->latest('id_log')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (LogAktivitas $log) => [
                'id_log' => $log->id_log,
                'aktivitas' => $log->aktivitas,
                'waktu_aktivitas' => $log->waktu_aktivitas->format('d/m/Y H:i:s'),
                'user' => $log->user,
            ]);

        return Inertia::render('Log/Index', [
            'logs' => $logs,
            'users' => User::orderBy('nama_lengkap')->get(['id_user', 'nama_lengkap']),
            'filters' => $filters,
        ]);
    }
}
