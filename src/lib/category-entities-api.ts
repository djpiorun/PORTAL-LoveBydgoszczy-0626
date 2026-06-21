import { apiFetch } from "@/lib/api-client";

const normalizeCategoryEntities = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export async function fetchCategoryEntities(categoryKey?: string, entityType?: string) {
  const encodedCategory = categoryKey ? encodeURIComponent(categoryKey) : null;
  const encodedType = entityType ? encodeURIComponent(entityType) : null;
  const endpoint = encodedCategory
    ? encodedType
      ? `/category-entities/${encodedCategory}/${encodedType}`
      : `/category-entities/${encodedCategory}`
    : "/category-entities";

  const response = await apiFetch<any>(endpoint);
  return normalizeCategoryEntities(response);
}

export async function createCategoryEntity(payload: Record<string, unknown>) {
  return apiFetch<any>("/admin/category-entities", { method: "POST", body: payload });
}

export async function updateCategoryEntity(id: string, payload: Record<string, unknown>) {
  return apiFetch<any>(`/admin/category-entities/${id}`, { method: "PUT", body: payload });
}

export async function deleteCategoryEntity(id: string) {
  return apiFetch<void>(`/admin/category-entities/${id}`, { method: "DELETE" });
}
