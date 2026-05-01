"""Morris traversal — inorder walk with O(1) auxiliary space (threaded tree).

Binary tree: each node is a dict with keys "value", "left", "right"
(None for missing children).

Complexity:
  Time: O(n) — each edge is crossed at most a constant number of times.
  Space: O(1) — only a handful of pointers; no stack or recursion.

Idea:
  Without a stack, we need another way to know when the left subtree of `current`
  is finished. Morris finds the inorder predecessor of `current` inside the left
  subtree (rightmost node reachable by always going right).

  If predecessor.right is None, we set predecessor.right = current ("thread")
  and move to current.left — we will eventually return via that thread.

  If predecessor.right already equals current, the thread exists from a
  previous visit: we restore predecessor.right = None, emit current (inorder),
  then go to current.right.

Compare to classic inorder: same visit order; Morris only changes how we
navigate without extra storage.
"""


def morris_traversal(root):
    """Return node values in symmetric (inorder) order using Morris threading."""
    result = []
    current = root

    while current is not None:
        left = current.get("left")
        if left is None:
            result.append(current["value"])
            current = current.get("right")
            continue

        pred = left
        # Inorder predecessor: walk right until None or we loop back to current.
        while pred.get("right") is not None and pred["right"] is not current:
            pred = pred["right"]

        if pred.get("right") is None:
            pred["right"] = current  # create temporary thread
            current = left
        else:
            pred["right"] = None  # restore tree
            result.append(current["value"])
            current = current.get("right")

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
    print(morris_traversal(tree))
