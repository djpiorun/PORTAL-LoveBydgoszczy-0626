import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ArticleForm from "@/components/admin/ArticleForm";
import ArticleList from "@/components/admin/ArticleList";
import { apiFetch } from "@/lib/api-client";
import { fetchArticles, type Article } from "@/lib/articles-api";
import { uploadMediaAsset } from "@/lib/media-upload";

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch {
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "miasto" as any,
    imageUrl: "",
    author: "",
    publishedAt: new Date().toISOString().slice(0, 16),
    featured: false,
    isPatronage: false,
    tags: "",
    hideInReels: false,
  });

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            article.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, categoryFilter]);

  const handleEdit = (article: any) => {
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      imageUrl: article.imageUrl || "",
      author: article.author,
      publishedAt: new Date(article.publishedAt).toISOString().slice(0, 16),
      featured: article.featured || false,
      isPatronage: article.isPatronage || false,
      tags: article.tags ? article.tags.join(", ") : "",
      hideInReels: article.hideInReels || false,
    });
    setEditingId(article._id);
  };

  const handleCreateNew = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "miasto",
      imageUrl: "",
      author: "",
      publishedAt: new Date().toISOString().slice(0, 16),
      featured: false,
      isPatronage: false,
      tags: "",
      hideInReels: false,
    });
    setEditingId("new");
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Tytuł jest wymagany";
    if (!formData.excerpt.trim()) return "Zajawka jest wymagana";
    if (!formData.content.trim()) return "Treść jest wymagana";
    if (!formData.author.trim()) return "Autor jest wymagany";
    return null;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Wgrywanie zdjęcia...");
    try {
      const upload = await uploadMediaAsset({
        file,
        kind: "article",
        folder: formData.category ? `Artykuly / ${formData.category}` : "Artykuly / glowny",
      });
      toast.success("Zdjęcie wgrane pomyślnie", { id: toastId });
      return upload.url;
    } catch (error: any) {
      toast.error(error?.message ?? "Wystąpił błąd podczas wgrywania zdjęcia", { id: toastId });
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

    const payload = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      image_url: formData.imageUrl || null,
      author: formData.author,
      published_at: new Date(formData.publishedAt).toISOString(),
      featured: formData.featured,
      is_patronage: formData.isPatronage,
      tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
      hide_in_reels: formData.hideInReels,
    };

    try {
      if (editingId === "new") {
        await apiFetch("/articles", { method: "POST", body: payload });
        toast.success("Artykuł został dodany");
      } else if (editingId) {
        await apiFetch(`/articles/${editingId}`, { method: "PUT", body: payload });
        toast.success("Artykuł został zaktualizowany");
      }
      setEditingId(null);
      await loadArticles();
    } catch (error: any) {
      toast.error(error?.message ?? "Wystąpił błąd podczas zapisywania");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten artykuł?")) return;
    try {
      await apiFetch(`/articles/${id}`, { method: "DELETE" });
      setArticles((prev) => (prev ? prev.filter((article) => article.id !== id) : prev));
      toast.success("Artykuł usunięty");
    } catch (error: any) {
      toast.error(error?.message ?? "Wystąpił błąd podczas usuwania");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Zarządzanie Artykułami</h1>
            <p className="text-muted-foreground mt-1">Dodawaj, edytuj i zarządzaj treścią portalu</p>
          </div>
          {!editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Nowy Artykuł
            </button>
          )}
        </div>

        {editingId ? (
          <ArticleForm
            formData={formData}
            setFormData={setFormData}
            isUploading={isUploading}
            handleFileUpload={handleFileUpload}
            handleSave={handleSave}
            setEditingId={setEditingId}
            editingId={editingId}
          />
        ) : (
          <ArticleList
            articles={isLoading ? undefined : articles}
            filteredArticles={filteredArticles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
