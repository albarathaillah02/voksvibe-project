<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Ganti namanya di sini:
        Schema::create('personal_tokens', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); 
            $table->string('token', 64)->unique();
            $table->timestamps();
        });
    }

    public function down(): void { 
        // Ganti namanya juga di sini:
        Schema::dropIfExists('personal_tokens'); 
    }
};