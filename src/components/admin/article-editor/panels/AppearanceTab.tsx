import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "@/components/admin/article-editor/helpers/CollapsibleSection";
import AuthorFooterCard from "@/components/AuthorFooterCard";
import type { ArticleType } from "@/components/admin/article-editor/types/articleEditorTypes";

interface AppearanceTabProps {
  form: ArticleType;
  set: (key: keyof ArticleType, value: any) => void;
}

export default function AppearanceTab({ form, set }: AppearanceTabProps) {
  return (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <CollapsibleSection title="Tożsamość wizualna artykułu" defaultOpen={true}>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label className="text-xs mb-1.5 block">Styl stopki autora</Label>
                          <div className="grid gap-2">
                            {[
                              { value: "graphic", label: "Stopka autora", desc: "Nowoczesna karta pod artykułem" },
                              { value: "business", label: "Wizytówkowa", desc: "Formalny układ ekspercki" },
                              { value: "classic", label: "Klasyczna", desc: "Mocniejsza, editorialowa stopka" },
                              { value: "none", label: "Bez stopki", desc: "Ukryj moduł autora" },
                            ].map(opt => {
                              const isSelected = (form.authorFooterStyle ?? "graphic") === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => set("authorFooterStyle", opt.value)}
                                  className={`rounded-xl border p-3 text-left transition-all ${
                                    isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30 hover:bg-muted/20"
                                  }`}
                                >
                                  <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                                  <p className="mt-1 text-[11px] text-muted-foreground">{opt.desc}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs mb-1.5 block">Informacja w stopce</Label>
                          <Textarea value={form.footerInfo ?? ""} onChange={e => set("footerInfo", e.target.value)} placeholder="Dodatkowe informacje w stopce artykułu..." className="min-h-[170px] resize-none text-sm" />
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Podgląd stopki autora" defaultOpen={true}>
                      {form.author && (form.authorFooterStyle ?? "graphic") !== "none" ? (
                        <div className="pointer-events-none opacity-95">
                          <AuthorFooterCard
                            authorName={form.author}
                            coauthorName={form.coauthor}
                            coauthor2={form.coauthor2}
                            coauthor3={form.coauthor3}
                            style={form.authorFooterStyle as "graphic" | "business" | "classic" | "none" | undefined}
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-xs text-muted-foreground">
                          Dodaj autora i wybierz styl, aby zobaczyć podgląd stopki.
                        </div>
                      )}
                    </CollapsibleSection>
                  </div>
  );
}
