"use client";
import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import styles from "@/app/profile/profile.module.css";

type AdminBlogEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

const AdminBlogEditor: React.FC<AdminBlogEditorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    ],
    content: value || "<p></p>",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL ссылки", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  return (
    <div className={styles.admin_editor}>
      <div className={styles.admin_editorToolbar}>
        <button
          type="button"
          className={styles.admin_editorBtn}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive("bold") || undefined}
        >
          B
        </button>
        <button
          type="button"
          className={styles.admin_editorBtn}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive("italic") || undefined}
        >
          I
        </button>
        <button
          type="button"
          className={styles.admin_editorBtn}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          data-active={editor.isActive("heading", { level: 2 }) || undefined}
        >
          H2
        </button>
        <button
          type="button"
          className={styles.admin_editorBtn}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          data-active={editor.isActive("heading", { level: 3 }) || undefined}
        >
          H3
        </button>
        <button
          type="button"
          className={styles.admin_editorBtn}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive("bulletList") || undefined}
        >
          Список
        </button>
        <button
          type="button"
          className={styles.admin_editorBtn}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive("orderedList") || undefined}
        >
          1.
        </button>
        <button
          type="button"
          className={styles.admin_editorBtn}
          disabled={disabled}
          onClick={setLink}
          data-active={editor.isActive("link") || undefined}
        >
          Ссылка
        </button>
      </div>
      <EditorContent editor={editor} className={styles.admin_editorContent} />
    </div>
  );
};

export default AdminBlogEditor;
