/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  generateAvatarDataUri,
  getMetadataAvatarUrl,
  resolveDisplayName,
  resolveUserAvatar,
} from './resolveUserAvatar';

describe('resolveUserAvatar', () => {
  it('prefers Google metadata URL', () => {
    const result = resolveUserAvatar({
      metadataUrl: 'https://lh3.googleusercontent.com/a/example',
      profileUrl: 'https://example.com/other.jpg',
      email: 'user@example.com',
    });

    expect(result.source).toBe('google');
    expect(result.src).toBe('https://lh3.googleusercontent.com/a/example');
  });

  it('falls back to profile URL when metadata is missing', () => {
    const result = resolveUserAvatar({
      profileUrl: 'https://example.com/profile.jpg',
      email: 'user@example.com',
    });

    expect(result.source).toBe('profile');
  });

  it('generates deterministic DiceBear fallback from email', () => {
    const first = resolveUserAvatar({ email: 'user@example.com' });
    const second = resolveUserAvatar({ email: 'user@example.com' });

    expect(first.source).toBe('generated');
    expect(first.src).toBe(second.src);
    expect(first.src.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('generateAvatarDataUri returns data URI', () => {
    const uri = generateAvatarDataUri('seed@example.com', 48);
    expect(uri.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('getMetadataAvatarUrl reads avatar_url or picture', () => {
    expect(
      getMetadataAvatarUrl({
        user_metadata: { picture: 'https://lh3.googleusercontent.com/pic' },
      })
    ).toBe('https://lh3.googleusercontent.com/pic');
  });

  it('resolveDisplayName prefers metadata full_name', () => {
    expect(
      resolveDisplayName(
        { email: 'a@b.com', user_metadata: { full_name: 'Ayoub Abidi' } },
        null
      )
    ).toBe('Ayoub Abidi');
  });
});
