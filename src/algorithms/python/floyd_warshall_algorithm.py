def floyd_warshall_algorithm(nodes, edges):
    """
    Floyd-Warshall all-pairs shortest paths.

    Returns (distance_matrix, has_negative_cycle) where unreachable entries are
    None so the Pyodide test harness can compare results directly.
    """
    ordered_nodes = sorted([str(node) for node in nodes], key=lambda x: int(x) if x.isdigit() else x)
    index_by_id = {node: index for index, node in enumerate(ordered_nodes)}
    size = len(ordered_nodes)
    inf = float("inf")

    distances = [[inf] * size for _ in range(size)]
    for index in range(size):
        distances[index][index] = 0

    for from_node, to_node, weight in edges:
        from_index = index_by_id[str(from_node)]
        to_index = index_by_id[str(to_node)]
        if weight < distances[from_index][to_index]:
            distances[from_index][to_index] = weight

    for via in range(size):
        for src in range(size):
            if distances[src][via] == inf:
                continue
            for dst in range(size):
                if distances[via][dst] == inf:
                    continue
                candidate = distances[src][via] + distances[via][dst]
                if candidate < distances[src][dst]:
                    distances[src][dst] = candidate

    has_negative_cycle = any(distances[index][index] < 0 for index in range(size))
    normalized = [
        [None if value == inf else value for value in row]
        for row in distances
    ]
    return normalized, has_negative_cycle


if __name__ == "__main__":
    vertices = ["0", "1", "2", "3"]
    weighted_edges = [
        ("0", "1", 3),
        ("0", "3", 10),
        ("1", "2", 2),
        ("2", "3", 1),
        ("3", "1", 4),
    ]
    print(floyd_warshall_algorithm(vertices, weighted_edges))
