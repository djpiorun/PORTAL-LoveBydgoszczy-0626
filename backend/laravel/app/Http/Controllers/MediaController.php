<?php

namespace App\Http\Controllers;

use App\Http\Resources\MediaAssetResource;
use App\Models\MediaAsset;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $media = MediaAsset::query()
            ->orderByDesc('created_at')
            ->paginate(30);

        return MediaAssetResource::collection($media);
    }

    public function show(MediaAsset $mediaAsset)
    {
        return new MediaAssetResource($mediaAsset);
    }

    public function adminIndex(Request $request)
    {
        $media = MediaAsset::query()
            ->orderByDesc('created_at')
            ->get();

        return MediaAssetResource::collection($media);
    }

    public function folders()
    {
        $folders = MediaAsset::query()
            ->whereNotNull('folder')
            ->where('folder', '!=', '')
            ->distinct()
            ->orderBy('folder')
            ->pluck('folder')
            ->values();

        return response()->json($folders);
    }

    public function updateAsset(Request $request, MediaAsset $mediaAsset)
    {
        $request->validate([
            'folder' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), $mediaAsset->getTable());

        $mediaAsset->update([
            'folder' => $payload['folder'] ?? null,
            'tags' => $payload['tags'] ?? [],
        ]);

        return new MediaAssetResource($mediaAsset->refresh());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:51200'],
            'source_kind' => ['nullable', 'string', 'max:255'],
            'source_entity_id' => ['nullable', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
        ]);

        $file = $data['file'];
        $path = $file->store('uploads', 'public');
        $url = Storage::disk('public')->url($path);
        $mime = $file->getMimeType() ?? '';

        $mediaType = Str::startsWith($mime, 'image/')
            ? 'image'
            : (Str::startsWith($mime, 'video/') ? 'video' : 'document');

        $dimensions = null;
        if ($mediaType === 'image') {
            $dimensions = @getimagesize($file->getPathname());
        }

        $mediaAsset = MediaAsset::create([
            'id' => (string) Str::uuid(),
            'name' => $file->hashName(),
            'original_file_name' => $file->getClientOriginalName(),
            'url' => $url,
            'storage_provider' => 'local',
            'media_type' => $mediaType,
            'source_kind' => $data['source_kind'] ?? 'manual',
            'source_entity_id' => $data['source_entity_id'] ?? null,
            'folder' => $data['folder'] ?? null,
            'tags' => $data['tags'] ?? null,
            'mime_type' => $mime,
            'size' => $file->getSize(),
            'width' => $dimensions[0] ?? null,
            'height' => $dimensions[1] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return (new MediaAssetResource($mediaAsset))
            ->response()
            ->setStatusCode(201);
    }
}
