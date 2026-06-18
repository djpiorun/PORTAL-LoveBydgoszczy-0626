import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CollapsibleSection from "@/components/admin/article-editor/helpers/CollapsibleSection";
import { PollEditor } from "@/components/admin/article-editor/blocks/DomainEditors";
import { createDefaultPoll } from "@/components/admin/article-editor/helpers/articleDefaults";
import type { ArticleType } from "@/components/admin/article-editor/types/articleEditorTypes";

interface AdditionalTabProps {
  form: ArticleType;
  set: (key: keyof ArticleType, value: any) => void;
  isBydgoszczanieCategory: boolean;
  togglePublicationUpdates: () => void;
}

export default function AdditionalTab({ form, set, isBydgoszczanieCategory, togglePublicationUpdates }: AdditionalTabProps) {
  return (
                  <div className="grid grid-cols-1 gap-4">
                    <CollapsibleSection title="Ankieta" defaultOpen={true}>
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => set("poll", form.poll?.enabled ? { ...form.poll, enabled: false } : { ...(form.poll ?? createDefaultPoll()), enabled: true })}
                          className={`w-full justify-center ${form.poll?.enabled ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10" : ""}`}
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          {form.poll?.enabled ? "Ankieta: Włączona" : "Ankieta: Dodaj"}
                        </Button>

                        {(form.poll?.enabled || form.poll?.title) && form.poll && (
                          <PollEditor
                            poll={form.poll}
                            articleContent={form.content}
                            onChange={(next: any) => set("poll", next)}
                          />
                        )}
                      </div>
                    </CollapsibleSection>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <CollapsibleSection title="Aktualizacja publikacji" defaultOpen={true}>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={togglePublicationUpdates}
                          className={`w-full justify-center ${form.showUpdates ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10" : ""}`}
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          {form.showUpdates ? "Aktualizacje publikacji: Wyłącz" : "Aktualizacje publikacji: Włącz"}
                        </Button>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Partner / Sponsor" defaultOpen={true}>
                      <div className="space-y-3">
                        <div className="rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                          Karta partnera wyświetla się w górnej części artykułu po prawej stronie. Jeśli dodasz logo, ono zastąpi nazwę. Link prowadzi do strony partnera lub sponsora.
                        </div>
                        <Input value={form.partnerName ?? ""} onChange={e => set("partnerName", e.target.value)} placeholder="Nazwa partnera lub sponsora" className="h-8 text-sm" />
                        <div className="flex gap-1">
                          <Input value={form.partnerUrl ?? ""} onChange={e => set("partnerUrl", e.target.value)} placeholder="URL partnera / sponsora" className="h-8 text-sm flex-1" />
                          {form.partnerUrl && (
                            <a href={form.partnerUrl} target="_blank" rel="noreferrer" className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors flex-shrink-0">
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                        <Input value={form.partnerLogoUrl ?? ""} onChange={e => set("partnerLogoUrl", e.target.value)} placeholder="URL logo partnera" className="h-8 text-sm" />
                        <Input value={form.partnerLabel ?? ""} onChange={e => set("partnerLabel", e.target.value)} placeholder="Etykieta nad kartą, np. Partner artykułu" className="h-8 text-sm" />
                        {(form.partnerName || form.partnerLogoUrl || form.partnerLabel) && (
                          <div className="rounded-[18px] border border-border bg-background p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                              {form.partnerLabel || "Partner / Sponsor artykułu"}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              {form.partnerLogoUrl ? (
                                <img src={form.partnerLogoUrl} alt={form.partnerName || "Partner"} className="max-h-10 max-w-[120px] object-contain" />
                              ) : (
                                <p className="text-sm font-bold text-foreground">{form.partnerName || "Nazwa partnera"}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleSection>

                    {!isBydgoszczanieCategory && (
                      <CollapsibleSection title="Osoba / Bohater artykułu" defaultOpen={true}>
                        <Input value={form.personName ?? ""} onChange={e => set("personName", e.target.value)} placeholder="Imię i nazwisko osoby" className="h-8 text-sm" />
                        <p className="text-xs text-muted-foreground mt-1">Wyświetlane w artykułach kategorii Bydgoszczanie</p>
                      </CollapsibleSection>
                    )}

                  </div>
                  </div>
  );
}
