import React from "react";
import type { ArticleContentBlock } from "@/components/admin/article-editor/types/articleEditorTypes";
import {
  Info, AlertTriangle, CheckCircle, Quote, Star, ChevronDown, ChevronUp,
  Image as ImageIcon, Video, Music, MapPin, Share2, BookOpen, ArrowRight,
  CheckSquare, XSquare, Clock, User, BarChart3, Mail, Radio, Code2,
} from "lucide-react";

interface BlockRendererProps {
  block: ArticleContentBlock;
  isSelected?: boolean;
}

export default function BlockRenderer({ block, isSelected: _isSelected }: BlockRendererProps) {
  switch (block.type) {
    case "paragraph":
      return (
        <div
          className="article-content prose prose-sm max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.data.html || '<p class="text-muted-foreground italic">Pusty paragraf...</p>' }}
        />
      );

    case "heading": {
      const Tag = `h${block.data.level}` as "h2" | "h3" | "h4";
      const sizeClass = block.data.level === 2
        ? "text-2xl font-bold"
        : block.data.level === 3
          ? "text-xl font-semibold"
          : "text-lg font-semibold";
      return (
        <Tag className={`${sizeClass} text-foreground leading-tight`}>
          {block.data.text || <span className="text-muted-foreground italic font-normal">Nagłówek H{block.data.level}...</span>}
        </Tag>
      );
    }

    case "lead":
      return (
        <p className="text-xl font-medium leading-relaxed text-foreground/90 border-l-4 border-primary pl-4">
          {block.data.text || <span className="text-muted-foreground italic font-normal">Lead artykułu...</span>}
        </p>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-primary/60 pl-5 py-2 my-2">
          <p className="text-lg italic text-foreground/90 leading-relaxed">
            {block.data.text || <span className="text-muted-foreground">Treść cytatu...</span>}
          </p>
          {block.data.author && (
            <footer className="mt-2 text-sm text-muted-foreground font-medium">— {block.data.author}</footer>
          )}
        </blockquote>
      );

    case "pullquote":
      return (
        <div className="my-4 rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center">
          <Quote className="h-8 w-8 text-primary/40 mx-auto mb-3" />
          <p className="text-2xl font-semibold leading-snug text-foreground">
            {block.data.text || <span className="text-muted-foreground italic font-normal">Pull quote...</span>}
          </p>
          {block.data.author && (
            <p className="mt-3 text-sm text-muted-foreground">— {block.data.author}</p>
          )}
        </div>
      );

    case "image":
      return (
        <figure className="my-2">
          {block.data.src ? (
            <img
              src={block.data.src}
              alt={block.data.alt || ""}
              className="w-full rounded-xl object-cover"
              style={{ aspectRatio: "16/9" }}
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Dodaj zdjęcie</p>
              </div>
            </div>
          )}
          {(block.data.caption || block.data.credit) && (
            <figcaption className="mt-2 text-xs text-muted-foreground text-center">
              {block.data.caption}
              {block.data.credit && <span className="ml-2 opacity-70">fot. {block.data.credit}</span>}
            </figcaption>
          )}
        </figure>
      );

    case "gallery":
      return (
        <div className="my-2">
          {block.data.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {block.data.images.slice(0, 6).map((img, i) => (
                <img key={i} src={img.src} alt={img.alt || ""} className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div className="text-center">
                <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground/50" />
                <p className="mt-1 text-xs text-muted-foreground">Galeria zdjęć</p>
              </div>
            </div>
          )}
        </div>
      );

    case "embed_video":
      return (
        <div className="my-2 overflow-hidden rounded-xl border border-border bg-muted/20">
          {block.data.url ? (
            <div className="aspect-video">
              <iframe
                src={block.data.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <Video className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Wklej URL wideo</p>
              </div>
            </div>
          )}
          {block.data.caption && <p className="px-4 py-2 text-xs text-muted-foreground">{block.data.caption}</p>}
        </div>
      );

    case "social_embed":
      return (
        <div className="my-2 flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <Share2 className="h-6 w-6 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Social embed</p>
            <p className="truncate text-xs text-muted-foreground">{block.data.url || "Wklej URL posta..."}</p>
          </div>
        </div>
      );

    case "audio":
      return (
        <div className="my-2 flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <Music className="h-6 w-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{block.data.title || "Audio"}</p>
            <p className="truncate text-xs text-muted-foreground">{block.data.url || "Wklej URL audio..."}</p>
          </div>
        </div>
      );

    case "map_embed":
      return (
        <div className="my-2 overflow-hidden rounded-xl border border-border">
          {block.data.url ? (
            <iframe src={block.data.url} className="h-64 w-full" />
          ) : (
            <div className="flex h-40 items-center justify-center bg-muted/20">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Wklej URL mapy</p>
              </div>
            </div>
          )}
        </div>
      );

    case "info_box": {
      const variantStyles = {
        info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
        tip: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
        warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
        success: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
      };
      const iconStyles = {
        info: "text-blue-600 dark:text-blue-400",
        tip: "text-green-600 dark:text-green-400",
        warning: "text-amber-600 dark:text-amber-400",
        success: "text-emerald-600 dark:text-emerald-400",
      };
      const variant = block.data.variant ?? "info";
      return (
        <div className={`my-2 rounded-xl border p-4 ${variantStyles[variant]}`}>
          <div className="flex gap-3">
            <Info className={`mt-0.5 h-5 w-5 shrink-0 ${iconStyles[variant]}`} />
            <div>
              {block.data.title && <p className="mb-1 text-sm font-semibold text-foreground">{block.data.title}</p>}
              <p className="text-sm leading-relaxed text-foreground/80">{block.data.content || "Treść ramki informacyjnej..."}</p>
            </div>
          </div>
        </div>
      );
    }

    case "alert": {
      const alertStyles = {
        warning: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30",
        danger: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30",
        info: "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30",
      };
      const alertIconStyles = {
        warning: "text-amber-600",
        danger: "text-red-600",
        info: "text-blue-600",
      };
      const variant = block.data.variant ?? "warning";
      return (
        <div className={`my-2 rounded-xl border-2 p-4 ${alertStyles[variant]}`}>
          <div className="flex gap-3">
            <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${alertIconStyles[variant]}`} />
            <div>
              {block.data.title && <p className="mb-1 text-sm font-bold text-foreground">{block.data.title}</p>}
              <p className="text-sm leading-relaxed text-foreground/80">{block.data.content || "Treść alertu..."}</p>
            </div>
          </div>
        </div>
      );
    }

    case "key_points":
      return (
        <div className="my-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
          {block.data.title && <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">{block.data.title}</p>}
          <ul className="space-y-2">
            {block.data.points.filter(Boolean).map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{point}</span>
              </li>
            ))}
            {block.data.points.length === 0 && (
              <li className="text-sm text-muted-foreground italic">Dodaj kluczowe punkty...</li>
            )}
          </ul>
        </div>
      );

    case "expertquote":
      return (
        <div className="my-2 flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {block.data.imageUrl ? (
            <img src={block.data.imageUrl} alt={block.data.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <p className="text-base italic leading-relaxed text-foreground">
              "{block.data.text || "Treść cytatu eksperta..."}"
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{block.data.name || "Imię i nazwisko"}</p>
            {block.data.role && <p className="text-xs text-muted-foreground">{block.data.role}</p>}
          </div>
        </div>
      );

    case "context_box":
      return (
        <div className="my-2 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              {block.data.title && <p className="mb-1 text-sm font-semibold text-foreground">{block.data.title}</p>}
              <p className="text-sm leading-relaxed text-foreground/80">{block.data.content || "Kontekst artykułu..."}</p>
            </div>
          </div>
        </div>
      );

    case "fact_check": {
      const verdictConfig = {
        true: { label: "PRAWDA", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", icon: CheckSquare },
        false: { label: "FAŁSZ", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800", icon: XSquare },
        misleading: { label: "MYLĄCE", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", icon: AlertTriangle },
        unverified: { label: "NIEZWERYFIKOWANE", color: "text-muted-foreground", bg: "bg-muted/30 border-border", icon: Info },
      };
      const cfg = verdictConfig[block.data.verdict];
      const VerdictIcon = cfg.icon;
      return (
        <div className={`my-2 rounded-xl border p-4 ${cfg.bg}`}>
          <div className="flex items-start gap-3">
            <VerdictIcon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
              <p className="mt-1 text-sm font-medium text-foreground">{block.data.claim || "Twierdzenie do weryfikacji..."}</p>
              {block.data.explanation && <p className="mt-2 text-xs text-muted-foreground">{block.data.explanation}</p>}
            </div>
          </div>
        </div>
      );
    }

    case "faq":
      return (
        <div className="my-2 space-y-2">
          {block.data.title && <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{block.data.title}</p>}
          {block.data.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">{item.question || "Pytanie..."}</p>
              {item.answer && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>}
            </div>
          ))}
        </div>
      );

    case "pros_cons":
      return (
        <div className="my-2 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Plusy</p>
            <ul className="space-y-1.5">
              {block.data.pros.filter(Boolean).map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">Minusy</p>
            <ul className="space-y-1.5">
              {block.data.cons.filter(Boolean).map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <XSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="my-2">
          {block.data.title && <p className="mb-3 text-sm font-bold text-foreground">{block.data.title}</p>}
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-2 top-0 h-full w-px bg-border" />
            {block.data.items.map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <p className="text-xs font-semibold text-primary">{item.date || "Data"}</p>
                <p className="text-sm font-medium text-foreground">{item.title || "Wydarzenie..."}</p>
                {item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case "sources_list":
      return (
        <div className="my-2 rounded-xl border border-border bg-muted/20 p-4">
          {block.data.title && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{block.data.title}</p>}
          <ul className="space-y-1">
            {block.data.sources.map((src, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary">•</span>
                {src.url ? (
                  <a href={src.url} className="hover:text-primary hover:underline">{src.label || src.url}</a>
                ) : (
                  <span>{src.label || "Źródło..."}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );

    case "read_more":
      return (
        <div className="my-2 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Czytaj więcej</p>
            <p className="text-sm text-foreground">{block.data.label || "Powiązany artykuł..."}</p>
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="my-2 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-lg font-bold text-foreground">{block.data.title || "Tytuł CTA"}</p>
          {block.data.description && <p className="mt-1 text-sm text-muted-foreground">{block.data.description}</p>}
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              {block.data.buttonLabel || "Kliknij"}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      );

    case "separator":
      return (
        <div className="my-4 flex items-center justify-center">
          {block.data.style === "dots" ? (
            <div className="flex gap-2">
              {[0, 1, 2].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-border" />)}
            </div>
          ) : block.data.style === "stars" ? (
            <div className="flex gap-3 text-muted-foreground/40">
              {[0, 1, 2].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
          ) : (
            <div className="h-px w-full bg-border" />
          )}
        </div>
      );

    case "code":
      return (
        <div className="my-2 overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{block.data.language || "kod"}</span>
          </div>
          <pre className="overflow-x-auto bg-muted/20 p-4 text-xs leading-relaxed text-foreground">
            <code>{block.data.code || "// Wklej kod..."}</code>
          </pre>
          {block.data.caption && <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{block.data.caption}</p>}
        </div>
      );

    case "list":
      return (
        <div className="my-2">
          {block.data.ordered ? (
            <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
              {block.data.items.filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}
            </ol>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
              {block.data.items.filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )}
        </div>
      );

    case "stats_grid":
      return (
        <div className="my-2">
          {block.data.title && <p className="mb-3 text-sm font-bold text-foreground">{block.data.title}</p>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {block.data.stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value || "—"}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label || "Etykieta"}</p>
                {stat.note && <p className="mt-0.5 text-[10px] text-muted-foreground/70">{stat.note}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case "person_card":
      return (
        <div className="my-2 flex gap-4 rounded-2xl border border-border bg-card p-5">
          {block.data.imageUrl ? (
            <img src={block.data.imageUrl} alt={block.data.name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground">{block.data.name || "Imię i nazwisko"}</p>
            {block.data.role && <p className="text-sm text-muted-foreground">{block.data.role}</p>}
            {block.data.bio && <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{block.data.bio}</p>}
          </div>
        </div>
      );

    case "newsletter_signup":
      return (
        <div className="my-2 rounded-2xl border border-border bg-card p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-base font-bold text-foreground">{block.data.title || "Zapisz się do newslettera"}</p>
          {block.data.description && <p className="mt-1 text-sm text-muted-foreground">{block.data.description}</p>}
          <div className="mt-4 flex gap-2">
            <div className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">Twój e-mail...</div>
            <div className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{block.data.buttonLabel || "Zapisz się"}</div>
          </div>
        </div>
      );

    case "live_update":
      return (
        <div className="my-2 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Radio className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-foreground">{block.data.title || "Na żywo"}</span>
            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
          </div>
          <div className="divide-y divide-border">
            {block.data.updates.map((update, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <div className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
                  <Clock className="h-3 w-3" />
                  {update.time || "00:00"}
                </div>
                <p className="text-sm text-foreground">{update.content || "Aktualizacja..."}</p>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="my-2 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          Nieznany typ bloku
        </div>
      );
  }
}
