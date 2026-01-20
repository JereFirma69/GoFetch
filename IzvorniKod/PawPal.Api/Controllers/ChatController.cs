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
                return Unauthorized(new { message = "Invalid user ID" });
            }

            // Get user email from claims
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
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
            _logger.LogError(ex, "Error getting chat token");
            return StatusCode(500, new { message = "Error generating chat token", error = ex.Message });
        }
    }
}
