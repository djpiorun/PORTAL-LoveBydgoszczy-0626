<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->whereNotNull('name')
            ->orderBy('name')
            ->limit(200)
            ->get();

        return UserResource::collection($users);
    }

    public function show(string $identifier)
    {
        $decoded = urldecode($identifier);
        $normalizedSlug = $this->slugify($decoded);

        $user = User::query()
            ->where('slug', $decoded)
            ->orWhere('slug', $normalizedSlug)
            ->orWhere('name', $decoded)
            ->first();

        if (!$user) {
            $lower = mb_strtolower($decoded);
            $user = User::query()
                ->whereRaw('LOWER(name) = ?', [$lower])
                ->orWhereRaw('LOWER(slug) = ?', [$lower])
                ->first();
        }

        if (!$user) {
            $fallback = User::query()->limit(200)->get();
            $targetName = str_replace('-', ' ', mb_strtolower($decoded));
            $user = $fallback->first(function ($candidate) use ($targetName, $lower, $normalizedSlug) {
                $candidateName = mb_strtolower($candidate->name ?? '');
                $candidateSlug = mb_strtolower($candidate->slug ?? '');
                $candidateNormalized = $this->slugify($candidate->name ?? '');

                return $candidateName === $targetName
                    || $candidateSlug === $lower
                    || ($normalizedSlug && $candidateNormalized === $normalizedSlug);
            });
        }

        if (!$user) {
            return response()->json(['message' => 'Author not found'], 404);
        }

        return new UserResource($user);
    }

    private function slugify(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = strtr($value, [
            'ą' => 'a',
            'ć' => 'c',
            'ę' => 'e',
            'ł' => 'l',
            'ń' => 'n',
            'ó' => 'o',
            'ś' => 's',
            'ź' => 'z',
            'ż' => 'z',
        ]);
        $value = preg_replace('/[^a-z0-9]+/u', '-', $value);
        $value = trim($value, '-');

        return $value ?? '';
    }
}
