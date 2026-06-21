import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, BarChart3, Building2, Check, ChevronDown, ChevronRight, ChevronUp, Globe, Layers,
  Pencil, Plus, Save, Settings2, Shield, Tag, Trash2, Trophy, Users, Archive, Eye, EyeOff, Star,
} from "lucide-react";
import { toast } from "sonner";
import { ADMIN_CATEGORY_DEFINITIONS, type AdminCategorySubcategory } from "@/lib/adminCategories";
import { apiFetch } from "@/lib/api-client";
import {
  createCategoryEntity,
  deleteCategoryEntity,
  fetchCategoryEntities,
  updateCategoryEntity,
} from "@/lib/category-entities-api";
import {
  fetchCategoryHeroConfig,
  updateCategoryHeroConfig,
} from "@/lib/category-hero-api";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "@/lib/settings-api";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryItem = {
  _id?: string;
  key: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
  type?: "basic" | "advanced";
  routeSlug?: string;
  subcategories?: AdminCategorySubcategory[];
  order: number;
  isActive: boolean;
  isDefault?: boolean;
};

type SportTeamForm = {
  id?: string;
  name: string; shortName: string; slug: string; logo: string;
  sportType: "pilka_nozna" | "zuzel" | "siatkowka" | "inne";
  league: string; city: string; stadium: string; website: string; isActive: boolean;
};

type SportPlayerForm = {
  id?: string;
  fullName: string; slug: string; teamId?: string; teamName: string;
  sportType: "pilka_nozna" | "zuzel" | "siatkowka" | "inne";
  number: string; position: string; photo: string; bio: string; isActive: boolean;
};

type PoliticianForm = {
  id?: string;
  fullName: string; slug: string; party: string; position: string;
  photo: string; websiteUrl: string; facebookUrl: string; twitterUrl: string;
  bio: string; isActive: boolean;
};

type InvestmentForm = {
  id?: string;
  projectName: string; slug: string; description: string;
  projectStatus: "planowana" | "w_trakcie" | "zakonczona" | "wstrzymana";
  location: string; startDate: string; endDate: string;
  budget: string; contractor: string; investor: string;
  progressPercent: number; mainImageUrl: string; isActive: boolean;
};

type CategoryEntityItem = {
  _id: string;
  categoryKey: string; entityType: string; name: string; slug: string;
  description?: string; color?: string; icon?: string;
  parentId?: string; externalRef?: string;
  metadata?: string; isActive?: boolean; order?: number;
};

type CategoryEntityForm = {
  id?: string;
  entityType: string; name: string; slug: string; description: string;
  color: string; icon: string; parentId?: string;
  externalRef: string; metadata: string; isActive: boolean; order: number;
};

type EntitySectionConfig = {
  type: string; label: string; description: string; supportsParent?: boolean;
};

// Hero config item for local state
type HeroConfigItem = {
  itemId: string;
  order: number;
  isVisible: boolean;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const ENTITY_SECTION_CONFIG: Record<string, EntitySectionConfig[]> = {
  sport: [
    { type: "sport_league", label: "Ligi", description: "Rozgrywki ligowe dostępne do przypinania w artykułach." },
    { type: "sport_season", label: "Sezony", description: "Sezony powiązane z ligami i materiałami sportowymi.", supportsParent: true },
    { type: "sport_table", label: "Tabele i rankingi", description: "Ranking lub tabela ligowa dla artykułu.", supportsParent: true },
    { type: "sport_event", label: "Wydarzenia i mecze", description: "Mecze, kolejki i wydarzenia sportowe.", supportsParent: true },
  ],
  polityka: [
    { type: "political_group", label: "Ugrupowania", description: "Partie, komitety i kluby polityczne." },
    { type: "political_position", label: "Stanowiska", description: "Stanowiska i funkcje publiczne." },
    { type: "political_material_type", label: "Typy materiałów", description: "Format materiału politycznego." },
    { type: "political_event", label: "Wydarzenia polityczne", description: "Timeline, głosowania i wydarzenia.", supportsParent: true },
  ],
  inwestycje: [
    { type: "investment_contractor", label: "Wykonawcy", description: "Firmy i wykonawcy inwestycji." },
    { type: "investment_location", label: "Lokalizacje", description: "Adresy i obszary inwestycji." },
    { type: "investment_type", label: "Typy inwestycji", description: "Typy i segmenty inwestycyjne." },
    { type: "investment_status", label: "Statusy", description: "Statusy realizacji inwestycji." },
    { type: "investment_phase", label: "Etapy", description: "Etapy i fazy realizacji inwestycji." },
  ],
  nasze_dzialania: [
    { type: "action_partner", label: "Partnerzy", description: "Partnerzy akcji, projektów i kampanii." },
    { type: "action_project", label: "Projekty", description: "Projekty redakcyjne i społeczne." },
    { type: "action_campaign", label: "Kampanie", description: "Kampanie przypinane do artykułów." },
    { type: "action_type", label: "Typy działań", description: "Typy aktywności i formatów działań." },
    { type: "action_result", label: "Wyniki i efekty", description: "Rezultaty, KPI i efekty działań." },
  ],
};

const ADVANCED_TABS: Record<string, { key: string; label: string; icon: React.ReactNode }[]> = {
  sport: [
    { key: "settings", label: "Ustawienia", icon: <Settings2 className="h-4 w-4" /> },
    { key: "teams", label: "Drużyny", icon: <Trophy className="h-4 w-4" /> },
    { key: "players", label: "Zawodnicy", icon: <Users className="h-4 w-4" /> },
    { key: "entities", label: "Słowniki", icon: <Layers className="h-4 w-4" /> },
  ],
  polityka: [
    { key: "settings", label: "Ustawienia", icon: <Settings2 className="h-4 w-4" /> },
    { key: "politicians", label: "Politycy", icon: <Users className="h-4 w-4" /> },
    { key: "entities", label: "Słowniki", icon: <Layers className="h-4 w-4" /> },
  ],
  inwestycje: [
    { key: "settings", label: "Ustawienia", icon: <Settings2 className="h-4 w-4" /> },
    { key: "investments", label: "Inwestycje", icon: <Building2 className="h-4 w-4" /> },
    { key: "entities", label: "Słowniki", icon: <Layers className="h-4 w-4" /> },
  ],
  nasze_dzialania: [
    { key: "settings", label: "Ustawienia", icon: <Settings2 className="h-4 w-4" /> },
    { key: "entities", label: "Słowniki", icon: <Layers className="h-4 w-4" /> },
  ],
};

const ADVANCED_KEYS = new Set(["sport", "polityka", "inwestycje", "nasze_dzialania"]);

// ─── Draft factories ──────────────────────────────────────────────────────────

const createTeamDraft = (): SportTeamForm => ({ name: "", shortName: "", slug: "", logo: "", sportType: "pilka_nozna", league: "", city: "Bydgoszcz", stadium: "", website: "", isActive: true });
const createPlayerDraft = (): SportPlayerForm => ({ fullName: "", slug: "", teamName: "", sportType: "pilka_nozna", number: "", position: "", photo: "", bio: "", isActive: true });
const createPoliticianDraft = (): PoliticianForm => ({ fullName: "", slug: "", party: "", position: "", photo: "", websiteUrl: "", facebookUrl: "", twitterUrl: "", bio: "", isActive: true });
const createInvestmentDraft = (): InvestmentForm => ({ projectName: "", slug: "", description: "", projectStatus: "planowana", location: "", startDate: "", endDate: "", budget: "", contractor: "", investor: "Miasto Bydgoszcz", progressPercent: 0, mainImageUrl: "", isActive: true });
const createEntityDraft = (entityType = ""): CategoryEntityForm => ({ entityType, name: "", slug: "", description: "", color: "#0f172a", icon: "", externalRef: "", metadata: "", isActive: true, order: 0 });

function normalizeSlug(value: string) {
  return value.toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const createLocalId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const buildFallbackCategories = () => ADMIN_CATEGORY_DEFINITIONS.map((cat, i) => ({
  key: cat.value,
  label: cat.label,
  description: cat.description,
  color: cat.color,
  icon: "",
  type: cat.type,
  routeSlug: cat.routeSlug,
  subcategories: cat.subcategories,
  order: i + 1,
  isActive: true,
  isDefault: true,
}));

const upsertById = <T extends { _id?: string }>(list: T[], item: T) => {
  const id = item._id ?? createLocalId();
  const nextItem = { ...item, _id: id } as T;
  const index = list.findIndex((entry) => entry._id === id);
  if (index >= 0) {
    const next = [...list];
    next[index] = nextItem;
    return next;
  }
  return [...list, nextItem];
};

const removeById = <T extends { _id?: string }>(list: T[], id?: string) =>
  (id ? list.filter((entry) => entry._id !== id) : list);

const normalizeCategory = (item: any): CategoryItem => ({
  _id: item._id ?? item.id ?? undefined,
  key: item.key ?? item.slug ?? "",
  label: item.label ?? item.name ?? "",
  description: item.description ?? undefined,
  color: item.color ?? item.hex_color ?? undefined,
  icon: item.icon ?? undefined,
  type: item.type ?? undefined,
  routeSlug: item.routeSlug ?? item.route_slug ?? undefined,
  subcategories: (item.subcategories ?? item.sub_categories ?? []).map((sub: any) => ({
    key: sub.key ?? sub.slug ?? normalizeSlug(sub.label ?? sub.name ?? ""),
    label: sub.label ?? sub.name ?? "",
    description: sub.description ?? undefined,
    isActive: sub.isActive ?? sub.is_active ?? true,
  })),
  order: item.order ?? item.sort_order ?? 0,
  isActive: item.isActive ?? item.is_active ?? true,
  isDefault: item.isDefault ?? item.is_default ?? false,
});

const normalizeTeam = (team: any) => ({
  _id: String(team._id ?? team.id ?? createLocalId()),
  name: team.name ?? "",
  shortName: team.shortName ?? team.short_name ?? "",
  slug: team.slug ?? "",
  logo: team.logo ?? "",
  sportType: team.sportType ?? team.sport_type ?? "pilka_nozna",
  league: team.league ?? "",
  city: team.city ?? "",
  stadium: team.stadium ?? "",
  website: team.website ?? "",
  isActive: team.isActive ?? team.is_active ?? true,
});

const normalizePlayer = (player: any) => ({
  _id: String(player._id ?? player.id ?? createLocalId()),
  fullName: player.fullName ?? player.full_name ?? "",
  slug: player.slug ?? "",
  teamId: player.teamId ?? player.team_id ?? undefined,
  teamName: player.teamName ?? player.team_name ?? "",
  sportType: player.sportType ?? player.sport_type ?? "pilka_nozna",
  number: player.number ?? "",
  position: player.position ?? "",
  photo: player.photo ?? "",
  bio: player.bio ?? "",
  isActive: player.isActive ?? player.is_active ?? true,
});

const normalizePolitician = (politician: any) => ({
  _id: String(politician._id ?? politician.id ?? createLocalId()),
  fullName: politician.fullName ?? politician.full_name ?? "",
  slug: politician.slug ?? "",
  party: politician.party ?? "",
  position: politician.position ?? "",
  photo: politician.photo ?? "",
  websiteUrl: politician.websiteUrl ?? politician.website_url ?? "",
  facebookUrl: politician.facebookUrl ?? politician.facebook_url ?? "",
  twitterUrl: politician.twitterUrl ?? politician.twitter_url ?? "",
  bio: politician.bio ?? "",
  isActive: politician.isActive ?? politician.is_active ?? true,
});

const normalizeInvestment = (inv: any) => ({
  _id: String(inv._id ?? inv.id ?? createLocalId()),
  projectName: inv.projectName ?? inv.project_name ?? "",
  slug: inv.slug ?? "",
  description: inv.description ?? "",
  projectStatus: inv.projectStatus ?? inv.project_status ?? "planowana",
  location: inv.location ?? "",
  startDate: inv.startDate ?? inv.start_date ?? "",
  endDate: inv.endDate ?? inv.end_date ?? "",
  budget: inv.budget ?? "",
  contractor: inv.contractor ?? "",
  investor: inv.investor ?? "",
  progressPercent: inv.progressPercent ?? inv.progress_percent ?? 0,
  mainImageUrl: inv.mainImageUrl ?? inv.main_image_url ?? "",
  isActive: inv.isActive ?? inv.is_active ?? true,
});

const normalizeEntity = (entity: any): CategoryEntityItem => ({
  _id: String(entity._id ?? entity.id ?? createLocalId()),
  categoryKey: entity.categoryKey ?? entity.category_key ?? "",
  entityType: entity.entityType ?? entity.entity_type ?? "",
  name: entity.name ?? "",
  slug: entity.slug ?? "",
  description: entity.description ?? undefined,
  color: entity.color ?? undefined,
  icon: entity.icon ?? undefined,
  parentId: entity.parentId ?? entity.parent_id ?? undefined,
  externalRef: entity.externalRef ?? entity.external_ref ?? undefined,
  metadata: entity.metadata ?? undefined,
  isActive: entity.isActive ?? entity.is_active ?? true,
  order: entity.order ?? 0,
});

const normalizeHeroConfig = (data: any): HeroConfigItem[] => {
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map((item: any, index: number) => ({
    itemId: String(item.itemId ?? item.item_id ?? item.id ?? item._id ?? ""),
    order: item.order ?? item.sort_order ?? index + 1,
    isVisible: item.isVisible ?? item.is_visible ?? true,
  }));
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldInput({ label, value, onChange, placeholder, type = "text", className = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) {
  return (
    <label className={`space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 ${className}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100"
      />
    </label>
  );
}

function FieldTextarea({ label, value, onChange, placeholder, className = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; className?: string;
}) {
  return (
    <label className={`space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 ${className}`}>
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[96px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    planowana: { label: "Planowana", cls: "bg-blue-50 text-blue-700" },
    w_trakcie: { label: "W trakcie", cls: "bg-amber-50 text-amber-700" },
    zakonczona: { label: "Zakończona", cls: "bg-green-50 text-green-700" },
    wstrzymana: { label: "Wstrzymana", cls: "bg-red-50 text-red-700" },
  };
  const s = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

// ─── Featured Config Panel ────────────────────────────────────────────────────

function FeaturedConfigPanel({
  categoryKey,
  itemType,
  items,
  getItemId,
  getItemName,
  getItemImage,
  existingConfig,
  onSave,
}: {
  categoryKey: string;
  itemType: string;
  items: any[];
  getItemId: (item: any) => string;
  getItemName: (item: any) => string;
  getItemImage?: (item: any) => string | undefined;
  existingConfig: any[] | undefined;
  onSave: (items: HeroConfigItem[]) => Promise<unknown>;
}) {
  const [localConfig, setLocalConfig] = useState<HeroConfigItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize from existing config or default all visible
  useEffect(() => {
    if (!items.length) return;
    if (existingConfig && existingConfig.length > 0) {
      // Merge existing config with current items
      const configMap = new Map(existingConfig.map(c => [c.itemId, c]));
      const merged: HeroConfigItem[] = items.map((item, i) => {
        const id = getItemId(item);
        const existing = configMap.get(id);
        return existing
          ? { itemId: id, order: existing.order, isVisible: existing.isVisible }
          : { itemId: id, order: i + 1, isVisible: false };
      });
      setLocalConfig(merged.sort((a, b) => a.order - b.order));
    } else {
      // Default: first 6 visible
      setLocalConfig(items.map((item, i) => ({
        itemId: getItemId(item),
        order: i + 1,
        isVisible: i < 6,
      })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingConfig, items.length]);

  const toggleVisible = (itemId: string) => {
    setLocalConfig(prev => prev.map(c => c.itemId === itemId ? { ...c, isVisible: !c.isVisible } : c));
  };

  const moveUp = (itemId: string) => {
    setLocalConfig(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(c => c.itemId === itemId);
      if (idx <= 0) return prev;
      const newConfig = [...sorted];
      [newConfig[idx - 1].order, newConfig[idx].order] = [newConfig[idx].order, newConfig[idx - 1].order];
      return newConfig.sort((a, b) => a.order - b.order);
    });
  };

  const moveDown = (itemId: string) => {
    setLocalConfig(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(c => c.itemId === itemId);
      if (idx >= sorted.length - 1) return prev;
      const newConfig = [...sorted];
      [newConfig[idx + 1].order, newConfig[idx].order] = [newConfig[idx].order, newConfig[idx + 1].order];
      return newConfig.sort((a, b) => a.order - b.order);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localConfig);
      toast.success("Wyróżnienia zapisane");
    } catch {
      toast.error("Błąd zapisu wyróżnień");
    } finally {
      setSaving(false);
    }
  };

  const sortedConfig = [...localConfig].sort((a, b) => a.order - b.order);
  const itemMap = new Map(items.map(item => [getItemId(item), item]));

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-600" />
          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">Wyróżnienia w kategorii</h4>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Zapisuję..." : "Zapisz kolejność"}
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Zaznacz encje, które mają być widoczne w sekcji hero strony kategorii. Użyj strzałek, aby zmienić kolejność.
      </p>
      <div className="space-y-2">
        {sortedConfig.map((cfg, idx) => {
          const item = itemMap.get(cfg.itemId);
          if (!item) return null;
          const img = getItemImage?.(item);
          return (
            <div
              key={cfg.itemId}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                cfg.isVisible
                  ? "border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900"
                  : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 opacity-60"
              }`}
            >
              <span className="text-xs font-black text-slate-400 w-5 text-center">{idx + 1}</span>
              {img ? (
                <img src={img} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-slate-500">{getItemName(item)[0]}</span>
                </div>
              )}
              <span className="flex-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{getItemName(item)}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(cfg.itemId)}
                  disabled={idx === 0}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(cfg.itemId)}
                  disabled={idx === sortedConfig.length - 1}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisible(cfg.itemId)}
                  className={`p-1 rounded-lg transition-colors ${
                    cfg.isVisible
                      ? "text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title={cfg.isVisible ? "Ukryj" : "Pokaż"}
                >
                  {cfg.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
        {sortedConfig.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">Brak encji do wyróżnienia.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CategorySettingsSection() {
  const [activeCategoryKey, setActiveCategoryKey] = useState("miasto");
  const [activeSubTab, setActiveSubTab] = useState("settings");
  const [draftCategory, setDraftCategory] = useState<CategoryItem | null>(null);
  const [teamDraft, setTeamDraft] = useState<SportTeamForm>(createTeamDraft());
  const [playerDraft, setPlayerDraft] = useState<SportPlayerForm>(createPlayerDraft());
  const [politicianDraft, setPoliticianDraft] = useState<PoliticianForm>(createPoliticianDraft());
  const [investmentDraft, setInvestmentDraft] = useState<InvestmentForm>(createInvestmentDraft());
  const [entityDrafts, setEntityDrafts] = useState<Record<string, CategoryEntityForm>>({});
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryDraft, setNewCategoryDraft] = useState<Partial<CategoryItem>>({ label: "", key: "", type: "basic", isActive: true, order: 99 });

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [categoryEntities, setCategoryEntities] = useState<CategoryEntityItem[]>([]);
  const [sportHeroConfig, setSportHeroConfig] = useState<HeroConfigItem[] | undefined>(undefined);
  const [politicsHeroConfig, setPoliticsHeroConfig] = useState<HeroConfigItem[] | undefined>(undefined);
  const [investmentsHeroConfig, setInvestmentsHeroConfig] = useState<HeroConfigItem[] | undefined>(undefined);
  const hasEntitySections = activeCategoryKey in ENTITY_SECTION_CONFIG;
  const fallbackCategories = useMemo(() => buildFallbackCategories(), []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetchAdminCategories();
        if (!active) return;
        setCategories(response.map(normalizeCategory));
      } catch (error) {
        console.warn("Admin categories API unavailable", error);
        if (active) setCategories(fallbackCategories);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [fallbackCategories]);

  useEffect(() => {
    if (activeCategoryKey !== "sport") return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any[]>("/admin/sport-teams");
        if (active) setTeams(response.map(normalizeTeam));
      } catch (error) {
        console.warn("Sport teams API unavailable", error);
        if (active) setTeams([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey]);

  useEffect(() => {
    if (activeCategoryKey !== "sport") return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any[]>("/admin/sport-players");
        if (active) setPlayers(response.map(normalizePlayer));
      } catch (error) {
        console.warn("Sport players API unavailable", error);
        if (active) setPlayers([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey]);

  useEffect(() => {
    if (activeCategoryKey !== "polityka") return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any[]>("/admin/politicians");
        if (active) setPoliticians(response.map(normalizePolitician));
      } catch (error) {
        console.warn("Politicians API unavailable", error);
        if (active) setPoliticians([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey]);

  useEffect(() => {
    if (activeCategoryKey !== "inwestycje") return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any[]>("/admin/investments");
        if (active) setInvestments(response.map(normalizeInvestment));
      } catch (error) {
        console.warn("Investments API unavailable", error);
        if (active) setInvestments([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey]);

  useEffect(() => {
    if (!hasEntitySections || activeCategoryKey === "__new__") return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetchCategoryEntities(activeCategoryKey);
        if (active) setCategoryEntities(response.map(normalizeEntity));
      } catch (error) {
        console.warn("Category entities API unavailable", error);
        if (active) setCategoryEntities([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey, hasEntitySections]);

  useEffect(() => {
    if (activeCategoryKey !== "sport") return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetchCategoryHeroConfig("sport");
        if (active) setSportHeroConfig(normalizeHeroConfig(response));
      } catch (error) {
        console.warn("Sport hero config API unavailable", error);
        if (active) setSportHeroConfig([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey]);

  useEffect(() => {
    if (activeCategoryKey !== "polityka") return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetchCategoryHeroConfig("polityka");
        if (active) setPoliticsHeroConfig(normalizeHeroConfig(response));
      } catch (error) {
        console.warn("Politics hero config API unavailable", error);
        if (active) setPoliticsHeroConfig([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey]);

  useEffect(() => {
    if (activeCategoryKey !== "inwestycje") return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetchCategoryHeroConfig("inwestycje");
        if (active) setInvestmentsHeroConfig(normalizeHeroConfig(response));
      } catch (error) {
        console.warn("Investments hero config API unavailable", error);
        if (active) setInvestmentsHeroConfig([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeCategoryKey]);

  const saveCategory = async (payload: {
    id?: string;
    key: string;
    label: string;
    description?: string;
    color?: string;
    icon?: string;
    type?: "basic" | "advanced";
    routeSlug?: string;
    subcategories?: AdminCategorySubcategory[];
    order: number;
    isActive: boolean;
    isDefault?: boolean;
  }) => {
    const body = {
      id: payload.id,
      key: payload.key,
      label: payload.label,
      description: payload.description,
      color: payload.color,
      icon: payload.icon,
      type: payload.type,
      route_slug: payload.routeSlug,
      subcategories: payload.subcategories?.map((sub) => ({
        key: sub.key,
        label: sub.label,
        description: sub.description,
        is_active: sub.isActive !== false,
      })),
      order: payload.order,
      is_active: payload.isActive,
      is_default: payload.isDefault,
    };
    const localItem: CategoryItem = {
      _id: payload.id ?? createLocalId(),
      key: payload.key,
      label: payload.label,
      description: payload.description,
      color: payload.color,
      icon: payload.icon,
      type: payload.type,
      routeSlug: payload.routeSlug,
      subcategories: payload.subcategories,
      order: payload.order,
      isActive: payload.isActive,
      isDefault: payload.isDefault,
    };
    try {
      const response = payload.id
        ? await updateAdminCategory(payload.id, body)
        : await createAdminCategory(body);
      const normalized = normalizeCategory(response);
      setCategories((prev) => {
        const index = prev.findIndex((cat) => (normalized._id && cat._id === normalized._id) || cat.key === normalized.key);
        if (index >= 0) {
          const next = [...prev];
          next[index] = normalized;
          return next;
        }
        return [...prev, normalized];
      });
      return { item: normalized, isLocal: false };
    } catch (error) {
      console.warn("Admin category save failed", error);
      setCategories((prev) => {
        const index = prev.findIndex((cat) => (localItem._id && cat._id === localItem._id) || cat.key === localItem.key);
        if (index >= 0) {
          const next = [...prev];
          next[index] = localItem;
          return next;
        }
        return [...prev, localItem];
      });
      return { item: localItem, isLocal: true };
    }
  };

  const deleteCategory = async ({ id }: { id: string }) => {
    try {
      await deleteAdminCategory(id);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      return { isLocal: false };
    } catch (error) {
      console.warn("Admin category delete failed", error);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      return { isLocal: true };
    }
  };

  const saveTeam = async (payload: SportTeamForm) => {
    const endpoint = payload.id ? `/admin/sport-teams/${payload.id}` : "/admin/sport-teams";
    const method = payload.id ? "PUT" : "POST";
    const body = {
      id: payload.id,
      name: payload.name,
      short_name: payload.shortName,
      slug: payload.slug,
      logo: payload.logo,
      sport_type: payload.sportType,
      league: payload.league,
      city: payload.city,
      stadium: payload.stadium,
      website: payload.website,
      is_active: payload.isActive,
    };
    try {
      const response = await apiFetch<any>(endpoint, { method, body });
      const normalized = normalizeTeam(response);
      setTeams((prev) => upsertById(prev, normalized));
      return { item: normalized, isLocal: false };
    } catch (error) {
      console.warn("Sport team save failed", error);
      const localItem = normalizeTeam(payload);
      setTeams((prev) => upsertById(prev, localItem));
      return { item: localItem, isLocal: true };
    }
  };

  const removeTeam = async ({ id }: { id: string }) => {
    try {
      await apiFetch<void>(`/admin/sport-teams/${id}`, { method: "DELETE" });
      setTeams((prev) => removeById(prev, id));
      return { isLocal: false };
    } catch (error) {
      console.warn("Sport team delete failed", error);
      setTeams((prev) => removeById(prev, id));
      return { isLocal: true };
    }
  };

  const savePlayer = async (payload: SportPlayerForm) => {
    const endpoint = payload.id ? `/admin/sport-players/${payload.id}` : "/admin/sport-players";
    const method = payload.id ? "PUT" : "POST";
    const body = {
      id: payload.id,
      full_name: payload.fullName,
      slug: payload.slug,
      team_id: payload.teamId,
      team_name: payload.teamName,
      sport_type: payload.sportType,
      number: payload.number,
      position: payload.position,
      photo: payload.photo,
      bio: payload.bio,
      is_active: payload.isActive,
    };
    try {
      const response = await apiFetch<any>(endpoint, { method, body });
      const normalized = normalizePlayer(response);
      setPlayers((prev) => upsertById(prev, normalized));
      return { item: normalized, isLocal: false };
    } catch (error) {
      console.warn("Sport player save failed", error);
      const localItem = normalizePlayer(payload);
      setPlayers((prev) => upsertById(prev, localItem));
      return { item: localItem, isLocal: true };
    }
  };

  const removePlayer = async ({ id }: { id: string }) => {
    try {
      await apiFetch<void>(`/admin/sport-players/${id}`, { method: "DELETE" });
      setPlayers((prev) => removeById(prev, id));
      return { isLocal: false };
    } catch (error) {
      console.warn("Sport player delete failed", error);
      setPlayers((prev) => removeById(prev, id));
      return { isLocal: true };
    }
  };

  const savePolitician = async (payload: PoliticianForm) => {
    const endpoint = payload.id ? `/admin/politicians/${payload.id}` : "/admin/politicians";
    const method = payload.id ? "PUT" : "POST";
    const body = {
      id: payload.id,
      full_name: payload.fullName,
      slug: payload.slug,
      party: payload.party,
      position: payload.position,
      photo: payload.photo,
      website_url: payload.websiteUrl,
      facebook_url: payload.facebookUrl,
      twitter_url: payload.twitterUrl,
      bio: payload.bio,
      is_active: payload.isActive,
    };
    try {
      const response = await apiFetch<any>(endpoint, { method, body });
      const normalized = normalizePolitician(response);
      setPoliticians((prev) => upsertById(prev, normalized));
      return { item: normalized, isLocal: false };
    } catch (error) {
      console.warn("Politician save failed", error);
      const localItem = normalizePolitician(payload);
      setPoliticians((prev) => upsertById(prev, localItem));
      return { item: localItem, isLocal: true };
    }
  };

  const removePolitician = async ({ id }: { id: string }) => {
    try {
      await apiFetch<void>(`/admin/politicians/${id}`, { method: "DELETE" });
      setPoliticians((prev) => removeById(prev, id));
      return { isLocal: false };
    } catch (error) {
      console.warn("Politician delete failed", error);
      setPoliticians((prev) => removeById(prev, id));
      return { isLocal: true };
    }
  };

  const saveInvestment = async (payload: InvestmentForm) => {
    const endpoint = payload.id ? `/admin/investments/${payload.id}` : "/admin/investments";
    const method = payload.id ? "PUT" : "POST";
    const body = {
      id: payload.id,
      project_name: payload.projectName,
      slug: payload.slug,
      description: payload.description,
      project_status: payload.projectStatus,
      location: payload.location,
      start_date: payload.startDate,
      end_date: payload.endDate,
      budget: payload.budget,
      contractor: payload.contractor,
      investor: payload.investor,
      progress_percent: payload.progressPercent,
      main_image_url: payload.mainImageUrl,
      is_active: payload.isActive,
    };
    try {
      const response = await apiFetch<any>(endpoint, { method, body });
      const normalized = normalizeInvestment(response);
      setInvestments((prev) => upsertById(prev, normalized));
      return { item: normalized, isLocal: false };
    } catch (error) {
      console.warn("Investment save failed", error);
      const localItem = normalizeInvestment(payload);
      setInvestments((prev) => upsertById(prev, localItem));
      return { item: localItem, isLocal: true };
    }
  };

  const removeInvestment = async ({ id }: { id: string }) => {
    try {
      await apiFetch<void>(`/admin/investments/${id}`, { method: "DELETE" });
      setInvestments((prev) => removeById(prev, id));
      return { isLocal: false };
    } catch (error) {
      console.warn("Investment delete failed", error);
      setInvestments((prev) => removeById(prev, id));
      return { isLocal: true };
    }
  };

  const saveCategoryEntity = async (payload: {
    id?: string;
    categoryKey: string;
    entityType: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    parentId?: string;
    externalRef?: string;
    metadata?: string;
    isActive: boolean;
    order: number;
  }) => {
    const body = {
      id: payload.id,
      category_key: payload.categoryKey,
      entity_type: payload.entityType,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      color: payload.color,
      icon: payload.icon,
      parent_id: payload.parentId,
      external_ref: payload.externalRef,
      metadata: payload.metadata,
      is_active: payload.isActive,
      order: payload.order,
    };
    try {
      const response = payload.id
        ? await updateCategoryEntity(payload.id, body)
        : await createCategoryEntity(body);
      const normalized = normalizeEntity(response);
      setCategoryEntities((prev) => upsertById(prev, normalized));
      return { item: normalized, isLocal: false };
    } catch (error) {
      console.warn("Category entity save failed", error);
      const localItem = normalizeEntity(payload);
      setCategoryEntities((prev) => upsertById(prev, localItem));
      return { item: localItem, isLocal: true };
    }
  };

  const removeCategoryEntity = async ({ id }: { id: string }) => {
    try {
      await deleteCategoryEntity(id);
      setCategoryEntities((prev) => removeById(prev, id));
      return { isLocal: false };
    } catch (error) {
      console.warn("Category entity delete failed", error);
      setCategoryEntities((prev) => removeById(prev, id));
      return { isLocal: true };
    }
  };

  const upsertHeroConfig = async ({ categoryKey, itemType, items }: {
    categoryKey: string;
    itemType: string;
    items: HeroConfigItem[];
  }) => {
    const body = {
      category_key: categoryKey,
      item_type: itemType,
      items: items.map((item) => ({
        item_id: item.itemId,
        order: item.order,
        is_visible: item.isVisible,
      })),
    };
    const setConfig = (data: HeroConfigItem[]) => {
      if (categoryKey === "sport") setSportHeroConfig(data);
      if (categoryKey === "polityka") setPoliticsHeroConfig(data);
      if (categoryKey === "inwestycje") setInvestmentsHeroConfig(data);
    };
    try {
      const response = await updateCategoryHeroConfig(categoryKey, body);
      const normalized = normalizeHeroConfig(response);
      setConfig(normalized);
      return { isLocal: false };
    } catch (error) {
      console.warn("Category hero config save failed", error);
      setConfig(items);
      return { isLocal: true };
    }
  };

  const resolvedCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return fallbackCategories;
  }, [categories, fallbackCategories]);

  const standardCategories = useMemo(() => resolvedCategories.filter(c => !ADVANCED_KEYS.has(c.key)), [resolvedCategories]);
  const advancedCategories = useMemo(() => resolvedCategories.filter(c => ADVANCED_KEYS.has(c.key)), [resolvedCategories]);

  useEffect(() => {
    if (!resolvedCategories.length) return;
    const current = resolvedCategories.find((c) => c.key === activeCategoryKey);
    const next = current ?? resolvedCategories[0];
    setActiveCategoryKey(next.key);
    setDraftCategory({ ...next, subcategories: next.subcategories ? [...next.subcategories] : [] });
  }, [activeCategoryKey, resolvedCategories]);

  useEffect(() => {
    setActiveSubTab("settings");
  }, [activeCategoryKey]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveCategory = async () => {
    if (!draftCategory) return;
    if (!draftCategory.key.trim() || !draftCategory.label.trim()) {
      toast.error("Klucz i nazwa kategorii są wymagane"); return;
    }
    const result = await saveCategory({
      id: draftCategory._id,
      key: draftCategory.key.trim(),
      label: draftCategory.label.trim(),
      description: draftCategory.description?.trim() || undefined,
      color: draftCategory.color || undefined,
      icon: draftCategory.icon?.trim() || undefined,
      type: draftCategory.type,
      routeSlug: draftCategory.routeSlug?.trim() || undefined,
      subcategories: draftCategory.subcategories?.filter((s) => s.label.trim()).map((s) => ({
        key: s.key.trim() || normalizeSlug(s.label),
        label: s.label.trim(),
        description: s.description?.trim() || undefined,
        isActive: s.isActive !== false,
      })),
      order: draftCategory.order,
      isActive: draftCategory.isActive,
      isDefault: draftCategory.isDefault,
    });
    setDraftCategory(result.item);
    if (result.isLocal) {
      toast.message("Kategoria zapisana lokalnie (API niedostępne)");
    } else {
      toast.success("Kategoria zapisana");
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    const result = await saveCategory({
      id: cat._id,
      key: cat.key,
      label: cat.label,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
      type: cat.type,
      routeSlug: cat.routeSlug,
      subcategories: cat.subcategories,
      order: cat.order,
      isActive: !cat.isActive,
      isDefault: cat.isDefault,
    });
    if (result.isLocal) {
      toast.message("Status kategorii zapisany lokalnie (API niedostępne)");
    } else {
      toast.success(cat.isActive ? "Kategoria ukryta" : "Kategoria aktywowana");
    }
  };

  const handleMoveOrder = async (cat: CategoryItem, direction: "up" | "down") => {
    const sorted = [...resolvedCategories].sort((a, b) => a.order - b.order) as CategoryItem[];
    const idx = sorted.findIndex(c => c.key === cat.key);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapCat = sorted[swapIdx];
    if (!cat._id || !swapCat._id) {
      toast.error("Nie można zmienić kolejności kategorii systemowych bez zapisu w bazie. Najpierw zapisz ustawienia kategorii.");
      return;
    }
    const results = await Promise.all([
      saveCategory({ id: cat._id, key: cat.key, label: cat.label, description: cat.description, color: cat.color, icon: cat.icon, type: cat.type, routeSlug: cat.routeSlug, subcategories: cat.subcategories, order: swapCat.order, isActive: cat.isActive, isDefault: cat.isDefault }),
      saveCategory({ id: swapCat._id, key: swapCat.key, label: swapCat.label, description: swapCat.description, color: swapCat.color, icon: swapCat.icon, type: swapCat.type, routeSlug: swapCat.routeSlug, subcategories: swapCat.subcategories, order: cat.order, isActive: swapCat.isActive, isDefault: swapCat.isDefault }),
    ]);
    if (results.some((result) => result.isLocal)) {
      toast.message("Kolejność zapisana lokalnie (API niedostępne)");
    } else {
      toast.success("Kolejność zmieniona");
    }
  };

  const handleDeleteCategory = async () => {
    if (!draftCategory?._id) return;
    if (draftCategory.isDefault) { toast.error("Systemowej kategorii nie można usunąć"); return; }
    const result = await deleteCategory({ id: draftCategory._id });
    if (result.isLocal) {
      toast.message("Kategoria usunięta lokalnie (API niedostępne)");
    } else {
      toast.success("Kategoria usunięta");
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryDraft.label?.trim() || !newCategoryDraft.key?.trim()) {
      toast.error("Klucz i nazwa są wymagane"); return;
    }
    const result = await saveCategory({
      key: newCategoryDraft.key!.trim(),
      label: newCategoryDraft.label!.trim(),
      description: newCategoryDraft.description?.trim() || undefined,
      color: newCategoryDraft.color || "#3b82f6",
      type: newCategoryDraft.type || "basic",
      order: newCategoryDraft.order ?? 99,
      isActive: true,
      isDefault: false,
    });
    if (result.isLocal) {
      toast.message("Kategoria dodana lokalnie (API niedostępne)");
    } else {
      toast.success("Kategoria dodana");
    }
    setShowNewCategoryForm(false);
    setNewCategoryDraft({ label: "", key: "", type: "basic", isActive: true, order: 99 });
  };

  const handleSaveTeam = async () => {
    if (!teamDraft.name.trim()) { toast.error("Nazwa drużyny jest wymagana"); return; }
    const result = await saveTeam({
      id: teamDraft.id,
      name: teamDraft.name.trim(),
      shortName: teamDraft.shortName.trim(),
      slug: teamDraft.slug || normalizeSlug(teamDraft.name),
      logo: teamDraft.logo.trim(),
      sportType: teamDraft.sportType,
      league: teamDraft.league.trim(),
      city: teamDraft.city.trim(),
      stadium: teamDraft.stadium.trim(),
      website: teamDraft.website.trim(),
      isActive: teamDraft.isActive,
    });
    if (result.isLocal) {
      toast.message("Drużyna zapisana lokalnie (API niedostępne)");
    } else {
      toast.success(teamDraft.id ? "Drużyna zaktualizowana" : "Drużyna dodana");
    }
    setTeamDraft(createTeamDraft());
  };

  const handleSavePlayer = async () => {
    if (!playerDraft.fullName.trim()) { toast.error("Imię i nazwisko są wymagane"); return; }
    const result = await savePlayer({
      id: playerDraft.id,
      fullName: playerDraft.fullName.trim(),
      slug: playerDraft.slug || normalizeSlug(playerDraft.fullName),
      teamId: playerDraft.teamId,
      teamName: playerDraft.teamName.trim(),
      sportType: playerDraft.sportType,
      number: playerDraft.number.trim(),
      position: playerDraft.position.trim(),
      photo: playerDraft.photo.trim(),
      bio: playerDraft.bio.trim(),
      isActive: playerDraft.isActive,
    });
    if (result.isLocal) {
      toast.message("Zawodnik zapisany lokalnie (API niedostępne)");
    } else {
      toast.success(playerDraft.id ? "Zawodnik zaktualizowany" : "Zawodnik dodany");
    }
    setPlayerDraft(createPlayerDraft());
  };

  const handleSavePolitician = async () => {
    if (!politicianDraft.fullName.trim()) { toast.error("Imię i nazwisko są wymagane"); return; }
    const result = await savePolitician({
      id: politicianDraft.id,
      fullName: politicianDraft.fullName.trim(),
      slug: politicianDraft.slug || normalizeSlug(politicianDraft.fullName),
      party: politicianDraft.party.trim(),
      position: politicianDraft.position.trim(),
      photo: politicianDraft.photo.trim(),
      websiteUrl: politicianDraft.websiteUrl.trim(),
      facebookUrl: politicianDraft.facebookUrl.trim(),
      twitterUrl: politicianDraft.twitterUrl.trim(),
      bio: politicianDraft.bio.trim(),
      isActive: politicianDraft.isActive,
    });
    if (result.isLocal) {
      toast.message("Polityk zapisany lokalnie (API niedostępne)");
    } else {
      toast.success(politicianDraft.id ? "Polityk zaktualizowany" : "Polityk dodany");
    }
    setPoliticianDraft(createPoliticianDraft());
  };

  const handleSaveInvestment = async () => {
    if (!investmentDraft.projectName.trim()) { toast.error("Nazwa inwestycji jest wymagana"); return; }
    const result = await saveInvestment({
      id: investmentDraft.id,
      projectName: investmentDraft.projectName.trim(),
      slug: investmentDraft.slug || normalizeSlug(investmentDraft.projectName),
      description: investmentDraft.description.trim(),
      projectStatus: investmentDraft.projectStatus,
      location: investmentDraft.location.trim(),
      startDate: investmentDraft.startDate.trim(),
      endDate: investmentDraft.endDate.trim(),
      budget: investmentDraft.budget.trim(),
      contractor: investmentDraft.contractor.trim(),
      investor: investmentDraft.investor.trim(),
      progressPercent: investmentDraft.progressPercent,
      mainImageUrl: investmentDraft.mainImageUrl.trim(),
      isActive: investmentDraft.isActive,
    });
    if (result.isLocal) {
      toast.message("Inwestycja zapisana lokalnie (API niedostępne)");
    } else {
      toast.success(investmentDraft.id ? "Inwestycja zaktualizowana" : "Inwestycja dodana");
    }
    setInvestmentDraft(createInvestmentDraft());
  };

  const handleSaveEntity = async (entityType: string) => {
    const draft = entityDrafts[entityType] ?? createEntityDraft(entityType);
    if (!draft.name.trim()) { toast.error("Nazwa jest wymagana"); return; }
    const result = await saveCategoryEntity({
      id: draft.id,
      categoryKey: activeCategoryKey,
      entityType: draft.entityType,
      name: draft.name.trim(),
      slug: draft.slug || normalizeSlug(draft.name),
      description: draft.description.trim() || undefined,
      color: draft.color || undefined,
      icon: draft.icon.trim() || undefined,
      parentId: draft.parentId,
      externalRef: draft.externalRef.trim() || undefined,
      metadata: draft.metadata.trim() || undefined,
      isActive: draft.isActive,
      order: draft.order,
    });
    if (result.isLocal) {
      toast.message("Encja zapisana lokalnie (API niedostępne)");
    } else {
      toast.success("Encja zapisana");
    }
    setEntityDrafts(prev => ({ ...prev, [entityType]: createEntityDraft(entityType) }));
  };

  const handleEditEntity = (entity: CategoryEntityItem) => {
    setEntityDrafts(prev => ({
      ...prev,
      [entity.entityType]: {
        id: entity._id,
        entityType: entity.entityType,
        name: entity.name,
        slug: entity.slug,
        description: entity.description ?? "",
        color: entity.color ?? "#0f172a",
        icon: entity.icon ?? "",
        parentId: entity.parentId,
        externalRef: entity.externalRef ?? "",
        metadata: entity.metadata ?? "",
        isActive: entity.isActive !== false,
        order: entity.order ?? 0,
      },
    }));
  };

  const updateEntityDraft = (entityType: string, updates: Partial<CategoryEntityForm>) => {
    setEntityDrafts(prev => ({
      ...prev,
      [entityType]: { ...(prev[entityType] ?? createEntityDraft(entityType)), ...updates },
    }));
  };

  const handleRemoveTeam = async (id: string) => {
    const result = await removeTeam({ id });
    if (result.isLocal) {
      toast.message("Drużyna usunięta lokalnie (API niedostępne)");
    } else {
      toast.success("Drużyna usunięta");
    }
  };

  const handleRemovePlayer = async (id: string) => {
    const result = await removePlayer({ id });
    if (result.isLocal) {
      toast.message("Zawodnik usunięty lokalnie (API niedostępne)");
    } else {
      toast.success("Zawodnik usunięty");
    }
  };

  const handleRemovePolitician = async (id: string) => {
    const result = await removePolitician({ id });
    if (result.isLocal) {
      toast.message("Polityk usunięty lokalnie (API niedostępne)");
    } else {
      toast.success("Polityk usunięty");
    }
  };

  const handleRemoveInvestment = async (id: string) => {
    const result = await removeInvestment({ id });
    if (result.isLocal) {
      toast.message("Inwestycja usunięta lokalnie (API niedostępne)");
    } else {
      toast.success("Inwestycja usunięta");
    }
  };

  const handleRemoveEntity = async (id: string) => {
    const result = await removeCategoryEntity({ id });
    if (result.isLocal) {
      toast.message("Encja usunięta lokalnie (API niedostępne)");
    } else {
      toast.success("Encja usunięta");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const isAdvanced = ADVANCED_KEYS.has(activeCategoryKey);
  const entitySections = ENTITY_SECTION_CONFIG[activeCategoryKey] ?? [];
  const tabs = ADVANCED_TABS[activeCategoryKey] ?? [];

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <div className="w-64 shrink-0 space-y-2">
        {/* Standard categories */}
        <div className="mb-1">
          <p className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Standardowe</p>
          {standardCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategoryKey(cat.key)}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                activeCategoryKey === cat.key
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {cat.color && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />}
                <span className="truncate">{cat.label}</span>
              </div>
              {!cat.isActive && <EyeOff className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
            </button>
          ))}
        </div>

        {/* Advanced categories */}
        <div>
          <p className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Rozszerzone</p>
          {advancedCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategoryKey(cat.key)}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                activeCategoryKey === cat.key
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {cat.color && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />}
                <span className="truncate">{cat.label}</span>
                <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-black text-primary">PRO</span>
              </div>
              {!cat.isActive && <EyeOff className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
            </button>
          ))}
        </div>

        {/* Add new category */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nowa kategoria
          </button>
        </div>
      </div>

      {/* ── MAIN PANEL ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* New category form */}
        {showNewCategoryForm && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <h4 className="mb-4 text-sm font-black text-slate-900 dark:text-slate-100">Nowa kategoria</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldInput label="Nazwa" value={newCategoryDraft.label ?? ""} onChange={(v) => setNewCategoryDraft(d => ({ ...d, label: v, key: normalizeSlug(v) }))} placeholder="np. Edukacja" />
              <FieldInput label="Klucz (slug)" value={newCategoryDraft.key ?? ""} onChange={(v) => setNewCategoryDraft(d => ({ ...d, key: normalizeSlug(v) }))} placeholder="np. edukacja" />
              <FieldInput label="Opis" value={newCategoryDraft.description ?? ""} onChange={(v) => setNewCategoryDraft(d => ({ ...d, description: v }))} className="md:col-span-2" />
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewCategoryForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Anuluj</button>
                <button type="button" onClick={handleAddNewCategory} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">Dodaj kategorię</button>
              </div>
            </div>
          </div>
        )}

        {/* Category header */}
        {draftCategory && (
          <div className="space-y-5">
            {/* Sub-tabs for advanced categories */}
            {isAdvanced && tabs.length > 0 && (
              <div className="flex gap-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveSubTab(tab.key)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                      activeSubTab === tab.key
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Settings tab (always shown for basic, or when selected for advanced) */}
            {(!isAdvanced || activeSubTab === "settings") && (
              <div className="space-y-5">
                {/* Category info */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">Ustawienia kategorii</h4>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleToggleActive(draftCategory)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${draftCategory.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {draftCategory.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {draftCategory.isActive ? "Aktywna" : "Ukryta"}
                      </button>
                      <button type="button" onClick={handleSaveCategory} className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800">
                        <Save className="h-3.5 w-3.5" />
                        Zapisz
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldInput label="Nazwa" value={draftCategory.label} onChange={(v) => setDraftCategory(d => d ? { ...d, label: v } : d)} />
                    <FieldInput label="Klucz" value={draftCategory.key} onChange={(v) => setDraftCategory(d => d ? { ...d, key: v } : d)} />
                    <FieldInput label="Opis" value={draftCategory.description ?? ""} onChange={(v) => setDraftCategory(d => d ? { ...d, description: v } : d)} className="md:col-span-2" />
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>Kolor</span>
                      <div className="flex items-center gap-2">
                        <input type="color" value={draftCategory.color || "#3b82f6"} onChange={(e) => setDraftCategory(d => d ? { ...d, color: e.target.value } : d)} className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer" />
                        <input value={draftCategory.color ?? ""} onChange={(e) => setDraftCategory(d => d ? { ...d, color: e.target.value } : d)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none" />
                      </div>
                    </label>
                    <FieldInput label="Kolejność" value={String(draftCategory.order)} onChange={(v) => setDraftCategory(d => d ? { ...d, order: Number(v) || 1 } : d)} type="number" />
                  </div>
                </div>

                {/* Subcategories */}
                {draftCategory.subcategories && draftCategory.subcategories.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                    <h4 className="mb-4 text-sm font-black text-slate-900 dark:text-slate-100">Podkategorie</h4>
                    <div className="space-y-2">
                      {draftCategory.subcategories.map((sub, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                          <input
                            type="checkbox"
                            checked={sub.isActive !== false}
                            onChange={(e) => {
                              const updated = [...(draftCategory.subcategories ?? [])];
                              updated[i] = { ...updated[i], isActive: e.target.checked };
                              setDraftCategory(d => d ? { ...d, subcategories: updated } : d);
                            }}
                          />
                          <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{sub.label}</span>
                          <span className="text-xs text-slate-400">{sub.key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete */}
                {draftCategory._id && !draftCategory.isDefault && (
                  <div className="flex justify-end">
                    <button type="button" onClick={handleDeleteCategory} className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                      Usuń kategorię
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sport: Teams tab */}
            {isAdvanced && activeSubTab === "teams" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-4">{teamDraft.id ? "Edytuj drużynę" : "Nowa drużyna"}</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldInput label="Nazwa drużyny" value={teamDraft.name} onChange={(v) => setTeamDraft((d) => ({ ...d, name: v, slug: normalizeSlug(v) }))} />
                    <FieldInput label="Skrót" value={teamDraft.shortName} onChange={(v) => setTeamDraft((d) => ({ ...d, shortName: v }))} placeholder="np. BKS" />
                    <FieldInput label="Slug" value={teamDraft.slug} onChange={(v) => setTeamDraft((d) => ({ ...d, slug: normalizeSlug(v) }))} />
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>Dyscyplina</span>
                      <select value={teamDraft.sportType} onChange={(e) => setTeamDraft((d) => ({ ...d, sportType: e.target.value as SportTeamForm["sportType"] }))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none">
                        <option value="pilka_nozna">Piłka nożna</option>
                        <option value="siatkowka">Siatkówka</option>
                        <option value="zuzel">Żużel</option>
                        <option value="inne">Inne</option>
                      </select>
                    </label>
                    <FieldInput label="Logo (URL)" value={teamDraft.logo} onChange={(v) => setTeamDraft((d) => ({ ...d, logo: v }))} placeholder="https://..." className="md:col-span-2" />
                    <FieldInput label="Liga" value={teamDraft.league} onChange={(v) => setTeamDraft((d) => ({ ...d, league: v }))} placeholder="np. Ekstraklasa" />
                    <FieldInput label="Miasto" value={teamDraft.city} onChange={(v) => setTeamDraft((d) => ({ ...d, city: v }))} />
                    <FieldInput label="Stadion" value={teamDraft.stadium} onChange={(v) => setTeamDraft((d) => ({ ...d, stadium: v }))} />
                    <FieldInput label="Strona www" value={teamDraft.website} onChange={(v) => setTeamDraft((d) => ({ ...d, website: v }))} />
                    <div className="md:col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={teamDraft.isActive} onChange={(e) => setTeamDraft((d) => ({ ...d, isActive: e.target.checked }))} />
                        Aktywna
                      </label>
                      <div className="flex gap-2">
                        {teamDraft.id && <button type="button" onClick={() => setTeamDraft(createTeamDraft())} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Anuluj</button>}
                        <button type="button" onClick={() => void handleSaveTeam()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-bold text-white dark:text-slate-900">
                          <Check className="h-4 w-4" />
                          Zapisz drużynę
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {(!teams || teams.length === 0) && <p className="rounded-xl border border-dashed border-slate-200 bg-white dark:bg-slate-900 px-4 py-6 text-sm text-slate-400 text-center">Brak drużyn. Dodaj pierwszą drużynę powyżej.</p>}
                  {(teams ?? []).map((team: any) => (
                    <div key={team._id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {team.logo ? (
                          <img src={team.logo} alt="" className="h-9 w-9 rounded-full object-contain bg-slate-100 p-1" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{team.name} {team.shortName && <span className="text-slate-400 font-normal">({team.shortName})</span>}</p>
                          <p className="text-xs text-slate-500">{team.sportType} · {team.league ?? "—"} · {team.city ?? "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setTeamDraft({ id: team._id, name: team.name, shortName: team.shortName ?? "", slug: team.slug, logo: team.logo ?? "", sportType: team.sportType, league: team.league ?? "", city: team.city ?? "", stadium: team.stadium ?? "", website: team.website ?? "", isActive: team.isActive !== false })} className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => void handleRemoveTeam(team._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Featured config for teams */}
                {teams && teams.length > 0 && (
                  <FeaturedConfigPanel
                    categoryKey="sport"
                    itemType="sport_team"
                    items={teams}
                    getItemId={(t) => t._id}
                    getItemName={(t) => t.name}
                    getItemImage={(t) => t.logo}
                    existingConfig={sportHeroConfig}
                    onSave={(items) => upsertHeroConfig({ categoryKey: "sport", itemType: "sport_team", items })}
                  />
                )}
              </div>
            )}

            {/* Sport: Players tab */}
            {isAdvanced && activeSubTab === "players" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-4">{playerDraft.id ? "Edytuj zawodnika" : "Nowy zawodnik"}</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldInput label="Imię i nazwisko" value={playerDraft.fullName} onChange={(v) => setPlayerDraft((d) => ({ ...d, fullName: v, slug: normalizeSlug(v) }))} />
                    <FieldInput label="Slug" value={playerDraft.slug} onChange={(v) => setPlayerDraft((d) => ({ ...d, slug: normalizeSlug(v) }))} />
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>Drużyna</span>
                      <select value={playerDraft.teamId ?? ""} onChange={(e) => {
                        const team = (teams ?? []).find((t: any) => t._id === e.target.value);
                        setPlayerDraft((d) => ({ ...d, teamId: (e.target.value || undefined) as string | undefined, teamName: team?.name ?? "" }));
                      }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none">
                        <option value="">Bez drużyny</option>
                        {(teams ?? []).map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>Dyscyplina</span>
                      <select value={playerDraft.sportType} onChange={(e) => setPlayerDraft((d) => ({ ...d, sportType: e.target.value as SportPlayerForm["sportType"] }))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none">
                        <option value="pilka_nozna">Piłka nożna</option>
                        <option value="siatkowka">Siatkówka</option>
                        <option value="zuzel">Żużel</option>
                        <option value="inne">Inne</option>
                      </select>
                    </label>
                    <FieldInput label="Numer" value={playerDraft.number} onChange={(v) => setPlayerDraft((d) => ({ ...d, number: v }))} placeholder="np. 10" />
                    <FieldInput label="Pozycja" value={playerDraft.position} onChange={(v) => setPlayerDraft((d) => ({ ...d, position: v }))} placeholder="np. Napastnik" />
                    <FieldInput label="Zdjęcie (URL)" value={playerDraft.photo} onChange={(v) => setPlayerDraft((d) => ({ ...d, photo: v }))} className="md:col-span-2" />
                    <FieldTextarea label="Bio" value={playerDraft.bio} onChange={(v) => setPlayerDraft((d) => ({ ...d, bio: v }))} className="md:col-span-2" />
                    <div className="md:col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={playerDraft.isActive} onChange={(e) => setPlayerDraft((d) => ({ ...d, isActive: e.target.checked }))} />
                        Aktywny
                      </label>
                      <div className="flex gap-2">
                        {playerDraft.id && <button type="button" onClick={() => setPlayerDraft(createPlayerDraft())} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Anuluj</button>}
                        <button type="button" onClick={() => void handleSavePlayer()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-bold text-white dark:text-slate-900">
                          <Check className="h-4 w-4" />
                          Zapisz zawodnika
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {(!players || players.length === 0) && <p className="rounded-xl border border-dashed border-slate-200 bg-white dark:bg-slate-900 px-4 py-6 text-sm text-slate-400 text-center">Brak zawodników. Dodaj pierwszego zawodnika powyżej.</p>}
                  {(players ?? []).map((player: any) => (
                    <div key={player._id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {player.photo && <img src={player.photo} alt="" className="h-9 w-9 rounded-full object-cover" />}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{player.fullName}</p>
                          <p className="text-xs text-slate-500">{player.position ?? "—"} · {player.teamName ?? "—"} · {player.sportType}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setPlayerDraft({ id: player._id, fullName: player.fullName, slug: player.slug, teamId: player.teamId, teamName: player.teamName ?? "", sportType: player.sportType, number: player.number ?? "", position: player.position ?? "", photo: player.photo ?? "", bio: player.bio ?? "", isActive: player.isActive !== false })} className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => void handleRemovePlayer(player._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Polityka: Politicians tab */}
            {isAdvanced && activeSubTab === "politicians" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-4">{politicianDraft.id ? "Edytuj polityka" : "Nowy polityk"}</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldInput label="Imię i nazwisko" value={politicianDraft.fullName} onChange={(v) => setPoliticianDraft((d) => ({ ...d, fullName: v, slug: normalizeSlug(v) }))} />
                    <FieldInput label="Slug" value={politicianDraft.slug} onChange={(v) => setPoliticianDraft((d) => ({ ...d, slug: normalizeSlug(v) }))} />
                    <FieldInput label="Ugrupowanie / Partia" value={politicianDraft.party} onChange={(v) => setPoliticianDraft((d) => ({ ...d, party: v }))} placeholder="np. Koalicja Obywatelska" />
                    <FieldInput label="Stanowisko / Funkcja" value={politicianDraft.position} onChange={(v) => setPoliticianDraft((d) => ({ ...d, position: v }))} placeholder="np. Radny Rady Miasta" />
                    <FieldInput label="Zdjęcie (URL)" value={politicianDraft.photo} onChange={(v) => setPoliticianDraft((d) => ({ ...d, photo: v }))} className="md:col-span-2" />
                    <FieldInput label="Strona www" value={politicianDraft.websiteUrl} onChange={(v) => setPoliticianDraft((d) => ({ ...d, websiteUrl: v }))} />
                    <FieldInput label="Facebook" value={politicianDraft.facebookUrl} onChange={(v) => setPoliticianDraft((d) => ({ ...d, facebookUrl: v }))} />
                    <FieldInput label="Twitter / X" value={politicianDraft.twitterUrl} onChange={(v) => setPoliticianDraft((d) => ({ ...d, twitterUrl: v }))} />
                    <FieldTextarea label="Bio" value={politicianDraft.bio} onChange={(v) => setPoliticianDraft((d) => ({ ...d, bio: v }))} className="md:col-span-2" />
                    <div className="md:col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={politicianDraft.isActive} onChange={(e) => setPoliticianDraft((d) => ({ ...d, isActive: e.target.checked }))} />
                        Aktywny
                      </label>
                      <div className="flex gap-2">
                        {politicianDraft.id && <button type="button" onClick={() => setPoliticianDraft(createPoliticianDraft())} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Anuluj</button>}
                        <button type="button" onClick={() => void handleSavePolitician()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-bold text-white dark:text-slate-900">
                          <Check className="h-4 w-4" />
                          Zapisz polityka
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {(!politicians || politicians.length === 0) && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white dark:bg-slate-900 px-4 py-6 text-sm text-slate-400 text-center">Brak polityków. Dodaj pierwszego polityka powyżej.</p>
                  )}
                  {(politicians ?? []).map((politician: any) => (
                    <div key={politician._id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {politician.photo ? (
                          <img src={politician.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-xs font-black text-slate-500">{politician.fullName[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{politician.fullName}</p>
                          <p className="text-xs text-slate-500">{politician.party ?? "—"} · {politician.position ?? "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setPoliticianDraft({ id: politician._id, fullName: politician.fullName, slug: politician.slug, party: politician.party ?? "", position: politician.position ?? "", photo: politician.photo ?? "", websiteUrl: politician.websiteUrl ?? "", facebookUrl: politician.facebookUrl ?? "", twitterUrl: politician.twitterUrl ?? "", bio: politician.bio ?? "", isActive: politician.isActive !== false })} className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => void handleRemovePolitician(politician._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Featured config for politicians */}
                {politicians && politicians.length > 0 && (
                  <FeaturedConfigPanel
                    categoryKey="polityka"
                    itemType="politician"
                    items={politicians}
                    getItemId={(p) => p._id}
                    getItemName={(p) => p.fullName}
                    getItemImage={(p) => p.photo}
                    existingConfig={politicsHeroConfig}
                    onSave={(items) => upsertHeroConfig({ categoryKey: "polityka", itemType: "politician", items })}
                  />
                )}
              </div>
            )}

            {/* Inwestycje: Investments tab */}
            {isAdvanced && activeSubTab === "investments" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-4">{investmentDraft.id ? "Edytuj inwestycję" : "Nowa inwestycja"}</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldInput label="Nazwa projektu" value={investmentDraft.projectName} onChange={(v) => setInvestmentDraft((d) => ({ ...d, projectName: v, slug: normalizeSlug(v) }))} />
                    <FieldInput label="Slug" value={investmentDraft.slug} onChange={(v) => setInvestmentDraft((d) => ({ ...d, slug: normalizeSlug(v) }))} />
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>Status</span>
                      <select value={investmentDraft.projectStatus} onChange={(e) => setInvestmentDraft((d) => ({ ...d, projectStatus: e.target.value as InvestmentForm["projectStatus"] }))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none">
                        <option value="planowana">Planowana</option>
                        <option value="w_trakcie">W trakcie</option>
                        <option value="zakonczona">Zakończona</option>
                        <option value="wstrzymana">Wstrzymana</option>
                      </select>
                    </label>
                    <FieldInput label="Lokalizacja" value={investmentDraft.location} onChange={(v) => setInvestmentDraft((d) => ({ ...d, location: v }))} />
                    <FieldInput label="Budżet" value={investmentDraft.budget} onChange={(v) => setInvestmentDraft((d) => ({ ...d, budget: v }))} placeholder="np. 45 mln zł" />
                    <FieldInput label="Wykonawca" value={investmentDraft.contractor} onChange={(v) => setInvestmentDraft((d) => ({ ...d, contractor: v }))} />
                    <FieldInput label="Inwestor" value={investmentDraft.investor} onChange={(v) => setInvestmentDraft((d) => ({ ...d, investor: v }))} />
                    <FieldInput label="Data rozpoczęcia" value={investmentDraft.startDate} onChange={(v) => setInvestmentDraft((d) => ({ ...d, startDate: v }))} type="date" />
                    <FieldInput label="Data zakończenia" value={investmentDraft.endDate} onChange={(v) => setInvestmentDraft((d) => ({ ...d, endDate: v }))} type="date" />
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>Postęp (%)</span>
                      <input type="number" min={0} max={100} value={investmentDraft.progressPercent} onChange={(e) => setInvestmentDraft((d) => ({ ...d, progressPercent: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none" />
                    </label>
                    <FieldInput label="Zdjęcie główne (URL)" value={investmentDraft.mainImageUrl} onChange={(v) => setInvestmentDraft((d) => ({ ...d, mainImageUrl: v }))} />
                    <FieldTextarea label="Opis" value={investmentDraft.description} onChange={(v) => setInvestmentDraft((d) => ({ ...d, description: v }))} className="md:col-span-2" />
                    <div className="md:col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={investmentDraft.isActive} onChange={(e) => setInvestmentDraft((d) => ({ ...d, isActive: e.target.checked }))} />
                        Aktywna
                      </label>
                      <div className="flex gap-2">
                        {investmentDraft.id && <button type="button" onClick={() => setInvestmentDraft(createInvestmentDraft())} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Anuluj</button>}
                        <button type="button" onClick={() => void handleSaveInvestment()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-bold text-white dark:text-slate-900">
                          <Check className="h-4 w-4" />
                          Zapisz inwestycję
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {(!investments || investments.length === 0) && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white dark:bg-slate-900 px-4 py-6 text-sm text-slate-400 text-center">Brak inwestycji. Dodaj pierwszą inwestycję powyżej.</p>
                  )}
                  {(investments ?? []).map((inv: any) => (
                    <div key={inv._id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {inv.mainImageUrl && <img src={inv.mainImageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{inv.projectName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge status={inv.projectStatus} />
                            <span className="text-xs text-slate-500">{inv.location ?? "—"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setInvestmentDraft({ id: inv._id, projectName: inv.projectName, slug: inv.slug, description: inv.description ?? "", projectStatus: inv.projectStatus, location: inv.location ?? "", startDate: inv.startDate ?? "", endDate: inv.endDate ?? "", budget: inv.budget ?? "", contractor: inv.contractor ?? "", investor: inv.investor ?? "", progressPercent: inv.progressPercent ?? 0, mainImageUrl: inv.mainImageUrl ?? "", isActive: inv.isActive !== false })} className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => void handleRemoveInvestment(inv._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Featured config for investments */}
                {investments && investments.length > 0 && (
                  <FeaturedConfigPanel
                    categoryKey="inwestycje"
                    itemType="investment"
                    items={investments}
                    getItemId={(inv) => inv._id}
                    getItemName={(inv) => inv.projectName}
                    getItemImage={(inv) => inv.mainImageUrl}
                    existingConfig={investmentsHeroConfig}
                    onSave={(items) => upsertHeroConfig({ categoryKey: "inwestycje", itemType: "investment", items })}
                  />
                )}
              </div>
            )}

            {/* Entities tab (for all advanced categories) */}
            {isAdvanced && activeSubTab === "entities" && entitySections.length > 0 && (
              <div className="space-y-6">
                {entitySections.map((section) => {
                  const items = (categoryEntities ?? []).filter((e) => e.entityType === section.type);
                  const draft = entityDrafts[section.type] ?? createEntityDraft(section.type);
                  const parentOptions = (categoryEntities ?? []).filter((e) => e.entityType !== section.type);
                  return (
                    <div key={section.type} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 dark:text-slate-100">{section.label}</h5>
                            <span className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">{items.length}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                        </div>
                      </div>
                      <div className="grid gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 md:grid-cols-2">
                        <FieldInput label="Nazwa" value={draft.name} onChange={(v) => updateEntityDraft(section.type, { entityType: section.type, name: v, slug: normalizeSlug(v) })} />
                        <FieldInput label="Slug" value={draft.slug} onChange={(v) => updateEntityDraft(section.type, { entityType: section.type, slug: normalizeSlug(v) })} />
                        <FieldInput label="Ikona" value={draft.icon} onChange={(v) => updateEntityDraft(section.type, { entityType: section.type, icon: v })} placeholder="Lucide icon name" />
                        <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <span>Kolor</span>
                          <div className="flex items-center gap-2">
                            <input type="color" value={draft.color || "#0f172a"} onChange={(e) => updateEntityDraft(section.type, { entityType: section.type, color: e.target.value })} className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer" />
                            <input value={draft.color} onChange={(e) => updateEntityDraft(section.type, { entityType: section.type, color: e.target.value })} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none" />
                          </div>
                        </label>
                        <FieldInput label="External ref / kod" value={draft.externalRef} onChange={(v) => updateEntityDraft(section.type, { entityType: section.type, externalRef: v })} />
                        <FieldInput label="Kolejność" value={String(draft.order)} onChange={(v) => updateEntityDraft(section.type, { entityType: section.type, order: Number(v) || 0 })} />
                        {section.supportsParent && (
                          <label className="space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 md:col-span-2">
                            <span>Powiązanie nadrzędne</span>
                            <select value={draft.parentId ?? ""} onChange={(e) => updateEntityDraft(section.type, { entityType: section.type, parentId: (e.target.value || undefined) as string | undefined })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none">
                              <option value="">Bez powiązania</option>
                              {parentOptions.map((e) => <option key={e._id} value={e._id}>{e.name} ({e.entityType})</option>)}
                            </select>
                          </label>
                        )}
                        <FieldTextarea label="Opis" value={draft.description} onChange={(v) => updateEntityDraft(section.type, { entityType: section.type, description: v })} className="md:col-span-2" />
                        <div className="md:col-span-2 flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input type="checkbox" checked={draft.isActive} onChange={(e) => updateEntityDraft(section.type, { entityType: section.type, isActive: e.target.checked })} />
                            Aktywna
                          </label>
                          <button type="button" onClick={() => void handleSaveEntity(section.type)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-bold text-white dark:text-slate-900">
                            <Check className="h-4 w-4" />
                            Zapisz encję
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {items.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-4 text-sm text-slate-400 text-center">Brak wpisów w sekcji {section.label.toLowerCase()}.</p>}
                        {items.map((entity) => (
                          <div key={entity._id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {entity.color && <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entity.color }} />}
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{entity.name}</p>
                              </div>
                              <p className="truncate text-xs text-slate-500">{entity.slug}{entity.externalRef ? ` · ${entity.externalRef}` : ""}</p>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleEditEntity(entity)} className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => void handleRemoveEntity(entity._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}