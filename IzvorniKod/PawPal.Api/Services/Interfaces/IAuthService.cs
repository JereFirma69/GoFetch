using PawPal.Api.DTOs;

namespace PawPal.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> OAuthLoginAsync(OAuthLoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RegisterRoleAsync(int userId, string role, CancellationToken ct = default);
    Task<AuthResponse> RemoveRoleAsync(int userId, string role, CancellationToken ct = default);
}
