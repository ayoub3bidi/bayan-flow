/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { vi } from 'vitest';

export const authStateChangeCallbackRef = { current: null };

export const supabaseAuthMock = {
  signInWithIdToken: vi.fn(async () => ({
    data: { session: null },
    error: null,
  })),
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
  updateUser: vi.fn(async () => ({ data: { user: null }, error: null })),
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
  supabaseAuthMock.signInWithIdToken.mockReset();
  supabaseAuthMock.signOut.mockReset();
  supabaseAuthMock.getSession.mockReset();
  supabaseAuthMock.onAuthStateChange.mockReset();
  supabaseAuthMock.updateUser.mockReset();
  supabaseFromMock.mockReset();
  authStateChangeCallbackRef.current = null;
  supabaseAuthMock.signInWithIdToken.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  supabaseAuthMock.signOut.mockResolvedValue({ error: null });
  supabaseAuthMock.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  supabaseAuthMock.onAuthStateChange.mockImplementation(callback => {
    authStateChangeCallbackRef.current = callback;
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    };
  });
  supabaseAuthMock.updateUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
  supabaseFromMock.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
  });
}
