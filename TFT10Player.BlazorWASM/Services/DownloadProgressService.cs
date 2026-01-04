namespace TFT10Player.BlazorWASM.Services;

public sealed class DownloadProgressService
{
    #region Instance
    public int Index
    {
        get => field;
        set
        {
            field = value;
            RenderMethod?.Invoke();
        }
    }
    public int Count
    {
        get => field;
        set
        {
            field = value;
            RenderMethod?.Invoke();
        }
    }
    public bool Retry
    {
        get => field;
        set
        {
            field = value;
            RenderMethod?.Invoke();
        }
    }
    public string? FilePath
    {
        get => field;
        set
        {
            field = value;
            RenderMethod?.Invoke();
        }
    }
    public CurrentAction Action
    {
        get => field;
        set
        {
            field = value;
            RenderMethod?.Invoke();
        }
    }

    public event Action? RenderMethod;
    #endregion

    #region Nested
    public enum CurrentAction
    {
        Checking,
        Downloading,
        Converting,
    }
    #endregion
}