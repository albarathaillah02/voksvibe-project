<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Models\Cart;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1. Memastikan folder cache view bawaan codingan temanmu tetap berjalan
        File::ensureDirectoryExists(config('view.compiled'));

        // 2. Bagikan data ke semua view blade secara global
        View::composer('*', function ($view): void {
            
            // Taktik Akurat: Jika user sudah login, hitung total QUANTITY asli dari database tabel carts
            if (Auth::check()) {
                $sharedCartCount = Cart::where('user_id', Auth::id())->sum('quantity');
            } else {
                // Jika belum login, fallback ke session bawaan temanmu agar tidak eror
                $cart = session('cart', []);
                $sharedCartCount = collect($cart)->sum();
            }

            // Kirim variabel $sharedCartCount ke navbar atas
            $view->with('sharedCartCount', $sharedCartCount);
            
            // Pertahankan menu navigasi kategori bawaan temanmu
            $view->with('categoryNavigation', [
                ['label' => 'T-Shirts', 'slug' => 't-shirts'],
                ['label' => 'Shirts', 'slug' => 'shirt'],
                ['label' => 'Hoodie', 'slug' => 'hoodie'],
                ['label' => 'Jacket', 'slug' => 'jacket'],
                ['label' => 'Accessory', 'slug' => 'accessory'],
            ]);
        });
    }
}