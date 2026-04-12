def depth_first_search(adjacency, start, goal):
    """
    Depth-first search on an undirected graph represented as an adjacency dict:
    keys are node ids (strings), values are lists of neighbor ids.
    Returns a path as a list of node ids from start to goal, or None if unreachable.
    Neighbors are pushed in reverse order so traversal matches Bayan Flow's stack DFS
    when adjacency lists are sorted ascending.
    """
    if start == goal:
        return [start]

    stack = [start]
    discovered = {start: True}
    parent = {start: None}

    while stack:
        current = stack.pop()

        if current == goal:
            path = []
            c = goal
            while c is not None:
                path.append(c)
                c = parent[c]
            path.reverse()
            return path

        neighbors = [n for n in adjacency.get(current, []) if n not in discovered]
        for n in reversed(neighbors):
            discovered[n] = True
            parent[n] = current
            stack.append(n)

    return None
