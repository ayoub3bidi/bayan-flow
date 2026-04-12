/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { staticFile } from 'remotion';

/** @typedef {'compare'|'swap'|'pivot'|'sorted'|'nodeVisit'|'pathFound'} ExportSfxKind */

const SFX_BASE = 'video-export/sfx';

/** @param {ExportSfxKind} kind */
export function getExportSfxSrc(kind) {
  return staticFile(`${SFX_BASE}/${kind}.wav`);
}
