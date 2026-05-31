<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Matikan pengecekan foreign key agar tidak tabrakan dengan tabel users & products
        Schema::disableForeignKeyConstraints();

        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // 2. Aktifkan kembali pengecekan foreign key saat rollback/drop
        Schema::enableForeignKeyConstraints();

        Schema::dropIfExists('carts');
    }
};