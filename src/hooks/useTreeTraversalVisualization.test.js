/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { VISUALIZATION_MODES } from '../constants/index.js';
import { useTreeTraversalVisualization } from './useTreeTraversalVisualization.js';

const { soundManager } = vi.hoisted(() => ({
  soundManager: {
    playNodeVisit: vi.fn(),
  },
}));

vi.mock('../utils/soundManager.js', () => ({
  soundManager,
}));

describe('useTreeTraversalVisualization', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads steps for inorderTraversal on mount', async () => {
    const { result } = renderHook(() =>
      useTreeTraversalVisualization(
        'inorderTraversal',
        1000,
        VISUALIZATION_MODES.MANUAL,
        7
      )
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });

    expect(result.current.treeNodes.length).toBeGreaterThan(0);
    expect(result.current.description.length).toBeGreaterThan(0);
  });

  it('loads steps for postorderTraversal on mount', async () => {
    const { result } = renderHook(() =>
      useTreeTraversalVisualization(
        'postorderTraversal',
        1000,
        VISUALIZATION_MODES.MANUAL,
        7
      )
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });

    expect(result.current.treeNodes.length).toBeGreaterThan(0);
    expect(result.current.description.length).toBeGreaterThan(0);
  });

  it('loads steps for levelOrderTraversal on mount', async () => {
    const { result } = renderHook(() =>
      useTreeTraversalVisualization(
        'levelOrderTraversal',
        1000,
        VISUALIZATION_MODES.MANUAL,
        7
      )
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });

    expect(result.current.treeNodes.length).toBeGreaterThan(0);
    expect(result.current.description.length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.queueOrder)).toBe(true);
    expect(result.current.treeLevelScanDirection).toBeNull();
  });

  it('loads steps for zigzagLevelOrderTraversal and exposes scan direction', async () => {
    const { result } = renderHook(() =>
      useTreeTraversalVisualization(
        'zigzagLevelOrderTraversal',
        1000,
        VISUALIZATION_MODES.MANUAL,
        7
      )
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });

    expect(result.current.treeLevelScanDirection).toBe('ltr');
    expect(Array.isArray(result.current.queueOrder)).toBe(true);
  });

  it('loads steps for preorderTraversal on mount', async () => {
    const { result } = renderHook(() =>
      useTreeTraversalVisualization(
        'preorderTraversal',
        1000,
        VISUALIZATION_MODES.MANUAL,
        7
      )
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });

    expect(result.current.treeNodes.length).toBeGreaterThan(0);
    expect(result.current.description.length).toBeGreaterThan(0);
  });

  it('loads steps for morrisTraversal on mount', async () => {
    const { result } = renderHook(() =>
      useTreeTraversalVisualization(
        'morrisTraversal',
        1000,
        VISUALIZATION_MODES.MANUAL,
        7
      )
    );

    await waitFor(() => {
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });

    expect(result.current.treeNodes.length).toBeGreaterThan(0);
    expect(result.current.description.length).toBeGreaterThan(0);
  });

  it('regenerateTree clears and reloads steps', async () => {
    const { result } = renderHook(() =>
      useTreeTraversalVisualization(
        'inorderTraversal',
        1000,
        VISUALIZATION_MODES.MANUAL,
        5
      )
    );

    await waitFor(() => expect(result.current.totalSteps).toBeGreaterThan(0));

    const before = result.current.steps.length;
    act(() => {
      result.current.regenerateTree();
    });

    await waitFor(() => {
      expect(result.current.steps.length).toBe(before);
      expect(result.current.currentStep).toBe(0);
    });
  });
});
