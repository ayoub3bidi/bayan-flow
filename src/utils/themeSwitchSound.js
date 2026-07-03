/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

const SWITCH_SOUND_URL = '/ui/sfx/switch-on.mp3';
const SWITCH_GAIN = 0.38;
const OFF_PLAYBACK_RATE = 0.82;

let audioContext = null;
let switchOnBuffer = null;
let switchOffBuffer = null;
let loadPromise = null;

function prefersReducedMotion() {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function reverseAudioBuffer(buffer, context) {
  const reversed = context.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const input = buffer.getChannelData(channel);
    const output = reversed.getChannelData(channel);

    for (let index = 0; index < input.length; index += 1) {
      output[index] = input[input.length - 1 - index];
    }
  }

  return reversed;
}

async function ensureSwitchBuffers() {
  if (switchOnBuffer && switchOffBuffer) {
    return { on: switchOnBuffer, off: switchOffBuffer };
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      const context = getAudioContext();
      if (!context) {
        return null;
      }

      const response = await fetch(SWITCH_SOUND_URL);
      if (!response.ok) {
        throw new Error(
          `Failed to load theme switch sound (${response.status})`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const decoded = await context.decodeAudioData(arrayBuffer);
      switchOnBuffer = decoded;
      switchOffBuffer = reverseAudioBuffer(decoded, context);

      return { on: switchOnBuffer, off: switchOffBuffer };
    })();
  }

  return loadPromise;
}

/**
 * Plays a light-switch click when the user toggles theme.
 * Uses switch-on.mp3 forward for light mode and a reversed/pitched variant for dark.
 *
 * @param {'light' | 'dark'} targetTheme Theme being switched to
 */
export async function playThemeSwitchSound(targetTheme) {
  if (prefersReducedMotion()) {
    return;
  }

  try {
    const context = getAudioContext();
    if (!context) {
      return;
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    const buffers = await ensureSwitchBuffers();
    if (!buffers) {
      return;
    }

    const turningLightsOn = targetTheme === 'light';
    const source = context.createBufferSource();
    source.buffer = turningLightsOn ? buffers.on : buffers.off;
    source.playbackRate.value = turningLightsOn ? 1 : OFF_PLAYBACK_RATE;

    const gain = context.createGain();
    gain.gain.value = SWITCH_GAIN;

    source.connect(gain);
    gain.connect(context.destination);
    source.start(0);
  } catch {
    // Theme switching must never fail because of audio.
  }
}

/** @internal Test helper */
export function resetThemeSwitchSoundForTests() {
  audioContext = null;
  switchOnBuffer = null;
  switchOffBuffer = null;
  loadPromise = null;
}
