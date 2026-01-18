using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Pas
{
    [Key]
    public int IdPas { get; set; }

    [Required, MaxLength(20)]
    public string ImePas { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Poslastice { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Socijalizacija { get; set; } = string.Empty;

    [Range(1, 5)]
    public int RazinaEnergije { get; set; }

    public string? ZdravstveneNapomene { get; set; }

    [Range(0, int.MaxValue)]
    public int Starost { get; set; }

    [Required, MaxLength(50)]
    public string Pasmina { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string ProfilnaPas { get; set; } = string.Empty;

    [ForeignKey(nameof(Vlasnik))]
    public int IdKorisnik { get; set; }

    public Vlasnik Vlasnik { get; set; } = null!;
    public List<RezervacijaPas> RezervacijePsa { get; set; } = new();
}
