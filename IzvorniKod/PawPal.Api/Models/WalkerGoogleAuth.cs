using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class WalkerGoogleAuth
{
    [Key]
    [ForeignKey(nameof(Setac))]
    public int IdKorisnik { get; set; }

    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required]
    public string RefreshToken { get; set; } = string.Empty;

    public DateTime TokenExpiresAt { get; set; }

    [MaxLength(255)]
    public string CalendarId { get; set; } = "primary";

    public Setac Setac { get; set; } = null!;
}
