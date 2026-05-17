def prim_algorithm(nodes, edges):
    """
    Prim's algorithm for a weighted undirected graph.

    nodes: iterable of vertex ids
    edges: iterable of (from, to, weight) tuples
    Returns (selected_edges, total_weight) for one minimum spanning tree,
    starting from the smallest node id.
    """
    ordered_nodes = sorted(nodes)
    if not ordered_nodes:
        return [], 0

    adjacency = {node: [] for node in ordered_nodes}
    for from_node, to_node, weight in edges:
        adjacency.setdefault(from_node, []).append((to_node, weight, (from_node, to_node, weight)))
        adjacency.setdefault(to_node, []).append((from_node, weight, (from_node, to_node, weight)))

    visited = {ordered_nodes[0]}
    frontier = []

    def push_frontier(node):
        for to_node, weight, edge in adjacency.get(node, []):
            if to_node not in visited:
                frontier.append((weight, edge[0], edge[1], to_node, edge))
        frontier.sort()

    push_frontier(ordered_nodes[0])

    selected = []
    total_weight = 0

    while frontier and len(visited) < len(ordered_nodes):
        weight, _from_key, _to_key, to_node, edge = frontier.pop(0)
        if to_node in visited:
            continue

        visited.add(to_node)
        selected.append(edge)
        total_weight += weight
        push_frontier(to_node)

    return selected, total_weight


if __name__ == "__main__":
    vertices = ["0", "1", "2", "3"]
    weighted_edges = [
        ("0", "1", 2),
        ("0", "2", 3),
        ("1", "2", 1),
        ("1", "3", 4),
        ("2", "3", 5),
    ]
    print(prim_algorithm(vertices, weighted_edges))
