/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import * as Tone from 'tone';

class SoundManager {
  constructor() {
    this.isEnabled = false;

    // Soft synth for gentle sounds
    this.softSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.3 },
    }).toDestination();

    // Pluck synth for pleasant compare sounds
    this.pluckSynth = new Tone.PluckSynth({
      attackNoise: 0.5,
      dampening: 4000,
      resonance: 0.9,
    }).toDestination();

    // Metallic synth for swap sounds
    this.metallicSynth = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();

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
    const freq = 150 + ((value - 5) / 95) * 200; // Softer range: 150-350Hz
    this.pluckSynth.triggerAttackRelease(freq, '16n');
  }

  playSwap() {
    if (!this.isEnabled) return;
    this.metallicSynth.triggerAttackRelease('32n');
  }

  playPivot(value) {
    if (!this.isEnabled) return;
    const freq = 100 + ((value - 5) / 95) * 100; // Low range: 100-200Hz
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
