// tft-player-worker.js
// Worker that receives the MessagePort from the AudioWorkletNode
import { TFTAutoModePlayer } from "./audio/tft-auto-mode-player.js"
import { TFTPlayer } from "./audio/tft-player.js"
import { Tracks } from "./audio/tracks/tracks.js"

let processorPort = null;
let player = null;

self.onmessage = async (event) => {
    const data = event.data;
    // port may be delivered either as a property or in event.ports
    const transferredPort = (data && data.port) || (event.ports && event.ports[0]) || null;
    if (data && data.type === 'processor-port' && transferredPort) {
        processorPort = transferredPort;
        await Tracks.init();
        const tft = new TFTPlayer();
        player = new TFTAutoModePlayer(tft);

        // Start the port to receive messages
        if (typeof processorPort.start === 'function') processorPort.start();

        // Optional: relay messages from processor back to the main thread
        processorPort.onmessage = (ev) => {
            if (ev.data.type === 'request' && player) {
                const buffer = new Float32Array(ev.data.frames * 2);
                player.read(buffer);
                processorPort.postMessage({ type: "push", samples: buffer }, [buffer.buffer]);
            }
        };
        return;
    }
    if (data && data.type === 'start-player' && player)
    {
        player.start(data.startTrack);
    }
    if (data && data.type === 'change-tracks' && player)
    {
        player._scheduleChangeTracksIn(1);
    }
    if (data && data.type === 'change-period' && player)
    {
        player._scheduleChangePeriodIn(1);
    }
    if (data && data.type === 'add-track' && player)
    {
        player.tftPlayer.addTrack(data.group, data.trackType);
    }
    if (data && data.type === 'remove-track' && player)
    {
        player.tftPlayer.removeTrack(data.group, data.trackType);
    }
    if (data && data.type === 'set-min-change-tracks' && player)
    {
        player.minChangeTrackMinutes = Math.max(data.min, 1);
        player.maxChangeTrackMinutes = Math.max(player.maxChangeTrackMinutes, data.min);
        self.postMessage({ type: 'get-min-change-tracks', min: player.minChangeTrackMinutes });
        self.postMessage({ type: 'get-max-change-tracks', min: player.maxChangeTrackMinutes });
    }
    if (data && data.type === 'set-max-change-tracks' && player)
    {
        player.maxChangeTrackMinutes = Math.max(data.min, 1);
        player.minChangeTrackMinutes = Math.min(player.minChangeTrackMinutes, player.maxChangeTrackMinutes);
        self.postMessage({ type: 'get-min-change-tracks', min: player.minChangeTrackMinutes });
        self.postMessage({ type: 'get-max-change-tracks', min: player.maxChangeTrackMinutes });
    }
    if (data && data.type === 'set-min-change-period' && player)
    {
        player.minChangePeriodMinutes = Math.max(data.min, 1);
        player.maxChangePeriodMinutes = Math.max(player.maxChangePeriodMinutes, data.min);
        self.postMessage({ type: 'get-min-change-period', min: player.minChangePeriodMinutes });
        self.postMessage({ type: 'get-max-change-period', min: player.maxChangePeriodMinutes });
    }
    if (data && data.type === 'set-max-change-period' && player)
    {
        player.maxChangePeriodMinutes = Math.max(data.min, 1);
        player.minChangePeriodMinutes = Math.min(player.minChangePeriodMinutes, player.maxChangePeriodMinutes);
        self.postMessage({ type: 'get-min-change-period', min: player.minChangePeriodMinutes });
        self.postMessage({ type: 'get-max-change-period', min: player.maxChangePeriodMinutes });
    }
    if (data && data.type === 'get-min-change-tracks' && player)
    {
        self.postMessage({ type: 'get-min-change-tracks', min: player.minChangeTrackMinutes });
    }
    if (data && data.type === 'get-max-change-tracks' && player)
    {
        self.postMessage({ type: 'get-max-change-tracks', min: player.maxChangeTrackMinutes });
    }
    if (data && data.type === 'get-min-change-period' && player)
    {
        self.postMessage({ type: 'get-min-change-period', min: player.minChangePeriodMinutes });
    }
    if (data && data.type === 'get-max-change-period' && player)
    {
        self.postMessage({ type: 'get-max-change-period', min: player.maxChangePeriodMinutes });
    }
    if (data && data.type === 'post-to-processor' && processorPort) {
        processorPort.postMessage(data.message);
    }
};