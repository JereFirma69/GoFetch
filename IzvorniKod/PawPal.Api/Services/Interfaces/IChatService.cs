using PawPal.Api.DTOs;

namespace PawPal.Api.Services;

public interface IChatService
{
    /// <summary>
    /// Generates a Stream authentication token for a user
    /// </summary>
    Task<ChatTokenResponse> GenerateTokenAsync(int userId, string userEmail, string? userName = null);

    /// <summary>
    /// Creates or updates a user in Stream
    /// </summary>
    Task CreateOrUpdateStreamUserAsync(int userId, string userEmail, string? userName = null);

    /// <summary>
    /// Ensures multiple users exist in Stream (upserts them)
    /// </summary>
    Task EnsureUsersExistAsync(int[] userIds);

    /// <summary>
    /// Deletes a user from Stream
    /// </summary>
    Task DeleteStreamUserAsync(int userId);
}
