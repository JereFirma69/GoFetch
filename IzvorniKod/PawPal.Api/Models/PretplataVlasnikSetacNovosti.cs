using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class PretplataVlasnikSetacNovosti
{
    [Key]
    [ForeignKey(nameof(Vlasnik))]
    public int IdKorisnik { get; set; }

    public Vlasnik Vlasnik { get; set; } = null!;
}
