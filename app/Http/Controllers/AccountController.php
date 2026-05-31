<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf; // IMPORT: Mengaktifkan generator PDF

class AccountController extends Controller
{
    public function profile(Request $request)
    {
        return view('react', [
            'pageTitle' => 'Profil | VOKSVIBE',
            'component' => 'Profile',
            'props' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function update(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:80', Rule::unique(User::class, 'username')->ignore($user->id)],
            'email' => ['required', 'email', 'max:120', Rule::unique(User::class, 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender' => ['required', Rule::in(['male', 'female', 'unspecified'])],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:1000'],
            'password' => ['nullable', 'confirmed', 'string', 'min:8'],
        ]);

        if (!array_key_exists('password', $validated) || $validated['password'] === null || $validated['password'] === '') {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('status', 'Profil berhasil diperbarui.');
    }

    public function orders(Request $request)
    {
        return view('react', [
            'pageTitle' => 'Pesanan Saya | VOKSVIBE',
            'component' => 'Orders',
            'props' => [
                'orders' => $request->user()
                    ->orders()
                    ->with(['items', 'user'])
                    ->latest()
                    ->get(),
            ],
        ]);
    }

    /**
     * Fitur Cetak Nota / Download Invoice PDF
     */
    public function downloadInvoice($id)
    {
        // Ambil data transaksi beserta detail itemnya, pastikan milik user yang sedang login
        $transaction = Order::with(['items', 'user'])
            ->where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $data = [
            'transaction' => $transaction,
        ];

        // Render template blade 'orders.invoice_pdf' ke format PDF dokumen kertas A4
        $pdf = Pdf::loadView('orders.invoice_pdf', $data);
        $pdf->setPaper('a4', 'portrait');

        // Unduh langsung file PDF di browser user
        return $pdf->download('Invoice_' . $transaction->order_code . '.pdf');
    }
}