/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Blocks tab starters: the complete program per algorithm plus a toolbox of
 * the blocks it uses. Plain data, no Blockly import, so the code panel can
 * check support without loading Blockly.
 */

import { SORTING_STARTERS } from './sorting.js';
import { SEARCHING_STARTERS } from './searching.js';
import { PATHFINDING_STARTERS } from './pathfinding.js';
import { TREE_STARTERS } from './tree.js';
import { GRAPH_STARTERS } from './graph.js';

const HAT_TYPES = new Set([
  'bf_define_sort',
  'bf_define_search',
  'bf_define_path',
  'bf_define_tree',
  'bf_define_graph',
  'bf_define_helper',
]);

/** Distinguishes toolbox entries beyond the block type. */
function entryKey(block) {
  switch (block.type) {
    case 'variables_get':
    case 'variables_set':
      return `${block.type}:${block.fields.VAR.id}`;
    case 'bf_for_neighbor':
      return `${block.type}:${block.fields.ORDER}`;
    case 'bf_call':
    case 'bf_call_value':
      return `${block.type}:${block.fields.NAME}`;
    case 'controls_if':
      return `${block.type}:${Boolean(block.extraState?.hasElse)}`;
    default:
      return block.type;
  }
}

/**
 * One flyout entry per distinct block in the program, in reading order, with
 * empty inputs. The flyout doesn't know the starter's variable ids, so
 * variables are referenced by name.
 * @param {object} workspace - Starter workspace JSON
 */
export function toolboxFor(workspace) {
  const names = Object.fromEntries(
    workspace.variables.map(({ id, name }) => [id, name])
  );
  const entries = new Map();
  const visit = block => {
    if (!block) return;
    const key = entryKey(block);
    if (!HAT_TYPES.has(block.type) && !entries.has(key)) {
      const fields = block.fields?.VAR
        ? { ...block.fields, VAR: { name: names[block.fields.VAR.id] } }
        : block.fields;
      entries.set(key, {
        kind: 'block',
        type: block.type,
        ...(fields && { fields }),
        ...(block.extraState && { extraState: block.extraState }),
      });
    }
    for (const input of Object.values(block.inputs ?? {})) visit(input.block);
    visit(block.next?.block);
  };
  workspace.blocks.blocks.forEach(visit);
  return { kind: 'flyoutToolbox', contents: [...entries.values()] };
}

const STARTERS = Object.fromEntries(
  Object.entries({
    ...SORTING_STARTERS,
    ...SEARCHING_STARTERS,
    ...PATHFINDING_STARTERS,
    ...TREE_STARTERS,
    ...GRAPH_STARTERS,
  }).map(([key, workspace]) => [
    key,
    { workspace, toolbox: toolboxFor(workspace) },
  ])
);

/**
 * @param {string} algorithmKey
 * @returns {{ workspace: object, toolbox: object } | null} null when the
 *   algorithm has no blocks yet (the tab shows "coming soon").
 */
export function getBlocksStarter(algorithmKey) {
  return STARTERS[algorithmKey] ?? null;
}
