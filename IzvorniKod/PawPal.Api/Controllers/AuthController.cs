using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawPal.Api.DTOs;
using PawPal.Api.Services;
using System.Security.Claims;

namespace PawPal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// Register a new user with email and password
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, ct);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// Login with email and password
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.LoginAsync(request, ct);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    /// Login or register using OAuth provider (Google)
    [HttpPost("oauth-login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> OAuthLogin([FromBody] OAuthLoginRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.OAuthLoginAsync(request, ct);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// Register a role (owner or walker) for an authenticated user
    [Authorize]
    [HttpPost("register-role")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> RegisterRole([FromBody] RegisterRoleRequest request, CancellationToken ct)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var response = await _authService.RegisterRoleAsync(userId, request.Role, ct);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// Remove a role (owner or walker) from an authenticated user
    [Authorize]
    [HttpPost("remove-role")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> RemoveRole([FromBody] RegisterRoleRequest request, CancellationToken ct)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var response = await _authService.RemoveRoleAsync(userId, request.Role, ct);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
