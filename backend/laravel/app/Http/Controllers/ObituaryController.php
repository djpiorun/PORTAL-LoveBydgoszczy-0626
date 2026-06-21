<?php

namespace App\Http\Controllers;

use App\Models\Obituary;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ObituaryController extends Controller
{
    public function index(Request $request)
    {
        $query = Obituary::query()->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'age' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'string', 'max:255'],
            'death_date' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'profession' => ['nullable', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'funeral_date' => ['nullable', 'string', 'max:255'],
            'funeral_time' => ['nullable', 'string', 'max:255'],
            'funeral_place' => ['nullable', 'string', 'max:255'],
            'cemetery_place' => ['nullable', 'string', 'max:255'],
            'submitter_name' => ['nullable', 'string', 'max:255'],
            'submitter_email' => ['nullable', 'email', 'max:255'],
            'submitter_phone' => ['nullable', 'string', 'max:255'],
            'submitter_relation' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
            'featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Obituary())->getTable());
        $payload['id'] = (string) Str::uuid();
        $payload['status'] = $payload['status'] ?? 'pending';
        $payload['slug'] = $payload['slug']
            ?? Str::slug($payload['first_name'] . '-' . $payload['last_name'] . '-' . Str::random(6));

        $obituary = Obituary::create($payload);

        return response()->json(['data' => $obituary], 201);
    }

    public function showBySlug(string $slug)
    {
        $obituary = Obituary::where('slug', $slug)->first();

        return response()->json(['data' => $obituary]);
    }
}
