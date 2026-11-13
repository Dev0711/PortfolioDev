"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  SquareCode,
  Undo2,
  Unlink,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Rich text editor (Tiptap). Emits HTML, which is sanitised on the server
 * before it is stored (lib/sanitize.ts) — the allowed tags there match the
 * formatting offered by this toolbar.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  ariaLabel,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "tiptap prose-site", "aria-label": ariaLabel, role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.isEmpty ? "" : instance.getHTML()),
  });

  // Keep the editor in sync when the form is reset from outside.
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className="editor-surface overflow-hidden rounded-lg border border-input bg-base/40 focus-within:border-signal">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  // Re-render on selection changes so active states stay accurate.
  const [, force] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => force((n) => n + 1);
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  if (!editor) return <div className="h-10 border-b border-line" />;

  function setLink() {
    if (!editor) return;
    const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Link URL (https://…)", previous);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) {
      window.alert("Links must start with https://, http:// or mailto:");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const chain = () => editor.chain().focus();

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-line p-1">
      <Tool label="Bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
        <Bold />
      </Tool>
      <Tool label="Italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
        <Italic />
      </Tool>
      <Tool label="Inline code" active={editor.isActive("code")} onClick={() => chain().toggleCode().run()}>
        <Code />
      </Tool>
      <Divider />
      <Tool
        label="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </Tool>
      <Tool
        label="Subheading"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </Tool>
      <Divider />
      <Tool label="Bullet list" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
        <List />
      </Tool>
      <Tool
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered />
      </Tool>
      <Tool label="Quote" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}>
        <Quote />
      </Tool>
      <Tool label="Code block" active={editor.isActive("codeBlock")} onClick={() => chain().toggleCodeBlock().run()}>
        <SquareCode />
      </Tool>
      <Divider />
      <Tool label="Add link" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon />
      </Tool>
      <Tool
        label="Remove link"
        disabled={!editor.isActive("link")}
        onClick={() => chain().extendMarkRange("link").unsetLink().run()}
      >
        <Unlink />
      </Tool>
      <span className="flex-1" />
      <Tool label="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
        <Undo2 />
      </Tool>
      <Tool label="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
        <Redo2 />
      </Tool>
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30 [&_svg]:size-4",
        active && "bg-surface-2 text-signal",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-line" />;
}
