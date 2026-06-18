import { useState } from "react";
import { Check, Layout, ImageIcon, LayoutGrid, Layers, Monitor, Tablet, Smartphone } from "lucide-react";
import { LAYOUTS, GRAPHICS_LAYOUTS, CATEGORY_LAYOUTS, CATEGORIES } from "@/components/admin/article-editor/config/categories";
import { DEFAULT_ARTICLE_ELEMENTS } from "@/components/admin/article-editor/config/contentBlocks";
import type { ArticleElement } from "@/components/admin/article-editor/types/articleEditorTypes";
import ArticleElementsManager from "@/components/admin/article-editor/blocks/ArticleElementsManager";
import AuthorFooterCard from "@/components/AuthorFooterCard";

// Minimal ArticleType shape needed by LayoutTab — avoids circular dependency
type LayoutTabFormShape = {
  layout?: string;
  graphicsLayout?: string;
  categoryLayout?: string;
  authorFooterStyle?: "graphic" | "business" | "classic" | "none";
  articleElements?: ArticleElement[];
  author?: string;
  coauthor?: string;
  coauthor2?: string;
  coauthor3?: string;
  category?: string;
};

export default function LayoutTab({ form, set }: { form: LayoutTabFormShape; set: (key: string, value: unknown) => void }) {
  const articleElements: ArticleElement[] = form.articleElements ?? DEFAULT_ARTICLE_ELEMENTS;
  const setArticleElements = (val: ArticleElement[] | ((prev: ArticleElement[]) => ArticleElement[])) => {
    const next = typeof val === "function" ? val(articleElements) : val;
    set("articleElements", next);
  };
  const graphicsLayout = form.graphicsLayout ?? "default";
  const setGraphicsLayout = (val: string) => set("graphicsLayout", val);
  const categoryLayout = form.categoryLayout ?? "default";
  const setCategoryLayout = (val: string) => set("categoryLayout", val);
  const [layoutSubTab, setLayoutSubTab] = useState<"article" | "graphics" | "category" | "elements">("article");

  const subTabs = [
    { id: "article" as const, label: "Układ artykułu", icon: Layout },
    { id: "graphics" as const, label: "Układ grafiki", icon: ImageIcon },
    { id: "category" as const, label: "Układ kategorii", icon: LayoutGrid },
    { id: "elements" as const, label: "Elementy", icon: Layers },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLayoutSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                layoutSubTab === tab.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Article Layout */}
      {layoutSubTab === "article" && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Wybierz styl układu artykułu</p>
            <p className="text-xs text-muted-foreground mb-3">Określa jak artykuł jest wyświetlany na stronie</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LAYOUTS.map(l => {
              const Icon = l.icon;
              const isSelected = form.layout === l.value;
              return (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => set("layout", l.value)}
                  className={`group relative flex flex-col gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-full h-14 rounded-lg border overflow-hidden flex flex-col gap-0.5 p-1.5 ${isSelected ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border"}`}>
                    {l.value === "standard" && (
                      <>
                        <div className="h-2 bg-current opacity-20 rounded w-3/4" />
                        <div className="flex gap-1 flex-1">
                          <div className="flex-1 bg-current opacity-10 rounded" />
                          <div className="w-1/3 bg-current opacity-10 rounded" />
                        </div>
                      </>
                    )}
                    {l.value === "wide" && (
                      <>
                        <div className="h-2 bg-current opacity-20 rounded w-full" />
                        <div className="flex gap-1 flex-1">
                          <div className="flex-[2] bg-current opacity-10 rounded" />
                          <div className="w-1/4 bg-current opacity-10 rounded" />
                        </div>
                      </>
                    )}
                    {l.value === "fullwidth" && (
                      <>
                        <div className="h-2 bg-current opacity-20 rounded w-full" />
                        <div className="flex-1 bg-current opacity-10 rounded" />
                      </>
                    )}
                    {l.value === "magazine" && (
                      <>
                        <div className="h-2 bg-current opacity-20 rounded w-2/3" />
                        <div className="flex gap-1 flex-1">
                          <div className="flex-1 bg-current opacity-10 rounded" />
                          <div className="flex-1 bg-current opacity-10 rounded" />
                          <div className="flex-1 bg-current opacity-10 rounded" />
                        </div>
                      </>
                    )}
                    {l.value === "minimal" && (
                      <>
                        <div className="h-2 bg-current opacity-20 rounded w-1/2 mx-auto" />
                        <div className="w-2/3 mx-auto flex-1 bg-current opacity-10 rounded" />
                      </>
                    )}
                    {l.value === "hero" && (
                      <>
                        <div className="h-5 bg-current opacity-15 rounded w-full" />
                        <div className="h-1.5 bg-current opacity-20 rounded w-3/4 mt-0.5" />
                        <div className="flex-1 bg-current opacity-10 rounded mt-0.5" />
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{l.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{l.desc}</p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Author Footer Style */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-1">Stopka Autora</p>
            <p className="text-xs text-muted-foreground mb-2">Styl stopki wyświetlanej pod artykułem</p>
            <div className="flex gap-2">
              {[
                { value: "graphic", label: "Stopka Autora (główna)", desc: "Jasna, nowoczesna" },
                { value: "business", label: "Wizytówkowa", desc: "Karta biznesowa" },
                { value: "classic", label: "Klasyczna", desc: "Klasyczna z gradientem" },
                { value: "none", label: "Brak stopki", desc: "Ukryj stopkę autora" },
              ].map(opt => {
                const isSelected = (form.authorFooterStyle ?? "graphic") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("authorFooterStyle", opt.value)}
                    className={`flex-1 flex flex-col gap-1 p-2.5 rounded-xl border-2 transition-all text-left ${
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live preview of author footer */}
          {form.author && (form.authorFooterStyle ?? "graphic") !== "none" && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Podgląd stopki autora</p>
              <div className="pointer-events-none opacity-90 scale-95 origin-top">
                <AuthorFooterCard
                  authorName={form.author}
                  coauthorName={form.coauthor}
                  coauthor2={form.coauthor2}
                  coauthor3={form.coauthor3}
                  style={form.authorFooterStyle as "graphic" | "business" | "classic" | "none" | undefined}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Graphics Layout */}
      {layoutSubTab === "graphics" && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Pozycja i format zdjęcia głównego</p>
            <p className="text-xs text-muted-foreground mb-3">Wybierz jeden z wariantów ekspozycji grafiki: klasyczny, kwadratowy, panoramiczny, w tle albo bez zdjęcia.</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {GRAPHICS_LAYOUTS.map(gl => {
              const Icon = gl.icon;
              const isSelected = graphicsLayout === gl.value;
              return (
                <button
                  key={gl.value}
                  type="button"
                  onClick={() => setGraphicsLayout(gl.value)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{gl.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{gl.desc}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Responsive preview */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Podgląd responsywny</p>
            <div className="flex gap-2">
              {[
                { icon: Monitor, label: "Desktop", active: true },
                { icon: Tablet, label: "Tablet", active: false },
                { icon: Smartphone, label: "Mobile", active: false },
              ].map(({ icon: Icon, label, active }) => (
                <div key={label} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border ${active ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"}`}>
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                  <div className="w-full h-8 bg-muted/40 rounded flex items-center justify-center">
                    <span className="text-[9px] text-muted-foreground">
                      {active ? graphicsLayout : "auto"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Layout */}
      {layoutSubTab === "category" && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Szablon kategorii</p>
            <p className="text-xs text-muted-foreground mb-3">Tutaj budujesz sposób prezentacji kategorii, jej charakter, dodatki i styl dopasowany np. do gastronomii, medycznej albo miasta.</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CATEGORY_LAYOUTS.map(cl => {
              const Icon = cl.icon;
              const isSelected = categoryLayout === cl.value;
              return (
                <button
                  key={cl.value}
                  type="button"
                  onClick={() => setCategoryLayout(cl.value)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{cl.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{cl.desc}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Category color accent */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Kolor akcentu kategorii</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    cat.value === form.category ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Aktywna kategoria: <strong>{CATEGORIES.find(c => c.value === form.category)?.label ?? form.category}</strong></p>
          </div>
        </div>
      )}

      {/* Article Elements */}
      {layoutSubTab === "elements" && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Menedżer elementów artykułu</p>
            <p className="text-xs text-muted-foreground mb-3">To miejsce do zarządzania wszystkimi elementami artykułu. Możesz swobodnie zmieniać ich kolejność, włączać i wyłączać moduły, żeby mieć pełną kontrolę nad układem publikacji.</p>
          </div>
          <ArticleElementsManager
            elements={articleElements}
            onChange={setArticleElements}
          />
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Aktywne: {articleElements.filter(e => e.enabled).length} / {articleElements.length}
            </p>
            <button
              type="button"
              onClick={() => setArticleElements(DEFAULT_ARTICLE_ELEMENTS)}
              className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Przywróć domyślne
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
