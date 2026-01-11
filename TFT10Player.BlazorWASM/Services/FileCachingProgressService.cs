namespace TFT10Player.BlazorWASM.Services;

public enum FileCachingAction
{
    Validating,
    Downloading,
}
public sealed class FileCachingProgressService
{
    public int TotalFiles { get; } = FileCachingService.Server_Local_Paths.Count;
    public int CachedFiles
    {
        get => field;
        set
        {
            field = value;
            StateHasChanged?.Invoke();
        }
    }
    public KeyValuePair<string, string> Server_Local_Path
    {
        get => field;
        set
        {
            field = value;
            StateHasChanged?.Invoke();
        }
    }
    public FileCachingAction CurrentAction
    {
        get => field;
        set
        {
            field = value;
            StateHasChanged?.Invoke();
        }
    }
    public bool Retry
    {
        get => field;
        set
        {
            field = value;
            StateHasChanged?.Invoke();
        }
    }

    public event Action? StateHasChanged;
}