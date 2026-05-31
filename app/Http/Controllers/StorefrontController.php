<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Lookbook;
use App\Models\Product;
use App\Models\Cart;  // Ditambahkan untuk membaca database keranjang belanja
use App\Models\Order; // 🟢 FIX: Pastikan model Order di-import agar database bisa diakses!
use Illuminate\Http\Request;

class StorefrontController extends Controller
{
    public function home(Request $request)
    {
        $search = trim((string) $request->input('q', ''));
        $products = Product::query()
            ->search($search)
            ->orderByDesc('rating')
            ->orderBy('name')
            ->get();

        return view('react', [
            'pageTitle' => 'VOKSVIBE Streetwear',
            'component' => 'Home',
            'props' => [
                'search' => $search,
                'products' => $products,
                'bestSellers' => $products->take(4)->values(),
                'newArrivals' => $products->count() > 4 ? $products->slice(4, 4)->values() : $products->take(2)->values(),
                'lookbooks' => Lookbook::query()->orderBy('id')->take(3)->get(),
            ],
        ]);
    }

    public function category(Request $request, string $category)
    {
        $categoryMap = [
            't-shirts' => 'T-SHIRT',
            'shirt' => 'SHIRT',
            'hoodie' => 'HOODIE',
            'jacket' => 'JACKET',
            'accessory' => 'ACCESSORY',
        ];

        abort_unless(array_key_exists($category, $categoryMap), 404);

        $search = trim((string) $request->input('q', ''));
        $selectedCategory = $categoryMap[$category];

        // =========================================================================
        // PETA LINK GAMBAR BACKGROUND MODEL UNTUK SETIAP KATEGORI
        // =========================================================================
        $categoryImages = [
            'JACKET'    => 'https://www.joebananas.com/cdn/shop/files/avanel-landscape-jacket-875149.jpg?v=1744639926&width=1200',
            'T-SHIRT'   => 'https://commongoods.id/cdn/shop/articles/kenapa-kaos-oversized-sangat-populer-di-kalangan-anak-muda-004.jpg?v=1760349315&width=1100',
            'HOODIE'    => 'https://img.freepik.com/premium-photo/young-pleasant-woman-dressed-blue-hoodie-stands-posing-against-background-mountain-landscape-leans-her-hands-wooden-partition-looking-away-photosession-near-barrier_161422-4860.jpg?w1000',
            'SHIRT'     => 'https://media.suara.com/pictures/653x366/2021/12/17/72303-6-model-kemeja-lengan-panjang-pria.jpg',
            'ACCESSORY' => 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1200',
        ];

        // Ambil link berdasarkan kategori aktif, jika tidak ada diset null
        $bannerBg = $categoryImages[$selectedCategory] ?? null;
        // =========================================================================

        $products = Product::query()
            ->where('category', $selectedCategory)
            ->search($search)
            ->orderByDesc('rating')
            ->orderBy('name')
            ->get();

        return view('react', [
            'pageTitle' => "{$selectedCategory} | VOKSVIBE",
            'component' => 'Grid',
            'props' => [
                'heading' => $selectedCategory,
                'subheading' => 'Streetwear essentials yang mengikuti katalog voksvibe tampilan.',
                'products' => $products,
                'search' => $search,
                'accent' => 'gold',
                'emptyMessage' => 'Produk pada kategori ini belum tersedia.',
                'banner_bg' => $bannerBg,
            ],
        ]);
    }

    public function trending(Request $request)
    {
        $search = trim((string) $request->input('q', ''));
        $products = Product::query()
            ->where('is_trending', true)
            ->search($search)
            ->orderByDesc('rating')
            ->orderBy('name')
            ->get();

        // 🛠️ FIX: Ditambahkan parameter rasio lebar banner (&w=1400&h=450&fit=crop) agar server Unsplash memotong gambar secara landscape otomatis
        $bannerBg = 'trendingnow.jpg'; // Ganti dengan nama file gambar banner yang sudah Anda simpan di folder public

        return view('react', [
            'pageTitle' => 'Trending Now | VOKSVIBE',
            'component' => 'Grid',
            'props' => [
                'heading' => 'Trending Now',
                'subheading' => 'Produk dengan demand tertinggi dan rating terbaik.',
                'products' => $products,
                'search' => $search,
                'accent' => 'gold',
                'emptyMessage' => 'Belum ada produk trending untuk filter ini.',
                'banner_bg' => $bannerBg,
            ],
        ]);
    }

    public function sale(Request $request)
    {
        $search = trim((string) $request->input('q', ''));
        $products = Product::query()
            ->where('is_sale', true)
            ->search($search)
            ->orderByDesc('original_price')
            ->orderBy('name')
            ->get();

        // 🛠️ FIX: Ditambahkan parameter rasio lebar banner (&w=1400&h=450&fit=crop) agar gambar diskon/sale proporsional
        $bannerBg = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1400&h=450&fit=crop&crop=center';

        return view('react', [
            'pageTitle' => 'Flash Sale | VOKSVIBE',
            'component' => 'Grid',
            'props' => [
                'heading' => 'Flash Sale',
                'subheading' => 'Diskon terbatas dengan nuansa visual khas template Voksvibe.',
                'products' => $products,
                'search' => $search,
                'accent' => 'red',
                'emptyMessage' => 'Belum ada produk sale untuk filter ini.',
                'banner_bg' => $bannerBg,
            ],
        ]);
    }

    public function lookbook()
    {
        return view('react', [
            'pageTitle' => 'Lookbook | VOKSVIBE',
            'component' => 'Lookbook',
            'props' => [
                'lookbooks' => Lookbook::query()->orderBy('id')->get(),
                'featuredProducts' => Product::query()->where('is_trending', true)->take(3)->get(),
            ],
        ]);
    }

    /**
     * Menangani halaman checkout dan menyediakan data metode pembayaran ke React.
     */
    public function checkout(Request $request)
    {
        $cartItems = Cart::with('product')
            ->where('user_id', auth()->id())
            ->get()
            ->map(function ($item) {
                return [
                    'product' => $item->product,
                    'quantity' => $item->quantity,
                    'line_total' => $item->quantity * $item->product->price
                ];
            });

        $subtotal = $cartItems->sum('line_total');

        $paymentMethods = [
            [
                'id' => 'qris',
                'name' => 'QRIS (E-Wallet)',
                'description' => 'Bayar menggunakan GoPay, OVO, Dana, LinkAja, atau Mobile Banking.',
                'qr_image' => 'https://upload.wikimedia.org/wikipedia/commons/d/d1/QR_code_for_mobile_English_Wikipedia.svg' 
            ],
            [
                'id' => 'transfer_bank',
                'name' => 'Transfer Semua Bank (Manual)',
                'description' => 'Transfer aman melalui rekening utama kami.',
                'accounts' => [
                    ['bank' => 'BCA', 'number' => '1234567890', 'holder' => 'VOKSVIBE STORE'],
                    ['bank' => 'MANDIRI', 'number' => '0987654321', 'holder' => 'VOKSVIBE STORE'],
                ]
            ],
            [
                'id' => 'cod',
                'name' => 'Cash on Delivery (COD)',
                'description' => 'Bayar tunai secara langsung kepada kurir saat pesanan tiba di tujuan.'
            ]
        ];

        return view('react', [
            'pageTitle' => 'Checkout | VOKSVIBE',
            'component' => 'Checkout', 
            'props' => [
                'paymentMethods' => $paymentMethods,
                'items'          => $cartItems, 
                'subtotal'       => $subtotal,  
            ],
        ]);
    }

    // ✅ FITUR HALAMAN ABOUT US
    public function about()
    {
        $aboutImageUrl = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1400&h=450&fit=crop&crop=center';

        return view('react', [
            'component' => 'About',
            'pageTitle' => 'About Us | VOKSVIBE',
            'props' => [
                'banner_bg' => $aboutImageUrl,
            ]
        ]);
    }

    // =========================================================================
    // 🟢 SINKRONISASI BARU: Menangani Pembaruan Status Pesanan dari Admin ke Database
    // =========================================================================
    public function updateOrderStatus(Request $request, $id)
    {
        // Validasi input status yang dikirim oleh AdminDashboard React
        $request->validate([
            'status' => 'required|string'
        ]);

        // Cari data order berdasarkan ID
        $order = Order::findOrFail($id);
        
        // Simpan nilai status baru ke kolom database phpMyAdmin
        $order->status = $request->status;
        $order->save();

        // Mengembalikan respons sukses berformat JSON ke AdminDashboard React
        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui di database!',
            'order' => $order
        ]);
    }
}