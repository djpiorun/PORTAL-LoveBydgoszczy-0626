import { Search, Filter, Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, Zap, AlertTriangle, ShieldCheck, BookmarkPlus, PenTool, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { ADMIN_FALLBACK_CATEGORIES } from "@/lib/adminCategories";

const STATUS_OPTIONS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "published", label: "Opublikowane" },
  { value: "draft", label: "Szkice" },
  { value: "scheduled", label: "Zaplanowane" },
  { value: "archived", label: "Archiwum" },
];

const LABEL_OPTIONS = [
  { value: "all", label: "Wszystkie etykiety" },
  { value: "labelUrgent", label: "🔴 PILNE" },
  { value: "labelImportant", label: "🟡 WAŻNE" },
  { value: "labelOurNews", label: "🔵 Nasz tekst" },
  { value: "labelMustKnow", label: "🟣 Musisz wiedzieć" },
  { value: "labelAuthorArticle", label: "🟢 Artykuł autora" },
];

export default function ArticleList({
  articles,
  filteredArticles,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  handleEdit,
  handleDelete
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [labelFilter, setLabelFilter] = useState("all");
  const itemsPerPage = 10;
  const categories = ADMIN_FALLBACK_CATEGORIES;

  const labelFiltered = labelFilter === "all"
    ? filteredArticles
    : filteredArticles?.filter((a: any) => a[labelFilter] === true);

  const totalPages = Math.ceil((labelFiltered?.length || 0) / itemsPerPage);
  const paginatedArticles = labelFiltered?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Szukaj po tytule lub autorze..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">Wszystkie kategorie</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={labelFilter}
            onChange={(e) => { setLabelFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          >
            {LABEL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold text-sm text-muted-foreground">Artykuł</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Kategoria</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Autor</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Data</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Status / Etykiety</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {!articles ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-4"><div className="h-10 bg-muted rounded animate-pulse w-48"></div></td>
                    <td className="p-4"><div className="h-6 bg-muted rounded animate-pulse w-24"></div></td>
                    <td className="p-4"><div className="h-6 bg-muted rounded animate-pulse w-32"></div></td>
                    <td className="p-4"><div className="h-6 bg-muted rounded animate-pulse w-24"></div></td>
                    <td className="p-4"><div className="h-6 bg-muted rounded animate-pulse w-16"></div></td>
                    <td className="p-4"><div className="h-8 bg-muted rounded animate-pulse w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedArticles?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nie znaleziono artykułów spełniających kryteria.
                  </td>
                </tr>
              ) : (
                paginatedArticles?.map((article: any) => (
                  <tr key={article._id} className="border-b border-border hover:bg-muted/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                          {article.imageUrl ? (
                            <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm line-clamp-1">{article.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{article.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {article.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{article.author}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {article.status === "draft" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 w-fit">
                            SZKIC
                          </span>
                        ) : article.status === "archived" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 w-fit">
                            ARCHIWUM
                          </span>
                        ) : article.status === "scheduled" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 w-fit">
                            ZAPLANOWANY
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 w-fit">
                            OPUBLIKOWANY
                          </span>
                        )}
                        {article.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 w-fit">
                            WYRÓŻNIONY
                          </span>
                        )}
                        {article.isPatronage && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 w-fit">
                            PATRONAT
                          </span>
                        )}
                        {article.labelUrgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 w-fit">
                            <Zap className="w-2.5 h-2.5" /> PILNE
                          </span>
                        )}
                        {article.labelImportant && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 w-fit">
                            <AlertTriangle className="w-2.5 h-2.5" /> WAŻNE
                          </span>
                        )}
                        {article.labelOurNews && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 w-fit">
                            <ShieldCheck className="w-2.5 h-2.5" /> NASZ TEKST
                          </span>
                        )}
                        {article.labelMustKnow && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200 w-fit">
                            <BookmarkPlus className="w-2.5 h-2.5" /> MUSISZ WIEDZIEĆ
                          </span>
                        )}
                        {article.labelAuthorArticle && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 w-fit">
                            <PenTool className="w-2.5 h-2.5" /> ARTYKUŁ AUTORA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {article.status === "published" && article.slug && (
                          <a
                            href={`/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Podgląd artykułu"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edytuj"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Strona {currentPage} z {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
