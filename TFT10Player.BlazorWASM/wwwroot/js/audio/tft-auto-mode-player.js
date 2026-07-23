import { SampleReader } from "./sample-readers/sample-reader.js";
import { Tracks } from "./tracks/tracks.js";
import { TrackGroup } from "./tracks/track-group.js";
import { TrackType } from "./tracks/track-type.js";

/**
 * TFTAutoModePlayer
 * Автоматичний режим зміни треків/періодів
 * WebWorker + OPFS compatible
 */
export class TFTAutoModePlayer extends SampleReader
{

    /**
     * @param {SampleReader} tftPlayer
     */
    constructor(tftPlayer)
    {
        super();
        this.tftPlayer = tftPlayer;

        /** @type {import("./tracks/track-file.js").TrackFile|null} */
        this.mainTrack = null;
        /** @type {import("./tracks/track-file.js").TrackFile|null} */
        this.drumsTrack = null;
        /** @type {import("./tracks/track-file.js").TrackFile|null} */
        this.secondaryTrack = null;

        this.changingPeriod = false;
        this.changingTracks = false;
        this.changeTracksToken = null;
        this.changePeriodToken = null;
        this.startEventToken = null;

        this.minChangeTrackMinutes = 1;
        this.maxChangeTrackMinutes = 1;
        this.minChangePeriodMinutes = 5;
        this.maxChangePeriodMinutes = 5;
    }

    /* ========= Static Helpers ========= */

    static _getRandomItem(array)
    {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Точна JS адаптація GetTracks з C#
     * @param {{value: import("./tracks/track-file.js").TrackFile|null}} mainTrackRef
     * @param {{value: import("./tracks/track-file.js").TrackFile|null}} drumsTrackRef
     * @param {{value: import("./tracks/track-file.js").TrackFile|null}} secondaryTrackRef
     * @param {import("./tracks/track-period.js").TrackPeriod} period
     */
    static getTracks(mainTrackRef, drumsTrackRef, secondaryTrackRef, period)
    {
        const allGroups = Tracks.allGroups;
        const group = allGroups[Math.floor(Math.random() * allGroups.length)];

        const main = mainTrackRef.value;
        const drums = drumsTrackRef.value;
        const secondary = secondaryTrackRef.value;

        if ((main?.trackGroup === group) || (drums?.trackGroup === group) || (secondary?.trackGroup === group))
        {
            return;
        }

        switch (group)
        {
            case TrackGroup.None:
            case TrackGroup.NoOrigin:
                break;
            case TrackGroup.Jazz:
            case TrackGroup.Maestro:
            case TrackGroup.Hyperpop:
                if ([TrackGroup.Jazz, TrackGroup.Maestro, TrackGroup.Hyperpop].includes(main?.trackGroup)) break;
                if ([TrackGroup.Jazz, TrackGroup.Maestro, TrackGroup.Hyperpop].includes(secondary?.trackGroup)) break;

                if (!main && !secondary)
                {
                    switch (Math.floor(Math.random() * 2))
                    {
                        case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                        case 1: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                    }
                    break;
                }
                if (!main) { mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; }
                if (!secondary) { secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; }
                if (main?.trackGroup === drums?.trackGroup && drums?.trackGroup === secondary?.trackGroup)
                {
                    switch (Math.floor(Math.random() * 2))
                    {
                        case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                        case 1: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                    }
                    break;
                }
                if (main?.trackGroup === drums?.trackGroup) { mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; }
                if (drums?.trackGroup === secondary?.trackGroup) { secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; }
                break;

            case TrackGroup.ILLBeats:
            case TrackGroup.MixMaster:
                if (!drumsTrackRef.value) { drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; }
                if (drumsTrackRef.value.trackGroup === main?.trackGroup || drumsTrackRef.value.trackGroup === secondary?.trackGroup)
                {
                    drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums);
                    break;
                }
                break;

            case TrackGroup.Country:
            case TrackGroup.Punk:
            case TrackGroup.EDM:
            case TrackGroup.Emo:
            case TrackGroup.Disco:
            case TrackGroup.EightBit:
                if (!main && !drums && !secondary)
                {
                    switch (Math.floor(Math.random() * 2))
                    {
                        case 0:
                            mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main);
                            drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums);
                            break;
                        case 1:
                            secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main);
                            drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums);
                            break;
                    }
                    break;
                }
                if (!main && !drums) { mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; }
                if (!secondary && !drums) { secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; }
                if (!main && !secondary)
                {
                    switch (Math.floor(Math.random() * 2))
                    {
                        case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                        case 1: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                    }
                    break;
                }
                if (!main) { mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; }
                if (!drums) { drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; }
                if (!secondary) { secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; }
                if (main?.trackGroup === drums?.trackGroup && drums?.trackGroup === secondary?.trackGroup)
                {
                    switch (Math.floor(Math.random() * 5))
                    {
                        case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break;
                        case 1: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break;
                        case 2: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                        case 3: drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break;
                        case 4: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                    }
                    break;
                }
                if (main?.trackGroup === drums?.trackGroup) { switch (Math.floor(Math.random() * 2)) { case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; case 1: drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; } break; }
                if (drums?.trackGroup === secondary?.trackGroup) { switch (Math.floor(Math.random() * 2)) { case 0: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; case 1: drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; } break; }
                break;

            case TrackGroup.KDA:
            case TrackGroup.Heartsteel:
            case TrackGroup.TrueDamage:
            case TrackGroup.Pentakill:
                if (!main && !drums && !secondary)
                {
                    mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main);
                    drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums);
                    secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Secondary);
                    break;
                }
                if (!main && !drums)
                {
                    switch (Math.floor(Math.random() * 2))
                    {
                        case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                        case 1: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Secondary); break;
                    }
                    drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums);
                    break;
                }
                if (!secondary && !drums)
                {
                    switch (Math.floor(Math.random() * 2))
                    {
                        case 0: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Secondary); break;
                        case 1: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break;
                    }
                    drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums);
                    break;
                }
                if (!main && !secondary) { mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Secondary); break; }
                if (!main) { switch (Math.floor(Math.random() * 2)) { case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; case 1: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Secondary); break; } break; }
                if (!drums) { drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; }
                if (!secondary) { switch (Math.floor(Math.random() * 2)) { case 0: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Secondary); break; case 1: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; } break; }

                if (main?.trackGroup === drums?.trackGroup && drums?.trackGroup === secondary?.trackGroup)
                {
                    const choice = Math.floor(Math.random() * 5);
                    switch (choice)
                    {
                        case 0: mainTrackRef.value = Math.random() < 0.5 ? Tracks.findTrack(period, group, TrackType.Main) : Tracks.findTrack(period, group, TrackType.Secondary); drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break;
                        case 1: secondaryTrackRef.value = Math.random() < 0.5 ? Tracks.findTrack(period, group, TrackType.Secondary) : Tracks.findTrack(period, group, TrackType.Main); drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break;
                        case 2: mainTrackRef.value = Math.random() < 0.5 ? Tracks.findTrack(period, group, TrackType.Main) : Tracks.findTrack(period, group, TrackType.Secondary); break;
                        case 3: drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break;
                        case 4: secondaryTrackRef.value = Math.random() < 0.5 ? Tracks.findTrack(period, group, TrackType.Secondary) : Tracks.findTrack(period, group, TrackType.Main); break;
                    }
                    break;
                }
                if (main?.trackGroup === drums?.trackGroup) { switch (Math.floor(Math.random() * 2)) { case 0: mainTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; case 1: drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; } break; }
                if (drums?.trackGroup === secondary?.trackGroup) { switch (Math.floor(Math.random() * 2)) { case 0: secondaryTrackRef.value = Tracks.findTrack(period, group, TrackType.Main); break; case 1: drumsTrackRef.value = Tracks.findTrack(period, group, TrackType.Drums); break; } break; }
                break;
        }
    }

    static addNoOrigin(mainTrackRef, secondaryTrackRef, period)
    {
        const main = mainTrackRef.value;
        const secondary = secondaryTrackRef.value;

        const invalidGroup = [TrackGroup.Jazz, TrackGroup.Maestro, TrackGroup.Hyperpop];

        if (main && !invalidGroup.includes(main.trackGroup)) return;
        if (secondary && !invalidGroup.includes(secondary.trackGroup)) return;

        if (!main)
        {
            mainTrackRef.value = Tracks.findTrack(period, TrackGroup.NoOrigin, TrackType.Main);
        } else
        {
            secondaryTrackRef.value = Tracks.findTrack(period, TrackGroup.NoOrigin, TrackType.Main);
        }
    }

    /* ========= Instance Methods ========= */

    /**
     * @param {boolean} useStart
     */
    start(useStart = true)
    {
        if (useStart)
        {
            Tracks.startTrack.fullVolume();
            Tracks.startTrack.position = 0;
            this.tftPlayer.mixReader.readers.add(Tracks.startTrack);

            this.startEventToken = this.tftPlayer.eventReader.addEvent(
                SampleReader.secondsToSamples(Tracks.noOriginStartSeconds),
                () =>
                {
                    this.tftPlayer.addTrack(TrackGroup.NoOrigin, TrackType.Main);
                    this.mainTrack = Tracks.findTrack(this.tftPlayer.currentPeriod, TrackGroup.NoOrigin, TrackType.Main);
                    this.enableAutoMode();
                }
            );
        } else
        {
            this.enableAutoMode();
        }
    }

    disableAutoMode()
    {
        if (this.startEventToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.startEventToken);
        }
        if (this.changePeriodToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.changePeriodToken);
        }
        if (this.changeTracksToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.changeTracksToken);
        }
    }
    enableAutoMode()
    {
        this._scheduleChangeTracks();
        this._scheduleChangePeriod();
    }

    _scheduleChangePeriod()
    {
        if (this.startEventToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.startEventToken);
        }
        if (this.changePeriodToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.changePeriodToken);
        }
        this.changePeriodToken = this.tftPlayer.eventReader.addEvent(
            SampleReader.secondsToSamples(
                this._randomMinutes(this.minChangePeriodMinutes, this.maxChangePeriodMinutes)
            ),
            () => this._changePeriod()
        );
    }

    _scheduleChangeTracks()
    {
        if (this.startEventToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.startEventToken);
        }
        if (this.changeTracksToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.changeTracksToken);
        }
        this.changeTracksToken = this.tftPlayer.eventReader.addEvent(
            SampleReader.secondsToSamples(
                this._randomMinutes(this.minChangeTrackMinutes, this.maxChangeTrackMinutes)
            ),
            () => this._changeTracks()
        );
    }

    _randomMinutes(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1) + min) * 60;
    }

    _changePeriod()
    {
        if (!this.changingTracks && !this.changingPeriod && !this.tftPlayer.changingPeriod)
        {
            this.changingPeriod = true;
            this.tftPlayer.changePeriod();

            if (this.mainTrack) this.mainTrack = Tracks.findTrack(this.tftPlayer.currentPeriod, this.mainTrack.trackGroup, this.mainTrack.trackType);
            if (this.drumsTrack) this.drumsTrack = Tracks.findTrack(this.tftPlayer.currentPeriod, this.drumsTrack.trackGroup, this.drumsTrack.trackType);
            if (this.secondaryTrack) this.secondaryTrack = Tracks.findTrack(this.tftPlayer.currentPeriod, this.secondaryTrack.trackGroup, this.secondaryTrack.trackType);

            this._scheduleChangePeriod();
            this.changingPeriod = false;
        } else
        {
            this._scheduleChangePeriodIn(1);
        }
    }

    _changeTracks()
    {
        if (!this.changingPeriod && !this.changingTracks && !this.tftPlayer.changingPeriod)
        {
            this.changingTracks = true;

            for (const reader of this.tftPlayer.mixReader.readers)
            {
                reader.fadeOut();
            }

            const mainTrackRef = { value: null };
            const drumsTrackRef = { value: null };
            const secondaryTrackRef = { value: null };

            TFTAutoModePlayer.getTracks(mainTrackRef, drumsTrackRef, secondaryTrackRef, this.tftPlayer.currentPeriod);
            TFTAutoModePlayer.getTracks(mainTrackRef, drumsTrackRef, secondaryTrackRef, this.tftPlayer.currentPeriod);
            TFTAutoModePlayer.getTracks(mainTrackRef, drumsTrackRef, secondaryTrackRef, this.tftPlayer.currentPeriod);
            TFTAutoModePlayer.addNoOrigin(mainTrackRef, secondaryTrackRef, this.tftPlayer.currentPeriod);

            if (mainTrackRef.value)
            {
                mainTrackRef.value.reader.fadeIn();
                mainTrackRef.value.reader.position = this.tftPlayer.eventReader.position;
                this.tftPlayer.mixReader.readers.add(mainTrackRef.value.reader);
            }
            if (drumsTrackRef.value)
            {
                drumsTrackRef.value.reader.fadeIn();
                drumsTrackRef.value.reader.position = this.tftPlayer.eventReader.position;
                this.tftPlayer.mixReader.readers.add(drumsTrackRef.value.reader);
            }
            if (secondaryTrackRef.value)
            {
                secondaryTrackRef.value.reader.fadeIn();
                secondaryTrackRef.value.reader.position = this.tftPlayer.eventReader.position;
                this.tftPlayer.mixReader.readers.add(secondaryTrackRef.value.reader);
            }

            this.mainTrack = mainTrackRef.value;
            this.drumsTrack = drumsTrackRef.value;
            this.secondaryTrack = secondaryTrackRef.value;

            this._scheduleChangeTracks();
            this.changingTracks = false;
        } else
        {
            this._scheduleChangeTracksIn(1);
        }
    }

    _scheduleChangePeriodIn(seconds)
    {
        if (this.startEventToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.startEventToken);
        }
        if (this.changePeriodToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.changePeriodToken);
        }
        this.changePeriodToken = this.tftPlayer.eventReader.addEvent(
            SampleReader.secondsToSamples(seconds),
            () => this._changePeriod()
        );
    }

    _scheduleChangeTracksIn(seconds)
    {
        if (this.startEventToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.startEventToken);
        }
        if (this.changeTracksToken !== null)
        {
            this.tftPlayer.eventReader.removeEvent(this.changeTracksToken);
        }
        this.changeTracksToken = this.tftPlayer.eventReader.addEvent(
            SampleReader.secondsToSamples(seconds),
            () => this._changeTracks()
        );
    }

    /* ========= SampleReader Base ========= */

    get count()
    {
        return this.tftPlayer.count;
    }

    get position()
    {
        return this.tftPlayer.position;
    }

    set position(value)
    {
        this.tftPlayer.position = value;
    }

    read(buffer)
    {
        this.tftPlayer.read(buffer);
    }

    /* ========= Dispose ========= */

    dispose()
    {
        this.mainTrack = null;
        this.drumsTrack = null;
        this.secondaryTrack = null;
        this.tftPlayer = null;
    }
}