<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->string('image_url')->nullable();
            $table->string('location');
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->string('price')->nullable();
            $table->string('organizer')->nullable();
            $table->boolean('featured')->nullable();
            $table->timestamps();

            $table->index('category');
            $table->index('start_date');
            $table->index('featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
