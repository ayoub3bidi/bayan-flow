def tarjan_algorithm(adjacency):
    """
    Tarjan's algorithm for strongly connected components.

    Returns SCCs in deterministic discovery/pop order. Each SCC is sorted so
    browser-side tests and Pyodide examples remain stable.
    """
    graph = {
        str(node): sorted({str(neighbor) for neighbor in neighbors}, key=lambda x: int(x) if x.isdigit() else x)
        for node, neighbors in (adjacency or {}).items()
    }

    for neighbors in list(graph.values()):
        for neighbor in neighbors:
            graph.setdefault(neighbor, [])

    order = sorted(graph.keys(), key=lambda x: int(x) if x.isdigit() else x)
    index_by_id = {}
    low_link = {}
    stack = []
    on_stack = set()
    components = []
    next_index = 0

    def strong_connect(node):
        nonlocal next_index
        index_by_id[node] = next_index
        low_link[node] = next_index
        next_index += 1
        stack.append(node)
        on_stack.add(node)

        for neighbor in graph.get(node, []):
            if neighbor not in index_by_id:
                strong_connect(neighbor)
                low_link[node] = min(low_link[node], low_link[neighbor])
            elif neighbor in on_stack:
                low_link[node] = min(low_link[node], index_by_id[neighbor])

        if low_link[node] == index_by_id[node]:
            component = []
            while stack:
                popped = stack.pop()
                on_stack.remove(popped)
                component.append(popped)
                if popped == node:
                    break
            components.append(sorted(component, key=lambda x: int(x) if x.isdigit() else x))

    for node in order:
        if node not in index_by_id:
            strong_connect(node)

    return components


if __name__ == "__main__":
    graph = {
        "0": ["1"],
        "1": ["2", "3"],
        "2": ["0"],
        "3": ["4"],
        "4": ["3"],
    }
    print(tarjan_algorithm(graph))
