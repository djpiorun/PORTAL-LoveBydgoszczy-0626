<?php

namespace App\Http\Controllers;

use App\Models\CategoryHeroConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

    public function show(Request $request, string $categoryKey)
    {
        $query = CategoryHeroConfig::query()->where('category_key', $categoryKey);

        if ($request->filled('item_type')) {
            $query->where('item_type', $request->string('item_type'));
        }

        $configs = $query->orderBy('order')->get();

        return response()->json(['items' => $configs]);
    }

    public function update(Request $request, string $categoryKey)
    {
        $itemType = $request->input('item_type');

        if (! $itemType) {
            return response()->json(['message' => 'item_type is required'], 422);
        }

        $items = $request->input('items', []);

        CategoryHeroConfig::query()
            ->where('category_key', $categoryKey)
            ->where('item_type', $itemType)
            ->delete();

        $created = collect($items)->map(function (array $item, int $index) use ($categoryKey, $itemType) {
            return CategoryHeroConfig::create([
                'id' => (string) Str::uuid(),
                'category_key' => $categoryKey,
                'item_type' => $itemType,
                'item_id' => $item['item_id'] ?? $item['itemId'] ?? '',
                'order' => $item['order'] ?? ($index + 1),
                'is_visible' => $item['is_visible'] ?? $item['isVisible'] ?? true,
            ]);
        });

        return response()->json(['items' => $created]);
    }
}
