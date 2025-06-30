<?php

namespace App\Models;

use App\Models\User;
use App\Models\Module;
use App\Models\CourseEnrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'title',
        'description',
        'thumbnail',
        'is_published'
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function students()
    {
        return $this->hasManyThrough(
            User::class,
            CourseEnrollment::class,
            'course_id', // Foreign key on enrollments table
            'id',        // Foreign key on users table
            'id',        // Local key on courses table
            'student_id' // Local key on enrollments table
        )->where('status', 'accepted');
    }
}
