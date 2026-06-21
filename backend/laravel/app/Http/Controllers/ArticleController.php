<?php

namespace App\Http\Controllers;

use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Models\ArticlePollVote;
use App\Models\ArticleUpdate;
use App\Support\PanelPayloadNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::query();

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('author')) {
            $query->where('author', $request->string('author'));
        }

        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        if ($request->boolean('patronage')) {
            $query->where('is_patronage', true);
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $query->orderByDesc('published_at');

        $perPage = (int) $request->integer('per_page', 20);
        $limit = (int) $request->integer('limit', 0);

        if ($request->has('page') || $request->boolean('paginate')) {
            $articles = $query->paginate($perPage);
        } elseif ($limit > 0) {
            $articles = $query->limit($limit)->get();
        } else {
            $articles = $query->limit(20)->get();
        }

        return ArticleResource::collection($articles);
    }

    public function showBySlug(string $slug)
    {
        $article = Article::query()
            ->where('slug', $slug)
            ->firstOrFail();

        return new ArticleResource($article);
    }

    public function updates(Article $article)
    {
        $updates = ArticleUpdate::query()
            ->where('article_id', $article->id)
            ->orderByDesc('published_at')
            ->get();

        return response()->json([
            'data' => $updates->map(fn ($update) => [
                'id' => $update->id,
                'content' => $update->content,
                'published_at' => $update->published_at,
                'created_at' => $update->created_at,
                'updated_at' => $update->updated_at,
            ]),
        ]);
    }

    public function pollResults(Article $article)
    {
        $poll = $article->poll;
        if (!$poll || !($poll['enabled'] ?? false) || ($poll['status'] ?? null) === 'hidden') {
            return response()->json(null);
        }

        $pollId = $poll['pollId'] ?? null;
        if (!$pollId) {
            return response()->json(null);
        }

        $votes = ArticlePollVote::query()
            ->where('article_id', $article->id)
            ->where('poll_id', $pollId)
            ->get();

        $optionVotes = [];
        $ratingSum = 0;
        $ratingCount = 0;

        foreach ($votes as $vote) {
            foreach ($vote->selections ?? [] as $selection) {
                $optionVotes[$selection] = ($optionVotes[$selection] ?? 0) + 1;
            }
            if (is_numeric($vote->rating)) {
                $ratingSum += (int) $vote->rating;
                $ratingCount += 1;
            }
        }

        $totalVotes = $votes->count();
        $optionResults = collect($poll['options'] ?? [])->map(function ($option) use ($optionVotes, $totalVotes) {
            $votesCount = $optionVotes[$option['id'] ?? ''] ?? 0;
            $percentage = $totalVotes > 0 ? (int) round(($votesCount / $totalVotes) * 100) : 0;

            return array_merge($option, [
                'votes' => $votesCount,
                'percentage' => $percentage,
            ]);
        });

        $winner = $optionResults->reduce(function ($current, $option) {
            if (($option['votes'] ?? 0) > ($current['votes'] ?? -1)) {
                return ['id' => $option['id'] ?? null, 'votes' => $option['votes'] ?? 0];
            }
            return $current;
        }, ['votes' => -1]);

        $state = $this->getPollState($poll);

        return response()->json([
            'totalVotes' => $totalVotes,
            'optionResults' => $optionResults->values(),
            'averageRating' => $ratingCount > 0 ? round($ratingSum / $ratingCount, 1) : null,
            'winnerId' => $winner['id'] ?? null,
            'isClosed' => $state['isClosed'],
            'poll' => $poll,
        ]);
    }

    public function submitPollVote(Request $request, Article $article)
    {
        $payload = $request->validate([
            'voter_key' => ['required', 'string'],
            'selections' => ['nullable', 'array'],
            'selections.*' => ['string'],
            'rating' => ['nullable', 'integer'],
        ]);

        $poll = $article->poll;
        if (!$poll || !($poll['enabled'] ?? false)) {
            return response()->json([
                'ok' => false,
                'code' => 'poll_unavailable',
                'message' => 'Ankieta nie jest dostępna',
            ]);
        }

        $state = $this->getPollState($poll);
        if (!$state['poll']) {
            return response()->json([
                'ok' => false,
                'code' => 'missing_poll',
                'message' => 'Brak ankiety',
            ]);
        }

        if ($state['isClosed']) {
            return response()->json([
                'ok' => false,
                'code' => 'poll_closed',
                'message' => $poll['closedLabel'] ?? $poll['endMessage'] ?? 'Ankieta została zakończona',
            ]);
        }

        if (!$state['isAvailable']) {
            return response()->json([
                'ok' => false,
                'code' => 'poll_inactive',
                'message' => 'Ankieta nie jest jeszcze aktywna',
            ]);
        }

        $userId = optional($request->user())->id;
        if (($poll['requireLogin'] ?? false) && !$userId) {
            return response()->json([
                'ok' => false,
                'code' => 'login_required',
                'message' => 'Głosowanie wymaga zalogowania',
            ]);
        }

        if (!($poll['allowAnonymous'] ?? true) && !$userId) {
            return response()->json([
                'ok' => false,
                'code' => 'anonymous_disabled',
                'message' => 'Głosowanie anonimowe jest wyłączone',
            ]);
        }

        $selectionIds = $payload['selections'] ?? [];
        $validOptionIds = collect($poll['options'] ?? [])->pluck('id')->filter()->all();
        $pollType = $poll['type'] ?? 'single';

        if ($pollType === 'scale') {
            if (!isset($payload['rating'])) {
                return response()->json([
                    'ok' => false,
                    'code' => 'missing_rating',
                    'message' => 'Wybierz ocenę',
                ]);
            }
            $min = $poll['scaleMin'] ?? 1;
            $max = $poll['scaleMax'] ?? 5;
            if ($payload['rating'] < $min || $payload['rating'] > $max) {
                return response()->json([
                    'ok' => false,
                    'code' => 'rating_out_of_range',
                    'message' => 'Ocena jest poza zakresem',
                ]);
            }
        } else {
            if (count($selectionIds) === 0) {
                return response()->json([
                    'ok' => false,
                    'code' => 'missing_selection',
                    'message' => 'Wybierz odpowiedź',
                ]);
            }
            foreach ($selectionIds as $selectionId) {
                if (!in_array($selectionId, $validOptionIds, true)) {
                    return response()->json([
                        'ok' => false,
                        'code' => 'invalid_selection',
                        'message' => 'Wybrano nieprawidłową odpowiedź',
                    ]);
                }
            }
            if (in_array($pollType, ['single', 'duel'], true) && count($selectionIds) !== 1) {
                return response()->json([
                    'ok' => false,
                    'code' => 'single_selection_required',
                    'message' => 'Możesz wybrać tylko jedną odpowiedź',
                ]);
            }
            if ($pollType === 'multiple') {
                $maxSelections = $poll['maxSelections'] ?? 2;
                if (count($selectionIds) > $maxSelections) {
                    return response()->json([
                        'ok' => false,
                        'code' => 'too_many_selections',
                        'message' => "Możesz wybrać maksymalnie {$maxSelections} odpowiedzi",
                    ]);
                }
            }
        }

        $pollId = $poll['pollId'] ?? null;
        if (!$pollId) {
            return response()->json([
                'ok' => false,
                'code' => 'missing_poll',
                'message' => 'Brak ankiety',
            ]);
        }

        $voteLimitMode = $poll['voteLimitMode'] ?? 'none';
        $existingVote = null;

        if ($voteLimitMode === 'single_user' && $userId) {
            $existingVote = ArticlePollVote::query()
                ->where('poll_id', $pollId)
                ->where('user_id', $userId)
                ->first();
        } elseif ($voteLimitMode !== 'none') {
            $existingVote = ArticlePollVote::query()
                ->where('poll_id', $pollId)
                ->where('voter_key', $payload['voter_key'])
                ->first();
        }

        if ($existingVote) {
            if ($voteLimitMode === 'revote_after_time') {
                $retryAfter = ($poll['revoteAfterHours'] ?? 24) * 60 * 60 * 1000;
                $createdAtMs = $existingVote->created_at ? $existingVote->created_at->getTimestamp() * 1000 : 0;
                if ($createdAtMs + $retryAfter > $this->nowMs()) {
                    return response()->json([
                        'ok' => false,
                        'code' => 'revote_blocked',
                        'message' => $poll['repeatVoteError'] ?? 'Możesz zagłosować ponownie później',
                    ]);
                }
            } elseif ($voteLimitMode !== 'none') {
                return response()->json([
                    'ok' => false,
                    'code' => 'already_voted',
                    'message' => $poll['repeatVoteError'] ?? 'Ten głos został już oddany',
                ]);
            }

            $existingVote->update([
                'selections' => $pollType === 'scale' ? null : $selectionIds,
                'rating' => $pollType === 'scale' ? $payload['rating'] : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'ok' => true,
                'code' => 'vote_updated',
                'voteId' => $existingVote->id,
            ]);
        }

        $voteId = (string) Str::uuid();
        ArticlePollVote::query()->create([
            'id' => $voteId,
            'article_id' => $article->id,
            'poll_id' => $pollId,
            'user_id' => $userId,
            'voter_key' => $payload['voter_key'],
            'selections' => $pollType === 'scale' ? null : $selectionIds,
            'rating' => $pollType === 'scale' ? $payload['rating'] : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'ok' => true,
            'code' => 'vote_saved',
            'voteId' => $voteId,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['required', 'string'],
            'content' => ['required', 'string'],
            'category' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'published_at' => ['required', 'date'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Article())->getTable());
        $payload['id'] = (string) Str::uuid();

        $article = Article::create($payload);

        return (new ArticleResource($article))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Article $article)
    {
        return new ArticleResource($article);
    }

    public function update(Request $request, Article $article)
    {
        $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'excerpt' => ['sometimes', 'string'],
            'content' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string', 'max:255'],
            'author' => ['sometimes', 'string', 'max:255'],
            'published_at' => ['sometimes', 'date'],
        ]);

        $payload = PanelPayloadNormalizer::normalize($request->all(), (new Article())->getTable());

        $article->update($payload);

        return new ArticleResource($article->fresh());
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return response()->json(['message' => 'Article deleted']);
    }

    private function getPollState(?array $poll): array
    {
        if (!$poll || !($poll['enabled'] ?? false) || ($poll['status'] ?? null) === 'hidden') {
            return ['poll' => $poll, 'isAvailable' => false, 'isClosed' => true];
        }

        $now = $this->nowMs();
        $isBeforeStart = !empty($poll['startDate']) && $poll['startDate'] > $now;
        $isAfterEnd = !empty($poll['endDate']) && $poll['endDate'] < $now;
        $isClosed = ($poll['status'] ?? null) === 'closed'
            || (!empty($poll['autoCloseAfterEnd']) && !empty($poll['endDate']) && $isAfterEnd);

        return [
            'poll' => $poll,
            'isAvailable' => !$isBeforeStart && !$isClosed,
            'isClosed' => $isClosed,
        ];
    }

    private function nowMs(): int
    {
        return (int) round(microtime(true) * 1000);
    }
}
