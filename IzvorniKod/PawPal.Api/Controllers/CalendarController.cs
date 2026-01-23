using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawPal.Api.DTOs;
using PawPal.Api.Services;
using System.Security.Claims;

namespace PawPal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;
    private readonly IGoogleCalendarService _googleCalendarService;

    public CalendarController(ICalendarService calendarService, IGoogleCalendarService googleCalendarService)
    {
        _calendarService = calendarService;
        _googleCalendarService = googleCalendarService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    // ============ GOOGLE CALENDAR AUTH ============

    [HttpGet("google/auth-url")]
    [ProducesResponseType(typeof(GoogleCalendarAuthUrlResponse), StatusCodes.Status200OK)]
    public ActionResult<GoogleCalendarAuthUrlResponse> GetGoogleAuthUrl([FromQuery] string frontendOrigin = "")
    {
        var userId = GetUserId();
        // Encode both userId and frontendOrigin in state
        var state = frontendOrigin != "" 
            ? Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userId}|{frontendOrigin}"))
            : userId.ToString();
        var url = _googleCalendarService.GetAuthorizationUrl(userId, state);
        return Ok(new GoogleCalendarAuthUrlResponse(url));
    }

    [HttpGet("google/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string state, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            return BadRequest(new { error = "Missing authorization code or state" });
        }

        int walkerId;
        string frontendUrl = "";

        // Try to decode state as base64 (new format with frontend origin)
        try
        {
            var decodedState = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(state));
            var parts = decodedState.Split('|');
            if (parts.Length == 2 && int.TryParse(parts[0], out var userId))
            {
                walkerId = userId;
                frontendUrl = parts[1];
            }
            else if (int.TryParse(state, out var simpleId))
            {
                // Fallback to simple userId format
                walkerId = simpleId;
                frontendUrl = "";
            }
            else
            {
                return BadRequest(new { error = "Invalid state parameter" });
            }
        }
        catch
        {
            // Fallback: state is just userId as string
            if (!int.TryParse(state, out walkerId))
            {
                return BadRequest(new { error = "Invalid state parameter" });
            }
        }

        try
        {
            await _googleCalendarService.SaveOAuthTokensAsync(walkerId, code, ct);
            
            // Use frontend URL from state if available, otherwise fall back to config
            if (string.IsNullOrEmpty(frontendUrl))
            {
                frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
                    ?? HttpContext.RequestServices.GetService<IConfiguration>()?["FrontendUrl"] 
                    ?? "http://localhost:5173";
            }
            
            // Return HTML that redirects on client side
            var redirectUrl = $"{frontendUrl}/profile?calendar=connected";
            var html = $@"<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
    <script>
        window.location.href = '{redirectUrl}';
    </script>
</head>
<body>
    <p>Redirecting to app... <a href=""{redirectUrl}"">Click here if not redirected</a></p>
</body>
</html>";
            
            return Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("google/status")]
    [ProducesResponseType(typeof(GoogleCalendarAuthStatusResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<GoogleCalendarAuthStatusResponse>> GetGoogleAuthStatus(CancellationToken ct)
    {
        var userId = GetUserId();
        var status = await _googleCalendarService.GetAuthStatusAsync(userId, ct);
        return Ok(status);
    }

    [HttpDelete("google/disconnect")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DisconnectGoogle(CancellationToken ct)
    {
        var userId = GetUserId();
        await _googleCalendarService.DisconnectAsync(userId, ct);
        return Ok(new { message = "Google Calendar disconnected successfully" });
    }

    [HttpPost("google/disconnect")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DisconnectGooglePost(CancellationToken ct)
    {
        return await DisconnectGoogle(ct);
    }

    // ============ TERMIN (Walker's Available Slots) ============

    [HttpPost("termini")]
    [ProducesResponseType(typeof(TerminDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TerminDto>> CreateTermin([FromBody] CreateTerminRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var termin = await _calendarService.CreateTerminAsync(userId, request, ct);
            return CreatedAtAction(nameof(GetTermin), new { terminId = termin.IdTermin }, termin);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("termini/me")]
    [HttpGet("my-termini")]
    [ProducesResponseType(typeof(List<TerminDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TerminDto>>> GetMyTermini(
        [FromQuery] DateTime? from, 
        [FromQuery] DateTime? to, 
        CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var fromDate = from.HasValue ? DateTime.SpecifyKind(from.Value, DateTimeKind.Utc) : DateTime.UtcNow.AddMonths(-1);
            var toDate = to.HasValue ? DateTime.SpecifyKind(to.Value, DateTimeKind.Utc) : DateTime.UtcNow.AddMonths(3);
            var termini = await _calendarService.GetWalkerTerminiAsync(userId, fromDate, toDate, ct);
            return Ok(termini);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpGet("termini/{terminId}")]
    [ProducesResponseType(typeof(TerminDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TerminDto>> GetTermin(int terminId, CancellationToken ct)
    {
        try
        {
            var termin = await _calendarService.GetTerminAsync(terminId, ct);
            return Ok(termin);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPut("termini/{terminId}")]
    [ProducesResponseType(typeof(TerminDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TerminDto>> UpdateTermin(int terminId, [FromBody] UpdateTerminRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var termin = await _calendarService.UpdateTerminAsync(userId, terminId, request, ct);
            return Ok(termin);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("termini/{terminId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteTermin(int terminId, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            await _calendarService.DeleteTerminAsync(userId, terminId, ct);
            return Ok(new { message = "Termin deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ============ REVIEWS (Recenzije) ============

    [HttpPost("rezervacije/{rezervacijaId}/recenzija")]
    [ProducesResponseType(typeof(WalkerReviewDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WalkerReviewDto>> CreateRecenzija(
        int rezervacijaId,
        [FromBody] CreateRecenzijaRequest request,
        CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var created = await _calendarService.CreateRecenzijaAsync(userId, rezervacijaId, request, ct);
            return Created(string.Empty, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ============ AVAILABLE SLOTS (For Owners to Browse) ============

    [HttpGet("available")]
    [ProducesResponseType(typeof(List<TerminDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TerminDto>>> GetAvailableSlots(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string? location,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? vrstaSetnje,
        CancellationToken ct)
    {
        var fromUtc = DateTime.SpecifyKind(from, DateTimeKind.Utc);
        var toUtc = DateTime.SpecifyKind(to, DateTimeKind.Utc);
        var query = new AvailableSlotsQuery(fromUtc, toUtc, location, maxPrice, vrstaSetnje);
        var slots = await _calendarService.GetAvailableSlotsAsync(query, ct);
        return Ok(slots);
    }

    // ============ REZERVACIJA (Bookings) ============

    [HttpPost("rezervacije")]
    [ProducesResponseType(typeof(RezervacijaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RezervacijaDto>> CreateRezervacija([FromBody] CreateRezervacijaRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var rezervacija = await _calendarService.CreateRezervacijaAsync(userId, request, ct);
            return CreatedAtAction(nameof(GetRezervacija), new { rezervacijaId = rezervacija.IdRezervacija }, rezervacija);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("rezervacije/me")]
    [HttpGet("my-rezervacije")]
    [ProducesResponseType(typeof(List<RezervacijaDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RezervacijaDto>>> GetMyRezervacije(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? status,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var fromDate = from.HasValue ? DateTime.SpecifyKind(from.Value, DateTimeKind.Utc) : DateTime.UtcNow.AddMonths(-1);
        var toDate = to.HasValue ? DateTime.SpecifyKind(to.Value, DateTimeKind.Utc) : DateTime.UtcNow.AddMonths(3);
        var rezervacije = await _calendarService.GetUserRezervacijeAsync(userId, fromDate, toDate, ct);
        
        // Filter by status if provided
        if (!string.IsNullOrEmpty(status))
        {
            rezervacije = rezervacije.Where(r => r.StatusRezervacija.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
        }
        
        return Ok(rezervacije);
    }

    [HttpGet("rezervacije/{rezervacijaId}")]
    [ProducesResponseType(typeof(RezervacijaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RezervacijaDto>> GetRezervacija(int rezervacijaId, CancellationToken ct)
    {
        try
        {
            var rezervacija = await _calendarService.GetRezervacijaAsync(rezervacijaId, ct);
            return Ok(rezervacija);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPut("rezervacije/{rezervacijaId}/status")]
    [ProducesResponseType(typeof(RezervacijaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RezervacijaDto>> UpdateRezervacijaStatus(
        int rezervacijaId, 
        [FromBody] UpdateRezervacijaStatusRequest request, 
        CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var rezervacija = await _calendarService.UpdateRezervacijaStatusAsync(userId, rezervacijaId, request, ct);
            return Ok(rezervacija);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("rezervacije/{rezervacijaId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelRezervacija(int rezervacijaId, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            await _calendarService.CancelRezervacijaAsync(userId, rezervacijaId, ct);
            return Ok(new { message = "Rezervacija cancelled successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ============ WALKER DISCOVERY (For Owners to Browse Walkers) ============

    [HttpGet("walkers")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(WalkersPagedResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<WalkersPagedResponse>> GetWalkersWithCalendar(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _calendarService.GetWalkersWithCalendarAsync(page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("walkers/{walkerId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(WalkerSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WalkerSummaryDto>> GetWalkerSummary(int walkerId, CancellationToken ct)
    {
        try
        {
            var walker = await _calendarService.GetWalkerSummaryAsync(walkerId, ct);
            return Ok(walker);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("walkers/{walkerId}/termini")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<TerminDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TerminDto>>> GetWalkerTerminiPublic(
        int walkerId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var fromDate = from ?? DateTime.UtcNow;
        var toDate = to ?? DateTime.UtcNow.AddMonths(2);
        var termini = await _calendarService.GetWalkerTerminiAsync(walkerId, fromDate, toDate, ct);
        return Ok(termini);
    }
}
