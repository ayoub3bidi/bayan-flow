/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { isAccountBannedError, isSignInBlockedError } from './authBan.js';

describe('authBan', () => {
  it('detects account ban errors', () => {
    expect(isAccountBannedError({ message: 'User is banned' })).toBe(true);
    expect(isAccountBannedError({ status: 403 })).toBe(true);
    expect(isAccountBannedError({ message: 'ok' })).toBe(false);
  });

  it('detects blocked sign-in errors', () => {
    expect(
      isSignInBlockedError({
        message: 'Sign-in is temporarily unavailable. Please try again later.',
      })
    ).toBe(true);
    expect(isSignInBlockedError({ message: 'Network error' })).toBe(false);
  });
});
