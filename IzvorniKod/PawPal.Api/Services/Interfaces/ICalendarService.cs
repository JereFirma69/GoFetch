using PawPal.Api.DTOs;
using PawPal.Api.Models;

namespace PawPal.Api.Services;

public interface ICalendarService
{
    // ============ TERMIN (Walker's Available Slots) ============
    
    // Walker creates an available time slot
    Task<TerminDto> CreateTerminAsync(int walkerId, CreateTerminRequest request, CancellationToken ct = default);
    
    // Walker updates a time slot
    Task<TerminDto> UpdateTerminAsync(int walkerId, int terminId, UpdateTerminRequest request, CancellationToken ct = default);
    
    // Walker deletes a time slot
    Task DeleteTerminAsync(int walkerId, int terminId, CancellationToken ct = default);
    
    // Get walker's own schedule
    Task<List<TerminDto>> GetWalkerTerminiAsync(int walkerId, DateTime from, DateTime to, CancellationToken ct = default);
    
    // Get single termin details
    Task<TerminDto> GetTerminAsync(int terminId, CancellationToken ct = default);

    // ============ AVAILABLE SLOTS (For Owners) ============
    
    // Owners browse available slots from all walkers
    Task<List<TerminDto>> GetAvailableSlotsAsync(AvailableSlotsQuery query, CancellationToken ct = default);

    // ============ REZERVACIJA (Bookings) ============
    
    // Owner books a walk
    Task<RezervacijaDto> CreateRezervacijaAsync(int ownerId, CreateRezervacijaRequest request, CancellationToken ct = default);
    
    // Get user's bookings (works for both owner and walker)
    Task<List<RezervacijaDto>> GetUserRezervacijeAsync(int userId, DateTime from, DateTime to, CancellationToken ct = default);
    
    // Get single booking details
    Task<RezervacijaDto> GetRezervacijaAsync(int rezervacijaId, CancellationToken ct = default);
    
    // Walker confirms/rejects booking, or owner/walker cancels
    Task<RezervacijaDto> UpdateRezervacijaStatusAsync(int userId, int rezervacijaId, UpdateRezervacijaStatusRequest request, CancellationToken ct = default);
    
    // Owner cancels booking (must be 24h before)
    Task CancelRezervacijaAsync(int ownerId, int rezervacijaId, CancellationToken ct = default);

    // Owner leaves a review for a completed walk (booking)
    Task<WalkerReviewDto> CreateRecenzijaAsync(int ownerId, int rezervacijaId, CreateRecenzijaRequest request, CancellationToken ct = default);

    // ============ WALKER DISCOVERY ============
    
    // Get walkers with calendar enabled (paginated)
    Task<WalkersPagedResponse> GetWalkersWithCalendarAsync(int page, int pageSize, CancellationToken ct = default);
    
    // Get single walker summary
    Task<WalkerSummaryDto> GetWalkerSummaryAsync(int walkerId, CancellationToken ct = default);
}
