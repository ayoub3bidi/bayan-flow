/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { registerBlocks } from './definitions.js';
import { generateProgram, stripBlockMarkers } from './generators.js';
import { getBlocksStarter } from './starters/index.js';

const SOLUTION_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
`;

function load(json) {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(json, workspace);
  return workspace;
}

describe('generateProgram', () => {
  beforeAll(() => {
    Blockly.setLocale(En);
    registerBlocks();
  });

  it('generates clean, reference-like Python for the starter', () => {
    const program = generateProgram(
      load(getBlocksStarter('bubbleSort').workspace)
    );
    expect(program.displayCode).toBe(SOLUTION_CODE);
    expect(program.displayCode).not.toMatch(/global|= None|@@bf|__bf/);
  });

  it('routes compares, swaps and loop ticks through the tracer in execCode', () => {
    const program = generateProgram(
      load(getBlocksStarter('bubbleSort').workspace)
    );
    expect(program.execCode).toMatch(/if __bf\.gt\(arr, j, j \+ 1, '[^']+'\):/);
    expect(program.execCode).toMatch(/__bf\.swap\(arr, j, j \+ 1, '[^']+'\)/);
    expect(program.execCode.match(/__bf\.tick\(\)/g)).toHaveLength(2);
    expect(program.execCode).not.toMatch(/@@bf|= None/);
  });

  it('maps each display line to the statement block that produced it', () => {
    const workspace = load(getBlocksStarter('bubbleSort').workspace);
    const program = generateProgram(workspace);
    const lines = program.displayCode.split('\n');
    const swapLine = lines.findIndex(l => l.includes('arr[j], arr[j + 1] ='));
    const swapBlock = workspace.getBlocksByType('bf_swap', false)[0];
    expect(program.lineBlockIds[swapLine]).toBe(swapBlock.id);
    expect(program.lineBlockIds[0]).toBe('bf_hat');

    const compareBlock = workspace.getBlocksByType('bf_compare', false)[0];
    const ifBlock = compareBlock.getParent();
    expect(program.statementIds[compareBlock.id]).toBe(ifBlock.id);
    const ifLine = lines.findIndex(l => l.includes('if arr[j] > arr[j + 1]'));
    expect(program.lineBlockIds[ifLine]).toBe(ifBlock.id);
  });

  it('generates an emptied loop body as pass', () => {
    const workspace = load(getBlocksStarter('bubbleSort').workspace);
    workspace.getBlocksByType('controls_if', false)[0].dispose(false);
    expect(generateProgram(workspace).displayCode).toContain(
      'for j in range(n - i - 1):\n            pass\n'
    );
  });

  it('keeps phase-1 saved workspaces (no NAME field) as bubble_sort', () => {
    const saved = structuredClone(getBlocksStarter('bubbleSort').workspace);
    delete saved.blocks.blocks[0].fields;
    const program = generateProgram(load(saved));
    expect(program).toMatchObject({
      kind: 'sort',
      functionName: 'bubble_sort',
    });
    expect(program.displayCode).toBe(SOLUTION_CODE);
  });

  it('reads the function name from a signature label, with or without params', () => {
    const json = structuredClone(getBlocksStarter('selectionSort').workspace);
    expect(generateProgram(load(json)).functionName).toBe('selection_sort');
    json.blocks.blocks[0].fields.NAME = 'selection_sort';
    expect(generateProgram(load(json)).displayCode).toMatch(
      /^def selection_sort\(arr\):/
    );
  });

  it('renames a learner variable that would shadow arr or target', () => {
    const json = structuredClone(getBlocksStarter('linearSearch').workspace);
    json.variables[0].name = 'target'; // the loop variable `i`
    const { displayCode } = generateProgram(load(json));
    expect(displayCode).toMatch(/for target2 in range\(len\(arr\)\):/);
    expect(displayCode).toContain('if arr[target2] == target:');
  });

  it('returns null without the define block', () => {
    expect(generateProgram(new Blockly.Workspace())).toBeNull();
  });
});

// Expected Python for the first array starters, mirroring the reference .py
// files (insertion sort is the swap-based variant).
const ARRAY_PROGRAMS = {
  selectionSort: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_index = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j
        if min_index != i:
            arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr
`,
  insertionSort: `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        j = i
        while j > 0 and arr[j - 1] > arr[j]:
            arr[j - 1], arr[j] = arr[j], arr[j - 1]
            j = j - 1
    return arr
`,
  linearSearch: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
`,
  binarySearch: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
`,
};

describe('array starters', () => {
  beforeAll(() => {
    Blockly.setLocale(En);
    registerBlocks();
  });

  it.each(Object.entries(ARRAY_PROGRAMS))(
    'generates the %s program',
    (key, expected) => {
      const program = generateProgram(load(getBlocksStarter(key).workspace));
      expect(program.displayCode).toBe(expected);
      expect(program.kind).toBe(key.endsWith('Search') ? 'search' : 'sort');
    }
  );

  it('traces target compares and keeps `and` short-circuiting', () => {
    const binary = generateProgram(
      load(getBlocksStarter('binarySearch').workspace)
    );
    expect(binary.execCode).toMatch(
      /if __bf\.cmp_target\(arr, mid, target, 'EQ', '[^']+'\):\n\s+return mid/
    );
    expect(binary.execCode).toMatch(/while left <= right:\n\s+__bf\.tick\(\)/);

    const insertion = generateProgram(
      load(getBlocksStarter('insertionSort').workspace)
    );
    expect(insertion.execCode).toMatch(
      /while j > 0 and __bf\.gt\(arr, j - 1, j, '[^']+'\):/
    );
  });
});

describe('stripBlockMarkers', () => {
  it('drops marker lines and keeps the innermost id per line', () => {
    const result = stripBlockMarkers(
      "# @@bf:'a'\nx = 1\n  # @@bf:'a'\n  # @@bf:'b'\n  y = 2\n\n"
    );
    expect(result.code).toBe('x = 1\n  y = 2\n');
    expect(result.lineBlockIds).toEqual(['a', 'b']);
  });
});

describe('helpers and new array blocks', () => {
  beforeAll(() => {
    Blockly.setLocale(En);
    registerBlocks();
  });

  it('emits helper functions before the main one and maps their lines', () => {
    const workspace = load(getBlocksStarter('quickSort').workspace);
    const program = generateProgram(workspace);
    const defs = [...program.displayCode.matchAll(/^def (\w+)/gm)].map(
      m => m[1]
    );
    expect(defs).toEqual(['quick_sort_range', 'partition', 'quick_sort']);
    expect(program.displayCode).toContain('p = partition(arr, low, high)');
    expect(program.displayCode).toContain('if arr[j] <= arr[high]:');
    expect(program.displayCode).toContain('    return i + 1\n');
    const lines = program.displayCode.split('\n');
    expect(
      program.lineBlockIds[lines.indexOf('def partition(arr, low, high):')]
    ).toBe('bf_helper_partition');
    expect(program.execCode).toMatch(/__bf\.le\(arr, j, high, '[^']+'\)/);
  });

  it('traces reads and writes on arr but not helper lists', () => {
    const merge = generateProgram(
      load(getBlocksStarter('mergeSort').workspace)
    );
    expect(merge.displayCode).toContain('left_part = arr[left:mid + 1]');
    expect(merge.displayCode).toContain('arr[k] = left_part[i]');
    expect(merge.execCode).toMatch(
      /__bf\.set\(arr, k, left_part\[i\], '[^']+'\)/
    );
    expect(merge.execCode).toContain('if left_part[i] <= right_part[j]:');

    const counting = generateProgram(
      load(getBlocksStarter('countingSort').workspace)
    );
    expect(counting.displayCode).toContain(
      'count = [0] * (max(arr) - min_value + 1)'
    );
    expect(counting.execCode).toMatch(
      /value = __bf\.get\(arr, i, '[^']+'\) - min_value/
    );
  });

  it('generates shuffle and the sorted check with their imports', () => {
    const bogo = generateProgram(load(getBlocksStarter('bogoSort').workspace));
    expect(bogo.displayCode).toMatch(/^import random\n/);
    expect(bogo.displayCode).toContain(
      'def is_sorted(arr):\n    return all(arr[i] <= arr[i + 1]'
    );
    expect(bogo.displayCode).toContain(
      'while not is_sorted(arr) and attempts < 1000:'
    );
    expect(bogo.execCode).toMatch(/__bf\.is_sorted\(arr, '[^']+'\)/);
    expect(bogo.execCode).toMatch(/__bf\.shuffle\(arr, '[^']+'\)/);
    expect(bogo.execCode).not.toMatch(/import random|def is_sorted/);
  });

  it('generates search formulas with target, sqrt and min', () => {
    const jump = generateProgram(
      load(getBlocksStarter('jumpSearch').workspace)
    );
    expect(jump.displayCode).toContain('step = int(n ** 0.5)');
    expect(jump.displayCode).toContain(
      'while prev < n and arr[min(prev + step, n) - 1] < target:'
    );
    const interpolation = generateProgram(
      load(getBlocksStarter('interpolationSearch').workspace)
    );
    expect(interpolation.displayCode).toContain(
      'pos = low + (target - arr[low]) * (high - low) // (arr[high] - arr[low])'
    );
    expect(interpolation.execCode).toMatch(
      /__bf\.cmp_target\(arr, low, target, 'LTE', '[^']+'\)/
    );
  });

  it('renames a learner variable that would shadow a helper', () => {
    const json = structuredClone(getBlocksStarter('heapSort').workspace);
    json.variables.find(variable => variable.name === 'end').name = 'heapify';
    const { displayCode } = generateProgram(load(json));
    expect(displayCode).toMatch(/heapify2 = n - 1/);
    expect(displayCode).toContain('heapify(arr, heapify2, 0)');
  });
});
