using KristofferStrube.Blazor.FileSystem;

namespace TFT10Player.BlazorWASM.Services;

public sealed class FileSystemService(IStorageManagerService StorageManager)
{
    #region Static
    public const string RootFolder = "TFT10Player";

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
        if(directory_path != RootFolder && directory_path.StartsWith($"{RootFolder}/") is false)
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
        try
        {
            return await GetFileHandleAsync(file_path) is not null;
        }
        catch
        {
            return false;
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