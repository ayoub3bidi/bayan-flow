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
import {
  MILESTONE_CHORDS,
  NEGATIVE_CHORDS,
  PASS_COMPLETE_CHORD,
} from '../src/utils/categoryPalettes.js';
import { MASTER_INPUT_GAIN } from '../src/utils/masterChain.js';

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
  async ({
    presets,
    compareFreq: cf,
    pivotFreq: pf,
    SOUND_EVENT_KINDS,
    milestoneChords,
    negativeChords,
    passCompleteChord,
    masterInputGain,
  }) => {
    const Tone = window.Tone;
    if (!Tone) {
      throw new Error('Tone not found on window');
    }

    async function createOfflineBus() {
      const inputGain = new Tone.Gain(masterInputGain);
      const filter = new Tone.Filter({
        frequency: 5000,
        type: 'lowpass',
        rolloff: -12,
      });
      const compressor = new Tone.Compressor({ threshold: -24, ratio: 3 });
      const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.12 });
      await reverb.ready;

      inputGain.connect(filter);
      filter.connect(compressor);
      compressor.connect(reverb);
      reverb.toDestination();

      return inputGain;
    }

    function connectToBus(node, bus) {
      return node.connect(bus);
    }

    function arpeggiate(synth, notes, startTime, ascending = true) {
      const ordered = ascending ? notes : [...notes].reverse();
      ordered.forEach((note, index) => {
        synth.triggerAttackRelease(note, '4n', startTime + 0.05 + index * 0.08);
      });
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

    results.compare = await toB64(async () => {
      const bus = await createOfflineBus();
      const kalimba = connectToBus(new Tone.FMSynth(presets.kalimbaSynth), bus);
      kalimba.volume.value = 2;
      kalimba.triggerAttackRelease(cf, '8n', 0.02);
    }, 0.55);

    results.swap = await toB64(async () => {
      const bus = await createOfflineBus();
      const kalimba = connectToBus(new Tone.FMSynth(presets.kalimbaSynth), bus);
      kalimba.volume.value = 3;
      kalimba.triggerAttackRelease('G4', '16n', 0.02);
    }, 0.4);

    results.passComplete = await toB64(async () => {
      const bus = await createOfflineBus();
      const kalimba = connectToBus(new Tone.FMSynth(presets.kalimbaSynth), bus);
      kalimba.volume.value = 3;
      arpeggiate(kalimba, passCompleteChord, 0);
    }, 0.55);

    results.pivot = await toB64(async () => {
      const bus = await createOfflineBus();
      const s = connectToBus(new Tone.Synth(presets.softSynth), bus);
      s.triggerAttackRelease(pf, '8n', 0.02);
    }, 0.65);

    results[SOUND_EVENT_KINDS.COMPLETE] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(
        new Tone.PolySynth(Tone.FMSynth, presets.polySynthVoice),
        bus
      );
      arpeggiate(p, milestoneChords.complete, 0);
    }, 1.4);

    results[SOUND_EVENT_KINDS.VISIT] = await toB64(async () => {
      const bus = await createOfflineBus();
      const s = connectToBus(new Tone.Synth(presets.softSynth), bus);
      s.triggerAttackRelease('A3', '64n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.FRONTIER] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(new Tone.PluckSynth(presets.pluckSynth), bus);
      p.triggerAttackRelease('D4', '32n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.TARGET_FOUND] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(
        new Tone.PolySynth(Tone.FMSynth, presets.polySynthVoice),
        bus
      );
      arpeggiate(p, milestoneChords.targetFound, 0);
    }, 1.2);

    results[SOUND_EVENT_KINDS.PATH_FOUND] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(
        new Tone.PolySynth(Tone.FMSynth, presets.polySynthVoice),
        bus
      );
      arpeggiate(p, milestoneChords.pathFound, 0);
    }, 1.6);

    results[SOUND_EVENT_KINDS.NO_RESULT] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(
        new Tone.PolySynth(Tone.FMSynth, presets.polySynthVoice),
        bus
      );
      arpeggiate(p, negativeChords.noResult, 0, false);
    }, 1.2);

    results[SOUND_EVENT_KINDS.EDGE_CONSIDER] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(new Tone.PluckSynth(presets.pluckSynth), bus);
      p.triggerAttackRelease('A3', '32n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.EDGE_SELECT] = await toB64(async () => {
      const bus = await createOfflineBus();
      const kalimba = connectToBus(new Tone.FMSynth(presets.kalimbaSynth), bus);
      kalimba.triggerAttackRelease('E4', '32n', 0.02);
    }, 0.4);

    results[SOUND_EVENT_KINDS.CYCLE] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(
        new Tone.PolySynth(Tone.FMSynth, presets.polySynthVoice),
        bus
      );
      arpeggiate(p, negativeChords.cycle, 0, false);
    }, 0.9);

    results[SOUND_EVENT_KINDS.MATRIX_CONSIDER] = await toB64(async () => {
      const bus = await createOfflineBus();
      const s = connectToBus(new Tone.Synth(presets.softSynth), bus);
      s.triggerAttackRelease('B3', '32n', 0.02);
    }, 0.3);

    results[SOUND_EVENT_KINDS.MATRIX_UPDATE] = await toB64(async () => {
      const bus = await createOfflineBus();
      const s = connectToBus(new Tone.Synth(presets.softSynth), bus);
      s.triggerAttackRelease('E4', '16n', 0.02);
    }, 0.55);

    results[SOUND_EVENT_KINDS.COMPONENT_COMPLETE] = await toB64(async () => {
      const bus = await createOfflineBus();
      const p = connectToBus(
        new Tone.PolySynth(Tone.FMSynth, presets.polySynthVoice),
        bus
      );
      arpeggiate(p, milestoneChords.componentComplete, 0);
    }, 1.2);

    results.sorted = results[SOUND_EVENT_KINDS.COMPLETE];
    results.nodeVisit = results[SOUND_EVENT_KINDS.VISIT];

    return results;
  },
  {
    presets: TONE_INSTRUMENT_PRESETS,
    compareFreq,
    pivotFreq,
    SOUND_EVENT_KINDS,
    milestoneChords: MILESTONE_CHORDS,
    negativeChords: NEGATIVE_CHORDS,
    passCompleteChord: PASS_COMPLETE_CHORD,
    masterInputGain: MASTER_INPUT_GAIN,
  }
);

for (const [name, b64] of Object.entries(base64ByName)) {
  writeFileSync(join(outDir, `${name}.wav`), Buffer.from(b64, 'base64'));
}

await browser.close();
console.log('Wrote Tone-matched WAVs to', outDir);
