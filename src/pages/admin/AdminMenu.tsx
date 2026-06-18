import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Save, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Placement = "main" | "more" | "kontakt";
type ItemType = "internal_link" | "category_link" | "dropdown_group" | "external_link";

interface FormState {
  id?: Id<"menu_items">;
  label: string;
  path: string;
  icon: string;
  tooltip: string;
  order: number;
  isActive: boolean;
  placement: Placement;
  type: ItemType;
  parentId?: Id<"menu_items">;
  showWhenScrolled?: boolean;
}

const EMPTY_FORM: FormState = {
  label: "",
  path: "",
  icon: "Newspaper",
  tooltip: "",
  order: 99,
  isActive: true,
  placement: "main",
  type: "internal_link",
  showWhenScrolled: false,
};

const PLACEMENT_LABELS: Record<Placement, string> = {
  main: "Główne menu",
  more: "Więcej (dropdown)",
  kontakt: "Kontakt (dropdown)",
};

const PLACEMENT_COLORS: Record<Placement, string> = {
  main: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  more: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  kontakt: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function AdminMenu() {
  const items = useQuery(api.menuItems.list);
  const upsert = useMutation(api.menuItems.upsert);
  const remove = useMutation(api.menuItems.remove);
  const seedDefault = useMutation(api.menuItems.seedDefault);

  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"menu_items"> | null>(null);

  const handleSeed = async () => {
    const result = await seedDefault({});
    if ((result as { seeded: boolean }).seeded) {
      toast.success("Domyślne menu zostało załadowane");
    } else {
      toast.info("Menu już istnieje — nie nadpisano");
    }
  };

  const handleEdit = (item: NonNullable<typeof items>[number]) => {
    setForm({
      id: item._id,
      label: item.label,
      path: item.path,
      icon: item.icon,
      tooltip: item.tooltip ?? "",
      order: item.order,
      isActive: item.isActive,
      placement: item.placement,
      type: item.type,
      parentId: item.parentId as Id<"menu_items"> | undefined,
      showWhenScrolled: item.showWhenScrolled ?? false,
    });
  };

  const handleNew = () => {
    const maxOrder = items ? Math.max(0, ...items.map(i => i.order)) + 1 : 1;
    setForm({ ...EMPTY_FORM, order: maxOrder });
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.label.trim() || !form.path.trim()) {
      toast.error("Wypełnij nazwę i ścieżkę");
      return;
    }
    setSaving(true);
    try {
      await upsert({
        id: form.id,
        label: form.label,
        path: form.path,
        icon: form.icon,
        tooltip: form.tooltip || undefined,
        order: form.order,
        isActive: form.isActive,
        placement: form.placement,
        type: form.type,
        parentId: form.parentId || undefined,
        showWhenScrolled: form.showWhenScrolled,
      });
      toast.success(form.id ? "Pozycja zaktualizowana" : "Pozycja dodana");
      setForm(null);
    } catch {
      toast.error("Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"menu_items">) => {
    setDeletingId(id);
    try {
      await remove({ id });
      toast.success("Pozycja usunięta");
    } catch {
      toast.error("Błąd usuwania");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (item: NonNullable<typeof items>[number]) => {
    await upsert({
      id: item._id,
      label: item.label,
      path: item.path,
      icon: item.icon,
      tooltip: item.tooltip,
      order: item.order,
      isActive: !item.isActive,
      placement: item.placement,
      type: item.type,
      parentId: item.parentId as Id<"menu_items"> | undefined,
      showWhenScrolled: item.showWhenScrolled,
    });
    toast.success(item.isActive ? "Ukryto pozycję" : "Pokazano pozycję");
  };

  const grouped = {
    main: items?.filter(i => i.placement === "main").sort((a, b) => a.order - b.order) ?? [],
    more: items?.filter(i => i.placement === "more").sort((a, b) => a.order - b.order) ?? [],
    kontakt: items?.filter(i => i.placement === "kontakt").sort((a, b) => a.order - b.order) ?? [],
  };

  // Parent items for dropdown (only top-level items)
  const parentOptions = items?.filter(i => !i.parentId) ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">Zarządzanie menu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Konfiguruj strukturę nawigacji portalu</p>
        </div>
        <div className="flex items-center gap-2">
          {(!items || items.length === 0) && (
            <Button variant="outline" size="sm" onClick={handleSeed}>
              Załaduj domyślne
            </Button>
          )}
          <Button size="sm" onClick={handleNew} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Dodaj pozycję
          </Button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black">{form.id ? "Edytuj pozycję" : "Nowa pozycja"}</h2>
              <button onClick={() => setForm(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Nazwa *</label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => f ? { ...f, label: e.target.value } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="np. Sport"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Ścieżka *</label>
                <input
                  value={form.path}
                  onChange={e => setForm(f => f ? { ...f, path: e.target.value } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="np. /sport"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Ikona (lucide)</label>
                <input
                  value={form.icon}
                  onChange={e => setForm(f => f ? { ...f, icon: e.target.value } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="np. Trophy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Tooltip / opis</label>
                <input
                  value={form.tooltip}
                  onChange={e => setForm(f => f ? { ...f, tooltip: e.target.value } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="np. Miejska kultura sportu"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Kolejność</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => f ? { ...f, order: Number(e.target.value) } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Umiejscowienie</label>
                <select
                  value={form.placement}
                  onChange={e => setForm(f => f ? { ...f, placement: e.target.value as Placement } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="main">Główne menu</option>
                  <option value="more">Więcej (dropdown)</option>
                  <option value="kontakt">Kontakt (dropdown)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Typ</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => f ? { ...f, type: e.target.value as ItemType } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="internal_link">Link wewnętrzny</option>
                  <option value="category_link">Link kategorii</option>
                  <option value="dropdown_group">Grupa rozwijana</option>
                  <option value="external_link">Link zewnętrzny</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Element nadrzędny (opcjonalnie)</label>
                <select
                  value={form.parentId ?? ""}
                  onChange={e => setForm(f => f ? { ...f, parentId: e.target.value ? e.target.value as Id<"menu_items"> : undefined } : f)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">— brak (pozycja główna) —</option>
                  {parentOptions.filter(p => p._id !== form.id).map(p => (
                    <option key={p._id} value={p._id}>{p.label} ({p.path})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 pt-5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(f => f ? { ...f, isActive: e.target.checked } : f)}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold">Aktywna</label>
                </div>
                {form.placement === "main" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Rząd menu</label>
                    <select
                      value={(form as FormState & { showWhenScrolled?: boolean }).showWhenScrolled ? "row1" : "row2"}
                      onChange={e => setForm(f => f ? { ...f, showWhenScrolled: e.target.value === "row1" } as FormState & { showWhenScrolled?: boolean } : f)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="row1">Rząd 1 — zawsze widoczny (górny + po przewinięciu)</option>
                      <option value="row2">Rząd 2 — tylko na górze strony (drugi rząd)</option>
                    </select>
                    <p className="text-[10px] text-muted-foreground">Rząd 1: Wiadomości, Rozrywka, Kultura, Gastronomia, Medycyna. Rząd 2: Aktualizacje, Biznes, Sport, Inwestycje, Polityka.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setForm(null)}>Anuluj</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                {saving ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items grouped by placement */}
      {items === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">Brak pozycji menu. Załaduj domyślne lub dodaj ręcznie.</p>
          <Button variant="outline" size="sm" onClick={handleSeed}>Załaduj domyślne menu</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {(["main", "more", "kontakt"] as Placement[]).map(placement => (
            <div key={placement}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLACEMENT_COLORS[placement]}`}>
                  {PLACEMENT_LABELS[placement]}
                </span>
                <span className="text-xs text-muted-foreground">{grouped[placement].length} pozycji</span>
              </div>
              <div className="space-y-1.5">
                {grouped[placement].map(item => (
                  <motion.div
                    key={item._id}
                    layout
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                      item.isActive
                        ? "border-border bg-card"
                        : "border-border/40 bg-muted/30 opacity-60"
                    } ${item.parentId ? "ml-6 border-l-2 border-l-primary/20" : ""}`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">{item.order}</span>
                      <span className="text-sm font-semibold truncate">{item.label}</span>
                      <span className="text-xs text-muted-foreground truncate hidden sm:block">{item.path}</span>
                      {item.tooltip && (
                        <span className="text-[10px] text-muted-foreground/70 truncate hidden md:block italic">
                          "{item.tooltip}"
                        </span>
                      )}
                      {item.parentId && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">child</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        title={item.isActive ? "Ukryj" : "Pokaż"}
                      >
                        {item.isActive
                          ? <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        title="Edytuj"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Usuń"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}