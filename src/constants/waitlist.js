/**
 * @fileoverview Pro waitlist constants (demand validation, pre-launch).
 */

/** @typedef {'landing' | 'app' | 'direct'} WaitlistSource */

export const WAITLIST_SOURCES = {
  LANDING: 'landing',
  APP: 'app',
  DIRECT: 'direct',
};

export const WAITLIST_EMAIL_STORAGE_KEY = 'bayan-flow:waitlist-email';
export const WAITLIST_BANNER_DISMISSED_KEY =
  'bayan-flow:pro-waitlist-banner-dismissed';

const WAITLIST_SOURCE_SET = new Set(Object.values(WAITLIST_SOURCES));

/**
 * @param {string | null | undefined} value
 * @returns {WaitlistSource}
 */
export function parseWaitlistSource(value) {
  if (typeof value === 'string' && WAITLIST_SOURCE_SET.has(value)) {
    return /** @type {WaitlistSource} */ (value);
  }
  return WAITLIST_SOURCES.DIRECT;
}
