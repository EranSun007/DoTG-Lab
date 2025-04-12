import { UIComponent } from './UIComponent.js';

/**
 * Handles game notifications and alerts
 * @extends UIComponent
 */
export class NotificationUI extends UIComponent {
    /**
     * @param {Object} options - Component configuration
     * @param {HTMLElement} options.container - Container element
     * @param {Object} options.config - Notification configuration
     * @param {number} options.config.duration - Default notification duration in ms
     */
    constructor({ container, config = { duration: 3000 } }) {
        super({ id: 'notification-ui', container });
        
        this.config = config;
        this.activeNotifications = new Set();
    }

    /**
     * Show a notification message
     * @param {Object} options - Notification options
     * @param {string} options.message - Message to display
     * @param {string} [options.type='info'] - Notification type (info, success, warning, error)
     * @param {number} [options.duration] - Duration in ms (overrides default)
     * @returns {HTMLElement} The notification element
     */
    show({ message, type = 'info', duration = this.config.duration }) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to container
        this.container.appendChild(notification);
        this.activeNotifications.add(notification);

        // Trigger enter animation
        requestAnimationFrame(() => {
            notification.classList.add('notification-visible');
        });

        // Set up auto-removal
        setTimeout(() => {
            this.hide(notification);
        }, duration);

        return notification;
    }

    /**
     * Hide a specific notification
     * @param {HTMLElement} notification - Notification element to hide
     */
    hide(notification) {
        if (!this.activeNotifications.has(notification)) {
            return;
        }

        // Trigger exit animation
        notification.classList.remove('notification-visible');
        notification.classList.add('notification-hidden');

        // Remove after animation
        notification.addEventListener('transitionend', () => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
                this.activeNotifications.delete(notification);
            }
        }, { once: true });
    }

    /**
     * Show an info notification
     * @param {string} message - Message to display
     * @param {number} [duration] - Optional custom duration
     */
    info(message, duration) {
        this.show({ message, type: 'info', duration });
    }

    /**
     * Show a success notification
     * @param {string} message - Message to display
     * @param {number} [duration] - Optional custom duration
     */
    success(message, duration) {
        this.show({ message, type: 'success', duration });
    }

    /**
     * Show a warning notification
     * @param {string} message - Message to display
     * @param {number} [duration] - Optional custom duration
     */
    warning(message, duration) {
        this.show({ message, type: 'warning', duration });
    }

    /**
     * Show an error notification
     * @param {string} message - Message to display
     * @param {number} [duration] - Optional custom duration
     */
    error(message, duration) {
        this.show({ message, type: 'error', duration });
    }

    /**
     * Clear all active notifications
     */
    clearAll() {
        this.activeNotifications.forEach(notification => {
            this.hide(notification);
        });
    }

    /**
     * Clean up the notification UI
     */
    destroy() {
        this.clearAll();
        this.activeNotifications.clear();
        super.destroy();
    }
} 