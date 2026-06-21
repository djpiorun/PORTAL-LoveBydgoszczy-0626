<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function showBySlug(string $slug)
    {
        $page = Page::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->where(function ($query) {
                $query->whereNull('is_deleted')
                    ->orWhere('is_deleted', false);
            })
            ->first();

        return response()->json(['data' => $page]);
    }

    public function adminShowBySlug(string $slug)
    {
        $page = Page::query()
            ->where('slug', $slug)
            ->first();

        return response()->json(['data' => $page]);
    }
}
