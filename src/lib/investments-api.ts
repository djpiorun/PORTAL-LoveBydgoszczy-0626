import { apiFetch } from "@/lib/api-client";

export type InvestmentsQueryParams = Record<string, string | number | boolean | null | undefined>;

const buildQuery = (params: InvestmentsQueryParams) => {
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

export async function fetchInvestments(params: InvestmentsQueryParams = {}) {
  const query = buildQuery(params);
  return apiFetch<any>(`/investments${query ? `?${query}` : ""}`);
}

export async function fetchInvestmentBySlug(slug: string) {
  return apiFetch<any>(`/investments/${slug}`);
}
