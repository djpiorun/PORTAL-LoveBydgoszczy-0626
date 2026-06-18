import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/components/admin/article-editor/config/categories";

export default function CategoryPicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: typeof CATEGORIES;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((category) => category.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/20"
      >
        <span className={`h-3 w-3 rounded-full ${current?.color}`} />
        <span className="flex-1 text-xs font-semibold text-foreground">{current?.label ?? "Wybierz kategorię"}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1 max-h-72 overflow-y-auto rounded-2xl border border-border bg-background p-1 shadow-xl overscroll-contain">
          {options.map((category) => {
            const isSelected = value === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => {
                  onChange(category.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isSelected ? "bg-primary/5" : "hover:bg-muted/20"
                }`}
              >
                <span className={`h-3 w-3 rounded-full ${category.color}`} />
                <span className={`flex-1 text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{category.label}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-primary" : "bg-border"}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
