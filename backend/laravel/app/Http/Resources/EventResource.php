<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'image_url' => $this->image_url,
            'location' => $this->location,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'price' => $this->price,
            'organizer' => $this->organizer,
            'featured' => $this->featured,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
