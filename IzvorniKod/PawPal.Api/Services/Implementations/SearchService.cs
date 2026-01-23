using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.DTOs;

namespace PawPal.Api.Services.Implementations;

public class SearchService : ISearchService
{
    private readonly AppDbContext _db;

    public SearchService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<WalkerSearchResultDto>> SearchWalkersAsync(
        string? location,
        decimal? minPrice,
        decimal? maxPrice,
        double? minRating,
        string? query,
        CancellationToken ct = default)
    {
        var walkers = _db.Setaci
            .Include(s => s.Korisnik)
            .Include(s => s.Termini)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(location))
        {
            var loc = location.ToLower();
            walkers = walkers.Where(s => s.LokacijaSetac.ToLower().Contains(loc));
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.ToLower();
            walkers = walkers.Where(s =>
                s.ImeSetac.ToLower().Contains(q) ||
                s.PrezimeSetac.ToLower().Contains(q) ||
                s.Korisnik.EmailKorisnik.ToLower().Contains(q));
        }

        // Ratings
        var ratings = await _db.Recenzije
            .Join(_db.Rezervacije, r => r.IdRezervacija, rez => rez.IdRezervacija, (r, rez) => new { r, rez })
            .Join(_db.Termini, rr => rr.rez.IdTermin, t => t.IdTermin, (rr, t) => new { rr.r, t })
            .GroupBy(x => x.t.IdKorisnik)
            .Select(g => new
            {
                WalkerId = g.Key,
                Avg = g.Average(x => x.r.Ocjena),
                Count = g.Count()
            })
            .ToDictionaryAsync(x => x.WalkerId, x => (x.Avg, x.Count), ct);

        var walkerList = await walkers.ToListAsync(ct);

        var filtered = walkerList
            .Select(w =>
            {
                var hasTermini = w.Termini.Any();
                var lowest = hasTermini ? w.Termini.Min(t => t.Cijena) : (decimal?)null;
                var highest = hasTermini ? w.Termini.Max(t => t.Cijena) : (decimal?)null;
                var ratingInfo = ratings.TryGetValue(w.IdKorisnik, out var r) ? r : (Avg: 0.0, Count: 0);

                return new WalkerSearchResultDto(
                    w.IdKorisnik,
                    $"{w.ImeSetac} {w.PrezimeSetac}",
                    w.LokacijaSetac,
                    lowest,
                    highest,
                    ratingInfo.Count > 0 ? ratingInfo.Avg : 0,
                    ratingInfo.Count,
                    w.ProfilnaSetac,
                    w.IsVerified,
                    w.Bio,
                    w.Korisnik.EmailKorisnik,
                    w.TelefonSetac);
            })
            .Where(w =>
                (!minPrice.HasValue || (w.LowestPrice.HasValue && w.LowestPrice.Value >= minPrice.Value)) &&
                (!maxPrice.HasValue || (w.LowestPrice.HasValue && w.LowestPrice.Value <= maxPrice.Value)) &&
                (!minRating.HasValue || w.Rating >= minRating.Value));

        return filtered.ToList();
    }

    public async Task<IEnumerable<TerminSearchResultDto>> SearchTerminiAsync(
        DateTime? from,
        DateTime? to,
        string? location,
        int? walkerId,
        decimal? minPrice,
        decimal? maxPrice,
        string? type,
        bool? onlyAvailable,
        CancellationToken ct = default)
    {
        var termini = _db.Termini
            .Include(t => t.Setac)
            .Include(t => t.Rezervacije)
                .ThenInclude(r => r.PsiRezervacije)
            .AsQueryable();

        if (from.HasValue)
        {
            var fromUtc = DateTime.SpecifyKind(from.Value, DateTimeKind.Utc);
            termini = termini.Where(t => t.DatumVrijemePocetka >= fromUtc);
        }

        if (to.HasValue)
        {
            var toUtc = DateTime.SpecifyKind(to.Value, DateTimeKind.Utc);
            termini = termini.Where(t => t.DatumVrijemePocetka <= toUtc);
        }

        if (!string.IsNullOrWhiteSpace(location))
        {
            var loc = location.ToLower();
            termini = termini.Where(t => t.LokacijaTermin.ToLower().Contains(loc));
        }

        if (walkerId.HasValue)
        {
            termini = termini.Where(t => t.IdKorisnik == walkerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            var tt = type.ToLower();
            termini = termini.Where(t => t.VrstaSetnjaTermin.ToLower() == tt);
        }

        if (minPrice.HasValue)
        {
            termini = termini.Where(t => t.Cijena >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            termini = termini.Where(t => t.Cijena <= maxPrice.Value);
        }

        var list = await termini.ToListAsync(ct);

        var results = list.Select(t =>
        {
            var bookedDogs = t.Rezervacije
                .Where(r => r.StatusRezervacija != "otkazana")
                .SelectMany(r => r.PsiRezervacije)
                .Count();

            var available = t.MaxDogs > bookedDogs;

            return new TerminSearchResultDto(
                t.IdTermin,
                t.DatumVrijemePocetka,
                t.Trajanje,
                t.LokacijaTermin,
                t.Cijena,
                t.VrstaSetnjaTermin,
                t.MaxDogs,
                bookedDogs,
                available,
                t.Setac.IdKorisnik,
                $"{t.Setac.ImeSetac} {t.Setac.PrezimeSetac}",
                t.Setac.ProfilnaSetac);
        });

        if (onlyAvailable.HasValue && onlyAvailable.Value)
        {
            results = results.Where(r => r.IsAvailable);
        }

        return results.ToList();
    }

    public async Task<IEnumerable<WalkerReviewDto>> GetWalkerReviewsAsync(int walkerId, int limit = 3, CancellationToken ct = default)
    {
        // Profile page may need more than 10; keep a hard cap to avoid abuse.
        if (limit <= 0) limit = 100;
        limit = Math.Clamp(limit, 1, 100);

        var reviews = await _db.Recenzije
            .Include(r => r.Rezervacija)
                .ThenInclude(rez => rez.Termin)
                    .ThenInclude(t => t.Setac)
            .Include(r => r.Rezervacija)
                .ThenInclude(rez => rez.Vlasnik)
                    .ThenInclude(v => v.Korisnik)
            .Where(r => r.Rezervacija.Termin.IdKorisnik == walkerId)
            .OrderByDescending(r => r.DatumRecenzija)
            .Take(limit)
            .Select(r => new WalkerReviewDto(
                r.DatumRecenzija,
                r.Ocjena,
                r.Komentar,
                r.Rezervacija.Vlasnik.Korisnik.Ime + " " + r.Rezervacija.Vlasnik.Korisnik.Prezime
            ))
            .ToListAsync(ct);

        return reviews;
    }
}
