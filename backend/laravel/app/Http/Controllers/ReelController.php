<?php

namespace App\Http\Controllers;

use App\Models\Reel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ReelController extends Controller
{
    public function index(Request $request)
    {
        if (! Schema::hasTable('reels')) {
            return response()->json(['data' => []]);
        }

        $query = Reel::query();

        if (Schema::hasColumn('reels', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('reels', 'created_at')) {
            $query->orderByDesc('created_at');
        }

        $limit = (int) $request->query('limit', 0);
        if ($limit > 0) {
            $query->limit(min($limit, 100));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function stories(Request $request)
    {
        if (! Schema::hasTable('reels')) {
            return response()->json(['data' => []]);
        }

        $query = Reel::query();

        if (Schema::hasColumn('reels', 'type')) {
            $query->where('type', 'story');
        } elseif (Schema::hasColumn('reels', 'kind')) {
            $query->where('kind', 'story');
        }

        if (Schema::hasColumn('reels', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('reels', 'created_at')) {
            $query->orderByDesc('created_at');
        }

        $limit = (int) $request->query('limit', 0);
        if ($limit > 0) {
            $query->limit(min($limit, 100));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function like(string $id)
    {
        if (! Schema::hasTable('reels')) {
            return response()->json(['data' => null]);
        }

        $reel = Reel::query()
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->first();

        if (! $reel) {
            return response()->json(['data' => null]);
        }

        $likeColumn = null;
        if (Schema::hasColumn('reels', 'likes_count')) {
            $likeColumn = 'likes_count';
        } elseif (Schema::hasColumn('reels', 'likes')) {
            $likeColumn = 'likes';
        }

        if ($likeColumn) {
            $reel->increment($likeColumn);
            $reel->refresh();
        }

        return response()->json(['data' => $reel]);
    }
}
