import { apiFetch } from "@/lib/api-client";

export type ReelsQueryParams = Record<string, string | number | boolean | null | undefined>;

const buildQuery = (params: ReelsQueryParams) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") {
      if (value) searchParams.set(key, "true");
      return;
    }
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

const toTimestamp = (value?: string | number | null) => {
  if (typeof value === "number") return value;
  if (!value) return Date.now();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

export const normalizeReel = (reel: any) => ({
  _id: String(reel?.id ?? reel?._id ?? ""),
  title: reel?.title ?? "",
  description: reel?.description ?? null,
  coverImage: reel?.coverImage ?? reel?.cover_image ?? reel?.cover ?? null,
  author: reel?.author ?? reel?.author_name ?? null,
  category: reel?.category ?? null,
  sourceType: reel?.sourceType ?? reel?.source_type ?? "upload",
  videoUrl: reel?.videoUrl ?? reel?.video_url ?? reel?.url ?? "",
  embedUrl: reel?.embedUrl ?? reel?.embed_url ?? null,
  likes: reel?.likes ?? reel?.likes_count ?? 0,
  views: reel?.views ?? reel?.views_count ?? 0,
  isActive: reel?.isActive ?? reel?.is_active ?? true,
  publishedAt: toTimestamp(reel?.publishedAt ?? reel?.published_at ?? reel?.created_at),
});

export const normalizeReelsPayload = (payload: any) => {
  const data = payload?.data ?? payload?.reels ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeReel) : [];
};

export async function fetchReels(params: ReelsQueryParams = {}) {
  const query = buildQuery(params);
  const payload = await apiFetch<any>(`/reels${query ? `?${query}` : ""}`);
  return normalizeReelsPayload(payload);
}

export async function fetchReelStories() {
  const payload = await apiFetch<any>("/reels/stories");
  return normalizeReelsPayload(payload);
}

export async function likeReel(reelId: string, payload?: Record<string, unknown>) {
  return apiFetch<any>(`/reels/${reelId}/like`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchAdminReels() {
  const response = await apiFetch<any>("/admin/reels");
  return response?.data ?? response ?? [];
}

export async function saveAdminReel(reelId: string | null, payload: Record<string, unknown>) {
  const path = reelId ? `/admin/reels/${reelId}` : "/admin/reels";
  const method = reelId ? "PUT" : "POST";
  return apiFetch<any>(path, { method, body: payload });
}

export async function deleteAdminReel(reelId: string) {
  return apiFetch<void>(`/admin/reels/${reelId}`, { method: "DELETE" });
}

export async function seedAdminReels() {
  return apiFetch<any>("/admin/reels/seed", { method: "POST" });
}
