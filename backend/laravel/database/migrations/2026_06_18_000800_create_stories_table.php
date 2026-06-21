<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('cover_image');
            $table->string('author');
            $table->json('items');
            $table->boolean('is_active');
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
