using System.Runtime.InteropServices;

Directory.CreateDirectory("TFT10Player");
Directory.EnumerateFiles("Wav").AsParallel().Select(path =>
{
    Console.WriteLine($"Converting: {path}");
    string str = $"{Path.GetFileNameWithoutExtension(path)}.pcm";
    FileStream input = File.OpenRead(path);
    input.Position = 44;
    FileStream output = File.OpenWrite(Path.Combine("TFT10Player", str));
    Span<byte> span = stackalloc byte[2];
    while(input.Position < input.Length)
    {
        input.ReadExactly(span);
        float value = MemoryMarshal.Read<short>(span) / (float)short.MaxValue;
        output.Write(BitConverter.GetBytes(value));
    }
    Console.WriteLine($"Done: {str}");
    return "";
}).ToArray();