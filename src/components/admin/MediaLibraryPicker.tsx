import { useEffect, useMemo, useState } from "react";
import { Check, FolderOpen, Image as ImageIcon, Search, Video, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type MediaLibraryPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: any) => void;
  sourceKind?: "article" | "story" | "event";
  accept?: "all" | "image" | "video";
  title?: string;
};

type MediaAsset = {
  _id: string;
  name: string;
  url: string;
  mediaType: "image" | "video" | string;
  sourceKind?: string;
  folder?: string;
  tags?: string[];
  originalFileName?: string;
};

const normalizeAsset = (asset: any): MediaAsset => ({
  _id: String(asset._id ?? asset.id ?? asset.uuid ?? ""),
  name: asset.name ?? asset.title ?? "",
  url: asset.url ?? asset.file_url ?? asset.public_url ?? "",
  mediaType: asset.mediaType ?? asset.media_type ?? asset.type ?? "image",
  sourceKind: asset.sourceKind ?? asset.source_kind ?? undefined,
  folder: asset.folder ?? asset.directory ?? undefined,
  tags: asset.tags ?? asset.keywords ?? [],
  originalFileName: asset.originalFileName ?? asset.original_file_name ?? undefined,
});

export default function MediaLibraryPicker({
  open,
  onClose,
  onSelect,
  sourceKind,
  accept = "all",
  title = "Wybierz z biblioteki",
}: MediaLibraryPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [activeSource, setActiveSource] = useState<string>(sourceKind || "all");

  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any[]>("/admin/media-library/assets");
        if (!active) return;
        setAssets(response.map(normalizeAsset));
      } catch (error) {
        console.warn("Media library assets API unavailable", error);
        if (active) setAssets([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<string[]>("/admin/media-library/folders");
        if (!active) return;
        setFolders(response);
      } catch (error) {
        console.warn("Media library folders API unavailable", error);
        if (active) setFolders([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [open]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = !search.trim() || [
        asset.name,
        asset.originalFileName,
        asset.folder,
        ...(asset.tags || []),
      ].some((value) => String(value || "").toLowerCase().includes(search.trim().toLowerCase()));
      const matchesFolder = activeFolder === "all" || asset.folder === activeFolder;
      const matchesSource = activeSource === "all" || asset.sourceKind === activeSource;
      const matchesType = accept === "all" || asset.mediaType === accept;
      return matchesSearch && matchesFolder && matchesSource && matchesType;
    });
  }, [accept, activeFolder, activeSource, assets, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-600">Biblioteka mediow</p>
            <h2 className="text-2xl font-black text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">Wybierz istniejace zdjecie lub material bez ponownego uploadu.</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Szukaj po nazwie, folderze lub tagu..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              />
            </label>
            <select value={activeSource} onChange={(event) => setActiveSource(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none">
              <option value="all">Wszystkie typy</option>
              <option value="article">Artykuly</option>
              <option value="story">Stories</option>
              <option value="event">Wydarzenia</option>
            </select>
            <select value={activeFolder} onChange={(event) => setActiveFolder(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none">
              <option value="all">Wszystkie foldery</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {filteredAssets.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 text-center">
              <div className="max-w-md px-6">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Brak wynikow</p>
                <h3 className="mt-3 text-2xl font-black text-slate-900">Biblioteka jest jeszcze pusta</h3>
                <p className="mt-2 text-sm text-slate-500">Nowe uploady z artykulow, stories i wydarzen beda zapisywaly sie tutaj automatycznie.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAssets.map((asset) => (
                <div key={asset._id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-52 bg-slate-100">
                    {asset.mediaType === "image" ? (
                      <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                    ) : asset.mediaType === "video" ? (
                      <video src={asset.url} className="h-full w-full object-cover" muted />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <FolderOpen className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                      {asset.mediaType === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {asset.sourceKind}
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{asset.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{asset.folder || "Bez folderu"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(asset.tags || []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{tag}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => onSelect(asset)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700"
                    >
                      <Check className="h-4 w-4" />
                      Uzyj tego pliku
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
