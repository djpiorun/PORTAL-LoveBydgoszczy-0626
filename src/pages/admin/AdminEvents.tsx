import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import EventForm from "@/components/admin/EventForm";
import EventList from "@/components/admin/EventList";
import { uploadMediaAsset } from "@/lib/media-upload";
import { apiFetch } from "@/lib/api-client";

type EventRecord = {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  location: string;
  startDate: number;
  endDate?: number | null;
  price?: string | null;
  organizer?: string | null;
  featured?: boolean | null;
};

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

const normalizeEvent = (event: any): EventRecord => {
  const id = String(event?.id ?? event?._id ?? "");
  return {
    _id: id,
    id,
    title: event?.title ?? "",
    description: event?.description ?? "",
    category: event?.category ?? "",
    imageUrl: event?.imageUrl ?? event?.image_url ?? "",
    location: event?.location ?? "",
    startDate: event?.startDate ?? event?.start_date ?? Date.now(),
    endDate: event?.endDate ?? event?.end_date ?? null,
    price: event?.price ?? "",
    organizer: event?.organizer ?? "",
    featured: event?.featured ?? false,
  };
};

const upsertById = (items: EventRecord[], item: EventRecord) => {
  const index = items.findIndex((entry) => entry._id === item._id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = (items: EventRecord[], id: string) => items.filter((item) => item._id !== id);

export default function AdminEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [mediaConfig, setMediaConfig] = useState<any>(null);

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    const loadEvents = async () => {
      try {
        const response = await apiFetch<any>("/admin/events");
        const data = Array.isArray(response) ? response : response?.data ?? [];
        if (!active) return;
        setEvents(data.map(normalizeEvent));
      } catch (error) {
        console.warn("Admin events API unavailable", error);
        if (active) setEvents([]);
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
        console.warn("Admin media config API unavailable", error);
        if (active) setMediaConfig(null);
      }
    };

    void loadEvents();
    void loadMediaConfig();

    return () => {
      active = false;
    };
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "miasto" as any,
    imageUrl: "",
    location: "",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: "",
    price: "",
    organizer: "",
    featured: false,
  });

  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const handleEdit = (event: any) => {
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      imageUrl: event.imageUrl || "",
      location: event.location,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      price: event.price || "",
      organizer: event.organizer || "",
      featured: event.featured || false,
    });
    setEditingId(event._id);
  };

  const handleCreateNew = () => {
    setFormData({
      title: "",
      description: "",
      category: "miasto",
      imageUrl: "",
      location: "",
      startDate: new Date().toISOString().slice(0, 16),
      endDate: "",
      price: "",
      organizer: "",
      featured: false,
    });
    setEditingId("new");
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Wgrywanie zdjęcia...");
    try {
      const upload = await uploadMediaAsset({
        file,
        kind: "event",
        mediaConfig,
        folder: "Wydarzenia / glowne",
        sourceKind: "event",
      });
      toast.success("Zdjecie wgrane", { id: toastId });
      return upload.url;
    } catch (error) {
      toast.error("Wystąpił błąd podczas wgrywania zdjęcia", { id: toastId });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (dataToSave: any) => {
    const eventData = {
      title: dataToSave.title,
      description: dataToSave.description,
      category: dataToSave.category,
      imageUrl: dataToSave.imageUrl,
      location: dataToSave.location,
      startDate: new Date(dataToSave.startDate).getTime(),
      endDate: dataToSave.endDate ? new Date(dataToSave.endDate).getTime() : undefined,
      price: dataToSave.price,
      organizer: dataToSave.organizer,
      featured: dataToSave.featured,
    };

    try {
      const payload = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        image_url: eventData.imageUrl,
        location: eventData.location,
        start_date: eventData.startDate,
        end_date: eventData.endDate ?? null,
        price: eventData.price,
        organizer: eventData.organizer,
        featured: eventData.featured,
      };
      const response = await apiFetch<any>(editingId === "new" ? "/admin/events" : `/admin/events/${editingId}`, {
        method: editingId === "new" ? "POST" : "PUT",
        body: payload,
      });
      const data = response?.data ?? response ?? {};
      const normalized = normalizeEvent({ id: data?.id ?? data?._id ?? (editingId === "new" ? createLocalId() : editingId), ...payload, ...data });
      setEvents((prev) => upsertById(prev, normalized));
      toast.success(editingId === "new" ? "Wydarzenie zostało dodane" : "Wydarzenie zostało zaktualizowane");
      setEditingId(null);
    } catch (error) {
      console.warn("Admin event save failed", error);
      const fallback = normalizeEvent({ id: editingId === "new" ? createLocalId() : editingId, ...eventData });
      setEvents((prev) => upsertById(prev, fallback));
      toast.success("Zapisano lokalnie (brak API wydarzeń)");
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć to wydarzenie?")) {
      try {
        await apiFetch(`/admin/events/${id}`, { method: "DELETE" });
        setEvents((prev) => removeById(prev, id));
        toast.success("Wydarzenie usunięte");
      } catch (error) {
        console.warn("Admin event delete failed", error);
        setEvents((prev) => removeById(prev, id));
        toast.success("Usunięto lokalnie (brak API wydarzeń)");
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Wydarzenia</h1>
          <p className="text-slate-500 mt-1">Zarządzaj kalendarzem wydarzeń.</p>
        </div>
        {!editingId && (
          <button
            onClick={handleCreateNew}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nowe Wydarzenie
          </button>
        )}
      </div>

      {editingId ? (
        <EventForm 
          initialData={{...formData, id: editingId}}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
          isUploading={isUploading}
          onFileUpload={handleFileUpload}
        />
      ) : (
        <EventList 
          events={events}
          filteredEvents={filteredEvents}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
