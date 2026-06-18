import React from "react";
import type { ArticleContentBlock } from "@/components/admin/article-editor/types/articleEditorTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface BlockSettingsPanelProps {
  block: ArticleContentBlock;
  onChange: (updated: ArticleContentBlock) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

export default function BlockSettingsPanel({ block, onChange }: BlockSettingsPanelProps) {
  function patch(data: Partial<typeof block.data>) {
    onChange({ ...block, data: { ...block.data, ...data } } as ArticleContentBlock);
  }

  function patchSettings(settings: Partial<NonNullable<typeof block.settings>>) {
    onChange({ ...block, settings: { ...block.settings, ...settings } } as ArticleContentBlock);
  }

  const commonSettings = (
    <div className="space-y-3 border-t border-border pt-3 mt-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ustawienia bloku</p>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-foreground">Ukryj blok</Label>
        <Switch
          checked={block.settings?.hidden ?? false}
          onCheckedChange={(v) => patchSettings({ hidden: v })}
        />
      </div>
      <Field label="Szerokość">
        <Select value={block.settings?.width ?? "normal"} onValueChange={(v) => patchSettings({ width: v as "narrow" | "normal" | "wide" | "full" })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="narrow">Wąski</SelectItem>
            <SelectItem value="normal">Normalny</SelectItem>
            <SelectItem value="wide">Szeroki</SelectItem>
            <SelectItem value="full">Pełna szerokość</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );

  switch (block.type) {
    case "paragraph":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Paragraf</p>
          <p className="text-xs text-muted-foreground">Edytuj treść bezpośrednio w edytorze tekstu w bloku.</p>
          {commonSettings}
        </div>
      );

    case "heading":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nagłówek</p>
          <Field label="Tekst">
            <Input
              value={block.data.text}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Treść nagłówka..."
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Poziom">
            <Select value={String(block.data.level)} onValueChange={(v) => patch({ level: Number(v) as 2 | 3 | 4 })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">H2 — Śródtytuł główny</SelectItem>
                <SelectItem value="3">H3 — Śródtytuł sekcji</SelectItem>
                <SelectItem value="4">H4 — Śródtytuł mały</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {commonSettings}
        </div>
      );

    case "lead":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lead / Intro</p>
          <Field label="Tekst leadu">
            <Textarea
              value={block.data.text}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Wyróżnione otwarcie artykułu..."
              className="min-h-[80px] text-sm resize-none"
            />
          </Field>
          {commonSettings}
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cytat</p>
          <Field label="Treść cytatu">
            <Textarea
              value={block.data.text}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Treść cytatu..."
              className="min-h-[80px] text-sm resize-none"
            />
          </Field>
          <Field label="Autor">
            <Input value={block.data.author ?? ""} onChange={(e) => patch({ author: e.target.value })} placeholder="Imię i nazwisko..." className="h-8 text-sm" />
          </Field>
          <Field label="Źródło">
            <Input value={block.data.source ?? ""} onChange={(e) => patch({ source: e.target.value })} placeholder="Źródło cytatu..." className="h-8 text-sm" />
          </Field>
          {commonSettings}
        </div>
      );

    case "pullquote":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pull Quote</p>
          <Field label="Treść">
            <Textarea
              value={block.data.text}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Duży cytat przyciągający uwagę..."
              className="min-h-[80px] text-sm resize-none"
            />
          </Field>
          <Field label="Autor">
            <Input value={block.data.author ?? ""} onChange={(e) => patch({ author: e.target.value })} placeholder="Autor..." className="h-8 text-sm" />
          </Field>
          {commonSettings}
        </div>
      );

    case "image":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Obraz</p>
          <Field label="URL zdjęcia">
            <Input value={block.data.src} onChange={(e) => patch({ src: e.target.value })} placeholder="https://..." className="h-8 text-sm" />
          </Field>
          <Field label="Alt (SEO)">
            <Input value={block.data.alt ?? ""} onChange={(e) => patch({ alt: e.target.value })} placeholder="Opis zdjęcia..." className="h-8 text-sm" />
          </Field>
          <Field label="Podpis">
            <Input value={block.data.caption ?? ""} onChange={(e) => patch({ caption: e.target.value })} placeholder="Podpis pod zdjęciem..." className="h-8 text-sm" />
          </Field>
          <Field label="Autor zdjęcia">
            <Input value={block.data.credit ?? ""} onChange={(e) => patch({ credit: e.target.value })} placeholder="fot. Jan Kowalski" className="h-8 text-sm" />
          </Field>
          <Field label="Źródło">
            <Input value={block.data.source ?? ""} onChange={(e) => patch({ source: e.target.value })} placeholder="Źródło zdjęcia..." className="h-8 text-sm" />
          </Field>
          {commonSettings}
        </div>
      );

    case "embed_video":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Wideo</p>
          <Field label="URL wideo (YouTube/Vimeo)">
            <Input value={block.data.url} onChange={(e) => patch({ url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="h-8 text-sm" />
          </Field>
          <Field label="Podpis">
            <Input value={block.data.caption ?? ""} onChange={(e) => patch({ caption: e.target.value })} placeholder="Podpis pod wideo..." className="h-8 text-sm" />
          </Field>
          {commonSettings}
        </div>
      );

    case "social_embed":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Social Embed</p>
          <Field label="URL posta">
            <Input value={block.data.url} onChange={(e) => patch({ url: e.target.value })} placeholder="https://facebook.com/..." className="h-8 text-sm" />
          </Field>
          <Field label="Platforma">
            <Select value={block.data.platform ?? "other"} onValueChange={(v) => patch({ platform: v as "facebook" | "instagram" | "twitter" | "youtube" | "other" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">X / Twitter</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="other">Inne</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {commonSettings}
        </div>
      );

    case "info_box":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Info Box</p>
          <Field label="Tytuł (opcjonalny)">
            <Input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł ramki..." className="h-8 text-sm" />
          </Field>
          <Field label="Treść">
            <Textarea value={block.data.content} onChange={(e) => patch({ content: e.target.value })} placeholder="Treść ramki informacyjnej..." className="min-h-[80px] text-sm resize-none" />
          </Field>
          <Field label="Wariant">
            <Select value={block.data.variant ?? "info"} onValueChange={(v) => patch({ variant: v as "info" | "tip" | "warning" | "success" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informacja</SelectItem>
                <SelectItem value="tip">Wskazówka</SelectItem>
                <SelectItem value="warning">Ostrzeżenie</SelectItem>
                <SelectItem value="success">Sukces</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {commonSettings}
        </div>
      );

    case "alert":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alert</p>
          <Field label="Tytuł (opcjonalny)">
            <Input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł alertu..." className="h-8 text-sm" />
          </Field>
          <Field label="Treść">
            <Textarea value={block.data.content} onChange={(e) => patch({ content: e.target.value })} placeholder="Treść alertu..." className="min-h-[80px] text-sm resize-none" />
          </Field>
          <Field label="Wariant">
            <Select value={block.data.variant ?? "warning"} onValueChange={(v) => patch({ variant: v as "warning" | "danger" | "info" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Ostrzeżenie</SelectItem>
                <SelectItem value="danger">Niebezpieczeństwo</SelectItem>
                <SelectItem value="info">Informacja</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {commonSettings}
        </div>
      );

    case "key_points":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kluczowe punkty</p>
          <Field label="Tytuł">
            <Input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Kluczowe informacje..." className="h-8 text-sm" />
          </Field>
          <Field label="Punkty">
            <div className="space-y-2">
              {block.data.points.map((point, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={point}
                    onChange={(e) => {
                      const pts = [...block.data.points];
                      pts[i] = e.target.value;
                      patch({ points: pts });
                    }}
                    placeholder={`Punkt ${i + 1}...`}
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => patch({ points: block.data.points.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => patch({ points: [...block.data.points, ""] })}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Dodaj punkt
              </Button>
            </div>
          </Field>
          {commonSettings}
        </div>
      );

    case "expertquote":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cytat eksperta</p>
          <Field label="Treść cytatu">
            <Textarea value={block.data.text} onChange={(e) => patch({ text: e.target.value })} placeholder="Treść cytatu..." className="min-h-[80px] text-sm resize-none" />
          </Field>
          <Field label="Imię i nazwisko">
            <Input value={block.data.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Jan Kowalski" className="h-8 text-sm" />
          </Field>
          <Field label="Rola / stanowisko">
            <Input value={block.data.role ?? ""} onChange={(e) => patch({ role: e.target.value })} placeholder="Ekspert ds. ..." className="h-8 text-sm" />
          </Field>
          <Field label="URL zdjęcia">
            <Input value={block.data.imageUrl ?? ""} onChange={(e) => patch({ imageUrl: e.target.value })} placeholder="https://..." className="h-8 text-sm" />
          </Field>
          {commonSettings}
        </div>
      );

    case "faq":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">FAQ</p>
          <Field label="Tytuł">
            <Input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Często zadawane pytania..." className="h-8 text-sm" />
          </Field>
          <Field label="Pytania i odpowiedzi">
            <div className="space-y-3">
              {block.data.items.map((item, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => patch({ items: block.data.items.filter((_, j) => j !== i) })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    value={item.question}
                    onChange={(e) => {
                      const items = [...block.data.items];
                      items[i] = { ...items[i], question: e.target.value };
                      patch({ items });
                    }}
                    placeholder="Pytanie..."
                    className="h-8 text-sm"
                  />
                  <Textarea
                    value={item.answer}
                    onChange={(e) => {
                      const items = [...block.data.items];
                      items[i] = { ...items[i], answer: e.target.value };
                      patch({ items });
                    }}
                    placeholder="Odpowiedź..."
                    className="min-h-[60px] text-sm resize-none"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => patch({ items: [...block.data.items, { question: "", answer: "" }] })}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Dodaj pytanie
              </Button>
            </div>
          </Field>
          {commonSettings}
        </div>
      );

    case "pros_cons":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Plusy i minusy</p>
          <Field label="Plusy">
            <div className="space-y-2">
              {block.data.pros.map((pro, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={pro} onChange={(e) => { const p = [...block.data.pros]; p[i] = e.target.value; patch({ pros: p }); }} placeholder={`Plus ${i + 1}...`} className="h-8 text-sm flex-1" />
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => patch({ pros: block.data.pros.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={() => patch({ pros: [...block.data.pros, ""] })}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Dodaj plus
              </Button>
            </div>
          </Field>
          <Field label="Minusy">
            <div className="space-y-2">
              {block.data.cons.map((con, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={con} onChange={(e) => { const c = [...block.data.cons]; c[i] = e.target.value; patch({ cons: c }); }} placeholder={`Minus ${i + 1}...`} className="h-8 text-sm flex-1" />
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => patch({ cons: block.data.cons.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={() => patch({ cons: [...block.data.cons, ""] })}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Dodaj minus
              </Button>
            </div>
          </Field>
          {commonSettings}
        </div>
      );

    case "stats_grid":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Siatka statystyk</p>
          <Field label="Tytuł">
            <Input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł sekcji..." className="h-8 text-sm" />
          </Field>
          <Field label="Statystyki">
            <div className="space-y-2">
              {block.data.stats.map((stat, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Stat #{i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => patch({ stats: block.data.stats.filter((_, j) => j !== i) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input value={stat.value} onChange={(e) => { const s = [...block.data.stats]; s[i] = { ...s[i], value: e.target.value }; patch({ stats: s }); }} placeholder="Wartość (np. 42%)" className="h-8 text-sm" />
                  <Input value={stat.label} onChange={(e) => { const s = [...block.data.stats]; s[i] = { ...s[i], label: e.target.value }; patch({ stats: s }); }} placeholder="Etykieta..." className="h-8 text-sm" />
                  <Input value={stat.note ?? ""} onChange={(e) => { const s = [...block.data.stats]; s[i] = { ...s[i], note: e.target.value }; patch({ stats: s }); }} placeholder="Notatka (opcjonalnie)..." className="h-8 text-sm" />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={() => patch({ stats: [...block.data.stats, { label: "", value: "" }] })}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Dodaj statystykę
              </Button>
            </div>
          </Field>
          {commonSettings}
        </div>
      );

    case "cta":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CTA</p>
          <Field label="Tytuł">
            <Input value={block.data.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł CTA..." className="h-8 text-sm" />
          </Field>
          <Field label="Opis">
            <Textarea value={block.data.description ?? ""} onChange={(e) => patch({ description: e.target.value })} placeholder="Opis..." className="min-h-[60px] text-sm resize-none" />
          </Field>
          <Field label="Tekst przycisku">
            <Input value={block.data.buttonLabel} onChange={(e) => patch({ buttonLabel: e.target.value })} placeholder="Kliknij tutaj" className="h-8 text-sm" />
          </Field>
          <Field label="URL przycisku">
            <Input value={block.data.buttonUrl} onChange={(e) => patch({ buttonUrl: e.target.value })} placeholder="https://..." className="h-8 text-sm" />
          </Field>
          {commonSettings}
        </div>
      );

    case "separator":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Separator</p>
          <Field label="Styl">
            <Select value={block.data.style ?? "line"} onValueChange={(v) => patch({ style: v as "line" | "dots" | "stars" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Linia</SelectItem>
                <SelectItem value="dots">Kropki</SelectItem>
                <SelectItem value="stars">Gwiazdki</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {commonSettings}
        </div>
      );

    case "code":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Blok kodu</p>
          <Field label="Język">
            <Input value={block.data.language ?? ""} onChange={(e) => patch({ language: e.target.value })} placeholder="javascript, python, html..." className="h-8 text-sm" />
          </Field>
          <Field label="Kod">
            <Textarea value={block.data.code} onChange={(e) => patch({ code: e.target.value })} placeholder="// Wklej kod..." className="min-h-[120px] text-sm resize-none font-mono" />
          </Field>
          <Field label="Podpis">
            <Input value={block.data.caption ?? ""} onChange={(e) => patch({ caption: e.target.value })} placeholder="Opis kodu..." className="h-8 text-sm" />
          </Field>
          {commonSettings}
        </div>
      );

    case "timeline":
      return (
        <div className="space-y-3 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Oś czasu</p>
          <Field label="Tytuł">
            <Input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł osi czasu..." className="h-8 text-sm" />
          </Field>
          <Field label="Zdarzenia">
            <div className="space-y-2">
              {block.data.items.map((item, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => patch({ items: block.data.items.filter((_, j) => j !== i) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input value={item.date} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], date: e.target.value }; patch({ items }); }} placeholder="Data (np. 12.03.2024)" className="h-8 text-sm" />
                  <Input value={item.title} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], title: e.target.value }; patch({ items }); }} placeholder="Tytuł zdarzenia..." className="h-8 text-sm" />
                  <Textarea value={item.description ?? ""} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], description: e.target.value }; patch({ items }); }} placeholder="Opis (opcjonalnie)..." className="min-h-[50px] text-sm resize-none" />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={() => patch({ items: [...block.data.items, { date: "", title: "" }] })}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Dodaj zdarzenie
              </Button>
            </div>
          </Field>
          {commonSettings}
        </div>
      );

    default:
      return (
        <div className="p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ustawienia bloku</p>
          <p className="text-xs text-muted-foreground">Brak dodatkowych ustawień dla tego bloku.</p>
          {commonSettings}
        </div>
      );
  }
}
