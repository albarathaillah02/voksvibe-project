import { useState, useEffect, useRef } from 'react';
import { page } from '../config/page';
import { oldValue } from '../utils/oldValue';
import Csrf from '../components/forms/Csrf';
import Field from '../components/forms/Field';
import DemoBox from '../components/ui/DemoBox';

export default function Login() {

    const [authStep, setAuthStep] = useState('login'); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // --- PERBAIKAN LOGIKA VALIDASI (ANTI BLANK SCREEN) ---
    // Memastikan newPassword selalu berupa string untuk mencegah error .length
    const safePassword = newPassword || '';
    
    const isLengthValid = safePassword.length >= 8;
    const isUpperValid = /[A-Z]/.test(safePassword);
    const isLowerValid = /[a-z]/.test(safePassword);
    const isNumberValid = /[0-9]/.test(safePassword);
    const isSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(safePassword);

    // Tombol hanya aktif jika semua true
    const isPasswordValid = isLengthValid && isUpperValid && isLowerValid && isNumberValid && isSpecialValid;
    // -----------------------------------------------------

    // State Tambahan Fitur Countdown & Resend OTP
    const [countdown, setCountdown] = useState(120); // Waktu default 2 menit (120 detik)
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
        // Jika masuk ke langkah verifikasi OTP, nyalakan countdown timer
        if (authStep === 'verify_otp') {
            setCountdown(120);
            setIsResendDisabled(true);

            // Bersihkan timer lama jika ada sisa
            if (timerRef.current) clearInterval(timerRef.current);

            timerRef.current = setInterval(() => {
                setCountdown((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        setIsResendDisabled(false); // Aktifkan tombol kirim ulang saat waktu habis
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        // Cleanup timer saat komponen unmount atau berpindah alur halaman
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [authStep]);

    // Format angka detik menjadi bentuk menit:detik ramah visual (Contoh: 01:45)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // 1. Handler Kirim Permintaan OTP ke Email (Berlaku juga untuk Kirim Ulang)
    const handleRequestOtp = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        // Ambil token CSRF dari form atau dari DOM meta tag
        const formElement = document.querySelector('form');
        const csrfToken = formElement?.querySelector('input[name="_token"]')?.value 
            || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
            || '';

        const formData = new FormData();
        formData.append('_token', csrfToken);
        formData.append('email', email.trim().toLowerCase());

        const targetRoute = (page && page.routes && page.routes.forgotPasswordStore) 
            ? page.routes.forgotPasswordStore 
            : '/forgot-password';

        try {
            const response = await fetch(targetRoute, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                alert('Kode OTP baru berhasil dikirim ulang ke email Anda!');
                // Reset ulang hitungan mundur ke 2 menit lagi
                if (authStep === 'verify_otp') {
                    setCountdown(120);
                    setIsResendDisabled(true);
                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = setInterval(() => {
                        setCountdown((prevTime) => {
                            if (prevTime <= 1) {
                                clearInterval(timerRef.current);
                                setIsResendDisabled(false);
                                return 0;
                            }
                            return prevTime - 1;
                        });
                    }, 1000);
                } else {
                    setAuthStep('verify_otp');
                }
            } else {
                const errorText = await response.text();
                let serverMessage = 'Email tidak terdaftar di sistem kami atau terjadi kendala server.';
                try {
                    const parsedError = JSON.parse(errorText);
                    if (parsedError.message) serverMessage = parsedError.message;
                } catch (jsonError) {
                    if (errorText.includes('Mailer') || errorText.includes('Authentication') || errorText.includes('smtp')) {
                        serverMessage = 'Error Mailer: Server SMTP atau Akun Gmail memblokir koneksi. Periksa kembali setelan sandi aplikasi di .env Anda.';
                    }
                }
                
                alert(serverMessage);
                console.error("Detail Error Lengkap dari Server:", errorText);
            }
        } catch (error) {
            console.error("Detail Gagal Terhubung:", error);
            alert('Gagal terhubung ke server. Pastikan perintah "php artisan serve" Anda sedang berjalan aktif di terminal.');
        }
    };

    // 2. Handler Verifikasi Validasi OTP 
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        const csrfToken = e.target.querySelector('input[name="_token"]')?.value 
            || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
            || '';

        const targetRoute = (page && page.routes && page.routes.verifyOtpStore)
            ? page.routes.verifyOtpStore
            : '/verify-otp';

        try {
            const response = await fetch(targetRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    otp: otp.replace(/\s/g, '') 
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Verifikasi berhasil! Silakan buat password baru.');
                setAuthStep('reset_password'); 
            } else {
                alert('Gagal dari Server: ' + (result.message || JSON.stringify(result.errors)));
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan jaringan saat verifikasi OTP.');
        }
    };

    // 3. Handler Menyimpan Password Baru ke Database
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        const csrfToken = e.target.querySelector('input[name="_token"]')?.value || '';

        const targetRoute = (page && page.routes && page.routes.resetPasswordStore)
            ? page.routes.resetPasswordStore
            : '/reset-password';

        try {
            const response = await fetch(targetRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    otp: otp.replace(/\s/g, ''),
                    password: newPassword
                })
            });

            if (response.ok) {
                alert('Password sukses diperbarui! Silakan masuk kembali.');
                setAuthStep('login');
                setEmail('');
                setOtp('');
                setNewPassword('');
            } else {
                alert('Gagal memperbarui password. Pastikan minimal 8 karakter.');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan sistem.');
        }
    };

    return (
        <section className="auth-shell">
            {/* PANEL KIRI (VISUAL & DETAIL INFO) */}
            <div className="auth-panel auth-panel--visual">
                <p className="eyebrow">Account Access</p>
                <h1>MASUK KE VOKSVIBE</h1>
                <p>Gunakan akun demo atau akun yang kamu daftarkan untuk membuka profile, order, checkout, dan dashboard admin.</p>
                <DemoBox title="Voksvibe Apparel" text="Voksvibe adalah toko online yang menjual berbagai produk fashion berkualitas tinggi dan layanan pelanggan terbaik." />
            </div>

            {/* TAMPILAN 1: FORM LOGIN UTAMA */}
            {authStep === 'login' && (
                <form method="POST" action={page?.routes?.loginStore || '/login'} className="auth-panel stack">
                    <Csrf />
                    <Field label="Email">
                        <input type="email" name="email" defaultValue={oldValue('email')} required />
                    </Field>
                    
                    <Field label="Password">
                        <input type="password" name="password" required />
                    </Field>
                    
                    <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '4px' }}>
                        <button 
                            type="button" 
                            onClick={() => setAuthStep('forgot_request')}
                            style={{ 
                                background: 'none', border: 'none', textDecoration: 'underline', 
                                fontWeight: '800', cursor: 'pointer', fontSize: '13px', padding: '0', color: '#000'
                            }}
                        >
                            Lupa password?
                        </button>
                    </div>

                    <label className="checkbox-row">
                        <input type="checkbox" name="remember" value="1" />
                        <span>Ingat saya</span>
                    </label>
                    
                    <button type="submit" className="action-button action-button--dark">Masuk</button>
                    <p className="muted-text">Belum punya akun? <a href={page?.routes?.register || '/register'}>Daftar di sini</a>.</p>
                </form>
            )}

            {/* TAMPILAN 2: INPUT EMAIL REQUEST OTP */}
            {authStep === 'forgot_request' && (
                <form 
                    method="POST"
                    action={page?.routes?.forgotPasswordStore || '#'} 
                    onSubmit={handleRequestOtp} 
                    className="auth-panel stack"
                >
                    <Csrf />
                    <p className="eyebrow">Recovery Step 01</p>
                    <h1 style={{ fontSize: '2rem', lineHeight: '1.1' }}>LUPA PASSWORD</h1>
                    <p className="muted-text" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        Masukkan email terdaftar. Kami akan mengirimkan kode verifikasi OTP langsung ke kotak masuk Anda.
                    </p>
                    
                    <Field label="Email Terdaftar">
                        <input 
                            type="email" 
                            name="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="nama@email.com" 
                            required 
                        />
                    </Field>

                    <button type="submit" className="action-button action-button--dark" style={{ marginTop: '8px' }}>
                        Kirim Kode OTP ⚡
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => setAuthStep('login')}
                        style={{ 
                            background: 'none', border: 'none', textDecoration: 'underline', 
                            cursor: 'pointer', fontWeight: '800', color: '#000', fontSize: '14px' 
                        }}
                    >
                        Kembali ke Login
                    </button>
                </form>
            )}

            {/* TAMPILAN 3: INPUT & VERIFIKASI OTP (DENGAN COUNTDOWN TIMER) */}
            {authStep === 'verify_otp' && (
                <form 
                    method="POST"
                    action={page?.routes?.verifyOtpStore || '#'}
                    onSubmit={handleVerifyOtp} 
                    className="auth-panel stack"
                >
                    <Csrf />
                    <input type="hidden" name="email" value={email} />

                    <p className="eyebrow">Recovery Step 02</p>
                    <h1 style={{ fontSize: '2rem', lineHeight: '1.1' }}>VERIFIKASI OTP</h1>
                    <p className="muted-text" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        Kode OTP dikirim ke <strong>{email || 'email Anda'}</strong>. Periksa pesan masuk atau folder spam.
                    </p>
                    
                    <Field label="Kode OTP (6 Digit)">
                        <input 
                            type="text" 
                            name="otp"
                            maxLength={6}
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            placeholder="000000" 
                            style={{ 
                                textAlign: 'center', letterSpacing: '8px', fontWeight: '900', fontSize: '20px' 
                            }}
                            required 
                        />
                    </Field>

                    {/* WAKTU MUNDUR DAN TOMBOL RESEND OTP */}
                    <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '14px' }}>
                        {isResendDisabled ? (
                            <p style={{ color: '#666', fontWeight: '500' }}>
                                Kirim ulang kode dalam: <strong style={{ color: '#ff4d4f', fontFamily: 'monospace', fontSize: '15px' }}>{formatTime(countdown)}</strong>
                            </p>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                                <p style={{ color: '#2b2b2b', fontSize: '13px', marginBottom: '6px' }}>Belum menerima kode OTP?</p>
                                <button
                                    type="button"
                                    onClick={handleRequestOtp}
                                    style={{
                                        background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '6px',
                                        padding: '8px 16px', fontWeight: '800', cursor: 'pointer',
                                        fontSize: '13px', color: '#000', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = '#e0e0e0'}
                                    onMouseOut={(e) => e.target.style.background = '#f0f0f0'}
                                >
                                    🔄 Kirim Ulang Kode OTP
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="action-button action-button--dark" style={{ marginTop: '12px' }}>
                        Verifikasi OTP 🔑
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => setAuthStep('forgot_request')}
                        style={{ 
                            background: 'none', border: 'none', textDecoration: 'underline', 
                            cursor: 'pointer', fontWeight: '800', color: '#000', fontSize: '14px', marginTop: '4px'
                        }}
                    >
                        Ganti Alamat Email
                    </button>
                </form>
            )}

            {/* TAMPILAN 4: RESET PASSWORD BARU */}
            {authStep === 'reset_password' && (
                <form 
                    method="POST"
                    action={page?.routes?.resetPasswordStore || '#'}
                    onSubmit={handleResetPassword} 
                    className="auth-panel stack"
                >
                    <Csrf />
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="otp" value={otp} />

                    <p className="eyebrow">Recovery Step 03</p>
                    <h1 style={{ fontSize: '2rem', lineHeight: '1.1' }}>PASSWORD BARU</h1>
                    <p className="muted-text" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        Buat kombinasi password baru yang aman demi menjaga privasi akun Anda.
                    </p>
                    
                    <Field label="Buat Password Baru">
                        <input 
                            type="password" 
                            name="password"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            placeholder="••••••••" 
                            required 
                        />
                    </Field>

                    {/* VALIDASI LIST CHECK - SUDAH MENGGUNAKAN VARIABEL YANG AMAN */}
                    <ul className="text-[11px] space-y-0.5 mt-1 mb-3">
                        <li className={isLengthValid ? 'text-green-600' : 'text-red-500'}>
                            {isLengthValid ? '✓' : '✗'} Minimal 8 karakter
                        </li>
                        <li className={isUpperValid ? 'text-green-600' : 'text-red-500'}>
                            {isUpperValid ? '✓' : '✗'} Huruf besar
                        </li>
                        <li className={isLowerValid ? 'text-green-600' : 'text-red-500'}>
                            {isLowerValid ? '✓' : '✗'} Huruf kecil
                        </li>
                        <li className={isNumberValid ? 'text-green-600' : 'text-red-500'}>
                            {isNumberValid ? '✓' : '✗'} Mengandung angka
                        </li>
                        <li className={isSpecialValid ? 'text-green-600' : 'text-red-500'}>
                            {isSpecialValid ? '✓' : '✗'} Karakter khusus (!@#$...)
                        </li>
                    </ul>

                    <button 
                        type="submit" 
                        disabled={!isPasswordValid}
                        className={`action-button ${isPasswordValid ? 'action-button--dark' : 'bg-gray-400 cursor-not-allowed'}`} 
                        style={{ marginTop: '8px' }}
                    >
                        Simpan Password Baru 🎉
                    </button>
                </form>
            )}
        </section>
    );
}