using System.ComponentModel.DataAnnotations;

namespace PawPal.Api.Models;

public class Korisnik
{
    [Key]
    public int IdKorisnik { get; set; }

    [Required, MaxLength(100)]
    public string EmailKorisnik { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? LozinkaHashKorisnik { get; set; }

    [MaxLength(20)]
    public string? AuthProvider { get; set; } // "google", "facebook", etc.

    [MaxLength(255)]
    public string? ProviderUserId { get; set; }

    [MaxLength(50)]
    public string? Ime { get; set; }

    [MaxLength(50)]
    public string? Prezime { get; set; }

    [MaxLength(500)]
    public string? ProfilnaKorisnik { get; set; }

<<<<<<< HEAD
    public WalkerGoogleAuth? GoogleAuth { get; set; }
=======
    [MaxLength(50)]
    public string? StreamUserId { get; set; } // Link to Stream chat user ID

>>>>>>> main
    public Vlasnik? Vlasnik { get; set; }
    public Setac? Setac { get; set; }
    public Administrator? Administrator { get; set; }
    public List<Poruka> Poruke { get; set; } = new();
    public List<RefreshToken> RefreshTokens { get; set; } = new();
}
