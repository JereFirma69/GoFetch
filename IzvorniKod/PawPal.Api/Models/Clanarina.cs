using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Clanarina
{
    [Key]
    public int IdClanarina { get; set; }

    [Required, MaxLength(20)]
    public string VrstaClanarina { get; set; } = string.Empty; // "mjesecna" or "godisnja"

    public DateTime DatumPocetkaClanarina { get; set; }
    public DateTime DatumIstekaClanarina { get; set; }

    [Required, MaxLength(20)]
    public string StatusClanarina { get; set; } = string.Empty; // "aktivna", "istekla", "zamrznuta"

    [ForeignKey(nameof(Setac))]
    public int IdKorisnik { get; set; }

    public Setac Setac { get; set; } = null!;
}
