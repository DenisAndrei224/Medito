<?php

namespace App\Models;

use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseEnrollment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'course_id',
        'student_id',
        'status',
        'completed_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'completed_at' => 'datetime',
    ];

    /**
     * Possible enrollment statuses.
     */
    public const STATUSES = [
        'pending' => 'Pending',
        'accepted' => 'Accepted',
        'rejected' => 'Rejected'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Mark enrollment as completed.
     */
    public function markAsCompleted()
    {
        $this->update(['completed_at' => now()]);
        return $this;
    }
}
