"""Postorder traversal (Left, Right, Node) on a binary tree represented as nested dicts.

Complexity:
  Time: O(n) — each node visited once.
  Space: O(h) recursive stack (or O(n) for the iterative two-stack variant in worst case).
"""


def _postorder_recursive(node, visit):
    """Recursive postorder helper."""
    if node is None:
        return
    _postorder_recursive(node.get("left"), visit)
    _postorder_recursive(node.get("right"), visit)
    visit(node["value"])


def postorder_traversal(root):
    """Return node values in postorder (recursive): left, right, node."""
    result = []

    def visit(value):
        result.append(value)

    _postorder_recursive(root, visit)
    return result


def postorder_traversal_iterative(root):
    """Two-stack iterative postorder traversal."""
    if root is None:
        return []

    stack1 = [root]
    stack2 = []

    while stack1:
        node = stack1.pop()
        stack2.append(node)

        left = node.get("left")
        right = node.get("right")
        if left is not None:
            stack1.append(left)
        if right is not None:
            stack1.append(right)

    result = []
    while stack2:
        result.append(stack2.pop()["value"])

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
    print(postorder_traversal(tree))
    print(postorder_traversal_iterative(tree))
