/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { PostHogProvider as PHProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { initPostHog, setAnalyticsConsent } from '../services/analytics';

/**
 * PostHog provider wrapper.
 * Initializes PostHog on mount in cookieless mode; accepting the cookie
 * banner opts in to cookie tracking, declining keeps it cookieless.
 * @param {{ consent: boolean | null, children: import('react').ReactNode }} props
 */
export function PostHogProvider({ consent, children }) {
  useEffect(() => {
    initPostHog();
    if (consent !== null) {
      setAnalyticsConsent(consent);
    }
  }, [consent]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
