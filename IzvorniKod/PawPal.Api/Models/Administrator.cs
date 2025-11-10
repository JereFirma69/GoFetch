using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Administrator
{
    [Key]
    [ForeignKey(nameof(Korisnik))]
    public int IdKorisnik { get; set; }

    public Korisnik Korisnik { get; set; } = null!;
}
