<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('author')->nullable();
            $table->string('category')->nullable();
            $table->string('source_type');
            $table->string('video_url');
            $table->string('embed_url')->nullable();
            $table->unsignedInteger('likes')->nullable();
            $table->unsignedInteger('views')->nullable();
            $table->boolean('is_active');
            $table->boolean('show_in_stories')->nullable();
            $table->timestamp('published_at');
            $table->timestamps();

            $table->index('is_active');
            $table->index('category');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reels');
    }
};
