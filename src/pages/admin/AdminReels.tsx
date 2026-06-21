import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, Play, Eye, EyeOff, Film, Link, Facebook, Instagram, Youtube, Upload, Sparkles } from "lucide-react";
import { deleteAdminReel, fetchAdminReels, saveAdminReel, seedAdminReels } from "@/lib/reels-api";

const CATEGORIES = [
  { key: "miasto", label: "Miasto" },
  { key: "rozrywka", label: "Rozrywka" },
  { key: "kultura", label: "Kultura" },
  { key: "biznes", label: "Biznes" },
  { key: "gastronomia", label: "Gastronomia" },
  { key: "bydgoszczanie", label: "Bydgoszczanie" },
  { key: "medyczna", label: "Medycyna" },
  { key: "sport", label: "Sport" },
  { key: "polityka", label: "Polityka" },
  { key: "inwestycje", label: "Inwestycje" },
  { key: "nasze_dzialania", label: "Nasze Działania" },
] as const;

const SOURCE_TYPES = [
  { key: "upload", label: "Upload pliku", icon: Upload },
  { key: "link", label: "Link do wideo", icon: Link },
  { key: "facebook", label: "Facebook Reel", icon: Facebook },
  { key: "instagram", label: "Instagram Reel", icon: Instagram },
  { key: "youtube", label: "YouTube Shorts", icon: Youtube },
] as const;

type ReelRecord = {
  _id: string;
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  author?: string | null;
  category?: CategoryKey | "" | null;
  sourceType: SourceType;
  videoUrl: string;
  embedUrl?: string | null;
  isActive: boolean;
  showInStories?: boolean | null;
};

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

const normalizeReel = (reel: any): ReelRecord => {
  const id = String(reel?.id ?? reel?._id ?? "");
  return {
    _id: id,
    id,
    title: reel?.title ?? "",
    description: reel?.description ?? "",
    coverImage: reel?.coverImage ?? reel?.cover_image ?? "",
    author: reel?.author ?? "",
    category: reel?.category ?? "",
    sourceType: reel?.sourceType ?? reel?.source_type ?? "link",
    videoUrl: reel?.videoUrl ?? reel?.video_url ?? "",
    embedUrl: reel?.embedUrl ?? reel?.embed_url ?? "",
    isActive: reel?.isActive ?? reel?.is_active ?? false,
    showInStories: reel?.showInStories ?? reel?.show_in_stories ?? false,
  };
};

const upsertById = (items: ReelRecord[], item: ReelRecord) => {
  const index = items.findIndex((entry) => entry._id === item._id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = (items: ReelRecord[], id: string) => items.filter((item) => item._id !== id);

type SourceType = "upload" | "link" | "facebook" | "instagram" | "youtube";
type CategoryKey = typeof CATEGORIES[number]["key"];

interface ReelFormData {
  title: string;
  description: string;
  coverImage: string;
  author: string;
  category: CategoryKey | "";
  sourceType: SourceType;
  videoUrl: string;
  embedUrl: string;
  isActive: boolean;
  showInStories: boolean;
}

const defaultForm: ReelFormData = {
  title: "",
  description: "",
  coverImage: "",
  author: "",
  category: "",
  sourceType: "link",
  videoUrl: "",
  embedUrl: "",
  isActive: true,
  showInStories: false,
};

export default function AdminReels() {
  const [reels, setReels] = useState<ReelRecord[] | undefined>(undefined);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ReelFormData>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const loadReels = async () => {
      try {
        const data = await fetchAdminReels();
        if (!active) return;
        setReels(data.map(normalizeReel));
      } catch (error) {
        console.warn("Admin reels API unavailable", error);
        if (active) setReels([]);
      }
    };

    void loadReels();
    return () => {
      active = false;
    };
  }, []);

  const handleEdit = (reel: ReelRecord) => {
    setEditingId(reel._id);
    setIsCreating(false);
    setFormData({
      title: reel.title,
      description: reel.description ?? "",
      coverImage: reel.coverImage ?? "",
      author: reel.author ?? "",
      category: (reel.category as CategoryKey) ?? "",
      sourceType: reel.sourceType,
      videoUrl: reel.videoUrl,
      embedUrl: reel.embedUrl ?? "",
      isActive: reel.isActive,
      showInStories: reel.showInStories ?? false,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error("Tytuł jest wymagany"); return; }
    if (!formData.videoUrl.trim()) { toast.error("URL wideo jest wymagany"); return; }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        cover_image: formData.coverImage.trim() || null,
        author: formData.author.trim() || null,
        category: formData.category || null,
        source_type: formData.sourceType,
        video_url: formData.videoUrl.trim(),
        embed_url: formData.embedUrl.trim() || null,
        is_active: formData.isActive,
        show_in_stories: formData.showInStories,
      };

      const response = await saveAdminReel(editingId, payload);
      const data = response?.data ?? response ?? {};
      const normalized = normalizeReel({
        id: data?.id ?? data?._id ?? (editingId ? editingId : createLocalId()),
        ...payload,
        ...data,
      });
      setReels((prev) => (prev ? upsertById(prev, normalized) : [normalized]));
      toast.success(editingId ? "Rolka zaktualizowana" : "Rolka dodana");
      handleCancel();
    } catch (e: any) {
      console.warn("Admin reel save failed", e);
      const fallback = normalizeReel({
        id: editingId ? editingId : createLocalId(),
        ...formData,
        sourceType: formData.sourceType,
      });
      setReels((prev) => (prev ? upsertById(prev, fallback) : [fallback]));
      toast.success("Zapisano lokalnie (brak API rolek)");
      handleCancel();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę rolkę?")) return;
    try {
      await deleteAdminReel(id);
      setReels((prev) => (prev ? removeById(prev, id) : prev));
      toast.success("Rolka usunięta");
    } catch {
      setReels((prev) => (prev ? removeById(prev, id) : prev));
      toast.success("Usunięto lokalnie (brak API rolek)");
    }
  };

  const handleSeed = async () => {
    try {
      const response = await seedAdminReels();
      const data = response?.data ?? response;
      const items = data?.items ?? data;
      if (Array.isArray(items)) {
        setReels(items.map(normalizeReel));
      }
      if (data?.skipped) {
        toast.info("Przykładowe rolki już istnieją");
      } else {
        toast.success("Dodano przykładowe rolki");
      }
    } catch (error) {
      console.warn("Admin reels seed failed", error);
      toast.success("Zapisano lokalnie (brak API rolek)");
    }
  };

  const isFormOpen = isCreating || editingId !== null;

  const sourceIcon = (type: SourceType) => {
    const found = SOURCE_TYPES.find(s => s.key === type);
    if (!found) return <Link className="w-3.5 h-3.5" />;
    const Icon = found.icon;
    return <Icon className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rolki</h1>
          <p className="text-sm text-slate-500 mt-0.5">Zarządzaj rolkami wideo w formacie 9:16</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSeed}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Dodaj przykładowe
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nowa rolka
          </button>
        </div>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900">
              {editingId ? "Edytuj rolkę" : "Nowa rolka"}
            </h2>
            <button type="button" onClick={handleCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tytuł *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Tytuł rolki..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Opis</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Krótki opis rolki..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Autor</label>
              <input
                type="text"
                value={formData.author}
                onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
                placeholder="Imię i nazwisko / redakcja..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kategoria</label>
              <select
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value as CategoryKey | "" }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
              >
                <option value="">Bez kategorii</option>
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Typ źródła *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOURCE_TYPES.map(s => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, sourceType: s.key }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        formData.sourceType === s.key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {formData.sourceType === "upload" ? "URL pliku wideo *" : "URL wideo *"}
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={e => setFormData(p => ({ ...p, videoUrl: e.target.value }))}
                placeholder={
                  formData.sourceType === "facebook" ? "https://www.facebook.com/reel/..." :
                  formData.sourceType === "instagram" ? "https://www.instagram.com/reel/..." :
                  formData.sourceType === "youtube" ? "https://www.youtube.com/shorts/..." :
                  "https://..."
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">URL miniaturki (okładka)</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={e => setFormData(p => ({ ...p, coverImage: e.target.value }))}
                placeholder="https://... (opcjonalne)"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? "bg-primary" : "bg-slate-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm font-semibold text-slate-700">
                  {formData.isActive ? "Aktywna (widoczna publicznie)" : "Nieaktywna (ukryta)"}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, showInStories: !p.showInStories }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.showInStories ? "bg-rose-500" : "bg-slate-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.showInStories ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <div>
                  <p className="text-sm font-bold text-rose-700">
                    {formData.showInStories ? "✓ Wyświetlana w Relacje i Stories" : "Wyświetl w Relacje i Stories"}
                  </p>
                  <p className="text-xs text-rose-500 mt-0.5">Rolka pojawi się w sekcji Stories na stronie głównej</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
            <button type="button" onClick={handleCancel} className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Zapisywanie..." : "Zapisz rolkę"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {!reels ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : reels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Film className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">Brak rolek</p>
          <p className="text-sm text-slate-400 mt-1">Dodaj pierwszą rolkę lub wczytaj przykładowe dane.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reels.map((reel) => {
            const catLabel = CATEGORIES.find(c => c.key === reel.category)?.label;
            return (
              <div key={reel._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
                {/* Thumbnail */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {reel.coverImage ? (
                    <img src={reel.coverImage} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-4 h-4 text-slate-900 ml-0.5" />
                    </div>
                  </div>
                  {!reel.isActive && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                      NIEAKTYWNA
                    </div>
                  )}
                  {reel.showInStories && (
                    <div className="absolute bottom-2 left-2 bg-rose-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Stories
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {sourceIcon(reel.sourceType)}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {catLabel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{catLabel}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm leading-tight text-slate-900 line-clamp-2 mb-1">{reel.title}</h3>
                  {reel.author && <p className="text-xs text-slate-400 mb-3">{reel.author}</p>}

                  <div className="mt-auto flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleEdit(reel)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edytuj
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(reel._id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
