import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CollapsibleSection from "@/components/admin/article-editor/helpers/CollapsibleSection";
import type { ArticleType } from "@/components/admin/article-editor/types/articleEditorTypes";

interface SourcesTabProps {
  form: ArticleType;
  set: (key: keyof ArticleType, value: any) => void;
  extraSources: { name: string; url: string }[];
  updateExtraSource: (i: number, key: "name" | "url", value: string) => void;
  addExtraSource: () => void;
  removeExtraSource: (i: number) => void;
}

export default function SourcesTab({ form, set, extraSources, updateExtraSource, addExtraSource, removeExtraSource }: SourcesTabProps) {
  return (
                  <div className="space-y-4">
                    <CollapsibleSection title="Główne źródło" defaultOpen={true}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs mb-1.5 block">Nazwa źródła</Label>
                          <Input value={form.sourceName ?? ""} onChange={e => set("sourceName", e.target.value)} placeholder="np. Urząd Miasta Bydgoszczy" className="h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1.5 block">URL źródła</Label>
                          <div className="flex gap-1">
                            <Input value={form.sourceUrl ?? ""} onChange={e => set("sourceUrl", e.target.value)} placeholder="https://..." className="h-9 text-sm flex-1" />
                            {form.sourceUrl && (
                              <a href={form.sourceUrl} target="_blank" rel="noreferrer" className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors flex-shrink-0">
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Dodatkowe źródła" defaultOpen={true} badge={extraSources.length > 0 ? String(extraSources.length) : undefined}>
                      <div className="space-y-2">
                        {extraSources.map((src, i) => (
                          <div key={i} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label className="text-xs mb-1 block">Nazwa</Label>
                              <Input value={src.name} onChange={e => updateExtraSource(i, "name", e.target.value)} placeholder="Nazwa źródła" className="h-8 text-sm" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs mb-1 block">URL</Label>
                              <Input value={src.url} onChange={e => updateExtraSource(i, "url", e.target.value)} placeholder="https://..." className="h-8 text-sm" />
                            </div>
                            <button type="button" onClick={() => removeExtraSource(i)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={addExtraSource}
                          className="w-full h-8 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Dodaj źródło
                        </button>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Źródła (tekst)" defaultOpen={false}>
                      <Textarea value={form.sources ?? ""} onChange={e => set("sources", e.target.value)} placeholder="Źródła informacji, skąd brano dane..." className="min-h-[70px] resize-none text-sm" />
                    </CollapsibleSection>

                    <CollapsibleSection title="Bibliografia" defaultOpen={false}>
                      <Textarea value={form.bibliography ?? ""} onChange={e => set("bibliography", e.target.value)} placeholder="Lista źródeł bibliograficznych..." className="min-h-[70px] resize-none text-sm" />
                    </CollapsibleSection>
                  </div>
  );
}
