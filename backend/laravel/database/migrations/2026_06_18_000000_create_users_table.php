<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->nullable();
            $table->string('username')->nullable();
            $table->string('username_lowercase')->nullable();
            $table->string('slug')->nullable();
            $table->string('image')->nullable();
            $table->string('email')->nullable();
            $table->string('password_hash')->nullable();
            $table->timestamp('password_updated_at')->nullable();
            $table->timestamp('email_verification_time')->nullable();
            $table->boolean('is_anonymous')->nullable();
            $table->string('role')->default('user');
            $table->string('subtitle')->nullable();
            $table->string('status')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('website_url')->nullable();
            $table->string('cover_image')->nullable();
            $table->boolean('is_love_bydgoszcz_team')->nullable();
            $table->timestamps();

            $table->index('email');
            $table->index('name');
            $table->index('slug');
            $table->index('username_lowercase');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
