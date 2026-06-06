/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ALGORITHM_TYPES, VISUALIZATION_MODES } from '../constants/index.js';
import { binarySearch } from '../algorithms/searching/binarySearch.js';
import { jumpSearch } from '../algorithms/searching/jumpSearch.js';
import { useSearchingVisualization } from './useSearchingVisualization.js';

const { soundManager } = vi.hoisted(() => ({
  soundManager: {
    playEvents: vi.fn(),
  },
}));

vi.mock('../utils/soundManager.js', () => ({
  soundManager,
}));

describe('useSearchingVisualization', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the first step for jumpSearch on mount', async () => {
    const values = [1, 3, 5, 7, 9];
    const target = values[0];
    const expectedSteps = jumpSearch(values, target);

    const { result } = renderHook(
      ({ array }) =>
        useSearchingVisualization(
          'jumpSearch',
          array,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { array: values } }
    );

    await waitFor(() => {
      expect(result.current.description).toBe(expectedSteps[0].description);
    });

    expect(result.current.array).toEqual(expectedSteps[0].array);
    expect(result.current.states).toEqual(expectedSteps[0].states);
    expect(result.current.targetValue).toBe(target);
    expect(result.current.totalSteps).toBe(expectedSteps.length);
  });

  it('loads the first step for binarySearch on mount', async () => {
    const values = [1, 3, 5, 7, 9];
    const target = values[0];
    const expectedSteps = binarySearch(values, target);

    const { result } = renderHook(
      ({ array }) =>
        useSearchingVisualization(
          'binarySearch',
          array,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { array: values } }
    );

    await waitFor(() => {
      expect(result.current.description).toBe(expectedSteps[0].description);
    });

    expect(result.current.array).toEqual(expectedSteps[0].array);
    expect(result.current.states).toEqual(expectedSteps[0].states);
    expect(result.current.targetValue).toBe(target);
    expect(result.current.totalSteps).toBe(expectedSteps.length);
  });

  it('reloads when algorithm key changes from binarySearch to invalid', async () => {
    const values = [2, 4, 6];
    const expectedSteps = binarySearch(values, values[0]);

    const { result, rerender } = renderHook(
      ({ algorithmKey }) =>
        useSearchingVisualization(
          algorithmKey,
          values,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { algorithmKey: 'binarySearch' } }
    );

    await waitFor(() => {
      expect(result.current.description).toBe(expectedSteps[0].description);
    });
    expect(result.current.totalSteps).toBe(expectedSteps.length);

    rerender({ algorithmKey: 'notARealSearchKey' });

    await waitFor(() => {
      expect(result.current.totalSteps).toBe(0);
    });
    expect(result.current.description).toBe('');
  });

  it('reloads steps when the input array changes', async () => {
    const first = [1, 2, 3];
    const second = [10, 20, 30];
    const initialSteps = binarySearch(first, first[0]);
    const updatedSteps = binarySearch(second, second[0]);

    const { result, rerender } = renderHook(
      ({ values }) =>
        useSearchingVisualization(
          'binarySearch',
          values,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { values: first } }
    );

    await waitFor(() => {
      expect(result.current.description).toBe(initialSteps[0].description);
    });

    rerender({ values: second });

    await waitFor(() => {
      expect(result.current.description).toBe(updatedSteps[0].description);
    });

    expect(result.current.array).toEqual(updatedSteps[0].array);
    expect(result.current.states).toEqual(updatedSteps[0].states);
    expect(result.current.targetValue).toBe(second[0]);
  });

  it('reloadSteps reloads steps for the current algorithm and array', async () => {
    const values = [1, 5, 9];
    const expectedSteps = binarySearch(values, values[0]);
    const { result } = renderHook(
      ({ array }) =>
        useSearchingVisualization(
          'binarySearch',
          array,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { array: values } }
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBe(expectedSteps.length);
    });

    act(() => {
      result.current.stepForward();
    });
    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.reloadSteps();
    });

    await waitFor(() => {
      expect(result.current.description).toBe(expectedSteps[0].description);
    });

    expect(result.current.currentStep).toBe(0);
    expect(result.current.array).toEqual(expectedSteps[0].array);
  });

  it('clears playback when algorithm key is missing or array is empty', async () => {
    const values = [1, 2];
    const initialSteps = binarySearch(values, values[0]);
    const { result, rerender } = renderHook(
      ({ algorithmKey, arr }) =>
        useSearchingVisualization(
          algorithmKey,
          arr,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { algorithmKey: 'binarySearch', arr: values } }
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBe(initialSteps.length);
    });

    rerender({ algorithmKey: '', arr: [] });

    await waitFor(() => {
      expect(result.current.totalSteps).toBe(0);
    });

    expect(result.current.description).toBe('');
    expect(result.current.array).toEqual([]);
    expect(result.current.states).toEqual([]);
    expect(result.current.targetValue).toBeNull();
  });

  it('loads no steps when algorithm key does not resolve', async () => {
    const values = [1, 2, 3];
    const { result } = renderHook(() =>
      useSearchingVisualization(
        'unknownSearch',
        values,
        100,
        VISUALIZATION_MODES.MANUAL
      )
    );

    await waitFor(
      () => {
        expect(result.current.totalSteps).toBe(0);
      },
      { timeout: 5000 }
    );
  });

  it('stepForward advances manual playback', async () => {
    const values = [1, 3, 5, 7, 9];
    const { result } = renderHook(() =>
      useSearchingVisualization(
        'binarySearch',
        values,
        100,
        VISUALIZATION_MODES.MANUAL
      )
    );

    await waitFor(
      () => {
        expect(result.current.totalSteps).toBeGreaterThan(1);
      },
      { timeout: 5000 }
    );

    act(() => {
      result.current.stepForward();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('emits a compare sound event when applied step includes COMPARING', async () => {
    const values = [1, 3, 5, 7, 9];
    const { result } = renderHook(() =>
      useSearchingVisualization(
        'binarySearch',
        values,
        100,
        VISUALIZATION_MODES.MANUAL
      )
    );

    await waitFor(
      () => {
        expect(result.current.totalSteps).toBeGreaterThan(1);
      },
      { timeout: 5000 }
    );

    act(() => {
      result.current.stepForward();
    });

    const midValue = values[Math.floor((0 + (values.length - 1)) / 2)];
    expect(soundManager.playEvents).toHaveBeenCalledWith(
      [{ kind: 'compare', value: midValue }],
      expect.objectContaining({
        algorithmType: ALGORITHM_TYPES.SEARCHING,
        algorithmKey: 'binarySearch',
        stepIndex: 1,
        speed: 100,
      })
    );
  });

  it('updates targetValue when stepping through steps that include targetValue', async () => {
    const values = [4, 5, 6];
    const target = values[0];
    const steps = binarySearch(values, target);
    const { result } = renderHook(() =>
      useSearchingVisualization(
        'binarySearch',
        values,
        100,
        VISUALIZATION_MODES.MANUAL
      )
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBe(steps.length);
    });

    expect(result.current.targetValue).toBe(target);

    for (let i = 1; i < steps.length; i++) {
      act(() => {
        result.current.stepForward();
      });
      expect(result.current.targetValue).toBe(steps[i].targetValue);
    }
  });

  it('loads node–link depthFirstSearch with graph props and empty array slot', async () => {
    vi.spyOn(Math, 'random').mockRestore();
    let n = 0;
    vi.spyOn(Math, 'random').mockImplementation(
      () => [0.1, 0.1, 0.9, 0.9][n++ % 4]
    );

    const { result } = renderHook(() =>
      useSearchingVisualization(
        'depthFirstSearch',
        [1, 2, 3, 5, 7],
        1000,
        VISUALIZATION_MODES.MANUAL,
        6
      )
    );

    await waitFor(
      () => {
        expect(result.current.totalSteps).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    expect(result.current.array).toEqual([]);
    expect(result.current.states).toEqual([]);
    expect(Array.isArray(result.current.graphNodes)).toBe(true);
    expect(result.current.graphNodes.length).toBeGreaterThan(1);
    expect(result.current.graphEdges.length).toBeGreaterThan(0);
  });
});
