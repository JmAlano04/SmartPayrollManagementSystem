<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Optional: your dump shows a "add_photo_to_clock_ins_table" migration, but the
// clock_ins table in the dump has no photo column. This adds it only if missing.
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('clock_ins', 'photo')) {
            Schema::table('clock_ins', function (Blueprint $table) {
                $table->string('photo')->nullable()->after('match_confidence');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('clock_ins', 'photo')) {
            Schema::table('clock_ins', function (Blueprint $table) {
                $table->dropColumn('photo');
            });
        }
    }
};