using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PawPal.Api.Configuration;
using PawPal.Api.Data;
using PawPal.Api.DTOs;

namespace PawPal.Api.Services.Implementations;

public class ChatService : IChatService
{
    private readonly StreamOptions _streamOptions;
    private readonly ILogger<ChatService> _logger;
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;
    private string StreamApiUrl => _streamOptions.ApiUrl.TrimEnd('/');

    public ChatService(IOptions<StreamOptions> streamOptions, ILogger<ChatService> logger, HttpClient httpClient, AppDbContext db)
    {
        _streamOptions = streamOptions.Value;
        _logger = logger;
        _httpClient = httpClient;
        _db = db;
    }

    public async Task<ChatTokenResponse> GenerateTokenAsync(int userId, string userEmail, string? userName = null)
    {
        try
        {
            EnsureStreamConfigured();

            // Upsert user on the server first (recommended)
            await CreateOrUpdateStreamUserAsync(userId, userEmail, userName);

            var token = GenerateStreamToken(userId.ToString());

            _logger.LogInformation("Generated Stream token for user {UserId}", userId);

            return new ChatTokenResponse
            {
                StreamUserId = userId.ToString(),
                Token = token,
                ApiKey = _streamOptions.ApiKey,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating Stream token for user {UserId}", userId);
            throw;
        }
    }

    public async Task CreateOrUpdateStreamUserAsync(int userId, string userEmail, string? userName = null)
    {
        try
        {
            EnsureStreamConfigured();
            _logger.LogInformation("Stream API URL configured as: {StreamApiUrl}", StreamApiUrl);

            var streamUserId = userId.ToString();
            var displayName = userName ?? userEmail.Split('@')[0];

            // Stream Chat API expects users as an object with user_id as key
            var payload = new
            {
                users = new Dictionary<string, object>
                {
                    { 
                        streamUserId, 
                        new 
                        { 
                            id = streamUserId, 
                            name = displayName,
                            email = userEmail
                        } 
                    }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Stream Chat API: POST /users for upsert
            var request = new HttpRequestMessage(HttpMethod.Post, $"{StreamApiUrl}/users?api_key={_streamOptions.ApiKey}")
            {
                Content = content
            };

            ApplyStreamServerAuth(request);

            _logger.LogInformation("Creating/updating Stream user {UserId} with request to {Url}", userId, request.RequestUri);

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to create Stream user. Status: {StatusCode}, Response: {Response}", response.StatusCode, responseContent);
                throw new Exception($"Failed to create Stream user: {response.StatusCode}");
            }

            _logger.LogInformation("User {UserId} created/updated in Stream successfully", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating Stream user {UserId}", userId);
            throw;
        }
    }

    public async Task DeleteStreamUserAsync(int userId)
    {
        try
        {
            EnsureStreamConfigured();

            var streamUserId = userId.ToString();

            var request = new HttpRequestMessage(HttpMethod.Delete, $"{StreamApiUrl}/users/{streamUserId}?api_key={_streamOptions.ApiKey}");
            ApplyStreamServerAuth(request);
            
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to delete Stream user. Status: {StatusCode}, Response: {Response}", response.StatusCode, errorContent);
                throw new Exception($"Failed to delete Stream user: {response.StatusCode}");
            }

            _logger.LogInformation("User {UserId} deleted from Stream", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting Stream user {UserId}", userId);
            throw;
        }
    }

    public async Task EnsureUsersExistAsync(int[] userIds)
    {
        try
        {
            EnsureStreamConfigured();

            // Look up users from database
            var users = await _db.Korisnici
                .Where(k => userIds.Contains(k.IdKorisnik))
                .Select(k => new { k.IdKorisnik, k.EmailKorisnik, k.Ime, k.Prezime })
                .ToListAsync();

            if (users.Count == 0)
            {
                _logger.LogWarning("No users found for IDs: {UserIds}", string.Join(", ", userIds));
                return;
            }

            // Build the users payload for Stream batch upsert
            var usersDict = new Dictionary<string, object>();
            foreach (var user in users)
            {
                var streamUserId = user.IdKorisnik.ToString();
                var displayName = !string.IsNullOrEmpty(user.Ime) ? $"{user.Ime} {user.Prezime}".Trim() : user.EmailKorisnik.Split('@')[0];
                usersDict[streamUserId] = new
                {
                    id = streamUserId,
                    name = displayName,
                    email = user.EmailKorisnik
                };
            }

            var payload = new { users = usersDict };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, $"{StreamApiUrl}/users?api_key={_streamOptions.ApiKey}")
            {
                Content = content
            };
            ApplyStreamServerAuth(request);

            _logger.LogInformation("Ensuring {Count} users exist in Stream: {UserIds}", users.Count, string.Join(", ", userIds));

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to ensure Stream users exist. Status: {StatusCode}, Response: {Response}", response.StatusCode, responseContent);
                throw new Exception($"Failed to ensure Stream users exist: {response.StatusCode}");
            }

            _logger.LogInformation("Successfully ensured {Count} users exist in Stream", users.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ensuring users exist in Stream: {UserIds}", string.Join(", ", userIds));
            throw;
        }
    }

    private string GenerateStreamToken(string userId)
    {
        // Create JWT token for Stream Chat
        // Header
        var header = new { alg = "HS256", typ = "JWT" };
        var headerJson = JsonSerializer.Serialize(header);
        var headerEncoded = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));

        // Payload
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var payload = new
        {
            user_id = userId,
            iat = now,
            exp = now + (30 * 24 * 60 * 60) // 30 days
        };
        var payloadJson = JsonSerializer.Serialize(payload);
        var payloadEncoded = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

        // Signature
        var signatureInput = $"{headerEncoded}.{payloadEncoded}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_streamOptions.ApiSecret));
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(signatureInput));
        var signatureEncoded = Base64UrlEncode(signatureBytes);

        return $"{signatureInput}.{signatureEncoded}";
    }

    private string GenerateServerToken()
    {
        // Server-side token requires "server: true" claim instead of user_id
        var header = new { alg = "HS256", typ = "JWT" };
        var headerJson = JsonSerializer.Serialize(header);
        var headerEncoded = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var payload = new
        {
            server = true,
            iat = now,
            exp = now + (60 * 60) // 1 hour for server token
        };
        var payloadJson = JsonSerializer.Serialize(payload);
        var payloadEncoded = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

        var signatureInput = $"{headerEncoded}.{payloadEncoded}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_streamOptions.ApiSecret));
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(signatureInput));
        var signatureEncoded = Base64UrlEncode(signatureBytes);

        return $"{signatureInput}.{signatureEncoded}";
    }

    private void ApplyStreamServerAuth(HttpRequestMessage request)
    {
        // Stream Chat REST API expects the JWT in the Authorization header with Bearer prefix
        var token = GenerateServerToken();
        request.Headers.TryAddWithoutValidation("Stream-Auth-Type", "jwt");
        request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {token}");
    }

    private void EnsureStreamConfigured()
    {
        if (string.IsNullOrWhiteSpace(_streamOptions.ApiKey) || string.IsNullOrWhiteSpace(_streamOptions.ApiSecret))
        {
            throw new InvalidOperationException("Stream is not configured (missing Stream:ApiKey / Stream:ApiSecret or STREAM_API_KEY / STREAM_API_SECRET)."
            );
        }
    }

    private static string Base64UrlEncode(byte[] input)
    {
        var output = Convert.ToBase64String(input);
        output = output.Split('=')[0]; // Remove trailing '='
        output = output.Replace('+', '-'); // 62nd char of encoding
        output = output.Replace('/', '_'); // 63rd char of encoding
        return output;
    }
}
