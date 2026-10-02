<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'table_id',
        'customer_id',
        'user_id',
        'order_type',
        'status',
        'subtotal',
        'tax',
        'service_charge',
        'discount',
        'total_amount',
        'payment_status',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax' => 'float',
        'service_charge' => 'float',
        'discount' => 'float',
        'total_amount' => 'float',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function kitchenOrder()
    {
        return $this->hasOne(KitchenOrder::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
