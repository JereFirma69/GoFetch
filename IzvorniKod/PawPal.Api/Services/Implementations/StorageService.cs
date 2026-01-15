using Microsoft.Extensions.Options;
using PawPal.Api.Configuration;
using Supabase;
using SupabaseConfig = Supabase.SupabaseOptions;

namespace PawPal.Api.Services.Implementations;

public class StorageService : IStorageService
{
    private readonly Client _supabase;
    private readonly Configuration.SupabaseOptions _options;
    private const string AvatarsBucket = "Avatar";
    private const string DogImagesBucket = "DogPhotos";

    public StorageService(IOptions<Configuration.SupabaseOptions> options)
    {
        _options = options.Value;
        
        var supabaseOptions = new SupabaseConfig
        {
            AutoRefreshToken = false,
            AutoConnectRealtime = false
        };

        _supabase = new Client(_options.ProjectUrl, _options.ServiceRoleKey, supabaseOptions);
    }

    public async Task<string> UploadAvatarAsync(int userId, Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(fileName);
        var path = $"{userId}/avatar{extension}";

        // Convert stream to byte array
        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, ct);
        var bytes = memoryStream.ToArray();

        // Upload to Supabase Storage
        await _supabase.Storage
            .From(AvatarsBucket)
            .Upload(bytes, path, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = true
            });

        return GetPublicUrl(AvatarsBucket, path);
    }

    public async Task<string> UploadDogImageAsync(int ownerId, int dogId, Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(fileName);
        var path = $"{ownerId}/{dogId}{extension}";

        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, ct);
        var bytes = memoryStream.ToArray();

        await _supabase.Storage
            .From(DogImagesBucket)
            .Upload(bytes, path, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = true
            });

        return GetPublicUrl(DogImagesBucket, path);
    }

    public async Task DeleteAvatarAsync(int userId, CancellationToken ct = default)
    {
        // List files in user's avatar folder and delete them
        var files = await _supabase.Storage
            .From(AvatarsBucket)
            .List($"{userId}");

        if (files != null && files.Count > 0)
        {
            var paths = files.Select(f => $"{userId}/{f.Name}").ToList();
            await _supabase.Storage
                .From(AvatarsBucket)
                .Remove(paths);
        }
    }

    public async Task DeleteDogImageAsync(int ownerId, int dogId, CancellationToken ct = default)
    {
        var files = await _supabase.Storage
            .From(DogImagesBucket)
            .List($"{ownerId}");

        if (files != null)
        {
            var dogFiles = files.Where(f => f.Name.StartsWith($"{dogId}")).ToList();
            if (dogFiles.Count > 0)
            {
                var paths = dogFiles.Select(f => $"{ownerId}/{f.Name}").ToList();
                await _supabase.Storage
                    .From(DogImagesBucket)
                    .Remove(paths);
            }
        }
    }

    public string GetPublicUrl(string bucket, string path)
    {
        return $"{_options.ProjectUrl}/storage/v1/object/public/{bucket}/{path}";
    }
}
