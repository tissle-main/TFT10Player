// LoopFileSampleReader.js
import { SampleReader } from "./sample-reader.js";
import { FileSampleReader } from "./file-sample-reader.js";
import { SmoothEndSampleReader } from "./smooth-end-sample-reader.js";

export class LoopFileSampleReader extends SampleReader {

    /* ========= Instance ========= */

    /**
     * @param {FileSampleReader} fileReader1
     * @param {FileSampleReader} fileReader2
     * @param {number} loopStart  // in samples
     */
    constructor(fileReader1, fileReader2, loopStart) {
        super();

        this.fileReader1 = fileReader1;
        this.fileReader2 = fileReader2;

        this.smoothEndReader1 = new SmoothEndSampleReader(fileReader1);
        this.smoothEndReader2 = new SmoothEndSampleReader(fileReader2);

        this.buffer = new Float32Array(0);
        this.loopStart = loopStart;
    }

    /* ========= Shared buffer (ArrayPool analog) ========= */

    /**
     * @param {number} length
     * @returns {Float32Array}
     */
    getSharedBuffer(length) {
        if (this.buffer.length < length) {
            this.buffer = new Float32Array(length);
        }
        return this.buffer.subarray(0, length);
    }

    /* ========= Base ========= */

    get count() {
        return this.smoothEndReader1.count;
    }

    get position() {
        return this.smoothEndReader1.position;
    }

    set position(value) {
        this.smoothEndReader1.position = value;
    }

    /**
     * @param {Float32Array} buffer
     */
    read(buffer) {
        const position = this.position;

        // BEFORE loop start
        if (position < this.loopStart) {
            const samplesLeftToLoopStart = this.loopStart - position;

            this.smoothEndReader1.read(buffer);

            if (samplesLeftToLoopStart >= buffer.length) {
                return;
            }

            const span = this.getSharedBuffer(
                buffer.length - samplesLeftToLoopStart
            );

            this.smoothEndReader2.position = 0;
            this.smoothEndReader2.read(span);

            SampleReader.fastAdd(
                buffer.subarray(samplesLeftToLoopStart),
                span
            );
            return;
        }

        // AFTER loop start
        const samplesLeftToEnd = Math.min(
            this.count - position,
            buffer.length
        );

        this.smoothEndReader2.position = position - this.loopStart;
        this.smoothEndReader2.read(buffer);

        const span = this.getSharedBuffer(samplesLeftToEnd);
        this.smoothEndReader1.read(span);

        SampleReader.fastAdd(
            buffer.subarray(0, samplesLeftToEnd),
            span
        );

        // swap readers at EOF
        if (this.position >= this.count) {
            [
                this.smoothEndReader1,
                this.smoothEndReader2
            ] = [
                    this.smoothEndReader2,
                    this.smoothEndReader1
                ];
        }
    }

    /* ========= IDisposable ========= */

    dispose() {
        this.fileReader1.dispose();
        this.fileReader2.dispose();
        this.buffer = null;
    }

    /* ========= Factory ========= */

    /**
     * @param {string} filename
     * @param {number} loopStart
     */
    static async open(filename, loopStart) {
        const handle = await FileSampleReader.createHandle(filename);
        const size = handle.getSize();
        const r1 = new FileSampleReader(handle, size);
        const r2 = new FileSampleReader(handle, size);
        return new LoopFileSampleReader(r1, r2, loopStart);
    }
}
