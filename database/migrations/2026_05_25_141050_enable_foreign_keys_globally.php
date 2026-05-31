<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Nyalakan kembali proteksi setelah semua tabel aman terbuat
        DB::statement('SET GLOBAL foreign_key_checks = 1;');
        DB::statement('SET SESSION foreign_key_checks = 1;');
    }

    public function down(): void
    {
        DB::statement('SET GLOBAL foreign_key_checks = 0;');
        DB::statement('SET SESSION foreign_key_checks = 0;');
    }
};