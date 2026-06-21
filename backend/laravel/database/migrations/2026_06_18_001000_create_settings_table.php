<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('portal_name');
            $table->string('seo_description');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->string('contact_address');
            $table->string('footer_description')->nullable();
            $table->string('footer_location_line1')->nullable();
            $table->string('footer_location_line2')->nullable();
            $table->string('footer_bottom_note')->nullable();
            $table->string('facebook_url');
            $table->string('instagram_url');
            $table->string('youtube_url');
            $table->string('twitter_url');
            $table->boolean('r2_enabled')->nullable();
            $table->string('r2_account_id')->nullable();
            $table->string('r2_access_key_id')->nullable();
            $table->string('r2_secret_access_key')->nullable();
            $table->string('r2_bucket_name')->nullable();
            $table->string('r2_public_base_url')->nullable();
            $table->unsignedInteger('media_max_width')->nullable();
            $table->unsignedInteger('media_quality')->nullable();
            $table->boolean('media_convert_to_webp')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
