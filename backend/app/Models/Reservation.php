<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'customer_name',
        'customer_phone',
        'table_id',
        'reservation_time',
        'guest_count',
        'status',
        'notes',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }
}
