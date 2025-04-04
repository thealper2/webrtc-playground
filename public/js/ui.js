/**
 * UI management
 * Handles button states and display modes
 */

const UI = {
    elements: {
        // Buttons
        requestPermissionsBtn: null,
        openCameraBtn: null,
        stopCameraBtn: null,
        shareScreenBtn: null,
        stopScreenBtn: null,
        startRecordingBtn: null,
        stopRecordingBtn: null,
        playRecordingBtn: null,

        // Containers and videos
        cameraContainer: null,
        screenContainer: null,
        cameraVideo: null,
        screenVideo: null,
        placeholder: null,
        recordingPlayback: null,
        playbackVideo: null
    },

    /**
     * Initialize UI elements and cache DOM references
     */
    init: function () {
        try {
            // Cache button elements
            this.elements.requestPermissionsBtn = document.getElementById('request-permissions');
            this.elements.openCameraBtn = document.getElementById('open-camera');
            this.elements.stopCameraBtn = document.getElementById('stop-camera');
            this.elements.shareScreenBtn = document.getElementById('share-screen');
            this.elements.stopScreenBtn = document.getElementById('stop-screen');
            this.elements.startRecordingBtn = document.getElementById('start-recording');
            this.elements.stopRecordingBtn = document.getElementById('stop-recording');
            this.elements.playRecordingBtn = document.getElementById('play-recording');

            // Cache container and video elements
            this.elements.cameraContainer = document.getElementById('camera-container');
            this.elements.screenContainer = document.getElementById('screen-container');
            this.elements.cameraVideo = document.getElementById('camera-video');
            this.elements.screenVideo = document.getElementById('screen-video');
            this.elements.placeholder = document.getElementById('placeholder');
            this.elements.recordingPlayback = document.getElementById('recording-playback');
            this.elements.playbackVideo = document.getElementById('playback-video');

            // Validate all elements exist
            Object.keys(this.elements).forEach(key => {
                Utils.validateNotNull(this.elements[key], key);
            });

            Utils.log('info', 'UI elements initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize UI elements', error);
            Utils.showError('UI initialization failed: ' + error.message);
        }
    },

    /**
     * Enable a button and update its styling
     * @param {HTMLElement} button - Button to enable
     * @param {boolean} [active=false] - Whether to make the button active (green)
     */
    enableButton: function (button, active = false) {
        Utils.validateNotNull(button, 'Button');
        button.disabled = false;
        button.classList.remove('disabled');

        if (active) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    },

    /**
     * Disable a button and update its styling
     * @param {HTMLElement} button - Button to disable
     */
    disableButton: function (button) {
        Utils.validateNotNull(button, 'Button');
        button.disabled = true;
        button.classList.add('disabled');
        button.classList.remove('active');
    },

    /**
     * Update UI based on camera state
     * @param {boolean} isActive - Whether camera is active
     */
    updateCameraUI: function (isActive) {
        if (isActive) {
            this.elements.cameraContainer.classList.remove('hidden');
            this.elements.placeholder.classList.remove('active');

            this.enableButton(this.elements.stopCameraBtn);
            this.disableButton(this.elements.openCameraBtn);
            this.enableButton(this.elements.startRecordingBtn);

            // If screen share is active, make camera PIP
            if (!this.elements.screenContainer.classList.contains('hidden')) {
                this.elements.cameraContainer.classList.add('pip');
            }
        } else {
            this.elements.cameraContainer.classList.add('hidden');
            this.elements.cameraContainer.classList.remove('pip');

            // If screen share is also not active, show placeholder
            if (this.elements.screenContainer.classList.contains('hidden')) {
                this.elements.placeholder.classList.add('active');
            }

            this.disableButton(this.elements.stopCameraBtn);
            this.enableButton(this.elements.openCameraBtn);

            // Disable recording if both camera and screen are inactive
            if (this.elements.screenContainer.classList.contains('hidden')) {
                this.disableButton(this.elements.startRecordingBtn);
            }
        }
    },

    /**
     * Update UI based on screen sharing state
     * @param {boolean} isActive - Whether screen sharing is active
     */
    updateScreenUI: function (isActive) {
        if (isActive) {
            this.elements.screenContainer.classList.remove('hidden');
            this.elements.placeholder.classList.remove('active');

            this.enableButton(this.elements.stopScreenBtn);
            this.disableButton(this.elements.shareScreenBtn);
            this.enableButton(this.elements.startRecordingBtn);

            // Make camera PIP if it's active
            if (!this.elements.cameraContainer.classList.contains('hidden')) {
                this.elements.cameraContainer.classList.add('pip');
            }
        } else {
            this.elements.screenContainer.classList.add('hidden');

            // If camera is also not active, show placeholder
            if (this.elements.cameraContainer.classList.contains('hidden')) {
                this.elements.placeholder.classList.add('active');
            } else {
                // Remove PIP from camera if screen share is stopped
                this.elements.cameraContainer.classList.remove('pip');
            }

            this.disableButton(this.elements.stopScreenBtn);
            this.enableButton(this.elements.shareScreenBtn);

            // Disable recording if both camera and screen are inactive
            if (this.elements.cameraContainer.classList.contains('hidden')) {
                this.disableButton(this.elements.startRecordingBtn);
            }
        }
    },

    /**
     * Update UI based on recording state
     * @param {boolean} isRecording - Whether recording is active
     */
    updateRecordingUI: function (isRecording) {
        if (isRecording) {
            this.enableButton(this.elements.stopRecordingBtn, true);
            this.disableButton(this.elements.startRecordingBtn);
            this.disableButton(this.elements.playRecordingBtn);
        } else {
            this.disableButton(this.elements.stopRecordingBtn);

            // Only enable start recording if camera or screen is active
            if (!this.elements.cameraContainer.classList.contains('hidden') ||
                !this.elements.screenContainer.classList.contains('hidden')) {
                this.enableButton(this.elements.startRecordingBtn);
            }
        }
    },

    /**
     * Update UI after permissions are granted
     */
    updateAfterPermissionsGranted: function () {
        this.disableButton(this.elements.requestPermissionsBtn);
        this.enableButton(this.elements.openCameraBtn);
        this.enableButton(this.elements.shareScreenBtn);
    },

    /**
     * Show recording playback
     * @param {string} recordingUrl - URL of the recording to play
     */
    showRecordingPlayback: function (recordingUrl) {
        Utils.validateNotNull(recordingUrl, 'Recording URL');

        this.elements.recordingPlayback.classList.remove('hidden');
        this.elements.playbackVideo.src = recordingUrl;
        this.enableButton(this.elements.playRecordingBtn);
    },

    /**
     * Hide recording playback
     */
    hideRecordingPlayback: function () {
        this.elements.recordingPlayback.classList.add('hidden');
        this.elements.playbackVideo.pause();
        this.elements.playbackVideo.src = '';
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});