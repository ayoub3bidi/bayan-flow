/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Custom Blockly blocks for the array algorithms (sorts and searches).
 * Imported only from the lazy Blocks path, so Blockly stays out of the main bundle.
 */

import * as Blockly from 'blockly/core';
import { loops } from 'blockly/blocks';

/** English fallbacks; `applyBlockMessages()` overrides them from i18n. */
export const DEFAULT_BLOCK_MESSAGES = {
  BF_DEFINE: 'define %1',
  BF_RETURN: 'return arr',
  BF_DEFINE_TOOLTIP:
    'Your sorting function. Put the steps inside; it returns the sorted arr.',
  BF_DEFINE_SEARCH: 'define %1',
  BF_RETURN_NOT_FOUND: 'return -1',
  BF_DEFINE_SEARCH_TOOLTIP:
    'Your search function. Return the index of target; reaching the end returns -1 (not found).',
  BF_COMPARE_TARGET: 'arr[ %1 ] %2 target',
  BF_COMPARE_TARGET_TOOLTIP: 'Compare an element of the array with the target.',
  BF_RETURN_VALUE: 'return %1',
  BF_RETURN_VALUE_TOOLTIP: 'Stop the function and give back this index.',
  BF_FLOORDIV: '%1 // %2',
  BF_FLOORDIV_TOOLTIP: 'Divide and round down to a whole number.',
  BF_FOR_RANGE: 'for %1 in range( %2 , %3 )',
  BF_FOR_RANGE_TOOLTIP:
    'Repeat the inner steps with the variable counting from the first number up to (not including) the second.',
  BF_DO: 'do %1',
  BF_COMPARE: 'arr[ %1 ] %2 arr[ %3 ]',
  BF_COMPARE_TOOLTIP: 'Compare two elements of the array.',
  BF_SWAP: 'swap arr[ %1 ] and arr[ %2 ]',
  BF_SWAP_TOOLTIP: 'Exchange two elements of the array.',
  BF_LEN: 'len(arr)',
  BF_LEN_TOOLTIP: 'The number of elements in the array.',
  BF_DEFINE_HELPER: 'define %1',
  BF_DEFINE_HELPER_TOOLTIP:
    'A helper function the main function calls. It can call itself too.',
  BF_CALL_TOOLTIP: 'Run a helper function.',
  BF_GET: 'arr[ %1 ]',
  BF_GET_TOOLTIP: 'Read one element of the array.',
  BF_SET: 'arr[ %1 ] = %2',
  BF_SET_TOOLTIP: 'Write a value into one position of the array.',
  BF_SHUFFLE: 'shuffle arr',
  BF_SHUFFLE_TOOLTIP: 'Put the elements of the array in a random order.',
  BF_IS_SORTED: 'arr is sorted',
  BF_IS_SORTED_TOOLTIP: 'True when every element is ≤ the next one.',
  BF_TARGET: 'target',
  BF_TARGET_TOOLTIP: 'The value the search is looking for.',
  BF_ARR_MAX: 'max(arr)',
  BF_ARR_MAX_TOOLTIP: 'The largest value in the array.',
  BF_ARR_MIN: 'min(arr)',
  BF_ARR_MIN_TOOLTIP: 'The smallest value in the array.',
  BF_MIN: 'min( %1 , %2 )',
  BF_MIN_TOOLTIP: 'The smaller of two numbers.',
  BF_SQRT: 'int( %1 ** 0.5 )',
  BF_SQRT_TOOLTIP: 'The square root, rounded down to a whole number.',
  BF_ZEROS: '[0] * %1',
  BF_ZEROS_TOOLTIP: 'A new list holding this many zeros.',
  BF_BUCKETS: '[[] for _ in range( %1 )]',
  BF_BUCKETS_TOOLTIP: 'A list of this many empty lists (buckets).',
  BF_SLICE: 'arr[ %1 : %2 ]',
  BF_SLICE_TOOLTIP:
    'A copy of the array from the first index up to (not including) the second.',
  BF_LIST_GET: '%1 [ %2 ]',
  BF_LIST_GET_TOOLTIP: 'Read one element of a helper list.',
  BF_LIST_SET: '%1 [ %2 ] = %3',
  BF_LIST_SET_TOOLTIP: 'Write a value into a helper list.',
  BF_APPEND: '%1 .append( %2 )',
  BF_APPEND_TOOLTIP: 'Add a value to the end of a helper list.',
  BF_LIST_LEN: 'len( %1 )',
  BF_LIST_LEN_TOOLTIP: 'The number of elements in a helper list.',
  BF_SORT_LIST: '%1 .sort()',
  BF_SORT_LIST_TOOLTIP:
    'Sort a small helper list (here: one bucket) with Python’s built-in sort.',
};

export const BLOCK_TYPES = {
  DEFINE_SORT: 'bf_define_sort',
  DEFINE_SEARCH: 'bf_define_search',
  COMPARE_TARGET: 'bf_compare_target',
  RETURN_VALUE: 'bf_return',
  FLOORDIV: 'bf_floordiv',
  FOR_RANGE: 'bf_for_range',
  COMPARE: 'bf_compare',
  SWAP: 'bf_swap',
  LEN: 'bf_len',
  DEFINE_HELPER: 'bf_define_helper',
  CALL: 'bf_call',
  CALL_VALUE: 'bf_call_value',
  GET: 'bf_get',
  SET: 'bf_set',
  SHUFFLE: 'bf_shuffle',
  IS_SORTED: 'bf_is_sorted',
  TARGET: 'bf_target',
  ARR_MAX: 'bf_arr_max',
  ARR_MIN: 'bf_arr_min',
  MIN: 'bf_min',
  SQRT: 'bf_sqrt',
  ZEROS: 'bf_zeros',
  BUCKETS: 'bf_buckets',
  SLICE: 'bf_slice',
  LIST_GET: 'bf_list_get',
  LIST_SET: 'bf_list_set',
  APPEND: 'bf_append',
  LIST_LEN: 'bf_list_len',
  SORT_LIST: 'bf_sort_list',
};

/** Comparison ops shared by `bf_compare` and `bf_compare_target`. */
const ORDER_OPS = [
  ['>', 'GT'],
  ['<', 'LT'],
  ['≥', 'GTE'],
  ['≤', 'LTE'],
];

const num = name => ({ type: 'input_value', name, check: 'Number' });
const any = name => ({ type: 'input_value', name });

/** A value or statement block with inline inputs; `message` is a BKY key. */
function simpleBlock(type, key, args, shape, style) {
  return {
    type,
    message0: `%{BKY_${key}}`,
    args0: args,
    inputsInline: true,
    ...(shape === 'statement'
      ? { previousStatement: null, nextStatement: null }
      : { output: shape }),
    style,
    tooltip: `%{BKY_${key}_TOOLTIP}`,
  };
}

const BLOCK_DEFINITIONS = [
  {
    type: BLOCK_TYPES.DEFINE_SORT,
    message0: '%{BKY_BF_DEFINE}',
    // One label holds the whole signature (two fields would render a gap
    // before the parentheses). The default covers phase-1 workspaces saved
    // without NAME.
    args0: [
      {
        type: 'field_label_serializable',
        name: 'NAME',
        text: 'bubble_sort(arr)',
      },
    ],
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'STACK' }],
    message2: '%{BKY_BF_RETURN}',
    style: 'procedure_blocks',
    tooltip: '%{BKY_BF_DEFINE_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.DEFINE_SEARCH,
    message0: '%{BKY_BF_DEFINE_SEARCH}',
    args0: [
      {
        type: 'field_label_serializable',
        name: 'NAME',
        text: 'linear_search(arr, target)',
      },
    ],
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'STACK' }],
    message2: '%{BKY_BF_RETURN_NOT_FOUND}',
    style: 'procedure_blocks',
    tooltip: '%{BKY_BF_DEFINE_SEARCH_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.FOR_RANGE,
    message0: '%{BKY_BF_FOR_RANGE}',
    args0: [
      { type: 'field_variable', name: 'VAR', variable: 'i' },
      { type: 'input_value', name: 'FROM', check: 'Number' },
      { type: 'input_value', name: 'TO', check: 'Number' },
    ],
    message1: '%{BKY_BF_DO}',
    args1: [{ type: 'input_statement', name: 'DO' }],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'loop_blocks',
    tooltip: '%{BKY_BF_FOR_RANGE_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.COMPARE,
    message0: '%{BKY_BF_COMPARE}',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: ORDER_OPS,
      },
      { type: 'input_value', name: 'B', check: 'Number' },
    ],
    inputsInline: true,
    output: 'Boolean',
    style: 'logic_blocks',
    tooltip: '%{BKY_BF_COMPARE_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.SWAP,
    message0: '%{BKY_BF_SWAP}',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      { type: 'input_value', name: 'B', check: 'Number' },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'list_blocks',
    tooltip: '%{BKY_BF_SWAP_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.COMPARE_TARGET,
    message0: '%{BKY_BF_COMPARE_TARGET}',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [['==', 'EQ'], ...ORDER_OPS],
      },
    ],
    inputsInline: true,
    output: 'Boolean',
    style: 'logic_blocks',
    tooltip: '%{BKY_BF_COMPARE_TARGET_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.RETURN_VALUE,
    message0: '%{BKY_BF_RETURN_VALUE}',
    args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
    inputsInline: true,
    previousStatement: null,
    style: 'procedure_blocks',
    tooltip: '%{BKY_BF_RETURN_VALUE_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.FLOORDIV,
    message0: '%{BKY_BF_FLOORDIV}',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      { type: 'input_value', name: 'B', check: 'Number' },
    ],
    inputsInline: true,
    output: 'Number',
    style: 'math_blocks',
    tooltip: '%{BKY_BF_FLOORDIV_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.LEN,
    message0: '%{BKY_BF_LEN}',
    output: 'Number',
    style: 'list_blocks',
    tooltip: '%{BKY_BF_LEN_TOOLTIP}',
  },
  {
    type: BLOCK_TYPES.DEFINE_HELPER,
    message0: '%{BKY_BF_DEFINE_HELPER}',
    // Signature label, e.g. `partition(arr, low, high)`: params are variables.
    args0: [
      { type: 'field_label_serializable', name: 'NAME', text: 'helper(arr)' },
    ],
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'STACK' }],
    style: 'procedure_blocks',
    tooltip: '%{BKY_BF_DEFINE_HELPER_TOOLTIP}',
  },
  simpleBlock(
    BLOCK_TYPES.GET,
    'BF_GET',
    [num('INDEX')],
    'Number',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.SET,
    'BF_SET',
    [num('INDEX'), num('VALUE')],
    'statement',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.SHUFFLE,
    'BF_SHUFFLE',
    [],
    'statement',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.IS_SORTED,
    'BF_IS_SORTED',
    [],
    'Boolean',
    'logic_blocks'
  ),
  simpleBlock(BLOCK_TYPES.TARGET, 'BF_TARGET', [], 'Number', 'variable_blocks'),
  simpleBlock(BLOCK_TYPES.ARR_MAX, 'BF_ARR_MAX', [], 'Number', 'math_blocks'),
  simpleBlock(BLOCK_TYPES.ARR_MIN, 'BF_ARR_MIN', [], 'Number', 'math_blocks'),
  simpleBlock(
    BLOCK_TYPES.MIN,
    'BF_MIN',
    [num('A'), num('B')],
    'Number',
    'math_blocks'
  ),
  simpleBlock(BLOCK_TYPES.SQRT, 'BF_SQRT', [num('A')], 'Number', 'math_blocks'),
  simpleBlock(
    BLOCK_TYPES.ZEROS,
    'BF_ZEROS',
    [num('SIZE')],
    'Array',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.BUCKETS,
    'BF_BUCKETS',
    [num('SIZE')],
    'Array',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.SLICE,
    'BF_SLICE',
    [num('FROM'), num('TO')],
    'Array',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.LIST_GET,
    'BF_LIST_GET',
    [any('LIST'), num('INDEX')],
    null,
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.LIST_SET,
    'BF_LIST_SET',
    [any('LIST'), num('INDEX'), num('VALUE')],
    'statement',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.APPEND,
    'BF_APPEND',
    [any('LIST'), any('VALUE')],
    'statement',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.LIST_LEN,
    'BF_LIST_LEN',
    [any('LIST')],
    'Number',
    'list_blocks'
  ),
  simpleBlock(
    BLOCK_TYPES.SORT_LIST,
    'BF_SORT_LIST',
    [any('LIST')],
    'statement',
    'list_blocks'
  ),
];

/**
 * `name(arr, a, b)` call to a helper. The arity lives in extraState (set by the
 * starter); there is no mutator UI, learners copy calls from the toolbox.
 * @param {boolean} isValue - value block (`p = partition(...)`) vs statement
 */
function callBlock(isValue) {
  return {
    init() {
      this.argCount_ = 0;
      this.appendDummyInput('HEAD')
        .appendField(new Blockly.FieldLabelSerializable('helper'), 'NAME')
        .appendField('(arr');
      this.appendDummyInput('TAIL').appendField(')');
      this.setInputsInline(true);
      if (isValue) this.setOutput(true, null);
      else {
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
      this.setStyle('procedure_blocks');
      this.setTooltip(Blockly.Msg.BF_CALL_TOOLTIP);
    },
    saveExtraState() {
      return { args: this.argCount_ };
    },
    loadExtraState(state) {
      this.removeInput('TAIL');
      for (let i = this.argCount_; i < state.args; i++) {
        this.appendValueInput(`ARG${i}`).appendField(',');
      }
      this.argCount_ = state.args;
      this.appendDummyInput('TAIL').appendField(')');
    },
  };
}

let registered = false;

/** Registers the custom blocks once (safe to call repeatedly). */
export function registerBlocks() {
  if (registered) return;
  for (const [key, value] of Object.entries(DEFAULT_BLOCK_MESSAGES)) {
    Blockly.Msg[key] ??= value;
  }
  Blockly.common.defineBlocksWithJsonArray(BLOCK_DEFINITIONS);
  Blockly.Blocks[BLOCK_TYPES.CALL] = callBlock(false);
  Blockly.Blocks[BLOCK_TYPES.CALL_VALUE] = callBlock(true);
  // Lets the built-in `break` block accept our loop as its surrounding loop.
  loops.loopTypes.add(BLOCK_TYPES.FOR_RANGE);
  registered = true;
}

/** Sets Blockly.Msg for the custom blocks from an i18n `t` function. */
export function applyBlockMessages(t) {
  for (const [key, fallback] of Object.entries(DEFAULT_BLOCK_MESSAGES)) {
    Blockly.Msg[key] = t(`blocks.${key}`, { defaultValue: fallback });
  }
}
