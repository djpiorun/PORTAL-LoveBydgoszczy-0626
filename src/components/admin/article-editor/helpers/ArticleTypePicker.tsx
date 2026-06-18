import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ARTICLE_TYPES } from "@/components/admin/article-editor/config/articleTypes";

export default function ArticleTypePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = ARTICLE_TYPES.find((type) => type.value === value) ?? ARTICLE_TYPES[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/20"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <CurrentIcon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 text-xs font-semibold text-foreground">{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1 max-h-72 overflow-y-auto rounded-2xl border border-border bg-background p-1 shadow-xl overscroll-contain">
          {ARTICLE_TYPES.map((type) => {
            const isSelected = value === type.value;
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  onChange(type.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isSelected ? "bg-primary/5" : "hover:bg-muted/20"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className={`flex-1 text-xs font-semibold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>{type.label}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-primary" : "bg-border"}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
