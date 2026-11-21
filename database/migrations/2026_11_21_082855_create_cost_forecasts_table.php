<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cost_forecasts', function (Blueprint $table) {
            $table->id();

            // The month being forecast. One row per month; regenerating replaces it.
            $table->date('period_start')->unique();
            $table->date('period_end');
            $table->unsignedTinyInteger('horizon')->default(1); // months ahead of the last paid run
            $table->string('method')->default('wma_headcount_v1');

            // Projected cost (same components as payslips)
            $table->unsignedInteger('projected_headcount')->default(0);
            $table->decimal('projected_base_pay', 14, 2)->default(0);
            $table->decimal('projected_overtime_pay', 14, 2)->default(0);
            $table->decimal('projected_allowances', 14, 2)->default(0);
            $table->decimal('projected_gross', 14, 2)->default(0);
            $table->decimal('projected_tax', 14, 2)->default(0);
            $table->decimal('projected_other_deductions', 14, 2)->default(0);
            $table->decimal('projected_net', 14, 2)->default(0);

            // ~80% range around projected_net
            $table->decimal('lower_bound_net', 14, 2)->default(0);
            $table->decimal('upper_bound_net', 14, 2)->default(0);
            $table->string('confidence', 10)->default('medium'); // low | medium | high
            $table->unsignedTinyInteger('history_months')->default(0);

            // Drivers used (headcount, tax rate, working days...) and the per-department split
            $table->json('assumptions')->nullable();
            $table->json('breakdown')->nullable();

            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_forecasts');
    }
};