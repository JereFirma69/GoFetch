namespace PawPal.Api.Services;

public interface IStorageService
{
    Task<string> UploadAvatarAsync(int userId, Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
    Task<string> UploadDogImageAsync(int visnikId, int dogId, Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
    Task DeleteAvatarAsync(int userId, CancellationToken ct = default);
    Task DeleteDogImageAsync(int ownerId, int dogId, CancellationToken ct = default);
    string GetPublicUrl(string bucket, string path);
}
