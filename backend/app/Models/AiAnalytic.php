<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiAnalytic extends Model
{
    use HasFactory;

    protected $table = 'ai_analytics';

    protected $fillable = [
        'type',
        'title',
        'insight_summary',
        'metrics_data',
        'priority',
        'is_actionable',
    ];

    protected $casts = [
        'metrics_data' => 'array',
        'is_actionable' => 'boolean',
    ];
}
