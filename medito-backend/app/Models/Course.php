<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['title', 'description', 'teacher_id'];

    // A course belongs to a teacher (User with role 'teacher')
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    // A course has many modules
    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    // Students enrolled in this course (many-to-many)
    public function students()
    {
        return $this->belongsToMany(User::class, 'course_student', 'course_id', 'student_id');
    }
}
