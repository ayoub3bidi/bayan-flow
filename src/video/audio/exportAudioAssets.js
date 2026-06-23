/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { staticFile } from 'remotion';
import { SOUND_EVENT_KINDS } from '../../utils/soundEvents.js';

/** @typedef {typeof SOUND_EVENT_KINDS[keyof typeof SOUND_EVENT_KINDS]} ExportSfxKind */

const SFX_BASE = 'video-export/sfx';
const LEGACY_SFX_KIND_MAP = {
  sorted: SOUND_EVENT_KINDS.COMPLETE,
  nodeVisit: SOUND_EVENT_KINDS.VISIT,
};

/** @param {ExportSfxKind} kind */
export function getExportSfxSrc(kind) {
  return staticFile(`${SFX_BASE}/${LEGACY_SFX_KIND_MAP[kind] ?? kind}.wav`);
}
