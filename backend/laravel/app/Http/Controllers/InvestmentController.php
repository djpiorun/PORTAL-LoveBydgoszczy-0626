<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use Illuminate\Http\Request;

class InvestmentController extends Controller
{
    public function index(Request $request)
    {
        $investments = Investment::query()
            ->where(function ($query) {
                $query->where('is_active', true)
                    ->orWhereNull('is_active');
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $investments]);
    }

    public function show(string $slug)
    {
        $investment = Investment::query()
            ->where('slug', $slug)
            ->first();

        return response()->json(['data' => $investment]);
    }
}
