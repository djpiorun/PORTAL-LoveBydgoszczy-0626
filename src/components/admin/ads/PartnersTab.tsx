import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Users, Globe, Mail, Phone, User } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const PARTNER_TYPES = [
  { value: "strategic", label: "Partner strategiczny" },
  { value: "local", label: "Partner lokalny" },
  { value: "media", label: "Patron medialny" },
  { value: "sponsor", label: "Sponsor wydarzenia" },
  { value: "advertiser", label: "Reklamodawca" },
];

const PARTNER_STATUSES = [
  { value: "active", label: "Aktywny" },
  { value: "inactive", label: "Nieaktywny" },
  { value: "prospect", label: "Prospekt" },
];

const EMPTY_FORM = {
  name: "",
  logoUrl: "",
  website: "",
  contactEmail: "",
  contactPhone: "",
  contactPerson: "",
  description: "",
  cooperationScope: "",
  status: "prospect" as const,
  type: "advertiser" as const,
  notes: "",
  category: "",
};

interface PartnerFormProps {
  formData: typeof EMPTY_FORM;
  setFormData: (d: typeof EMPTY_FORM) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

function PartnerForm({ formData, setFormData, onSubmit, isEditing }: PartnerFormProps) {
  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label>Nazwa partnera *</Label>
        <Input required value={formData.name} onChange={set("name")} placeholder="np. Kino Helios" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Typ partnera</Label>
          <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PARTNER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PARTNER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Strona WWW</Label>
        <Input value={formData.website} onChange={set("website")} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Logo (URL)</Label>
        <Input value={formData.logoUrl} onChange={set("logoUrl")} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Osoba kontaktowa</Label>
          <Input value={formData.contactPerson} onChange={set("contactPerson")} placeholder="Imię i nazwisko" />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input type="email" value={formData.contactEmail} onChange={set("contactEmail")} placeholder="kontakt@..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Telefon</Label>
        <Input value={formData.contactPhone} onChange={set("contactPhone")} placeholder="np. 52 123 456" />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Input value={formData.description} onChange={set("description")} placeholder="Krótki opis partnera" />
      </div>
      <div className="space-y-2">
        <Label>Zakres współpracy</Label>
        <Input value={formData.cooperationScope} onChange={set("cooperationScope")} placeholder="np. Reklama banerowa, artykuły sponsorowane" />
      </div>
      <div className="space-y-2">
        <Label>Notatki wewnętrzne</Label>
        <Input value={formData.notes} onChange={set("notes")} placeholder="Notatki dla zespołu" />
      </div>
      <Button type="submit" className="w-full">{isEditing ? "Zapisz zmiany" : "Dodaj partnera"}</Button>
    </form>
  );
}

export function PartnersTab() {
  const partners = useQuery(api.ads.getPartners) || [];
  const campaigns = useQuery(api.ads.getCampaigns) || [];
  const createPartner = useMutation(api.ads.createPartner);
  const updatePartner = useMutation(api.ads.updatePartner);
  const deletePartner = useMutation(api.ads.deletePartner);

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

  const openEdit = (p: any) => {
    setEditingId(p._id);
    setFormData({
      name: p.name || "",
      logoUrl: p.logoUrl || "",
      website: p.website || "",
      contactEmail: p.contactEmail || "",
      contactPhone: p.contactPhone || "",
      contactPerson: p.contactPerson || "",
      description: p.description || "",
      cooperationScope: p.cooperationScope || "",
      status: p.status || "prospect",
      type: p.type || "advertiser",
      notes: p.notes || "",
      category: p.category || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        logoUrl: formData.logoUrl || undefined,
        website: formData.website || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactPerson: formData.contactPerson || undefined,
        description: formData.description || undefined,
        cooperationScope: formData.cooperationScope || undefined,
        status: formData.status,
        type: formData.type,
        notes: formData.notes || undefined,
        category: formData.category || undefined,
      };
      if (editingId) {
        await updatePartner({ id: editingId, ...payload });
        toast.success("Partner zaktualizowany");
      } else {
        await createPartner(payload);
        toast.success("Partner dodany");
      }
      setIsOpen(false);
    } catch {
      toast.error("Błąd podczas zapisywania partnera");
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Czy na pewno chcesz usunąć tego partnera?")) return;
    try {
      await deletePartner({ id });
      toast.success("Partner usunięty");
    } catch {
      toast.error("Błąd podczas usuwania");
    }
  };

  const getTypeLabel = (type?: string) => PARTNER_TYPES.find(t => t.value === type)?.label || type || "—";
  const getStatusLabel = (status?: string) => PARTNER_STATUSES.find(s => s.value === status)?.label || status || "—";

  const getCampaignCount = (partnerId: string) =>
    campaigns.filter((c: any) => c.partnerId === partnerId).length;

  const filtered = partners.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.contactEmail || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle>Partnerzy</CardTitle>
          <CardDescription>Katalog partnerów i reklamodawców portalu.</CardDescription>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" /> Dodaj partnera</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Szukaj partnera..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Wszystkie typy" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              {PARTNER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p: any) => (
            <div key={p._id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.name} className="w-10 h-10 object-contain rounded-lg border" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{getTypeLabel(p.type)}</Badge>
                      <Badge variant={p.status === "active" ? "default" : "outline"} className="text-xs">
                        {getStatusLabel(p.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p._id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {p.contactPerson && (
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />{p.contactPerson}</div>
                )}
                {p.contactEmail && (
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{p.contactEmail}</div>
                )}
                {p.contactPhone && (
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{p.contactPhone}</div>
                )}
                {p.website && (
                  <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" />
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{p.website}</a>
                  </div>
                )}
              </div>
              {p.cooperationScope && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{p.cooperationScope}</p>
              )}
              <div className="mt-2 pt-2 border-t flex justify-between text-xs text-muted-foreground">
                <span>Kampanie: <strong>{getCampaignCount(p._id)}</strong></span>
                {p.notes && <span className="italic truncate max-w-[150px]">{p.notes}</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">Brak partnerów.</div>
          )}
        </div>
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edytuj partnera" : "Nowy partner"}</DialogTitle>
          </DialogHeader>
          <PartnerForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEditing={!!editingId} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
