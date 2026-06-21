import { Trash2, ExternalLink, ChevronLeft, ChevronRight, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type AdminComment = {
  id: string;
  targetId: string;
  targetType: string;
  authorName: string;
  content: string;
  createdAt: number;
  status?: string;
};

const normalizeComment = (comment: any): AdminComment => ({
  id: comment.id,
  targetId: comment.target_id,
  targetType: comment.target_type,
  authorName: comment.author_name,
  content: comment.content,
  createdAt: comment.created_at ? new Date(comment.created_at).getTime() : Date.now(),
  status: comment.status ?? "approved",
});

export default function AdminComments() {
  const [comments, setComments] = useState<AdminComment[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch<any>("/comments/admin");
      const data = Array.isArray(response) ? response : response?.data ?? [];
      const items = data.map(normalizeComment);
      setComments(items);
    } catch (error: any) {
      setComments([]);
      toast.error(error?.message || "Błąd pobierania komentarzy");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!isMounted) return;
      await loadComments();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [loadComments]);

  const handleDelete = async (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć ten komentarz?")) {
      await apiFetch(`/comments/${id}`, { method: "DELETE" });
      setComments((prev) => prev?.filter((comment) => comment.id !== id) ?? null);
      toast.success("Komentarz usunięty");
    }
  };

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    await apiFetch(`/comments/${id}/status`, { method: "PUT", body: { status } });
    setComments((prev) =>
      prev?.map((comment) => (comment.id === id ? { ...comment, status } : comment)) ?? null,
    );
    toast.success(`Status zmieniony na: ${status === "approved" ? "Zatwierdzony" : "Odrzucony"}`);
  };

  const filteredComments = comments?.filter((comment) => {
    const cStatus = comment.status || "approved";
    const matchesStatus = filterStatus === "all" || cStatus === filterStatus;
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil((filteredComments?.length || 0) / itemsPerPage);
  const paginatedComments = filteredComments?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Komentarze</h1>
          <p className="text-slate-500 mt-1">Moderacja komentarzy użytkowników.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj komentarza..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm w-full sm:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm appearance-none w-full sm:w-auto"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="approved">Zatwierdzone</option>
              <option value="pending">Oczekujące</option>
              <option value="rejected">Odrzucone</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Autor</th>
                <th className="p-4 font-semibold">Treść</th>
                <th className="p-4 font-semibold">Data</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Cel</th>
                <th className="p-4 font-semibold text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="p-4"><div className="h-5 bg-slate-100 rounded w-24 animate-pulse"></div></td>
                    <td className="p-4"><div className="h-5 bg-slate-100 rounded w-full animate-pulse"></div></td>
                    <td className="p-4"><div className="h-5 bg-slate-100 rounded w-24 animate-pulse"></div></td>
                    <td className="p-4"><div className="h-5 bg-slate-100 rounded w-20 animate-pulse"></div></td>
                    <td className="p-4"><div className="h-5 bg-slate-100 rounded w-16 animate-pulse"></div></td>
                    <td className="p-4"><div className="h-8 bg-slate-100 rounded w-24 ml-auto animate-pulse"></div></td>
                  </tr>
                ))
              ) : paginatedComments?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Brak komentarzy spełniających kryteria.
                  </td>
                </tr>
              ) : (
                paginatedComments?.map((comment) => {
                  const status = comment.status || "approved";
                  return (
                    <tr key={comment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{comment.authorName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600 line-clamp-2">{comment.content}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status === "approved" ? "bg-green-100 text-green-800" :
                          status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {status === "approved" ? "Zatwierdzony" : status === "rejected" ? "Odrzucony" : "Oczekujący"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          to={comment.targetType === "article" ? `/${comment.targetId}` : `/wydarzenie/${comment.targetId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline bg-primary/10 px-2 py-1 rounded-lg whitespace-nowrap"
                          target="_blank"
                        >
                          {comment.targetType === "article" ? "Artykuł" : "Wydarzenie"}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {status !== "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(comment.id, "approved")}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Zatwierdź"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {status !== "rejected" && (
                            <button
                              onClick={() => handleUpdateStatus(comment.id, "rejected")}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Odrzuć"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Usuń"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Strona {currentPage} z {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
