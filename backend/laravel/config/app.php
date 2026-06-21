<?php

return [
    'name' => env('APP_NAME', 'Love Bydgoszcz Backend'),
    'env' => env('APP_ENV', 'local'),
    'debug' => (bool) env('APP_DEBUG', true),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'Europe/Warsaw',
    'locale' => 'pl',
    'fallback_locale' => 'en',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',

    'providers' => [
        Illuminate\Auth\AuthServiceProvider::class,
        Illuminate\Broadcasting\BroadcastServiceProvider::class,
        Illuminate\Bus\BusServiceProvider::class,
        Illuminate\Cache\CacheServiceProvider::class,
        Illuminate\Database\DatabaseServiceProvider::class,
        Illuminate\Database\MigrationServiceProvider::class,
        Illuminate\Filesystem\FilesystemServiceProvider::class,
        Illuminate\Hashing\HashServiceProvider::class,
        Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        Illuminate\Foundation\Providers\ArtisanServiceProvider::class,
        Illuminate\Foundation\Providers\ComposerServiceProvider::class,
        Illuminate\Queue\QueueServiceProvider::class,
        Illuminate\Validation\ValidationServiceProvider::class,
        Illuminate\View\ViewServiceProvider::class,
        Laravel\Sanctum\SanctumServiceProvider::class,
        App\Providers\AppServiceProvider::class,
    ],
];
