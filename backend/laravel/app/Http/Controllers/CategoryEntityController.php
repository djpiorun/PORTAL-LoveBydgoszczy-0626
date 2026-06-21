<?php

namespace App\Http\Controllers;

use App\Models\CategoryEntity;
use Illuminate\Http\Request;

class CategoryEntityController extends Controller
{
    public function index(Request $request, ?string $categoryKey = null, ?string $entityType = null)
    {
        $query = CategoryEntity::query();

        $resolvedCategory = $categoryKey
            ?? ($request->filled('category_key') ? $request->string('category_key') : null)
            ?? ($request->filled('category') ? $request->string('category') : null);

        if ($resolvedCategory) {
            $query->where('category_key', $resolvedCategory);
        }

        $resolvedType = $entityType
            ?? ($request->filled('entity_type') ? $request->string('entity_type') : null);

        if ($resolvedType) {
            $query->where('entity_type', $resolvedType);
        }

        $entities = $query->orderBy('order')->get();

        return response()->json(['data' => $entities]);
    }
}
