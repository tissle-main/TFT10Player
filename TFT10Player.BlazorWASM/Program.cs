using TFT10Player.BlazorWASM;
using TFT10Player.BlazorWASM.Services;
using KristofferStrube.Blazor.FileSystem;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

WebAssemblyHostBuilder builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
builder.Services.AddScoped(HttpClient(IServiceProvider sp) =>
{
    return new HttpClient() 
    { 
        BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
    };
});
builder.Services.AddStorageManagerService();
builder.Services.AddScoped<BrowserFileSystemService>();
builder.Services.AddScoped<FileCachingService>();
builder.Services.AddScoped<FileCachingProgressService>();
builder.Services.AddScoped<TFTPlayerInteropService>();
await builder.Build().RunAsync();