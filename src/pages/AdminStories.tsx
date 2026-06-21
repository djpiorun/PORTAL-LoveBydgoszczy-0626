import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Plus, Trash2, Edit, Save, Image as ImageIcon, ArrowLeft, Upload, Eye } from "lucide-react";
import { toast } from "sonner";
import StoryViewer from "@/components/StoryViewer";
import { apiFetch } from "@/lib/api-client";
import { uploadMediaAsset } from "@/lib/media-upload";

type StoryItem = {
  type: "image" | "video";
  url: string;
  duration?: number;
  text?: string;
  link?: string;
};

const normalizeStory = (story: any) => ({
  _id: String(story?.id ?? story?._id ?? ""),
  title: story?.title ?? "",
  coverImage: story?.coverImage ?? story?.cover_image ?? "",
  author: story?.author ?? "",
  isActive: story?.isActive ?? story?.is_active ?? true,
  items: story?.items ?? [],
});

const normalizeStoriesPayload = (payload: any) => {
  const data = payload?.data ?? payload?.stories ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeStory) : [];
};

export default function AdminStories() {
  const [stories, setStories] = useState<any[] | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [previewStory, setPreviewStory] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setStories(undefined);
    apiFetch("/stories")
      .then((payload) => {
        if (!active) return;
        setStories(normalizeStoriesPayload(payload));
      })
      .catch(() => {
        if (!active) return;
        setStories([]);
        toast.warning("Relacje są chwilowo niedostępne.");
      });

    return () => {
      active = false;
    };
  }, []);
  const [formData, setFormData] = useState<{
    title: string;
    coverImage: string;
    author: string;
    isActive: boolean;
    items: StoryItem[];
  }>({
    title: "",
    coverImage: "",
    author: "",
    isActive: true,
    items: [],
  });

  const handleEdit = (story: any) => {
    setFormData({
      title: story.title,
      coverImage: story.coverImage,
      author: story.author,
      isActive: story.isActive,
      items: story.items || [],
    });
    setEditingId(story._id);
  };

  const handleCreateNew = () => {
    setFormData({
      title: "",
      coverImage: "",
      author: "",
      isActive: true,
      items: [],
    });
    setEditingId("new");
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Tytuł jest wymagany";
    if (!formData.author.trim()) return "Autor jest wymagany";
    if (!formData.coverImage.trim()) return "Okładka jest wymagana";
    if (formData.items.length === 0) return "Relacja musi mieć co najmniej jeden slajd";
    for (let i = 0; i < formData.items.length; i++) {
      if (!formData.items[i].url.trim()) return `Slajd ${i + 1} musi mieć plik (URL)`;
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Wgrywanie pliku...");
    try {
      const result = await uploadMediaAsset({
        file,
        kind: "story",
        folder: "stories",
        sourceKind: "story",
      });
      toast.success("Plik wgrany pomyślnie", { id: toastId });
      return result.url;
    } catch (error) {
      toast.error("Wystąpił błąd podczas wgrywania pliku", { id: toastId });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        cover_image: formData.coverImage,
        author: formData.author,
        is_active: formData.isActive,
        items: formData.items,
      };

      if (editingId === "new") {
        await apiFetch("/stories", { method: "POST", body: payload });
        toast.success("Relacja została utworzona");
      } else if (editingId) {
        await apiFetch(`/stories/${editingId}`, { method: "PUT", body: payload });
        toast.success("Relacja została zaktualizowana");
      }
      setEditingId(null);
      const refreshed = await apiFetch("/stories");
      setStories(normalizeStoriesPayload(refreshed));
    } catch (error) {
      toast.error("Wystąpił błąd podczas zapisywania");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć tę relację?")) {
      try {
        await apiFetch(`/stories/${id}`, { method: "DELETE" });
        toast.success("Relacja usunięta");
        const refreshed = await apiFetch("/stories");
        setStories(normalizeStoriesPayload(refreshed));
      } catch (error) {
        toast.error("Nie udało się usunąć relacji");
      }
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { type: "image", url: "", duration: 5 }]
    }));
  };

  const updateItem = (index: number, field: keyof StoryItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">Zarządzanie Relacjami</h1>
            <p className="text-muted-foreground mt-1">Dodawaj, edytuj i usuwaj stories</p>
          </div>
          {!editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nowa Relacja
            </button>
          )}
        </div>

        {editingId ? (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
              <h2 className="text-xl font-bold">{editingId === "new" ? "Tworzenie nowej relacji" : "Edycja relacji"}</h2>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Wróć
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-2">Tytuł relacji</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="np. Koncert nad Brdą"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Autor / Nazwa</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="np. Kultura Bydgoszcz"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">URL okładki (Miniaturka)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={e => setFormData({...formData, coverImage: e.target.value})}
                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="https://... lub wgraj plik"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="cover-upload"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file);
                        if (url) setFormData({...formData, coverImage: url});
                      }
                    }}
                  />
                  <label
                    htmlFor="cover-upload"
                    className={`bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl font-semibold cursor-pointer flex items-center gap-2 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Upload className="w-4 h-4" /> Wgraj
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Relacja aktywna (widoczna na stronie głównej)</label>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Slajdy (Elementy relacji)</h3>
                <button onClick={addItem} className="text-sm bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Dodaj slajd
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 rounded-2xl border border-border bg-muted/30 relative group">
                    <button 
                      onClick={() => removeItem(index)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-muted-foreground">Typ</label>
                        <select
                          value={item.type}
                          onChange={e => updateItem(index, "type", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none"
                        >
                          <option value="image">Obraz (Image)</option>
                          <option value="video">Wideo (Video)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-muted-foreground">Czas trwania (s)</label>
                        <input
                          type="number"
                          value={item.duration || 5}
                          onChange={e => updateItem(index, "duration", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none"
                          min="1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-muted-foreground">URL pliku (Media)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.url}
                            onChange={e => updateItem(index, "url", e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none"
                            placeholder="https://... lub wgraj plik"
                          />
                          <input
                            type="file"
                            accept={item.type === "image" ? "image/*" : "video/*"}
                            className="hidden"
                            id={`slide-upload-${index}`}
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file);
                                if (url) updateItem(index, "url", url);
                              }
                            }}
                          />
                          <label
                            htmlFor={`slide-upload-${index}`}
                            className={`bg-muted hover:bg-muted/80 text-foreground px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-2 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <Upload className="w-4 h-4" /> Wgraj
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-muted-foreground">Tekst na slajdzie (Opcjonalnie)</label>
                        <input
                          type="text"
                          value={item.text || ""}
                          onChange={e => updateItem(index, "text", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none"
                          placeholder="Wpisz tekst..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-muted-foreground">Link (Opcjonalnie - Swipe Up)</label>
                        <input
                          type="text"
                          value={item.link || ""}
                          onChange={e => updateItem(index, "link", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                    Brak slajdów. Dodaj pierwszy slajd do relacji.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button
                onClick={() => {
                  const error = validateForm();
                  if (error) {
                    toast.error("Uzupełnij formularz, aby zobaczyć podgląd: " + error);
                    return;
                  }
                  setPreviewStory(true);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2 mr-auto"
              >
                <Eye className="w-5 h-5" />
                Podgląd
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleSave}
                disabled={isUploading}
                className={`bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="w-5 h-5" />
                Zapisz relację
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {!stories ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-card rounded-3xl border border-border animate-pulse" />
              ))
            ) : stories.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-card rounded-3xl border border-border">
                <p className="text-muted-foreground font-medium">Brak relacji w bazie.</p>
              </div>
            ) : (
              stories.map((story) => (
                <div key={story._id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
                  <div className="h-32 relative overflow-hidden bg-muted">
                    <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover opacity-50 blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-background overflow-hidden shadow-lg">
                        <img src={story.coverImage} alt={story.author} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    {!story.isActive && (
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md">
                        NIEAKTYWNA
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg leading-tight mb-1">{story.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{story.author}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
                      <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> {story.items.length} slajdów</span>
                    </div>

                    <div className="mt-auto flex items-center gap-2 pt-4 border-t border-border">
                      <button
                        onClick={() => handleEdit(story)}
                        className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(story._id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {previewStory && (
        <StoryViewer
          stories={[{ _id: "preview", ...formData } as any]}
          initialStoryIndex={0}
          onClose={() => setPreviewStory(false)}
        />
      )}
    </div>
  );
}