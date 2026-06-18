import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Search, Store, Ticket } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  buildDirectoryHref,
  buildDirectoryListingHref,
  fetchHomepageFeed,
  getHomepageFeedAvailability,
  getPortalReturnUrl,
  type HomepageFeed,
  type HomepageFeedBusiness,
  type HomepageFeedEvent,
  type HomepageFeedPlace,
} from "@/lib/homepage-feed";

type FeedState =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: HomepageFeed; error: null }
  | { status: "error"; data: null; error: string };

function formatDate(value?: string) {
  if (!value) {
    return "Termin w katalogu";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Termin w katalogu";
  }

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonthShort(value?: string | number) {
  if (!value) {
    return "TER";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TER";
  }

  return date
    .toLocaleDateString("pl-PL", { month: "short" })
    .replace(".", "")
    .toUpperCase();
}

function formatDay(value?: string | number) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("pl-PL", { day: "2-digit" });
}

function formatTime(value?: string | number) {
  if (!value) {
    return "Godzina w katalogu";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Godzina w katalogu";
  }

  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return "Bezpłatne";
  }

  return `${value.toLocaleString("pl-PL")} zł`;
}

function getDaysRemaining(value?: string | number) {
  if (!value) {
    return null;
  }

  const today = new Date();
  const eventDate = new Date(value);
  if (Number.isNaN(eventDate.getTime())) {
    return null;
  }

  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function clampDescription(value?: string, fallback = "Szczegóły znajdziesz w katalogu Love Bydgoszcz.") {
  if (!value?.trim()) {
    return fallback;
  }

  return value.trim();
}

function getVisualImage(item: { coverImage?: string; imageUrl?: string }) {
  return item.coverImage || item.imageUrl || null;
}

function getPlaceCategoryTone(category?: string) {
  const tones: Record<
    string,
    { color: string; accent: string; emoji: string; text: string }
  > = {
    Kultura: { color: "from-purple-500 to-violet-600", accent: "#a855f7", emoji: "🎭", text: "text-purple-700" },
    Muzea: { color: "from-indigo-500 to-blue-600", accent: "#6366f1", emoji: "🏛️", text: "text-indigo-700" },
    Gastronomia: { color: "from-orange-500 to-amber-600", accent: "#f97316", emoji: "🍽️", text: "text-orange-700" },
    Rozrywka: { color: "from-pink-500 to-rose-600", accent: "#ec4899", emoji: "🎬", text: "text-pink-700" },
    Sport: { color: "from-green-500 to-emerald-600", accent: "#22c55e", emoji: "💪", text: "text-green-700" },
    Edukacja: { color: "from-blue-500 to-cyan-600", accent: "#3b82f6", emoji: "📚", text: "text-blue-700" },
    Kawiarnie: { color: "from-amber-500 to-yellow-600", accent: "#f59e0b", emoji: "☕", text: "text-amber-700" },
    Parki: { color: "from-teal-500 to-green-600", accent: "#14b8a6", emoji: "🌿", text: "text-teal-700" },
    Inne: { color: "from-slate-500 to-slate-700", accent: "#64748b", emoji: "📍", text: "text-slate-700" },
  };

  return tones[category || ""] ?? {
    color: "from-slate-500 to-slate-700",
    accent: "#0066B3",
    emoji: "📍",
    text: "text-slate-700",
  };
}

function getEventCategoryStyle(category?: string) {
  const styles: Record<string, string> = {
    Koncerty: "bg-violet-50 text-violet-700",
    Teatr: "bg-rose-50 text-rose-700",
    Sport: "bg-emerald-50 text-emerald-700",
    "Dla dzieci": "bg-pink-50 text-pink-700",
    Kino: "bg-blue-50 text-blue-700",
    Kultura: "bg-purple-50 text-purple-700",
    Rozrywka: "bg-amber-50 text-amber-700",
    Inne: "bg-slate-100 text-slate-700",
  };

  return styles[category || ""] ?? "bg-slate-100 text-slate-700";
}

function getBusinessCategoryStyle(category?: string) {
  const styles: Record<string, string> = {
    Gastronomia: "bg-orange-50 text-orange-700",
    Usługi: "bg-blue-50 text-blue-700",
    Zdrowie: "bg-emerald-50 text-emerald-700",
    Handel: "bg-violet-50 text-violet-700",
    Rozrywka: "bg-pink-50 text-pink-700",
    Sport: "bg-green-50 text-green-700",
    Kultura: "bg-purple-50 text-purple-700",
    Inne: "bg-slate-100 text-slate-700",
  };

  return styles[category || ""] ?? "bg-slate-100 text-slate-700";
}

function getBusinessRecommendationPercentage(business: HomepageFeedBusiness) {
  const candidateKeys = [
    "recommendationPercentage",
    "recommendedPercentage",
    "satisfactionPercentage",
    "polecaPercentage",
    "zadowolonychPercentage",
    "percentage",
    "percent",
  ] as const;

  for (const key of candidateKeys) {
    const value = (business as HomepageFeedBusiness & Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.min(100, Math.round(value)));
    }
  }

  return null;
}

function DirectoryPlaceholder({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <div className="flex h-full min-h-56 items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.02)),radial-gradient(circle_at_top,rgba(250,204,21,0.30),transparent_45%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.28),transparent_44%),linear-gradient(135deg,#0f172a,#1e293b)]">
      <div className="flex flex-col items-center gap-3 text-white/90">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
          <Icon className="h-7 w-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.22em]">{label}</span>
      </div>
    </div>
  );
}

function SectionShell({
  eyebrow,
  title,
  description,
  action,
  className,
  icon,
  tone,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  tone: FilterTone;
  children: React.ReactNode;
}) {
  const sectionTone = getSectionTone(tone);

  return (
    <section className={`mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 ${className ?? ""}`}>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {eyebrow ? <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p> : null}
          <div className={`${eyebrow ? "mt-1" : ""} flex items-center gap-2.5`}>
            {icon ? (
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${sectionTone.iconWrap}`}>
                {icon}
              </div>
            ) : null}
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${sectionTone.kicker}`}>Katalog</span>
              <h3 className="text-base font-black tracking-tight text-slate-950 sm:text-[17px] lg:text-lg">{title}</h3>
            </div>
          </div>
          {description ? <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs">{description}</p> : null}
        </div>
        {action ? <div className="relative z-50 flex shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function FeedErrorState({ error }: { error: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-6 text-sm text-slate-600 shadow-sm">
      <p className="font-semibold text-slate-900">Katalog jest chwilowo niedostępny.</p>
      <p className="mt-2 leading-6">{error}</p>
    </div>
  );
}

export function HomepageEventCard({ event }: { event: HomepageFeedEvent }) {
  const href = buildDirectoryHref("wydarzenia", event.slug, getPortalReturnUrl());
  const ticketPrice = (event as HomepageFeedEvent & { ticketPrice?: number }).ticketPrice;
  const daysRemaining = getDaysRemaining(event.startDate);
  const isSoon = typeof daysRemaining === "number" && daysRemaining >= 0 && daysRemaining <= 7;
  const CardTag = href ? "a" : "div";

  return (
    <article className="group relative flex h-full">
      <CardTag
        {...(href ? { href } : {})}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066B3] focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 sm:aspect-[4/3]">
          {getVisualImage(event) ? (
            <img
              src={getVisualImage(event) ?? ""}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <DirectoryPlaceholder icon={CalendarDays} label="Wydarzenie" />
          )}
          <div className="absolute left-2.5 top-2.5 z-20 w-[2.9rem] overflow-hidden rounded-[0.95rem] bg-white text-center shadow-[0_12px_24px_-14px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5 sm:left-3 sm:top-3 sm:w-[3.2rem] sm:rounded-[1rem]">
            <div className="bg-[#0066B3] px-1 py-0.5 text-[9px] font-black uppercase leading-none tracking-[0.08em] text-white sm:px-1.5 sm:py-1 sm:text-[10px]">
              {formatMonthShort(event.startDate)}
            </div>
            <div className="bg-white px-1 py-1 text-[1.2rem] font-black leading-none tracking-[-0.03em] text-slate-900 sm:px-1.5 sm:py-1.5 sm:text-[1.45rem]">
              {formatDay(event.startDate)}
            </div>
          </div>
          {isSoon ? (
            <div className="absolute right-2.5 top-2.5 z-20 sm:right-3 sm:top-3">
              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-rose-50/95 px-2 py-1 text-[9px] font-bold text-rose-600 shadow-sm ring-1 ring-rose-100/80 backdrop-blur-sm sm:text-[10px]">
                <Clock3 className="h-2.5 w-2.5" />
                {daysRemaining === 0 ? "Dziś" : daysRemaining === 1 ? "Jutro" : daysRemaining === 2 ? "Pojutrze" : `Za ${daysRemaining} dni`}
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-3.5">
          <div className="min-h-[6.8rem] sm:min-h-[7.35rem]">
            <h4 className="line-clamp-2 text-[14px] font-black leading-[1.18] text-slate-900 transition-colors group-hover:text-[#0066B3] sm:text-[15px]">
              {event.title}
            </h4>
            <div className="mt-1.5 flex min-h-[4.35rem] flex-col gap-1.5 rounded-xl border border-blue-100 bg-blue-50/50 p-2 sm:p-2.5">
              <div className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#0066B3]" />
                <span className="text-[10px] font-medium text-slate-600 sm:text-[11px]">{formatDate(event.startDate)}{` • ${formatTime(event.startDate)}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0066B3]" />
                <span className="line-clamp-1 text-[10px] font-medium text-slate-600 sm:text-[11px]">{event.location || "Lokalizacja"}</span>
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-1.5 sm:pt-2">
            <div className="flex items-center gap-1.5">
              <Ticket className={`h-4 w-4 ${ticketPrice ? "text-[#0066B3]" : "text-emerald-500"}`} />
              <span className={`text-[11px] font-bold sm:text-xs ${ticketPrice ? "text-[#0066B3]" : "text-emerald-500"}`}>{ticketPrice ? `od ${formatPrice(ticketPrice)}` : "Bezpłatne"}</span>
            </div>
            <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold sm:text-[10px] ${getEventCategoryStyle(event.category)}`}>
              {event.category || "Wydarzenie"}
            </span>
          </div>
        </div>
      </CardTag>
    </article>
  );
}

export function HomepagePlaceCard({ place }: { place: HomepageFeedPlace }) {
  const href = buildDirectoryHref("miejsca", place.slug, getPortalReturnUrl());
  const tone = getPlaceCategoryTone(place.category);

  return (
    <article className="group relative z-0 flex h-full w-full hover:z-30 focus-within:z-30">
      <a
        href={href ?? undefined}
        className="relative block h-full w-full overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066B3] focus-visible:ring-offset-2"
        style={{ aspectRatio: "16/10" }}
      >
        {getVisualImage(place) ? (
          <img
            src={getVisualImage(place) ?? ""}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <DirectoryPlaceholder icon={MapPin} label="Miejsce" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center p-3 text-center sm:p-4">
          <span className={`mb-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${tone.color} px-2 py-0.5 text-[9px] font-bold text-white shadow-sm sm:px-2.5 sm:text-[10px]`}>
            {tone.emoji} {place.category || "Miejsce"}
          </span>
          <h4 className="origin-bottom line-clamp-2 text-[15px] font-black leading-tight text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-105 sm:text-base">
            {place.brandName || place.name}
          </h4>
          {place.address ? (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-white/70 sm:mt-1.5 sm:text-[11px]">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[180px]">{place.address}</span>
            </div>
          ) : null}
        </div>
      </a>
    </article>
  );
}

export function HomepageBusinessCard({ business }: { business: HomepageFeedBusiness }) {
  const href = buildDirectoryHref("firmy", business.slug, getPortalReturnUrl());
  const subtitle = clampDescription(business.description, "Zobacz profil firmy i dane kontaktowe w katalogu.");
  const coverImage = business.coverImage || business.imageUrl;
  const logoImage = business.imageUrl || business.coverImage;
  const recommendationPercentage = getBusinessRecommendationPercentage(business);

  return (
    <article className="group">
      <a
        href={href ?? undefined}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066B3] focus-visible:ring-offset-2"
      >
        <div className="relative h-24 overflow-hidden bg-slate-100 sm:h-28">
          {coverImage ? (
            <img
              src={coverImage}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <DirectoryPlaceholder icon={Store} label="Firma" />
          )}
          <div className="absolute right-3 top-3">
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold shadow-sm backdrop-blur-sm sm:text-[10px] ${getBusinessCategoryStyle(business.category)}`}>
              {business.category || "Firma"}
            </span>
          </div>
        </div>
        <div className="relative flex flex-1 flex-col p-2.5 sm:px-3 sm:pb-2.5 sm:pt-3">
          <div className="-mt-7 mb-1.5 flex items-end gap-2 sm:-mt-8 sm:mb-2 sm:gap-2">
            <div className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-md sm:h-[3.8rem] sm:w-[3.8rem]">
              {logoImage ? (
                <img src={logoImage} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <Store className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <h4 className="mb-0.5 line-clamp-1 text-[16px] font-black leading-tight text-slate-900 transition-colors group-hover:text-[#0066B3] sm:text-[18px]">
              {business.brandName || business.name}
            </h4>
          </div>
          <div className="space-y-0.5">
            <div className="flex min-w-0 items-center text-[10px] text-slate-500 sm:text-[11px]">
              <MapPin className="mr-1 h-3 w-3 shrink-0 text-[#0066B3]" />
              <span className="truncate">{business.address || "Adres w katalogu"}</span>
            </div>
            <p className="line-clamp-2 text-[10px] leading-[1.45] text-slate-600 sm:text-[11px]">{subtitle}</p>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs sm:pt-2.5">
            <div className="flex min-w-0 items-center gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 sm:text-[10px]">
                <Store className="h-3 w-3" />
                Nowa
              </span>
              {recommendationPercentage !== null ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 sm:text-[10px]">
                  {recommendationPercentage}%
                </span>
              ) : null}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#0066B3] transition-colors duration-300 group-hover:bg-[#0066B3] group-hover:text-white">
              Zobacz firmę
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}

function SectionFallback({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
    </div>
  );
}

function SectionSkeleton({ cards }: { cards: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/80">
          <Skeleton className="aspect-[1.3] rounded-none" />
          <div className="space-y-2.5 p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function normalizeValue(value?: string) {
  return value?.trim().toLocaleLowerCase("pl-PL") ?? "";
}

function matchesCategory(itemCategory: string | undefined, activeCategory: string) {
  if (activeCategory === "Wszystkie") {
    return true;
  }

  return normalizeValue(itemCategory) === normalizeValue(activeCategory);
}

function matchesQuery(values: Array<string | undefined>, query: string) {
  const normalizedQuery = normalizeValue(query);
  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => normalizeValue(value).includes(normalizedQuery));
}

type FilterTone = "events" | "places" | "businesses";

function getSectionTone(tone: FilterTone) {
  if (tone === "places") {
    return {
      iconWrap: "bg-[linear-gradient(135deg,#f0fdfa,#ccfbf1)] text-teal-700 ring-1 ring-teal-100 shadow-[0_14px_28px_-18px_rgba(13,148,136,0.55)]",
      kicker: "text-teal-700",
      button: "border-teal-200/90 bg-white text-teal-700 hover:border-teal-600 hover:text-white",
      buttonFill: "bg-[linear-gradient(135deg,#0f766e,#0d9488)]",
    };
  }

  if (tone === "businesses") {
    return {
      iconWrap: "bg-[linear-gradient(135deg,#fff1f2,#ffe4e6)] text-rose-700 ring-1 ring-rose-100 shadow-[0_14px_28px_-18px_rgba(225,29,72,0.48)]",
      kicker: "text-rose-700",
      button: "border-rose-200/90 bg-white text-rose-700 hover:border-rose-600 hover:text-white",
      buttonFill: "bg-[linear-gradient(135deg,#db2777,#e11d48)]",
    };
  }

  return {
    iconWrap: "bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] text-[#0066B3] ring-1 ring-blue-100 shadow-[0_14px_28px_-18px_rgba(37,99,235,0.5)]",
    kicker: "text-[#0066B3]",
    button: "border-blue-200/90 bg-white text-[#0066B3] hover:border-[#0066B3] hover:text-white",
    buttonFill: "bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]",
  };
}

function getFilterTone(tone: FilterTone) {
  if (tone === "places") {
    return {
      active: "bg-teal-600 text-white shadow-md shadow-teal-600/20 hover:bg-teal-700",
      inactive: "border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700",
      iconActive: "border-teal-200 bg-teal-50 text-teal-700",
      iconInactive: "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-teal-700",
      inputRing: "focus-visible:ring-teal-600",
    };
  }

  if (tone === "businesses") {
    return {
      active: "bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-700",
      inactive: "border border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700",
      iconActive: "border-rose-200 bg-rose-50 text-rose-700",
      iconInactive: "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-700",
      inputRing: "focus-visible:ring-rose-600",
    };
  }

  return {
    active: "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700",
    inactive: "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
    iconActive: "border-blue-200 bg-blue-50 text-[#0066B3]",
    iconInactive: "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-[#0066B3]",
    inputRing: "focus-visible:ring-[#0066B3]",
  };
}

function SectionFilters({
  categories,
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  tone,
}: {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  tone: FilterTone;
}) {
  const allCategories = Array.from(new Set(["Wszystkie", ...categories.filter(Boolean)]));
  const [searchOpen, setSearchOpen] = useState(false);
  const styles = getFilterTone(tone);

  return (
    <div className="mb-1 flex flex-col gap-1 sm:mb-1.5">
      <div className="flex max-w-full items-center gap-1 self-start overflow-x-auto pb-0.5 lg:self-auto [&::-webkit-scrollbar]:hidden sm:gap-1">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`h-6 shrink-0 whitespace-nowrap rounded-full px-2 text-[9px] font-black tracking-[0.01em] transition-all sm:h-7 sm:px-2.5 sm:text-[10px] ${
              activeCategory === category
                ? styles.active
                : styles.inactive
            }`}
          >
            {category}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSearchOpen((current) => !current)}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:h-7 sm:w-7 ${
            searchOpen
              ? styles.iconActive
              : styles.iconInactive
          }`}
          aria-label={searchOpen ? "Zamknij wyszukiwanie" : "Otwórz wyszukiwanie"}
        >
          <Search className={`h-3 w-3 transition-transform duration-300 ${searchOpen ? "scale-110 rotate-[-6deg]" : "hover:scale-110"}`} />
        </button>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-10 opacity-100" : "max-h-0 opacity-0"}`}>
        <label className="relative block w-full min-w-0 sm:min-w-[220px] lg:w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Filtruj"
            className={`h-8 w-full rounded-full border border-slate-200 bg-white pl-8 pr-3 text-[12px] font-bold outline-none transition-colors placeholder:text-slate-400 focus-visible:ring-1 ${styles.inputRing} sm:h-9 sm:text-[13px]`}
          />
        </label>
      </div>
    </div>
  );
}

function HorizontalCards<T extends { _id: string }>({
  items,
  renderItem,
  label,
  itemClassName,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  label: string;
  itemClassName?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: "left" | "right") => {
    const viewport = scrollerRef.current;
    if (!viewport) return;
    const firstCard = viewport.firstElementChild as HTMLElement | null;
    const gap = window.innerWidth >= 640 ? 16 : 12;
    const amount = firstCard ? firstCard.offsetWidth + gap : Math.max(viewport.clientWidth * 0.82, 240);
    viewport.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative overflow-visible">
      <button
        type="button"
        onClick={() => scrollByCards("left")}
        aria-label={`Przewiń ${label} w lewo`}
        className="absolute left-1 top-1/2 z-[90] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-700 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-md transition-all duration-300 hover:-translate-y-[52%] hover:scale-105 hover:border-[#0066B3]/25 hover:bg-[#0066B3] hover:text-white lg:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollerRef}
        className="-mb-12 overflow-x-auto px-0 pb-12 pt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="relative flex snap-x snap-mandatory items-stretch gap-3 overflow-visible py-2 sm:gap-4 sm:py-3">
          {items.map((item) => (
            <div
              key={item._id}
              className={`relative flex snap-start overflow-visible py-1 ${itemClassName || "w-[250px] min-w-[250px] flex-none sm:w-[270px] sm:min-w-[270px] lg:w-[235px] lg:min-w-[235px] xl:w-[220px] xl:min-w-[220px] 2xl:w-[220px] 2xl:min-w-[220px]"}`}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => scrollByCards("right")}
        aria-label={`Przewiń ${label} w prawo`}
        className="absolute right-1 top-1/2 z-[90] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-700 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-md transition-all duration-300 hover:-translate-y-[52%] hover:scale-105 hover:border-[#0066B3]/25 hover:bg-[#0066B3] hover:text-white lg:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function SectionLinkButton({ href, label, tone }: { href: string | null; label: string; tone: FilterTone }) {
  if (!href) return null;
  const sectionTone = getSectionTone(tone);

  return (
    <a
      href={href}
      className={`group relative z-[60] isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-4 py-2 text-[11px] font-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 sm:text-xs ${sectionTone.button}`}
    >
      <span className={`absolute inset-0 -z-0 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${sectionTone.buttonFill}`} aria-hidden="true" />
      <span className="relative z-10">{label}</span>
      <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-colors duration-300 group-hover:text-white" />
    </a>
  );
}

function EventsGrid({ items }: { items: HomepageFeedEvent[] }) {
  if (items.length === 0) {
    return (
      <SectionFallback
        title="Brak najbliższych wydarzeń"
        description="Ta sekcja wróci automatycznie, gdy katalog zwróci najbliższe publiczne wydarzenia."
      />
    );
  }

  return (
    <HorizontalCards
      items={items}
      label="wydarzenia"
      itemClassName="w-[265px] min-w-[265px] flex-none snap-start sm:w-[300px] sm:min-w-[300px] lg:w-[285px] lg:min-w-[285px] xl:w-[292px] xl:min-w-[292px] 2xl:w-[292px] 2xl:min-w-[292px]"
      renderItem={(event: HomepageFeedEvent) => <HomepageEventCard event={event} />}
    />
  );
}

function PlacesGrid({ items }: { items: HomepageFeedPlace[] }) {
  if (items.length === 0) {
    return (
      <SectionFallback
        title="Brak polecanych miejsc"
        description="Układ pozostaje stabilny, a sekcja wróci po publikacji miejsc w publicznym feedzie katalogu."
      />
    );
  }

  return <HorizontalCards items={items} label="miejsca" renderItem={(place: HomepageFeedPlace) => <HomepagePlaceCard place={place} />} />;
}

function BusinessesGrid({ items }: { items: HomepageFeedBusiness[] }) {
  if (items.length === 0) {
    return (
      <SectionFallback
        title="Brak nowych firm"
        description="Sekcja pokazuje tylko aktywne, publiczne firmy z katalogu. Gdy feed będzie pusty, portal nie wyświetla błędów."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {items.map((business) => (
        <HomepageBusinessCard key={business._id} business={business} />
      ))}
    </div>
  );
}

export default function HomepageDirectoryFeed() {
  return <HomepageDirectoryFeedSections sections={["events", "places", "businesses"]} />;
}

type HomepageDirectoryFeedSection = "events" | "places" | "businesses";

export function HomepageDirectoryFeedSections({
  sections,
  backgroundClassName,
}: {
  sections: HomepageDirectoryFeedSection[];
  backgroundClassName?: string;
}) {
  const [state, setState] = useState<FeedState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [eventCategory, setEventCategory] = useState("Wszystkie");
  const [placeCategory, setPlaceCategory] = useState("Wszystkie");
  const [businessCategory, setBusinessCategory] = useState("Wszystkie");
  const [eventQuery, setEventQuery] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [businessQuery, setBusinessQuery] = useState("");
  const availability = getHomepageFeedAvailability();

  useEffect(() => {
    let cancelled = false;

    fetchHomepageFeed()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setState({ status: "success", data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Nie udało się pobrać publicznego feedu katalogu.";
        setState({ status: "error", data: null, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const missingEnvVars = [
    !availability.hasDirectoryConvexUrl ? "`VITE_DIRECTORY_CONVEX_URL`" : null,
    !availability.hasDirectoryBaseUrl ? "`VITE_DIRECTORY_BASE_URL`" : null,
  ].filter(Boolean);
  const envErrorMessage =
    missingEnvVars.length > 0
      ? `Brakuje konfiguracji ${missingEnvVars.join(" i ")}, więc portal nie może wykonać pełnego połączenia z katalogiem.`
      : null;
  const errorMessage = envErrorMessage || state.error;
  const feed = state.status === "success" ? state.data : null;
  const portalReturnUrl = getPortalReturnUrl();
  const eventsListingHref = buildDirectoryListingHref("wydarzenia", portalReturnUrl);
  const placesListingHref = buildDirectoryListingHref("miejsca", portalReturnUrl);
  const businessesListingHref = buildDirectoryListingHref("firmy", portalReturnUrl);
  const visibleSections = new Set(sections);
  const filteredEvents =
    feed?.featuredEvents
      .filter((event) => matchesCategory(event.category, eventCategory))
      .filter((event) => matchesQuery([event.title, event.location, event.description], eventQuery))
      .slice(0, 5) ?? [];
  const filteredPlaces =
    feed?.featuredPlaces
      .filter((place) => matchesCategory(place.category, placeCategory))
      .filter((place) => matchesQuery([place.name, place.brandName, place.address, place.description], placeQuery))
      .slice(0, 5) ?? [];
  const filteredBusinesses =
    feed?.newBusinesses
      .filter((business) => matchesCategory(business.category, businessCategory))
      .filter((business) => matchesQuery([business.name, business.brandName, business.address, business.description], businessQuery))
      .slice(0, 8) ?? [];

  return (
    <div className={`relative ${backgroundClassName ?? "bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(249,250,251,0.88)_18%,rgba(248,250,252,0.96)_100%)]"}`}>
      {visibleSections.has("events") ? (
        <SectionShell
          title="Najbliższe wydarzenia"
          action={<SectionLinkButton href={eventsListingHref} label="Zobacz Wydarzenia" tone="events" />}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="events"
        >
          {state.status === "loading" ? (
            <SectionSkeleton cards={4} />
          ) : errorMessage ? (
            <FeedErrorState error={errorMessage} />
          ) : (
            <>
              <SectionFilters
                categories={feed?.filters.eventCategories ?? []}
                activeCategory={eventCategory}
                onCategoryChange={setEventCategory}
                query={eventQuery}
                onQueryChange={setEventQuery}
                tone="events"
              />
              <EventsGrid items={filteredEvents} />
            </>
          )}
        </SectionShell>
      ) : null}

      {visibleSections.has("places") ? (
        <SectionShell
          title="Polecane miejsca"
          action={<SectionLinkButton href={placesListingHref} label="Poznaj Miejsca" tone="places" />}
          className="relative z-20 pb-4 sm:pb-5"
          icon={<MapPin className="h-4 w-4" />}
          tone="places"
        >
          {state.status === "loading" ? (
            <SectionSkeleton cards={4} />
          ) : errorMessage ? (
            <FeedErrorState error={errorMessage} />
          ) : (
            <>
              <SectionFilters
                categories={feed?.filters.placeCategories ?? []}
                activeCategory={placeCategory}
                onCategoryChange={setPlaceCategory}
                query={placeQuery}
                onQueryChange={setPlaceQuery}
                tone="places"
              />
              <PlacesGrid items={filteredPlaces} />
            </>
          )}
        </SectionShell>
      ) : null}

      {visibleSections.has("businesses") ? (
        <SectionShell
          title="Nowe firmy w bazie"
          action={<SectionLinkButton href={businessesListingHref} label="Zobacz Katalog Firm" tone="businesses" />}
          className="relative z-0"
          icon={<Store className="h-4 w-4" />}
          tone="businesses"
        >
          {state.status === "loading" ? (
            <SectionSkeleton cards={8} />
          ) : errorMessage ? (
            <FeedErrorState error={errorMessage} />
          ) : (
            <>
              <SectionFilters
                categories={feed?.filters.businessCategories ?? []}
                activeCategory={businessCategory}
                onCategoryChange={setBusinessCategory}
                query={businessQuery}
                onQueryChange={setBusinessQuery}
                tone="businesses"
              />
              <BusinessesGrid items={filteredBusinesses} />
            </>
          )}
        </SectionShell>
      ) : null}
    </div>
  );
}
