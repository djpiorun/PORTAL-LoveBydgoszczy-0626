import { apiFetch } from "@/lib/api-client";

export type EventQueryParams = Record<string, string | number | boolean | null | undefined>;

const buildQuery = (params: EventQueryParams) => {
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

export async function fetchEvents(params: EventQueryParams = {}) {
  const query = buildQuery(params);
  return apiFetch<any>(`/events${query ? `?${query}` : ""}`);
}

export async function fetchEventById(eventId: string) {
  return apiFetch<any>(`/events/${eventId}`);
}

export async function fetchAdminEvents() {
  const response = await apiFetch<any>("/admin/events");
  return response?.data ?? response ?? [];
}

export async function saveAdminEvent(eventId: string | null, payload: Record<string, unknown>) {
  const path = eventId ? `/admin/events/${eventId}` : "/admin/events";
  const method = eventId ? "PUT" : "POST";
  return apiFetch<any>(path, { method, body: payload });
}

export async function deleteAdminEvent(eventId: string) {
  return apiFetch<void>(`/admin/events/${eventId}`, { method: "DELETE" });
}
