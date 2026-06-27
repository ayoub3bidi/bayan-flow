/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { vi } from 'vitest';

export const authStateChangeCallbackRef = { current: null };

export const supabaseAuthMock = {
  signInWithOAuth: vi.fn(async () => ({ data: {}, error: null })),
  signOut: vi.fn(async () => ({ error: null })),
  getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
  onAuthStateChange: vi.fn(callback => {
    authStateChangeCallbackRef.current = callback;
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    };
  }),
};

export const supabaseFromMock = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(async () => ({ data: null, error: null })),
}));

export const supabaseClientMock = {
  auth: supabaseAuthMock,
  from: supabaseFromMock,
};

export const isSupabaseConfigured = vi.fn(() => false);
export const getSupabaseClient = vi.fn(() => null);

export function mockSupabaseConfigured(configured = true) {
  isSupabaseConfigured.mockReturnValue(configured);
  getSupabaseClient.mockReturnValue(configured ? supabaseClientMock : null);
}

export function resetSupabaseMocks() {
  isSupabaseConfigured.mockReset();
  isSupabaseConfigured.mockReturnValue(false);
  getSupabaseClient.mockReset();
  getSupabaseClient.mockReturnValue(null);
  supabaseAuthMock.signInWithOAuth.mockClear();
  supabaseAuthMock.signOut.mockClear();
  supabaseAuthMock.getSession.mockClear();
  supabaseAuthMock.onAuthStateChange.mockClear();
  supabaseFromMock.mockClear();
  authStateChangeCallbackRef.current = null;
}
