using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
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
    private readonly string? _googleClientId;

    public AuthService(AppDbContext db, IOptions<JwtOptions> jwtOptions, IConfiguration configuration)
    {
        _db = db;
        _jwtOptions = jwtOptions;
        _passwordHasher = new PasswordHasher<Korisnik>();
        _googleClientId = configuration["Google:ClientId"]; // e.g., set via env var Google__ClientId
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var exists = await _db.Korisnici
            .AnyAsync(k => k.EmailKorisnik.ToLower() == normalizedEmail, ct);
        if (exists)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        
        var user = new Korisnik
        {
            EmailKorisnik = normalizedEmail,
            Ime = request.FirstName,
            Prezime = request.LastName
        };

        
        user.LozinkaHashKorisnik = _passwordHasher.HashPassword(user, request.Password);

        _db.Korisnici.Add(user);
        await _db.SaveChangesAsync(ct);

        return GenerateAuthResponse(user, "none");
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .Include(k => k.Administrator)
            .FirstOrDefaultAsync(k => k.EmailKorisnik.ToLower() == normalizedEmail, ct);

        if (user == null || user.LozinkaHashKorisnik == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

    
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
        string? firstName = null;
        string? lastName = null;

        // Validate OAuth token based on provider
        switch (request.Provider.ToLowerInvariant())
        {
            case "google":
                GoogleJsonWebSignature.Payload payload;
                if (!string.IsNullOrWhiteSpace(_googleClientId))
                {
                    var settings = new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { _googleClientId }
                    };
                    payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);
                }
                else
                {
                    // Fallback: validate without audience constraint (not recommended for production)
                    payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);
                }
                // Extra hardening checks
                if (!(payload.Issuer == "accounts.google.com" || payload.Issuer == "https://accounts.google.com"))
                {
                    throw new UnauthorizedAccessException("Invalid token issuer.");
                }
                if (string.IsNullOrEmpty(payload.Email) || payload.EmailVerified != true)
                {
                    throw new UnauthorizedAccessException("Unverified Google account.");
                }

                email = payload.Email.Trim().ToLowerInvariant();
                providerUserId = payload.Subject;
                firstName = payload.GivenName;
                lastName = payload.FamilyName;
                break;

            default:
                throw new InvalidOperationException($"Unsupported OAuth provider: {request.Provider}");
        }

        // Find or create user
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .Include(k => k.Administrator)
            .FirstOrDefaultAsync(k => k.EmailKorisnik.ToLower() == email, ct);

        if (user == null)
        {
            // Create new user from OAuth
            user = new Korisnik
            {
                EmailKorisnik = email,
                AuthProvider = request.Provider.ToLowerInvariant(),
                ProviderUserId = providerUserId,
                Ime = firstName,
                Prezime = lastName
            };

            _db.Korisnici.Add(user);
            await _db.SaveChangesAsync(ct);
        }
        else
        {
            // If account exists with a password and no OAuth provider, do NOT auto-link
            if (user.LozinkaHashKorisnik != null && string.IsNullOrEmpty(user.AuthProvider))
            {
                throw new UnauthorizedAccessException("Email already registered with password. Use email/password login.");
            }

            // Update OAuth info if not set
            if (string.IsNullOrEmpty(user.AuthProvider))
            {
                user.AuthProvider = request.Provider.ToLowerInvariant();
                user.ProviderUserId = providerUserId;
                await _db.SaveChangesAsync(ct);
            }
            
            // Update name if not set
            if (string.IsNullOrEmpty(user.Ime) && !string.IsNullOrEmpty(firstName))
            {
                user.Ime = firstName;
                user.Prezime = lastName;
                await _db.SaveChangesAsync(ct);
            }
        }

        var role = DetermineUserRole(user);
        return GenerateAuthResponse(user, role);
    }

    public async Task<AuthResponse> RegisterRoleAsync(int userId, string role, CancellationToken ct = default)
    {
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .FirstOrDefaultAsync(k => k.IdKorisnik == userId, ct);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }
        switch (role.ToLowerInvariant())
        {
            case "owner":
                if (user.Vlasnik == null)
                {
                    user.Vlasnik = new Vlasnik { IdKorisnik = userId };
                }
                break;

            case "walker":
                if (user.Setac == null)
                {
                    user.Setac = new Setac
                    {
                        IdKorisnik = userId,
                        ImeSetac = user.Ime ?? "",
                        PrezimeSetac = user.Prezime ?? "",
                        LokacijaSetac = "",
                        TelefonSetac = "",
                        ProfilnaSetac = ""
                    };
                }
                break;

            default:
                throw new InvalidOperationException($"Invalid role: {role}. Must be 'owner' or 'walker'.");
        }

        await _db.SaveChangesAsync(ct);
        

        await _db.Entry(user).ReloadAsync(ct);
        
        var updatedRole = DetermineUserRole(user);
        return GenerateAuthResponse(user, updatedRole);
    }

    public async Task<AuthResponse> RemoveRoleAsync(int userId, string role, CancellationToken ct = default)
    {
        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .FirstOrDefaultAsync(k => k.IdKorisnik == userId, ct);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        switch (role.ToLowerInvariant())
        {
            case "owner":
                if (user.Vlasnik != null)
                {
                    _db.Vlasnici.Remove(user.Vlasnik);
                }
                break;

            case "walker":
                if (user.Setac != null)
                {
                    _db.Setaci.Remove(user.Setac);
                }
                break;

            default:
                throw new InvalidOperationException($"Invalid role: {role}. Must be 'owner' or 'walker'.");
        }

        await _db.SaveChangesAsync(ct);
        
        await _db.Entry(user).ReloadAsync(ct);
        
        var updatedRole = DetermineUserRole(user);
        return GenerateAuthResponse(user, updatedRole);
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
        var jwt = GenerateJwt(user, role);
        var displayName = $"{user.Ime} {user.Prezime}".Trim();
        if (string.IsNullOrEmpty(displayName))
        {
            displayName = user.EmailKorisnik.Split('@')[0];
        }

        return new AuthResponse(
            jwt, 
            user.IdKorisnik, 
            user.EmailKorisnik, 
            role, 
            displayName,
            user.Ime,
            user.Prezime);
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
