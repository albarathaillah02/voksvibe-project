import { useState } from 'react';
import { page } from '../config/page';
import { oldValue } from '../utils/oldValue';
import Csrf from '../components/forms/Csrf';
import Field from '../components/forms/Field';

export default function Register() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Validasi logic
    const checks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isPasswordValid = Object.values(checks).every(Boolean);
    const isPasswordMatch = password === confirmPassword && confirmPassword !== '';
    const canSubmit = isPasswordValid && isPasswordMatch;

    return (
        <section className="auth-shell">
            <div className="auth-panel auth-panel--visual">
                <p className="eyebrow">New Member</p>
                <h1>DAFTAR AKUN BARU</h1>
                <p>Bikin akun baru untuk menyimpan data profile, riwayat order, dan melanjutkan checkout langsung dari Laravel storefront ini.</p>
            </div>
            
            <form method="POST" action={page.routes.registerStore} className="auth-panel stack">
                <Csrf />
                <Field label="Nama Lengkap"><input type="text" name="name" defaultValue={oldValue('name')} required /></Field>
                <Field label="Username"><input type="text" name="username" defaultValue={oldValue('username')} required /></Field>
                <Field label="Email"><input type="email" name="email" defaultValue={oldValue('email')} required /></Field>
                
                {/* INPUT PASSWORD DENGAN VALIDASI */}
                <Field label="Password">
                    <input 
                        type="password" 
                        name="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </Field>

                {/* Validasi List */}
                <ul className="text-[11px] space-y-0.5 mt-1 mb-3">
                    <li className={checks.length ? 'text-green-600' : 'text-red-500'}>{checks.length ? '✓' : '✗'} Minimal 8 karakter</li>
                    <li className={checks.upper ? 'text-green-600' : 'text-red-500'}>{checks.upper ? '✓' : '✗'} Huruf besar</li>
                    <li className={checks.lower ? 'text-green-600' : 'text-red-500'}>{checks.lower ? '✓' : '✗'} Huruf kecil</li>
                    <li className={checks.number ? 'text-green-600' : 'text-red-500'}>{checks.number ? '✓' : '✗'} Mengandung angka</li>
                    <li className={checks.special ? 'text-green-600' : 'text-red-500'}>{checks.special ? '✓' : '✗'} Karakter khusus (!@#$...)</li>
                </ul>

                <Field label="Konfirmasi Password">
                    <input 
                        type="password" 
                        name="password_confirmation" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                    />
                </Field>
                
                {confirmPassword && !isPasswordMatch && (
                    <p className="text-red-500 text-[11px] -mt-2 mb-2">Password tidak cocok!</p>
                )}

                <button 
                    type="submit" 
                    className={`action-button ${canSubmit ? 'action-button--dark' : 'bg-gray-400 cursor-not-allowed'}`}
                    disabled={!canSubmit}
                >
                    Buat Akun
                </button>
            </form>
        </section>
    );
}