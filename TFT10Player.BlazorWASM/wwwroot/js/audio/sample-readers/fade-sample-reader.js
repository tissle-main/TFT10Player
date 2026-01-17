// FadeSampleReader.js
import { SampleReader } from "./sample-reader.js";

export const FadeState = Object.freeze({
    None: 0,
    FadingIn: 1,
    FadingOut: 2
});

export class FadeSampleReader extends SampleReader {

    /* ========= Static ========= */

    /**
     * Fade function
     * tanh(3.14x)
     * @param {number} sample
     */
    static tanhFade(x) {
        return Math.tanh(3.14 * x);
    }

    /* ========= Instance ========= */

    /**
     * @param {SampleReader} reader
     * @param {number} fadeDuration  // in samples
     * @param {boolean} silence
     */
    constructor(reader, fadeDuration, silence = true) {
        super();
        this.reader = reader;
        this.fadeDuration = fadeDuration;
        this.fadingState = FadeState.None;
        this.fadePosition = 0;

        if (silence === false) {
            this.fullVolume();
        } else {
            this.silence();
        }
    }

    silence() {
        this.fadePosition = 0;
        this.fadingState = FadeState.None;
    }

    fullVolume() {
        this.fadePosition = this.fadeDuration;
        this.fadingState = FadeState.None;
    }

    fadeIn(position = 0) {
        this.fadePosition = position;
        this.fadingState = FadeState.FadingIn;
    }

    fadeOut(position = this.fadeDuration) {
        this.fadePosition = position;
        this.fadingState = FadeState.FadingOut;
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
     * @param {Float32Array} buffer (stereo: L/R)
     */
    read(buffer) {

        this.reader.read(buffer);

        const len = buffer.length;
        const duration = this.fadeDuration;

        let pos = this.fadePosition;
        let state = this.fadingState;

        // iterate stereo pairs
        for (let i = 0; i < len; i += 2) {
            const factor = FadeSampleReader.tanhFade(pos / duration);

            buffer[i] *= factor;
            buffer[i + 1] *= factor;

            switch (state) {
                case FadeState.FadingIn:
                    if (pos >= duration) {
                        state = FadeState.None;
                    } else {
                        pos++;
                    }
                    break;

                case FadeState.FadingOut:
                    if (pos <= 0) {
                        state = FadeState.None;
                    } else {
                        pos--;
                    }
                    break;
            }
        }

        this.fadePosition = pos;
        this.fadingState = state;
    }
}
