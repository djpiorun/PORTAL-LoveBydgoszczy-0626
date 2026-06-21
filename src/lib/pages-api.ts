import { apiFetch } from "@/lib/api-client";

export type PagePayload = Record<string, unknown>;

export async function fetchAdminPages() {
  const response = await apiFetch<any>("/admin/pages");
  return Array.isArray(response) ? response : response?.data ?? [];
}

export async function fetchPageVersions(pageId: string) {
  const response = await apiFetch<any>(`/admin/pages/${pageId}/versions`);
  return Array.isArray(response) ? response : response?.data ?? [];
}

export async function createPage(payload: PagePayload) {
  return apiFetch<any>("/admin/pages", { method: "POST", body: payload });
}

export async function updatePage(pageId: string, payload: PagePayload) {
  return apiFetch<any>(`/admin/pages/${pageId}`, { method: "PUT", body: payload });
}

export async function deletePage(pageId: string) {
  return apiFetch<void>(`/admin/pages/${pageId}`, { method: "DELETE" });
}

export async function restorePage(pageId: string) {
  return apiFetch<any>(`/admin/pages/${pageId}/restore`, { method: "PUT" });
}

export async function archivePage(pageId: string) {
  return apiFetch<any>(`/admin/pages/${pageId}/archive`, { method: "PUT" });
}

export async function unarchivePage(pageId: string) {
  return apiFetch<any>(`/admin/pages/${pageId}/unarchive`, { method: "PUT" });
}

export async function duplicatePage(pageId: string) {
  return apiFetch<any>(`/admin/pages/${pageId}/duplicate`, { method: "POST" });
}

export async function seedPages() {
  return apiFetch<any>("/admin/pages/seed", { method: "POST" });
}

export async function rollbackPage(pageId: string, versionId: string) {
  return apiFetch<any>(`/admin/pages/${pageId}/rollback`, {
    method: "POST",
    body: { version_id: versionId },
  });
}

export async function hardDeletePage(pageId: string, confirmationSlug: string) {
  return apiFetch<void>(`/admin/pages/${pageId}/hard`, {
    method: "DELETE",
    body: { confirmation_slug: confirmationSlug },
  });
}
