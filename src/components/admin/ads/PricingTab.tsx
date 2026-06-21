import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

type PricingItem = {
  id: string;
  name: string;
  price: string;
  unit: string;
  description?: string;
};

const normalizePricing = (item: any): PricingItem => ({
  id: String(item?.id ?? item?._id ?? ""),
  name: item?.name ?? "",
  price: item?.price ?? "",
  unit: item?.unit ?? "",
  description: item?.description ?? "",
});

const upsertById = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = <T extends { id: string }>(items: T[], id: string) => items.filter((item) => item.id !== id);

export function PricingTab() {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "",
    description: "",
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any>("/admin/ads/pricing");
        if (!active) return;
        const data = Array.isArray(response) ? response : response?.data ?? [];
        setPricing(data.map(normalizePricing));
      } catch (error) {
        console.warn("Ads pricing API unavailable", error);
        if (active) setPricing([]);
      }
      if (active) setIsLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenDialog = (item?: PricingItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        price: item.price,
        unit: item.unit,
        description: item.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", price: "", unit: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      price: formData.price,
      unit: formData.unit,
      description: formData.description || null,
    };
    try {
      if (editingId) {
        const response = await apiFetch<any>(`/admin/ads/pricing/${editingId}`, {
          method: "PUT",
          body: payload,
        });
        const updated = normalizePricing(response?.data ?? response ?? { id: editingId, ...payload });
        setPricing((prev) => upsertById(prev, updated));
        toast.success("Zaktualizowano pozycję cennika");
      } else {
        const response = await apiFetch<any>("/admin/ads/pricing", {
          method: "POST",
          body: payload,
        });
        const created = normalizePricing(response?.data ?? response ?? { id: createLocalId(), ...payload });
        setPricing((prev) => upsertById(prev, created));
        toast.success("Dodano nową pozycję cennika");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.warn("Ads pricing save failed", error);
      const localId = editingId ?? createLocalId();
      const localItem = normalizePricing({ id: localId, ...payload });
      setPricing((prev) => upsertById(prev, localItem));
      toast.success("Zapisano lokalnie (brak API cennika)");
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę pozycję?")) return;
    try {
      await apiFetch(`/admin/ads/pricing/${id}`, { method: "DELETE" });
      setPricing((prev) => removeById(prev, id));
      toast.success("Usunięto pozycję cennika");
    } catch (error) {
      console.warn("Ads pricing delete failed", error);
      setPricing((prev) => removeById(prev, id));
      toast.success("Usunięto lokalnie (brak API cennika)");
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Ładowanie cennika...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Cennik reklam</CardTitle>
          <CardDescription>Zarządzanie ofertą reklamową i pakietami.</CardDescription>
        </div>
        <Button className="gap-2 sm:w-auto" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" /> Dodaj pozycję
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edytuj pozycję" : "Dodaj nową pozycję"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nazwa usługi / pakietu</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cena netto</Label>
                  <Input required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="np. 500 zł" />
                </div>
                <div className="space-y-2">
                  <Label>Jednostka</Label>
                  <Input required value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="np. za miesiąc" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Opis</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">{editingId ? "Zapisz zmiany" : "Dodaj"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
              <tr>
                <th className="px-4 py-3">Nazwa usługi / pakietu</th>
                <th className="px-4 py-3">Cena netto</th>
                <th className="px-4 py-3">Jednostka</th>
                <th className="px-4 py-3">Opis</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pricing.length > 0 ? pricing.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{p.price}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.unit}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Brak pozycji w cenniku.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
