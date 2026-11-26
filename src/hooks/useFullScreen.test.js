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

  it('ignores F while entering is blocked (docked Blocks tab), but still exits', () => {
    const press = key =>
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true })
        );
      });
    const { result, rerender } = renderHook(
      ({ canEnter }) => useFullScreen({ canEnter }),
      { initialProps: { canEnter: false } }
    );

    press('f');
    expect(result.current.isFullScreen).toBe(false);

    rerender({ canEnter: true });
    press('f');
    expect(result.current.isFullScreen).toBe(true);

    rerender({ canEnter: false });
    press('f');
    expect(result.current.isFullScreen).toBe(false);
  });

  it('applies canEnter to toggleFullScreen called directly', () => {
    const { result, rerender } = renderHook(
      ({ canEnter }) => useFullScreen({ canEnter }),
      { initialProps: { canEnter: false } }
    );
    act(() => result.current.toggleFullScreen());
    expect(result.current.isFullScreen).toBe(false);

    rerender({ canEnter: true });
    act(() => result.current.toggleFullScreen());
    rerender({ canEnter: false });
    act(() => result.current.toggleFullScreen());
    expect(result.current.isFullScreen).toBe(false);
  });
});
