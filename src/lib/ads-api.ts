import { apiFetch } from "@/lib/api-client";

export type AdsQueryParams = Record<string, string | number | boolean | null | undefined>;

const buildQuery = (params: AdsQueryParams) => {
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

export async function fetchAds(params: AdsQueryParams = {}) {
  const query = buildQuery(params);
  return apiFetch<any>(`/ads${query ? `?${query}` : ""}`);
}

export async function fetchAdsPartners(params: AdsQueryParams = {}) {
  const query = buildQuery(params);
  return apiFetch<any>(`/ads/partners${query ? `?${query}` : ""}`);
}

export async function trackAdImpression(payload: Record<string, unknown>) {
  return apiFetch<any>("/ads/track-impression", { method: "POST", body: payload });
}

export async function trackAdClick(payload: Record<string, unknown>) {
  return apiFetch<any>("/ads/track-click", { method: "POST", body: payload });
}

export async function fetchAdsDashboardStats() {
  return apiFetch<any>("/admin/ads/dashboard-stats");
}

export async function fetchAdsCampaigns() {
  const response = await apiFetch<any>("/admin/ads/campaigns");
  return response?.data ?? response ?? [];
}

export async function fetchAdsCampaign(campaignId: string) {
  return apiFetch<any>(`/admin/ads/campaigns/${campaignId}`);
}

export async function saveAdsCampaign(campaignId: string | null, payload: Record<string, unknown>) {
  const path = campaignId ? `/admin/ads/campaigns/${campaignId}` : "/admin/ads/campaigns";
  const method = campaignId ? "PUT" : "POST";
  return apiFetch<any>(path, { method, body: payload });
}

export async function deleteAdsCampaign(campaignId: string) {
  return apiFetch<void>(`/admin/ads/campaigns/${campaignId}`, { method: "DELETE" });
}

export async function fetchAdsCreatives() {
  const response = await apiFetch<any>("/admin/ads/creatives");
  return response?.data ?? response ?? [];
}

export async function fetchAdsCreative(creativeId: string) {
  return apiFetch<any>(`/admin/ads/creatives/${creativeId}`);
}

export async function saveAdsCreative(creativeId: string | null, payload: Record<string, unknown>) {
  const path = creativeId ? `/admin/ads/creatives/${creativeId}` : "/admin/ads/creatives";
  const method = creativeId ? "PUT" : "POST";
  return apiFetch<any>(path, { method, body: payload });
}

export async function deleteAdsCreative(creativeId: string) {
  return apiFetch<void>(`/admin/ads/creatives/${creativeId}`, { method: "DELETE" });
}

export async function fetchAdsPlacements() {
  const response = await apiFetch<any>("/admin/ads/placements");
  return response?.data ?? response ?? [];
}

export async function saveAdsPlacement(placementId: string | null, payload: Record<string, unknown>) {
  const path = placementId ? `/admin/ads/placements/${placementId}` : "/admin/ads/placements";
  const method = placementId ? "PUT" : "POST";
  return apiFetch<any>(path, { method, body: payload });
}

export async function deleteAdsPlacement(placementId: string) {
  return apiFetch<void>(`/admin/ads/placements/${placementId}`, { method: "DELETE" });
}

export async function fetchAdsPartnersAdmin() {
  const response = await apiFetch<any>("/admin/ads/partners");
  return response?.data ?? response ?? [];
}

export async function fetchAdsPartner(partnerId: string) {
  return apiFetch<any>(`/admin/ads/partners/${partnerId}`);
}

export async function saveAdsPartner(partnerId: string | null, payload: Record<string, unknown>) {
  const path = partnerId ? `/admin/ads/partners/${partnerId}` : "/admin/ads/partners";
  const method = partnerId ? "PUT" : "POST";
  return apiFetch<any>(path, { method, body: payload });
}

export async function deleteAdsPartner(partnerId: string) {
  return apiFetch<void>(`/admin/ads/partners/${partnerId}`, { method: "DELETE" });
}

export async function fetchAdsInquiries() {
  const response = await apiFetch<any>("/admin/ads/inquiries");
  return response?.data ?? response ?? [];
}

export async function updateAdsInquiryStatus(inquiryId: string, payload: Record<string, unknown>) {
  return apiFetch<any>(`/admin/ads/inquiries/${inquiryId}/status`, { method: "PUT", body: payload });
}

export async function deleteAdsInquiry(inquiryId: string) {
  return apiFetch<void>(`/admin/ads/inquiries/${inquiryId}`, { method: "DELETE" });
}

export async function fetchAdsPricing() {
  const response = await apiFetch<any>("/admin/ads/pricing");
  return response?.data ?? response ?? [];
}

export async function saveAdsPricing(pricingId: string | null, payload: Record<string, unknown>) {
  const path = pricingId ? `/admin/ads/pricing/${pricingId}` : "/admin/ads/pricing";
  const method = pricingId ? "PUT" : "POST";
  return apiFetch<any>(path, { method, body: payload });
}

export async function deleteAdsPricing(pricingId: string) {
  return apiFetch<void>(`/admin/ads/pricing/${pricingId}`, { method: "DELETE" });
}

export async function fetchAdsGraphics() {
  const response = await apiFetch<any>("/admin/ads/graphics");
  return response?.data ?? response ?? [];
}

export async function createAdsGraphic(payload: Record<string, unknown>) {
  return apiFetch<any>("/admin/ads/graphics", { method: "POST", body: payload });
}

export async function deleteAdsGraphic(graphicId: string) {
  return apiFetch<void>(`/admin/ads/graphics/${graphicId}`, { method: "DELETE" });
}

export async function fetchAdsSettings() {
  return apiFetch<any>("/admin/ads/settings");
}

export async function updateAdsSettings(payload: Record<string, unknown>) {
  return apiFetch<any>("/admin/ads/settings", { method: "PUT", body: payload });
}
