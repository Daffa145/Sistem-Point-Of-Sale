<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Table 01, VIP 1, Outdoor 3
            $table->string('code')->unique();
            $table->integer('capacity')->default(4);
            $table->string('status')->default('available'); // available, occupied, reserved, maintenance
            $table->string('area')->default('Indoor'); // Indoor, Outdoor, VIP, Bar
            $table->string('qr_code')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
