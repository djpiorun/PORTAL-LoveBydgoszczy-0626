<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::query()
            ->orderByDesc('start_date')
            ->paginate(20);

        return EventResource::collection($events);
    }

    public function homepageFeed()
    {
        $featuredEvents = Event::query()
            ->where('featured', true)
            ->orderByDesc('start_date')
            ->take(8)
            ->get();

        if ($featuredEvents->isEmpty()) {
            $featuredEvents = Event::query()
                ->orderByDesc('start_date')
                ->take(8)
                ->get();
        }

        $eventCategories = Event::query()
            ->select('category')
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->values();

        $eventsPayload = $featuredEvents->map(function (Event $event) {
            $ticketPrice = null;
            if (is_numeric($event->price)) {
                $ticketPrice = (float) $event->price;
            }

            return [
                '_id' => (string) $event->id,
                'slug' => $event->slug ?? null,
                'title' => $event->title,
                'category' => $event->category,
                'startDate' => $event->start_date,
                'location' => $event->location,
                'imageUrl' => $event->image_url,
                'description' => $event->description,
                'ticketPrice' => $ticketPrice,
            ];
        });

        return response()->json([
            'featuredEvents' => $eventsPayload,
            'featuredPlaces' => [],
            'newBusinesses' => [],
            'filters' => [
                'eventCategories' => $eventCategories,
                'placeCategories' => [],
                'businessCategories' => [],
            ],
            'configured' => [
                'featuredEventIds' => [],
                'featuredPlaceIds' => [],
                'newBusinessesLimit' => 0,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Event())->getTable());
        $payload['id'] = (string) Str::uuid();

        $event = Event::create($payload);

        return (new EventResource($event))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Event $event)
    {
        return new EventResource($event);
    }

    public function update(Request $request, Event $event)
    {
        $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string', 'max:255'],
            'location' => ['sometimes', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Event())->getTable());

        $event->update($payload);

        return new EventResource($event->fresh());
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return response()->json(['message' => 'Event deleted']);
    }
}
