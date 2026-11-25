/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Runs the Python half of the Blocks tracer (src/workers/blocksTracer.js) for
 * real: every starter's executed code, on fixed inputs, under python3, then
 * judged by the same step builders the code panel uses. The other Blocks
 * tests mock the worker, so this is what checks `__bf_run`, the event/loop
 * limits and the verdicts end to end. Skipped where python3 isn't installed
 * (CI's ubuntu-latest has it).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { registerBlocks } from './definitions.js';
import { generateProgram } from './generators.js';
import { getBlocksStarter } from './starters/index.js';
import { SORTING_STARTERS } from './starters/sorting.js';
import { SEARCHING_STARTERS } from './starters/searching.js';
import { PATHFINDING_STARTERS } from './starters/pathfinding.js';
import { TREE_STARTERS } from './starters/tree.js';
import { GRAPH_STARTERS } from './starters/graph.js';
import {
  buildProgramSteps,
  buildSearchProgramSteps,
  buildPathProgramSteps,
  buildTreeProgramSteps,
  buildGraphProgramSteps,
  buildMatrixProgramSteps,
  treeToDict,
  graphToArgs,
} from './programSteps.js';
import {
  BLOCKS_TRACER_PY,
  BLOCKS_MAX_EVENTS,
  BLOCKS_MAX_TICKS,
} from '../workers/blocksTracer.js';
import { generateTreeForTraversal } from '../utils/treeGenerators.js';
import { generateRandomSearchTree } from '../utils/graphSearchGenerators.js';
import {
  createGraphInputForAlgorithm,
  getGraphAlgorithmProfile,
  getGraphAlgorithmScenarioOptions,
} from '../registry/graphAlgorithmRegistry.js';
import { isNodeLinkSearchingAlgorithm } from '../registry/searchingSubstrate.js';

const hasPython3 = spawnSync('python3', ['--version']).status === 0;

/** Deterministic rng (mulberry32) so every run sees the same inputs. */
function seeded(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Runs every case in one python3 process (stdin → stdout JSON). */
function runPython(cases) {
  const script = `${BLOCKS_TRACER_PY}
import sys
_cases = json.loads(sys.stdin.read())
print(json.dumps([
    json.loads(__bf_run(c["code"], c["fn"], json.dumps(c["args"]), c["kind"],
                        c.get("maxEvents", ${BLOCKS_MAX_EVENTS}),
                        c.get("maxTicks", ${BLOCKS_MAX_TICKS})))
    for c in _cases
]))
`;
  const out = spawnSync('python3', ['-I', '-c', script], {
    input: JSON.stringify(cases),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
  });
  if (out.status !== 0) throw new Error(out.stderr);
  return JSON.parse(out.stdout);
}

function programFor(json) {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(json, workspace);
  const program = generateProgram(workspace);
  workspace.dispose();
  return program;
}

const GRID_SIZE = 15;
const START = { row: 2, col: 3 };
const END = { row: 11, col: 12 };

/** One case per starter (and per graph scenario), with what judges it. */
function starterCases() {
  const rng = seeded(234);
  const randomInts = (n, max = 500) =>
    Array.from({ length: n }, () => 1 + Math.floor(rng() * max));
  const cases = [];

  for (const key of Object.keys(SORTING_STARTERS)) {
    // Bogo sort gives up after 1000 shuffles: 4 values always finish in time.
    const array = randomInts(key === 'bogoSort' ? 4 : 14);
    cases.push({ key, array, judge: 'sort' });
  }

  for (const key of Object.keys(SEARCHING_STARTERS)) {
    const array = [...new Set(randomInts(20))].sort((a, b) => a - b);
    const target = array[Math.floor(rng() * array.length)];
    cases.push({ key, array, target, judge: 'search' });
  }

  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );
  for (const key of Object.keys(PATHFINDING_STARTERS)) {
    cases.push({ key, grid, judge: 'path' });
  }

  for (const key of Object.keys(TREE_STARTERS)) {
    const tree = generateTreeForTraversal({ nodeCount: 15, rng });
    cases.push({ key, tree, judge: 'tree' });
  }

  for (const key of Object.keys(GRAPH_STARTERS)) {
    if (isNodeLinkSearchingAlgorithm(key)) {
      const graph = generateRandomSearchTree({ nodeCount: 9, rng });
      cases.push({ key, graph, judge: 'graph' });
      continue;
    }
    const profile = getGraphAlgorithmProfile(key);
    const scenarioIds = [
      null,
      ...getGraphAlgorithmScenarioOptions(key).map(({ id }) => id),
    ];
    for (const scenarioId of scenarioIds) {
      const input = createGraphInputForAlgorithm(key, {
        nodeCount: 7,
        scenarioId,
        rng,
      });
      const graph = {
        ...input,
        directed: input.directed ?? profile?.directed ?? true,
      };
      cases.push({ key, graph, scenarioId, judge: 'graph' });
    }
  }
  return cases;
}

function argsFor(testCase) {
  switch (testCase.judge) {
    case 'search':
      return [testCase.array, testCase.target];
    case 'path':
      return [testCase.grid, [START.row, START.col], [END.row, END.col]];
    case 'tree':
      return [treeToDict(testCase.tree)];
    case 'graph':
      return graphToArgs(testCase.graph, testCase.key);
    default:
      return [[...testCase.array]];
  }
}

/** The verdict the code panel would show for this run. */
function judge(testCase, program, result) {
  const { key } = testCase;
  const fn = program.functionName;
  switch (testCase.judge) {
    case 'sort':
      return buildProgramSteps(
        result.events,
        testCase.array,
        result.finalArray,
        fn
      ).sorted;
    case 'search':
      return buildSearchProgramSteps(
        result.events,
        testCase.array,
        testCase.target,
        result.result,
        key
      ).solved;
    case 'path':
      return buildPathProgramSteps(
        result.events,
        testCase.grid,
        START,
        END,
        result.finalArray,
        fn
      ).solved;
    case 'tree':
      return buildTreeProgramSteps(
        result.events,
        testCase.tree,
        key,
        result.finalArray,
        fn
      ).solved;
    default:
      return key === 'floydWarshallAlgorithm'
        ? buildMatrixProgramSteps(
            result.events,
            testCase.graph,
            result.finalArray,
            fn
          ).solved
        : buildGraphProgramSteps(
            result.events,
            testCase.graph,
            key,
            result.finalArray,
            fn,
            Boolean(result.noReturn)
          ).solved;
  }
}

describe.skipIf(!hasPython3)('Blocks tracer under python3', () => {
  beforeAll(async () => {
    // Loaded here, not as a static import: with this file's larger import
    // graph the static namespace was sometimes still empty at this point.
    const En = await import('blockly/msg/en');
    Blockly.setLocale(En.VARIABLES_SET ? En : En.default);
    expect(Blockly.Msg.VARIABLES_SET).toBeTruthy();
    registerBlocks();
  });

  it('solves every starter on its input (every graph scenario too)', () => {
    const cases = starterCases();
    const programs = cases.map(c =>
      programFor(getBlocksStarter(c.key).workspace)
    );
    const results = runPython(
      cases.map((c, i) => ({
        code: programs[i].execCode,
        fn: programs[i].functionName,
        args: argsFor(c),
        kind: programs[i].kind,
      }))
    );

    const failures = cases
      .map((c, i) => {
        const result = results[i];
        const label = `${c.key}${c.scenarioId ? ` (${c.scenarioId})` : ''}`;
        if (result.errorKind)
          return `${label}: ${result.errorKind} ${result.error ?? ''}`;
        if (result.events.length >= BLOCKS_MAX_EVENTS)
          return `${label}: hit the event cap`;
        if (result.noReturn) return `${label}: fell off its end`;
        return judge(c, programs[i], result) ? null : `${label}: wrong verdict`;
      })
      .filter(Boolean);

    expect(failures).toEqual([]);
    // All 45 algorithms (more cases: one per graph scenario).
    expect(new Set(cases.map(c => c.key)).size).toBe(45);
  });

  it('reports runaway loops, recursion and the event cap', () => {
    const [loop, recursion, swaps] = runPython([
      {
        code: 'def f(arr):\n    while True:\n        __bf.tick()\n',
        fn: 'f',
        args: [[3, 1, 2]],
        kind: 'sort',
      },
      {
        code: 'def f(arr):\n    return f(arr)\n',
        fn: 'f',
        args: [[1]],
        kind: 'sort',
      },
      {
        code: "def f(arr):\n    while True:\n        __bf.swap(arr, 0, 1, 'x')\n",
        fn: 'f',
        args: [Array.from({ length: 100 }, (_, i) => i)],
        kind: 'sort',
      },
    ]);
    expect(loop).toEqual({ errorKind: 'loop-limit' });
    expect(recursion.errorKind).toBe('runtime');
    expect(recursion.error).toMatch(/^RecursionError/);
    // The event cap stops a loop that records without ticking.
    expect(swaps).toEqual({ errorKind: 'loop-limit' });
  });

  it('sends infinity as None and flags a graph program with no return', () => {
    const [matrix, noReturn, explicitNone] = runPython([
      {
        code: "def f(nodes, edges):\n    m = [[0, 0]]\n    __bf.cell_set(m, 0, 1, float('inf'), 'x')\n    return m\n",
        fn: 'f',
        args: [['A'], []],
        kind: 'graph',
      },
      {
        code: 'def f(graph):\n    pass\n    return __bf.NO_RETURN\n',
        fn: 'f',
        args: [{}],
        kind: 'graph',
      },
      {
        code: 'def f(graph):\n    return None\n    return __bf.NO_RETURN\n',
        fn: 'f',
        args: [{}],
        kind: 'graph',
      },
    ]);
    expect(matrix.events[0]).toMatchObject({ kind: 'write', value: null });
    expect(matrix.finalArray).toEqual([[0, null]]);
    expect(noReturn).toMatchObject({ noReturn: true, finalArray: null });
    expect(explicitNone).toMatchObject({ noReturn: false, finalArray: null });
  });

  it('fails an emptied Kahn program on a cycle instead of calling it correct', () => {
    const json = structuredClone(getBlocksStarter('kahnAlgorithm').workspace);
    const hat = json.blocks.blocks.find(b => b.type === 'bf_define_graph');
    delete hat.inputs;
    const program = programFor(json);
    const input = createGraphInputForAlgorithm('kahnAlgorithm', {
      nodeCount: 6,
      scenarioId: 'directedCycle',
      rng: seeded(7),
    });
    const graph = { ...input, directed: true };
    const [result] = runPython([
      {
        code: program.execCode,
        fn: program.functionName,
        args: graphToArgs(graph, 'kahnAlgorithm'),
        kind: 'graph',
      },
    ]);

    expect(result.noReturn).toBe(true);
    expect(
      buildGraphProgramSteps(
        result.events,
        graph,
        'kahnAlgorithm',
        result.finalArray,
        program.functionName,
        result.noReturn
      ).solved
    ).toBe(false);
  });
});
