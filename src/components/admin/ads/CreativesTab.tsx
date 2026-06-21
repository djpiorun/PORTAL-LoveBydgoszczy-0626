import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from "lucide-react";
import { deleteAdsCreative, fetchAdsCampaigns, fetchAdsCreatives, saveAdsCreative } from "@/lib/ads-api";
import { toast } from "sonner";

const AD_TYPES = [
  { value: "banner", label: "Banner graficzny" },
  { value: "html", label: "Reklama HTML / embed" },
  { value: "text", label: "Reklama tekstowa" },
  { value: "sponsored_article", label: "Artykuł sponsorowany" },
  { value: "in_content", label: "Reklama w treści" },
  { value: "popup", label: "Popup" },
  { value: "slider", label: "Slider" },
  { value: "logo", label: "Logotyp partnera" },
];

const EMPTY_FORM = {
  name: "",
  type: "banner",
  content: "",
  targetUrl: "",
  campaignId: "",
  desktopImageUrl: "",
  mobileImageUrl: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

type Creative = {
  id: string;
  name: string;
  type: string;
  content?: string;
  targetUrl?: string;
  campaignId?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  startDate?: number;
  endDate?: number;
  isActive: boolean;
  views?: number;
  clicks?: number;
};

type Campaign = {
  id: string;
  name: string;
};

interface CreativeFormProps {
  formData: typeof EMPTY_FORM;
  setFormData: (d: typeof EMPTY_FORM) => void;
  campaigns: Campaign[];
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

const upsertById = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = <T extends { id: string }>(items: T[], id: string) => items.filter((item) => item.id !== id);

const parseDateValue = (value: any) => {
  if (!value) return undefined;
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.getTime();
};

const normalizeCreative = (item: any): Creative => ({
  id: String(item?.id ?? item?._id ?? ""),
  name: item?.name ?? "",
  type: item?.type ?? "banner",
  content: item?.content ?? "",
  targetUrl: item?.targetUrl ?? item?.target_url ?? "",
  campaignId: item?.campaignId ?? item?.campaign_id ?? undefined,
  desktopImageUrl: item?.desktopImageUrl ?? item?.desktop_image_url ?? "",
  mobileImageUrl: item?.mobileImageUrl ?? item?.mobile_image_url ?? "",
  startDate: parseDateValue(item?.startDate ?? item?.start_date),
  endDate: parseDateValue(item?.endDate ?? item?.end_date),
  isActive: item?.isActive ?? item?.is_active ?? true,
  views: item?.views ?? 0,
  clicks: item?.clicks ?? 0,
});

const normalizeCampaign = (item: any): Campaign => ({
  id: String(item?.id ?? item?._id ?? ""),
  name: item?.name ?? "",
});

function CreativeForm({ formData, setFormData, campaigns, onSubmit, isEditing }: CreativeFormProps) {
  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label>Nazwa kreacji *</Label>
        <Input required value={formData.name} onChange={set("name")} placeholder="np. Baner Helios Wiosna" />
      </div>
      <div className="space-y-2">
        <Label>Typ reklamy *</Label>
        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {AD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Kampania</Label>
        <Select value={formData.campaignId} onValueChange={(v) => setFormData({ ...formData, campaignId: v })}>
          <SelectTrigger><SelectValue placeholder="Wybierz kampanię" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Brak —</SelectItem>
            {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Link docelowy</Label>
        <Input value={formData.targetUrl} onChange={set("targetUrl")} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Grafika desktop (URL)</Label>
        <Input value={formData.desktopImageUrl} onChange={set("desktopImageUrl")} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Grafika mobile (URL)</Label>
        <Input value={formData.mobileImageUrl} onChange={set("mobileImageUrl")} placeholder="https://..." />
      </div>
      {(formData.type === "html" || formData.type === "text") && (
        <div className="space-y-2">
          <Label>Treść / Kod HTML</Label>
          <Input value={formData.content} onChange={set("content")} placeholder="Treść lub kod HTML" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data startu emisji</Label>
          <Input type="date" value={formData.startDate} onChange={set("startDate")} />
        </div>
        <div className="space-y-2">
          <Label>Data zakończenia emisji</Label>
          <Input type="date" value={formData.endDate} onChange={set("endDate")} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({ ...formData, isActive: v })} />
        <Label>Aktywna</Label>
      </div>
      <Button type="submit" className="w-full">{isEditing ? "Zapisz zmiany" : "Dodaj kreację"}</Button>
    </form>
  );
}

export function CreativesTab() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetchAdsCreatives();
        if (!active) return;
        const data = Array.isArray(response) ? response : response ?? [];
        setCreatives(data.map(normalizeCreative));
      } catch (error) {
        console.warn("Ads creatives API unavailable", error);
        if (active) setCreatives([]);
      }

      try {
        const response = await fetchAdsCampaigns();
        if (!active) return;
        const data = Array.isArray(response) ? response : response ?? [];
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

  const openNew = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (c: Creative) => {
    setEditingId(c.id);
    setFormData({
      name: c.name || "",
      type: c.type || "banner",
      content: c.content || "",
      targetUrl: c.targetUrl || "",
      campaignId: c.campaignId || "",
      desktopImageUrl: c.desktopImageUrl || "",
      mobileImageUrl: c.mobileImageUrl || "",
      startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "",
      endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "",
      isActive: c.isActive ?? true,
    });
    setIsOpen(true);
  };

  const buildPayload = () => ({
    name: formData.name,
    type: formData.type,
    content: formData.content || null,
    target_url: formData.targetUrl || null,
    campaign_id: formData.campaignId && formData.campaignId !== "none" ? formData.campaignId : null,
    desktop_image_url: formData.desktopImageUrl || null,
    mobile_image_url: formData.mobileImageUrl || null,
    start_date: formData.startDate ? new Date(formData.startDate).getTime() : null,
    end_date: formData.endDate ? new Date(formData.endDate).getTime() : null,
    is_active: formData.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    try {
      if (editingId) {
        const response = await saveAdsCreative(editingId, payload);
        const updated = normalizeCreative(response?.data ?? response ?? { id: editingId, ...payload });
        setCreatives((prev) => upsertById(prev, updated));
        toast.success("Kreacja zaktualizowana");
      } else {
        const response = await saveAdsCreative(null, payload);
        const created = normalizeCreative(response?.data ?? response ?? { id: createLocalId(), ...payload });
        setCreatives((prev) => upsertById(prev, created));
        toast.success("Kreacja dodana");
      }
      setIsOpen(false);
    } catch (error) {
      console.warn("Ads creatives save failed", error);
      const localId = editingId ?? createLocalId();
      const localCreative = normalizeCreative({ id: localId, ...payload });
      setCreatives((prev) => upsertById(prev, localCreative));
      toast.success("Zapisano lokalnie (brak API kreacji)");
      setIsOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę kreację?")) return;
    try {
      await deleteAdsCreative(id);
      setCreatives((prev) => removeById(prev, id));
      toast.success("Kreacja usunięta");
    } catch (error) {
      console.warn("Ads creatives delete failed", error);
      setCreatives((prev) => removeById(prev, id));
      toast.success("Usunięto lokalnie (brak API kreacji)");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const response = await saveAdsCreative(id, { is_active: !current });
      const updated = normalizeCreative(response?.data ?? response ?? { id, is_active: !current });
      setCreatives((prev) => upsertById(prev, updated));
      toast.success(current ? "Dezaktywowano" : "Aktywowano");
    } catch (error) {
      console.warn("Ads creatives toggle failed", error);
      setCreatives((prev) => upsertById(prev, { id, isActive: !current } as Creative));
      toast.success("Zapisano lokalnie (brak API kreacji)");
    }
  };

  const getCampaignName = (campaignId?: string) => {
    if (!campaignId) return "—";
    return campaigns.find((c) => c.id === campaignId)?.name || "—";
  };

  const getTypeLabel = (type: string) => AD_TYPES.find((t) => t.value === type)?.label || type;

  const filtered = creatives.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Ładowanie kreacji...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle>Reklamy / Kreacje</CardTitle>
          <CardDescription>Zarządzaj materiałami reklamowymi i kreacjami.</CardDescription>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" /> Nowa kreacja</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Szukaj kreacji..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Wszystkie typy" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              {AD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
              <tr>
                <th className="px-4 py-3">Kreacja</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Kampania</th>
                <th className="px-4 py-3 text-center">Wyśw.</th>
                <th className="px-4 py-3 text-center">Klik.</th>
                <th className="px-4 py-3 text-center">Aktywna</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length > 0 ? filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{getTypeLabel(c.type)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{getCampaignName(c.campaignId)}</td>
                  <td className="px-4 py-3 text-center">{(c.views || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{(c.clicks || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={c.isActive} onCheckedChange={() => handleToggle(c.id, c.isActive)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Brak kreacji.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edytuj kreację" : "Nowa kreacja"}</DialogTitle>
          </DialogHeader>
          <CreativeForm
            formData={formData}
            setFormData={setFormData}
            campaigns={campaigns}
            onSubmit={handleSubmit}
            isEditing={!!editingId}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
