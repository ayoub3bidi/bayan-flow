/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import * as Tone from 'tone';
import { getCompareFrequency, getPivotFrequency } from './soundFrequencies.js';
import { TONE_INSTRUMENT_PRESETS } from './toneInstrumentPresets.js';

class SoundManager {
  constructor() {
    this.isEnabled = false;

    this.softSynth = new Tone.Synth(
      TONE_INSTRUMENT_PRESETS.softSynth
    ).toDestination();

    this.pluckSynth = new Tone.PluckSynth(
      TONE_INSTRUMENT_PRESETS.pluckSynth
    ).toDestination();

    this.metallicSynth = new Tone.MetalSynth(
      TONE_INSTRUMENT_PRESETS.metallicSynth
    ).toDestination();

    this.polySynth = new Tone.PolySynth().toDestination();
    this.membrane = new Tone.MembraneSynth().toDestination();
  }

  async enable() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  playCompare(value) {
    if (!this.isEnabled) return;
    const freq = getCompareFrequency(value);
    this.pluckSynth.triggerAttackRelease(freq, '16n');
  }

  playSwap() {
    if (!this.isEnabled) return;
    this.metallicSynth.triggerAttackRelease('32n');
  }

  playPivot(value) {
    if (!this.isEnabled) return;
    const freq = getPivotFrequency(value);
    this.softSynth.triggerAttackRelease(freq, '8n');
  }

  playSorted() {
    if (!this.isEnabled) return;
    const now = Tone.now();
    this.polySynth.triggerAttackRelease(['C4', 'E4', 'G4'], '2n', now);
  }

  playNodeVisit() {
    if (!this.isEnabled) return;
    this.softSynth.triggerAttackRelease(220, '64n'); // Softer A3 note
  }

  playPathFound() {
    if (!this.isEnabled) return;
    const now = Tone.now();
    this.polySynth.triggerAttackRelease(['C3', 'E3', 'G3', 'C4'], '1n', now);
  }

  playUIClick() {
    if (!this.isEnabled) return;
    this.softSynth.triggerAttackRelease('G4', '64n');
  }

  playArrayGenerate() {
    if (!this.isEnabled) return;
    this.softSynth.triggerAttackRelease('C4', '8n');
  }
}

export const soundManager = new SoundManager();
