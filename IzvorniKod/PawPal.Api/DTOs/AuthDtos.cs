namespace PawPal.Api.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName);

public record LoginRequest(
    string Email,
    string Password);

public record OAuthLoginRequest(
    string Provider,
    string Token);

public record RegisterRoleRequest(
    string Role); // "owner" or "walker"

public record AuthResponse(
    string Jwt,
    string RefreshToken,
    int UserId,
    string Email,
    string Role, // "owner", "walker", "admin", or "none"
    string? DisplayName,
    string? FirstName,
    string? LastName);

// Password Reset DTOs
public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(
    string Token,
    string NewPassword);

public record PasswordResetResponse(bool Success, string Message);

// Chat DTOs
public class ChatTokenResponse
{
    public string StreamUserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

