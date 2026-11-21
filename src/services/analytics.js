/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import posthog from 'posthog-js';

/** @type {boolean} */
let isInitialized = false;

/** @type {boolean} When true, all tracking calls become no-ops. */
let isBypassed = false;

/** @type {boolean | null} Visitor's cookie choice; null until they pick one. */
let consentGranted = null;

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
    isBypassed = true;
    return;
  }

  // DNT / Global Privacy Control: no analytics at all, not even cookieless.
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) {
    isBypassed = true;
    return;
  }

  // Skip analytics in local development
  if (
    import.meta.env.DEV &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    isBypassed = true;
    return;
  }

  posthog.init(token, {
    api_host: host,
    ui_host: 'https://us.posthog.com',
    defaults: '2026-05-30',
    capture_pageview: 'history_change',
    autocapture: false,
    disable_surveys: true,
    capture_performance: true,
    capture_dead_clicks: true,
    rageclick: true,
    person_profiles: 'identified_only',
    // Until the visitor accepts, count them without cookies or storage
    // (server-side hash, no replay). Requires cookieless enabled in the project.
    cookieless_mode: 'on_reject',
    opt_out_capturing_by_default: true,
    session_recording: {
      // Sample to stretch the free-tier 5k recordings/month.
      sampleRate: 0.2,
      maskTextSelector: '.ph-no-capture, [data-sensitive]',
      maskAllInputs: true,
      maskAllMedia: true,
    },
  });

  isInitialized = true;
}

/**
 * Apply the visitor's cookie choice. No-op when PostHog already has it,
 * so a stored choice does not emit `$opt_in` on every page load.
 * @param {boolean} granted
 */
export function setAnalyticsConsent(granted) {
  consentGranted = granted;
  if (!isInitialized) return;
  const wanted = granted ? 'granted' : 'denied';
  if (posthog.get_explicit_consent_status() === wanted) return;
  if (granted) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

/**
 * Identify a user with PostHog.
 * @param {object} user - Supabase user object
 * @param {object} profile - Derived profile view
 */
export function identifyUser(user, profile) {
  if (!user || !profile || isBypassed) return;

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
  if (isBypassed) return;
  posthog?.reset();
  // reset() also wipes PostHog's stored consent; restore it so a consenting
  // visitor is not dropped to cookieless mode (which breaks identify merges).
  if (consentGranted === true) {
    posthog.opt_in_capturing({ captureEventName: false });
  } else if (consentGranted === false) {
    posthog.opt_out_capturing();
  }
}

/**
 * Capture a custom event.
 * @param {string} eventName
 * @param {object} [properties]
 */
export function captureEvent(eventName, properties = {}) {
  if (isBypassed) return;
  posthog?.capture(eventName, properties);
}
