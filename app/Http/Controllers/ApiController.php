<?php

namespace App\Http\Controllers;

use App\Models\AuthToken;
use App\Models\Lookbook;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ApiController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }

    public function products(Request $request): JsonResponse
    {
        $products = Product::query()
            ->search($request->input('q'))
            ->when($request->filled('category'), fn ($query) => $query->where('category', strtoupper((string) $request->input('category'))))
            ->when($request->boolean('trending'), fn ($query) => $query->where('is_trending', true))
            ->when($request->boolean('sale'), fn ($query) => $query->where('is_sale', true))
            ->orderByDesc('rating')
            ->orderBy('name')
            ->get();

        return response()->json([
            'products' => $products->map(fn (Product $product): array => $this->mapProduct($product))->values(),
        ]);
    }

    public function lookbooks(): JsonResponse
    {
        $lookbooks = Lookbook::query()->orderBy('id')->get();

        return response()->json([
            'lookbooks' => $lookbooks->map(fn (Lookbook $lookbook): array => $this->mapLookbook($lookbook))->values(),
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:80', Rule::unique(User::class, 'username')],
            'email' => ['required', 'email', 'max:120', Rule::unique(User::class, 'email')],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::query()->create([
            'name' => $validated['fullName'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => User::ROLE_USER,
            'gender' => 'unspecified',
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'token' => $this->issueToken($user),
            'user' => $this->mapUser($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'role' => ['nullable', Rule::in([User::ROLE_ADMIN, User::ROLE_USER])],
        ]);

        /** @var User|null $user */
        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! password_verify($validated['password'], $user->password)) {
            $this->jsonError('Email atau password tidak valid.', 401);
        }

        if (isset($validated['role']) && $validated['role'] !== $user->role) {
            $this->jsonError('Role login tidak sesuai.', 403);
        }

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $this->issueToken($user),
            'user' => $this->mapUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->mapUser($this->apiUserOrFail($request)),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $tokenRecord = $this->resolveTokenRecord($request);

        if (! $tokenRecord) {
            $this->jsonError('Token tidak ditemukan.', 401);
        }

        $tokenRecord->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->mapUser($this->apiUserOrFail($request)),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->apiUserOrFail($request);

        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:80', Rule::unique(User::class, 'username')->ignore($user->id)],
            'email' => ['required', 'email', 'max:120', Rule::unique(User::class, 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender' => ['required', Rule::in(['male', 'female', 'unspecified'])],
            'birthDate' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:1000'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $payload = [
            'name' => $validated['fullName'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'gender' => $validated['gender'],
            'birth_date' => $validated['birthDate'] ?? null,
            'address' => $validated['address'] ?? null,
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $user->update($payload);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $this->mapUser($user->fresh()),
        ]);
    }

    public function orders(Request $request): JsonResponse
    {
        $user = $this->apiUserOrFail($request);
        $orders = $user->orders()->with(['items', 'user'])->latest()->get();

        return response()->json([
            'orders' => $orders->map(fn (Order $order): array => $this->mapOrder($order, true))->values(),
        ]);
    }

    public function storeOrder(Request $request, OrderService $orderService): JsonResponse
    {
        $user = $this->apiUserOrFail($request);

        $validated = $request->validate([
            'address' => ['required', 'string', 'min:10'],
            'shippingMethod' => ['required', Rule::in(Order::SHIPPING_METHODS)],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = $orderService->createForUser(
            $user,
            collect($validated['items'])->map(fn (array $item): array => [
                'product_id' => (int) $item['productId'],
                'quantity' => (int) $item['quantity'],
            ])->all(),
            $validated['address'],
            $validated['shippingMethod'],
        );

        return response()->json([
            'message' => 'Order berhasil dibuat.',
            'order' => $this->mapOrder($order->fresh(['items', 'user']), true),
        ], 201);
    }

    public function adminSummary(Request $request): JsonResponse
    {
        $this->apiUserOrFail($request, true);

        return response()->json([
            'summary' => [
                'totalRevenue' => (int) Order::query()->sum('total_amount'),
                'totalRevenueFormatted' => $this->formatRupiah((int) Order::query()->sum('total_amount')),
                'totalOrders' => Order::query()->count(),
                'pendingOrders' => Order::query()->where('status', 'pending')->count(),
                'productCount' => Product::query()->count(),
                'lookbookCount' => Lookbook::query()->count(),
            ],
        ]);
    }

    public function adminOrders(Request $request): JsonResponse
    {
        $this->apiUserOrFail($request, true);

        return response()->json([
            'orders' => Order::query()
                ->with(['items', 'user'])
                ->latest()
                ->get()
                ->map(fn (Order $order): array => $this->mapOrder($order, true))
                ->values(),
        ]);
    }

    public function updateAdminOrder(Request $request, Order $order): JsonResponse
    {
        $this->apiUserOrFail($request, true);

        $validated = $request->validate([
            'status' => ['required', Rule::in(Order::STATUSES)],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Status order berhasil diperbarui.',
            'order' => $this->mapOrder($order->fresh(['items', 'user']), true),
        ]);
    }

    public function adminProducts(Request $request): JsonResponse
    {
        $this->apiUserOrFail($request, true);

        return response()->json([
            'products' => Product::query()
                ->latest()
                ->get()
                ->map(fn (Product $product): array => $this->mapProduct($product))
                ->values(),
        ]);
    }

    public function storeAdminProduct(Request $request): JsonResponse
    {
        $this->apiUserOrFail($request, true);
        $product = Product::query()->create($this->productPayload($request));

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'product' => $this->mapProduct($product),
        ], 201);
    }

    public function updateAdminProduct(Request $request, Product $product): JsonResponse
    {
        $this->apiUserOrFail($request, true);
        $product->update($this->productPayload($request, $product->id));

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'product' => $this->mapProduct($product->fresh()),
        ]);
    }

    public function destroyAdminProduct(Request $request, Product $product): JsonResponse
    {
        $this->apiUserOrFail($request, true);

        if ($product->orderItems()->exists()) {
            $this->jsonError('Produk yang sudah ada dalam order tidak bisa dihapus.', 422);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    private function apiUserOrFail(Request $request, bool $admin = false): User
    {
        $record = $this->resolveTokenRecord($request);

        if (! $record || ! $record->user) {
            $this->jsonError('Unauthorized.', 401);
        }

        if ($record->expires_at->isPast()) {
            $record->delete();
            $this->jsonError('Token sudah kedaluwarsa.', 401);
        }

        if ($admin && ! $record->user->isAdmin()) {
            $this->jsonError('Forbidden.', 403);
        }

        return $record->user;
    }

    private function resolveTokenRecord(Request $request): ?AuthToken
    {
        $plainToken = $request->bearerToken();

        if (! $plainToken) {
            return null;
        }

        return AuthToken::query()
            ->with('user')
            ->where('token', hash('sha256', $plainToken))
            ->first();
    }

    private function issueToken(User $user): string
    {
        $plainToken = Str::random(64);

        $user->authTokens()->create([
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
        ]);

        return $plainToken;
    }

    /**
     * @return array<string, mixed>
     */
    private function productPayload(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'category' => ['required', Rule::in(Product::CATEGORIES)],
            'name' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:2000'],
            'price' => ['required', 'integer', 'min:0'],
            'originalPrice' => ['nullable', 'integer', 'min:0'],
            'rating' => ['required', 'numeric', 'between:0,5'],
            'stock' => ['required', 'integer', 'min:0'],
            'imageUrl' => ['required', 'string', 'max:255'],
            'isTrending' => ['nullable', 'boolean'],
            'isSale' => ['nullable', 'boolean'],
        ]);

        return [
            'slug' => $this->uniqueSlug($validated['name'], $ignoreId),
            'category' => $validated['category'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => (int) $validated['price'],
            'original_price' => $validated['originalPrice'] !== null ? (int) $validated['originalPrice'] : null,
            'rating' => (float) $validated['rating'],
            'stock' => (int) $validated['stock'],
            'image_url' => $validated['imageUrl'],
            'is_trending' => (bool) ($validated['isTrending'] ?? false),
            'is_sale' => (bool) ($validated['isSale'] ?? false),
        ];
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

    /**
     * @return array<string, mixed>
     */
    private function mapUser(User $user): array
    {
        return [
            'id' => $user->id,
            'fullName' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone ?? '',
            'gender' => $user->gender ?? 'unspecified',
            'birthDate' => $user->birth_date?->toDateString(),
            'avatarUrl' => $user->avatar_url ?? '',
            'address' => $user->address ?? '',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'kategori' => $product->category,
            'category' => $product->category,
            'namaProduk' => $product->name,
            'name' => $product->name,
            'description' => $product->description,
            'harga' => $this->formatRupiah($product->price),
            'price' => $product->price,
            'hargaAsli' => $product->original_price !== null ? $this->formatRupiah($product->original_price) : null,
            'originalPrice' => $product->original_price,
            'rating' => number_format((float) $product->rating, 1, '.', ''),
            'ratingNumber' => (float) $product->rating,
            'foto' => $product->image_url,
            'imageUrl' => $product->image_url,
            'stok' => $product->stock,
            'stock' => $product->stock,
            'isTrending' => (bool) $product->is_trending,
            'isSale' => (bool) $product->is_sale,
            'createdAt' => $product->created_at?->toIso8601String(),
            'updatedAt' => $product->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapLookbook(Lookbook $lookbook): array
    {
        return [
            'id' => $lookbook->id,
            'title' => $lookbook->title,
            'img' => $lookbook->image_url,
            'imageUrl' => $lookbook->image_url,
            'caption' => $lookbook->caption,
            'seasonLabel' => $lookbook->season_label,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapOrder(Order $order, bool $includeCustomer): array
    {
        $payload = [
            'id' => $order->id,
            'code' => $order->order_code,
            'status' => $order->status,
            'subtotal' => $order->subtotal,
            'subtotalFormatted' => $this->formatRupiah($order->subtotal),
            'shippingCost' => $order->shipping_cost,
            'shippingCostFormatted' => $this->formatRupiah($order->shipping_cost),
            'total' => $order->total_amount,
            'totalFormatted' => $this->formatRupiah($order->total_amount),
            'shippingMethod' => $order->shipping_method,
            'shippingAddress' => $order->shipping_address,
            'createdAt' => $order->created_at?->toIso8601String(),
            'updatedAt' => $order->updated_at?->toIso8601String(),
            'items' => $order->items->map(fn ($item): array => [
                'id' => $item->id,
                'productId' => $item->product_id,
                'namaProduk' => $item->product_name,
                'kategori' => $item->product_category,
                'harga' => $this->formatRupiah($item->unit_price),
                'price' => $item->unit_price,
                'quantity' => $item->quantity,
                'total' => $item->line_total,
                'totalFormatted' => $this->formatRupiah($item->line_total),
                'foto' => $item->image_url,
            ])->values(),
        ];

        if ($includeCustomer) {
            $payload['customer'] = [
                'id' => $order->user?->id,
                'name' => $order->user?->name,
                'email' => $order->user?->email,
            ];
        }

        return $payload;
    }

    private function formatRupiah(int $amount): string
    {
        return number_format($amount, 0, ',', '.');
    }

    private function jsonError(string $message, int $status): never
    {
        throw new HttpResponseException(response()->json([
            'message' => $message,
        ], $status));
    }
}
