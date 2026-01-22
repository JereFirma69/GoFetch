using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawPal.Api.DTOs;
using PawPal.Api.Services;
using System.Security.Claims;
using PawPal.Api.Data;

namespace PawPal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly AppDbContext _db;

    public AdminController(IAdminService adminService, AppDbContext db)
    {
        _adminService = adminService;
        _db = db;
    }

    private int GetAdminId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    private async Task<bool> IsAdminAsync(int userId, CancellationToken ct)
    {
        return await _db.Administratori.AnyAsync(a => a.IdKorisnik == userId, ct);
    }

    [HttpGet("walkers/pending")]
    [ProducesResponseType(typeof(IEnumerable<PendingWalkerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<PendingWalkerDto>>> GetPendingWalkers(CancellationToken ct)
    {
        try
        {
            var adminId = GetAdminId();
            if (!await IsAdminAsync(adminId, ct)) return Forbid();
            var pendingWalkers = await _adminService.GetPendingWalkersAsync(ct);
            return Ok(pendingWalkers);
        }
        catch (InvalidOperationException)
        {
            return Forbid();
        }
    }

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
            if (!await IsAdminAsync(adminId, ct)) return Forbid();
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
            if (!await IsAdminAsync(adminId, ct)) return Forbid();
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

    [HttpGet("walkers/{walkerId}/verification")]
    [ProducesResponseType(typeof(WalkerVerificationStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WalkerVerificationStatusDto>> GetWalkerVerificationStatus(int walkerId, CancellationToken ct)
    {
        try
        {
            var adminId = GetAdminId();
            if (!await IsAdminAsync(adminId, ct)) return Forbid();
            var status = await _adminService.GetWalkerVerificationStatusAsync(walkerId, ct);
            return Ok(status);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("pricing")]
    [ProducesResponseType(typeof(MembershipPricingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<MembershipPricingDto>> GetPricing(CancellationToken ct)
    {
        var adminId = GetAdminId();
        if (!await IsAdminAsync(adminId, ct)) return Forbid();

        var pricing = await _adminService.GetMembershipPricingAsync(ct);
        return Ok(pricing);
    }

    [HttpPut("pricing")]
    [ProducesResponseType(typeof(MembershipPricingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<MembershipPricingDto>> UpdatePricing([FromBody] UpdateMembershipPricingRequest request, CancellationToken ct)
    {
        var adminId = GetAdminId();
        if (!await IsAdminAsync(adminId, ct)) return Forbid();

        var pricing = await _adminService.UpdateMembershipPricingAsync(request, ct);
        return Ok(pricing);
    }

    [HttpGet("users")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> GetUsers([FromQuery] string? role, [FromQuery] string? q, CancellationToken ct)
    {
        var adminId = GetAdminId();
        if (!await IsAdminAsync(adminId, ct)) return Forbid();

        var (users, total) = await _adminService.SearchUsersAsync(role, q, ct);
        return Ok(new { total, users });
    }
}
