import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, MapPin, Link2, X, Check, Zap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORY_LABELS: Record<string, string> = {
  miasto: "Miasto",
  rozrywka: "Rozrywka",
  kultura: "Kultura",
  biznes: "Biznes",
  gastronomia: "Gastronomia",
  bydgoszczanie: "Bydgoszczanie",
  medyczna: "Medycyna",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

type UpdateDoc = {
  _id: Id<"updates">;
  title: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  linkUrl?: string;
  linkLabel?: string;
  location?: string;
  category?: string;
  publishedAt: number;
  author?: string;
};

type FormState = {
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  linkUrl: string;
  linkLabel: string;
  location: string;
  category: string;
  publishedAt: string;
};

function toDateTimeLocalValue(timestamp: number) {
  const date = new Date(timestamp);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

const createEmptyForm = (): FormState => ({
  title: "",
  description: "",
  mediaUrl: "",
  mediaType: "image",
  linkUrl: "",
  linkLabel: "Zobacz więcej",
  location: "",
  category: "",
  publishedAt: toDateTimeLocalValue(Date.now()),
});

function UpdateForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  initial: FormState;
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Tytuł *</label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Tytuł aktualizacji..."
          className="rounded-xl"
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Opis</label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Pełna treść aktualizacji...&#10;Użyj Enter dla nowych linii&#10;**tekst** dla pogrubienia&#10;• lub - na początku linii dla punktów"
          className="rounded-xl resize-none"
          rows={5}
        />
        <p className="mt-1 text-xs text-slate-500">Możesz używać: Enter (nowa linia), **pogrubienie**, • lub - (punkty)</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">URL Mediów (foto/video)</label>
          <Input
            value={form.mediaUrl}
            onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
            placeholder="https://..."
            className="rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Typ mediów</label>
          <select
            value={form.mediaType}
            onChange={(e) => setForm({ ...form, mediaType: e.target.value as "image" | "video" })}
            className={selectClass}
          >
            <option value="image">Zdjęcie / Grafika</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Link (URL)</label>
          <Input
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            placeholder="https://..."
            className="rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Etykieta przycisku</label>
          <Input
            value={form.linkLabel}
            onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
            placeholder="Zobacz więcej"
            className="rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Data i godzina</label>
          <Input
            type="datetime-local"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            className="rounded-xl"
          />
          <p className="mt-1 text-xs text-slate-500">
            Domyślnie ustawiana jest aktualna data i godzina.
          </p>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Lokalizacja</label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="ul. Gdańska 1, Bydgoszcz"
            className="rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Kategoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={selectClass}
          >
            <option value="">Brak kategorii</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Anuluj
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !form.title.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold px-6"
        >
          {isSubmitting ? "Zapisywanie..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function UpdateCard({
  upd,
  onEdit,
  onDelete,
}: {
  upd: UpdateDoc;
  onEdit: (id: Id<"updates">) => void;
  onDelete: (id: Id<"updates">) => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return {
      time: d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
      date: d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }),
    };
  };

  const { time, date } = formatTime(upd.publishedAt);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-amber-500 mt-5 shrink-0 shadow-md shadow-amber-200" />
        <div className="w-0.5 bg-slate-200 flex-1 mt-1" />
      </div>
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-2 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-lg font-bold text-slate-900">{time}</span>
              <span className="text-xs text-slate-400">{date}</span>
              {upd.category && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {CATEGORY_LABELS[upd.category] || upd.category}
                </span>
              )}
            </div>
            <p className="font-bold text-slate-900 text-base leading-snug">{upd.title}</p>
            {upd.description && (
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{upd.description}</p>
            )}
            {upd.location && (
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {upd.location}
              </p>
            )}
            {upd.mediaUrl && upd.mediaType === "image" && (
              <img src={upd.mediaUrl} alt={upd.title} className="mt-3 rounded-2xl w-full max-h-48 object-cover" />
            )}
            {upd.mediaUrl && upd.mediaType === "video" && (
              <video src={upd.mediaUrl} controls className="mt-3 rounded-2xl w-full max-h-48" />
            )}
            {upd.linkUrl && (
              <a
                href={upd.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                {upd.linkLabel || "Zobacz więcej"}
              </a>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(upd._id)}
              className="p-2 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
              title="Edytuj"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {deleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(upd._id); setDeleteConfirm(false); }}
                  className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Potwierdź usunięcie"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type Mode = "list" | "create" | "edit";

export default function AdminUpdates() {
  const updates = useQuery(api.updates.list, {}) as UpdateDoc[] | undefined;
  const createUpdate = useMutation(api.updates.create);
  const removeUpdate = useMutation(api.updates.remove);
  const updateMutation = useMutation(api.updates.update);

  const [mode, setMode] = useState<Mode>("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<Id<"updates"> | null>(null);

  const handleCreate = async (form: FormState) => {
    setIsSubmitting(true);
    try {
      await createUpdate({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        mediaUrl: form.mediaUrl.trim() || undefined,
        mediaType: form.mediaUrl.trim() ? form.mediaType : undefined,
        linkUrl: form.linkUrl.trim() || undefined,
        linkLabel: form.linkUrl.trim() ? (form.linkLabel.trim() || "Zobacz więcej") : undefined,
        location: form.location.trim() || undefined,
        category: form.category as any || undefined,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).getTime() : Date.now(),
      });
      toast.success("Aktualizacja opublikowana!");
      setMode("list");
    } catch (err: any) {
      toast.error(err?.message || "Błąd podczas publikowania");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (form: FormState) => {
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      await updateMutation({
        id: editingId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        mediaUrl: form.mediaUrl.trim() || undefined,
        mediaType: form.mediaUrl.trim() ? form.mediaType : undefined,
        linkUrl: form.linkUrl.trim() || undefined,
        linkLabel: form.linkUrl.trim() ? (form.linkLabel.trim() || "Zobacz więcej") : undefined,
        location: form.location.trim() || undefined,
        category: form.category as any || undefined,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).getTime() : undefined,
      });
      toast.success("Aktualizacja zapisana!");
      setMode("list");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || "Błąd podczas zapisywania");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"updates">) => {
    try {
      await removeUpdate({ id });
      toast.success("Aktualizacja usunięta");
    } catch (err: any) {
      toast.error(err?.message || "Błąd podczas usuwania");
    }
  };

  const startEdit = (id: Id<"updates">) => {
    setEditingId(id);
    setMode("edit");
  };

  const getEditInitial = (upd: UpdateDoc): FormState => ({
    title: upd.title,
    description: upd.description || "",
    mediaUrl: upd.mediaUrl || "",
    mediaType: upd.mediaType || "image",
    linkUrl: upd.linkUrl || "",
    linkLabel: upd.linkLabel || "Zobacz więcej",
    location: upd.location || "",
    category: upd.category || "",
    publishedAt: toDateTimeLocalValue(upd.publishedAt),
  });

  const editingUpdate = editingId ? updates?.find((u) => u._id === editingId) : null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Aktualizacje
          </h1>
          <p className="text-slate-500 mt-1">Tablica bieżących informacji z miasta</p>
        </div>
        {mode === "list" && (
          <Button
            onClick={() => setMode("create")}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            Nowa aktualizacja
          </Button>
        )}
        {mode !== "list" && (
          <Button
            variant="outline"
            onClick={() => { setMode("list"); setEditingId(null); }}
            className="rounded-2xl px-5 py-2.5 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Anuluj
          </Button>
        )}
      </div>

      {mode === "create" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            Nowa aktualizacja
          </h2>
          <UpdateForm
            initial={createEmptyForm()}
            onSubmit={handleCreate}
            onCancel={() => setMode("list")}
            isSubmitting={isSubmitting}
            submitLabel="Opublikuj aktualizację"
          />
        </div>
      )}

      {mode === "edit" && editingUpdate && (
        <div className="bg-white rounded-3xl border border-blue-200 shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-500" />
            Edytuj aktualizację
          </h2>
          <UpdateForm
            initial={getEditInitial(editingUpdate)}
            onSubmit={handleEdit}
            onCancel={() => { setMode("list"); setEditingId(null); }}
            isSubmitting={isSubmitting}
            submitLabel="Zapisz zmiany"
          />
        </div>
      )}

      {mode === "list" && (
        <div className="relative">
          {!updates ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-3xl border border-slate-200 h-32" />
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Brak aktualizacji</p>
              <p className="text-sm mt-1">Dodaj pierwszą aktualizację klikając przycisk powyżej</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((upd) => (
                <UpdateCard
                  key={upd._id}
                  upd={upd}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
