/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { useAlgorithmConfig } from './algorithmConfig';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';
import { ALGORITHM_TYPES, ALGORITHM_TYPE_LIST } from '../constants';

const wrapper = ({ children }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

describe('useAlgorithmConfig', () => {
  it('byType has algorithms and groups for every ALGORITHM_TYPE', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    ALGORITHM_TYPE_LIST.forEach(type => {
      expect(result.current.byType[type]).toBeDefined();
      expect(result.current.byType[type].algorithms).toBeDefined();
      expect(result.current.byType[type].groups).toBeDefined();
      expect(result.current.byType[type].algorithms).toHaveLength(
        CATEGORY_CONFIG[type].algorithmKeys.length
      );
      expect(result.current.byType[type].groups).toHaveLength(
        CATEGORY_CONFIG[type].groupDefs.length
      );
    });
  });

  it('sortingAlgorithms length matches CATEGORY_CONFIG', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    expect(result.current.sortingAlgorithms).toHaveLength(
      CATEGORY_CONFIG[ALGORITHM_TYPES.SORTING].algorithmKeys.length
    );
  });

  it('each sorting algorithm should have value, label, complexity', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    result.current.sortingAlgorithms.forEach(algo => {
      expect(algo).toHaveProperty('value');
      expect(algo).toHaveProperty('label');
      expect(algo).toHaveProperty('complexity');
      expect(typeof algo.value).toBe('string');
      expect(typeof algo.label).toBe('string');
      expect(typeof algo.complexity).toBe('string');
    });
  });

  it('pathfindingAlgorithms length matches CATEGORY_CONFIG', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    expect(result.current.pathfindingAlgorithms).toHaveLength(
      CATEGORY_CONFIG[ALGORITHM_TYPES.PATHFINDING].algorithmKeys.length
    );
  });

  it('searchingAlgorithms length matches CATEGORY_CONFIG', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    expect(result.current.searchingAlgorithms).toHaveLength(
      CATEGORY_CONFIG[ALGORITHM_TYPES.SEARCHING].algorithmKeys.length
    );
  });

  it('each pathfinding algorithm should have value, label, complexity', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    result.current.pathfindingAlgorithms.forEach(algo => {
      expect(algo).toHaveProperty('value');
      expect(algo).toHaveProperty('label');
      expect(algo).toHaveProperty('complexity');
    });
  });

  it('each searching algorithm should have value, label, complexity', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    result.current.searchingAlgorithms.forEach(algo => {
      expect(algo).toHaveProperty('value');
      expect(algo).toHaveProperty('label');
      expect(algo).toHaveProperty('complexity');
    });
  });

  it('sortingGroups length matches CATEGORY_CONFIG groupDefs', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    expect(result.current.sortingGroups).toHaveLength(
      CATEGORY_CONFIG[ALGORITHM_TYPES.SORTING].groupDefs.length
    );
  });

  it('each sorting group should have label and algorithms', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    result.current.sortingGroups.forEach(group => {
      expect(group).toHaveProperty('label');
      expect(group).toHaveProperty('algorithms');
      expect(Array.isArray(group.algorithms)).toBe(true);
    });
  });

  it('pathfindingGroups length matches CATEGORY_CONFIG groupDefs', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    expect(result.current.pathfindingGroups).toHaveLength(
      CATEGORY_CONFIG[ALGORITHM_TYPES.PATHFINDING].groupDefs.length
    );
  });

  it('searchingGroups length matches CATEGORY_CONFIG groupDefs', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    expect(result.current.searchingGroups).toHaveLength(
      CATEGORY_CONFIG[ALGORITHM_TYPES.SEARCHING].groupDefs.length
    );
  });

  it('each pathfinding group should have label and algorithms', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    result.current.pathfindingGroups.forEach(group => {
      expect(group).toHaveProperty('label');
      expect(group).toHaveProperty('algorithms');
      expect(Array.isArray(group.algorithms)).toBe(true);
    });
  });

  it('each searching group should have label and algorithms', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    result.current.searchingGroups.forEach(group => {
      expect(group).toHaveProperty('label');
      expect(group).toHaveProperty('algorithms');
      expect(Array.isArray(group.algorithms)).toBe(true);
    });
  });

  it('should use translated labels for sorting algorithms', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    const bubbleSort = result.current.sortingAlgorithms.find(
      a => a.value === 'bubbleSort'
    );
    expect(bubbleSort).toBeDefined();
    expect(bubbleSort.label).toBeTruthy();
    expect(i18n.t('algorithms.sorting.bubbleSort')).toBe(bubbleSort.label);
  });

  it('should use translated labels for pathfinding algorithms', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    const bfs = result.current.pathfindingAlgorithms.find(
      a => a.value === 'bfs'
    );
    expect(bfs).toBeDefined();
    expect(bfs.label).toBeTruthy();
    expect(i18n.t('algorithms.pathfinding.bfs')).toBe(bfs.label);
  });

  it('should use translated labels for searching algorithms', () => {
    const { result } = renderHook(() => useAlgorithmConfig(), { wrapper });

    const linear = result.current.searchingAlgorithms.find(
      a => a.value === 'linearSearch'
    );
    expect(linear).toBeDefined();
    expect(linear.label).toBeTruthy();
    expect(i18n.t('algorithms.searching.linearSearch')).toBe(linear.label);

    const binary = result.current.searchingAlgorithms.find(
      a => a.value === 'binarySearch'
    );
    expect(binary).toBeDefined();
    expect(binary.label).toBeTruthy();
    expect(i18n.t('algorithms.searching.binarySearch')).toBe(binary.label);

    const jump = result.current.searchingAlgorithms.find(
      a => a.value === 'jumpSearch'
    );
    expect(jump).toBeDefined();
    expect(jump.label).toBeTruthy();
    expect(i18n.t('algorithms.searching.jumpSearch')).toBe(jump.label);

    const interpolation = result.current.searchingAlgorithms.find(
      a => a.value === 'interpolationSearch'
    );
    expect(interpolation).toBeDefined();
    expect(interpolation.label).toBeTruthy();
    expect(i18n.t('algorithms.searching.interpolationSearch')).toBe(
      interpolation.label
    );

    const exponential = result.current.searchingAlgorithms.find(
      a => a.value === 'exponentialSearch'
    );
    expect(exponential).toBeDefined();
    expect(exponential.label).toBeTruthy();
    expect(i18n.t('algorithms.searching.exponentialSearch')).toBe(
      exponential.label
    );

    const fibonacci = result.current.searchingAlgorithms.find(
      a => a.value === 'fibonacciSearch'
    );
    expect(fibonacci).toBeDefined();
    expect(fibonacci.label).toBeTruthy();
    expect(i18n.t('algorithms.searching.fibonacciSearch')).toBe(
      fibonacci.label
    );
  });
});
