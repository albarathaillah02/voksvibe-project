<?php

namespace App\Http\Controllers;

use App\Models\Lookbook;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        return view('react', [
            'pageTitle' => 'Admin Dashboard | VOKSVIBE',
            'component' => 'AdminDashboard',
            'props' => [
                'summary' => [
                    'totalRevenue' => (int) DB::table('transactions')->sum('total_amount'),
                    'totalOrders' => DB::table('transactions')->count(),
                    'pendingOrders' => DB::table('transactions')->where('status', 'pending')->count(),
                    'productCount' => Product::query()->count(),
                    'lookbookCount' => Lookbook::query()->count(),
                ],
                'orders' => Order::query()->with(['user', 'items.product'])->latest()->get(),
                'products' => Product::query()->latest()->get(),
                'editingProduct' => $request->filled('edit')
                    ? Product::query()->find($request->integer('edit'))
                    : null,
                
                // 🚀 TAMBAHAN: Mengirim data Lookbook ke React
                'lookbooks' => Lookbook::query()->latest()->get(),
                'editingLookbook' => $request->filled('edit_lookbook')
                    ? Lookbook::query()->find($request->integer('edit_lookbook'))
                    : null,
            ],
        ]);
    }

    // =========================================================================
    // 🟢 CRUD PRODUCT (TETAP SAMA)
    // =========================================================================
    public function storeProduct(Request $request)
    {
        $this->ensureAdmin($request);
        $data = $this->validateProduct($request);
        $data['slug'] = $this->uniqueSlug($data['name']);

        Product::query()->create($data);

        return redirect()->route('admin.dashboard', ['tab' => 'products'])->with('status', 'Produk baru berhasil ditambahkan.');
    }

    public function updateProduct(Request $request, Product $product)
    {
        $this->ensureAdmin($request);
        $data = $this->validateProduct($request);
        $data['slug'] = $this->uniqueSlug($data['name'], $product->id);

        $product->update($data);

        return redirect()->route('admin.dashboard', ['tab' => 'products'])->with('status', 'Produk berhasil diperbarui.');
    }

    public function destroyProduct(Request $request, Product $product)
    {
        $this->ensureAdmin($request);

        $hasOrders = DB::table('transaction_details')->where('product_id', $product->id)->exists();

        if ($hasOrders) {
            return back()->withErrors([
                'admin' => 'Produk yang sudah masuk order tidak bisa dihapus.',
            ]);
        }

        $product->delete();

        return back()->with('status', 'Produk berhasil dihapus.');
    }

    // =========================================================================
    // 🚀 CRUD LOOKBOOK (BARU DITAMBAHKAN)
    // =========================================================================
    
    // Method untuk menangani klik tombol Edit Lookbook
    public function editLookbook(Request $request, Lookbook $lookbook)
    {
        $this->ensureAdmin($request);
        // Lempar kembali ke dashboard dengan membawa ID lookbook yang mau diedit
        return redirect()->route('admin.dashboard', ['edit_lookbook' => $lookbook->id]);
    }

    public function storeLookbook(Request $request)
    {
        $this->ensureAdmin($request);
        $data = $this->validateLookbook($request);

        Lookbook::query()->create($data);

        return redirect()->route('admin.dashboard')->with('status', 'Lookbook baru berhasil ditambahkan.');
    }

    public function updateLookbook(Request $request, Lookbook $lookbook)
    {
        $this->ensureAdmin($request);
        $data = $this->validateLookbook($request);

        $lookbook->update($data);

        return redirect()->route('admin.dashboard')->with('status', 'Lookbook berhasil diperbarui.');
    }

    public function destroyLookbook(Request $request, Lookbook $lookbook)
    {
        $this->ensureAdmin($request);
        $lookbook->delete();
        
        return back()->with('status', 'Lookbook berhasil dihapus.');
    }

    // =========================================================================
    // 🟢 SINKRONISASI UPDATE PESANAN (TETAP SAMA)
    // =========================================================================
    public function updateOrder(Request $request, $id)
    {
        $this->ensureAdmin($request);

        $request->validate([
            'status' => ['required', 'string'],
        ]);

        $statusBaru = strtolower($request->input('status'));

        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Data transaksi tidak ditemukan.'
            ], 404);
        }

        $order->status = $statusBaru;
        $order->save();

        $orderFullData = Order::query()->with(['user', 'items'])->find($id);

        if ($request->expectsJson() || $request->isJson()) {
            return response()->json([
                'success' => true,
                'message' => "Status pesanan berhasil diubah menjadi {$statusBaru}.",
                'order' => $orderFullData
            ]);
        }

        return back()->with('status', "Status pesanan diperbarui.");
    }

    // =========================================================================
    // ⚙️ FUNGSI PRIVATE / HELPER
    // =========================================================================
    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }

    private function validateProduct(Request $request): array
    {
        return $request->validate([
            'category' => ['required', Rule::in(Product::CATEGORIES)],
            'name' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:2000'],
            'price' => ['required', 'integer', 'min:0'],
            'original_price' => ['nullable', 'integer', 'min:0'],
            'rating' => ['required', 'numeric', 'between:0,5'],
            'stock' => ['required', 'integer', 'min:0'],
            'image_url' => ['required', 'string', 'max:255'],
            'is_trending' => ['nullable', 'boolean'],
            'is_sale' => ['nullable', 'boolean'],
        ]);
    }

    // 🚀 TAMBAHAN: Validasi Khusus Input Form Lookbook
    private function validateLookbook(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'volume' => ['required', 'string', 'max:50'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'image_url' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $index = 1;

        while (
            Product::query()
                ->when($ignoreId !== null, fn ($query) => $query->where('id', '<>', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$base}-{$index}";
            $index++;
        }

        return $slug;
    }
}