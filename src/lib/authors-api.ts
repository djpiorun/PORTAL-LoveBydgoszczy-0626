import { apiFetch } from "@/lib/api-client";

export type Author = {
  id: string;
  name?: string | null;
  username?: string | null;
  slug?: string | null;
  image?: string | null;
  email?: string | null;
  role?: string | null;
  subtitle?: string | null;
  status?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
  coverImage?: string | null;
  isLoveBydgoszczTeam?: boolean | null;
};

type RawAuthor = {
  id: string;
  name?: string | null;
  username?: string | null;
  slug?: string | null;
  image?: string | null;
  email?: string | null;
  role?: string | null;
  subtitle?: string | null;
  status?: string | null;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
  cover_image?: string | null;
  is_love_bydgoszcz_team?: boolean | null;
};

const unwrapResource = <T>(payload: any): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
};

const normalizeAuthor = (data: RawAuthor): Author => ({
  id: data.id,
  name: data.name ?? null,
  username: data.username ?? null,
  slug: data.slug ?? null,
  image: data.image ?? null,
  email: data.email ?? null,
  role: data.role ?? null,
  subtitle: data.subtitle ?? null,
  status: data.status ?? null,
  description: data.description ?? null,
  contactEmail: data.contact_email ?? null,
  contactPhone: data.contact_phone ?? null,
  facebookUrl: data.facebook_url ?? null,
  instagramUrl: data.instagram_url ?? null,
  twitterUrl: data.twitter_url ?? null,
  websiteUrl: data.website_url ?? null,
  coverImage: data.cover_image ?? null,
  isLoveBydgoszczTeam: data.is_love_bydgoszcz_team ?? null,
});

export async function fetchAuthors() {
  const payload = await apiFetch<any>("/authors");
  const data = unwrapResource<RawAuthor[]>(payload) ?? [];
  return Array.isArray(data) ? data.map(normalizeAuthor) : [];
}

export async function fetchAuthorByIdentifier(identifier: string) {
  const payload = await apiFetch<any>(`/authors/${identifier}`);
  return normalizeAuthor(unwrapResource<RawAuthor>(payload));
}
