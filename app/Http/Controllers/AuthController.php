<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt([...$credentials, 'status_aktif' => 1])) {
            throw ValidationException::withMessages([
                'username' => 'Username atau password salah, atau akun tidak aktif.',
            ]);
        }

        $request->session()->regenerate();
        LogAktivitas::catat($request->user()->id_user, 'Login ke sistem');

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        LogAktivitas::catat($request->user()->id_user, 'Logout dari sistem');
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
