import { useState } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Copy,
  ArrowUp,
  ArrowDown,
  Type,
  ImageIcon,
  Quote,
  Tags,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import type { ArticleElement } from "@/components/admin/article-editor/types/articleEditorTypes";

function ElementPreview({ element }: { element: ArticleElement }) {
  switch (element.id) {
    case "image":
      return (
        <div className="rounded-xl border border-border bg-muted/20 p-2.5">
          <div className="h-20 rounded-lg bg-muted/70" />
          <div className="mt-2 h-2.5 w-2/3 rounded bg-muted" />
          <div className="mt-1 h-2 w-1/3 rounded bg-muted/70" />
        </div>
      );
    case "author":
      return (
        <div className="rounded-xl border border-border bg-card p-2.5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-2.5 w-28 rounded bg-muted" />
              <div className="mt-1 h-2 w-20 rounded bg-muted/70" />
            </div>
          </div>
        </div>
      );
    case "excerpt":
      return (
        <div className="rounded-xl border border-border bg-primary/5 p-2.5">
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded bg-primary/20" />
            <div className="h-2.5 w-5/6 rounded bg-primary/15" />
          </div>
        </div>
      );
    case "expert_quote":
      return (
        <div className="rounded-xl border border-border bg-card p-2.5">
          <div className="border-l-4 border-primary pl-3">
            <div className="h-2.5 w-5/6 rounded bg-muted" />
            <div className="mt-1.5 h-2.5 w-2/3 rounded bg-muted/70" />
            <div className="mt-2 h-2 w-24 rounded bg-primary/20" />
          </div>
        </div>
      );
    case "tags":
      return (
        <div className="rounded-xl border border-border bg-card p-2.5">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">miasto</span>
            <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">analiza</span>
            <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">newsroom</span>
          </div>
        </div>
      );
    case "comments":
      return (
        <div className="rounded-xl border border-border bg-card p-2.5">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-7 w-7 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-2.5 w-24 rounded bg-muted" />
              <div className="mt-1.5 h-2.5 w-full rounded bg-muted/70" />
              <div className="mt-1 h-2.5 w-2/3 rounded bg-muted/60" />
            </div>
          </div>
        </div>
      );
    case "content":
      return (
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Newspaper className="h-3 w-3" />
            Podgląd bloków treści
          </div>
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded bg-foreground/15" />
            <div className="h-2.5 w-full rounded bg-muted" />
            <div className="h-2.5 w-full rounded bg-muted" />
            <div className="h-2.5 w-5/6 rounded bg-muted/70" />
          </div>
        </div>
      );
    default:
      return (
        <div className="rounded-xl border border-border bg-card p-2.5">
          <div className="space-y-2">
            <div className="h-2.5 w-2/3 rounded bg-muted" />
            <div className="h-2.5 w-full rounded bg-muted/70" />
          </div>
        </div>
      );
  }
}

function ElementBadgeIcon({ id }: { id: string }) {
  if (id === "image") return <ImageIcon className="h-3.5 w-3.5" />;
  if (id === "expert_quote") return <Quote className="h-3.5 w-3.5" />;
  if (id === "tags") return <Tags className="h-3.5 w-3.5" />;
  if (id === "comments") return <MessageSquare className="h-3.5 w-3.5" />;
  return <Type className="h-3.5 w-3.5" />;
}

export default function ArticleElementsManager({
  elements,
  onChange,
}: {
  elements: ArticleElement[];
  onChange: (els: ArticleElement[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const next = [...elements];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    setDragIdx(null);
    setOverIdx(null);
  };

  const toggleEnabled = (id: string) => {
    onChange(elements.map((el) => (el.id === id && !el.locked ? { ...el, enabled: !el.enabled } : el)));
  };

  const duplicateElement = (idx: number) => {
    const item = elements[idx];
    if (!item || item.locked) return;
    const clone = { ...item, id: `${item.id}_${Date.now()}`, label: `${item.label} (kopia)` };
    const next = [...elements];
    next.splice(idx + 1, 0, clone);
    onChange(next);
  };

  const moveElement = (idx: number, direction: -1 | 1) => {
    const newIndex = idx + direction;
    if (newIndex < 0 || newIndex >= elements.length) return;
    const next = [...elements];
    const [moved] = next.splice(idx, 1);
    next.splice(newIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-muted/20 p-3">
        <p className="text-xs font-semibold text-foreground">Outline komponentów artykułu</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          To jest newsroomowy szkielet publikacji. Każdy moduł możesz przesuwać, ukrywać, duplikować i traktować jak realny blok układu.
        </p>
      </div>

      <div className="space-y-3">
        {elements.map((el, idx) => (
          <div
            key={el.id}
            draggable={!el.locked}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            className={`rounded-2xl border transition-all ${
              overIdx === idx && dragIdx !== idx
                ? "border-primary bg-primary/5 shadow-sm"
                : el.enabled
                  ? "border-border bg-card shadow-sm"
                  : "border-border/60 bg-muted/10"
            } ${dragIdx === idx ? "scale-[0.99] opacity-60" : ""}`}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <button
                type="button"
                className={`rounded-lg p-1.5 transition-colors ${el.locked ? "cursor-default text-muted-foreground/30" : "text-muted-foreground hover:bg-muted"}`}
                title={el.locked ? "Element zablokowany" : "Przeciągnij"}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${el.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <ElementBadgeIcon id={el.id} />
              </div>

              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${el.enabled ? "text-foreground" : "text-muted-foreground"}`}>{el.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {idx + 1}. moduł w strukturze artykułu
                </p>
              </div>

              {el.locked ? (
                <div className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Stały
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveElement(idx, -1)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Przenieś wyżej"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveElement(idx, 1)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Przenieś niżej"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateElement(idx)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Duplikuj moduł"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEnabled(el.id)}
                    className={`rounded-lg p-1.5 transition-colors ${
                      el.enabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    title={el.enabled ? "Ukryj moduł" : "Pokaż moduł"}
                  >
                    {el.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>

            <div className={`p-3 ${!el.enabled ? "opacity-60" : ""}`}>
              <ElementPreview element={el} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}