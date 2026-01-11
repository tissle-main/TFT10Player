using KristofferStrube.Blazor.FileSystem;
using JSFile = KristofferStrube.Blazor.FileAPI.File;

namespace TFT10Player.BlazorWASM.Services;

public sealed class BrowserFileSystemService(IStorageManagerService StorageManager)
{
    #region Static
    private const string RootFolder = "TFT10Player";

    private static readonly FileSystemGetDirectoryOptions GetRootDirectoryOptions = new()
    {
        Create = true
    };
    private static readonly FileSystemRemoveOptions RemoveRootDirectioryOptions = new()
    {
        Recursive = true
    };
    #endregion

    #region Instance
    private async ValueTask<FileSystemDirectoryHandle> GetRootDirectoryHandleAsync()
    {
        FileSystemDirectoryHandle root_directory_handle = await StorageManager.GetOriginPrivateDirectoryAsync();
        return await root_directory_handle.GetDirectoryHandleAsync(RootFolder, GetRootDirectoryOptions);
    }
    private async ValueTask<FileSystemFileHandle> GetFileHandleAsync(string file_name, bool create = false)
    {
        FileSystemDirectoryHandle root_directory_handle = await GetRootDirectoryHandleAsync();
        FileSystemGetFileOptions get_file_options = new()
        {
            Create = create
        };
        return await root_directory_handle.GetFileHandleAsync(file_name, get_file_options);
    }
    public async ValueTask CreateFileAsync(string file_name, byte[] data)
    {
        FileSystemFileHandle file_handle = await GetFileHandleAsync(file_name, create: true);
        await using FileSystemWritableFileStream writable_stream = await file_handle.CreateWritableAsync();
        await writable_stream.WriteAsync(data);
    }
    public async ValueTask RemoveFileAsync(string file_name)
    {
        FileSystemDirectoryHandle root_directory_handle = await GetRootDirectoryHandleAsync();
        await root_directory_handle.RemoveEntryAsync(file_name);
    }
    public async ValueTask<JSFile> GetFileAsync(string file_name)
    {
        FileSystemFileHandle file_handle = await GetFileHandleAsync(file_name);
        return await file_handle.GetFileAsync();
    }
    public async ValueTask<bool> FileExistsAsync(string file_name)
    {
        try
        {
            await GetFileHandleAsync(file_name);
            return true;
        }
        catch
        {
            return false;
        }
    }
    public async ValueTask ClearAllAsync()
    {
        FileSystemDirectoryHandle root_directory_handle = await StorageManager.GetOriginPrivateDirectoryAsync();
        await root_directory_handle.RemoveEntryAsync(RootFolder, RemoveRootDirectioryOptions);
    }
    #endregion
}