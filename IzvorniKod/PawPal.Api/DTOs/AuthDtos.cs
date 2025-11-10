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
    int UserId,
    string Email,
    string Role, // "owner", "walker", "admin", or "none"
    string? DisplayName);
