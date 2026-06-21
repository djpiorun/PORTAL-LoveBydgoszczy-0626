<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key');
            $table->string('label');
            $table->string('description')->nullable();
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->string('type')->nullable();
            $table->string('route_slug')->nullable();
            $table->json('subcategories')->nullable();
            $table->unsignedInteger('order');
            $table->boolean('is_active');
            $table->boolean('is_default')->nullable();
            $table->timestamps();

            $table->index('key');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_settings');
    }
};
