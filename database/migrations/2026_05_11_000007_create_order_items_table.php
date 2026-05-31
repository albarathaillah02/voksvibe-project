<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        // Matikan sensor proteksi MySQL secara total
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // NAMA TABEL BARU: transaction_details
        Schema::create('transaction_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id'); 
            $table->unsignedBigInteger('product_id'); 
            $table->string('product_name', 160);
            $table->string('product_category', 50);
            $table->unsignedInteger('unit_price');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('line_total');
            $table->string('image_url', 255);
            $table->timestamps();
        });

        // Hidupkan kembali sensor proteksi
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    public function down(): void { 
        Schema::dropIfExists('transaction_details'); 
    }
};