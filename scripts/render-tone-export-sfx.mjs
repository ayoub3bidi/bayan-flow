/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Regenerates public/video-export/sfx/*.wav using Tone.Offline in Chromium,
 * matching soundManager instruments (see src/utils/toneInstrumentPresets.js).
 *
 * Requires: pnpm exec playwright install chromium
 * Run: pnpm run generate:export-sfx
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TONE_INSTRUMENT_PRESETS } from '../src/utils/toneInstrumentPresets.js';
import { getCompareFrequency, getPivotFrequency } from '../src/utils/soundFrequencies.js';
import { SOUND_EVENT_KINDS } from '../src/utils/soundEvents.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public/video-export/sfx');
const toneBundle = join(root, 'node_modules/tone/build/Tone.js');

if (!existsSync(toneBundle)) {
  console.error('Missing Tone bundle at', toneBundle);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const compareFreq = getCompareFrequency(52);
const pivotFreq = getPivotFrequency(52);

let browser;
try {
  browser = await chromium.launch();
} catch {
  browser = await chromium.launch({ channel: 'chrome' });
}
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({ path: toneBundle });

const base64ByName = await page.evaluate(
  async ({ presets, compareFreq: cf, pivotFreq: pf, SOUND_EVENT_KINDS }) => {
    const Tone = window.Tone;
    if (!Tone) {
      throw new Error('Tone not found on window');
    }

    function interleavedWavFromBuffer(audioBuffer) {
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const length = audioBuffer.length;
      const blockAlign = numChannels * 2;
      const dataSize = length * blockAlign;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);
      const writeStr = (off, s) => {
        for (let i = 0; i < s.length; i++) {
          view.setUint8(off + i, s.charCodeAt(i));
        }
      };
      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, 16, true);
      writeStr(36, 'data');
      view.setUint32(40, dataSize, true);
      let off = 44;
      for (let i = 0; i < length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
          const s = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
          view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
          off += 2;
        }
      }
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(
          null,
          Array.from(bytes.subarray(i, i + chunk))
        );
      }
      return btoa(binary);
    }

    async function toB64(renderFn, durationSec) {
      const toneBuf = await Tone.Offline(renderFn, durationSec);
      const ab = toneBuf.get();
      return interleavedWavFromBuffer(ab);
    }

    const results = {};

    results.compare = await toB64(() => {
      const pluck = new Tone.PluckSynth(presets.pluckSynth).toDestination();
      pluck.triggerAttackRelease(cf, '16n', 0.02);
    }, 0.45);

    results.swap = await toB64(() => {
      const m = new Tone.MetalSynth(presets.metallicSynth).toDestination();
      m.triggerAttackRelease('32n', 0.02);
    }, 0.4);

    results.pivot = await toB64(() => {
      const s = new Tone.Synth(presets.softSynth).toDestination();
      s.triggerAttackRelease(pf, '8n', 0.02);
    }, 0.65);

    results[SOUND_EVENT_KINDS.COMPLETE] = await toB64(() => {
      const p = new Tone.PolySynth().toDestination();
      p.triggerAttackRelease(['C4', 'E4', 'G4'], '2n', 0.05);
    }, 2.6);

    results[SOUND_EVENT_KINDS.VISIT] = await toB64(() => {
      const s = new Tone.Synth(presets.softSynth).toDestination();
      s.triggerAttackRelease(220, '64n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.FRONTIER] = await toB64(() => {
      const p = new Tone.PluckSynth(presets.pluckSynth).toDestination();
      p.triggerAttackRelease('D4', '32n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.TARGET_FOUND] = await toB64(() => {
      const p = new Tone.PolySynth().toDestination();
      p.triggerAttackRelease(['E4', 'G4', 'B4'], '4n', 0.05);
    }, 1.4);

    results[SOUND_EVENT_KINDS.PATH_FOUND] = await toB64(() => {
      const p = new Tone.PolySynth().toDestination();
      p.triggerAttackRelease(['C3', 'E3', 'G3', 'C4'], '1n', 0.05);
    }, 3.2);

    results[SOUND_EVENT_KINDS.NO_RESULT] = await toB64(() => {
      const p = new Tone.PolySynth().toDestination();
      p.triggerAttackRelease(['D3', 'F3', 'A3'], '4n', 0.05);
    }, 1.2);

    results[SOUND_EVENT_KINDS.EDGE_CONSIDER] = await toB64(() => {
      const p = new Tone.PluckSynth(presets.pluckSynth).toDestination();
      p.triggerAttackRelease('A3', '32n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.EDGE_SELECT] = await toB64(() => {
      const m = new Tone.MetalSynth(presets.metallicSynth).toDestination();
      m.triggerAttackRelease('16n', 0.02);
    }, 0.55);

    results[SOUND_EVENT_KINDS.CYCLE] = await toB64(() => {
      const p = new Tone.PolySynth().toDestination();
      p.triggerAttackRelease(['C3', 'F#3'], '8n', 0.05);
    }, 0.85);

    results[SOUND_EVENT_KINDS.MATRIX_CONSIDER] = await toB64(() => {
      const s = new Tone.Synth(presets.softSynth).toDestination();
      s.triggerAttackRelease('B3', '32n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.MATRIX_UPDATE] = await toB64(() => {
      const s = new Tone.Synth(presets.softSynth).toDestination();
      s.triggerAttackRelease('E4', '16n', 0.02);
    }, 0.55);

    results[SOUND_EVENT_KINDS.COMPONENT_COMPLETE] = await toB64(() => {
      const p = new Tone.PolySynth().toDestination();
      p.triggerAttackRelease(['A3', 'C4', 'E4'], '4n', 0.05);
    }, 1.4);

    results.sorted = results[SOUND_EVENT_KINDS.COMPLETE];
    results.nodeVisit = results[SOUND_EVENT_KINDS.VISIT];

    return results;
  },
  {
    presets: TONE_INSTRUMENT_PRESETS,
    compareFreq,
    pivotFreq,
    SOUND_EVENT_KINDS,
  }
);

for (const [name, b64] of Object.entries(base64ByName)) {
  writeFileSync(join(outDir, `${name}.wav`), Buffer.from(b64, 'base64'));
}

await browser.close();
console.log('Wrote Tone-matched WAVs to', outDir);
