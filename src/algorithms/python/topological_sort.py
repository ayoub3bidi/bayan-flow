def topological_sort(adjacency):
    """
    DFS-based topological sort.

    adjacency: dict mapping each vertex to a list of outgoing neighbors.
    Returns a list containing one valid topological order, or None if a cycle
    is detected.
    """
    graph = {node: list(neighbors) for node, neighbors in adjacency.items()}
    for neighbors in list(graph.values()):
        for node in neighbors:
            graph.setdefault(node, [])

    temporary = set()
    permanent = set()
    finish_stack = []

    def visit(node):
        if node in temporary:
            return False
        if node in permanent:
            return True

        temporary.add(node)
        for neighbor in graph[node]:
            if not visit(neighbor):
                return False
        temporary.remove(node)
        permanent.add(node)
        finish_stack.append(node)
        return True

    for node in sorted(graph):
        if node not in permanent and not visit(node):
            return None

    return list(reversed(finish_stack))


if __name__ == "__main__":
    graph = {
        "cook": ["eat"],
        "shop": ["cook"],
        "eat": [],
    }
    print(topological_sort(graph))
