/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { pseudocodeStringsEn } from './strings.en.js';
import { localizePseudocodeMap } from './localize.js';

/** French pseudocode (phrases + CS keywords via localize.js). */
export const pseudocodeStringsFr = localizePseudocodeMap(
  pseudocodeStringsEn,
  'fr'
);
