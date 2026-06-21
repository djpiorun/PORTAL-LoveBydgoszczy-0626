<?php

namespace App\Http\Controllers;

use App\Models\PortalUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

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
}
