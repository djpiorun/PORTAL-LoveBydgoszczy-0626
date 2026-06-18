import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NativeSelect from "./NativeSelect";

export type RelationOption = {
  id: string;
  label: string;
  description?: string;
};

export function RelationSingleSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value?: string;
  onChange: (value: string) => void;
  options: RelationOption[];
  placeholder: string;
}) {
  return (
    <NativeSelect value={value ?? ""} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </NativeSelect>
  );
}

export function RelationMultiSelect({
  label,
  values,
  onChange,
  options,
  placeholder = "Filtruj...",
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  options: RelationOption[];
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedSearch) return true;
    return `${option.label} ${option.description ?? ""}`.toLowerCase().includes(normalizedSearch);
  });

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <span className="text-[11px] text-muted-foreground">{values.length} wybrano</span>
      </div>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
      <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
        {filteredOptions.map((option) => {
          const checked = values.includes(option.id);
          return (
            <label key={option.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(
                  e.target.checked
                    ? [...values, option.id]
                    : values.filter((value) => value !== option.id),
                )}
              />
              <span className="min-w-0">
                <span className="block font-medium text-foreground">{option.label}</span>
                {option.description && <span className="block text-[11px] text-muted-foreground">{option.description}</span>}
              </span>
            </label>
          );
        })}
        {filteredOptions.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
            Brak wyników.
          </div>
        )}
      </div>
    </div>
  );
}
