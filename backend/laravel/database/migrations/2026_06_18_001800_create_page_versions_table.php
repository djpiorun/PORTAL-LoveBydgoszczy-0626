<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('page_id')->constrained('pages')->cascadeOnDelete();
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
            $table->string('source');
            $table->foreignUuid('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('restored_from_version_id')->nullable()->constrained('page_versions')->nullOnDelete();
            $table->boolean('is_deleted')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('robots')->nullable();
            $table->string('og_title')->nullable();
            $table->string('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamp('publish_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['page_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_versions');
    }
};
