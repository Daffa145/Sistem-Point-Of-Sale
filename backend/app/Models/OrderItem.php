<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_id',
        'quantity',
        'unit_price',
        'subtotal',
        'notes',
        'kitchen_status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'float',
        'subtotal' => 'float',
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}
