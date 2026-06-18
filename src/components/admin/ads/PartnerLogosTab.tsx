import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Image as ImageIcon, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PartnerLogosTab() {
  const partners = useQuery(api.ads.getPartners) || [];
  const updatePartner = useMutation(api.ads.updatePartner);

  const sortedPartners = [...partners].sort((a: any, b: any) => (a.sliderOrder ?? 99) - (b.sliderOrder ?? 99));
  const sliderPartners = sortedPartners.filter((p: any) => p.showInSlider);
  const otherPartners = sortedPartners.filter((p: any) => !p.showInSlider);

  const handleToggleVisibility = async (id: any, currentStatus: boolean) => {
    try {
      await updatePartner({ id, showInSlider: !currentStatus });
      toast.success(currentStatus ? "Ukryto logotyp w sliderze" : "Dodano logotyp do slidera");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji");
    }
  };

  const handleOrderChange = async (id: any, order: number) => {
    try {
      await updatePartner({ id, sliderOrder: order });
      toast.success("Zaktualizowano kolejność");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji");
    }
  };

  const handleLogoUrlChange = async (id: any, logoUrl: string) => {
    try {
      await updatePartner({ id, logoUrl });
      toast.success("Zaktualizowano URL logotypu");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji");
    }
  };

  const PartnerRow = ({ p }: { p: any }) => (
    <tr key={p._id} className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-sm">{p.name}</p>
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />{p.website.replace(/^https?:\/\//, '')}
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
              handleLogoUrlChange(p._id, e.target.value);
            }
          }}
          className="h-8 text-xs w-48"
        />
      </td>
      <td className="px-4 py-3 text-center">
        <Switch
          checked={p.showInSlider || false}
          onCheckedChange={() => handleToggleVisibility(p._id, p.showInSlider || false)}
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={p.sliderOrder ?? 0}
          onChange={(e) => handleOrderChange(p._id, parseInt(e.target.value) || 0)}
          className="w-20 h-8"
        />
      </td>
      <td className="px-4 py-3">
        <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
          {p.status === 'active' ? 'Aktywny' : p.status === 'prospect' ? 'Prospekt' : 'Nieaktywny'}
        </Badge>
      </td>
    </tr>
  );

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
                {partners.length > 0 ? partners.map((p: any) => (
                  <PartnerRow key={p._id} p={p} />
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
              {sliderPartners.map((p: any) => (
                <div key={p._id} className="flex flex-col items-center gap-1">
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