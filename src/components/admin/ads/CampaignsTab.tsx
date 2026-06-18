import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Megaphone } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Robocza", variant: "outline" },
  planned: { label: "Zaplanowana", variant: "secondary" },
  active: { label: "Aktywna", variant: "default" },
  paused: { label: "Wstrzymana", variant: "secondary" },
  finished: { label: "Zakończona", variant: "outline" },
  archived: { label: "Archiwalna", variant: "outline" },
};

const EMPTY_FORM = {
  name: "",
  description: "",
  partnerId: "",
  startDate: "",
  endDate: "",
  budget: "",
  status: "draft" as const,
  priority: "",
  viewLimit: "",
  clickLimit: "",
  notes: "",
};

interface CampaignFormProps {
  formData: typeof EMPTY_FORM;
  setFormData: (d: typeof EMPTY_FORM) => void;
  partners: any[];
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

function CampaignForm({ formData, setFormData, partners, onSubmit, isEditing }: CampaignFormProps) {
  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label>Nazwa kampanii *</Label>
        <Input required value={formData.name} onChange={set("name")} placeholder="np. Wiosenna Promocja" />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Input value={formData.description} onChange={set("description")} placeholder="Krótki opis kampanii" />
      </div>
      <div className="space-y-2">
        <Label>Partner / Reklamodawca</Label>
        <Select value={formData.partnerId} onValueChange={(v) => setFormData({ ...formData, partnerId: v })}>
          <SelectTrigger><SelectValue placeholder="Wybierz partnera" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Brak —</SelectItem>
            {partners.map((p: any) => (
              <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data startu *</Label>
          <Input required type="date" value={formData.startDate} onChange={set("startDate")} />
        </div>
        <div className="space-y-2">
          <Label>Data zakończenia *</Label>
          <Input required type="date" value={formData.endDate} onChange={set("endDate")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Budżet (zł)</Label>
          <Input type="number" value={formData.budget} onChange={set("budget")} placeholder="np. 1500" />
        </div>
        <div className="space-y-2">
          <Label>Priorytet emisji</Label>
          <Input type="number" value={formData.priority} onChange={set("priority")} placeholder="0 = najwyższy" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Limit wyświetleń</Label>
          <Input type="number" value={formData.viewLimit} onChange={set("viewLimit")} placeholder="0 = bez limitu" />
        </div>
        <div className="space-y-2">
          <Label>Limit kliknięć</Label>
          <Input type="number" value={formData.clickLimit} onChange={set("clickLimit")} placeholder="0 = bez limitu" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notatki wewnętrzne</Label>
        <Input value={formData.notes} onChange={set("notes")} placeholder="Notatki dla zespołu" />
      </div>
      <Button type="submit" className="w-full">{isEditing ? "Zapisz zmiany" : "Utwórz kampanię"}</Button>
    </form>
  );
}

export function CampaignsTab() {
  const campaigns = useQuery(api.ads.getCampaigns) || [];
  const partners = useQuery(api.ads.getPartners) || [];
  const createCampaign = useMutation(api.ads.createCampaign);
  const updateCampaign = useMutation(api.ads.updateCampaign);
  const deleteCampaign = useMutation(api.ads.deleteCampaign);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
      description: c.description || "",
      partnerId: c.partnerId || "",
      startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "",
      endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "",
      budget: c.budget?.toString() || "",
      status: c.status || "draft",
      priority: c.priority?.toString() || "",
      viewLimit: c.viewLimit?.toString() || "",
      clickLimit: c.clickLimit?.toString() || "",
      notes: c.notes || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        partnerId: formData.partnerId && formData.partnerId !== "none" ? formData.partnerId : undefined,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        status: formData.status,
        priority: formData.priority ? parseInt(formData.priority) : undefined,
        viewLimit: formData.viewLimit ? parseInt(formData.viewLimit) : undefined,
        clickLimit: formData.clickLimit ? parseInt(formData.clickLimit) : undefined,
        notes: formData.notes || undefined,
      };
      if (editingId) {
        await updateCampaign({ id: editingId, ...payload });
        toast.success("Kampania zaktualizowana");
      } else {
        await createCampaign(payload);
        toast.success("Kampania utworzona");
      }
      setIsOpen(false);
    } catch {
      toast.error("Błąd podczas zapisywania kampanii");
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Czy na pewno chcesz usunąć tę kampanię?")) return;
    try {
      await deleteCampaign({ id });
      toast.success("Kampania usunięta");
    } catch {
      toast.error("Błąd podczas usuwania");
    }
  };

  const handleStatusChange = async (id: any, status: any) => {
    try {
      await updateCampaign({ id, status });
      toast.success("Status zaktualizowany");
    } catch {
      toast.error("Błąd podczas aktualizacji statusu");
    }
  };

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getPartnerName = (partnerId?: string) => {
    if (!partnerId) return "—";
    return partners.find((p: any) => p._id === partnerId)?.name || "—";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle>Kampanie reklamowe</CardTitle>
          <CardDescription>Zarządzaj aktywnymi i zaplanowanymi kampaniami.</CardDescription>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" /> Nowa kampania</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Szukaj kampanii..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Wszystkie statusy" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
              <tr>
                <th className="px-4 py-3">Kampania</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Okres</th>
                <th className="px-4 py-3">Budżet</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length > 0 ? filtered.map((c: any) => {
                const s = STATUS_LABELS[c.status] || { label: c.status, variant: "outline" as const };
                return (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Megaphone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          {c.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{getPartnerName(c.partnerId)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(c.startDate).toLocaleDateString("pl-PL")}<br />
                      {new Date(c.endDate).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.budget ? `${c.budget.toLocaleString()} zł` : "—"}</td>
                    <td className="px-4 py-3">
                      <Select value={c.status} onValueChange={(v) => handleStatusChange(c._id, v)}>
                        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {search || statusFilter !== "all" ? "Brak wyników dla podanych filtrów." : "Brak kampanii. Utwórz pierwszą kampanię."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edytuj kampanię" : "Nowa kampania"}</DialogTitle>
          </DialogHeader>
          <CampaignForm
            formData={formData}
            setFormData={setFormData}
            partners={partners}
            onSubmit={handleSubmit}
            isEditing={!!editingId}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
