<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_method',
        'amount_paid',
        'change_amount',
        'transaction_reference',
        'status',
        'cashier_id',
    ];

    protected $casts = [
        'amount_paid' => 'float',
        'change_amount' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
