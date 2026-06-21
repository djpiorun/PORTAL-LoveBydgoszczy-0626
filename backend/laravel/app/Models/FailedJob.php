<?php

namespace App\Models;

class FailedJob extends BaseModel
{
    protected $table = 'failed_jobs';

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;
}
