using PawPal.Api.DTOs;
using PawPal.Api.Models;

namespace PawPal.Api.Services;

public interface IGoogleCalendarService
{
    // OAuth Authorization
    string GetAuthorizationUrl(int walkerId, string state = "");
    Task SaveOAuthTokensAsync(int walkerId, string authCode, CancellationToken ct = default);
    Task<GoogleCalendarAuthStatusResponse> GetAuthStatusAsync(int walkerId, CancellationToken ct = default);
    Task DisconnectAsync(int walkerId, CancellationToken ct = default);

    // Calendar Events - Creates/Updates events in walker's Google Calendar
    Task<string> CreateEventAsync(int walkerId, Termin termin, CancellationToken ct = default);
    Task UpdateEventAsync(int walkerId, string eventId, Termin termin, CancellationToken ct = default);
    Task DeleteEventAsync(int walkerId, string eventId, CancellationToken ct = default);

    // Update event when booking is made/changed
    Task UpdateEventWithBookingAsync(int walkerId, string eventId, Termin termin, List<Rezervacija> bookings, CancellationToken ct = default);
}
