import { apiFetch } from "@/lib/api-client";

export type UpdatesQueryParams = Record<string, string | number | boolean | null | undefined>;

const buildQuery = (params: UpdatesQueryParams) => {
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

export const normalizeUpdate = (update: any) => ({
  _id: String(update?.id ?? update?._id ?? ""),
  title: update?.title ?? "",
  category: update?.category ?? null,
  description: update?.description ?? update?.content ?? null,
  location: update?.location ?? null,
  mediaUrl: update?.mediaUrl ?? update?.media_url ?? null,
  mediaType: update?.mediaType ?? update?.media_type ?? null,
  linkUrl: update?.linkUrl ?? update?.link_url ?? null,
  linkLabel: update?.linkLabel ?? update?.link_label ?? null,
  publishedAt: toTimestamp(update?.publishedAt ?? update?.published_at ?? update?.created_at),
});

export const normalizeUpdatesPayload = (payload: any) => {
  const data = payload?.data ?? payload?.updates ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeUpdate) : [];
};

export async function fetchUpdates(params: UpdatesQueryParams = {}) {
  const query = buildQuery(params);
  return apiFetch<any>(`/updates${query ? `?${query}` : ""}`);
}

export async function fetchAdminUpdates() {
  const response = await apiFetch<any>("/admin/updates");
  return response?.data ?? response ?? [];
}

export async function createAdminUpdate(payload: Record<string, unknown>) {
  return apiFetch<any>("/admin/updates", { method: "POST", body: payload });
}

export async function updateAdminUpdate(updateId: string, payload: Record<string, unknown>) {
  return apiFetch<any>(`/admin/updates/${updateId}`, { method: "PUT", body: payload });
}

export async function deleteAdminUpdate(updateId: string) {
  return apiFetch<void>(`/admin/updates/${updateId}`, { method: "DELETE" });
}

export async function createArticleUpdate(articleId: string, payload: Record<string, unknown>) {
  return apiFetch<any>(`/articles/${articleId}/updates`, { method: "POST", body: payload });
}

export async function updateArticleUpdate(articleId: string, updateId: string, payload: Record<string, unknown>) {
  return apiFetch<any>(`/articles/${articleId}/updates/${updateId}`, { method: "PUT", body: payload });
}

export async function deleteArticleUpdate(articleId: string, updateId: string) {
  return apiFetch<void>(`/articles/${articleId}/updates/${updateId}`, { method: "DELETE" });
}
