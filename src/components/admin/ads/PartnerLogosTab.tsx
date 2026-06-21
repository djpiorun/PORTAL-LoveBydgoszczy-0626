import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Image as ImageIcon, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { fetchAdsPartnersAdmin, saveAdsPartner } from "@/lib/ads-api";

type Partner = {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
  showInSlider?: boolean;
  sliderOrder?: number;
  status?: string;
};

const normalizePartner = (item: any): Partner => ({
  id: String(item?.id ?? item?._id ?? ""),
  name: item?.name ?? "",
  website: item?.website ?? "",
  logoUrl: item?.logoUrl ?? item?.logo_url ?? "",
  showInSlider: item?.showInSlider ?? item?.show_in_slider ?? false,
  sliderOrder: item?.sliderOrder ?? item?.slider_order ?? 0,
  status: item?.status ?? "prospect",
});

const upsertById = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

export function PartnerLogosTab() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetchAdsPartnersAdmin();
        if (!active) return;
        const data = Array.isArray(response) ? response : response ?? [];
        setPartners(data.map(normalizePartner));
      } catch (error) {
        console.warn("Ads partners API unavailable", error);
        if (active) setPartners([]);
      }
      if (active) setIsLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const sortedPartners = useMemo(
    () => [...partners].sort((a, b) => (a.sliderOrder ?? 99) - (b.sliderOrder ?? 99)),
    [partners]
  );
  const sliderPartners = sortedPartners.filter((p) => p.showInSlider);

  const updatePartner = async (id: string, payload: Record<string, unknown>) => {
    try {
      const response = await saveAdsPartner(id, payload);
      const updated = normalizePartner(response?.data ?? response ?? { id, ...payload });
      setPartners((prev) => upsertById(prev, updated));
      return true;
    } catch (error) {
      console.warn("Ads partner update failed", error);
      setPartners((prev) => upsertById(prev, normalizePartner({ id, ...payload })));
      toast.success("Zapisano lokalnie (brak API partnerów)");
      return false;
    }
  };

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    const success = await updatePartner(id, { show_in_slider: !currentStatus });
    if (success) {
      toast.success(currentStatus ? "Ukryto logotyp w sliderze" : "Dodano logotyp do slidera");
    }
  };

  const handleOrderChange = async (id: string, order: number) => {
    const success = await updatePartner(id, { slider_order: order });
    if (success) {
      toast.success("Zaktualizowano kolejność");
    }
  };

  const handleLogoUrlChange = async (id: string, logoUrl: string) => {
    const success = await updatePartner(id, { logo_url: logoUrl });
    if (success) {
      toast.success("Zaktualizowano URL logotypu");
    }
  };

  const PartnerRow = ({ p }: { p: Partner }) => (
    <tr key={p.id} className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-sm">{p.name}</p>
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />{p.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {p.logoUrl ? (
          <div className="flex items-center gap-2">
            <img src={p.logoUrl} alt={p.name} className="h-8 max-w-[80px] object-contain border rounded p-1 bg-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <ImageIcon className="w-4 h-4" /> Brak logo
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <Input
          placeholder="https://..."
          defaultValue={p.logoUrl || ""}
          onBlur={(e) => {
            if (e.target.value !== (p.logoUrl || "")) {
              handleLogoUrlChange(p.id, e.target.value);
            }
          }}
          className="h-8 text-xs w-48"
        />
      </td>
      <td className="px-4 py-3 text-center">
        <Switch
          checked={p.showInSlider || false}
          onCheckedChange={() => handleToggleVisibility(p.id, p.showInSlider || false)}
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={p.sliderOrder ?? 0}
          onChange={(e) => handleOrderChange(p.id, parseInt(e.target.value, 10) || 0)}
          className="w-20 h-8"
        />
      </td>
      <td className="px-4 py-3">
        <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">
          {p.status === "active" ? "Aktywny" : p.status === "prospect" ? "Prospekt" : "Nieaktywny"}
        </Badge>
      </td>
    </tr>
  );

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Ładowanie partnerów...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Slider partnerów</CardTitle>
          <CardDescription>
            {sliderPartners.length} logotypów wyświetlanych w sliderze. Zarządzaj kolejnością i widocznością.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Podgląd logo</th>
                  <th className="px-4 py-3">URL logotypu</th>
                  <th className="px-4 py-3 text-center">W sliderze</th>
                  <th className="px-4 py-3">Kolejność</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {partners.length > 0 ? partners.map((p) => (
                  <PartnerRow key={p.id} p={p} />
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Brak partnerów. Dodaj partnerów w zakładce "Partnerzy".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {sliderPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Podgląd slidera</CardTitle>
            <CardDescription>Logotypy wyświetlane w sliderze na stronie głównej.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border">
              {sliderPartners.map((p) => (
                <div key={p.id} className="flex flex-col items-center gap-1">
                  <div className="w-24 h-12 bg-white border rounded flex items-center justify-center p-2">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">#{p.sliderOrder ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
