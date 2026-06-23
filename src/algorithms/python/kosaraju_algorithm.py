def kosaraju_algorithm(adjacency):
    """
    Kosaraju's algorithm for strongly connected components.

    Returns SCCs in deterministic second-pass order, with each component sorted
    for stable browser-side testing.
    """
    graph = {
        str(node): sorted({str(neighbor) for neighbor in neighbors}, key=lambda x: int(x) if x.isdigit() else x)
        for node, neighbors in (adjacency or {}).items()
    }

    for neighbors in list(graph.values()):
        for neighbor in neighbors:
            graph.setdefault(neighbor, [])

    order = sorted(graph.keys(), key=lambda x: int(x) if x.isdigit() else x)
    transpose = {node: [] for node in order}
    for node, neighbors in graph.items():
        for neighbor in neighbors:
            transpose.setdefault(neighbor, []).append(node)
    for node in list(transpose.keys()):
        transpose[node] = sorted(transpose[node], key=lambda x: int(x) if x.isdigit() else x)

    visited = set()
    finish_order = []

    def dfs_original(node):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs_original(neighbor)
        finish_order.append(node)

    for node in order:
        if node not in visited:
            dfs_original(node)

    assigned = set()
    components = []

    def dfs_transpose(node, component):
        assigned.add(node)
        component.append(node)
        for neighbor in transpose.get(node, []):
            if neighbor not in assigned:
                dfs_transpose(neighbor, component)

    for node in reversed(finish_order):
        if node in assigned:
            continue
        component = []
        dfs_transpose(node, component)
        components.append(sorted(component, key=lambda x: int(x) if x.isdigit() else x))

    return components


if __name__ == "__main__":
    graph = {
        "0": ["1"],
        "1": ["2", "3"],
        "2": ["0"],
        "3": ["4"],
        "4": ["3"],
    }
    print(kosaraju_algorithm(graph))
