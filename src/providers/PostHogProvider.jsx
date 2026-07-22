/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { PostHogProvider as PHProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { initPostHog } from '../services/analytics';

/**
 * PostHog provider wrapper.
 * Defers PostHog initialization until analytics consent is granted.
 * @param {{ analytics: boolean, children: import('react').ReactNode }} props
 */
export function PostHogProvider({ analytics, children }) {
  useEffect(() => {
    if (analytics) {
      initPostHog();
    }
  }, [analytics]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
