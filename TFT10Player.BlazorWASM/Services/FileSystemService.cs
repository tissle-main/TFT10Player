using KristofferStrube.Blazor.FileAPI;
using KristofferStrube.Blazor.FileSystem;
using JSFile = KristofferStrube.Blazor.FileAPI.File;

namespace TFT10Player.BlazorWASM.Services;

public sealed class FileSystemService(IStorageManagerService StorageManager, HttpClient HTTP, IURLService URL)
{
    #region Static
    public const string RootFolder = "tft10player";

    private static Dictionary<string, string> Urls { get; } = [];

    public static void SeparatePathLastSplitter(string path, out string left, out string right)
    {
        int splitter_index = path.LastIndexOf('/');
        left = path[..splitter_index];
        right = path[(splitter_index + 1)..];
    }
    #endregion

    #region Instance
    public async ValueTask<FileSystemDirectoryHandle?> GetDirectoryHandleAsync(string directory_path, bool create = false)
    {
        if(directory_path.StartsWith($"{RootFolder}/") is false)
        {
            throw new InvalidOperationException($"Directory must be in the '{RootFolder}' folder");
        }
        string[] path = directory_path.Split('/');
        FileSystemDirectoryHandle current_directory = await StorageManager.GetOriginPrivateDirectoryAsync();
        try
        {
            FileSystemGetDirectoryOptions directory_options = new()
            {
                Create = create
            };
            for(int index = 0; index < path.Length; index++)
            {
                FileSystemDirectoryHandle new_directory = await current_directory.GetDirectoryHandleAsync(path[index], directory_options);
                current_directory = new_directory;
            }
            return current_directory;
        }
        catch
        {
            return null;
        }
    }
    public async ValueTask<FileSystemFileHandle?> GetFileHandleAsync(string file_path, bool create = false)
    {
        SeparatePathLastSplitter(file_path, out string directory_path, out string file_name);
        if(await GetDirectoryHandleAsync(directory_path, create) is not FileSystemDirectoryHandle directory)
        {
            return null;
        }
        return await directory.GetFileHandleAsync(file_name, new FileSystemGetFileOptions()
        {
            Create = create
        });
    }
    public async ValueTask<bool> FileExistsAsync(string file_path)
    {
        return await GetFileHandleAsync(file_path) is not null;
    }
    public async ValueTask<JSFile> GetFileAsync(string file_path)
    {
        if(await GetFileHandleAsync(file_path) is FileSystemFileHandle file_handle)
        {
            return await file_handle.GetFileAsync();
        }
        else
        {
            Task<byte[]> fetch_task = HTTP.GetByteArrayAsync(file_path);
            file_handle = (await GetFileHandleAsync(file_path, create: true))!;
            FileSystemWritableFileStream stream = await file_handle.CreateWritableAsync();
            await stream.WriteAsync(await fetch_task);
            await stream.CloseAsync();
            return await file_handle.GetFileAsync();
        }
    }
    public async ValueTask<string> GetUrlAsync(string file_path)
    {
        if(Urls.TryGetValue(file_path, out string? url) is true)
        {
            return url;
        }
        JSFile file = await GetFileAsync(file_path);
        url = await URL.CreateObjectURLAsync(file);
        Urls.Add(file_path, url);
        return url;
    }
    public async ValueTask RemoveUrlAsync(string file_path)
    {
        if(Urls.TryGetValue(file_path, out string? url) is true)
        {
            await URL.RevokeObjectURLAsync(url);
            Urls.Remove(file_path);
        }
    }
    public async ValueTask RemoveEntryAsync(string file_path, bool recursive = false)
    {
        SeparatePathLastSplitter(file_path, out string directory_path, out string file_or_directory);
        if(await GetDirectoryHandleAsync(directory_path) is FileSystemDirectoryHandle directory)
        {
            await directory.RemoveEntryAsync(file_or_directory, new FileSystemRemoveOptions()
            {
                Recursive = recursive
            });
        }
    }
    public async ValueTask ClearAsync()
    {
        FileSystemDirectoryHandle directory = await StorageManager.GetOriginPrivateDirectoryAsync();
        await directory.RemoveEntryAsync(RootFolder, new FileSystemRemoveOptions()
        {
            Recursive = true
        });
    }
    #endregion
}