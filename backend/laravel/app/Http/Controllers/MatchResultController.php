<?php

namespace App\Http\Controllers;

use App\Models\MatchResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class MatchResultController extends Controller
{
    public function recent(Request $request)
    {
        if (! Schema::hasTable('match_results')) {
            return response()->json(['data' => []]);
        }

        $query = MatchResult::query();

        if (Schema::hasColumn('match_results', 'played_at')) {
            $query->orderByDesc('played_at');
        } elseif (Schema::hasColumn('match_results', 'match_date')) {
            $query->orderByDesc('match_date');
        } elseif (Schema::hasColumn('match_results', 'created_at')) {
            $query->orderByDesc('created_at');
        }

        $limit = (int) $request->query('limit', 5);
        if ($limit > 0) {
            $query->limit(min($limit, 50));
        }

        return response()->json(['data' => $query->get()]);
    }
}
