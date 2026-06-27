/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeGoogleAuthCode } from './googleTokenExchange';

describe('googleTokenExchange', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          id_token: 'id-token',
          access_token: 'access-token',
        }),
      }))
    );
  });

  it('exchanges an authorization code for tokens', async () => {
    const result = await exchangeGoogleAuthCode(
      'auth-code',
      'verifier',
      'client-id',
      'http://localhost:5173/auth/google/callback'
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.idToken).toBe('id-token');
    expect(result.accessToken).toBe('access-token');
  });
});
