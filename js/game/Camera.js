import { CameraConfig } from '../config/CameraConfig.js';

// Linear interpolation function
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.target = null; // The entity to follow (e.g., the hero)
    this.smoothing = CameraConfig.smoothing;
    this.lookaheadFactor = CameraConfig.lookaheadFactor;
    this.offsetX = CameraConfig.offsetX;
    this.offsetY = CameraConfig.offsetY;

    // Desired position (used for smoothing)
    this.desiredX = 0;
    this.desiredY = 0;
  }

  setTarget(target) {
    this.target = target;
    if (this.target) {
      // Initialize camera position to target's position immediately
      this.desiredX = this.target.x - this.width / 2 + this.offsetX;
      this.desiredY = this.target.y - this.height / 2 + this.offsetY;
      this.x = this.desiredX;
      this.y = this.desiredY;
    }
  }

  update(deltaTime) {
    if (!this.target) return;

    // Calculate lookahead based on target's velocity (ensure target has vx/vy)
    const targetVx = this.target.vx || 0;
    const targetVy = this.target.vy || 0;
    const lookaheadX = deltaTime > 0 ? targetVx * this.lookaheadFactor / deltaTime : 0;
    const lookaheadY = deltaTime > 0 ? targetVy * this.lookaheadFactor / deltaTime : 0;

    // Calculate the desired center position of the camera
    this.desiredX = (this.target.x + lookaheadX) - this.width / 2 + this.offsetX;
    this.desiredY = (this.target.y + lookaheadY) - this.height / 2 + this.offsetY;

    // Apply smoothing using lerp
    this.x = lerp(this.x, this.desiredX, this.smoothing);
    this.y = lerp(this.y, this.desiredY, this.smoothing);

    // Optional: Clamp camera position to map boundaries if needed
    // this.x = Math.max(0, Math.min(this.x, mapWidth - this.width));
    // this.y = Math.max(0, Math.min(this.y, mapHeight - this.height));
  }

  // Applies the camera transformation to the rendering context
  applyTransform(ctx) {
    // Translate the canvas so the camera's top-left corner is at (0,0)
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  // Converts screen coordinates (e.g., mouse click) to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    };
  }

  // Converts world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }
} 