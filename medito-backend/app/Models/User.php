<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_STUDENT = 'student';
    const ROLE_TEACHER = 'teacher';
    const ROLE_ADMIN = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'fullName',
        'email',
        'password',
        'role',
        'avatar'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];



    // Entity relationship between Posts and User (A user has many posts)
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password'] = Hash::make($value);
    }

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            // First, check if the avatar field itself already contains a full URL.
            // This handles any remaining legacy incorrect entries directly.
            if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
                return $this->avatar;
            }

            // Generate the URL using Laravel's Storage::url()
            $generatedUrl = Storage::url($this->avatar);

            // If the generated URL starts with '/storage/' (meaning it's relative
            // and missing the domain part due to the APP_URL issue),
            // manually prepend the APP_URL from configuration.
            if (str_starts_with($generatedUrl, '/storage/')) {
                // config('app.url') should reliably give you 'http://localhost:8000'
                return config('app.url') . $generatedUrl;
            }

            // Otherwise, return the URL as Storage::url() generated it.
            // This handles cases where it might already be absolute or other unexpected formats.
            return $generatedUrl;
        }

        // If 'avatar' field is null, return the default avatar URL
        return asset('images/default-avatar.jpg');
    }
}
