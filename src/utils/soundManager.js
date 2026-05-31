/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import * as Tone from 'tone';
import { getCompareFrequency, getPivotFrequency } from './soundFrequencies.js';
import { TONE_INSTRUMENT_PRESETS } from './toneInstrumentPresets.js';
import { SOUND_EVENT_KINDS } from './soundEvents.js';

const MAX_EVENTS_PER_STEP = 3;

const EVENT_ALIASES = {
  sorted: SOUND_EVENT_KINDS.COMPLETE,
  nodeVisit: SOUND_EVENT_KINDS.VISIT,
};

class SoundManager {
  constructor() {
    this.isEnabled = false;
    this.instruments = null;
  }

  ensureInstruments() {
    if (this.instruments) return this.instruments;

    this.instruments = {
      softSynth: new Tone.Synth(
        TONE_INSTRUMENT_PRESETS.softSynth
      ).toDestination(),
      pluckSynth: new Tone.PluckSynth(
        TONE_INSTRUMENT_PRESETS.pluckSynth
      ).toDestination(),
      metallicSynth: new Tone.MetalSynth(
        TONE_INSTRUMENT_PRESETS.metallicSynth
      ).toDestination(),
      polySynth: new Tone.PolySynth().toDestination(),
      membraneSynth: new Tone.MembraneSynth().toDestination(),
    };

    return this.instruments;
  }

  async enable() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    this.isEnabled = true;
    this.ensureInstruments();
  }

  disable() {
    this.isEnabled = false;
  }

  getIsEnabled() {
    return this.isEnabled;
  }

  playCompare(value) {
    if (!this.isEnabled) return;
    const { pluckSynth } = this.ensureInstruments();
    const normalizedValue = Number.isFinite(Number(value)) ? Number(value) : 50;
    const freq = getCompareFrequency(normalizedValue);
    pluckSynth.triggerAttackRelease(freq, '16n');
  }

  playSwap() {
    if (!this.isEnabled) return;
    const { metallicSynth } = this.ensureInstruments();
    metallicSynth.triggerAttackRelease('32n');
  }

  playPivot(value) {
    if (!this.isEnabled) return;
    const { softSynth } = this.ensureInstruments();
    const normalizedValue = Number.isFinite(Number(value)) ? Number(value) : 50;
    const freq = getPivotFrequency(normalizedValue);
    softSynth.triggerAttackRelease(freq, '8n');
  }

  playSorted() {
    if (!this.isEnabled) return;
    const { polySynth } = this.ensureInstruments();
    const now = Tone.now();
    polySynth.triggerAttackRelease(['C4', 'E4', 'G4'], '2n', now);
  }

  playNodeVisit() {
    if (!this.isEnabled) return;
    const { softSynth } = this.ensureInstruments();
    softSynth.triggerAttackRelease(220, '64n'); // Softer A3 note
  }

  playPathFound() {
    if (!this.isEnabled) return;
    const { polySynth } = this.ensureInstruments();
    const now = Tone.now();
    polySynth.triggerAttackRelease(['C3', 'E3', 'G3', 'C4'], '1n', now);
  }

  playFrontier() {
    if (!this.isEnabled) return;
    const { pluckSynth } = this.ensureInstruments();
    pluckSynth.triggerAttackRelease('D4', '32n');
  }

  playTargetFound() {
    if (!this.isEnabled) return;
    const { polySynth } = this.ensureInstruments();
    const now = Tone.now();
    polySynth.triggerAttackRelease(['E4', 'G4', 'B4'], '4n', now);
  }

  playNoResult() {
    if (!this.isEnabled) return;
    const { polySynth } = this.ensureInstruments();
    const now = Tone.now();
    polySynth.triggerAttackRelease(['D3', 'F3', 'A3'], '4n', now);
  }

  playEdgeConsider() {
    if (!this.isEnabled) return;
    const { pluckSynth } = this.ensureInstruments();
    pluckSynth.triggerAttackRelease('A3', '32n');
  }

  playEdgeSelect() {
    if (!this.isEnabled) return;
    const { metallicSynth } = this.ensureInstruments();
    metallicSynth.triggerAttackRelease('16n');
  }

  playCycle() {
    if (!this.isEnabled) return;
    const { polySynth } = this.ensureInstruments();
    const now = Tone.now();
    polySynth.triggerAttackRelease(['C3', 'F#3'], '8n', now);
  }

  playMatrixConsider() {
    if (!this.isEnabled) return;
    const { softSynth } = this.ensureInstruments();
    softSynth.triggerAttackRelease('B3', '32n');
  }

  playMatrixUpdate() {
    if (!this.isEnabled) return;
    const { softSynth } = this.ensureInstruments();
    softSynth.triggerAttackRelease('E4', '16n');
  }

  playComponentComplete() {
    if (!this.isEnabled) return;
    const { polySynth } = this.ensureInstruments();
    const now = Tone.now();
    polySynth.triggerAttackRelease(['A3', 'C4', 'E4'], '4n', now);
  }

  playEvent(event) {
    if (!event?.kind) return;
    const kind = EVENT_ALIASES[event.kind] ?? event.kind;

    switch (kind) {
      case SOUND_EVENT_KINDS.COMPARE:
        this.playCompare(event.value);
        break;
      case SOUND_EVENT_KINDS.SWAP:
        this.playSwap();
        break;
      case SOUND_EVENT_KINDS.PIVOT:
        this.playPivot(event.value);
        break;
      case SOUND_EVENT_KINDS.COMPLETE:
        this.playSorted();
        break;
      case SOUND_EVENT_KINDS.VISIT:
        this.playNodeVisit();
        break;
      case SOUND_EVENT_KINDS.FRONTIER:
        this.playFrontier();
        break;
      case SOUND_EVENT_KINDS.TARGET_FOUND:
        this.playTargetFound();
        break;
      case SOUND_EVENT_KINDS.PATH_FOUND:
        this.playPathFound();
        break;
      case SOUND_EVENT_KINDS.NO_RESULT:
        this.playNoResult();
        break;
      case SOUND_EVENT_KINDS.EDGE_CONSIDER:
        this.playEdgeConsider();
        break;
      case SOUND_EVENT_KINDS.EDGE_SELECT:
        this.playEdgeSelect();
        break;
      case SOUND_EVENT_KINDS.CYCLE:
        this.playCycle();
        break;
      case SOUND_EVENT_KINDS.MATRIX_CONSIDER:
        this.playMatrixConsider();
        break;
      case SOUND_EVENT_KINDS.MATRIX_UPDATE:
        this.playMatrixUpdate();
        break;
      case SOUND_EVENT_KINDS.COMPONENT_COMPLETE:
        this.playComponentComplete();
        break;
      default:
        break;
    }
  }

  playEvents(events) {
    if (!Array.isArray(events) || !events.length) return;
    const seen = new Set();
    events
      .filter(event => {
        const kind = EVENT_ALIASES[event?.kind] ?? event?.kind;
        if (!kind || seen.has(kind)) return false;
        seen.add(kind);
        return true;
      })
      .slice(0, MAX_EVENTS_PER_STEP)
      .forEach(event => this.playEvent(event));
  }
}

export const soundManager = new SoundManager();
