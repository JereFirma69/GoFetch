using PawPal.Api.DTOs;

namespace PawPal.Api.Services;

public interface IProfileService
{
    Task<ProfileResponse> GetProfileAsync(int userId, CancellationToken ct = default);
    Task<AuthResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default);
    Task UpdateOwnerProfileAsync(int userId, UpdateOwnerRequest request, CancellationToken ct = default);
    Task UpdateWalkerProfileAsync(int userId, UpdateWalkerRequest request, CancellationToken ct = default);

    Task<DogDto> CreateDogAsync(int ownerId, CreateDogRequest request, CancellationToken ct = default);
    Task<DogDto> UpdateDogAsync(int dogId, int ownerId, UpdateDogRequest request, CancellationToken ct = default);
    Task DeleteDogAsync(int dogId, int ownerId, CancellationToken ct = default);
}
