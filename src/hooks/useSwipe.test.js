/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSwipe from './useSwipe';

/**
 * Helper to create mock touch events
 */
function createTouchEvent(type, clientX, clientY) {
  return {
    touches:
      type === 'touchstart'
        ? [{ clientX, clientY }]
        : type === 'touchmove'
          ? [{ clientX, clientY }]
          : [],
    changedTouches: type === 'touchend' ? [{ clientX, clientY }] : [],
  };
}

describe('useSwipe', () => {
  it('should call onRight when swiping right beyond threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onLeft, onRight, threshold: 30 })
    );

    // Simulate swipe right
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 200));
    result.current.onTouchMove(createTouchEvent('touchmove', 150, 200));
    result.current.onTouchEnd(createTouchEvent('touchend', 150, 200));

    expect(onRight).toHaveBeenCalledTimes(1);
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('should call onLeft when swiping left beyond threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onLeft, onRight, threshold: 30 })
    );

    // Simulate swipe left
    result.current.onTouchStart(createTouchEvent('touchstart', 150, 200));
    result.current.onTouchMove(createTouchEvent('touchmove', 100, 200));
    result.current.onTouchEnd(createTouchEvent('touchend', 100, 200));

    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).not.toHaveBeenCalled();
  });

  it('should not trigger callback when swipe is below threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onLeft, onRight, threshold: 50 })
    );

    // Simulate small swipe (below threshold)
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 200));
    result.current.onTouchMove(createTouchEvent('touchmove', 120, 200));
    result.current.onTouchEnd(createTouchEvent('touchend', 120, 200));

    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  it('should ignore vertical swipes (prioritize scrolling)', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onLeft, onRight, threshold: 30 })
    );

    // Simulate vertical swipe (scrolling)
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 100));
    result.current.onTouchMove(createTouchEvent('touchmove', 100, 200));
    result.current.onTouchEnd(createTouchEvent('touchend', 100, 200));

    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  it('should handle diagonal swipes when horizontal component is larger', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onLeft, onRight, threshold: 30 })
    );

    // Simulate diagonal swipe (more horizontal than vertical)
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 100));
    result.current.onTouchMove(createTouchEvent('touchmove', 150, 120));
    result.current.onTouchEnd(createTouchEvent('touchend', 150, 120));

    expect(onRight).toHaveBeenCalledTimes(1);
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('should ignore diagonal swipes when vertical component is larger', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onLeft, onRight, threshold: 30 })
    );

    // Simulate diagonal swipe (more vertical than horizontal)
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 100));
    result.current.onTouchMove(createTouchEvent('touchmove', 120, 160));
    result.current.onTouchEnd(createTouchEvent('touchend', 120, 160));

    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  it('should use default threshold when not specified', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onLeft, onRight }));

    // Simulate swipe exactly at default threshold (30px)
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 200));
    result.current.onTouchMove(createTouchEvent('touchmove', 130, 200));
    result.current.onTouchEnd(createTouchEvent('touchend', 130, 200));

    expect(onRight).toHaveBeenCalledTimes(1);
  });

  it('should work with no callbacks specified', () => {
    const { result } = renderHook(() => useSwipe());

    // Should not throw errors
    expect(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 100, 200));
      result.current.onTouchMove(createTouchEvent('touchmove', 150, 200));
      result.current.onTouchEnd(createTouchEvent('touchend', 150, 200));
    }).not.toThrow();
  });

  it('should handle touchEnd without touchStart', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onLeft, onRight, threshold: 30 })
    );

    // Call touchEnd without touchStart
    result.current.onTouchEnd(createTouchEvent('touchend', 150, 200));

    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  it('should track moved state', () => {
    const { result } = renderHook(() => useSwipe());

    expect(result.current.moved.current).toBe(false);

    result.current.onTouchStart(createTouchEvent('touchstart', 100, 200));
    expect(result.current.moved.current).toBe(false);

    result.current.onTouchMove(createTouchEvent('touchmove', 120, 200));
    expect(result.current.moved.current).toBe(true);
  });

  it('should reset state after successful swipe', () => {
    const onRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onRight, threshold: 30 }));

    // First swipe
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 200));
    result.current.onTouchMove(createTouchEvent('touchmove', 150, 200));
    result.current.onTouchEnd(createTouchEvent('touchend', 150, 200));

    expect(onRight).toHaveBeenCalledTimes(1);

    // Second swipe
    result.current.onTouchStart(createTouchEvent('touchstart', 100, 200));
    result.current.onTouchMove(createTouchEvent('touchmove', 150, 200));
    result.current.onTouchEnd(createTouchEvent('touchend', 150, 200));

    expect(onRight).toHaveBeenCalledTimes(2);
  });
});
