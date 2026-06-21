<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Support\Facades\Schema;

class SettingsController extends Controller
{
    public function footer()
    {
        if (! Schema::hasTable('settings')) {
            return response()->json(['data' => null]);
        }

        $query = Setting::query();

        if (Schema::hasColumn('settings', 'group')) {
            $query->where('group', 'footer');
        } elseif (Schema::hasColumn('settings', 'section')) {
            $query->where('section', 'footer');
        } elseif (Schema::hasColumn('settings', 'key')) {
            $query->whereIn('key', [
                'footer',
                'footer_description',
                'footer_location_line1',
                'footer_location_line2',
                'footer_bottom_note',
                'facebook_url',
                'instagram_url',
                'youtube_url',
                'twitter_url',
            ]);
        }

        $footer = $query->first();

        return response()->json(['data' => $footer]);
    }
}
