using PawPal.Api.DTOs;

namespace PawPal.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> OAuthLoginAsync(OAuthLoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RegisterRoleAsync(int userId, string role, CancellationToken ct = default);
    Task<AuthResponse> RemoveRoleAsync(int userId, string role, CancellationToken ct = default);
    
    // Password Reset
    Task<PasswordResetResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string frontendUrl, CancellationToken ct = default);
    Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
}
