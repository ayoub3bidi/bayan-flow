/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { YOUTUBE_THUMBNAIL_VIDEO_IDS } from './youtubeThumbnails';

describe('youtubeThumbnails', () => {
  it('lists committed facade thumbnail video IDs', () => {
    expect(YOUTUBE_THUMBNAIL_VIDEO_IDS).toEqual([
      'ZwcT68ZRD0U',
      'WcE3O2x77lU',
      '8t4vh3ovldo',
      'hqxLovhkhrU',
      'uL3G3nvjGh4',
    ]);
  });

  it('uses unique YouTube IDs', () => {
    expect(new Set(YOUTUBE_THUMBNAIL_VIDEO_IDS).size).toBe(
      YOUTUBE_THUMBNAIL_VIDEO_IDS.length
    );
  });
});
