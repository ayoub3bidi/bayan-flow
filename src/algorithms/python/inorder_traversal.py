"""Inorder traversal (Left, Node, Right) on a binary tree represented as nested dicts.

Complexity:
  Time: O(n) — each node visited once.
  Space: O(h) — recursion depth equals tree height h (explicit stack iteration also O(h)).
"""


def _inorder_recursive(node, visit):
    """Recursive inorder helper."""
    if node is None:
        return
    _inorder_recursive(node.get("left"), visit)
    visit(node["value"])
    _inorder_recursive(node.get("right"), visit)


def inorder_traversal(root):
    """Return keys in symmetric (inorder) order for BST-like dict trees."""
    result = []

    def visit(value):
        result.append(value)

    _inorder_recursive(root, visit)
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
    print(inorder_traversal(tree))
