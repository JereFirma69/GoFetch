namespace PawPal.Api.DTOs;

// ============ TERMIN (Walker's Available Slots) ============

public record CreateTerminRequest(
    string VrstaSetnjaTermin, // "grupna" or "individualna"
    decimal Cijena,
    int TrajanjeMins, // Duration in minutes
    DateTime DatumVrijemePocetka,
    string LokacijaTermin,
    int? MaxDogs = 5 // Max dogs for group walks
);

public record UpdateTerminRequest(
    string? VrstaSetnjaTermin,
    decimal? Cijena,
    int? TrajanjeMins,
    DateTime? DatumVrijemePocetka,
    string? LokacijaTermin,
    int? MaxDogs
);

public record TerminDto(
    int IdTermin,
    string VrstaSetnjaTermin,
    decimal Cijena,
    int TrajanjeMins,
    DateTime DatumVrijemePocetka,
    DateTime DatumVrijemeZavrsetka,
    string LokacijaTermin,
    int MaxDogs,
    int BookedDogs, // How many dogs are already booked
    int AvailableSlots, // MaxDogs - BookedDogs
    string? GoogleCalendarEventId,
    WalkerSummaryDto Walker
);

public record WalkerSummaryDto(
    int IdKorisnik,
    string ImeSetac,
    string PrezimeSetac,
    string ProfilnaSetac,
    string LokacijaSetac,
    decimal? AverageRating
);

// ============ REZERVACIJA (Owner's Bookings) ============

public record CreateRezervacijaRequest(
    int IdTermin,
    List<int> DogIds, // Multiple dogs for same walk
    string AdresaPolaska,
    string? NapomenaRezervacija,
    string NacinPlacanje // "gotovina", "paypal", "kartica"
);

public record UpdateRezervacijaStatusRequest(
    string Status // "prihvacena", "otkazana"
);

public record RezervacijaDto(
    int IdRezervacija,
    DateTime DatumRezervacija,
    string StatusRezervacija,
    string? NapomenaRezervacija,
    string AdresaPolaska,
    string VrstaSetnjaRezervacija,
    DateTime DatumVrijemePolaska,
    TerminSummaryDto Termin,
    OwnerSummaryDto Owner,
    List<DogSummaryDto> Dogs
);

public record TerminSummaryDto(
    int IdTermin,
    decimal Cijena,
    int TrajanjeMins,
    DateTime DatumVrijemePocetka,
    string LokacijaTermin,
    WalkerSummaryDto Walker
);

public record OwnerSummaryDto(
    int IdKorisnik,
    string Ime,
    string Prezime,
    string? ProfilnaKorisnik
);

public record DogSummaryDto(
    int IdPas,
    string ImePas,
    string Pasmina,
    string? ProfilnaPas,
    string? ZdravstveneNapomene
);

// ============ GOOGLE CALENDAR AUTH ============

public record GoogleCalendarAuthUrlResponse(
    string AuthorizationUrl
);

public record GoogleCalendarAuthStatusResponse(
    bool IsConnected,
    string? CalendarId,
    DateTime? TokenExpiresAt
);

// ============ AVAILABLE SLOTS QUERY ============

public record AvailableSlotsQuery(
    DateTime From,
    DateTime To,
    string? Location,
    decimal? MaxPrice,
    string? VrstaSetnje // "grupna" or "individualna"
);

// ============ WALKER DISCOVERY ============

public record WalkersPagedResponse(
    List<WalkerSummaryDto> Walkers,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
