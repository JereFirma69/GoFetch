using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;

namespace PawPal.Api.Services.Implementations;

public class CalendarService : ICalendarService
{
    private readonly AppDbContext _db;
    private readonly IGoogleCalendarService _googleCalendar;
    private readonly ILogger<CalendarService> _logger;

    public CalendarService(
        AppDbContext db,
        IGoogleCalendarService googleCalendar,
        ILogger<CalendarService> logger)
    {
        _db = db;
        _googleCalendar = googleCalendar;
        _logger = logger;
    }

    public async Task<TerminDto> CreateTerminAsync(int walkerId, CreateTerminRequest request, CancellationToken ct = default)
    {
        var walker = await _db.Setaci
            .Include(s => s.Korisnik)
                .ThenInclude(k => k.GoogleAuth)
            .FirstOrDefaultAsync(s => s.IdKorisnik == walkerId, ct);

        if (walker == null)
        {
            throw new InvalidOperationException("Walker profile not found.");
        }

        var termin = new Termin
        {
            IdKorisnik = walkerId,
            VrstaSetnjaTermin = request.VrstaSetnjaTermin,
            Cijena = request.Cijena,
            Trajanje = TimeSpan.FromMinutes(request.TrajanjeMins),
            DatumVrijemePocetka = request.DatumVrijemePocetka,
            LokacijaTermin = request.LokacijaTermin,
            MaxDogs = request.MaxDogs ?? 5
        };

        if (walker.Korisnik.GoogleAuth != null)
        {
            try
            {
                var eventId = await _googleCalendar.CreateEventAsync(walkerId, termin, ct);
                termin.GoogleCalendarEventId = eventId;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create Google Calendar event for walker {WalkerId}", walkerId);
                // Continue without Google Calendar sync
            }
        }

        _db.Termini.Add(termin);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Created termin {TerminId} for walker {WalkerId}", termin.IdTermin, walkerId);
        
        return await GetTerminAsync(termin.IdTermin, ct);
    }

    public async Task<TerminDto> UpdateTerminAsync(int walkerId, int terminId, UpdateTerminRequest request, CancellationToken ct = default)
    {
        var termin = await _db.Termini
            .Include(t => t.Setac)
            .FirstOrDefaultAsync(t => t.IdTermin == terminId && t.IdKorisnik == walkerId, ct);

        if (termin == null)
        {
            throw new InvalidOperationException("Termin not found or you don't have permission to edit it.");
        }

        var hasBookings = await _db.Rezervacije
            .AnyAsync(r => r.IdTermin == terminId && r.StatusRezervacija != "otkazana", ct);

        if (hasBookings && (request.DatumVrijemePocetka.HasValue || request.TrajanjeMins.HasValue))
        {
            throw new InvalidOperationException("Cannot change time for a slot with existing bookings.");
        }

        if (request.VrstaSetnjaTermin != null) termin.VrstaSetnjaTermin = request.VrstaSetnjaTermin;
        if (request.Cijena.HasValue) termin.Cijena = request.Cijena.Value;
        if (request.TrajanjeMins.HasValue) termin.Trajanje = TimeSpan.FromMinutes(request.TrajanjeMins.Value);
        if (request.DatumVrijemePocetka.HasValue) termin.DatumVrijemePocetka = request.DatumVrijemePocetka.Value;
        if (request.LokacijaTermin != null) termin.LokacijaTermin = request.LokacijaTermin;
        if (request.MaxDogs.HasValue) termin.MaxDogs = request.MaxDogs.Value;

        if (!string.IsNullOrEmpty(termin.GoogleCalendarEventId))
        {
            try
            {
                await _googleCalendar.UpdateEventAsync(walkerId, termin.GoogleCalendarEventId, termin, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update Google Calendar event {EventId}", termin.GoogleCalendarEventId);
            }
        }

        await _db.SaveChangesAsync(ct);
        
        return await GetTerminAsync(terminId, ct);
    }

    public async Task DeleteTerminAsync(int walkerId, int terminId, CancellationToken ct = default)
    {
        var termin = await _db.Termini
            .FirstOrDefaultAsync(t => t.IdTermin == terminId && t.IdKorisnik == walkerId, ct);

        if (termin == null)
        {
            throw new InvalidOperationException("Termin not found or you don't have permission to delete it.");
        }

        var hasConfirmedBookings = await _db.Rezervacije
            .AnyAsync(r => r.IdTermin == terminId && r.StatusRezervacija == "prihvacena", ct);

        if (hasConfirmedBookings)
        {
            throw new InvalidOperationException("Cannot delete a slot with confirmed bookings. Cancel bookings first.");
        }

        if (!string.IsNullOrEmpty(termin.GoogleCalendarEventId))
        {
            await _googleCalendar.DeleteEventAsync(walkerId, termin.GoogleCalendarEventId, ct);
        }

        var pendingBookings = await _db.Rezervacije
            .Where(r => r.IdTermin == terminId && r.StatusRezervacija == "na cekanju")
            .ToListAsync(ct);

        foreach (var booking in pendingBookings)
        {
            booking.StatusRezervacija = "otkazana";
        }

        _db.Termini.Remove(termin);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Deleted termin {TerminId}", terminId);
    }

    public async Task<List<TerminDto>> GetWalkerTerminiAsync(int walkerId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var termini = await _db.Termini
            .Include(t => t.Setac)
                .ThenInclude(s => s.Korisnik)
            .Include(t => t.Rezervacije)
                .ThenInclude(r => r.PsiRezervacije)
            .Where(t => t.IdKorisnik == walkerId 
                && t.DatumVrijemePocetka >= from 
                && t.DatumVrijemePocetka <= to)
            .OrderBy(t => t.DatumVrijemePocetka)
            .ToListAsync(ct);

        return termini.Select(t => MapToTerminDto(t)).ToList();
    }

    public async Task<TerminDto> GetTerminAsync(int terminId, CancellationToken ct = default)
    {
        var termin = await _db.Termini
            .Include(t => t.Setac)
                .ThenInclude(s => s.Korisnik)
            .Include(t => t.Rezervacije)
                .ThenInclude(r => r.PsiRezervacije)
            .FirstOrDefaultAsync(t => t.IdTermin == terminId, ct);

        if (termin == null)
        {
            throw new InvalidOperationException("Termin not found.");
        }

        return MapToTerminDto(termin);
    }

    public async Task<List<TerminDto>> GetAvailableSlotsAsync(AvailableSlotsQuery query, CancellationToken ct = default)
    {
        var queryable = _db.Termini
            .Include(t => t.Setac)
                .ThenInclude(s => s.Korisnik)
            .Include(t => t.Rezervacije)
                .ThenInclude(r => r.PsiRezervacije)
            .Where(t => t.DatumVrijemePocetka >= query.From 
                && t.DatumVrijemePocetka <= query.To
                && t.DatumVrijemePocetka > DateTime.UtcNow)
            .AsQueryable();

        if (!string.IsNullOrEmpty(query.Location))
        {
            queryable = queryable.Where(t => 
                t.LokacijaTermin.ToLower().Contains(query.Location.ToLower()) ||
                t.Setac.LokacijaSetac.ToLower().Contains(query.Location.ToLower()));
        }

        if (query.MaxPrice.HasValue)
        {
            queryable = queryable.Where(t => t.Cijena <= query.MaxPrice.Value);
        }

        if (!string.IsNullOrEmpty(query.VrstaSetnje))
        {
            queryable = queryable.Where(t => t.VrstaSetnjaTermin == query.VrstaSetnje);
        }

        var termini = await queryable
            .OrderBy(t => t.DatumVrijemePocetka)
            .ToListAsync(ct);

        var availableTermini = termini
            .Where(t => 
            {
                var bookedDogs = t.Rezervacije
                    .Where(r => r.StatusRezervacija != "otkazana")
                    .SelectMany(r => r.PsiRezervacije)
                    .Count();
                return bookedDogs < t.MaxDogs;
            })
            .ToList();

        return availableTermini.Select(t => MapToTerminDto(t)).ToList();
    }

    public async Task<RezervacijaDto> CreateRezervacijaAsync(int ownerId, CreateRezervacijaRequest request, CancellationToken ct = default)
    {
        var owner = await _db.Vlasnici
            .Include(v => v.Korisnik)
            .Include(v => v.Psi)
            .FirstOrDefaultAsync(v => v.IdKorisnik == ownerId, ct);

        if (owner == null)
        {
            throw new InvalidOperationException("Owner profile not found.");
        }

        var dogs = await _db.Psi
            .Where(p => request.DogIds.Contains(p.IdPas) && p.IdKorisnik == ownerId)
            .ToListAsync(ct);

        if (dogs.Count != request.DogIds.Count)
        {
            throw new InvalidOperationException("One or more dogs not found or don't belong to you.");
        }

        var termin = await _db.Termini
            .Include(t => t.Setac)
                .ThenInclude(s => s.Korisnik)
            .Include(t => t.Rezervacije)
                .ThenInclude(r => r.PsiRezervacije)
            .FirstOrDefaultAsync(t => t.IdTermin == request.IdTermin, ct);

        if (termin == null)
        {
            throw new InvalidOperationException("Termin not found.");
        }

        var existingBooking = termin.Rezervacije
            .FirstOrDefault(r => r.StatusRezervacija != "otkazana");

        if (existingBooking != null)
        {
            throw new InvalidOperationException("This walk slot is already booked. Please choose a different time.");
        }

        if (request.DogIds.Count > termin.MaxDogs)
        {
            throw new InvalidOperationException($"Too many dogs selected. Maximum {termin.MaxDogs} dogs allowed for this walk.");
        }

        var rezervacija = new Rezervacija
        {
            IdTermin = request.IdTermin,
            IdVlasnik = ownerId,
            DatumRezervacija = DateTime.UtcNow,
            StatusRezervacija = "na cekanju",
            NapomenaRezervacija = request.NapomenaRezervacija,
            AdresaPolaska = request.AdresaPolaska,
            VrstaSetnjaRezervacija = termin.VrstaSetnjaTermin,
            DatumVrijemePolaska = termin.DatumVrijemePocetka
        };

        _db.Rezervacije.Add(rezervacija);
        await _db.SaveChangesAsync(ct);

        var payment = new Placanje
        {
            IdRezervacija = rezervacija.IdRezervacija,
            StatusPlacanje = "na cekanju",
            DatumPlacanje = DateTime.UtcNow,
            IznosPlacanje = termin.Cijena,
            NacinPlacanje = request.NacinPlacanje
        };

        _db.Placanja.Add(payment);
        await _db.SaveChangesAsync(ct);

        foreach (var dogId in request.DogIds)
        {
            _db.RezervacijePsi.Add(new RezervacijaPas
            {
                IdRezervacija = rezervacija.IdRezervacija,
                IdPas = dogId
            });
        }
        await _db.SaveChangesAsync(ct);

        if (!string.IsNullOrEmpty(termin.GoogleCalendarEventId))
        {
            var allBookings = await _db.Rezervacije
                .Include(r => r.Vlasnik)
                    .ThenInclude(v => v.Korisnik)
                .Include(r => r.PsiRezervacije)
                    .ThenInclude(rp => rp.Pas)
                .Where(r => r.IdTermin == termin.IdTermin && r.StatusRezervacija != "otkazana")
                .ToListAsync(ct);

            await _googleCalendar.UpdateEventWithBookingAsync(
                termin.IdKorisnik,
                termin.GoogleCalendarEventId,
                termin,
                allBookings,
                ct);
        }

        _logger.LogInformation("Created rezervacija {RezervacijaId} for owner {OwnerId} on termin {TerminId}", 
            rezervacija.IdRezervacija, ownerId, request.IdTermin);

        return await GetRezervacijaAsync(rezervacija.IdRezervacija, ct);
    }

    public async Task<List<RezervacijaDto>> GetUserRezervacijeAsync(int userId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var isOwner = await _db.Vlasnici.AnyAsync(v => v.IdKorisnik == userId, ct);
        var isWalker = await _db.Setaci.AnyAsync(s => s.IdKorisnik == userId, ct);

        if (!isOwner && !isWalker)
        {
            return new List<RezervacijaDto>();
        }

        var queries = new List<IQueryable<Rezervacija>>();

        if (isOwner)
        {
            queries.Add(
                _db.Rezervacije
                    .Include(r => r.Termin)
                        .ThenInclude(t => t.Setac)
                            .ThenInclude(s => s.Korisnik)
                    .Include(r => r.Vlasnik)
                        .ThenInclude(v => v.Korisnik)
                    .Include(r => r.PsiRezervacije)
                        .ThenInclude(rp => rp.Pas)
                    .Where(r => r.IdVlasnik == userId
                        && r.DatumVrijemePolaska >= from
                        && r.DatumVrijemePolaska <= to)
            );
        }

        if (isWalker)
        {
            queries.Add(
                _db.Rezervacije
                    .Include(r => r.Termin)
                        .ThenInclude(t => t.Setac)
                            .ThenInclude(s => s.Korisnik)
                    .Include(r => r.Vlasnik)
                        .ThenInclude(v => v.Korisnik)
                    .Include(r => r.PsiRezervacije)
                        .ThenInclude(rp => rp.Pas)
                    .Where(r => r.Termin.IdKorisnik == userId
                        && r.DatumVrijemePolaska >= from
                        && r.DatumVrijemePolaska <= to)
            );
        }

        var rezervacije = new List<Rezervacija>();
        foreach (var q in queries)
        {
            rezervacije.AddRange(await q.ToListAsync(ct));
        }

        var reviewedIds = await _db.Recenzije
            .Select(r => r.IdRezervacija)
            .ToListAsync(ct);

        var distinct = rezervacije
            .GroupBy(r => r.IdRezervacija)
            .Select(g => g.First())
            .Where(r => !(r.StatusRezervacija == "zavrsena" && reviewedIds.Contains(r.IdRezervacija)))
            .OrderBy(r => r.DatumVrijemePolaska)
            .ToList();

        return distinct.Select(r => MapToRezervacijaDto(r)).ToList();
    }

    public async Task<RezervacijaDto> GetRezervacijaAsync(int rezervacijaId, CancellationToken ct = default)
    {
        var rezervacija = await _db.Rezervacije
            .Include(r => r.Termin)
                .ThenInclude(t => t.Setac)
                    .ThenInclude(s => s.Korisnik)
            .Include(r => r.Vlasnik)
                .ThenInclude(v => v.Korisnik)
            .Include(r => r.PsiRezervacije)
                .ThenInclude(rp => rp.Pas)
            .FirstOrDefaultAsync(r => r.IdRezervacija == rezervacijaId, ct);

        if (rezervacija == null)
        {
            throw new InvalidOperationException("Rezervacija not found.");
        }

        return MapToRezervacijaDto(rezervacija);
    }

    public async Task<RezervacijaDto> UpdateRezervacijaStatusAsync(int userId, int rezervacijaId, UpdateRezervacijaStatusRequest request, CancellationToken ct = default)
    {
        var rezervacija = await _db.Rezervacije
            .Include(r => r.Termin)
                .ThenInclude(t => t.Setac)
            .Include(r => r.Vlasnik)
            .Include(r => r.PsiRezervacije)
                .ThenInclude(rp => rp.Pas)
            .FirstOrDefaultAsync(r => r.IdRezervacija == rezervacijaId, ct);

        if (rezervacija == null)
        {
            throw new InvalidOperationException("Rezervacija not found.");
        }

        var termin = rezervacija.Termin;
        var isWalker = termin.IdKorisnik == userId;
        var isOwner = rezervacija.IdVlasnik == userId;

        if (!isWalker && !isOwner)
        {
            throw new InvalidOperationException("You don't have permission to modify this booking.");
        }

        var validStatuses = new[] { "prihvacena", "otkazana", "zavrsena" };
        if (!validStatuses.Contains(request.Status))
        {
            throw new InvalidOperationException("Invalid status. Must be 'prihvacena', 'otkazana', or 'zavrsena'.");
        }

        if (request.Status == "prihvacena" && !isWalker)
        {
            throw new InvalidOperationException("Only the walker can confirm a booking.");
        }

        if (request.Status == "zavrsena" && !isWalker)
        {
            throw new InvalidOperationException("Only the walker can mark a booking as finished.");
        }

        if (request.Status == "zavrsena" && rezervacija.StatusRezervacija != "prihvacena")
        {
            throw new InvalidOperationException("Only confirmed bookings can be marked as finished.");
        }

        rezervacija.StatusRezervacija = request.Status;
        await _db.SaveChangesAsync(ct);

        if (!string.IsNullOrEmpty(termin.GoogleCalendarEventId))
        {
            var allBookings = await _db.Rezervacije
                .Include(r => r.Vlasnik)
                    .ThenInclude(v => v.Korisnik)
                .Include(r => r.PsiRezervacije)
                    .ThenInclude(rp => rp.Pas)
                .Where(r => r.IdTermin == termin.IdTermin && r.StatusRezervacija != "otkazana")
                .ToListAsync(ct);

            await _googleCalendar.UpdateEventWithBookingAsync(
                termin.IdKorisnik,
                termin.GoogleCalendarEventId,
                termin,
                allBookings,
                ct);
        }

        _logger.LogInformation("Updated rezervacija {RezervacijaId} status to {Status}", rezervacijaId, request.Status);

        return await GetRezervacijaAsync(rezervacijaId, ct);
    }

    public async Task CancelRezervacijaAsync(int ownerId, int rezervacijaId, CancellationToken ct = default)
    {
        var rezervacija = await _db.Rezervacije
            .Include(r => r.Termin)
            .FirstOrDefaultAsync(r => r.IdRezervacija == rezervacijaId && r.IdVlasnik == ownerId, ct);

        if (rezervacija == null)
        {
            throw new InvalidOperationException("Rezervacija not found or you don't have permission to cancel it.");
        }

        var hoursUntilStart = (rezervacija.DatumVrijemePolaska - DateTime.UtcNow).TotalHours;
        if (hoursUntilStart < 24)
        {
            throw new InvalidOperationException("Cannot cancel less than 24 hours before the scheduled time.");
        }

        await UpdateRezervacijaStatusAsync(ownerId, rezervacijaId, new UpdateRezervacijaStatusRequest("otkazana"), ct);
    }

    public async Task<WalkerReviewDto> CreateRecenzijaAsync(int ownerId, int rezervacijaId, CreateRecenzijaRequest request, CancellationToken ct = default)
    {
        if (request.Ocjena is < 1 or > 5)
        {
            throw new InvalidOperationException("Ocjena must be between 1 and 5.");
        }

        var rezervacija = await _db.Rezervacije
            .Include(r => r.Termin)
                .ThenInclude(t => t.Setac)
                    .ThenInclude(s => s.Korisnik)
            .Include(r => r.Vlasnik)
                .ThenInclude(v => v.Korisnik)
            .FirstOrDefaultAsync(r => r.IdRezervacija == rezervacijaId, ct);

        if (rezervacija == null)
        {
            throw new InvalidOperationException("Rezervacija not found.");
        }

        if (rezervacija.IdVlasnik != ownerId)
        {
            throw new InvalidOperationException("You don't have permission to review this booking.");
        }

        if (rezervacija.StatusRezervacija == "otkazana")
        {
            throw new InvalidOperationException("Cannot review a cancelled booking.");
        }

        if (rezervacija.StatusRezervacija != "prihvacena" && rezervacija.StatusRezervacija != "zavrsena")
        {
            throw new InvalidOperationException("Booking must be accepted or finished before it can be reviewed.");
        }

        if (rezervacija.StatusRezervacija != "zavrsena")
        {
            var startUtc = rezervacija.DatumVrijemePolaska.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(rezervacija.DatumVrijemePolaska, DateTimeKind.Utc)
                : rezervacija.DatumVrijemePolaska.ToUniversalTime();
            var endUtc = startUtc.Add(rezervacija.Termin.Trajanje);
            if (DateTime.UtcNow < endUtc)
            {
                throw new InvalidOperationException("Cannot leave a review before the walk ends.");
            }
        }

        var alreadyReviewed = await _db.Recenzije.AnyAsync(r => r.IdRezervacija == rezervacijaId, ct);
        if (alreadyReviewed)
        {
            throw new InvalidOperationException("A review for this booking already exists.");
        }

        var recenzija = new Recenzija
        {
            IdRezervacija = rezervacijaId,
            DatumRecenzija = DateTime.UtcNow,
            Ocjena = request.Ocjena,
            Komentar = string.IsNullOrWhiteSpace(request.Komentar) ? null : request.Komentar.Trim()
        };

        _db.Recenzije.Add(recenzija);
        await _db.SaveChangesAsync(ct);

        var reviewerName = rezervacija.Vlasnik.Korisnik.Ime + " " + rezervacija.Vlasnik.Korisnik.Prezime;
        return new WalkerReviewDto(recenzija.DatumRecenzija, recenzija.Ocjena, recenzija.Komentar, reviewerName);
    }

    private TerminDto MapToTerminDto(Termin t)
    {
        var bookedDogs = t.Rezervacije
            .Where(r => r.StatusRezervacija != "otkazana")
            .SelectMany(r => r.PsiRezervacije)
            .Count();

        return new TerminDto(
            t.IdTermin,
            t.VrstaSetnjaTermin,
            t.Cijena,
            (int)t.Trajanje.TotalMinutes,
            t.DatumVrijemePocetka,
            t.DatumVrijemePocetka.Add(t.Trajanje),
            t.LokacijaTermin,
            t.MaxDogs,
            bookedDogs,
            t.MaxDogs - bookedDogs,
            t.GoogleCalendarEventId,
            new WalkerSummaryDto(
                t.Setac.IdKorisnik,
                t.Setac.ImeSetac,
                t.Setac.PrezimeSetac,
                t.Setac.ProfilnaSetac,
                t.Setac.LokacijaSetac,
                null // TODO: Calculate average rating
            )
        );
    }

    private RezervacijaDto MapToRezervacijaDto(Rezervacija r)
    {
        return new RezervacijaDto(
            r.IdRezervacija,
            r.DatumRezervacija,
            r.StatusRezervacija,
            r.NapomenaRezervacija,
            r.AdresaPolaska,
            r.VrstaSetnjaRezervacija,
            r.DatumVrijemePolaska,
            new TerminSummaryDto(
                r.Termin.IdTermin,
                r.Termin.Cijena,
                (int)r.Termin.Trajanje.TotalMinutes,
                r.Termin.DatumVrijemePocetka,
                r.Termin.LokacijaTermin,
                new WalkerSummaryDto(
                    r.Termin.Setac.IdKorisnik,
                    r.Termin.Setac.ImeSetac,
                    r.Termin.Setac.PrezimeSetac,
                    r.Termin.Setac.Korisnik?.ProfilnaKorisnik ?? "",
                    r.Termin.Setac.LokacijaSetac,
                    null
                )
            ),
            new OwnerSummaryDto(
                r.Vlasnik.IdKorisnik,
                r.Vlasnik.Korisnik.Ime ?? "",
                r.Vlasnik.Korisnik.Prezime ?? "",
                r.Vlasnik.Korisnik.ProfilnaKorisnik
            ),
            r.PsiRezervacije.Select(rp => new DogSummaryDto(
                rp.Pas.IdPas,
                rp.Pas.ImePas,
                rp.Pas.Pasmina,
                rp.Pas.ProfilnaPas,
                rp.Pas.ZdravstveneNapomene
            )).ToList()
        );
    }

    public async Task<WalkersPagedResponse> GetWalkersWithCalendarAsync(int page, int pageSize, CancellationToken ct = default)
    {
        // Get walkers who have at least one future termin OR have Google Calendar connected
        var query = _db.Setaci
            .Include(s => s.Korisnik)
                .ThenInclude(k => k.GoogleAuth)
            .Include(s => s.Termini)
            .Where(s => s.IsVerified && 
                (s.Korisnik.GoogleAuth != null || s.Termini.Any(t => t.DatumVrijemePocetka > DateTime.UtcNow)))
            .OrderBy(s => s.ImeSetac)
            .ThenBy(s => s.PrezimeSetac);

        var totalCount = await query.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var walkers = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var walkerDtos = walkers.Select(s => new WalkerSummaryDto(
            s.IdKorisnik,
            s.ImeSetac,
            s.PrezimeSetac,
            s.Korisnik?.ProfilnaKorisnik ?? "",
            s.LokacijaSetac,
            null // TODO: Calculate average rating from reviews
        )).ToList();

        return new WalkersPagedResponse(walkerDtos, totalCount, page, pageSize, totalPages);
    }

    public async Task<WalkerSummaryDto> GetWalkerSummaryAsync(int walkerId, CancellationToken ct = default)
    {
        var walker = await _db.Setaci
            .Include(s => s.Korisnik)
            .FirstOrDefaultAsync(s => s.IdKorisnik == walkerId, ct);

        if (walker == null)
        {
            throw new InvalidOperationException("Walker not found.");
        }

        return new WalkerSummaryDto(
            walker.IdKorisnik,
            walker.ImeSetac,
            walker.PrezimeSetac,
            walker.ProfilnaSetac,
            walker.LokacijaSetac,
            null // TODO: Calculate average rating
        );
    }
}
