<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug');
            $table->string('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('status');
            $table->string('page_type');
            $table->boolean('is_visible_in_menu');
            $table->boolean('is_visible_in_footer');
            $table->unsignedInteger('order');
            $table->string('seo_title')->nullable();
            $table->string('seo_description')->nullable();
            $table->string('hero_image')->nullable();
            $table->boolean('is_deleted')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamp('publish_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('robots')->nullable();
            $table->string('og_title')->nullable();
            $table->string('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('status');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
