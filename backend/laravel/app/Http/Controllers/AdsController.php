<?php

namespace App\Http\Controllers;

use App\Models\AdCreative;
use App\Models\AdPartner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AdsController extends Controller
{
    public function index(Request $request)
    {
        if (! Schema::hasTable('ad_creatives')) {
            return response()->json(['data' => []]);
        }

        $query = AdCreative::query();
        $placement = $request->query('placement');

        if ($placement) {
            if (Schema::hasColumn('ad_creatives', 'placement')) {
                $query->where('placement', $placement);
            } elseif (Schema::hasColumn('ad_creatives', 'placement_id')) {
                $query->where('placement_id', $placement);
            } elseif (Schema::hasColumn('ad_creatives', 'placement_slug')) {
                $query->where('placement_slug', $placement);
            }
        }

        if (Schema::hasColumn('ad_creatives', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('ad_creatives', 'created_at')) {
            $query->orderByDesc('created_at');
        }

        $limit = (int) $request->query('limit', 0);
        if ($limit > 0) {
            $query->limit(min($limit, 100));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function trackClick(Request $request)
    {
        return response()->json([
            'data' => [
                'status' => 'tracked',
                'event' => 'click',
            ],
        ]);
    }

    public function trackImpression(Request $request)
    {
        return response()->json([
            'data' => [
                'status' => 'tracked',
                'event' => 'impression',
            ],
        ]);
    }

    public function partners(Request $request)
    {
        if (! Schema::hasTable('ad_partners')) {
            return response()->json(['data' => []]);
        }

        $query = AdPartner::query();

        if (Schema::hasColumn('ad_partners', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('ad_partners', 'created_at')) {
            $query->orderByDesc('created_at');
        }

        $limit = (int) $request->query('limit', 0);
        if ($limit > 0) {
            $query->limit(min($limit, 100));
        }

        return response()->json(['data' => $query->get()]);
    }
}
