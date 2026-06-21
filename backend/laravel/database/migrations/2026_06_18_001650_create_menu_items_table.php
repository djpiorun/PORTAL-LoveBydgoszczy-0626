<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('label');
            $table->string('path');
            $table->string('icon');
            $table->string('tooltip')->nullable();
            $table->unsignedInteger('order');
            $table->boolean('is_active');
            $table->string('placement');
            $table->string('type');
            $table->foreignUuid('parent_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->boolean('show_when_scrolled')->nullable();
            $table->timestamps();

            $table->index('placement');
            $table->index('order');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
