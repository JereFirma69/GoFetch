using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Poruka
{
    [Key]
    public int IdPoruka { get; set; }

    public string? TekstPoruka { get; set; }
    public DateTime DatumVrijemePoruka { get; set; }

    [MaxLength(100)]
    public string? FotografijaPoruka { get; set; }

    [ForeignKey(nameof(Korisnik))]
    public int IdKorisnik { get; set; }

    [ForeignKey(nameof(Rezervacija))]
    public int IdRezervacija { get; set; }

    public Korisnik Korisnik { get; set; } = null!;
    public Rezervacija Rezervacija { get; set; } = null!;
}
