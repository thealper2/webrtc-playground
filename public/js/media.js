/**
 * Media handling functionality
 * Manages camera, microphone and screen sharing streams
 */

const MediaHandler = {
    // Media streams
    cameraStream: null,
    screenStream: null,

    // Media constraints
    cameraConstraints: {
        audio: true,
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
        }
    },

    screenConstraints: {
        video: {
            cursor: "always"
        },
        audio: false
    },

    // Permission status
    hasPermissions: false,

    /**
     * Request camera and microphone permissions from the user
     * @returns {Promise<boolean>} Promise resolving to true if permissions granted
     */
    requestPermissions: async function () {
        try {
            Utils.log('info', 'Requesting camera and microphone permissions');

            // Request permission without starting a stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

            // Stop all tracks to not use resources
            stream.getTracks().forEach(track => track.stop());

            this.hasPermissions = true;
            Utils.log('info', 'Camera and microphone permissions granted');

            // Update UI to reflect permission status
            UI.updateAfterPermissionsGranted();

            return true;
        } catch (error) {
            Utils.log('error', 'Failed to get camera and microphone permissions', error);
            Utils.showError('Permission denied for camera or microphone');
            return false;
        }
    },

    /**
     * Start camera stream
     * @returns {Promise<boolean>} Promise resolving to true if camera started successfully
     */
    startCamera: async function () {
        try {
            if (this.cameraStream) {
                Utils.log('warn', 'Camera is already active');
                return true;
            }

            Utils.log('info', 'Starting camera stream');

            // Get user media with camera and microphone
            this.cameraStream = await navigator.mediaDevices.getUserMedia(this.cameraConstraints);

            // Connect stream to video element
            UI.elements.cameraVideo.srcObject = this.cameraStream;

            // Update UI
            UI.updateCameraUI(true);

            Utils.log('info', 'Camera stream started successfully');
            return true;
        } catch (error) {
            Utils.log('error', 'Failed to start camera stream', error);
            Utils.showError('Failed to start camera: ' + error.message);
            return false;
        }
    },

    /**
     * Stop camera stream
     */
    stopCamera: function () {
        try {
            if (!this.cameraStream) {
                Utils.log('warn', 'No camera stream to stop');
                return;
            }

            Utils.log('info', 'Stopping camera stream');

            // Stop all tracks in the stream
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;

            // Clear video source
            UI.elements.cameraVideo.srcObject = null;

            // Update UI
            UI.updateCameraUI(false);

            Utils.log('info', 'Camera stream stopped successfully');
        } catch (error) {
            Utils.log('error', 'Error stopping camera stream', error);
            Utils.showError('Error stopping camera: ' + error.message);
        }
    },

    /**
     * Start screen sharing
     * @returns {Promise<booelan>} Promise resolving to true if screen sharing started successfully
     */
    startScreenShare: async function () {
        try {
            if (this.screenStream) {
                Utils.log('warn', 'Screen sharing is already active');
                return true;
            }

            Utils.log('info', 'Starting screen sharing');

            // Get display media for screen sharing
            this.screenStream = await navigator.mediaDevices.getDisplayMedia(this.screenConstraints);

            // Connect stream to video element
            UI.elements.screenVideo.srcObject = this.screenStream;

            // Listen for when user stops screen sharing using the browser's control
            this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                this.stopScreenShare();
            });

            // Update UI
            UI.updateScreenUI(true);

            Utils.log('info', 'Screen sharing started successfully');
            return true;
        } catch (error) {
            Utils.log('error', 'Failed to start screen sharing', error);
            Utils.showError('Failed to start screen sharing: ' + error.message);
            return false;
        }
    },

    /**
     * Stop screen sharing
     */
    stopScreenShare: function () {
        try {
            if (!this.screenStream) {
                Utils.log('warn', 'No screen sharing stream to stop');
                return;
            }

            Utils.log('info', 'Stopping screen sharing');

            // Stop all tracks in the stream
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;

            // Clear video source
            UI.elements.screenVideo.srcObject = null;

            // Update UI
            UI.updateScreenUI(false);

            Utils.log('info', 'Screen sharing stopped successfully');
        } catch (error) {
            Utils.log('error', 'Error stopping screen sharing', error);
            Utils.showError('Error stopping screen sharing: ' + error.message);
        }
    },

    /**
     * Get active streams for recording
     * @returns {MediaStream} Combined media stream for recording
     */
    getActiveStreamsForRecording: function () {
        try {
            const tracks = [];

            // Add camera and microphone tracks if available
            if (this.cameraStream) {
                this.cameraStream.getTracks().forEach(track => tracks.push(track.clone()));
            }

            // Add screen tracks if available
            if (this.screenStream) {
                this.screenStream.getVideoTracks().forEach(track => tracks.push(track.clone()));
            }

            if (tracks.length === 0) {
                throw new Error('No active streams to record');
            }

            // Create a new MediaStream with all tracks
            return new MediaStream(tracks);
        } catch (error) {
            Utils.log('error', 'Error getting active streams for recording', error);
            throw error;
        }
    },

    /**
     * Check if any media is active
     * @returns {boolean} True if camera or screen is active
     */
    isAnyMediaActive: function () {
        return Boolean(this.cameraStream || this.screenStream);
    }
};