<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['title', 'content', 'course_id', 'order'];

    // A module belongs to a course
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
