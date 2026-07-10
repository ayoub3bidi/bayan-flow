/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { checkPlatformAccess } from './accessService.js';
import {
  mockSupabaseConfigured,
  resetSupabaseMocks,
  supabaseFunctionsInvokeMock,
} from '../test/supabaseMock.js';

describe('accessService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
  });

  it('returns allowed when platform-access succeeds', async () => {
    supabaseFunctionsInvokeMock.mockResolvedValueOnce({
      data: { allowed: true },
      error: null,
    });

    await expect(checkPlatformAccess()).resolves.toEqual({ allowed: true });
  });

  it('blocks when account is banned', async () => {
    supabaseFunctionsInvokeMock.mockResolvedValueOnce({
      data: { allowed: false, reason: 'account_banned' },
      error: null,
    });

    await expect(checkPlatformAccess()).resolves.toEqual({
      allowed: false,
      reason: 'account_banned',
    });
  });

  it('fails open on invoke errors', async () => {
    supabaseFunctionsInvokeMock.mockResolvedValueOnce({
      data: null,
      error: new Error('network'),
    });

    await expect(checkPlatformAccess()).resolves.toEqual({
      allowed: true,
      failOpen: true,
    });
  });
});
