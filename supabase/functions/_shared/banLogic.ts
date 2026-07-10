/**
 * Shared ban logic for edge functions (mirrors src/utils/banLogic.js).
 */

export const SIGNUP_RATE_LIMIT = {
  windowMinutes: 60,
  maxSignups: 3,
};

export const RISK_THRESHOLDS = {
  L2: { windowMinutes: 10, count: 5, banHours: 24 },
  L3: { windowMinutes: 60, count: 15, banHours: 24 * 7 },
  watch: { windowMinutes: 60, count: 5 },
};

export function isValidIp(ip: string | null | undefined): boolean {
  return typeof ip === 'string' && ip.trim().length > 0;
}

type BannedRow = { ip?: string | null; expires_at?: string | null };
type SignupEvent = { created_at: string };

export function isIpBanned(
  bannedRows: BannedRow[],
  ip: string,
  now = new Date()
): boolean {
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

export function countRecentSignups(
  events: SignupEvent[],
  windowMinutes: number,
  now = new Date()
): number {
  const cutoff = now.getTime() - windowMinutes * 60 * 1000;
  return events.filter(event => new Date(event.created_at).getTime() >= cutoff)
    .length;
}

export function shouldRejectSignupRateLimit(signupsIn60Minutes: number): boolean {
  return signupsIn60Minutes >= SIGNUP_RATE_LIMIT.maxSignups;
}

type RiskLevel = 'L3' | 'L2' | 'watch';

export type SignupRiskResult = {
  level: RiskLevel;
  banHours?: number;
  reason: string;
};

export function evaluateSignupRisk(
  events: SignupEvent[],
  now = new Date()
): SignupRiskResult | null {
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

export function banExpiresAtIso(now: Date, hours: number): string {
  return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}
