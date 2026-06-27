/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';

/**
 * Prevent the document from scrolling while an overlay (side panel, modal) is open.
 * Preserves scroll position using position:fixed on body.
 *
 * @param {boolean} isLocked - Whether scroll should be locked
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (
      !isLocked ||
      typeof window === 'undefined' ||
      typeof document === 'undefined'
    ) {
      return;
    }

    const scrollY = window.scrollY;
    const { body } = document;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;
    const previousOverflow = body.style.overflow;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      body.style.overflow = previousOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
