/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  TextB,
  TextItalic,
  ListBullets,
  ListNumbers,
  TextHTwo,
} from '@phosphor-icons/react';
import { useEffect } from 'react';

/**
 * @param {Object} props
 * @param {string} props.content
 * @param {string} props.placeholder
 * @param {(html: string) => void} props.onUpdate
 */
function NoteEditor({ content, placeholder, onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        strike: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-3 py-3 focus:outline-none text-text-primary',
        dir: 'auto',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (ed?.view?.state?.doc) {
        onUpdate(ed.getHTML());
      }
    },
  });

  useEffect(() => {
    if (!editor?.view?.state?.doc) {
      return;
    }
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolButton = ({ onClick, isActive, label, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-theme-primary-light text-theme-primary'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
      }`}
      aria-label={label}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 border border-[var(--color-border-strong)] rounded-xl overflow-hidden bg-surface-elevated">
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--color-border-strong)] bg-surface flex-shrink-0"
        dir="ltr"
      >
        <ToolButton
          label="Bold"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <TextB size={18} weight="bold" />
        </ToolButton>
        <ToolButton
          label="Italic"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <TextItalic size={18} weight="bold" />
        </ToolButton>
        <ToolButton
          label="Bullet list"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBullets size={18} weight="bold" />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListNumbers size={18} weight="bold" />
        </ToolButton>
        <ToolButton
          label="Heading"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <TextHTwo size={18} weight="bold" />
        </ToolButton>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default NoteEditor;
