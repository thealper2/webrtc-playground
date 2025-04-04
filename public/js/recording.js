/**
 * Recording functionality
 * Handles recording and playback of media streams
 */

const RecordingHandler = {
    // MediaRecorder instance
    mediaRecorder: null,

    // Recording data chunks
    recordedChunks: [],

    // Recording state
    isRecording: false,

    // Recording URL
    recordingUrl: null,

    /**
     * Start recording active media streams
     * @returns {Promise<boolean>} Promise resolving to true if recording started successfully
     */
    startRecording: async function () {
        try {
            if (this.isRecording) {
                Utils.log('warn', 'Recording is already in progress');
                return true;
            }

            // Validate we have media to record
            if (!MediaHandler.isAnyMediaActive()) {
                throw new Error('No media is active. Start camera or screen sharing first.');
            }

            Utils.log('info', 'Starting recording');

            // Get active streams
            const mediaStream = MediaHandler.getActiveStreamsForRecording();

            // Reset recorded chunks
            this.recordedChunks = [];

            // Create recorder with optimal settings
            this.mediaRecorder = new MediaRecorder(mediaStream, {
                mimeType: this.getSupportedMimeType(),
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });

            // Handle data available event
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            // Handle recording stop
            this.mediaRecorder.onstop = () => {
                Utils.log('info', 'Recording stopped');
                this.isRecording = false;
                this.processRecording();
                UI.updateRecordingUI(false);
            };

            // Handle recording errors
            this.mediaRecorder.onerror = (error) => {
                Utils.log('error', 'MediaRecorder error', error);
                Utils.showError('Recording error: ' + error.name);
                this.isRecording = false;
                UI.updateRecordingUI(false);
            };

            // Start recording with 1-second chunks
            this.mediaRecorder.start(1000);
            this.isRecording = true;

            // Update UI
            UI.updateRecordingUI(true);

            Utils.log('info', 'Recording started successfully');
            return true;
        } catch (error) {
            Utils.log('error', 'Failed to start recording', error);
            Utils.showError('Failed to start recording: ' + error.message);
            return false;
        }
    },

    /**
     * Stop the current recording
     */
    stopRecording: function () {
        try {
            if (!this.isRecording || !this.mediaRecorder) {
                Utils.log('warn', 'No active recording to stop');
                return;
            }

            Utils.log('info', 'Stopping recording');

            // Stop the media recorder
            this.mediaRecorder.stop();

            // Update recording state
            this.isRecording = false;

            // The UI will be updated in the onstop handler
        } catch (error) {
            Utils.log('error', 'Error stopping recording', error);
            Utils.showError('Error stopping recording: ' + error.message);
            this.isRecording = false;
            UI.updateRecordingUI(false);
        }
    },

    /**
     * Process the recorded chunks into a playable URL
     */
    processRecording: function () {
        try {
            if (this.recordedChunks.length === 0) {
                Utils.log('warn', 'No recorded data to process');
                return;
            }

            Utils.log('info', 'Processing recording chunks');

            // Create a Blob from the recorded chunks
            const blob = new Blob(this.recordedChunks, {
                type: this.getSupportedMimeType()
            });

            // Release any previous recording URL
            if (this.recordingUrl) {
                URL.revokeObjectURL(this.recordingUrl);
            }

            // Create a URL for the recording blob
            this.recordingUrl = URL.createObjectURL(blob);

            // Show the recording in the UI
            UI.showRecordingPlayback(this.recordingUrl);

            Utils.log('info', 'Recording processed successfully');
        } catch (error) {
            Utils.log('error', 'Error processing recording', error);
            Utils.showError('Error processing recording: ' + error.message);
        }
    },

    /**
     * Play the recorded video
     */
    playRecording: function () {
        try {
            if (!this.recordingUrl) {
                Utils.log('warn', 'No recording to play');
                return;
            }

            Utils.log('info', 'Playing recording');

            // Play the video
            UI.elements.playbackVideo.play();
        } catch (error) {
            Utils.log('error', 'Error playing recording', error);
            Utils.showError('Error playing recording: ' + error.message);
        }
    },

    /**
     * Get supported MIME type for recording
     * @returns {string} Supported MIME type
     */
    getSupportedMimeType: function () {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4'
        ];

        for (let type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'video/webm'; // Fallback
    }
};