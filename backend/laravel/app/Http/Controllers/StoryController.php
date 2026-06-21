<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class StoryController extends Controller
{
    public function index(Request $request)
    {
        if (! Schema::hasTable('stories')) {
            return response()->json(['data' => []]);
        }

        $query = Story::query();

        if (Schema::hasColumn('stories', 'created_at')) {
            $query->orderByDesc('created_at');
        }

        if ($request->has('active')) {
            $active = filter_var($request->query('active'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
            if ($active !== null) {
                $query->where('is_active', $active);
            }
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function active()
    {
        if (! Schema::hasTable('stories')) {
            return response()->json(['data' => []]);
        }

        $query = Story::query();

        if (Schema::hasColumn('stories', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('stories', 'created_at')) {
            $query->orderByDesc('created_at');
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'cover_image' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'items' => ['required', 'array'],
            'is_active' => ['required', 'boolean'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Story())->getTable());
        $payload['id'] = (string) Str::uuid();

        $story = Story::create($payload);

        return response()->json(['data' => $story], 201);
    }

    public function update(Request $request, Story $story)
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'cover_image' => ['sometimes', 'string', 'max:255'],
            'author' => ['sometimes', 'string', 'max:255'],
            'items' => ['sometimes', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Story())->getTable());

        $story->update($payload);

        return response()->json(['data' => $story->fresh()]);
    }

    public function destroy(Story $story)
    {
        $story->delete();

        return response()->json(['message' => 'Story deleted']);
    }
}
