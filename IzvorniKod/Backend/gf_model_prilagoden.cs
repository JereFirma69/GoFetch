using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GoFetch.Model
{
    public class Korisnik
    {
        [Key]
        public int IdKorisnik { get; set; }

        [Required, MaxLength(100)]
        public string EmailKorisnik { get; set; }

        [Required, MaxLength(20)]
        public string LozinkaKorisnik { get; set; }

        // Navigacijske veze
        public Vlasnik Vlasnik { get; set; }
        public Setac Setac { get; set; }
        public Administrator Administrator { get; set; }
        public List<Poruka> Poruke { get; set; } = new();
    }

    public class Vlasnik
    {
        [Key]
        public int IdKorisnik { get; set; }
        public Korisnik Korisnik { get; set; }

        public PretplataVlasnikSetacNovosti Pretplata { get; set; }
        public List<Pas> Psi { get; set; } = new();
    }

    public class PretplataVlasnikSetacNovosti
    {
        [Key]
        public int IdKorisnik { get; set; }
        public Vlasnik Vlasnik { get; set; }
    }

    public class Setac
    {
        [Key]
        public int IdKorisnik { get; set; }
        public Korisnik Korisnik { get; set; }

        [Required, MaxLength(50)]
        public string ImeSetac { get; set; }

        [Required, MaxLength(50)]
        public string PrezimeSetac { get; set; }

        [Required, MaxLength(100)]
        public string ProfilnaSetac { get; set; }

        [Required, MaxLength(100)]
        public string LokacijaSetac { get; set; }

        [Required, MaxLength(20)]
        public string TelefonSetac { get; set; }

        public List<Clanarina> Clanarine { get; set; } = new();
        public List<Termin> Termini { get; set; } = new();
    }

    public class Administrator
    {
        [Key]
        public int IdKorisnik { get; set; }
        public Korisnik Korisnik { get; set; }
    }

    public class Pas
    {
        [Key]
        public int IdPas { get; set; }

        [Required, MaxLength(20)]
        public string ImePas { get; set; }

        [Required, MaxLength(200)]
        public string Poslastice { get; set; }

        [Required, MaxLength(50)]
        public string Socijalizacija { get; set; }

        [Range(1, 5)]
        public int RazinaEnergije { get; set; }

        public string ZdravstveneNapomene { get; set; }

        [Range(0, int.MaxValue)]
        public int Starost { get; set; }

        [Required, MaxLength(50)]
        public string Pasmina { get; set; }

        [Required, MaxLength(100)]
        public string ProfilnaPas { get; set; }

        public int IdKorisnik { get; set; }
        public Vlasnik Vlasnik { get; set; }

        public List<RezervacijaPas> RezervacijePsa { get; set; } = new();
    }

    public class Clanarina
    {
        [Key]
        public int IdClanarina { get; set; }

        [Required]
        public string VrstaClanarina { get; set; } // mjesecna/godisnja

        public DateTime DatumPocetkaClanarina { get; set; }
        public DateTime DatumIstekaClanarina { get; set; }

        [Required]
        public string StatusClanarina { get; set; } // aktivna/istekla/zamrznuta

        public int IdKorisnik { get; set; }
        public Setac Setac { get; set; }
    }

    public class Termin
    {
        [Key]
        public int IdTermin { get; set; }

        [Required]
        public string VrstaSetnjaTermin { get; set; } // grupna/individualna

        public decimal Cijena { get; set; }
        public TimeSpan Trajanje { get; set; }
        public DateTime DatumVrijemePocetka { get; set; }

        [Required, MaxLength(100)]
        public string LokacijaTermin { get; set; }

        public int IdKorisnik { get; set; }
        public Setac Setac { get; set; }

        public List<Rezervacija> Rezervacije { get; set; } = new();
    }

    public class Rezervacija
    {
        [Key]
        public int IdRezervacija { get; set; }

        public DateTime DatumRezervacija { get; set; }

        [Required]
        public string StatusRezervacija { get; set; } // prihvacena/na cekanju/otkazana

        public string NapomenaRezervacija { get; set; }

        [Required, MaxLength(100)]
        public string AdresaPolaska { get; set; }

        [Required]
        public string VrstaSetnjaRezervacija { get; set; }

        public DateTime DatumVrijemePolaska { get; set; }

        public int IdTermin { get; set; }
        public Termin Termin { get; set; }

        public List<Placanje> Placanja { get; set; } = new();
        public List<Recenzija> Recenzije { get; set; } = new();
        public List<Poruka> Poruke { get; set; } = new();
        public List<RezervacijaPas> PsiRezervacije { get; set; } = new();
    }

    public class Placanje
    {
        [Key]
        public int IdPlacanje { get; set; }

        [Required]
        public string StatusPlacanje { get; set; } // prihvaceno/odbijeno

        public DateTime DatumPlacanje { get; set; }
        public decimal IznosPlacanje { get; set; }

        [Required]
        public string NacinPlacanje { get; set; } // gotovina/paypal/kartica

        public int IdRezervacija { get; set; }
        public Rezervacija Rezervacija { get; set; }
    }

    public class Recenzija
    {
        [Key]
        public int IdRecenzija { get; set; }

        public DateTime DatumRecenzija { get; set; }

        [Range(1, 5)]
        public int Ocjena { get; set; }

        public string Komentar { get; set; }
        public string FotografijaRecenzija { get; set; }

        public int IdRezervacija { get; set; }
        public Rezervacija Rezervacija { get; set; }
    }

    public class Poruka
    {
        [Key]
        public int IdPoruka { get; set; }

        public string TekstPoruka { get; set; }
        public DateTime DatumVrijemePoruka { get; set; }
        public string FotografijaPoruka { get; set; }

        public int IdKorisnik { get; set; }
        public Korisnik Korisnik { get; set; }

        public int IdRezervacija { get; set; }
        public Rezervacija Rezervacija { get; set; }
    }

    public class RezervacijaPas
    {
        public int IdRezervacija { get; set; }
        public Rezervacija Rezervacija { get; set; }

        public int IdPas { get; set; }
        public int IdKorisnik { get; set; }
        public Pas Pas { get; set; }
    }
}
