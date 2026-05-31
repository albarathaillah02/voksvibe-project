<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use App\Notifications\SendOtpNotification;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('react', [
            'pageTitle' => 'Masuk | VOKSVIBE',
            'component' => 'Login',
            'props' => [],
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()
                ->withInput($request->except('password'))
                ->withErrors([
                    'email' => 'Email atau password tidak cocok.',
                ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(
            Auth::user()?->isAdmin() ? route('admin.dashboard') : route('account.profile')
        )->with('status', 'Selamat datang kembali di VOKSVIBE.');
    }

    public function showRegister()
    {
        return view('react', [
            'pageTitle' => 'Daftar | VOKSVIBE',
            'component' => 'Register',
            'props' => [],
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:80', Rule::unique(User::class, 'username')],
            'email' => ['required', 'email', 'max:120', Rule::unique(User::class, 'email')],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => User::ROLE_USER,
            'gender' => 'unspecified',
        ]);

        return redirect()->route('login')->with('status', 'Pendaftaran sukses! Silakan masuk menggunakan akun baru Anda.');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('store.home')->with('status', 'Kamu sudah keluar dari akun.');
    }
    
    /**
     * 1. Handler Kirim Permintaan OTP ke Email
     */
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak terdaftar di sistem kami.'
            ], 404);
        }

        // Generate 6 digit angka OTP acak
        $otp = rand(100000, 999999);

        // Simpan token ke kolom 'token' dalam bentuk BCRYPT HASH agar aman di database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => strtolower(trim($request->email))],
            [
                'token' => Hash::make($otp), 
                'created_at' => now()
            ]
        );

        // Kirim angka asli (Plain Text) ke email user agar bisa dibaca manusia
        Notification::route('mail', $request->email)->notify(new SendOtpNotification($otp));

        return response()->json([
            'message' => 'Kode OTP berhasil dikirim ke email Anda.'
        ], 200);
    }

    /**
     * 2. Handler Verifikasi Validasi Angka OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $emailInput = strtolower(trim($request->email));
        $otpInput = trim($request->otp);

        $resetData = DB::table('password_reset_tokens')
            ->where('email', $emailInput)
            ->first();

        if (!$resetData) {
            return response()->json([
                'message' => 'Sesi verifikasi tidak ditemukan. Silakan minta kode baru.'
            ], 400);
        }

        // 🟢 FIX: Pengecekan kedaluwarsa yang akurat (Batas waktu: 30 Menit) tanpa terpengaruh perbedaan timezone
        if (Carbon::parse($resetData->created_at)->addMinutes(30)->isPast()) { 
            return response()->json([
                'message' => 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.'
            ], 400);
        }

        // Verifikasi kecocokan kode input (Plain) dengan data di DB (Bcrypt Hash) menggunakan Hash::check
        if (!Hash::check($otpInput, $resetData->token)) {
            return response()->json([
                'message' => 'Kode OTP yang Anda masukkan salah.'
            ], 400);
        }

        return response()->json([
            'message' => 'Verifikasi OTP berhasil.'
        ], 200);
    }

    /**
     * 3. Handler Menyimpan Password Baru ke Database
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'password' => ['required', 'string', 'min:8']
        ]);

        $emailInput = strtolower(trim($request->email));
        $resetData = DB::table('password_reset_tokens')->where('email', $emailInput)->first();
        
        if (!$resetData) {
            return response()->json([
                'message' => 'Sesi verifikasi tidak valid. Silakan ulangi proses dari awal.'
            ], 400);
        }

        // 🟢 FIX: Proteksi waktu kedaluwarsa juga di halaman submit password baru
        if (Carbon::parse($resetData->created_at)->addMinutes(30)->isPast()) { 
            return response()->json([
                'message' => 'Sesi verifikasi telah berakhir karena kedaluwarsa.'
            ], 400);
        }

        // Proteksi berlapis memastikan token di database masih cocok sebelum ganti password
        if (!Hash::check($request->otp, $resetData->token)) {
            return response()->json([
                'message' => 'Sesi verifikasi tidak valid. Silakan ulangi proses dari awal.'
            ], 400);
        }

        // Update password baru milik user
        $user = User::where('email', $emailInput)->first();
        if ($user) {
            $user->update([
                'password' => $request->password
            ]);
        }

        // Hapus token di database setelah berhasil digunakan agar tidak bisa dipakai ulang
        DB::table('password_reset_tokens')->where('email', $emailInput)->delete();

        return response()->json([
            'message' => 'Password Anda berhasil diperbarui.'
        ], 200);
    }
}