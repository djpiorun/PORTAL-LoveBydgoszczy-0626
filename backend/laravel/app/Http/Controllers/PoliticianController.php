<?php

namespace App\Http\Controllers;

use App\Models\Politician;
use Illuminate\Http\Request;

class PoliticianController extends Controller
{
    public function index(Request $request)
    {
        $politicians = Politician::query()
            ->where(function ($query) {
                $query->where('is_active', true)
                    ->orWhereNull('is_active');
            })
            ->orderBy('full_name')
            ->get();

        return response()->json(['data' => $politicians]);
    }

    public function show(string $slug)
    {
        $politician = Politician::query()
            ->where('slug', $slug)
            ->first();

        return response()->json(['data' => $politician]);
    }
}
