/**
 * Enhanced input component with increment/decrement controls
 * Provides quick adjustment buttons for numeric values with smart increments
 */

/**
 * Validate input value based on property type
 * @param {number} value - Value to validate
 * @param {string} type - Property type
 * @returns {Object} Validation result { valid, error, corrected }
 */
function validateInput(value, type) {
    const result = { valid: true, error: null, corrected: value };

    // Check if numeric
    if (isNaN(value)) {
        return { valid: false, error: 'Must be a number', corrected: 0 };
    }

    // Type-specific validation
    switch (type) {
        case 'damage':
        case 'health':
        case 'cost':
        case 'value':
            if (value < 0) {
                return { valid: false, error: 'Cannot be negative', corrected: 0 };
            }
            break;
        case 'range':
        case 'projectileSpeed':
            if (value < 0) {
                return { valid: false, error: 'Cannot be negative', corrected: 0 };
            }
            if (value > 1000) {
                return { valid: false, error: 'Too large (max: 1000)', corrected: 1000 };
            }
            break;
        case 'speed':
        case 'attackSpeed':
            if (value <= 0) {
                return { valid: false, error: 'Must be greater than 0', corrected: 0.1 };
            }
            if (value > 100) {
                return { valid: false, error: 'Too large (max: 100)', corrected: 100 };
            }
            break;
        case 'angle':
            if (value < 0) {
                return { valid: false, error: 'Cannot be negative', corrected: 0 };
            }
            if (value > 360) {
                return { valid: false, error: 'Max angle is 360°', corrected: 360 };
            }
            break;
    }

    return result;
}

/**
 * Get smart increment values based on property type
 * @param {string} type - Property type (damage, range, speed, cost, health, attackSpeed)
 * @returns {Array<number>} Array of increment values [small, medium, large]
 */
function getSmartIncrements(type) {
    const incrementMap = {
        'damage': [1, 5, 10],
        'range': [10, 25, 50],
        'speed': [0.1, 0.5, 1.0],
        'attackSpeed': [0.1, 0.5, 1.0],
        'cost': [5, 10, 25],
        'health': [10, 50, 100],
        'projectileSpeed': [10, 25, 50],
        'projectileSize': [1, 2, 5],
        'splashRadius': [5, 10, 20],
        'splashDamage': [1, 5, 10],
        'width': [5, 10, 20],
        'height': [5, 10, 20],
        'value': [1, 5, 10],
        'angle': [15, 45, 90]
    };

    return incrementMap[type] || [1, 5, 10];
}

/**
 * Create enhanced input with increment/decrement controls
 * @param {Object} config - Configuration object
 * @param {string} config.label - Display label for the input
 * @param {number} config.value - Current value
 * @param {Function} config.onChange - Callback when value changes (receives new value)
 * @param {string} config.type - Property type for smart increments
 * @param {Array<number>} config.increments - Custom increment values (overrides smart increments)
 * @param {number} config.step - Step value for direct input (default: 1 or 0.1 for floats)
 * @param {number} config.min - Minimum allowed value
 * @param {number} config.max - Maximum allowed value
 * @returns {HTMLElement} Container element with label, input, and control buttons
 */
export function createLabInput(config) {
    const {
        label,
        value,
        onChange,
        type = 'number',
        increments: customIncrements,
        step,
        min,
        max
    } = config;

    // Get increment values
    const increments = customIncrements || getSmartIncrements(type);
    const isFloat = type === 'speed' || type === 'attackSpeed' || increments.some(inc => inc < 1);
    const inputStep = step || (isFloat ? 0.1 : 1);

    // Create container
    const container = document.createElement('div');
    container.className = 'lab-input-container';
    container.style.marginBottom = '10px';

    // Create label and input row
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.marginBottom = '5px';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'lab-input-label';
    labelEl.style.fontSize = '12px';
    labelEl.style.color = '#fff';

    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    input.step = inputStep;
    if (min !== undefined) input.min = min;
    if (max !== undefined) input.max = max;
    input.className = 'lab-input';
    input.style.width = '60px';
    input.style.textAlign = 'right';
    input.style.background = '#333';
    input.style.color = 'white';
    input.style.border = '1px solid #444';
    input.style.borderRadius = '3px';
    input.style.padding = '4px 6px';
    input.style.fontSize = '12px';

    // Error message element
    let errorMsg = null;

    // Handle input changes
    input.addEventListener('change', (e) => {
        let newValue = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value);

        // Validate input
        const validation = validateInput(newValue, type);

        if (!validation.valid) {
            // Show error
            showError(validation.error);
            input.classList.add('error');
            input.style.borderColor = '#ff4444';
            input.style.background = 'rgba(255, 68, 68, 0.1)';

            // Auto-correct after 2 seconds
            setTimeout(() => {
                input.value = validation.corrected;
                input.classList.remove('error');
                input.style.borderColor = '#444';
                input.style.background = '#333';
                hideError();
                onChange(validation.corrected);
                flashChanged(input);
            }, 2000);
            return;
        }

        // Additional min/max checks
        if (isNaN(newValue)) newValue = value;
        if (min !== undefined && newValue < min) newValue = min;
        if (max !== undefined && newValue > max) newValue = max;

        input.value = newValue;
        input.classList.remove('error');
        input.style.borderColor = '#444';
        input.style.background = '#333';
        hideError();
        onChange(newValue);
        flashChanged(input);
    });

    // Show error message
    function showError(message) {
        hideError(); // Remove existing error

        errorMsg = document.createElement('div');
        errorMsg.style.fontSize = '10px';
        errorMsg.style.color = '#ff4444';
        errorMsg.style.marginTop = '4px';
        errorMsg.style.padding = '4px 6px';
        errorMsg.style.background = 'rgba(255, 68, 68, 0.1)';
        errorMsg.style.borderRadius = '3px';
        errorMsg.style.border = '1px solid #ff4444';
        errorMsg.textContent = `⚠️ ${message}`;
        container.insertBefore(errorMsg, controlsRow);
    }

    // Hide error message
    function hideError() {
        if (errorMsg) {
            errorMsg.remove();
            errorMsg = null;
        }
    }

    // Keyboard shortcuts
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const direction = e.key === 'ArrowUp' ? 1 : -1;
            let increment;

            if (e.shiftKey) {
                increment = increments[2]; // Large increment
            } else if (e.altKey) {
                increment = increments[0]; // Small increment
            } else {
                increment = increments[1]; // Medium increment
            }

            adjustValue(direction * increment);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        }
    });

    row.appendChild(labelEl);
    row.appendChild(input);
    container.appendChild(row);

    // Create increment/decrement buttons
    const controlsRow = document.createElement('div');
    controlsRow.className = 'lab-input-controls';
    controlsRow.style.display = 'flex';
    controlsRow.style.gap = '4px';
    controlsRow.style.justifyContent = 'flex-end';

    // Create button for each increment value (negative and positive)
    increments.reverse().forEach(increment => {
        // Decrease button
        const decBtn = createControlButton(`-${formatIncrement(increment)}`, () => {
            adjustValue(-increment);
        });
        controlsRow.appendChild(decBtn);
    });

    increments.reverse(); // Restore order

    increments.forEach(increment => {
        // Increase button
        const incBtn = createControlButton(`+${formatIncrement(increment)}`, () => {
            adjustValue(increment);
        });
        controlsRow.appendChild(incBtn);
    });

    container.appendChild(controlsRow);

    // Helper function to adjust value
    function adjustValue(delta) {
        let currentValue = isFloat ? parseFloat(input.value) : parseInt(input.value);
        if (isNaN(currentValue)) currentValue = value;

        let newValue = currentValue + delta;

        // Apply constraints
        if (min !== undefined && newValue < min) newValue = min;
        if (max !== undefined && newValue > max) newValue = max;

        // Round floats to avoid precision issues
        if (isFloat) {
            newValue = Math.round(newValue * 10) / 10;
        }

        input.value = newValue;
        onChange(newValue);
        flashChanged(input);
    }

    return container;
}

/**
 * Create a control button (increment/decrement)
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Button element
 */
function createControlButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'lab-control-btn';
    btn.style.padding = '3px 8px';
    btn.style.fontSize = '10px';
    btn.style.background = '#444';
    btn.style.color = '#44aaff';
    btn.style.border = '1px solid #555';
    btn.style.borderRadius = '3px';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'all 0.15s ease';
    btn.style.fontFamily = 'monospace';
    btn.style.fontWeight = 'bold';

    // Hover effect
    btn.addEventListener('mouseenter', () => {
        btn.style.background = '#555';
        btn.style.color = '#66ccff';
        btn.style.borderColor = '#44aaff';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.background = '#444';
        btn.style.color = '#44aaff';
        btn.style.borderColor = '#555';
    });

    // Click effect
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
    });

    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1)';
    });

    // Hold to repeat functionality
    let repeatTimer = null;
    let repeatInterval = null;

    btn.addEventListener('mousedown', () => {
        onClick(); // Immediate action

        // Start repeating after 500ms
        repeatTimer = setTimeout(() => {
            repeatInterval = setInterval(() => {
                onClick();
            }, 100); // Repeat every 100ms
        }, 500);
    });

    btn.addEventListener('mouseup', () => {
        clearTimeout(repeatTimer);
        clearInterval(repeatInterval);
    });

    btn.addEventListener('mouseleave', () => {
        clearTimeout(repeatTimer);
        clearInterval(repeatInterval);
    });

    btn.onclick = (e) => {
        e.preventDefault(); // Prevent any default behavior
    };

    return btn;
}

/**
 * Format increment value for display
 * @param {number} increment - Increment value
 * @returns {string} Formatted string
 */
function formatIncrement(increment) {
    if (increment < 1) {
        return increment.toFixed(1);
    }
    return increment.toString();
}

/**
 * Flash visual feedback on value change
 * @param {HTMLElement} element - Element to flash
 */
function flashChanged(element) {
    element.style.borderColor = '#44ff44';
    element.style.boxShadow = '0 0 0 2px rgba(68, 255, 68, 0.2)';

    setTimeout(() => {
        element.style.borderColor = '#444';
        element.style.boxShadow = 'none';
    }, 300);
}
