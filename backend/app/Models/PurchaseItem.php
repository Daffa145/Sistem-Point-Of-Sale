<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'inventory_id',
        'quantity',
        'unit_cost',
        'subtotal',
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }
}
