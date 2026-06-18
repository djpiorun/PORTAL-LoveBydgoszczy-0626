import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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

interface CreativeFormProps {
  formData: typeof EMPTY_FORM;
  setFormData: (d: typeof EMPTY_FORM) => void;
  campaigns: any[];
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

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
            {AD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Kampania</Label>
        <Select value={formData.campaignId} onValueChange={(v) => setFormData({ ...formData, campaignId: v })}>
          <SelectTrigger><SelectValue placeholder="Wybierz kampanię" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Brak —</SelectItem>
            {campaigns.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
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
  const creatives = useQuery(api.ads.getCreatives) || [];
  const campaigns = useQuery(api.ads.getCampaigns) || [];
  const createCreative = useMutation(api.ads.createCreative);
  const updateCreative = useMutation(api.ads.updateCreative);
  const deleteCreative = useMutation(api.ads.deleteCreative);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const openNew = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c._id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        content: formData.content || undefined,
        targetUrl: formData.targetUrl || undefined,
        campaignId: formData.campaignId && formData.campaignId !== "none" ? (formData.campaignId as any) : undefined,
        desktopImageUrl: formData.desktopImageUrl || undefined,
        mobileImageUrl: formData.mobileImageUrl || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
        isActive: formData.isActive,
      };
      if (editingId) {
        await updateCreative({ id: editingId, ...payload });
        toast.success("Kreacja zaktualizowana");
      } else {
        await createCreative(payload);
        toast.success("Kreacja dodana");
      }
      setIsOpen(false);
    } catch {
      toast.error("Błąd podczas zapisywania kreacji");
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Czy na pewno chcesz usunąć tę kreację?")) return;
    try {
      await deleteCreative({ id });
      toast.success("Kreacja usunięta");
    } catch {
      toast.error("Błąd podczas usuwania");
    }
  };

  const handleToggle = async (id: any, current: boolean) => {
    try {
      await updateCreative({ id, isActive: !current });
      toast.success(current ? "Dezaktywowano" : "Aktywowano");
    } catch {
      toast.error("Błąd");
    }
  };

  const getCampaignName = (campaignId?: string) => {
    if (!campaignId) return "—";
    return campaigns.find((c: any) => c._id === campaignId)?.name || "—";
  };

  const getTypeLabel = (type: string) => AD_TYPES.find(t => t.value === type)?.label || type;

  const filtered = creatives.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchType;
  });

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
            <Input className="pl-9" placeholder="Szukaj kreacji..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Wszystkie typy" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              {AD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
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
              {filtered.length > 0 ? filtered.map((c: any) => (
                <tr key={c._id} className="hover:bg-slate-50">
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
                    <Switch checked={c.isActive} onCheckedChange={() => handleToggle(c._id, c.isActive)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
