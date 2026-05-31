<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        // Matikan proteksi relasi MySQL global
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // UBAH NAMA TABEL MENJADI transactions
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 40)->unique();
            $table->unsignedBigInteger('user_id'); 
            $table->string('status', 20)->default('pending');
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('shipping_cost')->default(0);
            $table->unsignedInteger('total_amount');
            $table->string('shipping_method', 20)->default('regular');
            $table->text('shipping_address');
            $table->timestamps();
        });

        // Hidupkan kembali proteksi relasi
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    public function down(): void { 
        Schema::dropIfExists('transactions'); 
    }
};