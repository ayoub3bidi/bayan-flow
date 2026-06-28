import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockSupabaseConfigured,
  resetSupabaseMocks,
  supabaseFromMock,
} from '../test/supabaseMock.js';

import { getUserPlan } from './entitlementService';

describe('entitlementService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
  });

  it('returns free when profile is null', async () => {
    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    });

    const plan = await getUserPlan('user-1');
    expect(plan).toBe('free');
  });

  it('returns free when plan is not pro', async () => {
    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({
        data: { plan: 'free' },
        error: null,
      })),
    });

    const plan = await getUserPlan('user-1');
    expect(plan).toBe('free');
  });

  it('returns pro when plan is pro', async () => {
    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({
        data: { plan: 'pro' },
        error: null,
      })),
    });

    const plan = await getUserPlan('user-1');
    expect(plan).toBe('pro');
  });
});
