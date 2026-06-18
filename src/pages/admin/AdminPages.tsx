import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Archive,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Eye,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Info,
  Layers,
  Link2,
  ListFilter,
  Mail,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Scale,
  Search,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  History,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageRichTextEditor from "@/components/admin/PageRichTextEditor";
import {
  getPageVersionSummary,
  hasSlugConflict,
  isPageArchived,
  isPageDeleted,
  isPageScheduled,
  matchesPageSearch,
  OG_DESCRIPTION_MAX_LENGTH,
  OG_TITLE_MAX_LENGTH,
  PAGE_VERSION_SOURCE_LABELS,
  sanitizePageHtml,
  slugify,
  type PageStatus as Status,
  type PageType,
  validatePageInput,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/lib/page-content";

interface PageForm {
  id?: Id<"pages">;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: Status;
  pageType: PageType;
  isVisibleInMenu: boolean;
  isVisibleInFooter: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
  heroImage: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  publishAt: string; // ISO datetime-local string for input
}

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  standard: "Standardowa",
  contact: "Kontakt",
  legal: "Prawna",
  about: "O nas",
  editorial: "Redakcyjna",
};

const PAGE_TYPE_ICONS: Record<PageType, React.ElementType> = {
  standard: FileText,
  contact: Mail,
  legal: Scale,
  about: Info,
  editorial: BookOpen,
};

const STATUS_COLORS: Record<Status, string> = {
  draft: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-300",
  published: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const STATUS_LABELS: Record<Status, string> = {
  draft: "Szkic",
  published: "Opublikowana",
};

const EMPTY_FORM: PageForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
  pageType: "standard",
  isVisibleInMenu: false,
  isVisibleInFooter: false,
  order: 10,
  seoTitle: "",
  seoDescription: "",
  heroImage: "",
  canonicalUrl: "",
  robots: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  publishAt: "",
};

type FieldErrors = Partial<Record<keyof PageForm, string>>;
type StatusFilter = Status | "all";
type PageTypeFilter = PageType | "all";
type VisibilityFilter = "active" | "scheduled" | "archived" | "deleted" | "all";
type SortOption = "order" | "updatedAt" | "title";
type AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type VersionRecord = NonNullable<ReturnType<typeof useQuery<typeof api.pages.listVersions>>>[number];

function formatDate(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocal(ts?: number | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): number | undefined {
  if (!value) return undefined;
  const ts = new Date(value).getTime();
  return isNaN(ts) ? undefined : ts;
}

function getFormSnapshot(form: PageForm | null) {
  if (!form) return null;
  return JSON.stringify({
    title: form.title.trim(),
    slug: slugify(form.slug),
    excerpt: form.excerpt,
    content: form.content,
    status: form.status,
    pageType: form.pageType,
    isVisibleInMenu: form.isVisibleInMenu,
    isVisibleInFooter: form.isVisibleInFooter,
    order: Number(form.order),
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    heroImage: form.heroImage,
    canonicalUrl: form.canonicalUrl,
    robots: form.robots,
    ogTitle: form.ogTitle,
    ogDescription: form.ogDescription,
    ogImage: form.ogImage,
    publishAt: form.publishAt,
  });
}

// VersionDiff component
function VersionDiffRow({ label, current, version }: { label: string; current: string; version: string }) {
  const changed = current !== version;
  return (
    <div className={`grid grid-cols-[120px_1fr_1fr] gap-2 rounded-lg px-3 py-2 text-xs ${changed ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}>
      <span className="font-bold text-muted-foreground">{label}</span>
      <span className={`truncate ${changed ? "text-foreground" : "text-muted-foreground"}`}>{current || "—"}</span>
      <span className={`truncate ${changed ? "font-semibold text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`}>{version || "—"}</span>
    </div>
  );
}

export default function AdminPages() {
  const pages = useQuery(api.pages.listForAdmin);
  const upsert = useMutation(api.pages.upsert);
  const remove = useMutation(api.pages.remove);
  const restore = useMutation(api.pages.restore);
  const archivePage = useMutation(api.pages.archive);
  const unarchivePage = useMutation(api.pages.unarchive);
  const duplicatePage = useMutation(api.pages.duplicate);
  const rollbackToVersion = useMutation(api.pages.rollbackToVersion);
  const hardRemove = useMutation(api.pages.hardRemove);
  const seedDemo = useMutation(api.pages.seedDemo);

  const [form, setForm] = useState<PageForm | null>(null);
  const [versionPreview, setVersionPreview] = useState<VersionRecord | null>(null);
  const [rollbackingVersionId, setRollbackingVersionId] = useState<Id<"page_versions"> | null>(null);
  const [hardDeletingId, setHardDeletingId] = useState<Id<"pages"> | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const pendingDiscardActionRef = useRef<(() => void) | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"pages"> | null>(null);
  const [restoringId, setRestoringId] = useState<Id<"pages"> | null>(null);
  const [archivingId, setArchivingId] = useState<Id<"pages"> | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<Id<"pages"> | null>(null);
  const [expandedId, setExpandedId] = useState<Id<"pages"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pageTypeFilter, setPageTypeFilter] = useState<PageTypeFilter>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("active");
  const [sortBy, setSortBy] = useState<SortOption>("order");
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);

  const versionHistory = useQuery(
    api.pages.listVersions,
    form?.id ? { pageId: form.id } : "skip",
  );

  const previewHtml = useMemo(() => sanitizePageHtml(form?.content), [form?.content]);
  const formSnapshot = useMemo(() => getFormSnapshot(form), [form]);
  const emptySnapshot = useMemo(() => getFormSnapshot(EMPTY_FORM), []);
  const baselineSnapshot = form?.id ? lastSavedSnapshot : emptySnapshot;
  const hasUnsavedChanges = Boolean(
    form &&
      (
        autosaveStatus === "dirty" ||
        autosaveStatus === "saving" ||
        autosaveStatus === "error" ||
        (formSnapshot && baselineSnapshot && formSnapshot !== baselineSnapshot)
      ),
  );

  const resetEditorState = () => {
    setForm(null);
    setVersionPreview(null);
    setAutosaveStatus("idle");
    setLastSavedSnapshot(null);
    setFieldErrors({});
    setSubmitError(null);
  };

  const requestDiscardConfirmation = (action: () => void) => {
    if (!hasUnsavedChanges) {
      action();
      return;
    }
    pendingDiscardActionRef.current = action;
    setDiscardDialogOpen(true);
  };

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");
      const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const isExternal = !href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:");
      if (targetAttr === "_blank" || isModifiedClick || isExternal) return;
      event.preventDefault();
      requestDiscardConfirmation(() => { window.location.href = anchor.href; });
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleDiscardCancel = () => {
    setDiscardDialogOpen(false);
    pendingDiscardActionRef.current = null;
  };

  const handleDiscardConfirm = () => {
    setDiscardDialogOpen(false);
    const action = pendingDiscardActionRef.current;
    pendingDiscardActionRef.current = null;
    action?.();
  };

  const setField = (key: keyof PageForm, value: unknown) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  };

  const validateFormState = useCallback(
    (currentForm: PageForm) => {
      const nextErrors = validatePageInput({
        title: currentForm.title,
        slug: currentForm.slug,
        order: currentForm.order,
        heroImage: currentForm.heroImage,
        seoTitle: currentForm.seoTitle,
        seoDescription: currentForm.seoDescription,
        canonicalUrl: currentForm.canonicalUrl,
        ogTitle: currentForm.ogTitle,
        ogDescription: currentForm.ogDescription,
      });

      if (pages && hasSlugConflict(pages, currentForm.slug, currentForm.id)) {
        nextErrors.slug = "Slug jest już zajęty przez inną stronę";
      }

      return nextErrors;
    },
    [pages],
  );

  const persistForm = useCallback(
    async ({
      currentForm,
      silent,
      closeOnSuccess,
      source,
    }: {
      currentForm: PageForm;
      silent: boolean;
      closeOnSuccess: boolean;
      source: "manual" | "autosave";
    }) => {
      const nextErrors = validateFormState(currentForm);

      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        if (source === "autosave") {
          setAutosaveStatus("dirty");
          return false;
        }
        setSubmitError("Popraw oznaczone pola przed zapisaniem.");
        toast.error("Formularz zawiera błędy");
        return false;
      }

      if (source === "manual") {
        setSaving(true);
        setSubmitError(null);
      } else {
        setAutosaveStatus("saving");
      }

      try {
        const savedId = await upsert({
          id: currentForm.id,
          title: currentForm.title.trim(),
          slug: slugify(currentForm.slug),
          excerpt: currentForm.excerpt || undefined,
          content: currentForm.content || undefined,
          status: currentForm.status,
          pageType: currentForm.pageType,
          isVisibleInMenu: currentForm.isVisibleInMenu,
          isVisibleInFooter: currentForm.isVisibleInFooter,
          order: Number(currentForm.order),
          seoTitle: currentForm.seoTitle || undefined,
          seoDescription: currentForm.seoDescription || undefined,
          heroImage: currentForm.heroImage || undefined,
          canonicalUrl: currentForm.canonicalUrl || undefined,
          robots: currentForm.robots || undefined,
          ogTitle: currentForm.ogTitle || undefined,
          ogDescription: currentForm.ogDescription || undefined,
          ogImage: currentForm.ogImage || undefined,
          publishAt: fromDatetimeLocal(currentForm.publishAt),
          saveSource: source,
        });

        const nextForm = currentForm.id ? currentForm : { ...currentForm, id: savedId };
        const nextSnapshot = getFormSnapshot(nextForm);
        setLastSavedSnapshot(nextSnapshot);
        setFieldErrors({});
        setSubmitError(null);
        setAutosaveStatus("saved");

        if (source === "manual" && !silent) {
          toast.success(currentForm.id ? "Strona zaktualizowana" : "Strona utworzona");
        }

        if (closeOnSuccess) {
          resetEditorState();
        } else if (!currentForm.id) {
          setForm((existing) => (existing ? { ...existing, id: savedId } : existing));
        }

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Błąd zapisu";
        setSubmitError(message);
        if (message.toLowerCase().includes("slug")) {
          setFieldErrors((current) => ({ ...current, slug: message }));
        }
        setAutosaveStatus("error");
        if (!silent) toast.error(message);
        return false;
      } finally {
        if (source === "manual") setSaving(false);
      }
    },
    [upsert, validateFormState],
  );

  useEffect(() => {
    if (!form || !form.id || !formSnapshot || !lastSavedSnapshot) return;
    if (formSnapshot === lastSavedSnapshot) {
      if (autosaveStatus !== "saved") setAutosaveStatus("saved");
      return;
    }
    setAutosaveStatus("dirty");
    const timeout = window.setTimeout(() => {
      void persistForm({ currentForm: form, silent: true, closeOnSuccess: false, source: "autosave" });
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [autosaveStatus, form, formSnapshot, lastSavedSnapshot, persistForm]);

  const filteredPages = useMemo(() => {
    if (!pages) return [];
    const filtered = pages.filter((page) => {
      const deleted = isPageDeleted(page);
      const archived = isPageArchived(page);
      const scheduled = isPageScheduled(page);

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "deleted" && deleted) ||
        (visibilityFilter === "archived" && !deleted && archived) ||
        (visibilityFilter === "scheduled" && !deleted && !archived && scheduled) ||
        (visibilityFilter === "active" && !deleted && !archived);

      const matchesStatus = statusFilter === "all" || page.status === statusFilter;
      const matchesPageType = pageTypeFilter === "all" || page.pageType === pageTypeFilter;

      return matchesVisibility && matchesStatus && matchesPageType && matchesPageSearch(page, searchQuery);
    });

    return filtered.sort((a, b) => {
      if (sortBy === "updatedAt") return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
      if (sortBy === "title") return a.title.localeCompare(b.title, "pl");
      return a.order - b.order;
    });
  }, [visibilityFilter, pageTypeFilter, pages, searchQuery, sortBy, statusFilter]);

  const handlePreview = (slug: string, status?: Status) => {
    if (!slug) return;
    const href = status === "draft" ? `/${slug}?preview=admin` : `/${slug}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleNew = () => {
    requestDiscardConfirmation(() => {
      setForm({ ...EMPTY_FORM });
      setFieldErrors({});
      setSubmitError(null);
      setAutosaveStatus("idle");
      setLastSavedSnapshot(null);
      setVersionPreview(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleEdit = (page: NonNullable<typeof pages>[number]) => {
    requestDiscardConfirmation(() => {
      const nextForm: PageForm = {
        id: page._id,
        title: page.title,
        slug: page.slug,
        excerpt: page.excerpt ?? "",
        content: page.content ?? "",
        status: page.status,
        pageType: page.pageType,
        isVisibleInMenu: page.isVisibleInMenu,
        isVisibleInFooter: page.isVisibleInFooter,
        order: page.order,
        seoTitle: page.seoTitle ?? "",
        seoDescription: page.seoDescription ?? "",
        heroImage: page.heroImage ?? "",
        canonicalUrl: page.canonicalUrl ?? "",
        robots: page.robots ?? "",
        ogTitle: page.ogTitle ?? "",
        ogDescription: page.ogDescription ?? "",
        ogImage: page.ogImage ?? "",
        publishAt: toDatetimeLocal(page.publishAt),
      };
      setForm(nextForm);
      setFieldErrors({});
      setSubmitError(null);
      setVersionPreview(null);
      setLastSavedSnapshot(getFormSnapshot(nextForm));
      setAutosaveStatus("saved");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleSave = async () => {
    if (!form) return;
    await persistForm({ currentForm: form, silent: false, closeOnSuccess: true, source: "manual" });
  };

  const handleDelete = async (id: Id<"pages">) => {
    if (!confirm("Przenieść tę stronę do usuniętych?")) return;
    setDeletingId(id);
    try {
      await remove({ id });
      toast.success("Strona przeniesiona do usuniętych");
      if (form?.id === id) resetEditorState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd usuwania");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id: Id<"pages">) => {
    setRestoringId(id);
    try {
      await restore({ id });
      toast.success("Strona przywrócona");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd przywracania");
    } finally {
      setRestoringId(null);
    }
  };

  const handleArchive = async (id: Id<"pages">) => {
    if (!confirm("Zarchiwizować tę stronę? Nie będzie widoczna publicznie.")) return;
    setArchivingId(id);
    try {
      await archivePage({ id });
      toast.success("Strona zarchiwizowana");
      if (form?.id === id) resetEditorState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd archiwizacji");
    } finally {
      setArchivingId(null);
    }
  };

  const handleUnarchive = async (id: Id<"pages">) => {
    setArchivingId(id);
    try {
      await unarchivePage({ id });
      toast.success("Strona przywrócona z archiwum");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd przywracania z archiwum");
    } finally {
      setArchivingId(null);
    }
  };

  const handleDuplicate = async (id: Id<"pages">) => {
    setDuplicatingId(id);
    try {
      await duplicatePage({ id });
      toast.success("Strona zduplikowana — znajdziesz ją na liście jako szkic");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd duplikowania");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedDemo({});
      if ((result as { skipped?: boolean }).skipped) {
        toast.info("Strony demo już istnieją");
      } else {
        toast.success("Strony demo załadowane");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd ładowania demo");
    } finally {
      setSeeding(false);
    }
  };

  const handleRollback = async (versionId: Id<"page_versions">) => {
    if (!form?.id) return;
    if (!window.confirm("Przywrócić tę wersję strony? Bieżący stan zostanie zapisany do historii.")) return;
    setRollbackingVersionId(versionId);
    try {
      await rollbackToVersion({ pageId: form.id, versionId });
      toast.success("Przywrócono wybraną wersję");
      resetEditorState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd rollbacku");
    } finally {
      setRollbackingVersionId(null);
    }
  };

  const handleHardDelete = async (pageId: Id<"pages">, slug: string) => {
    const confirmation = window.prompt(`Aby usunąć stronę trwale, wpisz jej slug: ${slug}`);
    if (!confirmation) return;
    setHardDeletingId(pageId);
    try {
      await hardRemove({ id: pageId, confirmationSlug: confirmation });
      toast.success("Strona została usunięta trwale");
      if (form?.id === pageId) resetEditorState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd trwałego usunięcia");
    } finally {
      setHardDeletingId(null);
    }
  };

  const autosaveLabel =
    autosaveStatus === "saving" ? "Zapisywanie..."
    : autosaveStatus === "saved" ? "Zapisano"
    : autosaveStatus === "error" ? "Błąd zapisu"
    : autosaveStatus === "dirty" ? "Niezapisane zmiany"
    : "Brak zmian";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Strony</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Statyczne podstrony portalu (O nas, Regulamin, itp.)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding} className="gap-1.5 text-xs">
            <Layers className="h-3.5 w-3.5" />
            {seeding ? "Ładowanie..." : "Załaduj demo"}
          </Button>
          <Button size="sm" onClick={handleNew} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nowa strona
          </Button>
        </div>
      </div>

      {/* Editor form */}
      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            {/* Form header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-foreground">
                  {form.id ? "Edytuj stronę" : "Nowa strona"}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{autosaveLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => requestDiscardConfirmation(resetEditorState)} className="gap-1.5 text-xs">
                  <X className="h-3.5 w-3.5" />
                  Anuluj
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {submitError}
              </div>
            )}

            <Tabs defaultValue="edit">
              <TabsList className="mb-4">
                <TabsTrigger value="edit">Edycja</TabsTrigger>
                <TabsTrigger value="seo">SEO &amp; OG</TabsTrigger>
                <TabsTrigger value="preview">Podgląd</TabsTrigger>
                {form.id && versionHistory && versionHistory.length > 0 && (
                  <TabsTrigger value="history">Historia ({versionHistory.length})</TabsTrigger>
                )}
              </TabsList>

              {/* Edit tab */}
              <TabsContent value="edit" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Tytuł *</label>
                    <Input
                      value={form.title}
                      onChange={(e) => {
                        setField("title", e.target.value);
                        if (!form.id) setField("slug", slugify(e.target.value));
                      }}
                      placeholder="Tytuł strony"
                      className={fieldErrors.title ? "border-destructive" : ""}
                    />
                    {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Slug *</label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                      placeholder="slug-strony"
                      className={fieldErrors.slug ? "border-destructive" : ""}
                    />
                    {fieldErrors.slug && <p className="text-xs text-destructive">{fieldErrors.slug}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Excerpt</label>
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) => setField("excerpt", e.target.value)}
                    placeholder="Krótki opis strony"
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Treść</label>
                  <PageRichTextEditor
                    value={form.content}
                    onChange={(val) => setField("content", val)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Status</label>
                    <Select value={form.status} onValueChange={(v) => setField("status", v as Status)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Szkic</SelectItem>
                        <SelectItem value="published">Opublikowana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Typ strony</label>
                    <Select value={form.pageType} onValueChange={(v) => setField("pageType", v as PageType)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PAGE_TYPE_LABELS) as PageType[]).map((t) => (
                          <SelectItem key={t} value={t}>{PAGE_TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Kolejność</label>
                    <Input
                      type="number"
                      value={form.order}
                      onChange={(e) => setField("order", Number(e.target.value))}
                      className={`h-8 text-xs ${fieldErrors.order ? "border-destructive" : ""}`}
                    />
                    {fieldErrors.order && <p className="text-xs text-destructive">{fieldErrors.order}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Zaplanuj publikację
                    </label>
                    <Input
                      type="datetime-local"
                      value={form.publishAt}
                      onChange={(e) => setField("publishAt", e.target.value)}
                      className="h-8 text-xs"
                    />
                    {form.publishAt && (
                      <p className="text-[11px] text-muted-foreground">
                        Strona pojawi się publicznie {new Date(form.publishAt).toLocaleString("pl-PL")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Zdjęcie nagłówkowe (URL)</label>
                    <Input
                      value={form.heroImage}
                      onChange={(e) => setField("heroImage", e.target.value)}
                      placeholder="https://..."
                      className={fieldErrors.heroImage ? "border-destructive" : ""}
                    />
                    {fieldErrors.heroImage && <p className="text-xs text-destructive">{fieldErrors.heroImage}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Widoczność</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={form.isVisibleInMenu}
                          onChange={(e) => setField("isVisibleInMenu", e.target.checked)}
                          className="h-3.5 w-3.5 rounded"
                        />
                        Menu
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={form.isVisibleInFooter}
                          onChange={(e) => setField("isVisibleInFooter", e.target.checked)}
                          className="h-3.5 w-3.5 rounded"
                        />
                        Stopka
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* SEO & OG tab */}
              <TabsContent value="seo" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      SEO tytuł <span className="font-normal opacity-60">({form.seoTitle.length}/{SEO_TITLE_MAX_LENGTH})</span>
                    </label>
                    <Input
                      value={form.seoTitle}
                      onChange={(e) => setField("seoTitle", e.target.value)}
                      placeholder={form.title || "Tytuł dla wyszukiwarek"}
                      maxLength={SEO_TITLE_MAX_LENGTH}
                      className={fieldErrors.seoTitle ? "border-destructive" : ""}
                    />
                    {fieldErrors.seoTitle && <p className="text-xs text-destructive">{fieldErrors.seoTitle}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      Canonical URL
                    </label>
                    <Input
                      value={form.canonicalUrl}
                      onChange={(e) => setField("canonicalUrl", e.target.value)}
                      placeholder="https://lovebydgoszcz.pl/o-nas"
                      className={fieldErrors.canonicalUrl ? "border-destructive" : ""}
                    />
                    {fieldErrors.canonicalUrl && <p className="text-xs text-destructive">{fieldErrors.canonicalUrl}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    SEO opis <span className="font-normal opacity-60">({form.seoDescription.length}/{SEO_DESCRIPTION_MAX_LENGTH})</span>
                  </label>
                  <Textarea
                    value={form.seoDescription}
                    onChange={(e) => setField("seoDescription", e.target.value)}
                    placeholder={form.excerpt || "Opis dla wyszukiwarek"}
                    rows={2}
                    maxLength={SEO_DESCRIPTION_MAX_LENGTH}
                    className={`resize-none ${fieldErrors.seoDescription ? "border-destructive" : ""}`}
                  />
                  {fieldErrors.seoDescription && <p className="text-xs text-destructive">{fieldErrors.seoDescription}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Robots meta</label>
                  <Select value={form.robots || "default"} onValueChange={(v) => setField("robots", v === "default" ? "" : v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Domyślne (index, follow)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Domyślne (index, follow)</SelectItem>
                      <SelectItem value="noindex">noindex</SelectItem>
                      <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                      <SelectItem value="nofollow">nofollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Open Graph</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        OG tytuł <span className="font-normal opacity-60">({form.ogTitle.length}/{OG_TITLE_MAX_LENGTH})</span>
                      </label>
                      <Input
                        value={form.ogTitle}
                        onChange={(e) => setField("ogTitle", e.target.value)}
                        placeholder={form.seoTitle || form.title || "Tytuł dla social media"}
                        maxLength={OG_TITLE_MAX_LENGTH}
                        className={fieldErrors.ogTitle ? "border-destructive" : ""}
                      />
                      {fieldErrors.ogTitle && <p className="text-xs text-destructive">{fieldErrors.ogTitle}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">OG image (URL)</label>
                      <Input
                        value={form.ogImage}
                        onChange={(e) => setField("ogImage", e.target.value)}
                        placeholder={form.heroImage || "https://..."}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      OG opis <span className="font-normal opacity-60">({form.ogDescription.length}/{OG_DESCRIPTION_MAX_LENGTH})</span>
                    </label>
                    <Textarea
                      value={form.ogDescription}
                      onChange={(e) => setField("ogDescription", e.target.value)}
                      placeholder={form.seoDescription || form.excerpt || "Opis dla social media"}
                      rows={2}
                      maxLength={OG_DESCRIPTION_MAX_LENGTH}
                      className={`resize-none ${fieldErrors.ogDescription ? "border-destructive" : ""}`}
                    />
                    {fieldErrors.ogDescription && <p className="text-xs text-destructive">{fieldErrors.ogDescription}</p>}
                  </div>
                </div>
              </TabsContent>

              {/* Preview tab */}
              <TabsContent value="preview">
                <div className="rounded-xl border border-border/60 bg-background p-6">
                  {previewHtml ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert
                        prose-headings:font-black prose-headings:text-foreground
                        prose-p:text-foreground/80 prose-p:leading-relaxed
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-foreground
                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Brak treści do podglądu.</p>
                  )}
                </div>
              </TabsContent>

              {/* History tab */}
              {form.id && versionHistory && versionHistory.length > 0 && (
                <TabsContent value="history" className="space-y-3">
                  {versionPreview && (
                    <div className="rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-900/10 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          Porównanie: bieżąca vs wybrana wersja
                        </p>
                        <button onClick={() => setVersionPreview(null)} className="text-xs text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-[120px_1fr_1fr] gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        <span>Pole</span>
                        <span>Bieżąca</span>
                        <span>Wybrana wersja</span>
                      </div>

                      <div className="space-y-0.5">
                        <VersionDiffRow label="Tytuł" current={form.title} version={versionPreview.title ?? ""} />
                        <VersionDiffRow label="Slug" current={slugify(form.slug)} version={versionPreview.slug ?? ""} />
                        <VersionDiffRow label="Status" current={STATUS_LABELS[form.status]} version={STATUS_LABELS[versionPreview.status as Status] ?? versionPreview.status ?? ""} />
                        <VersionDiffRow label="Typ" current={PAGE_TYPE_LABELS[form.pageType]} version={PAGE_TYPE_LABELS[versionPreview.pageType as PageType] ?? versionPreview.pageType ?? ""} />
                        <VersionDiffRow label="Excerpt" current={form.excerpt} version={versionPreview.excerpt ?? ""} />
                        <VersionDiffRow label="SEO tytuł" current={form.seoTitle} version={versionPreview.seoTitle ?? ""} />
                        <VersionDiffRow label="SEO opis" current={form.seoDescription} version={versionPreview.seoDescription ?? ""} />
                        <VersionDiffRow label="OG tytuł" current={form.ogTitle} version={versionPreview.ogTitle ?? ""} />
                        <VersionDiffRow label="Canonical" current={form.canonicalUrl} version={versionPreview.canonicalUrl ?? ""} />
                        <VersionDiffRow label="Robots" current={form.robots} version={versionPreview.robots ?? ""} />
                        <VersionDiffRow label="Menu" current={form.isVisibleInMenu ? "tak" : "nie"} version={versionPreview.isVisibleInMenu ? "tak" : "nie"} />
                        <VersionDiffRow label="Stopka" current={form.isVisibleInFooter ? "tak" : "nie"} version={versionPreview.isVisibleInFooter ? "tak" : "nie"} />
                        <VersionDiffRow
                          label="Treść (długość)"
                          current={`${form.content.length} znaków`}
                          version={`${(versionPreview.content ?? "").length} znaków`}
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRollback(versionPreview._id)}
                        disabled={rollbackingVersionId === versionPreview._id}
                        className="gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        {rollbackingVersionId === versionPreview._id ? "Przywracanie..." : "Przywróć tę wersję"}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {versionHistory.map((version) => (
                      <div
                        key={version._id}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs transition-colors ${
                          versionPreview?._id === version._id
                            ? "border-amber-300/60 bg-amber-50/60 dark:border-amber-700/40 dark:bg-amber-900/10"
                            : "border-border/60 bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">{version.title ?? "Bez tytułu"}</p>
                          <p className="mt-0.5 text-muted-foreground">
                            {PAGE_VERSION_SOURCE_LABELS[version.source as keyof typeof PAGE_VERSION_SOURCE_LABELS] ?? version.source}
                            {" · "}
                            {formatDateTime(version.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setVersionPreview(versionPreview?._id === version._id ? null : version)}
                            className="flex h-7 items-center gap-1 rounded-lg border border-border/60 px-2 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            {versionPreview?._id === version._id ? "Ukryj" : "Porównaj"}
                          </button>
                          <button
                            onClick={() => handleRollback(version._id)}
                            disabled={rollbackingVersionId === version._id}
                            className="flex h-7 items-center gap-1 rounded-lg border border-border/60 px-2 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <RefreshCcw className="h-3 w-3" />
                            Przywróć
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discard dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Niezapisane zmiany</AlertDialogTitle>
            <AlertDialogDescription>
              Masz niezapisane zmiany. Czy na pewno chcesz je porzucić?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardCancel}>Zostań</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardConfirm}>Porzuć zmiany</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj stron..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as VisibilityFilter)}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <ListFilter className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktywne</SelectItem>
            <SelectItem value="scheduled">Zaplanowane</SelectItem>
            <SelectItem value="archived">Archiwum</SelectItem>
            <SelectItem value="deleted">Usunięte</SelectItem>
            <SelectItem value="all">Wszystkie</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="draft">Szkic</SelectItem>
            <SelectItem value="published">Opublikowane</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pageTypeFilter} onValueChange={(v) => setPageTypeFilter(v as PageTypeFilter)}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            {(Object.keys(PAGE_TYPE_LABELS) as PageType[]).map((t) => (
              <SelectItem key={t} value={t}>{PAGE_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Kolejność</SelectItem>
            <SelectItem value="updatedAt">Ostatnia zmiana</SelectItem>
            <SelectItem value="title">Tytuł A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pages list */}
      {pages === undefined ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-muted-foreground">Brak stron</p>
          <p className="text-xs text-muted-foreground">Utwórz pierwszą stronę lub załaduj demo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPages.map((page) => {
            const isExpanded = expandedId === page._id;
            const isDeleted = isPageDeleted(page);
            const isArchived = isPageArchived(page);
            const isScheduled = isPageScheduled(page);
            const TypeIcon = PAGE_TYPE_ICONS[page.pageType] ?? FileText;

            return (
              <motion.div
                key={page._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
                  isDeleted ? "border-destructive/20 opacity-60" : isArchived ? "border-muted-foreground/20 opacity-70" : "border-border/60"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{page.title}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[page.status]}`}>
                        {STATUS_LABELS[page.status]}
                      </span>
                      {isScheduled && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/30 dark:text-blue-300">
                          <Clock className="h-2.5 w-2.5" />
                          Zaplanowana
                        </span>
                      )}
                      {isArchived && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-muted-foreground/30 bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          <Archive className="h-2.5 w-2.5" />
                          Archiwum
                        </span>
                      )}
                      {isDeleted && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                          <Trash2 className="h-2.5 w-2.5" />
                          Usunięta
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">/{page.slug}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : page._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>

                    {!isDeleted && !isArchived && (
                      <button
                        onClick={() => handleEdit(page)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                        title="Edytuj"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDuplicate(page._id)}
                      disabled={duplicatingId === page._id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                      title="Duplikuj"
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    {isDeleted ? (
                      <>
                        <button
                          onClick={() => handleRestore(page._id)}
                          disabled={restoringId === page._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          title="Przywróć"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleHardDelete(page._id, page.slug)}
                          disabled={hardDeletingId === page._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-destructive/10"
                          title="Usuń trwale"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </>
                    ) : isArchived ? (
                      <button
                        onClick={() => handleUnarchive(page._id)}
                        disabled={archivingId === page._id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                        title="Przywróć z archiwum"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleArchive(page._id)}
                          disabled={archivingId === page._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                          title="Archiwizuj"
                        >
                          <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(page._id)}
                          disabled={deletingId === page._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Przenieś do usuniętych"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-4 border-t border-border/40 px-4 pb-4 pt-4 md:grid-cols-[1.4fr_1fr]">
                        <div className="space-y-3">
                          {page.excerpt && (
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Excerpt</p>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{page.excerpt}</p>
                            </div>
                          )}

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">SEO title</p>
                              <p className="mt-1 text-xs text-foreground">{page.seoTitle || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">SEO description</p>
                              <p className="mt-1 text-xs text-foreground">{page.seoDescription || "—"}</p>
                            </div>
                          </div>

                          {(page.canonicalUrl || page.robots || page.ogTitle) && (
                            <div className="grid gap-3 sm:grid-cols-3">
                              {page.canonicalUrl && (
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Canonical</p>
                                  <p className="mt-1 text-xs text-foreground truncate">{page.canonicalUrl}</p>
                                </div>
                              )}
                              {page.robots && (
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Robots</p>
                                  <p className="mt-1 text-xs text-foreground">{page.robots}</p>
                                </div>
                              )}
                              {page.ogTitle && (
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">OG title</p>
                                  <p className="mt-1 text-xs text-foreground truncate">{page.ogTitle}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Calendar className="mt-0.5 h-3.5 w-3.5" />
                              <span>Aktualizacja: {formatDate(page.updatedAt)}</span>
                            </div>
                            {page.publishAt && (
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Clock className="mt-0.5 h-3.5 w-3.5" />
                                <span>Publikacja: {formatDateTime(page.publishAt)}</span>
                              </div>
                            )}
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Globe className="mt-0.5 h-3.5 w-3.5" />
                              <span>Menu: {page.isVisibleInMenu ? "tak" : "nie"} · Stopka: {page.isVisibleInFooter ? "tak" : "nie"}</span>
                            </div>
                          </div>

                          {isDeleted && (
                            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                              <span>Strona jest soft-deleted i nie pojawia się publicznie.</span>
                            </div>
                          )}
                          {isArchived && (
                            <div className="flex items-start gap-2 rounded-xl border border-muted-foreground/20 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                              <Archive className="mt-0.5 h-3.5 w-3.5" />
                              <span>Strona jest zarchiwizowana. Zarchiwizowano: {formatDate(page.archivedAt)}.</span>
                            </div>
                          )}
                          {isScheduled && (
                            <div className="flex items-start gap-2 rounded-xl border border-blue-200/60 bg-blue-50/60 dark:border-blue-800/30 dark:bg-blue-900/10 px-3 py-2 text-xs text-blue-800 dark:text-blue-300">
                              <Clock className="mt-0.5 h-3.5 w-3.5" />
                              <span>Zaplanowana publikacja: {formatDateTime(page.publishAt)}.</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Hero image</p>
                            {page.heroImage ? (
                              <div className="mt-2 overflow-hidden rounded-xl border border-border/60 bg-muted">
                                <img src={page.heroImage} alt={page.title} className="h-28 w-full object-cover" />
                                <div className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground truncate">{page.heroImage}</div>
                              </div>
                            ) : (
                              <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-4 text-xs text-muted-foreground">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Brak zdjęcia nagłówkowego
                              </div>
                            )}
                          </div>

                          {!isDeleted && !isArchived && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(page.slug, page.status)}
                              className="w-full gap-1.5"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {page.status === "draft" ? "Otwórz podgląd draftu" : "Otwórz stronę"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}