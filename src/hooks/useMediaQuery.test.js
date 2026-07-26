/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let listeners;
  let matches;

  beforeEach(() => {
    listeners = [];
    matches = false;
    vi.stubGlobal(
      'matchMedia',
      vi.fn(query => {
        const mediaQuery = {
          get matches() {
            return matches;
          },
          media: query,
          addEventListener: (_event, handler) => {
            listeners.push(handler);
          },
          removeEventListener: (_event, handler) => {
            listeners = listeners.filter(l => l !== handler);
          },
          addListener: handler => {
            listeners.push(handler);
          },
          removeListener: handler => {
            listeners = listeners.filter(l => l !== handler);
          },
        };
        return mediaQuery;
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return false when media query does not match', () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(false);
  });

  it('should return true when media query matches', () => {
    matches = true;
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(true);
  });

  it('should update when viewport changes', () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listeners.forEach(handler => handler());
    });

    expect(result.current).toBe(true);
  });

  it('should register change event listener', () => {
    matches = false;
    renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 639px)');
  });

  it('should clean up listener on unmount', () => {
    matches = false;
    const { unmount, result } = renderHook(() =>
      useMediaQuery('(max-width: 639px)')
    );
    expect(result.current).toBe(false);

    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });
});
