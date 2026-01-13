// MixSampleReader.js
import { SampleReader } from "./sample-reader.js";
import { FadeSampleReader, FadeState } from "./fade-sample-reader.js";

export class MixSampleReader extends SampleReader {

    /* ========= Instance ========= */

    constructor() {
        super();
        this.buffer = new Float32Array(0);
        this.readers = new Set();
        this.readerRemovedCallbacks = new Set();
    }

    /* ========= Events ========= */

    /**
     * @param {(mix: MixSampleReader, reader: SampleReader) => void} cb
     */
    onReaderRemoved(cb) {
        this.readerRemovedCallbacks.add(cb);
    }

    offReaderRemoved(cb) {
        this.readerRemovedCallbacks.delete(cb);
    }

    _emitReaderRemoved(reader) {
        for (const cb of this.readerRemovedCallbacks) {
            cb(this, reader);
        }
    }

    /* ========= Shared buffer ========= */

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
        let min = Infinity;
        for (const r of this.readers) {
            if (r.count < min) min = r.count;
        }
        return min === Infinity ? 0 : min;
    }

    get position() {
        for (const r of this.readers) {
            return r.position;
        }
        return 0;
    }

    set position(value) {
        for (const r of this.readers) {
            r.position = value;
        }
    }

    /**
     * @param {Float32Array} buffer
     */
    read(buffer) {
        // cleanup pass (mirrors C# logic)
        for (const reader of Array.from(this.readers)) {
            if (reader.position >= reader.count) {
                this.readers.delete(reader);
                this._emitReaderRemoved(reader);
                continue;
            }

            if (
                reader instanceof FadeSampleReader &&
                reader.fadePosition === 0 &&
                reader.fadingState === FadeState.None
            ) {
                this.readers.delete(reader);
                this._emitReaderRemoved(reader);
            }
        }

        if (this.readers.size === 0) {
            buffer.fill(0);
            return;
        }

        // first reader writes directly
        const iter = this.readers.values();
        const first = iter.next().value;
        first.read(buffer);

        // others mix in
        const span = this.getSharedBuffer(buffer.length);
        for (const reader of iter) {
            reader.read(span);
            SampleReader.fastAdd(buffer, span);
        }
    }

    /* ========= IDisposable ========= */

    dispose() {
        this.buffer = null;
        this.readers.clear();
        this.readerRemovedCallbacks.clear();
    }
}
