/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockSupabaseConfigured,
  resetSupabaseMocks,
  supabaseAuthMock,
} from '../test/supabaseMock.js';
import * as authService from './authService';

describe('authService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
    vi.stubGlobal('location', {
      ...window.location,
      origin: 'http://localhost:5173',
      pathname: '/',
      search: '',
    });
  });

  it('signInWithGoogle opens a popup and completes after auth message', async () => {
    supabaseAuthMock.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://oauth.example.com/auth' },
      error: null,
    });
    supabaseAuthMock.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });

    const popup = { closed: false, close: vi.fn() };
    vi.stubGlobal(
      'open',
      vi.fn(() => popup)
    );

    const signInPromise = authService.signInWithGoogle();

    await vi.waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        'https://oauth.example.com/auth',
        expect.any(String),
        expect.stringContaining('popup=yes')
      );
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: authService.AUTH_COMPLETE_MESSAGE },
        origin: 'http://localhost:5173',
      })
    );

    await signInPromise;

    expect(supabaseAuthMock.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/auth/callback',
        skipBrowserRedirect: true,
      },
    });
  });

  it('signOut delegates to Supabase auth', async () => {
    await authService.signOut();
    expect(supabaseAuthMock.signOut).toHaveBeenCalled();
  });

  it('getSession returns null when client is not configured', async () => {
    mockSupabaseConfigured(false);
    await expect(authService.getSession()).resolves.toBeNull();
  });
});
