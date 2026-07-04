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
      ({ isActive }) =>
        useNoteAutosave({
          user,
          categoryType: ALGORITHM_TYPES.SORTING,
          algorithmKey: 'bubbleSort',
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
});
