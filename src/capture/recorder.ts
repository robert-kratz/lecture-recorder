import dotenv from 'dotenv';
import OBSWebSocket from 'obs-websocket-js';

dotenv.config();

const sceneName = 'Puppeteer Capture';

class OBSRecorder {
    private readonly obs: any;

    private recording = false;
    private connected = false;

    /**
     * Create a new OBSRecorder
     */
    constructor() {
        this.obs = new OBSWebSocket();

        this.obs.on('ConnectionOpened', () => {
            console.log('[OBS] Connection opened');
        });

        this.obs.on('ConnectionClosed', () => {
            console.log('[OBS] Connection closed');
            this.connected = false;
        });

        this.obs.on('error', (error: Error) => {
            console.error('[OBS] Error:', error);
        });
    }

    /**
     * Connect to OBS
     */
    connect = async () => {
        try {
            const password = process.env.OBS_WS_PASSWORD || '';
            await this.obs.connect('ws://localhost:4455', password);
            console.log('Connected to OBS');
        } catch (error) {
            console.error('Error connecting to OBS:', error);
            process.exit(1);
        }
        this.connected = true;

        try {
            await this.obs.call('SetCurrentProgramScene', { sceneName });
            console.log(`Switched to scene: ${sceneName}`);
        } catch (error) {
            console.error('Error switching to scene:', error);
            process.exit(1);
        }
    };

    /**
     * Start recording the current page
     * @param pageTitle
     */
    startRecording = async (pageTitle: string) => {
        if (this.recording) throw new Error('Already recording');
        if (!this.connected) throw new Error('Not connected to OBS');

        await this.obs.call('SetInputSettings', {
            inputName: 'Puppeteer Browser', // The name of your OBS window capture source
        });

        await this.obs.call('StartRecord', { filePath: `${pageTitle}.mp4` });
    };

    /**
     * Stop recording the current page
     */
    stopRecording = async () => {
        if (!this.recording) throw new Error('Not recording');
        if (!this.connected) throw new Error('Not connected to OBS');

        await this.obs.call('StopRecord');
        console.log('Recording stopped');
        this.recording = false;
    };

    /**
     * Check if the recorder is currently recording
     * @returns
     */
    isRecording = () => this.recording;

    /**
     * Disconnect from OBS
     */
    disconnect = async () => {
        if (this.connected) {
            await this.obs.disconnect();
            console.log('Disconnected from OBS');
        } else {
            console.warn('Not connected to OBS');
        }
    };
}

export { OBSRecorder };
