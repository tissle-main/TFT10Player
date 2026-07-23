using Microsoft.JSInterop;

namespace TFT10Player.BlazorWASM.Services;

public sealed class TFTPlayerInteropService(IJSRuntime thisJSRuntime)
{
    #region Static
    public static event Action<int>? GetMinChangeTracksMinutesResult;
    public static event Action<int>? GetMaxChangeTracksMinutesResult;
    public static event Action<int>? GetMinChangePeriodMinutesResult;
    public static event Action<int>? GetMaxChangePeriodMinutesResult;

    [JSInvokable]
    public static void GetMinChangeTracksMinutesCallback(int min)
    {
        GetMinChangeTracksMinutesResult?.Invoke(min);
    }

    [JSInvokable]
    public static void GetMaxChangeTracksMinutesCallback(int min)
    {
        GetMaxChangeTracksMinutesResult?.Invoke(min);
    }

    [JSInvokable]
    public static void GetMinChangePeriodMinutesCallback(int min)
    {
        GetMinChangePeriodMinutesResult?.Invoke(min);
    }

    [JSInvokable]
    public static void GetMaxChangePeriodMinutesCallback(int min)
    {
        GetMaxChangePeriodMinutesResult?.Invoke(min);
    }
    #endregion

    #region Instance
    public async ValueTask ResumeAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.resume");
    }
    public async ValueTask PauseAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.pause");
    }
    public async ValueTask ChangeTracksAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.changeTracks");
    }
    public async ValueTask ChangePeriodAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.changePeriod");
    }
    public async ValueTask AddTrackAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.addTrack");
    }
    public async ValueTask RemoveTrackAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.removeTrack");
    }
    public async ValueTask SetMinChangeTracksMinutesAsync(int min)
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.setMinChangeTracksMinutes", min);
    }
    public async ValueTask SetMaxChangeTracksMinutesAsync(int min)
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.setMaxChangeTracksMinutes", min);
    }
    public async ValueTask SetMinChangePeriodMinutesAsync(int min)
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.setMinChangePeriodMinutes", min);
    }
    public async ValueTask SetMaxChangePeriodMinutesAsync(int min)
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.setMaxChangePeriodMinutes", min);
    }
    public async ValueTask GetMinChangeTracksMinutesRequestAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.getMinChangeTracksMinutes");
    }
    public async ValueTask GetMaxChangeTracksMinutesRequestAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.getMaxChangeTracksMinutes");
    }
    public async ValueTask GetMinChangePeriodMinutesRequestAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.getMinChangePeriodMinutes");
    }
    public async ValueTask GetMaxChangePeriodMinutesRequestAsync()
    {
        await thisJSRuntime.InvokeVoidAsync("tftplayer.getMaxChangePeriodMinutes");
    }
    #endregion
}