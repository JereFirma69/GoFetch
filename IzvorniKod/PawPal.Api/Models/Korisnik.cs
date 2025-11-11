using System.ComponentModel.DataAnnotations;

namespace PawPal.Api.Models;

public class Korisnik
{
    [Key]
    public int IdKorisnik { get; set; }

    [Required, MaxLength(100)]
    public string EmailKorisnik { get; set; } = string.Empty;

    // For email/password authentication (nullable for OAuth-only users)
    [MaxLength(255)]
    public string? LozinkaHashKorisnik { get; set; }

    // For OAuth authentication (nullable for email/password users)
    [MaxLength(20)]
    public string? AuthProvider { get; set; } // "google", "facebook", etc.

    [MaxLength(255)]
    public string? ProviderUserId { get; set; }

    // User personal info (can come from either auth method)
    [MaxLength(50)]
    public string? Ime { get; set; }

    [MaxLength(50)]
    public string? Prezime { get; set; }

    public Vlasnik? Vlasnik { get; set; }
    public Setac? Setac { get; set; }
    public Administrator? Administrator { get; set; }
    public List<Poruka> Poruke { get; set; } = new();
}
