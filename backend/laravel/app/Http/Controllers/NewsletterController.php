<?php

namespace App\Http\Controllers;

use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        if (! Schema::hasTable('newsletter')) {
            return response()->json(['data' => null]);
        }

        $payload = [];

        if (Schema::hasColumn('newsletter', 'id')) {
            $payload['id'] = (string) Str::uuid();
        }

        if (Schema::hasColumn('newsletter', 'email')) {
            $payload['email'] = $data['email'];
        }

        if (Schema::hasColumn('newsletter', 'created_at')) {
            $payload['created_at'] = now();
        }

        if (Schema::hasColumn('newsletter', 'updated_at')) {
            $payload['updated_at'] = now();
        }

        if (empty($payload)) {
            return response()->json(['data' => null]);
        }

        $record = Newsletter::create($payload);

        return response()->json(['data' => $record], 201);
    }
}
