/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import {
  banExpiresAtIso,
  countRecentSignups,
  evaluateSignupRisk,
  isIpBanned,
  shouldRejectSignupRateLimit,
} from './banLogic.js';

describe('banLogic', () => {
  const now = new Date('2026-07-10T12:00:00.000Z');

  it('detects active and expired IP bans', () => {
    expect(
      isIpBanned(
        [{ ip: '1.2.3.4', expires_at: '2026-07-11T00:00:00.000Z' }],
        '1.2.3.4',
        now
      )
    ).toBe(true);

    expect(
      isIpBanned(
        [{ ip: '1.2.3.4', expires_at: '2026-07-09T00:00:00.000Z' }],
        '1.2.3.4',
        now
      )
    ).toBe(false);
  });

  it('rejects signup rate limit at 3 events in 60 minutes', () => {
    const events = [
      { created_at: '2026-07-10T11:50:00.000Z' },
      { created_at: '2026-07-10T11:55:00.000Z' },
      { created_at: '2026-07-10T11:58:00.000Z' },
    ];

    expect(countRecentSignups(events, 60, now)).toBe(3);
    expect(shouldRejectSignupRateLimit(3)).toBe(true);
    expect(shouldRejectSignupRateLimit(2)).toBe(false);
  });

  it('applies harshest progressive risk level', () => {
    const l2Events = Array.from({ length: 5 }, (_, index) => ({
      created_at: new Date(now.getTime() - index * 60 * 1000).toISOString(),
    }));

    expect(evaluateSignupRisk(l2Events, now)?.level).toBe('L2');

    const watchEvents = Array.from({ length: 5 }, (_, index) => ({
      created_at: new Date(now.getTime() - index * 5 * 60 * 1000).toISOString(),
    }));

    expect(evaluateSignupRisk(watchEvents, now)?.level).toBe('watch');
  });

  it('computes ban expiry timestamps', () => {
    expect(banExpiresAtIso(now, 24)).toBe('2026-07-11T12:00:00.000Z');
  });
});
