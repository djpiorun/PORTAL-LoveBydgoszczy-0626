<?php

namespace App\Models;

class ArticlePollVote extends BaseModel
{
    protected $table = 'article_poll_votes';

    protected $casts = [
        'selections' => 'array',
    ];
}
