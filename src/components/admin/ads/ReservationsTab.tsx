import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "W trakcie", color: "bg-green-100 text-green-700 border-green-200" },
  planned: { label: "Zaplanowana", color: "bg-blue-100 text-blue-700 border-blue-200" },
  draft: { label: "Szkic", color: "bg-slate-100 text-slate-600 border-slate-200" },
  paused: { label: "Wstrzymana", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  finished: { label: "Zakończona", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

type Campaign = {
  id: string;
  name: string;
  status?: string;
  startDate?: number;
  endDate?: number;
  budget?: number;
};

const normalizeCampaign = (item: any): Campaign => ({
  id: String(item?.id ?? item?._id ?? ""),
  name: item?.name ?? "",
  status: item?.status ?? "draft",
  startDate: item?.startDate ?? item?.start_date ?? null,
  endDate: item?.endDate ?? item?.end_date ?? null,
  budget: item?.budget ?? null,
});

export function ReservationsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any>("/admin/ads/campaigns");
        if (!active) return;
        const data = Array.isArray(response) ? response : response?.data ?? [];
        setCampaigns(data.map(normalizeCampaign));
      } catch (error) {
        console.warn("Ads campaigns API unavailable", error);
        if (active) setCampaigns([]);
      }
      if (active) setIsLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const upcoming = campaigns
    .filter((c) => c.status === "planned" || c.status === "active" || c.status === "draft")
    .sort((a, b) => (a.startDate ?? 0) - (b.startDate ?? 0));

  const finished = campaigns
    .filter((c) => c.status === "finished")
    .sort((a, b) => (b.endDate ?? 0) - (a.endDate ?? 0))
    .slice(0, 5);

  const totalBudget = upcoming.reduce((sum, c) => sum + (c.budget || 0), 0);

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Ładowanie rezerwacji...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktywne / Zaplanowane</p>
                <p className="text-2xl font-bold">{upcoming.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Łączny budżet</p>
                <p className="text-2xl font-bold">{totalBudget.toLocaleString()} zł</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zakończone</p>
                <p className="text-2xl font-bold">{campaigns.filter((c) => c.status === "finished").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Harmonogram kampanii</CardTitle>
          <CardDescription>Aktywne i zaplanowane kampanie reklamowe.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcoming.length > 0 ? upcoming.map((c) => {
              const cfg = STATUS_CONFIG[c.status || "draft"] || STATUS_CONFIG.draft;
              const daysLeft = c.endDate ? Math.ceil((c.endDate - Date.now()) / (1000 * 60 * 60 * 24)) : null;
              const daysUntilStart = c.startDate && c.startDate > Date.now() ? Math.ceil((c.startDate - Date.now()) / (1000 * 60 * 60 * 24)) : null;

              return (
                <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{c.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {c.startDate ? new Date(c.startDate).toLocaleDateString("pl-PL") : "—"}
                        {" → "}
                        {c.endDate ? new Date(c.endDate).toLocaleDateString("pl-PL") : "—"}
                      </span>
                      {c.budget && <span className="text-green-600 font-medium">{c.budget.toLocaleString()} zł</span>}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    {daysUntilStart !== null && daysUntilStart > 0 ? (
                      <span className="text-blue-600 font-medium">Start za {daysUntilStart} dni</span>
                    ) : daysLeft !== null ? (
                      <span className={`font-medium ${daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-orange-600" : "text-slate-500"}`}>
                        {daysLeft > 0 ? `Kończy się za ${daysLeft} dni` : "Zakończona"}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Brak zaplanowanych kampanii.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {finished.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ostatnio zakończone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {finished.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 text-sm">
                  <span className="font-medium text-slate-600">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.endDate ? new Date(c.endDate).toLocaleDateString("pl-PL") : "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
