using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Rezervacija
{
    [Key]
    public int IdRezervacija { get; set; }

    public DateTime DatumRezervacija { get; set; }

    [Required, MaxLength(20)]
    public string StatusRezervacija { get; set; } = string.Empty; // "prihvacena", "na cekanju", "otkazana"

    [MaxLength(100)]
    public string? NapomenaRezervacija { get; set; }

    [Required, MaxLength(100)]
    public string AdresaPolaska { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string VrstaSetnjaRezervacija { get; set; } = string.Empty; // "grupna" or "individualna"

    public DateTime DatumVrijemePolaska { get; set; }

    [ForeignKey(nameof(Termin))]
    public int IdTermin { get; set; }

    public Termin Termin { get; set; } = null!;
    public List<Placanje> Placanja { get; set; } = new();
    public List<Recenzija> Recenzije { get; set; } = new();
    public List<Poruka> Poruke { get; set; } = new();
    public List<RezervacijaPas> PsiRezervacije { get; set; } = new();
}
