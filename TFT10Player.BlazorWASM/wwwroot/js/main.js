async function start(options = {})
{
    const processorPath = options.processorPath || './js/tft-player-audio-processor.js';
    const workerPath = options.workerPath || './js/tft-player-worker.js';
    const channelCount = options.channelCount || 2;
    const bufferSeconds = (typeof options.bufferSeconds === 'number') ? options.bufferSeconds : 2.0;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Ensure audio worklet module is loaded
    await audioContext.audioWorklet.addModule(processorPath);

    // Create the AudioWorkletNode with processor options
    const node = new AudioWorkletNode(audioContext, 'tft-player-audio-processor', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [channelCount],
        processorOptions: {
            channelCount: channelCount,
            bufferSeconds: bufferSeconds
        }
    });

    // Connect node to destination so sound is audible
    node.connect(audioContext.destination);

    // Create worker and transfer the node.port to it so worker <-> processor communication is direct
    const worker = new Worker(workerPath, { type: 'module' });

    // Transfer the MessagePort from the AudioWorkletNode to the Worker
    // The worker is expected to take ownership of the port and communicate directly with the processor
    worker.postMessage({ type: 'processor-port', port: node.port }, [node.port]);
    worker.onmessage = async (ev) =>
    {
        console.log(ev);
        if (ev.data.type === 'get-min-change-tracks')
        {
            await window.DotNet.invokeMethodAsync("TFT10Player.BlazorWASM", "GetMinChangeTracksMinutesCallback", ev.data.min);
        }
        if (ev.data.type === 'get-max-change-tracks')
        {
            await window.DotNet.invokeMethodAsync("TFT10Player.BlazorWASM", "GetMaxChangeTracksMinutesCallback", ev.data.min);
        }
        if (ev.data.type === 'get-min-change-period')
        {
            await window.DotNet.invokeMethodAsync("TFT10Player.BlazorWASM", "GetMinChangePeriodMinutesCallback", ev.data.min);
        }
        if (ev.data.type === 'get-max-change-period')
        {
            await window.DotNet.invokeMethodAsync("TFT10Player.BlazorWASM", "GetMaxChangePeriodMinutesCallback", ev.data.min);
        }
    }

    // Return control handles
    return {
        audioContext,
        node,
        worker,
        resume: async () =>
        {
            await audioContext.resume();
        },
        pause: async () =>
        {
            await audioContext.suspend();
        },
        close: async () =>
        {
            try
            {
                node.disconnect();
            }
            catch (e) {}
            try
            {
                await audioContext.close();
            }
            catch (e) {}
            try
            {
                worker.terminate();
            }
            catch (e) {}
        },
        changeTracks: async () =>
        {
            worker.postMessage({ type: 'change-tracks' });
        },
        changePeriod: async () =>
        {
            worker.postMessage({ type: 'change-period' });
        },
        addTrack: async (group, type) =>
        {
            worker.postMessage({ type: 'add-track', group: group, trackType: type });
        },
        removeTrack: async (group, type) =>
        {
            worker.postMessage({ type: 'remove-track', group: group, trackType: type });
        },
        setMinChangeTracksMinutes: async (min) =>
        {
            worker.postMessage({ type: 'set-min-change-tracks', min: min });
        },
        setMaxChangeTracksMinutes: async (min) =>
        {
            worker.postMessage({ type: 'set-max-change-tracks', min: min });
        },
        setMinChangePeriodMinutes: async (min) =>
        {
            worker.postMessage({ type: 'set-min-change-period', min: min });
        },
        setMaxChangePeriodMinutes: async (min) =>
        {
            worker.postMessage({ type: 'set-max-change-period', min: min });
        },
        getMinChangeTracksMinutes: async () =>
        {
            worker.postMessage({ type: 'get-min-change-tracks' });
        },
        getMaxChangeTracksMinutes: async () =>
        {
            worker.postMessage({ type: 'get-max-change-tracks' });
        },
        getMinChangePeriodMinutes: async () =>
        {
            worker.postMessage({ type: 'get-min-change-period' });
        },
        getMaxChangePeriodMinutes: async () =>
        {
            worker.postMessage({ type: 'get-max-change-period' });
        },
    };
}
window.tftplayer = await start();