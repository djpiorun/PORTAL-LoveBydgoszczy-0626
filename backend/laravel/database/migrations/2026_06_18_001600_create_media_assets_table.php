<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('original_file_name')->nullable();
            $table->string('url');
            $table->string('storage_provider');
            $table->string('media_type');
            $table->string('source_kind');
            $table->string('source_entity_id')->nullable();
            $table->string('folder')->nullable();
            $table->json('tags')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index('created_at');
            $table->index('folder');
            $table->index('source_kind');
            $table->index('url');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
