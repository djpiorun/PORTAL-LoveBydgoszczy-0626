<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_chat_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('provider_label')->nullable();
            $table->string('base_url');
            $table->string('api_key')->nullable();
            $table->string('model');
            $table->text('system_prompt')->nullable();
            $table->boolean('is_enabled');
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chat_settings');
    }
};
