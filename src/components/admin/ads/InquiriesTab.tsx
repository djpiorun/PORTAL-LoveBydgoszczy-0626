import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Mail, Phone } from "lucide-react";
import { deleteAdsInquiry, fetchAdsInquiries, updateAdsInquiryStatus } from "@/lib/ads-api";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nowe", variant: "default" },
  in_progress: { label: "W trakcie", variant: "secondary" },
  offer_sent: { label: "Oferta wysłana", variant: "outline" },
  finished: { label: "Zakończone", variant: "secondary" },
  rejected: { label: "Odrzucone", variant: "destructive" },
};

type Inquiry = {
  id: string;
  companyName?: string;
  email?: string;
  contactPerson?: string;
  phone?: string;
  adType?: string;
  budget?: string;
  message?: string;
  status?: string;
  createdAt?: number;
};

const normalizeInquiry = (item: any): Inquiry => ({
  id: String(item?.id ?? item?._id ?? ""),
  companyName: item?.companyName ?? item?.company_name ?? "",
  email: item?.email ?? "",
  contactPerson: item?.contactPerson ?? item?.contact_person ?? "",
  phone: item?.phone ?? "",
  adType: item?.adType ?? item?.ad_type ?? "",
  budget: item?.budget ?? "",
  message: item?.message ?? "",
  status: item?.status ?? "new",
  createdAt: item?.createdAt ?? item?.created_at ?? Date.now(),
});

const upsertById = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = <T extends { id: string }>(items: T[], id: string) => items.filter((item) => item.id !== id);

export function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetchAdsInquiries();
        if (!active) return;
        const data = Array.isArray(response) ? response : response ?? [];
        setInquiries(data.map(normalizeInquiry));
      } catch (error) {
        console.warn("Ads inquiries API unavailable", error);
        if (active) setInquiries([]);
      }
      if (active) setIsLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await updateAdsInquiryStatus(id, { status });
      const updated = normalizeInquiry(response?.data ?? response ?? { id, status });
      setInquiries((prev) => upsertById(prev, updated));
      toast.success("Status zaktualizowany");
    } catch (error) {
      console.warn("Ads inquiries status update failed", error);
      setInquiries((prev) => upsertById(prev, { id, status } as Inquiry));
      toast.success("Status zapisany lokalnie (brak API zapytań)");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zapytanie?")) return;
    try {
      await deleteAdsInquiry(id);
      setInquiries((prev) => removeById(prev, id));
      toast.success("Zapytanie usunięte");
    } catch (error) {
      console.warn("Ads inquiries delete failed", error);
      setInquiries((prev) => removeById(prev, id));
      toast.success("Usunięto lokalnie (brak API zapytań)");
    }
  };

  const filtered = inquiries.filter((i) => {
    const matchSearch = !search ||
      i.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase()) ||
      i.contactPerson?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const newCount = inquiries.filter((i) => i.status === "new").length;

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Ładowanie zapytań...</div>;
  }

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
          {filtered.length > 0 ? filtered.map((i) => (
            <div key={i.id} className={`rounded-xl border p-4 transition-colors hover:bg-slate-50 ${i.status === "new" ? "border-blue-200 bg-blue-50/30" : ""}`}>
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
                    <span>{new Date(i.createdAt ?? Date.now()).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="rounded-lg border bg-white p-3 text-sm text-slate-700">{i.message}</p>
                </div>
                <div className="flex w-full flex-col gap-2 lg:w-[180px] lg:items-end">
                  <Select value={i.status} onValueChange={(v) => handleStatusChange(i.id, v)}>
                    <SelectTrigger className="w-full lg:w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, config]) => (
                        <SelectItem key={value} value={value}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="w-full lg:w-[170px]" onClick={() => handleDelete(i.id)}>
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
