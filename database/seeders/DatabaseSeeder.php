<?php

namespace Database\Seeders;

use App\Models\Lookbook;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Tambahkan ini agar aman menggunakan facade DB

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate([
            'email' => 'admin@voksvibe.local1',
        ], [
            'name' => 'Voksvibe Admin',
            'username' => 'adminvoksvibe',
            'password' => 'admin12345',
            'role' => User::ROLE_ADMIN,
            'phone' => '081234567890',
            'gender' => 'unspecified',
            'address' => 'Studio VOKSVIBE, Malang, Jawa Timur',
        ]);

        $user = User::query()->updateOrCreate([
            'email' => 'user@voksvibe.local',
        ], [
            'name' => 'Voksvibe User',
            'username' => 'uservoksvibe',
            'password' => 'user12345',
            'role' => User::ROLE_USER,
            'phone' => '089876543210',
            'gender' => 'male',
            'address' => 'Jl. Veteran No. 1, Malang',
        ]);

        $products = [
            ['slug' => 'hoodie-gray-premium', 'category' => 'HOODIE', 'name' => 'HOODIE GRAY PREMIUM', 'description' => 'Hoodie premium streetwear dengan bahan fleece lembut dan potongan relaxed fit.', 'price' => 200000, 'original_price' => 250000, 'rating' => 4.5, 'stock' => 16, 'image_url' => '/produk1hoodie.jpg', 'is_trending' => false, 'is_sale' => true],
            ['slug' => 'green-shirt-vibe', 'category' => 'SHIRT', 'name' => 'GREEN SHIRT VIBE', 'description' => 'Kemeja street casual warna hijau dengan siluet clean untuk daily wear kampus.', 'price' => 250000, 'original_price' => null, 'rating' => 4.8, 'stock' => 12, 'image_url' => '/produk2kemeja.jpg', 'is_trending' => true, 'is_sale' => false],
            ['slug' => 'black-basic-t-shirt', 'category' => 'T-SHIRT', 'name' => 'BLACK BASIC T - SHIRT', 'description' => 'Kaos basic oversized warna hitam dengan feel ringan dan breathable.', 'price' => 150000, 'original_price' => 180000, 'rating' => 4.9, 'stock' => 25, 'image_url' => '/produk3.jpg', 'is_trending' => true, 'is_sale' => true],
            ['slug' => 'white-vibe-shirt', 'category' => 'T-SHIRT', 'name' => 'WHITE VIBE SHIRT', 'description' => 'Kaos putih clean-look dengan branding minimal dan detail jahitan rapi.', 'price' => 150000, 'original_price' => null, 'rating' => 4.7, 'stock' => 18, 'image_url' => '/produk4kaosputih.jpg', 'is_trending' => false, 'is_sale' => false],
            ['slug' => 'voksvibe-bomber', 'category' => 'JACKET', 'name' => 'VOKSVIBE BOMBER', 'description' => 'Jaket bomber khas VOKSVIBE dengan padding ringan dan struktur tegas.', 'price' => 350000, 'original_price' => 420000, 'rating' => 5.0, 'stock' => 8, 'image_url' => '/produk5jaketbomber.jpg', 'is_trending' => true, 'is_sale' => true],
            ['slug' => 'raw-denim-jacket', 'category' => 'JACKET', 'name' => 'RAW DENIM JACKET', 'description' => 'Jaket denim raw dengan potongan boxy yang cocok untuk layered styling.', 'price' => 315000, 'original_price' => 450000, 'rating' => 4.6, 'stock' => 6, 'image_url' => '/produk1outerwear.jpg', 'is_trending' => false, 'is_sale' => true],
            ['slug' => 'voks-tee-oversize', 'category' => 'T-SHIRT', 'name' => 'VOKS-TEE OVERSIZE', 'description' => 'Kaos oversize signature VOKSVIBE untuk tampilan urban yang effortless.', 'price' => 120000, 'original_price' => 180000, 'rating' => 4.4, 'stock' => 20, 'image_url' => '/produk4kaosputih.jpg', 'is_trending' => false, 'is_sale' => true],
            ['slug' => 'vibe-totebag', 'category' => 'ACCESSORY', 'name' => 'VIBE TOTEBAG', 'description' => 'Totebag canvas untuk kebutuhan harian dengan desain clean street aesthetic.', 'price' => 45000, 'original_price' => 90000, 'rating' => 4.3, 'stock' => 30, 'image_url' => '/Shop-now@3x.png', 'is_trending' => false, 'is_sale' => true],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                $product,
            );
        }

        $lookbooks = [
            ['title' => 'TECHNOVIBE', 'image_url' => '/techno model.jpeg', 'caption' => 'Captured at Universitas Brawijaya.', 'season_label' => 'Volume 01 / 2026'],
            ['title' => 'Urban Movement', 'image_url' => '/model 2.jpg', 'caption' => 'Clean silhouettes for campus movement.', 'season_label' => 'Volume 01 / 2026'],
            ['title' => 'Campus Rebel', 'image_url' => '/model 3.jpeg', 'caption' => 'Streetwear essentials with bold layering.', 'season_label' => 'Volume 01 / 2026'],
            ['title' => 'Night Vibe', 'image_url' => '/Rectangle-3@2x.png', 'caption' => 'Editorial mood for after-hours styling.', 'season_label' => 'Volume 01 / 2026'],
        ];

        foreach ($lookbooks as $lookbook) {
            Lookbook::query()->updateOrCreate(
                ['title' => $lookbook['title']],
                $lookbook,
            );
        }

        // Taktik Penyelamat: Cek data langsung menggunakan nama tabel baru 'transactions'
        if (DB::table('transactions')->count() === 0) {
            
            // Masukkan data order ke dalam tabel transactions
            $orderId = DB::table('transactions')->insertGetId([
                'order_code' => 'VKS-DEMO-1001',
                'user_id' => $user->id,
                'status' => 'paid',
                'subtotal' => 500000,
                'shipping_cost' => 15000,
                'total_amount' => 515000,
                'shipping_method' => 'regular',
                'shipping_address' => 'Jl. Veteran No. 1, Malang',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $seedProducts = Product::query()->whereIn('slug', ['black-basic-t-shirt', 'voksvibe-bomber'])->get()->keyBy('slug');

            foreach ([
                ['slug' => 'black-basic-t-shirt', 'quantity' => 1],
                ['slug' => 'voksvibe-bomber', 'quantity' => 1],
            ] as $item) {
                $product = $seedProducts[$item['slug']];

                // Masukkan data item ke dalam nama tabel baru 'transaction_details'
                DB::table('transaction_details')->insert([
                    'order_id' => $orderId,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_category' => $product->category,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'line_total' => $product->price * $item['quantity'],
                    'image_url' => $product->image_url,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}