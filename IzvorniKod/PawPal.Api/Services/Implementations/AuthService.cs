using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;
    private readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();

    public AuthService(AppDbContext db, IOptions<JwtOptions> jwtOptions, IConfiguration configuration, IEmailService emailService, ILogger<AuthService> logger)
    {
        _db = db;
        _jwtOptions = jwtOptions;
        _passwordHasher = new PasswordHasher<Korisnik>();
        _googleClientId = configuration["Google:ClientId"];
        _emailService = emailService;
        _logger = logger;
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

        // Auto-create Vlasnik (owner) profile for new user
        var vlasnik = new Vlasnik
        {
            IdKorisnik = user.IdKorisnik,
            Korisnik = user
        };
        _db.Vlasnici.Add(vlasnik);
        await _db.SaveChangesAsync(ct);

        return await GenerateAuthResponseAsync(user, "owner", ct);
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
        return await GenerateAuthResponseAsync(user, role, ct);
    }

    public async Task<AuthResponse> OAuthLoginAsync(OAuthLoginRequest request, CancellationToken ct = default)
    {
        string email;
        string providerUserId;
        string? firstName = null;
        string? lastName = null;

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
                    payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);
                }
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

        var user = await _db.Korisnici
            .Include(k => k.Vlasnik)
            .Include(k => k.Setac)
            .Include(k => k.Administrator)
            .FirstOrDefaultAsync(k => k.EmailKorisnik.ToLower() == email, ct);

        if (user == null)
        {
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

            // Auto-create owner profile for OAuth registrations
            var vlasnik = new Vlasnik
            {
                IdKorisnik = user.IdKorisnik,
                Korisnik = user
            };
            _db.Vlasnici.Add(vlasnik);
            await _db.SaveChangesAsync(ct);
        }
        else
        {
            if (user.LozinkaHashKorisnik != null && string.IsNullOrEmpty(user.AuthProvider))
            {
                throw new UnauthorizedAccessException("Email already registered with password. Use email/password login.");
            }

            if (string.IsNullOrEmpty(user.AuthProvider))
            {
                user.AuthProvider = request.Provider.ToLowerInvariant();
                user.ProviderUserId = providerUserId;
                await _db.SaveChangesAsync(ct);
            }
            
            if (string.IsNullOrEmpty(user.Ime) && !string.IsNullOrEmpty(firstName))
            {
                user.Ime = firstName;
                user.Prezime = lastName;
                await _db.SaveChangesAsync(ct);
            }

            // Ensure owner role exists if none set
            await _db.Entry(user).ReloadAsync(ct);
            if (user.Vlasnik == null && user.Setac == null && user.Administrator == null)
            {
                var vlasnikExisting = await _db.Vlasnici.FirstOrDefaultAsync(v => v.IdKorisnik == user.IdKorisnik, ct);
                if (vlasnikExisting == null)
                {
                    _db.Vlasnici.Add(new Vlasnik { IdKorisnik = user.IdKorisnik });
                    await _db.SaveChangesAsync(ct);
                }
            }
        }

        var role = DetermineUserRole(user);
        return await GenerateAuthResponseAsync(user, role, ct);
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
        return await GenerateAuthResponseAsync(user, updatedRole, ct);
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
        return await GenerateAuthResponseAsync(user, updatedRole, ct);
    }


    private string DetermineUserRole(Korisnik user)
    {
        if (user.Administrator != null) return "admin";

        // Prefer a single primary role to avoid "both" states leaking to the client
        if (user.Setac != null) return "walker";
        if (user.Vlasnik != null) return "owner";
        return "none";
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(Korisnik user, string role, CancellationToken ct)
    {
        var jwt = GenerateJwt(user, role);
        var refresh = await CreateRefreshTokenAsync(user.IdKorisnik, ct);
        var displayName = $"{user.Ime} {user.Prezime}".Trim();
        if (string.IsNullOrEmpty(displayName))
        {
            displayName = user.EmailKorisnik.Split('@')[0];
        }

        return new AuthResponse(
            jwt, 
            refresh,
            user.IdKorisnik, 
            user.EmailKorisnik, 
            role, 
            displayName,
            user.Ime,
            user.Prezime);
    }

    private async Task<string> CreateRefreshTokenAsync(int userId, CancellationToken ct)
    {
        var bytes = new byte[64];
        _rng.GetBytes(bytes);
        var token = Convert.ToBase64String(bytes);

        var options = _jwtOptions.Value;
        var refresh = new RefreshToken
        {
            Token = token,
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(options.RefreshTokenExpiresDays),
            CreatedAt = DateTime.UtcNow
        };

        _db.RefreshTokens.Add(refresh);
        await _db.SaveChangesAsync(ct);
        return token;
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

    private async Task<RefreshToken?> GetValidRefreshTokenAsync(string refreshToken, CancellationToken ct)
    {
        var token = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken, ct);

        if (token == null) return null;
        if (token.RevokedAt.HasValue) return null;
        if (token.ExpiresAt < DateTime.UtcNow) return null;
        return token;
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var existing = await GetValidRefreshTokenAsync(refreshToken, ct);
        if (existing == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        // Rotate: revoke old, issue new
        existing.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        var user = existing.User;
        var role = DetermineUserRole(user);
        return await GenerateAuthResponseAsync(user, role, ct);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var existing = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken, ct);
        if (existing == null) return;
        existing.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<PasswordResetResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string frontendUrl, CancellationToken ct = default)
    {
        var user = await _db.Korisnici.FirstOrDefaultAsync(k => k.EmailKorisnik == request.Email, ct);
        
        // Always return success to prevent email enumeration
        if (user == null)
        {
            return new PasswordResetResponse(true, "If the email exists, a password reset link has been sent.");
        }

        // Invalidate any existing tokens for this user
        var existingTokens = await _db.PasswordResetTokens
            .Where(t => t.IdKorisnik == user.IdKorisnik && !t.IsUsed)
            .ToListAsync(ct);
        
        foreach (var t in existingTokens)
        {
            t.IsUsed = true;
        }

        // Generate new token (UTC timestamps)
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var utcNow = DateTime.UtcNow;
        var expiry = utcNow.AddHours(1);
        var resetToken = new PasswordResetToken
        {
            Token = token,
            IdKorisnik = user.IdKorisnik,
            ExpiresAt = expiry,
            IsUsed = false,
            CreatedAt = utcNow
        };

        _db.PasswordResetTokens.Add(resetToken);
        await _db.SaveChangesAsync(ct);

        // Send email with reset link
        var resetUrl = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(token)}";
        await _emailService.SendPasswordResetEmailAsync(user.EmailKorisnik, resetUrl, ct);

        return new PasswordResetResponse(true, "If the email exists, a password reset link has been sent.");
    }

    public async Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        var resetToken = await _db.PasswordResetTokens
            .Include(t => t.Korisnik)
            .FirstOrDefaultAsync(t => t.Token == request.Token && !t.IsUsed, ct);

        if (resetToken == null)
        {
            return new PasswordResetResponse(false, "Invalid or expired reset token.");
        }

        if (resetToken.ExpiresAt < DateTime.UtcNow)
        {
            return new PasswordResetResponse(false, "Reset token has expired.");
        }

        // Update password
        var user = resetToken.Korisnik;
        user.LozinkaHashKorisnik = _passwordHasher.HashPassword(user, request.NewPassword);
        
        // Mark token as used
        resetToken.IsUsed = true;

        await _db.SaveChangesAsync(ct);

        return new PasswordResetResponse(true, "Password has been reset successfully.");
    }
}
