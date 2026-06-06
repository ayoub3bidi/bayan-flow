/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { formatGitHubCount } from './formatGitHubCount';

describe('formatGitHubCount', () => {
  it('returns integer strings below 1000', () => {
    expect(formatGitHubCount(0)).toBe('0');
    expect(formatGitHubCount(42)).toBe('42');
    expect(formatGitHubCount(999)).toBe('999');
  });

  it('formats thousands with one decimal when needed', () => {
    expect(formatGitHubCount(1000)).toBe('1k');
    expect(formatGitHubCount(1500)).toBe('1.5k');
    expect(formatGitHubCount(98500)).toBe('98.5k');
  });

  it('formats millions with one decimal when needed', () => {
    expect(formatGitHubCount(1_000_000)).toBe('1M');
    expect(formatGitHubCount(1_200_000)).toBe('1.2M');
    expect(formatGitHubCount(12_500_000)).toBe('13M');
  });

  it('handles invalid input', () => {
    expect(formatGitHubCount(-5)).toBe('0');
    expect(formatGitHubCount(Number.NaN)).toBe('0');
  });
});
