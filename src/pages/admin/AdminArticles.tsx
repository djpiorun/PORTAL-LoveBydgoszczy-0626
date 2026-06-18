import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import ArticleEditor from "@/components/admin/ArticleEditor";
import ArticleList from "@/components/admin/ArticleList";

export default function AdminArticles() {
  const articles = useQuery(api.articles.getAll);
  const removeArticle = useMutation(api.articles.remove);

  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            article.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchQuery, categoryFilter, statusFilter]);

  const handleEdit = (article: any) => {
    setEditingArticle(article);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setIsCreating(true);
  };

  const handleSaved = (_id: Id<"articles">) => {
    setEditingArticle(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: Id<"articles">) => {
    if (confirm("Czy na pewno chcesz usunąć ten artykuł?")) {
      await removeArticle({ id });
      toast.success("Artykuł usunięty");
    }
  };

  if (isCreating || editingArticle) {
    return (
      <div className="fixed inset-0 z-[55] bg-white flex flex-col overflow-hidden">
        <ArticleEditor
          key={editingArticle?._id ?? "new"}
          article={editingArticle ?? undefined}
          onSave={handleSaved}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Artykuły</h1>
          <p className="text-slate-500 mt-1">Dodawaj, edytuj i zarządzaj treścią portalu</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Nowy Artykuł
        </button>
      </div>

      <ArticleList
        articles={articles}
        filteredArticles={filteredArticles}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}