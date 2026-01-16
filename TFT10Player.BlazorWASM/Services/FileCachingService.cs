using System.Collections.Frozen;

namespace TFT10Player.BlazorWASM.Services;

public sealed class FileCachingService(BrowserFileSystemService FileSystem, HttpClient HTTP, FileCachingProgressService FileCachingProgress)
{
    #region Static
    internal static readonly FrozenDictionary<string, string> Server_Local_Paths = FrozenDictionary.Create(
        new KeyValuePair<string, string>("TFT10Player/Start.pcm", "Start.pcm"),
        new KeyValuePair<string, string>("TFT10Player/End.pcm", "End.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Country_Drums.pcm", "Early_Country_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Country_Main.pcm", "Early_Country_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Disco_Drums.pcm", "Early_Disco_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Disco_Main.pcm", "Early_Disco_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_EDM_Drums.pcm", "Early_EDM_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_EDM_Main.pcm", "Early_EDM_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_EightBit_Drums.pcm", "Early_EightBit_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_EightBit_Main.pcm", "Early_EightBit_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Emo_Drums.pcm", "Early_Emo_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Emo_Main.pcm", "Early_Emo_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Heartsteel_Drums.pcm", "Early_Heartsteel_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Heartsteel_Main.pcm", "Early_Heartsteel_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Heartsteel_Secondary.pcm", "Early_Heartsteel_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Hyperpop_Main.pcm", "Early_Hyperpop_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_ILLBeats_Drums.pcm", "Early_ILLBeats_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Jazz_Main.pcm", "Early_Jazz_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_KDA_Drums.pcm", "Early_KDA_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_KDA_Main.pcm", "Early_KDA_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_KDA_Secondary.pcm", "Early_KDA_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Maestro_Main.pcm", "Early_Maestro_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_MixMaster_Drums.pcm", "Early_MixMaster_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_NoOrigin_Main.pcm", "Early_NoOrigin_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Pentakill_Drums.pcm", "Early_Pentakill_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Pentakill_Main.pcm", "Early_Pentakill_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Pentakill_Secondary.pcm", "Early_Pentakill_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Punk_Drums.pcm", "Early_Punk_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_Punk_Main.pcm", "Early_Punk_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_TrueDamage_Drums.pcm", "Early_TrueDamage_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_TrueDamage_Main.pcm", "Early_TrueDamage_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_TrueDamage_Secondary.pcm", "Early_TrueDamage_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Country_Drums.pcm", "Late_Country_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Country_Main.pcm", "Late_Country_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Disco_Drums.pcm", "Late_Disco_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Disco_Main.pcm", "Late_Disco_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_EDM_Drums.pcm", "Late_EDM_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_EDM_Main.pcm", "Late_EDM_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_EightBit_Drums.pcm", "Late_EightBit_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_EightBit_Main.pcm", "Late_EightBit_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Emo_Drums.pcm", "Late_Emo_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Emo_Main.pcm", "Late_Emo_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Heartsteel_Drums.pcm", "Late_Heartsteel_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Heartsteel_Main.pcm", "Late_Heartsteel_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Heartsteel_Secondary.pcm", "Late_Heartsteel_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Hyperpop_Main.pcm", "Late_Hyperpop_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_ILLBeats_Drums.pcm", "Late_ILLBeats_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Jazz_Main.pcm", "Late_Jazz_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_KDA_Drums.pcm", "Late_KDA_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_KDA_Main.pcm", "Late_KDA_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_KDA_Secondary.pcm", "Late_KDA_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Maestro_Main.pcm", "Late_Maestro_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_MixMaster_Drums.pcm", "Late_MixMaster_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_NoOrigin_Main.pcm", "Late_NoOrigin_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Pentakill_Drums.pcm", "Late_Pentakill_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Pentakill_Main.pcm", "Late_Pentakill_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Pentakill_Secondary.pcm", "Late_Pentakill_Secondary.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Punk_Drums.pcm", "Late_Punk_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_Punk_Main.pcm", "Late_Punk_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_TrueDamage_Drums.pcm", "Late_TrueDamage_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_TrueDamage_Main.pcm", "Late_TrueDamage_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Late_TrueDamage_Secondary.pcm", "Late_TrueDamage_Secondary.pcm")
    );
    #endregion

    #region Instance
    private async ValueTask CacheFileAsync(KeyValuePair<string, string> server_local_path)
    {
        byte[] data = await HTTP.GetByteArrayAsync(server_local_path.Key);
        await FileSystem.CreateFileAsync(server_local_path.Value, data);
    }
    public async ValueTask<bool> CacheAllAsync()
    {
        FileCachingProgress.Retry = false;
        FileCachingProgress.CachedFiles = 0;
        Dictionary<string, string> failed_paths = [];
        foreach(KeyValuePair<string, string> server_local_path in Server_Local_Paths)
        {
            try
            {
                FileCachingProgress.Server_Local_Path = server_local_path;
                FileCachingProgress.CurrentAction = FileCachingAction.Validating;
                await Task.Delay(250);
                if(await FileSystem.FileExistsAsync(server_local_path.Value) is false)
                {
                    FileCachingProgress.CurrentAction = FileCachingAction.Downloading;
                    await CacheFileAsync(server_local_path);
                }
                FileCachingProgress.CachedFiles += 1;
            }
            catch(Exception exception)
            {
                Console.WriteLine(exception);
                failed_paths.Add(server_local_path.Key, server_local_path.Value);
            }
        }
        if(failed_paths.Count is 0)
        {
            return true;
        }
        FileCachingProgress.Retry = true;
        int twice_failed_count = 0;
        foreach(KeyValuePair<string, string> server_local_path in failed_paths)
        {
            try
            {
                FileCachingProgress.Server_Local_Path = server_local_path;
                FileCachingProgress.CurrentAction = FileCachingAction.Validating;
                await Task.Delay(250);
                if(await FileSystem.FileExistsAsync(server_local_path.Value) is false)
                {
                    FileCachingProgress.CurrentAction = FileCachingAction.Downloading;
                    await CacheFileAsync(server_local_path);
                }
                FileCachingProgress.CachedFiles += 1;
            }
            catch
            {
                twice_failed_count += 1;
            }
        }
        return twice_failed_count is 0;
    }
    #endregion
}