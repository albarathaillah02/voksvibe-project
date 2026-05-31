<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Cart; 
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// ✅ Menggunakan import namespace yang sesuai dengan SDK Xendit v2.19
use Xendit\Xendit;
use Xendit\Invoice;

class CartController extends Controller
{
    // Konstruktor lama dihapus total agar tidak menyebabkan error "undefined method" di Laravel 11+

    public function index()
    {
        return view('react', [
            'pageTitle' => 'Keranjang | VOKSVIBE',
            'component' => 'Cart',
            'props' => $this->cartPayload(),
        ]);
    }

    public function store(Product $product)
    {
        // 1. Cek kuantitas yang sudah ada di database untuk user ini
        $existingCart = Cart::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->first();

        $currentQuantity = $existingCart ? $existingCart->quantity : 0;

        if ($currentQuantity >= $product->stock) {
            return back()->withErrors([
                'cart' => "Stok {$product->name} tidak cukup untuk ditambahkan lagi.",
            ]);
        }

        // 2. Simpan atau perbarui data ke database menggunakan updateOrCreate
        Cart::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'product_id' => $product->id,
            ],
            [
                'quantity' => $currentQuantity + 1
            ]
        );

        return back()->with('status', "{$product->name} ditambahkan ke keranjang.");
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($product->stock < (int) $validated['quantity']) {
            return back()->withErrors([
                'cart' => "Stok {$product->name} tersisa {$product->stock}.",
            ]);
        }

        // 3. Perbarui jumlah kuantitas langsung di database
        Cart::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->update(['quantity' => (int) $validated['quantity']]);

        return back()->with('status', 'Jumlah item berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        // 4. Hapus data produk tertentu dari database keranjang user
        Cart::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->delete();

        return back()->with('status', "{$product->name} dihapus dari keranjang.");
    }

    public function checkout()
    {
        $payload = $this->cartPayload();

        if ($payload['items']->isEmpty()) {
            return redirect()->route('cart.index')->withErrors([
                'cart' => 'Keranjang masih kosong.',
            ]);
        }

        return view('react', [
            'pageTitle' => 'Checkout | VOKSVIBE',
            'component' => 'Checkout',
            'props' => $payload,
        ]);
    }

    public function placeOrder(Request $request, OrderService $orderService)
    {
        // Validasi input data checkout dari React frontend
        $validated = $request->validate([
            'shipping_address' => ['required', 'string', 'min:10'],
            'shipping_method'  => ['required', 'string'], 
            'shipping_cost'    => ['nullable', 'numeric'], 
            'payment_method'   => ['required', 'string'],  
        ]);

        $payload = $this->cartPayload();

        if ($payload['items']->isEmpty()) {
            return redirect()->route('cart.index')->withErrors([
                'cart' => 'Keranjang masih kosong.',
            ]);
        }

        // 1. Simpan data transaksi ke database lokal melalui OrderService
        $order = $orderService->createForUser(
            $request->user(),
            $payload['items']->map(fn (array $item): array => [
                'product_id' => $item['product']->id,
                'quantity' => $item['quantity'],
            ])->all(),
            $validated['shipping_address'],
            $validated['shipping_method'],
            $validated['shipping_cost'] ?? 0 
        );

        // 2. SETELAH ORDER SUKSES DI DATABASE: Bersihkan tabel database keranjang untuk user ini
        //Cart::where('user_id', auth()->id())->delete();

        // 3. SELEKSI ALUR PROSES PEMBAYARAN
        try {
            // A. JIKA USER MEMILIH METODE COD (CASH ON DELIVERY)
            if ($validated['payment_method'] === 'cod') {
                // Di sini kamu bisa menambahkan update status order khusus COD jika diperlukan, misalnya:
                // $order->update(['payment_status' => 'pending_cod']);

                // ✅ DIPERBARUI: Mengalihkan langsung ke route account.orders agar tidak memicu error 404
                return redirect()->route('account.orders')->with('status', 'Pesanan COD berhasil dibuat! Tim VOKSVIBE akan segera memproses paket Anda.');
            }

            // B. JIKA USER MEMILIH METODE QRIS / UTAMA (PROSES SINKRONISASI KE API XENDIT)
            Xendit::setApiKey(env('XENDIT_SECRET_KEY'));

            // Menyusun item produk untuk lampiran rincian di halaman Xendit
            $itemsSummary = [];
            foreach ($order->items as $item) {
                $itemsSummary[] = [
                    'name' => $item->product_name,
                    'quantity' => (int) $item->quantity,
                    'price' => (int) $item->unit_price,
                    'category' => $item->product_category
                ];
            }

            // Daftarkan biaya pengiriman sebagai salah satu item di invoice Xendit
            if ($order->shipping_cost > 0) {
                $itemsSummary[] = [
                    'name' => 'Biaya Pengiriman (' . $order->shipping_method . ')',
                    'quantity' => 1,
                    'price' => (int) $order->shipping_cost,
                    'category' => 'Shipping'
                ];
            }

            // Menyusun struktur array request parameters sesuai format Invoice::create() v2.x
            $params = [
                'external_id' => $order->order_code,            // Kode transaksi unik VOKSVIBE
                'amount' => (int) $order->total_amount,         // Total akhir (Subtotal + Ongkir)
                'payer_email' => $request->user()->email,        // Email pembeli untuk notifikasi kwitansi xendit
                'description' => 'Pembayaran Pesanan #' . $order->order_code . ' di VOKSVIBE',
                'invoice_duration' => 86400,                    // Masa berlaku invoice (24 Jam)
                'items' => $itemsSummary,
                // ✅ DIPERBARUI: Dialihkan ke URL /account/orders setelah sukses bayar via Xendit
                'success_redirect_url' => url('/account/orders'), 
                'failure_redirect_url' => url('checkout'),       // Dialihkan kembali jika gagal
            ];

            // Memanggil fungsi static create milik Invoice Xendit v2.x
            $xenditInvoice = Invoice::create($params);

            // Mengambil URL invoice langsung dari data array respon SDK v2.x
            return redirect($xenditInvoice['invoice_url']);

        } catch (\Exception $e) {
            // ✅ DIPERBARUI: Jika API Xendit bermasalah, dialihkan ke named route account.orders yang valid
            return redirect()->route('account.orders')->with('status', "Pesanan berhasil dibuat, namun gagal memicu gerbang pembayaran: " . $e->getMessage());
        }
    }

    /**
     * Membaca data langsung dari database dengan format payload yang sama untuk React
     */
    private function cartPayload(): array
    {
        $cartDbItems = Cart::where('user_id', auth()->id())
            ->where('quantity', '>', 0)
            ->get();

        $products = Product::query()
            ->whereIn('id', $cartDbItems->pluck('product_id'))
            ->get()
            ->keyBy('id');

        // 3. Susun data koleksi agar formatnya tetap sama persis dengan props bawaan React kamu
        $items = $cartDbItems->map(function ($cartItem) use ($products) {
            $product = $products->get($cartItem->product_id);

            if (!$product) {
                return null;
            }

            return [
                'product' => $product,
                'quantity' => (int) $cartItem->quantity,
                'line_total' => (int) ($product->price * $cartItem->quantity),
            ];
        })->filter()->values();

        return [
            'items' => $items,
            'subtotal' => (int) $items->sum('line_total'),
        ];
    }
}