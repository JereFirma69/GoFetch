using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.DTOs;

namespace PawPal.Api.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<PendingWalkerDto>> GetPendingWalkersAsync(CancellationToken ct = default)
    {
        var pendingWalkers = await _db.Setaci
            .Where(s => s.VerificationStatus == "pending")
            .Include(s => s.Korisnik)
            .Select(s => new PendingWalkerDto(
                s.IdKorisnik,
                s.Korisnik.EmailKorisnik,
                s.ImeSetac,
                s.PrezimeSetac,
                s.LokacijaSetac,
                s.TelefonSetac,
                s.ProfilnaSetac
            ))
            .ToListAsync(ct);

        return pendingWalkers;
    }

    public async Task<VerificationResultDto> ApproveWalkerAsync(int adminId, ApproveWalkerRequest request, CancellationToken ct = default)
    {
        // Verify requester is admin
        var admin = await _db.Administratori
            .FirstOrDefaultAsync(a => a.IdKorisnik == adminId, ct);
        
        if (admin == null)
        {
            return new VerificationResultDto(
                request.WalkerId,
                false,
                "Only administrators can approve walkers.");
        }

        var walker = await _db.Setaci
            .FirstOrDefaultAsync(s => s.IdKorisnik == request.WalkerId, ct);

        if (walker == null)
        {
            return new VerificationResultDto(
                request.WalkerId,
                false,
                "Walker not found.");
        }

        walker.VerificationStatus = "approved";
        walker.IsVerified = true;

        await _db.SaveChangesAsync(ct);

        return new VerificationResultDto(
            request.WalkerId,
            true,
            "Walker verified successfully.");
    }

    public async Task<VerificationResultDto> RejectWalkerAsync(int adminId, RejectWalkerRequest request, CancellationToken ct = default)
    {
        // Verify requester is admin
        var admin = await _db.Administratori
            .FirstOrDefaultAsync(a => a.IdKorisnik == adminId, ct);

        if (admin == null)
        {
            return new VerificationResultDto(
                request.WalkerId,
                false,
                "Only administrators can reject walkers.");
        }

        var walker = await _db.Setaci
            .FirstOrDefaultAsync(s => s.IdKorisnik == request.WalkerId, ct);

        if (walker == null)
        {
            return new VerificationResultDto(
                request.WalkerId,
                false,
                "Walker not found.");
        }

        walker.VerificationStatus = "rejected";
        walker.IsVerified = false;

        await _db.SaveChangesAsync(ct);

        return new VerificationResultDto(
            request.WalkerId,
            true,
            "Walker rejected successfully.");
    }

    public async Task<WalkerVerificationStatusDto> GetWalkerVerificationStatusAsync(int walkerId, CancellationToken ct = default)
    {
        var walker = await _db.Setaci
            .Include(s => s.Korisnik)
            .FirstOrDefaultAsync(s => s.IdKorisnik == walkerId, ct);

        if (walker == null)
        {
            throw new InvalidOperationException("Walker not found.");
        }

        return new WalkerVerificationStatusDto(
            walker.IdKorisnik,
            walker.Korisnik.EmailKorisnik,
            walker.VerificationStatus,
            walker.IsVerified);
    }
}
