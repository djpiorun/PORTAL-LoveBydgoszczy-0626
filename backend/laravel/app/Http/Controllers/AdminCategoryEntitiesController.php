<?php

namespace App\Http\Controllers;

use App\Models\CategoryEntity;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryEntitiesController extends Controller
{
    public function index(Request $request)
    {
        $query = CategoryEntity::query();

        if ($request->filled('category_key')) {
            $query->where('category_key', $request->string('category_key'));
        }

        $entities = $query->orderBy('order')->get();

        return response()->json($entities);
    }

    public function store(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new CategoryEntity())->getTable());
        $payload['id'] = $payload['id'] ?? (string) Str::uuid();

        $entity = CategoryEntity::create($payload);

        return response()->json($entity, 201);
    }

    public function update(Request $request, string $entity)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new CategoryEntity())->getTable());
        $record = CategoryEntity::query()->findOrFail($entity);

        $record->update($payload);

        return response()->json($record->refresh());
    }

    public function destroy(string $entity)
    {
        CategoryEntity::query()->where('id', $entity)->delete();

        return response()->json(null, 204);
    }
}
