using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

// Junction table for many-to-many relationship between Rezervacija and Pas
public class RezervacijaPas
{
    [ForeignKey(nameof(Rezervacija))]
    public int IdRezervacija { get; set; }

    [ForeignKey(nameof(Pas))]
    public int IdPas { get; set; }

    public Rezervacija Rezervacija { get; set; } = null!;
    public Pas Pas { get; set; } = null!;
}
