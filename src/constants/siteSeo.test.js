/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  PRODUCTION_ORIGIN,
  getCanonicalUrl,
  isIndexableHostname,
  isNoIndexHostname,
} from './siteSeo';

describe('siteSeo', () => {
  it('builds canonical URLs for routes', () => {
    expect(getCanonicalUrl('/')).toBe(`${PRODUCTION_ORIGIN}/`);
    expect(getCanonicalUrl('/app')).toBe(`${PRODUCTION_ORIGIN}/app`);
    expect(getCanonicalUrl('/roadmap')).toBe(`${PRODUCTION_ORIGIN}/roadmap`);
    expect(getCanonicalUrl('/privacy')).toBe(`${PRODUCTION_ORIGIN}/privacy`);
  });

  it('treats production hostnames as indexable', () => {
    expect(isIndexableHostname('bayanflow.com')).toBe(true);
    expect(isIndexableHostname('www.bayanflow.com')).toBe(true);
  });

  it('treats dev and preview hostnames as noindex', () => {
    expect(isNoIndexHostname('dev.bayanflow.com')).toBe(true);
    expect(isNoIndexHostname('pr-42-bayan-flow-staging.workers.dev')).toBe(
      true
    );
    expect(isNoIndexHostname('bayan-flow.workers.dev')).toBe(true);
    expect(isNoIndexHostname('localhost')).toBe(true);
    expect(isNoIndexHostname('bayanflow.com')).toBe(false);
  });
});
