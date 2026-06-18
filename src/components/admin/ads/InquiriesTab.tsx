import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Mail, Phone } from "lucide-react";
import { useState } from "react";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nowe", variant: "default" },
  in_progress: { label: "W trakcie", variant: "secondary" },
  offer_sent: { label: "Oferta wysłana", variant: "outline" },
  finished: { label: "Zakończone", variant: "secondary" },
  rejected: { label: "Odrzucone", variant: "destructive" },
};

export function InquiriesTab() {
  const inquiries = useQuery(api.ads.getInquiries) || [];
  const updateStatus = useMutation(api.ads.updateInquiryStatus);
  const deleteInquiry = useMutation(api.ads.deleteInquiry);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleStatusChange = async (id: any, status: any) => {
    try {
      await updateStatus({ id, status });
      toast.success("Status zaktualizowany");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji statusu");
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Czy na pewno chcesz usunąć to zapytanie?")) {
      try {
        await deleteInquiry({ id });
        toast.success("Zapytanie usunięte");
      } catch (error) {
        toast.error("Błąd podczas usuwania");
      }
    }
  };

  const filtered = inquiries.filter((i: any) => {
    const matchSearch = !search || 
      i.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase()) ||
      i.contactPerson?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const newCount = inquiries.filter((i: any) => i.status === "new").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2">
              Zapytania reklamowe
              {newCount > 0 && (
                <Badge className="bg-blue-600 text-white">{newCount} nowych</Badge>
              )}
            </CardTitle>
            <CardDescription>Wiadomości z formularza "Reklamuj się u nas".</CardDescription>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po firmie, emailu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Wszystkie statusy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="new">Nowe</SelectItem>
              <SelectItem value="in_progress">W trakcie</SelectItem>
              <SelectItem value="offer_sent">Oferta wysłana</SelectItem>
              <SelectItem value="finished">Zakończone</SelectItem>
              <SelectItem value="rejected">Odrzucone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.length > 0 ? filtered.map((i: any) => (
            <div key={i._id} className={`rounded-xl border p-4 transition-colors hover:bg-slate-50 ${i.status === 'new' ? 'border-blue-200 bg-blue-50/30' : ''}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold">{i.companyName}</h4>
                    {i.adType && (
                      <Badge variant="outline" className="text-xs">{i.adType}</Badge>
                    )}
                    {i.budget && (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">{i.budget}</Badge>
                    )}
                  </div>
                  {i.contactPerson && (
                    <p className="mb-1 text-xs text-muted-foreground">{i.contactPerson}</p>
                  )}
                  <div className="mb-3 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{i.email}</span>
                    {i.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{i.phone}</span>}
                    <span>{new Date(i.createdAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="rounded-lg border bg-white p-3 text-sm text-slate-700">{i.message}</p>
                </div>
                <div className="flex w-full flex-col gap-2 lg:w-[180px] lg:items-end">
                  <Select value={i.status} onValueChange={(v) => handleStatusChange(i._id, v)}>
                    <SelectTrigger className="w-full lg:w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, config]) => (
                        <SelectItem key={value} value={value}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="w-full lg:w-[170px]" onClick={() => handleDelete(i._id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Usuń
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-muted-foreground">Brak zapytań.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
