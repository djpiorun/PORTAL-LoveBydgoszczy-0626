<?php

namespace App\Http\Controllers;

use App\Models\GtfsCalendar;
use App\Models\GtfsMetadata;
use App\Models\GtfsRoute;
use App\Models\GtfsRouteDetail;
use App\Models\GtfsStop;
use App\Models\GtfsStopDeparture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class GtfsController extends Controller
{
    public function metadata()
    {
        if (! Schema::hasTable('gtfs_metadata')) {
            return response()->json(['data' => null]);
        }

        $metadata = GtfsMetadata::query()->first();

        return response()->json(['data' => $metadata]);
    }

    public function routes()
    {
        $routes = GtfsRoute::query()
            ->orderBy('route_short_name')
            ->get();

        return response()->json(['data' => $routes]);
    }

    public function routeDetails(string $routeId)
    {
        $route = GtfsRoute::query()
            ->where('route_short_name', $routeId)
            ->orWhere('route_id', $routeId)
            ->first();

        if (! $route) {
            return response()->json(['data' => []]);
        }

        $details = GtfsRouteDetail::query()
            ->where('route_id', $route->route_id)
            ->first();

        $directions = $details?->directions ?? [];
        if (is_string($directions)) {
            $directions = json_decode($directions, true) ?? [];
        }

        $payload = $details ? [[
            'route' => $route,
            'directions' => $directions,
        ]] : [];

        return response()->json(['data' => $payload]);
    }

    public function stopSearch(Request $request)
    {
        $term = trim((string) $request->query('query', ''));

        if ($term === '') {
            return response()->json(['data' => []]);
        }

        $stops = GtfsStop::query()
            ->where('stop_name', 'like', "%{$term}%")
            ->orWhere('stop_id', 'like', "%{$term}%")
            ->orderBy('stop_name')
            ->limit(20)
            ->get();

        return response()->json(['data' => $stops]);
    }

    public function stop(string $stopId)
    {
        $stop = GtfsStop::query()
            ->where('stop_id', $stopId)
            ->orWhere('id', $stopId)
            ->first();

        return response()->json(['data' => $stop]);
    }

    public function stopDepartures(string $stopId)
    {
        $departures = GtfsStopDeparture::query()
            ->where('stop_id', $stopId)
            ->first();

        $payload = null;

        if ($departures) {
            $items = $departures->departures ?? [];
            if (is_string($items)) {
                $items = json_decode($items, true) ?? [];
            }

            $payload = [
                'stop_id' => $departures->stop_id,
                'departures' => $items,
            ];
        }

        return response()->json(['data' => $payload]);
    }

    public function activeServices(Request $request)
    {
        $date = $request->query('date');

        if (! $date) {
            return response()->json(['data' => []]);
        }

        $calendar = GtfsCalendar::query()
            ->where('date', $date)
            ->first();

        $services = $calendar?->active_services ?? [];
        if (is_string($services)) {
            $services = json_decode($services, true) ?? [];
        }

        return response()->json(['data' => $services]);
    }
}
