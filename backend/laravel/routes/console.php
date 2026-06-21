<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment('The backend is ready.');
})->purpose('Display an inspirational quote');
