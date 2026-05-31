<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShippingController;

Route::get('/health', [ApiController::class, 'health']);
Route::get('/products', [ApiController::class, 'products']);
Route::get('/lookbooks', [ApiController::class, 'lookbooks']);

Route::post('/auth/register', [ApiController::class, 'register']);
Route::post('/auth/login', [ApiController::class, 'login']);
Route::get('/auth/me', [ApiController::class, 'me']);
Route::post('/auth/logout', [ApiController::class, 'logout']);

Route::get('/profile', [ApiController::class, 'profile']);
Route::put('/profile', [ApiController::class, 'updateProfile']);

Route::get('/orders', [ApiController::class, 'orders']);
Route::post('/orders', [ApiController::class, 'storeOrder']);

Route::get('/admin/summary', [ApiController::class, 'adminSummary']);
Route::get('/admin/orders', [ApiController::class, 'adminOrders']);
Route::patch('/admin/orders/{order}', [ApiController::class, 'updateAdminOrder']);
Route::get('/admin/products', [ApiController::class, 'adminProducts']);
Route::post('/admin/products', [ApiController::class, 'storeAdminProduct']);
Route::put('/admin/products/{product}', [ApiController::class, 'updateAdminProduct']);
Route::delete('/admin/products/{product}', [ApiController::class, 'destroyAdminProduct']);

// Fitur Integrasi API Ongkos Kirim
Route::get('/shipping/cities', [ShippingController::class, 'getCities']);
Route::post('/shipping/cost', [ShippingController::class, 'checkCost']);
