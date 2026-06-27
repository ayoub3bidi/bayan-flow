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

vi.mock('../lib/googleIdentity.js', () => ({
  disableGoogleAutoSelect: vi.fn(),
  isGoogleAuthConfigured: vi.fn(() => true),
  requestGoogleSignInPopup: vi.fn(async () => ({
    idToken: 'google-id-token',
  })),
}));

import * as authService from './authService';
import { requestGoogleSignInPopup } from '../lib/googleIdentity.js';

describe('authService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
    vi.mocked(requestGoogleSignInPopup).mockResolvedValue({
      idToken: 'google-id-token',
    });
  });

  it('signInWithGoogleIdToken calls Supabase signInWithIdToken', async () => {
    await authService.signInWithGoogleIdToken(
      'token-123',
      'nonce-123',
      'access-123'
    );

    expect(supabaseAuthMock.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'token-123',
      nonce: 'nonce-123',
      access_token: 'access-123',
    });
    expect(supabaseAuthMock.updateUser).not.toHaveBeenCalled();
  });

  it('signInWithGoogleIdToken syncs picture from JWT claims', async () => {
    const payload = btoa(JSON.stringify({ picture: 'https://lh3.googleusercontent.com/a/test' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const idToken = `header.${payload}.signature`;

    await authService.signInWithGoogleIdToken(idToken);

    expect(supabaseAuthMock.updateUser).toHaveBeenCalledWith({
      data: {
        picture: 'https://lh3.googleusercontent.com/a/test',
        avatar_url: 'https://lh3.googleusercontent.com/a/test',
      },
    });
  });

  it('signInWithGoogle uses GIS button then Supabase signInWithIdToken', async () => {
    await authService.signInWithGoogle();

    expect(requestGoogleSignInPopup).toHaveBeenCalled();
    expect(supabaseAuthMock.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'google-id-token',
      nonce: undefined,
      access_token: undefined,
    });
  });

  it('signOut disables Google auto-select and delegates to Supabase auth', async () => {
    const { disableGoogleAutoSelect } =
      await import('../lib/googleIdentity.js');
    await authService.signOut();
    expect(disableGoogleAutoSelect).toHaveBeenCalled();
    expect(supabaseAuthMock.signOut).toHaveBeenCalled();
  });

  it('getSession returns null when client is not configured', async () => {
    mockSupabaseConfigured(false);
    await expect(authService.getSession()).resolves.toBeNull();
  });

  it('isAuthConfigured requires Supabase and Google client ID', () => {
    expect(authService.isAuthConfigured()).toBe(true);
  });
});
