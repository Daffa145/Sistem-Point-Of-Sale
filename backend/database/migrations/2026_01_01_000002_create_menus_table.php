<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('price', 12, 2);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_kitchen_item')->default(true);
            $table->integer('stock')->default(100);
            $table->integer('min_stock')->default(10);
            $table->string('unit')->default('pcs');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
