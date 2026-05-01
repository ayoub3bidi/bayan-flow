"""Zigzag level-order traversal (alternating scan direction per depth).

Uses collections.deque for FIFO batches per level.

Complexity:
  Time: O(n) — each node is processed once per visitation pass.
  Space: O(w) — deque holds at most one full level, where w is tree width.
"""

from collections import deque


def zigzag_level_order_traversal(root):
    """Return node values in zigzag level order (LTR, RTL, LTR, … by depth)."""
    if root is None:
        return []

    result = []
    queue = deque([root])
    left_to_right = True

    while queue:
        level_size = len(queue)
        level_nodes = []
        for _ in range(level_size):
            level_nodes.append(queue.popleft())

        visit_seq = level_nodes if left_to_right else list(reversed(level_nodes))

        for node in visit_seq:
            result.append(node["value"])

        # Next frontier: always left-to-right spatial order (classic BFS layering).
        for node in level_nodes:
            left = node.get("left")
            right = node.get("right")
            if left is not None:
                queue.append(left)
            if right is not None:
                queue.append(right)

        left_to_right = not left_to_right

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
    print(zigzag_level_order_traversal(tree))
