using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PawPal.Api.Configuration;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;
using GoogleCalendarApi = Google.Apis.Calendar.v3.CalendarService;

namespace PawPal.Api.Services.Implementations;

public class GoogleCalendarService : IGoogleCalendarService
{
    private readonly AppDbContext _db;
    private readonly GoogleCalendarOptions _options;
    private readonly ILogger<GoogleCalendarService> _logger;

    public GoogleCalendarService(
        AppDbContext db,
        IOptions<GoogleCalendarOptions> options,
        ILogger<GoogleCalendarService> logger)
    {
        _db = db;
        _options = options.Value;
        _logger = logger;
    }

    private GoogleAuthorizationCodeFlow CreateFlow()
    {
        return new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _options.ClientId,
                ClientSecret = _options.ClientSecret
            },
            Scopes = _options.Scopes
        });
    }

    public string GetAuthorizationUrl(int walkerId, string state = "")
    {
        var flow = CreateFlow();
        var authReq = flow.CreateAuthorizationCodeRequest(_options.RedirectUri);
        authReq.State = !string.IsNullOrEmpty(state) ? state : walkerId.ToString();
        var built = authReq.Build().ToString();

        var uri = new Uri(built);
        var basePath = uri.GetLeftPart(UriPartial.Path);
        var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);

        var dict = new System.Collections.Generic.Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var kvp in query)
        {
            dict[kvp.Key] = kvp.Value.ToString();
        }

        dict["access_type"] = "offline";
        dict["include_granted_scopes"] = "true";
        dict["prompt"] = "consent select_account";

        var finalUrl = Microsoft.AspNetCore.WebUtilities.QueryHelpers.AddQueryString(basePath, dict);
        return finalUrl;
    }

    public async Task SaveOAuthTokensAsync(int walkerId, string authCode, CancellationToken ct = default)
    {
        var flow = CreateFlow();
        var tokenResponse = await flow.ExchangeCodeForTokenAsync(
            walkerId.ToString(),
            authCode,
            _options.RedirectUri,
            ct);

        var existingAuth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        
        if (existingAuth != null)
        {
            existingAuth.AccessToken = tokenResponse.AccessToken;
            existingAuth.RefreshToken = tokenResponse.RefreshToken ?? existingAuth.RefreshToken;
            existingAuth.TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresInSeconds ?? 3600);
        }
        else
        {
            var googleAuth = new WalkerGoogleAuth
            {
                IdKorisnik = walkerId,
                AccessToken = tokenResponse.AccessToken,
                RefreshToken = tokenResponse.RefreshToken ?? "",
                TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresInSeconds ?? 3600),
                CalendarId = "primary"
            };
            _db.WalkerGoogleAuths.Add(googleAuth);
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Saved Google Calendar OAuth tokens for walker {WalkerId}", walkerId);
    }

    public async Task<GoogleCalendarAuthStatusResponse> GetAuthStatusAsync(int walkerId, CancellationToken ct = default)
    {
        var auth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        
        if (auth == null)
        {
            return new GoogleCalendarAuthStatusResponse(false, null, null);
        }

        return new GoogleCalendarAuthStatusResponse(
            true,
            auth.CalendarId,
            auth.TokenExpiresAt);
    }

    public async Task DisconnectAsync(int walkerId, CancellationToken ct = default)
    {
        var auth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        if (auth != null)
        {
            _db.WalkerGoogleAuths.Remove(auth);
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Disconnected Google Calendar for walker {WalkerId}", walkerId);
        }
    }

    private async Task<GoogleCalendarApi?> GetCalendarServiceAsync(int walkerId, CancellationToken ct)
    {
        var auth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        if (auth == null)
        {
            _logger.LogWarning("No Google Calendar auth found for walker {WalkerId}", walkerId);
            return null;
        }

        // Check if token needs refresh
        if (auth.TokenExpiresAt <= DateTime.UtcNow.AddMinutes(5))
        {
            await RefreshTokenAsync(auth, ct);
        }

        var credential = GoogleCredential.FromAccessToken(auth.AccessToken);
        
        return new GoogleCalendarApi(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "PawPal"
        });
    }

    private async Task RefreshTokenAsync(WalkerGoogleAuth auth, CancellationToken ct)
    {
        try
        {
            var flow = CreateFlow();
            var tokenResponse = new TokenResponse
            {
                RefreshToken = auth.RefreshToken
            };

            var userCredential = new UserCredential(flow, auth.IdKorisnik.ToString(), tokenResponse);
            var refreshed = await userCredential.RefreshTokenAsync(ct);

            if (refreshed)
            {
                auth.AccessToken = userCredential.Token.AccessToken;
                auth.TokenExpiresAt = DateTime.UtcNow.AddSeconds(userCredential.Token.ExpiresInSeconds ?? 3600);
                await _db.SaveChangesAsync(ct);
                _logger.LogInformation("Refreshed Google Calendar token for walker {WalkerId}", auth.IdKorisnik);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to refresh Google Calendar token for walker {WalkerId}", auth.IdKorisnik);
            throw;
        }
    }

    public async Task<string> CreateEventAsync(int walkerId, Termin termin, CancellationToken ct = default)
    {
        var service = await GetCalendarServiceAsync(walkerId, ct);
        if (service == null)
        {
            throw new InvalidOperationException("Google Calendar not connected. Please authorize first.");
        }

        var auth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        
        var endTime = termin.DatumVrijemePocetka.Add(termin.Trajanje);
        
        var calendarEvent = new Event
        {
            Summary = $"🐕 PawPal: {termin.VrstaSetnjaTermin} Walk",
            Description = BuildEventDescription(termin, new List<Rezervacija>()),
            Location = termin.LokacijaTermin,
            Start = new EventDateTime
            {
                DateTimeDateTimeOffset = termin.DatumVrijemePocetka,
                TimeZone = "Europe/Zagreb"
            },
            End = new EventDateTime
            {
                DateTimeDateTimeOffset = endTime,
                TimeZone = "Europe/Zagreb"
            },
            ColorId = "7" // Turquoise for available slots
        };

        var request = service.Events.Insert(calendarEvent, auth!.CalendarId);
        var createdEvent = await request.ExecuteAsync(ct);
        
        _logger.LogInformation("Created Google Calendar event {EventId} for termin {TerminId}", createdEvent.Id, termin.IdTermin);
        
        return createdEvent.Id;
    }

    public async Task UpdateEventAsync(int walkerId, string eventId, Termin termin, CancellationToken ct = default)
    {
        var service = await GetCalendarServiceAsync(walkerId, ct);
        if (service == null)
        {
            throw new InvalidOperationException("Google Calendar not connected.");
        }

        var auth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        var endTime = termin.DatumVrijemePocetka.Add(termin.Trajanje);

        // Get existing event first
        var existingEvent = await service.Events.Get(auth!.CalendarId, eventId).ExecuteAsync(ct);
        
        existingEvent.Summary = $"🐕 PawPal: {termin.VrstaSetnjaTermin} Walk";
        existingEvent.Location = termin.LokacijaTermin;
        existingEvent.Start = new EventDateTime
        {
            DateTimeDateTimeOffset = termin.DatumVrijemePocetka,
            TimeZone = "Europe/Zagreb"
        };
        existingEvent.End = new EventDateTime
        {
            DateTimeDateTimeOffset = endTime,
            TimeZone = "Europe/Zagreb"
        };

        await service.Events.Update(existingEvent, auth.CalendarId, eventId).ExecuteAsync(ct);
        _logger.LogInformation("Updated Google Calendar event {EventId}", eventId);
    }

    public async Task DeleteEventAsync(int walkerId, string eventId, CancellationToken ct = default)
    {
        var service = await GetCalendarServiceAsync(walkerId, ct);
        if (service == null)
        {
            _logger.LogWarning("Cannot delete event - Google Calendar not connected for walker {WalkerId}", walkerId);
            return;
        }

        var auth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        
        try
        {
            await service.Events.Delete(auth!.CalendarId, eventId).ExecuteAsync(ct);
            _logger.LogInformation("Deleted Google Calendar event {EventId}", eventId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete Google Calendar event {EventId}", eventId);
        }
    }

    public async Task UpdateEventWithBookingAsync(int walkerId, string eventId, Termin termin, List<Rezervacija> bookings, CancellationToken ct = default)
    {
        var service = await GetCalendarServiceAsync(walkerId, ct);
        if (service == null)
        {
            _logger.LogWarning("Cannot update event - Google Calendar not connected for walker {WalkerId}", walkerId);
            return;
        }

        var auth = await _db.WalkerGoogleAuths.FindAsync([walkerId], ct);
        
        try
        {
            var existingEvent = await service.Events.Get(auth!.CalendarId, eventId).ExecuteAsync(ct);
            
            var confirmedBookings = bookings.Where(b => b.StatusRezervacija == "prihvacena").ToList();
            var pendingBookings = bookings.Where(b => b.StatusRezervacija == "na cekanju").ToList();
            
            // Update summary to show booking status
            var dogCount = bookings.SelectMany(b => b.PsiRezervacije).Count();
            existingEvent.Summary = $"🐕 PawPal: {termin.VrstaSetnjaTermin} Walk ({dogCount}/{termin.MaxDogs} dogs)";
            existingEvent.Description = BuildEventDescription(termin, bookings);
            
            // Change color based on status
            if (dogCount >= termin.MaxDogs)
            {
                existingEvent.ColorId = "11"; // Red - fully booked
            }
            else if (confirmedBookings.Any())
            {
                existingEvent.ColorId = "10"; // Green - has confirmed bookings
            }
            else if (pendingBookings.Any())
            {
                existingEvent.ColorId = "5"; // Yellow - pending bookings
            }
            else
            {
                existingEvent.ColorId = "7"; // Turquoise - available
            }

            await service.Events.Update(existingEvent, auth.CalendarId, eventId).ExecuteAsync(ct);
            _logger.LogInformation("Updated Google Calendar event {EventId} with booking info", eventId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to update Google Calendar event {EventId} with booking", eventId);
        }
    }

    private string BuildEventDescription(Termin termin, List<Rezervacija> bookings)
    {
        var desc = $@"💰 Price: {termin.Cijena:C}
⏱️ Duration: {termin.Trajanje.TotalMinutes} minutes
📍 Location: {termin.LokacijaTermin}
🐕 Type: {termin.VrstaSetnjaTermin}
";

        if (bookings.Any())
        {
            desc += "\n--- BOOKINGS ---\n";
            foreach (var booking in bookings)
            {
                var dogs = booking.PsiRezervacije.Select(rp => rp.Pas.ImePas);
                desc += $@"
👤 Owner: {booking.Vlasnik?.Korisnik?.Ime} {booking.Vlasnik?.Korisnik?.Prezime}
🐕 Dogs: {string.Join(", ", dogs)}
📍 Pickup: {booking.AdresaPolaska}
📋 Status: {booking.StatusRezervacija}
📝 Notes: {booking.NapomenaRezervacija ?? "None"}
---
";
            }
        }

        desc += "\n\n🔗 Managed by PawPal";
        return desc;
    }
}
