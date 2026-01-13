// SmoothEndSampleReader.js
import { SampleReader } from "./sample-reader.js";
import { FadeSampleReader } from "./fade-sample-reader.js";

export class SmoothEndSampleReader extends SampleReader {

    /* ========= Static ========= */

    static FadeStart = 8820;

    /* ========= Instance ========= */

    /**
     * @param {SampleReader} reader
     */
    constructor(reader) {
        super();
        this.reader = new FadeSampleReader(
            reader,
            SmoothEndSampleReader.FadeStart / 2,
            false // full volume initially
        );
    }

    /* ========= Base ========= */

    get count() {
        return this.reader.count;
    }

    get position() {
        return this.reader.position;
    }

    set position(value) {
        this.reader.position = value;
    }

    /**
     * @param {Float32Array} buffer
     */
    read(buffer) {
        let samplesLeftToEnd = this.count - this.position;

        // Full volume zone
        if (samplesLeftToEnd > SmoothEndSampleReader.FadeStart) {
            const samplesToFadeStart =
                samplesLeftToEnd - SmoothEndSampleReader.FadeStart;

            this.reader.fullVolume();

            if (samplesToFadeStart >= buffer.length) {
                this.reader.read(buffer);
                return;
            }

            // Read until fade start
            this.reader.read(
                buffer.subarray(0, samplesToFadeStart)
            );

            buffer = buffer.subarray(samplesToFadeStart);
            samplesLeftToEnd -= samplesToFadeStart;
        }

        // Fade-out zone
        if (samplesLeftToEnd <= SmoothEndSampleReader.FadeStart) {
            this.reader.fadeOut(samplesLeftToEnd >> 1); // /2 stereo frames
            this.reader.read(buffer);
        }
    }
}
