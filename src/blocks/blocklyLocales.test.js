/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { loadBlocklyLocale } from './blocklyLocales';

vi.mock('blockly/msg/en', () => ({ LANG: 'en' }));
vi.mock('blockly/msg/fr', () => {
  throw new Error('chunk failed');
});

describe('loadBlocklyLocale', () => {
  it('falls back to English when a locale chunk fails to load', async () => {
    expect((await loadBlocklyLocale('fr')).LANG).toBe('en');
  });

  it('uses English for an unknown language', async () => {
    expect((await loadBlocklyLocale('de')).LANG).toBe('en');
  });
});
