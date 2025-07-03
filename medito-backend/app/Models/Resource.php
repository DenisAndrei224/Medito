<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Resource extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'title',
        'description',
        'file_path',
        'url',
        'type',
    ];

    /**
     * A resource belongs to a teacher (user).
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * A resource can be assigned to many students.
     * The pivot table is 'resource_student'.
     * 'resource_id' is the foreign key on the pivot table for this model (Resource).
     * 'student_id' is the foreign key on the pivot table for the related model (User).
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'resource_student', 'resource_id', 'student_id');
    }
}
