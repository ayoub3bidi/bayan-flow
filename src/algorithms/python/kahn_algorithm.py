def kahn_algorithm(adjacency):
    """
    Kahn's topological sort algorithm.

    adjacency: dict mapping each vertex to a list of outgoing neighbors.
    Returns one valid topological order, or None if the graph contains a cycle.
    """
    graph = {node: list(neighbors) for node, neighbors in adjacency.items()}
    for neighbors in list(graph.values()):
        for node in neighbors:
            graph.setdefault(node, [])

    in_degree = {node: 0 for node in graph}
    for node in graph:
        for neighbor in graph[node]:
            in_degree[neighbor] += 1

    queue = sorted([node for node, degree in in_degree.items() if degree == 0])
    order = []

    while queue:
        node = queue.pop(0)
        order.append(node)

        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                queue.sort()

    if len(order) != len(graph):
        return None

    return order


if __name__ == "__main__":
    graph = {
        "plan": ["build"],
        "test": ["release"],
        "build": ["release"],
        "release": [],
    }
    print(kahn_algorithm(graph))
