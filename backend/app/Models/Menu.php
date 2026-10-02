<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'price',
        'cost_price',
        'description',
        'image',
        'is_available',
        'is_kitchen_item',
        'stock',
        'min_stock',
        'unit'
    ];

    protected $casts = [
        'price' => 'float',
        'cost_price' => 'float',
        'is_available' => 'boolean',
        'is_kitchen_item' => 'boolean',
        'stock' => 'integer',
        'min_stock' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
