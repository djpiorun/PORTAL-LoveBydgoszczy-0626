<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class MenuController extends Controller
{
    public function nav(Request $request)
    {
        if (! Schema::hasTable('menu_items')) {
            return response()->json(['data' => []]);
        }

        $query = MenuItem::query();

        if (Schema::hasColumn('menu_items', 'location')) {
            $query->where('location', 'nav');
        } elseif (Schema::hasColumn('menu_items', 'type')) {
            $query->where('type', 'nav');
        }

        if (Schema::hasColumn('menu_items', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('menu_items', 'sort_order')) {
            $query->orderBy('sort_order');
        } elseif (Schema::hasColumn('menu_items', 'position')) {
            $query->orderBy('position');
        } elseif (Schema::hasColumn('menu_items', 'order')) {
            $query->orderBy('order');
        }

        return response()->json(['data' => $query->get()]);
    }
}
