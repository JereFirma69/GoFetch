using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Recenzija
{
    [Key]
    public int IdRecenzija { get; set; }

    public DateTime DatumRecenzija { get; set; }

    [Range(1, 5)]
    public int Ocjena { get; set; }

    public string? Komentar { get; set; }

    [MaxLength(100)]
    public string? FotografijaRecenzija { get; set; }

    [ForeignKey(nameof(Rezervacija))]
    public int IdRezervacija { get; set; }

    public Rezervacija Rezervacija { get; set; } = null!;
}
