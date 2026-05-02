"""Level-order traversal (breadth-first search on a binary tree) on nested dicts.

Complexity:
  Time: O(n) — each node is dequeued and visited once.
  Space: O(w) — queue holds at most one full level, where w is tree width.
"""

from collections import deque


def level_order_traversal(root):
    """Return node values level by level from top to bottom, left to right."""
    if root is None:
        return []

    result = []
    queue = deque([root])

    while queue:
        node = queue.popleft()
        result.append(node["value"])

        left = node.get("left")
        right = node.get("right")
        if left is not None:
            queue.append(left)
        if right is not None:
            queue.append(right)

    return result


def _example_tree():
    """Small BST for demo: values 1..7 classic balanced shape."""
    return {
        "value": 4,
        "left": {
            "value": 2,
            "left": {"value": 1, "left": None, "right": None},
            "right": {"value": 3, "left": None, "right": None},
        },
        "right": {
            "value": 6,
            "left": {"value": 5, "left": None, "right": None},
            "right": {"value": 7, "left": None, "right": None},
        },
    }


if __name__ == "__main__":
    tree = _example_tree()
    print(level_order_traversal(tree))
