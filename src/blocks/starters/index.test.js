/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import {
  SORTING_ALGORITHMS,
  SEARCHING_ALGORITHMS,
  PATHFINDING_ALGORITHMS,
  TREE_TRAVERSAL_ALGORITHMS,
  GRAPH_ALGORITHMS,
} from '../../constants/index.js';
import { registerBlocks } from '../definitions.js';
import { generateProgram } from '../generators.js';
import { getBlocksStarter, toolboxFor } from './index.js';

// src/test/setup.js mocks constants with a partial algorithm list.
vi.unmock('../../constants/index.js');

// Node-link searches are graph programs.
const NODE_LINK_SEARCHES = new Set([
  SEARCHING_ALGORITHMS.DEPTH_FIRST_SEARCH,
  SEARCHING_ALGORITHMS.BREADTH_FIRST_SEARCH_GRAPH,
]);
const PATHFINDING = Object.values(PATHFINDING_ALGORITHMS);
const TREE = Object.values(TREE_TRAVERSAL_ALGORITHMS);
const GRAPH = [...NODE_LINK_SEARCHES, ...Object.values(GRAPH_ALGORITHMS)];
const SUPPORTED = [
  ...Object.values(SORTING_ALGORITHMS),
  ...Object.values(SEARCHING_ALGORITHMS).filter(
    key => !NODE_LINK_SEARCHES.has(key)
  ),
  ...PATHFINDING,
  ...TREE,
  ...GRAPH,
];
const kindOf = key => {
  if (PATHFINDING.includes(key)) return 'path';
  if (TREE.includes(key)) return 'tree';
  if (GRAPH.includes(key)) return 'graph';
  return Object.values(SEARCHING_ALGORITHMS).includes(key) ? 'search' : 'sort';
};

describe('blocks starters', () => {
  beforeAll(() => {
    Blockly.setLocale(En);
    registerBlocks();
  });

  it('covers every algorithm, and nothing else', () => {
    expect(new Set(SUPPORTED).size).toBe(45);
    for (const key of SUPPORTED) expect(getBlocksStarter(key)).not.toBeNull();
    expect(getBlocksStarter('futureAlgorithm')).toBeNull();
  });

  it.each(SUPPORTED)('%s loads and generates a complete program', key => {
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      getBlocksStarter(key).workspace,
      workspace
    );
    const program = generateProgram(workspace);
    const kind = kindOf(key);
    expect(program.kind).toBe(kind);
    expect(program.functionName).toMatch(/^[a-z_]+$/);
    // No empty slots: no `pass` bodies and no unnamed/missing variables.
    // Path, tree and graph programs use None on purpose (parent links,
    // missing children, no answer).
    expect(program.displayCode).not.toMatch(
      kind === 'path' || kind === 'tree' || kind === 'graph'
        ? /\bpass\b|\bunnamed|\w2\b/
        : /\bpass\b|\bNone\b|\bunnamed/
    );
    // Every block id is reachable from the line map or a statement owner.
    for (const block of workspace.getAllBlocks(false)) {
      expect(program.statementIds[block.id]).toBeDefined();
    }
  });

  it('builds one toolbox entry per distinct block, without hats', () => {
    const { toolbox } = getBlocksStarter('quickSort');
    const types = toolbox.contents.map(entry => entry.type);
    expect(types).not.toContain('bf_define_helper');
    expect(types).not.toContain('bf_define_sort');
    expect(toolbox.contents).toContainEqual({
      kind: 'block',
      type: 'bf_call_value',
      fields: { NAME: 'partition' },
      extraState: { args: 2 },
    });
    expect(toolbox.contents).toContainEqual({
      kind: 'block',
      type: 'variables_get',
      fields: { VAR: { name: 'low' } },
    });
    const keys = toolbox.contents.map(entry => JSON.stringify(entry));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('lists a toolbox in reading order of first use', () => {
    const workspace = {
      variables: [{ id: 'var_x', name: 'x' }],
      blocks: {
        blocks: [
          {
            type: 'bf_define_sort',
            inputs: {
              STACK: {
                block: {
                  type: 'variables_set',
                  fields: { VAR: { id: 'var_x' } },
                  inputs: { VALUE: { block: { type: 'bf_len' } } },
                  next: { block: { type: 'bf_shuffle' } },
                },
              },
            },
          },
        ],
      },
    };
    expect(toolboxFor(workspace).contents.map(e => e.type)).toEqual([
      'variables_set',
      'bf_len',
      'bf_shuffle',
    ]);
  });
});
