// FileSampleReader.js
import { SampleReader } from "./sample-reader.js";

const FLOAT_SIZE = 4;

export class FileSampleReader extends SampleReader {
    /**
     * @param {FileSystemSyncAccessHandle} handle
     * @param {number} byteLength
     */
    constructor(handle, byteLength) {
        super();
        this.handle = handle;
        this._count = (byteLength / FLOAT_SIZE) | 0;
        this._position = 0;
    }

    /* ===== Base ===== */

    get count() {
        return this._count;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        // align to stereo (even samples)
        const aligned = value & ~1;
        this._position = Math.max(0, Math.min(aligned, this._count));
    }

    /**
     * @param {Float32Array} buffer
     */
    read(buffer) {
        const byteOffset = this._position * FLOAT_SIZE;
        const byteLength = buffer.byteLength;

        const bytesRead = this.handle.read(
            new Uint8Array(buffer.buffer, buffer.byteOffset, byteLength),
            { at: byteOffset }
        );

        // zero-fill tail (C# NativeMemory.Clear equivalent)
        if (bytesRead < byteLength) {
            const tail = new Uint8Array(
                buffer.buffer,
                buffer.byteOffset + bytesRead,
                byteLength - bytesRead
            );
            tail.fill(0);
        }

        this._position += (bytesRead / FLOAT_SIZE) | 0;
    }

    /* ===== IDisposable ===== */

    dispose() {
        this.handle.close();
    }

    static async open(filename) {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle("TFT10Player");
        const fileHandle = await dir.getFileHandle(filename);
        const syncHandle = await fileHandle.createSyncAccessHandle();
        const size = syncHandle.getSize();
        return new FileSampleReader(syncHandle, size);
    }
    static async createHandle(filename) {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle("TFT10Player");
        const fileHandle = await dir.getFileHandle(filename);
        return await fileHandle.createSyncAccessHandle();
    }
}