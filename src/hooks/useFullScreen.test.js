/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFullScreen } from './useFullScreen';

describe('useFullScreen keyboard shortcuts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles fullscreen on F when not typing', () => {
    const { result } = renderHook(() => useFullScreen());

    expect(result.current.isFullScreen).toBe(false);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'f', bubbles: true })
      );
    });

    expect(result.current.isFullScreen).toBe(true);
  });

  it('does not toggle fullscreen when typing in a contenteditable element', () => {
    const { result } = renderHook(() => useFullScreen());
    const editor = document.createElement('div');
    editor.setAttribute('contenteditable', 'true');
    document.body.appendChild(editor);

    act(() => {
      editor.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'f',
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(result.current.isFullScreen).toBe(false);
    editor.remove();
  });
});
