/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  PLAN_TIERS,
  isAlgorithmFreeForAnonymous,
} from '@/constants/algorithmEntitlements';
import { DEFAULT_VIDEO_WATERMARK } from '@/video/constants';

// Session limits for anonymous users
export const ANONYMOUS_VISUALIZATION_LIMIT = 12;
const ANONYMOUS_COMPLEXITY_VIEW_LIMIT = 2;
const FREE_TIER_DAILY_EXPORT_LIMIT = 50;

// localStorage keys
const STORAGE_KEY_VIZ_COUNT = 'anon_viz_count';
const STORAGE_KEY_COMPLEXITY_COUNT = 'anon_complexity_views';
const FREE_EXPORT_DAILY_KEY_PREFIX = 'free_export_daily';

function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getUserStorageId(user) {
  if (!user) return null;
  if (user.id) return String(user.id);
  if (user.email) return `email_${hashString(String(user.email))}`;
  return null;
}

function getDailyExportStorageKey(user) {
  const userStorageId = getUserStorageId(user);
  if (!userStorageId) return null;
  return `${FREE_EXPORT_DAILY_KEY_PREFIX}_${userStorageId}`;
}

function readDailyExportCount(user) {
  const storageKey = getDailyExportStorageKey(user);
  if (!storageKey) return FREE_TIER_DAILY_EXPORT_LIMIT;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;

    const parsed = JSON.parse(raw);
    if (parsed?.date !== getUtcDateKey()) {
      return 0;
    }

    return Number.isFinite(parsed.count) ? parsed.count : 0;
  } catch {
    return 0;
  }
}

function writeDailyExportCount(user, count) {
  const storageKey = getDailyExportStorageKey(user);
  if (!storageKey) return;

  localStorage.setItem(
    storageKey,
    JSON.stringify({ date: getUtcDateKey(), count })
  );
}

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
 * Anonymous users must sign in. Free users have an internal daily abuse guard.
 * @param {object | null} user
 * @returns {boolean}
 */
export function canRunVideoExport(user) {
  const plan = getUserPlan(user);
  if (plan === PLAN_TIERS.ANONYMOUS) {
    return false;
  }
  if (plan === PLAN_TIERS.PRO) {
    return true;
  }
  return readDailyExportCount(user) < FREE_TIER_DAILY_EXPORT_LIMIT;
}

/**
 * Increment the signed-in user's daily export count.
 * Called after the user confirms orientation and an export begins.
 * @param {object | null} user
 */
export function incrementVideoExportCount(user) {
  const plan = getUserPlan(user);
  if (plan !== PLAN_TIERS.FREE) {
    return;
  }
  writeDailyExportCount(user, readDailyExportCount(user) + 1);
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
