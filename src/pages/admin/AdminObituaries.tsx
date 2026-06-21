import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Trash2, Eye, Edit, Heart, Clock3, ShieldCheck, Ban } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ObituaryRecord = {
  _id: string;
  id: string;
  status: "pending" | "approved" | "rejected" | string;
  createdAt: string;
  slug?: string | null;
  type?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  age?: string | number | null;
  image?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  city?: string | null;
  profession?: string | null;
  shortDescription?: string | null;
  title?: string | null;
  content?: string | null;
  funeralDate?: string | null;
  funeralTime?: string | null;
  funeralPlace?: string | null;
  cemeteryPlace?: string | null;
  submitterName?: string | null;
  submitterEmail?: string | null;
  submitterPhone?: string | null;
  submitterRelation?: string | null;
};

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

const normalizeObituary = (obituary: any): ObituaryRecord => {
  const id = String(obituary?.id ?? obituary?._id ?? createLocalId());
  return {
    _id: id,
    id,
    status: obituary?.status ?? "pending",
    createdAt: obituary?.createdAt ?? obituary?.created_at ?? new Date().toISOString(),
    slug: obituary?.slug ?? null,
    type: obituary?.type ?? null,
    firstName: obituary?.firstName ?? obituary?.first_name ?? null,
    lastName: obituary?.lastName ?? obituary?.last_name ?? null,
    age: obituary?.age ?? null,
    image: obituary?.image ?? null,
    birthDate: obituary?.birthDate ?? obituary?.birth_date ?? null,
    deathDate: obituary?.deathDate ?? obituary?.death_date ?? null,
    city: obituary?.city ?? null,
    profession: obituary?.profession ?? null,
    shortDescription: obituary?.shortDescription ?? obituary?.short_description ?? null,
    title: obituary?.title ?? null,
    content: obituary?.content ?? null,
    funeralDate: obituary?.funeralDate ?? obituary?.funeral_date ?? null,
    funeralTime: obituary?.funeralTime ?? obituary?.funeral_time ?? null,
    funeralPlace: obituary?.funeralPlace ?? obituary?.funeral_place ?? null,
    cemeteryPlace: obituary?.cemeteryPlace ?? obituary?.cemetery_place ?? null,
    submitterName: obituary?.submitterName ?? obituary?.submitter_name ?? null,
    submitterEmail: obituary?.submitterEmail ?? obituary?.submitter_email ?? null,
    submitterPhone: obituary?.submitterPhone ?? obituary?.submitter_phone ?? null,
    submitterRelation: obituary?.submitterRelation ?? obituary?.submitter_relation ?? null,
  };
};

const upsertById = (items: ObituaryRecord[], item: ObituaryRecord) => {
  const index = items.findIndex((entry) => entry._id === item._id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = (items: ObituaryRecord[], id: string) => items.filter((item) => item._id !== id);


export default function AdminObituaries() {
  const [obituaries, setObituaries] = useState<ObituaryRecord[] | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");
  const [editingObituary, setEditingObituary] = useState<ObituaryRecord | null>(null);

  useEffect(() => {
    let active = true;
    const loadObituaries = async () => {
      try {
        const response = await apiFetch<any>("/admin/obituaries");
        const data = Array.isArray(response) ? response : response?.data ?? [];
        if (!active) return;
        setObituaries(data.map(normalizeObituary));
      } catch (error) {
        console.warn("Admin obituaries API unavailable", error);
        if (active) setObituaries([]);
      }
    };

    void loadObituaries();
    return () => {
      active = false;
    };
  }, []);

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

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    const payload = { status };
    try {
      await apiFetch(`/admin/obituaries/${id}/status`, { method: "PUT", body: payload });
      setObituaries((prev) => (prev ? prev.map((entry) => (entry._id === id ? { ...entry, status } : entry)) : prev));
      toast.success(`Status zmieniony na ${status}`);
    } catch (error) {
      console.warn("Admin obituaries status update failed", error);
      setObituaries((prev) => (prev ? prev.map((entry) => (entry._id === id ? { ...entry, status } : entry)) : prev));
      toast.success("Zapisano lokalnie (brak API nekrologów)");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten wpis?")) return;
    try {
      await apiFetch(`/admin/obituaries/${id}`, { method: "DELETE" });
      setObituaries((prev) => (prev ? removeById(prev, id) : prev));
      toast.success("Wpis usunięty");
    } catch (error) {
      console.warn("Admin obituaries delete failed", error);
      setObituaries((prev) => (prev ? removeById(prev, id) : prev));
      toast.success("Usunięto lokalnie (brak API nekrologów)");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObituary) return;
    const payload = {
      type: editingObituary.type ?? null,
      first_name: editingObituary.firstName ?? null,
      last_name: editingObituary.lastName ?? null,
      age: editingObituary.age ?? null,
      image: editingObituary.image ?? null,
      birth_date: editingObituary.birthDate ?? null,
      death_date: editingObituary.deathDate ?? null,
      city: editingObituary.city ?? null,
      profession: editingObituary.profession ?? null,
      short_description: editingObituary.shortDescription ?? null,
      title: editingObituary.title ?? null,
      content: editingObituary.content ?? null,
      funeral_date: editingObituary.funeralDate ?? null,
      funeral_time: editingObituary.funeralTime ?? null,
      funeral_place: editingObituary.funeralPlace ?? null,
      cemetery_place: editingObituary.cemeteryPlace ?? null,
      submitter_name: editingObituary.submitterName ?? null,
      submitter_email: editingObituary.submitterEmail ?? null,
      submitter_phone: editingObituary.submitterPhone ?? null,
      submitter_relation: editingObituary.submitterRelation ?? null,
    };
    try {
      const response = await apiFetch<any>(`/admin/obituaries/${editingObituary._id}`, { method: "PUT", body: payload });
      const data = response?.data ?? response ?? {};
      const normalized = normalizeObituary({
        ...editingObituary,
        ...payload,
        ...data,
        id: data?.id ?? data?._id ?? editingObituary._id,
      });
      setObituaries((prev) => (prev ? upsertById(prev, normalized) : [normalized]));
      toast.success("Wpis zaktualizowany");
      setEditingObituary(null);
    } catch (error) {
      console.warn("Admin obituaries update failed", error);
      const normalized = normalizeObituary({
        ...editingObituary,
        ...payload,
        id: editingObituary._id,
      });
      setObituaries((prev) => (prev ? upsertById(prev, normalized) : [normalized]));
      toast.success("Zapisano lokalnie (brak API nekrologów)");
      setEditingObituary(null);
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
                    <Input
                      value={editingObituary.firstName ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingObituary((prev) => (prev ? { ...prev, firstName: e.target.value } : prev))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nazwisko</Label>
                    <Input
                      value={editingObituary.lastName ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingObituary((prev) => (prev ? { ...prev, lastName: e.target.value } : prev))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Wiek</Label>
                    <Input
                      value={editingObituary.age ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingObituary((prev) => (prev ? { ...prev, age: e.target.value } : prev))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data śmierci</Label>
                    <Input
                      type="date"
                      value={editingObituary.deathDate ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingObituary((prev) => (prev ? { ...prev, deathDate: e.target.value } : prev))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Treść</Label>
                  <Textarea
                    value={editingObituary.content ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEditingObituary((prev) => (prev ? { ...prev, content: e.target.value } : prev))
                    }
                    rows={6}
                  />
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
