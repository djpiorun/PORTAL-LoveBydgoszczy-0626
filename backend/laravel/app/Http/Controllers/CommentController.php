<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $payload = $request->validate([
            'target_id' => ['required', 'string'],
            'target_type' => ['required', 'string'],
        ]);

        $comments = Comment::query()
            ->where('target_id', $payload['target_id'])
            ->where('target_type', $payload['target_type'])
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json([
            'data' => $comments->map(fn (Comment $comment) => $this->transform($comment)),
        ]);
    }

    public function count(Request $request)
    {
        $payload = $request->validate([
            'target_id' => ['required', 'string'],
            'target_type' => ['required', 'string'],
        ]);

        $count = Comment::query()
            ->where('target_id', $payload['target_id'])
            ->where('target_type', $payload['target_type'])
            ->where('status', 'approved')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function adminIndex()
    {
        $comments = Comment::query()
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $comments->map(fn (Comment $comment) => $this->transform($comment)),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'target_id' => ['required', 'string'],
            'target_type' => ['required', 'string'],
            'author_name' => ['required', 'string'],
            'content' => ['required', 'string'],
            'parent_id' => ['nullable', 'uuid'],
        ]);

        $content = trim($payload['content']);
        if (mb_strlen($content) < 2) {
            return response()->json(['message' => 'Komentarz jest za krótki.'], 422);
        }
        if (mb_strlen($content) > 2000) {
            return response()->json(['message' => 'Komentarz jest za długi (max 2000 znaków).'], 422);
        }

        $authorName = trim($payload['author_name']);
        if (mb_strlen($authorName) < 2) {
            return response()->json(['message' => 'Podaj imię lub pseudonim.'], 422);
        }

        $recent = Comment::query()
            ->where('target_id', $payload['target_id'])
            ->where('target_type', $payload['target_type'])
            ->orderByDesc('created_at')
            ->first();

        if ($recent && $recent->created_at && $recent->created_at->diffInSeconds(now()) < 15) {
            return response()->json(['message' => 'Zbyt wiele komentarzy. Poczekaj chwilę przed dodaniem kolejnego.'], 429);
        }

        $comment = Comment::create([
            'id' => (string) Str::uuid(),
            'target_id' => $payload['target_id'],
            'target_type' => $payload['target_type'],
            'author_name' => $authorName,
            'content' => $content,
            'likes' => 0,
            'status' => 'approved',
            'parent_id' => $payload['parent_id'] ?? null,
        ]);

        return response()->json(['data' => $this->transform($comment)], 201);
    }

    public function like(Comment $comment)
    {
        $comment->update(['likes' => $comment->likes + 1]);

        return response()->json(['data' => $this->transform($comment->fresh())]);
    }

    public function updateStatus(Request $request, Comment $comment)
    {
        $this->authorizeModerator($request);

        $payload = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $comment->update(['status' => $payload['status']]);

        return response()->json(['data' => $this->transform($comment->fresh())]);
    }

    public function destroy(Request $request, Comment $comment)
    {
        $this->authorizeModerator($request);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }

    private function authorizeModerator(Request $request): void
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'member'], true)) {
            abort(403, 'Unauthorized');
        }
    }

    private function transform(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'target_id' => $comment->target_id,
            'target_type' => $comment->target_type,
            'author_name' => $comment->author_name,
            'content' => $comment->content,
            'likes' => $comment->likes,
            'status' => $comment->status,
            'parent_id' => $comment->parent_id,
            'created_at' => $comment->created_at,
            'updated_at' => $comment->updated_at,
        ];
    }
}
