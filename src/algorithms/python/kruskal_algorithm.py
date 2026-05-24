def kruskal_algorithm(nodes, edges):
    """
    Kruskal's algorithm for a weighted undirected graph.

    nodes: iterable of vertex ids
    edges: iterable of (from, to, weight) tuples
    Returns (selected_edges, total_weight), where selected_edges is the
    minimum spanning tree or forest in processing order.
    """
    parent = {node: node for node in nodes}
    rank = {node: 0 for node in nodes}

    def find(node):
        if parent[node] != node:
            parent[node] = find(parent[node])
        return parent[node]

    def union(a, b):
        root_a = find(a)
        root_b = find(b)
        if root_a == root_b:
            return False

        if rank[root_a] < rank[root_b]:
            parent[root_a] = root_b
        elif rank[root_a] > rank[root_b]:
            parent[root_b] = root_a
        else:
            parent[root_b] = root_a
            rank[root_a] += 1

        return True

    ordered_edges = sorted(edges, key=lambda edge: (edge[2], sorted(edge[:2])))
    selected = []
    total_weight = 0

    for edge in ordered_edges:
        from_node, to_node, weight = edge
        if union(from_node, to_node):
            selected.append((from_node, to_node, weight))
            total_weight += weight

    return selected, total_weight


if __name__ == "__main__":
    vertices = ["A", "B", "C", "D"]
    weighted_edges = [
        ("A", "B", 2),
        ("A", "C", 3),
        ("B", "C", 1),
        ("B", "D", 4),
        ("C", "D", 5),
    ]
    print(kruskal_algorithm(vertices, weighted_edges))
