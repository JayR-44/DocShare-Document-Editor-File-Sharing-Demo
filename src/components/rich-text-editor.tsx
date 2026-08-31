"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RichTextContent } from "@/lib/types";

type Props = { content: RichTextContent; editable: boolean; onChange: (content: RichTextContent) => void };

export function RichTextEditor({ content, editable, onChange }: Props) {
  const editor = useEditor({ extensions: [StarterKit], content, editable, editorProps: { attributes: { class: "editor-content" } }, onUpdate: ({ editor: instance }) => onChange(instance.getJSON() as RichTextContent) });
  useEffect(() => { editor?.setEditable(editable); }, [editor, editable]);
  if (!editor) return <div className="editor-content">Loading editor...</div>;
  const command = (action: () => boolean) => () => action();
  return <div><div className="editor-toolbar" aria-label="Formatting controls">
    <button type="button" className={editor.isActive("bold") ? "is-active" : ""} onClick={command(() => editor.chain().focus().toggleBold().run())} disabled={!editable} title="Bold"><strong>B</strong></button>
    <button type="button" className={editor.isActive("italic") ? "is-active" : ""} onClick={command(() => editor.chain().focus().toggleItalic().run())} disabled={!editable} title="Italic"><em>I</em></button>
    <button type="button" className={editor.isActive("underline") ? "is-active" : ""} onClick={command(() => editor.chain().focus().toggleUnderline().run())} disabled={!editable} title="Underline"><u>U</u></button>
    <button type="button" className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""} onClick={command(() => editor.chain().focus().toggleHeading({ level: 1 }).run())} disabled={!editable}>H1</button>
    <button type="button" className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""} onClick={command(() => editor.chain().focus().toggleHeading({ level: 2 }).run())} disabled={!editable}>H2</button>
    <button type="button" className={editor.isActive("bulletList") ? "is-active" : ""} onClick={command(() => editor.chain().focus().toggleBulletList().run())} disabled={!editable} title="Bulleted list">List</button>
    <button type="button" className={editor.isActive("orderedList") ? "is-active" : ""} onClick={command(() => editor.chain().focus().toggleOrderedList().run())} disabled={!editable} title="Numbered list">1.</button>
  </div><EditorContent editor={editor} /></div>;
}
