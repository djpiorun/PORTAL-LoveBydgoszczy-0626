<?php

namespace App\Http\Controllers;

use App\Models\PortalUpdate;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class UpdateController extends Controller
{
    public function index(Request $request)
    {
        if (! Schema::hasTable('updates')) {
            return response()->json(['data' => []]);
        }

        $query = PortalUpdate::query();

        if (Schema::hasColumn('updates', 'created_at')) {
            $query->orderByDesc('created_at');
        } elseif (Schema::hasColumn('updates', 'published_at')) {
            $query->orderByDesc('published_at');
        }

        $limit = $request->query('limit');
        if ($limit !== null) {
            $limitValue = (int) $limit;
            if ($limitValue > 0) {
                $query->limit(min($limitValue, 100));
            }
        }

        return response()->json(['data' => $query->get()]);
    }

    public function adminIndex(Request $request)
    {
        return $this->index($request);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'media_url' => ['nullable', 'string', 'max:255'],
            'media_type' => ['nullable', 'string', 'max:255'],
            'link_url' => ['nullable', 'string', 'max:255'],
            'link_label' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'published_at' => ['nullable'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new PortalUpdate())->getTable());
        $payload['id'] = (string) Str::uuid();
        $payload['published_at'] = $this->normalizePublishedAt($payload['published_at'] ?? null);

        $update = PortalUpdate::create($payload);

        return response()->json(['data' => $update], 201);
    }

    public function update(Request $request, PortalUpdate $update)
    {
        $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'media_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'media_type' => ['sometimes', 'nullable', 'string', 'max:255'],
            'link_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'link_label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => ['sometimes', 'nullable', 'string', 'max:255'],
            'author' => ['sometimes', 'nullable', 'string', 'max:255'],
            'published_at' => ['sometimes', 'nullable'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new PortalUpdate())->getTable());

        if (array_key_exists('published_at', $payload)) {
            $payload['published_at'] = $this->normalizePublishedAt($payload['published_at']);
        }

        $update->update($payload);

        return response()->json(['data' => $update->fresh()]);
    }

    public function destroy(PortalUpdate $update)
    {
        $update->delete();

        return response()->json(['message' => 'Update deleted']);
    }

    private function normalizePublishedAt(mixed $value): Carbon
    {
        if ($value === null || $value === '') {
            return now();
        }

        if (is_numeric($value)) {
            $numeric = (float) $value;
            if ($numeric > 10000000000) {
                return Carbon::createFromTimestampMs((int) round($numeric));
            }

            return Carbon::createFromTimestamp((int) round($numeric));
        }

        return Carbon::parse($value);
    }
}
