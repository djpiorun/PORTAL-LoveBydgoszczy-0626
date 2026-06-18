import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import ArticleForm from "@/components/admin/ArticleForm";
import ArticleList from "@/components/admin/ArticleList";

export default function AdminArticles() {
  const articles = useQuery(api.articles.getAll);
  const createArticle = useMutation(api.articles.create);
  const updateArticle = useMutation(api.articles.update);
  const removeArticle = useMutation(api.articles.remove);
  const generateUploadUrl = useMutation(api.articles.generateUploadUrl);
  const getFileUrl = useMutation(api.articles.getFileUrl);

  const [editingId, setEditingId] = useState<Id<"articles"> | "new" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const url = await getFileUrl({ storageId });
      toast.success("Zdjęcie wgrane pomyślnie", { id: toastId });
      return url;
    } catch (error) {
      toast.error("Wystąpił błąd podczas wgrywania zdjęcia", { id: toastId });
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

    const articleData = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      imageUrl: formData.imageUrl,
      author: formData.author,
      publishedAt: new Date(formData.publishedAt).getTime(),
      featured: formData.featured,
      isPatronage: formData.isPatronage,
      tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
      hideInReels: formData.hideInReels,
    };

    try {
      if (editingId === "new") {
        await createArticle(articleData);
        toast.success("Artykuł został dodany");
      } else if (editingId) {
        await updateArticle({ id: editingId, ...articleData });
        toast.success("Artykuł został zaktualizowany");
      }
      setEditingId(null);
    } catch (error) {
      toast.error("Wystąpił błąd podczas zapisywania");
    }
  };

  const handleDelete = async (id: Id<"articles">) => {
    if (confirm("Czy na pewno chcesz usunąć ten artykuł?")) {
      await removeArticle({ id });
      toast.success("Artykuł usunięty");
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
            articles={articles}
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
