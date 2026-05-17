/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

export const ALGORITHM_TYPES = {
  SORTING: 'sorting',
  PATHFINDING: 'pathfinding',
  SEARCHING: 'searching',
  TREE_TRAVERSAL: 'treeTraversal',
  GRAPH_ALGORITHM: 'graphAlgorithm',
};

// Ordered list for UI tab rendering and registry iteration.
// Add new category values to ALGORITHM_TYPES; this list auto-updates.
export const ALGORITHM_TYPE_LIST = Object.values(ALGORITHM_TYPES);

/** Initial array ordering for sorting visualizations (ControlPanel toggle). */
export const SORT_ORDERS = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

export const SORTING_ALGORITHMS = {
  BUBBLE_SORT: 'bubbleSort',
  MERGE_SORT: 'mergeSort',
  QUICK_SORT: 'quickSort',
  INSERTION_SORT: 'insertionSort',
  SELECTION_SORT: 'selectionSort',
  HEAP_SORT: 'heapSort',
  SHELL_SORT: 'shellSort',
  RADIX_SORT: 'radixSort',
  COUNTING_SORT: 'countingSort',
  BUCKET_SORT: 'bucketSort',
  CYCLE_SORT: 'cycleSort',
  COMB_SORT: 'combSort',
  TIM_SORT: 'timSort',
  BOGO_SORT: 'bogoSort',
};

export const PATHFINDING_ALGORITHMS = {
  BFS: 'bfs',
  DIJKSTRA: 'dijkstra',
  A_STAR: 'aStar',
  BIDIRECTIONAL_SEARCH: 'bidirectionalSearch',
  GREEDY_BEST_FIRST_SEARCH: 'greedyBestFirstSearch',
  JUMP_POINT_SEARCH: 'jumpPointSearch',
  BELLMAN_FORD: 'bellmanFord',
  IDA_STAR: 'idaStar',
  D_STAR_LITE: 'dStarLite',
};

export const SEARCHING_ALGORITHMS = {
  LINEAR_SEARCH: 'linearSearch',
  BINARY_SEARCH: 'binarySearch',
  TERNARY_SEARCH: 'ternarySearch',
  JUMP_SEARCH: 'jumpSearch',
  INTERPOLATION_SEARCH: 'interpolationSearch',
  EXPONENTIAL_SEARCH: 'exponentialSearch',
  FIBONACCI_SEARCH: 'fibonacciSearch',
  DEPTH_FIRST_SEARCH: 'depthFirstSearch',
  BREADTH_FIRST_SEARCH_GRAPH: 'breadthFirstSearchGraph',
};

export const TREE_TRAVERSAL_ALGORITHMS = {
  INORDER_TRAVERSAL: 'inorderTraversal',
  PREORDER_TRAVERSAL: 'preorderTraversal',
  POSTORDER_TRAVERSAL: 'postorderTraversal',
  LEVEL_ORDER_TRAVERSAL: 'levelOrderTraversal',
  ZIGZAG_LEVEL_ORDER_TRAVERSAL: 'zigzagLevelOrderTraversal',
  MORRIS_TRAVERSAL: 'morrisTraversal',
};

export const GRAPH_ALGORITHMS = {
  TOPOLOGICAL_SORT: 'topologicalSort',
  KAHN_ALGORITHM: 'kahnAlgorithm',
  KRUSKAL_ALGORITHM: 'kruskalAlgorithm',
  PRIM_ALGORITHM: 'primAlgorithm',
};

export const ANIMATION_SPEEDS = {
  SLOW: 8000,
  MEDIUM: 4800,
  FAST: 2400,
  VERY_FAST: 1200,
};

export const ELEMENT_STATES = {
  DEFAULT: 'default',
  COMPARING: 'comparing',
  SWAPPING: 'swapping',
  SORTED: 'sorted',
  PIVOT: 'pivot',
  AUXILIARY: 'auxiliary',
};

export const STATE_COLORS = {
  [ELEMENT_STATES.DEFAULT]: '#3b82f6', // blue-500
  [ELEMENT_STATES.COMPARING]: '#fbbf24', // amber-400
  [ELEMENT_STATES.SWAPPING]: '#ef4444', // red-500
  [ELEMENT_STATES.SORTED]: '#10b981', // green-500
  [ELEMENT_STATES.PIVOT]: '#8b5cf6', // purple-500
  [ELEMENT_STATES.AUXILIARY]: '#6b7280', // gray-500
};

/** Search target ring + legend (orange-600 — distinct from COMPARING amber-400). */
export const SEARCH_TARGET_RING_COLOR = '#ea580c';
export const SEARCH_TARGET_RING_RGB = '234, 88, 12';

export const GRID_ELEMENT_STATES = {
  DEFAULT: 'default',
  OPEN: 'open',
  CLOSED: 'closed',
  PATH: 'path',
  START: 'start',
  END: 'end',
  WALL: 'wall',
};

export const GRID_STATE_COLORS = {
  [GRID_ELEMENT_STATES.DEFAULT]: '#e5e7eb', // gray-200
  [GRID_ELEMENT_STATES.OPEN]: '#fbbf24', // amber-400
  [GRID_ELEMENT_STATES.CLOSED]: '#60a5fa', // blue-400
  [GRID_ELEMENT_STATES.PATH]: '#10b981', // green-500
  [GRID_ELEMENT_STATES.START]: '#8b5cf6', // purple-500
  [GRID_ELEMENT_STATES.END]: '#ef4444', // red-500
  [GRID_ELEMENT_STATES.WALL]: '#374151', // gray-700
};

/** Node–link graph searching (DFS / future BFS on explicit graphs). */
export const GRAPH_NODE_STATES = {
  DEFAULT: 'default',
  ROOT: 'root',
  GOAL: 'goal',
  FRONTIER: 'frontier',
  CURRENT: 'current',
  VISITED: 'visited',
  PATH: 'path',
  CYCLE: 'cycle',
};

export const GRAPH_NODE_STATE_COLORS = {
  [GRAPH_NODE_STATES.DEFAULT]: '#e5e7eb',
  [GRAPH_NODE_STATES.ROOT]: '#8b5cf6',
  [GRAPH_NODE_STATES.GOAL]: '#ef4444',
  [GRAPH_NODE_STATES.FRONTIER]: '#fbbf24',
  [GRAPH_NODE_STATES.CURRENT]: '#f97316',
  [GRAPH_NODE_STATES.VISITED]: '#60a5fa',
  [GRAPH_NODE_STATES.PATH]: '#10b981',
  [GRAPH_NODE_STATES.CYCLE]: '#ef4444',
};

export const GRAPH_EDGE_STATES = {
  DEFAULT: 'default',
  ACTIVE: 'active',
  VISITED: 'visited',
  SELECTED: 'selected',
  CYCLE: 'cycle',
};

export const GRAPH_EDGE_STATE_COLORS = {
  [GRAPH_EDGE_STATES.DEFAULT]: '#9ca3af',
  [GRAPH_EDGE_STATES.ACTIVE]: '#f97316',
  [GRAPH_EDGE_STATES.VISITED]: '#60a5fa',
  [GRAPH_EDGE_STATES.SELECTED]: '#10b981',
  [GRAPH_EDGE_STATES.CYCLE]: '#ef4444',
};

/** Tree traversal visualization (inorder / future traversals). */
export const TREE_NODE_STATES = {
  DEFAULT: 'default',
  VISITING: 'visiting',
  VISITED: 'visited',
};

export const TREE_NODE_STATE_COLORS = {
  [TREE_NODE_STATES.DEFAULT]: '#e5e7eb',
  [TREE_NODE_STATES.VISITING]: '#f97316',
  [TREE_NODE_STATES.VISITED]: '#10b981',
};

/** Default node count for tree traversal (SettingsPanel slider). */
export const DEFAULT_TREE_NODE_COUNT = 15;

export const TREE_NODE_COUNT = {
  min: 3,
  max: 31,
  step: 1,
};

/** Default node count for searching graph algorithms (SettingsPanel slider). */
export const DEFAULT_SEARCH_GRAPH_NODE_COUNT = 12;

export const SEARCH_GRAPH_NODE_COUNT = {
  min: 5,
  max: 24,
  step: 1,
};

export const DEFAULT_GRAPH_NODE_COUNT = 10;

export const GRAPH_NODE_COUNT = {
  min: 3,
  max: 18,
  step: 1,
};

export const VISUALIZATION_MODES = {
  AUTOPLAY: 'autoplay',
  MANUAL: 'manual',
};

export const ALGORITHM_COMPLEXITY = {
  bubbleSort: {
    name: 'Bubble Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
  },
  quickSort: {
    name: 'Quick Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(log n)',
  },
  mergeSort: {
    name: 'Merge Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
  },
  selectionSort: {
    name: 'Selection Sort',
    timeComplexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Selection Sort divides the array into sorted and unsorted regions. It repeatedly finds the minimum element from the unsorted region and swaps it with the first unsorted element.',
    useCases: [
      'Small datasets where simplicity is preferred',
      'When memory write operations are costly (fewer swaps than bubble sort)',
      'Educational purposes to understand sorting fundamentals',
    ],
  },
  insertionSort: {
    name: 'Insertion Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Insertion Sort builds the final sorted array one item at a time. It iterates through the array, removing one element per iteration, finding the location it belongs within the sorted list, and inserting it there.',
    useCases: [
      'Small datasets or nearly sorted arrays',
      'Online algorithms where data arrives sequentially',
      'When simplicity and adaptive behavior are important',
      'Efficient for arrays with few elements out of place',
    ],
  },
  heapSort: {
    name: 'Heap Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure. It divides its input into a sorted and an unsorted region, and iteratively shrinks the unsorted region by extracting the largest element from the heap and inserting it into the sorted region.',
    useCases: [
      'When consistent O(n log n) performance is required',
      'Systems with limited memory (in-place sorting)',
      'Priority queue implementations',
      'When worst-case performance guarantees are needed',
    ],
  },
  shellSort: {
    name: 'Shell Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n^(3/2))',
      worst: 'O(n^(3/2))',
    },
    spaceComplexity: 'O(1)',
    description:
      "Shell Sort is an optimization of Insertion Sort that allows the exchange of items that are far apart. This implementation uses Knuth's gap sequence (1, 4, 13, 40, 121...), which provides significantly better performance than the original Shell sequence.",
    useCases: [
      'Medium-sized datasets where O(n log n) is preferred but O(n²) is acceptable',
      'When a simple, in-place sorting algorithm is needed',
      'Better than insertion sort for larger datasets',
      'Good for embedded systems with limited memory',
      'Educational purposes to understand gap-based sorting strategies',
    ],
  },
  radixSort: {
    name: 'Radix Sort',
    timeComplexity: {
      best: 'O(nk)',
      average: 'O(nk)',
      worst: 'O(nk)',
    },
    spaceComplexity: 'O(n + k)',
    description:
      'Radix Sort is a non-comparative sorting algorithm that sorts integers by processing individual digits. It distributes numbers into buckets based on their radix (base) and then collects them, repeating for each digit position.',
    useCases: [
      'Sorting integers or fixed-length strings',
      'When the range of values (k) is not significantly larger than n',
      'When comparison operations are expensive',
      'Stable sorting requirements',
    ],
  },
  countingSort: {
    name: 'Counting Sort',
    timeComplexity: {
      best: 'O(n + k)',
      average: 'O(n + k)',
      worst: 'O(n + k)',
    },
    spaceComplexity: 'O(n + k)',
    description:
      'Counting Sort is a non-comparison sorting algorithm that works by counting the number of objects having distinct key values, then doing arithmetic to calculate the position of each object in the output sequence. It works only with non-negative integers.',
    useCases: [
      'Small range of integers (k is small relative to n)',
      'When input values are non-negative integers',
      'Stable sorting is required',
      'Sorting characters or small integers',
      'When O(n) time complexity is critical',
    ],
  },
  bucketSort: {
    name: 'Bucket Sort',
    timeComplexity: {
      best: 'O(n + k)',
      average: 'O(n + k)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(n + k)',
    description:
      'Bucket Sort distributes elements into buckets based on their value range, sorts each bucket individually (typically with insertion sort), then concatenates the sorted buckets. Performance depends heavily on the input distribution.',
    useCases: [
      'Uniformly distributed data over a known range',
      'Floating-point numbers in [0, 1)',
      'When input is distributed across different ranges',
      'External sorting with limited memory',
    ],
  },
  cycleSort: {
    name: 'Cycle Sort',
    timeComplexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Cycle Sort minimizes the number of memory writes by placing each element directly into its final sorted position. It performs at most n-1 writes, making it optimal for situations where write operations are expensive.',
    useCases: [
      'Flash memory or EEPROM where writes are costly',
      'Write-expensive storage systems',
      'Embedded systems with limited write cycles',
      'Educational demonstrations of write optimization',
    ],
  },
  combSort: {
    name: 'Comb Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n²/2^p)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Comb Sort improves on Bubble Sort by comparing elements separated by a shrinking gap. The gap shrinks by a factor of 1.3 each iteration until it reaches 1, helping eliminate small values near the end of the array faster than Bubble Sort.',
    useCases: [
      'Better alternative to Bubble Sort for medium datasets',
      'When in-place sorting with simple implementation is needed',
      'Educational purposes to understand gap-based sorting',
      'Situations where O(n log n) average case is acceptable',
    ],
  },
  timSort: {
    name: 'Tim Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
    description:
      'Tim Sort is a hybrid stable sorting algorithm derived from merge sort and insertion sort. It is the default sorting algorithm in Python, Java, Swift, and Android. It works by detecting natural runs in the data, extending small runs using insertion sort, and merging runs efficiently.',
    useCases: [
      'Production systems requiring stable, efficient sorting',
      'Real-world data with partially sorted sequences',
      'When stability is required (preserves order of equal elements)',
      'Default choice for general-purpose sorting in modern languages',
    ],
  },
  bogoSort: {
    name: 'Bogo Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n × n!)',
      worst: 'Unbounded',
    },
    spaceComplexity: 'O(1)',
    description:
      'Bogo Sort (also known as Permutation Sort or Stupid Sort) repeatedly randomly shuffles the array until it happens to be sorted. It is intentionally inefficient and mainly used for educational purposes to demonstrate the importance of algorithm analysis.',
    useCases: [
      'Educational demonstrations of inefficient algorithms',
      'Humor and algorithm complexity awareness',
      'Showing the importance of algorithmic thinking',
      'Never use in production',
    ],
  },
};

export const SEARCHING_COMPLEXITY = {
  linearSearch: {
    name: 'Linear Search',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Linear search checks each element in order until the target is found or the end is reached. It does not require a sorted array. Bayan Flow still uses sorted random arrays in Searching mode so you can compare it fairly with binary and other ordered searches.',
    useCases: [
      'Small or unsorted collections where sorting first is not worth the cost',
      'Teaching baseline comparison counts before introducing binary search',
      'Linked structures where random index access is expensive or unavailable',
    ],
  },
  binarySearch: {
    name: 'Binary Search',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Binary search repeatedly halves a sorted range by comparing the middle element to the target. Requires a sorted array.',
    useCases: [
      'Large sorted arrays or lists',
      'Lookup tables and ordered collections',
      'Algorithm building blocks (e.g. bounds, bisection)',
    ],
  },
  ternarySearch: {
    name: 'Ternary Search',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Ternary search splits the current sorted range into three parts using two probe indices (roughly at one-third and two-thirds). It compares the target with both probes each iteration, then discards at least one third of the range. Asymptotic time is still O(log n) like binary search, but each step performs two comparisons.',
    useCases: [
      'Teaching how multiple probes partition the search space',
      'Contrasting two-pivot splits with binary search’s single midpoint',
      'Building intuition before unimodal optimization variants of ternary search',
    ],
  },
  jumpSearch: {
    name: 'Jump Search',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(√n)',
      worst: 'O(√n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Jump search advances in blocks of about √n on a sorted array, then scans linearly within the last block. Requires a sorted array.',
    useCases: [
      'Large sorted arrays when block-style jumps are easier to reason about than halving',
      'Teaching trade-offs between √n jumps and O(log n) binary search',
      'Complement to binary search for ordered static data',
    ],
  },
  interpolationSearch: {
    name: 'Interpolation Search',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log log n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Interpolation search estimates the next index from the target and the values at the current bounds (not the midpoint). Average time is very good on uniformly distributed keys; worst case can be linear on skewed or duplicate-heavy data. Requires a sorted array.',
    useCases: [
      'Large sorted tables with roughly uniform key spacing (e.g. indexed ranges)',
      'Contrasting value-based probes with binary search’s midpoint',
      'Teaching how input distribution affects search cost',
    ],
  },
  exponentialSearch: {
    name: 'Exponential Search',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Exponential search doubles an index until the target is bracketed (or the end of the array), then runs binary search on that range. On unbounded sorted data the search cost is O(log i) where i is the target’s index; on a finite array of length n the worst case is O(log n). Requires a sorted array.',
    useCases: [
      'Unbounded or very large sorted sequences where the target position is unknown',
      'Contrasting geometric bracketing with fixed-step jump search',
      'Teaching how exponential probing pairs with binary refinement',
    ],
  },
  fibonacciSearch: {
    name: 'Fibonacci Search',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    description:
      'Fibonacci search narrows a sorted range using Fibonacci-number step sizes: the next index is offset plus the second-smallest Fibonacci in the triple (no division). Each comparison shrinks the window by a golden-ratio–related factor, giving O(log n) comparisons in the worst case.',
    useCases: [
      'Contrasting division-free probing with binary search’s midpoint',
      'Teaching how Fibonacci structure defines probe positions on sorted arrays',
      'Historical contexts where avoiding division mattered for performance',
    ],
  },
  depthFirstSearch: {
    name: 'Depth-First Search (graph)',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    description:
      'Depth-first search explores as far as possible along one branch before backtracking, using an explicit stack on a node–link graph (V nodes, E edges). It finds a path to a goal if one exists but does not guarantee the shortest path — contrast with breadth-first search in Pathfinding. Neighbor order follows the adjacency lists (stable numeric order on generated trees).',
    useCases: [
      'Teaching stack-based graph traversal before queue-based BFS',
      'Trees and general graphs as explicit vertices and edges',
      'Backtracking patterns before introducing weighted graphs',
    ],
  },
  breadthFirstSearchGraph: {
    name: 'Breadth-First Search (graph)',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    description:
      'Breadth-first search explores a graph level by level. On unweighted graphs it guarantees the shortest path — the key distinction from DFS in this same Searching category.',
    useCases: [
      'Shortest-path on unweighted graphs',
      'Level-order tree traversal and layer-by-layer graph analysis',
      'Contrasting with DFS: same graph, queue vs. stack, shortest vs. any path',
    ],
  },
};

export const TREE_TRAVERSAL_COMPLEXITY = {
  inorderTraversal: {
    name: 'Inorder Traversal',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(h)',
    description:
      'Inorder traversal visits the left subtree, then the node, then the right subtree (LNR). On a binary search tree this visits keys in sorted order. This implementation uses an explicit stack—space is proportional to tree height.',
    useCases: [
      'BST in-sorted-order output',
      'Expression trees (recreate infix notation)',
      'Teaching left–root–right before preorder and postorder',
    ],
  },
  preorderTraversal: {
    name: 'Preorder Traversal',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(h)',
    description:
      'Preorder traversal visits the node, then the left subtree, then the right subtree (NLR). Useful for copying a tree, prefix (Polish) expression evaluation, and serialization. This visualization uses an explicit stack—space is proportional to tree height.',
    useCases: [
      'Tree duplication and serialization',
      'Prefix (Polish) notation from expression trees',
      'Reconstruction with inorder when both traversals are known',
      'Teaching parent-before-children depth-first order',
    ],
  },
  postorderTraversal: {
    name: 'Postorder Traversal',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(h)',
    description:
      'Postorder traversal visits the left subtree, then the right subtree, then the node (LRN). It is ideal for bottom-up operations such as tree deletion, dependency resolution, and postfix expression evaluation.',
    useCases: [
      'Deleting a tree safely (children before parent)',
      'Evaluating postfix (Reverse Polish) expression trees',
      'Computing tree aggregates bottom-up (height, size, checksums)',
      'Dependency-style processing where prerequisites must finish first',
    ],
  },
  levelOrderTraversal: {
    name: 'Level-order Traversal',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(w)',
    description:
      'Level-order traversal visits the tree breadth-first: root first, then every node on depth 1, then depth 2, and so on. It uses a queue, so its auxiliary space depends on the maximum number of nodes stored from one level at a time.',
    useCases: [
      'Tree serialization and reconstruction formats',
      'Printing or analyzing a tree level by level',
      'Finding the nearest node that satisfies a property',
      'Teaching queue-based breadth-first traversal vs. stack-based DFS',
    ],
  },
  zigzagLevelOrderTraversal: {
    name: 'Zigzag Level-order Traversal',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(w)',
    description:
      'Zigzag (spiral) level-order traversal visits the tree breadth-first like level-order, but alternates scanning direction each depth: typically left-to-right on even levels and right-to-left on odd levels. Auxiliary space grows with the maximum width of one level.',
    useCases: [
      'Interview-style breadth-first variants and serialization puzzles',
      'Pretty-printing or exporting trees with alternating row direction',
      'Contrasting plain level-order with a simple directional state machine',
      'Teaching BFS level batching with reversed visit order on every other level',
    ],
  },
  morrisTraversal: {
    name: 'Morris Traversal',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(1)',
    description:
      "Morris traversal produces the same visit order as inorder (LNR) but uses only O(1) extra space. It temporarily redirects a predecessor's null right child into a back-link (a thread) to the current node, then restores the tree—no explicit stack or recursion.",
    useCases: [
      'Interview problems on space-bounded tree walks',
      'Memory-constrained embedded or stream processing over trees',
      'Teaching pointer threading and in-place tree tricks',
      'Contrasting O(h) stack inorder with constant auxiliary space',
    ],
  },
};

export const GRAPH_ALGORITHM_COMPLEXITY = {
  topologicalSort: {
    name: 'Topological Sort (DFS)',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    description:
      'DFS-based topological sort orders vertices in a directed acyclic graph so every dependency edge u -> v places u before v. It uses temporary marks to detect cycles and a completion stack to build the final order.',
    useCases: [
      'Task scheduling with prerequisites',
      'Build systems and dependency resolution',
      'Course prerequisite ordering',
      'Instruction scheduling and dependency graphs',
    ],
  },
  kahnAlgorithm: {
    name: "Kahn's Algorithm",
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    description:
      "Kahn's algorithm builds a topological order by repeatedly removing vertices whose in-degree is zero. It is iterative, queue-based, and detects cycles when the queue empties before every vertex is output.",
    useCases: [
      'Dependency resolution with explicit cycle detection',
      'Task scheduling and prerequisite planning',
      'Build graph validation',
      'Teaching in-degree based reasoning on DAGs',
    ],
  },
  kruskalAlgorithm: {
    name: "Kruskal's Algorithm",
    timeComplexity: {
      best: 'O(E log E)',
      average: 'O(E log E)',
      worst: 'O(E log E)',
    },
    spaceComplexity: 'O(V)',
    description:
      "Kruskal's algorithm sorts weighted edges from lightest to heaviest, then adds each edge only if it connects two different components. A Union-Find structure keeps the selected edges cycle-free while still producing an optimal minimum spanning tree or forest.",
    useCases: [
      'Network design with minimum total cable cost',
      'Clustering and image segmentation',
      'Teaching greedy algorithms with Union-Find',
      'Building minimum spanning forests on disconnected graphs',
    ],
  },
  primAlgorithm: {
    name: "Prim's Algorithm",
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
    },
    spaceComplexity: 'O(V)',
    description:
      "Prim's algorithm grows a minimum spanning tree from a chosen start vertex. At each step it adds the lightest edge that connects the current tree to an unvisited vertex.",
    useCases: [
      'Minimum-cost network expansion from a seed node',
      'Dense-graph MST teaching and comparison with Kruskal',
      'Incrementally growing a spanning backbone',
      'Demonstrating greedy frontier expansion on weighted graphs',
    ],
  },
};

export const COMPLEXITY_FUNCTIONS = {
  // eslint-disable-next-line no-unused-vars
  'O(1)': n => 1,
  'O(log n)': n => Math.log2(n),
  'O(log log n)': n => Math.max(0, Math.log2(Math.max(2, Math.log2(n)))),
  'O(√n)': n => Math.sqrt(n),
  'O(n)': n => n,
  'O(n log n)': n => n * Math.log2(n),
  'O(n^1.25)': n => Math.pow(n, 1.25),
  'O(n^(3/2))': n => Math.pow(n, 1.5),
  'O(n²)': n => n * n,
  'O(n³)': n => n * n * n,
  'O(2^n)': n => Math.pow(2, n),
  'O(V + E)': n => n + n * 4, // Approximation: V vertices + E edges (grid has ~4 edges per vertex)
  'O((V + E) log V)': n => (n + n * 4) * Math.log2(n),
  'O(E log E)': n => n * 4 * Math.log2(Math.max(2, n * 4)),
  'O(E)': n => n * 4, // Approximation for grid edges
  'O(VE)': n => n * n * 4, // Approximation: V vertices × E edges per vertex (~4)
  'O(b^d)': n => Math.pow(4, Math.log2(n)), // Approximation: branching factor 4, depth log(n)
  'O(nk)': n => n * Math.log10(n), // Approximation: k ≈ log10(n) for distinct numbers
  'O(d)': n => Math.log2(n), // Approximation: d is depth, often log(n) in balanced trees/grids
  'O(n + k)': n => n + Math.log2(n) * 10, // Approximation: n + k where k ≈ log(n) * 10
};

export const DEFAULT_ARRAY_SIZE = 20;

// Grid size presets for pathfinding
export const GRID_SIZES = {
  SMALL: 15,
  MEDIUM: 25,
  LARGE: 35,
};

export const DEFAULT_GRID_SIZE = GRID_SIZES.SMALL;

// Pathfinding algorithm complexity metadata
export const PATHFINDING_COMPLEXITY = {
  bfs: {
    name: 'Breadth-First Search',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    description:
      'BFS explores all neighbor nodes at the present depth before moving to nodes at the next depth level. Guarantees shortest path in unweighted graphs.',
    useCases: [
      'Finding shortest path in unweighted graphs',
      'Level-order traversal in trees',
      'Finding connected components',
      'Testing graph bipartiteness',
    ],
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
    },
    spaceComplexity: 'O(V)',
    description:
      "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph. It uses a priority queue to always explore the most promising node.",
    useCases: [
      'GPS navigation and route planning',
      'Network routing protocols',
      'Finding shortest paths in weighted graphs',
      'Resource allocation optimization',
    ],
  },
  aStar: {
    name: 'A* Search',
    timeComplexity: {
      best: 'O(E)',
      average: 'O(b^d)',
      worst: 'O(b^d)',
    },
    spaceComplexity: 'O(b^d)',
    description:
      "A* is an informed search algorithm that uses heuristics to guide its search. It combines the benefits of Dijkstra's algorithm and greedy best-first search.",
    useCases: [
      'Video game pathfinding',
      'Robot navigation',
      'Map-based applications',
      'Puzzle solving (e.g., 8-puzzle)',
    ],
  },
  bidirectionalSearch: {
    name: 'Bidirectional Search',
    timeComplexity: {
      best: 'O(b^(d/2))',
      average: 'O(b^(d/2))',
      worst: 'O(b^(d/2))',
    },
    spaceComplexity: 'O(b^(d/2))',
    description:
      'Bidirectional search runs two simultaneous BFS searches from both start and end points. When the searches meet, the shortest path is found. Significantly reduces search space compared to single-direction search.',
    useCases: [
      'Shortest path in large unweighted graphs',
      'Route planning with known start and end',
      'Network routing optimization',
      'Game AI pathfinding in large maps',
    ],
  },
  greedyBestFirstSearch: {
    name: 'Greedy Best-First Search',
    timeComplexity: {
      best: 'O(b^d)',
      average: 'O(b^d)',
      worst: 'O(b^d)',
    },
    spaceComplexity: 'O(b^d)',
    description:
      "Greedy Best-First Search uses heuristics to guide its search towards the goal. Unlike A*, it only considers the heuristic distance h(n) and ignores the path cost g(n). This makes it faster but doesn't guarantee the shortest path.",
    useCases: [
      'When speed is more important than optimality',
      'Real-time pathfinding where quick decisions matter',
      'Navigation in large spaces with clear goals',
      'Game AI for simple pathfinding needs',
    ],
  },
  jumpPointSearch: {
    name: 'Jump Point Search',
    timeComplexity: {
      best: 'O(E)',
      average: 'O(E)',
      worst: 'O(E)',
    },
    spaceComplexity: 'O(V)',
    description:
      "Jump Point Search optimizes A* by eliminating symmetric paths on uniform-cost grids. It only explores 'jump points' - nodes that could improve the path, dramatically reducing the search space compared to A*.",
    useCases: [
      'Game AI pathfinding (RTS, strategy games)',
      'Robotic navigation in grid environments',
      'Large-scale pathfinding with many agents',
      'Real-time pathfinding where speed matters',
    ],
  },
  bellmanFord: {
    name: 'Bellman-Ford Algorithm',
    timeComplexity: {
      best: 'O(VE)',
      average: 'O(VE)',
      worst: 'O(VE)',
    },
    spaceComplexity: 'O(V)',
    description:
      'Single-source shortest path algorithm using iterative relaxation. Can handle negative edge weights and detect negative cycles. Runs V-1 iterations, relaxing all edges in each iteration.',
    useCases: [
      'Graphs with negative edge weights',
      'Detecting negative cycles',
      'When you need to find shortest paths from a single source',
      'Educational purposes to understand dynamic programming approach',
    ],
  },
  idaStar: {
    name: 'Iterative Deepening A* (IDA*)',
    timeComplexity: {
      best: 'O(b^d)',
      average: 'O(b^d)',
      worst: 'O(b^d)',
    },
    spaceComplexity: 'O(d)',
    description:
      'IDA* is a depth-first search that uses the same heuristic function as A*. It performs a series of depth-first searches, effectively increasing the search depth (threshold) in each iteration. It uses less memory than A* but may visit the same nodes multiple times.',
    useCases: [
      'When memory is limited (uses linear space unlike A*)',
      'Tree search problems',
      'When path cost is uniform',
      'Solving puzzles like 15-puzzle',
    ],
  },
  dStarLite: {
    name: 'D* Lite',
    timeComplexity: {
      best: 'O(1)', // Incremental update
      average: 'O(log V)', // Priority Queue ops
      worst: 'O(b^d)', // Initial search same as A*
    },
    spaceComplexity: 'O(V)',
    description:
      'D* Lite is an incremental heuristic search algorithm. It is an optimized version of A* that efficiently updates the shortest path when the graph changes (e.g. dynamic obstacles). It maintains path consistency and re-plans only necessary parts.',
    useCases: [
      'Dynamic environments (moving robots)',
      'Unknown terrain exploration',
      'Real-time path re-planning',
      'Planetary rovers (e.g. Mars rovers)',
    ],
  },
};
