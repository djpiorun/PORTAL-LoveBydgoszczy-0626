import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ArticleFormMain from "@/components/admin/article-form/ArticleFormMain";
import ArticleFormSidebar from "@/components/admin/article-form/ArticleFormSidebar";
import ArticleFormManagement from "@/components/admin/article-form/ArticleFormManagement";
import { ADMIN_FALLBACK_CATEGORIES } from "@/lib/adminCategories";

export const CATEGORIES = ADMIN_FALLBACK_CATEGORIES;

export default function ArticleForm({
  formData,
  setFormData,
  isUploading,
  handleFileUpload,
  handleSave,
  setEditingId,
  editingId,
}: any) {
  const dbCategories = useQuery(api.settings.getCategories);

  const categories =
    dbCategories && dbCategories.length > 0
      ? dbCategories
          .filter((c: any) => c.isActive !== false)
          .map((c: any) => ({ value: c.key, label: c.label }))
      : ADMIN_FALLBACK_CATEGORIES;

  const validateForm = () => {
    if (!formData.title?.trim()) return "Tytuł jest wymagany";
    if (!formData.excerpt?.trim()) return "Zajawka jest wymagana";
    if (!formData.content?.trim()) return "Treść jest wymagana";
    if (!formData.category) return "Kategoria jest wymagana";
    if (!formData.author?.trim()) return "Autor jest wymagany";
    if (!formData.publishedAt) return "Data publikacji jest wymagana";
    return null;
  };

  const onSaveClick = () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }
    handleSave();
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
        <h2 className="text-xl font-bold">
          {editingId === "new" ? "Tworzenie nowego artykułu" : "Edycja artykułu"}
        </h2>
        <button
          onClick={() => setEditingId(null)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8">
        <ArticleFormMain
          formData={formData}
          setFormData={setFormData}
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
        />
        <ArticleFormSidebar
          formData={formData}
          setFormData={setFormData}
          categories={categories}
        />
      </div>

      <ArticleFormManagement
        formData={formData}
        setFormData={setFormData}
        isUploading={isUploading}
        onCancel={() => setEditingId(null)}
        onSave={onSaveClick}
      />
    </div>
  );
}
