import { GRID_CONFIG } from '../config/GridConfig.js';

// Represents a node in the pathfinding grid
class PathNode {
    constructor(x, y) {
        this.x = x; // Grid column
        this.y = y; // Grid row
        this.gCost = Infinity; // Cost from start node
        this.hCost = 0; // Heuristic cost to end node
        this.fCost = Infinity; // Total cost (gCost + hCost)
        this.parent = null; // Parent node for path reconstruction
    }

    calculateFCost() {
        this.fCost = this.gCost + this.hCost;
    }
}

export class Pathfinder {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.gridWidth = GRID_CONFIG.GRID_WIDTH;
        this.gridHeight = GRID_CONFIG.GRID_HEIGHT;
        this.nodes = this.createNodeGrid();
    }

    // Initialize the grid of PathNode objects
    createNodeGrid() {
        const nodes = [];
        for (let y = 0; y < this.gridHeight; y++) {
            nodes[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                nodes[y][x] = new PathNode(x, y);
            }
        }
        return nodes;
    }

    // Reset node costs and parents for a new pathfind
    resetNodes() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.nodes[y][x].gCost = Infinity;
                this.nodes[y][x].fCost = Infinity;
                this.nodes[y][x].parent = null;
            }
        }
    }

    // A* Pathfinding Algorithm
    findPath(startGridX, startGridY, endGridX, endGridY) {
        if (!this.gridManager.isValidCell(startGridX, startGridY) || 
            !this.gridManager.isValidCell(endGridX, endGridY)) {
            console.warn('Pathfinder: Start or end cell out of bounds.');
            return null; // Invalid start or end
        }

        this.resetNodes();

        const startNode = this.nodes[startGridY][startGridX];
        const endNode = this.nodes[endGridY][endGridX];

        // Check if start or end is unwalkable
        if (!this.gridManager.isCellWalkable(startGridX, startGridY) || 
            !this.gridManager.isCellWalkable(endGridX, endGridY)) {
             console.warn('Pathfinder: Start or end cell is not walkable.');
             // Allow starting slightly off if needed, but end must be walkable usually
             // return null; 
        }

        const openSet = new Set([startNode]);
        const closedSet = new Set();

        startNode.gCost = 0;
        startNode.hCost = this.calculateHeuristic(startNode, endNode);
        startNode.calculateFCost();

        while (openSet.size > 0) {
            let currentNode = this.getLowestFCostNode(openSet);

            if (currentNode === endNode) {
                // Path found! Reconstruct and return it.
                return this.reconstructPath(endNode);
            }

            openSet.delete(currentNode);
            closedSet.add(currentNode);

            const neighbors = this.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor) || !this.gridManager.isCellWalkable(neighbor.x, neighbor.y)) {
                    continue; // Ignore already processed or unwalkable neighbors
                }

                // Calculate tentative gCost
                // Simple cost: 1 for orthogonal, sqrt(2) for diagonal (optional)
                const tentativeGCost = currentNode.gCost + this.calculateDistance(currentNode, neighbor);

                if (tentativeGCost < neighbor.gCost) {
                    // This path to neighbor is better than any previous one. Record it!
                    neighbor.parent = currentNode;
                    neighbor.gCost = tentativeGCost;
                    neighbor.hCost = this.calculateHeuristic(neighbor, endNode);
                    neighbor.calculateFCost();

                    if (!openSet.has(neighbor)) {
                        openSet.add(neighbor);
                    }
                }
            }
        }

        // No path found
        console.warn('Pathfinder: No path found from', {x: startGridX, y: startGridY}, 'to', {x: endGridX, y: endGridY});
        return null;
    }

    // Get the node with the lowest fCost from the open set
    getLowestFCostNode(openSet) {
        let lowestNode = null;
        for (const node of openSet) {
            if (lowestNode === null || node.fCost < lowestNode.fCost) {
                lowestNode = node;
            }
        }
        return lowestNode;
    }

    // Get neighboring nodes (orthogonal + diagonal)
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, // Orthogonal
            { x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 1 }  // Diagonal
        ];

        for (const dir of directions) {
            const neighborX = node.x + dir.x;
            const neighborY = node.y + dir.y;

            if (this.gridManager.isValidCell(neighborX, neighborY)) {
                // Basic check for cutting corners diagonally - ensure orthogonal neighbors are walkable
                if (Math.abs(dir.x) === 1 && Math.abs(dir.y) === 1) { // Diagonal move
                    if (!this.gridManager.isCellWalkable(node.x + dir.x, node.y) || 
                        !this.gridManager.isCellWalkable(node.x, node.y + dir.y)) {
                        continue; // Don't allow cutting corners
                    }
                }
                 neighbors.push(this.nodes[neighborY][neighborX]);
            }
        }
        return neighbors;
    }

    // Calculate heuristic (Manhattan distance for grid movement)
    calculateHeuristic(nodeA, nodeB) {
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        // Simple Manhattan distance (cost 1 per grid step)
         return dx + dy;
        // Optional: Diagonal distance heuristic (allows diagonal moves at cost ~1.4)
        // const D = 1; // Cost of orthogonal move
        // const D2 = Math.SQRT2; // Cost of diagonal move
        // return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
    }
    
    // Calculate actual distance between two adjacent nodes
    calculateDistance(nodeA, nodeB) {
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        if (dx > 0 && dy > 0) {
            return Math.SQRT2; // Diagonal move cost
        }
        return 1; // Orthogonal move cost
    }

    // Reconstruct the path from the end node back to the start node
    reconstructPath(endNode) {
        const path = [];
        let currentNode = endNode;
        while (currentNode !== null) {
            // Store world coordinates for the center of the cell
            path.push({
                 x: currentNode.x * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2,
                 y: currentNode.y * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2
             });
            currentNode = currentNode.parent;
        }
        return path.reverse(); // Reverse to get path from start to end
    }
} 