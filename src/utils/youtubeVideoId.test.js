/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { extractYoutubeVideoId } from './youtubeVideoId';

describe('extractYoutubeVideoId', () => {
  it('extracts ID from embed URL', () => {
    expect(
      extractYoutubeVideoId('https://www.youtube.com/embed/WcE3O2x77lU')
    ).toBe('WcE3O2x77lU');
  });

  it('extracts ID from watch URL', () => {
    expect(
      extractYoutubeVideoId('https://www.youtube.com/watch?v=8t4vh3ovldo')
    ).toBe('8t4vh3ovldo');
  });

  it('returns null for empty input', () => {
    expect(extractYoutubeVideoId('')).toBeNull();
    expect(extractYoutubeVideoId(null)).toBeNull();
  });
});
