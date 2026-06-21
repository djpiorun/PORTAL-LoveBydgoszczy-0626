import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";

type AuthorRecord = {
  id: string;
  name: string;
  image?: string | null;
  subtitle?: string | null;
};

const normalizeAuthor = (author: any): AuthorRecord => ({
  id: String(author?.id ?? author?._id ?? author?.slug ?? ""),
  name: author?.name ?? author?.full_name ?? "",
  image: author?.image ?? author?.photo ?? null,
  subtitle: author?.subtitle ?? author?.role ?? null,
});

export default function AuthorAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [authors, setAuthors] = useState<AuthorRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => {
    let active = true;
    const loadAuthors = async () => {
      try {
        const response = await apiFetch<any>("/authors");
        const data = Array.isArray(response) ? response : response?.data ?? [];
        if (!active) return;
        setAuthors(data.map(normalizeAuthor).filter((author: AuthorRecord) => author.name));
      } catch (error) {
        console.warn("Authors API unavailable", error);
        if (active) setAuthors([]);
      }
    };

    void loadAuthors();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) setInputVal(value);
  }, [value, open]);

  const filtered = authors.filter(
    (u) => u.name && u.name.toLowerCase().includes(inputVal.toLowerCase()) && inputVal.length > 0
  );

  const handleSelect = (name: string) => { setInputVal(name); onChange(name); setOpen(false); };

  return (
    <div className="relative">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => inputVal.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder ?? "Imię i nazwisko autora"}
          className="h-9 text-sm pl-8"
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
          >
            {filtered.slice(0, 6).map((u) => (
              <button key={u.id} type="button" onMouseDown={() => handleSelect(u.name)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
              >
                {u.image ? (
                  <img src={u.image} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-border" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{u.name}</div>
                  {u.subtitle && <div className="text-xs text-muted-foreground truncate">{u.subtitle}</div>}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
