import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import type { ArticleContentBlock, ArticleContentBlockType, ParagraphBlock } from "@/components/admin/article-editor/types/articleEditorTypes";
import { createBlock } from "@/components/admin/article-editor/types/articleEditorTypes";
import { CONTENT_BLOCKS, CONTENT_BLOCK_GROUPS } from "@/components/admin/article-editor/config/contentBlocks";
import type { ContentBlock } from "@/components/admin/article-editor/config/contentBlocks";
import {
  Plus, Trash2, Copy, GripVertical, Eye, EyeOff,
  ChevronUp, ChevronDown, Search, Clock3, Sparkles, X,
  Image as ImageIcon, Video, Music, MapPin, Share2, BookOpen,
  ArrowRight, CheckCircle, XSquare, AlertTriangle, Info, Quote,
  Star, Code2, Radio, Clock, User, Mail, BarChart3, CheckSquare,
  LayoutTemplate, Pencil, List as ListIcon, ChevronLeft, ChevronRight,
  Hash, Layers, Undo2, Redo2,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import ImageExtension from "@tiptap/extension-image";
import { Extension } from "@tiptap/core";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Link2, Highlighter,
} from "lucide-react";

// ─── FontSize extension ───────────────────────────────────────────────────────
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize || null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
});

// ─── Slash command palette ────────────────────────────────────────────────────
const SLASH_COMMANDS = [
  { type: "paragraph", label: "Paragraf", desc: "Zwykły tekst", icon: ListIcon, shortcut: "/p" },
  { type: "heading", label: "Nagłówek H2", desc: "Duży nagłówek sekcji", icon: Hash, shortcut: "/h2" },
  { type: "heading3", label: "Nagłówek H3", desc: "Średni nagłówek", icon: Hash, shortcut: "/h3" },
  { type: "lead", label: "Lead", desc: "Wyróżniony wstęp artykułu", icon: Quote, shortcut: "/lead" },
  { type: "quote", label: "Cytat", desc: "Cytat z autorem", icon: Quote, shortcut: "/cytat" },
  { type: "image", label: "Zdjęcie", desc: "Obraz z podpisem", icon: ImageIcon, shortcut: "/zdjecie" },
  { type: "info_box", label: "Ramka info", desc: "Wyróżniona informacja", icon: Info, shortcut: "/ramka" },
  { type: "key_points", label: "Kluczowe punkty", desc: "Lista najważniejszych punktów", icon: CheckSquare, shortcut: "/punkty" },
  { type: "separator", label: "Separator", desc: "Linia podziału", icon: Pencil, shortcut: "/---" },
  { type: "faq", label: "FAQ", desc: "Pytania i odpowiedzi", icon: BookOpen, shortcut: "/faq" },
  { type: "cta", label: "CTA", desc: "Przycisk wezwania do działania", icon: ArrowRight, shortcut: "/cta" },
  { type: "gallery", label: "Galeria", desc: "Zestaw zdjęć", icon: ImageIcon, shortcut: "/galeria" },
  { type: "video", label: "Wideo", desc: "Osadzony film", icon: Video, shortcut: "/video" },
  { type: "timeline", label: "Oś czasu", desc: "Chronologiczne zdarzenia", icon: Clock, shortcut: "/timeline" },
  { type: "pros_cons", label: "Plusy i minusy", desc: "Porównanie zalet i wad", icon: CheckCircle, shortcut: "/plusy" },
  { type: "stats_grid", label: "Statystyki", desc: "Siatka liczb i danych", icon: BarChart3, shortcut: "/stats" },
  { type: "live_update", label: "Na żywo", desc: "Aktualizacje na żywo", icon: Radio, shortcut: "/live" },
  { type: "expertquote", label: "Cytat eksperta", desc: "Cytat ze zdjęciem", icon: User, shortcut: "/ekspert" },
  { type: "code", label: "Kod", desc: "Blok kodu programistycznego", icon: Code2, shortcut: "/kod" },
  { type: "list", label: "Lista", desc: "Lista punktowana lub numerowana", icon: List, shortcut: "/lista" },
];

function SlashCommandPalette({
  query,
  onSelect,
  onClose,
}: {
  query: string;
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = SLASH_COMMANDS.filter(cmd =>
    !query || cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.desc.toLowerCase().includes(query.toLowerCase()) ||
    cmd.shortcut.includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); if (filtered[activeIndex]) onSelect(filtered[activeIndex].type); }
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, activeIndex, onSelect, onClose]);

  if (!filtered.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden"
      ref={listRef}
    >
      <div className="px-3 py-2 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Wstaw blok</p>
      </div>
      <div className="py-1 max-h-64 overflow-y-auto">
        {filtered.map((cmd, i) => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.type + i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(cmd.type); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                i === activeIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted ${i === activeIndex ? "bg-primary/20" : ""}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium leading-none">{cmd.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground truncate">{cmd.desc}</div>
              </div>
              <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">{cmd.shortcut}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Inline Tiptap for paragraph blocks ──────────────────────────────────────
function InlineTiptap({ value, onChange, placeholder = "Zacznij pisać... (/ aby wstawić blok)", onInsertBlock, minHeight = "2em" }: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onInsertBlock?: (type: string) => void;
  minHeight?: string;
}) {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      UnderlineExtension,
      Highlight.configure({ multicolor: false }),
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize,
      Color.configure({ types: ["textStyle"] }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // Detect slash command
      if (onInsertBlock) {
        const text = editor.state.doc.textContent;
        const lastLine = text.split("\n").pop() ?? text;
        if (lastLine.startsWith("/")) {
          setSlashQuery(lastLine.slice(1));
        } else {
          setSlashQuery(null);
        }
      }
    },
    onFocus: () => setToolbarVisible(true),
    onBlur: () => setTimeout(() => { setToolbarVisible(false); }, 200),
    editorProps: {
      attributes: {
        class: `outline-none text-foreground leading-relaxed text-[15px]`,
        style: `min-height: ${minHeight}`,
        "data-placeholder": placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const handleSlashSelect = (type: string) => {
    if (!editor || !onInsertBlock) return;
    // Clear the slash command text
    const text = editor.state.doc.textContent;
    const lastLine = text.split("\n").pop() ?? text;
    if (lastLine.startsWith("/")) {
      // Delete the slash command text
      const from = editor.state.selection.from - lastLine.length;
      editor.chain().focus().deleteRange({ from: Math.max(0, from), to: editor.state.selection.from }).run();
    }
    setSlashQuery(null);
    onInsertBlock(type);
  };

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative pt-1">
      {/* Sticky toolbar above content */}
      <AnimatePresence>
        {toolbarVisible && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="sticky top-12 z-30 mb-2 flex flex-wrap items-center gap-0.5 rounded-xl border border-border bg-background/98 px-1.5 py-1 shadow-md backdrop-blur-sm"
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* Text style */}
            <select
              className="h-7 rounded-md border border-border bg-muted/30 px-1.5 text-xs font-medium text-foreground focus:outline-none"
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "p") editor.chain().focus().setParagraph().run();
                else if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
                else if (v === "h4") editor.chain().focus().toggleHeading({ level: 4 }).run();
              }}
              value={
                editor.isActive("heading", { level: 2 }) ? "h2" :
                editor.isActive("heading", { level: 3 }) ? "h3" :
                editor.isActive("heading", { level: 4 }) ? "h4" : "p"
              }
            >
              <option value="p">Paragraf</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Pogrubienie (Ctrl+B)"><Bold className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Kursywa (Ctrl+I)"><Italic className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Podkreślenie (Ctrl+U)"><Underline className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Przekreślenie"><Strikethrough className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Wyróżnienie"><Highlighter className="h-3.5 w-3.5" /></ToolBtn>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Do lewej"><AlignLeft className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Wyśrodkuj"><AlignCenter className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Do prawej"><AlignRight className="h-3.5 w-3.5" /></ToolBtn>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista punktowana"><List className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerowana"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => {
              const url = window.prompt("URL linku:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
              else editor.chain().focus().unsetLink().run();
            }} active={editor.isActive("link")} title="Link"><Link2 className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => {
              const url = window.prompt("URL obrazka:");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }} active={false} title="Wstaw obraz"><ImageIcon className="h-3.5 w-3.5" /></ToolBtn>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Cofnij (Ctrl+Z)"><Undo2 className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Ponów (Ctrl+Shift+Z)"><Redo2 className="h-3.5 w-3.5" /></ToolBtn>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slash command palette */}
      <AnimatePresence>
        {slashQuery !== null && onInsertBlock && (
          <SlashCommandPalette
            query={slashQuery}
            onSelect={handleSlashSelect}
            onClose={() => setSlashQuery(null)}
          />
        )}
      </AnimatePresence>

      <EditorContent
        editor={editor}
        className="article-content prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:py-1 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/30 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:italic"
      />
    </div>
  );
}

function ToolBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`rounded-md p-1.5 transition-colors ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

// ─── Block Preview Renderer (read-only) ──────────────────────────────────────
function BlockPreview({ block }: { block: ArticleContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <div
          className="article-content prose prose-sm max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.data.html || '<p class="text-muted-foreground/40 italic text-sm">Pusty paragraf...</p>' }}
        />
      );
    case "heading": {
      const Tag = `h${block.data.level}` as "h2" | "h3" | "h4";
      const sizeClass = block.data.level === 2 ? "text-2xl font-bold" : block.data.level === 3 ? "text-xl font-semibold" : "text-lg font-semibold";
      return <Tag className={`${sizeClass} text-foreground leading-tight`}>{block.data.text || <span className="text-muted-foreground/40 italic font-normal text-base">Nagłówek H{block.data.level}...</span>}</Tag>;
    }
    case "lead":
      return <p className="text-xl font-medium leading-relaxed text-foreground/90 border-l-4 border-primary pl-4">{block.data.text || <span className="text-muted-foreground/40 italic font-normal text-base">Lead artykułu...</span>}</p>;
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary/60 pl-5 py-1">
          <p className="text-lg italic text-foreground/90 leading-relaxed">{block.data.text || <span className="text-muted-foreground/40">Treść cytatu...</span>}</p>
          {block.data.author && <footer className="mt-1 text-sm text-muted-foreground font-medium">— {block.data.author}</footer>}
        </blockquote>
      );
    case "pullquote":
      return (
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center">
          <Quote className="h-8 w-8 text-primary/40 mx-auto mb-3" />
          <p className="text-2xl font-semibold leading-snug text-foreground">{block.data.text || <span className="text-muted-foreground/40 italic font-normal text-base">Pull quote...</span>}</p>
          {block.data.author && <p className="mt-3 text-sm text-muted-foreground">— {block.data.author}</p>}
        </div>
      );
    case "image":
      return (
        <figure>
          {block.data.src ? (
            <img src={block.data.src} alt={block.data.alt || ""} className="w-full rounded-xl object-cover" style={{ aspectRatio: "16/9" }} />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div className="text-center"><ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40" /><p className="mt-2 text-sm text-muted-foreground">Brak zdjęcia</p></div>
            </div>
          )}
          {(block.data.caption || block.data.credit) && (
            <figcaption className="mt-2 text-xs text-muted-foreground text-center">{block.data.caption}{block.data.credit && <span className="ml-2 opacity-70">fot. {block.data.credit}</span>}</figcaption>
          )}
        </figure>
      );
    case "info_box": {
      const vs: Record<string, string> = { info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30", tip: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30", warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30", success: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30" };
      return (
        <div className={`rounded-xl border p-4 ${vs[block.data.variant ?? "info"]}`}>
          <div className="flex gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div>{block.data.title && <p className="mb-1 text-sm font-semibold text-foreground">{block.data.title}</p>}<p className="text-sm leading-relaxed text-foreground/80">{block.data.content || "Treść ramki..."}</p></div></div>
        </div>
      );
    }
    case "alert": {
      const as: Record<string, string> = { warning: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30", danger: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30", info: "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30" };
      return (
        <div className={`rounded-xl border-2 p-4 ${as[block.data.variant ?? "warning"]}`}>
          <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div>{block.data.title && <p className="mb-1 text-sm font-bold text-foreground">{block.data.title}</p>}<p className="text-sm leading-relaxed text-foreground/80">{block.data.content || "Treść alertu..."}</p></div></div>
        </div>
      );
    }
    case "key_points":
      return (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          {block.data.title && <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">{block.data.title}</p>}
          <ul className="space-y-2">{block.data.points.filter(Boolean).map((p, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-foreground"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{p}</span></li>)}</ul>
        </div>
      );
    case "separator":
      return (
        <div className="flex items-center justify-center py-4">
          {block.data.style === "dots" ? <div className="flex gap-2">{[0,1,2].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-border" />)}</div>
          : block.data.style === "stars" ? <div className="flex gap-3 text-muted-foreground/40">{[0,1,2].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
          : <div className="h-px w-full bg-border" />}
        </div>
      );
    case "faq":
      return (
        <div className="space-y-2">
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
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Plusy</p>
            <ul className="space-y-1.5">{block.data.pros.filter(Boolean).map((p, i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground"><CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{p}</li>)}</ul>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">Minusy</p>
            <ul className="space-y-1.5">{block.data.cons.filter(Boolean).map((c, i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground"><XSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />{c}</li>)}</ul>
          </div>
        </div>
      );
    case "timeline":
      return (
        <div>
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
    case "cta":
      return (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-lg font-bold text-foreground">{block.data.title || "Tytuł CTA"}</p>
          {block.data.description && <p className="mt-1 text-sm text-muted-foreground">{block.data.description}</p>}
          <div className="mt-4"><span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{block.data.buttonLabel || "Kliknij"}<ArrowRight className="h-4 w-4" /></span></div>
        </div>
      );
    case "stats_grid":
      return (
        <div>
          {block.data.title && <p className="mb-3 text-sm font-bold text-foreground">{block.data.title}</p>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {block.data.stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value || "—"}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label || "Etykieta"}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "live_update":
      return (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Radio className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-foreground">{block.data.title || "Na żywo"}</span>
            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
          </div>
          <div className="divide-y divide-border">
            {block.data.updates.map((update, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <div className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0"><Clock className="h-3 w-3" />{update.time || "00:00"}</div>
                <p className="text-sm text-foreground">{update.content || "Aktualizacja..."}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "expertquote":
      return (
        <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {block.data.imageUrl ? <img src={block.data.imageUrl} alt={block.data.name} className="h-14 w-14 rounded-full object-cover" /> : <User className="h-6 w-6 text-primary" />}
          </div>
          <div>
            <p className="text-base italic leading-relaxed text-foreground">"{block.data.text || "Treść cytatu eksperta..."}"</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{block.data.name || "Imię i nazwisko"}</p>
            {block.data.role && <p className="text-xs text-muted-foreground">{block.data.role}</p>}
          </div>
        </div>
      );
    case "newsletter_signup":
      return (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-base font-bold text-foreground">{block.data.title || "Zapisz się do newslettera"}</p>
          {block.data.description && <p className="mt-1 text-sm text-muted-foreground">{block.data.description}</p>}
          <div className="mt-4 flex gap-2">
            <div className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">Twój e-mail...</div>
            <div className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{block.data.buttonLabel || "Zapisz się"}</div>
          </div>
        </div>
      );
    case "person_card":
      return (
        <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
            {block.data.imageUrl ? <img src={block.data.imageUrl} alt={block.data.name} className="h-16 w-16 object-cover" /> : <User className="h-7 w-7 text-muted-foreground" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">{block.data.name || "Imię i nazwisko"}</p>
            {block.data.role && <p className="text-sm text-muted-foreground">{block.data.role}</p>}
            {block.data.bio && <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{block.data.bio}</p>}
          </div>
        </div>
      );
    case "code":
      return (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{block.data.language || "kod"}</span>
          </div>
          <pre className="overflow-x-auto bg-muted/20 p-4 text-xs leading-relaxed text-foreground"><code>{block.data.code || "// Wklej kod..."}</code></pre>
          {block.data.caption && <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{block.data.caption}</p>}
        </div>
      );
    case "list":
      return (
        <div>
          {block.data.ordered ? (
            <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">{block.data.items.filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}</ol>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">{block.data.items.filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}</ul>
          )}
        </div>
      );
    case "sources_list":
      return (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          {block.data.title && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{block.data.title}</p>}
          <ul className="space-y-1">{block.data.sources.map((src, i) => <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><span className="text-primary">•</span>{src.url ? <a href={src.url} className="hover:text-primary hover:underline">{src.label || src.url}</a> : <span>{src.label || "Źródło..."}</span>}</li>)}</ul>
        </div>
      );
    case "read_more":
      return (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Czytaj więcej</p><p className="text-sm text-foreground">{block.data.label || "Powiązany artykuł..."}</p></div>
        </div>
      );
    case "context_box":
      return (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex gap-3"><BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /><div>{block.data.title && <p className="mb-1 text-sm font-semibold text-foreground">{block.data.title}</p>}<p className="text-sm leading-relaxed text-foreground/80">{block.data.content || "Kontekst artykułu..."}</p></div></div>
        </div>
      );
    case "fact_check": {
      const vc: Record<string, { label: string; color: string; bg: string }> = {
        true: { label: "PRAWDA", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" },
        false: { label: "FAŁSZ", color: "text-red-700", bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
        misleading: { label: "MYLĄCE", color: "text-amber-700", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" },
        unverified: { label: "NIEZWERYFIKOWANE", color: "text-muted-foreground", bg: "bg-muted/30 border-border" },
      };
      const cfg = vc[block.data.verdict];
      return (
        <div className={`rounded-xl border p-4 ${cfg.bg}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
          <p className="mt-1 text-sm font-medium text-foreground">{block.data.claim || "Twierdzenie..."}</p>
          {block.data.explanation && <p className="mt-2 text-xs text-muted-foreground">{block.data.explanation}</p>}
        </div>
      );
    }
    default:
      return <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">Blok: {block.type}</div>;
  }
}

// ─── Paragraph block with its own tiptap editor ───────────────────────────────
function ParagraphBlockEditor({ block, onChange, isSelected, onInsertBlock }: {
  block: ParagraphBlock;
  onChange: (b: ArticleContentBlock) => void;
  isSelected: boolean;
  onInsertBlock?: (type: string) => void;
}) {
  const patch = (data: Partial<typeof block.data>) => onChange({ ...block, data: { ...block.data, ...data } } as ArticleContentBlock);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      UnderlineExtension,
      Highlight.configure({ multicolor: false }),
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize,
      Color.configure({ types: ["textStyle"] }),
    ],
    content: block.data.html,
    onUpdate: ({ editor }) => {
      patch({ html: editor.getHTML() });
      if (onInsertBlock) {
        const text = editor.state.doc.textContent;
        const lastLine = text.split("\n").pop() ?? text;
        if (lastLine.startsWith("/")) {
          setSlashQuery(lastLine.slice(1));
        } else {
          setSlashQuery(null);
        }
      }
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[2em] text-foreground leading-relaxed text-[15px]",
        "data-placeholder": "Zacznij pisać... (/ aby wstawić blok)",
      },
    },
  });

  useEffect(() => {
    if (editor && block.data.html !== editor.getHTML()) {
      editor.commands.setContent(block.data.html, { emitUpdate: false });
    }
  }, [block.data.html, editor]);

  const handleSlashSelect = (type: string) => {
    if (!editor || !onInsertBlock) return;
    const text = editor.state.doc.textContent;
    const lastLine = text.split("\n").pop() ?? text;
    if (lastLine.startsWith("/")) {
      const from = editor.state.selection.from - lastLine.length;
      editor.chain().focus().deleteRange({ from: Math.max(0, from), to: editor.state.selection.from }).run();
    }
    setSlashQuery(null);
    onInsertBlock(type);
  };

  return (
    <div className="relative">
      {/* Floating toolbar above block when selected */}
      <AnimatePresence>
        {isSelected && editor && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute -top-12 left-0 z-40 flex flex-wrap items-center gap-0.5 rounded-xl border border-border bg-background/98 px-1.5 py-1 shadow-lg backdrop-blur-sm"
            onMouseDown={(e) => e.preventDefault()}
          >
            <select
              className="h-7 rounded-md border border-border bg-muted/30 px-1.5 text-xs font-medium text-foreground focus:outline-none"
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "p") editor.chain().focus().setParagraph().run();
                else if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
                else if (v === "h4") editor.chain().focus().toggleHeading({ level: 4 }).run();
              }}
              value={editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : editor.isActive("heading", { level: 4 }) ? "h4" : "p"}
            >
              <option value="p">Paragraf</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Pogrubienie"><Bold className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Kursywa"><Italic className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Podkreślenie"><Underline className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Przekreślenie"><Strikethrough className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Wyróżnienie"><Highlighter className="h-3.5 w-3.5" /></ToolBtn>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Do lewej"><AlignLeft className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Wyśrodkuj"><AlignCenter className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Do prawej"><AlignRight className="h-3.5 w-3.5" /></ToolBtn>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista punktowana"><List className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerowana"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolBtn onClick={() => { const url = window.prompt("URL linku:"); if (url) editor.chain().focus().setLink({ href: url }).run(); else editor.chain().focus().unsetLink().run(); }} active={editor.isActive("link")} title="Link"><Link2 className="h-3.5 w-3.5" /></ToolBtn>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slash command palette */}
      <AnimatePresence>
        {slashQuery !== null && onInsertBlock && (
          <SlashCommandPalette
            query={slashQuery}
            onSelect={handleSlashSelect}
            onClose={() => setSlashQuery(null)}
          />
        )}
      </AnimatePresence>

      <div className="article-content prose prose-sm max-w-none">
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/40 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
        />
      </div>
    </div>
  );
}

// ─── Inline block editors ─────────────────────────────────────────────────────
function InlineBlockEditor({ block, onChange, isSelected, onInsertBlock }: { block: ArticleContentBlock; onChange: (b: ArticleContentBlock) => void; isSelected?: boolean; onInsertBlock?: (type: string) => void }) {
  const patch = (data: Partial<typeof block.data>) => onChange({ ...block, data: { ...block.data, ...data } } as ArticleContentBlock);

  switch (block.type) {
    case "paragraph":
      return (
        <ParagraphBlockEditor
          block={block as ParagraphBlock}
          onChange={onChange}
          isSelected={isSelected ?? false}
          onInsertBlock={onInsertBlock}
        />
      );

    case "heading": {
      const sizeClass = block.data.level === 2 ? "text-2xl font-bold" : block.data.level === 3 ? "text-xl font-semibold" : "text-lg font-semibold";
      return (
        <div className="flex items-center gap-2">
          <select value={block.data.level} onChange={(e) => patch({ level: Number(e.target.value) as 2 | 3 | 4 })} className="shrink-0 rounded-lg border border-border bg-muted/30 px-2 py-1 text-xs font-semibold text-muted-foreground focus:outline-none">
            <option value={2}>H2</option><option value={3}>H3</option><option value={4}>H4</option>
          </select>
          <input value={block.data.text} onChange={(e) => patch({ text: e.target.value })} placeholder={`Nagłówek H${block.data.level}...`} className={`w-full bg-transparent outline-none placeholder:text-muted-foreground/40 ${sizeClass} text-foreground`} />
        </div>
      );
    }

    case "lead":
      return (
        <div className="border-l-4 border-primary pl-4">
          <textarea value={block.data.text} onChange={(e) => patch({ text: e.target.value })} placeholder="Lead artykułu — pierwsze zdanie, które przyciąga uwagę..." rows={2} className="w-full resize-none bg-transparent text-xl font-medium leading-relaxed text-foreground/90 outline-none placeholder:text-muted-foreground/40" />
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-primary/60 pl-5 py-1 space-y-2">
          <textarea value={block.data.text} onChange={(e) => patch({ text: e.target.value })} placeholder="Treść cytatu..." rows={2} className="w-full resize-none bg-transparent text-lg italic text-foreground/90 leading-relaxed outline-none placeholder:text-muted-foreground/40" />
          <input value={block.data.author ?? ""} onChange={(e) => patch({ author: e.target.value })} placeholder="Autor cytatu..." className="w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
        </blockquote>
      );

    case "pullquote":
      return (
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center space-y-2">
          <Quote className="h-8 w-8 text-primary/40 mx-auto" />
          <textarea value={block.data.text} onChange={(e) => patch({ text: e.target.value })} placeholder="Pull quote — wyróżniony cytat..." rows={2} className="w-full resize-none bg-transparent text-2xl font-semibold leading-snug text-foreground text-center outline-none placeholder:text-muted-foreground/40" />
          <input value={block.data.author ?? ""} onChange={(e) => patch({ author: e.target.value })} placeholder="Autor..." className="w-full bg-transparent text-sm text-muted-foreground text-center outline-none placeholder:text-muted-foreground/40" />
        </div>
      );

    case "image":
      return (
        <figure className="space-y-2">
          {block.data.src ? (
            <img src={block.data.src} alt={block.data.alt || ""} className="w-full rounded-xl object-cover" style={{ aspectRatio: "16/9" }} />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div className="text-center"><ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-2 text-sm text-muted-foreground">Wklej URL zdjęcia poniżej</p></div>
            </div>
          )}
          <input value={block.data.src} onChange={(e) => patch({ src: e.target.value })} placeholder="URL zdjęcia (https://...)..." className="w-full rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50" />
          <div className="flex gap-2">
            <input value={block.data.alt ?? ""} onChange={(e) => patch({ alt: e.target.value })} placeholder="Tekst alternatywny (SEO)..." className="flex-1 rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50" />
            <input value={block.data.credit ?? ""} onChange={(e) => patch({ credit: e.target.value })} placeholder="Autor zdjęcia..." className="flex-1 rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50" />
          </div>
          <input value={block.data.caption ?? ""} onChange={(e) => patch({ caption: e.target.value })} placeholder="Podpis zdjęcia..." className="w-full rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50" />
        </figure>
      );

    case "info_box": {
      const variantStyles: Record<string, string> = { info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30", tip: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30", warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30", success: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30" };
      const variant = block.data.variant ?? "info";
      return (
        <div className={`rounded-xl border p-4 space-y-2 ${variantStyles[variant]}`}>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
            <select value={variant} onChange={(e) => patch({ variant: e.target.value as "info" | "tip" | "warning" | "success" })} className="rounded-lg border border-border bg-background/80 px-2 py-0.5 text-xs font-semibold focus:outline-none">
              <option value="info">Info</option><option value="tip">Wskazówka</option><option value="warning">Ostrzeżenie</option><option value="success">Sukces</option>
            </select>
          </div>
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł (opcjonalnie)..." className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50" />
          <textarea value={block.data.content} onChange={(e) => patch({ content: e.target.value })} placeholder="Treść ramki informacyjnej..." rows={2} className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/50" />
        </div>
      );
    }

    case "alert": {
      const alertStyles: Record<string, string> = { warning: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30", danger: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30", info: "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30" };
      const variant = block.data.variant ?? "warning";
      return (
        <div className={`rounded-xl border-2 p-4 space-y-2 ${alertStyles[variant]}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <select value={variant} onChange={(e) => patch({ variant: e.target.value as "warning" | "danger" | "info" })} className="rounded-lg border border-border bg-background/80 px-2 py-0.5 text-xs font-semibold focus:outline-none">
              <option value="warning">Ostrzeżenie</option><option value="danger">Niebezpieczeństwo</option><option value="info">Info</option>
            </select>
          </div>
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł alertu..." className="w-full bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/50" />
          <textarea value={block.data.content} onChange={(e) => patch({ content: e.target.value })} placeholder="Treść alertu..." rows={2} className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/50" />
        </div>
      );
    }

    case "key_points":
      return (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł sekcji (opcjonalnie)..." className="w-full bg-transparent text-xs font-bold uppercase tracking-wide text-primary outline-none placeholder:text-primary/40" />
          <div className="space-y-1.5">
            {block.data.points.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                <input value={point} onChange={(e) => { const pts = [...block.data.points]; pts[i] = e.target.value; patch({ points: pts }); }} placeholder={`Punkt ${i + 1}...`} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" />
                <button type="button" onClick={() => patch({ points: block.data.points.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => patch({ points: [...block.data.points, ""] })} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Dodaj punkt</button>
        </div>
      );

    case "faq":
      return (
        <div className="space-y-2">
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł FAQ (opcjonalnie)..." className="w-full bg-transparent text-xs font-bold uppercase tracking-wide text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
          {block.data.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">Q{i + 1}</span>
                <input value={item.question} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], question: e.target.value }; patch({ items }); }} placeholder="Pytanie..." className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50" />
                <button type="button" onClick={() => patch({ items: block.data.items.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              </div>
              <textarea value={item.answer} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], answer: e.target.value }; patch({ items }); }} placeholder="Odpowiedź..." rows={2} className="w-full resize-none bg-transparent text-sm text-muted-foreground leading-relaxed outline-none placeholder:text-muted-foreground/40" />
            </div>
          ))}
          <button type="button" onClick={() => patch({ items: [...block.data.items, { question: "", answer: "" }] })} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Dodaj pytanie</button>
        </div>
      );

    case "pros_cons":
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-1.5 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Plusy</p>
            {block.data.pros.map((pro, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <input value={pro} onChange={(e) => { const p = [...block.data.pros]; p[i] = e.target.value; patch({ pros: p }); }} placeholder={`Plus ${i + 1}...`} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40" />
                <button type="button" onClick={() => patch({ pros: block.data.pros.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <button type="button" onClick={() => patch({ pros: [...block.data.pros, ""] })} className="flex items-center gap-1 text-xs text-emerald-700 hover:underline dark:text-emerald-400"><Plus className="h-3 w-3" /> Dodaj</button>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1.5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">Minusy</p>
            {block.data.cons.map((con, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <XSquare className="h-3.5 w-3.5 shrink-0 text-red-600" />
                <input value={con} onChange={(e) => { const c = [...block.data.cons]; c[i] = e.target.value; patch({ cons: c }); }} placeholder={`Minus ${i + 1}...`} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40" />
                <button type="button" onClick={() => patch({ cons: block.data.cons.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <button type="button" onClick={() => patch({ cons: [...block.data.cons, ""] })} className="flex items-center gap-1 text-xs text-red-700 hover:underline dark:text-red-400"><Plus className="h-3 w-3" /> Dodaj</button>
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="space-y-2">
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł osi czasu..." className="w-full bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/50" />
          <div className="relative space-y-3 pl-6">
            <div className="absolute left-2 top-0 h-full w-px bg-border" />
            {block.data.items.map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input value={item.date} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], date: e.target.value }; patch({ items }); }} placeholder="Data..." className="w-28 bg-transparent text-xs font-semibold text-primary outline-none placeholder:text-primary/40" />
                    <button type="button" onClick={() => patch({ items: block.data.items.filter((_, j) => j !== i) })} className="ml-auto text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <input value={item.title} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], title: e.target.value }; patch({ items }); }} placeholder="Tytuł zdarzenia..." className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/50" />
                  <input value={item.description ?? ""} onChange={(e) => { const items = [...block.data.items]; items[i] = { ...items[i], description: e.target.value }; patch({ items }); }} placeholder="Opis (opcjonalnie)..." className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => patch({ items: [...block.data.items, { date: "", title: "" }] })} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Dodaj zdarzenie</button>
        </div>
      );

    case "stats_grid":
      return (
        <div className="space-y-2">
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł sekcji statystyk..." className="w-full bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/50" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {block.data.stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 text-center space-y-1">
                <input value={stat.value} onChange={(e) => { const s = [...block.data.stats]; s[i] = { ...s[i], value: e.target.value }; patch({ stats: s }); }} placeholder="Wartość..." className="w-full bg-transparent text-center text-2xl font-bold text-primary outline-none placeholder:text-primary/30" />
                <input value={stat.label} onChange={(e) => { const s = [...block.data.stats]; s[i] = { ...s[i], label: e.target.value }; patch({ stats: s }); }} placeholder="Etykieta..." className="w-full bg-transparent text-center text-xs font-medium text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
                <button type="button" onClick={() => patch({ stats: block.data.stats.filter((_, j) => j !== i) })} className="text-muted-foreground/40 hover:text-destructive text-xs">usuń</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => patch({ stats: [...block.data.stats, { label: "", value: "" }] })} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Dodaj statystykę</button>
        </div>
      );

    case "live_update":
      return (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Radio className="h-4 w-4 text-red-500" />
            <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł relacji na żywo..." className="flex-1 bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/50" />
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
          </div>
          <div className="divide-y divide-border">
            {block.data.updates.map((update, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <input value={update.time} onChange={(e) => { const u = [...block.data.updates]; u[i] = { ...u[i], time: e.target.value }; patch({ updates: u }); }} placeholder="00:00" className="w-14 bg-transparent text-xs font-semibold text-primary outline-none placeholder:text-primary/40" />
                <input value={update.content} onChange={(e) => { const u = [...block.data.updates]; u[i] = { ...u[i], content: e.target.value }; patch({ updates: u }); }} placeholder="Treść aktualizacji..." className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" />
                <button type="button" onClick={() => patch({ updates: block.data.updates.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="px-4 py-2">
            <button type="button" onClick={() => patch({ updates: [...block.data.updates, { time: "", content: "" }] })} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Dodaj aktualizację</button>
          </div>
        </div>
      );

    case "sources_list":
      return (
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł (np. Źródła)..." className="w-full bg-transparent text-xs font-bold uppercase tracking-wide text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
          {block.data.sources.map((src, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-primary text-sm">•</span>
              <input value={src.label} onChange={(e) => { const s = [...block.data.sources]; s[i] = { ...s[i], label: e.target.value }; patch({ sources: s }); }} placeholder="Nazwa źródła..." className="flex-1 bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
              <input value={src.url ?? ""} onChange={(e) => { const s = [...block.data.sources]; s[i] = { ...s[i], url: e.target.value }; patch({ sources: s }); }} placeholder="URL (opcjonalnie)..." className="flex-1 bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
              <button type="button" onClick={() => patch({ sources: block.data.sources.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <button type="button" onClick={() => patch({ sources: [...block.data.sources, { label: "" }] })} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Dodaj źródło</button>
        </div>
      );

    case "read_more":
      return (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Czytaj więcej</p>
            <input value={block.data.label ?? ""} onChange={(e) => patch({ label: e.target.value })} placeholder="Tytuł powiązanego artykułu..." className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" />
            <input value={block.data.url ?? ""} onChange={(e) => patch({ url: e.target.value })} placeholder="URL artykułu..." className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
          </div>
        </div>
      );

    case "context_box":
      return (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł kontekstu..." className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50" />
          </div>
          <textarea value={block.data.content} onChange={(e) => patch({ content: e.target.value })} placeholder="Kontekst artykułu..." rows={3} className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/50" />
        </div>
      );

    case "fact_check": {
      const verdictConfig: Record<string, { label: string; color: string; bg: string }> = {
        true: { label: "PRAWDA", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" },
        false: { label: "FAŁSZ", color: "text-red-700", bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
        misleading: { label: "MYLĄCE", color: "text-amber-700", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" },
        unverified: { label: "NIEZWERYFIKOWANE", color: "text-muted-foreground", bg: "bg-muted/30 border-border" },
      };
      const cfg = verdictConfig[block.data.verdict];
      return (
        <div className={`rounded-xl border p-4 space-y-2 ${cfg.bg}`}>
          <div className="flex items-center gap-2">
            <select value={block.data.verdict} onChange={(e) => patch({ verdict: e.target.value as "true" | "false" | "misleading" | "unverified" })} className="rounded-lg border border-border bg-background/80 px-2 py-0.5 text-xs font-bold focus:outline-none">
              <option value="true">PRAWDA</option><option value="false">FAŁSZ</option><option value="misleading">MYLĄCE</option><option value="unverified">NIEZWERYFIKOWANE</option>
            </select>
          </div>
          <input value={block.data.claim} onChange={(e) => patch({ claim: e.target.value })} placeholder="Twierdzenie do weryfikacji..." className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/50" />
          <textarea value={block.data.explanation ?? ""} onChange={(e) => patch({ explanation: e.target.value })} placeholder="Wyjaśnienie (opcjonalnie)..." rows={2} className="w-full resize-none bg-transparent text-xs text-muted-foreground leading-relaxed outline-none placeholder:text-muted-foreground/40" />
        </div>
      );
    }

    case "newsletter_signup":
      return (
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
          <Mail className="mx-auto h-8 w-8 text-primary" />
          <input value={block.data.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Tytuł newslettera..." className="w-full bg-transparent text-center text-base font-bold text-foreground outline-none placeholder:text-muted-foreground/50" />
          <input value={block.data.description ?? ""} onChange={(e) => patch({ description: e.target.value })} placeholder="Opis (opcjonalnie)..." className="w-full bg-transparent text-center text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
          <input value={block.data.buttonLabel ?? ""} onChange={(e) => patch({ buttonLabel: e.target.value })} placeholder="Tekst przycisku..." className="mx-auto block rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground outline-none placeholder:text-primary-foreground/60 w-40" />
        </div>
      );

    case "person_card":
      return (
        <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
            {block.data.imageUrl ? <img src={block.data.imageUrl} alt={block.data.name} className="h-16 w-16 object-cover" /> : <User className="h-7 w-7 text-muted-foreground" />}
          </div>
          <div className="flex-1 space-y-1.5">
            <input value={block.data.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Imię i nazwisko..." className="w-full bg-transparent font-semibold text-foreground outline-none placeholder:text-muted-foreground/50" />
            <input value={block.data.role ?? ""} onChange={(e) => patch({ role: e.target.value })} placeholder="Stanowisko / rola..." className="w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
            <textarea value={block.data.bio ?? ""} onChange={(e) => patch({ bio: e.target.value })} placeholder="Bio (opcjonalnie)..." rows={2} className="w-full resize-none bg-transparent text-sm text-foreground/80 leading-relaxed outline-none placeholder:text-muted-foreground/40" />
            <input value={block.data.imageUrl ?? ""} onChange={(e) => patch({ imageUrl: e.target.value })} placeholder="URL zdjęcia..." className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
          </div>
        </div>
      );

    case "expertquote":
      return (
        <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
            {block.data.imageUrl ? <img src={block.data.imageUrl} alt={block.data.name} className="h-14 w-14 rounded-full object-cover" /> : <User className="h-6 w-6 text-primary" />}
          </div>
          <div className="flex-1 space-y-1.5">
            <textarea value={block.data.text} onChange={(e) => patch({ text: e.target.value })} placeholder="Treść cytatu eksperta..." rows={2} className="w-full resize-none bg-transparent text-base italic leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50" />
            <input value={block.data.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Imię i nazwisko..." className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50" />
            <input value={block.data.role ?? ""} onChange={(e) => patch({ role: e.target.value })} placeholder="Stanowisko / rola..." className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
            <input value={block.data.imageUrl ?? ""} onChange={(e) => patch({ imageUrl: e.target.value })} placeholder="URL zdjęcia (opcjonalnie)..." className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
          </div>
        </div>
      );

    case "code":
      return (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <input value={block.data.language ?? ""} onChange={(e) => patch({ language: e.target.value })} placeholder="Język (js, python, html...)" className="flex-1 bg-transparent text-xs font-medium text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
          </div>
          <textarea value={block.data.code} onChange={(e) => patch({ code: e.target.value })} placeholder="// Wklej kod..." rows={6} className="w-full resize-none bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50" />
          <input value={block.data.caption ?? ""} onChange={(e) => patch({ caption: e.target.value })} placeholder="Podpis kodu (opcjonalnie)..." className="w-full border-t border-border bg-transparent px-4 py-2 text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
        </div>
      );

    case "separator":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 py-2">
            {["line", "dots", "stars"].map((style) => (
              <button key={style} type="button" onClick={() => patch({ style: style as "line" | "dots" | "stars" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${block.data.style === style ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>
                {style === "line" ? "Linia" : style === "dots" ? "Kropki" : "Gwiazdki"}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center py-2">
            {block.data.style === "dots" ? <div className="flex gap-2">{[0,1,2].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-border" />)}</div>
            : block.data.style === "stars" ? <div className="flex gap-3 text-muted-foreground/40">{[0,1,2].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
            : <div className="h-px w-full bg-border" />}
          </div>
        </div>
      );

    case "list":
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => patch({ ordered: false })} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${!block.data.ordered ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>Punktowana</button>
            <button type="button" onClick={() => patch({ ordered: true })} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${block.data.ordered ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>Numerowana</button>
          </div>
          <div className="space-y-1">
            {block.data.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{block.data.ordered ? `${i + 1}.` : "•"}</span>
                <input value={item} onChange={(e) => { const items = [...block.data.items]; items[i] = e.target.value; patch({ items }); }} placeholder={`Element ${i + 1}...`} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40" />
                <button type="button" onClick={() => patch({ items: block.data.items.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => patch({ items: [...block.data.items, ""] })} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Dodaj element</button>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-2">
          {block.data.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {block.data.images.map((img, i) => (
                <div key={i} className="relative group/img">
                  <img src={img.src} alt={img.alt || ""} className="aspect-square w-full rounded-lg object-cover" />
                  <button type="button" onClick={() => patch({ images: block.data.images.filter((_, j) => j !== i) })} className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 text-muted-foreground opacity-0 group-hover/img:opacity-100 hover:text-destructive transition-opacity"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div className="text-center"><ImageIcon className="mx-auto h-6 w-6 text-muted-foreground/50" /><p className="mt-1 text-xs text-muted-foreground">Galeria zdjęć</p></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              placeholder="Wklej URL zdjęcia i naciśnij Enter..."
              className="flex-1 rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) { patch({ images: [...block.data.images, { src: val, alt: "" }] }); (e.target as HTMLInputElement).value = ""; }
                }
              }}
            />
            <span className="flex items-center text-xs text-muted-foreground">Enter ↵</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          Nieznany typ bloku — brak edytora
        </div>
      );
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ArticleHeaderProps {
  title: string;
  slug: string;
  imageUrl: string;
  imageAuthor: string;
  excerpt: string;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onImageUrlChange: (v: string) => void;
  onImageAuthorChange: (v: string) => void;
  onExcerptChange: (v: string) => void;
  onOpenMediaLibrary?: () => void;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
}

interface BlockCanvasProps {
  blocks: ArticleContentBlock[];
  onChange: (blocks: ArticleContentBlock[]) => void;
  articleHeader?: ArticleHeaderProps;
  content?: string;
  onContentChange?: (html: string) => void;
}

// ─── Block Library Modal ──────────────────────────────────────────────────────
function BlockLibraryModal({
  open, onClose, onSelect, recentTypes,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: ArticleContentBlockType) => void;
  recentTypes: string[];
}) {
  const [query, setQuery] = useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONTENT_BLOCKS;
    return CONTENT_BLOCKS.filter((b) =>
      [b.label, b.desc, ...(b.keywords ?? [])].some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-background/70 backdrop-blur-sm pt-16 px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-3xl rounded-3xl border border-border bg-popover shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj bloków: obraz, cytat, timeline, ankieta..."
              className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {recentTypes.length > 0 && !query && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recentTypes
                .map((t) => CONTENT_BLOCKS.find((b) => b.type === t))
                .filter((b): b is ContentBlock => Boolean(b))
                .map((b) => (
                  <button
                    key={`recent-${b.type}`}
                    type="button"
                    onClick={() => onSelect(b.type as ArticleContentBlockType)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Clock3 className="h-3 w-3 text-muted-foreground" />
                    {b.label}
                  </button>
                ))}
            </div>
          )}
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5">
          {CONTENT_BLOCK_GROUPS.map((group) => {
            const groupBlocks = filtered.filter((b) => b.group === group.key);
            if (!groupBlocks.length) return null;
            return (
              <div key={group.key}>
                <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${group.color}`}>{group.label}</div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {groupBlocks.map((b) => {
                    const Icon = b.icon;
                    return (
                      <button
                        key={b.type}
                        type="button"
                        onClick={() => onSelect(b.type as ArticleContentBlockType)}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:bg-primary/[0.02]"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${b.color ?? "bg-muted"} text-primary`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{b.label}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{b.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add block button ─────────────────────────────────────────────────────────
function AddBlockButton({ onAdd }: { onAdd: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group flex items-center gap-2 py-1.5 cursor-pointer"
      onClick={onAdd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="h-px flex-1 bg-border/20"
        animate={{ backgroundColor: hovered ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border) / 0.2)" }}
        transition={{ duration: 0.2 }}
      />
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border/50 bg-background text-muted-foreground/50 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-sm"
      >
        <Plus className="h-3.5 w-3.5" />
      </motion.button>
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className="text-[10px] font-medium text-primary whitespace-nowrap"
          >
            Dodaj blok
          </motion.span>
        )}
      </AnimatePresence>
      <motion.div
        className="h-px flex-1 bg-border/20"
        animate={{ backgroundColor: hovered ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border) / 0.2)" }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}

// ─── Single draggable block row ───────────────────────────────────────────────
function BlockRow({
  block,
  index,
  total,
  isSelected,
  previewMode,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onToggleHidden,
  onAddAfter,
  onInsertBlock,
  blockRef,
}: {
  block: ArticleContentBlock;
  index: number;
  total: number;
  isSelected: boolean;
  previewMode: boolean;
  onSelect: () => void;
  onUpdate: (b: ArticleContentBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: "up" | "down") => void;
  onToggleHidden: () => void;
  onAddAfter: () => void;
  onInsertBlock?: (type: string) => void;
  blockRef?: (el: HTMLElement | null) => void;
}) {
  const dragControls = useDragControls();
  const isHidden = block.settings?.hidden;
  const blockMeta = CONTENT_BLOCKS.find((b) => b.type === block.type);

  if (previewMode) {
    return (
      <div className={`py-1 ${isHidden ? "opacity-30" : ""}`}>
        <BlockPreview block={block} />
      </div>
    );
  }

  return (
    <Reorder.Item
      key={block.id}
      value={block}
      dragListener={false}
      dragControls={dragControls}
      ref={blockRef as any}
    >
      <div className="group relative" style={{ paddingTop: isSelected ? "2.5rem" : undefined }}>
        {/* Floating block toolbar — appears above selected block */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-0 left-0 right-0 z-40 flex items-center gap-1"
            >
              <div className="flex items-center gap-0.5 rounded-xl border border-border bg-background/98 px-1.5 py-1 shadow-lg backdrop-blur-sm">
                {/* Drag handle */}
                <button
                  type="button"
                  title="Przeciągnij"
                  onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
                  className="cursor-grab rounded p-1 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground active:cursor-grabbing touch-none transition-colors"
                >
                  <GripVertical className="h-3 w-3" />
                </button>
                {blockMeta && (
                  <>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md ${blockMeta.color ?? "bg-muted"}`}>
                      <blockMeta.icon className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground px-0.5">{blockMeta.label}</span>
                  </>
                )}
                <div className="mx-1 h-3 w-px bg-border" />
                <button type="button" title="Przesuń w górę" onClick={(e) => { e.stopPropagation(); onMove("up"); }} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors">
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button type="button" title="Przesuń w dół" onClick={(e) => { e.stopPropagation(); onMove("down"); }} disabled={index === total - 1} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors">
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div className="mx-1 h-3 w-px bg-border" />
                <button type="button" title={isHidden ? "Pokaż" : "Ukryj"} onClick={(e) => { e.stopPropagation(); onToggleHidden(); }} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  {isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </button>
                <button type="button" title="Duplikuj" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Copy className="h-3 w-3" />
                </button>
                <button type="button" title="Usuń blok" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Block content — document-like, clean WordPress-style */}
        <motion.div
          className={`relative rounded-xl transition-all duration-200 cursor-text ${
            isSelected
              ? "ring-1 ring-primary/25 bg-primary/[0.02] shadow-sm"
              : "hover:bg-muted/15 hover:ring-1 hover:ring-border/30"
          } ${isHidden ? "opacity-40" : ""}`}
          onClick={onSelect}
          layout
          transition={{ duration: 0.15 }}
        >
          {/* Left accent bar when selected */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary origin-top"
              />
            )}
          </AnimatePresence>

          {/* Drag handle — appears on left margin on hover (not selected) */}
          {!isSelected && (
            <motion.button
              type="button"
              title="Przeciągnij aby zmienić kolejność"
              onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              className="absolute -left-7 top-1/2 -translate-y-1/2 cursor-grab rounded-md p-0.5 text-muted-foreground/0 group-hover:text-muted-foreground/30 hover:!text-muted-foreground hover:bg-muted active:cursor-grabbing touch-none transition-colors"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </motion.button>
          )}

          {/* Block content */}
          <div className={`px-3 py-2.5 ${isSelected ? "pl-4" : ""}`}>
            <InlineBlockEditor block={block} onChange={onUpdate} isSelected={isSelected} onInsertBlock={onInsertBlock} />
          </div>
        </motion.div>

        {/* Add block between — shown on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AddBlockButton onAdd={onAddAfter} />
        </div>
      </div>
    </Reorder.Item>
  );
}

// ─── Left Outline Panel ───────────────────────────────────────────────────────
function OutlinePanel({
  blocks,
  selectedId,
  onSelect,
  onAddBlock,
  collapsed,
  onToggleCollapse,
}: {
  blocks: ArticleContentBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddBlock: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const getBlockLabel = (block: ArticleContentBlock): string => {
    const meta = CONTENT_BLOCKS.find((b) => b.type === block.type);
    if (block.type === "heading" && block.data.text) return block.data.text.slice(0, 30);
    if (block.type === "paragraph" && block.data.html) {
      const text = block.data.html.replace(/<[^>]+>/g, "").slice(0, 30);
      return text || meta?.label || block.type;
    }
    if (block.type === "lead" && block.data.text) return block.data.text.slice(0, 30);
    if (block.type === "quote" && block.data.text) return `"${block.data.text.slice(0, 25)}"`;
    return meta?.label || block.type;
  };

  if (collapsed) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-border bg-muted/20 py-3 gap-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Rozwiń panel"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="h-px w-6 bg-border" />
        {blocks.slice(0, 8).map((block) => {
          const meta = CONTENT_BLOCKS.find((b) => b.type === block.type);
          return meta ? (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelect(block.id)}
              title={getBlockLabel(block)}
              className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${selectedId === block.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <meta.icon className="h-3 w-3" />
            </button>
          ) : null;
        })}
        {blocks.length > 8 && (
          <span className="text-[10px] text-muted-foreground">+{blocks.length - 8}</span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 208, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex shrink-0 flex-col border-r border-border bg-muted/5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <ListIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Struktura</span>
          {blocks.length > 0 && (
            <motion.span
              key={blocks.length}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold"
            >
              {blocks.length}
            </motion.span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto py-2">
        {blocks.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
              <Layers className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">Brak bloków</p>
            <button
              type="button"
              onClick={onAddBlock}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <Plus className="h-3 w-3" /> Dodaj blok
            </button>
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {blocks.map((block, index) => {
              const meta = CONTENT_BLOCKS.find((b) => b.type === block.type);
              const isHidden = block.settings?.hidden;
              const label = getBlockLabel(block);
              const isHeading = block.type === "heading";
              const indent = isHeading && block.data.level === 3 ? "pl-3" : isHeading && block.data.level === 4 ? "pl-5" : "";
              const isActive = selectedId === block.id;

              return (
                <motion.button
                  key={block.id}
                  type="button"
                  onClick={() => onSelect(block.id)}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.1 }}
                  className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all ${indent} ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  } ${isHidden ? "opacity-40" : ""}`}
                >
                  {meta && (
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${isActive ? "bg-primary/20" : meta.color ?? "bg-muted"}`}>
                      <meta.icon className="h-2.5 w-2.5" />
                    </div>
                  )}
                  <span className="truncate text-[11px] font-medium">{label || meta?.label || `Blok ${index + 1}`}</span>
                  {isHidden && <EyeOff className="h-2.5 w-2.5 shrink-0 ml-auto" />}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add block footer */}
      <div className="border-t border-border p-2">
        <motion.button
          type="button"
          onClick={onAddBlock}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Dodaj blok
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main BlockCanvas ─────────────────────────────────────────────────────────
// ─── Article Header (title, slug, image, lead) — WordPress-style document surface
function ArticleHeader({ title, slug, imageUrl, imageAuthor, excerpt, onTitleChange, onSlugChange, onImageUrlChange, onImageAuthorChange, onExcerptChange, onOpenMediaLibrary, onImageUpload, isUploading }: ArticleHeaderProps) {
  const [imageExpanded, setImageExpanded] = useState(false);

  return (
    <div className="mb-8 space-y-5">
      {/* Title — large, prominent, WordPress-style */}
      <div className="group">
        <input
          type="text"
          placeholder="Dodaj tytuł"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          className="w-full text-[2.5rem] font-black bg-transparent border-none outline-none placeholder:text-muted-foreground/20 leading-[1.15] tracking-tight text-foreground transition-colors"
        />
      </div>

      {/* Slug — compact inline */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/15 rounded-lg border border-transparent hover:border-border/50 transition-all max-w-lg">
        <span className="text-[11px] text-muted-foreground/60 font-mono flex-shrink-0">bezpośredni link: /</span>
        <input
          type="text"
          value={slug}
          onChange={e => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-"))}
          placeholder="slug-artykulu"
          className="flex-1 text-[11px] font-mono bg-transparent border-none outline-none text-primary placeholder:text-muted-foreground/40 min-w-0"
        />
      </div>

      {/* Hero Image — collapsible section */}
      <div>
        <button
          type="button"
          onClick={() => setImageExpanded(!imageExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Zdjęcie główne</span>
          {imageUrl && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          <motion.span animate={{ rotate: imageExpanded ? 180 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronDown className="w-3 h-3" />
          </motion.span>
        </button>

        <AnimatePresence>
          {(imageExpanded || imageUrl) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden group mb-2">
                  <img src={imageUrl} alt="" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer bg-white/90 text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                      Zmień
                      <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
                    </label>
                    <button type="button" onClick={() => onImageUrlChange("")} className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500 transition-colors">Usuń</button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-all group mb-2">
                  {isUploading ? (
                    <span className="text-xs text-muted-foreground">Przesyłanie...</span>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/40 transition-colors mb-1" />
                      <span className="text-xs text-muted-foreground/60">Kliknij lub przeciągnij zdjęcie</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
                </label>
              )}
              <div className="flex gap-2 mb-1">
                <input
                  type="text"
                  placeholder="URL zdjęcia..."
                  value={imageUrl}
                  onChange={e => onImageUrlChange(e.target.value)}
                  className="flex-1 h-7 text-[11px] rounded-lg border border-border/50 bg-muted/10 px-2.5 outline-none placeholder:text-muted-foreground/40 focus:border-primary/40 text-foreground"
                />
                {onOpenMediaLibrary && (
                  <button type="button" onClick={onOpenMediaLibrary} className="h-7 px-2.5 text-[11px] rounded-lg border border-border/50 bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
                    Biblioteka
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Autor zdjęcia..."
                value={imageAuthor}
                onChange={e => onImageAuthorChange(e.target.value)}
                className="w-full h-7 text-[11px] rounded-lg border border-border/50 bg-muted/10 px-2.5 outline-none placeholder:text-muted-foreground/40 focus:border-primary/40 text-foreground"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lead / Excerpt — styled as a distinct block with animation */}
      <motion.div
        className="relative group"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.15 }}
      >
        <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-primary/25 group-focus-within:bg-primary/50 transition-colors" />
        <textarea
          placeholder="Napisz zajawkę artykułu..."
          value={excerpt}
          onChange={e => onExcerptChange(e.target.value)}
          rows={2}
          className="w-full text-lg pl-5 bg-transparent border-none resize-none outline-none placeholder:text-muted-foreground/25 text-foreground/80 leading-relaxed font-medium focus:text-foreground transition-colors"
        />
      </motion.div>

      {/* Subtle divider before content */}
      <div className="pt-2">
        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      </div>
    </div>
  );
}

export default function BlockCanvas({ blocks, onChange, articleHeader, content, onContentChange }: BlockCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const blockRefs = useRef<Record<string, HTMLElement | null>>({});
  const [recentTypes, setRecentTypes] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("block_canvas_recent") ?? "[]"); } catch { return []; }
  });

  const addToRecent = useCallback((type: string) => {
    setRecentTypes(prev => {
      const next = [type, ...prev.filter(t => t !== type)].slice(0, 5);
      try { localStorage.setItem("block_canvas_recent", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const handleAddBlock = useCallback((type: string) => {
    addToRecent(type);
    const newBlock = createBlock(type as ArticleContentBlockType);
    if (insertAfterIndex !== null) {
      const next = [...blocks];
      next.splice(insertAfterIndex + 1, 0, newBlock);
      onChange(next);
    } else {
      onChange([...blocks, newBlock]);
    }
    setLibraryOpen(false);
    setInsertAfterIndex(null);
    setSelectedId(newBlock.id);
    setTimeout(() => {
      const el = blockRefs.current[newBlock.id];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [blocks, onChange, insertAfterIndex, addToRecent]);

  const handleUpdateBlock = useCallback((updated: ArticleContentBlock) => {
    onChange(blocks.map(b => b.id === updated.id ? updated : b));
  }, [blocks, onChange]);

  const handleDeleteBlock = useCallback((id: string) => {
    onChange(blocks.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [blocks, onChange, selectedId]);

  const handleDuplicateBlock = useCallback((id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const dup = { ...blocks[idx], id: Math.random().toString(36).slice(2) };
    const next = [...blocks];
    next.splice(idx + 1, 0, dup);
    onChange(next);
  }, [blocks, onChange]);

  const handleMoveBlock = useCallback((id: string, dir: "up" | "down") => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const next = [...blocks];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    onChange(next);
  }, [blocks, onChange]);

  const handleToggleHidden = useCallback((id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    handleUpdateBlock({ ...block, settings: { ...block.settings, hidden: !block.settings?.hidden } });
  }, [blocks, handleUpdateBlock]);

  const handleOpenLibrary = useCallback((afterIndex: number | null) => {
    setInsertAfterIndex(afterIndex);
    setLibraryOpen(true);
  }, []);

  const handleInsertBlockAfter = useCallback((blockId: string, type: string) => {
    addToRecent(type);
    const idx = blocks.findIndex(b => b.id === blockId);
    const newBlock = createBlock(type as ArticleContentBlockType);
    const next = [...blocks];
    next.splice(idx + 1, 0, newBlock);
    onChange(next);
    setSelectedId(newBlock.id);
    setTimeout(() => {
      const el = blockRefs.current[newBlock.id];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [blocks, onChange, addToRecent]);

  const handleSelectFromOutline = useCallback((id: string) => {
    setSelectedId(id);
    const el = blockRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
      <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Left outline panel */}
      {!previewMode && (
        <OutlinePanel
          blocks={blocks}
          selectedId={selectedId}
          onSelect={handleSelectFromOutline}
          onAddBlock={() => handleOpenLibrary(null)}
          collapsed={outlineCollapsed}
          onToggleCollapse={() => setOutlineCollapsed(!outlineCollapsed)}
        />
      )}

      {/* Main canvas area — full width */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Canvas toolbar — WordPress-style top bar */}
        <div className="flex items-center gap-2 border-b border-border bg-background/95 px-3 py-1.5 backdrop-blur-sm sticky top-0 z-10">
          {!previewMode && (
            <motion.button
              type="button"
              onClick={() => setOutlineCollapsed(!outlineCollapsed)}
              whileTap={{ scale: 0.92 }}
              title={outlineCollapsed ? "Pokaż strukturę" : "Ukryj strukturę"}
              className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-mono font-bold transition-all ${
                !outlineCollapsed
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <motion.span
                animate={{ rotate: outlineCollapsed ? 0 : 90 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                /
              </motion.span>
              <span className="hidden sm:inline text-[10px] font-semibold not-italic">Struktura</span>
            </motion.button>
          )}

          {/* Center stats */}
          {!previewMode && (
            <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground/60 font-medium">
              {blocks.length > 0 && (
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {blocks.length} {blocks.length === 1 ? "blok" : blocks.length < 5 ? "bloki" : "bloków"}
                </span>
              )}
              {content && (
                <span>
                  {content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length} słów
                </span>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                previewMode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {previewMode ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {previewMode ? "Edytuj" : "Podgląd"}
            </button>

            {!previewMode && (
              <motion.button
                type="button"
                onClick={() => handleOpenLibrary(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
              >
                <Plus className="h-3 w-3" />
                Wstaw blok
              </motion.button>
            )}
          </div>
        </div>

        {/* Canvas body — full width document surface */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="w-full max-w-4xl mx-auto px-5 py-8 sm:px-8 lg:px-10">

            {/* Article header (title, slug, image, lead) */}
            {articleHeader && !previewMode && (
              <ArticleHeader {...articleHeader} />
            )}
            {articleHeader && previewMode && (
              <div className="mb-8">
                {articleHeader.imageUrl && (
                  <img src={articleHeader.imageUrl} alt="" className="w-full h-64 object-cover rounded-2xl mb-5" />
                )}
                <h1 className="text-4xl font-black text-foreground leading-tight mb-3">{articleHeader.title || "Bez tytułu"}</h1>
                {articleHeader.excerpt && <p className="text-xl text-muted-foreground leading-relaxed">{articleHeader.excerpt}</p>}
                <div className="mt-5 h-px bg-border" />
              </div>
            )}

            {/* ── Unified document surface: content editor + blocks ── */}
            {!previewMode && (
              <>
                {/* Primary WYSIWYG writing surface — the main editing area */}
                {onContentChange && (
                  <div className="mb-6 min-h-[200px] rounded-xl border border-border/40 bg-card/50 px-5 py-4 shadow-sm transition-all focus-within:border-primary/30 focus-within:shadow-md focus-within:bg-card">
                    <InlineTiptap
                      value={content ?? ""}
                      onChange={onContentChange}
                      placeholder="Zacznij pisać treść artykułu... Wpisz / aby wstawić blok"
                      minHeight="180px"
                      onInsertBlock={(type) => {
                        const newBlock = createBlock(type as ArticleContentBlockType);
                        onChange([...blocks, newBlock]);
                      }}
                    />
                  </div>
                )}

                {/* Blocks divider — only show when there are blocks */}
                {blocks.length > 0 && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px flex-1 bg-border/30" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      Bloki treści ({blocks.length})
                    </span>
                    <div className="h-px flex-1 bg-border/30" />
                  </div>
                )}
              </>
            )}

            {/* Content preview in preview mode */}
            {onContentChange && previewMode && content && (
              <div
                className="mb-6 article-content prose prose-sm max-w-none text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            {/* Empty state — only when no content editor AND no blocks */}
            {blocks.length === 0 && !onContentChange && !previewMode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20">
                  <Sparkles className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-base font-semibold text-foreground">Zacznij budować artykuł</p>
                <p className="mt-1 text-sm text-muted-foreground">Kliknij <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xs font-mono">+</kbd> lub wpisz <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xs font-mono">/</kbd></p>
                <button
                  type="button"
                  onClick={() => handleOpenLibrary(null)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj pierwszy blok
                </button>
              </motion.div>
            )}

            {blocks.length === 0 && previewMode && !content && (
              <div className="py-20 text-center text-sm text-muted-foreground">Brak treści do podglądu.</div>
            )}

            {previewMode ? (
              <div className="space-y-6 article-content">
                {blocks.filter(b => !b.settings?.hidden).map((block) => (
                  <div key={block.id}>
                    <BlockPreview block={block} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {blocks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <AddBlockButton onAdd={() => handleOpenLibrary(null)} />
                  </motion.div>
                )}

                <Reorder.Group axis="y" values={blocks} onReorder={onChange} className="space-y-0">
                  {blocks.map((block, index) => (
                    <BlockRow
                      key={block.id}
                      block={block}
                      index={index}
                      total={blocks.length}
                      isSelected={selectedId === block.id}
                      previewMode={false}
                      onSelect={() => setSelectedId(selectedId === block.id ? null : block.id)}
                      onUpdate={handleUpdateBlock}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onDuplicate={() => handleDuplicateBlock(block.id)}
                      onMove={(dir) => handleMoveBlock(block.id, dir)}
                      onToggleHidden={() => handleToggleHidden(block.id)}
                      onAddAfter={() => handleOpenLibrary(index)}
                      onInsertBlock={(type) => handleInsertBlockAfter(block.id, type)}
                      blockRef={(el) => { blockRefs.current[block.id] = el; }}
                    />
                  ))}
                </Reorder.Group>
              </>
            )}
          </div>
        </div>
      </div>

      <BlockLibraryModal
        open={libraryOpen}
        onClose={() => { setLibraryOpen(false); setInsertAfterIndex(null); }}
        onSelect={handleAddBlock}
        recentTypes={recentTypes}
      />
    </div>
  );
}