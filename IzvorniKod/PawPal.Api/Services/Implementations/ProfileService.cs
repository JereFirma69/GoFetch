using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;

namespace PawPal.Api.Services.Implementations;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _db;

    public ProfileService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ProfileResponse> GetProfileAsync(int userId, CancellationToken ct = default)
    {
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
                .ThenInclude(v => v.Psi)
            .Include(k => k.Setac)
            .FirstOrDefaultAsync(k => k.IdKorisnik == userId, ct);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        OwnerProfileDto? ownerProfile = null;
        WalkerProfileDto? walkerProfile = null;

        if (user.Vlasnik != null)
        {
            var dogs = user.Vlasnik.Psi.Select(p => new DogDto(
                p.IdPas,
                p.ImePas,
                p.Poslastice,
                p.Socijalizacija,
                p.RazinaEnergije,
                p.ZdravstveneNapomene,
                p.Starost,
                p.Pasmina,
                p.ProfilnaPas
            )).ToList();

            ownerProfile = new OwnerProfileDto(user.Vlasnik.IdKorisnik, dogs);
        }

        if (user.Setac != null)
        {
            walkerProfile = new WalkerProfileDto(
                user.Setac.IdKorisnik,
                user.Setac.ImeSetac,
                user.Setac.PrezimeSetac,
                user.Setac.LokacijaSetac,
                user.Setac.TelefonSetac,
                user.Setac.ProfilnaSetac
            );
        }

        return new ProfileResponse(
            user.IdKorisnik,
            user.EmailKorisnik,
            user.Ime,
            user.Prezime,
            ownerProfile,
            walkerProfile
        );
    }

    public async Task UpdateOwnerProfileAsync(int userId, UpdateOwnerRequest request, CancellationToken ct = default)
    {
        var owner = await _db.Vlasnici.FirstOrDefaultAsync(v => v.IdKorisnik == userId, ct);
        if (owner == null)
        {
            throw new InvalidOperationException("Owner profile not found.");
        }

        // Update user info
        var user = await _db.Korisnici.FindAsync([userId], ct);
        if (user != null)
        {
            user.Ime = request.FirstName;
            user.Prezime = request.LastName;
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateWalkerProfileAsync(int userId, UpdateWalkerRequest request, CancellationToken ct = default)
    {
        var walker = await _db.Setaci.FirstOrDefaultAsync(s => s.IdKorisnik == userId, ct);
        if (walker == null)
        {
            throw new InvalidOperationException("Walker profile not found.");
        }

        // Update user info
        var user = await _db.Korisnici.FindAsync([userId], ct);
        if (user != null)
        {
            user.Ime = request.FirstName;
            user.Prezime = request.LastName;
        }

        // Update walker-specific info
        walker.ImeSetac = request.FirstName;
        walker.PrezimeSetac = request.LastName;
        walker.LokacijaSetac = request.Location;
        walker.TelefonSetac = request.Phone;
        walker.ProfilnaSetac = request.ProfilePicture ?? walker.ProfilnaSetac;

        await _db.SaveChangesAsync(ct);
    }

    public async Task<DogDto> CreateDogAsync(int ownerId, CreateDogRequest request, CancellationToken ct = default)
    {
        var owner = await _db.Vlasnici.FirstOrDefaultAsync(v => v.IdKorisnik == ownerId, ct);
        if (owner == null)
        {
            throw new InvalidOperationException("Owner profile not found.");
        }

        var dog = new Pas
        {
            IdKorisnik = ownerId,
            ImePas = request.ImePas,
            Poslastice = request.Poslastice,
            Socijalizacija = request.Socijalizacija,
            RazinaEnergije = request.RazinaEnergije,
            ZdravstveneNapomene = request.ZdravstveneNapomene,
            Starost = request.Starost,
            Pasmina = request.Pasmina,
            ProfilnaPas = request.ProfilnaPas
        };

        _db.Psi.Add(dog);
        await _db.SaveChangesAsync(ct);

        return new DogDto(
            dog.IdPas,
            dog.ImePas,
            dog.Poslastice,
            dog.Socijalizacija,
            dog.RazinaEnergije,
            dog.ZdravstveneNapomene,
            dog.Starost,
            dog.Pasmina,
            dog.ProfilnaPas
        );
    }

    public async Task<DogDto> UpdateDogAsync(int dogId, int ownerId, UpdateDogRequest request, CancellationToken ct = default)
    {
        var dog = await _db.Psi.FirstOrDefaultAsync(p => p.IdPas == dogId && p.IdKorisnik == ownerId, ct);
        if (dog == null)
        {
            throw new InvalidOperationException("Dog not found or not owned by this user.");
        }

        dog.ImePas = request.ImePas;
        dog.Poslastice = request.Poslastice;
        dog.Socijalizacija = request.Socijalizacija;
        dog.RazinaEnergije = request.RazinaEnergije;
        dog.ZdravstveneNapomene = request.ZdravstveneNapomene;
        dog.Starost = request.Starost;
        dog.Pasmina = request.Pasmina;
        dog.ProfilnaPas = request.ProfilnaPas;

        await _db.SaveChangesAsync(ct);

        return new DogDto(
            dog.IdPas,
            dog.ImePas,
            dog.Poslastice,
            dog.Socijalizacija,
            dog.RazinaEnergije,
            dog.ZdravstveneNapomene,
            dog.Starost,
            dog.Pasmina,
            dog.ProfilnaPas
        );
    }

    public async Task DeleteDogAsync(int dogId, int ownerId, CancellationToken ct = default)
    {
        var dog = await _db.Psi.FirstOrDefaultAsync(p => p.IdPas == dogId && p.IdKorisnik == ownerId, ct);
        if (dog == null)
        {
            throw new InvalidOperationException("Dog not found or not owned by this user.");
        }

        _db.Psi.Remove(dog);
        await _db.SaveChangesAsync(ct);
    }
}
