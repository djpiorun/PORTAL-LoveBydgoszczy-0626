<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('partner_id')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->decimal('budget', 12, 2)->nullable();
            $table->string('status');
            $table->unsignedInteger('priority')->nullable();
            $table->unsignedInteger('view_limit')->nullable();
            $table->unsignedInteger('click_limit')->nullable();
            $table->json('placement_ids')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('ad_creatives', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type');
            $table->longText('content')->nullable();
            $table->string('target_url')->nullable();
            $table->foreignUuid('campaign_id')->nullable()->constrained('ad_campaigns')->nullOnDelete();
            $table->json('placements')->nullable();
            $table->unsignedInteger('views')->nullable();
            $table->unsignedInteger('clicks')->nullable();
            $table->boolean('is_active');
            $table->string('desktop_image_url')->nullable();
            $table->string('mobile_image_url')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
        });

        Schema::create('ad_placements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('system_name')->nullable();
            $table->text('description')->nullable();
            $table->string('dimensions')->nullable();
            $table->unsignedInteger('max_ads')->nullable();
            $table->string('type')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_active')->nullable();
            $table->boolean('rotation_enabled')->nullable();
            $table->timestamps();

            $table->index('system_name');
        });

        Schema::create('ad_partners', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('logo_url')->nullable();
            $table->string('website')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_person')->nullable();
            $table->text('description')->nullable();
            $table->text('cooperation_scope')->nullable();
            $table->string('status')->nullable();
            $table->string('type')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('show_in_slider')->nullable();
            $table->unsignedInteger('slider_order')->nullable();
            $table->string('category')->nullable();
            $table->timestamps();
        });

        Schema::create('ad_inquiries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('company_name');
            $table->string('contact_person')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('ad_type')->nullable();
            $table->string('budget')->nullable();
            $table->text('message');
            $table->string('status');
            $table->timestamp('created_at');
            $table->string('partner_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index('status');
        });

        Schema::create('ad_graphics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->unsignedBigInteger('size');
            $table->string('type');
            $table->string('storage_id');
            $table->string('url');
            $table->timestamp('created_at');
            $table->string('campaign_id')->nullable();
            $table->string('partner_id')->nullable();
            $table->json('tags')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('ad_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('is_module_enabled');
            $table->boolean('auto_rotation');
            $table->string('notification_email');
            $table->json('default_ad_sizes')->nullable();
            $table->json('ad_types')->nullable();
            $table->unsignedInteger('max_emissions_per_day')->nullable();
            $table->timestamps();
        });

        Schema::create('ad_pricing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('price');
            $table->string('unit');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_promotion')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_pricing');
        Schema::dropIfExists('ad_settings');
        Schema::dropIfExists('ad_graphics');
        Schema::dropIfExists('ad_inquiries');
        Schema::dropIfExists('ad_partners');
        Schema::dropIfExists('ad_placements');
        Schema::dropIfExists('ad_creatives');
        Schema::dropIfExists('ad_campaigns');
    }
};
