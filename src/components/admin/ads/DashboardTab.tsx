import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Megaphone, Image as ImageIcon, Calendar, DollarSign, Users, MousePointer, Eye, TrendingUp, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

function StatCard({ title, value, icon: Icon, color = "blue", sub }: { title: string; value: string | number; icon: any; color?: string; sub?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type AdsCampaignStat = {
  _id: string;
  name: string;
  partnerName?: string;
  ctr?: number;
  views?: number;
  clicks?: number;
  daysLeft?: number;
};

type AdsPlacementStat = {
  _id: string;
  name: string;
  used: number;
  maxAds: number;
};

type AdsDashboardStats = {
  activeCampaigns: number;
  plannedCampaigns: number;
  activeCreatives: number;
  activePartners: number;
  estimatedRevenue: number;
  totalViews: number;
  totalClicks: number;
  avgCtr: number;
  topCampaigns: AdsCampaignStat[];
  endingSoon: AdsCampaignStat[];
  placementOccupancy: AdsPlacementStat[];
};

const DEFAULT_STATS: AdsDashboardStats = {
  activeCampaigns: 0,
  plannedCampaigns: 0,
  activeCreatives: 0,
  activePartners: 0,
  estimatedRevenue: 0,
  totalViews: 0,
  totalClicks: 0,
  avgCtr: 0,
  topCampaigns: [],
  endingSoon: [],
  placementOccupancy: [],
};

const normalizeCampaign = (item: any): AdsCampaignStat => ({
  _id: String(item?._id ?? item?.id ?? ""),
  name: item?.name ?? "",
  partnerName: item?.partnerName ?? item?.partner_name ?? "",
  ctr: Number(item?.ctr ?? item?.avg_ctr ?? 0),
  views: Number(item?.views ?? item?.total_views ?? 0),
  clicks: Number(item?.clicks ?? item?.total_clicks ?? 0),
  daysLeft: item?.daysLeft ?? item?.days_left ?? undefined,
});

const normalizePlacement = (item: any): AdsPlacementStat => ({
  _id: String(item?._id ?? item?.id ?? ""),
  name: item?.name ?? "",
  used: Number(item?.used ?? 0),
  maxAds: Number(item?.maxAds ?? item?.max_ads ?? 0),
});

const normalizeStats = (data: any): AdsDashboardStats => ({
  activeCampaigns: data?.activeCampaigns ?? data?.active_campaigns ?? 0,
  plannedCampaigns: data?.plannedCampaigns ?? data?.planned_campaigns ?? 0,
  activeCreatives: data?.activeCreatives ?? data?.active_creatives ?? 0,
  activePartners: data?.activePartners ?? data?.active_partners ?? 0,
  estimatedRevenue: data?.estimatedRevenue ?? data?.estimated_revenue ?? 0,
  totalViews: data?.totalViews ?? data?.total_views ?? 0,
  totalClicks: data?.totalClicks ?? data?.total_clicks ?? 0,
  avgCtr: Number(data?.avgCtr ?? data?.avg_ctr ?? 0),
  topCampaigns: (data?.topCampaigns ?? data?.top_campaigns ?? []).map(normalizeCampaign),
  endingSoon: (data?.endingSoon ?? data?.ending_soon ?? []).map(normalizeCampaign),
  placementOccupancy: (data?.placementOccupancy ?? data?.placement_occupancy ?? []).map(normalizePlacement),
});

export function DashboardTab() {
  const [stats, setStats] = useState<AdsDashboardStats | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any>("/admin/ads/dashboard-stats");
        if (!active) return;
        setStats(normalizeStats(response));
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

  if (!stats) return <div className="py-8 text-center text-muted-foreground">Ładowanie statystyk...</div>;

  const chartData = stats.topCampaigns.map(c => ({
    _id: c._id,
    name: c.name.length > 12 ? c.name.substring(0, 12) + "…" : c.name,
    views: c.views ?? 0,
    clicks: c.clicks ?? 0,
  }));

  const maxViews = Math.max(...chartData.map((item) => item.views), 1);
  const maxClicks = Math.max(...chartData.map((item) => item.clicks), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard title="Aktywne kampanie" value={stats.activeCampaigns} icon={Megaphone} color="blue" sub={`${stats.plannedCampaigns} zaplanowanych`} />
        <StatCard title="Aktywne reklamy" value={stats.activeCreatives} icon={ImageIcon} color="green" />
        <StatCard title="Partnerzy" value={stats.activePartners} icon={Users} color="purple" />
        <StatCard title="Przychód (szac.)" value={`${(stats.estimatedRevenue || 0).toLocaleString()} zł`} icon={DollarSign} color="amber" />
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <StatCard title="Wyświetlenia" value={(stats.totalViews || 0).toLocaleString()} icon={Eye} color="teal" />
        <StatCard title="Kliknięcia" value={(stats.totalClicks || 0).toLocaleString()} icon={MousePointer} color="rose" />
        <StatCard title="Średni CTR" value={`${stats.avgCtr}%`} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Wyświetlenia i kliknięcia – top kampanie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.length > 0 ? chartData.map((item) => (
                <div key={item._id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium truncate">{item.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span>{item.views.toLocaleString()} wyśw.</span>
                      <span>{item.clicks.toLocaleString()} klik.</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
                        style={{ width: `${Math.max((item.views / maxViews) * 100, 6)}%` }}
                      />
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                        style={{ width: `${Math.max((item.clicks / maxClicks) * 100, 6)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Brak danych kampanii</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Kończące się wkrótce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.endingSoon.map((c: any) => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-amber-600">Kończy się za {c.daysLeft} {c.daysLeft === 1 ? "dzień" : "dni"}</p>
                  </div>
                </div>
              ))}
              {stats.endingSoon.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">Brak kampanii kończących się wkrótce.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Najlepsze kampanie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCampaigns.map((c: any, i: number) => (
                <div key={c._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.partnerName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-semibold text-blue-600">{c.ctr}% CTR</p>
                    <p className="text-xs text-muted-foreground">{(c.views || 0).toLocaleString()} wyśw.</p>
                  </div>
                </div>
              ))}
              {stats.topCampaigns.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">Brak danych o kampaniach.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zajętość miejsc reklamowych</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats.placementOccupancy || []).map((p: any) => {
                const total = p.maxAds || 1;
                const pct = Math.min(100, Math.round((p.used / total) * 100));
                return (
                  <div key={p._id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{p.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{p.used}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-[width] duration-300 ${pct >= 100 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(stats.placementOccupancy || []).length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">Brak zdefiniowanych miejsc reklamowych.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}