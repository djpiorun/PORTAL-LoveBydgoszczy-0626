<?php

namespace App\Models;

class CategorySetting extends BaseModel
{
    protected $table = 'category_settings';

    protected $casts = [
        'subcategories' => 'array',
    ];
}
