/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ANIMATION_SPEEDS } from '../constants/index.js';
import { getCompareFrequency, getPivotFrequency } from './soundFrequencies.js';
import { TONE_INSTRUMENT_PRESETS } from './toneInstrumentPresets.js';
import { SOUND_EVENT_KINDS } from './soundEvents.js';
import { createMasterChain } from './masterChain.js';
import { getPentatonicNoteName } from './scaleQuantizer.js';
import {
  getPaletteForCategory,
  getChordForCategory,
} from './categoryPalettes.js';

let _Tone = null;

async function getTone() {
  if (!_Tone) {
    _Tone = await import('tone');
  }
  return _Tone;
}

const MAX_EVENTS_PER_STEP = 3;

const EVENT_ALIASES = {
  sorted: SOUND_EVENT_KINDS.COMPLETE,
  nodeVisit: SOUND_EVENT_KINDS.VISIT,
};

const ARPEGGIO_SPACING_SEC = 0.08;
const MILESTONE_NOTE_DURATION = '4n';
const COMPARE_NOTE_DURATION = '8n';
const PASS_NOTE_DURATION = '8n';

const MICRO_THROTTLE_KINDS = new Set([
  SOUND_EVENT_KINDS.COMPARE,
  SOUND_EVENT_KINDS.VISIT,
  SOUND_EVENT_KINDS.FRONTIER,
  SOUND_EVENT_KINDS.EDGE_CONSIDER,
  SOUND_EVENT_KINDS.MATRIX_CONSIDER,
]);

class SoundManager {
  constructor() {
    this.isEnabled = false;
    this.instruments = null;
    this.initPromise = null;
    this.playbackContext = null;
    this.microEventCounters = {};
    this.melodicStepCounter = 0;
  }

  async _buildInstruments() {
    const Tone = await getTone();
    const { input: busInput } = await createMasterChain();

    const softSynth = new Tone.Synth(TONE_INSTRUMENT_PRESETS.softSynth);
    const pluckSynth = new Tone.PluckSynth(TONE_INSTRUMENT_PRESETS.pluckSynth);
    const kalimbaSynth = new Tone.FMSynth(TONE_INSTRUMENT_PRESETS.kalimbaSynth);
    const bellSynth = new Tone.AMSynth(TONE_INSTRUMENT_PRESETS.bellSynth);
    const polySynth = new Tone.PolySynth(
      Tone.FMSynth,
      TONE_INSTRUMENT_PRESETS.polySynthVoice
    );

    softSynth.connect(busInput);
    pluckSynth.connect(busInput);
    kalimbaSynth.connect(busInput);
    bellSynth.connect(busInput);
    polySynth.connect(busInput);

    softSynth.volume.value = -2;
    pluckSynth.volume.value = -2;
    kalimbaSynth.volume.value = 0;
    bellSynth.volume.value = -1;
    polySynth.volume.value = -1;

    this.instruments = {
      busInput,
      softSynth,
      pluckSynth,
      kalimbaSynth,
      bellSynth,
      polySynth,
    };

    return this.instruments;
  }

  ensureInstruments() {
    if (!this.instruments) {
      throw new Error(
        'Sound instruments not initialized. Call enable() first.'
      );
    }
    return this.instruments;
  }

  async ensureInstrumentsAsync() {
    if (this.instruments) return this.instruments;
    if (!this.initPromise) {
      this.initPromise = this._buildInstruments();
    }
    return this.initPromise;
  }

  async enable() {
    const Tone = await getTone();
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    this.isEnabled = true;
    this.microEventCounters = {};
    this.melodicStepCounter = 0;
    await this.ensureInstrumentsAsync();
  }

  disable() {
    this.isEnabled = false;
  }

  getIsEnabled() {
    return this.isEnabled;
  }

  getPalette() {
    return getPaletteForCategory(this.playbackContext?.algorithmType);
  }

  resolveChord(chordKey) {
    return getChordForCategory(this.playbackContext?.algorithmType, chordKey);
  }

  resolveInstrument(key) {
    const { instruments } = this;
    return instruments[key] ?? instruments.softSynth;
  }

  withTemporaryVolume(synth, volumeDb, playFn) {
    if (!synth?.volume || volumeDb === 0) {
      playFn();
      return;
    }

    const previousVolume = synth.volume.value;
    synth.volume.value = previousVolume + volumeDb;
    playFn();
    synth.volume.value = previousVolume;
  }

  shouldSkipMicroEvent(kind) {
    if (!MICRO_THROTTLE_KINDS.has(kind)) return false;

    const speed = this.playbackContext?.speed;
    if (speed == null || speed > ANIMATION_SPEEDS.VERY_FAST) {
      return false;
    }

    const nextCount = (this.microEventCounters[kind] ?? 0) + 1;
    this.microEventCounters[kind] = nextCount;
    return nextCount % 2 !== 0;
  }

  nextMelodicNote() {
    const palette = this.getPalette();
    const note = getPentatonicNoteName(this.melodicStepCounter, {
      baseMidi: palette.melodicBaseMidi ?? 60,
    });
    this.melodicStepCounter += 1;
    return note;
  }

  async arpeggiate(
    synth,
    notes,
    { ascending = true, noteDuration = MILESTONE_NOTE_DURATION } = {}
  ) {
    const Tone = await getTone();
    const ordered = ascending ? notes : [...notes].reverse();
    const now = Tone.now();
    ordered.forEach((note, index) => {
      synth.triggerAttackRelease(
        note,
        noteDuration,
        now + index * ARPEGGIO_SPACING_SEC
      );
    });
  }

  runWhenReady(callback) {
    if (!this.isEnabled) return;
    void this.ensureInstrumentsAsync().then(() => {
      if (!this.isEnabled) return;
      callback();
    });
  }

  playCompare(value) {
    if (this.shouldSkipMicroEvent(SOUND_EVENT_KINDS.COMPARE)) return;

    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.compareInstrument);
      const normalizedValue = Number.isFinite(Number(value))
        ? Number(value)
        : 50;
      const freq = getCompareFrequency(normalizedValue);
      const duration = palette.compareDuration || COMPARE_NOTE_DURATION;
      this.withTemporaryVolume(synth, palette.compareVolumeDb, () => {
        synth.triggerAttackRelease(freq, duration);
      });
    });
  }

  playSwap() {
    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.swapInstrument);
      const duration = palette.accentDuration;
      this.withTemporaryVolume(synth, palette.accentVolumeDb, () => {
        synth.triggerAttackRelease('G4', duration);
      });
    });
  }

  playPivot(value) {
    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.pivotInstrument);
      const normalizedValue = Number.isFinite(Number(value))
        ? Number(value)
        : 50;
      const freq = getPivotFrequency(normalizedValue);
      this.withTemporaryVolume(synth, palette.accentVolumeDb, () => {
        synth.triggerAttackRelease(freq, '8n');
      });
    });
  }

  playPassComplete() {
    const palette = this.getPalette();
    const chord = this.resolveChord('passComplete');
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.swapInstrument);
      this.withTemporaryVolume(synth, palette.accentVolumeDb, () => {
        this.arpeggiate(synth, chord, {
          noteDuration: PASS_NOTE_DURATION,
        });
      });
    });
  }

  playSorted() {
    const palette = this.getPalette();
    const chord = this.resolveChord('complete');
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.milestoneInstrument);
      this.withTemporaryVolume(synth, palette.milestoneVolumeDb, () => {
        this.arpeggiate(synth, chord);
      });
    });
  }

  playNodeVisit() {
    if (this.shouldSkipMicroEvent(SOUND_EVENT_KINDS.VISIT)) return;

    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.visitInstrument);
      const note = this.nextMelodicNote();
      const duration = palette.microDuration;
      this.withTemporaryVolume(synth, palette.microVolumeDb, () => {
        synth.triggerAttackRelease(note, duration);
      });
    });
  }

  playPathFound() {
    const palette = this.getPalette();
    const chord = this.resolveChord('pathFound');
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.milestoneInstrument);
      this.withTemporaryVolume(synth, palette.milestoneVolumeDb, () => {
        this.arpeggiate(synth, chord);
      });
    });
  }

  playFrontier() {
    if (this.shouldSkipMicroEvent(SOUND_EVENT_KINDS.FRONTIER)) return;

    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.frontierInstrument);
      const note = this.nextMelodicNote();
      const duration = palette.microDuration;
      this.withTemporaryVolume(synth, palette.microVolumeDb, () => {
        synth.triggerAttackRelease(note, duration);
      });
    });
  }

  playTargetFound() {
    const palette = this.getPalette();
    const chord = this.resolveChord('targetFound');
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.milestoneInstrument);
      this.withTemporaryVolume(synth, palette.milestoneVolumeDb, () => {
        this.arpeggiate(synth, chord);
      });
    });
  }

  playNoResult() {
    const palette = this.getPalette();
    const chord = this.resolveChord('noResult');
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.milestoneInstrument);
      this.withTemporaryVolume(synth, palette.milestoneVolumeDb, () => {
        this.arpeggiate(synth, chord, { ascending: false });
      });
    });
  }

  playEdgeConsider() {
    if (this.shouldSkipMicroEvent(SOUND_EVENT_KINDS.EDGE_CONSIDER)) return;

    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.edgeConsiderInstrument);
      const note = this.nextMelodicNote();
      const duration = palette.microDuration;
      this.withTemporaryVolume(synth, palette.microVolumeDb, () => {
        synth.triggerAttackRelease(note, duration);
      });
    });
  }

  playEdgeSelect() {
    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.edgeSelectInstrument);
      const duration = palette.accentDuration;
      this.withTemporaryVolume(synth, palette.accentVolumeDb, () => {
        synth.triggerAttackRelease('E4', duration);
      });
    });
  }

  playCycle() {
    const palette = this.getPalette();
    const chord = this.resolveChord('cycle');
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.milestoneInstrument);
      this.withTemporaryVolume(synth, palette.milestoneVolumeDb, () => {
        this.arpeggiate(synth, chord, { ascending: false });
      });
    });
  }

  playMatrixConsider() {
    if (this.shouldSkipMicroEvent(SOUND_EVENT_KINDS.MATRIX_CONSIDER)) return;

    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.matrixConsiderInstrument);
      const note = this.nextMelodicNote();
      const duration = palette.microDuration;
      this.withTemporaryVolume(synth, palette.microVolumeDb, () => {
        synth.triggerAttackRelease(note, duration);
      });
    });
  }

  playMatrixUpdate() {
    const palette = this.getPalette();
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.matrixUpdateInstrument);
      const duration = palette.accentDuration;
      this.withTemporaryVolume(synth, palette.accentVolumeDb, () => {
        synth.triggerAttackRelease('E4', duration);
      });
    });
  }

  playComponentComplete() {
    const palette = this.getPalette();
    const chord = this.resolveChord('componentComplete');
    this.runWhenReady(() => {
      const synth = this.resolveInstrument(palette.milestoneInstrument);
      this.withTemporaryVolume(synth, palette.milestoneVolumeDb, () => {
        this.arpeggiate(synth, chord);
      });
    });
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
      case SOUND_EVENT_KINDS.PASS_COMPLETE:
        this.playPassComplete();
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

  playEvents(events, context = {}) {
    if (!Array.isArray(events) || !events.length) return;

    this.playbackContext = context;

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

    queueMicrotask(() => {
      this.playbackContext = null;
    });
  }
}

export const soundManager = new SoundManager();
