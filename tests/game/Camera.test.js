// tests/game/Camera.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Camera } from '../../js/game/Camera.js';
import { CameraConfig } from '../../js/config/CameraConfig.js'; // Assuming config is testable

// Mock the CameraConfig if needed, or use the real one
// vi.mock('../../js/config/CameraConfig.js', () => ({
//   CameraConfig: {
//     smoothing: 0.1,
//     lookaheadFactor: 0.5,
//     offsetX: 0,
//     offsetY: 0,
//   }
// }));

describe('Camera', () => {
    let camera;
    const canvasWidth = 800;
    const canvasHeight = 600;
    let mockTarget;

    beforeEach(() => {
        // Reset camera and mock target before each test
        camera = new Camera(canvasWidth, canvasHeight);
        mockTarget = {
            id: 'hero1',
            x: 400,
            y: 300,
            width: 50, // Needed for centering calculations maybe?
            height: 50,
            vx: 0, // Velocity x
            vy: 0  // Velocity y
        };
    });

    it('should initialize with default values', () => {
        expect(camera.x).toBe(0);
        expect(camera.y).toBe(0);
        expect(camera.width).toBe(canvasWidth);
        expect(camera.height).toBe(canvasHeight);
        expect(camera.target).toBeNull();
        expect(camera.smoothing).toBe(CameraConfig.smoothing);
        expect(camera.lookaheadFactor).toBe(CameraConfig.lookaheadFactor);
        expect(camera.offsetX).toBe(CameraConfig.offsetX);
        expect(camera.offsetY).toBe(CameraConfig.offsetY);
        expect(camera.desiredX).toBe(0);
        expect(camera.desiredY).toBe(0);
    });

    it('should set the target and immediately center on it', () => {
        camera.setTarget(mockTarget);
        expect(camera.target).toBe(mockTarget);
        // Expected center = target.x - canvasWidth / 2 + offsetX
        const expectedX = mockTarget.x - canvasWidth / 2 + camera.offsetX;
        // Expected center = target.y - canvasHeight / 2 + offsetY
        const expectedY = mockTarget.y - canvasHeight / 2 + camera.offsetY;
        expect(camera.x).toBeCloseTo(expectedX); // Use toBeCloseTo for potential float issues
        expect(camera.y).toBeCloseTo(expectedY);
        expect(camera.desiredX).toBeCloseTo(expectedX);
        expect(camera.desiredY).toBeCloseTo(expectedY);
    });

    it('should update camera position smoothly towards a stationary target', () => {
        camera.setTarget(mockTarget);
        // Manually set camera significantly off target
        camera.x = -500; 
        camera.y = -500;

        const expectedX = mockTarget.x - canvasWidth / 2 + camera.offsetX;
        const expectedY = mockTarget.y - canvasHeight / 2 + camera.offsetY;

        // Simulate multiple update steps
        for (let i = 0; i < 10; i++) {
            camera.update(0.016); // Simulate ~60fps delta time
        }

        // Camera should have moved *towards* the target, but not reached it instantly due to smoothing
        expect(camera.x).not.toBeCloseTo(0); // Use toBeCloseTo for precision
        expect(camera.y).not.toBeCloseTo(0); // Use toBeCloseTo for precision
        expect(camera.x).toBeLessThan(expectedX); // Assuming target is to the right
        expect(camera.y).toBeLessThan(expectedY); // Assuming target is below

        // Simulate many, many more updates
         for (let i = 0; i < 1000; i++) { // Increased loops
            camera.update(0.016);
        }
        // After many updates, it should be very close to the target
        expect(camera.x).toBeCloseTo(expectedX, 0); // Use lower precision (e.g., 0 decimal places)
        expect(camera.y).toBeCloseTo(expectedY, 0); // Use lower precision
    });

     it('should incorporate lookahead when the target is moving', () => {
        mockTarget.vx = 100; // Moving right
        mockTarget.vy = 50;  // Moving down
        camera.setTarget(mockTarget);

        const deltaTime = 0.1; // Use a larger delta for more noticeable lookahead effect
        camera.update(deltaTime);

        const baseExpectedX = mockTarget.x - canvasWidth / 2 + camera.offsetX;
        const baseExpectedY = mockTarget.y - canvasHeight / 2 + camera.offsetY;

        // Calculate lookahead offset based on config and velocity/deltaTime
        // Note: lookaheadFactor might be scaled internally - check Camera.js logic if needed
        // Original lookahead calculation: target.vx * lookaheadFactor / deltaTime
        // We need to use the actual formula used in Camera.update
        const lookaheadX = deltaTime > 0 ? mockTarget.vx * camera.lookaheadFactor / deltaTime : 0;
        const lookaheadY = deltaTime > 0 ? mockTarget.vy * camera.lookaheadFactor / deltaTime : 0;

        // The desired position incorporates the lookahead _before_ smoothing
        const expectedDesiredX = (mockTarget.x + lookaheadX) - canvasWidth / 2 + camera.offsetX;
        const expectedDesiredY = (mockTarget.y + lookaheadY) - canvasHeight / 2 + camera.offsetY;

        expect(camera.desiredX).toBeCloseTo(expectedDesiredX);
        expect(camera.desiredY).toBeCloseTo(expectedDesiredY);

        // The actual camera position is lerped towards the desired position
        // Initial camera position after setTarget is centered on baseExpectedX/Y
        const initialX = baseExpectedX;
        const initialY = baseExpectedY;
        const expectedSmoothedX = initialX + (expectedDesiredX - initialX) * camera.smoothing; // Lerp formula
        const expectedSmoothedY = initialY + (expectedDesiredY - initialY) * camera.smoothing;

        expect(camera.x).toBeCloseTo(expectedSmoothedX);
        expect(camera.y).toBeCloseTo(expectedSmoothedY);

        // Verify camera is further right/down than base position due to lookahead effect in desired pos
        expect(camera.desiredX).toBeGreaterThan(baseExpectedX);
        expect(camera.desiredY).toBeGreaterThan(baseExpectedY);
        // And the smoothed position should also be shifted due to the shifted target
        expect(camera.x).toBeGreaterThan(baseExpectedX);
        expect(camera.y).toBeGreaterThan(baseExpectedY);
    });

    it('should convert screen coordinates to world coordinates', () => {
        camera.x = 100;
        camera.y = 50;
        const screenPos = { x: 200, y: 150 };
        const expectedWorldPos = { x: 300, y: 200 }; // screen + camera
        expect(camera.screenToWorld(screenPos.x, screenPos.y)).toEqual(expectedWorldPos);
    });

    it('should convert world coordinates to screen coordinates', () => {
        camera.x = 100;
        camera.y = 50;
        const worldPos = { x: 300, y: 200 };
        const expectedScreenPos = { x: 200, y: 150 }; // world - camera
        expect(camera.worldToScreen(worldPos.x, worldPos.y)).toEqual(expectedScreenPos);
    });

    // Test applyTransform (requires mocking context)
    it('should apply the correct translation to the context', () => {
        const mockCtx = {
            translate: vi.fn(), // Vitest mock function
            // Add other methods if needed by Camera or called within test
        };
        camera.x = 123.4;
        camera.y = 567.8;

        camera.applyTransform(mockCtx);

        // Should translate by the *negative rounded* camera coordinates
        expect(mockCtx.translate).toHaveBeenCalledWith(-123, -568);
    });

}); 