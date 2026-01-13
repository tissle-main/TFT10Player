class CircularBuffer {
  constructor(capacitySamples) {
    this.capacity = capacitySamples;
    this.buffer = new Float32Array(this.capacity);
    this.readIndex = 0; // in samples
    this.writeIndex = 0; // in samples
    this.available = 0; // in samples
  }

  clear() {
    this.readIndex = 0;
    this.writeIndex = 0;
    this.available = 0;
  }

  availableFrames(channelCount) {
    return Math.floor(this.available / channelCount);
  }

  // write interleaved samples (Float32Array)
  push(interleaved) {
    const len = interleaved.length;
    if (len === 0) return 0;
    if (len > this.capacity) {
      // If incoming chunk larger than capacity, keep only the tail portion
      interleaved = interleaved.subarray(len - this.capacity);
    }
    let write = this.writeIndex;
    const cap = this.capacity;
    const src = interleaved;
    const n = src.length;
    const firstPart = Math.min(n, cap - write);
    this.buffer.set(src.subarray(0, firstPart), write);
    if (firstPart < n) {
      // wrap
      this.buffer.set(src.subarray(firstPart), 0);
    }
    this.writeIndex = (write + n) % cap;
    this.available = Math.min(this.available + n, cap);
    return n;
  }

  // read interleaved samples into outputs (array of channel Float32Arrays)
  // frames: number of frames to read (per channel)
  // channelCount: number of channels
  // If not enough samples, remaining samples are zeroed and function returns actual frames read
  readIntoOutputs(outputs, frames, channelCount) {
    const cap = this.capacity;
    const samplesNeeded = frames * channelCount;
    const toReadSamples = Math.min(this.available, samplesNeeded);
    const framesRead = Math.floor(toReadSamples / channelCount);

    if (toReadSamples === 0) {
      // zero outputs
      for (let c = 0; c < channelCount; c++) {
        const out = outputs[0][c];
        for (let i = 0; i < frames; i++) out[i] = 0;
      }
      return 0;
    }

    // Read interleaved samples and demux into outputs
    // We'll read sample-by-sample for correctness
    let read = this.readIndex;
    for (let f = 0; f < framesRead; f++) {
      for (let c = 0; c < channelCount; c++) {
        const out = outputs[0][c];
        const val = this.buffer[read];
        out[f] = val;
        read = (read + 1) % cap;
      }
    }

    // Zero any remaining frames (if partial)
    if (framesRead < frames) {
      for (let c = 0; c < channelCount; c++) {
        const out = outputs[0][c];
        for (let i = framesRead; i < frames; i++) out[i] = 0;
      }
    }

    // advance readIndex and available
    const consumed = framesRead * channelCount;
    this.readIndex = (this.readIndex + consumed) % cap;
    this.available -= consumed;
    return framesRead;
  }
}

class TFTPlayerAudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    // defaults
    this.sampleRate = sampleRate; // global in AudioWorkletGlobalScope
    this.channelCount = (options.processorOptions && options.processorOptions.channelCount) || 1;
    const bufferSeconds = (options.processorOptions && options.processorOptions.bufferSeconds) || 2.0; // default 2s buffer
    const capacityFrames = Math.max(1024, Math.ceil(this.sampleRate * bufferSeconds));
    this.capacitySamples = capacityFrames * this.channelCount;
    this.buffer = new CircularBuffer(this.capacitySamples);
    this.samples_requested = false;

    // threshold to request more samples (in frames)
    this.requestThresholdFrames = Math.floor(capacityFrames * 0.25);
    this.requestSizeFrames = Math.max(128, Math.floor(this.sampleRate * 0.5)); // default ask for 0.5s

    // bind message port
    this.port.onmessage = this.handleMessage.bind(this);

    // state
    this.ready = true;
    // let main thread know processor is ready
    this.port.postMessage({ type: 'ready' });
  }

  handleMessage(event) {
    const data = event.data;
    if (!data || !data.type) return;
    switch (data.type) {
      case 'push': {
        // data.samples expected as Float32Array (interleaved)
        // In some contexts it might be an ArrayBuffer
        let samples = data.samples;
        if (samples instanceof ArrayBuffer) samples = new Float32Array(samples);
        if (!(samples instanceof Float32Array)) {
          // try to coerce
          try { samples = new Float32Array(samples); } catch (e) { return; }
        }
        this.buffer.push(samples);
        this.samples_requested = false;
        break;
      }
      case 'setChannelCount': {
        const newCount = data.channelCount | 0;
        if (newCount > 0 && newCount !== this.channelCount) {
          this.channelCount = newCount;
          // reallocate buffer, clear contents
          const capacityFrames = Math.floor(this.capacitySamples / this.channelCount);
          this.capacitySamples = Math.max(1024, capacityFrames) * this.channelCount;
          this.buffer = new CircularBuffer(this.capacitySamples);
        }
        break;
      }
      case 'setBufferSeconds': {
        const bufferSeconds = Number(data.bufferSeconds) || 2.0;
        const capacityFrames = Math.max(1024, Math.ceil(this.sampleRate * bufferSeconds));
        this.capacitySamples = capacityFrames * this.channelCount;
        this.buffer = new CircularBuffer(this.capacitySamples);
        this.requestThresholdFrames = Math.floor(capacityFrames * 0.25);
        break;
      }
      case 'clear': {
        this.buffer.clear();
        break;
      }
      default:
        break;
    }
  }

  process(inputs, outputs, parameters) {
    // outputs[0] is array of channel Float32Array
    const outChannels = outputs[0];
    const frames = outChannels[0].length; // typically 128
    const channelCount = Math.min(this.channelCount, outChannels.length);

    // ensure outputs array has expected channel count
    // If fewer channels available, still write to available ones
    // Zero outputs if nothing available
    const framesRead = this.buffer.readIntoOutputs(outputs, frames, channelCount);

    // if we consumed or available is low, request more
    const availableFrames = this.buffer.availableFrames(this.channelCount);
    if(this.samples_requested === false && availableFrames < this.requestThresholdFrames) {
        // request more frames from main thread
        this.samples_requested = true;
        this.port.postMessage({ type: 'request', frames: this.requestSizeFrames });
    }

    // If channelCount < outChannels.length, zero remaining channels
    for (let c = channelCount; c < outChannels.length; c++) {
      const out = outChannels[c];
      for (let i = 0; i < frames; i++) out[i] = 0;
    }

    return true; // keep processor alive
  }
}

registerProcessor('tft-player-audio-processor', TFTPlayerAudioProcessor);