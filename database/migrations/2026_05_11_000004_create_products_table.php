<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('category', 50);
            $table->string('name', 160);
            $table->text('description');
            $table->unsignedInteger('price');
            $table->unsignedInteger('original_price')->nullable();
            $table->decimal('rating', 3, 1)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->string('image_url');
            $table->boolean('is_trending')->default(false);
            $table->boolean('is_sale')->default(false);
            $table->timestamps();

            $table->index('category');
            $table->index('is_trending');
            $table->index('is_sale');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
