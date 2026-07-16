/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/** @typedef {'L3' | 'L2' | 'watch'} RiskLevel */

/** @typedef {{ level: RiskLevel, banHours?: number, reason: string }} SignupRiskResult */

export const SIGNUP_RATE_LIMIT = {
  windowMinutes: 60,
  maxSignups: 3,
};

export const RISK_THRESHOLDS = {
  L2: { windowMinutes: 10, count: 5, banHours: 24 },
  L3: { windowMinutes: 60, count: 15, banHours: 24 * 7 },
  watch: { windowMinutes: 60, count: 5 },
};

/**
 * @param {string | null | undefined} ip
 * @returns {boolean}
 */
export function isValidIp(ip) {
  return typeof ip === 'string' && ip.trim().length > 0;
}

/**
 * @param {Array<{ ip?: string | null, expires_at?: string | null }>} bannedRows
 * @param {string} ip
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isIpBanned(bannedRows, ip, now = new Date()) {
  if (!isValidIp(ip)) {
    return false;
  }

  const row = bannedRows.find(entry => entry.ip === ip);
  if (!row) {
    return false;
  }

  if (!row.expires_at) {
    return true;
  }

  return new Date(row.expires_at).getTime() > now.getTime();
}

/**
 * @param {Array<{ created_at: string }>} events
 * @param {number} windowMinutes
 * @param {Date} [now]
 * @returns {number}
 */
export function countRecentSignups(events, windowMinutes, now = new Date()) {
  const cutoff = now.getTime() - windowMinutes * 60 * 1000;
  return events.filter(event => new Date(event.created_at).getTime() >= cutoff)
    .length;
}

/**
 * @param {number} signupsIn60Minutes
 * @returns {boolean}
 */
export function shouldRejectSignupRateLimit(signupsIn60Minutes) {
  return signupsIn60Minutes >= SIGNUP_RATE_LIMIT.maxSignups;
}

/**
 * Progressive IP auto-ban evaluation. Harshest level wins.
 * @param {Array<{ created_at: string }>} events
 * @param {Date} [now]
 * @returns {SignupRiskResult | null}
 */
export function evaluateSignupRisk(events, now = new Date()) {
  const l3Count = countRecentSignups(
    events,
    RISK_THRESHOLDS.L3.windowMinutes,
    now
  );
  if (l3Count >= RISK_THRESHOLDS.L3.count) {
    return {
      level: 'L3',
      banHours: RISK_THRESHOLDS.L3.banHours,
      reason: `${l3Count} signups in ${RISK_THRESHOLDS.L3.windowMinutes} minutes`,
    };
  }

  const l2Count = countRecentSignups(
    events,
    RISK_THRESHOLDS.L2.windowMinutes,
    now
  );
  if (l2Count >= RISK_THRESHOLDS.L2.count) {
    return {
      level: 'L2',
      banHours: RISK_THRESHOLDS.L2.banHours,
      reason: `${l2Count} signups in ${RISK_THRESHOLDS.L2.windowMinutes} minutes`,
    };
  }

  const watchCount = countRecentSignups(
    events,
    RISK_THRESHOLDS.watch.windowMinutes,
    now
  );
  if (watchCount >= RISK_THRESHOLDS.watch.count) {
    return {
      level: 'watch',
      reason: `${watchCount} signups in ${RISK_THRESHOLDS.watch.windowMinutes} minutes`,
    };
  }

  return null;
}

/**
 * @param {Date} [now]
 * @param {number} hours
 * @returns {string}
 */
export function banExpiresAtIso(now, hours) {
  return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}
