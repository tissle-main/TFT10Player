using Microsoft.JSInterop;

namespace TFT10Player.BlazorWASM.Services;

public sealed class TFTPlayerInteropService(IJSRuntime thisJSRuntime)
{
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
}