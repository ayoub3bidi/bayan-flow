/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Turns a blocks workspace into two Python programs:
 * - displayCode: clean Python shown to the learner (and used by "Run tests").
 * - execCode: the same program, but every operation on `arr` (compare, swap,
 *   read, write, shuffle, sorted check) and every frontier/cost operation of a
 *   path program (push, pop, relax) calls the `__bf` tracer in the Pyodide
 *   worker so each step is recorded with the block that made it. Tree programs
 *   trace node visits, child-link changes and queue pushes/pops. Graph programs
 *   trace neighbour/edge loops, set marks, answer appends, stack/queue
 *   pushes/pops and distance-matrix reads/writes. Helper lists are plain
 *   Python: only `arr` (or the grid's cells, the tree or the graph) is
 *   visualized.
 */

import { Names } from 'blockly/core';
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
    this.forBlock[BLOCK_TYPES.LIST_SET] = listSet;
    this.forBlock[BLOCK_TYPES.APPEND] = (block, generator) =>
      `${listOf(block, generator)}.append(${generator.valueToCode(block, 'VALUE', Order.NONE) || '0'})\n`;
    this.forBlock[BLOCK_TYPES.LIST_LEN] = (block, generator) => [
      `len(${generator.valueToCode(block, 'LIST', Order.NONE) || '[]'})`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.SORT_LIST] = (block, generator) =>
      // Graph programs trace the reorder so Kahn's queue strip keeps the
      // program's dequeue order.
      generator.execMode && generator.traceStores
        ? `__bf.sort_list(${valueOf(generator, block, 'LIST', '[]')}, ${generator.quote_(block.id)})\n`
        : `${listOf(block, generator)}.sort()\n`;
    this.forBlock[BLOCK_TYPES.DEFINE_PATH] = definePath;
    this.forBlock[BLOCK_TYPES.START] = () => ['start', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.END] = () => ['end', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.NEIGHBORS] = (block, generator) => [
      `${provideHelper(generator, 'neighbors')}(grid, ${valueOf(generator, block, 'CELL', 'start')})`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.WALKABLE] = (block, generator) => [
      `${provideHelper(generator, 'walkable')}(grid, ${valueOf(generator, block, 'CELL', 'start')})`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.MANHATTAN] = (block, generator) => [
      `${provideHelper(generator, 'manhattan')}(${valueOf(generator, block, 'A', 'start')}, ${valueOf(generator, block, 'B', 'end')})`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.CELL] = (block, generator) => [
      `(${valueOf(generator, block, 'ROW', '0')}, ${valueOf(generator, block, 'COL', '0')})`,
      Order.ATOMIC,
    ];
    this.forBlock[BLOCK_TYPES.ROW] = (block, generator) => [
      `${valueOf(generator, block, 'CELL', 'start', Order.MEMBER)}[0]`,
      Order.MEMBER,
    ];
    this.forBlock[BLOCK_TYPES.COL] = (block, generator) => [
      `${valueOf(generator, block, 'CELL', 'start', Order.MEMBER)}[1]`,
      Order.MEMBER,
    ];
    this.forBlock[BLOCK_TYPES.DIRECTIONS] = () => [
      '[(-1, 0), (1, 0), (0, -1), (0, 1)]',
      Order.ATOMIC,
    ];
    this.forBlock[BLOCK_TYPES.PUSH] = push;
    this.forBlock[BLOCK_TYPES.PUSH_PRIORITY] = pushPriority;
    this.forBlock[BLOCK_TYPES.POP] = (block, generator) =>
      popCell(block, generator, 'pop', '.pop(0)');
    this.forBlock[BLOCK_TYPES.POP_MIN] = (block, generator) => {
      if (generator.execMode) return popCell(block, generator, 'pop_min');
      generator.definitions_['import_heapq'] = 'import heapq';
      return [
        `heapq.heappop(${valueOf(generator, block, 'LIST', '[]')})[1]`,
        Order.MEMBER,
      ];
    };
    this.forBlock[BLOCK_TYPES.POP_LAST] = (block, generator) =>
      `${popCell(block, generator, 'pop_last', '.pop()')[0]}\n`;
    this.forBlock[BLOCK_TYPES.RELAX] = relax;
    this.forBlock[BLOCK_TYPES.NEW_DICT] = () => ['{}', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.DICT_GET_OR] = (block, generator) => [
      `${valueOf(generator, block, 'DICT', '{}', Order.MEMBER)}.get(${valueOf(generator, block, 'KEY', 'None')}, ${valueOf(generator, block, 'DEFAULT', 'None')})`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.IN] = (block, generator) => [
      `${valueOf(generator, block, 'ITEM', 'None', Order.RELATIONAL)} ${block.getFieldValue('OP') === 'NOT_IN' ? 'not in' : 'in'} ${valueOf(generator, block, 'COLLECTION', '[]', Order.RELATIONAL)}`,
      Order.RELATIONAL,
    ];
    this.forBlock[BLOCK_TYPES.INFINITY] = () => [
      "float('inf')",
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.PAIR] = (block, generator) => [
      `(${valueOf(generator, block, 'A', '0')}, ${valueOf(generator, block, 'B', '0')})`,
      Order.ATOMIC,
    ];
    this.forBlock[BLOCK_TYPES.GRID] = () => ['grid', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.ROWS] = () => ['len(grid)', Order.FUNCTION_CALL];
    this.forBlock[BLOCK_TYPES.COLS] = () => [
      'len(grid[0])',
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.REVERSE] = (block, generator) =>
      `${valueOf(generator, block, 'LIST', '[]', Order.MEMBER)}.reverse()\n`;
    this.forBlock[BLOCK_TYPES.DEFINE_TREE] = defineTree;
    this.forBlock[BLOCK_TYPES.ROOT] = () => ['root', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.CHILD] = (block, generator) => [
      `${valueOf(generator, block, 'NODE', 'root', Order.MEMBER)}["${block.getFieldValue('SIDE')}"]`,
      Order.MEMBER,
    ];
    this.forBlock[BLOCK_TYPES.NODE_VALUE] = (block, generator) => [
      `${valueOf(generator, block, 'NODE', 'root', Order.MEMBER)}["value"]`,
      Order.MEMBER,
    ];
    this.forBlock[BLOCK_TYPES.VISIT] = visitNode;
    this.forBlock[BLOCK_TYPES.SET_CHILD] = setChild;
    this.forBlock[BLOCK_TYPES.IS] = (block, generator) => [
      `${valueOf(generator, block, 'A', 'None', Order.RELATIONAL)} ${block.getFieldValue('OP') === 'IS_NOT' ? 'is not' : 'is'} ${valueOf(generator, block, 'B', 'None', Order.RELATIONAL)}`,
      Order.RELATIONAL,
    ];
    this.forBlock[BLOCK_TYPES.DEFINE_GRAPH] = defineGraph;
    this.forBlock[BLOCK_TYPES.GRAPH] = () => ['graph', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.NODES] = () => ['nodes', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.EDGES] = () => ['edges', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.GOAL] = () => ['goal', Order.ATOMIC];
    this.forBlock[BLOCK_TYPES.FOR_NEIGHBOR] = forNeighbor;
    this.forBlock[BLOCK_TYPES.FOR_EDGE] = forEdge;
    this.forBlock[BLOCK_TYPES.SORT_BY_WEIGHT] = (block, generator) => [
      `sorted(${valueOf(generator, block, 'LIST', '[]')}, key=lambda e: e[2])`,
      Order.FUNCTION_CALL,
    ];
    this.forBlock[BLOCK_TYPES.MARK] = markNode;
    this.forBlock[BLOCK_TYPES.EMIT] = (block, generator) =>
      tracedAppend(block, generator, 'LIST', 'ITEM', 'emit', 'append');
    this.forBlock[BLOCK_TYPES.NEW_SET] = () => ['set()', Order.FUNCTION_CALL];
    this.forBlock[BLOCK_TYPES.SET_REMOVE] = (block, generator) =>
      `${valueOf(generator, block, 'SET', 'set()', Order.MEMBER)}.remove(${valueOf(generator, block, 'VALUE', 'None')})\n`;
    this.forBlock[BLOCK_TYPES.POP_TOP] = (block, generator) =>
      popCell(block, generator, 'pop_last', '.pop()');
    this.forBlock[BLOCK_TYPES.MATRIX] = (block, generator) => {
      const size = valueOf(generator, block, 'SIZE', '0');
      return [
        `[[float('inf')] * ${size} for _ in range(${size})]`,
        Order.ATOMIC,
      ];
    };
    this.forBlock[BLOCK_TYPES.CELL_GET] = cellGet;
    this.forBlock[BLOCK_TYPES.CELL_SET] = cellSet;
    // The function's parameters, and the executed form's tracer and its
    // temporaries: a learner variable must not shadow them.
    this.addReservedWords(
      'arr,target,grid,start,end,heapq,root,graph,nodes,edges,goal,__bf,__bf_src,__bf_adj'
    );
  }

  addLoopTrap(branch, block) {
    // Blockly's own loops (while, for each) add `pass` only when the trapped
    // body is empty, but the display markers make it non-empty: add it first.
    return super.addLoopTrap(branch || this.PASS, block);
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

/**
 * A `return` the hat adds after the body. Its display line belongs to the hat,
 * not to whatever block's marker came last.
 */
function synthesizedReturn(block, generator, value) {
  const marker = generator.STATEMENT_PREFIX
    ? generator.injectId(generator.STATEMENT_PREFIX, block)
    : '';
  return `${marker}${generator.INDENT}return ${value}\n`;
}

function defineSort(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  const name = functionNameOf(block);
  return `def ${name}(arr):\n${body}${synthesizedReturn(block, generator, 'arr')}`;
}

function defineSearch(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  const name = functionNameOf(block);
  return `def ${name}(arr, target):\n${body}${synthesizedReturn(block, generator, '-1')}`;
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

function definePath(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  const name = functionNameOf(block);
  return `def ${name}(grid, start, end):\n${body}${synthesizedReturn(block, generator, '[]')}`;
}

function defineGraph(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  // `None` is a right answer (no topological order of a cyclic graph), so a
  // program that never returns must not pass as one: the executed form
  // returns a sentinel instead. The Python shown to the learner is unchanged.
  const fallThrough = generator.execMode
    ? `${generator.INDENT}return __bf.NO_RETURN\n`
    : '';
  return `def ${block.getFieldValue('NAME')}:\n${body}${fallThrough}`;
}

function defineTree(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  return `def ${functionNameOf(block)}(root):\n${body}`;
}

function visitNode(block, generator) {
  if (generator.execMode) {
    const list = valueOf(generator, block, 'LIST', '[]');
    const node = valueOf(generator, block, 'NODE', 'root');
    return `__bf.visit(${list}, ${node}, ${generator.quote_(block.id)})\n`;
  }
  const list = valueOf(generator, block, 'LIST', '[]', Order.MEMBER);
  const value = valueOf(generator, block, 'NODE', 'root', Order.MEMBER);
  return `${list}.append(${value}["value"])\n`;
}

function setChild(block, generator) {
  const side = block.getFieldValue('SIDE');
  const value = valueOf(generator, block, 'VALUE', 'None');
  if (generator.execMode) {
    const node = valueOf(generator, block, 'NODE', 'root');
    return `__bf.set_child(${node}, "${side}", ${value}, ${generator.quote_(block.id)})\n`;
  }
  const node = valueOf(generator, block, 'NODE', 'root', Order.MEMBER);
  return `${node}["${side}"] = ${value}\n`;
}

/** `for v in graph[node]:` (or `reversed(...)`); exec traces each edge. */
function forNeighbor(block, generator) {
  const variable = generator.getVariableName(block.getFieldValue('VAR'));
  let graph = valueOf(generator, block, 'GRAPH', 'graph', Order.MEMBER);
  let node = valueOf(generator, block, 'NODE', 'start');
  // exec reads the source node and the adjacency twice (lookup + trace):
  // evaluate each once, so e.g. a stack pop there pops one item, as in the
  // displayed code.
  let capture = '';
  if (generator.execMode && !/^\w+$/.test(node)) {
    capture = `__bf_src = ${node}\n`;
    node = '__bf_src';
  }
  if (generator.execMode && !/^\w+$/.test(graph)) {
    capture += `__bf_adj = ${graph}\n`;
    graph = '__bf_adj';
  }
  let items = `${graph}[${node}]`;
  if (block.getFieldValue('ORDER') === 'REVERSED') items = `reversed(${items})`;
  if (generator.execMode) {
    // The tracer compares the adjacency with the input to spot a transpose.
    items = `__bf.each_edge(${items}, ${node}, ${generator.quote_(block.id)}, ${graph})`;
  }
  return `${capture}for ${variable} in ${items}:\n${loopBody(block, generator)}`;
}

/** `for edge in edges:`; exec traces each (from, to, weight) edge. */
function forEdge(block, generator) {
  const variable = generator.getVariableName(block.getFieldValue('VAR'));
  let items = valueOf(generator, block, 'LIST', '[]');
  if (generator.execMode) {
    items = `__bf.each_edge(${items}, None, ${generator.quote_(block.id)})`;
  }
  return `for ${variable} in ${items}:\n${loopBody(block, generator)}`;
}

function loopBody(block, generator) {
  return generator.addLoopTrap(
    generator.statementToCode(block, 'DO') || generator.PASS,
    block
  );
}

/**
 * `d[key] = value`. In graph programs exec records it with the variable's
 * name (`in_degree`, `index`, `low`) so the visualizer can show the values.
 */
function listSet(block, generator) {
  const list = listOf(block, generator);
  const index = generator.valueToCode(block, 'INDEX', Order.NONE) || '0';
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  if (generator.execMode && generator.traceStores) {
    const target = valueOf(generator, block, 'LIST', '[]');
    return `__bf.store(${target}, ${index}, ${value}, ${generator.quote_(list)}, ${generator.quote_(block.id)})\n`;
  }
  return `${list}[${index}] = ${value}\n`;
}

/** `s.add(node)`; exec records a mark event with the set's name. */
function markNode(block, generator) {
  if (!generator.execMode) {
    return tracedAppend(block, generator, 'SET', 'NODE', 'mark', 'add');
  }
  const set = valueOf(generator, block, 'SET', 'set()');
  const node = valueOf(generator, block, 'NODE', 'None');
  return `__bf.mark(${set}, ${node}, ${generator.quote_(block.id)}, ${generator.quote_(set)})\n`;
}

/** `s.add(x)` / `lst.append(x)`; exec records a mark / output event. */
function tracedAppend(block, generator, target, item, method, display) {
  const value = valueOf(generator, block, item, 'None');
  if (generator.execMode) {
    const container = valueOf(generator, block, target, '[]');
    return `__bf.${method}(${container}, ${value}, ${generator.quote_(block.id)})\n`;
  }
  const container = valueOf(generator, block, target, '[]', Order.MEMBER);
  return `${container}.${display}(${value})\n`;
}

function cellGet(block, generator) {
  const i = valueOf(generator, block, 'I', '0');
  const j = valueOf(generator, block, 'J', '0');
  if (generator.execMode) {
    const matrix = valueOf(generator, block, 'MATRIX', '[]');
    return [
      `__bf.cell_get(${matrix}, ${i}, ${j}, ${generator.quote_(block.id)})`,
      Order.FUNCTION_CALL,
    ];
  }
  const matrix = valueOf(generator, block, 'MATRIX', '[]', Order.MEMBER);
  return [`${matrix}[${i}][${j}]`, Order.MEMBER];
}

function cellSet(block, generator) {
  const i = valueOf(generator, block, 'I', '0');
  const j = valueOf(generator, block, 'J', '0');
  const value = valueOf(generator, block, 'VALUE', '0');
  if (generator.execMode) {
    const matrix = valueOf(generator, block, 'MATRIX', '[]');
    return `__bf.cell_set(${matrix}, ${i}, ${j}, ${value}, ${generator.quote_(block.id)})\n`;
  }
  const matrix = valueOf(generator, block, 'MATRIX', '[]', Order.MEMBER);
  return `${matrix}[${i}][${j}] = ${value}\n`;
}

function valueOf(generator, block, input, fallback, order = Order.NONE) {
  return generator.valueToCode(block, input, order) || fallback;
}

/** Untraced grid helpers, emitted once above the functions that use them. */
const GRID_HELPERS = {
  neighbors: `(grid, cell):
  row, col = cell
  result = []
  for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
    r, c = row + dr, col + dc
    if 0 <= r < len(grid) and 0 <= c < len(grid[0]) and grid[r][c] == 0:
      result.append((r, c))
  return result
`,
  walkable: `(grid, cell):
  r, c = cell
  return 0 <= r < len(grid) and 0 <= c < len(grid[0]) and grid[r][c] == 0
`,
  manhattan: `(a, b):
  return abs(a[0] - b[0]) + abs(a[1] - b[1])
`,
};

function provideHelper(generator, name) {
  // provideFunction_ widens each 2-space indent to INDENT.
  return generator.provideFunction_(
    name,
    `def ${generator.FUNCTION_NAME_PLACEHOLDER_}${GRID_HELPERS[name]}`
  );
}

function push(block, generator) {
  const list = valueOf(generator, block, 'LIST', '[]', Order.MEMBER);
  const cell = valueOf(generator, block, 'CELL', 'start');
  if (generator.execMode) {
    return `__bf.push(${list}, ${cell}, ${generator.quote_(block.id)})\n`;
  }
  return `${list}.append(${cell})\n`;
}

function pushPriority(block, generator) {
  const list = valueOf(generator, block, 'LIST', '[]');
  const priority = valueOf(generator, block, 'PRIORITY', '0');
  const cell = valueOf(generator, block, 'CELL', 'start');
  if (generator.execMode) {
    return `__bf.push_priority(${list}, ${priority}, ${cell}, ${generator.quote_(block.id)})\n`;
  }
  generator.definitions_['import_heapq'] = 'import heapq';
  return `heapq.heappush(${list}, (${priority}, ${cell}))\n`;
}

/** `queue.pop(0)` / `path.pop()`; traced as `__bf.<method>(list, id)`. */
function popCell(block, generator, method, display) {
  if (generator.execMode) {
    const list = valueOf(generator, block, 'LIST', '[]');
    return [
      `__bf.${method}(${list}, ${generator.quote_(block.id)})`,
      Order.FUNCTION_CALL,
    ];
  }
  const list = valueOf(generator, block, 'LIST', '[]', Order.MEMBER);
  return [`${list}${display}`, Order.FUNCTION_CALL];
}

function relax(block, generator) {
  const value = valueOf(generator, block, 'VALUE', '0');
  const cell = valueOf(generator, block, 'CELL', 'start');
  if (generator.execMode) {
    const dict = valueOf(generator, block, 'DICT', '{}');
    return `__bf.relax(${dict}, ${cell}, ${value}, ${generator.quote_(block.id)})\n`;
  }
  const dict = valueOf(generator, block, 'DICT', '{}', Order.MEMBER);
  return `${dict}[${cell}] = ${value}\n`;
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

/**
 * The helper's signature label with each parameter named like its workspace
 * variable (`var_<param>`, see starters/builders.js), so renaming `low` to
 * `lo` renames the parameter too.
 */
function helperSignature(block, generator) {
  const [name, params = ''] = block.getFieldValue('NAME').split('(');
  const names = params
    .replace(')', '')
    .split(',')
    .map(param => param.trim())
    .filter(Boolean)
    .map(param =>
      block.workspace.getVariableMap().getVariableById(`var_${param}`)
        ? generator.getVariableName(`var_${param}`)
        : param
    );
  return `${name.trim()}(${names.join(', ')})`;
}

function defineHelper(block, generator) {
  const body = generator.statementToCode(block, 'STACK') || generator.PASS;
  return `def ${helperSignature(block, generator)}:\n${body}`;
}

function callCode(block, generator) {
  // Array programs pass `arr` implicitly; path helpers take every argument.
  const args = block.noArr_ ? [] : ['arr'];
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
  // An index that reads a list (`arr[0]`) would see the first write, and one
  // that calls a helper (`partition(...)`) would run twice: capture both
  // first, as the tracer's swap does.
  if (/[[(]/.test(a) || /[[(]/.test(b)) {
    const i = generator.nameDB_.getDistinctName('i', Names.NameType.VARIABLE);
    const j = generator.nameDB_.getDistinctName('j', Names.NameType.VARIABLE);
    return `${i}, ${j} = ${a}, ${b}\narr[${i}], arr[${j}] = arr[${j}], arr[${i}]\n`;
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
 * @returns {{ kind: 'sort'|'search'|'path'|'tree'|'graph', functionName: string,
 *   displayCode: string, execCode: string,
 *   lineBlockIds: (string|null)[], statementIds: Record<string, string> } | null}
 *   null when the workspace has no `define …` block.
 */
export function generateProgram(workspace) {
  const hatOf = type => workspace.getBlocksByType(type, false)[0];
  const [kind, hat] =
    [
      ['sort', hatOf(BLOCK_TYPES.DEFINE_SORT)],
      ['search', hatOf(BLOCK_TYPES.DEFINE_SEARCH)],
      ['path', hatOf(BLOCK_TYPES.DEFINE_PATH)],
      ['tree', hatOf(BLOCK_TYPES.DEFINE_TREE)],
      ['graph', hatOf(BLOCK_TYPES.DEFINE_GRAPH)],
    ].find(([, found]) => found) ?? [];
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
  // Sort/search/path/tree builders only know their own events.
  generator.traceStores = kind === 'graph';
  const execCode = generate(generator, workspace, hats);

  return {
    kind,
    functionName: functionNameOf(hat),
    displayCode,
    execCode,
    lineBlockIds,
    statementIds: buildStatementIds(workspace),
  };
}
