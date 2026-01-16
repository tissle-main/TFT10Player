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
        player.start(true);
        self.postMessage({ message: "player_init" });

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

        // Acknowledge receipt
        self.postMessage({ message: 'processor-port-received' });
        return;
    }

    // handle other messages to the worker
    // allow sending messages to the processor port if needed
    if (data && data.type === 'post-to-processor' && processorPort) {
        processorPort.postMessage(data.message);
    }
};