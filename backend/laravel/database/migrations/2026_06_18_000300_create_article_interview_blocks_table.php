<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_interview_blocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('article_id')->constrained('articles')->cascadeOnDelete();
            $table->unsignedInteger('order');
            $table->string('type');
            $table->longText('content');
            $table->string('title')->nullable();
            $table->string('speaker_id')->nullable();
            $table->boolean('hidden')->nullable();
            $table->timestamps();

            $table->index('article_id');
            $table->index(['article_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_interview_blocks');
    }
};
