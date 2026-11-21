/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { buildExportSoundCues } from './buildExportSoundCues.js';
import { getExportSfxSrc } from './exportAudioAssets.js';
import { EXPORT_SFX_DURATION_FRAMES_BY_KIND, VIDEO_FPS } from '../constants.js';
import { SOUND_EVENT_KINDS } from '../../utils/soundEvents.js';

export const EXPORT_AUDIO_SAMPLE_RATE = 48000;
const EXPORT_AUDIO_CHANNELS = 2;

/** End-of-run cues keep their full length even when steps are short. */
const MILESTONE_KINDS = new Set([
  SOUND_EVENT_KINDS.COMPLETE,
  SOUND_EVENT_KINDS.PATH_FOUND,
  SOUND_EVENT_KINDS.TARGET_FOUND,
  SOUND_EVENT_KINDS.NO_RESULT,
  SOUND_EVENT_KINDS.COMPONENT_COMPLETE,
]);

/**
 * Mixes every sound cue into one PCM track covering the main segment.
 * One track instead of one media element per cue: @remotion/media caches an
 * iterator per element (up to half of system RAM), which crashed long exports.
 *
 * @param {Object} opts
 * @param {Array<{fromFrame: number, kind: string}>} opts.cues
 * @param {Object<string, Float32Array[]>} opts.clips — decoded SFX per kind, one array per channel
 * @param {number} opts.framesPerStep
 * @param {number} opts.mainDurationInFrames
 * @param {number} [opts.fps]
 * @param {number} [opts.sampleRate]
 * @param {number} [opts.volume]
 * @returns {Float32Array[]} one array per channel (unclamped)
 */
export function mixExportSoundCues({
  cues,
  clips,
  framesPerStep,
  mainDurationInFrames,
  fps = VIDEO_FPS,
  sampleRate = EXPORT_AUDIO_SAMPLE_RATE,
  volume = 1,
}) {
  const samplesPerFrame = sampleRate / fps;
  const totalSamples = Math.round(mainDurationInFrames * samplesPerFrame);
  const out = Array.from(
    { length: EXPORT_AUDIO_CHANNELS },
    () => new Float32Array(totalSamples)
  );

  for (const cue of cues) {
    const clip = clips[cue.kind];
    if (!clip?.length || cue.fromFrame >= mainDurationInFrames) continue;
    const fullLen = EXPORT_SFX_DURATION_FRAMES_BY_KIND[cue.kind] ?? 15;
    // Fast-paced long exports: trim per-step cues so they don't pile up.
    const lenFrames = MILESTONE_KINDS.has(cue.kind)
      ? fullLen
      : Math.min(fullLen, framesPerStep);
    const start = Math.round(cue.fromFrame * samplesPerFrame);
    const end = Math.min(
      totalSamples,
      start + Math.round(Math.max(1, lenFrames) * samplesPerFrame)
    );

    out.forEach((dst, ch) => {
      const src = clip[Math.min(ch, clip.length - 1)];
      const n = Math.min(end - start, src.length);
      for (let i = 0; i < n; i++) dst[start + i] += src[i] * volume;
    });
  }

  return out;
}

/**
 * Encodes channels as a 16-bit PCM WAV, clamping samples to [-1, 1].
 * @param {Float32Array[]} channels
 * @param {number} sampleRate
 * @returns {Blob}
 */
export function encodeWav(channels, sampleRate) {
  const channelCount = channels.length;
  const frames = channels[0]?.length ?? 0;
  const dataBytes = frames * channelCount * 2;
  const view = new DataView(new ArrayBuffer(44 + dataBytes));
  const writeAscii = (offset, text) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * 2, true);
  view.setUint16(32, channelCount * 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let ch = 0; ch < channelCount; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view.buffer], { type: 'audio/wav' });
}

/**
 * Builds the export's single pre-mixed sound track (browser only).
 * @returns {Promise<string | null>} object URL of the WAV, or null when the run has no cues
 */
export async function buildExportAudioUrl({
  algorithmType,
  algorithmKey,
  steps,
  framesPerStep,
  volume,
}) {
  const cues = buildExportSoundCues({
    algorithmType,
    algorithmKey,
    steps,
    framesPerStep,
  });
  if (!cues.length) return null;

  const ctx = new OfflineAudioContext(
    EXPORT_AUDIO_CHANNELS,
    1,
    EXPORT_AUDIO_SAMPLE_RATE
  );
  const kinds = [...new Set(cues.map(cue => cue.kind))];
  const clips = Object.fromEntries(
    await Promise.all(
      kinds.map(async kind => {
        const res = await fetch(getExportSfxSrc(kind));
        if (!res.ok) throw new Error(`Missing export sound: ${kind}`);
        const audio = await ctx.decodeAudioData(await res.arrayBuffer());
        return [
          kind,
          Array.from({ length: audio.numberOfChannels }, (_, ch) =>
            audio.getChannelData(ch)
          ),
        ];
      })
    )
  );

  const channels = mixExportSoundCues({
    cues,
    clips,
    framesPerStep,
    mainDurationInFrames: steps.length * framesPerStep,
    volume,
  });
  return URL.createObjectURL(encodeWav(channels, EXPORT_AUDIO_SAMPLE_RATE));
}
