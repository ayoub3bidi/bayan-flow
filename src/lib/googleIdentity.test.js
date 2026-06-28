/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  createNonce,
  hashNonce,
  isGoogleAuthConfigured,
} from './googleIdentity';

describe('googleIdentity', () => {
  it('isGoogleAuthConfigured returns true when client ID env is set', () => {
    expect(isGoogleAuthConfigured()).toBe(true);
  });

  it('createNonce returns a hex string', () => {
    const nonce = createNonce();
    expect(nonce).toMatch(/^[0-9a-f]{32}$/);
  });

  it('hashNonce returns a base64url string', async () => {
    const hashed = await hashNonce('test-nonce');
    expect(hashed).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
