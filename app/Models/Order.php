<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // 🟢 KUNCI UTAMA 1: Paksa Eloquent membaca tabel utama 'transactions' sesuai phpMyAdmin Anda
    protected $table = 'transactions';

    // 🚀 SINKRONISASI 5 STATUS: Menampung status murni huruf kecil sesuai standar database Anda
    const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

    protected $fillable = [
        'user_id',
        'order_code',
        'status',
        'subtotal',
        'shipping_cost',
        'total_amount',
        'shipping_method',
        'shipping_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items()
    {
        // 🚀 KUNCI UTAMA 2: Diarahkan langsung ke Model detail pesanan Anda (OrderItem / nama model detail Anda).
        // Menggunakan foreign key 'transaction_id' dan local key 'id' murni dari struktur fisik phpMyAdmin Anda!
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }
}