using System.Collections.Frozen;

namespace TFT10Player.BlazorWASM.Services;

public sealed class FileCachingService(BrowserFileSystemService FileSystem, HttpClient HTTP, FileCachingProgressService FileCachingProgress)
{
    #region Static
    internal static readonly FrozenDictionary<string, string> Server_Local_Paths = FrozenDictionary.Create(
        new KeyValuePair<string, string>("TFT10Player/Start.pcm", "Start.pcm"),
        new KeyValuePair<string, string>("TFT10Player/End.pcm", "End.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_TrueDamage_Drums.pcm", "Early_TrueDamage_Drums.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_TrueDamage_Main.pcm", "Early_TrueDamage_Main.pcm"),
        new KeyValuePair<string, string>("TFT10Player/Early_TrueDamage_Secondary.pcm", "Early_TrueDamage_Secondary.pcm")
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