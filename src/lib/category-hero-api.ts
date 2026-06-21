import { apiFetch } from "@/lib/api-client";

export async function fetchCategoryHeroConfig(categoryKey: string) {
  return apiFetch<any>(`/admin/category-hero-config/${categoryKey}`);
}

export async function updateCategoryHeroConfig(categoryKey: string, payload: Record<string, unknown>) {
  return apiFetch<any>(`/admin/category-hero-config/${categoryKey}`, {
    method: "PUT",
    body: payload,
  });
}
