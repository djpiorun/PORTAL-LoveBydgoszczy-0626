import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Heading2, Heading3, Italic, Link as LinkIcon, List, ListOrdered, Pilcrow, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function ToolbarButton({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("h-8 w-8", active && "border-primary bg-primary/10 text-primary", className)}
      {...props}
    />
  );
}

export default function PageRichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Dodaj treść…",
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] px-4 py-3 text-sm text-foreground outline-none prose prose-sm max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-relaxed [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("Podaj adres linku", previousUrl ?? "https://");

    if (nextUrl === null) return;
    if (!nextUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const normalizedUrl = nextUrl.trim();
    const safeUrl =
      /^(https?:|mailto:|tel:|\/)/i.test(normalizedUrl) && !/^javascript:/i.test(normalizedUrl)
        ? normalizedUrl
        : `https://${normalizedUrl.replace(/^\/+/, "")}`;

    editor.chain().focus().extendMarkRange("link").setLink({ href: safeUrl }).run();
  };

  if (!editor) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
        Ładowanie edytora…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-border/60 bg-muted/30 p-3">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} className="bg-background" />
    </div>
  );
}