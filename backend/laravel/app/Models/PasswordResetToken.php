<?php

namespace App\Models;

class PasswordResetToken extends BaseModel
{
    protected $table = 'password_reset_tokens';

    protected $primaryKey = 'email';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;
}
