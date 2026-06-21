<?php

namespace App\Http\Controllers;

use App\Models\SportTeam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class SportTeamController extends Controller
{
    public function index(Request $request)
    {
        if (! Schema::hasTable('sport_teams')) {
            return response()->json(['data' => []]);
        }

        $query = SportTeam::query();

        if (Schema::hasColumn('sport_teams', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('sport_teams', 'name')) {
            $query->orderBy('name');
        }

        $limit = (int) $request->query('limit', 0);
        if ($limit > 0) {
            $query->limit(min($limit, 100));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function show(string $slug)
    {
        if (! Schema::hasTable('sport_teams')) {
            return response()->json(['data' => null]);
        }

        $team = SportTeam::query()
            ->where('slug', $slug)
            ->first();

        return response()->json(['data' => $team]);
    }
}
