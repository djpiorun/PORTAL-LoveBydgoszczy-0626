import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PricingTab() {
  const pricing = useQuery(api.ads.getPricing) || [];
  const createPricing = useMutation(api.ads.createPricing);
  const updatePricing = useMutation(api.ads.updatePricing);
  const deletePricing = useMutation(api.ads.deletePricing);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "",
    description: "",
  });

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item._id);
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
    try {
      if (editingId) {
        await updatePricing({ id: editingId, ...formData });
        toast.success("Zaktualizowano pozycję cennika");
      } else {
        await createPricing(formData);
        toast.success("Dodano nową pozycję cennika");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Wystąpił błąd");
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Czy na pewno chcesz usunąć tę pozycję?")) {
      try {
        await deletePricing({ id });
        toast.success("Usunięto pozycję cennika");
      } catch (error) {
        toast.error("Wystąpił błąd podczas usuwania");
      }
    }
  };

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
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cena netto</Label>
                  <Input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="np. 500 zł" />
                </div>
                <div className="space-y-2">
                  <Label>Jednostka</Label>
                  <Input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="np. za miesiąc" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Opis</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
              {pricing.length > 0 ? pricing.map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{p.price}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.unit}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
