<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'username',
        'username_lowercase',
        'slug',
        'image',
        'email',
        'password_hash',
        'password_updated_at',
        'email_verification_time',
        'is_anonymous',
        'role',
        'subtitle',
        'status',
        'description',
        'contact_email',
        'contact_phone',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'website_url',
        'cover_image',
        'is_love_bydgoszcz_team',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'password_updated_at' => 'datetime',
        'email_verification_time' => 'datetime',
        'is_anonymous' => 'boolean',
        'is_love_bydgoszcz_team' => 'boolean',
    ];
}
