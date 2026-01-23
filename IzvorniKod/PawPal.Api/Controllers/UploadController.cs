using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.Services;
using System.Security.Claims;

namespace PawPal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly AppDbContext _db;
    private readonly string[] _allowedContentTypes = ["image/jpeg", "image/png", "image/webp"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public UploadController(IStorageService storageService, AppDbContext db)
    {
        _storageService = storageService;
        _db = db;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    [HttpPost("avatar")]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UploadResponse>> UploadAvatar(IFormFile file, CancellationToken ct)
    {
        var validationError = ValidateFile(file);
        if (validationError != null) return validationError;

        var userId = GetUserId();
        
        var user = await _db.Korisnici.FindAsync([userId], ct);
        if (user == null) return NotFound(new { error = "User not found" });

        using var stream = file.OpenReadStream();
        var imageUrl = await _storageService.UploadAvatarAsync(userId, stream, file.FileName, file.ContentType, ct);

        // Update user profile picture URL
        user.ProfilnaKorisnik = imageUrl;
        await _db.SaveChangesAsync(ct);

        return Ok(new UploadResponse(imageUrl, "Avatar uploaded successfully"));
    }

    [HttpPost("walker-avatar")]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UploadResponse>> UploadWalkerAvatar(IFormFile file, CancellationToken ct)
    {
        var validationError = ValidateFile(file);
        if (validationError != null) return validationError;

        var userId = GetUserId();
        
        var walker = await _db.Setaci.FindAsync([userId], ct);
        if (walker == null) return NotFound(new { error = "Walker profile not found" });

        using var stream = file.OpenReadStream();
        var imageUrl = await _storageService.UploadAvatarAsync(userId, stream, file.FileName, file.ContentType, ct);

        // Update walker profile picture URL
        walker.ProfilnaSetac = imageUrl;
        await _db.SaveChangesAsync(ct);

        return Ok(new UploadResponse(imageUrl, "Walker avatar uploaded successfully"));
    }

    [HttpPost("dog/{dogId}")]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UploadResponse>> UploadDogImage(int dogId, IFormFile file, CancellationToken ct)
    {
        var validationError = ValidateFile(file);
        if (validationError != null) return validationError;

        var userId = GetUserId();
        
        // Verify the dog belongs to this user (owner)
        var dog = await _db.Psi
            .Include(p => p.Vlasnik)
            .FirstOrDefaultAsync(p => p.IdPas == dogId && p.IdKorisnik == userId, ct);
        
        if (dog == null) return NotFound(new { error = "Dog not found or doesn't belong to you" });

        using var stream = file.OpenReadStream();
        var imageUrl = await _storageService.UploadDogImageAsync(userId, dogId, stream, file.FileName, file.ContentType, ct);

        // Update dog profile picture URL
        dog.ProfilnaPas = imageUrl;
        await _db.SaveChangesAsync(ct);

        return Ok(new UploadResponse(imageUrl, "Dog image uploaded successfully"));
    }

    [HttpDelete("avatar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteAvatar(CancellationToken ct)
    {
        var userId = GetUserId();
        
        var user = await _db.Korisnici.FindAsync([userId], ct);
        if (user == null) return NotFound(new { error = "User not found" });

        await _storageService.DeleteAvatarAsync(userId, ct);
        user.ProfilnaKorisnik = null;
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Avatar deleted successfully" });
    }

    [HttpDelete("dog/{dogId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDogImage(int dogId, CancellationToken ct)
    {
        var userId = GetUserId();
        
        var dog = await _db.Psi
            .FirstOrDefaultAsync(p => p.IdPas == dogId && p.IdKorisnik == userId, ct);
        
        if (dog == null) return NotFound(new { error = "Dog not found or doesn't belong to you" });

        await _storageService.DeleteDogImageAsync(userId, dogId, ct);
        dog.ProfilnaPas = string.Empty;
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Dog image deleted successfully" });
    }

    private ActionResult? ValidateFile(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded" });

        if (file.Length > MaxFileSize)
            return BadRequest(new { error = "File too large. Maximum size is 5MB" });

        if (!_allowedContentTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { error = "Invalid file type. Allowed: JPEG, PNG, WebP" });

        return null;
    }
}

public record UploadResponse(string Url, string Message);
