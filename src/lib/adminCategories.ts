export type AdminCategorySubcategory = {
  key: string;
  label: string;
  description?: string;
  isActive?: boolean;
};

export type AdminCategoryDefinition = {
  value: string;
  label: string;
  color: string;
  type: "basic" | "advanced";
  routeSlug?: string;
  description?: string;
  subcategories?: AdminCategorySubcategory[];
};

export const ADMIN_CATEGORY_DEFINITIONS: AdminCategoryDefinition[] = [
  { value: "miasto", label: "Miasto", color: "#3b82f6", type: "basic", description: "Wiadomości miejskie i lokalne wydarzenia" },
  { value: "rozrywka", label: "Rozrywka", color: "#8b5cf6", type: "basic", description: "Koncerty, wydarzenia i lifestyle" },
  { value: "kultura", label: "Kultura", color: "#f59e0b", type: "basic", description: "Sztuka, teatr i dziedzictwo miasta" },
  { value: "biznes", label: "Biznes", color: "#10b981", type: "basic", description: "Gospodarka i przedsiębiorczość" },
  { value: "gastronomia", label: "Gastronomia", color: "#f97316", type: "basic", description: "Restauracje, kawiarnie i lokalne smaki" },
  { value: "bydgoszczanie", label: "Bydgoszczanie", color: "#f43f5e", type: "basic", description: "Historie mieszkańców i sylwetki" },
  { value: "medyczna", label: "Medyczna Bydgoszcz", color: "#14b8a6", type: "basic", description: "Zdrowie, medycyna i profilaktyka" },
  {
    value: "sport",
    label: "Sport",
    color: "#2563eb",
    type: "advanced",
    description: "Rozbudowana kategoria z dyscyplinami, drużynami i relacjami meczowymi",
    subcategories: [
      { key: "pilka_nozna", label: "Piłka nożna", isActive: true },
      { key: "siatkowka", label: "Siatkówka", isActive: true },
      { key: "zuzel", label: "Żużel", isActive: true },
      { key: "inne", label: "Inne", isActive: true },
    ],
  },
  {
    value: "polityka",
    label: "Polityka",
    color: "#475569",
    type: "advanced",
    description: "Kategoria z ugrupowaniami, politykami i osią wydarzeń",
    subcategories: [
      { key: "koalicja_obywatelska", label: "Koalicja Obywatelska", isActive: true },
      { key: "prawo_i_sprawiedliwosc", label: "Prawo i Sprawiedliwość", isActive: true },
      { key: "trzecia_droga", label: "Trzecia Droga", isActive: true },
      { key: "lewica", label: "Lewica", isActive: true },
    ],
  },
  {
    value: "inwestycje",
    label: "Inwestycje",
    color: "#d97706",
    type: "advanced",
    description: "Kategoria z projektami, statusami i monitoringiem realizacji",
    subcategories: [
      { key: "planowana", label: "Planowana", isActive: true },
      { key: "w_trakcie", label: "W trakcie", isActive: true },
      { key: "zakonczona", label: "Zakończona", isActive: true },
      { key: "wstrzymana", label: "Wstrzymana", isActive: true },
    ],
  },
  {
    value: "nasze_dzialania",
    label: "Nasze Działania",
    color: "#db2777",
    type: "advanced",
    routeSlug: "nasze-dzialania",
    description: "Kategoria redakcyjna z akcjami, projektami i współpracami",
    subcategories: [
      { key: "akcja", label: "Akcja", isActive: true },
      { key: "projekt", label: "Projekt", isActive: true },
      { key: "kampania", label: "Kampania", isActive: true },
      { key: "wspolpraca", label: "Współpraca", isActive: true },
    ],
  },
];

export const ADMIN_FALLBACK_CATEGORIES = ADMIN_CATEGORY_DEFINITIONS.map((category) => ({
  value: category.value,
  label: category.label,
}));

export function getAdminCategoryDefinition(key: string) {
  return ADMIN_CATEGORY_DEFINITIONS.find((category) => category.value === key);
}
