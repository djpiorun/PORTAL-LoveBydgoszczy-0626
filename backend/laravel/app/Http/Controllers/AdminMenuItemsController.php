<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminMenuItemsController extends Controller
{
    public function index()
    {
        $items = MenuItem::query()->orderBy('order')->get();

        return response()->json(['data' => $items]);
    }

    public function store(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new MenuItem())->getTable());
        $payload['id'] = $payload['id'] ?? (string) Str::uuid();

        $item = MenuItem::create($payload);

        return response()->json(['data' => $item], 201);
    }

    public function update(Request $request, string $menuItem)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new MenuItem())->getTable());
        $record = MenuItem::query()->findOrFail($menuItem);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function destroy(string $menuItem)
    {
        MenuItem::query()->where('id', $menuItem)->delete();

        return response()->json(null, 204);
    }

    public function seed()
    {
        $existing = MenuItem::query()->orderBy('order')->get();
        if ($existing->isNotEmpty()) {
            return response()->json([
                'data' => [
                    'seeded' => false,
                    'items' => $existing,
                ],
            ]);
        }

        $defaults = [
            [
                'label' => 'Strona główna',
                'path' => '/',
                'icon' => 'Home',
                'tooltip' => 'Powrót na start',
                'order' => 1,
                'is_active' => true,
                'placement' => 'main',
                'type' => 'internal_link',
                'parent_id' => null,
                'show_when_scrolled' => false,
            ],
            [
                'label' => 'Aktualności',
                'path' => '/aktualnosci',
                'icon' => 'Newspaper',
                'tooltip' => 'Najważniejsze informacje',
                'order' => 2,
                'is_active' => true,
                'placement' => 'main',
                'type' => 'internal_link',
                'parent_id' => null,
                'show_when_scrolled' => false,
            ],
            [
                'label' => 'Kontakt',
                'path' => '/kontakt',
                'icon' => 'Mail',
                'tooltip' => 'Skontaktuj się z nami',
                'order' => 1,
                'is_active' => true,
                'placement' => 'kontakt',
                'type' => 'internal_link',
                'parent_id' => null,
                'show_when_scrolled' => false,
            ],
        ];

        $items = collect($defaults)->map(function (array $item) {
            $item['id'] = (string) Str::uuid();

            return MenuItem::create($item);
        });

        return response()->json([
            'data' => [
                'seeded' => true,
                'items' => $items,
            ],
        ], 201);
    }
}
