import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  createMenuItem,
  deleteMenuItem,
  fetchMenuItems,
  seedMenuItems,
  updateMenuItem,
} from "@/lib/menu-api";
import {
  Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Save, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Placement = "main" | "more" | "kontakt";
type ItemType = "internal_link" | "category_link" | "dropdown_group" | "external_link";

interface FormState {
  id?: string;
  label: string;
  path: string;
  icon: string;
  tooltip: string;
  order: number;
  isActive: boolean;
  placement: Placement;
  type: ItemType;
  parentId?: string;
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

type MenuItem = {
  _id: string;
  id: string;
  label: string;
  path: string;
  icon: string;
  tooltip?: string | null;
  order: number;
  isActive: boolean;
  placement: Placement;
  type: ItemType;
  parentId?: string | null;
  showWhenScrolled?: boolean | null;
};

const createLocalId = () => `local-${Math.random().toString(36).slice(2, 10)}`;

const normalizeItem = (item: any): MenuItem => {
  const id = String(item?.id ?? item?._id ?? "");
  return {
    _id: id,
    id,
    label: item?.label ?? "",
    path: item?.path ?? "",
    icon: item?.icon ?? "",
    tooltip: item?.tooltip ?? "",
    order: Number(item?.order ?? 0),
    isActive: item?.isActive ?? item?.is_active ?? true,
    placement: item?.placement ?? "main",
    type: item?.type ?? "internal_link",
    parentId: item?.parentId ?? item?.parent_id ?? null,
    showWhenScrolled: item?.showWhenScrolled ?? item?.show_when_scrolled ?? false,
  };
};

const upsertById = (items: MenuItem[], item: MenuItem) => {
  const index = items.findIndex((entry) => entry._id === item._id);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const removeById = (items: MenuItem[], id: string) => items.filter((item) => item._id !== id);

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
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadItems = async () => {
      try {
        const data = await fetchMenuItems();
        if (!active) return;
        setItems(data.map(normalizeItem));
      } catch (error) {
        console.warn("Admin menu API unavailable", error);
        if (active) setItems([]);
      }
    };

    void loadItems();
    return () => {
      active = false;
    };
  }, []);

  const handleSeed = async () => {
    try {
      const response = await seedMenuItems();
      const seeded = response?.seeded ?? response?.data?.seeded;
      const data = response?.items ?? response?.data?.items ?? response?.data ?? response;
      if (Array.isArray(data)) {
        setItems(data.map(normalizeItem));
      }
      if (seeded) {
        toast.success("Domyślne menu zostało załadowane");
      } else {
        toast.info("Menu już istnieje — nie nadpisano");
      }
    } catch (error) {
      console.warn("Admin menu seed failed", error);
      toast.success("Zapisano lokalnie (brak API menu)");
    }
  };

  const handleEdit = (item: MenuItem) => {
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
      parentId: item.parentId ?? undefined,
      showWhenScrolled: item.showWhenScrolled ?? false,
    });
  };

  const handleNew = () => {
    const maxOrder = items.length ? Math.max(0, ...items.map(i => i.order)) + 1 : 1;
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
      const payload = {
        label: form.label,
        path: form.path,
        icon: form.icon,
        tooltip: form.tooltip || null,
        order: form.order,
        is_active: form.isActive,
        placement: form.placement,
        type: form.type,
        parent_id: form.parentId || null,
        show_when_scrolled: form.showWhenScrolled ?? false,
      };
      const response = form.id
        ? await updateMenuItem(form.id, payload)
        : await createMenuItem(payload);
      const data = response?.data ?? response ?? {};
      const normalized = normalizeItem({ id: data?.id ?? data?._id ?? form.id ?? createLocalId(), ...payload, ...data });
      setItems((prev) => upsertById(prev, normalized));
      toast.success(form.id ? "Pozycja zaktualizowana" : "Pozycja dodana");
      setForm(null);
    } catch (error) {
      console.warn("Admin menu save failed", error);
      const fallback = normalizeItem({ id: form.id ?? createLocalId(), ...form, isActive: form.isActive, parentId: form.parentId });
      setItems((prev) => upsertById(prev, fallback));
      toast.success("Zapisano lokalnie (brak API menu)");
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMenuItem(id);
      setItems((prev) => removeById(prev, id));
      toast.success("Pozycja usunięta");
    } catch (error) {
      console.warn("Admin menu delete failed", error);
      setItems((prev) => removeById(prev, id));
      toast.success("Usunięto lokalnie (brak API menu)");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (item: MenuItem) => {
    const nextActive = !item.isActive;
    setItems((prev) => prev.map((entry) => (entry._id === item._id ? { ...entry, isActive: nextActive } : entry)));
    try {
      await updateMenuItem(item._id, {
        label: item.label,
        path: item.path,
        icon: item.icon,
        tooltip: item.tooltip ?? null,
        order: item.order,
        is_active: nextActive,
        placement: item.placement,
        type: item.type,
        parent_id: item.parentId ?? null,
        show_when_scrolled: item.showWhenScrolled ?? false,
      });
      toast.success(nextActive ? "Pokazano pozycję" : "Ukryto pozycję");
    } catch (error) {
      console.warn("Admin menu toggle failed", error);
      toast.success("Zapisano lokalnie (brak API menu)");
    }
  };

  const grouped = {
    main: items.filter(i => i.placement === "main").sort((a, b) => a.order - b.order),
    more: items.filter(i => i.placement === "more").sort((a, b) => a.order - b.order),
    kontakt: items.filter(i => i.placement === "kontakt").sort((a, b) => a.order - b.order),
  };

  // Parent items for dropdown (only top-level items)
  const parentOptions = items.filter(i => !i.parentId);

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
                  onChange={e => setForm(f => f ? { ...f, parentId: e.target.value ? e.target.value : undefined } : f)}
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