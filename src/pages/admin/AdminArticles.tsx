import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ArticleEditor from "@/components/admin/ArticleEditor";
import ArticleList from "@/components/admin/ArticleList";
import { type ArticleType } from "@/components/admin/article-editor/types/articleEditorTypes";
import { apiFetch } from "@/lib/api-client";
import { fetchArticles, type Article } from "@/lib/articles-api";

const normalizeAuthorFooterStyle = (value?: string | null): ArticleType["authorFooterStyle"] => {
  if (value === "graphic" || value === "business" || value === "classic" || value === "none") {
    return value;
  }
  return undefined;
};

const toArticleType = (article: Article): ArticleType => ({
  _id: article._id ?? article.id,
  title: article.title ?? "",
  excerpt: article.excerpt ?? "",
  content: article.content ?? "",
  category: article.category ?? "miasto",
  imageUrl: article.imageUrl ?? undefined,
  imageAuthor: article.imageAuthor ?? undefined,
  author: article.author ?? "",
  coauthor: article.coauthor ?? undefined,
  coauthor2: article.coauthor2 ?? undefined,
  coauthor3: article.coauthor3 ?? undefined,
  corrector: article.corrector ?? undefined,
  publisher: article.publisher ?? undefined,
  publishedAt: article.publishedAt ?? Date.now(),
  featured: article.featured ?? undefined,
  isPatronage: article.isPatronage ?? undefined,
  tags: article.tags ?? undefined,
  hideInReels: article.hideInReels ?? undefined,
  skipHomepage: article.skipHomepage ?? undefined,
  personName: article.personName ?? undefined,
  bydgoszczanie: article.bydgoszczanie ?? undefined,
  sport: article.sport ?? undefined,
  politics: article.politics ?? undefined,
  investment: article.investment ?? undefined,
  ourActions: article.ourActions ?? undefined,
  sourceName: article.sourceName ?? undefined,
  sourceUrl: article.sourceUrl ?? undefined,
  expertQuote: article.expertQuote ?? undefined,
  slug: article.slug ?? undefined,
  articleType: article.articleType ?? undefined,
  status: article.status ?? undefined,
  layout: article.layout ?? undefined,
  partnerName: article.partnerName ?? undefined,
  partnerUrl: article.partnerUrl ?? undefined,
  partnerLogoUrl: article.partnerLogoUrl ?? undefined,
  partnerLabel: article.partnerLabel ?? undefined,
  seoTitle: article.seoTitle ?? undefined,
  seoDescription: article.seoDescription ?? undefined,
  allowComments: article.allowComments ?? undefined,
  showUpdates: article.showUpdates ?? undefined,
  labelUrgent: article.labelUrgent ?? undefined,
  labelImportant: article.labelImportant ?? undefined,
  labelOurNews: article.labelOurNews ?? undefined,
  labelMustKnow: article.labelMustKnow ?? undefined,
  labelAuthorArticle: article.labelAuthorArticle ?? undefined,
  label18Plus: article.label18Plus ?? undefined,
  bibliography: article.bibliography ?? undefined,
  sources: article.sources ?? undefined,
  footerInfo: article.footerInfo ?? undefined,
  sourceFromContact: article.sourceFromContact ?? undefined,
  graphicsLayout: article.graphicsLayout ?? undefined,
  categoryLayout: article.categoryLayout ?? undefined,
  authorFooterStyle: normalizeAuthorFooterStyle(article.authorFooterStyle),
  articleElements: article.articleElements ?? undefined,
  poll: article.poll ?? undefined,
  quiz: article.quiz ?? undefined,
  interview: article.interview ?? undefined,
  analysis: article.analysis ?? undefined,
  report: article.report ?? undefined,
  opinion: article.opinion ?? undefined,
  dialog: article.dialog ?? undefined,
  announcement: article.announcement ?? undefined,
  sponsored: article.sponsored ?? undefined,
});

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editingArticle, setEditingArticle] = useState<ArticleType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter((article) => {
      const title = article.title ?? "";
      const author = article.author ?? "";
      const category = article.category ?? "";
      const status = article.status ?? "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchQuery, categoryFilter, statusFilter]);

  const handleEdit = (article: Article) => {
    setEditingArticle(toArticleType(article));
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setIsCreating(true);
  };

  const handleSaved = () => {
    setEditingArticle(null);
    setIsCreating(false);
    void loadArticles();
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten artykuł?")) return;
    try {
      await apiFetch(`/articles/${id}`, { method: "DELETE" });
      setArticles((prev) => (prev ? prev.filter((article) => article.id !== id) : prev));
      toast.success("Artykuł usunięty");
    } catch (error: any) {
      toast.error(error?.message ?? "Nie udało się usunąć artykułu");
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
        articles={isLoading ? undefined : articles}
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