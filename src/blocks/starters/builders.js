/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Small builders for starter workspaces (Blockly JSON). Value builders return
 * an input (`{ block }`); statement builders return a block, chained with `seq`.
 * Plain data, no Blockly import.
 */

/** Variables are referenced by id `var_<name>`. */
export const varId = name => `var_${name}`;

// ── Values ───────────────────────────────────────────────────────────────────

const value = (type, extra = {}) => ({ block: { type, ...extra } });

export const num = n => value('math_number', { fields: { NUM: n } });
export const v = name =>
  value('variables_get', { fields: { VAR: { id: varId(name) } } });
export const bool = b =>
  value('logic_boolean', { fields: { BOOL: b ? 'TRUE' : 'FALSE' } });
export const len = () => value('bf_len');
export const target = () => value('bf_target');
export const arrMax = () => value('bf_arr_max');
export const arrMin = () => value('bf_arr_min');

const ARITH = { '+': 'ADD', '-': 'MINUS', '*': 'MULTIPLY' };
/** `a op b` for + - * (numbers become number blocks). */
export const op = (a, symbol, b) =>
  value('math_arithmetic', {
    fields: { OP: ARITH[symbol] },
    inputs: { A: toValue(a), B: toValue(b) },
  });
export const floordiv = (a, b) =>
  value('bf_floordiv', { inputs: { A: toValue(a), B: toValue(b) } });
export const mod = (a, b) =>
  value('math_modulo', {
    inputs: { DIVIDEND: toValue(a), DIVISOR: toValue(b) },
  });
export const min = (a, b) =>
  value('bf_min', { inputs: { A: toValue(a), B: toValue(b) } });
export const sqrt = a => value('bf_sqrt', { inputs: { A: toValue(a) } });

const LOGIC_COMPARE = {
  '==': 'EQ',
  '!=': 'NEQ',
  '<': 'LT',
  '<=': 'LTE',
  '>': 'GT',
  '>=': 'GTE',
};
/** Plain comparison of two values (not traced). */
export const cmp = (a, symbol, b) =>
  value('logic_compare', {
    fields: { OP: LOGIC_COMPARE[symbol] },
    inputs: { A: toValue(a), B: toValue(b) },
  });
const logic = (opName, a, b) =>
  value('logic_operation', {
    fields: { OP: opName },
    inputs: { A: toValue(a), B: toValue(b) },
  });
export const and = (a, b) => logic('AND', a, b);
export const or = (a, b) => logic('OR', a, b);
export const not = a => value('logic_negate', { inputs: { BOOL: toValue(a) } });

// bf_compare offers only ordering ops; equality is compareTarget's.
const PAIR_OPS = { '>': 'GT', '<': 'LT', '>=': 'GTE', '<=': 'LTE' };
const ORDER_OPS = { ...PAIR_OPS, '==': 'EQ' };
/** `arr[i] op arr[j]` (traced compare). */
export const compare = (i, symbol, j) => {
  if (!PAIR_OPS[symbol]) throw new Error(`compare: unsupported op ${symbol}`);
  return value('bf_compare', {
    fields: { OP: PAIR_OPS[symbol] },
    inputs: { A: toValue(i), B: toValue(j) },
  });
};
/** `arr[i] op target` (traced compare). */
export const compareTarget = (i, symbol) =>
  value('bf_compare_target', {
    fields: { OP: ORDER_OPS[symbol] },
    inputs: { A: toValue(i) },
  });
/** `arr[i]` (traced read). */
export const get = i => value('bf_get', { inputs: { INDEX: toValue(i) } });
export const isSorted = () => value('bf_is_sorted');

export const zeros = size =>
  value('bf_zeros', { inputs: { SIZE: toValue(size) } });
export const buckets = size =>
  value('bf_buckets', { inputs: { SIZE: toValue(size) } });
export const slice = (from, to) =>
  value('bf_slice', { inputs: { FROM: toValue(from), TO: toValue(to) } });
export const at = (list, i) =>
  value('bf_list_get', { inputs: { LIST: toValue(list), INDEX: toValue(i) } });
export const listLen = list =>
  value('bf_list_len', { inputs: { LIST: toValue(list) } });

// Grid / path values (pathfinding programs).
export const start = () => value('bf_start');
export const end = () => value('bf_end');
export const none = () => value('logic_null');
export const infinity = () => value('bf_infinity');
export const grid = () => value('bf_grid');
export const rows = () => value('bf_rows');
export const cols = () => value('bf_cols');
export const directions = () => value('bf_directions');
export const newDict = () => value('bf_new_dict');
export const neighbors = cell =>
  value('bf_neighbors', { inputs: { CELL: toValue(cell) } });
export const walkable = cell =>
  value('bf_walkable', { inputs: { CELL: toValue(cell) } });
export const manhattan = (a, b) =>
  value('bf_manhattan', { inputs: { A: toValue(a), B: toValue(b) } });
export const cell = (r, c) =>
  value('bf_cell', { inputs: { ROW: toValue(r), COL: toValue(c) } });
export const rowOf = x => value('bf_row', { inputs: { CELL: toValue(x) } });
export const colOf = x => value('bf_col', { inputs: { CELL: toValue(x) } });
export const pair = (a, b) =>
  value('bf_pair', { inputs: { A: toValue(a), B: toValue(b) } });
/** `[x, ...]` (Blockly's list block). */
export const list = (...items) =>
  value('lists_create_with', {
    extraState: { itemCount: items.length },
    inputs: Object.fromEntries(items.map((x, i) => [`ADD${i}`, toValue(x)])),
  });
/** `queue.pop(0)` (traced visit). */
export const pop = lst => value('bf_pop', { inputs: { LIST: toValue(lst) } });
/** `heapq.heappop(lst)[1]` (traced visit). */
export const popMin = lst =>
  value('bf_pop_min', { inputs: { LIST: toValue(lst) } });
export const getOr = (dict, key, fallback) =>
  value('bf_dict_get_or', {
    inputs: {
      DICT: toValue(dict),
      KEY: toValue(key),
      DEFAULT: toValue(fallback),
    },
  });
export const isIn = (item, collection) =>
  value('bf_in', {
    fields: { OP: 'IN' },
    inputs: { ITEM: toValue(item), COLLECTION: toValue(collection) },
  });
export const notIn = (item, collection) =>
  value('bf_in', {
    fields: { OP: 'NOT_IN' },
    inputs: { ITEM: toValue(item), COLLECTION: toValue(collection) },
  });

// Tree values (traversal programs).
export const root = () => value('bf_root');
export const left = node =>
  value('bf_child', {
    fields: { SIDE: 'left' },
    inputs: { NODE: toValue(node) },
  });
export const right = node =>
  value('bf_child', {
    fields: { SIDE: 'right' },
    inputs: { NODE: toValue(node) },
  });
const is = (opName, a, b) =>
  value('bf_is', {
    fields: { OP: opName },
    inputs: { A: toValue(a), B: toValue(b) },
  });
/** `a is b` (identity: threaded Morris trees make `==` recurse forever). */
export const isSame = (a, b) => is('IS', a, b);
export const isNot = (a, b) => is('IS_NOT', a, b);

// Graph values (graph programs).
export const graph = () => value('bf_graph');
export const nodes = () => value('bf_nodes');
export const edges = () => value('bf_edges');
export const goal = () => value('bf_goal');
export const newSet = () => value('bf_new_set');
export const sortByWeight = lst =>
  value('bf_sort_by_weight', { inputs: { LIST: toValue(lst) } });
/** `stack.pop()` as a value (traced leave). */
export const popTop = lst =>
  value('bf_pop_top', { inputs: { LIST: toValue(lst) } });
export const matrix = size =>
  value('bf_matrix', { inputs: { SIZE: toValue(size) } });
/** `m[i][j]` (traced read). */
export const cellGet = (m, i, j) =>
  value('bf_cell_get', {
    inputs: { MATRIX: toValue(m), I: toValue(i), J: toValue(j) },
  });

/** A helper call used as a value, e.g. `p = partition(arr, low, high)`. */
export const callValue = (name, ...args) =>
  value('bf_call_value', callFields(name, args));

/** Numbers → number blocks, strings → variables, inputs pass through. */
export function toValue(x) {
  if (typeof x === 'number') return num(x);
  if (typeof x === 'string') return v(x);
  return x;
}

function callFields(name, args) {
  return {
    fields: { NAME: name },
    extraState: { args: args.length },
    inputs: Object.fromEntries(args.map((a, i) => [`ARG${i}`, toValue(a)])),
  };
}

// ── Statements ───────────────────────────────────────────────────────────────

/** Chains statements with `next`; returns the first (or undefined). */
export function seq(...statements) {
  const list = statements.flat().filter(Boolean);
  for (let k = 0; k < list.length - 1; k++) {
    list[k].next = { block: list[k + 1] };
  }
  return list[0];
}

const body = statements => {
  const first = seq(statements);
  return first && { block: first };
};

export const set = (name, x) => ({
  type: 'variables_set',
  fields: { VAR: { id: varId(name) } },
  inputs: { VALUE: toValue(x) },
});
export const swap = (i, j) => ({
  type: 'bf_swap',
  inputs: { A: toValue(i), B: toValue(j) },
});
/** `arr[i] = x` (traced write). */
export const write = (i, x) => ({
  type: 'bf_set',
  inputs: { INDEX: toValue(i), VALUE: toValue(x) },
});
export const shuffle = () => ({ type: 'bf_shuffle' });
export const listSet = (list, i, x) => ({
  type: 'bf_list_set',
  inputs: { LIST: toValue(list), INDEX: toValue(i), VALUE: toValue(x) },
});
export const append = (list, x) => ({
  type: 'bf_append',
  inputs: { LIST: toValue(list), VALUE: toValue(x) },
});
export const sortList = list => ({
  type: 'bf_sort_list',
  inputs: { LIST: toValue(list) },
});
/** `queue.append(cell)` (traced open). */
export const push = (lst, x) => ({
  type: 'bf_push',
  inputs: { LIST: toValue(lst), CELL: toValue(x) },
});
/** `heapq.heappush(lst, (priority, cell))` (traced open). */
export const pushPriority = (lst, priority, x) => ({
  type: 'bf_push_priority',
  inputs: { LIST: toValue(lst), PRIORITY: toValue(priority), CELL: toValue(x) },
});
/** `path.pop()` (traced leave). */
export const popLast = lst => ({
  type: 'bf_pop_last',
  inputs: { LIST: toValue(lst) },
});
/** `costs[cell] = x` (traced open). */
export const relax = (dict, key, x) => ({
  type: 'bf_relax',
  inputs: { DICT: toValue(dict), CELL: toValue(key), VALUE: toValue(x) },
});
export const reverse = lst => ({
  type: 'bf_reverse',
  inputs: { LIST: toValue(lst) },
});
/** `result.append(node["value"])` (traced visit). */
export const visit = (lst, node) => ({
  type: 'bf_visit',
  inputs: { LIST: toValue(lst), NODE: toValue(node) },
});
/** `node["left"|"right"] = x` (traced thread / unthread). */
export const setChild = (node, side, x) => ({
  type: 'bf_set_child',
  fields: { SIDE: side },
  inputs: { NODE: toValue(node), VALUE: toValue(x) },
});
/** `s.add(node)` (traced mark). */
export const mark = (set, node) => ({
  type: 'bf_mark',
  inputs: { SET: toValue(set), NODE: toValue(node) },
});
/** `answer.append(item)` (traced output). */
export const emit = (lst, item) => ({
  type: 'bf_emit',
  inputs: { LIST: toValue(lst), ITEM: toValue(item) },
});
export const setRemove = (set, x) => ({
  type: 'bf_set_remove',
  inputs: { SET: toValue(set), VALUE: toValue(x) },
});
/** `m[i][j] = x` (traced write). */
export const cellSet = (m, i, j, x) => ({
  type: 'bf_cell_set',
  inputs: {
    MATRIX: toValue(m),
    I: toValue(i),
    J: toValue(j),
    VALUE: toValue(x),
  },
});
export const cont = () => ({
  type: 'controls_flow_statements',
  fields: { FLOW: 'CONTINUE' },
});
export const ret = x => ({ type: 'bf_return', inputs: { VALUE: toValue(x) } });
export const brk = () => ({
  type: 'controls_flow_statements',
  fields: { FLOW: 'BREAK' },
});
export const call = (name, ...args) => ({
  type: 'bf_call',
  ...callFields(name, args),
});

/** `if cond: then [else: otherwise]` (arrays of statements). */
export function ifThen(cond, then, otherwise) {
  return {
    type: 'controls_if',
    ...(otherwise && { extraState: { hasElse: true } }),
    inputs: {
      IF0: toValue(cond),
      ...(body(then) && { DO0: body(then) }),
      ...(otherwise && { ELSE: body(otherwise) }),
    },
  };
}

/** `for name in range(from, to): ...` */
export function forRange(name, from, to, statements) {
  return {
    type: 'bf_for_range',
    fields: { VAR: { id: varId(name) } },
    inputs: {
      FROM: toValue(from),
      TO: toValue(to),
      ...(body(statements) && { DO: body(statements) }),
    },
  };
}

/** `for name in items: ...` */
export function forEach(name, items, statements) {
  return {
    type: 'controls_forEach',
    fields: { VAR: { id: varId(name) } },
    inputs: {
      LIST: toValue(items),
      ...(body(statements) && { DO: body(statements) }),
    },
  };
}

/** `for name in graph[node]:` (traced edges); `reversed` walks it backwards. */
export function forNeighbor(name, graphValue, node, statements, reversed) {
  return {
    type: 'bf_for_neighbor',
    fields: {
      VAR: { id: varId(name) },
      ORDER: reversed ? 'REVERSED' : 'FORWARD',
    },
    inputs: {
      GRAPH: toValue(graphValue),
      NODE: toValue(node),
      ...(body(statements) && { DO: body(statements) }),
    },
  };
}

/** `for name in items:` over (from, to, weight) edges (traced edges). */
export function forEdge(name, items, statements) {
  return {
    type: 'bf_for_edge',
    fields: { VAR: { id: varId(name) } },
    inputs: {
      LIST: toValue(items),
      ...(body(statements) && { DO: body(statements) }),
    },
  };
}

export function whileLoop(cond, statements) {
  return {
    type: 'controls_whileUntil',
    fields: { MODE: 'WHILE' },
    inputs: {
      BOOL: toValue(cond),
      ...(body(statements) && { DO: body(statements) }),
    },
  };
}

// ── Workspaces ───────────────────────────────────────────────────────────────

/**
 * A starter workspace: the main function plus optional helpers. Helpers sit
 * below the main function; Python lists them first (see generateProgram).
 *
 * Path, tree and graph helpers take every argument, so their calls drop the
 * implicit `arr`.
 *
 * @param {{ variables: string[], kind: 'sort'|'search'|'path'|'tree'|'graph', signature: string,
 *   main: object[], helpers?: Array<{ signature: string, body: object[] }> }} spec
 */
const HAT_BY_KIND = {
  sort: 'bf_define_sort',
  search: 'bf_define_search',
  path: 'bf_define_path',
  tree: 'bf_define_tree',
  graph: 'bf_define_graph',
};

/** Marks every helper call under `block` so it doesn't add `arr`. */
function withoutImplicitArr(block) {
  if (!block) return;
  if (block.type === 'bf_call' || block.type === 'bf_call_value') {
    block.extraState.noArr = true;
  }
  for (const input of Object.values(block.inputs ?? {})) {
    withoutImplicitArr(input.block);
  }
  withoutImplicitArr(block.next?.block);
}

export function program({ variables, kind, signature, main, helpers = [] }) {
  const hats = [
    {
      type: HAT_BY_KIND[kind],
      id: 'bf_hat',
      fields: { NAME: signature },
      inputs: { STACK: body(main) },
    },
    ...helpers.map(helper => ({
      type: 'bf_define_helper',
      id: `bf_helper_${helper.signature.split('(')[0]}`,
      fields: { NAME: helper.signature },
      inputs: { STACK: body(helper.body) },
    })),
  ];
  if (kind !== 'sort' && kind !== 'search') hats.forEach(withoutImplicitArr);
  return {
    variables: variables.map(name => ({ name, id: varId(name) })),
    blocks: {
      languageVersion: 0,
      // Spread out vertically; the workspace tidies and fits them on load.
      blocks: hats.map((hat, index) => ({
        ...hat,
        x: 24,
        y: 24 + index * 600,
        deletable: false,
      })),
    },
  };
}
