import { useState, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import EventForm from "@/components/admin/EventForm";
import EventList from "@/components/admin/EventList";
import { uploadMediaAsset } from "@/lib/media-upload";

export default function AdminEvents() {
  const events = useQuery(api.events.getAll);
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);
  const generateUploadUrl = useMutation(api.events.generateUploadUrl);
  const getFileUrl = useMutation(api.events.getFileUrl);
  const createR2UploadUrl = useAction((api as any).media.createUploadUrl);
  const mediaConfig = useQuery((api as any).settings.getMediaConfig, {}) as any;
  const saveMediaAsset = useMutation((api as any).mediaLibrary.saveAsset);

  const [editingId, setEditingId] = useState<Id<"events"> | "new" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    if (!events) return [];
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
        createR2Upload: createR2UploadUrl,
        fallbackGenerateUploadUrl: generateUploadUrl,
        fallbackGetFileUrl: getFileUrl,
      });
      await saveMediaAsset({
        name: upload.file.name,
        originalFileName: file.name,
        url: upload.url,
        storageProvider: upload.storageProvider,
        mediaType: "image",
        sourceKind: "event",
        folder: "Wydarzenia / glowne",
        mimeType: upload.file.type,
        size: upload.file.size,
        width: upload.width,
        height: upload.height,
      });
      if (upload.storageProvider === "r2") {
        toast.success("Zdjecie wgrane do Cloudflare R2", { id: toastId });
      } else {
        toast.warning("R2 nie odpowiedzialo. Uzyto zapasowego storage Convex.", { id: toastId });
      }
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
      if (editingId === "new") {
        await createEvent(eventData);
        toast.success("Wydarzenie zostało dodane");
      } else if (editingId) {
        await updateEvent({ id: editingId, ...eventData });
        toast.success("Wydarzenie zostało zaktualizowane");
      }
      setEditingId(null);
    } catch (error) {
      toast.error("Wystąpił błąd podczas zapisywania");
    }
  };

  const handleDelete = async (id: Id<"events">) => {
    if (confirm("Czy na pewno chcesz usunąć to wydarzenie?")) {
      await removeEvent({ id });
      toast.success("Wydarzenie usunięte");
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
