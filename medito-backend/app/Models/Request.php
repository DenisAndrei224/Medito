<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'status',
    ];

    // Define the relationship with the sender user
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Define the relationship with the receiver user
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
