"""Preorder traversal (Node, Left, Right) on a binary tree represented as nested dicts.

Complexity:
  Time: O(n) — each node visited once.
  Space: O(h) — recursion depth equals tree height h (explicit stack iteration also O(h)).
"""


def _preorder_recursive(node, visit):
    """Recursive preorder helper."""
    if node is None:
        return
    visit(node["value"])
    _preorder_recursive(node.get("left"), visit)
    _preorder_recursive(node.get("right"), visit)


def preorder_traversal(root):
    """Return node values in preorder (recursive): node, left subtree, right subtree."""
    result = []

    def visit(value):
        result.append(value)

    _preorder_recursive(root, visit)
    return result


def preorder_traversal_iterative(root):
    """Stack-based preorder; same visit order as preorder_traversal when root is not None."""
    if root is None:
        return []
    result = []
    stack = [root]
    while stack:
        node = stack.pop()
        result.append(node["value"])
        right = node.get("right")
        left = node.get("left")
        if right is not None:
            stack.append(right)
        if left is not None:
            stack.append(left)
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
    print(preorder_traversal(tree))
    print(preorder_traversal_iterative(tree))
