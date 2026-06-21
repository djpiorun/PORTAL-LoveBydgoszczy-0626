import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Save, Image as ImageIcon, ArrowLeft, Upload, Eye } from "lucide-react";
import { toast } from "sonner";
import StoryViewer from "@/components/StoryViewer";
import { uploadMediaAsset } from "@/lib/media-upload";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";
import { apiFetch } from "@/lib/api-client";

type StoryItem = {
  type: "image" | "video" | "facebook_reel";
  url: string;
  duration?: number;
  text?: string;
  link?: string;
};

type StoryRecord = {
  _id: string;
  id: string;
  title: string;
  coverImage: string;
  author: string;
  isActive: boolean;
  items: StoryItem[];
};

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

const normalizeStory = (story: any): StoryRecord => {
  const id = String(story?.id ?? story?._id ?? "");
  return {
    _id: id,
    id,
    title: story?.title ?? "",
    coverImage: story?.coverImage ?? story?.cover_image ?? "",
    author: story?.author ?? "",
    isActive: story?.isActive ?? story?.is_active ?? false,
    items: Array.isArray(story?.items) ? story.items : [],
  };
};

const upsertById = (items: StoryRecord[], item: StoryRecord) => {
  const index = items.findIndex((entry) => entry._id === item._id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = (items: StoryRecord[], id: string) => items.filter((item) => item._id !== id);

export default function AdminStories() {
  const [stories, setStories] = useState<StoryRecord[] | undefined>(undefined);
  const [currentUserName, setCurrentUserName] = useState("");
  const [mediaConfig, setMediaConfig] = useState<any>(null);

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [previewStory, setPreviewStory] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<"cover" | number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
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

  useEffect(() => {
    let active = true;
    const loadStories = async () => {
      try {
        const response = await apiFetch<any>("/admin/stories");
        const data = Array.isArray(response) ? response : response?.data ?? [];
        if (!active) return;
        setStories(data.map(normalizeStory));
      } catch (error) {
        console.warn("Admin stories API unavailable", error);
        if (active) setStories([]);
      }
    };

    const loadMediaConfig = async () => {
      try {
        const response = await apiFetch<any>("/admin/settings");
        const data = response?.data ?? response;
        if (!active || !data) return;
        setMediaConfig({
          r2Enabled: data?.r2Enabled ?? data?.r2_enabled ?? false,
          mediaMaxWidth: data?.mediaMaxWidth ?? data?.media_max_width ?? 1600,
          mediaQuality: data?.mediaQuality ?? data?.media_quality ?? 82,
          mediaConvertToWebp: data?.mediaConvertToWebp ?? data?.media_convert_to_webp ?? true,
        });
      } catch (error) {
        console.warn("Admin stories media config API unavailable", error);
        if (active) setMediaConfig(null);
      }
    };

    const loadCurrentUser = async () => {
      try {
        const response = await apiFetch<any>("/auth/me");
        const user = response?.user ?? response?.data?.user ?? response?.data ?? response;
        if (!active) return;
        setCurrentUserName(user?.name ?? "");
      } catch (error) {
        console.warn("Admin stories user API unavailable", error);
      }
    };

    void loadStories();
    void loadMediaConfig();
    void loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const handleEdit = (story: StoryRecord) => {
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
      author: currentUserName || "",
      isActive: true,
      items: [],
    });
    setEditingId("new");
    setFormError(null);
  };

  const getDerivedCoverImage = () =>
    formData.coverImage.trim() ||
    formData.items.find((item) => item.type === "image" && item.url.trim())?.url.trim() ||
    "";

  const validateForm = () => {
    if (!formData.author.trim()) return "Autor / nazwa jest wymagana";
    if (!formData.title.trim()) return "Tytul relacji jest wymagany";
    if (!getDerivedCoverImage()) return "Okladka jest wymagana lub pierwszy slajd musi byc obrazem";
    if (formData.items.length === 0) return "Relacja musi mieć co najmniej jeden slajd";
    for (let i = 0; i < formData.items.length; i++) {
      if (!formData.items[i].url.trim()) {
        return formData.items[i].type === "facebook_reel"
          ? `Slajd ${i + 1} musi mieć link do Facebook Reel`
          : `Slajd ${i + 1} musi mieć plik (URL)`;
      }
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Wgrywanie pliku...");
    try {
      const upload = await uploadMediaAsset({
        file,
        kind: "story",
        mediaConfig,
        folder: "Stories / materialy",
        sourceKind: "story",
      });
      toast.success("Plik wgrany", { id: toastId });
      return upload.url;
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
      setFormError(error);
      toast.error(error);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      cover_image: getDerivedCoverImage(),
      author: formData.author.trim(),
      is_active: formData.isActive,
      items: formData.items.map((item) => ({
        type: item.type,
        url: item.url.trim(),
        duration:
          item.type === "facebook_reel"
            ? null
            : item.type === "video"
              ? typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0
                ? item.duration
                : null
            : typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0
              ? item.duration
              : 5,
        text: item.text?.trim() || null,
        link: item.link?.trim() || (item.type === "facebook_reel" ? item.url.trim() : null),
      })),
    };

    try {
      setFormError(null);
      const response = await apiFetch<any>(
        editingId === "new" ? "/admin/stories" : `/admin/stories/${editingId}`,
        {
          method: editingId === "new" ? "POST" : "PUT",
          body: payload,
        },
      );
      const data = response?.data ?? response ?? {};
      const normalized = normalizeStory({
        id: data?.id ?? data?._id ?? (editingId === "new" ? createLocalId() : editingId),
        ...payload,
        ...data,
      });
      setStories((prev) => (prev ? upsertById(prev, normalized) : [normalized]));
      toast.success(editingId === "new" ? "Relacja została utworzona" : "Relacja została zaktualizowana");
      setEditingId(null);
    } catch (error: any) {
      console.warn("Admin story save failed", error);
      const fallback = normalizeStory({
        id: editingId === "new" ? createLocalId() : editingId,
        ...payload,
      });
      setStories((prev) => (prev ? upsertById(prev, fallback) : [fallback]));
      toast.success("Zapisano lokalnie (brak API relacji)");
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć tę relację?")) {
      try {
        await apiFetch(`/admin/stories/${id}`, { method: "DELETE" });
        setStories((prev) => (prev ? removeById(prev, id) : prev));
        toast.success("Relacja usunięta");
      } catch (error) {
        console.warn("Admin story delete failed", error);
        setStories((prev) => (prev ? removeById(prev, id) : prev));
        toast.success("Usunięto lokalnie (brak API relacji)");
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Relacje (Stories)</h1>
          <p className="text-slate-500 mt-1">Dodawaj, edytuj i usuwaj stories</p>
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
            <h2 className="text-xl font-bold">{editingId === "new" ? "Tworzenie nowej relacji" : "Edycja relacji"}</h2>
            <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Wróć
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold mb-2">Autor / Nazwa</label>
              <input
                type="text"
                value={formData.author}
                onChange={e => {
                  setFormError(null);
                  setFormData({...formData, author: e.target.value});
                }}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="np. Kultura Bydgoszcz"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Tytuł relacji</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => {
                  setFormError(null);
                  setFormData({...formData, title: e.target.value});
                }}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="np. Koncert nad Brdą"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">URL okładki (Miniaturka)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={e => {
                    setFormError(null);
                    setFormData({...formData, coverImage: e.target.value});
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
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
                  className={`bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-xl font-semibold cursor-pointer flex items-center gap-2 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload className="w-4 h-4" /> Wgraj
                </label>
                <button
                  type="button"
                  onClick={() => setPickerTarget("cover")}
                  className="bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 rounded-xl font-semibold border border-slate-200 transition-colors"
                >
                  Biblioteka
                </button>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Relacja aktywna (widoczna na stronie głównej)</label>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Slajdy (Elementy relacji)</h3>
              <button type="button" onClick={addItem} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                <Plus className="w-4 h-4" /> Dodaj slajd
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 relative group">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Typ</label>
                      <select
                        value={item.type}
                        onChange={e => {
                          const nextType = e.target.value as StoryItem["type"];
                          updateItem(index, "type", nextType);
                          updateItem(
                            index,
                            "duration",
                            nextType === "image"
                              ? typeof item.duration === "number" && item.duration > 0
                                ? item.duration
                                : 5
                              : undefined,
                          );
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                      >
                        <option value="image">Obraz (Image)</option>
                        <option value="video">Wideo (Video)</option>
                        <option value="facebook_reel">Facebook Reel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Czas trwania (s)</label>
                      <input
                        type="number"
                        value={typeof item.duration === "number" ? item.duration : ""}
                        onChange={e => updateItem(index, "duration", e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        min="1"
                        disabled={item.type === "facebook_reel"}
                        placeholder={item.type === "facebook_reel" ? "auto z Facebooka" : item.type === "video" ? "auto z pliku video" : "np. 5"}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1 text-slate-500">
                        {item.type === "facebook_reel" ? "Link do Facebook Reel" : item.type === "video" ? "URL pliku video lub media" : "URL pliku (Media)"}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.url}
                          onChange={e => {
                            setFormError(null);
                            updateItem(index, "url", e.target.value);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                          placeholder={
                            item.type === "facebook_reel"
                              ? "Link reel / share/r / cały kod iframe z Facebooka"
                              : item.type === "video"
                                ? "https://...mp4 / .webm / .mov lub wgraj plik"
                                : "https://... lub wgraj plik"
                          }
                        />
                        {item.type !== "facebook_reel" && (
                          <>
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
                              className={`bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-2 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              <Upload className="w-4 h-4" /> Wgraj
                            </label>
                            <button
                              type="button"
                              onClick={() => setPickerTarget(index)}
                              className="bg-white hover:bg-slate-100 text-slate-900 px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 transition-colors"
                            >
                              Biblioteka
                            </button>
                          </>
                        )}
                      </div>
                      {item.type === "facebook_reel" && (
                        <p className="mt-2 text-xs text-slate-500">
                          Działa dla publicznych rolek Facebooka. Możesz wkleić link `facebook.com/reel/...`, `facebook.com/share/r/...` albo cały kod `iframe`.
                        </p>
                      )}
                      {item.type === "facebook_reel" && (
                        <p className="mt-1 text-xs text-slate-500">
                          Facebook renderowany jest jako osadzenie. Jesli Meta nie udostepni czasu materialu, relacja skorzysta z domyslnego czasu wyswietlenia.
                        </p>
                      )}
                      {item.type === "video" && (
                        <p className="mt-2 text-xs text-slate-500">
                          Dla linku do pliku video czas może zostać pusty. Wtedy relacja odtworzy caly material automatycznie. Jesli wpiszesz sekundy, relacja utnie wyswietlanie do podanej wartosci.
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Tekst na slajdzie (Opcjonalnie)</label>
                      <input
                        type="text"
                        value={item.text || ""}
                        onChange={e => updateItem(index, "text", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                        placeholder="Wpisz tekst..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Link (Opcjonalnie - Swipe Up)</label>
                      <input
                        type="text"
                        value={item.link || ""}
                        onChange={e => updateItem(index, "link", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.items.length === 0 && (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  Brak slajdów. Dodaj pierwszy slajd do relacji.
                </div>
              )}
            </div>
          </div>

          {formError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                const error = validateForm();
                if (error) {
                  setFormError(error);
                  toast.error("Uzupełnij formularz, aby zobaczyć podgląd: " + error);
                  return;
                }
                setFormError(null);
                const derivedCoverImage = getDerivedCoverImage();
                if (derivedCoverImage !== formData.coverImage) {
                  setFormData((prev) => ({ ...prev, coverImage: derivedCoverImage }));
                }
                setPreviewStory(true);
              }}
              className="px-6 py-2.5 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2 mr-auto"
            >
              <Eye className="w-5 h-5" />
              Podgląd
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="button"
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
              <div key={i} className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))
          ) : stories.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-400 font-medium">Brak relacji w bazie.</p>
            </div>
          ) : (
            stories.map((story) => (
              <div key={story._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="h-32 relative overflow-hidden bg-slate-100">
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover opacity-50 blur-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden shadow-lg">
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
                  <p className="text-sm text-slate-500 mb-4">{story.author}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
                    <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> {story.items.length} slajdów</span>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleEdit(story)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edytuj
                    </button>
                    <button
                      type="button"
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

      <MediaLibraryPicker
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(asset) => {
          if (pickerTarget === "cover") {
            setFormData((prev) => ({ ...prev, coverImage: asset.url }));
          } else if (typeof pickerTarget === "number") {
            updateItem(pickerTarget, "url", asset.url);
            if (asset.mediaType === "video") {
              updateItem(pickerTarget, "type", "video");
            }
          }
          setPickerTarget(null);
        }}
        sourceKind="story"
        accept="all"
        title="Wybierz material do stories"
      />

      {previewStory && (
        <StoryViewer
          stories={[{ _id: "preview", ...formData, coverImage: getDerivedCoverImage() } as any]}
          initialStoryIndex={0}
          onClose={() => setPreviewStory(false)}
        />
      )}
    </div>
  );
}
