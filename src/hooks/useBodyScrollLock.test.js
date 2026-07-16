/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBodyScrollLock } from './useBodyScrollLock';

describe('useBodyScrollLock', () => {
  const scrollToMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('scrollTo', scrollToMock);
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 120,
    });
    document.body.style.cssText = '';
  });

  afterEach(() => {
    document.body.style.cssText = '';
    vi.unstubAllGlobals();
  });

  it('locks body scroll when isLocked is true', () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-120px');
    expect(document.body.style.width).toBe('100%');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('does not lock body scroll when isLocked is false', () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.position).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('restores body styles and scroll position on unlock', () => {
    const { rerender } = renderHook(({ locked }) => useBodyScrollLock(locked), {
      initialProps: { locked: true },
    });

    rerender({ locked: false });

    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.width).toBe('');
    expect(document.body.style.overflow).toBe('');
    expect(scrollToMock).toHaveBeenCalledWith(0, 120);
  });

  it('restores scroll position on unmount while locked', () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true));

    unmount();

    expect(scrollToMock).toHaveBeenCalledWith(0, 120);
    expect(document.body.style.position).toBe('');
  });
});
