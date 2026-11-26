/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Starter programs for the graph algorithms and the node-link graph searches,
 * following src/algorithms/python/*.py. Nodes are named by their labels.
 * `graph` maps each node to its neighbours, `nodes` lists the labels and
 * `edges` holds `[from, to, weight]` lists. Neighbour/edge loops, set marks,
 * answer appends, stack/queue pushes/pops and distance-matrix reads/writes are
 * traced (see blocksTracer.js).
 */

import {
  program,
  set,
  ret,
  ifThen,
  forRange,
  forEach,
  whileLoop,
  op,
  min,
  cmp,
  and,
  not,
  bool,
  brk,
  cont,
  at,
  listSet,
  listLen,
  append,
  call,
  callValue,
  start,
  none,
  infinity,
  newDict,
  list,
  pop,
  popMin,
  isIn,
  notIn,
  push,
  pushPriority,
  reverse,
  sortList,
  graph,
  nodes,
  edges,
  goal,
  newSet,
  sortByWeight,
  popTop,
  matrix,
  cellGet,
  mark,
  emit,
  setRemove,
  cellSet,
  forNeighbor,
  forEdge,
} from './builders.js';
import { buildPath } from './pathfinding.js';

/** `while len(lst) > 0:` */
const whileNotEmpty = (lst, statements) =>
  whileLoop(cmp(listLen(lst), '>', 0), statements);

/**
 * DFS (a stack, neighbours pushed in reverse so the lowest is explored first)
 * or BFS (a queue). Returns the path start → goal, or None.
 */
const graphSearch = ({ signature, frontier, take, reversed }) =>
  program({
    variables: [frontier, 'parent', 'current', 'neighbor', 'cell', 'path'],
    kind: 'graph',
    signature,
    main: [
      set(frontier, list(start())),
      set('parent', newDict()),
      listSet('parent', start(), none()),
      whileNotEmpty(frontier, [
        set('current', take(frontier)),
        ifThen(cmp('current', '==', goal()), [
          ret(callValue('build_path', 'parent', 'current')),
        ]),
        forNeighbor(
          'neighbor',
          graph(),
          'current',
          [
            ifThen(notIn('neighbor', 'parent'), [
              listSet('parent', 'neighbor', 'current'),
              push(frontier, 'neighbor'),
            ]),
          ],
          reversed
        ),
      ]),
      ret(none()),
    ],
    helpers: [buildPath],
  });

/**
 * DFS topological sort: a node joins `order` once all its successors have.
 * `order` doubles as the finished set; a node met again while still in
 * `visiting` closes a cycle.
 */
const topologicalSort = program({
  variables: ['visiting', 'order', 'node', 'neighbor'],
  kind: 'graph',
  signature: 'topological_sort(graph)',
  main: [
    set('visiting', newSet()),
    set('order', list()),
    forEach('node', graph(), [
      ifThen(notIn('node', 'order'), [
        ifThen(not(callValue('visit', graph(), 'node', 'visiting', 'order')), [
          ret(none()),
        ]),
      ]),
    ]),
    reverse('order'),
    ret('order'),
  ],
  helpers: [
    {
      signature: 'visit(graph, node, visiting, order)',
      body: [
        ifThen(isIn('node', 'order'), [ret(bool(true))]),
        ifThen(isIn('node', 'visiting'), [ret(bool(false))]),
        mark('visiting', 'node'),
        forNeighbor('neighbor', graph(), 'node', [
          ifThen(
            not(callValue('visit', graph(), 'neighbor', 'visiting', 'order')),
            [ret(bool(false))]
          ),
        ]),
        setRemove('visiting', 'node'),
        emit('order', 'node'),
        ret(bool(true)),
      ],
    },
  ],
});

const kahn = program({
  variables: ['in_degree', 'node', 'neighbor', 'queue', 'order'],
  kind: 'graph',
  signature: 'kahn_algorithm(graph)',
  main: [
    set('in_degree', newDict()),
    forEach('node', graph(), [listSet('in_degree', 'node', 0)]),
    forEach('node', graph(), [
      forEach('neighbor', at(graph(), 'node'), [
        listSet(
          'in_degree',
          'neighbor',
          op(at('in_degree', 'neighbor'), '+', 1)
        ),
      ]),
    ]),
    set('queue', list()),
    forEach('node', graph(), [
      ifThen(cmp(at('in_degree', 'node'), '==', 0), [push('queue', 'node')]),
    ]),
    set('order', list()),
    whileNotEmpty('queue', [
      set('node', pop('queue')),
      emit('order', 'node'),
      forNeighbor('neighbor', graph(), 'node', [
        listSet(
          'in_degree',
          'neighbor',
          op(at('in_degree', 'neighbor'), '-', 1)
        ),
        ifThen(cmp(at('in_degree', 'neighbor'), '==', 0), [
          push('queue', 'neighbor'),
          sortList('queue'),
        ]),
      ]),
    ]),
    // Nodes left out are on a cycle: there is no topological order.
    ifThen(cmp(listLen('order'), '!=', listLen(graph())), [ret(none())]),
    ret('order'),
  ],
});

/** Union-find without ranks: `find` follows parent links to the root. */
const kruskal = program({
  variables: ['parent', 'node', 'selected', 'edge', 'a', 'b', 'x'],
  kind: 'graph',
  signature: 'kruskal_algorithm(nodes, edges)',
  main: [
    set('parent', newDict()),
    forEach('node', nodes(), [listSet('parent', 'node', 'node')]),
    set('selected', list()),
    forEdge('edge', sortByWeight(edges()), [
      set('a', callValue('find', 'parent', at('edge', 0))),
      set('b', callValue('find', 'parent', at('edge', 1))),
      ifThen(cmp('a', '!=', 'b'), [
        listSet('parent', 'a', 'b'),
        emit('selected', 'edge'),
      ]),
    ]),
    ret('selected'),
  ],
  helpers: [
    {
      signature: 'find(parent, x)',
      body: [
        whileLoop(cmp(at('parent', 'x'), '!=', 'x'), [
          set('x', at('parent', 'x')),
        ]),
        ret('x'),
      ],
    },
  ],
});

/** Grows one tree from the first node with a min-heap of crossing edges. */
const prim = program({
  variables: ['visited', 'frontier', 'selected', 'edge', 'node'],
  kind: 'graph',
  signature: 'prim_algorithm(nodes, edges)',
  main: [
    set('visited', newSet()),
    set('frontier', list()),
    set('selected', list()),
    mark('visited', at(nodes(), 0)),
    call('add_edges', edges(), at(nodes(), 0), 'visited', 'frontier'),
    whileNotEmpty('frontier', [
      set('edge', popMin('frontier')),
      ifThen(
        and(isIn(at('edge', 0), 'visited'), isIn(at('edge', 1), 'visited')),
        [cont()]
      ),
      set('node', at('edge', 0)),
      ifThen(isIn('node', 'visited'), [set('node', at('edge', 1))]),
      mark('visited', 'node'),
      emit('selected', 'edge'),
      call('add_edges', edges(), 'node', 'visited', 'frontier'),
    ]),
    ret('selected'),
  ],
  helpers: [
    {
      // Every edge from `node` to a node outside the tree joins the heap.
      signature: 'add_edges(edges, node, visited, frontier)',
      body: [
        forEach('edge', edges(), [
          ifThen(
            and(
              cmp(at('edge', 0), '==', 'node'),
              notIn(at('edge', 1), 'visited')
            ),
            [pushPriority('frontier', at('edge', 2), 'edge')]
          ),
          ifThen(
            and(
              cmp(at('edge', 1), '==', 'node'),
              notIn(at('edge', 0), 'visited')
            ),
            [pushPriority('frontier', at('edge', 2), 'edge')]
          ),
        ]),
      ],
    },
  ],
});

/** One DFS; `index[node] = len(index)` numbers nodes without a counter. */
const tarjan = program({
  variables: [
    'index',
    'low',
    'stack',
    'components',
    'node',
    'neighbor',
    'component',
    'member',
  ],
  kind: 'graph',
  signature: 'tarjan_algorithm(graph)',
  main: [
    set('index', newDict()),
    set('low', newDict()),
    set('stack', list()),
    set('components', list()),
    forEach('node', graph(), [
      ifThen(notIn('node', 'index'), [
        call('connect', graph(), 'node', 'index', 'low', 'stack', 'components'),
      ]),
    ]),
    ret('components'),
  ],
  helpers: [
    {
      signature: 'connect(graph, node, index, low, stack, components)',
      body: [
        listSet('index', 'node', listLen('index')),
        listSet('low', 'node', at('index', 'node')),
        push('stack', 'node'),
        forNeighbor('neighbor', graph(), 'node', [
          ifThen(
            notIn('neighbor', 'index'),
            [
              call(
                'connect',
                graph(),
                'neighbor',
                'index',
                'low',
                'stack',
                'components'
              ),
              listSet(
                'low',
                'node',
                min(at('low', 'node'), at('low', 'neighbor'))
              ),
            ],
            [
              ifThen(isIn('neighbor', 'stack'), [
                listSet(
                  'low',
                  'node',
                  min(at('low', 'node'), at('index', 'neighbor'))
                ),
              ]),
            ]
          ),
        ]),
        // A node whose low-link is its own index roots a component.
        ifThen(cmp(at('low', 'node'), '==', at('index', 'node')), [
          set('component', list()),
          whileLoop(bool(true), [
            set('member', popTop('stack')),
            append('component', 'member'),
            ifThen(cmp('member', '==', 'node'), [brk()]),
          ]),
          emit('components', 'component'),
        ]),
      ],
    },
  ],
});

/** Pass 1 records finish order; pass 2 runs DFS on the reversed edges. */
const kosaraju = program({
  variables: [
    'visited',
    'order',
    'node',
    'neighbor',
    'transpose',
    'assigned',
    'components',
    'component',
  ],
  kind: 'graph',
  signature: 'kosaraju_algorithm(graph)',
  main: [
    set('visited', newSet()),
    set('order', list()),
    forEach('node', graph(), [
      ifThen(notIn('node', 'visited'), [
        call('fill_order', graph(), 'node', 'visited', 'order'),
      ]),
    ]),
    set('transpose', newDict()),
    forEach('node', graph(), [listSet('transpose', 'node', list())]),
    forEach('node', graph(), [
      forEach('neighbor', at(graph(), 'node'), [
        append(at('transpose', 'neighbor'), 'node'),
      ]),
    ]),
    set('assigned', newSet()),
    set('components', list()),
    reverse('order'),
    forEach('node', 'order', [
      ifThen(notIn('node', 'assigned'), [
        set('component', list()),
        call('collect', 'transpose', 'node', 'assigned', 'component'),
        emit('components', 'component'),
      ]),
    ]),
    ret('components'),
  ],
  helpers: [
    {
      signature: 'fill_order(graph, node, visited, order)',
      body: [
        mark('visited', 'node'),
        forNeighbor('neighbor', graph(), 'node', [
          ifThen(notIn('neighbor', 'visited'), [
            call('fill_order', graph(), 'neighbor', 'visited', 'order'),
          ]),
        ]),
        emit('order', 'node'),
      ],
    },
    {
      signature: 'collect(transpose, node, assigned, component)',
      body: [
        mark('assigned', 'node'),
        append('component', 'node'),
        forNeighbor('neighbor', 'transpose', 'node', [
          ifThen(notIn('neighbor', 'assigned'), [
            call('collect', 'transpose', 'neighbor', 'assigned', 'component'),
          ]),
        ]),
      ],
    },
  ],
});

const floydWarshall = program({
  variables: ['n', 'index', 'i', 'j', 'k', 'dist', 'edge', 'a', 'b'],
  kind: 'graph',
  signature: 'floyd_warshall(nodes, edges)',
  main: [
    set('n', listLen(nodes())),
    set('index', newDict()),
    forRange('i', 0, 'n', [listSet('index', at(nodes(), 'i'), 'i')]),
    set('dist', matrix('n')),
    forRange('i', 0, 'n', [cellSet('dist', 'i', 'i', 0)]),
    forEach('edge', edges(), [
      set('a', at('index', at('edge', 0))),
      set('b', at('index', at('edge', 1))),
      ifThen(cmp(at('edge', 2), '<', cellGet('dist', 'a', 'b')), [
        cellSet('dist', 'a', 'b', at('edge', 2)),
      ]),
    ]),
    forRange('k', 0, 'n', [
      forRange('i', 0, 'n', [
        ifThen(cmp(cellGet('dist', 'i', 'k'), '!=', infinity()), [
          forRange('j', 0, 'n', [
            ifThen(cmp(cellGet('dist', 'k', 'j'), '!=', infinity()), [
              ifThen(
                cmp(
                  op(cellGet('dist', 'i', 'k'), '+', cellGet('dist', 'k', 'j')),
                  '<',
                  cellGet('dist', 'i', 'j')
                ),
                [
                  cellSet(
                    'dist',
                    'i',
                    'j',
                    op(
                      cellGet('dist', 'i', 'k'),
                      '+',
                      cellGet('dist', 'k', 'j')
                    )
                  ),
                ]
              ),
            ]),
          ]),
        ]),
      ]),
    ]),
    ret('dist'),
  ],
});

export const GRAPH_STARTERS = {
  depthFirstSearch: graphSearch({
    signature: 'dfs(graph, start, goal)',
    frontier: 'stack',
    take: popTop,
    reversed: true,
  }),
  breadthFirstSearchGraph: graphSearch({
    signature: 'bfs(graph, start, goal)',
    frontier: 'queue',
    take: pop,
    reversed: false,
  }),
  topologicalSort,
  kahnAlgorithm: kahn,
  kruskalAlgorithm: kruskal,
  primAlgorithm: prim,
  tarjanAlgorithm: tarjan,
  kosarajuAlgorithm: kosaraju,
  floydWarshallAlgorithm: floydWarshall,
};
