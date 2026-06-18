import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Trash2, Eye, Edit, Heart, Clock3, ShieldCheck, Ban } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminObituaries() {
  const obituaries = useQuery(api.obituaries.getAdminObituaries);
  const updateStatus = useMutation(api.obituaries.updateObituaryStatus);
  const deleteObituary = useMutation(api.obituaries.deleteObituary);
  const updateObituary = useMutation(api.obituaries.updateObituary);
  const [activeTab, setActiveTab] = useState("all");
  const [editingObituary, setEditingObituary] = useState<any>(null);

  if (obituaries === undefined) {
    return <div>Ładowanie...</div>;
  }

  const filteredObituaries = obituaries.filter(ob => {
    if (activeTab === "all") return true;
    return ob.status === activeTab;
  });

  const pendingCount = obituaries.filter((o) => o.status === "pending").length;
  const approvedCount = obituaries.filter((o) => o.status === "approved").length;
  const rejectedCount = obituaries.filter((o) => o.status === "rejected").length;

  const handleStatusChange = async (id: any, status: "approved" | "rejected") => {
    try {
      await updateStatus({ id, status });
      toast.success(`Status zmieniony na ${status}`);
    } catch (error) {
      toast.error("Wystąpił błąd");
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Czy na pewno chcesz usunąć ten wpis?")) {
      try {
        await deleteObituary({ id });
        toast.success("Wpis usunięty");
      } catch (error) {
        toast.error("Wystąpił błąd");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObituary) return;
    try {
      await updateObituary({
        id: editingObituary._id,
        type: editingObituary.type,
        firstName: editingObituary.firstName,
        lastName: editingObituary.lastName,
        age: editingObituary.age,
        image: editingObituary.image,
        birthDate: editingObituary.birthDate,
        deathDate: editingObituary.deathDate,
        city: editingObituary.city,
        profession: editingObituary.profession,
        shortDescription: editingObituary.shortDescription,
        title: editingObituary.title,
        content: editingObituary.content,
        funeralDate: editingObituary.funeralDate,
        funeralTime: editingObituary.funeralTime,
        funeralPlace: editingObituary.funeralPlace,
        cemeteryPlace: editingObituary.cemeteryPlace,
        submitterName: editingObituary.submitterName,
        submitterEmail: editingObituary.submitterEmail,
        submitterPhone: editingObituary.submitterPhone,
        submitterRelation: editingObituary.submitterRelation,
      });
      toast.success("Wpis zaktualizowany");
      setEditingObituary(null);
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji");
    }
  };

  return (
    <div className="max-w-7xl p-4 md:p-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-rose-500">Panel nekrologii</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Zarzadzanie Strefa Pamieci</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Moderuj zgloszenia, pilnuj statusow i podejmuj decyzje tylko raz. Po zaakceptowaniu albo odrzuceniu wpis jest zamykany i znika z obiegu moderacyjnego.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700/80">Oczekujace</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-2xl font-black text-emerald-700">{approvedCount}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700/80">Zaakceptowane</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center">
              <p className="text-2xl font-black text-rose-700">{rejectedCount}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700/80">Odrzucone</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 mt-6 h-auto flex-wrap justify-start gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          <TabsTrigger value="pending">
            Oczekujące 
            {pendingCount > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Zatwierdzone</TabsTrigger>
          <TabsTrigger value="rejected">Odrzucone</TabsTrigger>
        </TabsList>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-semibold text-slate-700">Lista wpisow</p>
            <p className="mt-1 text-xs text-slate-500">Akcje moderacyjne sa aktywne tylko dla wpisow oczekujacych. Zatwierdzone i odrzucone pozostaja tylko do podgladu.</p>
          </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Osoba</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Zgłaszający</TableHead>
                <TableHead>Data zgłoszenia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObituaries.map((obituary) => (
                <TableRow key={obituary._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-500">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{`${obituary.firstName || ""} ${obituary.lastName || ""}`.trim() || obituary.title || "Bez imienia i nazwiska"}</p>
                        <p className="text-xs text-slate-500">{obituary.age || obituary.deathDate || "Bez dodatkowych danych"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{obituary.type}</TableCell>
                  <TableCell>
                    <div className="text-sm">{obituary.submitterName || "Brak danych"}</div>
                    <div className="text-xs text-slate-500">{obituary.submitterEmail || "Bez e-maila"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 className="h-4 w-4" />
                      {new Date(obituary.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={obituary.status === "approved" ? "default" : obituary.status === "rejected" ? "destructive" : "secondary"}>
                      {obituary.status === "approved" ? "Zatwierdzony" : obituary.status === "rejected" ? "Odrzucony" : "Oczekujący"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {obituary.status === "pending" && (
                        <>
                          <Button size="icon" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusChange(obituary._id, "approved")}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusChange(obituary._id, "rejected")}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setEditingObituary(obituary)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(obituary._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="outline" className="text-slate-600 hover:text-slate-900" onClick={() => window.open(`/nekrolog/${obituary.slug}`, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {obituary.status !== "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          {obituary.status === "approved" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                          Zamkniete
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredObituaries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Brak wpisów w tej kategorii
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </Tabs>

      {editingObituary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.currentTarget === e.target) setEditingObituary(null);
          }}
        >
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-600">Moderacja wpisu</p>
                <h2 className="mt-1 text-lg font-bold">Edytuj nekrolog przed decyzja</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditingObituary(null)}>
                Zamknij
              </Button>
            </div>
            <div className="p-5">
              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Imię</Label>
                    <Input value={editingObituary.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingObituary({...editingObituary, firstName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nazwisko</Label>
                    <Input value={editingObituary.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingObituary({...editingObituary, lastName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Wiek</Label>
                    <Input value={editingObituary.age || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingObituary({...editingObituary, age: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data śmierci</Label>
                    <Input type="date" value={editingObituary.deathDate || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingObituary({...editingObituary, deathDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Treść</Label>
                  <Textarea value={editingObituary.content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingObituary({...editingObituary, content: e.target.value})} rows={6} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingObituary(null)}>Anuluj</Button>
                  <Button type="submit">Zapisz zmiany</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
