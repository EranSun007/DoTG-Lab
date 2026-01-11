import { Debug } from '../utils/Debug.js';

/**
 * @class PathEditorV2
 * @description Simple visual path editor for designing enemy paths
 * Allows adding, moving, and removing waypoints with mouse interaction
 */
export class PathEditorV2 {
    constructor() {
        this.enabled = false;
        this.currentPath = null;  // Currently editing path {name, waypoints, color}
        this.selectedWaypoint = null;  // Index of waypoint being dragged
        this.hoveredWaypoint = null;   // Index of waypoint being hovered
        this.isDragging = false;

        Debug.log('PathEditorV2 initialized');
    }

    /**
     * Enable the path editor with a specific path
     * @param {Object} pathData - Path configuration {name, waypoints, color}
     */
    enable(pathData) {
        this.enabled = true;
        // Deep copy the path data so we don't modify the original
        this.currentPath = JSON.parse(JSON.stringify(pathData));
        Debug.log('PathEditorV2 enabled with path:', pathData.name);
    }

    /**
     * Disable the path editor
     */
    disable() {
        this.enabled = false;
        this.selectedWaypoint = null;
        this.hoveredWaypoint = null;
        this.isDragging = false;
        Debug.log('PathEditorV2 disabled');
    }

    /**
     * Toggle the path editor on/off
     */
    toggle(pathData) {
        if (this.enabled) {
            this.disable();
        } else if (pathData) {
            this.enable(pathData);
        }
    }

    /**
     * Handle mouse click event
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     */
    handleClick(worldX, worldY) {
        if (!this.enabled || !this.currentPath) return;

        // Check if clicking near existing waypoint (within 20 pixels)
        const clickedIndex = this.findWaypointAt(worldX, worldY, 20);

        if (clickedIndex !== null) {
            // Clicked on existing waypoint - select it
            this.selectedWaypoint = clickedIndex;
            Debug.log(`Selected waypoint ${clickedIndex}`);
        } else {
            // Clicked on empty space - add new waypoint
            this.currentPath.waypoints.push({ x: worldX, y: worldY });
            Debug.log(`Added waypoint at (${Math.round(worldX)}, ${Math.round(worldY)})`);
        }
    }

    /**
     * Handle mouse drag event (called while mouse is down and moving)
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     */
    handleDrag(worldX, worldY) {
        if (!this.enabled || !this.currentPath || this.selectedWaypoint === null) return;

        // Update the position of the selected waypoint
        this.currentPath.waypoints[this.selectedWaypoint] = { x: worldX, y: worldY };
        this.isDragging = true;
    }

    /**
     * Handle mouse release event
     */
    handleRelease() {
        if (this.isDragging) {
            Debug.log('Waypoint drag completed');
        }
        this.isDragging = false;
    }

    /**
     * Handle mouse move for hover detection
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     */
    handleHover(worldX, worldY) {
        if (!this.enabled || !this.currentPath) {
            this.hoveredWaypoint = null;
            return;
        }

        this.hoveredWaypoint = this.findWaypointAt(worldX, worldY, 20);
    }

    /**
     * Find waypoint at given position
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {number} threshold - Distance threshold in pixels
     * @returns {number|null} Index of waypoint, or null if none found
     */
    findWaypointAt(worldX, worldY, threshold) {
        if (!this.currentPath) return null;

        for (let i = 0; i < this.currentPath.waypoints.length; i++) {
            const wp = this.currentPath.waypoints[i];
            const dx = wp.x - worldX;
            const dy = wp.y - worldY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= threshold) {
                return i;
            }
        }

        return null;
    }

    /**
     * Delete the selected waypoint
     */
    deleteSelected() {
        if (this.selectedWaypoint !== null && this.currentPath) {
            this.currentPath.waypoints.splice(this.selectedWaypoint, 1);
            Debug.log(`Deleted waypoint ${this.selectedWaypoint}`);
            this.selectedWaypoint = null;
        }
    }

    /**
     * Clear all waypoints
     */
    clearAll() {
        if (this.currentPath) {
            this.currentPath.waypoints = [];
            this.selectedWaypoint = null;
            Debug.log('Cleared all waypoints');
        }
    }

    /**
     * Draw the path editor overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.enabled || !this.currentPath) return;

        ctx.save();

        // Draw path line connecting waypoints
        if (this.currentPath.waypoints.length > 1) {
            ctx.strokeStyle = this.currentPath.color || '#00ff00';
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();

            this.currentPath.waypoints.forEach((wp, i) => {
                if (i === 0) {
                    ctx.moveTo(wp.x, wp.y);
                } else {
                    ctx.lineTo(wp.x, wp.y);
                }
            });

            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw waypoint circles
        this.currentPath.waypoints.forEach((wp, i) => {
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 12, 0, Math.PI * 2);

            // Color based on state
            if (i === this.selectedWaypoint) {
                ctx.fillStyle = 'yellow';           // Selected waypoint
            } else if (i === this.hoveredWaypoint) {
                ctx.fillStyle = 'lightblue';        // Hovered waypoint
            } else if (i === 0) {
                ctx.fillStyle = 'green';            // Start waypoint
            } else if (i === this.currentPath.waypoints.length - 1) {
                ctx.fillStyle = 'red';              // End waypoint
            } else {
                ctx.fillStyle = 'cyan';             // Middle waypoints
            }

            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw waypoint number
            ctx.fillStyle = 'black';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(i + 1), wp.x, wp.y);
        });

        ctx.restore();
    }

    /**
     * Export the current path as JSON
     * @returns {Object} Path configuration
     */
    exportPath() {
        if (!this.currentPath) return null;
        return JSON.parse(JSON.stringify(this.currentPath));
    }

    /**
     * Get current editor state
     * @returns {Object}
     */
    getState() {
        return {
            enabled: this.enabled,
            currentPath: this.currentPath,
            selectedWaypoint: this.selectedWaypoint,
            isDragging: this.isDragging
        };
    }
}
