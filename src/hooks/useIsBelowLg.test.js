/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BELOW_LG_MEDIA_QUERY, useIsBelowLg } from './useIsBelowLg';

describe('useIsBelowLg', () => {
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
            return query === BELOW_LG_MEDIA_QUERY ? matches : false;
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

  it('returns false when viewport is at or above lg', () => {
    matches = false;
    const { result } = renderHook(() => useIsBelowLg());
    expect(result.current).toBe(false);
  });

  it('returns true when viewport is below lg', () => {
    matches = true;
    const { result } = renderHook(() => useIsBelowLg());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    matches = false;
    const { result } = renderHook(() => useIsBelowLg());
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listeners.forEach(handler => handler());
    });

    expect(result.current).toBe(true);
  });
});
