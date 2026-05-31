<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

// --- Rute Toko Publik ---
Route::get('/', [StorefrontController::class, 'home'])->name('store.home');
Route::get('/about', [StorefrontController::class, 'about'])->name('store.about');
Route::get('/category/{category}', [StorefrontController::class, 'category'])->name('store.category');
Route::get('/trending', [StorefrontController::class, 'trending'])->name('store.trending');
Route::get('/sale', [StorefrontController::class, 'sale'])->name('store.sale');
Route::get('/lookbook', [StorefrontController::class, 'lookbook'])->name('store.lookbook');

// --- Rute Khusus Guest ---
Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
    Route::post('/forgot-password', [AuthController::class, 'sendOtp'])->name('password.otp');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('password.verify');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
});

// --- Rute Keluar Akun ---
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// --- Rute Terproteksi Khusus Admin ---
// Pastikan kamu sudah membuat Middleware 'admin' untuk memvalidasi role admin
Route::middleware(['auth'])->group(function (): void {
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/admin/products', [AdminController::class, 'storeProduct'])->name('admin.products.store');
    Route::put('/admin/products/{product}', [AdminController::class, 'updateProduct'])->name('admin.products.update');
    Route::delete('/admin/products/{product}', [AdminController::class, 'destroyProduct'])->name('admin.products.destroy');
    Route::patch('/admin/orders/{order}', [AdminController::class, 'updateOrder'])->name('admin.orders.update');
});

// --- Rute Terproteksi User Biasa ---
Route::middleware('auth')->group(function (): void {
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/{product}', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{product}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{product}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::get('/checkout', [CartController::class, 'checkout'])->name('checkout.show');
    Route::post('/checkout', [CartController::class, 'placeOrder'])->name('checkout.store');
    Route::get('/profile', [AccountController::class, 'profile'])->name('account.profile');
    Route::put('/profile', [AccountController::class, 'update'])->name('account.profile.update');
    Route::get('/account/orders', [AccountController::class, 'orders'])->name('account.orders');
    Route::get('/orders/{id}/download-invoice', [AccountController::class, 'downloadInvoice'])->name('orders.download-invoice');

// Route CRUD untuk Lookbook
Route::get('/admin/lookbooks/{lookbook}/edit', [AdminController::class, 'editLookbook'])->name('admin.lookbooks.edit');
Route::post('/admin/lookbooks', [AdminController::class, 'storeLookbook'])->name('admin.lookbooks.store');
Route::put('/admin/lookbooks/{lookbook}', [AdminController::class, 'updateLookbook'])->name('admin.lookbooks.update');
Route::delete('/admin/lookbooks/{lookbook}', [AdminController::class, 'destroyLookbook'])->name('admin.lookbooks.destroy');
});