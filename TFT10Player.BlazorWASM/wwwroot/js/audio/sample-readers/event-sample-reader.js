// EventSampleReader.js
import { SampleReader } from "./sample-reader.js";

export class EventSampleReader extends SampleReader {

    /* ========= Instance ========= */

    /**
     * @param {SampleReader} reader
     */
    constructor(reader) {
        super();
        this.reader = reader;
        this.events = [];
    }

    /**
     * @param {number} raiseTime // in samples
     * @param {() => void} event
     * @returns {EventToken}
     */
    addEvent(raiseTime, event) {
        const token = new EventToken(event, raiseTime);
        this.events.push(token);
        this.events.sort(EventToken.compare);
        return token;
    }

    /**
     * @param {EventToken} token
     * @returns {boolean}
     */
    removeEvent(token) {
        const index = this.events.indexOf(token);
        if (index === -1) return false;
        this.events.splice(index, 1);
        this.events.sort(EventToken.compare);
        return true;
    }

    clear() {
        this.events.length = 0;
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
        let offset = 0;
        while (this.events.length > 0 && offset < buffer.length) {
            let token = this.events[0];
            const samplesLeftToInvoke = token.raiseTime;
            const remaining = buffer.length - offset;

            // event is further than this buffer
            if (samplesLeftToInvoke > remaining) {
                for (const t of this.events) {
                    t.raiseTime -= remaining;
                }
                break;
            }

            // advance to event
            for (const t of this.events) {
                t.raiseTime -= samplesLeftToInvoke;
            }

            this.reader.read(
                buffer.subarray(offset, offset + samplesLeftToInvoke)
            );
            offset += samplesLeftToInvoke;

            // fire all events at this position
            while (this.events.length > 0 && this.events[0].raiseTime <= 0) {
                token = this.events.shift();
                token.event();
            }
        }

        // read remaining samples
        if (offset < buffer.length) {
            this.reader.read(buffer.subarray(offset));
        }
    }
}

/* ========= Token ========= */

export class EventToken {
    /**
     * @param {() => void} event
     * @param {number} raiseTime
     */
    constructor(event, raiseTime) {
        this.event = event;
        this.raiseTime = raiseTime;
    }

    static compare(a, b) {
        return a.raiseTime - b.raiseTime;
    }
}
