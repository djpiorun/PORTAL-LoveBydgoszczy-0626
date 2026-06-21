import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Megaphone, Image as ImageIcon, DollarSign, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type AdsCampaignStat = {
  _id: string;
  name: string;
  partnerName?: string;
  ctr: number;
  views: number;
  daysLeft?: number;
};

type AdsDashboardStats = {
  activeCampaigns: number;
  totalViews: number;
  avgCtr: number;
  estimatedRevenue: number;
  topCampaigns: AdsCampaignStat[];
  endingSoon: AdsCampaignStat[];
};

const DEFAULT_STATS: AdsDashboardStats = {
  activeCampaigns: 0,
  totalViews: 0,
  avgCtr: 0,
  estimatedRevenue: 0,
  topCampaigns: [],
  endingSoon: [],
};

const normalizeCampaign = (item: any): AdsCampaignStat => ({
  _id: String(item?._id ?? item?.id ?? ""),
  name: item?.name ?? "",
  partnerName: item?.partnerName ?? item?.partner_name ?? "",
  ctr: Number(item?.ctr ?? item?.avg_ctr ?? 0),
  views: Number(item?.views ?? item?.total_views ?? 0),
  daysLeft: item?.daysLeft ?? item?.days_left ?? undefined,
});

const normalizeStats = (data: any): AdsDashboardStats => ({
  activeCampaigns: data?.activeCampaigns ?? data?.active_campaigns ?? 0,
  totalViews: data?.totalViews ?? data?.total_views ?? 0,
  avgCtr: Number(data?.avgCtr ?? data?.avg_ctr ?? 0),
  estimatedRevenue: data?.estimatedRevenue ?? data?.estimated_revenue ?? 0,
  topCampaigns: (data?.topCampaigns ?? data?.top_campaigns ?? []).map(normalizeCampaign),
  endingSoon: (data?.endingSoon ?? data?.ending_soon ?? []).map(normalizeCampaign),
});

export function AdsDashboard() {
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

  if (!stats) {
    return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne kampanie</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wyświetlenia reklam</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Średni CTR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCtr}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Przychód (szacowany)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estimatedRevenue.toLocaleString()} zł</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Najlepsze kampanie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCampaigns.length > 0 ? stats.topCampaigns.map((c) => (
                <div key={c._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">Partner: {c.partnerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{c.ctr}% CTR</p>
                    <p className="text-sm text-muted-foreground">{c.views.toLocaleString()} wyświetleń</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Brak danych o kampaniach.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Kończące się wkrótce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.endingSoon.length > 0 ? stats.endingSoon.map((c) => (
                <div key={c._id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-amber-600">Kończy się za {c.daysLeft} dni</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Brak kampanii kończących się wkrótce.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
