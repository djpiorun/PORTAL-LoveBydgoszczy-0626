import { useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";

export default function EventForm({ 
  initialData, 
  onSave, 
  onCancel, 
  isUploading, 
  onFileUpload 
}: any) {
  const [formData, setFormData] = useState(initialData);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const validateForm = () => {
    if (!formData.title.trim()) return "Tytuł jest wymagany";
    if (!formData.description.trim()) return "Opis jest wymagany";
    if (!formData.location.trim()) return "Lokalizacja jest wymagana";
    if (!formData.startDate) return "Data rozpoczęcia jest wymagana";
    return null;
  };

  const handleSave = () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
        <h2 className="text-xl font-bold">{initialData.id === "new" ? "Dodawanie wydarzenia" : "Edycja wydarzenia"}</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Wróć
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Tytuł wydarzenia</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Wpisz tytuł..."
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Opis</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
            placeholder="Opis wydarzenia..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Kategoria</label>
          <select
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="miasto">Miasto</option>
            <option value="rozrywka">Rozrywka</option>
            <option value="kultura">Kultura</option>
            <option value="biznes">Biznes</option>
            <option value="gastronomia">Gastronomia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Lokalizacja</label>
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="np. Hala Łuczniczka"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Data rozpoczęcia</label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Data zakończenia (opcjonalnie)</label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Cena (opcjonalnie)</label>
          <input
            type="text"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="np. 50 zł, Bezpłatne"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Organizator (opcjonalnie)</label>
          <input
            type="text"
            value={formData.organizer}
            onChange={e => setFormData({...formData, organizer: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Nazwa organizatora"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Zdjęcie (URL lub wgraj)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="https://..."
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              disabled={isUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await onFileUpload(file);
                  if (url) setFormData({...formData, imageUrl: url});
                }
              }}
            />
            <label
              htmlFor="image-upload"
              className={`bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold cursor-pointer flex items-center gap-2 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload className="w-4 h-4" /> Wgraj
            </label>
            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold border border-slate-200 transition-colors"
            >
              Biblioteka
            </button>
          </div>
          {formData.imageUrl && (
            <div className="mt-4 relative rounded-xl overflow-hidden h-48 bg-slate-100 border border-slate-200">
              <img src={formData.imageUrl} alt="Podgląd" className="w-full h-full object-cover" />
            </div>
          )}
          <MediaLibraryPicker
            open={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={(asset) => {
              setFormData({ ...formData, imageUrl: asset.url });
              setIsMediaPickerOpen(false);
            }}
            sourceKind="event"
            accept="image"
            title="Wybierz grafike wydarzenia"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={e => setFormData({...formData, featured: e.target.checked})}
            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label htmlFor="featured" className="text-sm font-semibold cursor-pointer">Wyróżnione wydarzenie (pokazuj na stronie głównej)</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          Anuluj
        </button>
        <button
          onClick={handleSave}
          disabled={isUploading}
          className={`bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save className="w-5 h-5" />
          Zapisz
        </button>
      </div>
    </div>
  );
}
