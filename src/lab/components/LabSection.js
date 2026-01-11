/**
 * Collapsible section component with preview support
 * Shows summary stats when collapsed for better scannability
 */

/**
 * Create a collapsible section with optional preview
 * @param {Object} config - Configuration object
 * @param {string} config.title - Section title
 * @param {string} config.preview - Preview text shown when collapsed (optional)
 * @param {boolean} config.startExpanded - Whether to start expanded (default: true)
 * @param {Function} config.onToggle - Callback when section is toggled (receives isExpanded)
 * @param {boolean} config.autoCollapseSiblings - Auto-collapse other sections when expanding
 * @returns {HTMLElement} Section container element
 */
export function createLabSection(config) {
    const {
        title,
        preview = '',
        startExpanded = true,
        onToggle,
        autoCollapseSiblings = false
    } = config;

    // Create section container
    const section = document.createElement('div');
    section.className = 'lab-section';
    section.style.background = '#2a2a2a';
    section.style.padding = '10px';
    section.style.marginBottom = '10px';
    section.style.borderRadius = '5px';
    section.style.transition = 'all 0.2s ease';

    // Create header
    const header = document.createElement('div');
    header.className = 'lab-section-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.cursor = 'pointer';
    header.style.marginBottom = '10px';
    header.style.userSelect = 'none';

    // Title and preview container
    const titleContainer = document.createElement('div');
    titleContainer.style.flex = '1';

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.className = 'lab-section-title';
    titleEl.style.margin = '0';
    titleEl.style.fontSize = '14px';
    titleEl.style.color = '#888';
    titleEl.style.fontWeight = 'bold';
    titleContainer.appendChild(titleEl);

    // Preview text (shown when collapsed)
    const previewEl = document.createElement('div');
    previewEl.className = 'lab-section-preview';
    previewEl.style.fontSize = '11px';
    previewEl.style.color = '#666';
    previewEl.style.marginTop = '3px';
    previewEl.style.fontFamily = 'monospace';
    previewEl.style.display = startExpanded ? 'none' : 'block';
    if (preview) {
        previewEl.textContent = preview;
    }
    titleContainer.appendChild(previewEl);

    // Arrow indicator
    const arrow = document.createElement('span');
    arrow.className = 'lab-section-arrow';
    arrow.textContent = '▼';
    arrow.style.color = '#888';
    arrow.style.fontSize = '12px';
    arrow.style.transition = 'transform 0.2s ease';
    arrow.style.marginLeft = '10px';
    arrow.style.flexShrink = '0';

    if (!startExpanded) {
        arrow.style.transform = 'rotate(-90deg)';
    }

    header.appendChild(titleContainer);
    header.appendChild(arrow);

    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'lab-section-content';
    contentContainer.style.display = startExpanded ? 'block' : 'none';

    // Track state
    let isExpanded = startExpanded;

    // Toggle functionality
    const toggle = () => {
        isExpanded = !isExpanded;

        // Animate arrow
        arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';

        // Toggle content
        if (isExpanded) {
            contentContainer.style.display = 'block';
            previewEl.style.display = 'none';
            section.style.background = '#2a2a2a';
        } else {
            contentContainer.style.display = 'none';
            previewEl.style.display = 'block';
            section.style.background = '#222';
        }

        // Auto-collapse siblings if enabled
        if (isExpanded && autoCollapseSiblings) {
            collapseSiblings(section);
        }

        // Call toggle callback
        if (onToggle) {
            onToggle(isExpanded);
        }
    };

    header.addEventListener('click', toggle);

    // Assemble section
    section.appendChild(header);
    section.appendChild(contentContainer);

    // Public API
    section.labSection = {
        /**
         * Update preview text
         * @param {string} newPreview - New preview text
         */
        setPreview: (newPreview) => {
            previewEl.textContent = newPreview;
        },

        /**
         * Get content container for adding children
         * @returns {HTMLElement} Content container
         */
        getContent: () => contentContainer,

        /**
         * Expand the section
         */
        expand: () => {
            if (!isExpanded) toggle();
        },

        /**
         * Collapse the section
         */
        collapse: () => {
            if (isExpanded) toggle();
        },

        /**
         * Check if section is expanded
         * @returns {boolean} True if expanded
         */
        isExpanded: () => isExpanded,

        /**
         * Toggle section programmatically
         */
        toggle: toggle
    };

    return section;
}

/**
 * Collapse all sibling sections
 * @param {HTMLElement} currentSection - The section to keep expanded
 */
function collapseSiblings(currentSection) {
    const parent = currentSection.parentElement;
    if (!parent) return;

    const siblings = Array.from(parent.children).filter(
        child => child !== currentSection && child.labSection
    );

    siblings.forEach(sibling => {
        if (sibling.labSection && sibling.labSection.isExpanded()) {
            sibling.labSection.collapse();
        }
    });
}

/**
 * Helper function to generate preview text from data object
 * @param {Object} data - Data object with properties
 * @param {Array<string>} keys - Keys to include in preview
 * @returns {string} Formatted preview text
 */
export function generatePreview(data, keys) {
    return keys
        .filter(key => data[key] !== undefined)
        .map(key => {
            let value = data[key];
            // Format numbers
            if (typeof value === 'number') {
                value = value % 1 === 0 ? value : value.toFixed(1);
            }
            // Abbreviate key names
            const abbrev = abbreviateKey(key);
            return `${abbrev}: ${value}`;
        })
        .join(' | ');
}

/**
 * Abbreviate property keys for compact display
 * @param {string} key - Property key
 * @returns {string} Abbreviated key
 */
function abbreviateKey(key) {
    const abbreviations = {
        'damage': 'Dmg',
        'range': 'Rng',
        'attackSpeed': 'AS',
        'speed': 'Spd',
        'cost': 'Cost',
        'health': 'HP',
        'projectileSpeed': 'ProjSpd',
        'projectileSize': 'Size',
        'splashRadius': 'Splash',
        'splashDamage': 'SplashDmg',
        'value': 'Val',
        'width': 'W',
        'height': 'H'
    };

    return abbreviations[key] || key;
}
