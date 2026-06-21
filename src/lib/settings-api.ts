import { apiFetch } from "@/lib/api-client";

export type SettingsPayload = Record<string, unknown>;

export async function fetchAdminSettings() {
  const response = await apiFetch<any>("/admin/settings");
  return response?.data ?? response;
}

export async function updateAdminSettings(payload: SettingsPayload) {
  const response = await apiFetch<any>("/admin/settings", {
    method: "PUT",
    body: payload,
  });
  return response?.data ?? response;
}

export async function fetchGtfsMetadata() {
  const response = await apiFetch<any>("/admin/gtfs/metadata");
  return response?.data ?? response;
}

export async function updateGtfsData() {
  const response = await apiFetch<any>("/admin/gtfs/update", { method: "POST" });
  return response?.data ?? response;
}

export async function fetchAdminCategories() {
  const response = await apiFetch<any>("/admin/categories");
  return Array.isArray(response) ? response : response?.data ?? [];
}

export async function createAdminCategory(payload: Record<string, unknown>) {
  return apiFetch<any>("/admin/categories", { method: "POST", body: payload });
}

export async function updateAdminCategory(id: string, payload: Record<string, unknown>) {
  return apiFetch<any>(`/admin/categories/${id}`, { method: "PUT", body: payload });
}

export async function deleteAdminCategory(id: string) {
  return apiFetch<void>(`/admin/categories/${id}`, { method: "DELETE" });
}
