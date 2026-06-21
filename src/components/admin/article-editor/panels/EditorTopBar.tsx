import { ArrowLeft, Eye, Save, Send, Clock, RotateCcw, CheckCircle, FileText, Archive, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_OPTIONS } from "@/components/admin/article-editor/config/articleTypes";

interface EditorTopBarProps {
  title: string;
  slug?: string;
  articleId?: string;
  status: string;
  saving: boolean;
  wordCount: number;
  readTime: number;
  publishedAt?: number;
  isDirty?: boolean;
  onCancel?: () => void;
  onSave: (statusOverride?: string) => void;
}

export default function EditorTopBar({
  title,
  slug,
  articleId,
  status,
  saving,
  wordCount,
  readTime,
  publishedAt,
  isDirty,
  onCancel,
  onSave,
}: EditorTopBarProps) {
  const currentStatus = STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0];
  const StatusIcon = currentStatus.icon;
  const isFuture = publishedAt ? publishedAt > Date.now() : false;

  const renderActions = () => {
    if (status === "published") {
      return (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={() => onSave("draft")} disabled={saving} className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Cofnij do szkicu
          </Button>
          <Button type="button" size="sm" onClick={() => onSave()} disabled={saving} className="h-8 px-4 text-xs font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            Zapisz zmiany
          </Button>
        </>
      );
    }
    if (status === "scheduled" || isFuture) {
      return (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={() => onSave("draft")} disabled={saving} className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs">
            <FileText className="w-3.5 h-3.5 mr-1.5" />Szkic
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onSave()} disabled={saving} className="h-8 px-3 text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />Zaplanowany
          </Button>
          <Button type="button" size="sm" onClick={() => onSave("published")} disabled={saving} className="h-8 px-4 text-xs font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
            Opublikuj teraz
          </Button>
        </>
      );
    }
    if (status === "archived") {
      return (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={() => onSave("draft")} disabled={saving} className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs">
            <FileText className="w-3.5 h-3.5 mr-1.5" />Przywróć szkic
          </Button>
          <Button type="button" size="sm" onClick={() => onSave("published")} disabled={saving} className="h-8 px-4 text-xs font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
            Opublikuj teraz
          </Button>
        </>
      );
    }
    // draft / default
    return (
      <>
        <Button type="button" variant="ghost" size="sm" onClick={() => onSave("archived")} disabled={saving} className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs">
          <Archive className="w-3.5 h-3.5 mr-1.5" />Archiwizuj
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onSave("draft")} disabled={saving} className="h-8 px-3 text-xs">
          {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
          Zapisz szkic
        </Button>
        <Button type="button" size="sm" onClick={() => onSave("published")} disabled={saving} className="h-8 px-4 text-xs font-semibold shadow-sm">
          {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
          Opublikuj
        </Button>
      </>
    );
  };

  return (
    <div className="sticky top-0 z-20 bg-background/98 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center gap-3 min-h-[52px]">
      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        title="Wróć do listy"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate leading-tight">{title || "Nowy artykuł"}</p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
          <span className={`flex items-center gap-1 font-semibold ${currentStatus.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{currentStatus.label}</span>
          </span>
          {publishedAt && (
            <span className="hidden sm:inline">
              · {isFuture ? "Zaplanowany na" : "Opublikowany"}: {new Date(publishedAt).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
            </span>
          )}
          <span className="hidden md:inline">· {wordCount} słów · {readTime} min</span>
          {isDirty && (
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <AlertCircle className="w-3 h-3" />
              <span className="hidden sm:inline">niezapisane</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {articleId && (
          <a
            href={`/${slug || articleId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Podgląd</span>
          </a>
        )}
        <div className="flex items-center gap-1.5">
          {renderActions()}
        </div>
      </div>
    </div>
  );
}