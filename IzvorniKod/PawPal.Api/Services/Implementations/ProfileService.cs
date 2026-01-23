using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;
using PawPal.Api.Services;

namespace PawPal.Api.Services.Implementations;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;

    public ProfileService(AppDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<ProfileResponse> GetProfileAsync(int userId, CancellationToken ct = default)
    {
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .FirstOrDefaultAsync(k => k.IdKorisnik == userId, ct);

        if (user?.Vlasnik != null)
        {
            await _db.Entry(user.Vlasnik)
                .Collection(v => v.Psi)
                .LoadAsync(ct);
        }

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        OwnerProfileDto? ownerProfile = null;
        WalkerProfileDto? walkerProfile = null;

        var ownerEntity = user.Vlasnik;
        if (ownerEntity != null)
        {
            var dogs = ownerEntity.Psi.Select(p => new DogDto(
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

            ownerProfile = new OwnerProfileDto(ownerEntity.IdKorisnik, dogs);
        }

        var walkerEntity = user.Setac;
        if (walkerEntity != null)
        {
            walkerProfile = new WalkerProfileDto(
                walkerEntity.IdKorisnik,
                walkerEntity.ImeSetac,
                walkerEntity.PrezimeSetac,
                walkerEntity.LokacijaSetac,
                walkerEntity.TelefonSetac,
                walkerEntity.ProfilnaSetac,
                walkerEntity.VerificationStatus,
                walkerEntity.IsVerified
            );
        }

        return new ProfileResponse(
            user.IdKorisnik,
            user.EmailKorisnik,
            user.Ime,
            user.Prezime,
            user.ProfilnaKorisnik,
            ownerProfile,
            walkerProfile
        );
    }

    public async Task<AuthResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .Include(k => k.Administrator)
            .FirstOrDefaultAsync(k => k.IdKorisnik == userId, ct);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        if (request.FirstName != null)
        {
            user.Ime = request.FirstName;
            if (user.Setac != null)
            {
                user.Setac.ImeSetac = request.FirstName;
            }
        }

        if (request.LastName != null)
        {
            user.Prezime = request.LastName;
            if (user.Setac != null)
            {
                user.Setac.PrezimeSetac = request.LastName;
            }
        }

        if (request.ProfilePicture != null)
        {
            user.ProfilnaKorisnik = request.ProfilePicture;
        }

        if (request.WalkerDetails != null && user.Setac != null)
        {
            user.Setac.LokacijaSetac = request.WalkerDetails.Location;
            user.Setac.TelefonSetac = request.WalkerDetails.Phone;
            
            if (request.WalkerDetails.WalkerProfilePicture != null)
            {
                user.Setac.ProfilnaSetac = request.WalkerDetails.WalkerProfilePicture;
            }
            else if (user.ProfilnaKorisnik != null)
            {
                user.Setac.ProfilnaSetac = user.ProfilnaKorisnik;
            }
        }

        await _db.SaveChangesAsync(ct);

     
        var role = DetermineUserRole(user);
        return GenerateAuthResponse(user, role);
    }

    private string DetermineUserRole(Korisnik user)
    {
        if (user.Administrator != null) return "admin";
        
        bool isOwner = user.Vlasnik != null;
        bool isWalker = user.Setac != null;
        
        if (isOwner && isWalker) return "both";
        if (isOwner) return "owner";
        if (isWalker) return "walker";
        return "none";
    }

    private AuthResponse GenerateAuthResponse(Korisnik user, string role)
    {
  
        var displayName = $"{user.Ime} {user.Prezime}".Trim();
        if (string.IsNullOrEmpty(displayName))
        {
            displayName = user.EmailKorisnik.Split('@')[0];
        }

        return new AuthResponse(
            "", 
            "",
            user.IdKorisnik, 
            user.EmailKorisnik, 
            role, 
            displayName,
            user.Ime,
            user.Prezime);
    }

    public async Task UpdateOwnerProfileAsync(int userId, UpdateOwnerRequest request, CancellationToken ct = default)
    {
        var owner = await _db.Vlasnici.FirstOrDefaultAsync(v => v.IdKorisnik == userId, ct);
        if (owner == null)
        {
            throw new InvalidOperationException("Owner profile not found.");
        }

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

        var user = await _db.Korisnici.FindAsync([userId], ct);
        if (user != null)
        {
            user.Ime = request.FirstName;
            user.Prezime = request.LastName;
        }

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

        // Remove stored dog image (if any)
        await _storage.DeleteDogImageAsync(ownerId, dogId, ct);

        _db.Psi.Remove(dog);
        await _db.SaveChangesAsync(ct);
    }
}
