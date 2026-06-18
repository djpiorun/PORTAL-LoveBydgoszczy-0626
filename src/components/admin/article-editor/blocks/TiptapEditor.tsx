import { useEditor, EditorContent } from "@tiptap/react";
import { createPortal } from "react-dom";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Image,
  Code,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ChevronDown,
  Palette,
  Plus,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Clock3,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { CONTENT_BLOCKS, CONTENT_BLOCK_GROUPS } from "@/components/admin/article-editor/config/contentBlocks";

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

function TipBtn({
  onClick,
  active,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`rounded-lg p-2 transition-all ${
        active
          ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px shrink-0 self-center bg-border" />;
}

const TEXT_STYLES = [
  { label: "Paragraf", value: "paragraph", action: (editor: ReturnType<typeof useEditor>) => editor?.chain().focus().setParagraph().run() },
  { label: "H1", value: "h1", action: (editor: ReturnType<typeof useEditor>) => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: "H2", value: "h2", action: (editor: ReturnType<typeof useEditor>) => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "H3", value: "h3", action: (editor: ReturnType<typeof useEditor>) => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "H4", value: "h4", action: (editor: ReturnType<typeof useEditor>) => editor?.chain().focus().toggleHeading({ level: 4 }).run() },
];

const FONT_FAMILIES = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Courier", value: "'Courier New', monospace" },
];

const FONT_SIZES = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "32", value: "32px" },
];

const TEXT_COLORS = [
  { label: "Domyślny", value: "" },
  { label: "Grafit", value: "#1f2937" },
  { label: "Szary", value: "#6b7280" },
  { label: "Błękit", value: "#2563eb" },
  { label: "Zieleń", value: "#15803d" },
  { label: "Pomarańcz", value: "#ea580c" },
  { label: "Czerwony", value: "#dc2626" },
  { label: "Fiolet", value: "#7c3aed" },
];

function GenericDropdown({
  label,
  items,
  onSelect,
  minWidth = "112px",
}: {
  label: string;
  items: { label: string; value: string; style?: React.CSSProperties }[];
  onSelect: (value: string) => void;
  minWidth?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-background hover:text-foreground"
        style={{ minWidth }}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl"
          style={{ minWidth }}
        >
          {items.map((item) => (
            <button
              key={`${label}-${item.value || "default"}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item.value);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-muted"
              style={item.style}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TextStyleDropdown({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const current = editor?.isActive("heading", { level: 1 })
    ? "H1"
    : editor?.isActive("heading", { level: 2 })
      ? "H2"
      : editor?.isActive("heading", { level: 3 })
        ? "H3"
        : editor?.isActive("heading", { level: 4 })
          ? "H4"
          : "Paragraf";

  return (
    <GenericDropdown
      label={current}
      minWidth="108px"
      items={TEXT_STYLES.map((s) => ({ label: s.label, value: s.value }))}
      onSelect={(value) => {
        const option = TEXT_STYLES.find((item) => item.value === value);
        if (editor && option) option.action(editor);
      }}
    />
  );
}

function ColorPickerDropdown({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentColor = editor?.getAttributes("textStyle")?.color || "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Kolor tekstu"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="relative rounded-lg p-2 text-muted-foreground transition-all hover:bg-background hover:text-foreground"
      >
        <Palette className="h-4 w-4" />
        {currentColor && <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-background" style={{ backgroundColor: currentColor }} />}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[172px] rounded-xl border border-border bg-popover p-2 shadow-xl">
          <div className="mb-2 grid grid-cols-4 gap-1.5">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.label}
                type="button"
                title={color.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!editor) return;
                  if (color.value) editor.chain().focus().setColor(color.value).run();
                  else editor.chain().focus().unsetColor().run();
                  setOpen(false);
                }}
                className="flex h-8 items-center justify-center rounded-lg border border-border transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: color.value || "transparent" }}
              >
                {!color.value && <span className="text-[10px] font-semibold text-muted-foreground">A</span>}
              </button>
            ))}
          </div>
          <input
            type="color"
            className="h-9 w-full rounded-lg border border-border bg-background"
            onInput={(e) => editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          />
        </div>
      )}
    </div>
  );
}

function BlockLibrary({
  open,
  onClose,
  onSelect,
  recentBlocks,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  recentBlocks: string[];
}) {
  const [query, setQuery] = useState("");

  const filteredBlocks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return CONTENT_BLOCKS;
    return CONTENT_BLOCKS.filter((block) =>
      [block.label, block.desc, ...(block.keywords ?? [])].some((part) => part.toLowerCase().includes(normalized)),
    );
  }, [query]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-20 w-[min(860px,calc(100vw-32px))] rounded-3xl border border-border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj bloków: obraz, cytat, timeline, ankieta..."
              className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {recentBlocks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recentBlocks
                .map((type) => CONTENT_BLOCKS.find((item) => item.type === type))
                .filter(Boolean)
                .map((item) => {
                  const block = item!;
                  return (
                    <button
                      key={`recent-${block.type}`}
                      type="button"
                      onClick={() => onSelect(block.type)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Clock3 className="h-3 w-3 text-muted-foreground" />
                      {block.label}
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="space-y-5">
            {CONTENT_BLOCK_GROUPS.map((group) => {
              const groupBlocks = filteredBlocks.filter((block) => block.group === group.key);
              if (!groupBlocks.length) return null;
              return (
                <div key={group.key}>
                  <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${group.color}`}>
                    {group.label}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {groupBlocks.map((block) => {
                      const Icon = block.icon;
                      return (
                        <button
                          key={block.type}
                          type="button"
                          onClick={() => onSelect(block.type)}
                          className="rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${block.color ?? "bg-muted"} text-primary`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground">{block.label}</div>
                              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{block.desc}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function WysiwygToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("URL zdjęcia:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt("URL linku:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };

  const currentFont = editor.getAttributes("textStyle")?.fontFamily || FONT_FAMILIES[0].value;
  const currentFontLabel = FONT_FAMILIES.find((item) => item.value === currentFont)?.label ?? "Czcionka";
  const currentFontSize = editor.getAttributes("textStyle")?.fontSize || "16px";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
      <TipBtn onClick={() => editor.chain().focus().undo().run()} title="Cofnij">
        <Undo className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().redo().run()} title="Ponów">
        <Redo className="h-4 w-4" />
      </TipBtn>

      <Divider />
      <TextStyleDropdown editor={editor} />
      <GenericDropdown
        label={currentFontLabel}
        items={FONT_FAMILIES.map((font) => ({
          label: font.label,
          value: font.value,
          style: { fontFamily: font.value },
        }))}
        minWidth="116px"
        onSelect={(value) => editor.chain().focus().setFontFamily(value).run()}
      />
      <GenericDropdown
        label={currentFontSize.replace("px", "")}
        items={FONT_SIZES.map((size) => ({
          label: `${size.label}px`,
          value: size.value,
          style: { fontSize: size.value },
        }))}
        minWidth="84px"
        onSelect={(value) => editor.chain().focus().setMark("textStyle", { fontSize: value }).run()}
      />

      <Divider />
      <TipBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Pogrubienie">
        <Bold className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Kursywa">
        <Italic className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Podkreślenie">
        <Underline className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Przekreślenie">
        <Strikethrough className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Wyróżnienie">
        <Highlighter className="h-4 w-4" />
      </TipBtn>
      <ColorPickerDropdown editor={editor} />

      <Divider />
      <TipBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Do lewej">
        <AlignLeft className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Wyśrodkuj">
        <AlignCenter className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Do prawej">
        <AlignRight className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justowanie">
        <AlignJustify className="h-4 w-4" />
      </TipBtn>

      <Divider />
      <TipBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista punktowana">
        <List className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerowana">
        <ListOrdered className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Cytat">
        <Quote className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separator">
        <Minus className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Kod inline">
        <Code className="h-4 w-4" />
      </TipBtn>

      <Divider />
      <TipBtn onClick={setLink} active={editor.isActive("link")} title="Link">
        <Link2 className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={addImage} title="Obraz z URL">
        <Image className="h-4 w-4" />
      </TipBtn>
    </div>
  );
}

function FloatingBubbleMenu({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);

  const updatePosition = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      setVisible(false);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setVisible(false);
      return;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (!rect.width) {
      setVisible(false);
      return;
    }

    setPos({
      top: rect.top + window.scrollY - 54,
      left: Math.max(12, rect.left + window.scrollX + rect.width / 2 - 120),
    });
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", updatePosition);
    editor.on("blur", () => setTimeout(() => setVisible(false), 120));
    return () => {
      editor.off("selectionUpdate", updatePosition);
    };
  }, [editor, updatePosition]);

  if (!visible || !pos || !editor) return null;

  return createPortal(
    <div
      className="fixed z-[9999] flex items-center gap-1 rounded-2xl border border-border bg-popover px-2 py-1 shadow-xl"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <TipBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Pogrubienie">
        <Bold className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Kursywa">
        <Italic className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Podkreślenie">
        <Underline className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Wyróżnienie">
        <Highlighter className="h-4 w-4" />
      </TipBtn>
      <Divider />
      <TipBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1">
        <Heading1 className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">
        <Heading2 className="h-4 w-4" />
      </TipBtn>
      <TipBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">
        <Heading3 className="h-4 w-4" />
      </TipBtn>
    </div>,
    document.body,
  );
}

function SlashCommandMenu({
  editor,
  onInsertBlock,
}: {
  editor: ReturnType<typeof useEditor>;
  onInsertBlock: (type: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return CONTENT_BLOCKS.filter((block) =>
      !normalized
        ? true
        : [block.label, block.desc, ...(block.keywords ?? [])].some((part) => part.toLowerCase().includes(normalized)),
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { $from } = editor.state.selection;
      const lineText = $from.parent.textContent;

      if (lineText.startsWith("/")) {
        setQuery(lineText.slice(1));
        try {
          const coords = editor.view.coordsAtPos(editor.state.selection.from);
          setPos({ top: coords.bottom + window.scrollY + 6, left: coords.left + window.scrollX });
          setVisible(true);
        } catch {
          setVisible(false);
        }
      } else {
        setVisible(false);
      }
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!visible || !pos || filtered.length === 0) return null;

  return createPortal(
    <div
      className="fixed z-[9999] w-72 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Wstaw blok
      </div>
      <div className="max-h-80 overflow-y-auto p-1.5">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const { $from } = editor.state.selection;
                editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).run();
                onInsertBlock(item.type);
                setVisible(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color ?? "bg-muted"} text-primary`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="truncate text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  previewMode?: boolean;
  onInsertBlock?: (type: string) => void;
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Zacznij pisać artykuł. Użyj / aby dodać blok lub kliknij +.",
  className = "",
  previewMode = false,
  onInsertBlock,
}: TiptapEditorProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [recentBlocks, setRecentBlocks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("editor_recent_blocks");
      if (saved) setRecentBlocks(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const registerRecentBlock = (type: string) => {
    try {
      const next = [type, ...recentBlocks.filter((item) => item !== type)].slice(0, 6);
      setRecentBlocks(next);
      window.localStorage.setItem("editor_recent_blocks", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleInsertBlock = (type: string) => {
    registerRecentBlock(type);
    onInsertBlock?.(type);
    setLibraryOpen(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      UnderlineExtension,
      Highlight.configure({ multicolor: false }),
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize,
      Color.configure({ types: ["textStyle"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editable: !previewMode,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!previewMode);
  }, [previewMode, editor]);

  const viewportClass =
    viewport === "desktop"
      ? "editor-preview-desktop"
      : viewport === "tablet"
        ? "editor-preview-tablet"
        : "editor-preview-mobile";

  return (
    <div className={`tiptap-editor-shell overflow-hidden rounded-[28px] border border-border bg-card shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Newsroom editor
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Pisanie jak na froncie portalu: szerokość kolumny, rytm typografii i podgląd bloków.
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!previewMode && (
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Plus className="h-4 w-4 text-primary" />
              Dodaj blok
            </button>
          )}

          <div className="flex items-center rounded-xl border border-border bg-background p-1">
            {[
              { id: "desktop" as const, icon: Monitor, label: "Desktop" },
              { id: "tablet" as const, icon: Tablet, label: "Tablet" },
              { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ].map((item) => {
              const Icon = item.icon;
              const active = viewport === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewport(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!previewMode && <WysiwygToolbar editor={editor} />}

      <div className="bg-muted/20 p-4 md:p-6">
        {!previewMode && (
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="editor-block-trigger"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="rounded-full border border-dashed border-border px-3 py-1 text-[11px] text-muted-foreground">
              Użyj / aby otworzyć szybkie wstawianie bloków
            </div>
          </div>
        )}

        <div className={`mx-auto transition-all duration-200 ${viewportClass}`}>
          <div className="tiptap-editor-container newsroom-editor-frame rounded-[28px] border border-border bg-background">
            {!previewMode && editor && <FloatingBubbleMenu editor={editor} />}
            {!previewMode && editor && onInsertBlock && <SlashCommandMenu editor={editor} onInsertBlock={handleInsertBlock} />}
            <EditorContent
              editor={editor}
              className={`article-content prose prose-sm max-w-none px-6 py-8 md:px-10 md:py-10 [&_.ProseMirror]:min-h-[420px] [&_.ProseMirror]:outline-none ${previewMode ? "pointer-events-none select-text" : ""}`}
            />
          </div>
        </div>
      </div>

      <BlockLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handleInsertBlock}
        recentBlocks={recentBlocks}
      />
    </div>
  );
}