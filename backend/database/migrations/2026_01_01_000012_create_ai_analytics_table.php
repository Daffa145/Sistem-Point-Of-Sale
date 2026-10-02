<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_analytics', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // sales_forecast, inventory_alert, peak_hour_heatmap, cross_sell_recommendation
            $table->string('title');
            $table->text('insight_summary');
            $table->json('metrics_data')->nullable();
            $table->string('priority')->default('medium'); // low, medium, high, critical
            $table->boolean('is_actionable')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_analytics');
    }
};
