using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Placanje
{
    [Key]
    public int IdPlacanje { get; set; }

    [Required, MaxLength(20)]
    public string StatusPlacanje { get; set; } = string.Empty; // "prihvaceno" or "odbijeno"

    public DateTime DatumPlacanje { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal IznosPlacanje { get; set; }

    [Required, MaxLength(20)]
    public string NacinPlacanje { get; set; } = string.Empty; // "gotovina", "paypal", "kartica"

    [ForeignKey(nameof(Rezervacija))]
    public int IdRezervacija { get; set; }

    public Rezervacija Rezervacija { get; set; } = null!;
}
