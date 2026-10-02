<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('table_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Cashier/Waiter
            $table->string('order_type')->default('dine_in'); // dine_in, takeaway, qr_self_order
            $table->string('status')->default('pending'); // pending, sent_to_kitchen, preparing, ready, completed, cancelled
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0); // e.g. 10%
            $table->decimal('service_charge', 12, 2)->default(0); // e.g. 5%
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('unpaid'); // unpaid, paid, refunded
            $table->string('payment_method')->nullable(); // cash, qris, card, e-wallet
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->string('notes')->nullable(); // e.g. Less ice, extra espresso shot
            $table->string('kitchen_status')->default('pending'); // pending, cooking, ready, served
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
