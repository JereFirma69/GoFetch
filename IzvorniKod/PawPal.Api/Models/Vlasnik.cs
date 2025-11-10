using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class Vlasnik
{
    [Key]
    [ForeignKey(nameof(Korisnik))]
    public int IdKorisnik { get; set; }

    public Korisnik Korisnik { get; set; } = null!;
    public PretplataVlasnikSetacNovosti? Pretplata { get; set; }
    public List<Pas> Psi { get; set; } = new();
}
