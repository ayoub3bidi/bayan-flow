/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Sequence } from 'remotion';
import { Audio } from '@remotion/media';
import { buildExportSoundCues } from './audio/buildExportSoundCues.js';
import { getExportSfxSrc } from './audio/exportAudioAssets.js';
import { EXPORT_SFX_DURATION_FRAMES_BY_KIND } from './constants.js';
import { SOUND_EVENT_KINDS } from '../utils/soundEvents.js';

/** End-of-run cues keep their full length even when steps are short. */
const MILESTONE_KINDS = new Set([
  SOUND_EVENT_KINDS.COMPLETE,
  SOUND_EVENT_KINDS.PATH_FOUND,
  SOUND_EVENT_KINDS.TARGET_FOUND,
  SOUND_EVENT_KINDS.NO_RESULT,
  SOUND_EVENT_KINDS.COMPONENT_COMPLETE,
]);

/**
 * @param {Object} props
 * @param {boolean} props.enabled
 * @param {string} props.algorithmType
 * @param {string} props.algorithmKey
 * @param {Array} props.steps
 * @param {number} props.framesPerStep
 * @param {number} props.mainDurationInFrames — stop scheduling past main segment
 * @param {number} [props.volume]
 */
function ExportAudioTracks({
  enabled,
  algorithmType,
  algorithmKey,
  steps,
  framesPerStep,
  mainDurationInFrames,
  volume = 0.85,
}) {
  if (!enabled || !steps?.length) return null;

  const cues = buildExportSoundCues({
    algorithmType,
    algorithmKey,
    steps,
    framesPerStep,
  });

  return (
    <>
      {cues.map((cue, i) => {
        if (cue.fromFrame >= mainDurationInFrames) return null;
        const fullLen = EXPORT_SFX_DURATION_FRAMES_BY_KIND[cue.kind] ?? 15;
        // Fast-paced long exports: trim per-step cues so they don't pile up.
        const clipLen = MILESTONE_KINDS.has(cue.kind)
          ? fullLen
          : Math.min(fullLen, framesPerStep);
        const end = Math.min(cue.fromFrame + clipLen, mainDurationInFrames);
        const durationInFrames = Math.max(1, end - cue.fromFrame);
        return (
          <Sequence
            key={`${cue.kind}-${cue.fromFrame}-${i}`}
            from={cue.fromFrame}
            durationInFrames={durationInFrames}
          >
            <Audio src={getExportSfxSrc(cue.kind)} volume={volume} />
          </Sequence>
        );
      })}
    </>
  );
}

export default ExportAudioTracks;
