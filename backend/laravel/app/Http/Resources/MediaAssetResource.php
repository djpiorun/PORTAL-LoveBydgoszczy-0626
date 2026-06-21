<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'original_file_name' => $this->original_file_name,
            'url' => $this->url,
            'storage_provider' => $this->storage_provider,
            'media_type' => $this->media_type,
            'source_kind' => $this->source_kind,
            'source_entity_id' => $this->source_entity_id,
            'folder' => $this->folder,
            'tags' => $this->tags,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'width' => $this->width,
            'height' => $this->height,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'last_used_at' => $this->last_used_at,
        ];
    }
}
