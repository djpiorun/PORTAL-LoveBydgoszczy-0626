import { Zap, Users, Palette, Briefcase, UtensilsCrossed, Heart, Stethoscope, Trophy, Building2, HardHat, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CategoryKey =
  | "miasto"
  | "rozrywka"
  | "kultura"
  | "biznes"
  | "gastronomia"
  | "bydgoszczanie"
  | "medyczna"
  | "sport"
  | "polityka"
  | "inwestycje"
  | "nasze_dzialania";

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: LucideIcon;
  gradient: string;
  darkGradient: string;
  accentColor: string;
  accentColorDark: string;
  badgeColor: string;
  badgeColorDark: string;
  borderColor: string;
  borderColorDark: string;
  description: string;
}

export const categoryConfigs: Record<CategoryKey, CategoryConfig> = {
  miasto: {
    key: "miasto",
    label: "Miasto",
    icon: Zap,
    gradient: "from-sky-500/10 via-blue-500/5 to-cyan-500/10",
    darkGradient: "dark:from-sky-900/20 dark:via-blue-900/10 dark:to-cyan-900/20",
    accentColor: "text-sky-600",
    accentColorDark: "dark:text-sky-400",
    badgeColor: "bg-sky-100 text-sky-900",
    badgeColorDark: "dark:bg-sky-900/30 dark:text-sky-300",
    borderColor: "border-sky-200",
    borderColorDark: "dark:border-sky-900/50",
    description: "Wiadomości miejskie i lokalne wydarzenia",
  },
  rozrywka: {
    key: "rozrywka",
    label: "Rozrywka",
    icon: Palette,
    gradient: "from-fuchsia-500/10 via-pink-500/5 to-purple-500/10",
    darkGradient: "dark:from-fuchsia-900/20 dark:via-pink-900/10 dark:to-purple-900/20",
    accentColor: "text-fuchsia-600",
    accentColorDark: "dark:text-fuchsia-400",
    badgeColor: "bg-fuchsia-100 text-fuchsia-900",
    badgeColorDark: "dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
    borderColor: "border-fuchsia-200",
    borderColorDark: "dark:border-fuchsia-900/50",
    description: "Wydarzenia rozrywkowe i kulturalne",
  },
  kultura: {
    key: "kultura",
    label: "Kultura",
    icon: Palette,
    gradient: "from-violet-500/10 via-purple-500/5 to-indigo-500/10",
    darkGradient: "dark:from-violet-900/20 dark:via-purple-900/10 dark:to-indigo-900/20",
    accentColor: "text-violet-600",
    accentColorDark: "dark:text-violet-400",
    badgeColor: "bg-violet-100 text-violet-900",
    badgeColorDark: "dark:bg-violet-900/30 dark:text-violet-300",
    borderColor: "border-violet-200",
    borderColorDark: "dark:border-violet-900/50",
    description: "Kultura, sztuka i dziedzictwo",
  },
  biznes: {
    key: "biznes",
    label: "Biznes",
    icon: Briefcase,
    gradient: "from-emerald-500/10 via-green-500/5 to-teal-500/10",
    darkGradient: "dark:from-emerald-900/20 dark:via-green-900/10 dark:to-teal-900/20",
    accentColor: "text-emerald-600",
    accentColorDark: "dark:text-emerald-400",
    badgeColor: "bg-emerald-100 text-emerald-900",
    badgeColorDark: "dark:bg-emerald-900/30 dark:text-emerald-300",
    borderColor: "border-emerald-200",
    borderColorDark: "dark:border-emerald-900/50",
    description: "Biznes lokalny i przedsiębiorczość",
  },
  gastronomia: {
    key: "gastronomia",
    label: "Gastronomia",
    icon: UtensilsCrossed,
    gradient: "from-orange-500/10 via-amber-500/5 to-yellow-500/10",
    darkGradient: "dark:from-orange-900/20 dark:via-amber-900/10 dark:to-yellow-900/20",
    accentColor: "text-orange-600",
    accentColorDark: "dark:text-orange-400",
    badgeColor: "bg-orange-100 text-orange-900",
    badgeColorDark: "dark:bg-orange-900/30 dark:text-orange-300",
    borderColor: "border-orange-200",
    borderColorDark: "dark:border-orange-900/50",
    description: "Restauracje, kawiarnie i kulinaria",
  },
  bydgoszczanie: {
    key: "bydgoszczanie",
    label: "Bydgoszczanie",
    icon: Users,
    gradient: "from-rose-500/10 via-pink-500/5 to-red-500/10",
    darkGradient: "dark:from-rose-900/20 dark:via-pink-900/10 dark:to-red-900/20",
    accentColor: "text-rose-600",
    accentColorDark: "dark:text-rose-400",
    badgeColor: "bg-rose-100 text-rose-900",
    badgeColorDark: "dark:bg-rose-900/30 dark:text-rose-300",
    borderColor: "border-rose-200",
    borderColorDark: "dark:border-rose-900/50",
    description: "Historie mieszkańców Bydgoszczy",
  },
  medyczna: {
    key: "medyczna",
    label: "Zdrowie",
    icon: Stethoscope,
    gradient: "from-cyan-500/10 via-teal-500/5 to-blue-500/10",
    darkGradient: "dark:from-cyan-900/20 dark:via-teal-900/10 dark:to-blue-900/20",
    accentColor: "text-cyan-600",
    accentColorDark: "dark:text-cyan-400",
    badgeColor: "bg-cyan-100 text-cyan-900",
    badgeColorDark: "dark:bg-cyan-900/30 dark:text-cyan-300",
    borderColor: "border-cyan-200",
    borderColorDark: "dark:border-cyan-900/50",
    description: "Zdrowie i opieka medyczna",
  },
  sport: {
    key: "sport",
    label: "Sport",
    icon: Trophy,
    gradient: "from-blue-500/10 via-indigo-500/5 to-blue-600/10",
    darkGradient: "dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-blue-950/20",
    accentColor: "text-blue-600",
    accentColorDark: "dark:text-blue-400",
    badgeColor: "bg-blue-100 text-blue-900",
    badgeColorDark: "dark:bg-blue-900/30 dark:text-blue-300",
    borderColor: "border-blue-200",
    borderColorDark: "dark:border-blue-900/50",
    description: "Sport lokalny i wyniki meczów",
  },
  polityka: {
    key: "polityka",
    label: "Polityka",
    icon: Building2,
    gradient: "from-slate-500/10 via-gray-500/5 to-zinc-500/10",
    darkGradient: "dark:from-slate-900/20 dark:via-gray-900/10 dark:to-zinc-900/20",
    accentColor: "text-slate-700",
    accentColorDark: "dark:text-slate-300",
    badgeColor: "bg-slate-100 text-slate-900",
    badgeColorDark: "dark:bg-slate-800 dark:text-slate-300",
    borderColor: "border-slate-200",
    borderColorDark: "dark:border-slate-800",
    description: "Polityka lokalna i samorządowa",
  },
  inwestycje: {
    key: "inwestycje",
    label: "Inwestycje",
    icon: HardHat,
    gradient: "from-amber-500/10 via-yellow-500/5 to-orange-500/10",
    darkGradient: "dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-orange-900/20",
    accentColor: "text-amber-600",
    accentColorDark: "dark:text-amber-400",
    badgeColor: "bg-amber-100 text-amber-900",
    badgeColorDark: "dark:bg-amber-900/30 dark:text-amber-300",
    borderColor: "border-amber-200",
    borderColorDark: "dark:border-amber-900/50",
    description: "Inwestycje miejskie i rozwój infrastruktury",
  },
  nasze_dzialania: {
    key: "nasze_dzialania",
    label: "Nasze Działania",
    icon: Target,
    gradient: "from-purple-500/10 via-fuchsia-500/5 to-pink-500/10",
    darkGradient: "dark:from-purple-900/20 dark:via-fuchsia-900/10 dark:to-pink-900/20",
    accentColor: "text-purple-600",
    accentColorDark: "dark:text-purple-400",
    badgeColor: "bg-purple-100 text-purple-900",
    badgeColorDark: "dark:bg-purple-900/30 dark:text-purple-300",
    borderColor: "border-purple-200",
    borderColorDark: "dark:border-purple-900/50",
    description: "Akcje i projekty redakcji",
  },
};

export function getCategoryConfig(category: string): CategoryConfig {
  const config = categoryConfigs[category as CategoryKey];
  return config || categoryConfigs.miasto; // fallback to miasto
}

export function getCategoryLabel(category: string): string {
  return getCategoryConfig(category).label;
}

export function getCategoryIcon(category: string): LucideIcon {
  return getCategoryConfig(category).icon;
}

export function getCategoryGradient(category: string): string {
  const config = getCategoryConfig(category);
  return `bg-gradient-to-br ${config.gradient} ${config.darkGradient}`;
}

export function getCategoryAccentColor(category: string): string {
  const config = getCategoryConfig(category);
  return `${config.accentColor} ${config.accentColorDark}`;
}

export function getCategoryBadgeColor(category: string): string {
  const config = getCategoryConfig(category);
  return `${config.badgeColor} ${config.badgeColorDark}`;
}

export function getCategoryBorderColor(category: string): string {
  const config = getCategoryConfig(category);
  return `border ${config.borderColor} ${config.borderColorDark}`;
}
