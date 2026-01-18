using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Setac
{
    [Key]
    [ForeignKey(nameof(Korisnik))]
    public int IdKorisnik { get; set; }

    [Required, MaxLength(50)]
    public string ImeSetac { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string PrezimeSetac { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string ProfilnaSetac { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LokacijaSetac { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string TelefonSetac { get; set; } = string.Empty;

    // Verification fields
    [MaxLength(20)]
    public string VerificationStatus { get; set; } = "pending"; // pending, approved, rejected

    public bool IsVerified { get; set; } = false;

    public Korisnik Korisnik { get; set; } = null!;

    public List<Clanarina> Clanarine { get; set; } = new();
    public List<Termin> Termini { get; set; } = new();
}
