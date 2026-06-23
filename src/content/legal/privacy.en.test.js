/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from './privacy.en';

describe('privacy.en', () => {
  it('exports a last-updated date', () => {
    expect(PRIVACY_POLICY_LAST_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('defines required policy sections', () => {
    const ids = PRIVACY_POLICY_SECTIONS.map(section => section.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'introduction',
        'data-we-process',
        'no-accounts',
        'rights',
        'children',
        'changes',
      ])
    );
  });

  it('each section has title and paragraphs', () => {
    for (const section of PRIVACY_POLICY_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it('discloses Umami, localStorage, and no accounts', () => {
    const body = PRIVACY_POLICY_SECTIONS.flatMap(section => [
      ...section.paragraphs,
      ...(section.list ?? []),
    ]).join(' ');

    expect(body).toMatch(/Umami/i);
    expect(body).toMatch(/localStorage/i);
    expect(body).toMatch(/no user accounts|no registration/i);
    expect(body).toMatch(/contact@bayanflow\.com/);
  });
});
