using System.Collections.Frozen;
using KristofferStrube.Blazor.FileSystem;

namespace TFT10Player.BlazorWASM.Services;

public sealed class AudioCachingService(DownloadProgressService DownloadProgress, FileSystemService FS, HttpClient HTTP)
{
    #region Static
    public static FrozenDictionary<string, string> AudioPaths { get; } = FrozenDictionary.ToFrozenDictionary([
        new KeyValuePair<string, string>("TFT10Player/Start.pcm", "Tracks/Start.pcm"),
        new KeyValuePair<string, string>("TFT10Player/End.pcm", "Tracks/End.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Country_Drums.pcm", "Tracks/All/Early_Country_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Country_Main.pcm", "Tracks/All/Early_Country_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Disco_Drums.pcm", "Tracks/All/Early_Disco_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Disco_Main.pcm", "Tracks/All/Early_Disco_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_EDM_Drums.pcm", "Tracks/All/Early_EDM_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_EDM_Main.pcm", "Tracks/All/Early_EDM_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_EightBit_Drums.pcm", "Tracks/All/Early_EightBit_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_EightBit_Main.pcm", "Tracks/All/Early_EightBit_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Emo_Drums.pcm", "Tracks/All/Early_Emo_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Emo_Main.pcm", "Tracks/All/Early_Emo_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Heartsteel_Drums.pcm", "Tracks/All/Early_Heartsteel_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Heartsteel_Main.pcm", "Tracks/All/Early_Heartsteel_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Heartsteel_Secondary.pcm", "Tracks/All/Early_Heartsteel_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Hyperpop_Main.pcm", "Tracks/All/Early_Hyperpop_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_ILLBeats_Drums.pcm", "Tracks/All/Early_ILLBeats_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Jazz_Main.pcm", "Tracks/All/Early_Jazz_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_KDA_Drums.pcm", "Tracks/All/Early_KDA_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_KDA_Main.pcm", "Tracks/All/Early_KDA_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_KDA_Secondary.pcm", "Tracks/All/Early_KDA_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Maestro_Main.pcm", "Tracks/All/Early_Maestro_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_MixMaster_Drums.pcm", "Tracks/All/Early_MixMaster_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_NoOrigin_Main.pcm", "Tracks/All/Early_NoOrigin_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Pentakill_Drums.pcm", "Tracks/All/Early_Pentakill_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Pentakill_Main.pcm", "Tracks/All/Early_Pentakill_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Pentakill_Secondary.pcm", "Tracks/All/Early_Pentakill_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Punk_Drums.pcm", "Tracks/All/Early_Punk_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_Punk_Main.pcm", "Tracks/All/Early_Punk_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_TrueDamage_Drums.pcm", "Tracks/All/Early_TrueDamage_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_TrueDamage_Main.pcm", "Tracks/All/Early_TrueDamage_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Early_TrueDamage_Secondary.pcm", "Tracks/All/Early_TrueDamage_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Country_Drums.pcm", "Tracks/All/Late_Country_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Country_Main.pcm", "Tracks/All/Late_Country_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Disco_Drums.pcm", "Tracks/All/Late_Disco_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Disco_Main.pcm", "Tracks/All/Late_Disco_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_EDM_Drums.pcm", "Tracks/All/Late_EDM_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_EDM_Main.pcm", "Tracks/All/Late_EDM_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_EightBit_Drums.pcm", "Tracks/All/Late_EightBit_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_EightBit_Main.pcm", "Tracks/All/Late_EightBit_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Emo_Drums.pcm", "Tracks/All/Late_Emo_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Emo_Main.pcm", "Tracks/All/Late_Emo_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Heartsteel_Drums.pcm", "Tracks/All/Late_Heartsteel_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Heartsteel_Main.pcm", "Tracks/All/Late_Heartsteel_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Heartsteel_Secondary.pcm", "Tracks/All/Late_Heartsteel_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Hyperpop_Main.pcm", "Tracks/All/Late_Hyperpop_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_ILLBeats_Drums.pcm", "Tracks/All/Late_ILLBeats_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Jazz_Main.pcm", "Tracks/All/Late_Jazz_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_KDA_Drums.pcm", "Tracks/All/Late_KDA_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_KDA_Main.pcm", "Tracks/All/Late_KDA_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_KDA_Secondary.pcm", "Tracks/All/Late_KDA_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Maestro_Main.pcm", "Tracks/All/Late_Maestro_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_MixMaster_Drums.pcm", "Tracks/All/Late_MixMaster_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_NoOrigin_Main.pcm", "Tracks/All/Late_NoOrigin_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Pentakill_Drums.pcm", "Tracks/All/Late_Pentakill_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Pentakill_Main.pcm", "Tracks/All/Late_Pentakill_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Pentakill_Secondary.pcm", "Tracks/All/Late_Pentakill_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Punk_Drums.pcm", "Tracks/All/Late_Punk_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_Punk_Main.pcm", "Tracks/All/Late_Punk_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_TrueDamage_Drums.pcm", "Tracks/All/Late_TrueDamage_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_TrueDamage_Main.pcm", "Tracks/All/Late_TrueDamage_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/All/Late_TrueDamage_Secondary.pcm", "Tracks/All/Late_TrueDamage_Secondary.pcm"),
    ]);
    public bool InformedAboutDownloadingFiles { get; private set; } = false;
    #endregion

    #region Instance
    public event Func<Task>? InformAboutDownloadingFiles;

    private async ValueTask DownloadTrack(string local_file_path, string server_file_path)
    {
        DownloadProgress.Action = DownloadProgressService.CurrentAction.Checking;
        FileSystemService.SeparatePathLastSplitter(local_file_path, out string _, out string file_name);
        DownloadProgress.FilePath = file_name;
        await Task.Delay(200);
        if(await FS.FileExistsAsync(local_file_path) is true)
        {
            return;
        }
        else
        {
            if(InformedAboutDownloadingFiles is false)
            {
                await InformAboutDownloadingFiles!.Invoke();
                InformedAboutDownloadingFiles = true;
            }
            DownloadProgress.Action = DownloadProgressService.CurrentAction.Downloading;
            DownloadProgress.FilePath = server_file_path;
            byte[] data = await HTTP.GetByteArrayAsync(server_file_path);
            FileSystemFileHandle file_handle = (await FS.GetFileHandleAsync(local_file_path, create: true))!;
            await using FileSystemWritableFileStream file = await file_handle.CreateWritableAsync();
            await file.WriteAsync(data);
        }
    }
    public async Task<bool> DownloadTracks()
    {
        if(InformAboutDownloadingFiles is null)
        {
            throw new InvalidOperationException("No handler for InformAboutDownloadingFiles event has been registered");
        }
        DownloadProgress.Index = 0;
        DownloadProgress.FilePath = "";
        DownloadProgress.Retry = false;
        DownloadProgress.Count = AudioPaths.Count;
        DownloadProgress.Action = DownloadProgressService.CurrentAction.Checking;
        Dictionary<string, string> failed_dict1 = [];
        foreach(KeyValuePair<string, string> pair in AudioPaths)
        {
            try
            {
                await DownloadTrack(pair.Key, pair.Value);
                DownloadProgress.Index += 1;
            }
            catch(Exception exc)
            {
                Console.WriteLine(exc);
                failed_dict1.Add(pair.Key, pair.Value);
            }
        }
        DownloadProgress.Retry = true;
        Dictionary<string, string> failed_dict2 = [];
        foreach(KeyValuePair<string, string> pair in failed_dict1)
        {
            try
            {
                await DownloadTrack(pair.Key, pair.Value);
                DownloadProgress.Index += 1;
            }
            catch(Exception exc)
            {
                Console.WriteLine(exc);
                failed_dict2.Add(pair.Key, pair.Value);
            }
        }
        return failed_dict2.Count is 0;
    }
    #endregion
}