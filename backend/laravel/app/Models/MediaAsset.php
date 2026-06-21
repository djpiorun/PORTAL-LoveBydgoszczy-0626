<?php

namespace App\Models;

class MediaAsset extends BaseModel
{
    protected $table = 'media_assets';

    protected $casts = [
        'tags' => 'array',
        'last_used_at' => 'datetime',
    ];
}
