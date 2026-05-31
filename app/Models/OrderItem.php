<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    // 🟢 SUDAH BENAR: Mengunci nama tabel detail sesuai database phpMyAdmin
    protected $table = 'transaction_details';

    protected $fillable = [
        'order_id',     // Foreign key ke tabel transactions
        'product_id',  // Foreign key ke tabel products
        'product_name', // Menyimpan nama produk saat transaksi untuk histori
        'product_category', // Menyimpan kategori produk saat transaksi untuk histori
        'unit_price',    // Menyimpan harga satuan saat transaksi untuk histori
        'quantity',
        'line_total',    // Menyimpan total harga untuk item ini (unit_price * quantity) saat transaksi untuk histori
        'image_url',    // Menyimpan URL gambar produk saat transaksi untuk histori
    ];

    /**
     * Relasi balik ke model Order (Tabel transactions)
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    /**
     * Relasi ke model Product (Tabel products)
     */
    public function product()
    {
        // Menghubungkan product_id di tabel detail dengan id di tabel products
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}