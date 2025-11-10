using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PawPal.Api.Configuration;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;
using PawPal.Api.Services;

namespace PawPal.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IOptions<JwtOptions> _jwtOptions;
    private readonly PasswordHasher<Korisnik> _passwordHasher;

    public AuthService(AppDbContext db, IOptions<JwtOptions> jwtOptions)
    {
        _db = db;
        _jwtOptions = jwtOptions;
        _passwordHasher = new PasswordHasher<Korisnik>();
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        // Check if user already exists
        var exists = await _db.Korisnici.AnyAsync(k => k.EmailKorisnik == request.Email, ct);
        if (exists)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        // Create new user
        var user = new Korisnik
        {
            EmailKorisnik = request.Email,
            Ime = request.FirstName,
            Prezime = request.LastName
        };

        // Hash password
        user.LozinkaHashKorisnik = _passwordHasher.HashPassword(user, request.Password);

        _db.Korisnici.Add(user);
        await _db.SaveChangesAsync(ct);

        return GenerateAuthResponse(user, "none");
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .Include(k => k.Administrator)
            .FirstOrDefaultAsync(k => k.EmailKorisnik == request.Email, ct);

        if (user == null || user.LozinkaHashKorisnik == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Verify password
        var result = _passwordHasher.VerifyHashedPassword(user, user.LozinkaHashKorisnik, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var role = DetermineUserRole(user);
        return GenerateAuthResponse(user, role);
    }

    public async Task<AuthResponse> OAuthLoginAsync(OAuthLoginRequest request, CancellationToken ct = default)
    {
        string email;
        string providerUserId;

        // Validate OAuth token based on provider
        switch (request.Provider.ToLowerInvariant())
        {
            case "google":
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);
                email = payload.Email;
                providerUserId = payload.Subject;
                break;

            default:
                throw new InvalidOperationException($"Unsupported OAuth provider: {request.Provider}");
        }

        // Find or create user
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .Include(k => k.Administrator)
            .FirstOrDefaultAsync(k => k.EmailKorisnik == email, ct);

        if (user == null)
        {
            // Create new user from OAuth
            user = new Korisnik
            {
                EmailKorisnik = email,
                AuthProvider = request.Provider.ToLowerInvariant(),
                ProviderUserId = providerUserId
            };

            _db.Korisnici.Add(user);
            await _db.SaveChangesAsync(ct);
        }
        else
        {
            // Update OAuth info if not set
            if (string.IsNullOrEmpty(user.AuthProvider))
            {
                user.AuthProvider = request.Provider.ToLowerInvariant();
                user.ProviderUserId = providerUserId;
                await _db.SaveChangesAsync(ct);
            }
        }

        var role = DetermineUserRole(user);
        return GenerateAuthResponse(user, role);
    }

    public async Task RegisterRoleAsync(int userId, string role, CancellationToken ct = default)
    {
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .FirstOrDefaultAsync(k => k.IdKorisnik == userId, ct);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        // Prevent changing role if already set
        if (user.Vlasnik != null || user.Setac != null)
        {
            throw new InvalidOperationException("User role is already set.");
        }

        switch (role.ToLowerInvariant())
        {
            case "owner":
                user.Vlasnik = new Vlasnik { IdKorisnik = userId };
                break;

            case "walker":
                user.Setac = new Setac
                {
                    IdKorisnik = userId,
                    ImeSetac = user.Ime ?? "",
                    PrezimeSetac = user.Prezime ?? "",
                    LokacijaSetac = "",
                    TelefonSetac = "",
                    ProfilnaSetac = ""
                };
                break;

            default:
                throw new InvalidOperationException($"Invalid role: {role}. Must be 'owner' or 'walker'.");
        }

        await _db.SaveChangesAsync(ct);
    }


    private string DetermineUserRole(Korisnik user)
    {
        if (user.Administrator != null) return "admin";
        if (user.Vlasnik != null) return "owner";
        if (user.Setac != null) return "walker";
        return "none";
    }

    private AuthResponse GenerateAuthResponse(Korisnik user, string role)
    {
        var jwt = GenerateJwt(user, role);
        var displayName = $"{user.Ime} {user.Prezime}".Trim();
        if (string.IsNullOrEmpty(displayName))
        {
            displayName = user.EmailKorisnik.Split('@')[0];
        }

        return new AuthResponse(jwt, user.IdKorisnik, user.EmailKorisnik, role, displayName);
    }

    private string GenerateJwt(Korisnik user, string role)
    {
        var options = _jwtOptions.Value;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.IdKorisnik.ToString()),
            new(JwtRegisteredClaimNames.Email, user.EmailKorisnik),
            new(ClaimTypes.Role, role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(options.ExpiresMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
