<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'slug' => $this->slug,
            'image' => $this->image,
            'email' => $this->email,
            'role' => $this->role,
            'subtitle' => $this->subtitle,
            'status' => $this->status,
            'description' => $this->description,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'facebook_url' => $this->facebook_url,
            'instagram_url' => $this->instagram_url,
            'twitter_url' => $this->twitter_url,
            'website_url' => $this->website_url,
            'cover_image' => $this->cover_image,
            'is_love_bydgoszcz_team' => $this->is_love_bydgoszcz_team,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
