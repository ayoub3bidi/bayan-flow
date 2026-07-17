/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import posthog from 'posthog-js';

/** @type {boolean} */
let isInitialized = false;

/**
 * Initialize PostHog analytics.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function initPostHog() {
  if (isInitialized) return;

  const token = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_API_HOST;

  if (!token || !host) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] PostHog env vars missing — analytics disabled');
    }
    return;
  }

  // Skip analytics in local development
  if (
    import.meta.env.DEV &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return;
  }

  posthog.init(token, {
    api_host: host,
    ui_host: 'https://us.posthog.com',
    defaults: '2026-05-30',
    autocapture: false,
    disable_surveys: true,
    capture_performance: true,
    capture_dead_clicks: true,
    rageclick: true,
    person_profiles: 'identified_only',
    session_recording: {
      maskTextSelector: '.ph-no-capture, [data-sensitive]',
      maskAllInputs: true,
      maskAllMedia: true,
    },
  });

  // Respect Do Not Track
  if (navigator.doNotTrack === '1') {
    posthog.opt_out_capturing();
  }

  isInitialized = true;
}

/**
 * Identify a user with PostHog.
 * @param {object} user - Supabase user object
 * @param {object} profile - Derived profile view
 */
export function identifyUser(user, profile) {
  if (!user || !profile) return;

  posthog?.identify(user.id, {
    email: profile.email,
    plan: profile.plan,
    display_name: profile.displayName,
    language: document.documentElement.lang,
  });
}

/**
 * Reset PostHog identity (on logout).
 */
export function resetUser() {
  posthog?.reset();
}

/**
 * Capture a custom event.
 * @param {string} eventName
 * @param {object} [properties]
 */
export function captureEvent(eventName, properties = {}) {
  posthog?.capture(eventName, properties);
}
