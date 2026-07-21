import { SampleReader } from "./sample-readers/sample-reader.js";
import { MixSampleReader } from "./sample-readers/mix-sample-reader.js";
import { EventSampleReader } from "./sample-readers/event-sample-reader.js";
import { Tracks } from "./tracks/tracks.js";
import { TrackPeriod } from "./tracks/track-period.js";
import { TrackGroup } from "./tracks/track-group.js";
import { TrackType } from "./tracks/track-type.js";

/**
 * TFTPlayer core
 * WebWorker + OPFS compatible
 */
export class TFTPlayer extends SampleReader {

    constructor() {
        super();
        this.mixReader = new MixSampleReader();
        this.eventReader = new EventSampleReader(this.mixReader);
        this.currentPeriod = TrackPeriod.Early;

        // deferred event for track switching
        this._changePeriodTracks = new Set();
        this.changingPeriod = false;
        this._onReaderRemoved = null;
    }

    /* ========= Track Management ========= */

    /**
     * @param {TrackGroup} group
     * @param {TrackType} type
     */
    addTrack(group, type) {
        const track = Tracks.findTrack(this.currentPeriod, group, type);
        track.reader.fadeIn();
        track.reader.position = this.mixReader.position;
        this.mixReader.readers.add(track.reader);
    }

    /**
     * @param {TrackGroup} group
     * @param {TrackType} type
     */
    removeTrack(group, type) {
        const track = Tracks.findTrack(this.currentPeriod, group, type);
        track.reader.fadeOut();
    }

    /**
     * Switch period: Early <-> Late
     * Deferred: add tracks only after existing fade out
     */
    changePeriod()
    {
        this.changingPeriod = true;
        this._changePeriodTracks.clear();
        this.currentPeriod =
            this.currentPeriod === TrackPeriod.Early
                ? TrackPeriod.Late
                : TrackPeriod.Early;

        // fade out current tracks and collect associated TrackFiles
        for (const reader of this.mixReader.readers) {
            reader.fadeOut();

            const trackFile = Tracks.all.find(track => track.reader === reader);
            if (trackFile) {
                this._changePeriodTracks.add(trackFile);
            }
        }

        // setup deferred callback
        this._onReaderRemoved = (sender, reader) => {
            if (sender.count > 0)
            {
                this.changingPeriod = false;
                return;
            }

            for (const track of this._changePeriodTracks) {
                const newTrack = Tracks.findTrack(
                    this.currentPeriod,
                    track.trackGroup,
                    track.trackType
                );
                newTrack.reader.fullVolume();
                newTrack.reader.position = 0;
                sender.readers.add(newTrack.reader);
            }
            sender.offReaderRemoved(this._onReaderRemoved);
            this.changingPeriod = false;
        };
        this.mixReader.onReaderRemoved(this._onReaderRemoved);
    }

    /* ========= SampleReader Base ========= */

    get count() {
        return this.eventReader.count;
    }

    get position() {
        return this.eventReader.position;
    }

    set position(value) {
        this.eventReader.position = value;
    }

    /**
     * @param {Float32Array} buffer
     */
    read(buffer) {
        this.eventReader.read(buffer);
    }

    /* ========= Dispose ========= */

    dispose() {
        this.mixReader.dispose();
        this._changePeriodTracks.clear();
        this._onReaderRemoved = null;
    }
}
