import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, LayoutTemplate } from "lucide-react";
import { deleteAdsPlacement, fetchAdsPlacements, saveAdsPlacement } from "@/lib/ads-api";
import { toast } from "sonner";

const PLACEMENT_TYPES = [
  { value: "banner", label: "Banner" },
  { value: "sidebar", label: "Sidebar" },
  { value: "popup", label: "Popup" },
  { value: "slider", label: "Slider" },
  { value: "footer", label: "Stopka" },
  { value: "in_article", label: "W artykule" },
  { value: "sponsored_section", label: "Sekcja sponsorowana" },
];

const EMPTY_FORM = {
  name: "",
  systemName: "",
  description: "",
  dimensions: "",
  maxAds: "1",
  type: "banner",
  location: "",
  isActive: true,
  rotationEnabled: false,
};

type Placement = {
  id: string;
  name: string;
  systemName?: string;
  description?: string;
  dimensions?: string;
  maxAds?: number;
  type?: string;
  location?: string;
  isActive: boolean;
  rotationEnabled: boolean;
};

interface PlacementFormProps {
  formData: typeof EMPTY_FORM;
  setFormData: (d: typeof EMPTY_FORM) => void;
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

const normalizePlacement = (item: any): Placement => ({
  id: String(item?.id ?? item?._id ?? ""),
  name: item?.name ?? "",
  systemName: item?.systemName ?? item?.system_name ?? "",
  description: item?.description ?? "",
  dimensions: item?.dimensions ?? "",
  maxAds: item?.maxAds ?? item?.max_ads ?? 1,
  type: item?.type ?? "banner",
  location: item?.location ?? "",
  isActive: item?.isActive ?? item?.is_active ?? true,
  rotationEnabled: item?.rotationEnabled ?? item?.rotation_enabled ?? false,
});

function PlacementForm({ formData, setFormData, onSubmit, isEditing }: PlacementFormProps) {
  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nazwa miejsca *</Label>
        <Input required value={formData.name} onChange={set("name")} placeholder="np. Strona Główna - Top Banner" />
      </div>
      <div className="space-y-2">
        <Label>Nazwa systemowa</Label>
        <Input value={formData.systemName} onChange={set("systemName")} placeholder="np. home_top_banner" />
      </div>
      <div className="space-y-2">
        <Label>Typ miejsca</Label>
        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PLACEMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Wymiary</Label>
          <Input value={formData.dimensions} onChange={set("dimensions")} placeholder="np. 1140x200" />
        </div>
        <div className="space-y-2">
          <Label>Maks. reklam</Label>
          <Input type="number" min="1" value={formData.maxAds} onChange={set("maxAds")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Lokalizacja w portalu</Label>
        <Input value={formData.location} onChange={set("location")} placeholder="np. Strona główna, Artykuły" />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Input value={formData.description} onChange={set("description")} placeholder="Opis miejsca reklamowego" />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({ ...formData, isActive: v })} />
          <Label>Aktywne</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={formData.rotationEnabled} onCheckedChange={(v) => setFormData({ ...formData, rotationEnabled: v })} />
          <Label>Rotacja</Label>
        </div>
      </div>
      <Button type="submit" className="w-full">{isEditing ? "Zapisz zmiany" : "Dodaj miejsce"}</Button>
    </form>
  );
}

export function PlacementsTab() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetchAdsPlacements();
        if (!active) return;
        const data = Array.isArray(response) ? response : response ?? [];
        setPlacements(data.map(normalizePlacement));
      } catch (error) {
        console.warn("Ads placements API unavailable", error);
        if (active) setPlacements([]);
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

  const openEdit = (p: Placement) => {
    setEditingId(p.id);
    setFormData({
      name: p.name || "",
      systemName: p.systemName || "",
      description: p.description || "",
      dimensions: p.dimensions || "",
      maxAds: p.maxAds?.toString() || "1",
      type: p.type || "banner",
      location: p.location || "",
      isActive: p.isActive ?? true,
      rotationEnabled: p.rotationEnabled ?? false,
    });
    setIsOpen(true);
  };

  const buildPayload = () => ({
    name: formData.name,
    system_name: formData.systemName || null,
    description: formData.description || null,
    dimensions: formData.dimensions || null,
    max_ads: parseInt(formData.maxAds, 10) || 1,
    type: formData.type || null,
    location: formData.location || null,
    is_active: formData.isActive,
    rotation_enabled: formData.rotationEnabled,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    try {
      if (editingId) {
        const response = await saveAdsPlacement(editingId, payload);
        const updated = normalizePlacement(response?.data ?? response ?? { id: editingId, ...payload });
        setPlacements((prev) => upsertById(prev, updated));
        toast.success("Miejsce zaktualizowane");
      } else {
        const response = await saveAdsPlacement(null, payload);
        const created = normalizePlacement(response?.data ?? response ?? { id: createLocalId(), ...payload });
        setPlacements((prev) => upsertById(prev, created));
        toast.success("Miejsce dodane");
      }
      setIsOpen(false);
    } catch (error) {
      console.warn("Ads placements save failed", error);
      const localId = editingId ?? createLocalId();
      const localPlacement = normalizePlacement({ id: localId, ...payload });
      setPlacements((prev) => upsertById(prev, localPlacement));
      toast.success("Zapisano lokalnie (brak API miejsc)");
      setIsOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to miejsce reklamowe?")) return;
    try {
      await deleteAdsPlacement(id);
      setPlacements((prev) => removeById(prev, id));
      toast.success("Miejsce usunięte");
    } catch (error) {
      console.warn("Ads placements delete failed", error);
      setPlacements((prev) => removeById(prev, id));
      toast.success("Usunięto lokalnie (brak API miejsc)");
    }
  };

  const getTypeLabel = (type?: string) => PLACEMENT_TYPES.find((t) => t.value === type)?.label || type || "—";

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Ładowanie miejsc...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle>Miejsca reklamowe</CardTitle>
          <CardDescription>Zarządzaj dostępnymi miejscami emisji reklam w portalu.</CardDescription>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" /> Dodaj miejsce</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placements.map((p) => (
            <div key={p.id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <LayoutTemplate className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    {p.systemName && <p className="text-xs text-muted-foreground font-mono">{p.systemName}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ:</span>
                  <Badge variant="secondary" className="text-xs">{getTypeLabel(p.type)}</Badge>
                </div>
                {p.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wymiary:</span>
                    <span className="font-mono text-xs">{p.dimensions}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maks. reklam:</span>
                  <span className="font-medium">{p.maxAds || 1}</span>
                </div>
                {p.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lokalizacja:</span>
                    <span className="text-xs">{p.location}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Badge variant={p.isActive ? "default" : "outline"} className="text-xs">{p.isActive ? "Aktywne" : "Nieaktywne"}</Badge>
                {p.rotationEnabled && <Badge variant="secondary" className="text-xs">Rotacja</Badge>}
              </div>
            </div>
          ))}
          {placements.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">Brak miejsc reklamowych.</div>
          )}
        </div>
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edytuj miejsce reklamowe" : "Nowe miejsce reklamowe"}</DialogTitle>
          </DialogHeader>
          <PlacementForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEditing={!!editingId} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
