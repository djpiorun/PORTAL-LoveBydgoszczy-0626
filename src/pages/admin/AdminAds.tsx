import { useEffect, useMemo, useState, type ComponentType } from "react";
import { BarChart3, Megaphone, Image as ImageIcon, LayoutTemplate, Users, MessageSquare, Image, LineChart, CalendarDays, DollarSign, Settings, ImagePlus, ChevronRight, Activity, MousePointer, Eye, BookOpenText } from "lucide-react";
import { DashboardTab } from "@/components/admin/ads/DashboardTab";
import { CampaignsTab } from "@/components/admin/ads/CampaignsTab";
import { CreativesTab } from "@/components/admin/ads/CreativesTab";
import { PlacementsTab } from "@/components/admin/ads/PlacementsTab";
import { PartnersTab } from "@/components/admin/ads/PartnersTab";
import { InquiriesTab } from "@/components/admin/ads/InquiriesTab";
import { PartnerLogosTab } from "@/components/admin/ads/PartnerLogosTab";
import { StatisticsTab } from "@/components/admin/ads/StatisticsTab";
import { ReservationsTab } from "@/components/admin/ads/ReservationsTab";
import { PricingTab } from "@/components/admin/ads/PricingTab";
import { GraphicsLibraryTab } from "@/components/admin/ads/GraphicsLibraryTab";
import { SettingsTab } from "@/components/admin/ads/SettingsTab";
import { InstructionsTab } from "@/components/admin/ads/InstructionsTab";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";

type AdminAdsTab =
  | "dashboard"
  | "instrukcje"
  | "kampanie"
  | "reklamy"
  | "miejsca"
  | "partnerzy"
  | "logotypy"
  | "statystyki"
  | "rezerwacje"
  | "zapytania"
  | "cennik"
  | "biblioteka"
  | "ustawienia";

type StandardTabComponent = ComponentType<Record<string, never>>;

const TAB_ITEMS: {
  value: AdminAdsTab;
  label: string;
  shortLabel: string;
  icon: typeof BarChart3;
  component?: StandardTabComponent;
}[] = [
  { value: "dashboard", label: "Dashboard", shortLabel: "Start", icon: BarChart3, component: DashboardTab },
  { value: "instrukcje", label: "Instrukcje", shortLabel: "Info", icon: BookOpenText },
  { value: "kampanie", label: "Kampanie", shortLabel: "Kampanie", icon: Megaphone, component: CampaignsTab },
  { value: "reklamy", label: "Reklamy / Kreacje", shortLabel: "Reklamy", icon: ImageIcon, component: CreativesTab },
  { value: "miejsca", label: "Miejsca reklamowe", shortLabel: "Miejsca", icon: LayoutTemplate, component: PlacementsTab },
  { value: "partnerzy", label: "Partnerzy", shortLabel: "Partnerzy", icon: Users, component: PartnersTab },
  { value: "logotypy", label: "Logotypy partnerów", shortLabel: "Logotypy", icon: Image, component: PartnerLogosTab },
  { value: "statystyki", label: "Statystyki", shortLabel: "Statystyki", icon: LineChart, component: StatisticsTab },
  { value: "rezerwacje", label: "Rezerwacje", shortLabel: "Rezerwacje", icon: CalendarDays, component: ReservationsTab },
  { value: "zapytania", label: "Zapytania", shortLabel: "Zapytania", icon: MessageSquare, component: InquiriesTab },
  { value: "cennik", label: "Cennik", shortLabel: "Cennik", icon: DollarSign, component: PricingTab },
  { value: "biblioteka", label: "Biblioteka grafik", shortLabel: "Grafiki", icon: ImagePlus, component: GraphicsLibraryTab },
  { value: "ustawienia", label: "Ustawienia", shortLabel: "Ustawienia", icon: Settings, component: SettingsTab },
];

type AdsDashboardStats = {
  activeCampaigns: number;
  totalViews: number;
  totalClicks: number;
};

const DEFAULT_STATS: AdsDashboardStats = {
  activeCampaigns: 0,
  totalViews: 0,
  totalClicks: 0,
};

export default function AdminAds() {
  const [activeTab, setActiveTab] = useState<AdminAdsTab>("dashboard");
  const [stats, setStats] = useState<AdsDashboardStats>(DEFAULT_STATS);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any>("/admin/ads/dashboard-stats");
        if (!active) return;
        setStats({
          activeCampaigns: response?.active_campaigns ?? response?.activeCampaigns ?? 0,
          totalViews: response?.total_views ?? response?.totalViews ?? 0,
          totalClicks: response?.total_clicks ?? response?.totalClicks ?? 0,
        });
      } catch (error) {
        console.warn("Ads dashboard stats API unavailable", error);
        if (active) setStats(DEFAULT_STATS);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const activeItem = useMemo(
    () => TAB_ITEMS.find((item) => item.value === activeTab) ?? TAB_ITEMS[0],
    [activeTab],
  );

  const overview = [
    {
      label: "Aktywne kampanie",
      value: stats?.activeCampaigns ?? 0,
      icon: Activity,
    },
    {
      label: "Wyświetlenia",
      value: (stats?.totalViews ?? 0).toLocaleString(),
      icon: Eye,
    },
    {
      label: "Kliknięcia",
      value: (stats?.totalClicks ?? 0).toLocaleString(),
      icon: MousePointer,
    },
  ];

  const ActiveComponent = activeItem.component;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 xl:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-end">
          <div className="space-y-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] tracking-wide">
              Moduł monetyzacji
            </Badge>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Centrum Reklamy</h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Jeden spójny widok do kampanii, kreacji, miejsc reklamowych, partnerów i raportów.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {overview.map((item) => (
              <Card key={item.label} className="min-w-0 border-border/70 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="truncate text-lg font-semibold">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border px-3 py-3 sm:px-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {TAB_ITEMS.map((item) => {
              const isActive = item.value === activeTab;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveTab(item.value)}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 text-sm text-muted-foreground sm:px-6">
          <span>Reklama</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{activeItem.label}</span>
        </div>

        <div className="p-3 sm:p-4 xl:p-6">
          <div className="min-w-0">
            {activeItem.value === "instrukcje" ? (
              <InstructionsTab onSelectTab={setActiveTab} />
            ) : ActiveComponent ? (
              <ActiveComponent />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
