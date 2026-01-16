// SampleReader.js (WebWorker context)

export class SampleReader {
    /* ========= Static ========= */

    static ChannelCount = 2;
    static FramesPerSecond = 48000;
    static SamplesPerSecond = 96000;

    static secondsToSamples(seconds) {
        return Math.floor(seconds * SampleReader.SamplesPerSecond);
    }

    /**
     * Fast add: left[i] += right[i]
     * @param {Float32Array} left
     * @param {Float32Array} right
     */
    static fastAdd(left, right) {
        const len = left.length;

        // Unrolled loop (SIMD-like optimization)
        let i = 0;
        const unroll = 8;
        const limit = len - (len % unroll);

        for (; i < limit; i += unroll) {
            left[i] += right[i];
            left[i + 1] += right[i + 1];
            left[i + 2] += right[i + 2];
            left[i + 3] += right[i + 3];
            left[i + 4] += right[i + 4];
            left[i + 5] += right[i + 5];
            left[i + 6] += right[i + 6];
            left[i + 7] += right[i + 7];
        }

        for (; i < len; i++) {
            left[i] += right[i];
        }
    }

    /* ========= Instance ========= */

    get count() {
        throw new Error("count getter not implemented");
    }

    get position() {
        throw new Error("position getter not implemented");
    }

    set position(value) {
        throw new Error("position setter not implemented");
    }

    /**
     * Read samples into buffer
     * @param {Float32Array} buffer
     */
    read(buffer) {
        throw new Error("read() not implemented");
    }

    skipSilence() {
        const buffer = new Float32Array(2);
        do {
            this.read(buffer);
        } while (buffer[0] === 0 && buffer[1] === 0);
    }
}
