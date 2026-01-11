import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hero } from '../../src/entities/players/Hero.js';
import { ANIMATION_CONFIG } from '../../src/config/AnimationConfig.js'; // Import the real config
import { GRID_CONFIG } from '../../src/config/GridConfig.js'; // Import grid config

// Mock parts of the config for predictable testing if needed, or use the real one
const MOCK_ANIMATION_CONFIG = {
    HERO: {
        IDLE: { assetKey: 'HERO_IDLE_SHEET', frameWidth: 32, frameHeight: 32, frameCount: 4, frameRate: 2, frames: [0, 1, 2, 3] },
        WALK: { assetKey: 'HERO_WALK_SHEET', frameWidth: 32, frameHeight: 32, frameCount: 4, frameRate: 10, frames: [0, 1, 2, 3] } // Use 10fps for easier math
    }
};

// Mock the config import *if* needed. If using real config is fine, skip this.
// vi.mock('../../js/config/AnimationConfig.js', () => ({ 
//     ANIMATION_CONFIG: MOCK_ANIMATION_CONFIG 
// }));

// Minimal hero data for tests
const baseHeroData = {
    x: 0, y: 0, width: 32, height: 32, id: 'hero1' 
};

describe('Hero Entity Animation', () => {
    let hero;

    beforeEach(() => {
        // Create a new hero instance before each test
        hero = new Hero(baseHeroData);
        // Optionally override the config if not mocking the import
        hero.animationConfig = MOCK_ANIMATION_CONFIG.HERO; 
    });

    it('should initialize with IDLE state and default direction', () => {
        expect(hero.animationState).toBe('IDLE');
        expect(hero.currentFrame).toBe(0);
        expect(hero.moving).toBe(false);
        expect(hero.directionX).toBe(1); // Default facing right
    });

    it('should transition to WALK state when moving', () => {
        hero.moveToCell(1, 0); // Trigger movement
        expect(hero.moving).toBe(true);
        hero.update(0.016, {}); // Simulate a short time step
        expect(hero.animationState).toBe('WALK');
    });
    
    it('should transition back to IDLE state when movement stops', () => {
        hero.moveToCell(1, 0); // Move to (32, 0)
        hero.update(0.016, {}); // Ensure state becomes WALK
        expect(hero.animationState).toBe('WALK');
        
        // Simulate reaching the destination (adjust time based on speed if necessary)
        // For simplicity, directly set position and flags
        hero.x = GRID_CONFIG.CELL_SIZE * 1;
        hero.y = 0;
        hero.update(0.016, {}); // Call update one more time after reaching pos
        
        expect(hero.moving).toBe(false); // Check if update logic correctly sets moving to false
        expect(hero.animationState).toBe('IDLE');
        expect(hero.currentFrame).toBe(0); // Should reset frame on state change
    });

    it('should update directionX correctly when moving left or right', () => {
        // Move right
        hero.moveToCell(1, 0);
        hero.update(0.016, {}); 
        expect(hero.directionX).toBe(1);

        // Reset and move left - must set position to create a correct left movement
        hero.x = GRID_CONFIG.CELL_SIZE * 2; // Position at grid x=2
        hero.y = 0;
        hero.targetX = hero.x; // Update target to match current position
        hero.targetY = hero.y;
        hero.moving = false;
        hero.animationState = 'IDLE';
        
        // Now move to position at grid x=1 (left movement)
        hero.moveToCell(1, 0); 
        hero.update(0.016, {});
        expect(hero.directionX).toBe(-1);
    });

    describe('Frame Advancement', () => {
        const idleFrameDuration = 1 / MOCK_ANIMATION_CONFIG.HERO.IDLE.frameRate; // 1 / 2 = 0.5s
        const walkFrameDuration = 1 / MOCK_ANIMATION_CONFIG.HERO.WALK.frameRate; // 1 / 10 = 0.1s

        it('should advance IDLE frame correctly based on frameRate', () => {
            expect(hero.animationState).toBe('IDLE');
            expect(hero.currentFrame).toBe(0);

            hero.update(idleFrameDuration - 0.01, {}); // Just under duration
            expect(hero.currentFrame).toBe(0);

            hero.update(0.02, {}); // Enough to push over
            expect(hero.currentFrame).toBe(1);
            
            hero.update(idleFrameDuration, {}); 
            expect(hero.currentFrame).toBe(2);
            hero.update(idleFrameDuration, {}); 
            expect(hero.currentFrame).toBe(3);
            hero.update(idleFrameDuration, {}); // Loop back
            expect(hero.currentFrame).toBe(0);
        });

        it('should advance WALK frame correctly based on frameRate', () => {
            // Set up hero for walking animation
            hero.x = 0;
            hero.y = 0;
            hero.targetX = GRID_CONFIG.CELL_SIZE * 10; // Far enough target to keep moving
            hero.targetY = 0;
            hero.moving = true;
            hero.animationState = 'WALK';
            hero.currentFrame = 0;
            hero.frameTimer = 0;
            
            // Verify initial state
            expect(hero.animationState).toBe('WALK');
            expect(hero.currentFrame).toBe(0);
            
            // Test first frame advancement
            hero.update(walkFrameDuration - 0.01, {}); // Just under duration
            expect(hero.currentFrame).toBe(0); // Should still be first frame
            
            // Add enough time to trigger frame advancement
            hero.update(0.02, {}); // Push over threshold
            expect(hero.currentFrame).toBe(1);
            
            // Move to next frames with consistent timing
            hero.update(walkFrameDuration, {}); 
            expect(hero.currentFrame).toBe(2);
            
            hero.update(walkFrameDuration, {}); 
            expect(hero.currentFrame).toBe(3);
            
            // Loop back to 0
            hero.update(walkFrameDuration, {}); 
            expect(hero.currentFrame).toBe(0);
        });
    });

    describe('getDrawData Output', () => {
        it('should return correct data for IDLE state', () => {
            hero.animationState = 'IDLE';
            hero.currentFrame = 2;
            const data = hero.getDrawData();

            expect(data.animationSheet).toBe(MOCK_ANIMATION_CONFIG.HERO.IDLE.assetKey);
            expect(data.sourceX).toBe(2 * MOCK_ANIMATION_CONFIG.HERO.IDLE.frameWidth); // frame 2 * width
            expect(data.sourceY).toBe(0);
            expect(data.sourceWidth).toBe(MOCK_ANIMATION_CONFIG.HERO.IDLE.frameWidth);
            expect(data.sourceHeight).toBe(MOCK_ANIMATION_CONFIG.HERO.IDLE.frameHeight);
            expect(data.flipHorizontal).toBe(false);
        });

        it('should return correct data for WALK state (right)', () => {
            hero.animationState = 'WALK';
            hero.directionX = 1;
            hero.currentFrame = 1;
            const data = hero.getDrawData();

            expect(data.animationSheet).toBe(MOCK_ANIMATION_CONFIG.HERO.WALK.assetKey);
            expect(data.sourceX).toBe(1 * MOCK_ANIMATION_CONFIG.HERO.WALK.frameWidth); // frame 1 * width
            expect(data.sourceY).toBe(0);
            expect(data.sourceWidth).toBe(MOCK_ANIMATION_CONFIG.HERO.WALK.frameWidth);
            expect(data.sourceHeight).toBe(MOCK_ANIMATION_CONFIG.HERO.WALK.frameHeight);
            expect(data.flipHorizontal).toBe(false);
        });
        
        it('should return correct data for WALK state (left)', () => {
            hero.animationState = 'WALK';
            hero.directionX = -1;
            hero.currentFrame = 3;
            const data = hero.getDrawData();

            expect(data.animationSheet).toBe(MOCK_ANIMATION_CONFIG.HERO.WALK.assetKey);
            expect(data.sourceX).toBe(3 * MOCK_ANIMATION_CONFIG.HERO.WALK.frameWidth); // frame 3 * width
            expect(data.sourceY).toBe(0);
            expect(data.sourceWidth).toBe(MOCK_ANIMATION_CONFIG.HERO.WALK.frameWidth);
            expect(data.sourceHeight).toBe(MOCK_ANIMATION_CONFIG.HERO.WALK.frameHeight);
            expect(data.flipHorizontal).toBe(true); // Should be flipped
        });
    });
}); 