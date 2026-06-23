/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import {
  GITHUB_REPO_FULL_NAME,
  GITHUB_REPO_NAME,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_PACKAGE_VERSION,
  GITHUB_REPO_URL,
} from './githubRepo.js';

describe('githubRepo constants', () => {
  it('derives repo URL and full name from owner and name', () => {
    expect(GITHUB_REPO_OWNER).toBe('ayoub3bidi');
    expect(GITHUB_REPO_NAME).toBe('bayan-flow');
    expect(GITHUB_REPO_FULL_NAME).toBe('ayoub3bidi/bayan-flow');
    expect(GITHUB_REPO_URL).toBe('https://github.com/ayoub3bidi/bayan-flow');
    expect(GITHUB_REPO_PACKAGE_VERSION).toBe('0.5.0');
  });
});
