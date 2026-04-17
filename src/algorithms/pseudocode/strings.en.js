/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * English pseudocode (source of truth for structure).
 * French and Arabic are derived in localize.js (see strings.fr.js / strings.ar.js).
 */
export const pseudocodeStringsEn = {
  bubbleSort: `FUNCTION BubbleSort(array):
  n ← length of array
  REPEAT n − 1 times:
    FOR i FROM 0 TO n − 2:
      IF array[i] > array[i + 1]:
        SWAP array[i] AND array[i + 1]
  RETURN array`,

  quickSort: `FUNCTION QuickSort(array, low, high):
  IF low < high:
    pivotIndex ← PARTITION(array, low, high)
    QuickSort(array, low, pivotIndex − 1)
    QuickSort(array, pivotIndex + 1, high)
  RETURN array

FUNCTION Partition(array, low, high):
  pivot ← array[high]
  i ← low − 1
  FOR j FROM low TO high − 1:
    IF array[j] ≤ pivot:
      i ← i + 1
      SWAP array[i] AND array[j]
  SWAP array[i + 1] AND array[high]
  RETURN i + 1`,

  mergeSort: `FUNCTION MergeSort(array):
  IF length of array ≤ 1:
    RETURN array
  mid ← floor(length of array ÷ 2)
  left ← MergeSort(first mid elements of array)
  right ← MergeSort(remaining elements of array)
  RETURN Merge(left, right)

FUNCTION Merge(left, right):
  result ← empty list
  WHILE left and right are not empty:
    IF first of left ≤ first of right:
      append first of left to result and advance left
    ELSE:
      append first of right to result and advance right
  append any leftover elements from left and right
  RETURN result`,

  selectionSort: `FUNCTION SelectionSort(array):
  n ← length of array
  FOR i FROM 0 TO n − 2:
    minIndex ← i
    FOR j FROM i + 1 TO n − 1:
      IF array[j] < array[minIndex]:
        minIndex ← j
    IF minIndex ≠ i:
      SWAP array[i] AND array[minIndex]
  RETURN array`,

  insertionSort: `FUNCTION InsertionSort(array):
  FOR i FROM 1 TO length of array − 1:
    key ← array[i]
    j ← i − 1
    WHILE j ≥ 0 AND array[j] > key:
      array[j + 1] ← array[j]
      j ← j − 1
    array[j + 1] ← key
  RETURN array`,

  heapSort: `FUNCTION HeapSort(array):
  n ← length of array
  FOR i FROM floor(n ÷ 2) − 1 DOWNTO 0:
    Heapify(array, n, i)
  FOR end FROM n − 1 DOWNTO 1:
    SWAP array[0] AND array[end]
    Heapify(array, end, 0)
  RETURN array

FUNCTION Heapify(array, heapSize, rootIndex):
  largest ← rootIndex
  left ← 2 × rootIndex + 1
  right ← 2 × rootIndex + 2
  IF left < heapSize AND array[left] > array[largest]:
    largest ← left
  IF right < heapSize AND array[right] > array[largest]:
    largest ← right
  IF largest ≠ rootIndex:
    SWAP array[rootIndex] AND array[largest]
    Heapify(array, heapSize, largest)`,

  shellSort: `FUNCTION ShellSort(array):
  n ← length of array
  gap ← floor(n ÷ 2)
  WHILE gap > 0:
    FOR i FROM gap TO n − 1:
      temp ← array[i]
      j ← i
      WHILE j ≥ gap AND array[j − gap] > temp:
        array[j] ← array[j − gap]
        j ← j − gap
      array[j] ← temp
    gap ← floor(gap ÷ 2)
  RETURN array`,

  radixSort: `FUNCTION RadixSort(array):
  maxValue ← maximum value in array
  digitPlace ← 1
  WHILE maxValue ÷ digitPlace > 0:
    CountingSortByDigit(array, digitPlace)
    digitPlace ← digitPlace × 10
  RETURN array

FUNCTION CountingSortByDigit(array, digitPlace):
  buckets ← 10 empty lists (digits 0–9)
  FOR each value in array:
    digit ← floor(value ÷ digitPlace) mod 10
    append value to buckets[digit]
  rewrite array in order from buckets 0 through 9`,

  countingSort: `FUNCTION CountingSort(array, maxValue):
  counts ← array of length maxValue + 1 filled with zeros
  FOR each x in array:
    counts[x] ← counts[x] + 1
  index ← 0
  FOR v FROM 0 TO maxValue:
    WHILE counts[v] > 0:
      array[index] ← v
      index ← index + 1
      counts[v] ← counts[v] − 1
  RETURN array`,

  bucketSort: `FUNCTION BucketSort(array, bucketCount):
  buckets ← bucketCount empty lists
  minValue ← minimum of array
  maxValue ← maximum of array
  range ← maxValue − minValue
  FOR each x in array:
    bucketIndex ← floor((x − minValue) ÷ range × (bucketCount − 1))
    append x to buckets[bucketIndex]
  FOR each bucket:
    sort bucket with a simple sort
  concatenate buckets in order into array
  RETURN array`,

  cycleSort: `FUNCTION CycleSort(array):
  FOR cycleStart FROM 0 TO length of array − 2:
    item ← array[cycleStart]
    pos ← cycleStart
    FOR i FROM cycleStart + 1 TO length of array − 1:
      IF array[i] < item:
        pos ← pos + 1
    WHILE pos ≠ cycleStart AND array[pos] = item:
      pos ← pos + 1
    IF pos = cycleStart:
      CONTINUE
    SWAP item AND array[pos]
    WHILE pos ≠ cycleStart:
      pos ← cycleStart
      FOR i FROM cycleStart + 1 TO length of array − 1:
        IF array[i] < item:
          pos ← pos + 1
      WHILE pos ≠ cycleStart AND array[pos] = item:
        pos ← pos + 1
      SWAP item AND array[pos]
  RETURN array`,

  combSort: `FUNCTION CombSort(array):
  n ← length of array
  gap ← n
  shrink ← 1.3
  sorted ← false
  WHILE gap > 1 OR sorted = false:
    gap ← max(1, floor(gap ÷ shrink))
    sorted ← true
    FOR i FROM 0 TO n − gap − 1:
      IF array[i] > array[i + gap]:
        SWAP array[i] AND array[i + gap]
        sorted ← false
  RETURN array`,

  timSort: `FUNCTION TimSort(array):
  minRun ← compute minimum run length from length of array
  split array into consecutive runs of at least minRun elements (natural runs if already ordered)
  sort each short run with insertion sort
  WHILE there is more than one run:
    merge adjacent runs pairwise in stable order using merge from merge sort
  RETURN array`,

  bogoSort: `FUNCTION BogoSort(array):
  WHILE array is not sorted:
    randomly shuffle all elements of array
  RETURN array`,

  bfs: `FUNCTION BreadthFirstSearch(grid, start, goal):
  queue ← empty queue
  enqueue start
  mark start as visited
  WHILE queue is not empty:
    current ← dequeue front
    IF current = goal:
      RETURN path reconstructed from parent pointers
    FOR each neighbor of current that is inside grid and walkable and not visited:
      mark neighbor as visited
      record parent of neighbor as current
      enqueue neighbor
  RETURN no path`,

  dijkstra: `FUNCTION Dijkstra(grid, start, goal):
  distance[start] ← 0
  priority queue ← all nodes with tentative distance infinity except start
  WHILE priority queue is not empty:
    current ← node in queue with smallest distance
    remove current from queue
    IF current = goal:
      RETURN shortest path from parent pointers
    FOR each neighbor of current with edge weight w:
      alt ← distance[current] + w
      IF alt < distance[neighbor]:
        distance[neighbor] ← alt
        parent[neighbor] ← current
        update neighbor position in priority queue
  RETURN no path`,

  aStar: `FUNCTION AStar(grid, start, goal, heuristic):
  openSet ← priority queue ordered by f = g + h
  g[start] ← 0
  h[start] ← heuristic(start, goal)
  enqueue start into openSet
  WHILE openSet is not empty:
    current ← node in openSet with smallest f
    IF current = goal:
      RETURN path from parent pointers
    remove current from openSet
    FOR each neighbor of current:
      tentativeG ← g[current] + step cost from current to neighbor
      IF tentativeG < g[neighbor]:
        parent[neighbor] ← current
        g[neighbor] ← tentativeG
        h[neighbor] ← heuristic(neighbor, goal)
        add or update neighbor in openSet
  RETURN no path`,

  bidirectionalSearch: `FUNCTION BidirectionalSearch(grid, start, goal):
  frontierFromStart ← queue containing start
  frontierFromGoal ← queue containing goal
  visitedFromStart ← { start }
  visitedFromGoal ← { goal }
  parents from start and from goal tables initialized
  WHILE both frontiers are not empty:
    expand one step from the smaller frontier
    IF any node appears in both visited sets:
      RETURN path by joining parent chains from meeting point
  RETURN no path`,

  greedyBestFirstSearch: `FUNCTION GreedyBestFirstSearch(grid, start, goal, heuristic):
  openSet ← priority queue ordered by h only (estimated cost to goal)
  enqueue start
  WHILE openSet is not empty:
    current ← dequeue smallest h
    IF current = goal:
      RETURN path from parent pointers
    FOR each unvisited neighbor of current:
      parent[neighbor] ← current
      enqueue neighbor with priority heuristic(neighbor, goal)
  RETURN no path`,

  jumpPointSearch: `FUNCTION JumpPointSearch(grid, start, goal, heuristic):
  openSet ← priority queue of jump points by f = g + h
  add start as a jump point
  WHILE openSet is not empty:
    current ← best jump point
    IF current can see goal along straight or diagonal line without obstacles:
      RETURN path via jump points and parents
    FOR each direction from current:
      jump ← JUMP in that direction until wall or forced neighbor or goal
      IF jump is valid:
        record parent and enqueue jump point with updated g and h
  RETURN no path`,

  bellmanFord: `FUNCTION BellmanFord(graph, source):
  distance[all nodes] ← infinity
  distance[source] ← 0
  REPEAT (number of nodes − 1) times:
    FOR each edge (u, v) with weight w:
      IF distance[u] + w < distance[v]:
        distance[v] ← distance[u] + w
        parent[v] ← u
  FOR each edge (u, v) with weight w:
    IF distance[u] + w < distance[v]:
      REPORT negative cycle
  RETURN shortest path tree from parent pointers`,

  idaStar: `FUNCTION IDAStar(start, goal, heuristic):
  threshold ← heuristic(start, goal)
  LOOP:
    result ← DepthLimitedSearch(start, goal, 0, threshold, heuristic)
    IF result is a path:
      RETURN result
    IF result is infinity:
      RETURN no path
    threshold ← result
  END LOOP

FUNCTION DepthLimitedSearch(node, goal, g, threshold, heuristic):
  f ← g + heuristic(node, goal)
  IF f > threshold:
    RETURN f
  IF node = goal:
    RETURN path found
  minNext ← infinity
  FOR each child of node with step cost c:
    childResult ← DepthLimitedSearch(child, goal, g + c, threshold, heuristic)
    IF childResult is a path:
      RETURN childResult
    IF childResult is a number and childResult < minNext:
      minNext ← childResult
  RETURN minNext`,

  dStarLite: `FUNCTION DStarLite(graph, start, goal):
  initialize goal-centric g and rhs values for all vertices
  INSERT goal into priority queue with consistent key
  WHILE queue not empty and start not locally consistent:
    process vertex with smallest key and update neighbors' rhs from predecessors
  plan ← extract path toward goal following decreasing g along edges
  WHILE robot moves along plan:
    IF edge costs change:
      update affected rhs values and fix queue keys
      repeat compute shortest path prefix until start is consistent again
  RETURN current best path`,

  linearSearch: `FUNCTION LinearSearch(array, target):
  FOR i FROM 0 TO length of array − 1:
    IF array[i] = target:
      RETURN index i
  RETURN not found`,

  binarySearch: `FUNCTION BinarySearch(array, target):
  low ← 0
  high ← length of array − 1
  WHILE low ≤ high:
    mid ← floor((low + high) ÷ 2)
    IF array[mid] = target:
      RETURN mid
    IF array[mid] < target:
      low ← mid + 1
    ELSE:
      high ← mid − 1
  RETURN not found`,

  ternarySearch: `FUNCTION TernarySearch(array, target):
  low ← 0
  high ← length of array − 1
  WHILE low ≤ high:
    third ← floor((high − low) ÷ 3)
    mid1 ← low + third
    mid2 ← high − third
    IF array[mid1] = target:
      RETURN mid1
    IF array[mid2] = target:
      RETURN mid2
    IF target < array[mid1]:
      high ← mid1 − 1
    ELSE IF target > array[mid2]:
      low ← mid2 + 1
    ELSE:
      low ← mid1 + 1
      high ← mid2 − 1
  RETURN not found`,

  jumpSearch: `FUNCTION JumpSearch(sortedArray, target):
  n ← length of sortedArray
  step ← floor square root of n
  prev ← 0
  WHILE prev < n AND sortedArray[min(prev + step, n) − 1] < target:
    prev ← prev + step
  IF prev ≥ n:
    RETURN not found
  FOR j FROM prev DOWNTO max(0, prev − step):
    IF sortedArray[j] = target:
      RETURN j
  RETURN not found`,

  interpolationSearch: `FUNCTION InterpolationSearch(sortedArray, target):
  low ← 0
  high ← length of sortedArray − 1
  WHILE low ≤ high AND target ≥ sortedArray[low] AND target ≤ sortedArray[high]:
    IF low = high:
      IF sortedArray[low] = target:
        RETURN low
      ELSE:
        RETURN not found
    pos ← low + floor((target − sortedArray[low]) × (high − low) ÷ (sortedArray[high] − sortedArray[low]))
    IF sortedArray[pos] = target:
      RETURN pos
    IF sortedArray[pos] < target:
      low ← pos + 1
    ELSE:
      high ← pos − 1
  RETURN not found`,

  exponentialSearch: `FUNCTION ExponentialSearch(sortedArray, target):
  IF first element = target:
    RETURN 0
  bound ← 1
  WHILE bound < length of sortedArray AND sortedArray[bound] < target:
    bound ← bound × 2
  low ← floor(bound ÷ 2)
  high ← min(bound, length of sortedArray − 1)
  RETURN BinarySearch on sortedArray[low..high] for target`,

  fibonacciSearch: `FUNCTION FibonacciSearch(sortedArray, target):
  compute smallest Fibonacci number Fk ≥ length of array
  use Fibonacci numbers to shrink a window [offset, offset + Fk] over the array
  WHILE there is a window to inspect:
    compare target with element at probe index using Fibonacci step sizes
    IF equal:
      RETURN index
    narrow window using previous Fibonacci numbers
  RETURN not found`,

  depthFirstSearch: `FUNCTION DepthFirstSearch(graph, start, goal):
  stack ← empty stack
  push start onto stack
  mark start as visited
  WHILE stack is not empty:
    current ← pop stack
    IF current = goal:
      RETURN path from parent pointers
    FOR each neighbor of current in adjacency order:
      IF neighbor not visited:
        mark neighbor visited
        parent[neighbor] ← current
        push neighbor onto stack
  RETURN not found`,

  breadthFirstSearchGraph: `FUNCTION BreadthFirstSearchGraph(graph, start, goal):
  queue ← empty queue
  enqueue start
  mark start as visited
  WHILE queue is not empty:
    current ← dequeue front
    IF current = goal:
      RETURN path from parent pointers
    FOR each neighbor of current:
      IF neighbor not visited:
        mark neighbor visited
        parent[neighbor] ← current
        enqueue neighbor
  RETURN not found`,
};
