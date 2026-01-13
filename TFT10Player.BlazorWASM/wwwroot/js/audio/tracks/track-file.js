import { FadeSampleReader } from "../sample-readers/fade-sample-reader.js";
import { LoopFileSampleReader } from "../sample-readers/loop-file-sample-reader.js";

/**
 * TrackFile
 * WebWorker + OPFS compatible
 */
export class TrackFile {

    /**
     * @param {LoopFileSampleReader} loopReader
     * @param {FadeSampleReader} reader
     */
    constructor(loopReader, reader) {
        this.loopReader = loopReader;
        this.reader = reader;

        /** @type {number} */
        this.trackType = 0;

        /** @type {number} */
        this.trackGroup = 0;

        /** @type {number} */
        this.trackPeriod = 0;
    }

    /* ========= Factory ========= */

    /**
     * @param {string} filePath
     * @param {number} sampleLoopStart
     * @param {number} sampleFadeDuration
     */
    static async open(filePath, sampleLoopStart, sampleFadeDuration) {
        const loopReader = await LoopFileSampleReader.open(
            filePath,
            sampleLoopStart
        );

        const reader = new FadeSampleReader(
            loopReader,
            sampleFadeDuration
        );

        return new TrackFile(loopReader, reader);
    }

    /* ========= IDisposable ========= */

    dispose() {
        this.loopReader.dispose();
    }
}
