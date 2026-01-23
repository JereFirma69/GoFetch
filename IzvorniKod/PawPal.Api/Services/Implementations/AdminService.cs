using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;

namespace PawPal.Api.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<PendingWalkerDto>> GetWalkersByStatusAsync(string status, CancellationToken ct = default)
    {
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? "pending" : status.ToLower();

        var pendingWalkers = await _db.Setaci
            .Where(s => s.VerificationStatus.ToLower() == normalizedStatus)
            .Include(s => s.Korisnik)
            .Select(s => new PendingWalkerDto(
                s.IdKorisnik,
                s.Korisnik.EmailKorisnik,
                s.ImeSetac,
                s.PrezimeSetac,
                s.LokacijaSetac,
                s.TelefonSetac,
                s.ProfilnaSetac,
                s.VerificationStatus,
                s.IsVerified,
                s.Bio
            ))
            .ToListAsync(ct);

        return pendingWalkers;
    }

    public async Task<VerificationResultDto> ApproveWalkerAsync(int adminId, ApproveWalkerRequest request, CancellationToken ct = default)
    {
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

    public async Task<MembershipPricingDto> GetMembershipPricingAsync(CancellationToken ct = default)
    {
        var pricing = await _db.MembershipSettings.FirstOrDefaultAsync(ct);

        if (pricing == null)
        {
            pricing = new MembershipSetting
            {
                MonthlyPrice = 0m,
                YearlyPrice = 0m,
                Currency = "EUR"
            };

            _db.MembershipSettings.Add(pricing);
            await _db.SaveChangesAsync(ct);
        }

        return new MembershipPricingDto(pricing.MonthlyPrice, pricing.YearlyPrice, pricing.Currency);
    }

    public async Task<MembershipPricingDto> UpdateMembershipPricingAsync(UpdateMembershipPricingRequest request, CancellationToken ct = default)
    {
        var pricing = await _db.MembershipSettings.FirstOrDefaultAsync(ct);

        if (pricing == null)
        {
            pricing = new MembershipSetting();
            _db.MembershipSettings.Add(pricing);
        }

        pricing.MonthlyPrice = request.MonthlyPrice;
        pricing.YearlyPrice = request.YearlyPrice;
        pricing.Currency = string.IsNullOrWhiteSpace(request.Currency) ? "EUR" : request.Currency;

        await _db.SaveChangesAsync(ct);

        return new MembershipPricingDto(pricing.MonthlyPrice, pricing.YearlyPrice, pricing.Currency);
    }

    public async Task<(IEnumerable<AdminUserDto> Users, int TotalCount)> SearchUsersAsync(string? role, string? query, CancellationToken ct = default)
    {
        var users = _db.Korisnici
            .Include(k => k.Setac)
            .Include(k => k.Vlasnik)
            .Include(k => k.Administrator)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var lowered = query.ToLower();
            users = users.Where(k =>
                (k.EmailKorisnik != null && k.EmailKorisnik.ToLower().Contains(lowered)) ||
                (k.Ime != null && k.Ime.ToLower().Contains(lowered)) ||
                (k.Prezime != null && k.Prezime.ToLower().Contains(lowered)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            role = role.ToLower();
            users = role switch
            {
                "admin" => users.Where(k => k.Administrator != null),
                "walker" => users.Where(k => k.Setac != null),
                "owner" => users.Where(k => k.Vlasnik != null),
                _ => users
            };
        }

        var total = await users.CountAsync(ct);

        var result = await users
            .Select(k => new AdminUserDto(
                k.IdKorisnik,
                k.EmailKorisnik,
                k.Ime,
                k.Prezime,
                k.Administrator != null ? "admin" : k.Setac != null ? "walker" : k.Vlasnik != null ? "owner" : "none",
                k.Setac != null ? k.Setac.LokacijaSetac : null,
                k.Setac != null ? k.Setac.TelefonSetac : null,
                k.Setac != null ? (bool?)k.Setac.IsVerified : null,
                k.Setac != null 
                    ? (!string.IsNullOrEmpty(k.Setac.ProfilnaSetac) ? k.Setac.ProfilnaSetac : k.ProfilnaKorisnik)
                    : k.ProfilnaKorisnik,
                k.Setac != null ? k.Setac.Bio : null))
            .ToListAsync(ct);

        return (result, total);
    }
}
