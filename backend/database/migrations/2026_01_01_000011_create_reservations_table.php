<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->foreignId('table_id')->constrained()->onDelete('cascade');
            $table->dateTime('reservation_time');
            $table->integer('guest_count')->default(2);
            $table->string('status')->default('confirmed'); // pending, confirmed, seated, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
