<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tax_bracket', function (Blueprint $table) {
               $table->id();
                $table->string('region')->default('default');
                $table->decimal('min_income', 12, 2);
                $table->decimal('max_income', 12, 2)->nullable();
                $table->decimal('rate_percent', 5, 2);
                $table->date('effective_from');
                $table->timestamps();
                $table->index(['region', 'effective_from']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_bracket');
    }
};
