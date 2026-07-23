/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef } from 'react';
import { PostHogProvider as PHProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { initPostHog } from '../services/analytics';

/**
 * PostHog provider wrapper.
 * Defers PostHog initialization until analytics consent is granted,
 * and opts out when consent is revoked.
 * @param {{ analytics: boolean, children: import('react').ReactNode }} props
 */
export function PostHogProvider({ analytics, children }) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (analytics && !initializedRef.current) {
      initPostHog();
      initializedRef.current = true;
    } else if (initializedRef.current) {
      if (analytics) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    }
  }, [analytics]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
