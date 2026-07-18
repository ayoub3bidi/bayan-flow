/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { PostHogProvider as PHProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { initPostHog } from '../services/analytics';

// Initialize PostHog once at module load
initPostHog();

/**
 * PostHog provider wrapper.
 * Provides PostHog context to the entire app.
 * @param {{ children: import('react').ReactNode }} props
 */
export function PostHogProvider({ children }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
