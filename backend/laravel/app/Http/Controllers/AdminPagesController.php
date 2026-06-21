<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageVersion;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AdminPagesController extends Controller
{
    public function index()
    {
        $pages = Page::query()->orderBy('order')->get();

        return response()->json(['data' => $pages]);
    }

    public function store(Request $request)
    {
        $payload = $this->normalizePayload($request);
        $payload['id'] = (string) Str::uuid();

        $page = Page::create($payload);

        $this->recordVersion($page, $request, $request->input('save_source'));

        return response()->json(['data' => $page], 201);
    }

    public function update(Request $request, string $page)
    {
        $payload = $this->normalizePayload($request);
        $record = Page::query()->findOrFail($page);

        $record->update($payload);
        $record->refresh();

        $this->recordVersion($record, $request, $request->input('save_source'));

        return response()->json(['data' => $record]);
    }

    public function destroy(string $page)
    {
        $record = Page::query()->findOrFail($page);

        $record->update([
            'is_deleted' => true,
            'deleted_at' => now(),
        ]);

        $this->recordVersion($record, null, 'delete');

        return response()->json(null, 204);
    }

    public function restore(string $page)
    {
        $record = Page::query()->findOrFail($page);

        $record->update([
            'is_deleted' => false,
            'deleted_at' => null,
        ]);

        $record->refresh();
        $this->recordVersion($record, null, 'restore');

        return response()->json(['data' => $record]);
    }

    public function archive(string $page)
    {
        $record = Page::query()->findOrFail($page);

        $record->update([
            'archived_at' => now(),
        ]);

        $record->refresh();
        $this->recordVersion($record, null, 'archive');

        return response()->json(['data' => $record]);
    }

    public function unarchive(string $page)
    {
        $record = Page::query()->findOrFail($page);

        $record->update([
            'archived_at' => null,
        ]);

        $record->refresh();
        $this->recordVersion($record, null, 'unarchive');

        return response()->json(['data' => $record]);
    }

    public function duplicate(Request $request, string $page)
    {
        $record = Page::query()->findOrFail($page);
        $duplicate = $record->replicate();
        $duplicate->id = (string) Str::uuid();
        $duplicate->slug = $this->uniqueSlug($record->slug);
        $duplicate->title = sprintf('%s (kopia)', $record->title);
        $duplicate->status = 'draft';
        $duplicate->is_visible_in_menu = false;
        $duplicate->is_visible_in_footer = false;
        $duplicate->is_deleted = false;
        $duplicate->deleted_at = null;
        $duplicate->archived_at = null;
        $duplicate->publish_at = null;
        $duplicate->created_at = now();
        $duplicate->updated_at = now();
        $duplicate->save();

        $this->recordVersion($duplicate, $request, 'duplicate');

        return response()->json(['data' => $duplicate]);
    }

    public function seed()
    {
        $existing = Page::query()->orderBy('order')->get();
        if ($existing->isNotEmpty()) {
            return response()->json([
                'data' => [
                    'skipped' => true,
                    'items' => $existing,
                ],
            ]);
        }

        $defaults = [
            [
                'title' => 'O nas',
                'slug' => 'o-nas',
                'excerpt' => 'Poznaj historię Love Bydgoszcz.',
                'content' => '<p>Love Bydgoszcz to portal lokalny tworzony przez pasjonatów miasta.</p>',
                'status' => 'published',
                'page_type' => 'about',
                'is_visible_in_menu' => true,
                'is_visible_in_footer' => true,
                'order' => 1,
                'seo_title' => 'O nas',
                'seo_description' => 'Poznaj historię Love Bydgoszcz.',
            ],
            [
                'title' => 'Kontakt',
                'slug' => 'kontakt',
                'excerpt' => 'Skontaktuj się z redakcją Love Bydgoszcz.',
                'content' => '<p>Masz pytania? Napisz do nas!</p>',
                'status' => 'published',
                'page_type' => 'contact',
                'is_visible_in_menu' => true,
                'is_visible_in_footer' => true,
                'order' => 2,
                'seo_title' => 'Kontakt',
                'seo_description' => 'Skontaktuj się z redakcją Love Bydgoszcz.',
            ],
            [
                'title' => 'Regulamin',
                'slug' => 'regulamin',
                'excerpt' => 'Zapoznaj się z zasadami korzystania z portalu.',
                'content' => '<p>Regulamin portalu Love Bydgoszcz.</p>',
                'status' => 'published',
                'page_type' => 'legal',
                'is_visible_in_menu' => false,
                'is_visible_in_footer' => true,
                'order' => 3,
                'seo_title' => 'Regulamin',
                'seo_description' => 'Regulamin portalu Love Bydgoszcz.',
            ],
        ];

        $pages = collect($defaults)->map(function (array $page) {
            $page['id'] = (string) Str::uuid();
            $page['created_at'] = now();
            $page['updated_at'] = now();

            return Page::create($page);
        });

        $pages->each(function (Page $page) {
            $this->recordVersion($page, null, 'seed');
        });

        return response()->json([
            'data' => [
                'skipped' => false,
                'items' => $pages,
            ],
        ], 201);
    }

    public function versions(string $page)
    {
        $versions = PageVersion::query()
            ->where('page_id', $page)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $versions]);
    }

    public function rollback(Request $request, string $page)
    {
        $versionId = $request->input('version_id');
        $version = PageVersion::query()->where('page_id', $page)->findOrFail($versionId);
        $record = Page::query()->findOrFail($page);

        $record->update($this->payloadFromVersion($version));
        $record->refresh();

        $this->recordVersion($record, $request, 'rollback', $version->id);

        return response()->json(['data' => $record]);
    }

    public function hardDelete(Request $request, string $page)
    {
        $record = Page::query()->findOrFail($page);
        $confirmation = (string) $request->input('confirmation_slug');

        if ($confirmation !== $record->slug) {
            return response()->json(['message' => 'Invalid confirmation slug'], 422);
        }

        PageVersion::query()->where('page_id', $page)->delete();
        $record->delete();

        return response()->json(null, 204);
    }

    private function normalizePayload(Request $request): array
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Page())->getTable());

        foreach (['publish_at', 'archived_at', 'deleted_at'] as $column) {
            if (! array_key_exists($column, $payload)) {
                continue;
            }
            $payload[$column] = $this->normalizeTimestamp($payload[$column]);
        }

        return $payload;
    }

    private function normalizeTimestamp($value): ?Carbon
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            $numeric = (int) $value;

            if ($numeric > 1000000000000) {
                return Carbon::createFromTimestampMs($numeric);
            }

            return Carbon::createFromTimestamp($numeric);
        }

        return Carbon::parse($value);
    }

    private function recordVersion(Page $page, ?Request $request = null, ?string $source = null, ?string $restoredFromVersionId = null): void
    {
        $payload = $this->payloadFromPage($page, $source ?? $request?->input('save_source') ?? 'manual', $request?->user()?->id, $restoredFromVersionId);

        PageVersion::create($payload);
    }

    private function payloadFromPage(Page $page, string $source, ?string $userId = null, ?string $restoredFromVersionId = null): array
    {
        return [
            'id' => (string) Str::uuid(),
            'page_id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'excerpt' => $page->excerpt,
            'content' => $page->content,
            'status' => $page->status,
            'page_type' => $page->page_type,
            'is_visible_in_menu' => $page->is_visible_in_menu,
            'is_visible_in_footer' => $page->is_visible_in_footer,
            'order' => $page->order,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'hero_image' => $page->hero_image,
            'canonical_url' => $page->canonical_url,
            'robots' => $page->robots,
            'og_title' => $page->og_title,
            'og_description' => $page->og_description,
            'og_image' => $page->og_image,
            'publish_at' => $page->publish_at,
            'archived_at' => $page->archived_at,
            'is_deleted' => $page->is_deleted,
            'deleted_at' => $page->deleted_at,
            'source' => $source,
            'created_by_id' => $userId,
            'restored_from_version_id' => $restoredFromVersionId,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function payloadFromVersion(PageVersion $version): array
    {
        return [
            'title' => $version->title,
            'slug' => $version->slug,
            'excerpt' => $version->excerpt,
            'content' => $version->content,
            'status' => $version->status,
            'page_type' => $version->page_type,
            'is_visible_in_menu' => $version->is_visible_in_menu,
            'is_visible_in_footer' => $version->is_visible_in_footer,
            'order' => $version->order,
            'seo_title' => $version->seo_title,
            'seo_description' => $version->seo_description,
            'hero_image' => $version->hero_image,
            'canonical_url' => $version->canonical_url,
            'robots' => $version->robots,
            'og_title' => $version->og_title,
            'og_description' => $version->og_description,
            'og_image' => $version->og_image,
            'publish_at' => $version->publish_at,
            'archived_at' => $version->archived_at,
            'is_deleted' => $version->is_deleted,
            'deleted_at' => $version->deleted_at,
        ];
    }

    private function uniqueSlug(string $slug): string
    {
        $candidate = sprintf('%s-kopia', $slug);
        $counter = 1;

        while (Page::query()->where('slug', $candidate)->exists()) {
            $candidate = sprintf('%s-kopia-%d', $slug, $counter);
            $counter++;
        }

        return $candidate;
    }
}
