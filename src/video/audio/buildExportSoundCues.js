/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  SOUND_EVENT_KINDS,
  getSoundEventsForStep,
} from '../../utils/soundEvents.js';

/** @typedef {import('./exportAudioAssets.js').ExportSfxKind} ExportSfxKind */

/**
 * @typedef {Object} ExportSoundCue
 * @property {number} fromFrame — global composition frame
 * @property {ExportSfxKind} kind
 */

/**
 * Compare / array cues align with SortingScene compare phase (early portion of step).
 * @param {number} framesPerStep
 * @returns {number}
 */
function compareFrameOffset(framesPerStep) {
  return Math.max(0, Math.floor(framesPerStep * 0.15));
}

function frameOffsetForEvent(event, framesPerStep) {
  return [
    SOUND_EVENT_KINDS.COMPARE,
    SOUND_EVENT_KINDS.EDGE_CONSIDER,
    SOUND_EVENT_KINDS.MATRIX_CONSIDER,
  ].includes(event.kind)
    ? compareFrameOffset(framesPerStep)
    : 0;
}

/**
 * Pure list of sound cues for the main algorithm segment (excludes complexity tail).
 *
 * @param {Object} opts
 * @param {string} opts.algorithmType
 * @param {string} [opts.algorithmKey]
 * @param {Array} opts.steps
 * @param {number} opts.framesPerStep
 * @returns {ExportSoundCue[]}
 */
export function buildExportSoundCues({
  algorithmType,
  algorithmKey = '',
  steps,
  framesPerStep,
}) {
  if (!steps?.length || framesPerStep <= 0) return [];

  const totalSteps = steps.length;
  return steps.flatMap((step, stepIndex) => {
    const base = stepIndex * framesPerStep;
    const previousStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
    return getSoundEventsForStep({
      algorithmType,
      algorithmKey,
      step,
      previousStep,
      stepIndex,
      totalSteps,
    }).map(event => ({
      fromFrame: base + frameOffsetForEvent(event, framesPerStep),
      kind: event.kind,
    }));
  });
}
