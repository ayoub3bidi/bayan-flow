/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Sequence } from 'remotion';
import { Audio } from '@remotion/media';
import { buildExportSoundCues } from './audio/buildExportSoundCues.js';
import { getExportSfxSrc } from './audio/exportAudioAssets.js';
import { EXPORT_SFX_DURATION_FRAMES_BY_KIND } from './constants.js';

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
        const clipLen = EXPORT_SFX_DURATION_FRAMES_BY_KIND[cue.kind] ?? 15;
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
