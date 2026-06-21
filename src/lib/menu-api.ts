import { apiFetch } from "@/lib/api-client";

export type MenuItemPayload = Record<string, unknown>;

export async function fetchMenuItems() {
  const response = await apiFetch<any>("/admin/menu-items");
  return Array.isArray(response) ? response : response?.data ?? [];
}

export async function seedMenuItems() {
  return apiFetch<any>("/admin/menu-items/seed", { method: "POST" });
}

export async function createMenuItem(payload: MenuItemPayload) {
  return apiFetch<any>("/admin/menu-items", { method: "POST", body: payload });
}

export async function updateMenuItem(id: string, payload: MenuItemPayload) {
  return apiFetch<any>(`/admin/menu-items/${id}`, { method: "PUT", body: payload });
}

export async function deleteMenuItem(id: string) {
  return apiFetch<void>(`/admin/menu-items/${id}`, { method: "DELETE" });
}
