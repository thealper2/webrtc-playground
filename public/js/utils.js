/**
 * Utility functions
 */

const Utils = {
    /**
     * Validate that a value is not null or undefined
     * @param {*} value - Value to check
     * @param {string} name - Name of the parameter for error message
     * @throws {Error} If value is null or undefined
     */
    validateNotNull: function (value, name) {
        if (value === null || value === undefined) {
            throw new Error(`${name} cannot be null or undefined`);
        }
    },

    /**
     * Check if the browser supports required WebRTC features
     * @returns {boolean} True if browser supports all required features
     */
    checkBrowserSupport: function () {
        return !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia &&
            window.MediaRecorder &&
            'srcObject' in document.createElement('video')
        );
    },

    /**
     * Display an error message to the user
     * @param {string} message - Error message to display
     */
    showError: function (message) {
        const errorContainer = document.getElementById('error-notification');
        const errorMessage = document.getElementById('error-message');

        this.validateNotNull(errorContainer, 'Error container');
        this.validateNotNull(errorMessage, 'Error message element');

        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
    },

    /**
     * Log messages to console with timestamp
     * @param {string} level - Log level (log, warn, error, info)
     * @param {string} message - Message to log
     * @param {Object} [data] - Optional data to log
     */
    log: function (level, message, data) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] ${message}`;

        if (data) {
            console[level](formattedMessage, data);
        } else {
            console[level](formattedMessage);
        }
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId: function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
};

// Add event listener for error notification close button
document.addEventListener('DOMContentLoaded', () => {
    const closeErrorBtn = document.getElementById('close-error');
    if (closeErrorBtn) {
        closeErrorBtn.addEventListener('click', () => {
            document.getElementById('error-notification').classList.add('hidden');
        });
    }

    // Check browser support when page loads
    if (!Utils.checkBrowserSupport()) {
        Utils.showError('Your browser does not support some WebRTC features required for this application');
    }
});