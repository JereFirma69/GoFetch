using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Termin
{
    [Key]
    public int IdTermin { get; set; }

    [Required, MaxLength(20)]
    public string VrstaSetnjaTermin { get; set; } = string.Empty; // "grupna" or "individualna"

    [Column(TypeName = "decimal(5,2)")]
    public decimal Cijena { get; set; }

    public TimeSpan Trajanje { get; set; }
    public DateTime DatumVrijemePocetka { get; set; }

    [Required, MaxLength(100)]
    public string LokacijaTermin { get; set; } = string.Empty;

    [ForeignKey(nameof(Setac))]
    public int IdKorisnik { get; set; }

    public Setac Setac { get; set; } = null!;
    public List<Rezervacija> Rezervacije { get; set; } = new();
}
