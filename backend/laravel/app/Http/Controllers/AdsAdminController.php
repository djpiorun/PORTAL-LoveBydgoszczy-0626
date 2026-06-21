<?php

namespace App\Http\Controllers;

use App\Models\AdCampaign;
use App\Models\AdCreative;
use App\Models\AdGraphic;
use App\Models\AdInquiry;
use App\Models\AdPartner;
use App\Models\AdPlacement;
use App\Models\AdPricing;
use App\Models\AdSetting;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdsAdminController extends Controller
{
    public function campaignsIndex()
    {
        $campaigns = AdCampaign::query()->orderByDesc('created_at')->get();

        return response()->json(['data' => $campaigns]);
    }

    public function campaignsStore(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdCampaign())->getTable());
        $payload['id'] = (string) Str::uuid();

        $campaign = AdCampaign::create($payload);

        return response()->json(['data' => $campaign], 201);
    }

    public function campaignsUpdate(Request $request, string $campaign)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdCampaign())->getTable());
        $record = AdCampaign::query()->findOrFail($campaign);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function campaignsDestroy(string $campaign)
    {
        AdCampaign::query()->where('id', $campaign)->delete();

        return response()->json(null, 204);
    }

    public function creativesIndex()
    {
        $creatives = AdCreative::query()->orderByDesc('created_at')->get();

        return response()->json(['data' => $creatives]);
    }

    public function creativesStore(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdCreative())->getTable());
        $payload['id'] = (string) Str::uuid();

        $creative = AdCreative::create($payload);

        return response()->json(['data' => $creative], 201);
    }

    public function creativesUpdate(Request $request, string $creative)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdCreative())->getTable());
        $record = AdCreative::query()->findOrFail($creative);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function creativesDestroy(string $creative)
    {
        AdCreative::query()->where('id', $creative)->delete();

        return response()->json(null, 204);
    }

    public function placementsIndex()
    {
        $placements = AdPlacement::query()->orderByDesc('created_at')->get();

        return response()->json(['data' => $placements]);
    }

    public function placementsStore(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdPlacement())->getTable());
        $payload['id'] = (string) Str::uuid();

        $placement = AdPlacement::create($payload);

        return response()->json(['data' => $placement], 201);
    }

    public function placementsUpdate(Request $request, string $placement)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdPlacement())->getTable());
        $record = AdPlacement::query()->findOrFail($placement);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function placementsDestroy(string $placement)
    {
        AdPlacement::query()->where('id', $placement)->delete();

        return response()->json(null, 204);
    }

    public function partnersIndex()
    {
        $partners = AdPartner::query()->orderByDesc('created_at')->get();

        return response()->json(['data' => $partners]);
    }

    public function partnersStore(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdPartner())->getTable());
        $payload['id'] = (string) Str::uuid();

        $partner = AdPartner::create($payload);

        return response()->json(['data' => $partner], 201);
    }

    public function partnersUpdate(Request $request, string $partner)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdPartner())->getTable());
        $record = AdPartner::query()->findOrFail($partner);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function partnersDestroy(string $partner)
    {
        AdPartner::query()->where('id', $partner)->delete();

        return response()->json(null, 204);
    }

    public function inquiriesIndex()
    {
        $inquiries = AdInquiry::query()->orderByDesc('created_at')->get();

        return response()->json(['data' => $inquiries]);
    }

    public function inquiriesUpdate(Request $request, string $inquiry)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdInquiry())->getTable());
        $record = AdInquiry::query()->findOrFail($inquiry);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function inquiriesStatus(Request $request, string $inquiry)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdInquiry())->getTable());
        $record = AdInquiry::query()->findOrFail($inquiry);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function inquiriesDestroy(string $inquiry)
    {
        AdInquiry::query()->where('id', $inquiry)->delete();

        return response()->json(null, 204);
    }

    public function pricingIndex()
    {
        $pricing = AdPricing::query()->orderByDesc('created_at')->get();

        return response()->json(['data' => $pricing]);
    }

    public function pricingStore(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdPricing())->getTable());
        $payload['id'] = (string) Str::uuid();

        $pricing = AdPricing::create($payload);

        return response()->json(['data' => $pricing], 201);
    }

    public function pricingUpdate(Request $request, string $pricing)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdPricing())->getTable());
        $record = AdPricing::query()->findOrFail($pricing);

        $record->update($payload);

        return response()->json(['data' => $record->refresh()]);
    }

    public function pricingDestroy(string $pricing)
    {
        AdPricing::query()->where('id', $pricing)->delete();

        return response()->json(null, 204);
    }

    public function settingsShow()
    {
        $defaults = [
            'is_module_enabled' => true,
            'auto_rotation' => true,
            'notification_email' => 'reklama@lovebydgoszcz.pl',
            'default_ad_sizes' => ['1140x200', '300x250', '728x90', '320x50'],
            'ad_types' => ['banner', 'sponsored_article', 'popup', 'slider', 'text', 'html'],
            'max_emissions_per_day' => 0,
        ];

        $setting = AdSetting::query()->first();
        $data = $setting ? array_merge($defaults, $setting->toArray()) : $defaults;

        return response()->json($data);
    }

    public function settingsUpdate(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdSetting())->getTable());
        $setting = AdSetting::query()->first();

        if (! $setting) {
            $payload['id'] = (string) Str::uuid();
            $setting = AdSetting::create($payload);
        } else {
            $setting->update($payload);
            $setting->refresh();
        }

        return response()->json(['data' => $setting]);
    }

    public function graphicsIndex()
    {
        $graphics = AdGraphic::query()->orderByDesc('created_at')->get();

        return response()->json(['data' => $graphics]);
    }

    public function graphicsStore(Request $request)
    {
        $payload = PanelPayloadNormalizer::normalize($request->all(), (new AdGraphic())->getTable());
        $payload['id'] = (string) Str::uuid();

        $graphic = AdGraphic::create($payload);

        return response()->json(['data' => $graphic], 201);
    }

    public function graphicsDestroy(string $graphic)
    {
        AdGraphic::query()->where('id', $graphic)->delete();

        return response()->json(null, 204);
    }
}
