<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('excerpt');
            $table->longText('content');
            $table->string('category');
            $table->string('image_url')->nullable();
            $table->string('image_author')->nullable();
            $table->string('author');
            $table->foreignUuid('author_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('coauthor')->nullable();
            $table->foreignUuid('coauthor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at');
            $table->boolean('featured')->nullable();
            $table->boolean('is_patronage')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('hide_in_reels')->nullable();
            $table->boolean('skip_homepage')->nullable();
            $table->unsignedInteger('likes')->nullable();
            $table->string('person_name')->nullable();
            $table->json('bydgoszczanie')->nullable();
            $table->string('source_name')->nullable();
            $table->string('source_url')->nullable();
            $table->text('expert_quote')->nullable();
            $table->string('slug')->nullable();
            $table->boolean('label_urgent')->nullable();
            $table->boolean('label_important')->nullable();
            $table->boolean('label_our_news')->nullable();
            $table->boolean('label_must_know')->nullable();
            $table->boolean('label_author_article')->nullable();
            $table->boolean('label_18_plus')->nullable();
            $table->boolean('label_depresja')->nullable();
            $table->text('bibliography')->nullable();
            $table->text('sources')->nullable();
            $table->text('footer_info')->nullable();
            $table->string('source_from_contact')->nullable();
            $table->string('article_type')->nullable();
            $table->string('article_template')->nullable();
            $table->string('status')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->string('layout')->nullable();
            $table->string('partner_name')->nullable();
            $table->string('partner_url')->nullable();
            $table->string('partner_logo_url')->nullable();
            $table->string('partner_label')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->boolean('allow_comments')->nullable();
            $table->boolean('show_updates')->nullable();
            $table->string('graphics_layout')->nullable();
            $table->string('category_layout')->nullable();
            $table->json('article_elements')->nullable();
            $table->string('coauthor2')->nullable();
            $table->string('coauthor3')->nullable();
            $table->string('corrector')->nullable();
            $table->string('publisher')->nullable();
            $table->string('author_footer_style')->nullable();
            $table->json('poll')->nullable();
            $table->json('quiz')->nullable();
            $table->json('interview')->nullable();
            $table->json('analysis')->nullable();
            $table->json('report')->nullable();
            $table->json('opinion')->nullable();
            $table->json('dialog')->nullable();
            $table->json('announcement')->nullable();
            $table->json('sponsored')->nullable();
            $table->json('sport')->nullable();
            $table->json('politics')->nullable();
            $table->json('investment')->nullable();
            $table->json('our_actions')->nullable();
            $table->timestamps();

            $table->index('category');
            $table->index('featured');
            $table->index('published_at');
            $table->index('author');
            $table->index('is_patronage');
            $table->index('status');
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
