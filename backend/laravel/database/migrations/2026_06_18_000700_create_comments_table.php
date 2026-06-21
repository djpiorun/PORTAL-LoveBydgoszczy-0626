<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('target_id');
            $table->string('target_type');
            $table->string('author_name');
            $table->text('content');
            $table->unsignedInteger('likes');
            $table->string('status')->nullable();
            $table->foreignUuid('parent_id')->nullable()->constrained('comments')->nullOnDelete();
            $table->timestamps();

            $table->index(['target_id', 'target_type']);
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
