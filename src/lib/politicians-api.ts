import { apiFetch } from "@/lib/api-client";

export type PoliticiansQueryParams = Record<string, string | number | boolean | null | undefined>;

const buildQuery = (params: PoliticiansQueryParams) => {
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

export async function fetchPoliticians(params: PoliticiansQueryParams = {}) {
  const query = buildQuery(params);
  return apiFetch<any>(`/politicians${query ? `?${query}` : ""}`);
}

export async function fetchPoliticianBySlug(slug: string) {
  return apiFetch<any>(`/politicians/${slug}`);
}
