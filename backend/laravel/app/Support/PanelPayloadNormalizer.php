<?php

namespace App\Support;

use Illuminate\Support\Facades\Schema;

class PanelPayloadNormalizer
{
    private const UI_FIELDS = [
        '_id',
        '_creationTime',
        'label_being_updated',
        'editingId',
        'editing_id',
        'tempId',
        'temp_id',
        'preview',
        'localOnly',
        'optimistic',
        'isSaving',
        'isLoading',
    ];

    private const EXPLICIT_MAP = [
        'label18_plus' => 'label_18_plus',
        'imageUrl' => 'image_url',
        'imageAuthor' => 'image_author',
        'mainImage' => 'main_image',
        'coverImage' => 'cover_image',
        'publishedAt' => 'published_at',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
        'authorId' => 'author_id',
        'authorUserId' => 'author_user_id',
        'categoryKey' => 'category_key',
        'entityId' => 'entity_id',
        'isPublished' => 'is_published',
        'isActive' => 'is_active',
        'isFeatured' => 'is_featured',
        'isMain' => 'is_main',
        'showOnHomepage' => 'show_on_homepage',
        'showInStories' => 'show_in_stories',
        'isPatronage' => 'is_patronage',
        'externalUrl' => 'external_url',
        'buttonText' => 'button_text',
        'buttonUrl' => 'button_url',
        'targetUrl' => 'target_url',
        'startsAt' => 'starts_at',
        'endsAt' => 'ends_at',
    ];

    public static function normalize(array $payload, string $table): array
    {
        $normalized = [];

        foreach ($payload as $key => $value) {
            if (in_array($key, self::UI_FIELDS, true)) {
                continue;
            }

            $normalizedKey = self::EXPLICIT_MAP[$key] ?? self::camelToSnake($key);
            $normalized[$normalizedKey] = $value;
        }

        $columns = Schema::getColumnListing($table);

        return array_intersect_key($normalized, array_flip($columns));
    }

    private static function camelToSnake(string $value): string
    {
        $value = preg_replace('/(?<!^)[A-Z]/', '_$0', $value);

        return strtolower($value);
    }
}
