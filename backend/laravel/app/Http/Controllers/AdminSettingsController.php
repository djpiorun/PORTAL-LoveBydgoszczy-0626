<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminSettingsController extends Controller
{
    public function show()
    {
        return response()->json([
            'portal_name' => 'Love Bydgoszcz',
            'seo_description' => 'Twój codzienny przewodnik po Bydgoszczy. Odkrywaj z nami najlepsze miejsca, wydarzenia i historie z życia miasta.',
            'contact_email' => 'redakcja@lovebydgoszcz.pl',
            'contact_phone' => '+48 123 456 789',
            'contact_address' => 'ul. Długa 12, 85-034 Bydgoszcz',
            'footer_description' => 'Twój codzienny przewodnik po Bydgoszczy. Odkrywaj z nami najlepsze miejsca, wydarzenia i historie z życia miasta.',
            'footer_location_line1' => 'Bydgoszcz, Polska',
            'footer_location_line2' => 'Kujawsko-Pomorskie',
            'footer_bottom_note' => 'Stworzone z sercem w Bydgoszczy',
            'facebook_url' => 'https://facebook.com/lovebydgoszcz',
            'instagram_url' => 'https://instagram.com/lovebydgoszcz',
            'youtube_url' => 'https://youtube.com/lovebydgoszcz',
            'twitter_url' => 'https://twitter.com/lovebydgoszcz',
            'r2_enabled' => false,
            'r2_account_id' => '',
            'r2_access_key_id' => '',
            'r2_secret_access_key' => '',
            'r2_bucket_name' => '',
            'r2_public_base_url' => '',
            'media_max_width' => 1600,
            'media_quality' => 82,
            'media_convert_to_webp' => true,
        ]);
    }

    public function update(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Setting())->getTable());
        $setting = Setting::query()->first();

        if (! $setting) {
            $payload['id'] = (string) Str::uuid();
            $setting = Setting::create($payload);
        } else {
            $setting->update($payload);
            $setting->refresh();
        }

        return response()->json(['data' => $setting]);
    }

    public function gtfsMetadata()
    {
        return response()->json([
            'last_update' => null,
        ]);
    }

    public function gtfsUpdate()
    {
        return response()->json([
            'data' => [
                'status' => 'queued',
                'last_update' => now()->toIso8601String(),
            ],
        ]);
    }
}
