/**
 * Main application logic
 * Initializes the application and sets up event handlers
 */

// Application state
const AppState = {
    initialized: false,
    isHavingPermissions: false,
    isCameraActive: false,
    isScreenActive: false,
    isRecording: false,
    hasRecording: false
};

/**
 * Initialize the application
 */
function initApp() {
    try {
        if (AppState.initialized) {
            return;
        }

        Utils.log('info', 'Initializing WebRTC Playground application');

        // Set up event listeners for buttons
        setupEventListeners();

        // Mark as initialized
        AppState.initialized = true;

        Utils.log('info', 'Application initialized successfully');
    } catch (error) {
        Utils.log('error', 'Failed to initialize application', error);
        Utils.showError('Application initialization failed: ' + error.message);
    }
}

/**
 * Set up event listeners for UI controls
 */
function setupEventListeners() {
    // Request permissions button
    UI.elements.requestPermissionsBtn.addEventListener('click', async () => {
        const result = await MediaHandler.requestPermissions();
        AppState.isHavingPermissions = result;
    });

    // Open camera button
    UI.elements.openCameraBtn.addEventListener('click', async () => {
        const result = await MediaHandler.startCamera();
        AppState.isCameraActive = result;
    });

    // Stop camera button
    UI.elements.stopCameraBtn.addEventListener('click', () => {
        MediaHandler.stopCamera();
        AppState.isCameraActive = false;
    });

    // Share screen button
    UI.elements.shareScreenBtn.addEventListener('click', async () => {
        const result = await MediaHandler.startScreenShare();
        AppState.isScreenActive = result;
    });

    // Stop screen button
    UI.elements.stopScreenBtn.addEventListener('click', () => {
        MediaHandler.stopScreenShare();
        AppState.isScreenActive = false;
    });

    // Start recording button
    UI.elements.startRecordingBtn.addEventListener('click', async () => {
        const result = await RecordingHandler.startRecording();
        AppState.isRecording = result;

        // Disable certain buttons during recording
        if (result) {
            UI.elements.requestPermissionsBtn.disabled = true;
        }
    });

    // Stop recording button
    UI.elements.stopRecordingBtn.addEventListener('click', () => {
        RecordingHandler.stopRecording();
        AppState.isRecording = false;
        AppState.hasRecording = true;

        // Re-enable buttons after recording stops
        if (AppState.isHavingPermissions) {
            UI.elements.requestPermissionsBtn.disabled = false;
        }
    });

    // Play recording button
    UI.elements.playRecordingBtn.addEventListener('click', () => {
        RecordingHandler.playRecording();
    });

    // Set up unload handler to clean up resources
    window.addEventListener('beforeunload', cleanupResources);
}

/**
 * Clean up resources when the page is unloaded
 */
function cleanupResources() {
    try {
        Utils.log('info', 'Cleaning up resources');

        // Stop camera if active
        if (AppState.isCameraActive) {
            MediaHandler.stopCamera();
        }

        // Stop screen sharing if active
        if (AppState.isScreenActive) {
            MediaHandler.stopScreenShare();
        }

        // Stop recording if active
        if (AppState.isRecording) {
            RecordingHandler.stopRecording();
        }

        // Revoke recording URL if exists
        if (RecordingHandler.recordingUrl) {
            URL.revokeObjectURL(RecordingHandler.recordingUrl);
        }

        Utils.log('info', 'Resources cleaned up successfully');
    } catch (error) {
        Utils.log('error', 'Error cleaning up resources', error);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);