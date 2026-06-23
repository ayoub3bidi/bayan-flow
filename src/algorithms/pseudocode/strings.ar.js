/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { pseudocodeStringsEn } from './strings.en.js';
import { localizePseudocodeMap } from './localize.js';

/** Arabic pseudocode (phrases + keywords via localize.js). */
export const pseudocodeStringsAr = localizePseudocodeMap(
  pseudocodeStringsEn,
  'ar'
);
