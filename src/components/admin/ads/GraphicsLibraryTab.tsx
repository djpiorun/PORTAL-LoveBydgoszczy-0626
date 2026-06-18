import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, FileText, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function GraphicsLibraryTab() {
  const graphics = useQuery(api.ads.getGraphics) || [];
  const generateUploadUrl = useMutation(api.ads.generateUploadUrl);
  const saveGraphic = useMutation(api.ads.saveGraphic);
  const deleteGraphic = useMutation(api.ads.deleteGraphic);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await saveGraphic({
        name: file.name,
        size: file.size,
        type: file.type.startsWith("image/") ? "image" : "document",
        storageId,
      });

      toast.success("Plik został wgrany");
    } catch (error) {
      toast.error("Błąd podczas wgrywania pliku");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: any, storageId: any) => {
    if (confirm("Czy na pewno chcesz usunąć ten plik?")) {
      try {
        await deleteGraphic({ id, storageId });
        toast.success("Plik usunięty");
      } catch (error) {
        toast.error("Błąd podczas usuwania pliku");
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
          {graphics.map((f: any) => (
            <div key={f._id} className="group relative flex flex-col gap-3 rounded-xl border p-4 text-center transition-colors hover:bg-slate-50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
                {f.type === 'image' ? (
                  <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={f.name}>{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(f.size)} • {new Date(f.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute right-2 top-2 h-8 w-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => handleDelete(f._id, f.storageId)}
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