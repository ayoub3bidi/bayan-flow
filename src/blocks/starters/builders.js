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

const ORDER_OPS = {
  '>': 'GT',
  '<': 'LT',
  '>=': 'GTE',
  '<=': 'LTE',
  '==': 'EQ',
};
/** `arr[i] op arr[j]` (traced compare). */
export const compare = (i, symbol, j) =>
  value('bf_compare', {
    fields: { OP: ORDER_OPS[symbol] },
    inputs: { A: toValue(i), B: toValue(j) },
  });
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
 * @param {{ variables: string[], kind: 'sort'|'search', signature: string,
 *   main: object[], helpers?: Array<{ signature: string, body: object[] }> }} spec
 */
export function program({ variables, kind, signature, main, helpers = [] }) {
  const hats = [
    {
      type: kind === 'search' ? 'bf_define_search' : 'bf_define_sort',
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
