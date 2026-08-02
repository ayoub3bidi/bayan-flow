/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  PLAN_TIERS,
  isAlgorithmFreeForAnonymous,
} from '@/constants/algorithmEntitlements';
import {
  FREE_TIER_FAVORITE_SLOT_LIMIT,
  PRO_TIER_FAVORITE_SLOT_LIMIT,
} from '@/constants/personalLearning';
import { DEFAULT_VIDEO_WATERMARK } from '@/video/constants';

// Session limits for anonymous users
export const ANONYMOUS_VISUALIZATION_LIMIT = 12;
const ANONYMOUS_COMPLEXITY_VIEW_LIMIT = 2;

// localStorage keys
const STORAGE_KEY_VIZ_COUNT = 'anon_viz_count';
const STORAGE_KEY_COMPLEXITY_COUNT = 'anon_complexity_views';

/**
 * Get the user's plan tier from the user object.
 * @param {object | null} user - User object from AuthContext (null for anonymous)
 * @returns {'anonymous' | 'free' | 'pro'}
 */
export function getUserPlan(user) {
  if (!user) {
    return PLAN_TIERS.ANONYMOUS;
  }
  if (
    user.plan === PLAN_TIERS.PRO ||
    user.app_metadata?.plan === PLAN_TIERS.PRO
  ) {
    return PLAN_TIERS.PRO;
  }
  return PLAN_TIERS.FREE;
}

/**
 * Check if user can access the specified algorithm.
 * @param {string} algorithmKey - Runtime algorithm key (e.g. 'bubbleSort')
 * @param {string} categoryType - Category type from ALGORITHM_TYPES
 * @param {object | null} user - User object from AuthContext
 * @returns {boolean}
 */
export function canAccessAlgorithm(algorithmKey, categoryType, user) {
  const plan = getUserPlan(user);
  if (plan === PLAN_TIERS.FREE || plan === PLAN_TIERS.PRO) {
    return true; // All algorithms for signed-in users
  }
  // Anonymous: check allowlist
  return isAlgorithmFreeForAnonymous(algorithmKey, categoryType);
}

/**
 * Check if user can use manual controls (step forward/backward, manual mode).
 * Anonymous users are locked to autoplay.
 * @param {object | null} user
 * @returns {boolean}
 */
export function canUseManualControls(user) {
  return getUserPlan(user) !== PLAN_TIERS.ANONYMOUS;
}

/**
 * Check if user can change animation speed.
 * Anonymous users are locked to MEDIUM speed.
 * @param {object | null} user
 * @returns {boolean}
 */
export function canChangeSpeed(user) {
  return getUserPlan(user) !== PLAN_TIERS.ANONYMOUS;
}

/**
 * Check if user can use category-specific controls (grid size, sort order, graph scenarios, tree node count).
 * @param {object | null} user
 * @returns {boolean}
 */
export function canUseCategoryControls(user) {
  return getUserPlan(user) !== PLAN_TIERS.ANONYMOUS;
}

/**
 * Maximum favorite algorithm slots for the user's plan tier.
 * @param {object | null} user
 * @returns {number}
 */
export function getFavoriteSlotLimit(user) {
  const plan = getUserPlan(user);
  if (plan === PLAN_TIERS.PRO) {
    return PRO_TIER_FAVORITE_SLOT_LIMIT;
  }
  if (plan === PLAN_TIERS.FREE) {
    return FREE_TIER_FAVORITE_SLOT_LIMIT;
  }
  return 0;
}

/**
 * Check if user can run another visualization.
 * Anonymous users have a session limit; signed-in users have unlimited.
 * @param {object | null} user
 * @returns {boolean}
 */
export function canRunVisualization(user) {
  const plan = getUserPlan(user);
  if (plan === PLAN_TIERS.FREE || plan === PLAN_TIERS.PRO) {
    return true; // Unlimited
  }
  // Anonymous: check session limit
  const count = parseInt(
    localStorage.getItem(STORAGE_KEY_VIZ_COUNT) || '0',
    10
  );
  return count < ANONYMOUS_VISUALIZATION_LIMIT;
}

/**
 * Increment the anonymous visualization counter.
 * Should be called each time an anonymous user starts a visualization.
 */
export function incrementVisualizationCount() {
  const count = parseInt(
    localStorage.getItem(STORAGE_KEY_VIZ_COUNT) || '0',
    10
  );
  localStorage.setItem(STORAGE_KEY_VIZ_COUNT, String(count + 1));
}

/**
 * Get the number of remaining visualizations for the user.
 * Returns Infinity for signed-in users.
 * @param {object | null} user
 * @returns {number}
 */
export function getRemainingVisualizations(user) {
  const plan = getUserPlan(user);
  if (plan === PLAN_TIERS.FREE || plan === PLAN_TIERS.PRO) {
    return Infinity;
  }
  const count = parseInt(
    localStorage.getItem(STORAGE_KEY_VIZ_COUNT) || '0',
    10
  );
  return Math.max(0, ANONYMOUS_VISUALIZATION_LIMIT - count);
}

/**
 * Check if user can view the complexity panel (ungated).
 * Anonymous users have a limit of 2 views per completion, then gated.
 * @param {object | null} user
 * @returns {boolean}
 */
export function canViewComplexityPanel(user) {
  const plan = getUserPlan(user);
  if (plan === PLAN_TIERS.FREE || plan === PLAN_TIERS.PRO) {
    return true; // Unlimited
  }
  // Anonymous: check view limit
  const count = parseInt(
    localStorage.getItem(STORAGE_KEY_COMPLEXITY_COUNT) || '0',
    10
  );
  return count < ANONYMOUS_COMPLEXITY_VIEW_LIMIT;
}

/**
 * Check if the user can begin a video export.
 * Anonymous users must sign in. Signed-in users (Free and Pro) have unlimited
 * exports: rendering runs entirely client-side in the browser, so each export
 * costs the user's device and no infrastructure. The watermark — not a daily
 * cap — is what differentiates Free from Pro (see getExportWatermarkConfig).
 * If export ever moves server-side, enforce a real limit there.
 * @param {object | null} user
 * @returns {boolean}
 */
export function canRunVideoExport(user) {
  return getUserPlan(user) !== PLAN_TIERS.ANONYMOUS;
}

/**
 * Free users must keep the default Bayan Flow watermark. Pro will be able to
 * customize or remove it once the Pro tier exists.
 * @param {object | null} user
 * @returns {typeof DEFAULT_VIDEO_WATERMARK}
 */
export function getExportWatermarkConfig(user) {
  if (!canCustomizeExportWatermark(user)) {
    return { ...DEFAULT_VIDEO_WATERMARK, enabled: true };
  }
  return { ...DEFAULT_VIDEO_WATERMARK, ...(user?.exportWatermark ?? {}) };
}

/**
 * Check whether the user can customize or remove video export watermarks.
 * @param {object | null} user
 * @returns {boolean}
 */
export function canCustomizeExportWatermark(user) {
  return getUserPlan(user) === PLAN_TIERS.PRO;
}

/**
 * Increment the anonymous complexity view counter.
 * Should be called once per algorithm completion for anonymous users.
 */
export function incrementComplexityViewCount() {
  const count = parseInt(
    localStorage.getItem(STORAGE_KEY_COMPLEXITY_COUNT) || '0',
    10
  );
  localStorage.setItem(STORAGE_KEY_COMPLEXITY_COUNT, String(count + 1));
}

/**
 * Reset all session counters (viz count, complexity count).
 * Called on sign-in to give new users a clean slate.
 */
export function resetAllSessionCounters() {
  localStorage.removeItem(STORAGE_KEY_VIZ_COUNT);
  localStorage.removeItem(STORAGE_KEY_COMPLEXITY_COUNT);
}
