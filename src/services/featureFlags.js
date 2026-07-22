/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import posthog from 'posthog-js';

/**
 * Check if a feature flag is enabled.
 * @param {string} flagName - Flag key (e.g., 'feature-pro-upgrade-modal')
 * @param {boolean} [defaultValue=false] - Default if flag not found
 * @returns {boolean}
 */
export function isFeatureEnabled(flagName, defaultValue = false) {
  return posthog?.isFeatureEnabled(flagName) ?? defaultValue;
}

/**
 * Get the feature flag value (boolean or multivariate string key).
 * @param {string} flagName
 * @returns {boolean|string|undefined}
 */
export function getFeatureFlagVariant(flagName) {
  return posthog?.getFeatureFlag?.(flagName);
}

/**
 * Get the payload of a feature flag.
 * @param {string} flagName
 * @returns {any|undefined}
 */
export function getFeatureFlagPayload(flagName) {
  return posthog?.getFeatureFlagPayload(flagName);
}

// ─── Flag Naming Convention ───────────────────────────────────────────────────
//
// Use the pattern: feature-{name}-{variant}
//
// Examples:
//   feature-pro-upgrade-modal-control
//   feature-pro-upgrade-modal-test
//   feature-dark-mode-enabled
//   feature-new-onboarding-rollout
//
// This keeps flags organized and easy to search in PostHog.
