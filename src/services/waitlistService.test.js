/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  joinWaitlist,
  normalizeWaitlistEmail,
  getWaitlistPublicCount,
  persistWaitlistEmail,
  readStoredWaitlistEmail,
} from './waitlistService';
import {
  WAITLIST_EMAIL_STORAGE_KEY,
  WAITLIST_SOURCES,
} from '@/constants/waitlist';

vi.mock('@/lib/supabaseClient', () => import('@/test/supabaseMock'));

import {
  getSupabaseClient,
  resetSupabaseMocks,
  mockSupabaseConfigured,
  createSupabaseQueryBuilder,
  supabaseFromMock,
  supabaseFunctionsInvokeMock,
  supabaseClientMock,
} from '@/test/supabaseMock';

describe('waitlistService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
    localStorage.clear();
    supabaseClientMock.rpc.mockResolvedValue({ data: 12, error: null });
  });

  describe('normalizeWaitlistEmail', () => {
    it('trims and lowercases valid email', () => {
      expect(normalizeWaitlistEmail('  User@Example.COM ')).toBe(
        'user@example.com'
      );
    });

    it('returns null for invalid email', () => {
      expect(normalizeWaitlistEmail('not-an-email')).toBeNull();
    });
  });

  describe('persistWaitlistEmail / readStoredWaitlistEmail', () => {
    it('stores and reads normalized email', () => {
      persistWaitlistEmail('user@example.com');
      expect(localStorage.getItem(WAITLIST_EMAIL_STORAGE_KEY)).toBe(
        'user@example.com'
      );
      expect(readStoredWaitlistEmail()).toBe('user@example.com');
    });

    it('migrates email from sessionStorage to localStorage', () => {
      sessionStorage.setItem(WAITLIST_EMAIL_STORAGE_KEY, 'legacy@example.com');
      expect(readStoredWaitlistEmail()).toBe('legacy@example.com');
      expect(localStorage.getItem(WAITLIST_EMAIL_STORAGE_KEY)).toBe(
        'legacy@example.com'
      );
    });
  });

  describe('getWaitlistPublicCount', () => {
    it('returns 0 when client is null', async () => {
      getSupabaseClient.mockReturnValue(null);
      await expect(getWaitlistPublicCount()).resolves.toBe(0);
    });

    it('returns rpc count', async () => {
      await expect(getWaitlistPublicCount()).resolves.toBe(12);
      expect(supabaseClientMock.rpc).toHaveBeenCalledWith(
        'waitlist_public_count'
      );
    });
  });

  describe('joinWaitlist', () => {
    it('returns invalid_email for bad input', async () => {
      await expect(joinWaitlist('bad')).resolves.toEqual({
        status: 'invalid_email',
      });
    });

    it('returns unavailable when supabase is not configured', async () => {
      getSupabaseClient.mockReturnValue(null);
      await expect(joinWaitlist('user@example.com')).resolves.toEqual({
        status: 'unavailable',
      });
    });

    it('inserts row and returns joined with position', async () => {
      const insert = vi.fn(function insertMock() {
        return createSupabaseQueryBuilder();
      });
      supabaseFromMock.mockReturnValue(createSupabaseQueryBuilder({ insert }));

      const result = await joinWaitlist('user@example.com', {
        userId: 'user-1',
        source: WAITLIST_SOURCES.APP,
      });

      expect(insert).toHaveBeenCalledWith({
        email: 'user@example.com',
        source: WAITLIST_SOURCES.APP,
        user_id: 'user-1',
      });
      expect(result).toEqual({ status: 'joined', position: 12 });
      expect(supabaseFunctionsInvokeMock).toHaveBeenCalledWith(
        'waitlist-welcome',
        {
          method: 'POST',
          body: {
            email: 'user@example.com',
            position: 12,
          },
        }
      );
    });

    it('returns already_joined on duplicate email', async () => {
      supabaseFromMock.mockReturnValue(
        createSupabaseQueryBuilder({
          then(onFulfilled, onRejected) {
            return Promise.resolve({
              data: null,
              error: { code: '23505', message: 'duplicate' },
            }).then(onFulfilled, onRejected);
          },
        })
      );

      await expect(joinWaitlist('user@example.com')).resolves.toEqual({
        status: 'already_joined',
      });
    });
  });
});
