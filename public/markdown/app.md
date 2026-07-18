# Algorithm Visualizer

> Interactive step-by-step visualization of 45 algorithms across five categories.

## How It Works

1. Select a category and algorithm from the sidebar
2. The app generates random input and runs the algorithm, recording each step
3. Steps are animated with color-coded state changes
4. Complexity panel shows interactive time/space complexity charts

## Features

- Step-by-step animation with configurable speed (Slow/Medium/Fast/Very Fast)
- Real-time time and space complexity analysis
- Python code execution in the browser via Pyodide (WebAssembly)
- HD video export with optional sound
- Multi-language support (English, French, Arabic with RTL)
- Google sign-in for saved preferences and favorites

## Algorithm Categories

- **Sorting**: Bubble, Selection, Insertion, Merge, Quick, Heap, Counting, Radix, Shell, Cocktail Shaker, Gnome, Comb, Tim, Bitonic
- **Pathfinding**: Dijkstra, A*, BFS, DFS, Greedy Best-First, Bidirectional BFS, Jump Point Search, Bellman-Ford
- **Searching**: Linear, Binary, Jump, Exponential, Ternary, Fibonacci
- **Tree Traversal**: Pre-order, In-order, Post-order, Level-order, BFS, DFS, Morris In-order
- **Graph**: BFS, DFS, Topological Sort, Bellman-Ford, Floyd-Warshall, Kruskal, Prim, Tarjan, Kosaraju, Ford-Fulkerson

## Agent Integration

Agents can query algorithm information via MCP server card at https://bayanflow.com/.well-known/mcp.json
