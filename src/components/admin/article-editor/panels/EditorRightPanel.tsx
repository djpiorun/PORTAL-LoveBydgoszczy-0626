import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, User, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RIGHT_TABS } from "@/components/admin/article-editor/config/articleTypes";
import { CATEGORIES } from "@/components/admin/article-editor/config/categories";
import AuthorAutocomplete from "@/components/admin/article-editor/helpers/AuthorAutocomplete";
import CategoryPicker from "@/components/admin/article-editor/helpers/CategoryPicker";
import ArticleTypePicker from "@/components/admin/article-editor/helpers/ArticleTypePicker";
import type { ArticleType } from "@/components/admin/article-editor/types/articleEditorTypes";

interface EditorRightPanelProps {
  form: ArticleType;
  set: (key: keyof ArticleType, value: any) => void;
  article?: { _id?: string };
  now: number;
  categoryOptions: typeof CATEGORIES;
  rightTab: string;
  setRightTab: (tab: string) => void;
  rightCollapsed: boolean;
  setRightCollapsed: (fn: (c: boolean) => boolean) => void;
  showCoauthor: boolean;
  setShowCoauthor: (v: boolean) => void;
  showCoauthor2: boolean;
  setShowCoauthor2: (v: boolean) => void;
  showCoauthor3: boolean;
  setShowCoauthor3: (v: boolean) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  isFuturePublication: boolean;
  showUpdateDateField: boolean;
  setShowUpdateDateField: (v: boolean) => void;
}

export default function EditorRightPanel({
  form,
  set,
  article,
  now,
  categoryOptions,
  rightTab,
  setRightTab,
  rightCollapsed,
  setRightCollapsed,
  showCoauthor,
  setShowCoauthor,
  showCoauthor2,
  setShowCoauthor2,
  showCoauthor3,
  setShowCoauthor3,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  isFuturePublication,
  showUpdateDateField,
  setShowUpdateDateField,
}: EditorRightPanelProps) {
  // Author mode: "system" = autocomplete from DB, "custom" = free text
  const [authorMode, setAuthorMode] = useState<"system" | "custom">("system");

  return (
    <>
      {/* Right Sidebar */}
      <AnimatePresence initial={false}>
        {!rightCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-border bg-muted/20 flex-shrink-0 overflow-hidden"
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-border bg-background/80 p-3 backdrop-blur-sm">
                <div className="rounded-xl border border-border bg-muted/40 p-0.5">
                  <div className="flex gap-0.5">
                    {RIGHT_TABS.map(tab => (
                      <button key={tab.id} type="button" onClick={() => setRightTab(tab.id)}
                        className={`flex-1 rounded-lg py-2 flex items-center justify-center gap-1 text-[11px] font-semibold transition-all relative ${
                          rightTab === tab.id
                            ? "text-foreground bg-background shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Podstawowe Tab */}
                {rightTab === "basic" && (
                  <div className="p-3 space-y-3">
                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                      <div>
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Kategoria</Label>
                        <CategoryPicker value={form.category} onChange={v => set("category", v)} options={categoryOptions} />
                      </div>

                      <div className="mt-3.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Typ artykułu</Label>
                        <ArticleTypePicker value={form.articleType ?? "news"} onChange={v => set("articleType", v)} />
                      </div>

                      <div className="mt-3.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Data publikacji</Label>
                        <p className="mb-1.5 text-[10px] text-muted-foreground">
                          Teraz: {new Date(now).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                        <input
                          type="datetime-local"
                          value={new Date(form.publishedAt).toISOString().slice(0, 16)}
                          onChange={e => set("publishedAt", new Date(e.target.value).getTime())}
                          className="h-8 text-xs w-full rounded-lg border border-input bg-background px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        {isFuturePublication && (
                          <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            Zaplanowana publikacja
                          </div>
                        )}

                        {article?._id && !showUpdateDateField && (
                          <button
                            type="button"
                            onClick={() => {
                              set("updatedAt", Date.now());
                              setShowUpdateDateField(true);
                            }}
                            className="mt-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground underline underline-offset-2"
                          >
                            Ustaw datę aktualizacji
                          </button>
                        )}

                        {showUpdateDateField && (
                          <div className="mt-2.5 rounded-lg border border-border bg-muted/20 p-2.5">
                            <Label className="text-[10px] mb-1.5 block text-muted-foreground">Data aktualizacji</Label>
                            <input
                              type="datetime-local"
                              value={new Date(form.updatedAt ?? Date.now()).toISOString().slice(0, 16)}
                              onChange={e => set("updatedAt", new Date(e.target.value).getTime())}
                              className="h-8 text-xs w-full rounded-lg border border-input bg-background px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </div>
                        )}

                        {form.updatedAt && (
                          <p className="mt-1.5 text-[10px] text-muted-foreground">
                            Aktualizowano: {new Date(form.updatedAt).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Autorzy</p>
                        {/* Author mode toggle */}
                        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setAuthorMode("system")}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                              authorMode === "system" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <User className="w-3 h-3" /> Z systemu
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthorMode("custom")}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                              authorMode === "custom" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <PenLine className="w-3 h-3" /> Własny
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Autor</Label>
                        {authorMode === "system" ? (
                          <AuthorAutocomplete value={form.author} onChange={v => set("author", v)} />
                        ) : (
                          <div className="relative">
                            <PenLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                              value={form.author}
                              onChange={e => set("author", e.target.value)}
                              placeholder="Wpisz nazwę autora..."
                              className="h-8 text-xs pl-8"
                            />
                          </div>
                        )}
                        {authorMode === "custom" && (
                          <p className="mt-1 text-[10px] text-muted-foreground">Własny autor — nie musi być w systemie</p>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Współautor</Label>
                        </div>
                        {showCoauthor ? (
                          <div className="space-y-2">
                            <div className="flex gap-1">
                              <AuthorAutocomplete value={form.coauthor ?? ""} onChange={v => set("coauthor", v)} placeholder="Współautor (opcjonalnie)" />
                              <button type="button" onClick={() => { setShowCoauthor(false); setShowCoauthor2(false); setShowCoauthor3(false); set("coauthor", ""); set("coauthor2", ""); set("coauthor3", ""); }}
                                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {showCoauthor2 ? (
                              <div className="flex gap-1">
                                <AuthorAutocomplete value={form.coauthor2 ?? ""} onChange={v => set("coauthor2", v)} placeholder="Współautor 2 (opcjonalnie)" />
                                <button type="button" onClick={() => { setShowCoauthor2(false); setShowCoauthor3(false); set("coauthor2", ""); set("coauthor3", ""); }}
                                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setShowCoauthor2(true)}
                                className="w-full h-8 border border-dashed border-border rounded-lg text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" /> Dodaj współautora 2
                              </button>
                            )}

                            {showCoauthor2 && (showCoauthor3 ? (
                              <div className="flex gap-1">
                                <AuthorAutocomplete value={form.coauthor3 ?? ""} onChange={v => set("coauthor3", v)} placeholder="Współautor 3 (opcjonalnie)" />
                                <button type="button" onClick={() => { setShowCoauthor3(false); set("coauthor3", ""); }}
                                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setShowCoauthor3(true)}
                                className="w-full h-8 border border-dashed border-border rounded-lg text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" /> Dodaj współautora 3
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button type="button" onClick={() => setShowCoauthor(true)}
                            className="w-full h-8 border border-dashed border-border rounded-lg text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Dodaj współautora
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {rightTab === "labels" && (
                  <div className="p-3 space-y-3">
                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Etykiety artykułu</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { key: "labelUrgent", label: "PILNE", active: "bg-red-100 text-red-700 border-red-200" },
                          { key: "labelImportant", label: "WAŻNE", active: "bg-orange-100 text-orange-700 border-orange-200" },
                          { key: "labelOurNews", label: "NASZA", active: "bg-blue-100 text-blue-700 border-blue-200" },
                          { key: "labelMustKnow", label: "MUSISZ WIEDZIEĆ", active: "bg-purple-100 text-purple-700 border-purple-200" },
                          { key: "labelAuthorArticle", label: "ARTYKUŁ AUTORA", active: "bg-teal-100 text-teal-700 border-teal-200" },
                          { key: "label18Plus", label: "18+", active: "bg-rose-100 text-rose-700 border-rose-200" },
                          { key: "labelDepresja", label: "DEPRESJA", active: "bg-violet-100 text-violet-700 border-violet-200" },
                          { key: "labelBeingUpdated", label: "W TRAKCIE AKTUALIZACJI", active: "bg-amber-100 text-amber-700 border-amber-200" },
                        ].map(({ key, label, active }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => set(key as keyof ArticleType, !(form as any)[key])}
                            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                              (form as any)[key] ? active : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Wyróżnienia</p>
                      <div className="space-y-2">
                        {[
                          { key: "featured", label: "Wyróżniony artykuł", desc: "Pokaż w sekcji wyróżnionych" },
                          { key: "isPatronage", label: "Patronat medialny", desc: "Dodaj oznaczenie patronatu" },
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                            <div>
                              <p className="text-xs font-semibold text-foreground">{label}</p>
                              <p className="text-[10px] text-muted-foreground">{desc}</p>
                            </div>
                            <Switch checked={(form as any)[key] ?? false} onCheckedChange={v => set(key as keyof ArticleType, v)} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Tagi</p>
                      <div className="flex gap-2 mb-2">
                        <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Dodaj tag..." className="h-8 text-xs flex-1" />
                        <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {form.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => removeTag(tag)}>#{tag}<span className="text-muted-foreground hover:text-foreground">×</span></Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar collapse toggle button */}
      <button
        type="button"
        onClick={() => setRightCollapsed(c => !c)}
        className="flex-shrink-0 w-6 bg-muted/20 border-l border-border hover:bg-muted/50 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
        title={rightCollapsed ? "Rozwiń panel" : "Zwiń panel"}
      >
        {rightCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </>
  );
}