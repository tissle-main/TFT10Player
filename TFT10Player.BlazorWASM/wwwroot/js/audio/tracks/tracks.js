import { TrackFile } from "./track-file.js";
import { TrackPeriod } from "./track-period.js";
import { TrackGroup } from "./track-group.js";
import { TrackType } from "./track-type.js";
import { FadeSampleReader } from "../sample-readers/fade-sample-reader.js";
import { SmoothEndSampleReader } from "../sample-readers/smooth-end-sample-reader.js";
import { FileSampleReader } from "../sample-readers/file-sample-reader.js";
import { SampleReader } from "../sample-readers/sample-reader.js";

/**
 * Tracks manager
 * WebWorker + OPFS compatible
 */
export class Tracks
{

    static lateLoopStartSeconds = (240 / 90) * 58;
    static noOriginStartSeconds = (240 / 140) * 33;
    static earlyLoopStartSeconds = (240 / 140) * 112;

    /** @type {TrackGroup[]} */
    static allGroups = [];

    /** @type {TrackFile[]} */
    static all = [];

    /** @type {FadeSampleReader} */
    static endTrack = null;

    /** @type {FadeSampleReader} */
    static startTrack = null;

    static startTrackFile = null;
    static endTrackFile = null;

    /* ========= Private Helpers ========= */

    /**
     * @returns {Promise<TrackFile[]>}
     */
    static async create() {
        const files = [
                "Early_Country_Drums.pcm",
                "Early_Country_Main.pcm",
                "Early_Disco_Drums.pcm",
                "Early_Disco_Main.pcm",
                "Early_EDM_Drums.pcm",
                "Early_EDM_Main.pcm",
                "Early_EightBit_Drums.pcm",
                "Early_EightBit_Main.pcm",
                "Early_Emo_Drums.pcm",
                "Early_Emo_Main.pcm",
                "Early_Heartsteel_Drums.pcm",
                "Early_Heartsteel_Main.pcm",
                "Early_Heartsteel_Secondary.pcm",
                "Early_Hyperpop_Main.pcm",
                "Early_ILLBeats_Drums.pcm",
                "Early_Jazz_Main.pcm",
                "Early_KDA_Drums.pcm",
                "Early_KDA_Main.pcm",
                "Early_KDA_Secondary.pcm",
                "Early_Maestro_Main.pcm",
                "Early_MixMaster_Drums.pcm",
                "Early_NoOrigin_Main.pcm",
                "Early_Pentakill_Drums.pcm",
                "Early_Pentakill_Main.pcm",
                "Early_Pentakill_Secondary.pcm",
                "Early_Punk_Drums.pcm",
                "Early_Punk_Main.pcm",
                "Early_TrueDamage_Drums.pcm",
                "Early_TrueDamage_Main.pcm",
                "Early_TrueDamage_Secondary.pcm",
                "Late_Country_Drums.pcm",
                "Late_Country_Main.pcm",
                "Late_Disco_Drums.pcm",
                "Late_Disco_Main.pcm",
                "Late_EDM_Drums.pcm",
                "Late_EDM_Main.pcm",
                "Late_EightBit_Drums.pcm",
                "Late_EightBit_Main.pcm",
                "Late_Emo_Drums.pcm",
                "Late_Emo_Main.pcm",
                "Late_Heartsteel_Drums.pcm",
                "Late_Heartsteel_Main.pcm",
                "Late_Heartsteel_Secondary.pcm",
                "Late_Hyperpop_Main.pcm",
                "Late_ILLBeats_Drums.pcm",
                "Late_Jazz_Main.pcm",
                "Late_KDA_Drums.pcm",
                "Late_KDA_Main.pcm",
                "Late_KDA_Secondary.pcm",
                "Late_Maestro_Main.pcm",
                "Late_MixMaster_Drums.pcm",
                "Late_NoOrigin_Main.pcm",
                "Late_Pentakill_Drums.pcm",
                "Late_Pentakill_Main.pcm",
                "Late_Pentakill_Secondary.pcm",
                "Late_Punk_Drums.pcm",
                "Late_Punk_Main.pcm",
                "Late_TrueDamage_Drums.pcm",
                "Late_TrueDamage_Main.pcm",
                "Late_TrueDamage_Secondary.pcm"
            ];
        const tracks = [];

        for (const fileName of files) {
            const [periodStr, groupStr, typeStr] = fileName.replace(/\.[^/.]+$/, "").split("_");

            const period = TrackPeriod[periodStr];
            const group = TrackGroup[groupStr];
            const type = TrackType[typeStr];

            const loopStartSeconds =
                period === TrackPeriod.Early
                    ? Tracks.earlyLoopStartSeconds
                    : Tracks.lateLoopStartSeconds;

            const sampleLoopStart = SampleReader.secondsToSamples(loopStartSeconds);
            const sampleFadeDuration = SampleReader.secondsToSamples(1.0);

            const trackFile = await TrackFile.open(fileName, sampleLoopStart, sampleFadeDuration);
            trackFile.trackPeriod = period;
            trackFile.trackGroup = group;
            trackFile.trackType = type;

            tracks.push(trackFile);
        }

        return tracks;
    }

    /* ========= Public ========= */

    /**
     * @param {TrackPeriod} period
     * @param {TrackGroup} group
     * @param {TrackType} type
     * @returns {TrackFile}
     */
    static findTrack(period, group, type) {
        return Tracks.all.find(
            track =>
                track.trackPeriod === period &&
                track.trackGroup === group &&
                track.trackType === type
        );
    }

    static async init() {
        Tracks.allGroups = Object.values(TrackGroup);

        // load main tracks
        Tracks.all = await Tracks.create();

        // load end track
        Tracks.endTrackFile = await FileSampleReader.open("End.pcm");
        Tracks.endTrack = new FadeSampleReader(
            new SmoothEndSampleReader(Tracks.endTrackFile),
            SampleReader.secondsToSamples(1.0)
        );

        // load start track
        Tracks.startTrackFile = await FileSampleReader.open("Start.pcm");
        Tracks.startTrack = new FadeSampleReader(
            new SmoothEndSampleReader(Tracks.startTrackFile),
            SampleReader.secondsToSamples(1.0)
        );
    }
}