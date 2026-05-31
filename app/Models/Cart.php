<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    // Tambahkan baris sakti di bawah ini untuk mengizinkan input data
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
    ];
}