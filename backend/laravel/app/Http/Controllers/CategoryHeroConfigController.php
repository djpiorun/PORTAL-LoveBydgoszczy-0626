<?php

namespace App\Http\Controllers;

use App\Models\CategoryHeroConfig;
use Illuminate\Http\Request;

class CategoryHeroConfigController extends Controller
{
    public function index(Request $request)
    {
        $query = CategoryHeroConfig::query();

        if ($request->filled('category')) {
            $query->where('category_key', $request->string('category'));
        }

        $configs = $query->orderBy('order')->get();

        return response()->json(['data' => $configs]);
    }
}
