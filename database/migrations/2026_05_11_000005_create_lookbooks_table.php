<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lookbooks', function (Blueprint $table) {
            $table->id();
            $table->string('title', 160);
            $table->string('image_url');
            $table->string('caption', 255);
            $table->string('season_label', 80);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lookbooks');
    }
};
