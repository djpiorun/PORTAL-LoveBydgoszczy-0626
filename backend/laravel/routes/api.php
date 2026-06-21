<?php

use App\Http\Controllers\AdsAdminController;
use App\Http\Controllers\AdsController;
use App\Http\Controllers\AdminCategoriesController;
use App\Http\Controllers\AdminCategoryEntitiesController;
use App\Http\Controllers\AdminMenuItemsController;
use App\Http\Controllers\AdminPagesController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminUsersController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\CategoryHeroConfigController;
use App\Http\Controllers\CategoryEntityController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GtfsController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\MatchResultController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\ObituaryController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PoliticianController;
use App\Http\Controllers\ReelController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SportTeamController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\UpdateController;
use App\Http\Controllers\UserProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::get('ads', [AdsController::class, 'index']);
Route::post('ads/track-click', [AdsController::class, 'trackClick']);
Route::post('ads/track-impression', [AdsController::class, 'trackImpression']);
Route::get('ads/partners', [AdsController::class, 'partners']);
Route::get('menu/nav', [MenuController::class, 'nav']);
Route::get('settings/footer', [SettingsController::class, 'footer']);
Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::get('reels', [ReelController::class, 'index']);
Route::get('reels/stories', [ReelController::class, 'stories']);
Route::post('reels/{id}/like', [ReelController::class, 'like']);
Route::get('sport-teams', [SportTeamController::class, 'index']);
Route::get('match-results/recent', [MatchResultController::class, 'recent']);
Route::get('stories/active', [StoryController::class, 'active']);
Route::get('updates', [UpdateController::class, 'index']);
Route::get('homepage-feed', [EventController::class, 'homepageFeed']);

Route::get('articles/slug/{slug}', [ArticleController::class, 'showBySlug']);
Route::get('articles/{article}/updates', [ArticleController::class, 'updates']);
Route::get('articles/{article}/poll-results', [ArticleController::class, 'pollResults']);
Route::post('articles/{article}/poll-votes', [ArticleController::class, 'submitPollVote']);
Route::apiResource('articles', ArticleController::class)->only(['index', 'show']);
Route::get('authors', [AuthorController::class, 'index']);
Route::get('authors/{identifier}', [AuthorController::class, 'show']);
Route::apiResource('events', EventController::class)->only(['index', 'show']);
Route::get('stories', [StoryController::class, 'index']);
Route::post('stories', [StoryController::class, 'store']);
Route::put('stories/{story}', [StoryController::class, 'update']);
Route::delete('stories/{story}', [StoryController::class, 'destroy']);
Route::prefix('gtfs')->group(function () {
    Route::get('metadata', [GtfsController::class, 'metadata']);
    Route::get('routes', [GtfsController::class, 'routes']);
    Route::get('routes/{routeId}', [GtfsController::class, 'routeDetails']);
    Route::get('stops/search', [GtfsController::class, 'stopSearch']);
    Route::get('stops/{stopId}', [GtfsController::class, 'stop']);
    Route::get('stops/{stopId}/departures', [GtfsController::class, 'stopDepartures']);
    Route::get('active-services', [GtfsController::class, 'activeServices']);
});
Route::get('obituaries', [ObituaryController::class, 'index']);
Route::post('obituaries', [ObituaryController::class, 'store']);
Route::get('obituaries/slug/{slug}', [ObituaryController::class, 'showBySlug']);
Route::get('investments', [InvestmentController::class, 'index']);
Route::get('investments/{slug}', [InvestmentController::class, 'show']);
Route::get('politicians', [PoliticianController::class, 'index']);
Route::get('politicians/{slug}', [PoliticianController::class, 'show']);
Route::get('sport-teams/{slug}', [SportTeamController::class, 'show']);
Route::get('pages/slug/{slug}', [PageController::class, 'showBySlug']);
Route::get('category-entities/{categoryKey}/{entityType}', [CategoryEntityController::class, 'index']);
Route::get('category-entities/{categoryKey}', [CategoryEntityController::class, 'index']);
Route::get('category-entities', [CategoryEntityController::class, 'index']);
Route::get('category-hero-config', [CategoryHeroConfigController::class, 'index']);
Route::get('media', [MediaController::class, 'index']);
Route::get('media/{mediaAsset}', [MediaController::class, 'show']);
Route::get('comments', [CommentController::class, 'index']);
Route::get('comments/count', [CommentController::class, 'count']);
Route::post('comments', [CommentController::class, 'store']);
Route::post('comments/{comment}/like', [CommentController::class, 'like']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('users/me', [UserProfileController::class, 'update']);
    Route::put('users/me/credentials', [UserProfileController::class, 'updateCredentials']);
    Route::apiResource('articles', ArticleController::class)->only(['store', 'update', 'destroy']);
    Route::post('articles/{article}/updates', [ArticleController::class, 'addUpdate']);
    Route::put('articles/{article}/updates/{update}', [ArticleController::class, 'updateUpdate']);
    Route::delete('articles/{article}/updates/{update}', [ArticleController::class, 'removeUpdate']);
    Route::apiResource('events', EventController::class)->only(['store', 'update', 'destroy']);
    Route::post('media/upload', [MediaController::class, 'store']);
    Route::prefix('admin/media-library')->group(function () {
        Route::get('assets', [MediaController::class, 'adminIndex']);
        Route::get('folders', [MediaController::class, 'folders']);
        Route::put('assets/{mediaAsset}', [MediaController::class, 'updateAsset']);
    });
    Route::prefix('admin/ads')->group(function () {
        Route::get('campaigns', [AdsAdminController::class, 'campaignsIndex']);
        Route::post('campaigns', [AdsAdminController::class, 'campaignsStore']);
        Route::put('campaigns/{campaign}', [AdsAdminController::class, 'campaignsUpdate']);
        Route::delete('campaigns/{campaign}', [AdsAdminController::class, 'campaignsDestroy']);
        Route::get('creatives', [AdsAdminController::class, 'creativesIndex']);
        Route::post('creatives', [AdsAdminController::class, 'creativesStore']);
        Route::put('creatives/{creative}', [AdsAdminController::class, 'creativesUpdate']);
        Route::delete('creatives/{creative}', [AdsAdminController::class, 'creativesDestroy']);
        Route::get('placements', [AdsAdminController::class, 'placementsIndex']);
        Route::post('placements', [AdsAdminController::class, 'placementsStore']);
        Route::put('placements/{placement}', [AdsAdminController::class, 'placementsUpdate']);
        Route::delete('placements/{placement}', [AdsAdminController::class, 'placementsDestroy']);
        Route::get('partners', [AdsAdminController::class, 'partnersIndex']);
        Route::post('partners', [AdsAdminController::class, 'partnersStore']);
        Route::put('partners/{partner}', [AdsAdminController::class, 'partnersUpdate']);
        Route::delete('partners/{partner}', [AdsAdminController::class, 'partnersDestroy']);
        Route::get('inquiries', [AdsAdminController::class, 'inquiriesIndex']);
        Route::put('inquiries/{inquiry}', [AdsAdminController::class, 'inquiriesUpdate']);
        Route::put('inquiries/{inquiry}/status', [AdsAdminController::class, 'inquiriesStatus']);
        Route::delete('inquiries/{inquiry}', [AdsAdminController::class, 'inquiriesDestroy']);
        Route::get('pricing', [AdsAdminController::class, 'pricingIndex']);
        Route::post('pricing', [AdsAdminController::class, 'pricingStore']);
        Route::put('pricing/{pricing}', [AdsAdminController::class, 'pricingUpdate']);
        Route::delete('pricing/{pricing}', [AdsAdminController::class, 'pricingDestroy']);
        Route::get('settings', [AdsAdminController::class, 'settingsShow']);
        Route::put('settings', [AdsAdminController::class, 'settingsUpdate']);
        Route::get('graphics', [AdsAdminController::class, 'graphicsIndex']);
        Route::post('graphics', [AdsAdminController::class, 'graphicsStore']);
        Route::delete('graphics/{graphic}', [AdsAdminController::class, 'graphicsDestroy']);
        Route::get('dashboard-stats', function () {
            return response()->json([
                'active_campaigns' => 0,
                'planned_campaigns' => 0,
                'active_creatives' => 0,
                'active_partners' => 0,
                'total_views' => 0,
                'total_clicks' => 0,
                'avg_ctr' => 0,
                'estimated_revenue' => 0,
                'top_campaigns' => [],
                'ending_soon' => [],
                'placement_occupancy' => [],
            ]);
        });
    });
    Route::prefix('admin')->group(function () {
        Route::get('settings', [AdminSettingsController::class, 'show']);
        Route::put('settings', [AdminSettingsController::class, 'update']);
        Route::get('gtfs/metadata', [AdminSettingsController::class, 'gtfsMetadata']);
        Route::post('gtfs/update', [AdminSettingsController::class, 'gtfsUpdate']);
        Route::get('pages/slug/{slug}', [PageController::class, 'adminShowBySlug']);
        Route::get('updates', [UpdateController::class, 'adminIndex']);
        Route::post('updates', [UpdateController::class, 'store']);
        Route::put('updates/{update}', [UpdateController::class, 'update']);
        Route::delete('updates/{update}', [UpdateController::class, 'destroy']);
    });

    Route::prefix('admin/menu-items')->group(function () {
        Route::get('/', [AdminMenuItemsController::class, 'index']);
        Route::post('/', [AdminMenuItemsController::class, 'store']);
        Route::post('seed', [AdminMenuItemsController::class, 'seed']);
        Route::put('{menuItem}', [AdminMenuItemsController::class, 'update']);
        Route::delete('{menuItem}', [AdminMenuItemsController::class, 'destroy']);
    });

    Route::prefix('admin/categories')->group(function () {
        Route::get('/', [AdminCategoriesController::class, 'index']);
        Route::post('/', [AdminCategoriesController::class, 'store']);
        Route::put('{category}', [AdminCategoriesController::class, 'update']);
        Route::delete('{category}', [AdminCategoriesController::class, 'destroy']);
    });

    Route::prefix('admin/category-entities')->group(function () {
        Route::get('/', [AdminCategoryEntitiesController::class, 'index']);
        Route::post('/', [AdminCategoryEntitiesController::class, 'store']);
        Route::put('{entity}', [AdminCategoryEntitiesController::class, 'update']);
        Route::delete('{entity}', [AdminCategoryEntitiesController::class, 'destroy']);
    });

    Route::prefix('admin/category-hero-config')->group(function () {
        Route::get('{categoryKey}', [CategoryHeroConfigController::class, 'show']);
        Route::put('{categoryKey}', [CategoryHeroConfigController::class, 'update']);
    });

    Route::prefix('admin/pages')->group(function () {
        Route::get('/', [AdminPagesController::class, 'index']);
        Route::post('/', [AdminPagesController::class, 'store']);
        Route::post('seed', [AdminPagesController::class, 'seed']);
        Route::get('{page}/versions', [AdminPagesController::class, 'versions']);
        Route::post('{page}/rollback', [AdminPagesController::class, 'rollback']);
        Route::post('{page}/duplicate', [AdminPagesController::class, 'duplicate']);
        Route::put('{page}/restore', [AdminPagesController::class, 'restore']);
        Route::put('{page}/archive', [AdminPagesController::class, 'archive']);
        Route::put('{page}/unarchive', [AdminPagesController::class, 'unarchive']);
        Route::delete('{page}/hard', [AdminPagesController::class, 'hardDelete']);
        Route::put('{page}', [AdminPagesController::class, 'update']);
        Route::delete('{page}', [AdminPagesController::class, 'destroy']);
    });
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [AdminUsersController::class, 'index']);
        Route::post('/', [AdminUsersController::class, 'store']);
        Route::put('{user}', [AdminUsersController::class, 'update']);
        Route::put('{user}/role', [AdminUsersController::class, 'updateRole']);
        Route::put('{user}/credentials', [AdminUsersController::class, 'updateCredentials']);
        Route::delete('{user}', [AdminUsersController::class, 'destroy']);
    });
    Route::get('comments/admin', [CommentController::class, 'adminIndex']);
    Route::put('comments/{comment}/status', [CommentController::class, 'updateStatus']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);
});
