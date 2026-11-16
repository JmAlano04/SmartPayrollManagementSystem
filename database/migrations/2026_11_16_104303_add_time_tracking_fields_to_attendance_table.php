<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->string('status')->default('present');
            $table->text('remarks')->nullable();
        });

        DB::table('attendance')
            ->where('is_paid_leave', true)
            ->update(['status' => 'on_leave']);

        DB::table('attendance')
            ->where('is_paid_leave', false)
            ->where('is_absent', true)
            ->update(['status' => 'absent']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropColumn(['time_in', 'time_out', 'status', 'remarks']);
        });
    }
};
