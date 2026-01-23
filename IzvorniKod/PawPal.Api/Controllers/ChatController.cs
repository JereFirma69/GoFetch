using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawPal.Api.Services;
using System.Security.Claims;

namespace PawPal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IChatService chatService, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    /// <summary>
    /// Get Stream authentication token for the current user
    /// </summary>
    [HttpGet("token")]
    public async Task<IActionResult> GetChatToken()
    {
        try
        {
            // Get user ID from claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                _logger.LogWarning("Chat token request unauthorized: missing/invalid NameIdentifier claim. TraceId={TraceId}", HttpContext.TraceIdentifier);
                return Unauthorized(new { message = "Invalid user ID" });
            }

            // Get user email from claims
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                _logger.LogWarning("Chat token request unauthorized: missing Email claim for user {UserId}. TraceId={TraceId}", userId, HttpContext.TraceIdentifier);
                return Unauthorized(new { message = "Email not found in token" });
            }

            // Get user name from claims if available
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;

            // Generate token
            var tokenResponse = await _chatService.GenerateTokenAsync(userId, userEmail, userName);
            return Ok(tokenResponse);
        }
        catch (Exception ex)
        {
            var traceId = HttpContext.TraceIdentifier;
            _logger.LogError(ex, "CHAT TOKEN ERROR. TraceId={TraceId}", traceId);
            return StatusCode(500, new { message = "Error generating chat token", error = ex.Message, traceId });
        }
    }
}
