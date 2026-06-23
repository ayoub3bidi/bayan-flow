/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { VISUALIZATION_MODES } from '../constants/index.js';
import { algorithms } from '../algorithms';
import { useSortingVisualization } from './useSortingVisualization';

const { soundManager } = vi.hoisted(() => ({
  soundManager: {
    playEvents: vi.fn(),
  },
}));

vi.mock('../utils/soundManager.js', () => ({
  soundManager,
}));

describe('useSortingVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the first step for the active algorithm on mount', async () => {
    const values = [3, 1, 2];
    const expectedSteps = algorithms.bubbleSort(values);
    const { result } = renderHook(
      ({ array }) =>
        useSortingVisualization(
          'bubbleSort',
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
    expect(result.current.totalSteps).toBe(expectedSteps.length);
  });

  it('reloads steps when the algorithm key changes', async () => {
    const values = [4, 2, 1];
    const expectedQuickSortSteps = algorithms.quickSort(values);
    const { result, rerender } = renderHook(
      ({ algorithmKey }) =>
        useSortingVisualization(
          algorithmKey,
          values,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { algorithmKey: 'bubbleSort' } }
    );

    await waitFor(() => {
      expect(result.current.description).toBe(
        algorithms.bubbleSort(values)[0].description
      );
    });

    rerender({ algorithmKey: 'quickSort' });

    await waitFor(() => {
      expect(result.current.description).toBe(
        expectedQuickSortSteps[0].description
      );
    });

    expect(result.current.array).toEqual(expectedQuickSortSteps[0].array);
    expect(result.current.states).toEqual(expectedQuickSortSteps[0].states);
    expect(result.current.totalSteps).toBe(expectedQuickSortSteps.length);
  });

  it('keeps the loaded first step when the input array changes', async () => {
    const initialSteps = algorithms.bubbleSort([5, 1, 3]);
    const updatedSteps = algorithms.bubbleSort([9, 4, 7]);
    const { result, rerender } = renderHook(
      ({ values }) =>
        useSortingVisualization(
          'bubbleSort',
          values,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { values: [5, 1, 3] } }
    );

    await waitFor(() => {
      expect(result.current.description).toBe(initialSteps[0].description);
    });

    rerender({ values: [9, 4, 7] });

    await waitFor(() => {
      expect(result.current.description).toBe(updatedSteps[0].description);
    });

    expect(result.current.array).toEqual(updatedSteps[0].array);
    expect(result.current.states).toEqual(updatedSteps[0].states);
  });

  it('reloadSteps reloads steps for the current algorithm and array', async () => {
    const values = [6, 2];
    const expectedSteps = algorithms.bubbleSort(values);
    const { result } = renderHook(
      ({ array }) =>
        useSortingVisualization(
          'bubbleSort',
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
      result.current.reloadSteps();
    });

    await waitFor(() => {
      expect(result.current.description).toBe(expectedSteps[0].description);
    });

    expect(result.current.currentStep).toBe(0);
    expect(result.current.array).toEqual(expectedSteps[0].array);
  });

  it('clears playback state when algorithm key is missing or array is empty', async () => {
    const initialSteps = algorithms.bubbleSort([2, 1]);
    const { result, rerender } = renderHook(
      ({ algorithmKey, values }) =>
        useSortingVisualization(
          algorithmKey,
          values,
          1000,
          VISUALIZATION_MODES.MANUAL
        ),
      { initialProps: { algorithmKey: 'bubbleSort', values: [2, 1] } }
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBe(initialSteps.length);
    });

    rerender({ algorithmKey: '', values: [] });

    await waitFor(() => {
      expect(result.current.totalSteps).toBe(0);
    });

    expect(result.current.description).toBe('');
    expect(result.current.array).toEqual([]);
    expect(result.current.states).toEqual([]);
  });

  it('stepForward advances manual playback', async () => {
    const values = [3, 1, 2];
    const { result } = renderHook(() =>
      useSortingVisualization(
        'bubbleSort',
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

  it('loads no steps when algorithm key does not resolve', async () => {
    const values = [1, 2, 3];
    const { result } = renderHook(() =>
      useSortingVisualization(
        'notARealSortKey',
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
});
