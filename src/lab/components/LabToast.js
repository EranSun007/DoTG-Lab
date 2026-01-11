/**
 * Toast notification component with improved feedback
 * Shows what changed and provides undo actions
 */

/**
 * Show a toast notification
 * @param {Object} config - Configuration object
 * @param {string} config.message - Main message to display
 * @param {string} config.type - Toast type: 'success', 'error', 'info', 'warning' (default: 'success')
 * @param {number} config.duration - Duration in ms (default: 2000)
 * @param {Function} config.onUndo - Optional undo callback (shows undo button)
 * @param {string} config.detail - Optional detail text shown below message
 */
export function showToast(config) {
    const {
        message,
        type = 'success',
        duration = 2000,
        onUndo,
        detail
    } = config;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'lab-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '3000';
    toast.style.minWidth = '200px';
    toast.style.maxWidth = '350px';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
    toast.style.fontFamily = 'Arial, sans-serif';
    toast.style.fontSize = '13px';
    toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';

    // Set colors based on type
    const colors = {
        'success': { bg: '#44ff44', text: 'black' },
        'error': { bg: '#ff4444', text: 'white' },
        'info': { bg: '#4444ff', text: 'white' },
        'warning': { bg: '#ffaa44', text: 'black' }
    };

    const colorScheme = colors[type] || colors.success;
    toast.style.background = colorScheme.bg;
    toast.style.color = colorScheme.text;

    // Message container
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.justifyContent = 'space-between';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.gap = '12px';

    // Message text
    const messageContainer = document.createElement('div');
    messageContainer.style.flex = '1';

    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.fontWeight = 'bold';
    messageContainer.appendChild(messageEl);

    // Detail text (if provided)
    if (detail) {
        const detailEl = document.createElement('div');
        detailEl.textContent = detail;
        detailEl.style.fontSize = '11px';
        detailEl.style.marginTop = '3px';
        detailEl.style.opacity = '0.8';
        messageContainer.appendChild(detailEl);
    }

    contentContainer.appendChild(messageContainer);

    // Undo button (if callback provided)
    if (onUndo) {
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Undo';
        undoBtn.style.background = 'rgba(0, 0, 0, 0.2)';
        undoBtn.style.color = colorScheme.text;
        undoBtn.style.border = 'none';
        undoBtn.style.padding = '4px 8px';
        undoBtn.style.borderRadius = '3px';
        undoBtn.style.cursor = 'pointer';
        undoBtn.style.fontSize = '11px';
        undoBtn.style.fontWeight = 'bold';
        undoBtn.style.transition = 'background 0.2s ease';

        undoBtn.addEventListener('mouseenter', () => {
            undoBtn.style.background = 'rgba(0, 0, 0, 0.3)';
        });

        undoBtn.addEventListener('mouseleave', () => {
            undoBtn.style.background = 'rgba(0, 0, 0, 0.2)';
        });

        undoBtn.addEventListener('click', () => {
            onUndo();
            removeToast(toast);
        });

        contentContainer.appendChild(undoBtn);
    }

    toast.appendChild(contentContainer);

    // Add to DOM
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    // Auto-remove after duration
    const removeTimer = setTimeout(() => {
        removeToast(toast);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            clearTimeout(removeTimer);
            removeToast(toast);
        }
    });
}

/**
 * Remove toast with animation
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Show success toast (shorthand)
 * @param {string} message - Success message
 * @param {string} detail - Optional detail
 */
export function showSuccess(message, detail) {
    showToast({ message, detail, type: 'success' });
}

/**
 * Show error toast (shorthand)
 * @param {string} message - Error message
 * @param {string} detail - Optional detail
 */
export function showError(message, detail) {
    showToast({ message, detail, type: 'error', duration: 3000 });
}

/**
 * Show info toast (shorthand)
 * @param {string} message - Info message
 * @param {string} detail - Optional detail
 */
export function showInfo(message, detail) {
    showToast({ message, detail, type: 'info' });
}

/**
 * Show warning toast (shorthand)
 * @param {string} message - Warning message
 * @param {string} detail - Optional detail
 */
export function showWarning(message, detail) {
    showToast({ message, detail, type: 'warning', duration: 3000 });
}
