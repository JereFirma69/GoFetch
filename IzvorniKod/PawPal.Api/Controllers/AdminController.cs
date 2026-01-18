using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawPal.Api.DTOs;
using PawPal.Api.Services;
using System.Security.Claims;

namespace PawPal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    private int GetAdminId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    /// <summary>
    /// Get list of pending walker verifications (admin only)
    /// </summary>
    [HttpGet("walkers/pending")]
    [ProducesResponseType(typeof(IEnumerable<PendingWalkerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<PendingWalkerDto>>> GetPendingWalkers(CancellationToken ct)
    {
        try
        {
            var adminId = GetAdminId();
            var pendingWalkers = await _adminService.GetPendingWalkersAsync(ct);
            return Ok(pendingWalkers);
        }
        catch (InvalidOperationException ex)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Approve a walker's verification (admin only)
    /// </summary>
    [HttpPost("walkers/approve")]
    [ProducesResponseType(typeof(VerificationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<VerificationResultDto>> ApproveWalker([FromBody] ApproveWalkerRequest request, CancellationToken ct)
    {
        try
        {
            var adminId = GetAdminId();
            var result = await _adminService.ApproveWalkerAsync(adminId, request, ct);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Reject a walker's verification (admin only)
    /// </summary>
    [HttpPost("walkers/reject")]
    [ProducesResponseType(typeof(VerificationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<VerificationResultDto>> RejectWalker([FromBody] RejectWalkerRequest request, CancellationToken ct)
    {
        try
        {
            var adminId = GetAdminId();
            var result = await _adminService.RejectWalkerAsync(adminId, request, ct);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get verification status for a specific walker
    /// </summary>
    [HttpGet("walkers/{walkerId}/verification")]
    [ProducesResponseType(typeof(WalkerVerificationStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WalkerVerificationStatusDto>> GetWalkerVerificationStatus(int walkerId, CancellationToken ct)
    {
        try
        {
            var status = await _adminService.GetWalkerVerificationStatusAsync(walkerId, ct);
            return Ok(status);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
