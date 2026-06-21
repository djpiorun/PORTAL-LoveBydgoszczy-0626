<?php

namespace App\Models;

class Article extends BaseModel
{
    protected $table = 'articles';

    protected $casts = [
        'tags' => 'array',
        'bydgoszczanie' => 'array',
        'article_elements' => 'array',
        'poll' => 'array',
        'quiz' => 'array',
        'interview' => 'array',
        'analysis' => 'array',
        'report' => 'array',
        'opinion' => 'array',
        'dialog' => 'array',
        'announcement' => 'array',
        'sponsored' => 'array',
        'sport' => 'array',
        'politics' => 'array',
        'investment' => 'array',
        'our_actions' => 'array',
    ];
}
