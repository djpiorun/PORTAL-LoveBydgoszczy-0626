<?php

namespace App\Http\Controllers;

use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserProfileController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'facebook_url' => ['nullable', 'string', 'max:255'],
            'instagram_url' => ['nullable', 'string', 'max:255'],
            'twitter_url' => ['nullable', 'string', 'max:255'],
            'website_url' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $payload = PanelPayloadNormalizer::normalize($request->all(), $user->getTable());

        if (array_key_exists('username', $payload)) {
            $payload['username_lowercase'] = Str::lower($payload['username']);
            $payload['slug'] = Str::slug($payload['username']);
        }

        $user->update($payload);

        return response()->json(['data' => $user->fresh()]);
    }

    public function updateCredentials(Request $request)
    {
        $data = $request->validate([
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $user = $request->user();

        if (! empty($data['username'])) {
            $user->username = $data['username'];
            $user->username_lowercase = Str::lower($data['username']);
            $user->slug = Str::slug($data['username']);
        }

        if (! empty($data['password'])) {
            $user->password_hash = Hash::make($data['password']);
            $user->password_updated_at = now();
        }

        $user->save();

        return response()->json(['data' => $user->fresh()]);
    }
}
