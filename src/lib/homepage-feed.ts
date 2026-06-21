import { apiFetch } from "@/lib/api-client";

const CACHE_TTL_MS = 60_000;

export type HomepageFeedEvent = {
  _id: string;
  slug?: string;
  title: string;
  category?: string;
  startDate?: string;
  location?: string;
  imageUrl?: string;
  description?: string;
};

export type HomepageFeedPlace = {
  _id: string;
  slug?: string;
  name: string;
  brandName?: string;
  category?: string;
  address?: string;
  imageUrl?: string;
  coverImage?: string;
  description?: string;
};

export type HomepageFeedBusiness = HomepageFeedPlace & {
  _creationTime: number;
};

export type HomepageFeed = {
  featuredEvents: HomepageFeedEvent[];
  featuredPlaces: HomepageFeedPlace[];
  newBusinesses: HomepageFeedBusiness[];
  filters: {
    eventCategories: string[];
    placeCategories: string[];
    businessCategories: string[];
  };
  configured: {
    featuredEventIds: string[];
    featuredPlaceIds: string[];
    newBusinessesLimit: number;
  };
};

type FeedCache = {
  data: HomepageFeed | null;
  fetchedAt: number;
  inflight: Promise<HomepageFeed> | null;
};

const feedCache: FeedCache = {
  data: null,
  fetchedAt: 0,
  inflight: null,
};

function getDirectoryBaseUrl() {
  return (import.meta.env.VITE_DIRECTORY_BASE_URL as string | undefined)?.replace(/\/+$/, "");
}

function normalizeSlug(value?: string | null) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.length > 0 ? normalized : null;
}

function normalizeFeed(feed: HomepageFeed): HomepageFeed {
  return {
    featuredEvents: Array.isArray(feed.featuredEvents)
      ? feed.featuredEvents.map((event) => ({
          ...event,
          slug: normalizeSlug(event.slug) ?? undefined,
        }))
      : [],
    featuredPlaces: Array.isArray(feed.featuredPlaces)
      ? feed.featuredPlaces.map((place) => ({
          ...place,
          slug: normalizeSlug(place.slug) ?? undefined,
        }))
      : [],
    newBusinesses: Array.isArray(feed.newBusinesses)
      ? feed.newBusinesses.map((business) => ({
          ...business,
          slug: normalizeSlug(business.slug) ?? undefined,
        }))
      : [],
    filters: {
      eventCategories: Array.isArray(feed.filters?.eventCategories) ? feed.filters.eventCategories : [],
      placeCategories: Array.isArray(feed.filters?.placeCategories) ? feed.filters.placeCategories : [],
      businessCategories: Array.isArray(feed.filters?.businessCategories) ? feed.filters.businessCategories : [],
    },
    configured: {
      featuredEventIds: Array.isArray(feed.configured?.featuredEventIds) ? feed.configured.featuredEventIds : [],
      featuredPlaceIds: Array.isArray(feed.configured?.featuredPlaceIds) ? feed.configured.featuredPlaceIds : [],
      newBusinessesLimit:
        typeof feed.configured?.newBusinessesLimit === "number" ? feed.configured.newBusinessesLimit : 0,
    },
  };
}

export async function fetchHomepageFeed() {
  const now = Date.now();
  if (feedCache.data && now - feedCache.fetchedAt < CACHE_TTL_MS) {
    return feedCache.data;
  }

  if (feedCache.inflight) {
    return feedCache.inflight;
  }

  feedCache.inflight = apiFetch<HomepageFeed>("/homepage-feed")
    .then((result) => {
      const normalized = normalizeFeed(result as HomepageFeed);
      feedCache.data = normalized;
      feedCache.fetchedAt = Date.now();
      return normalized;
    })
    .finally(() => {
      feedCache.inflight = null;
    });

  return feedCache.inflight;
}

export function getHomepageFeedAvailability() {
  return {
    hasDirectoryBaseUrl: Boolean(getDirectoryBaseUrl()),
  };
}

export function buildDirectoryHref(
  entityType: "wydarzenia" | "miejsca" | "firmy",
  slug: string | undefined,
  portalReturnUrl: string,
) {
  const baseUrl = getDirectoryBaseUrl();
  const safeSlug = normalizeSlug(slug);

  if (!baseUrl || !safeSlug) {
    return null;
  }

  const path = `/${entityType}/${safeSlug}`;
  const params = new URLSearchParams({
    from: "portal",
    portalReturn: portalReturnUrl,
  });

  return `${baseUrl}${path}?${params.toString()}`;
}

export function buildDirectoryListingHref(
  entityType: "wydarzenia" | "miejsca" | "firmy",
  portalReturnUrl: string,
) {
  const baseUrl = getDirectoryBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const params = new URLSearchParams({
    from: "portal",
    portalReturn: portalReturnUrl,
  });

  return `${baseUrl}/${entityType}?${params.toString()}`;
}

export function getPortalReturnUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
}