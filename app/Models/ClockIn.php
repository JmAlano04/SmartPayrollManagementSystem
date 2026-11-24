<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clock_ins', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('match_confidence');
            $table->string('ip_address', 45)->nullable()->after('photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('clock_ins', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'ip_address']);
        });
    }
};