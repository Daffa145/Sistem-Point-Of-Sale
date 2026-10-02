<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'sku',
        'category',
        'quantity',
        'unit',
        'min_stock',
        'unit_cost',
        'supplier_id',
    ];

    protected $casts = [
        'quantity' => 'float',
        'min_stock' => 'float',
        'unit_cost' => 'float',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
