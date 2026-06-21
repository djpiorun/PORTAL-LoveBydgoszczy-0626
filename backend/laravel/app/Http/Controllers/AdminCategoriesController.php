<?php

namespace App\Http\Controllers;

use App\Models\CategorySetting;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoriesController extends Controller
{
    public function index()
    {
        $categories = CategorySetting::query()->orderBy('order')->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new CategorySetting())->getTable());
        $payload['id'] = $payload['id'] ?? (string) Str::uuid();

        $category = CategorySetting::create($payload);

        return response()->json($category, 201);
    }

    public function update(Request $request, string $category)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new CategorySetting())->getTable());
        $record = CategorySetting::query()->findOrFail($category);

        $record->update($payload);

        return response()->json($record->refresh());
    }

    public function destroy(string $category)
    {
        CategorySetting::query()->where('id', $category)->delete();

        return response()->json(null, 204);
    }
}
