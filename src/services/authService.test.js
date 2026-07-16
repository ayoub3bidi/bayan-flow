import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockSupabaseConfigured,
  resetSupabaseMocks,
  supabaseAuthMock,
} from '../test/supabaseMock.js';

vi.mock('../lib/googleIdentity.js', () => ({
  isGoogleAuthConfigured: vi.fn(() => true),
  requestGoogleSignInPopup: vi.fn(async () => ({
    idToken: 'google-id-token',
  })),
}));

import * as authService from './authService';
import { requestGoogleSignInPopup } from '../lib/googleIdentity.js';
import { isGoogleAuthConfigured } from '../lib/googleIdentity.js';

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
    const payload = btoa(
      JSON.stringify({ picture: 'https://lh3.googleusercontent.com/a/test' })
    )
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

  it('signInWithGoogleIdToken syncs full_name from JWT claims', async () => {
    const payload = btoa(JSON.stringify({ name: 'John Doe' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const idToken = `header.${payload}.signature`;

    await authService.signInWithGoogleIdToken(idToken);

    expect(supabaseAuthMock.updateUser).toHaveBeenCalledWith({
      data: {
        full_name: 'John Doe',
        name: 'John Doe',
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

  it('signOut delegates to Supabase auth', async () => {
    await authService.signOut();
    expect(supabaseAuthMock.signOut).toHaveBeenCalled();
  });

  it('deleteAccount invokes edge function then signs out', async () => {
    const { supabaseFunctionsInvokeMock } =
      await import('../test/supabaseMock.js');
    await authService.deleteAccount();
    expect(supabaseFunctionsInvokeMock).toHaveBeenCalledWith('delete-account', {
      method: 'POST',
    });
    expect(supabaseAuthMock.signOut).toHaveBeenCalled();
  });

  it('getSession returns null when client is not configured', async () => {
    mockSupabaseConfigured(false);
    await expect(authService.getSession()).resolves.toBeNull();
  });

  it('getSession throws on error', async () => {
    supabaseAuthMock.getSession.mockRejectedValueOnce(
      new Error('Network error')
    );
    await expect(authService.getSession()).rejects.toThrow('Network error');
  });

  it('isAuthConfigured requires Supabase and Google client ID', () => {
    expect(authService.isAuthConfigured()).toBe(true);
  });

  it('isAuthConfigured returns false when google is not configured', () => {
    vi.mocked(isGoogleAuthConfigured).mockReturnValueOnce(false);
    expect(authService.isAuthConfigured()).toBe(false);
  });

  it('isAuthConfigured returns false when Supabase is not configured', () => {
    mockSupabaseConfigured(false);
    expect(authService.isAuthConfigured()).toBe(false);
  });
});
