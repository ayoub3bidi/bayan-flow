/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import i18n from '../i18n';
import { resolveStepDescription } from './resolveStepDescription.js';

describe('resolveStepDescription', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('resolves algorithms.descriptions.* keys used on initial steps', () => {
    expect(resolveStepDescription('algorithms.descriptions.bubbleSort')).toBe(
      'Starting Bubble Sort'
    );
  });

  it('returns plain text unchanged', () => {
    expect(resolveStepDescription('Comparing elements at index 0 and 1')).toBe(
      'Comparing elements at index 0 and 1'
    );
  });

  it('handles empty input', () => {
    expect(resolveStepDescription('')).toBe('');
    expect(resolveStepDescription(null)).toBe('');
    expect(resolveStepDescription(undefined)).toBe('');
  });

  it('resolves keys in a given export language (Arabic)', async () => {
    await i18n.changeLanguage('en');
    expect(
      resolveStepDescription('algorithms.descriptions.bubbleSort', 'ar')
    ).toBe('بدء الترتيب الفقاعي');
  });
});
