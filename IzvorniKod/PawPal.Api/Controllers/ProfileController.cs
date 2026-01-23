using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawPal.Api.DTOs;
using PawPal.Api.Services;
using System.Security.Claims;

namespace PawPal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }


    /// Get the authenticated user's profile (including owner/walker details and dogs)
    [HttpGet("me")]
    [ProducesResponseType(typeof(ProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ProfileResponse>> GetProfile(CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var profile = await _profileService.GetProfileAsync(userId, ct);
            return Ok(profile);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// Update user profile (general info, walker details)
    [HttpPut("")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var response = await _profileService.UpdateProfileAsync(userId, request, ct);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }


    /// Update owner profile (first name, last name)
    [HttpPut("owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateOwnerProfile([FromBody] UpdateOwnerRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            await _profileService.UpdateOwnerProfileAsync(userId, request, ct);
            return Ok(new { message = "Owner profile updated successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }


    /// Update walker profile (name, location, phone, picture, bio)
    [HttpPut("walker")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateWalkerProfile([FromBody] UpdateWalkerRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            await _profileService.UpdateWalkerProfileAsync(userId, request, ct);
            return Ok(new { message = "Walker profile updated successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }


    /// Create a new dog for the authenticated owner

    [HttpPost("dogs")]
    [ProducesResponseType(typeof(DogDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DogDto>> CreateDog([FromBody] CreateDogRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var dog = await _profileService.CreateDogAsync(userId, request, ct);
            return CreatedAtAction(nameof(GetProfile), new { id = dog.IdPas }, dog);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// Update an existing dog owned by the authenticated user

    [HttpPut("dogs/{dogId}")]
    [ProducesResponseType(typeof(DogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DogDto>> UpdateDog(int dogId, [FromBody] UpdateDogRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var dog = await _profileService.UpdateDogAsync(dogId, userId, request, ct);
            return Ok(dog);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }


    /// Delete a dog owned by the authenticated user

    [HttpDelete("dogs/{dogId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteDog(int dogId, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            await _profileService.DeleteDogAsync(dogId, userId, ct);
            return Ok(new { message = "Dog deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
