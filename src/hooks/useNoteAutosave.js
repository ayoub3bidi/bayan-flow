/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getNote, upsertNote } from '@/services/notesService';
import { trackNoteSaved } from '../services/analyticsEvents';

/** @typedef {'idle' | 'dirty' | 'saving' | 'saved' | 'error'} NoteSaveStatus */

const DEBOUNCE_MS = 800;
const MAX_RETRIES = 3;

/**
 * @param {Object} params
 * @param {import('@supabase/supabase-js').User | null | undefined} params.user
 * @param {string} params.categoryType
 * @param {string} params.algorithmKey
 * @param {() => string} params.getContentHtml
 * @param {boolean} params.isActive
 */
export function useNoteAutosave({
  user,
  categoryType,
  algorithmKey,
  getContentHtml,
  isActive,
}) {
  const userId = user?.id ?? null;

  const [saveStatus, setSaveStatus] = useState(
    /** @type {NoteSaveStatus} */ ('idle')
  );
  const [initialHtml, setInitialHtml] = useState('');
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  const debounceRef = useRef(null);
  const inFlightRef = useRef(null);
  const dirtyRef = useRef(false);
  const retryCountRef = useRef(0);
  const contentKeyRef = useRef('');
  const getContentRef = useRef(getContentHtml);
  const noteKeyRef = useRef('');
  const saveCategoryRef = useRef(categoryType);
  const saveAlgorithmKeyRef = useRef(algorithmKey);

  getContentRef.current = getContentHtml;

  const loadNote = useCallback(async () => {
    if (!userId || !categoryType || !algorithmKey) {
      setInitialHtml('');
      return;
    }

    setIsLoadingNote(true);
    try {
      const row = await getNote(userId, categoryType, algorithmKey);
      setInitialHtml(row?.body_html ?? '');
      dirtyRef.current = false;
      setSaveStatus('idle');
    } catch (error) {
      console.error('Failed to load note:', error);
      setSaveStatus('error');
    } finally {
      setIsLoadingNote(false);
    }
  }, [userId, categoryType, algorithmKey]);

  const performSave = useCallback(
    async (isRetry = false) => {
      const currentCategory = saveCategoryRef.current;
      const currentAlgorithmKey = saveAlgorithmKeyRef.current;
      if (!userId || !currentCategory || !currentAlgorithmKey) {
        return;
      }

      const html = getContentRef.current();
      const key = `${currentCategory}:${currentAlgorithmKey}:${html}`;

      if (!isRetry && inFlightRef.current) {
        contentKeyRef.current = key;
        return inFlightRef.current;
      }

      setSaveStatus('saving');
      const executeSave = async () => {
        try {
          await upsertNote(userId, currentCategory, currentAlgorithmKey, html);
          dirtyRef.current = false;
          retryCountRef.current = 0;
          setSaveStatus('saved');
          trackNoteSaved(currentAlgorithmKey, html.length);
        } catch (error) {
          console.error('Failed to save note:', error);
          retryCountRef.current += 1;
          if (retryCountRef.current <= MAX_RETRIES) {
            setSaveStatus('error');
            await new Promise(resolve => {
              window.setTimeout(resolve, 1000 * retryCountRef.current);
            });
            if (dirtyRef.current) {
              await performSave(true);
            }
          } else {
            setSaveStatus('error');
          }
        } finally {
          inFlightRef.current = null;
          if (contentKeyRef.current && contentKeyRef.current !== key) {
            contentKeyRef.current = '';
            if (dirtyRef.current) {
              performSave().catch(() => {});
            }
          }
        }
      };

      const savePromise = executeSave();
      inFlightRef.current = savePromise;
      return savePromise;
    },
    [userId]
  );

  const flushSaveRef = useRef(
    /** @type {() => Promise<void>} */ (async () => {})
  );

  const flushSave = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!dirtyRef.current) {
      if (inFlightRef.current) {
        await inFlightRef.current;
      }
      return;
    }
    await performSave();
  }, [performSave]);

  flushSaveRef.current = flushSave;

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    setSaveStatus('dirty');
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
      performSave().catch(() => {});
    }, DEBOUNCE_MS);
  }, [performSave]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const nextKey = `${userId ?? ''}:${categoryType}:${algorithmKey}`;
    const keyChanged = noteKeyRef.current !== nextKey;
    noteKeyRef.current = nextKey;

    let cancelled = false;
    (async () => {
      if (keyChanged) {
        await flushSaveRef.current();
      }
      if (!cancelled) {
        await loadNote();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, categoryType, algorithmKey, isActive, loadNote]);

  useEffect(() => {
    saveCategoryRef.current = categoryType;
    saveAlgorithmKeyRef.current = algorithmKey;
  }, [categoryType, algorithmKey]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const handleOnline = () => {
      if (dirtyRef.current) {
        performSave().catch(() => {});
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      flushSaveRef.current().catch(() => {});
    };
  }, [isActive, performSave]);

  return {
    initialHtml,
    isLoadingNote,
    saveStatus,
    scheduleSave,
    flushSave,
  };
}
