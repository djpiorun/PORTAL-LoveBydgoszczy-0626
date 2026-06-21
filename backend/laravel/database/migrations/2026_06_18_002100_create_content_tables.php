<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('obituaries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('age')->nullable();
            $table->string('image')->nullable();
            $table->string('birth_date')->nullable();
            $table->string('death_date')->nullable();
            $table->string('city')->nullable();
            $table->string('profession')->nullable();
            $table->string('short_description')->nullable();
            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->string('funeral_date')->nullable();
            $table->string('funeral_time')->nullable();
            $table->string('funeral_place')->nullable();
            $table->string('cemetery_place')->nullable();
            $table->string('submitter_name')->nullable();
            $table->string('submitter_email')->nullable();
            $table->string('submitter_phone')->nullable();
            $table->string('submitter_relation')->nullable();
            $table->string('status');
            $table->boolean('featured')->nullable();
            $table->timestamp('created_at');
            $table->timestamp('published_at')->nullable();
            $table->string('slug');
            $table->timestamp('updated_at')->nullable();

            $table->index('status');
            $table->index('slug');
            $table->index('type');
            $table->index(['status', 'type']);
        });

        Schema::create('updates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('media_url')->nullable();
            $table->string('media_type')->nullable();
            $table->string('link_url')->nullable();
            $table->string('link_label')->nullable();
            $table->string('location')->nullable();
            $table->string('category')->nullable();
            $table->timestamp('published_at');
            $table->string('author')->nullable();
            $table->timestamps();

            $table->index('published_at');
            $table->index('category');
        });

        Schema::create('politicians', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('slug');
            $table->string('photo')->nullable();
            $table->string('party')->nullable();
            $table->string('position')->nullable();
            $table->text('bio')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('website_url')->nullable();
            $table->boolean('is_active')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('party');
        });

        Schema::create('sport_teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->string('slug');
            $table->string('logo')->nullable();
            $table->string('primary_color')->nullable();
            $table->string('secondary_color')->nullable();
            $table->string('sport_type');
            $table->string('league')->nullable();
            $table->string('city')->nullable();
            $table->string('stadium')->nullable();
            $table->string('founded')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_active')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('sport_type');
        });

        Schema::create('sport_players', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('slug');
            $table->foreignUuid('team_id')->nullable()->constrained('sport_teams')->nullOnDelete();
            $table->string('team_name')->nullable();
            $table->string('sport_type');
            $table->string('number')->nullable();
            $table->string('position')->nullable();
            $table->string('photo')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_active')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('team_id');
            $table->index('sport_type');
        });

        Schema::create('investments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('project_name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('project_status');
            $table->string('location')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->string('budget')->nullable();
            $table->string('contractor')->nullable();
            $table->string('investor')->nullable();
            $table->unsignedInteger('progress_percent')->nullable();
            $table->string('main_image_url')->nullable();
            $table->boolean('is_active')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('project_status');
        });

        Schema::create('category_hero_config', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('category_key');
            $table->string('item_id');
            $table->string('item_type');
            $table->unsignedInteger('order');
            $table->boolean('is_visible');
            $table->timestamps();

            $table->index('category_key');
            $table->index(['category_key', 'item_type']);
        });

        Schema::create('match_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('home_team_id')->nullable();
            $table->string('home_team_name');
            $table->string('home_team_logo')->nullable();
            $table->string('away_team_id')->nullable();
            $table->string('away_team_name');
            $table->string('away_team_logo')->nullable();
            $table->string('home_score');
            $table->string('away_score');
            $table->string('match_date');
            $table->string('league')->nullable();
            $table->string('round')->nullable();
            $table->string('sport_type');
            $table->string('match_status');
            $table->string('notes')->nullable();
            $table->string('linked_article_id')->nullable();
            $table->timestamps();

            $table->index('match_date');
            $table->index('sport_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_results');
        Schema::dropIfExists('category_hero_config');
        Schema::dropIfExists('investments');
        Schema::dropIfExists('sport_players');
        Schema::dropIfExists('sport_teams');
        Schema::dropIfExists('politicians');
        Schema::dropIfExists('updates');
        Schema::dropIfExists('obituaries');
    }
};
