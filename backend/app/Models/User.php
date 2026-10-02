<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function createToken(string $name, array $abilities = ['*'])
    {
        if (class_exists(\Laravel\Sanctum\HasApiTokens::class)) {
            // If Sanctum loaded
            $tokenStr = \Illuminate\Support\Str::random(40);
            return new class($tokenStr) {
                public string $plainTextToken;
                public function __construct($t) { $this->plainTextToken = $t; }
            };
        }
        $tokenStr = \Illuminate\Support\Str::random(40);
        return new class($tokenStr) {
            public string $plainTextToken;
            public function __construct($t) { $this->plainTextToken = $t; }
        };
    }
}
