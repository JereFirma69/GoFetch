using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PawPal.Api.Models;

public class MembershipSetting
{
    [Key]
    public int Id { get; set; } = 1;

    [Column(TypeName = "decimal(10,2)")]
    public decimal MonthlyPrice { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal YearlyPrice { get; set; }

    [MaxLength(5)]
    public string Currency { get; set; } = "EUR";
}
