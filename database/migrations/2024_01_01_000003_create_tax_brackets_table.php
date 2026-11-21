<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_brackets', function (Blueprint $table) {
            $table->id();
            $table->string('region')->default('PH');
            $table->decimal('min_income', 12, 2);
            $table->decimal('max_income', 12, 2)->nullable();
            $table->decimal('rate_percent', 5, 2);
            $table->date('effective_from');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_brackets');
    }
};
