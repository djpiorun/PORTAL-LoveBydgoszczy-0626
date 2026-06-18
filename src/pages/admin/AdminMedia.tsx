import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Copy, FolderOpen, Image as ImageIcon, Link2, Search, Video } from "lucide-react";
import { toast } from "sonner";

export default function AdminMedia() {
  const assets = (useQuery((api as any).mediaLibrary.list, {}) as any[]) || [];
  const folders = (useQuery((api as any).mediaLibrary.getFolders, {}) as string[]) || [];
  const updateAsset = useMutation((api as any).mediaLibrary.updateAsset);

  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState("all");
  const [activeFolder, setActiveFolder] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftFolder, setDraftFolder] = useState("");
  const [draftTags, setDraftTags] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const haystack = [
        asset.name,
        asset.originalFileName,
        asset.folder,
        ...(asset.tags || []),
      ].join(" ").toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      const matchesSource = activeSource === "all" || asset.sourceKind === activeSource;
      const matchesFolder = activeFolder === "all" || asset.folder === activeFolder;
      return matchesSearch && matchesSource && matchesFolder;
    });
  }, [activeFolder, activeSource, assets, search]);

  const selectedAsset = filteredAssets.find((asset) => asset._id === selectedId) || assets.find((asset) => asset._id === selectedId) || null;

  const handleSelectAsset = (asset: any) => {
    setSelectedId(asset._id);
    setDraftFolder(asset.folder || "");
    setDraftTags((asset.tags || []).join(", "));
  };

  const handleSaveDetails = async () => {
    if (!selectedAsset) return;
    await updateAsset({
      id: selectedAsset._id,
      folder: draftFolder,
      tags: draftTags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
    toast.success("Metadane pliku zapisane");
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Link skopiowany");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-sky-600">Biblioteka mediow</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Baza plikow redakcyjnych</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">Wszystkie nowe materialy z artykulow, stories i wydarzen trafiaja tutaj automatycznie. Mozesz je wyszukiwac, folderowac, tagowac i wybierac ponownie bez kolejnego uploadu.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-2xl font-black text-slate-900">{assets.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Wszystkie</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-2xl font-black text-slate-900">{folders.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Foldery</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-2xl font-black text-slate-900">{assets.filter((asset) => asset.storageProvider === "r2").length}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">W R2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Szukaj po nazwie, folderze lub tagu..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              />
            </label>
            <select value={activeSource} onChange={(event) => setActiveSource(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none">
              <option value="all">Wszystkie typy</option>
              <option value="article">Artykuly</option>
              <option value="story">Stories</option>
              <option value="event">Wydarzenia</option>
            </select>
            <select value={activeFolder} onChange={(event) => setActiveFolder(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none">
              <option value="all">Wszystkie foldery</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset?._id === asset._id;
              return (
                <button
                  key={asset._id}
                  type="button"
                  onClick={() => handleSelectAsset(asset)}
                  className={`overflow-hidden rounded-[26px] border text-left transition-all ${isSelected ? "border-sky-400 shadow-lg shadow-sky-100" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}
                >
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
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                      {asset.mediaType === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {asset.sourceKind}
                    </div>
                    {isSelected && (
                      <div className="absolute right-3 top-3 rounded-full bg-sky-500 p-2 text-white shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{asset.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{asset.folder || "Bez folderu"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(asset.tags || []).slice(0, 4).map((tag: string) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          {selectedAsset ? (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Szczegoly pliku</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">{selectedAsset.name}</h2>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                {selectedAsset.mediaType === "image" ? (
                  <img src={selectedAsset.url} alt={selectedAsset.name} className="h-56 w-full object-cover" />
                ) : selectedAsset.mediaType === "video" ? (
                  <video src={selectedAsset.url} controls className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center text-slate-400">
                    <FolderOpen className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Zrodlo</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{selectedAsset.sourceKind}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Storage</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{selectedAsset.storageProvider}</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Folder</label>
                <input
                  value={draftFolder}
                  onChange={(event) => setDraftFolder(event.target.value)}
                  placeholder="np. Artykuly / Miasto / Marzec"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-300 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tagi</label>
                <input
                  value={draftTags}
                  onChange={(event) => setDraftTags(event.target.value)}
                  placeholder="miasto, fotorelacja, sponsor"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-300 focus:bg-white"
                />
              </div>

              <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">URL pliku</span>
                  <button onClick={() => copyUrl(selectedAsset.url)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100">
                    <Copy className="h-3.5 w-3.5" />
                    Kopiuj
                  </button>
                </div>
                <p className="break-all text-xs text-slate-600">{selectedAsset.url}</p>
                <a href={selectedAsset.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900">
                  <Link2 className="h-4 w-4" />
                  Otworz plik
                </a>
              </div>

              <button onClick={handleSaveDetails} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700">
                <Check className="h-4 w-4" />
                Zapisz folder i tagi
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Brak wybranego pliku</p>
                <h2 className="mt-3 text-2xl font-black text-slate-900">Kliknij material po lewej</h2>
                <p className="mt-2 text-sm text-slate-500">Tutaj ustawisz folder, tagi i skopiujesz URL do ponownego uzycia.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
