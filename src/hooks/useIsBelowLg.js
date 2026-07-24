/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useState } from 'react';

/** Matches Tailwind `lg` (1024px): true when viewport is below that breakpoint. */
export const BELOW_LG_MEDIA_QUERY = '(max-width: 1023px)';

/**
 * Whether the viewport is below the Tailwind `lg` breakpoint (1024px).
 * Used for the canvas-first mobile shell and shared chrome adaptations.
 *
 * @returns {boolean}
 */
export function useIsBelowLg() {
  const [isBelowLg, setIsBelowLg] = useState(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return false;
    }
    return window.matchMedia(BELOW_LG_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mediaQuery = window.matchMedia(BELOW_LG_MEDIA_QUERY);
    const sync = () => setIsBelowLg(mediaQuery.matches);

    sync();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', sync);
      return () => mediaQuery.removeEventListener('change', sync);
    }

    mediaQuery.addListener(sync);
    return () => mediaQuery.removeListener(sync);
  }, []);

  return isBelowLg;
}

export default useIsBelowLg;
