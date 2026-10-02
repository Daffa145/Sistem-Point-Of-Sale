<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KitchenOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'status',
        'started_at',
        'completed_at',
        'kitchen_notes',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
