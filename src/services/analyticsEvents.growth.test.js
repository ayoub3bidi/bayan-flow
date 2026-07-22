/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackWaitlistJoined,
  trackUpgradeLimitHit,
  WAITLIST_JOINED,
  UPGRADE_LIMIT_HIT,
} from './analyticsEvents.js';
import { captureEvent } from './analytics.js';

vi.mock('./analytics.js', () => ({
  captureEvent: vi.fn(),
}));

describe('analyticsEvents growth conversions', () => {
  beforeEach(() => {
    vi.mocked(captureEvent).mockClear();
  });

  it('tracks waitlist_joined with source and position', () => {
    trackWaitlistJoined('pro_page', 3);
    expect(captureEvent).toHaveBeenCalledWith(WAITLIST_JOINED, {
      source: 'pro_page',
      position: 3,
    });
  });

  it('tracks upgrade_limit_hit with limit', () => {
    trackUpgradeLimitHit(12);
    expect(captureEvent).toHaveBeenCalledWith(UPGRADE_LIMIT_HIT, {
      limit: 12,
    });
  });
});
