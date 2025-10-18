import heapq

def heuristic(a, b):
    """
    Calculate Manhattan distance heuristic between two points.
    
    Args:
        a (tuple): First point (row, col)
        b (tuple): Second point (row, col)
        
    Returns:
        int: Manhattan distance
    """
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def astar(grid, start, end):
    """
    A* Search Algorithm for Pathfinding
    Time Complexity: O(b^d) where b is branching factor and d is depth
    Space Complexity: O(b^d)
    
    A* is an informed search algorithm that uses heuristics to guide its search.
    It combines the benefits of Dijkstra's algorithm and greedy best-first search.
    
    The algorithm uses:
    - g(n): Cost from start to current node
    - h(n): Estimated cost from current node to end (heuristic)
    - f(n): Total estimated cost = g(n) + h(n)
    
    Args:
        grid (list): 2D grid representing the map (0 = walkable, 1 = wall)
        start (tuple): Starting position (row, col)
        end (tuple): Target position (row, col)
        
    Returns:
        list: Path from start to end as list of (row, col) tuples, or None if no path exists
    """
    rows, cols = len(grid), len(grid[0])
    
    # Priority queue: stores (f_score, g_score, row, col)
    # f_score is used for priority, g_score is used as tiebreaker
    pq = [(0, 0, start[0], start[1])]
    
    # Dictionary to store g_score (cost from start) for each cell
    g_scores = {start: 0}
    
    # Dictionary to store f_score (g + h) for each cell
    f_scores = {start: heuristic(start, end)}
    
    # Dictionary to reconstruct the path
    came_from = {}
    
    # Set to track cells in the open set
    open_set = {start}
    
    # Directions: up, down, left, right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while pq:
        current_f, current_g, row, col = heapq.heappop(pq)
        current = (row, col)
        
        # Remove from open set
        open_set.discard(current)
        
        # If we reached the end, reconstruct the path
        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]  # Reverse to get start -> end
        
        # Skip if we've already found a better path to this cell
        if current_g > g_scores.get(current, float('inf')):
            continue
        
        # Explore all 4 directions
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            neighbor = (new_row, new_col)
            
            # Check if the new position is valid
            if (0 <= new_row < rows and 
                0 <= new_col < cols and 
                grid[new_row][new_col] == 0):
                
                # Calculate tentative g_score (cost from start to neighbor)
                tentative_g = current_g + 1
                
                # If we found a better path to this neighbor
                if tentative_g < g_scores.get(neighbor, float('inf')):
                    # Update path
                    came_from[neighbor] = current
                    g_scores[neighbor] = tentative_g
                    
                    # Calculate f_score = g + h
                    h_score = heuristic(neighbor, end)
                    f_score = tentative_g + h_score
                    f_scores[neighbor] = f_score
                    
                    # Add to open set if not already there
                    if neighbor not in open_set:
                        open_set.add(neighbor)
                        heapq.heappush(pq, (f_score, tentative_g, new_row, new_col))
    
    # No path found
    return None


# Example usage and test
if __name__ == "__main__":
    # Create a sample grid (0 = walkable, 1 = wall)
    test_grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0]
    ]
    
    start_pos = (0, 0)
    end_pos = (4, 4)
    
    print(f"Grid size: {len(test_grid)}x{len(test_grid[0])}")
    print(f"Start: {start_pos}, End: {end_pos}")
    print(f"Heuristic (Manhattan distance): {heuristic(start_pos, end_pos)}")
    
    path = astar(test_grid, start_pos, end_pos)
    
    if path:
        print(f"\nPath found with {len(path)} steps:")
        print(f"Path: {path}")
        print(f"Actual distance: {len(path) - 1}")
    else:
        print("No path found!")
    
    # Visualize the path on the grid
    if path:
        print("\nGrid with path (. = walkable, # = wall, * = path):")
        for i in range(len(test_grid)):
            row_str = ""
            for j in range(len(test_grid[0])):
                if (i, j) in path:
                    row_str += "* "
                elif test_grid[i][j] == 1:
                    row_str += "# "
                else:
                    row_str += ". "
            print(row_str)
