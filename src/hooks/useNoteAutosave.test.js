/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNoteAutosave } from './useNoteAutosave';
import { ALGORITHM_TYPES } from '@/constants';

vi.mock('@/services/notesService', () => ({
  getNote: vi.fn(),
  upsertNote: vi.fn(),
}));

import { getNote, upsertNote } from '@/services/notesService';

describe('useNoteAutosave', () => {
  const user = { id: 'user-1' };
  let contentHtml = '<p>hello</p>';

  beforeEach(() => {
    vi.clearAllMocks();
    contentHtml = '<p>hello</p>';
    vi.mocked(getNote).mockResolvedValue({ body_html: '<p>loaded</p>' });
    vi.mocked(upsertNote).mockResolvedValue(undefined);
  });

  function renderAutosave(overrides = {}) {
    return renderHook(
      ({ isActive, algorithmKey: algoKey = 'bubbleSort' }) =>
        useNoteAutosave({
          user,
          categoryType: ALGORITHM_TYPES.SORTING,
          algorithmKey: algoKey,
          getContentHtml: () => contentHtml,
          isActive,
          ...overrides,
        }),
      { initialProps: { isActive: true } }
    );
  }

  it('loads note when active', async () => {
    const { result } = renderAutosave();

    await waitFor(() => {
      expect(getNote).toHaveBeenCalledWith(
        'user-1',
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
      expect(result.current.initialHtml).toBe('<p>loaded</p>');
    });
  });

  it('flushSave persists dirty content before algorithm change', async () => {
    const { result, rerender } = renderAutosave();

    await waitFor(() => {
      expect(result.current.isLoadingNote).toBe(false);
    });

    contentHtml = '<p>updated</p>';
    act(() => {
      result.current.scheduleSave();
    });

    await act(async () => {
      await result.current.flushSave();
    });

    expect(upsertNote).toHaveBeenCalledWith(
      'user-1',
      ALGORITHM_TYPES.SORTING,
      'bubbleSort',
      '<p>updated</p>'
    );

    vi.mocked(getNote).mockResolvedValue({ body_html: '<p>other</p>' });
    rerender({ isActive: true });

    await waitFor(() => {
      expect(getNote).toHaveBeenCalledWith(
        'user-1',
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
    });
  });

  it('does not call upsert when flushSave with no dirty content', async () => {
    const { result } = renderAutosave();

    await waitFor(() => {
      expect(result.current.isLoadingNote).toBe(false);
    });

    await act(async () => {
      await result.current.flushSave();
    });

    expect(upsertNote).not.toHaveBeenCalled();
  });

  it('sets saveStatus to error when loading note fails', async () => {
    vi.mocked(getNote).mockRejectedValue(new Error('Network error'));

    const { result } = renderAutosave();

    await waitFor(() => {
      expect(result.current.saveStatus).toBe('error');
    });
  });

  it('sets saveStatus to dirty after scheduleSave', async () => {
    const { result } = renderAutosave();

    await waitFor(() => {
      expect(result.current.isLoadingNote).toBe(false);
    });

    act(() => {
      result.current.scheduleSave();
    });

    expect(result.current.saveStatus).toBe('dirty');
  });

  it('loads empty note when no user id', async () => {
    const { result } = renderHook(() =>
      useNoteAutosave({
        user: null,
        categoryType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'bubbleSort',
        getContentHtml: () => '',
        isActive: true,
      })
    );

    await waitFor(() => {
      expect(result.current.initialHtml).toBe('');
      expect(result.current.isLoadingNote).toBe(false);
    });

    expect(getNote).not.toHaveBeenCalled();
  });

  it('triggers save on online event when dirty', async () => {
    const { result } = renderAutosave();

    await waitFor(() => {
      expect(result.current.isLoadingNote).toBe(false);
    });

    contentHtml = '<p>updated</p>';
    act(() => {
      result.current.scheduleSave();
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(upsertNote).toHaveBeenCalledWith(
        'user-1',
        ALGORITHM_TYPES.SORTING,
        'bubbleSort',
        '<p>updated</p>'
      );
    });
  });

  it('flushes dirty content on unmount', async () => {
    const { result, unmount } = renderAutosave();

    await waitFor(() => {
      expect(result.current.isLoadingNote).toBe(false);
    });

    contentHtml = '<p>updated</p>';
    act(() => {
      result.current.scheduleSave();
    });
    expect(result.current.saveStatus).toBe('dirty');

    unmount();

    expect(upsertNote).toHaveBeenCalledWith(
      'user-1',
      ALGORITHM_TYPES.SORTING,
      'bubbleSort',
      '<p>updated</p>'
    );
  });

  it('flushes and reloads when algorithmKey changes', async () => {
    const { result, rerender } = renderAutosave();

    await waitFor(() => {
      expect(result.current.isLoadingNote).toBe(false);
    });

    contentHtml = '<p>updated</p>';
    act(() => {
      result.current.scheduleSave();
    });

    vi.mocked(getNote).mockResolvedValue({
      body_html: '<p>new algorithm note</p>',
    });

    rerender({ isActive: true, algorithmKey: 'selectionSort' });

    await waitFor(() => {
      expect(upsertNote).toHaveBeenCalledWith(
        'user-1',
        ALGORITHM_TYPES.SORTING,
        'bubbleSort',
        '<p>updated</p>'
      );
    });

    await waitFor(() => {
      expect(getNote).toHaveBeenCalledWith(
        'user-1',
        ALGORITHM_TYPES.SORTING,
        'selectionSort'
      );
    });
  });
});
