using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PawPal.Api.Configuration;
using PawPal.Api.DTOs;
using PawPal.Api.Services;
using System.Security.Claims;

namespace PawPal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly JwtOptions _jwtOptions;

    public AuthController(IAuthService authService, IConfiguration configuration, IOptions<JwtOptions> jwtOptions)
    {
        _authService = authService;
        _configuration = configuration;
        _jwtOptions = jwtOptions.Value;
    }

    private void SetAuthCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Always use Secure (HTTPS)
            SameSite = SameSiteMode.None, // Required for cross-origin requests
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiresMinutes),
            Path = "/"
        };
        
        Response.Cookies.Append("auth_token", token, cookieOptions);
    }

    private void SetRefreshCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpiresDays),
            Path = "/"
        };

        Response.Cookies.Append("refresh_token", token, cookieOptions);
    }

    private void ClearAuthCookie()
    {
        Response.Cookies.Delete("auth_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });
    }

    private void ClearRefreshCookie()
    {
        Response.Cookies.Delete("refresh_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, ct);
            SetAuthCookie(response.Jwt);
            SetRefreshCookie(response.RefreshToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.LoginAsync(request, ct);
            SetAuthCookie(response.Jwt);
            SetRefreshCookie(response.RefreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("oauth-login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> OAuthLogin([FromBody] OAuthLoginRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.OAuthLoginAsync(request, ct);
            SetAuthCookie(response.Jwt);
            SetRefreshCookie(response.RefreshToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Logout(CancellationToken ct)
    {
        var refresh = Request.Cookies["refresh_token"];
        if (!string.IsNullOrEmpty(refresh))
        {
            await _authService.RevokeRefreshTokenAsync(refresh, ct);
        }
        ClearAuthCookie();
        ClearRefreshCookie();
        return Ok(new { message = "Logged out successfully" });
    }

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
            SetAuthCookie(response.Jwt);
            SetRefreshCookie(response.RefreshToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

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
            SetAuthCookie(response.Jwt);
            SetRefreshCookie(response.RefreshToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(PasswordResetResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PasswordResetResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        // Detect frontend URL from referer or use config
        var referer = Request.Headers.Referer.ToString();
        string frontendUrl;
        
        if (!string.IsNullOrEmpty(referer) && Uri.TryCreate(referer, UriKind.Absolute, out var refererUri))
        {
            // Use the origin from where the request came
            frontendUrl = $"{refererUri.Scheme}://{refererUri.Authority}";
        }
        else
        {
            // Fallback to config/env
            frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        }
        
        var response = await _authService.ForgotPasswordAsync(request, frontendUrl, ct);
        return Ok(response);
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(PasswordResetResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PasswordResetResponse>> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        var response = await _authService.ResetPasswordAsync(request, ct);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Refresh(CancellationToken ct)
    {
        var refresh = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refresh))
        {
            return Unauthorized(new { error = "Missing refresh token" });
        }

        try
        {
            var response = await _authService.RefreshAsync(refresh, ct);
            SetAuthCookie(response.Jwt);
            SetRefreshCookie(response.RefreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
