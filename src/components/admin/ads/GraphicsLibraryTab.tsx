import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createAdsGraphic, deleteAdsGraphic, fetchAdsGraphics } from "@/lib/ads-api";
import { apiFetch } from "@/lib/api-client";

type GraphicAsset = {
  id: string;
  name: string;
  size: number;
  type: "image" | "document";
  url: string;
  createdAt?: string | number;
  storageId?: string | null;
};

const normalizeGraphic = (item: any): GraphicAsset => ({
  id: String(item?.id ?? item?._id ?? ""),
  name: item?.name ?? item?.original_file_name ?? "",
  size: Number(item?.size ?? 0),
  type: item?.type ?? item?.media_type ?? "document",
  url: item?.url ?? "",
  createdAt: item?.createdAt ?? item?.created_at ?? new Date().toISOString(),
  storageId: item?.storageId ?? item?.storage_id ?? item?.id ?? null,
});

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

const upsertById = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = <T extends { id: string }>(items: T[], id: string) => items.filter((item) => item.id !== id);

export function GraphicsLibraryTab() {
  const [graphics, setGraphics] = useState<GraphicAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetchAdsGraphics();
        if (!active) return;
        const data = Array.isArray(response) ? response : response ?? [];
        setGraphics(data.map(normalizeGraphic));
      } catch (error) {
        console.warn("Ads graphics API unavailable", error);
        if (active) setGraphics([]);
      }
      if (active) setIsLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith("image/") ? "image" : "document";

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("source_kind", "ads_graphics");
      formData.append("folder", "ads-graphics");

      const uploadResponse = await apiFetch<any>("/media/upload", {
        method: "POST",
        body: formData,
      });
      const asset = uploadResponse?.data ?? uploadResponse;
      const graphicPayload = {
        name: file.name,
        size: file.size,
        type: fileType,
        url: asset?.url ?? URL.createObjectURL(file),
        storage_id: asset?.id ?? null,
        created_at: asset?.created_at ?? new Date().toISOString(),
      };

      const response = await createAdsGraphic(graphicPayload);
      const created = normalizeGraphic(response?.data ?? response ?? { id: createLocalId(), ...graphicPayload });
      setGraphics((prev) => upsertById(prev, created));
      toast.success("Plik został wgrany");
    } catch (error) {
      console.warn("Ads graphics upload failed", error);
      const localGraphic = normalizeGraphic({
        id: createLocalId(),
        name: file.name,
        size: file.size,
        type: fileType,
        url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
      });
      setGraphics((prev) => upsertById(prev, localGraphic));
      toast.success("Plik zapisany lokalnie (brak API grafik)");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten plik?")) return;
    try {
      await deleteAdsGraphic(id);
      setGraphics((prev) => removeById(prev, id));
      toast.success("Plik usunięty");
    } catch (error) {
      console.warn("Ads graphics delete failed", error);
      setGraphics((prev) => removeById(prev, id));
      toast.success("Usunięto lokalnie (brak API grafik)");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Ładowanie biblioteki...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Biblioteka grafik</CardTitle>
          <CardDescription>Centralne repozytorium materiałów reklamowych.</CardDescription>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*,.pdf"
          />
          <Button
            className="w-full gap-2 sm:w-auto"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Wgrywanie..." : "Wgraj plik"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {graphics.map((f) => (
            <div key={f.id} className="group relative flex flex-col gap-3 rounded-xl border p-4 text-center transition-colors hover:bg-slate-50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
                {f.type === "image" ? (
                  <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={f.name}>{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(f.size)} • {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => handleDelete(f.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {graphics.length === 0 && !isUploading && (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              Brak plików w bibliotece.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
