<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminUsersController extends Controller
{
    public function index()
    {
        return response()->json(['data' => []]);
    }

    public function store(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new User())->getTable());
        $payload['id'] = (string) Str::uuid();

        return response()->json(['data' => $payload], 201);
    }

    public function update(Request $request, string $user)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new User())->getTable());
        $payload['id'] = $user;

        return response()->json(['data' => $payload]);
    }

    public function updateRole(Request $request, string $user)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new User())->getTable());
        $payload['id'] = $user;

        return response()->json(['data' => $payload]);
    }

    public function updateCredentials(Request $request, string $user)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new User())->getTable());
        $payload['id'] = $user;

        return response()->json(['data' => $payload]);
    }

    public function destroy(string $user)
    {
        return response()->json(null, 204);
    }
}
