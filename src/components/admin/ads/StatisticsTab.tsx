import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, MousePointer, DollarSign } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type AdsCampaignStat = {
  _id: string;
  name: string;
  views: number;
  clicks: number;
  ctr: number;
};

type AdsPlacementStat = {
  _id: string;
  name: string;
  used: number;
  available: number;
  maxAds: number;
};

type AdsDashboardStats = {
  totalViews: number;
  totalClicks: number;
  avgCtr: number;
  estimatedRevenue: number;
  topCampaigns: AdsCampaignStat[];
  placementOccupancy: AdsPlacementStat[];
};

const DEFAULT_STATS: AdsDashboardStats = {
  totalViews: 0,
  totalClicks: 0,
  avgCtr: 0,
  estimatedRevenue: 0,
  topCampaigns: [],
  placementOccupancy: [],
};

const normalizeCampaign = (item: any): AdsCampaignStat => ({
  _id: String(item?._id ?? item?.id ?? ""),
  name: item?.name ?? "",
  views: Number(item?.views ?? item?.total_views ?? 0),
  clicks: Number(item?.clicks ?? item?.total_clicks ?? 0),
  ctr: Number(item?.ctr ?? item?.avg_ctr ?? 0),
});

const normalizePlacement = (item: any): AdsPlacementStat => ({
  _id: String(item?._id ?? item?.id ?? ""),
  name: item?.name ?? "",
  used: Number(item?.used ?? 0),
  available: Number(item?.available ?? 0),
  maxAds: Number(item?.maxAds ?? item?.max_ads ?? 0),
});

const normalizeStats = (data: any): AdsDashboardStats => ({
  totalViews: data?.totalViews ?? data?.total_views ?? 0,
  totalClicks: data?.totalClicks ?? data?.total_clicks ?? 0,
  avgCtr: Number(data?.avgCtr ?? data?.avg_ctr ?? 0),
  estimatedRevenue: data?.estimatedRevenue ?? data?.estimated_revenue ?? 0,
  topCampaigns: (data?.topCampaigns ?? data?.top_campaigns ?? []).map(normalizeCampaign),
  placementOccupancy: (data?.placementOccupancy ?? data?.placement_occupancy ?? []).map(normalizePlacement),
});

export function StatisticsTab() {
  const [stats, setStats] = useState<AdsDashboardStats | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any>("/admin/ads/dashboard-stats");
        if (!active) return;
        setStats(normalizeStats(response));
      } catch (error) {
        console.warn("Ads statistics API unavailable", error);
        if (active) setStats(DEFAULT_STATS);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const campaignData = stats?.topCampaigns.map((c) => ({
    _id: c._id,
    name: c.name.length > 12 ? c.name.substring(0, 12) + '…' : c.name,
    views: c.views ?? 0,
    clicks: c.clicks ?? 0,
    ctr: Number(c.ctr ?? 0),
  })) || [];

  const placementData = stats?.placementOccupancy.map((p: any) => ({
    _id: p._id,
    name: p.name.length > 15 ? p.name.substring(0, 15) + '…' : p.name,
    used: p.used ?? 0,
    available: p.available ?? 0,
    maxAds: p.maxAds ?? 0,
  })) || [];

  const maxViews = Math.max(...campaignData.map((item) => item.views), 1);
  const maxCtr = Math.max(...campaignData.map((item) => item.ctr), 1);

  const kpis = [
    {
      label: "Łączne wyświetlenia",
      value: (stats?.totalViews ?? 0).toLocaleString(),
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Łączne kliknięcia",
      value: (stats?.totalClicks ?? 0).toLocaleString(),
      icon: MousePointer,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Średni CTR",
      value: `${stats?.avgCtr ?? "0.0"}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Szacowany przychód",
      value: `${(stats?.estimatedRevenue ?? 0).toLocaleString()} zł`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wyświetlenia i kliknięcia wg kampanii</CardTitle>
            <CardDescription>Top 5 kampanii według wyświetleń</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignData.length > 0 ? campaignData.map((item) => (
                <div key={item._id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium truncate">{item.name}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground shrink-0">
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
                        style={{ width: `${Math.max((item.clicks / Math.max(...campaignData.map((entry) => entry.clicks), 1)) * 100, 6)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  Brak danych do wyświetlenia
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zajętość miejsc reklamowych</CardTitle>
            <CardDescription>Liczba przypisanych reklam do miejsc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {placementData.length > 0 ? placementData.map((item) => {
                const total = Math.max(item.used + item.available, item.maxAds, 1);
                const usedPct = Math.round((item.used / total) * 100);
                return (
                  <div key={item._id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {item.used} / {total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500 transition-[width] duration-300"
                        style={{ width: `${usedPct}%` }}
                      />
                      <div
                        className="h-full bg-slate-200 transition-[width] duration-300"
                        style={{ width: `${100 - usedPct}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  Brak danych do wyświetlenia
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {campaignData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CTR wg kampanii (%)</CardTitle>
            <CardDescription>Współczynnik klikalności dla każdej kampanii</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignData.map((item) => (
                <div key={item._id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-xs font-semibold text-purple-600 shrink-0">{item.ctr}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-[width] duration-300"
                      style={{ width: `${Math.max((item.ctr / maxCtr) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}