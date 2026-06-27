/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Master bus input gain (~-7 dB). Kept below 0 dB to stay pleasant, but loud
 * enough for laptop speakers and small device outputs.
 */
export const MASTER_INPUT_GAIN = 0.45;

let _Tone = null;

async function getTone() {
  if (!_Tone) {
    _Tone = await import('tone');
  }
  return _Tone;
}

/**
 * Shared effects bus: Gain -> LowPass -> Compressor -> Reverb -> Destination.
 * All instruments connect to `input` (the input Gain node).
 *
 * @returns {Promise<{ input: import('tone').Gain }>}
 */
export async function createMasterChain() {
  const Tone = await getTone();
  const inputGain = new Tone.Gain(MASTER_INPUT_GAIN);
  const filter = new Tone.Filter({
    frequency: 5000,
    type: 'lowpass',
    rolloff: -12,
  });
  const compressor = new Tone.Compressor({
    threshold: -24,
    ratio: 3,
  });
  const reverb = new Tone.Reverb({
    decay: 1.2,
    wet: 0.12,
  });

  await reverb.ready;

  inputGain.chain(filter, compressor, reverb, Tone.Destination);

  return { input: inputGain };
}
