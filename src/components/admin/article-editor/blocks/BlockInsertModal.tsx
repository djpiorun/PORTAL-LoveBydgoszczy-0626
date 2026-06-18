import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Info, AlertTriangle, BookmarkPlus, MousePointerClick, BookOpen, Quote, ThumbsUp, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type BlockInsertConfig = {
  type: string;
  onInsert: (html: string) => void;
  onClose: () => void;
};

// --- Quote ---
const QUOTE_VARIANTS = [
  { value: "standard", label: "Standardowy", cssClass: "article-pullquote", desc: "Cytat wyróżniony w tekście" },
  { value: "large", label: "Duży", cssClass: "article-pullquote article-pullquote--large", desc: "Duży cytat otwierający sekcję" },
];

function QuoteForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [variant, setVariant] = useState("standard");
  const [text, setText] = useState("Wpisz tutaj mocny cytat, który buduje narrację tekstu.");

  const v = QUOTE_VARIANTS.find(x => x.value === variant)!;

  const handleInsert = () => {
    const html = `<blockquote class="${v.cssClass}"><p>${text}</p></blockquote>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Wariant</Label>
        <div className="flex gap-1.5">
          {QUOTE_VARIANTS.map(v => (
            <button key={v.value} type="button" onClick={() => setVariant(v.value)}
              className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${variant === v.value ? "bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 ring-2 ring-primary/20" : "border-border hover:bg-muted"}`}
            >
              <div className="font-semibold">{v.label}</div>
              <div className="text-muted-foreground text-[10px] mt-0.5">{v.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Treść cytatu</Label>
        <Textarea value={text} onChange={e => setText(e.target.value)} className="text-sm min-h-[80px] resize-none" placeholder="Treść cytatu..." />
      </div>
      {/* Preview */}
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Podgląd</p>
        <blockquote className={`text-sm italic font-medium pl-3 border-l-2 border-primary/40 text-foreground/80`}>
          {text || "Treść cytatu..."}
        </blockquote>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={!text.trim()}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- Info Box ---
const INFO_BOX_VARIANTS = [
  { value: "neutral", label: "Neutralna", color: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", icon: "ℹ", iconColor: "text-blue-600", cssClass: "article-info-box" },
  { value: "important", label: "Ważne", color: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", icon: "★", iconColor: "text-amber-600", cssClass: "article-info-box article-info-box--important" },
  { value: "warning", label: "Ostrzeżenie", color: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", icon: "⚠", iconColor: "text-orange-600", cssClass: "article-info-box article-info-box--warning" },
  { value: "success", label: "Pozytywna", color: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800", icon: "✓", iconColor: "text-green-600", cssClass: "article-info-box article-info-box--success" },
];

function InfoBoxForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [variant, setVariant] = useState("neutral");
  const [title, setTitle] = useState("Co warto wiedzieć?");
  const [content, setContent] = useState("Krótki kontekst, definicja pojęcia albo doprecyzowanie dla czytelnika.");

  const v = INFO_BOX_VARIANTS.find(x => x.value === variant)!;

  const handleInsert = () => {
    const html = `<aside class="${v.cssClass}"><h3>${title}</h3><p>${content}</p></aside>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Wariant</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {INFO_BOX_VARIANTS.map(v => (
            <button key={v.value} type="button" onClick={() => setVariant(v.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${variant === v.value ? `${v.color} ring-2 ring-primary/30` : "border-border hover:bg-muted"}`}
            >
              <span className={`text-base ${v.iconColor}`}>{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tytuł ramki</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Treść</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} className="text-sm min-h-[80px] resize-none" />
      </div>
      {/* Preview */}
      <div className={`rounded-lg border p-3 text-sm ${v.color}`}>
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Podgląd</p>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${v.iconColor}`}>{v.icon} {title}</p>
        <p className="text-xs text-foreground/80">{content}</p>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={!title.trim() || !content.trim()}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- Alert ---
const ALERT_VARIANTS = [
  { value: "warning", label: "Ostrzeżenie", cssClass: "article-alert article-alert--warning", icon: "⚠", color: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", textColor: "text-orange-700 dark:text-orange-400" },
  { value: "info", label: "Informacja", cssClass: "article-alert article-alert--info", icon: "ℹ", color: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", textColor: "text-blue-700 dark:text-blue-400" },
  { value: "error", label: "Błąd / Krytyczne", cssClass: "article-alert article-alert--error", icon: "✕", color: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800", textColor: "text-red-700 dark:text-red-400" },
  { value: "success", label: "Sukces / Pozytywne", cssClass: "article-alert article-alert--success", icon: "✓", color: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800", textColor: "text-green-700 dark:text-green-400" },
];

function AlertForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [variant, setVariant] = useState("warning");
  const [title, setTitle] = useState("Ważne");
  const [content, setContent] = useState("Wpisz tutaj ostrzeżenie, ważną informację lub komunikat wymagający szczególnej uwagi czytelnika.");

  const v = ALERT_VARIANTS.find(x => x.value === variant)!;

  const handleInsert = () => {
    const html = `<aside class="${v.cssClass}"><strong>${title}</strong><p>${content}</p></aside>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Typ alertu</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {ALERT_VARIANTS.map(v => (
            <button key={v.value} type="button" onClick={() => setVariant(v.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${variant === v.value ? `${v.color} ring-2 ring-primary/30` : "border-border hover:bg-muted"}`}
            >
              <span className="text-base">{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nagłówek alertu</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Treść</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} className="text-sm min-h-[80px] resize-none" />
      </div>
      {/* Preview */}
      <div className={`rounded-lg border p-3 ${v.color}`}>
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Podgląd</p>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${v.textColor}`}>{v.icon} {title}</p>
        <p className="text-xs text-foreground/80">{content}</p>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={!title.trim() || !content.trim()}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- Expert Quote ---
const EXPERTQUOTE_VARIANTS = [
  { value: "simple", label: "Prosty", cssClass: "article-expert-quote", desc: "Tylko treść cytatu" },
  { value: "signed", label: "Z podpisem", cssClass: "article-expert-quote article-expert-quote--signed", desc: "Cytat + autor + funkcja" },
  { value: "premium", label: "Premium", cssClass: "article-expert-quote article-expert-quote--premium", desc: "Wyróżniony, z ramką" },
];

function ExpertQuoteForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [variant, setVariant] = useState("signed");
  const [quote, setQuote] = useState("Wpisz tutaj ekspercki komentarz lub cytat, który wnosi kontekst do materiału.");
  const [author, setAuthor] = useState("Imię i nazwisko");
  const [role, setRole] = useState("Funkcja / instytucja");

  const handleInsert = () => {
    const v = EXPERTQUOTE_VARIANTS.find(x => x.value === variant)!;
    const citeHtml = (variant === "signed" || variant === "premium") && author.trim()
      ? `<cite>${author.trim()}${role.trim() ? `, ${role.trim()}` : ""}</cite>`
      : "";
    const html = `<blockquote class="${v.cssClass}"><p>„${quote}"</p>${citeHtml}</blockquote>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Wariant</Label>
        <div className="flex gap-1.5">
          {EXPERTQUOTE_VARIANTS.map(v => (
            <button key={v.value} type="button" onClick={() => setVariant(v.value)}
              className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${variant === v.value ? "bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 ring-2 ring-primary/20" : "border-border hover:bg-muted"}`}
            >
              <div className="font-semibold">{v.label}</div>
              <div className="text-muted-foreground text-[10px] mt-0.5">{v.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Treść cytatu</Label>
        <Textarea value={quote} onChange={e => setQuote(e.target.value)} className="text-sm min-h-[80px] resize-none" placeholder="Treść cytatu..." />
      </div>
      {(variant === "signed" || variant === "premium") && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Autor</Label>
            <Input value={author} onChange={e => setAuthor(e.target.value)} className="h-8 text-sm" placeholder="Imię i nazwisko" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Funkcja</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} className="h-8 text-sm" placeholder="np. Prezydent Bydgoszczy" />
          </div>
        </div>
      )}
      {/* Preview */}
      <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3 border-l-4 border-l-teal-500">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Podgląd</p>
        <p className="text-sm italic text-foreground/80">„{quote || "Treść cytatu..."}"</p>
        {(variant === "signed" || variant === "premium") && author && (
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-1.5">— {author}{role ? `, ${role}` : ""}</p>
        )}
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={!quote.trim()}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- Key Points ---
function KeyPointsForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState("Najważniejsze punkty");
  const [points, setPoints] = useState(["Najważniejsza informacja dla mieszkańców", "Druga najważniejsza rzecz w skrócie", "Trzeci punkt do zapamiętania"]);

  const addPoint = () => setPoints(p => [...p, ""]);
  const removePoint = (i: number) => setPoints(p => p.filter((_, idx) => idx !== i));
  const updatePoint = (i: number, v: string) => setPoints(p => p.map((x, idx) => idx === i ? v : x));

  const handleInsert = () => {
    const items = points.filter(p => p.trim()).map(p => `<li>${p}</li>`).join("");
    const html = `<section class="article-key-points"><h3>${title}</h3><ul>${items}</ul></section>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tytuł sekcji</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Punkty ({points.filter(p => p.trim()).length})</Label>
        <div className="space-y-1.5">
          {points.map((point, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <span className="text-[10px] font-bold text-muted-foreground w-4 flex-shrink-0 text-center">{i + 1}</span>
              <Input value={point} onChange={e => updatePoint(i, e.target.value)} className="h-8 text-sm flex-1" placeholder={`Punkt ${i + 1}`} />
              {points.length > 1 && (
                <button type="button" onClick={() => removePoint(i)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addPoint} className="mt-2 text-xs text-primary hover:underline font-medium">+ Dodaj punkt</button>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={points.filter(p => p.trim()).length === 0}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- CTA ---
const CTA_VARIANTS = [
  { value: "box", label: "Box CTA", cssClass: "article-cta", desc: "Ramka z opisem i przyciskiem" },
  { value: "readmore", label: "Czytaj też", cssClass: "article-readmore", desc: "Link do powiązanego artykułu" },
];

function CtaForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [variant, setVariant] = useState("box");
  const [text, setText] = useState("Chcesz wiedzieć więcej? Śledź nasze relacje na bieżąco.");
  const [btnLabel, setBtnLabel] = useState("Czytaj więcej");
  const [url, setUrl] = useState("#");

  const handleInsert = () => {
    let html = "";
    if (variant === "box") {
      html = `<div class="article-cta"><p>${text}</p><a href="${url}" class="article-cta-btn">${btnLabel}</a></div>`;
    } else {
      html = `<div class="article-readmore"><span class="readmore-label">Czytaj też</span><a href="${url}">${text}</a></div>`;
    }
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Typ</Label>
        <div className="flex gap-1.5">
          {CTA_VARIANTS.map(v => (
            <button key={v.value} type="button" onClick={() => setVariant(v.value)}
              className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${variant === v.value ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20" : "border-border hover:bg-muted"}`}
            >
              <div className="font-semibold">{v.label}</div>
              <div className="text-muted-foreground text-[10px] mt-0.5">{v.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
          {variant === "box" ? "Tekst opisu" : "Tytuł artykułu / opis linku"}
        </Label>
        <Input value={text} onChange={e => setText(e.target.value)} className="h-8 text-sm" />
      </div>
      {variant === "box" && (
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Etykieta przycisku</Label>
          <Input value={btnLabel} onChange={e => setBtnLabel(e.target.value)} className="h-8 text-sm" />
        </div>
      )}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">URL linku</Label>
        <Input value={url} onChange={e => setUrl(e.target.value)} className="h-8 text-sm" placeholder="https://..." />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={!text.trim()}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- FAQ ---
function FaqForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [items, setItems] = useState([
    { q: "Pytanie pierwsze — co się stało?", a: "Odpowiedź na pierwsze pytanie z kontekstem i wyjaśnieniem dla czytelnika." },
    { q: "Pytanie drugie — co to oznacza?", a: "Odpowiedź na drugie pytanie z konkretnymi informacjami." },
  ]);

  const addItem = () => setItems(p => [...p, { q: "", a: "" }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: "q" | "a", v: string) => setItems(p => p.map((x, idx) => idx === i ? { ...x, [field]: v } : x));

  const handleInsert = () => {
    const itemsHtml = items.filter(x => x.q.trim()).map(x => `<div class="faq-item"><strong>${x.q}</strong><p>${x.a}</p></div>`).join("");
    const html = `<section class="article-faq">${itemsHtml}</section>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border p-3 space-y-2 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Pytanie {i + 1}</span>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <Input value={item.q} onChange={e => updateItem(i, "q", e.target.value)} className="h-8 text-sm" placeholder="Pytanie..." />
            <Textarea value={item.a} onChange={e => updateItem(i, "a", e.target.value)} className="text-sm min-h-[60px] resize-none" placeholder="Odpowiedź..." />
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} className="text-xs text-primary hover:underline font-medium">+ Dodaj pytanie</button>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={items.filter(x => x.q.trim()).length === 0}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- Pros & Cons ---
function ProsConsForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [pros, setPros] = useState(["Pierwszy pozytywny aspekt", "Drugi pozytywny aspekt"]);
  const [cons, setCons] = useState(["Pierwszy negatywny aspekt", "Drugi negatywny aspekt"]);

  const addPro = () => setPros(p => [...p, ""]);
  const addCon = () => setCons(p => [...p, ""]);
  const removePro = (i: number) => setPros(p => p.filter((_, idx) => idx !== i));
  const removeCon = (i: number) => setCons(p => p.filter((_, idx) => idx !== i));
  const updatePro = (i: number, v: string) => setPros(p => p.map((x, idx) => idx === i ? v : x));
  const updateCon = (i: number, v: string) => setCons(p => p.map((x, idx) => idx === i ? v : x));

  const handleInsert = () => {
    const prosItems = pros.filter(p => p.trim()).map(p => `<li>${p}</li>`).join("");
    const consItems = cons.filter(c => c.trim()).map(c => `<li>${c}</li>`).join("");
    const html = `<section class="article-pros-cons"><div class="pros-col"><strong>Plusy</strong><ul>${prosItems}</ul></div><div class="cons-col"><strong>Minusy</strong><ul>${consItems}</ul></div></section>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2 block">✓ Plusy</Label>
          <div className="space-y-1.5">
            {pros.map((p, i) => (
              <div key={i} className="flex gap-1">
                <Input value={p} onChange={e => updatePro(i, e.target.value)} className="h-7 text-xs flex-1" placeholder={`Plus ${i + 1}`} />
                {pros.length > 1 && (
                  <button type="button" onClick={() => removePro(i)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors flex-shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addPro} className="text-[10px] text-green-600 hover:underline font-medium">+ Dodaj plus</button>
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2 block">✗ Minusy</Label>
          <div className="space-y-1.5">
            {cons.map((c, i) => (
              <div key={i} className="flex gap-1">
                <Input value={c} onChange={e => updateCon(i, e.target.value)} className="h-7 text-xs flex-1" placeholder={`Minus ${i + 1}`} />
                {cons.length > 1 && (
                  <button type="button" onClick={() => removeCon(i)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors flex-shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addCon} className="text-[10px] text-red-600 hover:underline font-medium">+ Dodaj minus</button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={pros.filter(p => p.trim()).length === 0 && cons.filter(c => c.trim()).length === 0}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- Context Box ---
function ContextBoxForm({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState("Kontekst");
  const [content, setContent] = useState("Tło wydarzeń, historia sprawy lub wyjaśnienie dla czytelnika, który nie śledził tematu wcześniej.");

  const handleInsert = () => {
    const html = `<aside class="article-context-box"><h3>${title}</h3><p>${content}</p></aside>`;
    onInsert(html);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tytuł</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Treść kontekstu</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} className="text-sm min-h-[100px] resize-none" />
      </div>
      {/* Preview */}
      <div className="rounded-lg border border-l-4 border-l-muted-foreground bg-muted/30 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Podgląd</p>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">{title}</p>
        <p className="text-xs text-foreground/80">{content}</p>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Anuluj</Button>
        <Button type="button" size="sm" onClick={handleInsert} disabled={!content.trim()}>Wstaw blok</Button>
      </div>
    </div>
  );
}

// --- Block config map ---
const BLOCK_MODAL_CONFIG: Record<string, { title: string; icon: React.ComponentType<{ className?: string }>; form: React.ComponentType<{ onInsert: (html: string) => void; onClose: () => void }> }> = {
  quote: { title: "Cytat", icon: Quote, form: QuoteForm },
  pullquote_large: { title: "Cytat duży", icon: Quote, form: QuoteForm },
  info_box: { title: "Ramka informacyjna", icon: Info, form: InfoBoxForm },
  alert: { title: "Alert / Ostrzeżenie", icon: AlertTriangle, form: AlertForm },
  expertquote: { title: "Cytat eksperta", icon: MessageSquare, form: ExpertQuoteForm },
  key_points: { title: "Kluczowe punkty", icon: BookmarkPlus, form: KeyPointsForm },
  cta: { title: "CTA / Czytaj też", icon: MousePointerClick, form: CtaForm },
  readmore: { title: "Czytaj też", icon: BookOpen, form: CtaForm },
  faq: { title: "FAQ", icon: Info, form: FaqForm },
  pros_cons: { title: "Plusy i minusy", icon: ThumbsUp, form: ProsConsForm },
  context_box: { title: "Kontekst", icon: Layers, form: ContextBoxForm },
};

export const BLOCK_MODAL_TYPES = Object.keys(BLOCK_MODAL_CONFIG);

interface BlockInsertModalProps {
  blockType: string;
  onInsert: (html: string) => void;
  onClose: () => void;
}

export default function BlockInsertModal({ blockType, onInsert, onClose }: BlockInsertModalProps) {
  const config = BLOCK_MODAL_CONFIG[blockType];
  if (!config) return null;

  const Icon = config.icon;
  const Form = config.form;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/20">
            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm font-semibold">{config.title}</p>
            <button type="button" onClick={onClose} className="ml-auto p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 max-h-[85vh] overflow-y-auto">
            <Form onInsert={onInsert} onClose={onClose} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}