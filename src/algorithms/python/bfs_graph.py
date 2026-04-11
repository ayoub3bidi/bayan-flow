def breadth_first_search_graph(adjacency, start, goal):
    """
    Breadth-first search on an undirected graph represented as an adjacency dict:
    keys are node ids (strings), values are lists of neighbor ids.
    Returns the shortest path as a list of node ids from start to goal, or None if unreachable.
    """
    if start == goal:
        return [start]

    queue = [start]
    discovered = {start: True}
    parent = {start: None}

    while queue:
        current = queue.pop(0)

        if current == goal:
            path = []
            c = goal
            while c is not None:
                path.append(c)
                c = parent.get(c)
            path.reverse()
            return path

        for n in adjacency.get(current, []):
            if n not in discovered:
                discovered[n] = True
                parent[n] = current
                queue.append(n)

    return None
