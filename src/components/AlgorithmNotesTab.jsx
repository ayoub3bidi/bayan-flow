/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNoteAutosave } from '@/hooks/useNoteAutosave';

const NoteEditor = lazy(() => import('./NoteEditor'));

/**
 * @param {Object} props
 * @param {import('@supabase/supabase-js').User | null | undefined} props.user
 * @param {string} props.categoryType
 * @param {string} props.algorithmKey
 * @param {string} props.algorithmName
 * @param {boolean} props.isActive
 * @param {() => void | Promise<void>} [props.onRegisterFlush]
 */
function AlgorithmNotesTab({
  user,
  categoryType,
  algorithmKey,
  algorithmName,
  isActive,
  onRegisterFlush,
}) {
  const { t } = useTranslation();
  const [editorHtml, setEditorHtml] = useState('');
  const getContentHtml = useCallback(() => editorHtml, [editorHtml]);

  const { initialHtml, isLoadingNote, saveStatus, scheduleSave, flushSave } =
    useNoteAutosave({
      user,
      categoryType,
      algorithmKey,
      getContentHtml,
      isActive,
    });

  useEffect(() => {
    if (!isLoadingNote) {
      setEditorHtml(initialHtml);
    }
  }, [initialHtml, isLoadingNote, categoryType, algorithmKey]);

  useEffect(() => {
    onRegisterFlush?.(flushSave);
    return () => onRegisterFlush?.(null);
  }, [flushSave, onRegisterFlush]);

  const statusLabel = useMemo(() => {
    switch (saveStatus) {
      case 'saving':
        return t('notes_panel.saving');
      case 'saved':
        return t('notes_panel.saved');
      case 'error':
        return t('notes_panel.saveError');
      case 'dirty':
        return t('notes_panel.unsaved');
      default:
        return '';
    }
  }, [saveStatus, t]);

  if (!user) {
    return (
      <p className="text-sm text-secondary text-center py-8">
        {t('notes_panel.signInRequired')}
      </p>
    );
  }

  const showBlockingLoader = isLoadingNote && editorHtml === '';

  if (showBlockingLoader) {
    return (
      <p className="text-sm text-secondary text-center py-8">
        {t('notes_panel.loading')}
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <Suspense
        fallback={
          <p className="text-sm text-secondary text-center py-8">
            {t('notes_panel.loadingEditor')}
          </p>
        }
      >
        <NoteEditor
          content={editorHtml}
          placeholder={t('notes_panel.placeholder', { algorithmName })}
          onUpdate={html => {
            setEditorHtml(html);
            scheduleSave();
          }}
        />
      </Suspense>
      {statusLabel && (
        <p
          className={`mt-3 text-xs px-1 ${
            saveStatus === 'error' ? 'text-red-500' : 'text-text-secondary'
          }`}
          aria-live="polite"
        >
          {statusLabel}
        </p>
      )}
    </div>
  );
}

export default AlgorithmNotesTab;
