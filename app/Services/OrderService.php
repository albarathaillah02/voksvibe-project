<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Membuat pesanan baru untuk pengguna dengan integrasi biaya ongkir dinamis.
     */
    public function createForUser(User $user, array $items, string $shippingAddress, string $shippingMethod, $shippingCost = 0): Order
    {
        if ($items === []) {
            throw ValidationException::withMessages([
                'items' => 'Keranjang masih kosong.',
            ]);
        }

        // PERUBAHAN: Menghapus penentuan harga statis regular/express. 
        // Nilai $shippingCost sekarang langsung menggunakan data asli hasil hitung API RajaOngkir.
        $shippingCost = (int) $shippingCost;

        return DB::transaction(function () use ($items, $shippingAddress, $shippingMethod, $shippingCost, $user): Order {
            $productIds = collect($items)
                ->pluck('product_id')
                ->map(static fn ($id) => (int) $id)
                ->unique()
                ->values();

            $products = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $preparedItems = collect($items)->map(function (array $item) use ($products): array {
                $productId = (int) ($item['product_id'] ?? 0);
                $quantity = max(1, (int) ($item['quantity'] ?? 1));
                $product = $products->get($productId);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => "Produk dengan ID {$productId} tidak ditemukan.",
                    ]);
                }

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->name} tidak mencukupi.",
                    ]);
                }

                return [
                    'product' => $product,
                    'quantity' => $quantity,
                    'line_total' => $product->price * $quantity,
                ];
            });

            $subtotal = (int) $preparedItems->sum('line_total');

            // Menyimpan seluruh data pesanan, ongkir, dan kalkulasi grand total ke database
            $order = Order::query()->create([
                'order_code' => $this->buildOrderCode(),
                'user_id' => $user->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_amount' => $subtotal + $shippingCost, // Otomatis menjumlahkan Subtotal + Ongkir RajaOngkir
                'shipping_method' => $shippingMethod,
                'shipping_address' => $shippingAddress,
            ]);

            foreach ($preparedItems as $entry) {
                /** @var Product $product */
                $product = $entry['product'];
                $quantity = $entry['quantity'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_category' => $product->category,
                    'unit_price' => $product->price,
                    'quantity' => $quantity,
                    'line_total' => $entry['line_total'],
                    'image_url' => $product->image_url,
                ]);

                $product->decrement('stock', $quantity);
            }

            return $order->load(['items', 'user']);
        });
    }

    private function buildOrderCode(): string
    {
        do {
            $code = 'VKS-'.now()->format('ymdHis').'-'.random_int(1000, 9999);
        } while (Order::query()->where('order_code', $code)->exists());

        return $code;
    }
}