/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { TERMS_OF_USE_LAST_UPDATED, TERMS_OF_USE_SECTIONS } from './terms.en';

describe('terms.en', () => {
  it('exports a last-updated date', () => {
    expect(TERMS_OF_USE_LAST_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('defines required terms sections', () => {
    const ids = TERMS_OF_USE_SECTIONS.map(section => section.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'acceptance',
        'service',
        'acceptable-use',
        'user-content',
        'software-license',
        'disclaimer',
        'privacy',
      ])
    );
  });

  it('each section has title and paragraphs', () => {
    for (const section of TERMS_OF_USE_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it('references license, trademark, and privacy policy', () => {
    const body = TERMS_OF_USE_SECTIONS.flatMap(section => [
      ...section.paragraphs,
      ...(section.list ?? []),
    ]).join(' ');

    expect(body).toMatch(/Elastic License/i);
    expect(body).toMatch(/TRADEMARK/i);
    expect(body).toMatch(/\/privacy/);
    expect(body).toMatch(/contact@bayanflow\.com/);
  });
});
