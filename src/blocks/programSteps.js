/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Converts tracer events from a block program into sorting, searching,
 * pathfinding, tree traversal or graph visualizer steps.
 * No Blockly import: this runs on the main thread after the worker replies.
 */

import {
  ELEMENT_STATES,
  GRAPH_EDGE_STATES,
  GRAPH_NODE_STATES,
  GRID_ELEMENT_STATES,
  TREE_NODE_STATES,
} from '../constants/index.js';
import i18n from '../i18n/index.js';
import { pureTreeTraversalAlgorithms } from '../algorithms/treeTraversal/index.js';
import {
  isValidTopologicalOrder,
  kruskalAlgorithmPure,
  pureGraphAlgorithms,
} from '../algorithms/graphAlgorithm/index.js';
import {
  makeNodeLinkStep,
  normalizeAdjacency,
  sortNodeIds,
} from '../algorithms/graphAlgorithm/shared.js';
import { makeFloydMatrixStep } from '../algorithms/graphAlgorithm/floydWarshallAlgorithm.js';
import { isNodeLinkSearchingAlgorithm } from '../registry/searchingSubstrate.js';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../utils/algorithmTranslations.js';
import { withElementIds } from '../utils/elementIds.js';

/** @param {number[]} array */
export function isSortedAscending(array) {
  return array.every((value, i) => i === 0 || array[i - 1] <= value);
}

/**
 * States and description for one tracer event on `arr`.
 * @param {{ kind: string, i: number|null, j: number|null, array: number[] }} event
 * @param {number} n
 */
function describeEvent({ kind, i, j, array }, n) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  const mark = (state, ...indexes) => {
    for (const index of indexes) {
      if (index >= 0 && index < n) states[index] = state;
    }
  };
  switch (kind) {
    case 'swap':
      mark(ELEMENT_STATES.SWAPPING, i, j);
      // After a swap the values already moved: name them in their old order.
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.SWAPPING, {
          a: array[j],
          b: array[i],
        }),
      };
    case 'read':
      mark(ELEMENT_STATES.COMPARING, i);
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_READ, {
          index: i,
          value: array[i],
        }),
      };
    case 'write':
      mark(ELEMENT_STATES.SWAPPING, i);
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_WRITE, {
          index: i,
          value: array[i],
        }),
      };
    case 'shuffle':
      return {
        states: Array(n).fill(ELEMENT_STATES.SWAPPING),
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_SHUFFLE),
      };
    case 'check':
      return {
        states: Array(n).fill(ELEMENT_STATES.COMPARING),
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_CHECK),
      };
    default:
      mark(ELEMENT_STATES.COMPARING, i, j);
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
          a: array[i],
          b: array[j],
        }),
      };
  }
}

/**
 * @param {Array<{ kind: 'compare'|'swap'|'read'|'write'|'shuffle'|'check',
 *   i: number|null, j: number|null, array: number[], blockId: string }>} events
 * @param {number[]} inputArray
 * @param {number[]|null} finalArray - What the program returned.
 * @param {string} [functionName] - Named in the starting step.
 * @returns {{ steps: object[], sorted: boolean }}
 */
export function buildProgramSteps(
  events,
  inputArray,
  finalArray,
  functionName = 'sort'
) {
  const n = inputArray.length;
  const defaults = () => Array(n).fill(ELEMENT_STATES.DEFAULT);

  const steps = [
    {
      array: [...inputArray],
      states: defaults(),
      description: getAlgorithmDescription(ALGORITHM_STEPS.STARTING, {
        algorithm: `${functionName}(arr)`,
      }),
      blockId: null,
    },
  ];

  for (const event of events) {
    steps.push({
      array: event.array,
      ...describeEvent(event, n),
      blockId: event.blockId,
    });
  }

  const lastArray = steps[steps.length - 1].array;
  const sorted =
    Array.isArray(finalArray) &&
    finalArray.length === n &&
    isSortedAscending(finalArray);
  steps.push({
    array: [...lastArray],
    states: sorted ? Array(n).fill(ELEMENT_STATES.SORTED) : defaults(),
    description: getAlgorithmDescription(
      sorted ? ALGORITHM_STEPS.COMPLETED : ALGORITHM_STEPS.BLOCKS_NOT_SORTED
    ),
    blockId: null,
  });

  return { steps: withElementIds(steps), sorted };
}

/** Start/found description keys per search; `check` stays generic. */
const searchKeys = name => ({
  start: ALGORITHM_STEPS[`SEARCH_${name}_START`],
  found: ALGORITHM_STEPS[`SEARCH_${name}_FOUND`],
});
const SEARCH_KEYS = {
  linearSearch: searchKeys('LINEAR'),
  binarySearch: searchKeys('BINARY'),
  ternarySearch: searchKeys('TERNARY'),
  jumpSearch: searchKeys('JUMP'),
  interpolationSearch: searchKeys('INTERPOLATION'),
  exponentialSearch: searchKeys('EXPONENTIAL'),
  fibonacciSearch: searchKeys('FIBONACCI'),
};

/**
 * shortcut: binary search steps don't gray out the discarded halves (the
 * tracer can't see left/right); add bound tracing if learners find it unclear.
 *
 * @param {Array<{ kind: string, i: number, array: number[], blockId: string }>} events
 *   Only target compares become steps; reads (e.g. in a formula) are skipped.
 * @param {number[]} inputArray
 * @param {number} target - Always picked from the array.
 * @param {number|null} result - The index the program returned.
 * @param {string} algorithmKey
 * @returns {{ steps: object[], solved: boolean }}
 */
export function buildSearchProgramSteps(
  events,
  inputArray,
  target,
  result,
  algorithmKey
) {
  const keys = SEARCH_KEYS[algorithmKey] ?? SEARCH_KEYS.linearSearch;
  const n = inputArray.length;
  const defaults = () => Array(n).fill(ELEMENT_STATES.DEFAULT);
  const step = (states, description, blockId = null) => ({
    array: [...inputArray],
    states,
    description,
    targetValue: target,
    blockId,
  });

  const steps = [
    step(
      defaults(),
      // `m` is jump search's block size.
      getAlgorithmDescription(keys.start, {
        target,
        m: Math.floor(Math.sqrt(n)),
      })
    ),
  ];
  for (const event of events) {
    if (event.kind !== 'compare') continue;
    const states = defaults();
    states[event.i] = ELEMENT_STATES.COMPARING;
    steps.push(
      step(
        states,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_CHECK, {
          index: event.i,
          value: inputArray[event.i],
          target,
        }),
        event.blockId
      )
    );
  }

  const solved =
    Number.isInteger(result) &&
    result >= 0 &&
    result < n &&
    inputArray[result] === target;
  const finalStates = defaults();
  let description;
  if (solved) {
    finalStates[result] = ELEMENT_STATES.SORTED;
    description = getAlgorithmDescription(keys.found, {
      target,
      // Each search's "found" string names the index differently.
      ...Object.fromEntries(
        ['index', 'mid', 'prev', 'pos', 'probe'].map(key => [key, result])
      ),
    });
  } else if (result === -1) {
    description = getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_NOT_FOUND, {
      target,
    });
  } else {
    description = getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_WRONG_INDEX, {
      target,
      index: result,
    });
  }
  steps.push(step(finalStates, description));

  return { steps: withElementIds(steps), solved };
}

/**
 * True when `path` goes from start to end through free, in-bounds cells, each
 * one step (up/down/left/right) from the previous.
 * @param {number[][]} path - `[row, col]` cells
 */
export function isValidGridPath(path, grid, start, end) {
  if (!Array.isArray(path) || path.length === 0) return false;
  const free = cell => Array.isArray(cell) && grid[cell[0]]?.[cell[1]] === 0;
  const same = (cell, { row, col }) => cell[0] === row && cell[1] === col;
  return (
    path.every(free) &&
    same(path[0], start) &&
    same(path[path.length - 1], end) &&
    path.every(
      (cell, i) =>
        i === 0 ||
        Math.abs(cell[0] - path[i - 1][0]) +
          Math.abs(cell[1] - path[i - 1][1]) ===
          1
    )
  );
}

/**
 * Cells on a shortest start → end path (4 moves, around walls), or 0 when the
 * end can't be reached. Used to tell a valid path from a shortest one.
 */
export function shortestPathLength(grid, start, end) {
  const key = (row, col) => `${row},${col}`;
  const seen = new Set([key(start.row, start.col)]);
  let frontier = [[start.row, start.col]];
  for (let length = 1; frontier.length > 0; length++) {
    const next = [];
    for (const [row, col] of frontier) {
      if (row === end.row && col === end.col) return length;
      for (const [r, c] of [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]) {
        if (grid[r]?.[c] !== 0 || seen.has(key(r, c))) continue;
        seen.add(key(r, c));
        next.push([r, c]);
      }
    }
    frontier = next;
  }
  return 0;
}

/** Cell state and description per tracer event (`leave` mirrors IDA*'s backtrack). */
const PATH_EVENTS = {
  open: [GRID_ELEMENT_STATES.OPEN, ALGORITHM_STEPS.BLOCKS_OPEN],
  visit: [GRID_ELEMENT_STATES.CLOSED, ALGORITHM_STEPS.EXPLORING],
  leave: [GRID_ELEMENT_STATES.CLOSED, ALGORITHM_STEPS.IDA_BACKTRACKING],
};

/**
 * @param {Array<{ kind: 'open'|'visit'|'leave', cell: number[], blockId: string }>} events
 * @param {number[][]} grid - 0 = free, 1 = wall
 * @param {{ row: number, col: number }} start
 * @param {{ row: number, col: number }} end
 * @param {number[][]|null} path - What the program returned.
 * @param {string} [functionName] - Named in the starting step.
 * @returns {{ steps: object[], solved: boolean, shortest: number }}
 *   `solved` for any valid path; `shortest` is the length to compare it with.
 */
export function buildPathProgramSteps(
  events,
  grid,
  start,
  end,
  path,
  functionName = 'find_path'
) {
  const states = grid.map(row => row.map(() => GRID_ELEMENT_STATES.DEFAULT));
  states[start.row][start.col] = GRID_ELEMENT_STATES.START;
  states[end.row][end.col] = GRID_ELEMENT_STATES.END;
  const isEndpoint = (row, col) =>
    (row === start.row && col === start.col) ||
    (row === end.row && col === end.col);
  const step = (description, blockId = null) => ({
    grid: grid.map(row => [...row]),
    states: states.map(row => [...row]),
    description,
    blockId,
  });

  const steps = [
    step(
      getAlgorithmDescription(ALGORITHM_STEPS.STARTING, {
        algorithm: `${functionName}(grid, start, end)`,
      })
    ),
  ];
  for (const { kind, cell, blockId } of events) {
    const [state, key] = PATH_EVENTS[kind] ?? PATH_EVENTS.visit;
    const [row, col] = cell;
    if (states[row]?.[col] === undefined) continue;
    if (!isEndpoint(row, col)) states[row][col] = state;
    steps.push(
      step(
        // IDA*'s backtrack string names the cell as (x, y) = (col, row).
        getAlgorithmDescription(key, { row, col, x: col, y: row }),
        blockId
      )
    );
  }

  const solved = isValidGridPath(path, grid, start, end);
  const shortest = shortestPathLength(grid, start, end);
  let description;
  if (solved) {
    for (const [row, col] of path) {
      if (!isEndpoint(row, col)) states[row][col] = GRID_ELEMENT_STATES.PATH;
    }
    // Still solved: greedy search, for one, isn't meant to be shortest.
    description = getAlgorithmDescription(
      path.length > shortest
        ? ALGORITHM_STEPS.BLOCKS_PATH_LONGER
        : ALGORITHM_STEPS.PATH_FOUND,
      { length: path.length, shortest }
    );
  } else {
    description = getAlgorithmDescription(
      Array.isArray(path) && path.length === 0
        ? ALGORITHM_STEPS.BLOCKS_NO_PATH
        : ALGORITHM_STEPS.BLOCKS_INVALID_PATH
    );
  }
  steps.push(step(description));

  return { steps, solved, shortest };
}

/**
 * The visualizer's tree as the nested dicts a tree program takes:
 * `{ value, left, right }`, null for a missing child.
 * @param {{ children: Record<string, {left: string|null, right: string|null}>,
 *   rootId: string|null, nodeValues: Record<string, number> }} tree
 */
export function treeToDict({ children, rootId, nodeValues }) {
  const toDict = id =>
    id == null
      ? null
      : {
          value: nodeValues[id],
          left: toDict(children[id].left),
          right: toDict(children[id].right),
        };
  return toDict(rootId);
}

/**
 * Zigzag's "this level" badge for a block run: a level's direction comes from
 * where its first two visits sit; a one-node level alternates by depth like
 * the JS traversal.
 * @returns {(id: string) => 'ltr'|'rtl'}
 */
function zigzagDirections(events, { nodes, children, rootId }, idByValue) {
  const depth = {};
  const stack = [[rootId, 0]];
  while (stack.length) {
    const [id, d] = stack.pop();
    if (id == null) continue;
    depth[id] = d;
    stack.push([children[id]?.left, d + 1], [children[id]?.right, d + 1]);
  }
  const xById = Object.fromEntries(nodes.map(n => [n.id, n.x]));
  const firstVisits = {};
  for (const { kind, node } of events) {
    const id = idByValue[node];
    if (kind !== 'output' || id === undefined) continue;
    const level = (firstVisits[depth[id]] ??= []);
    if (level.length < 2) level.push(id);
  }
  return id => {
    const [a, b] = firstVisits[depth[id]] ?? [];
    if (b === undefined) return depth[id] % 2 === 0 ? 'ltr' : 'rtl';
    return xById[b] > xById[a] ? 'ltr' : 'rtl';
  };
}

/**
 * Tree traversal steps from a tree program's events. Nodes are named by value.
 * `output` (a visit) plays visiting then visited like the JS traversals;
 * queue pushes/pops update the queue strip (hidden once the list is used as a
 * stack); Morris threads show as extra edges. Solved when the returned values
 * match the algorithm's order and no thread is left in the tree.
 *
 * @param {object[]} events
 * @param {{ nodes: object[], edges: object[], children: object, rootId: string|null,
 *   nodeValues: Record<string, number> }} tree
 * @param {string} algorithmKey
 * @param {number[]|null} returned
 * @param {string} [functionName]
 */
export function buildTreeProgramSteps(
  events,
  tree,
  algorithmKey,
  returned,
  functionName = 'traversal'
) {
  const { nodes, edges, children, rootId, nodeValues } = tree;
  const idByValue = Object.fromEntries(
    Object.entries(nodeValues).map(([id, value]) => [value, id])
  );
  const completed = [];
  let queue = [];
  let showQueue = true;
  const threads = [];
  const directionOf =
    algorithmKey === 'zigzagLevelOrderTraversal'
      ? zigzagDirections(events, tree, idByValue)
      : null;
  let scanDirection;
  const step = (description, blockId = null, visitingId = null) => {
    const nodeStates = Object.fromEntries(
      nodes.map(n => [n.id, TREE_NODE_STATES.DEFAULT])
    );
    for (const id of completed) nodeStates[id] = TREE_NODE_STATES.VISITED;
    if (visitingId != null) nodeStates[visitingId] = TREE_NODE_STATES.VISITING;
    return {
      nodes: nodes.map(n => ({ ...n })),
      edges: [...edges, ...threads].map(e => ({ ...e })),
      nodeStates,
      visitOrder: [...completed],
      queueOrder: showQueue ? [...queue] : [],
      levelScanDirection: scanDirection,
      description,
      blockId,
    };
  };
  const order = () => completed.map(id => nodeValues[id]).join(', ');

  const steps = [
    step(
      getAlgorithmDescription(ALGORITHM_STEPS.STARTING, {
        algorithm: `${functionName}(root)`,
      })
    ),
  ];
  for (const { kind, node, other, cell, blockId } of events) {
    const id =
      idByValue[
        kind === 'open' || kind === 'visit' || kind === 'leave' ? cell : node
      ];
    if (id === undefined) continue;
    switch (kind) {
      case 'output':
        scanDirection = directionOf?.(id);
        steps.push(
          step(
            getAlgorithmDescription(ALGORITHM_STEPS.PREORDER_VISITING, {
              node: nodeValues[id],
            }),
            blockId,
            id
          )
        );
        completed.push(id);
        steps.push(
          step(
            getAlgorithmDescription(ALGORITHM_STEPS.PREORDER_VISITED, {
              node: nodeValues[id],
              order: order(),
            }),
            blockId
          )
        );
        break;
      case 'open':
        queue.push(id);
        steps.push(
          step(
            getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_TREE_PUSH, {
              node: nodeValues[id],
            }),
            blockId
          )
        );
        break;
      case 'visit':
      case 'leave': {
        // The starting `[root]` isn't traced, so a node may be missing here.
        const at = kind === 'visit' ? queue.indexOf(id) : queue.lastIndexOf(id);
        if (at !== -1) queue.splice(at, 1);
        if (kind === 'leave') showQueue = false;
        steps.push(
          step(
            getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_TREE_POP, {
              node: nodeValues[id],
            }),
            blockId
          )
        );
        break;
      }
      case 'thread': {
        const to = idByValue[other];
        if (to === undefined) continue;
        threads.push({ from: id, to });
        steps.push(
          step(
            getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_THREADING, {
              from: nodeValues[id],
              to: other,
            }),
            blockId
          )
        );
        break;
      }
      case 'unthread': {
        const at = threads.findIndex(e => e.from === id);
        const to = at === -1 ? null : threads[at].to;
        if (at !== -1) threads.splice(at, 1);
        steps.push(
          step(
            getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_UNTHREADING, {
              from: nodeValues[id],
              to: to == null ? '' : nodeValues[to],
            }),
            blockId
          )
        );
        break;
      }
      default:
        break;
    }
  }

  const expectedOrder = (
    pureTreeTraversalAlgorithms[algorithmKey]?.(children, rootId) ?? []
  ).map(id => nodeValues[id]);
  const got = Array.isArray(returned) ? returned : [];
  const rightOrder =
    got.length === expectedOrder.length &&
    got.every((value, i) => value === expectedOrder[i]);
  // Morris without its unthread still visits in order, but breaks the tree.
  const threadsLeft = threads.length;
  const solved = rightOrder && threadsLeft === 0;
  queue = [];
  scanDirection = undefined;
  let description;
  if (solved) {
    description = getAlgorithmDescription(
      ALGORITHM_STEPS.BLOCKS_TREE_COMPLETE,
      { order: got.join(', ') }
    );
  } else if (rightOrder) {
    description = getAlgorithmDescription(
      ALGORITHM_STEPS.BLOCKS_TREE_THREADS_LEFT,
      { count: threadsLeft }
    );
  } else {
    description = getAlgorithmDescription(
      ALGORITHM_STEPS.BLOCKS_TREE_WRONG_ORDER,
      { got: got.join(', '), expected: expectedOrder.join(', ') }
    );
  }
  steps.push(step(description));

  return {
    steps,
    solved,
    got: got.join(', '),
    expected: expectedOrder.join(', '),
    threadsLeft,
  };
}

// ── Graphs ───────────────────────────────────────────────────────────────────

const EDGE_LIST_ALGORITHMS = new Set([
  'kruskalAlgorithm',
  'primAlgorithm',
  'floydWarshallAlgorithm',
]);
const MST_ALGORITHMS = new Set(['kruskalAlgorithm', 'primAlgorithm']);
const ORDER_ALGORITHMS = new Set(['topologicalSort', 'kahnAlgorithm']);
const SCC_ALGORITHMS = new Set(['tarjanAlgorithm', 'kosarajuAlgorithm']);

/**
 * The name a graph program sees for each node id: its label (what the
 * visualizer shows), or the id when two nodes share a label.
 * @param {Array<{ id: string, label?: string }>} nodes
 * @returns {Record<string, string>}
 */
export function graphNodeNames(nodes) {
  const labels = nodes.map(node => String(node.label ?? node.id));
  const unique = new Set(labels).size === labels.length;
  return Object.fromEntries(
    nodes.map((node, i) => [node.id, unique ? labels[i] : String(node.id)])
  );
}

/**
 * The arguments a graph program takes, by algorithm family:
 * `[graph, start, goal]` for searches, `[nodes, edges]` for spanning trees
 * and Floyd-Warshall (`edges` as `[from, to, weight]`), `[graph]` otherwise.
 * `graph` maps each node to its neighbours, in id order.
 * @param {{ nodes: object[], edges: object[], adjacency: object,
 *   rootId?: string, goalId?: string }} graph
 * @param {string} algorithmKey
 */
export function graphToArgs(graph, algorithmKey) {
  const names = graphNodeNames(graph.nodes);
  const name = id => names[id] ?? String(id);
  if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
    const adjacency = Object.fromEntries(
      graph.nodes.map(node => [
        name(node.id),
        (graph.adjacency[node.id] ?? []).map(name),
      ])
    );
    return [adjacency, name(graph.rootId), name(graph.goalId)];
  }
  if (EDGE_LIST_ALGORITHMS.has(algorithmKey)) {
    return [
      sortNodeIds(graph.nodes.map(node => node.id)).map(name),
      graph.edges.map(edge => [
        name(edge.from),
        name(edge.to),
        edge.weight ?? 0,
      ]),
    ];
  }
  const adjacency = normalizeAdjacency(graph.adjacency);
  return [
    Object.fromEntries(
      sortNodeIds(Object.keys(adjacency)).map(id => [
        name(id),
        adjacency[id].map(name),
      ])
    ),
  ];
}

const joinNames = (list, separator = ', ') => list.map(String).join(separator);
const formatEdge = ([from, to, weight]) => `${from}-${to}(${weight})`;
const formatComponents = components =>
  components.map(component => `{${joinNames(component)}}`).join(' ');

/** Shortest start → goal path length (in nodes) on a name adjacency, or 0. */
function shortestGraphPath(adjacency, start, goal) {
  const seen = new Set([start]);
  let frontier = [start];
  for (let length = 1; frontier.length > 0; length++) {
    const next = [];
    for (const node of frontier) {
      if (node === goal) return length;
      for (const neighbor of adjacency[node] ?? []) {
        if (seen.has(neighbor)) continue;
        seen.add(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }
  return 0;
}

/**
 * Whether the returned answer is right for the algorithm, plus both answers
 * as text. Any valid answer passes: an order, a partition, a spanning tree of
 * the right weight, a start → goal path.
 */
function judgeGraphAnswer(graph, algorithmKey, args, returned, names) {
  const idByName = Object.fromEntries(
    Object.entries(names).map(([id, name]) => [name, id])
  );
  const idOf = name => idByName[name];
  const nameOf = id => names[id] ?? id;
  if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
    const [adjacency, start, goal] = args;
    const path = Array.isArray(returned) ? returned : [];
    const solved =
      path.length > 0 &&
      path[0] === start &&
      path[path.length - 1] === goal &&
      path.every(
        (node, i) => i === 0 || (adjacency[path[i - 1]] ?? []).includes(node)
      );
    return {
      solved,
      got: Array.isArray(returned) ? joinNames(path, ' → ') : 'None',
      expected: `${start} → … → ${goal}`,
      length: path.length,
      // Only BFS promises a shortest path.
      shortest:
        algorithmKey === 'breadthFirstSearchGraph'
          ? shortestGraphPath(adjacency, start, goal)
          : undefined,
    };
  }

  const pure = pureGraphAlgorithms[algorithmKey]?.(
    EDGE_LIST_ALGORITHMS.has(algorithmKey) ? graph : graph.adjacency
  );

  if (ORDER_ALGORITHMS.has(algorithmKey)) {
    const order = Array.isArray(returned) ? returned : null;
    const solved = pure.hasCycle
      ? returned === null
      : order !== null &&
        isValidTopologicalOrder(order.map(idOf), graph.adjacency);
    return {
      solved,
      got: order ? joinNames(order) : 'None',
      expected: pure.hasCycle ? 'None' : joinNames(pure.order.map(nameOf)),
    };
  }

  if (SCC_ALGORITHMS.has(algorithmKey)) {
    const key = components =>
      components
        .map(component => [...component].map(String).sort().join(','))
        .sort()
        .join('|');
    const got = Array.isArray(returned) ? returned.filter(Array.isArray) : [];
    const expected = pure.sccs.map(component => component.map(nameOf));
    return {
      solved:
        Array.isArray(returned) &&
        got.length === returned.length &&
        key(got) === key(expected),
      got: Array.isArray(returned) ? formatComponents(got) : 'None',
      expected: formatComponents(expected),
    };
  }

  if (MST_ALGORITHMS.has(algorithmKey)) {
    const got = Array.isArray(returned) ? returned : [];
    const exists = ([from, to, weight]) =>
      graph.edges.some(
        edge =>
          (edge.weight ?? 0) === weight &&
          ((edge.from === idOf(from) && edge.to === idOf(to)) ||
            (edge.from === idOf(to) && edge.to === idOf(from)))
      );
    const valid = got.every(edge => Array.isArray(edge) && exists(edge));
    const weightOf = edges => edges.reduce((sum, e) => sum + (e[2] ?? 0), 0);
    // A forest keeps every edge when Kruskal re-runs on it; a cycle doesn't.
    const acyclic =
      valid &&
      kruskalAlgorithmPure({
        nodes: graph.nodes,
        edges: got.map(([from, to, weight]) => ({
          from: idOf(from),
          to: idOf(to),
          weight,
        })),
      }).mstEdges.length === got.length;
    return {
      solved:
        Array.isArray(returned) &&
        acyclic &&
        got.length === pure.mstEdges.length &&
        weightOf(got) === pure.totalWeight,
      got: Array.isArray(returned)
        ? `${got.map(formatEdge).join(', ')} = ${valid ? weightOf(got) : '?'}`
        : 'None',
      expected: `${pure.mstEdges.length} edges = ${pure.totalWeight}`,
    };
  }

  return { solved: false, got: '', expected: '' };
}

/**
 * Graph steps from a graph program's events (nodes and edges named as the
 * program saw them). Edge loops light the edge (then visited, or rejected for
 * an unselected spanning-tree edge); pushes/pops mirror the stack or queue;
 * marks put a node on the recursion stack; appends to the answer highlight a
 * node, a selected edge or a whole component. The final step gives the verdict.
 *
 * @param {object[]} events
 * @param {{ nodes: object[], edges: object[], adjacency: object,
 *   rootId?: string, goalId?: string, directed?: boolean }} graph
 * @param {string} algorithmKey
 * @param {unknown} returned - What the program returned (lists, or null).
 * @param {string} [functionName]
 */
export function buildGraphProgramSteps(
  events,
  graph,
  algorithmKey,
  returned,
  functionName = 'graph_algorithm'
) {
  const { nodes, edges } = graph;
  const isSearch = isNodeLinkSearchingAlgorithm(algorithmKey);
  const directed = isSearch ? false : (graph.directed ?? true);
  const names = graphNodeNames(nodes);
  const idByName = Object.fromEntries(
    Object.entries(names).map(([id, name]) => [name, id])
  );
  const idOf = name => idByName[name];
  const args = graphToArgs(graph, algorithmKey);

  const edgeIdOf = (from, to) => {
    const a = idOf(from);
    const b = idOf(to);
    const found =
      edges.find(e => e.from === a && e.to === b) ??
      // Undirected edges and Kosaraju's transpose walk an edge backwards.
      edges.find(e => e.from === b && e.to === a);
    return found ? (found.id ?? `${found.from}->${found.to}`) : null;
  };

  const edgeStates = {};
  const done = new Set();
  const frontier = new Set();
  const answer = new Set();
  const stack = [];
  const recursion = [];
  const outputOrder = [];
  const selected = [];
  const components = [];
  const stores = {};
  const markSets = new Set();
  let pending = null;

  const nodeStates = current => {
    const states = {};
    for (const node of nodes) {
      let state = GRAPH_NODE_STATES.DEFAULT;
      if (done.has(node.id)) state = GRAPH_NODE_STATES.VISITED;
      if (frontier.has(node.id)) state = GRAPH_NODE_STATES.FRONTIER;
      if (answer.has(node.id)) state = GRAPH_NODE_STATES.PATH;
      if (node.id === current) state = GRAPH_NODE_STATES.CURRENT;
      states[node.id] = state;
    }
    if (isSearch) {
      states[graph.rootId] = GRAPH_NODE_STATES.ROOT;
      states[graph.goalId] = GRAPH_NODE_STATES.GOAL;
    }
    return states;
  };
  const badgeText = (key, params) =>
    i18n.t(`visualization.${key}`, {
      ...params,
      defaultValue: Object.values(params).join(' '),
    });
  const valuesOf = name => stores[name] ?? {};
  const badges = () => {
    const list = [];
    if (algorithmKey === 'kosarajuAlgorithm') {
      // Pass 2 marks nodes in a second set (assigned) on the transpose.
      list.push({
        id: 'pass',
        text: badgeText('passBadge', {
          pass: String(Math.max(1, markSets.size)),
        }),
      });
    }
    const waiting = stack.length ? stack : recursion;
    if (waiting.length) {
      let key = 'recursionStackBadge';
      if (stack.length)
        key = algorithmKey === 'kahnAlgorithm' ? 'queueBadge' : 'sccStackBadge';
      list.push({
        id: 'stack',
        text: badgeText(key, {
          order: joinNames(
            waiting.map(id => names[id]),
            ' → '
          ),
        }),
      });
    }
    const inDegree = valuesOf('in_degree');
    if (algorithmKey === 'kahnAlgorithm' && Object.keys(inDegree).length) {
      list.push({
        id: 'inDegree',
        text: badgeText('inDegreeBadge', {
          pairs: Object.entries(inDegree)
            .map(([key, value]) => `${key}:${value}`)
            .join(', '),
        }),
      });
    }
    const index = valuesOf('index');
    const low = valuesOf('low');
    if (algorithmKey === 'tarjanAlgorithm' && Object.keys(index).length) {
      list.push({
        id: 'lowLink',
        text: badgeText('lowLinkBadge', {
          pairs: Object.entries(index)
            .map(([key, value]) => `${key}:${value}/${low[key] ?? value}`)
            .join(', '),
        }),
      });
    }
    if (outputOrder.length) {
      list.push({
        id: 'order',
        text: badgeText(
          algorithmKey === 'kosarajuAlgorithm'
            ? 'finishStackBadge'
            : 'topologicalOrderBadge',
          {
            order: joinNames(
              outputOrder.map(id => names[id]),
              ' → '
            ),
          }
        ),
      });
    }
    if (selected.length) {
      list.push({
        id: 'weight',
        text: badgeText('totalWeightBadge', {
          weight: selected.reduce((sum, e) => sum + (e[2] ?? 0), 0),
        }),
      });
    }
    if (components.length) {
      list.push({
        id: 'sccs',
        text: badgeText('sccListBadge', {
          components: formatComponents(components),
        }),
      });
    }
    return list;
  };

  const step = (description, blockId = null, current = null) => ({
    ...makeNodeLinkStep({
      nodes,
      edges,
      nodeStates: nodeStates(current),
      edgeStates,
      stackOrder: isSearch ? stack.map(id => names[id]) : [],
      outputOrder: [],
      description,
      graphArtifacts: { badges: badges() },
      directed,
      weighted: Boolean(graph.weighted),
    }),
    ...(isSearch && { goalNodeId: graph.goalId }),
    blockId,
  });
  const describe = (key, params) => getAlgorithmDescription(key, params);

  const steps = [
    step(
      describe(ALGORITHM_STEPS.STARTING, {
        algorithm: functionName,
      })
    ),
  ];

  /** A lit edge settles once the next event comes. */
  const settle = () => {
    if (pending && edgeStates[pending.id] === GRAPH_EDGE_STATES.ACTIVE) {
      edgeStates[pending.id] = pending.to;
    }
    pending = null;
  };
  const lightEdge = (from, to, settleTo) => {
    const id = edgeIdOf(from, to);
    if (id && edgeStates[id] !== GRAPH_EDGE_STATES.SELECTED) {
      edgeStates[id] = GRAPH_EDGE_STATES.ACTIVE;
      if (settleTo) pending = { id, to: settleTo };
    }
  };
  const rejected = MST_ALGORITHMS.has(algorithmKey)
    ? GRAPH_EDGE_STATES.CYCLE
    : GRAPH_EDGE_STATES.VISITED;
  const describeItem = item =>
    Array.isArray(item) ? formatEdge(item) : String(item);

  for (const event of events) {
    const { kind, blockId } = event;
    if (kind === 'store') {
      // Values only feed the badges; the next step shows them.
      (stores[event.name] ??= {})[event.key] = event.value;
      continue;
    }
    settle();
    switch (kind) {
      case 'edge': {
        lightEdge(event.from, event.to, rejected);
        steps.push(
          step(
            describe(ALGORITHM_STEPS.BLOCKS_GRAPH_EDGE, {
              from: event.from,
              to: event.to,
            }),
            blockId
          )
        );
        break;
      }
      case 'open':
      case 'visit':
      case 'leave': {
        const { cell } = event;
        if (Array.isArray(cell)) {
          // Prim's heap holds edges: pushed edges stay lit until popped.
          lightEdge(cell[0], cell[1], kind === 'open' ? null : rejected);
        } else {
          const id = idOf(cell);
          if (id === undefined) continue;
          if (kind === 'open') {
            stack.push(id);
            frontier.add(id);
          } else {
            const at =
              kind === 'visit' ? stack.indexOf(id) : stack.lastIndexOf(id);
            if (at !== -1) stack.splice(at, 1);
            frontier.delete(id);
          }
        }
        steps.push(
          step(
            describe(
              kind === 'open'
                ? ALGORITHM_STEPS.BLOCKS_GRAPH_PUSH
                : ALGORITHM_STEPS.BLOCKS_GRAPH_POP,
              { item: describeItem(cell) }
            ),
            blockId,
            Array.isArray(cell) || kind === 'open' ? null : idOf(cell)
          )
        );
        if (!Array.isArray(cell) && kind !== 'open') done.add(idOf(cell));
        break;
      }
      case 'mark': {
        const id = idOf(event.node);
        if (id === undefined) continue;
        if (event.set) markSets.add(event.set);
        recursion.push(id);
        frontier.add(id);
        answer.delete(id);
        steps.push(
          step(
            describe(ALGORITHM_STEPS.BLOCKS_GRAPH_MARK, { node: event.node }),
            blockId,
            id
          )
        );
        break;
      }
      case 'output': {
        const item = event.node;
        let description;
        if (Array.isArray(item) && MST_ALGORITHMS.has(algorithmKey)) {
          const id = edgeIdOf(item[0], item[1]);
          if (id) edgeStates[id] = GRAPH_EDGE_STATES.SELECTED;
          for (const end of [item[0], item[1]]) {
            const nodeId = idOf(end);
            if (nodeId !== undefined) answer.add(nodeId);
          }
          selected.push(item);
          description = describe(ALGORITHM_STEPS.PRIM_SELECT_EDGE, {
            from: item[0],
            to: item[1],
            weight: item[2],
            totalWeight: selected.reduce((sum, e) => sum + (e[2] ?? 0), 0),
          });
        } else if (Array.isArray(item)) {
          components.push(item);
          for (const member of item) {
            const id = idOf(member);
            if (id === undefined) continue;
            answer.add(id);
            frontier.delete(id);
            done.add(id);
            const at = recursion.indexOf(id);
            if (at !== -1) recursion.splice(at, 1);
          }
          description = describe(ALGORITHM_STEPS.BLOCKS_GRAPH_COMPONENT, {
            component: joinNames(item),
          });
        } else {
          const id = idOf(item);
          if (id === undefined) continue;
          outputOrder.push(id);
          answer.add(id);
          frontier.delete(id);
          done.add(id);
          const at = recursion.lastIndexOf(id);
          if (at !== -1) recursion.splice(at, 1);
          description = describe(ALGORITHM_STEPS.BLOCKS_GRAPH_OUTPUT, {
            node: item,
          });
        }
        steps.push(step(description, blockId));
        break;
      }
      default:
        break;
    }
  }
  settle();

  const verdict = judgeGraphAnswer(graph, algorithmKey, args, returned, names);
  stack.length = 0;
  recursion.length = 0;
  frontier.clear();
  let description;
  if (verdict.solved && isSearch) {
    answer.clear();
    for (const name of returned) {
      const id = idOf(name);
      if (id !== undefined) answer.add(id);
    }
    description =
      verdict.shortest && verdict.length > verdict.shortest
        ? describe(ALGORITHM_STEPS.BLOCKS_GRAPH_PATH_LONGER, {
            length: verdict.length,
            shortest: verdict.shortest,
          })
        : describe(ALGORITHM_STEPS.PATH_FOUND_GRAPH, {
            length: verdict.length,
          });
  } else if (verdict.solved) {
    description =
      returned === null
        ? describe(ALGORITHM_STEPS.BLOCKS_GRAPH_NO_ORDER)
        : describe(ALGORITHM_STEPS.BLOCKS_GRAPH_COMPLETE, {
            answer: verdict.got,
          });
  } else {
    description = describe(ALGORITHM_STEPS.BLOCKS_GRAPH_WRONG, {
      got: verdict.got,
      expected: verdict.expected,
    });
  }
  steps.push(step(description));

  return { steps, ...verdict };
}

/**
 * Floyd-Warshall table steps from a matrix program's events. Each write is
 * a step; a write right after reading `dist[i][k]` and `dist[k][j]` is shown
 * as an improvement through `k` (those cells considering, `k` current).
 * Solved when the returned matrix equals the expected distances.
 *
 * @param {object[]} events
 * @param {{ nodes: object[], edges: object[] }} graph
 * @param {Array<Array<number|null>>|null} returned - `None` is infinity.
 * @param {string} [functionName]
 */
export function buildMatrixProgramSteps(
  events,
  graph,
  returned,
  functionName = 'floyd_warshall'
) {
  const ids = sortNodeIds(graph.nodes.map(node => node.id));
  const names = graphNodeNames(graph.nodes);
  const labels = Object.fromEntries(ids.map(id => [id, names[id]]));
  const size = ids.length;
  const blank = () =>
    Array.from({ length: size }, () => Array(size).fill('default'));
  const distances = Array.from({ length: size }, () =>
    Array(size).fill(Infinity)
  );
  const step = (
    description,
    cellStates = blank(),
    extra = {},
    blockId = null
  ) => ({
    ...makeFloydMatrixStep({
      ids,
      labels,
      distances,
      cellStates,
      description,
      ...extra,
    }),
    blockId,
  });

  const steps = [
    step(
      getAlgorithmDescription(ALGORITHM_STEPS.STARTING, {
        algorithm: functionName,
      })
    ),
  ];
  let reads = [];
  for (const { kind, i, j, value, blockId } of events) {
    if (kind === 'read') {
      reads.push([i, j]);
      continue;
    }
    if (kind !== 'write' || distances[i]?.[j] === undefined) continue;
    distances[i][j] = value ?? Infinity;
    const cellStates = blank();
    cellStates[i][j] = 'updated';
    const [ik, kj] = reads.slice(-2);
    const via =
      ik && kj && ik[0] === i && kj[1] === j && ik[1] === kj[0] ? ik[1] : null;
    let description;
    if (via !== null) {
      cellStates[via][via] = 'current';
      cellStates[i][via] = 'considering';
      cellStates[via][j] = 'considering';
      cellStates[i][j] = 'updated';
      description = getAlgorithmDescription(
        ALGORITHM_STEPS.FLOYD_WARSHALL_UPDATE,
        {
          from: labels[ids[i]],
          to: labels[ids[j]],
          via: labels[ids[via]],
          distance: value,
        }
      );
    } else {
      description = getAlgorithmDescription(
        ALGORITHM_STEPS.BLOCKS_MATRIX_WRITE,
        {
          from: labels[ids[i]],
          to: labels[ids[j]],
          value: value ?? '∞',
        }
      );
    }
    steps.push(
      step(
        description,
        cellStates,
        via !== null ? { intermediateId: ids[via] } : {},
        blockId
      )
    );
    reads = [];
  }

  const pure = pureGraphAlgorithms.floydWarshallAlgorithm(graph);
  const got = Array.isArray(returned) ? returned : [];
  const solved =
    got.length === size &&
    got.every(
      (row, r) =>
        Array.isArray(row) &&
        row.length === size &&
        row.every((cell, c) => (cell ?? Infinity) === pure.distances[r][c])
    );
  const show = matrix =>
    matrix
      .map(
        row =>
          `[${row.map(x => (x == null || x === Infinity ? '∞' : x)).join(', ')}]`
      )
      .join(' ');
  let description;
  if (!solved) {
    description = getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_GRAPH_WRONG, {
      got: Array.isArray(returned) ? show(got) : 'None',
      expected: show(pure.distances),
    });
  } else if (pure.hasNegativeCycle) {
    description = getAlgorithmDescription(
      ALGORITHM_STEPS.FLOYD_WARSHALL_NEGATIVE_CYCLE,
      {
        nodes: ids
          .filter((_, k) => pure.distances[k][k] < 0)
          .map(id => labels[id])
          .join(', '),
      }
    );
  } else {
    description = getAlgorithmDescription(
      ALGORITHM_STEPS.FLOYD_WARSHALL_FINISH
    );
  }
  steps.push(
    step(description, blank(), {
      hasNegativeCycle: solved && pure.hasNegativeCycle,
    })
  );

  return {
    steps,
    solved,
    got: Array.isArray(returned) ? show(got) : 'None',
    expected: show(pure.distances),
  };
}
