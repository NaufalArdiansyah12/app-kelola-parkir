<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $users = User::query()
            ->when($search, fn ($q) => $q->where('nama_lengkap', 'like', "%{$search}%")->orWhere('username', 'like', "%{$search}%"))
            ->orderBy('nama_lengkap')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id_user' => $user->id_user,
                'nama_lengkap' => $user->nama_lengkap,
                'username' => $user->username,
                'role' => $user->role,
                'status_aktif' => $user->status_aktif,
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => ['search' => $search],
            'stats' => [
                'total' => User::count(),
                'aktif' => User::where('status_aktif', true)->count(),
                'admin' => User::where('role', 'admin')->count(),
                'petugas' => User::where('role', 'petugas')->count(),
                'owner' => User::where('role', 'owner')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:50', 'unique:tb_user,username'],
            'password' => ['required', Password::min(6)],
            'role' => ['required', Rule::in(['admin', 'petugas', 'owner'])],
            'status_aktif' => ['boolean'],
        ]);

        $user = User::create($data);
        LogAktivitas::catat($request->user()->id_user, "Menambah user {$user->username}");

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:50', Rule::unique('tb_user', 'username')->ignore($user->id_user, 'id_user')],
            'password' => ['nullable', Password::min(6)],
            'role' => ['required', Rule::in(['admin', 'petugas', 'owner'])],
            'status_aktif' => ['boolean'],
        ]);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        if ($user->id_user === $request->user()->id_user && ($data['status_aktif'] ?? false) === false) {
            return back()->with('error', 'Tidak dapat menonaktifkan akun sendiri.');
        }

        $user->update($data);
        LogAktivitas::catat($request->user()->id_user, "Mengubah user {$user->username}");

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id_user === $request->user()->id_user) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        if ($user->kendaraan()->exists() || $user->transaksi()->exists()) {
            return back()->with('error', 'User memiliki data kendaraan/transaksi, nonaktifkan saja.');
        }

        $username = $user->username;
        $user->delete();
        LogAktivitas::catat($request->user()->id_user, "Menghapus user {$username}");

        return back()->with('success', 'User berhasil dihapus.');
    }
}
