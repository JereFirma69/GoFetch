using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;
using Microsoft.Extensions.Options;
using PawPal.Api.Configuration;
using PawPal.Api.DTOs;

namespace PawPal.Api.Services.Implementations;

public class ChatService : IChatService
{
    private readonly StreamOptions _streamOptions;
    private readonly ILogger<ChatService> _logger;
    private readonly HttpClient _httpClient;
    private const string StreamApiUrl = "https://chat.stream-io-api.com/api/v1";

    public ChatService(IOptions<StreamOptions> streamOptions, ILogger<ChatService> logger, HttpClient httpClient)
    {
        _streamOptions = streamOptions.Value;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<ChatTokenResponse> GenerateTokenAsync(int userId, string userEmail, string? userName = null)
    {
        try
        {
            // Create user in Stream if it doesn't exist
            await CreateOrUpdateStreamUserAsync(userId, userEmail, userName);

            // Generate JWT token for the user
            var token = GenerateStreamToken(userId.ToString());

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
            var streamUserId = userId.ToString();
            var displayName = userName ?? userEmail.Split('@')[0];

            var userObj = new
            {
                id = streamUserId,
                name = displayName,
                email = userEmail
            };

            var usersDict = new Dictionary<string, object>
            {
                { streamUserId, userObj }
            };

            var payload = new
            {
                users = usersDict
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, $"{StreamApiUrl}/users?api_key={_streamOptions.ApiKey}")
            {
                Content = content
            };

            // Stream server-side REST calls must be authenticated with a server token (signed with the API secret).
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", GenerateServerToken());

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to create Stream user: {ErrorContent}", errorContent);
                throw new Exception($"Failed to create Stream user: {response.StatusCode}");
            }

            _logger.LogInformation("User {UserId} created/updated in Stream", userId);
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
            var streamUserId = userId.ToString();

            var request = new HttpRequestMessage(HttpMethod.Delete, $"{StreamApiUrl}/users/{streamUserId}?api_key={_streamOptions.ApiKey}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", GenerateServerToken());
            
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to delete Stream user: {ErrorContent}", errorContent);
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
        // Stream recommends using a dedicated server-side user id for REST calls.
        return GenerateStreamToken("server");
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
