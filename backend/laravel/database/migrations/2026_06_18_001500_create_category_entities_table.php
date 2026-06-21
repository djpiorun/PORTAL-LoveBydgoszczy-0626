<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_entities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('category_key');
            $table->string('entity_type');
            $table->string('name');
            $table->string('slug');
            $table->string('description')->nullable();
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->foreignUuid('parent_id')->nullable()->constrained('category_entities')->nullOnDelete();
            $table->string('external_ref')->nullable();
            $table->string('metadata')->nullable();
            $table->boolean('is_active');
            $table->unsignedInteger('order')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('category_key');
            $table->index('entity_type');
            $table->index(['category_key', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_entities');
    }
};
