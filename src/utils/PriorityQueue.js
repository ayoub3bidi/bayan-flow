/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

export class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }

  dequeue() {
    return this.values.shift();
  }

  isEmpty() {
    return this.values.length === 0;
  }

  sort() {
    // Primary key sort, then secondary if tuple
    this.values.sort((a, b) => {
      if (Array.isArray(a.priority) && Array.isArray(b.priority)) {
        if (a.priority[0] !== b.priority[0]) {
          return a.priority[0] - b.priority[0];
        }
        return a.priority[1] - b.priority[1];
      }
      return a.priority - b.priority;
    });
  }

  // For D* Lite specifically - allows checking if node is in queue
  // Note: optimized implementation would use a Map for O(1) lookup
  contains(val) {
    return this.values.some(
      item => item.val.row === val.row && item.val.col === val.col
    );
  }
}
