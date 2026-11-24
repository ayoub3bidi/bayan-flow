/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Turns a blocks workspace into two Python programs:
 * - displayCode: clean Python shown to the learner (and used by "Run tests").
 * - execCode: the same program, but every operation on `arr` (compare, swap,
 *   read, write, shuffle, sorted check) calls the `__bf` tracer in the Pyodide
 *   worker so each step is recorded with the block that made it. Helper lists
 *   are plain Python: only `arr` is visualized.
 */

import { PythonGenerator, pythonGenerator, Order } from 'blockly/python';
import { BLOCK_TYPES } from './definitions.js';

const MARKER = '# @@bf:';
// Python's + - * are left-associative: a left operand of the same precedence
// needs no parentheses (`n - i - 1`, not `(n - i) - 1`).
const LEFT_ASSOC_OPS = {
  ADD: [' + ', Order.ADDITIVE],
  MINUS: [' - ', Order.ADDITIVE],
  MULTIPLY: [' * ', Order.MULTIPLICATIVE],
};

class BayanPythonGenerator extends PythonGenerator {
  constructor() {
    super('Python');
    Object.assign(this.forBlock, pythonGenerator.forBlock);
    this.INDENT = '    ';
    this.execMode = false;
    this.forBlock.math_arithmetic = mathArithmetic;
    this.forBlock[BLOCK_TYPES.DEFINE_SORT] = defineSort;
    this.forBlock[BLOCK_TYPES.FOR_RANGE] = forRange;
    this.forBlock[BLOCK_TYPES.COMPARE] = compare;
    this.forBlock[BLOCK_TYPES.SWAP] = swap;
    this.forBlock[BLOCK_TYPES.LEN] = () => ['len(arr)', Order.FUNCTION_CALL];
    this.forBlock[BLOCK_TYPES.DEFINE_SEARCH] = defineSearch;
    this.forBlock[BLOCK_TYPES.COMPARE_TARGET] = compareTarget;
    this.forBlock[BLOCK_TYPES.RETURN_VALUE] = returnValue;
    this.forBlock[BLOCK_TYPES.FLOORDIV] = floorDiv;
    this.forBlock[BLOCK_TYPES.DEFINE_HELPER] = defineHelper;
    this.forBlock[BLOCK_TYPES.CALL] = (block, generator) =>
      `${callCode(block, generator)}\n`;
    this.forBlock[BLOCK_TYPES.CALL_VALUE] = (block, generator) => [
      callCode(block, generator),
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.GET] = getElement;
    this.forBlock[BLOCK_TYPES.SET] = setElement;
    this.forBlock[BLOCK_TYPES.SHUFFLE] = shuffle;
    this.forBlock[BLOCK_TYPES.IS_SORTED] = isSorted;
    this.forBlock[BLOCK_TYPES.TARGET] = () => ['target', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.ARR_MAX] = () => [
      'max(arr)',
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.ARR_MIN] = () => [
      'min(arr)',
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.MIN] = (block, generator) => {
      const [a, b] = indexes(block, generator);
      return [`min(${a}, ${b})`, Order.FUNCTION_CALL];
    };
    this.forBlock[BLOCK_TYPES.SQRT] = (block, generator) => [
      `int(${generator.valueToCode(block, 'A', Order.EXPONENTIATION) || '0'} ** 0.5)`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.ZEROS] = (block, generator) => [
      `[0] * ${generator.valueToCode(block, 'SIZE', Order.MULTIPLICATIVE) || '0'}`,
      Order.MULTIPLICATIVE,
    ];
    this.forBlock[BLOCK_TYPES.BUCKETS] = (block, generator) => [
      `[[] for _ in range(${generator.valueToCode(block, 'SIZE', Order.NONE) || '0'})]`,
      Order.ATOMIC,
    ];
    this.forBlock[BLOCK_TYPES.SLICE] = (block, generator) => [
      `arr[${generator.valueToCode(block, 'FROM', Order.NONE) || '0'}:${generator.valueToCode(block, 'TO', Order.NONE) || '0'}]`,
      Order.MEMBER,
    ];
    this.forBlock[BLOCK_TYPES.LIST_GET] = (block, generator) => [
      `${listOf(block, generator)}[${generator.valueToCode(block, 'INDEX', Order.NONE) || '0'}]`,
      Order.MEMBER,
    ];
    this.forBlock[BLOCK_TYPES.LIST_SET] = (block, generator) =>
      `${listOf(block, generator)}[${generator.valueToCode(block, 'INDEX', Order.NONE) || '0'}] = ${generator.valueToCode(block, 'VALUE', Order.NONE) || '0'}\n`;
    this.forBlock[BLOCK_TYPES.APPEND] = (block, generator) =>
      `${listOf(block, generator)}.append(${generator.valueToCode(block, 'VALUE', Order.NONE) || '0'})\n`;
    this.forBlock[BLOCK_TYPES.LIST_LEN] = (block, generator) => [
      `len(${generator.valueToCode(block, 'LIST', Order.NONE) || '[]'})`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.SORT_LIST] = (block, generator) =>
      `${listOf(block, generator)}.sort()\n`;
    // The function's parameters: a learner variable must not shadow them.
    this.addReservedWords('arr,target');
  }

  finish(code) {
    // Variables are always assigned before use inside the function; drop the
    // `x = None` preamble Blockly adds for every workspace variable.
    delete this.definitions_['variables'];
    return super.finish(code).replace(/^\n+/, '');
  }
}

function mathArithmetic(block, generator) {
  const op = LEFT_ASSOC_OPS[block.getFieldValue('OP')];
  if (!op) return pythonGenerator.forBlock.math_arithmetic(block, generator);
  const [symbol, order] = op;
  // Blockly compares Math.floor'ed orders, so loosen by a whole class.
  const left = generator.valueToCode(block, 'A', order + 1) || '0';
  const right = generator.valueToCode(block, 'B', order) || '0';
  return [left + symbol + right, order];
}

/** The hat's NAME label is a signature like `bubble_sort(arr)`. */
function functionNameOf(hat) {
  return hat.getFieldValue('NAME').split('(')[0].trim();
}

function defineSort(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  const name = functionNameOf(block);
  return `def ${name}(arr):\n${body}${generator.INDENT}return arr\n`;
}

function defineSearch(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  const name = functionNameOf(block);
  return `def ${name}(arr, target):\n${body}${generator.INDENT}return -1\n`;
}

const TARGET_OPS = { EQ: '==', LT: '<', GT: '>', LTE: '<=', GTE: '>=' };

function compareTarget(block, generator) {
  const index = generator.valueToCode(block, 'A', Order.NONE) || '0';
  const op = block.getFieldValue('OP');
  if (generator.execMode) {
    return [
      `__bf.cmp_target(arr, ${index}, target, '${op}', ${generator.quote_(block.id)})`,
      Order.FUNCTION_CALL,
    ];
  }
  return [`arr[${index}] ${TARGET_OPS[op]} target`, Order.RELATIONAL];
}

function returnValue(block, generator) {
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '-1';
  return `return ${value}\n`;
}

function floorDiv(block, generator) {
  // Left-associative like * (`gap * 10 // 13`); see mathArithmetic.
  const a = generator.valueToCode(block, 'A', Order.MULTIPLICATIVE + 1) || '0';
  const b = generator.valueToCode(block, 'B', Order.MULTIPLICATIVE) || '1';
  return [`${a} // ${b}`, Order.MULTIPLICATIVE];
}

function forRange(block, generator) {
  const variable = generator.getVariableName(block.getFieldValue('VAR'));
  const from = generator.valueToCode(block, 'FROM', Order.NONE) || '0';
  const to = generator.valueToCode(block, 'TO', Order.NONE) || '0';
  // Check emptiness before addLoopTrap: it adds marker/trap lines to the body.
  const branch = generator.addLoopTrap(
    generator.statementToCode(block, 'DO') || generator.PASS,
    block
  );
  const range = from === '0' ? `range(${to})` : `range(${from}, ${to})`;
  return `for ${variable} in ${range}:\n${branch}`;
}

function indexes(block, generator) {
  return [
    generator.valueToCode(block, 'A', Order.NONE) || '0',
    generator.valueToCode(block, 'B', Order.NONE) || '0',
  ];
}

/** Python operator and tracer method per comparison op. */
const COMPARE_OPS = {
  GT: ['>', 'gt'],
  LT: ['<', 'lt'],
  GTE: ['>=', 'ge'],
  LTE: ['<=', 'le'],
};

function compare(block, generator) {
  const [a, b] = indexes(block, generator);
  const [symbol, fn] = COMPARE_OPS[block.getFieldValue('OP')] ?? COMPARE_OPS.GT;
  if (generator.execMode) {
    return [
      `__bf.${fn}(arr, ${a}, ${b}, ${generator.quote_(block.id)})`,
      Order.FUNCTION_CALL,
    ];
  }
  return [`arr[${a}] ${symbol} arr[${b}]`, Order.RELATIONAL];
}

function defineHelper(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  return `def ${block.getFieldValue('NAME')}:\n${body}`;
}

function callCode(block, generator) {
  const args = ['arr'];
  for (let i = 0; block.getInput(`ARG${i}`); i++) {
    args.push(generator.valueToCode(block, `ARG${i}`, Order.NONE) || '0');
  }
  return `${block.getFieldValue('NAME')}(${args.join(', ')})`;
}

/** The helper list a list block works on (a variable, or e.g. `buckets[b]`). */
function listOf(block, generator) {
  return generator.valueToCode(block, 'LIST', Order.MEMBER) || '[]';
}

function getElement(block, generator) {
  const index = generator.valueToCode(block, 'INDEX', Order.NONE) || '0';
  if (generator.execMode) {
    return [
      `__bf.get(arr, ${index}, ${generator.quote_(block.id)})`,
      Order.FUNCTION_CALL,
    ];
  }
  return [`arr[${index}]`, Order.MEMBER];
}

function setElement(block, generator) {
  const index = generator.valueToCode(block, 'INDEX', Order.NONE) || '0';
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  if (generator.execMode) {
    return `__bf.set(arr, ${index}, ${value}, ${generator.quote_(block.id)})\n`;
  }
  return `arr[${index}] = ${value}\n`;
}

function shuffle(block, generator) {
  if (generator.execMode) {
    return `__bf.shuffle(arr, ${generator.quote_(block.id)})\n`;
  }
  generator.definitions_['import_random'] = 'import random';
  return 'random.shuffle(arr)\n';
}

function isSorted(block, generator) {
  if (generator.execMode) {
    return [
      `__bf.is_sorted(arr, ${generator.quote_(block.id)})`,
      Order.FUNCTION_CALL,
    ];
  }
  const name = generator.provideFunction_(
    'is_sorted',
    // provideFunction_ widens each 2-space indent to INDENT.
    `def ${generator.FUNCTION_NAME_PLACEHOLDER_}(arr):
  return all(arr[i] <= arr[i + 1] for i in range(len(arr) - 1))
`
  );
  return [`${name}(arr)`, Order.FUNCTION_CALL];
}

function swap(block, generator) {
  const [a, b] = indexes(block, generator);
  if (generator.execMode) {
    return `__bf.swap(arr, ${a}, ${b}, ${generator.quote_(block.id)})\n`;
  }
  return `arr[${a}], arr[${b}] = arr[${b}], arr[${a}]\n`;
}

/**
 * Removes `# @@bf:'<id>'` marker lines and maps each remaining line to the
 * innermost statement block that produced it.
 *
 * @param {string} code
 * @returns {{ code: string, lineBlockIds: (string|null)[] }}
 */
export function stripBlockMarkers(code) {
  const lines = [];
  const lineBlockIds = [];
  let pending = null;
  for (const line of code.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith(MARKER)) {
      // injectId wraps the id in single quotes; Blockly ids never contain quotes.
      pending = trimmed.slice(MARKER.length + 1, -1);
      continue;
    }
    lines.push(line);
    lineBlockIds.push(trimmed ? pending : null);
  }
  while (lines.length && lines[lines.length - 1].trim() === '') {
    lines.pop();
    lineBlockIds.pop();
  }
  return { code: lines.join('\n') + '\n', lineBlockIds };
}

/**
 * Map every block id to the statement block that owns it (value blocks such
 * as the compare inside an `if` resolve to that `if`).
 */
function buildStatementIds(workspace) {
  const map = {};
  for (const block of workspace.getAllBlocks(false)) {
    let owner = block;
    while (owner.outputConnection && owner.getParent()) {
      owner = owner.getParent();
    }
    map[block.id] = owner.id;
  }
  return map;
}

/** Helpers first (in workspace order), then the main function. */
function generate(generator, workspace, hats) {
  generator.init(workspace);
  return generator.finish(
    hats.map(hat => generator.blockToCode(hat)).join('\n')
  );
}

/**
 * @param {import('blockly/core').Workspace} workspace
 * @returns {{ kind: 'sort'|'search', functionName: string,
 *   displayCode: string, execCode: string,
 *   lineBlockIds: (string|null)[], statementIds: Record<string, string> } | null}
 *   null when the workspace has no `define …` block.
 */
export function generateProgram(workspace) {
  const sortHat = workspace.getBlocksByType(BLOCK_TYPES.DEFINE_SORT, false)[0];
  const hat =
    sortHat ?? workspace.getBlocksByType(BLOCK_TYPES.DEFINE_SEARCH, false)[0];
  if (!hat) return null;
  const helpers = workspace.getBlocksByType(BLOCK_TYPES.DEFINE_HELPER, true);
  const hats = [...helpers, hat];
  const generator = new BayanPythonGenerator();
  // A learner variable must not shadow a helper function either.
  const helperNames = helpers.map(functionNameOf).filter(Boolean);
  if (helperNames.length) generator.addReservedWords(helperNames.join(','));

  generator.STATEMENT_PREFIX = `${MARKER}%1\n`;
  const { code: displayCode, lineBlockIds } = stripBlockMarkers(
    generate(generator, workspace, hats)
  );

  generator.STATEMENT_PREFIX = null;
  generator.INFINITE_LOOP_TRAP = '__bf.tick()\n';
  generator.execMode = true;
  const execCode = generate(generator, workspace, hats);

  return {
    kind: sortHat ? 'sort' : 'search',
    functionName: functionNameOf(hat),
    displayCode,
    execCode,
    lineBlockIds,
    statementIds: buildStatementIds(workspace),
  };
}
