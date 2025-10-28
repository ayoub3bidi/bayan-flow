/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useRef } from 'react';

/**
 * Custom hook for detecting horizontal swipe gestures
 * Prevents false positives during vertical scrolling
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onLeft - Callback for left swipe
 * @param {Function} options.onRight - Callback for right swipe
 * @param {number} options.threshold - Minimum distance in pixels to trigger swipe (default: 30)
 * @returns {Object} Touch event handlers
 */
export default function useSwipe({
  onLeft = () => {},
  onRight = () => {},
  threshold = 30,
} = {}) {
  const startX = useRef(null);
  const startY = useRef(null);
  const moved = useRef(false);

  function onTouchStart(e) {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    moved.current = false;
  }

  function onTouchMove() {
    moved.current = true;
  }

  function onTouchEnd(e) {
    if (startX.current == null || startY.current == null) {
      return;
    }

    const t = e.changedTouches[0];
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;

    // Ignore vertical swipes (prioritize scrolling)
    if (Math.abs(dy) > Math.abs(dx)) {
      startX.current = null;
      startY.current = null;
      return;
    }

    // Trigger callback if horizontal swipe exceeds threshold
    if (Math.abs(dx) >= threshold) {
      if (dx > 0) {
        onRight();
      } else {
        onLeft();
      }
    }

    startX.current = null;
    startY.current = null;
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    moved,
  };
}
